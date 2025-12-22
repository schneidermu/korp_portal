export const cropImg = async (
  src: string,
  area: { x: number; y: number; width: number; height: number },
): Promise<string> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("canvas ctx is null");
  }

  const img = new Image();
  img.src = src;

  const { x, y, width: w, height: h } = area;

  return new Promise(
    (resolve) =>
      (img.onload = () => {
        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

        resolve(canvas.toDataURL());
      }),
  );
};
