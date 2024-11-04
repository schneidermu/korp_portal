import { useEffect, useState } from "react";

import NavBar from "./NavBar";
import Page from "./Page";
import UserInfo from "./UserInfo";
import NewsFeed from "./NewsFeed";
import OrgStruct from "./OrgStruct";

import { User } from "./types";

import { UserContext } from "./userContext";

import { getToken, listUsers } from "./api";

const username = "admin";
const password = "admin";

export default function App() {
  const [page, setPage] = useState({
    title: "Общие сведения",
    elem: <UserInfo></UserInfo>,
  });

  const [token, setToken] = useState<undefined | string>();
  const [userList, setUserList] = useState<undefined | Map<string, User>>();
  const [userId, setUserId] = useState<undefined | string>();

  useEffect(() => {
    console.log("effect");
    (async () => {
      try {
        setToken(await getToken(username, password));
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  console.log({ token });

  useEffect(() => {
    if (token === undefined) return;
    (async () => {
      try {
        const list = await listUsers(token);
        setUserList(list);
        for (const [id, user] of list.entries()) {
          if (user.username === username) {
            setUserId(id);
            break;
          }
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, [token]);

  if (userList === undefined || userId === undefined) return;

  console.log(userList);

  return (
    <div className="max-w-[1920px] mx-auto mb-[300px]">
      <UserContext.Provider value={userList.get(userId)!}>
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
