// import { Icon, Mark } from "@chakra-ui/react";

import { DropzoneOptions, useDropzone } from "react-dropzone";

import { Box, BoxProps, Grid, HStack, Stack, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { ACCEPT_IMAGES, MAX_IMG_SIZE } from "@/app/const";
import { Breadcrumbs } from "@view/Breadcrumbs";
import { Button } from "@view/Button";

import { SaxPaperclip2Linear } from "@meysam213/iconsax-react";
import { css } from "@styled-system/css";
import { LuArrowBigDownDash, LuCloudUpload } from "react-icons/lu";
import { useState } from "react";

const fileToDataURL = async (f: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  });
};

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
  const [imgs, setImgs] = useState<{ name: string; blobURL: string }[]>([]);

  return (
    <styled.form
      className={stack({ gap: 6 })}
      p={6}
      borderRadius="24px" // TODO
      borderWidth="1px"
      borderColor="Grayscale/SpacerLight"
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
          <Input name="title" label="Заголовок новости" />
          {/* <Input name="organization" label="Организация" /> */}
          <Input
            name="datetime"
            label="Дата и время публикации"
            type="datetime-local"
          />
          <Label label="Текст новости">
            <styled.textarea
              name="text"
              p={4}
              borderWidth="1px"
              borderColor="Grayscale/SpacerLight"
              borderRadius="15px"
              w="full"
              fontSize="Body/S"
              rows={6}
            />
          </Label>
        </Stack>
        <Stack gap={5}>
          <Label label="Фотографии">
            <NewsDropzone
              h={64}
              onDrop={async (imgs: File[]) => {
                const encoded = await Promise.all(
                  imgs
                    .filter((img) => img.size <= MAX_IMG_SIZE)
                    .map(async (img) => ({
                      name: img.name,
                      blobURL: (await fileToDataURL(img)) ?? "",
                    })),
                );
                setImgs((prev) => [
                  ...prev,
                  ...encoded.filter((v) => v.blobURL !== ""),
                ]);
              }}
            />
          </Label>
          <Stack gap={3}>
            {imgs.map((img) => (
              <HStack>
                <styled.img
                  objectPosition="center"
                  objectFit="cover"
                  src={img.blobURL}
                  w={10}
                  h={10}
                />
                <styled.span>{img.name}</styled.span>
              </HStack>
            ))}
          </Stack>
        </Stack>
      </Grid>
      <HStack gap={4} justify="end">
        <Button variant="text">Сохранить как черновик</Button>
        <Button type="submit">Опубликовать новость</Button>
      </HStack>
    </styled.form>
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
