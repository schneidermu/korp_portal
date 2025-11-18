import React, { lazy } from "react";

import { Route as Link, Navigate } from "react-router-dom";

import {
  Sax3DcubeOutline,
  Sax3SquareOutline,
  SaxArchiveBookOutline,
  SaxFolderCloudOutline,
  SaxHomeOutline,
  SaxMessageAdd1Outline,
  SaxMessageQuestionOutline,
} from "@meysam213/iconsax-react";

import { GROUP } from "./const";

import NextcloudPage from "@/features/Nextcloud/Nextcloud";

const HomePage = lazy(() => import("@page/home"));
const SegmentsPage = lazy(() => import("@page/segments"));

const UserTreePage = lazy(() => import("@/features/UserTree/UserTree"));
const UserListPage = lazy(() => import("@/features/UserList/UserList"));
const ProfilePage = lazy(() => import("@/features/Profile/Profile"));
const BusinessCardPage = lazy(
  () => import("@/features/BusinessCard/BusinessCardPage"),
);

const NewsFeedPage = lazy(() => import("@page/news/feed"));
const NewsViewPage = lazy(() => import("@page/news/view"));
const NewsCreatePage = lazy(() => import("@page/news/create"));

const PollsDashboardPage = lazy(
  () => import("@/features/Poll/list/PollsDashboardPage"),
);
const FormDashboardPage = lazy(
  () => import("@/features/Poll/form/FormDashboardPage"),
);
const TakePollPage = lazy(
  () => import("@/features/Poll/take/pages/TakePollPage"),
);
const ViewPollPage = lazy(
  () => import("@/features/Poll/take/pages/ViewPollPage"),
);
const CreatePollPage = lazy(
  () => import("@/features/Poll/edit/pages/CreatePollPage"),
);
const EditPollPage = lazy(
  () => import("@/features/Poll/edit/pages/EditPollPage"),
);
const PollStatsPage = lazy(
  () => import("@/features/Poll/take/pages/PollStatsPage"),
);

interface Link {
  link: string;
  route?: {
    path: string;
    element: React.FC;
    groups?: string[];
    chakra?: boolean;
  };
  nav?: {
    matcher: RegExp;
    name: string;
    icon: typeof SaxHomeOutline;
    action?: string;
    // TODO: use groups to restrict actions
    groups?: string[];
  };
  crumb?: {
    matcher: RegExp;
    name: string;
  };
}

type LinkKey =
  | "home"
  | "news"
  | "newsView"
  | "newsCreate"
  | "cloud"
  | "tree"
  | "profile"
  | "businessCard"
  | "users"
  | "polls"
  | "pollTake"
  | "pollView"
  | "pollCreate"
  | "pollEdit"
  | "pollStats"
  | "forms"
  | "formFill"
  | "segments"
  | "404";

// NOTE: order is important (for breadcrumbs)

export const LINK: Record<LinkKey, Link> = {
  home: {
    link: "/",
    route: {
      path: "/",
      element: HomePage,
    },
    nav: {
      matcher: /^\/?$/,
      name: "Домашняя страница",
      icon: SaxHomeOutline,
    },
    crumb: {
      matcher: /^\/?/,
      name: "Главная страница",
    },
  },

  news: {
    link: "/news/feed",
    route: {
      path: "/news/feed",
      element: NewsFeedPage,
    },
    nav: {
      matcher: /^\/news(\/?|\/.*)$/,
      name: "Наша жизнь",
      icon: SaxArchiveBookOutline,
    },
    crumb: {
      matcher: /^\/news(\/?|\/.*)$/,
      name: "Наша жизнь",
    },
  },
  newsView: {
    link: "/news/view",
    route: {
      path: "/news/view/:newsId",
      element: NewsViewPage,
    },
    crumb: {
      matcher: /^\/news\/view\/[1-9][0-9]*$/,
      name: "Новость",
    },
  },
  newsCreate: {
    link: "/news/create",
    route: {
      path: "/news/create",
      element: NewsCreatePage,
      groups: [GROUP.news.create],
    },
    crumb: {
      matcher: /^\/news\/create$/,
      name: "Создание новости",
    },
  },

  tree: {
    link: "/tree",
    route: {
      path: "/tree/:orgId?",
      element: UserTreePage,
      chakra: true,
    },
    nav: {
      matcher: /^\/tree(\/?|\/?[1-9][0-9]*)$/,
      name: "Орг. структура",
      icon: Sax3DcubeOutline,
    },
  },

  profile: {
    link: "/profile",
    route: {
      path: "/profile/:userId?",
      element: ProfilePage,
      chakra: true,
    },
  },
  businessCard: {
    link: "/bc",
    route: {
      path: "/bc/:userId?",
      element: BusinessCardPage,
      chakra: true,
    },
  },
  users: {
    link: "/list",
    route: {
      path: "/list/:orgId?",
      element: UserListPage,
      chakra: true,
    },
  },

  cloud: {
    link: "/nextcloud",
    route: {
      path: "/nextcloud",
      element: NextcloudPage,
      chakra: true,
    },
    nav: {
      matcher: /^\/nextcloud\/?$/,
      name: "Облако",
      icon: SaxFolderCloudOutline,
    },
  },

  polls: {
    link: "/polls/dashboard",
    route: {
      path: "/polls/dashboard",
      element: PollsDashboardPage,
      chakra: true,
    },
    nav: {
      matcher: /^\/polls(\/?|\/.*)$/,
      name: "Опросы",
      icon: SaxMessageQuestionOutline,
      action: "/polls/create",
    },
  },
  pollTake: {
    link: "/polls/take",
    route: {
      path: "/polls/take/:pollId",
      element: TakePollPage,
      chakra: true,
    },
  },
  pollView: {
    link: "/polls/view",
    route: {
      path: "/polls/view/:pollId",
      element: ViewPollPage,
      chakra: true,
    },
  },
  pollCreate: {
    link: "/polls/create",
    route: {
      path: "/polls/create",
      element: CreatePollPage,
      chakra: true,
      groups: [GROUP.poll.create],
    },
  },
  pollEdit: {
    link: "/polls/edit",
    route: {
      path: "/polls/edit/:pollId",
      element: EditPollPage,
      chakra: true,
      groups: [GROUP.poll.create],
    },
  },
  pollStats: {
    link: "/polls/stats",
    route: {
      path: "/polls/stats/:pollId",
      element: PollStatsPage,
      chakra: true,
      groups: [GROUP.poll.create],
    },
  },

  forms: {
    link: "/forms/dashboard",
    route: {
      path: "/forms/dashboard",
      element: FormDashboardPage,
      chakra: true,
    },
    nav: {
      matcher: /^\/forms(\/?|\/.*)$/,
      name: "Заявки",
      icon: SaxMessageAdd1Outline,
    },
  },
  formFill: {
    link: "/forms/fill",
    route: {
      path: "/forms/fill/:pollId",
      element: TakePollPage,
      chakra: true,
    },
  },

  segments: {
    link: "/segments",
    route: {
      path: "/segments",
      element: SegmentsPage,
    },
    nav: {
      matcher: /^\/segments/,
      name: "Сегменты",
      icon: Sax3SquareOutline,
    },
    crumb: {
      matcher: /^\/segments/,
      name: "Сегменты",
    },
  },

  404: {
    link: "/404",
    route: {
      path: "*",
      element: () => <Navigate to="/404" replace />,
    },
  },
};

export const ROUTES = Object.values(LINK).flatMap((l) =>
  l.route ? [{ link: l.link, ...l.route }] : [],
);

export const NAVITEMS = Object.values(LINK).flatMap((l) =>
  l.nav ? [{ link: l.link, ...l.nav }] : [],
);

export const CRUMBS = Object.values(LINK).flatMap((l) =>
  l.crumb ? [{ link: l.link, ...l.crumb }] : [],
);
