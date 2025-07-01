import { useAppDispatch } from "@/app/store";

import { Tabs } from "@/shared/comps/Tabs";

import { actions, State, useSliceSelector } from "../slice";

export const PollsTabs = () => {
  const tabs: { [key in State["tab"]]: string } = {
    own: "Мои опросы",
    available: "Доступные мне",
  };

  const dispatch = useAppDispatch();
  const tab = useSliceSelector(({ tab }) => tab);

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
