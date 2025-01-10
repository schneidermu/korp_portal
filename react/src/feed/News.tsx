import { useState } from "react";

import clsx from "clsx/lite";
import { AnimatePresence } from "motion/react";

import { formatDate } from "@/common/util";
import * as types from "./types";

import { Gallery } from "@/common/Gallery";

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
            left={
              overlayImg <= 0
                ? undefined
                : () => {
                    setOverlayImg(overlayImg - 1);
                  }
            }
            right={
              overlayImg >= images.length - 1
                ? undefined
                : () => {
                    setOverlayImg(overlayImg + 1);
                  }
            }
          >
            {overlayImg}/{images.length}
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

export const News = ({
  news,
  full = false,
  handleOpen,
}: {
  news: types.News;
  full?: boolean;
  handleOpen?: () => void;
}) => {
  return (
    <article className="mt-[60px] mx-[65px] mb-[50px]">
      <div className="flex items-center justify-end">
        <a className="grow cursor-pointer" onClick={handleOpen}>
          <h2 className={clsx("text-[32px]", full && "font-medium")}>
            {news.title}
          </h2>
        </a>
        <time
          className={clsx("text-date shrink-0", full && "text-[32px]")}
          dateTime={news.publishedAt.toString()}
        >
          {formatDate(news.publishedAt)}
        </time>
      </div>
      <NewsContent full={full} news={news} />
    </article>
  );
};
