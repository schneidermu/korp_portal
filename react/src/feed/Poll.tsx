import { Fragment } from "react";

import clsx from "clsx/lite";
import { produce } from "immer";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/slice";
import { formatDate, fullNameLong, userPhotoPath } from "@/common/util";
import { useFetchUser } from "@/user/api";
import * as types from "./types";

import { Icon } from "@/common/Icon";
import { Picture } from "@/common/Picture";
import { UserAvatarLink } from "@/user/UserAvatarLink";

import checkIcon from "@/assets/check.svg";
import tickIcon from "@/assets/tick.svg";

const calcChoicePct = (poll: types.Poll, choice: types.Choice) => {
  const pct = poll.voted ? (100 * choice.votes) / poll.votes || 0 : 0;
  return Math.round(10 * pct) / 10;
};

const Choice = ({
  poll,
  choice,
  setPoll,
  showResults,
}: {
  poll: types.Poll;
  choice: types.Choice;
  setPoll: (poll: types.Poll) => void;
  showResults: () => void;
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
        poll.voted && !poll.isAnonymous && "cursor-pointer",
      )}
      onClick={(event) => {
        event.stopPropagation();
        if (poll.voted && !poll.isAnonymous) showResults();
      }}
    >
      <input
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
        onChange={() => poll.voted || toggleChosen()}
      />
      <div className="grow overflow-hidden text-nowrap text-ellipsis">
        {choice.text}
      </div>
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
      <Choice
        key={id}
        poll={poll}
        choice={choice}
        setPoll={setPoll}
        showResults={() => {
          showResults();
          if (handleOpen) handleOpen();
        }}
      />
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
      <button
        disabled={poll.isAnonymous}
        className="mt-[50px] mb-[70px] w-full font-extralight"
        onClick={(event) => {
          event.stopPropagation();
          showResults();
        }}
      >
        {poll.isAnonymous ? "Анонимный опрос" : "Публичный опрос"}
      </button>
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
          className={clsx(
            "w-full mb-[72px] mt-[40px]",
            "font-extralight text-dark-gray",
            full && "hover:underline",
          )}
          onClick={(event) => {
            event.stopPropagation();
            if (poll.voted && !poll.isAnonymous) showResults();
          }}
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

const PollChoiceResultsUserCard = ({ userId }: { userId: string }) => {
  const { user } = useFetchUser(userId);

  if (!user) return;

  const profileLink = `/profile/${user.id}`;
  const photoURL = userPhotoPath(user);

  return (
    <div className="flex items-center gap-[56px]">
      <Link to={profileLink}>
        <Picture width="120px" height="120px" url={photoURL} />
      </Link>
      <Link to={profileLink} className="hover:underline">
        {fullNameLong(user)}
      </Link>
    </div>
  );
};

const PollChoiceResults = ({
  poll,
  choice,
}: {
  poll: types.Poll;
  choice: types.Choice;
}) => {
  const pct = calcChoicePct(poll, choice);
  const pctPretty = pct.toString().replace(".", ",") + "%";

  const votes = choice.votes;
  const voteSuffix =
    votes % 10 === 1 ? "" : [2, 3, 4].includes(votes % 10) ? "а" : "ов";

  const votedText = `${votes} голос${voteSuffix}`;

  return (
    <div>
      <div className="flex justify-between text-[32px] mb-[36px] px-1">
        <h3>
          {choice.text} — {pctPretty}
        </h3>
        <div>{votedText}</div>
      </div>
      {choice.votes > 0 && (
        <div className="rounded border border-medium-gray px-[48px] py-[40px]">
          {[...choice.voters].map((userId, i) => (
            <Fragment key={userId}>
              {i > 0 && (
                <hr className="mt-[42px] mb-[32px] border-medium-gray" />
              )}
              <PollChoiceResultsUserCard userId={userId} />
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export const PollResults = ({ poll }: { poll: types.Poll }) => {
  return (
    <div className="px-[40px] flex flex-col gap-[105px] h-full font-light">
      <h2 className="text-center text-[36px]">{poll.question}</h2>
      <div className="flex flex-col gap-[68px] grow shrink overflow-y-auto px-[80px]">
        {[...poll.choices.values()].map((choice) => (
          <PollChoiceResults key={choice.id} poll={poll} choice={choice} />
        ))}
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
  showResults,
  setShowResults,
}: {
  poll: types.Poll;
  full?: boolean;
  vote: (poll: types.Poll) => void;
  handleOpen?: () => void;
  setPoll: (poll: types.Poll) => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
}) => {
  return (
    <article className="pt-[60px] px-[65px] pb-[50px] text-[32px] h-full flex flex-col">
      <div className="flex items-center justify-end relative">
        {showResults && (
          <div className="absolute text-[36px] right-[50%] translate-x-[50%] font-light">
            Результаты
          </div>
        )}
        <time
          className={clsx("text-date shrink-0", full || "text-[24px]")}
          dateTime={poll.publishedAt.toString()}
        >
          {formatDate(poll.publishedAt)}
        </time>
      </div>
      <div
        className={clsx(
          "rounded border-medium-gray flex-grow min-h-0 shrink",
          full && !showResults && "mt-[45px] px-[70px] border",
          full && showResults && "mt-[94px]",
        )}
      >
        {full && showResults ? (
          <PollResults poll={poll} />
        ) : (
          <PollContent
            poll={poll}
            vote={vote}
            handleOpen={handleOpen}
            full={full}
            showResults={() => {
              setShowResults(true);
              if (handleOpen) handleOpen();
            }}
            setPoll={setPoll}
          />
        )}
      </div>
    </article>
  );
};
