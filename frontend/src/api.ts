import { User } from "./types";

const API_BASE_URL = "http://localhost:8021/api";

type UserInfo = {
  average_rating: number;
  birth_date: string;
  class_rank: string;
  email: string;
  fio: string;
  id: string;
  job_title: string;
  organization: string;
  status: string;
  structural_division: string;
  supervizor: { id: string }[];
  team: { id: string }[];
  telephone_number: string;
  username: string;
  characteristic: {
    about: string;
    avatar: string;
    careers: {
      id: number;
      date_start: string;
      date_finish?: string;
      name: string;
    }[];
    competences: {
      id: number;
      name: string;
    }[];
    courses: {
      date: string;
      file: string;
      id: number;
      name: string;
    }[];
    experience: number;
    rewards: {
      file: string;
      id: number;
      name: string;
    }[];
    trainings: {
      file: string;
      id: number;
      name: string;
    }[];
    universitys: {
      date: string;
      file: string;
      id: number;
      name: string;
    }[];
  };
};

export async function getToken(
  username: string,
  password: string,
): Promise<string> {
  const res = await fetch(API_BASE_URL + "/auth/token/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status != 200) {
    console.log(res);
  }
  return (await res.json()).auth_token;
}

function urlBasename(url: string): string {
  const parts = decodeURI(url).split("/");
  return parts[parts.length - 1];
}

export async function listUsers(token: string): Promise<Map<string, User>> {
  const res = await fetch(API_BASE_URL + "/colleagues/", {
    headers: {
      Authorization: "Token " + token,
    },
  });
  const userInfo: UserInfo[] = await res.json();
  console.log(userInfo);
  const map = new Map<string, User>(
    userInfo.map((info) => {
      const [lastName, firstName, patronym] = info.fio.split(" ");
      let user: User = {
        username: info.username,
        lastName,
        firstName,
        patronym,
        email: info.email,
        status: info.status,
        dateOfBirth: info.birth_date,
        phone: info.telephone_number,
        position: info.job_title,
        serviceRank: info.class_rank,
        structuralUnit: info.structural_division,
        territorialBody: "N/A",
        about: "",
        skills: "",
        career: [],
        workExperience: "",
        professionalDevelopments: [],
        photoURL: "",
        higherEducation: [],
        courses: [],
        communityWork: [],
        awards: [],
        colleagues: [],
        bosses: [],
      };
      const char = info.characteristic;
      if (!char) {
        return [info.id, user];
      }
      user = {
        ...user,
        about: char.about,
        skills: char.competences[0]?.name || "",
        career: char.careers.map((career) => {
          const d1 = career.date_start.slice(0, 4);
          const d2 = career.date_finish?.slice(0, 4) || "н. вр.";
          return {
            period: `${d1} — ${d2}`,
            position: career.name,
          };
        }),
        // TODO: склонения
        workExperience: `${char.experience} лет`,
        professionalDevelopments: char.trainings.map((training) => ({
          name: training.name,
          certificate: urlBasename(training.file),
          certificateURL: training.file,
        })),
        photoURL: char.avatar,
        higherEducation: char.universitys.map((uni) => ({
          year: Number(uni.date.slice(0, 4)),
          university: uni.name,
          major: "N/A",
        })),
        courses: char.courses.map((course) => ({
          year: Number(course.date.slice(0, 4)),
          name: course.name,
          certificate: urlBasename(course.file),
          certificateURL: course.file,
        })),
        awards: char.rewards.map((award) => ({
          title: award.name,
          // TODO
          url: "/",
          pictureURL: award.file,
        })),
      };
      return [info.id, user];
    }),
  );
  return map;
}
