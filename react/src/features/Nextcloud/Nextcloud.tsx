import { useEffect } from "react";

import { Box } from "@chakra-ui/react";

import { NEXTCLOUD_PREFIX } from "@/app/const";

import { useAuth } from "@/features/auth/slice";

import { NewPage } from "@/features/App/comps/NewPage.tsx";
import { AnimatePage } from "@/features/App/comps/PageSkel";

const useSetNextcloudCookie = () => {
  const { email, token } = useAuth();

  useEffect(() => {
    const authorization = btoa(`${email}:${token}`);
    document.cookie = `nextcloud_authorization=${authorization}; Path=/`;
  }, [email, token]);
};

export const NextcloudPage = () => {
  useSetNextcloudCookie();

  return (
    <NewPage>
      <Box
        borderWidth={1}
        borderColor="gray.1"
        borderRadius="1"
        overflow="hidden"
      >
        <iframe width="100%" height="100%" src={NEXTCLOUD_PREFIX + "/"} />
      </Box>
    </NewPage>
  );
};

export const Nextcloud = () => {
  useSetNextcloudCookie();

  return (
    <AnimatePage>
      <Box
        borderWidth={1}
        borderColor="gray.1"
        borderRadius="1"
        overflow="hidden"
      >
        <iframe width="100%" height="1200px" src={NEXTCLOUD_PREFIX + "/"} />
      </Box>
    </AnimatePage>
  );
};

export const NextcloudStandalone = () => {
  useSetNextcloudCookie();

  useEffect(() => {
    window.location.replace(NEXTCLOUD_PREFIX + "/");
  }, []);

  return <div></div>;
};
