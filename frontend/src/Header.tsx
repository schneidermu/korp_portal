import orgEmblem from "/org_emblem.png";
import orgName from "/org_name.png";
import searchIcon from "/search.svg";
import headphonesIcon from "/headphones.svg";

import { User } from "./types";

export default function Header({ user }: { user: User }) {
  return (
    <header className="sticky top-0 flex items-center h-[100px] bg-blue">
      <a href="/" className="ml-[37px]">
        <img src={orgEmblem} alt="org emblem" className="h-[64px]" />
      </a>
      <a href="/" className="ml-[12px]">
        <img src={orgName} alt="org name" className="w-[175px]" />
      </a>

      <div className="grow"></div>

      <div className="flex items-bottom border-[3px] h-[39px] w-[39px] border-white rounded-full">
        <img
          src={headphonesIcon}
          alt="headphones"
          className="mx-auto w-[26px]"
        />
      </div>
      <a href="/" className="ml-[11px] min-w-[160px] text-white">
        <div>{user.lastName}</div>
        <div className="font-extralight">
          {user.firstName} {user.patronym}
        </div>
      </a>
      <button className="mr-[63px]">
        <img src={searchIcon} alt="search" className="w-[49px]" />
      </button>
    </header>
  );
}
