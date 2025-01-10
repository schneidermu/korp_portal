import { useEffect, useState } from "react";

import clsx from "clsx/lite";
import { produce } from "immer";

import { useAuth } from "@/auth/slice";
import { formatDate } from "@/common/util";
import * as types from "./types";

import checkIcon from "/check.svg";
import tickIcon from "/tick.svg";

const Choice = ({
  poll,
  choice,
  voted,
  isSelected,
  setIsSelected,
}: {
  poll: types.Poll;
  choice: types.Choice;
  voted: boolean;
  isSelected: boolean;
  setIsSelected: (isSelected: boolean) => void;
}) => {
  const { userId } = useAuth();

  if (userId === undefined) {
    return;
  }

  let pollVotes = poll.votes;
  let votes = choice.votes;
  if (isSelected && !choice.voters.has(userId)) {
    votes += 1;
    pollVotes += 1;
  }
  const pct =
    Math.round(10 * (voted ? (100 * votes) / pollVotes || 0 : 0)) / 10;
  const bg = `linear-gradient(to right, #CBE1FF 0%, #CBE1FF ${pct}%, #E7F1FF ${pct}%, #E7F1FF 100%)`;
  return (
    <label
      style={{
        background: voted ? bg : undefined,
      }}
      className={clsx(
        "select-none bg-choice border border-choice-border rounded-choice",
        "hover:bg-choice-selected",
        "flex items-center",
        "pl-[30px] py-[20px]",
      )}
    >
      <input
        disabled={voted}
        style={{
          backgroundImage:
            isSelected && poll.isMultipleChoice
              ? `url(${checkIcon})`
              : undefined,
        }}
        className={clsx(
          "w-[25px] h-[25px] appearance-none",
          "mr-[34px]",
          "border-dark-gray rounded-[2px]",
          !isSelected && "border",
          !poll.isMultipleChoice && "hidden",
        )}
        name={poll.isMultipleChoice ? `choice-${choice.id}` : "choice"}
        type={poll.isMultipleChoice ? "checkbox" : "radio"}
        key={choice.id}
        checked={isSelected}
        onChange={(event) => setIsSelected(event.target.checked)}
      />
      <div className="grow">{choice.text}</div>
      {isSelected && !poll.isMultipleChoice && (
        <img className="mx-[18px]" src={tickIcon} />
      )}
      {voted && (
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
}: {
  poll: types.Poll;
  full?: boolean;
  vote: (poll: types.Poll, choiceIds: Set<number>) => void;
  handleOpen?: () => void;
}) => {
  const { userId } = useAuth();
  const [choiceIds, setChoiceIds] = useState<Set<number> | undefined>();
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    const ids = new Set(
      poll.choices
        .filter(({ voters }) => voters.has(userId))
        .map(({ id }) => id),
    );
    setChoiceIds(ids);
    setVoted(ids.size > 0);
  }, [userId, poll.choices, poll.votes]);

  if (choiceIds === undefined || vote === undefined) {
    return;
  }

  const voteIsSaved = poll.choices.some(({ voters }) => voters.has(userId));

  const choices = poll.choices.map((choice) => (
    <Choice
      key={choice.id}
      poll={poll}
      choice={choice}
      voted={voted}
      isSelected={choiceIds.has(choice.id)}
      setIsSelected={(isSelected) => {
        setChoiceIds(
          produce((choices) => {
            if (choices === undefined || !poll.isMultipleChoice) {
              return new Set(isSelected ? [choice.id] : []);
            }
            if (isSelected) {
              choices.add(choice.id);
            } else {
              choices?.delete(choice.id);
            }
          }),
        );
      }}
    />
  ));

  const votes = poll.votes + Number(voted && !voteIsSaved);
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
          {!voted && (
            <button
              className={clsx(
                "mt-[54px] px-[30px] py-[6px] w-fit",
                "rounded bg-light-blue text-white",
                "text-[36px]",
              )}
              onClick={() => {
                if (choiceIds.size === 0) {
                  return;
                }
                vote(poll, choiceIds);
                setVoted(true);
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
