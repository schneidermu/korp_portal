import React from "react";

import { Option as O } from "effect";

import { UpdateUserFn, User } from "@/features/user/types";

import { Subsection, SubsectionProps } from "../parts/Subsection";
import { Timeline } from "../parts/Timeline";

export interface TrainingSubsectionProps extends SubsectionProps {
  training: User["training"];
  editing: boolean;
  updateUser: UpdateUserFn;
}

export const TrainingSubsection = React.memo(
  React.forwardRef<HTMLDivElement, TrainingSubsectionProps>(
    function TrainingSubsection(props, ref) {
      const { training, editing, updateUser, ...rest } = props;

      return (
        <Subsection show={editing || training.length > 0} ref={ref} {...rest}>
          <Timeline
            editing={editing}
            cols={["Дата начала", "Дата окончания", "Квалификация"]}
            data={training.map(({ name }) => ["2025", "2025", name])}
            onChange={(col, i, value) => {
              if (col === "Квалификация") {
                updateUser((user) => (user.training[i].name = value));
              }
            }}
            pushRow={() =>
              updateUser((user) =>
                user.training.push({
                  name: "",
                  attachment: O.none(),
                }),
              )
            }
            popRow={() => updateUser((user) => user.training.pop())}
          />
        </Subsection>
      );
    },
  ),
);
