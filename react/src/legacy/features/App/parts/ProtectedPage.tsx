import { Outlet } from "react-router-dom";

import { useAuth } from "@api/auth";

import { Page } from "@legacy/features/App/comps/Page";
import { PageHeading } from "@legacy/features/App/comps/PageHeading";

export default function ProtectedPage({ groups }: { groups: string[] }) {
  const auth = useAuth();
  const allowed = groups.some((group) => auth.groups.includes(group));

  if (allowed) return <Outlet />;

  return (
    <Page>
      <PageHeading title="У вас нет доступа к этой странице :(" />
    </Page>
  );
}
