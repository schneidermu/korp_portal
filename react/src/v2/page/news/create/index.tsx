// import { Icon, Mark } from "@chakra-ui/react";

import { DropzoneOptions, useDropzone } from "react-dropzone";

import { Box, BoxProps, Grid, HStack, Stack, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { ACCEPT_IMAGES } from "@/app/const";
import { Breadcrumbs } from "@ui/molecules/navigation";
import { Button, IconButton } from "@ui/atoms/buttons";

import { SaxPaperclip2Linear } from "@meysam213/iconsax-react";
import { css } from "@styled-system/css";
import { LuArrowBigDownDash, LuCloudUpload, LuX } from "react-icons/lu";

import { useAppDispatch } from "@/app/store";
import { useEffect } from "react";
import {
  actions,
  attachImgs,
  publishNews,
  useInfoSelector,
  useSliceSelector,
} from "./slice";
import { LINK } from "@/v2/app/routes";
import { useNavigate } from "react-router-dom";

export default function NewsCreatePage() {
  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Breadcrumbs />
        <styled.h1
          fontSize="Headline/H1"
          color="Grayscale/Black"
          fontWeight="medium"
        >
          Создание новости
        </styled.h1>
      </Stack>
      <NewsForm />
    </Stack>
  );
}

const NewsForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const publishedId = useSliceSelector((s) => s.publishedId);

  useEffect(() => {
    if (publishedId !== null) {
      navigate(LINK.newsView.link + "/" + publishedId);
      dispatch(actions.cleared());
    }
  }, [navigate, dispatch, publishedId]);

  return (
    <styled.form
      className={stack({ gap: 6 })}
      p={6}
      borderRadius="24px" // TODO
      borderWidth="1px"
      borderColor="Grayscale/SpacerLight"
      onSubmit={async (e) => {
        e.preventDefault();
        return dispatch(publishNews());
      }}
    >
      <styled.h2
        fontSize="Headline/H4"
        fontWeight="semibold"
        color="Grayscale/Black"
      >
        Основная информация
      </styled.h2>
      <Grid columnGap={6} gridTemplateColumns="6fr 5fr">
        <Stack gap={4}>
          <InputTitle />
          <InputDatetime />
          <InputText />
        </Stack>
        <Stack gap={5}>
          <Label label="Фотографии">
            <NewsDropzone
              h={64}
              onDrop={async (imgs: File[]) => dispatch(attachImgs(imgs))}
            />
          </Label>
          <Attachments />
        </Stack>
      </Grid>
      <HStack gap={4} justify="end">
        <PublishButton />
      </HStack>
    </styled.form>
  );
};

const InputTitle = () => {
  const dispatch = useAppDispatch();
  const title = useInfoSelector((s) => s.title);

  return (
    <Input
      name="title"
      label="Заголовок новости"
      required
      value={title}
      onChange={(e) => dispatch(actions.edited({ title: e.target.value }))}
    />
  );
};

const InputDatetime = () => {
  const dispatch = useAppDispatch();
  const datetime = useInfoSelector((s) => s.datetime);

  return (
    <Input
      name="datetime"
      label="Дата и время публикации"
      type="datetime-local"
      value={datetime}
      onChange={(e) => dispatch(actions.edited({ datetime: e.target.value }))}
    />
  );
};

const InputText = () => {
  const dispatch = useAppDispatch();
  const text = useInfoSelector((s) => s.text);

  return (
    <Label label="Текст новости">
      <styled.textarea
        required
        name="text"
        p={4}
        borderWidth="1px"
        borderColor="Grayscale/SpacerLight"
        borderRadius="15px"
        w="full"
        fontSize="Body/S"
        rows={6}
        value={text}
        onChange={(e) => dispatch(actions.edited({ text: e.target.value }))}
      />
    </Label>
  );
};

const PublishButton = () => {
  const publishing = useSliceSelector((s) => s.publishing);

  return (
    <Button type="submit" disabled={publishing}>
      Опубликовать новость
    </Button>
  );
};

const Attachments = () => {
  const dispatch = useAppDispatch();
  const imgs = useInfoSelector((s) => s.imgs);

  return (
    <Stack gap={3}>
      {imgs.map((img, i) => (
        <HStack key={i}>
          <styled.img
            objectPosition="center"
            objectFit="cover"
            src={img.dataURL}
            w={10}
            h={10}
          />
          <styled.span>{img.name}</styled.span>
          <Box flexGrow="1" />
          <IconButton onClick={() => dispatch(actions.imgRemoved(i))}>
            <LuX className={css({ w: 7, h: 7, p: 1 })} />
          </IconButton>
        </HStack>
      ))}
    </Stack>
  );
};

const Label = ({
  label,
  children,
  ...rest
}: { label: string } & Parameters<typeof styled.label>[0]) => {
  return (
    <styled.label className={stack()} gap={1} {...rest}>
      <styled.span color="Grayscale/Black">{label}</styled.span>
      {children}
    </styled.label>
  );
};

const Input = ({
  name,
  label,
  ...rest
}: { name: string; label: string } & Parameters<typeof styled.input>[0]) => {
  return (
    <Label label={label}>
      <styled.input
        name={name}
        p={4}
        borderWidth="1px"
        borderColor="Grayscale/SpacerLight"
        borderRadius="15px"
        w="full"
        fontSize="Body/S"
        {...rest}
      />
    </Label>
  );
};

const NewsDropzone = ({
  onDrop,
  ...rest
}: { onDrop: DropzoneOptions["onDrop"] } & Omit<BoxProps, "onDrop">) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Fixes weird size prop types mismatch.
  const inputProps = { ...getInputProps(), size: undefined };

  return (
    <Box
      borderWidth="1px"
      borderRadius="4px"
      borderColor="Grayscale/Border"
      borderStyle="dashed"
      w="full"
      py={9}
      px={5}
      lineHeight={1.5}
      {...rest}
      {...getRootProps()}
    >
      <Stack
        w="full"
        align="center"
        py="3"
        userSelect="none"
        cursor="pointer"
        color="blue.2"
      >
        {/* <Icon w="9" height="9"> */}
        <Box color="Corporate/Accent" w={10} h={9}>
          {isDragActive ? (
            // TODO: add icon() class util
            <LuArrowBigDownDash className={css({ w: "full", h: "full" })} />
          ) : (
            <LuCloudUpload className={css({ w: "full", h: "full" })} />
          )}
          {/* </Icon> */}
        </Box>
        <styled.input {...inputProps} accept={ACCEPT_IMAGES.join(",")} />
        <Box textAlign="center">
          Перетащите файлы сюда <br /> или
        </Box>
        <Button size="S" display="flex" alignItems="center" gap={2}>
          <SaxPaperclip2Linear className={css({ h: "full" })} /> Выберите файл
        </Button>
        <Box fontSize="sm">Максимальный размер файлов: 10 МБ</Box>
      </Stack>
    </Box>
  );
};
