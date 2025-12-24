import { Page } from "@legacy/features/App/comps/Page";

import { PollView } from "../parts/PollView";

export default function ViewPollPage() {
  return (
    <Page>
      <PollView action="view" />
    </Page>
  );
}
