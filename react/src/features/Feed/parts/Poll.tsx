import { Fragment, useState } from "react";

import clsx from "clsx/lite";
import { produce } from "immer";
import { Link } from "react-router-dom";

import { useAuth } from "@/features/auth/slice";
import { useFetchUser } from "@/features/user/services";
import { formatDate, fullNameLong, userPhotoPath } from "@/shared/utils";

import * as types from "../types";

import { Icon } from "@/shared/comps/Icon";
import { Picture } from "@/shared/comps/Picture";

import checkIcon from "@/assets/check.svg";
import tickIcon from "@/assets/tick.svg";

const calcChoicePct = (poll: types.Poll, choice: types.Choice) => {
  const pct = poll.votes > 0 ? (100 * choice.votes) / poll.votes || 0 : 0;
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
  const { userId, orgId } = useAuth();

  if (userId === undefined) {
    return;
  }

  const chosen = poll.myChoices.has(choice.id);
  const canVote = orgId !== null && poll.orgs.has(orgId);

  const toggleChosen = () =>
    setPoll(
      produce(poll, (poll) => {
        if (!poll.isMultipleChoice) {
          poll.myChoices.clear();
        }
        if (!chosen && canVote) {
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
        background: poll.voted || !canVote ? bg : undefined,
      }}
      className={clsx(
        "select-none bg-choice border border-choice-border rounded-choice",
        "hover:bg-choice-selected",
        "flex items-center",
        "pl-[30px] py-[20px]",
        canVote && poll.voted && !poll.isAnonymous && "cursor-pointer",
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
      {(poll.voted || !canVote) && (
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
  const { orgId } = useAuth();

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

  const canVote = orgId !== null && poll.orgs.has(orgId);

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
        disabled={poll.isAnonymous || (!poll.voted && canVote)}
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
        {canVote && !poll.voted && (
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
          disabled={poll.isAnonymous || (!poll.voted && canVote)}
          className={clsx(
            "w-full mb-[72px] mt-[40px]",
            "font-extralight text-dark-gray",
            full && "hover:underline",
          )}
          onClick={(event) => {
            event.stopPropagation();
            showResults();
          }}
        >
          {votedText}
        </button>
      </div>
    </div>
  );
};

const PollChoiceResultsUserCard = ({ userId }: { userId: string }) => {
  const { user } = useFetchUser(userId);

  if (!user) return;

  const profileLink = `/profile/${user.id}`;
  const photoURL = userPhotoPath(user);

  return (
    <div className="flex items-center gap-[56px]">
      <Link target="_blank" to={profileLink}>
        <Picture width="120px" height="120px" url={photoURL} />
      </Link>
      <Link target="_blank" to={profileLink} className="hover:underline">
        {fullNameLong(user)}
      </Link>
    </div>
  );
};

const PollChoiceResultsVoters = ({ voters }: { voters: string[] }) => {
  const [collapsed, setCollapsed] = useState(true);

  const numCollapsedVoters = 3;

  const Sep = () => <hr className="mt-[42px] mb-[32px] border-medium-gray" />;

  return (
    <div className="rounded border border-medium-gray px-[48px] py-[40px]">
      {voters
        .slice(0, collapsed ? numCollapsedVoters : undefined)
        .map((userId, i) => (
          <Fragment key={userId}>
            {i > 0 && <Sep />}
            <PollChoiceResultsUserCard userId={userId} />
          </Fragment>
        ))}
      {voters.length > numCollapsedVoters + 1 && (
        <>
          <Sep />
          <button
            type="button"
            className="w-full hover:underline"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "Показать всех" : "Скрыть"}
          </button>
        </>
      )}
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
  const { userId } = useAuth();

  const pct = calcChoicePct(poll, choice);
  const pctPretty = pct.toString().replace(".", ",") + "%";

  const votes = choice.votes;
  const voteSuffix =
    votes % 10 === 1 && votes !== 11
      ? ""
      : [2, 3, 4].includes(votes % 10) && ![12, 13, 14].includes(votes)
        ? "а"
        : "ов";

  const votedText = `${votes} голос${voteSuffix}`;

  const voters = [...choice.voters];
  if (poll.myChoices.has(choice.id)) {
    voters.unshift(userId);
  }

  return (
    <div>
      <div className="flex text-[32px] mb-[36px] px-1">
        <h3
          className={clsx(
            "text-nowrap overflow-x-hidden text-ellipsis",
            poll.myChoices.has(choice.id) && "underline",
          )}
        >
          {choice.text}
        </h3>
        <div className="text-nowrap ml-2"> — {pctPretty}</div>
        <div className="grow"></div>
        <div className="text-nowrap ml-8">{votedText}</div>
      </div>
      {choice.votes > 0 && <PollChoiceResultsVoters voters={voters} />}
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
    <article className="pt-[60px] px-[65px] pb-[50px] text-[32px] h-full flex flex-col max-w-[1403px]">
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
