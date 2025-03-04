import React from "react";

import { Option as O } from "effect";

import { ACCEPT_IMAGES } from "@/app/const";
import { fileExtention, resolveMediaPath } from "@/shared/utils";
import {
  Center,
  Field,
  Grid,
  Icon,
  IconButton,
  Image,
  Input,
  Show,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { LuImageUp, LuPlus, LuX } from "react-icons/lu";

export interface ImgWithCaption {
  src: O.Option<string>;
  caption: string;
}

const FileInput = ({
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
        const ext = fileExtention(file.name);
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

export const ImageGridItem = React.memo(function ImageGridItem({
  index,
  src,
  caption,
  editing,
  onRemove,
  onChange,
}: {
  index: number;
  src: O.Option<string>;
  caption: string;
  editing: boolean;
  onRemove: (i: number) => void;
  onChange: (i: number, img: ImgWithCaption) => void;
}) {
  return (
    <Stack gap="9" width="36" position="relative">
      <Show when={editing}>
        <IconButton
          h="auto"
          minW="0"
          position="absolute"
          left="100%"
          bottom="100%"
          onClick={() => onRemove(index)}
        >
          <LuX />
        </IconButton>
      </Show>
      <Field.Root disabled={!editing}>
        <FileInput
          accept={ACCEPT_IMAGES}
          onUpload={(url) =>
            onChange(index, { src: O.some(url), caption: caption })
          }
        />
        <Field.Label opacity="1" width="full" height="36">
          {O.match(src, {
            onSome: (src) => (
              <Image
                src={resolveMediaPath(src)}
                cursor={editing ? "pointer" : undefined}
              />
            ),
            onNone: () => (
              <Center
                w="full"
                h="full"
                borderWidth={1}
                borderColor="gray.1"
                borderRadius="1"
                cursor="pointer"
              >
                <Icon w="1/2" h="1/2" mx="auto">
                  <LuImageUp />
                </Icon>
              </Center>
            ),
          })}
        </Field.Label>
      </Field.Root>
      <Textarea
        required
        rows={3}
        resize="none"
        placeholder="Подпись"
        width="full"
        p="1"
        opacity="1"
        borderWidth={editing ? 1 : 0}
        borderColor="gray.1"
        borderRadius="1"
        disabled={!editing}
        value={caption}
        onChange={({ target }) =>
          onChange(index, { src, caption: target.value })
        }
      />
    </Stack>
  );
});

const AddButton = React.memo(function AddButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Stack gap="9" w="36">
      <Center
        h="36"
        borderWidth={1}
        borderColor="gray.1"
        borderRadius="1"
        cursor="pointer"
        onClick={onClick}
      >
        <Icon w="1/2" h="1/2" mx="auto">
          <LuPlus />
        </Icon>
      </Center>
    </Stack>
  );
});

export const ImageGrid = React.memo(function ImageGrid({
  imgs,
  editing,
  onAdd,
  onRemove,
  onChange,
}: {
  imgs: ImgWithCaption[];
  editing: boolean;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onChange: (i: number, img: ImgWithCaption) => void;
}) {
  return (
    <Grid
      gapX="16"
      gapY="8"
      gridTemplateColumns="repeat(6, 1fr)"
      justifyItems="center"
    >
      {imgs.map(({ src, caption }, i) => (
        <ImageGridItem
          key={i}
          index={i}
          src={src}
          caption={caption}
          editing={editing}
          onRemove={onRemove}
          onChange={onChange}
        />
      ))}
      {editing && <AddButton onClick={onAdd} />}
    </Grid>
  );
});
