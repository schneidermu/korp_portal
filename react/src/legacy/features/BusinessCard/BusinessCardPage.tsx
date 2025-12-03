import { Canvas } from "@legacy/shared/comps/Canvas";
import { formatMobilePhone } from "@legacy/shared/utils";
import { Center } from "@chakra-ui/react";
import { Option as O } from "effect";
import QRCode from "qrcode";
import { useCallback } from "react";
import { useAuth } from "@api/auth";
import { useFetchUser } from "../user/services";
import businessCard from "/public/business-card.png";

import { useParams } from "react-router-dom";
import emailIcon from "./assets/email.svg";
import phoneIcon from "./assets/phone.svg";

const BG = "#2F80ED";
const DIMS = { width: 575, height: 840 };

const renderImg = async (
  ctx: CanvasRenderingContext2D,
  src: string,
  {
    x = 0,
    y = 0,
    w,
    h,
  }: {
    x?: number;
    y?: number;
    w: number;
    h: number;
  },
) => {
  return new Promise<void>((resolve) => {
    const img = new Image(w, h);
    img.src = src;
    img.onload = () => {
      ctx.drawImage(img, x, y, w, h);
      resolve();
    };
  });
};

/*
const renderRoundImg = async (
  ctx: CanvasRenderingContext2D,
  src: string,
  {
    x = 0,
    y = 0,
    w,
    border = 0,
  }: {
    x?: number;
    y?: number;
    w: number;
    border?: number;
  },
) => {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(
    x - border,
    y - border,
    w + 2 * border,
    w + 2 * border,
    w / 2 + border,
  );
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x, y, w, w, w / 2);
  ctx.closePath();
  ctx.fill();
  ctx.clip();
  await renderImg(ctx, src, { x, y, w, h: w });
  ctx.restore();
};
*/

const renderQR = async (
  ctx: CanvasRenderingContext2D,
  text: string,
  {
    x,
    y,
    width,
    padding = 0,
    radius = 0,
  }: {
    x: number;
    y: number;
    width: number;
    padding?: number;
    radius?: number;
  },
) => {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel: "H",
    margin: 0,
    width,
  });
  ctx.roundRect(
    x - padding,
    y - padding,
    width + 2 * padding,
    width + 2 * padding,
    radius,
  );
  ctx.fill();
  ctx.drawImage(canvas, x, y);
};

const getLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) => {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

const renderText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  { w, h, hStep }: { w: number; h: number; hStep: number },
) => {
  for (const line of getLines(ctx, text, w)) {
    ctx.fillText(line, DIMS.width / 2, DIMS.height * h);
    h += hStep;
  }
  return h;
};

export default function BusinessCardPage() {
  const params = useParams();
  const auth = useAuth();
  const userId = params.userId ?? auth.userId;
  const { user } = useFetchUser(O.some(userId));

  const render = useCallback(
    async (ctx: CanvasRenderingContext2D) => {
      if (!user) return;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      await renderImg(ctx, businessCard, { w: DIMS.width, h: DIMS.height });

      ctx.fillStyle = "white";
      await renderQR(
        ctx,
        `${window.location.origin + window.location.pathname}#/profile/${userId}`,
        {
          x: (DIMS.width - 250) / 2,
          y: 200,
          width: 250,
          padding: 10,
          radius: 10,
        },
      );

      // const photo = userPhotoPath(user);
      // await renderRoundImg(ctx, photo, {
      //   x: (DIMS.width - 60) / 2,
      //   y: 200 + (250 - 60) / 2,
      //   w: 60,
      //   border: 10,
      // });

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let h = 0.62;
      const hStep = 0.03;

      ctx.font = "bold 36px SFUIDisplay";
      h = renderText(ctx, user.lastName + " " + user.firstName, {
        w: DIMS.width * 0.9,
        h,
        hStep,
      });
      h += hStep;

      if (O.isSome(user.unit)) {
        ctx.font = "24px SFUIDisplay";
        h = renderText(ctx, user.unit.value.name, {
          w: DIMS.width * 0.75,
          h,
          hStep,
        });
        h += hStep;

        if (O.isSome(user.organization)) {
          renderText(ctx, user.organization.value.name, {
            w: DIMS.width * 0.75,
            h,
            hStep,
          });
        }
      }

      ctx.textAlign = "left";
      ctx.font = "bold 20px SFUIDisplay";

      h = 0.85;
      {
        const img = new Image();
        img.src = emailIcon;
        img.onload = () =>
          ctx.drawImage(img, DIMS.width * 0.15, DIMS.height * (h - 0.05) + 2);
        ctx.fillText(user.email, DIMS.width * 0.22, DIMS.height * h + 15);
      }
      h += 0.05;

      if (user.phoneNumber) {
        const img = new Image();
        img.src = phoneIcon;
        img.onload = () =>
          ctx.drawImage(img, DIMS.width * 0.15, DIMS.height * h);
        ctx.fillText(
          formatMobilePhone(user.phoneNumber),
          DIMS.width * 0.22,
          DIMS.height * h + 15,
        );
      }

      const link = document.createElement("a");
      link.download = `${user.lastName} ${user.firstName} (Визитка).png`;
      link.setAttribute(
        "href",
        ctx.canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream"),
      );
      link.click();
    },
    [user, userId],
  );

  if (!user) return;

  return (
    <Center py={10}>
      <Canvas w={`${DIMS.width}px`} h={`${DIMS.height}px`} render={render} />
    </Center>
  );
}
