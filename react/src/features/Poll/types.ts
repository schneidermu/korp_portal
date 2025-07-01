/* Common types */

export type PollStatus = "draft" | "published" | "completed";

/* Raw (API) types */

type QuestionTypeRaw = "single" | "multiple" | "text";

export interface PollRaw {
  id: number;
  name?: string;
  description: string;
  author: string; // email
  poll_group: number | null;
  status: PollStatus;
  organization: number[]; // set
  is_public: boolean;
  is_anonymous: boolean;
  pub_date?: string; // datetime
  completion_date?: string;
  editors: string[]; // UUIDs
  stats_viewers: string[]; // UUIDs
  submission_count: number;
  questions: QuestionRaw[];
}

interface QuestionRaw {
  id: number;
  text: string;
  question_type: QuestionTypeRaw;
  order: number;
  is_required: boolean;
  min_choices?: number;
  max_choices?: number;
  allow_custom_answer: boolean;
  choices: ChoiceRaw[];
  dependency_rule?: DependencyRuleRaw;
}

interface ChoiceRaw {
  id: number;
  choice_text: string; // min 1 symbol
  order: number;
}

interface DependencyRuleRaw {
  id: number;
  trigger_question?: number;
  trigger_choice?: number;
}

export interface PollStatsRaw {
  poll_id: number;
  poll_name: string;
  total_submissions: number;
  question_statistics: QuestionStatsRaw[];
}

interface QuestionStatsRaw {
  question_id: number;
  text: string;
  question_type: QuestionTypeRaw;
  choices_stats: ChoiceStatsRaw[];
  custom_answers_stats?: {
    label: string;
    count: number;
    percentage: number;
    sample_texts: string[];
  };
}

interface ChoiceStatsRaw {
  choice_id: number;
  choice_text: string;
  count: number;
  percentage: number;
}

/* Main types */

export interface Poll {
  id: number;
  name: string;
  description: string;
  author: string; // email
  status: PollStatus;
  groupId?: number;
  publishedAt?: string;
  isPublic: boolean;
  isAnonymous: boolean;
  takenCount: number;
  orgs: number[]; // set
  questions: Question[];
}

export interface Question {
  id: number;
  text: string;
  isMultipleChoice: boolean;
  isRequired: boolean;
  minChoices?: number;
  maxChoices?: number;
  acceptFreeChoice: boolean;
  freeChoice?: string;
  dependencyRule?: DependencyRule;
  choices: Choice[];
}

export interface Choice {
  id: number;
  text: string;
}

export interface DependencyRule {
  id: number;
  questionId: number;
  choiceId?: number;
  freeChoice?: string;
}

export type NewPoll = Omit<
  Poll,
  "id" | "author" | "questions" | "takenCount"
> & {
  questions: { [key: number]: NewQuestion };
};

export type NewQuestion = Omit<Question, "id" | "choices"> & {
  specifyMinMax?: boolean;
  choices: { [key: number]: string };
  cids: number[];
};

export type Answers = {
  [key: number]: { choices: number[]; freeChoice: string; isDirty?: boolean };
};

export interface PollStats {
  submissionsCount: number;
  questions: QuestionStats[];
}

export type QuestionStats = { text: string; votes: number }[];

/* Type conversion */

export const toPoll = (p: PollRaw): Poll => ({
  id: p.id,
  name: p.name ?? "",
  author: p.author,
  description: p.description,
  status: p.status,
  groupId: p.poll_group ?? undefined,
  publishedAt: p.pub_date,
  isPublic: p.is_public,
  isAnonymous: p.is_anonymous,
  takenCount: p.submission_count,
  orgs: p.organization,
  questions: p.questions
    .sort(({ order: x }, { order: y }) => x - y)
    .map(toQuestion),
});

export const toQuestion = (q: QuestionRaw): Question => ({
  id: q.id,
  text: q.text,
  isMultipleChoice: q.question_type === "multiple",
  isRequired: q.is_required,
  minChoices: q.min_choices,
  maxChoices: q.max_choices,
  acceptFreeChoice: q.allow_custom_answer,
  freeChoice: "",
  dependencyRule: toDependencyRule(q.dependency_rule),
  choices: q.choices
    .sort(({ order: x }, { order: y }) => x - y)
    .map((c) => ({
      id: c.id,
      text: c.choice_text,
    })),
});

export const toDependencyRule = (
  d: DependencyRuleRaw | undefined,
): DependencyRule | undefined =>
  !d || d.trigger_question === undefined
    ? undefined
    : {
        id: d.id,
        questionId: d.trigger_question,
        choiceId: d.trigger_choice,
        freeChoice: "", // FIXME
      };

export const toPollStats = (p: PollStatsRaw): PollStats => {
  return {
    submissionsCount: p.total_submissions,
    questions: p.question_statistics.map(toQuestionStats),
  };
};

const toQuestionStats = (q: QuestionStatsRaw): QuestionStats => {
  const choices = q.choices_stats.map((c) => ({
    text: c.choice_text,
    votes: c.count,
  }));

  if (q.custom_answers_stats) {
    choices.push({
      text: q.custom_answers_stats.label,
      votes: q.custom_answers_stats.count,
    });
  }

  return choices;
};
