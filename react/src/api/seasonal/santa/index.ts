import * as v from "valibot";

import useSWR from "swr";

import { tokenFetch, useTokenFetcher } from "@api/auth";
import { APIError } from "@api/common/errors";

import {
  fromParticipant,
  Participant,
  SecretSanta,
  SecretSantaRawSchema,
  toSecretSanta,
} from "./types";

export const useSecretSanta = () => {
  const tokenFetcher = useTokenFetcher();

  return useSWR<SecretSanta>("/seasonal/secret_santa/", async (path: string) =>
    tokenFetcher(path)
      .then((res) => {
        if (res.status !== 200) {
          throw new APIError("getting secret santa data", res);
        }
        return res.json();
      })
      .then((raw) => toSecretSanta(v.parse(SecretSantaRawSchema, raw))),
  );
};

export const updateSecretSanta = async (
  token: string,
  participant: Participant,
  { create = true }: { create?: boolean } = {},
) => {
  const data = fromParticipant(participant);

  return tokenFetch(token, "/seasonal/secret_santa/", {
    method: create ? "POST" : "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((res) => {
    if (create && res.status !== 201) {
      throw new APIError("creating secret santa participant data", res);
    }
    if (!create && res.status !== 200) {
      throw new APIError("updating secret santa participant data", res);
    }
    return res.json();
  });
};

export const deleteSecretSanta = async (token: string) => {
  return tokenFetch(token, "/seasonal/secret_santa/", {
    method: "DELETE",
  }).then((res) => {
    if (res.status !== 204) {
      throw new APIError("deleting secret santa participant data", res);
    }
  });
};
