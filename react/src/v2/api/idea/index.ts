import { tokenFetch } from "@/features/auth/hooks";

import { APIError } from "@api/common/errors";

export const submitIdea = async ({
  token,
  text,
}: {
  token: string;
  text: string;
}) => {
  return tokenFetch(token, "/ideas/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
    }),
  }).then(async (res) => {
    await new Promise((r) => setTimeout(r, 3000));
    if (res.status != 201) {
      throw new APIError("submitting idea", res);
    }
    return res.json();
  });
};
