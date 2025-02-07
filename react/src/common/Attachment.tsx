import clsx from "clsx/lite";

import { STATIC_BASE_URL } from "@/app/const";

import { fileExtention } from "./util";

const filetype = (ext: string): string | undefined => {
  if (ext === "doc" || ext === "docx") {
    return "word";
  }
  if (ext === "xls" || ext === "xlsx") {
    return "excel";
  }
  if (ext === "pdf") {
    return "pdf";
  }
};

export const Attachment = ({
  url,
  download,
}: {
  url: string;
  download?: string;
}) => {
  const ext = fileExtention(url);
  const ft = ext && filetype(ext);
  let text = "";
  if (url) {
    text += "Документ";
  }
  if (ext) {
    text += "." + ext;
  }
  if (!url.startsWith("blob:")) {
    url = STATIC_BASE_URL + url;
  }
  return (
    <a
      href={url}
      className={clsx("underline", ft && `text-${ft}`)}
      target="_blank"
      download={download}
    >
      {text}
    </a>
  );
};
