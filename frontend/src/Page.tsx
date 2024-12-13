import clsx from "clsx/lite";
import { ReactNode, useEffect } from "react";
import { useAuth } from "./auth/slice";
import Feed from "./Feed";
import OrgStruct from "./OrgStruct";
import { usePage } from "./page/slice";
import UserProfile from "./UserProfile";
import { useFetchUser } from "./users/api";

function PageProfile({ userId }: { userId: string }) {
  const auth = useAuth();
  const { user } = useFetchUser(userId);

  useEffect(() => {
    if (!user) return;
    const title = auth.userId === userId ? "Мой профиль" : user.firstName;
    document.title = `${title} | КП`;
  }, [user, auth.userId, userId]);

  if (!user) return;

  return <UserProfile userId={userId} />;
}

function PageFeed() {
  useEffect(() => {
    document.title = "Новости | КП";
  }, []);

  return <Feed />;
}

function OrgStructPage({ query }: { query: string[] }) {
  useEffect(() => {
    document.title = "Орг. структура | КП";
  }, []);

  return <OrgStruct initialQuery={query} />;
}

export default function Page() {
  const page = usePage();

  let elem = undefined;
  let title = "";
  switch (page.type) {
    case "profile":
      elem = <PageProfile userId={page.userId} />;
      title = "Основные сведения";
      break;
    case "feed":
      elem = <PageFeed />;
      title = "Новости";
      break;
    case "org_struct":
      elem = <OrgStructPage query={page.query} />;
      title = "Список сотрудников";
      break;
  }

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  if (page.type === "org_struct") {
    return elem;
  }

  return (
    <main
      className={clsx(
        "border-[3px] border-light-gray rounded",
        "shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]",
      )}
    >
      <h2
        className={clsx(
          "flex items-center",
          "mb-[70px] h-[70px] pl-[45px]",
          "bg-light-gray",
          "text-[30px] font-medium",
        )}
      >
        {title}
      </h2>
      {elem}
    </main>
  );
}

export const PageSkel = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <main
      className={clsx(
        "border-[3px] border-light-gray rounded",
        "shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]",
      )}
    >
      <h1
        className={clsx(
          "flex items-center",
          "mb-[70px] h-[70px] pl-[45px]",
          "bg-light-gray",
          "text-[30px] font-medium",
        )}
      >
        {title}
      </h1>
      {children}
    </main>
  );
};
