import React, { Dispatch, SetStateAction, useCallback, useState } from "react";

import { Page } from "@/features/App/comps/Page.tsx";
import {
  Box,
  BoxProps,
  Field,
  Grid,
  HStack,
  Icon,
  Input,
  Mark,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";

import { DropzoneOptions, useDropzone } from "react-dropzone";
import { LuArrowBigDownDash, LuCloudUpload, LuX } from "react-icons/lu";

import { Link, useNavigate } from "react-router-dom";

import { ACCEPT_IMAGES, MAX_IMG_SIZE } from "@/app/const";

import { ImgGrid } from "@/features/NewsEditor/parts/ImgGrid";
import { Button } from "@/shared/comps/Button";
import { publishNews } from "./services";
import { useAuth } from "@/features/auth/slice.ts";
import { PageHeading } from "@/features/App/comps/PageHeading.tsx";

const NewsInputWrapper = (props: BoxProps) => {
  return (
    <Box
      asChild
      outlineColor="blue.4"
      borderColor="blue.6"
      borderRadius="2"
      px="2"
      py="1"
      {...props}
    />
  );
};

const NewsField = React.memo(function NewsField({
  label,
  children,
  ...rest
}: { label: string } & Field.RootProps) {
  return (
    <Field.Root w="full" fontSize="sm" color="blue.4" {...rest}>
      <Field.Label px="2" py="1">
        {label} <Field.RequiredIndicator />
      </Field.Label>
      {children}
    </Field.Root>
  );
});

const formatISODatetime = (date: Date) => {
  const y = date.getFullYear().toString().padStart(4, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
};

const NewsLeftPanel = ({ isPublishing }: { isPublishing?: boolean }) => {
  const now = new Date();
  const min = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <Stack w="full" gap="3">
      <NewsField label="Заголовок новости" required>
        <NewsInputWrapper>
          <Input name="title" required placeholder="Введите текст" />
        </NewsInputWrapper>
      </NewsField>
      <NewsField label="Дата и время публикации">
        <HStack>
          <NewsInputWrapper>
            <Input
              name="datetime"
              w="fit"
              type="datetime-local"
              min={formatISODatetime(min)}
              defaultValue={formatISODatetime(now)}
            />
          </NewsInputWrapper>
        </HStack>
      </NewsField>
      <NewsField label="Текст новости" required>
        <NewsInputWrapper>
          <Textarea
            name="text"
            placeholder="Введите текст"
            rows={10}
            resize="none"
          />
        </NewsInputWrapper>
      </NewsField>
      <Button
        type="submit"
        w="fit"
        variant="solid"
        mt="2"
        disabled={isPublishing}
      >
        Опубликовать новость
      </Button>
    </Stack>
  );
};

const NewsDropzone = ({ onDrop }: { onDrop: DropzoneOptions["onDrop"] }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Fixes weird size prop types mismatch.
  const inputProps = { ...getInputProps(), size: undefined };

  return (
    <Box
      borderWidth={2}
      borderRadius="2"
      borderColor="blue.2"
      borderStyle="dashed"
      w="full"
      overflow="hidden"
      {...getRootProps()}
    >
      <Stack
        w="full"
        align="center"
        py="3"
        bg="gray.5"
        userSelect="none"
        cursor="pointer"
        color="blue.2"
      >
        <Icon w="9" height="9">
          {isDragActive ? <LuArrowBigDownDash /> : <LuCloudUpload />}
        </Icon>
        <Input {...inputProps} accept={ACCEPT_IMAGES.join(",")} />
        <Text>
          <Mark fontWeight="bold">Выберите</Mark> или переместите файлы для
          загрузки
        </Text>
        <Text fontSize="sm">Максимальный размер — 10 МБ</Text>
      </Stack>
    </Box>
  );
};

const fileToDataURL = async (f: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(
        typeof reader.result === "string" ? "data:" + reader.result : null,
      );
    reader.readAsDataURL(f);
  });
};

const NewsRightPanel = ({
  imgs,
  setImgs,
}: {
  imgs: string[];
  setImgs: Dispatch<SetStateAction<string[]>>;
}) => {
  const onDrop = useCallback(
    async (fs: File[]) => {
      const encoded = await Promise.all(
        fs.filter((f) => f.size <= MAX_IMG_SIZE).map(fileToDataURL),
      );
      setImgs((prev) => [...prev, ...encoded.filter((s) => s !== null)]);
    },
    [setImgs],
  );

  const onRemove = useCallback(
    (i: number) =>
      setImgs((imgs) => [...imgs.slice(0, i), ...imgs.slice(i + 1)]),
    [setImgs],
  );

  return (
    <Stack gap="4">
      <NewsField label="Загрузка медиаматериалов">
        <NewsDropzone onDrop={onDrop} />
      </NewsField>
      <ImgGrid
        gapX="3"
        gapY="2"
        templateRows={
          imgs.length === 0
            ? undefined
            : imgs.length <= 2
              ? "12rem"
              : "12rem 12rem"
        }
        imgs={imgs}
        onRemove={onRemove}
      />
    </Stack>
  );
};

export default function PostNewsForm() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [imgs, setImgs] = useState<string[]>([]);

  return (
    <Page>
      <PageHeading title="Публикация новости">
        <Link to="/feed">
          <Icon h="7" w="7" _hover={{ color: "blue.2" }}>
            <LuX />
          </Icon>
        </Link>
      </PageHeading>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setIsPublishing(true);
          const data = new FormData(e.currentTarget);
          const title = data.get("title")?.toString() ?? "";
          const text = data.get("text")?.toString() ?? "";
          const datetimeStr = data.get("datetime");
          let datetime = new Date();
          if (datetimeStr && typeof datetimeStr === "string") {
            const userDatetime = new Date(datetimeStr);
            if (userDatetime.getTime() > datetime.getTime()) {
              datetime = userDatetime;
            }
          }
          await publishNews(auth, {
            title,
            text,
            datetime:
              datetime.toISOString().slice(0, "yyyy-mm-ddThh:mm".length) +
              ":00Z",
            imgs: imgs,
          }).catch((e) => {
            setIsPublishing(false);
            console.error(e);
          });
          navigate("/feed");
        }}
      >
        <Grid templateColumns="1fr 1fr" gapX="14">
          <NewsLeftPanel isPublishing={isPublishing} />
          <NewsRightPanel imgs={imgs} setImgs={setImgs} />
        </Grid>
      </form>
    </Page>
  );
}
