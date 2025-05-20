import { Input } from "@chakra-ui/react";

import { fileExtension } from "@/shared/utils";

export const FileInput = ({
  accept,
  onUpload,
}: {
  accept: readonly string[];
  onUpload: (file: string) => void;
}) => {
  return (
    <Input
      hidden
      type="file"
      accept={accept.join(",")}
      onClick={(event) => event.stopPropagation()}
      onChange={({ target: { files } }) => {
        if (!files || files.length < 1) {
          return;
        }
        const file = files[0];
        const ext = fileExtension(file.name);
        if (!ext || !accept.includes("." + ext)) {
          return;
        }
        let url = URL.createObjectURL(file);
        url += "." + ext;
        onUpload(url);
      }}
    />
  );
};
