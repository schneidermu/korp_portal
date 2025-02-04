from .table import Value, gen_table
from .util import load_json


def gen():
    questions = load_json("data/polls.json")

    homepage_poll: list[dict[str, Value]] = []
    homepage_choice: list[dict[str, Value]] = []

    for poll_id, (question, is_multiple_choice, choices) in enumerate(
        questions, start=1
    ):
        date = f"2024-05-{6 + 2 * poll_id:02d}"
        homepage_poll.append(
            {
                "id": poll_id,
                "is_published": True,
                "is_anonymous": True,
                "is_multiple_choice": is_multiple_choice,
                "created_at": f"{date} 10:00:00+0300",
                "pub_date": f"{date} 11:00:00+0300",
                "question_text": question,
            }
        )
        for choice in choices:
            homepage_choice.append(
                {
                    "id": len(homepage_choice) + 1,
                    "poll_id": poll_id,
                    "choice_text": choice,
                }
            )

    print(gen_table("homepage_poll", homepage_poll))
    print(gen_table("homepage_choice", homepage_choice))
