import argparse
import logging
import re
import shlex
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from django.conf import settings
from django.db import transaction
from openpyxl import load_workbook

from employees.models import Employee, Organization, StructuralSubdivision

logger = logging.getLogger(__name__)


DEFAULT_FILES = (
    "Центральный аппарат Центррегионводхоз.xlsx",
    "Штатная расстановка АКВА на 01.04.26.xlsx",
)

ORG_BY_FILE = {
    "Центральный аппарат Центррегионводхоз.xlsx": "Центррегионводхоз",
    "Штатная расстановка АКВА на 01.04.26.xlsx": "Акваинфотека",
    "Штатная расстановка РОСНИИВХ на 01.02.2026 без ЗП.xlsx": "РосНИИВХ",
}

VACANCY_RE = re.compile(r"\bваканси[яи]\b", re.IGNORECASE)
FULL_FIO_RE = re.compile(
    r"\b([А-ЯЁ][а-яё-]+)\s+([А-ЯЁ][а-яё-]+)\s+([А-ЯЁ][а-яё-]+)\b",
)
INITIALS_RE = re.compile(r"\b([А-ЯЁ][а-яё-]+)\s+([А-ЯЁ])\.?\s*([А-ЯЁ])\.?\b")
STAKE_RE = re.compile(r"\(?\b0[,.]5\b\)?")


@dataclass(frozen=True)
class StaffRow:
    source: str
    sheet: str
    row_number: int
    organization: str
    subdivision: str
    position: str
    surname: str
    name: Optional[str]
    patronym: Optional[str]
    raw_name: str

    @property
    def display_name(self):
        parts = [self.surname, self.name, self.patronym]
        return " ".join(part for part in parts if part)


class ImportStats:
    def __init__(self):
        self.rows = 0
        self.updated = 0
        self.missing = 0
        self.ambiguous = 0
        self.skipped = 0
        self.created_orgs = 0
        self.created_subdivisions = 0


def run(*script_args):
    script_args = normalize_script_args(script_args)
    parser = argparse.ArgumentParser(
        description="Import staffing organizations and structural subdivisions.",
    )
    parser.add_argument(
        "--base-dir",
        default=str(settings.BASE_DIR.parent / "import"),
        help="Directory with staffing xlsx files.",
    )
    parser.add_argument(
        "--file",
        dest="files",
        action="append",
        help="Specific xlsx file path or file name. Can be passed multiple times.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and match rows without writing to the database.",
    )
    parser.add_argument(
        "--allow-ambiguous-first",
        action="store_true",
        help="Update the first employee when several employees match the same FIO.",
    )
    args = parser.parse_args(script_args)

    base_dir = Path(args.base_dir)
    files = [Path(path) for path in args.files] if args.files else [Path(f) for f in DEFAULT_FILES]
    paths = [path if path.is_absolute() else base_dir / path for path in files]

    stats = ImportStats()
    with transaction.atomic():
        for path in paths:
            import_file(path, args, stats)

        if args.dry_run:
            transaction.set_rollback(True)

    logger.info(
        "Staffing import completed: rows=%s updated=%s missing=%s ambiguous=%s "
        "skipped=%s orgs_created=%s subdivisions_created=%s dry_run=%s",
        stats.rows,
        stats.updated,
        stats.missing,
        stats.ambiguous,
        stats.skipped,
        stats.created_orgs,
        stats.created_subdivisions,
        args.dry_run,
    )
    print(
        "Staffing import completed: "
        f"rows={stats.rows} updated={stats.updated} missing={stats.missing} "
        f"ambiguous={stats.ambiguous} skipped={stats.skipped} "
        f"orgs_created={stats.created_orgs} "
        f"subdivisions_created={stats.created_subdivisions} dry_run={args.dry_run}",
    )


def import_file(path, args, stats):
    if not path.exists():
        raise FileNotFoundError(f"Staffing file not found: {path}")

    organization_name = ORG_BY_FILE.get(path.name, path.stem)
    logger.info("Importing staffing file: %s as organization '%s'", path, organization_name)

    rows = list(parse_workbook(path, organization_name))
    stats.rows += len(rows)
    organization = get_or_create_organization(organization_name, args.dry_run, stats)

    subdivision_cache = {}
    for row in rows:
        subdivision = None
        if should_import_subdivision(row):
            subdivision = get_or_create_subdivision(
                organization,
                row.organization,
                row.subdivision,
                args.dry_run,
                stats,
                subdivision_cache,
            )
        update_employee(row, subdivision, args, stats)


def parse_workbook(path, organization_name):
    workbook = load_workbook(path, data_only=True)
    if path.name.startswith("Центральный аппарат"):
        yield from parse_centerregionvodhoz(workbook.active, path.name, organization_name)
    elif "АКВА" in path.name:
        yield from parse_akva(workbook["Лист1"], path.name, organization_name)
    elif "РОСНИИВХ" in path.name:
        yield from parse_rosniivh(workbook.active, path.name, organization_name)
    else:
        raise ValueError(f"Unknown staffing file format: {path}")


def parse_centerregionvodhoz(sheet, source, organization):
    current_subdivision = None
    for row_number in range(9, sheet.max_row + 1):
        unit = clean_text(sheet.cell(row_number, 2).value)
        position = clean_text(sheet.cell(row_number, 5).value)
        raw_name = clean_text(sheet.cell(row_number, 6).value)

        if unit and not is_total(unit):
            current_subdivision = unit

        if not position or not raw_name or is_vacancy(raw_name) or not current_subdivision:
            continue

        for person in extract_full_names(raw_name):
            yield StaffRow(source, sheet.title, row_number, organization, current_subdivision, position, *person, raw_name)


def parse_akva(sheet, source, organization):
    current_subdivision = None
    for row_number in range(4, sheet.max_row + 1):
        first = clean_text(sheet.cell(row_number, 1).value)
        position = clean_text(sheet.cell(row_number, 2).value)
        raw_name = clean_text(sheet.cell(row_number, 6).value)

        if first and not position and not raw_name and not is_total(first):
            current_subdivision = first
            continue

        if not position or is_total(position) or not raw_name or is_vacancy(raw_name):
            continue

        subdivision = current_subdivision or "Аппарат управления"
        for person in extract_full_names(raw_name):
            yield StaffRow(source, sheet.title, row_number, organization, subdivision, position, *person, raw_name)


def parse_rosniivh(sheet, source, organization):
    current_subdivision = "Аппарат управления"
    section_number = 1
    current_position = ""
    for row_number in range(12, sheet.max_row + 1):
        position = clean_text(sheet.cell(row_number, 1).value)
        raw_name = clean_text(sheet.cell(row_number, 3).value)

        if position and is_total(position):
            continue

        if not position and not raw_name:
            next_position = clean_text(sheet.cell(row_number + 1, 1).value)
            if next_position:
                section_number += 1
                current_subdivision = f"Подразделение {section_number}"
            continue

        if not raw_name or is_vacancy(raw_name):
            continue

        if position:
            current_position = position

        for person in extract_initial_names(raw_name):
            yield StaffRow(
                source,
                sheet.title,
                row_number,
                organization,
                current_subdivision,
                current_position,
                *person,
                raw_name,
            )


def get_or_create_organization(name, dry_run, stats):
    if dry_run:
        organization = Organization.objects.filter(name=name).first()
        if organization is None:
            logger.info("DRY-RUN would create organization: %s", name)
            stats.created_orgs += 1
        return organization

    organization, created = Organization.objects.get_or_create(
        name=name,
        defaults={"address": ""},
    )
    if created:
        stats.created_orgs += 1
        logger.info("Created organization: %s", name)
    return organization


def get_or_create_subdivision(
    organization,
    organization_name,
    subdivision_name,
    dry_run,
    stats,
    cache,
):
    key = (organization_name, subdivision_name)
    if key in cache:
        return cache[key]

    if dry_run:
        subdivision = None
        if organization is not None:
            subdivision = StructuralSubdivision.objects.filter(
                organization=organization,
                name=subdivision_name,
            ).first()
        if subdivision is None:
            logger.info(
                "DRY-RUN would create subdivision: %s / %s",
                organization_name,
                subdivision_name,
            )
            stats.created_subdivisions += 1
        cache[key] = subdivision
        return subdivision

    subdivision, created = StructuralSubdivision.objects.get_or_create(
        organization=organization,
        name=subdivision_name,
    )
    if created:
        stats.created_subdivisions += 1
        logger.info("Created subdivision: %s / %s", organization_name, subdivision_name)

    cache[key] = subdivision
    return subdivision


def update_employee(row, subdivision, args, stats):
    matches = find_employee(row)
    if not matches:
        stats.missing += 1
        logger.warning(
            "missing: %s | %s | %s | row=%s | raw=%s",
            row.display_name,
            row.organization,
            row.subdivision,
            row.row_number,
            row.raw_name,
        )
        return

    if len(matches) > 1 and not args.allow_ambiguous_first:
        stats.ambiguous += 1
        logger.warning(
            "ambiguous: %s | matches=%s | %s | %s | row=%s",
            row.display_name,
            len(matches),
            row.organization,
            row.subdivision,
            row.row_number,
        )
        return

    employee = matches[0]
    if subdivision is None and not employee_has_target_organization(employee, row.organization):
        stats.missing += 1
        logger.warning(
            "missing subdivision source: %s | %s | row=%s | current_unit=%s",
            row.display_name,
            row.organization,
            row.row_number,
            employee.structural_division,
        )
        return

    if args.dry_run:
        stats.updated += 1
        logger.info(
            "DRY-RUN would update: %s -> %s / %s, position=%s",
            employee,
            row.organization,
            subdivision or employee.structural_division,
            row.position,
        )
        return

    if subdivision is not None:
        employee.structural_division = subdivision
    employee.job_title = row.position
    update_fields = ["job_title"]
    if subdivision is not None:
        update_fields.append("structural_division")
    employee.save(update_fields=update_fields)
    stats.updated += 1
    logger.info(
        "Updated: %s -> %s / %s",
        employee,
        row.organization,
        subdivision or employee.structural_division,
    )


def should_import_subdivision(row):
    if row.organization == "РосНИИВХ" and row.subdivision.startswith("Подразделение "):
        return False
    return True


def employee_has_target_organization(employee, organization_name):
    structural_division = employee.structural_division
    if structural_division is None:
        return False
    return structural_division.organization.name == organization_name


def find_employee(row):
    if row.name and row.patronym:
        return list(
            Employee.objects.filter(
                surname__iexact=row.surname,
                name__iexact=row.name,
                patronym__iexact=row.patronym,
            ).order_by("id"),
        )

    return [
        employee
        for employee in Employee.objects.filter(surname__iexact=row.surname).order_by("id")
        if initials_match(employee, row.name, row.patronym)
    ]


def initials_match(employee, name_initial, patronym_initial):
    employee_name = employee.name or ""
    employee_patronym = employee.patronym or ""
    return (
        employee_name[:1].upper() == (name_initial or "").upper()
        and employee_patronym[:1].upper() == (patronym_initial or "").upper()
    )


def extract_full_names(value):
    value = strip_notes(value)
    for match in FULL_FIO_RE.finditer(value):
        yield match.group(1), match.group(2), match.group(3)


def extract_initial_names(value):
    value = strip_notes(value)
    value = STAKE_RE.sub(" ", value)
    for match in INITIALS_RE.finditer(value):
        yield match.group(1), match.group(2), match.group(3)


def strip_notes(value):
    return re.sub(r"\([^)]*\)", " ", value)


def clean_text(value):
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def is_total(value):
    return clean_text(value).lower().startswith(("итого", "всего"))


def is_vacancy(value):
    return bool(VACANCY_RE.search(clean_text(value)))


def normalize_script_args(script_args):
    if len(script_args) == 1 and isinstance(script_args[0], str):
        return shlex.split(script_args[0])
    return list(script_args)
