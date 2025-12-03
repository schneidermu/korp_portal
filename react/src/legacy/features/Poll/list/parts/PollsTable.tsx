import { ReactNode, useState } from "react";

import { Option as O } from "effect";
import { Link as RRLink, useNavigate } from "react-router-dom";

import {
  Box,
  BoxProps,
  ButtonGroup,
  Flex,
  Grid,
  GridProps,
  HStack,
  Icon,
  IconButton,
  IconButtonProps,
  Pagination,
  Stack,
  StackProps,
} from "@chakra-ui/react";

import {
  LuChartPie,
  LuChevronLeft,
  LuChevronRight,
  LuClipboardCheck,
  LuCloudDownload,
  LuFingerprint,
  LuLink,
  LuSquarePen,
  LuTrash2,
  LuVote,
} from "react-icons/lu";

import { useTokenFetcher } from "@legacy/features/auth/hooks";
import { useAuth } from "@legacy/features/auth/slice";
import { useFetchUser } from "@legacy/features/user/services";
import { Dialog } from "@legacy/shared/comps/Dialog";
import {
  downloadResponse,
  formatDateNumeric,
  fullNameShort,
} from "@legacy/shared/utils";
import { removePoll, useFetchGroups } from "../../api";
import { Poll } from "../../types";
import { useTab } from "../slice";

export const PollsTable = ({
  polls,
  ...rest
}: { polls: Poll[] } & GridProps) => {
  const pageSize = 3;
  const [page, setPage] = useState(1);

  return (
    <Stack gap={7}>
      <Grid
        templateRows={`auto repeat(${pageSize}, 1fr)`}
        autoRows="1fr"
        templateColumns="repeat(7, auto)"
        fontSize="sm"
        gapY={4}
        {...rest}
      >
        <TableHeader />
        {polls.slice(pageSize * (page - 1), pageSize * page).map((poll) => (
          <PollRow key={poll.id} poll={poll} gridColumn="span 7" />
        ))}
      </Grid>
      <Flex justify="end">
        <Pages
          page={page}
          onPageChange={(e) => setPage(e.page)}
          count={polls.length}
          pageSize={pageSize}
        />
      </Flex>
    </Stack>
  );
};

export const Pages = (props: Pagination.RootProps) => {
  return (
    <Pagination.Root {...props}>
      <ButtonGroup variant="ghost" size="sm">
        <Pagination.PrevTrigger asChild>
          <IconButton bg="gray.9" color="gray.10">
            <LuChevronLeft />
          </IconButton>
        </Pagination.PrevTrigger>

        <Pagination.Items
          render={(page) => (
            <IconButton
              variant={{ base: "ghost", _selected: "solid" }}
              bg="gray.9"
              _selected={{ bg: "blue.1" }}
            >
              {page.value}
            </IconButton>
          )}
        />

        <Pagination.NextTrigger asChild>
          <IconButton bg="gray.9" color="gray.10">
            <LuChevronRight />
          </IconButton>
        </Pagination.NextTrigger>
      </ButtonGroup>
    </Pagination.Root>
  );
};

export const TableHeader = () => {
  return (
    <>
      <Column ml={7}>Статус</Column>
      <Column>Наименование опроса</Column>
      <Column>Группа опроса</Column>
      <Column>Автор опроса</Column>
      <Column>Статистика</Column>
      <Column>Дата публикации</Column>
    </>
  );
};

const Column = (props: BoxProps) => {
  return <Box pl={2} pr={4} color="gray.10" gap="2" {...props}></Box>;
};

// const FilterColumn = ({ children, ...rest }: BoxProps) => {
//   return (
//     <Column asChild {...rest}>
//       <HStack>
//         <Icon>
//           <LuFilter />
//         </Icon>
//         {children}
//       </HStack>
//     </Column>
//   );
// };

const PollRow = ({ poll, ...rest }: { poll: Poll } & GridProps) => {
  const tab = useTab();
  const { user } = useFetchUser(O.some(poll.author));

  const link =
    tab === "own" ? `/polls/edit/${poll.id}` : `/polls/take/${poll.id}`;

  const cells: ReactNode[] = [
    <PollStatus status={poll.status} />,
    <RRLink to={link}>{poll.name}</RRLink>,
    poll.groupId === undefined ? undefined : (
      <GroupName groupId={poll.groupId} />
    ),
    user && fullNameShort(user),
    <HStack>
      <Icon color="blue.1">
        <LuClipboardCheck />
      </Icon>
      {poll.takenCount}
    </HStack>,
    poll.publishedAt && formatDateNumeric(new Date(poll.publishedAt)),
  ];

  return (
    <Grid
      templateColumns="subgrid"
      shadow="2px 2px 5px 2px rgba(0, 0, 0, 0.1)"
      alignItems="center"
      justifyItems="stretch"
      px={7}
      py={5}
      {...rest}
    >
      {cells.map((cell, i) => (
        <Flex
          key={i}
          h="full"
          borderColor="gray.8"
          borderRightWidth={1}
          pl={4}
          pr={3}
          align="center"
        >
          {cell}
        </Flex>
      ))}
      <PollRowControls poll={poll} pl={4} pr={3} />
    </Grid>
  );
};

const GroupName = ({ groupId }: { groupId?: number }) => {
  const { data: groups } = useFetchGroups();
  if (groupId === undefined || !groups) return;
  return groups[groupId]?.name;
};

const PollStatus = ({
  status,
  ...rest
}: { status: Poll["status"] } & StackProps) => {
  const icons: { [key in Poll["status"]]: ReactNode } = {
    published: <LuFingerprint color="#5CCFF0" />,
    draft: <LuSquarePen color="#5A3499" />,
    completed: <LuVote color="blue.1" />,
  };
  const text: { [key in Poll["status"]]: string } = {
    published: "Опубликован",
    draft: "Черновик",
    completed: "Завершён",
  };

  return (
    <HStack fontSize="smaller" color="gray.11" {...rest}>
      <Icon w={7} h={7}>
        {icons[status]}
      </Icon>
      {text[status]}
    </HStack>
  );
};

const RowButton = ({ children, ...rest }: IconButtonProps) => {
  return (
    <IconButton
      variant="ghost"
      color="blue.1"
      w={8}
      h={8}
      p={1}
      minW={0}
      {...rest}
    >
      <Icon>{children}</Icon>
    </IconButton>
  );
};

const PollRowControls = ({ poll, ...rest }: { poll: Poll } & StackProps) => {
  const tokenFetch = useTokenFetcher();
  const navigate = useNavigate();

  const buttons = [
    { icon: LuChartPie, onClick: () => navigate(`/polls/stats/${poll.id}`) },
    { icon: LuLink, onClick: () => navigate(`/polls/view/${poll.id}`) },
    {
      icon: LuCloudDownload,
      onClick: async () => {
        const res = await tokenFetch(`/polls/${poll.id}/export/`);
        downloadResponse(res, `Отчет по опросу ${poll.name}.xlsx`);
      },
    },
  ];

  return (
    <HStack gap={4} {...rest}>
      {buttons.map((btn, i) => (
        <IconButton
          key={i}
          onClick={btn.onClick}
          variant="ghost"
          color="blue.1"
          w={8}
          h={8}
          p={1}
          minW={0}
        >
          <btn.icon width="100%" height="100%" />
        </IconButton>
      ))}
      <RemoveButton poll={poll} />
    </HStack>
  );
};

const RemoveButton = ({ poll }: { poll: Poll }) => {
  const [open, setOpen] = useState(false);

  const { token } = useAuth();

  return (
    <Dialog
      title="Удаление опроса"
      body={`Вы действительно хотите удалить опрос "${poll.name}" без возможности восстановления?`}
      actionText="Да, удалить"
      cancelText="Нет"
      onAction={() => removePoll(token, poll.id)}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <RowButton onClick={() => setOpen(true)}>
        <LuTrash2 />
      </RowButton>
    </Dialog>
  );
};
