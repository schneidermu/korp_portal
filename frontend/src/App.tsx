import NavBar from "./NavBar";
import Page from "./Page";

import { useLogin } from "./auth/login";
import { useAuth } from "./auth/slice";

export default function App() {
  useLogin();

  const auth = useAuth();
  if (!auth.isLoggedIn) return <div>Loading...</div>;

  return (
    <div className="max-w-[1920px] mx-auto mb-[300px]">
      <div className="flex flex-col gap-[45px] max-w-[1404px] mx-auto mt-[45px] text-[24px]">
        <NavBar></NavBar>
        <Page></Page>
      </div>
    </div>
  );
}
