import json
import logging
import sys

from employees.models import Employee, Organization, StructuralSubdivision

logger = logging.getLogger(__name__)

# Input data rules:
# - every user has a unit
# - every unit mentioned by users is listed at "units"
#
# - user order is significant, unit order isn't
# - parent units are mentioned before child units
# - the first employees mentioning a unit is its boss
# - other members of the unit are subordinates
# - boss's boss is its parent unit's boss (if there's a parent unit)
#
# Sample input data:
"""
{
  "org": {
    "name": "Название",
    "address": "Адрес"
  },
  "users": [
    {
      "unit": "Руководство",
      "name": "ФИО 1",
      "position": "Руководитель",
      "phone": "88005553555",
      "inner_phone": "12-34",
      "office": "123"
    },
    {
      "unit": "Управление",
      "name": "ФИО 2",
      "position": "Начальник управления",
      "phone": null,
      "inner_phone": null,
      "office": null
    }
  ],
  "units": [
    {
      "parent": null,
      "name": "Руководство"
    },
    {
      "parent": "Руководство",
      "name": "Управление"
    }
  ]
}
"""


def run():
    data = json.load(sys.stdin)

    org, created = Organization.objects.update_or_create(
        name=data["org"]["name"], address=data["org"]["address"]
    )
    print("{} org: {}".format("Created" if created else "Updated", org.name))

    unit2ss = {}
    for unit in data["units"]:
        name = unit["name"]
        parent = unit2ss.get(unit["parent"])
        ss, _ = StructuralSubdivision.objects.update_or_create(
            name=name,
            organization=org,
            parent_structural_subdivision=parent,
        )
        unit2ss[name] = ss
        print(
            "{} unit '{}', parent '{}'".format(
                "Created" if created else "Updated", unit["name"], unit["parent"]
            )
        )

    unit2boss = {}
    for user in data["users"]:
        unit = user["unit"]
        surname, name, *rest = user["name"].split()
        if len(rest) > 1:
            raise ValueError("Bad full name for:", user)
        patronym = rest[0] if len(rest) > 0 else None

        matches = Employee.objects.filter(surname=surname, name=name, patronym=patronym)
        if matches.count() == 0:
            logger.warning("No match found for: %s", user["name"])
            continue
        elif matches.count() > 1:
            logger.warning(
                "Too many (%d) matches found for: %s", matches.count(), user["name"]
            )
            continue

        if unit not in unit2ss:
            logger.warning("Unknown unit '%s' for: %s", unit, user["name"])
            continue

        boss = None
        if unit not in unit2boss:
            unit2boss[unit] = matches[0]
            parent_unit = unit2ss[unit].parent_structural_subdivision
            if parent_unit is not None:
                boss = unit2boss[parent_unit.name]
        else:
            boss = unit2boss[unit]

        matches.update(
            structural_division=unit2ss[unit],
            telephone_number=user["phone"],
            inner_telephone_number=user["inner_phone"],
            office=user["office"],
            job_title=user["position"],
            chief_id=None if boss is None else boss.id,
        )

        print(
            "Updated user {}, unit {}, boss {}".format(
                user["name"],
                user["unit"],
                None if boss is None else f"{boss.surname} {boss.name}",
            )
        )
