export type Role = "user" | "assistant" | "system";
export type Status = "idle" | "executing" | "success" | "warning" | "error";

export interface Message {
  id: string;
  role: Role;
  content: string; // markdown supported
  status: Status;
  startedAt: number;
  finishedAt?: number;
}
