import { useCallback, useState } from "react";

import { Box, Button, Flex, Input } from "@chakra-ui/react";
import { Outlet, useNavigate } from "react-router-dom";

import { useAppDispatch } from "@/app/store";
import { Credentials, useLogin } from "@/features/auth/services";
import { authSlice } from "@/features/auth/slice";

const useStorage = (key: string) => {
  const [data, setData] = useState(localStorage.getItem(key));

  const setStorageData = useCallback(
    (data: string) => {
      localStorage.setItem(key, data);
      setData(data);
    },
    [key],
  );

  return [data, setStorageData] as const;
};

const LoginForm = ({ onLogin }: { onLogin: (cred: Credentials) => void }) => {
  const [cred, setCred] = useState({ email: "", password: "" });

  return (
    <Flex w="full" h="400px" justify="center" align="center">
      <Box
        borderWidth={1}
        borderColor="gray.1"
        borderRadius="1"
        p="4"
        w="250px"
      >
        <form onSubmit={() => onLogin(cred)}>
          <Input
            placeholder="Email"
            type="email"
            p="1"
            value={cred.email}
            onChange={({ target }) => setCred({ ...cred, email: target.value })}
          />
          <Input
            placeholder="Password"
            type="password"
            p="1"
            value={cred.password}
            onChange={({ target }) =>
              setCred({ ...cred, password: target.value })
            }
          />
          <Button type="submit">Log in</Button>
        </form>
      </Box>
    </Flex>
  );
};

export default function AuthLoader() {
  const dispatch = useAppDispatch();

  const embed = import.meta.env.VITE_LIFERAY_EMBED === "true";

  const [data, setData] = useStorage("credentials_unsafe");
  const credentials = embed || !data ? undefined : JSON.parse(data);

  const auth = useLogin(credentials);
  const navigate = useNavigate();

  if (auth.isLoggedIn) {
    if (!embed && !import.meta.env.VITE_EMAIL) {
      return (
        <div>
          <Outlet />
          <Button
            position="fixed"
            top="4"
            left="4"
            onClick={() => {
              setData("");
              dispatch(authSlice.actions.logout());
              navigate("/");
            }}
          >
            Log out
          </Button>
        </div>
      );
    }
    return <Outlet />;
  }

  if (embed) return;
  return <LoginForm onLogin={(cred) => setData(JSON.stringify(cred))} />;
};
