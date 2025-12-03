import { Page } from "@legacy/features/App/comps/Page";

import { PollView } from "../parts/PollView";

export default function TakePollPage() {
  return (
    <Page>
      <PollView action="take" />
    </Page>
  );
}
