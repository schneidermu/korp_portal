import clsx from "clsx";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Gallery from "./Gallery";
import { useFeed } from "./news/api";
import * as types from "./news/types";
import { formatDate } from "./util";
import pollCoverImg from "/poll-cover.png";

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
  return (
    <div className="mt-[36px]">
      {full && <div className="mt-[56px] mb-[90px]">{news.text}</div>}
      <div className="grid grid-cols-2 gap-[20px]">
        {images.map((src, i) => (
          <img key={i} className="w-full h-[400px] object-cover" src={src} />
        ))}
      </div>
    </div>
  );
};

const PollContent = ({ poll }: { poll: types.Poll; full: boolean }) => {
  const [choiceId, setChoiceId] = useState<number | null>(null);

  const choices = (
    <div className="grow text-[32px] flex flex-col justify-around">
      {poll.choices.map((choice) => (
        <label
          key={choice.id}
          className="select-none flex items-center gap-[28px]"
        >
          <span
            className={clsx(
              "flex shrink-0 w-[28px] h-[28px] items-center justify-center rounded-full",
              choiceId === choice.id
                ? "border-[2px] border-light-blue"
                : "bg-radio-unchecked",
            )}
          >
            <input
              className={clsx(
                "w-[16px] h-[16px] rounded-full appearance-none",
                choiceId === choice.id && "bg-light-blue",
              )}
              name="choice"
              type="radio"
              key={choice.id}
              onChange={() => setChoiceId(choice.id)}
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
      <div className="flex">
        <a className="grow cursor-pointer" onClick={handleOpen}>
          <h2 className="text-[32px]">{post.title}</h2>
        </a>
        <time className="text-date" dateTime={post.publishedAt.toString()}>
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
  );
}
