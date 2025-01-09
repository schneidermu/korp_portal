import clsx from "clsx";
import { STATIC_BASE_URL } from "./const";
import { fileExtention } from "./util";

function filetype(ext: string): string | undefined {
  if (ext === "doc" || ext === "docx") {
    return "word";
  }
  if (ext === "xls" || ext === "xlsx") {
    return "excel";
  }
  if (ext === "pdf") {
    return "pdf";
  }
}

export default function FileAttachment({ url }: { url: string }) {
  const ext = fileExtention(url);
  const ft = ext && filetype(ext);
  const color = ft ? `text-${ft}` : "";
  let text = "";
  if (url) {
    text += "Документ";
  }
  if (ext) {
    text += "." + ext;
  }
  if (!url.startsWith("blob://")) {
    url = STATIC_BASE_URL + url;
  }
  return (
    <a href={url} className={clsx("underline", color)}>
      {text}
    </a>
  );
}
