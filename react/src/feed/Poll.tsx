import clsx from "clsx/lite";
import { produce } from "immer";

import { useAuth } from "@/auth/slice";
import { formatDate } from "@/common/util";
import * as types from "./types";

import { Icon } from "@/common/Icon";

import checkIcon from "/check.svg";
import tickIcon from "/tick.svg";

const Choice = ({
  poll,
  choice,
  setPoll,
}: {
  poll: types.Poll;
  choice: types.Choice;
  setPoll: (poll: types.Poll) => void;
}) => {
  const { userId } = useAuth();

  if (userId === undefined) {
    return;
  }

  const chosen = poll.myChoices.has(choice.id);

  const toggleChosen = () =>
    setPoll(
      produce(poll, (poll) => {
        if (!chosen) {
          poll.myChoices.add(choice.id);
        } else {
          poll.myChoices.delete(choice.id);
        }
      }),
    );

  let pct = poll.voted ? (100 * choice.votes) / poll.votes || 0 : 0;
  pct = Math.round(10 * pct) / 10;
  const bg = `linear-gradient(to right, #CBE1FF 0%, #CBE1FF ${pct}%, #E7F1FF ${pct}%, #E7F1FF 100%)`;

  return (
    <label
      style={{
        background: poll.voted ? bg : undefined,
      }}
      className={clsx(
        "select-none bg-choice border border-choice-border rounded-choice",
        "hover:bg-choice-selected",
        "flex items-center",
        "pl-[30px] py-[20px]",
      )}
    >
      <input
        disabled={poll.voted}
        style={{
          backgroundImage:
            chosen && poll.isMultipleChoice ? `url(${checkIcon})` : undefined,
        }}
        className={clsx(
          "w-[25px] h-[25px] appearance-none",
          "mr-[34px]",
          "border-dark-gray rounded-[2px]",
          !chosen && "border",
          !poll.isMultipleChoice && "hidden",
        )}
        name={poll.isMultipleChoice ? `choice-${choice.id}` : "choice"}
        type={poll.isMultipleChoice ? "checkbox" : "radio"}
        key={choice.id}
        checked={chosen}
        onChange={toggleChosen}
      />
      <div className="grow">{choice.text}</div>
      {chosen && !poll.isMultipleChoice && (
        <Icon src={tickIcon} className="mx-[18px]" />
      )}
      {poll.voted && (
        <div className="ml-[18px] mr-[5px] w-[100px]">
          {pct.toString().replace(".", ",")}%
        </div>
      )}
    </label>
  );
};

export const Poll = ({
  poll,
  full = false,
  vote,
  handleOpen,
  setPoll,
}: {
  poll: types.Poll;
  full?: boolean;
  vote: (poll: types.Poll) => void;
  handleOpen?: () => void;
  setPoll: (poll: types.Poll) => void;
}) => {
  const choices = [...poll.choices]
    .sort(([id1], [id2]) => id1 - id2)
    .map(([id, choice]) => (
      <Choice key={id} poll={poll} choice={choice} setPoll={setPoll} />
    ));

  const votes = poll.votes;
  const voteSuffix = votes % 10 === 1 ? "" : "о";
  const peopleSuffix = [2, 3, 4].includes(votes % 10) ? "а" : "";

  const votedText =
    votes === 0
      ? "Пока никто не проголосовал"
      : `Проголосовал${voteSuffix} ${votes} человек${peopleSuffix}`;

  return (
    <article className="mt-[60px] mx-[65px] mb-[50px] text-[32px]">
      <div className="flex items-center justify-end">
        <time
          className={clsx("text-date shrink-0", full || "text-[24px]")}
          dateTime={poll.publishedAt.toString()}
        >
          {formatDate(poll.publishedAt)}
        </time>
      </div>
      <div
        className={clsx(
          "rounded border-medium-gray",
          full && "mt-[45px] px-[70px] py-[60px] border",
        )}
      >
        <a className="block mt-[22px] cursor-pointer" onClick={handleOpen}>
          <h2 className={clsx("text-[36px] font-medium text-center")}>
            {poll.question}
          </h2>
        </a>
        <div className="mt-[50px] mb-[70px] text-center font-extralight">
          {poll.isAnonymous ? "Анонимный опрос" : "Публичный опрос"}
        </div>
        <div className="ml-[5%] mr-[10%]">
          <div className="flex flex-col gap-[24px]">{choices}</div>
          {!poll.voted && (
            <button
              className={clsx(
                "mt-[54px] px-[30px] py-[6px] w-fit",
                "rounded bg-light-blue text-white",
                "text-[36px]",
              )}
              onClick={() => {
                if (poll.myChoices.size === 0) {
                  return;
                }
                vote(poll);
              }}
            >
              Проголосовать
            </button>
          )}
          <div className="mt-[40px] font-extralight text-dark-gray text-center">
            {votedText}
          </div>
        </div>
      </div>
    </article>
  );
};
