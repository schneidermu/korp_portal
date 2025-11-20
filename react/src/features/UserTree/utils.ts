export const drawRoundedChain = (
  ctx: CanvasRenderingContext2D,
  r: number,
  chain: { x: number; y: number }[],
) => {
  if (chain.length < 3) return;
  let { x: x0, y: y0 } = chain[0];
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  let { x: x1, y: y1 } = chain[1];
  for (let i = 2; i < chain.length; i++) {
    const { x: x2, y: y2 } = chain[i];
    ctx.arcTo(x1, y1, x2, y2, r);
    [x0, y0] = [x1, y1];
    [x1, y1] = [x2, y2];
  }
  ctx.lineTo(x1, y1);
  ctx.stroke();
};
