import { useEffect, useRef, useState } from "react";

import clsx from "clsx/lite";
import { AnimatePresence } from "motion/react";

import { useFeed } from "./api";

import { AnimatePage, PageSkel } from "@/app/Page";
import { Gallery } from "@/common/Gallery";
import { News } from "./News";
import { Poll } from "./Poll";

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

const Separator = () => {
  return (
    <hr className={clsx("border-[1px] border-medium-gray", "mx-[24px]")} />
  );
};

export const Feed = () => {
  const { data: posts, vote, loadMore } = useFeed();
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
              {post.kind === "news" ? (
                <News news={post} handleOpen={() => setOverlayPost(i)} />
              ) : (
                <Poll
                  poll={post}
                  handleOpen={() => setOverlayPost(i)}
                  vote={vote}
                />
              )}
            </div>
          ))}
          <AnimatePresence>
            {overlayPost !== null && (
              <Gallery
                close={() => setOverlayPost(null)}
                left={
                  overlayPost <= 0
                    ? undefined
                    : () => {
                        setOverlayPost(overlayPost - 1);
                        scrollToCard(overlayPost - 1);
                      }
                }
                right={
                  overlayPost >= posts.length - 1
                    ? undefined
                    : () => {
                        setOverlayPost(overlayPost + 1);
                        scrollToCard(overlayPost + 1);
                      }
                }
              >
                {posts[overlayPost].kind === "news" ? (
                  <News full news={posts[overlayPost]} />
                ) : (
                  <Poll full poll={posts[overlayPost]} vote={vote} />
                )}
              </Gallery>
            )}
          </AnimatePresence>
        </div>
      </PageSkel>
    </AnimatePage>
  );
};
