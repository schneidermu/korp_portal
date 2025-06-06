import React, { useCallback } from "react";

import {
  Box,
  Show,
  Stack,
  StackProps,
  Tag,
  Wrap,
  Combobox,
  useListCollection,
  useFilter,
  Portal,
} from "@chakra-ui/react";

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
  const { data: skills } = useSkillsCompletion({ minUsage: 7 });

  const onAddSkill = (skill: string) => {
    if (skill === "" || excludeSkills.includes(skill)) {
      return;
    }
    addSkill(skill);
  };

  const { contains } = useFilter({ sensitivity: "base" });

  const { collection, filter } = useListCollection({
    initialItems: skills ?? [],
    itemToString: ({ name }) => name,
    itemToValue: ({ id }) => id.toFixed(),
    isItemDisabled: ({ name }) => excludeSkills.includes(name),
    filter: contains,
  });

  return (
    <Combobox.Root
      openOnClick
      collection={collection}
      onInputValueChange={(e) => filter(e.inputValue)}
    >
      <Combobox.Control>
        <Combobox.Input
          placeholder={placeholder}
          spellCheck
          bg="blue.3"
          borderColor="blue.1"
          borderRadius="small"
          px="3"
          py="1"
          outlineColor="blue.1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAddSkill(e.currentTarget.value);
            }
          }}
        />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>Вводите свой навык</Combobox.Empty>
            {collection.items.map((skill) => (
              <Combobox.Item
                item={skill}
                key={skill.id}
                _hover={{ bg: "blue.2", color: "white", transition: "ease" }}
              >
                {skill.name}
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
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
