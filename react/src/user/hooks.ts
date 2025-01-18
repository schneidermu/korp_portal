import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

export const useQuery = (baseURL: string, q?: string) => {
  const navigate = useNavigate();

  const [query, setQuery] = useState<string[]>([""]);

  useEffect(() => {
    const query = q ?? "";
    const terms = query.split("+");
    if (terms[0].length > 0) {
      terms.push("");
    }
    setQuery(terms);
  }, [q, baseURL]);

  return {
    query,
    setQuery: (query: string[], reload: boolean) => {
      setQuery(query);
      if (reload) {
        const q = query.slice(0, -1).join("+");
        const path = `${baseURL}/${q}`;
        navigate(path);
      }
    },
  };
};
