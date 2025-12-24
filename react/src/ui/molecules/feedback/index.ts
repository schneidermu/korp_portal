export { Modal, type ModalProps } from "./Modal";

import {
  PromptAction,
  PromptCoverDelete,
  PromptModal,
  PromptRoot,
  PromptTrigger,
} from "./Prompt";

export const Prompt = {
  Root: PromptRoot,
  Modal: PromptModal,
  Trigger: PromptTrigger,
  Action: PromptAction,
  CoverDelete: PromptCoverDelete,
};
