"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  playTimerFinishedSound,
  primeTimerAudio,
  requestTimerNotificationPermission,
  showTimerFinishedNotification,
} from "./pomodoroAlert";

export type PomodoroPhase = "focus" | "shortBreak" | "longBreak";

const DURATIONS: Record<PomodoroPhase, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

type AdvanceOptions = { playAlert?: boolean };

export function usePomodoroTimerState() {
  const [phase, setPhase] = useState<PomodoroPhase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);

  const phaseRef = useRef(phase);
  const completedRef = useRef(completedFocus);
  const secondsLeftRef = useRef(secondsLeft);
  const endsAtRef = useRef<number | null>(null);
  const advancingRef = useRef(false);

  phaseRef.current = phase;
  completedRef.current = completedFocus;
  secondsLeftRef.current = secondsLeft;

  const clearDeadline = useCallback(() => {
    endsAtRef.current = null;
  }, []);

  const goToPhase = useCallback((next: PomodoroPhase) => {
    clearDeadline();
    advancingRef.current = false;
    setPhase(next);
    setSecondsLeft(DURATIONS[next]);
    setIsRunning(false);
  }, [clearDeadline]);

  const advancePhase = useCallback((options?: AdvanceOptions) => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    clearDeadline();

    const wasFocus = phaseRef.current === "focus";
    const nextCompleted = wasFocus ? completedRef.current + 1 : completedRef.current;
    const breakPhase =
      wasFocus && nextCompleted % 4 === 0 ? "longBreak" : "shortBreak";

    if (options?.playAlert !== false) {
      void playTimerFinishedSound();

      if (wasFocus) {
        showTimerFinishedNotification(
          "Помодоро завершён",
          breakPhase === "longBreak"
            ? "Отличная работа! Длинный перерыв 15 мин"
            : "Перерыв 5 мин",
        );
      } else {
        showTimerFinishedNotification(
          "Перерыв окончен",
          "Время снова фокусироваться",
        );
      }
    }

    if (wasFocus) {
      setCompletedFocus(nextCompleted);
      toast.success(
        breakPhase === "longBreak"
          ? "Отличная работа! Длинный перерыв 15 мин"
          : "Помодоро завершён! Перерыв 5 мин",
      );
      goToPhase(breakPhase);
    } else {
      toast.info("Перерыв окончен — время фокуса");
      goToPhase("focus");
    }
  }, [clearDeadline, goToPhase]);

  const syncFromDeadline = useCallback(() => {
    const endsAt = endsAtRef.current;
    if (endsAt == null) return;

    const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    setSecondsLeft(left);

    if (left <= 0) {
      advancePhase({ playAlert: true });
    }
  }, [advancePhase]);

  useEffect(() => {
    if (!isRunning) return;

    syncFromDeadline();

    const intervalId = window.setInterval(syncFromDeadline, 250);
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        syncFromDeadline();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isRunning, syncFromDeadline]);

  const start = useCallback(() => {
    void primeTimerAudio();
    void requestTimerNotificationPermission();
    endsAtRef.current = Date.now() + secondsLeftRef.current * 1000;
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (endsAtRef.current != null) {
      const left = Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
    }
    clearDeadline();
    setIsRunning(false);
  }, [clearDeadline]);

  const toggle = useCallback(() => {
    if (isRunning) pause();
    else start();
  }, [isRunning, pause, start]);

  const reset = useCallback(() => {
    clearDeadline();
    advancingRef.current = false;
    setIsRunning(false);
    setSecondsLeft(DURATIONS[phaseRef.current]);
  }, [clearDeadline]);

  const skip = useCallback(() => advancePhase({ playAlert: false }), [advancePhase]);

  return {
    phase,
    secondsLeft,
    isRunning,
    completedFocus,
    toggle,
    reset,
    skip,
    goToPhase,
  };
}

export function formatPomodoroTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
