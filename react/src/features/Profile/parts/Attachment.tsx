import clsx from "clsx/lite";
import { Option as O } from "effect";

import { fileExtention, resolveMediaPath } from "@/shared/utils";

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
  url: O.Option<string>;
  download?: string;
}) => {
  if (O.isNone(url)) return;
  const ext = fileExtention(url.value);
  const ft = ext && filetype(ext);
  let text = "";
  text += "Документ";
  if (ext) {
    text += "." + ext;
  }
  return (
    <a
      href={resolveMediaPath(url.value)}
      className={clsx("underline", ft && `text-${ft}`)}
      target="_blank"
      download={download}
    >
      {text}
    </a>
  );
};
