import React, { useCallback, useMemo } from "react";

import { Option as O } from "effect";

import { UpdateUserFn, User } from "@/features/user/types";

import { ImageGrid, ImgWithCaption } from "../parts/ImageGrid";
import { Subsection, SubsectionProps } from "../parts/Subsection";

export interface CommunitySubsectionProps extends SubsectionProps {
  communityWork: User["communityWork"];
  editing: boolean;
  updateUser: UpdateUserFn;
}

export const CommunitySubsection = React.memo(
  React.forwardRef<HTMLDivElement, CommunitySubsectionProps>(
    function CommunitySubsection(props, ref) {
      const { communityWork, editing, updateUser, ...rest } = props;

      const onChange = useCallback(
        (i: number, img: ImgWithCaption) =>
          updateUser(
            (user) =>
              (user.communityWork[i] = {
                name: img.caption,
                attachment: img.src,
              }),
          ),
        [updateUser],
      );

      const onAdd = useCallback(
        () =>
          updateUser((user) =>
            user.communityWork.push({ name: "", attachment: O.none() }),
          ),
        [updateUser],
      );

      const onRemove = useCallback(
        (i: number) => updateUser((user) => user.communityWork.splice(i, 1)),
        [updateUser],
      );

      const imgs = useMemo(
        () =>
          communityWork.map(({ name, attachment }) => ({
            src: attachment,
            caption: name,
          })),
        [communityWork],
      );

      return (
        <Subsection
          show={editing || communityWork.length > 0}
          ref={ref}
          {...rest}
        >
          <ImageGrid
            editing={editing}
            imgs={imgs}
            onAdd={onAdd}
            onRemove={onRemove}
            onChange={onChange}
          />
        </Subsection>
      );
    },
  ),
);
