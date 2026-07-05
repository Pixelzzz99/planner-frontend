/** Звук и системные уведомления по окончании Pomodoro-таймера. */

let audioCtx: AudioContext | null = null;

export async function primeTimerAudio(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    audioCtx ??= new AudioContext();
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
  } catch {
    // Audio API недоступен
  }
}

function scheduleBeep(
  ctx: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  volume = 0.18,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

/** Три восходящих сигнала — как классический таймер. */
export async function playTimerFinishedSound(): Promise<void> {
  try {
    await primeTimerAudio();
    if (!audioCtx) return;

    const t = audioCtx.currentTime;
    scheduleBeep(audioCtx, 523.25, t, 0.12);
    scheduleBeep(audioCtx, 659.25, t + 0.18, 0.12);
    scheduleBeep(audioCtx, 783.99, t + 0.36, 0.45, 0.22);
  } catch {
    // ignore
  }
}

export async function requestTimerNotificationPermission(): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "default") return;

  try {
    await Notification.requestPermission();
  } catch {
    // ignore
  }
}

export function showTimerFinishedNotification(title: string, body: string): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return;

  try {
    new Notification(title, { body, tag: "pomodoro-timer" });
  } catch {
    // ignore
  }
}
