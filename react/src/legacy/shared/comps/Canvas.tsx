import React, { useEffect, useRef, useState } from "react";

import { Box, BoxProps } from "@chakra-ui/react";

const scaleCanvas = (ctx: CanvasRenderingContext2D) => {
  const canvas = ctx.canvas;
  const scale = window.devicePixelRatio;
  // const scale = 1;
  canvas.width = canvas.clientWidth * scale;
  canvas.height = canvas.clientHeight * scale;
  ctx.scale(scale, scale);
};

export const Canvas = React.memo(function Canvas({
  render,
  ...rest
}: { render: (ctx: CanvasRenderingContext2D) => void } & BoxProps) {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setCtx(ctx);
  }, []);

  useEffect(() => {
    if (!ctx) return;
    scaleCanvas(ctx);
    render(ctx);
  }, [ctx, render]);

  return (
    <Box {...rest}>
      <canvas
        style={{ width: "100%", height: "100%" }}
        ref={canvasRef}
      ></canvas>
    </Box>
  );
});
