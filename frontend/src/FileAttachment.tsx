function extention(filename: string): string | undefined {
  const parts = filename.split(".");
  return parts[parts.length - 1];
}

function filetype(filename: string): string | undefined {
  const ext = extention(filename);
  if (ext === "doc" || ext === "docx") {
    return "word";
  }
  if (ext === "xls" || ext === "xlsx") {
    return "excel";
  }
}

export default function FileAttachment({
  filename,
  url,
}: {
  filename: string;
  url: string;
}) {
  const ext = extention(filename);
  const ft = filetype(filename);
  const color = ft ? `text-${ft}` : "";
  return (
    <a href={url} className={`underline ${color}`}>
      Приложение.{ext}
    </a>
  );
}
