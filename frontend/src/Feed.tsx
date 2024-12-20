import clsx from "clsx";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Gallery from "./Gallery";
import { useFeed, useSendVote } from "./feed/api";
import * as types from "./feed/types";
import { formatDate } from "./util";
import pollCoverImg from "/poll-cover.png";
import { useAuth } from "./auth/slice";
import { AnimatePage, PageSkel } from "./Page";

const useReachBottom = (handleBottom: () => boolean) => {
  useEffect(() => {
    function handleScroll() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      if (windowHeight + scrollTop >= documentHeight - 200) {
        if (handleBottom()) {
          window.removeEventListener("scroll", handleScroll);
        }
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleBottom]);
};

const NewsContent = ({
  news,
  full = false,
}: {
  news: types.News;
  full?: boolean;
}) => {
  const images = full ? news.images : news.images.slice(0, 2);

  const [overlayImg, setOverlayImg] = useState<number | null>(null);

  return (
    <div className="mt-[36px]">
      {full && (
        <div className="text-[32px] mt-[56px] mb-[90px]">{news.text}</div>
      )}
      <div className="grid grid-cols-2 gap-[20px]">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            className="w-full h-[400px] object-cover"
            onClick={() => setOverlayImg(i)}
          />
        ))}
      </div>
      <AnimatePresence>
        {overlayImg !== null && (
          <Gallery
            close={() => setOverlayImg(null)}
            left={() => {
              if (overlayImg > 0) {
                setOverlayImg(overlayImg - 1);
              }
            }}
            right={() => {
              if (overlayImg < images.length - 1) {
                setOverlayImg(overlayImg + 1);
              }
            }}
          >
            <img
              src={images[overlayImg]}
              className="w-full h-full object-cover"
              onClick={() => setOverlayImg(null)}
            />
          </Gallery>
        )}
      </AnimatePresence>
    </div>
  );
};

const PollContent = ({ poll }: { poll: types.Poll; full: boolean }) => {
  const { userId } = useAuth();
  const sendVote = useSendVote();
  const [choiceIds, setChoiceIds] = useState<Set<number> | undefined>();

  useEffect(() => {
    setChoiceIds(
      new Set(
        poll.choices
          .filter(({ voters }) => voters.includes(userId))
          .map(({ id }) => id),
      ),
    );
  }, [userId, poll.choices]);

  if (choiceIds === undefined) {
    return;
  }

  const voteSingleChoice = (kind: "for" | "against", id: number) => {
    const oldId: number | undefined = [...choiceIds.keys()][0];
    if (kind === "for") {
      setChoiceIds(new Set([id]));
    } else {
      setChoiceIds(new Set([]));
    }
    sendVote("against", poll.id, oldId)
      .then(() => {
        if (kind === "for") {
          return sendVote(kind, poll.id, id);
        }
      })
      .catch(() => {
        setChoiceIds(choiceIds);
      });
  };

  const voteMultipleChoice = (kind: "for" | "against", id: number) => {
    const s = new Set([...choiceIds]);
    if (kind === "for") {
      s.add(id);
    } else {
      s.delete(id);
    }
    setChoiceIds(s);
    sendVote(kind, poll.id, id).catch(() => setChoiceIds(choiceIds));
  };

  const choices = (
    <div className="grow text-[32px] flex flex-col justify-around">
      {poll.choices.map((choice) => (
        <label
          key={choice.id}
          className="select-none flex items-center gap-[28px]"
        >
          <span
            className={clsx(
              "flex shrink-0 w-[32px] h-[32px] items-center justify-center",
              poll.isMultipleChoice || "rounded-full",
              choiceIds.has(choice.id)
                ? "border-[2px] border-light-blue"
                : "bg-radio-unchecked",
            )}
          >
            <input
              className={clsx(
                "w-[16px] h-[16px] rounded-full appearance-none",
                choiceIds.has(choice.id) && "bg-light-blue",
              )}
              name={poll.isMultipleChoice ? `choice-${choice.id}` : "choice"}
              type={poll.isMultipleChoice ? "checkbox" : "radio"}
              key={choice.id}
              checked={choiceIds.has(choice.id)}
              onChange={(event) => {
                const kind = event.target.checked ? "for" : "against";
                if (poll.isMultipleChoice) {
                  voteMultipleChoice(kind, choice.id);
                } else {
                  voteSingleChoice(kind, choice.id);
                }
              }}
            />
          </span>
          {choice.text}
        </label>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-2 mt-[24px]">
      <div className="flex flex-col gap-[24px]">
        <h3 className="text-[32px]">{poll.question}</h3>
        {choices}
      </div>
      <img src={pollCoverImg} className="h-[362px] w-full object-cover" />
    </div>
  );
};

const Post = ({
  post,
  full = false,
  handleOpen,
}: {
  post: types.Post;
  full?: boolean;
  handleOpen?: () => void;
}) => {
  return (
    <article className="mt-[60px] mx-[65px] mb-[50px]">
      <div className="flex items-center">
        <a className="grow cursor-pointer" onClick={handleOpen}>
          <h2 className={clsx("text-[32px]", full && "font-medium")}>
            {post.title}
          </h2>
        </a>
        <time
          className={clsx("text-date shrink-0", full && "text-[32px]")}
          dateTime={post.publishedAt.toString()}
        >
          {formatDate(post.publishedAt)}
        </time>
      </div>
      {post.kind === "news" ? (
        <NewsContent full={full} news={post} />
      ) : (
        <PollContent full={full} poll={post} />
      )}
    </article>
  );
};

function Separator() {
  return (
    <hr className={clsx("border-[1px] border-medium-gray", "mx-[24px]")} />
  );
}

export default function Feed() {
  const { data: posts, loadMore } = useFeed();
  const [overlayPost, setOverlayPost] = useState<number | null>(null);

  const refs = useRef<(HTMLDivElement | null)[]>(Array(posts?.length));

  const scrollToCard = (i: number) => {
    if (refs.current[i]) {
      refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useReachBottom(loadMore);

  if (!posts) return <div>Loading...</div>;

  return (
    <AnimatePage>
      <PageSkel title="Новости" heading="Новости">
        <div>
          {posts.map((post, i) => (
            <div
              ref={(elem) => {
                refs.current[i] = elem;
              }}
              key={`${post.kind}-${post.id}`}
            >
              {i > 0 && <Separator />}
              <Post post={post} handleOpen={() => setOverlayPost(i)} />
            </div>
          ))}
          <AnimatePresence>
            {overlayPost !== null && (
              <Gallery
                close={() => setOverlayPost(null)}
                left={() => {
                  if (overlayPost > 0) {
                    setOverlayPost(overlayPost - 1);
                    scrollToCard(overlayPost - 1);
                  }
                }}
                right={() => {
                  if (overlayPost < posts.length - 1) {
                    setOverlayPost(overlayPost + 1);
                    scrollToCard(overlayPost + 1);
                  }
                }}
              >
                <Post full post={posts[overlayPost]} />
              </Gallery>
            )}
          </AnimatePresence>
        </div>
      </PageSkel>
    </AnimatePage>
  );
}
