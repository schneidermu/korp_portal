import React, { useCallback, useMemo, useState } from "react";

import { IconButton, Input, Show, Tag, Wrap } from "@chakra-ui/react";
import { Option as O } from "effect";

import { UpdateUserFn, User } from "@/features/user/types";

import { LuPlus } from "@/shared/icons/LuPlus";

const Skill = React.memo(function Skill({
  skill,
  editing,
  index,
  removeSkill,
}: {
  skill: string;
  editing?: boolean;
  index: number;
  removeSkill: (i: number) => void;
}) {
  return (
    <Tag.Root
      color="blue.1"
      bg="blue.3"
      borderRadius="small"
      px="3"
      py="1"
      role={editing ? "button" : undefined}
      onClick={() => editing && removeSkill(index)}
    >
      <Tag.Label fontSize="inherit" lineHeight="inherit">
        {skill}
      </Tag.Label>
      <Show when={editing}>
        <Tag.EndElement>
          <Tag.CloseTrigger type="button" onClick={() => removeSkill(index)} />
        </Tag.EndElement>
      </Show>
    </Tag.Root>
  );
});

const NewSkill = React.memo(function NewSkill({
  addSkill,
}: {
  addSkill: (skill: string) => void;
}) {
  const [skill, setSkill] = useState("");

  const onAdd = () => {
    if (skill === "") return;
    addSkill(skill);
    setSkill("");
  };

  return (
    <Tag.Root color="blue.1" bg="blue.3" borderRadius="small" px="3" py="1">
      <Tag.StartElement asChild>
        <IconButton minW="0" onClick={onAdd}>
          <LuPlus />
        </IconButton>
      </Tag.StartElement>
      <Tag.Label fontSize="inherit">
        <Input
          width="28"
          height="auto"
          outline="none"
          value={skill}
          placeholder="Новый навык"
          onChange={({ target }) => setSkill(target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
        />
      </Tag.Label>
    </Tag.Root>
  );
});

export const SkillsSubsection = React.memo(function SkillsSubsection({
  skills,
  editing,
  updateUser,
}: {
  skills: User["skills"];
  editing: boolean;
  updateUser: UpdateUserFn;
}) {
  const skillArr = useMemo(
    () => O.getOrNull(skills)?.split(", ") || [],
    [skills],
  );

  const addSkill = useCallback(
    (skill: string) => {
      updateUser(
        (user) =>
          (user.skills = O.some(
            O.match(user.skills, {
              onNone: () => skill,
              onSome: (skills) => [skills, skill].join(", "),
            }),
          )),
      );
    },
    [updateUser],
  );

  const removeSkill = useCallback(
    (i: number) =>
      updateUser((user) => {
        const s = [...skillArr];
        s.splice(i, 1);
        user.skills = O.fromNullable(s.join(", ") || null);
      }),
    [skillArr, updateUser],
  );

  return (
    <Wrap fontSize="md" gapX="4" gapY="2">
      {skillArr.map((skill, i) => (
        <Skill
          key={i}
          index={i}
          skill={skill}
          editing={editing}
          removeSkill={removeSkill}
        />
      ))}
      <Show when={editing}>
        <NewSkill addSkill={addSkill} />
      </Show>
    </Wrap>
  );
});
