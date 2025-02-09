export interface Task {
  id: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  duration: number;
  status: "TODO" | "IN_PROGRESS" | "DONE";
}
