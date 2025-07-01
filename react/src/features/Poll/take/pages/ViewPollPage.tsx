import { Page } from "@/features/App/comps/Page";

import { PollView } from "../parts/PollView";

export default function ViewPollPage() {
  return (
    <Page>
      <PollView action="view" />
    </Page>
  );
}
