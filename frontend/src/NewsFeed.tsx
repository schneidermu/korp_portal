import clsx from "clsx";
import { AnimatePresence } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Gallery from "./Gallery";
import { useNews } from "./news/api";
import { Post } from "./news/types";

const useReachBottom = (handleBottom: () => void) => {
  useEffect(() => {
    function handleScroll() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      if (windowHeight + scrollTop >= documentHeight - 200) {
        handleBottom();
        window.removeEventListener("scroll", handleScroll);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleBottom]);
};

const NewsPost = ({
  post,
  full = false,
  showFull,
}: {
  post: Post;
  full?: boolean;
  showFull?: () => void;
}) => {
  const images = full ? post.images : post.images.slice(0, 2);
  return (
    <div className="mt-[60px] mx-[65px] mb-[50px]">
      <div className="flex mb-[36px]">
        <a className="grow cursor-pointer" onClick={showFull}>
          <h2>{post.title}</h2>
        </a>
        <time className="text-date" dateTime="2024-11-31">
          31 ноября 2024
        </time>
      </div>
      {full && <div className="mt-[56px] mb-[90px]">{post.text}</div>}
      <div className="grid grid-cols-2 gap-[20px]">
        {images.map((src, i) => (
          <img key={i} className="w-full h-[400px] object-cover" src={src} />
        ))}
      </div>
    </div>
  );
};

function Separator() {
  return (
    <hr className={clsx("border-[1px] border-medium-gray", "mx-[24px]")} />
  );
}

export default function NewsFeed() {
  const { posts, allAreLoaded, size, setSize } = useNews();
  const [overlayPost, setOverlayPost] = useState<number | null>(null);

  const refs = useRef<(HTMLDivElement | null)[]>(Array(posts?.length));

  const scrollToCard = (i: number) => {
    if (refs.current[i]) {
      refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const loadNext = useMemo(
    () => () => allAreLoaded || setSize(size + 1),
    [posts?.length],
  );

  useReachBottom(loadNext);

  if (!posts) return <div>Loading...</div>;

  return (
    <div className="text-[32px]">
      {posts.map((post, i) => (
        <div
          ref={(elem) => {
            refs.current[i] = elem;
          }}
          key={post.id}
        >
          {i > 0 && <Separator />}
          <NewsPost post={post} showFull={() => setOverlayPost(i)} />
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
            <NewsPost post={posts[overlayPost]} full />
          </Gallery>
        )}
      </AnimatePresence>
    </div>
  );
}
