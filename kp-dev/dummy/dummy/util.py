import json
from datetime import date, timedelta
from functools import reduce
from operator import iconcat
from os.path import dirname, join
from random import randint


def random_date_between(d1: date, d2: date) -> date:
    diff = (d2 - d1).days
    delta = timedelta(days=randint(0, diff))
    return d1 + delta


def load_json(path: str):
    with open(join(dirname(__file__), path)) as f:
        return json.load(f)


def flatten(xs):
    return reduce(iconcat, xs, [])


RU_TO_LATIN = load_json("data/ru_to_latin.json")


def ru_to_latin(s: str) -> str:
    return "".join(RU_TO_LATIN.get(c, c) for c in s)
