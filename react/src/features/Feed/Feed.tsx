import { useEffect, useRef, useState } from "react";

import clsx from "clsx/lite";
import { AnimatePresence } from "motion/react";

import { useIntSearchParam } from "@/shared/hooks/useSearchParam";
import { resolveMediaPath } from "@/shared/utils";

import { useFeed } from "./services";

import { AnimatePage, PageSkel } from "@/features/App/comps/PageSkel";
import { OrgPicker } from "@/features/org/comps/OrgPicker";

import { Birthday } from "./parts/Birthday";
import { Gallery, Modal } from "./parts/Gallery";
import { News } from "./parts/News";
import { Poll } from "./parts/Poll";

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
  const [orgId, setOrgId] = useIntSearchParam("org");

  const { data: posts, vote, setPoll, loadMore, allAreLoaded } = useFeed(orgId);
  const [overlayPost, setOverlayPost] = useState<number | null>(null);
  const [overlayImg, setOverlayImg] = useState<number | null>(null);
  const [showPollResults, setShowPollResults] = useState(false);

  const refs = useRef<(HTMLDivElement | null)[]>(Array(posts?.length));

  const scrollToCard = (i: number) => {
    if (refs.current[i]) {
      refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useReachBottom(loadMore);

  if (!posts) return;

  return (
    <AnimatePage>
      <PageSkel
        title="Новости"
        heading="Новости"
        slot={
          <div className="basis-1/4">
            <OrgPicker orgId={orgId} setOrgId={setOrgId} />
          </div>
        }
      >
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
                <News
                  news={post}
                  handleOpen={() => setOverlayPost(i)}
                  setOverlayImg={setOverlayImg}
                />
              ) : post.kind === "polls" ? (
                <Poll
                  poll={post}
                  handleOpen={() => setOverlayPost(i)}
                  vote={vote}
                  setPoll={setPoll}
                  showResults={showPollResults}
                  setShowResults={setShowPollResults}
                />
              ) : (
                <Birthday
                  birthday={post}
                  handleOpen={() => setOverlayPost(i)}
                />
              )}
            </div>
          ))}
          {allAreLoaded && (
            <>
              <Separator />
              <div className="mt-20 mb-40 text-[32px] text-center">
                Вы посмотрели все записи
              </div>
            </>
          )}
          <Modal hidden={overlayPost === null}>
            <AnimatePresence>
              {overlayPost !== null && (
                <Gallery
                  hideControls={overlayImg !== null}
                  key="post"
                  close={() => {
                    setShowPollResults(false);
                    setOverlayPost(null);
                  }}
                  left={
                    overlayPost <= 0
                      ? undefined
                      : () => {
                          setShowPollResults(false);
                          setOverlayPost(overlayPost - 1);
                          scrollToCard(overlayPost - 1);
                        }
                  }
                  right={
                    overlayPost >= posts.length - 1
                      ? undefined
                      : () => {
                          setShowPollResults(false);
                          setOverlayPost(overlayPost + 1);
                          scrollToCard(overlayPost + 1);
                        }
                  }
                >
                  {posts[overlayPost].kind === "news" ? (
                    <News
                      full
                      news={posts[overlayPost]}
                      setOverlayImg={setOverlayImg}
                    />
                  ) : posts[overlayPost].kind === "polls" ? (
                    <Poll
                      full
                      poll={posts[overlayPost]}
                      vote={vote}
                      setPoll={setPoll}
                      showResults={showPollResults}
                      setShowResults={setShowPollResults}
                    />
                  ) : (
                    <Birthday full birthday={posts[overlayPost]} />
                  )}
                </Gallery>
              )}
              {overlayPost !== null &&
                overlayImg !== null &&
                posts[overlayPost].kind === "news" && (
                  <Gallery
                    key="image"
                    close={() => setOverlayImg(null)}
                    left={
                      overlayImg <= 0
                        ? undefined
                        : () => {
                            setOverlayImg(overlayImg - 1);
                          }
                    }
                    right={
                      overlayImg >= posts[overlayPost].images.length - 1
                        ? undefined
                        : () => {
                            setOverlayImg(overlayImg + 1);
                          }
                    }
                  >
                    <img
                      src={resolveMediaPath(
                        posts[overlayPost].images[overlayImg],
                      )}
                      className="w-full h-full object-cover"
                      onClick={() => setOverlayImg(null)}
                    />
                  </Gallery>
                )}
            </AnimatePresence>
          </Modal>
        </div>
      </PageSkel>
    </AnimatePage>
  );
};
