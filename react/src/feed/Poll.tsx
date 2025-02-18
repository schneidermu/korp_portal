import { useState } from "react";

import clsx from "clsx/lite";
import { produce } from "immer";

import { useAuth } from "@/auth/slice";
import { formatDate } from "@/common/util";
import * as types from "./types";

import { Icon } from "@/common/Icon";
import { UserAvatarLink } from "@/user/UserAvatarLink";

import checkIcon from "@/assets/check.svg";
import tickIcon from "@/assets/tick.svg";
import { useFetchUser } from "@/user/api";

const calcChoicePct = (poll: types.Poll, choice: types.Choice) => {
  const pct = poll.voted ? (100 * choice.votes) / poll.votes || 0 : 0;
  return Math.round(10 * pct) / 10;
};

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
        if (!poll.isMultipleChoice) {
          poll.myChoices.clear();
        }
        if (!chosen) {
          poll.myChoices.add(choice.id);
        } else {
          poll.myChoices.delete(choice.id);
        }
      }),
    );

  const pct = calcChoicePct(poll, choice);
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

export const PollContent = ({
  poll,
  full,
  vote,
  handleOpen,
  setPoll,
  showResults,
}: {
  poll: types.Poll;
  full: boolean;
  vote: (poll: types.Poll) => void;
  handleOpen?: () => void;
  setPoll: (poll: types.Poll) => void;
  showResults: () => void;
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
    <div>
      <a
        className={clsx(
          "block cursor-pointer",
          full ? "mt-[72px]" : "mt-[18px]",
        )}
        onClick={(event) => {
          event.stopPropagation();
          if (handleOpen) handleOpen();
        }}
      >
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
        <button
          disabled={!full}
          className={clsx(
            "w-full mb-[72px] mt-[40px]",
            "font-extralight text-dark-gray",
            full && "hover:underline",
          )}
          onClick={showResults}
        >
          {votedText}
        </button>
      </div>
    </div>
  );
};

export const Avatar = ({ userId }: { userId: string }) => {
  const { user } = useFetchUser(userId);

  if (!user) return;

  return (
    <UserAvatarLink user={user} width="150px" height="150px" fontSize="20px" />
  );
};

export const PollResults = ({
  poll,
  handleOpen,
}: {
  poll: types.Poll;
  handleOpen?: () => void;
}) => {
  const [viewedChoice, setViewedChoice] = useState(
    [...poll.choices.values()][0],
  );

  const pct = calcChoicePct(poll, viewedChoice);
  const pctPretty = pct.toString().replace(".", ",") + "%";

  const votes = viewedChoice.votes;
  const voteSuffix =
    votes % 10 === 1 ? "" : [2, 3, 4].includes(votes % 10) ? "а" : "ов";

  const votedText = `${votes} голос${voteSuffix}`;

  return (
    <div>
      <a
        className="block mt-[44px] cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          if (handleOpen) handleOpen();
        }}
      >
        <h2 className={clsx("text-[32px]")}>{poll.question}</h2>
      </a>

      <div
        className={clsx(
          "flex gap-[10px] overflow-x-scroll px-[40px] py-[30px]",
          "mt-[30px] mb-[60px]",
          "bg-[#DDEAFC66]",
        )}
      >
        {[...poll.choices.values()].map((choice) => (
          <button
            key={choice.id}
            type="submit"
            className={clsx(
              "px-[20px] py-[10px] rounded-[8px]",
              "shrink-0",
              viewedChoice.id !== choice.id && "text-[#1956A8] hover:underline",
              viewedChoice.id === choice.id && "bg-[#2164BE] text-white",
            )}
            onClick={() => setViewedChoice(choice)}
          >
            {choice.text}
          </button>
        ))}
      </div>

      <div className="ml-[60px] mr-[50px]">
        <div className="flex">
          <div>{viewedChoice.text}</div>
          <div className="grow"></div>
          <Icon src={tickIcon} width={40} height={40} />
          <div className="ml-[16px]">{pctPretty}</div>
        </div>
        <div className="mt-[20px] mb-[36px] h-[12px] bg-[#D9D9D9] rounded-full">
          <div
            style={{ width: pct + "%" }}
            className="h-full bg-[#2164BE] rounded-full"
          ></div>
        </div>
        <div className="text-[#8C8C8C] text-[30px]">{votedText}</div>

        <div className="grid grid-cols-5 mt-[75px] mb-[135px] h-[310px]">
          {poll.myChoices.has(viewedChoice.id) && <Avatar userId="me" />}
          {[...viewedChoice.voters].map((userId) => (
            <Avatar key={userId} userId={userId} />
          ))}
        </div>
      </div>
    </div>
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
  const [showResults, setShowResults] = useState(false);

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
          full && "mt-[45px] px-[70px] border",
        )}
      >
        {showResults ? (
          <PollResults poll={poll} handleOpen={handleOpen} />
        ) : (
          <PollContent
            poll={poll}
            vote={vote}
            handleOpen={handleOpen}
            full={full}
            showResults={() => setShowResults(true)}
            setPoll={setPoll}
          />
        )}
      </div>
    </article>
  );
};
