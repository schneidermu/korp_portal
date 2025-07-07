import React, { useCallback, useMemo } from "react";

import { Option as O } from "effect";

import { UpdateUserFn, User } from "@/features/user/types";

import { ImageGrid, ImgWithCaption } from "../parts/ImageGrid";
import { Subsection, SubsectionProps } from "../parts/Subsection";

export interface AwardsSubsectionProps extends SubsectionProps {
  awards: User["awards"];
  editing: boolean;
  updateUser: UpdateUserFn;
}

export const AwardsSubsection = React.memo(function AwardsSubsection(
  props: AwardsSubsectionProps,
) {
  const { awards, editing, updateUser, ...rest } = props;

  const onChange = useCallback(
    (i: number, img: ImgWithCaption) =>
      updateUser(
        (user) =>
          (user.awards[i] = {
            name: img.caption,
            attachment: img.src,
          }),
      ),
    [updateUser],
  );

  const onAdd = useCallback(
    () =>
      updateUser((user) =>
        user.awards.push({ name: "", attachment: O.none() }),
      ),
    [updateUser],
  );

  const onRemove = useCallback(
    (i: number) => updateUser((user) => user.awards.splice(i, 1)),
    [updateUser],
  );

  const imgs = useMemo(
    () =>
      awards.map(({ name, attachment }) => ({
        src: attachment,
        caption: name,
      })),
    [awards],
  );

  return (
    <Subsection show={editing || awards.length > 0} {...rest}>
      <ImageGrid
        editing={editing}
        imgs={imgs}
        onAdd={onAdd}
        onRemove={onRemove}
        onChange={onChange}
      />
    </Subsection>
  );
});
