import { useAppDispatch } from "@/app/store";
import { useAuth } from "@/features/auth/slice";

import { Tabs } from "@/shared/comps/Tabs";

import { actions, State, useTab } from "../slice";

export const PollsTabs = () => {
  const tabs: { [key in State["tab"]]: string } = {
    own: "Мои опросы",
    available: "Доступные мне",
  };

  const { groups } = useAuth();
  const dispatch = useAppDispatch();
  const tab = useTab();

  if (!groups.includes("create-poll")) return;

  return (
    <Tabs
      tabs={tabs}
      value={tab}
      onValueChange={(e) =>
        dispatch(actions.tabSwitched(e.value as State["tab"]))
      }
    />
  );
};
