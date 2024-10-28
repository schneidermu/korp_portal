function filetype(filename: string): string | undefined {
  const parts = filename.split(".");
  const ext = parts[parts.length - 1];
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
  const ft = filetype(filename);
  const color = ft ? `text-${ft}` : "";
  return (
    <a href={url} className={`underline ${color}`}>
      {filename}
    </a>
  );
}
