import Header from "./Header";
import NavBar from "./NavBar";
import UserInfo from "./UserInfo";

import { User } from "./types";

import { UserContext } from "./userContext";

import _user from "./user.json";
const user = _user as User;

export default function App() {
  return (
    <div className="max-w-[1920px] mx-auto mb-[300px]">
      <UserContext.Provider value={user}>
        <Header user={user} />
        <main className="flex flex-col gap-[45px] max-w-[1404px] mx-auto mt-[45px] text-[1.5rem]">
          <NavBar>
            <a href="/">Рабочий стол</a>
            <a href="/">Мой профиль</a>
            <a href="/">Орг. структура</a>
          </NavBar>
          <UserInfo></UserInfo>
        </main>
      </UserContext.Provider>
    </div>
  );
}
