import clsx from "clsx/lite";

import { useFetchOrgs } from "@/features/org/services";

export const OrgPicker = ({
  orgId,
  setOrgId,
}: {
  orgId: number | null;
  setOrgId: (value: string | null) => void;
}) => {
  const { data } = useFetchOrgs();

  if (!data) {
    return;
  }

  return (
    <select
      className={clsx(
        "w-full px-[10px] py-[6px]",
        "border rounded bg-white border-black",
      )}
      value={orgId ?? ""}
      onChange={({ target: { value } }) => setOrgId(value || null)}
    >
      <option key="" value="">
        Все организации
      </option>
      {data.map(({ id, name }) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  );
};
