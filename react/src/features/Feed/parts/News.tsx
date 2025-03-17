import clsx from "clsx/lite";

import { formatDate, resolveMediaPath } from "@/shared/utils";

import * as types from "../types";

export const News = ({
  news,
  full = false,
  setOverlayImg,
  handleOpen,
}: {
  news: types.News;
  full?: boolean;
  setOverlayImg: (i: number) => void;
  handleOpen?: () => void;
}) => {
  const images = full ? news.images : news.images.slice(0, 2);

  return (
    <article className="mt-[60px] mx-[65px] mb-[50px]">
      <div className="flex items-center justify-end">
        <a
          className="grow cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            if (handleOpen) handleOpen();
          }}
        >
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
      <div className="mt-[36px]">
        {full && (
          <div
            className={clsx(
              "text-[32px] mt-[56px] mb-[90px]",
              "max-h-48 overflow-y-auto",
            )}
          >
            {news.text}
          </div>
        )}
        <div className="grid grid-cols-2 gap-[20px]">
          {images.map((src, i) => (
            <img
              key={src}
              src={resolveMediaPath(src)}
              loading="lazy"
              className="w-full h-[400px] object-cover select-none"
              onClick={(event) => {
                if (!full && handleOpen) {
                  event.stopPropagation();
                  handleOpen();
                }
                setOverlayImg(i);
              }}
            />
          ))}
        </div>
      </div>
    </article>
  );
};
