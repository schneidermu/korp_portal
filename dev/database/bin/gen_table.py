type Value = str | int | bool | None


def value2str(v: Value):
    if isinstance(v, bool):
        return "t" if v else "f"
    if v is None:
        return r"\N"
    return str(v)


def gen_table(table: str, rows: list[dict[str, Value]], seq_col="id") -> str:
    lines = []
    col_list = ", ".join(rows[0].keys())
    lines.append(f"COPY public.{table} ({col_list}) FROM stdin;")
    for row in rows:
        lines.append("\t".join(map(value2str, row.values())))
    lines.append("\\.\n")
    if seq_col is not None:
        n = len(rows)
        lines.append(
            f"SELECT pg_catalog.setval('public.{table}_{seq_col}_seq', {n}, true);\n"
        )
    return "\n".join(lines)
