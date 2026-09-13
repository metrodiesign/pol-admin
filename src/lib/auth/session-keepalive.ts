// ต่ออายุ BFF session เชิงรุกก่อน expiresAt: server ไม่ slide และ refresh รับเฉพาะ ticket ที่ยัง live
// จึงยิง refresh ที่ครึ่งทางของอายุที่เหลือ และเมื่อ tab กลับมา visible หลังเลยกำหนด (browser throttle timer พื้นหลัง)

/** ไม่ยิงถี่กว่านี้แม้ session ใกล้หมด กัน loop เมื่อ server ตอบ expiresAt สั้นผิดปกติ. */
export const MIN_REFRESH_DELAY_MS = 30_000;

/** หน่วงจนถึงครึ่งทางของอายุที่เหลือ (ขั้นต่ำ MIN_REFRESH_DELAY_MS). */
export function refreshDelayMs(expiresAt: string, now: number): number {
  const remaining = Date.parse(expiresAt) - now;
  return Math.max(MIN_REFRESH_DELAY_MS, Math.floor(remaining / 2));
}

export interface SessionKeepaliveDeps {
  /** expiresAt ปัจจุบัน หรือ null = ไม่มี session. */
  getExpiresAt: () => Promise<string | null>;
  /** refresh -> expiresAt ใหม่ หรือ null = ต่ออายุไม่ได้ (หยุด keepalive). */
  refresh: () => Promise<string | null>;
  now?: () => number;
  /** document สำหรับฟัง visibilitychange; ไม่ส่ง = ไม่ฟัง (unit test). */
  doc?: Pick<Document, "addEventListener" | "removeEventListener" | "visibilityState">;
}

/** เริ่ม keepalive คืน stop(). หยุดเองเมื่อ session ไม่มี/ต่อไม่ได้ ปล่อยให้ adminFetch 401 ตัวถัดไปเด้ง /login. */
export function startSessionKeepalive(deps: SessionKeepaliveDeps): () => void {
  const now = deps.now ?? Date.now;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let dueAt = Number.POSITIVE_INFINITY;
  let ticking: Promise<void> | null = null;

  function schedule(expiresAt: string) {
    if (stopped) return;
    const delay = refreshDelayMs(expiresAt, now());
    dueAt = now() + delay;
    timer = setTimeout(tick, delay);
  }

  function tick(): Promise<void> {
    if (stopped) return Promise.resolve();
    clearTimeout(timer);
    dueAt = Number.POSITIVE_INFINITY;
    ticking ??= deps
      .refresh()
      .then((next) => {
        if (next) schedule(next);
        else stop();
      })
      .finally(() => {
        ticking = null;
      });
    return ticking;
  }

  function onVisible() {
    if (deps.doc?.visibilityState === "visible" && now() >= dueAt) void tick();
  }

  function stop() {
    stopped = true;
    clearTimeout(timer);
    deps.doc?.removeEventListener("visibilitychange", onVisible);
  }

  deps.doc?.addEventListener("visibilitychange", onVisible);
  void deps.getExpiresAt().then((expiresAt) => {
    if (expiresAt) schedule(expiresAt);
    else stop();
  });
  return stop;
}
