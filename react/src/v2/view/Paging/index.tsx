import * as R from "radashi";

import { BoxProps, Center, HStack, styled } from "@styled-system/jsx";

import { LeftIcon, RightIcon } from "./icons";

type ButtonProps = Parameters<typeof styled.button>[0];

export const Paging = ({
  page,
  pageCount,
  setPage,
  ...rest
}: {
  page: number;
  pageCount: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
} & BoxProps) => {
  const pages =
    pageCount <= 9
      ? R.list(pageCount - 1)
      : [
          ...R.list(pageCount - 7, page - 3),
          ...R.list(page - 2, page + 2),
          ...R.list(page + 3, 6),
        ].filter((p) => 0 <= p && p < pageCount);

  return (
    <Center
      borderTopWidth="1px"
      borderColor="Grayscale/SpacerLight"
      py={6}
      {...rest}
    >
      <HStack gap={1.5} userSelect="none">
        <Control onClick={() => setPage(page - 1)} disabled={page === 0}>
          <LeftIcon />
        </Control>
        {pageCount > 9 && (
          <>
            {page > 2 && <Page page={0} setPage={setPage} currentPage={page} />}
            {page > 3 && <Ellipsis />}
          </>
        )}
        {pages.map((p) => (
          <Page page={p} setPage={setPage} currentPage={page} />
        ))}
        {pageCount > 9 && (
          <>
            {page < pageCount - 4 && <Ellipsis />}
            {page < pageCount - 3 && (
              <Page page={pageCount - 1} setPage={setPage} currentPage={page} />
            )}
          </>
        )}
        <Control
          onClick={() => setPage(page + 1)}
          disabled={page === pageCount - 1}
        >
          <RightIcon />
        </Control>
      </HStack>
    </Center>
  );
};

const Page = ({
  page,
  currentPage,
  setPage,
}: {
  page: number;
  currentPage: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <Control active={page === currentPage} onClick={() => setPage(page)}>
      {page + 1}
    </Control>
  );
};

const Control = ({
  active = false,
  children,
  ...rest
}: { active?: boolean } & ButtonProps) => {
  return (
    <styled.button
      w={8}
      h={8}
      borderRadius="full"
      borderWidth="1px"
      borderColor={{
        base: active ? "Corporate/Accent" : "Grayscale/SpacerLight",
        _hover: "Grayscale/SpacerLight",
      }}
      cursor={{ base: "pointer", _disabled: "default" }}
      color={{
        base: active ? "white" : "Grayscale/Black",
        _disabled: "Grayscale/Disabled",
        _hover: "Grayscale/Black",
      }}
      bg={{
        base: active ? "Corporate/Accent" : undefined,
        _hover: "Grayscale/SpacerLight",
      }}
      {...rest}
    >
      <Center>{children}</Center>
    </styled.button>
  );
};

const Ellipsis = () => {
  return (
    <Center
      borderWidth="1px"
      borderColor="transparent"
      w={8}
      h={8}
      cursor="default"
    >
      …
    </Center>
  );
};
