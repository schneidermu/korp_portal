import { SWRConfiguration } from "swr";

export const swrConfig: SWRConfiguration = {
  keepPreviousData: true,
  revalidateOnFocus: false,
  revalidateIfStale: false,
};
