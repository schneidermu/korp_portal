import clsx from "clsx/lite";

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
  return (
    <a
      href={resolveMediaPath(url)}
      className={clsx("underline", ft && `text-${ft}`)}
      target="_blank"
      download={download}
    >
      {text}
    </a>
  );
};
