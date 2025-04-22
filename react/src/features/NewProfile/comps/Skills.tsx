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
  highlight = false,
}: {
  skill: string;
  editing?: boolean;
  index: number;
  removeSkill: (i: number) => void;
  highlight?: boolean;
}) {
  return (
    <Tag.Root
      color="blue.1"
      bg={highlight ? "pink.200" : "blue.3"}
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
  placeholder = "Новый навык",
}: {
  addSkill: (skill: string) => void;
  placeholder?: string;
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
          spellCheck
          maxLength={35}
          width="28"
          height="auto"
          outline="none !important"
          value={skill}
          placeholder={placeholder}
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

export const Skills = React.memo(function Skills({
  editing,
  placeholder,
  skills,
  setSkills,
  highlightSkills,
}: {
  editing?: boolean;
  placeholder?: string;
  skills: string[];
  setSkills: (skills: string[]) => void;
  highlightSkills?: string[];
}) {
  const addSkill = useCallback(
    (skill: string) => setSkills([...skills, skill]),
    [skills, setSkills],
  );

  const removeSkill = useCallback(
    (i: number) => setSkills([...skills.slice(0, i), ...skills.slice(i + 1)]),
    [skills, setSkills],
  );

  return (
    <Wrap fontSize="md" gapX="4" gapY="2">
      {skills.map((skill, i) => (
        <Skill
          key={i}
          index={i}
          skill={skill}
          editing={editing}
          removeSkill={removeSkill}
          highlight={highlightSkills?.some((term) =>
            skill.toLowerCase().includes(term.toLowerCase()),
          )}
        />
      ))}
      <Show when={editing}>
        <NewSkill addSkill={addSkill} placeholder={placeholder} />
      </Show>
    </Wrap>
  );
});

export const UserSkills = React.memo(function UserSkills({
  skills,
  editing,
  updateUser,
  highlightSkills,
}: {
  skills: User["skills"];
  editing: boolean;
  updateUser: UpdateUserFn;
  highlightSkills?: string[];
}) {
  const skillsArr = useMemo(
    () => O.getOrNull(skills)?.split(", ") || [],
    [skills],
  );

  const setSkills = useCallback(
    (skills: string[]) =>
      updateUser(
        (user) => (user.skills = O.fromNullable(skills.join(", ") || null)),
      ),
    [updateUser],
  );

  return (
    <Skills
      editing={editing}
      skills={skillsArr}
      setSkills={setSkills}
      highlightSkills={highlightSkills}
    />
  );
});
