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

  phaseRef.current = phase;
  completedRef.current = completedFocus;

  const goToPhase = useCallback((next: PomodoroPhase) => {
    setPhase(next);
    setSecondsLeft(DURATIONS[next]);
    setIsRunning(false);
  }, []);

  const advancePhase = useCallback(() => {
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
  }, [goToPhase]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) {
      advancePhase();
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [isRunning, secondsLeft, advancePhase]);

  const toggle = () => setIsRunning((r) => !r);

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(DURATIONS[phase]);
  };

  const skip = () => advancePhase();

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
