import React, { useCallback, useMemo, useState } from "react";

import { Box, Show, Stack, StackProps, Tag, Wrap } from "@chakra-ui/react";
import {
  AutoComplete,
  AutoCompleteCreatable,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList,
} from "@choc-ui/chakra-autocomplete";

import { UpdateUserFn, User } from "@/features/user/types";
import { useSkillsCompletion } from "@/features/Skills/services";

const Skill = React.memo(function Skill({
  skill,
  editing,
  removeSkill,
  highlight = false,
}: {
  skill: string;
  editing?: boolean;
  removeSkill: (skill: string) => void;
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
      onClick={() => editing && removeSkill(skill)}
    >
      <Tag.Label fontSize="inherit" lineHeight="inherit">
        {skill}
      </Tag.Label>
      <Show when={editing}>
        <Tag.EndElement>
          <Tag.CloseTrigger type="button" onClick={() => removeSkill(skill)} />
        </Tag.EndElement>
      </Show>
    </Tag.Root>
  );
});

const SkillInput = React.memo(function NewSkill({
  addSkill,
  placeholder = "Новый навык",
  excludeSkills,
}: {
  addSkill: (skill: string) => void;
  placeholder?: string;
  excludeSkills: string[];
}) {
  const [skill, setSkill] = useState("");
  const { data: skillsAll } = useSkillsCompletion({ minUsage: 7 });

  const skills = useMemo(
    () => skillsAll?.filter(({ name }) => !excludeSkills.includes(name)),
    [skillsAll, excludeSkills],
  );

  const onAddSkill = (skill: string) => {
    if (skill === "" || excludeSkills.includes(skill)) return false;
    addSkill(skill);
    setSkill("");
    return true;
  };

  return (
    <AutoComplete
      openOnFocus
      creatable
      onSelectOption={({ item }) => onAddSkill(item.value)}
      maxSuggestions={6}
    >
      <AutoCompleteInput
        variant="subtle"
        bg="blue.3"
        borderRadius="small"
        px="3"
        py="1"
        value={skill}
        placeholder={placeholder}
        onChange={({ target }) => setSkill(target.value)}
        onKeyUp={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            onAddSkill(skill);
          }
        }}
      />
      <AutoCompleteList color="black" bg="white" py="2">
        {skills?.map(({ id, name }) => (
          <AutoCompleteItem
            key={id}
            value={name}
            _focus={{ bg: "blue.2", color: "white" }}
          >
            {name}
          </AutoCompleteItem>
        ))}
        <AutoCompleteCreatable />
      </AutoCompleteList>
    </AutoComplete>
  );
});

export interface SkillsProps extends StackProps {
  editing?: boolean;
  placeholder?: string;
  skills: string[];
  setSkills: (updateSkills: (skills: string[]) => string[]) => void;
  highlightSkills?: string[];
}

export const Skills = React.memo(
  React.forwardRef<HTMLDivElement, SkillsProps>(function Skills(props, ref) {
    const {
      editing,
      placeholder,
      skills,
      setSkills,
      highlightSkills,
      ...rest
    } = props;

    const addSkill = useCallback(
      (skill: string) => setSkills((skills) => [...skills, skill]),
      [setSkills],
    );

    const removeSkill = useCallback(
      (skill: string) =>
        setSkills((skills) => skills.filter((s) => s !== skill)),
      [setSkills],
    );

    return (
      <Stack fontSize="md" gap="4" ref={ref} {...rest}>
        <Wrap gapX="4" gapY="2">
          {skills.map((skill) => (
            <Skill
              key={skill}
              skill={skill}
              editing={editing}
              removeSkill={removeSkill}
              highlight={highlightSkills?.some((term) =>
                skill.toLowerCase().includes(term.toLowerCase()),
              )}
            />
          ))}
        </Wrap>
        <Show when={editing}>
          <Box width="60%">
            <SkillInput
              addSkill={addSkill}
              placeholder={placeholder}
              excludeSkills={skills}
            />
          </Box>
        </Show>
      </Stack>
    );
  }),
);

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
  const setSkills = useCallback(
    (updateSkills: (skills: string[]) => string[]) =>
      updateUser((user) => (user.skills = updateSkills(user.skills))),
    [updateUser],
  );

  return (
    <Skills
      editing={editing}
      skills={skills}
      setSkills={setSkills}
      highlightSkills={highlightSkills}
    />
  );
});
