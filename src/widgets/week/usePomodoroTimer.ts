"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type PomodoroPhase = "focus" | "shortBreak" | "longBreak";

const DURATIONS: Record<PomodoroPhase, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.stop(ctx.currentTime + 0.4);
    void ctx.close();
  } catch {
    // Audio not available
  }
}

export function usePomodoroTimer() {
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

  const advancePhase = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    clearDeadline();
    playChime();

    if (phaseRef.current === "focus") {
      const next = completedRef.current + 1;
      setCompletedFocus(next);
      const breakPhase = next % 4 === 0 ? "longBreak" : "shortBreak";
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
      advancePhase();
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

  const skip = useCallback(() => advancePhase(), [advancePhase]);

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
