import { Page } from "@legacy/features/App/comps/Page";
import { PageHeading } from "@legacy/features/App/comps/PageHeading";
import { useTokenFetcher } from "@legacy/features/auth/hooks";
import { useAuth } from "@legacy/features/auth/slice";
import { downloadResponse } from "@legacy/shared/utils";
import {
  HStack,
  Icon,
  IconButton,
  IconButtonProps,
  Show,
  Stack,
  StackProps,
  Text,
} from "@chakra-ui/react";
import { LuChartPie, LuCircle, LuCloudDownload, LuLink } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { useFetchPolls } from "../api";
import { Poll } from "../types";
import { Tooltip } from "@legacy/shared/comps/Tooltip";

export default function FormDashboardPage() {
  const { data: forms } = useFetchPolls({ kind: "form" });

  if (!forms) return;

  return (
    <Page>
      <PageHeading title="Заявки" />
      <Stack>
        {forms.map((form) => (
          <FormItem key={form.id} form={form} />
        ))}
      </Stack>
    </Page>
  );
}

const FormItem = ({ form, ...rest }: { form: Poll } & StackProps) => {
  const navigate = useNavigate();
  const { groups } = useAuth();

  return (
    <HStack {...rest}>
      <Icon w={3}>
        <LuCircle />
      </Icon>
      <Text
        fontSize="2xl"
        color="blue.5"
        _hover={{ color: "blue.5", textDecoration: "underline" }}
        asChild
      >
        <Link to={`/forms/fill/${form.id}`}>{form.name}</Link>
      </Text>
      <Tooltip showArrow content="Заполнить форму">
        <RowButton onClick={() => navigate(`/forms/fill/${form.id}`)}>
          <LuLink />
        </RowButton>
      </Tooltip>
      <Show when={groups.includes("create-poll")}>
        <Tooltip showArrow content="Посмотреть результаты">
          <RowButton onClick={() => navigate(`/polls/stats/${form.id}`)}>
            <LuChartPie />
          </RowButton>
        </Tooltip>
        <DownloadButton poll={form} />
      </Show>
    </HStack>
  );
};

const RowButton = ({ children, ...rest }: IconButtonProps) => {
  return (
    <IconButton variant="ghost" color="blue.1" w={6} h={6} minW={0} {...rest}>
      <Icon>{children}</Icon>
    </IconButton>
  );
};

const DownloadButton = ({
  poll,
  ...rest
}: { poll: Poll } & IconButtonProps) => {
  const tokenFetch = useTokenFetcher();

  return (
    <RowButton
      onClick={async () => {
        const res = await tokenFetch(`/polls/${poll.id}/export/`);
        downloadResponse(res, `${poll.name}.xlsx`);
      }}
      {...rest}
    >
      <LuCloudDownload />
    </RowButton>
  );
};
