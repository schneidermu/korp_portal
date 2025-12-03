export interface SkillCompletionRaw {
  id: number;
  name: string;
  is_important: boolean;
  characteristic_count: number;
}

export interface SkillCompletion {
  id: number;
  name: string;
  usage: number;
  isImportant: boolean;
}
