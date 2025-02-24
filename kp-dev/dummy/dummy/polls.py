from .table import Value, gen_table
from .util import load_json

QUESTIONS = load_json("data/polls.json")


class PollsGen:
    def __init__(self):
        self.polls: list[dict[str, Value]] = []
        self.choices: list[dict[str, Value]] = []

        for poll_id, (question, is_multiple_choice, choices) in enumerate(
            QUESTIONS, start=1
        ):
            date = f"2024-05-{6 + 2 * poll_id:02d}"
            self.polls.append(
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
                self.choices.append(
                    {
                        "id": len(self.choices) + 1,
                        "poll_id": poll_id,
                        "choice_text": choice,
                    }
                )

    def print(self):
        print(gen_table("homepage_poll", self.polls))
        print(gen_table("homepage_choice", self.choices))
