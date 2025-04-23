import { NewPage } from "@/features/App/comps/NewPage.tsx";
import { useAuth } from "@/features/auth/slice";
import { useEffect } from "react";

export const NextcloudPage = () => {
  const { email, token } = useAuth();

  useEffect(() => {
    const authorization = btoa(`${email}:${token}`);
    document.cookie = `nextcloud_authorization=${authorization}; Secure; Path=/`;
  }, [email, token]);

  return (
    <NewPage>
      <iframe width="100%" height="100%" src="/api/kp/nextcloud/" />
    </NewPage>
  );
};
