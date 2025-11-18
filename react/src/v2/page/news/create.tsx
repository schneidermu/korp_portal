// import { Icon, Mark } from "@chakra-ui/react";

import { DropzoneOptions, useDropzone } from "react-dropzone";

import { Box, BoxProps, Grid, HStack, Stack, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { ACCEPT_IMAGES } from "@/app/const";
import { Breadcrumbs } from "@view/Breadcrumbs";
import { Button } from "@view/Button";

import { LuArrowBigDownDash, LuCloudUpload } from "react-icons/lu";
import { css } from "@styled-system/css";

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
            <Input name="organization" label="Организация" />
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
                rows={4}
              />
            </Label>
          </Stack>
          <Stack gap={5}>
            <Label label="Фотографии">
              <NewsDropzone h={64} onDrop={() => {}} />
            </Label>
            <Stack gap={3}>файлы</Stack>
          </Stack>
        </Grid>
        <HStack gap={4} justify="end">
          <Button variant="text">Сохранить как черновик</Button>
          <Button type="submit">Опубликовать новость</Button>
        </HStack>
      </styled.form>
    </Stack>
  );
}

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
}: { onDrop: DropzoneOptions["onDrop"] } & BoxProps) => {
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
      overflow="hidden"
      {...rest}
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
        <Box>
          <styled.span fontWeight="bold">Выберите</styled.span> или переместите
          файлы для загрузки
        </Box>
        <Box fontSize="sm">Максимальный размер — 10 МБ</Box>
      </Stack>
    </Box>
  );
};
