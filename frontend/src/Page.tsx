import clsx from "clsx/lite";
import { usePage } from "./page/slice";
import { useAuth } from "./auth/slice";
import { useFetchUser } from "./users/api";
import UserProfile from "./UserProfile";
import { useEffect } from "react";
import NewsFeed from "./NewsFeed";
import { stableHash } from "swr/_internal";

function PageProfile({ userId }: { userId: string | null }) {
  const auth = useAuth();
  userId ||= auth.userId;
  const { user } = useFetchUser(userId);

  useEffect(() => {
    if (!user) return;
    const title = auth.userId === userId ? "Мой профиль" : user.firstName;
    document.title = `${title} | КП`;
  }, [userId]);

  if (!user) return;

  return <UserProfile userId={userId} />;
}

function PageFeed() {
  useEffect(() => {
    document.title = "Новости | КП";
  }, []);

  return <NewsFeed />;
}

export default function Page() {
  const page = usePage();

  let elem = undefined;
  let title = "";
  switch (page.type) {
    case "profile":
      const userId = (page as any).userId as string | null;
      elem = <PageProfile userId={userId} />;
      title = "Основные сведения";
      break;
    case "feed":
      elem = <PageFeed />;
      title = "Новости";
      break;
  }

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stableHash(page)]);

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
