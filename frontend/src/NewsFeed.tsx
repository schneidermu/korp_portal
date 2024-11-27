import clsx from "clsx";
import { useEffect, useMemo } from "react";
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

const NewsPost = ({ post }: { post: Post }) => {
  return (
    <div className="mt-[60px] mx-[65px] mb-[50px]">
      <div className="flex mb-[36px]">
        <h2 className="grow">{post.title}</h2>
        <time className="text-date" dateTime="2024-11-31">
          31 ноября 2024
        </time>
      </div>
      <div className="grid grid-cols-2 gap-[20px]">
        {post.images.slice(0, 2).map((src, i) => (
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

  const loadNext = useMemo(
    () => () => allAreLoaded || setSize(size + 1),
    [posts?.length],
  );

  useReachBottom(loadNext);

  if (!posts) return <div>Loading...</div>;

  return (
    <div className="text-[32px]">
      {posts.map((post, i) => (
        <div key={post.id}>
          {i > 0 && <Separator />}
          <NewsPost post={post} />
        </div>
      ))}
    </div>
  );
}
