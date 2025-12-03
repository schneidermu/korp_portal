import { ruOnNum } from "@legacy/shared/utils/lang.ts";

import { Poll, Question } from "./types.ts";

export const choiceCountNoticeText = (q: Question): string | undefined => {
  if (!q.isMultipleChoice) return;

  const minChoices =
    q.minChoices !== undefined &&
    q.minChoices > 1 &&
    q.minChoices < q.choices.length
      ? q.minChoices
      : undefined;

  const maxChoices =
    q.maxChoices !== undefined &&
    q.maxChoices > 1 &&
    q.maxChoices < q.choices.length
      ? q.maxChoices
      : undefined;

  if (minChoices && minChoices === maxChoices) {
    return ruOnNum(minChoices, {
      one: `Выберите ровно ${minChoices} вариант ответа`,
      x234: `Выберите ровно ${minChoices} варианта ответа`,
      other: `Выберите ровно ${minChoices} вариантов ответа`,
    });
  }

  if (minChoices && maxChoices) {
    return ruOnNum(maxChoices, {
      one: `Выберите от ${minChoices} до ${maxChoices} варианта ответа`,
      other: `Выберите от ${minChoices} до ${maxChoices} вариантов ответа`,
    });
  }

  if (maxChoices) {
    return ruOnNum(maxChoices, {
      one: `Выберите до ${maxChoices} варианта ответа`,
      other: `Выберите до ${maxChoices} вариантов ответа`,
    });
  }

  if (minChoices) {
    return ruOnNum(minChoices, {
      one: `Выберите от ${minChoices} варианта ответа`,
      other: `Выберите от ${minChoices} вариантов ответа`,
    });
  }
};

export const validateQuestion = (
  q: Question,
  choices: number[],
  freeChoice: string,
): string => {
  if (!q.isMultipleChoice) {
    if (freeChoice.length === 0 && choices.length === 0 && q.isRequired) {
      if (q.choices.length === 0) {
        return "Не вписан ответ";
      } else {
        return "Не выбран ни один вариант ответа";
      }
    }
    return "";
  }
  const n = choices.length + Number(freeChoice.length > 0);
  const m = q.choices.length + Number(q.acceptFreeChoice);
  if (q.minChoices && q.minChoices > 1 && n < q.minChoices) {
    return ruOnNum(q.minChoices, {
      one: `Выбрано меньше ${q.minChoices} варианта ответа`,
      other: `Выбрано меньше ${q.minChoices} вариантов ответа`,
    });
  }
  if (q.maxChoices && q.maxChoices <= m && n > q.maxChoices) {
    return ruOnNum(q.maxChoices, {
      one: `Выбрано больше ${q.maxChoices} варианта ответа`,
      other: `Выбрано больше ${q.maxChoices} вариантов ответа`,
    });
  }
  return "";
};

export const questionIsShown = (poll: Poll, qid: number) => {
  const rule = poll.questions.find(({ id }) => id === qid)?.dependencyRule;
  if (rule?.choiceId === undefined) return true;

  const choices = poll.questions[rule.questionId].choices;
  return choices.findIndex(({ id }) => id === rule.choiceId) >= 0;
};
