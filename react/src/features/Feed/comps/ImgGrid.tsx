import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Grid,
  GridProps,
  IconButton,
  Image,
  Show,
} from "@chakra-ui/react";

import { LuX } from "react-icons/lu";

import { resolveMediaPath } from "@/shared/utils";

import { SlideButtonLeft, SlideButtonRight } from "../parts/SlideButtons";
import { Overlay } from "../parts/Overlay";

const OverlayImg = ({
  imgs,
  index,
  onClose,
}: {
  imgs: string[];
  index: number | null;
  onClose: () => void;
}) => {
  const [j, setJ] = useState<number | null>(index);

  useEffect(() => setJ(index), [index]);

  useEffect(() => {
    if (j === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const { key } = event;
      if (key === "ArrowLeft" && j > 0) {
        setJ(j - 1);
      }
      if (key === "ArrowRight" && j + 1 < imgs.length) {
        setJ(j + 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [j, imgs.length]);

  return (
    <Overlay position="relative" present={j !== null} onClose={onClose}>
      {j !== null && (
        <>
          <IconButton
            position="absolute"
            p="2"
            w="10"
            h="10"
            bottom="100%"
            left="100%"
            onClick={onClose}
            color="black"
            bg="transparent"
            _hover={{ color: "blue.2" }}
          >
            <LuX style={{ width: "100%", height: "100%" }} />
          </IconButton>
          <SlideButtonLeft disabled={j <= 0} onClick={() => setJ(j - 1)} />
          <SlideButtonRight
            disabled={j + 1 >= imgs.length}
            onClick={() => setJ(j + 1)}
          />
          <Image
            role="button"
            w="74rem"
            h="42rem"
            userSelect="none"
            cursor="default"
            src={resolveMediaPath(imgs[j])}
            onClick={onClose}
          />
        </>
      )}
    </Overlay>
  );
};

export interface ImgGridProps extends GridProps {
  imgs: string[];
  onRemove?: (i: number) => void;
}

export const ImgGrid = React.memo(function ImgGrid({
  imgs,
  onRemove,
  ...rest
}: ImgGridProps) {
  const [windowInd, setWindowIndex] = useState(0);
  const [overlayImg, setOverlayImg] = useState<number | null>(null);

  const windowSize = 4;
  const step = 2;

  // 0 1 4 6 ...
  // 2 3 5 7 ...
  const windowImgs = useMemo(() => {
    if (windowInd === 0) {
      return imgs.slice(0, windowSize);
    }
    if (windowInd === 1) {
      return [imgs[1], ...imgs.slice(3, 6)];
    }
    return imgs.slice(step * windowInd, step * windowInd + windowSize);
  }, [imgs, windowInd]);

  return (
    <Grid
      autoFlow={windowInd === 0 ? "row" : "column"}
      templateColumns="1fr 1fr"
      templateRows={
        imgs.length === 0
          ? undefined
          : imgs.length <= 2
            ? "24rem"
            : "24rem 24rem"
      }
      gapX="6"
      gapY="5"
      position="relative"
      {...rest}
    >
      <Show when={windowInd > 0}>
        <SlideButtonLeft onClick={() => setWindowIndex(windowInd - 1)} />
      </Show>
      <Show when={windowInd * step + windowSize < imgs.length}>
        <SlideButtonRight onClick={() => setWindowIndex(windowInd + 1)} />
      </Show>
      {windowImgs.map((src, i) => (
        <Box position="relative" key={i}>
          <Image
            role="button"
            w="full"
            h="full"
            userSelect="none"
            src={resolveMediaPath(src)}
            onClick={() => setOverlayImg(i)}
          />
          {onRemove && (
            <IconButton
              inset="0"
              h="full"
              position="absolute"
              bg="transparent"
              color="transparent"
              _hover={{ bg: "gray.1", color: "black" }}
              opacity="0.8"
              onClick={() => {
                // Visible before the removal.
                const numVisible = imgs.length - step * windowInd;
                const isLastWindow =
                  step * windowInd + windowSize >= imgs.length;
                if (windowInd > 0 && isLastWindow && numVisible < 4) {
                  setWindowIndex(windowInd - 1);
                }
                onRemove(i);
              }}
            >
              <LuX />
            </IconButton>
          )}
        </Box>
      ))}

      <OverlayImg
        imgs={imgs}
        index={overlayImg}
        onClose={() => setOverlayImg(null)}
      />
    </Grid>
  );
});
