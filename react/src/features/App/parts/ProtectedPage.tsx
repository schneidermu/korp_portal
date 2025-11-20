import { Outlet } from "react-router-dom";

import { useAuth } from "@/features/auth/slice.ts";

import { Page } from "@/features/App/comps/Page.tsx";
import { PageHeading } from "@/features/App/comps/PageHeading.tsx";

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
