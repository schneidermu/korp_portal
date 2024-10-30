import { useState } from "react";

import NavBar from "./NavBar";
import Page from "./Page";
import UserInfo from "./UserInfo";
import NewsFeed from "./NewsFeed";
import OrgStruct from "./OrgStruct";

import { User } from "./types";

import { UserContext } from "./userContext";

import _user from "./user.json";
const user = _user as User;

export default function App() {
  const [page, setPage] = useState({
    title: "Общие сведения",
    elem: <UserInfo></UserInfo>,
  });

  return (
    <div className="max-w-[1920px] mx-auto mb-[300px]">
      <UserContext.Provider value={user}>
        <div className="flex flex-col gap-[45px] max-w-[1404px] mx-auto mt-[45px] text-[24px]">
          <NavBar>
            <button
              className="hover:underline"
              onClick={() =>
                setPage({
                  title: "Новости",
                  elem: <NewsFeed></NewsFeed>,
                })
              }
            >
              Рабочий стол
            </button>
            <button
              className="hover:underline"
              onClick={() =>
                setPage({
                  title: "Общие сведения",
                  elem: <UserInfo></UserInfo>,
                })
              }
            >
              Мой профиль
            </button>
            <button
              className="hover:underline"
              onClick={() =>
                setPage({
                  title: "Орг. структура",
                  elem: <OrgStruct></OrgStruct>,
                })
              }
            >
              Орг. структура
            </button>
          </NavBar>
          <Page title={page.title}>{page.elem}</Page>
        </div>
      </UserContext.Provider>
    </div>
  );
}
