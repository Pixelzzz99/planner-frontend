"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePomodoroTimerState } from "./usePomodoroTimer";

type PomodoroContextValue = ReturnType<typeof usePomodoroTimerState>;

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const value = usePomodoroTimerState();

  return (
    <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
  );
}

export function usePomodoroTimer(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    throw new Error("usePomodoroTimer must be used within PomodoroProvider");
  }
  return ctx;
}
