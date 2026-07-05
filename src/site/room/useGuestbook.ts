import { useCallback, useEffect, useState } from "react";

export type GuestbookStatus = "idle" | "sending" | "sent" | "queued" | "error";

const QUEUE_KEY = "guestbook-queue";
const API = import.meta.env.VITE_GUESTBOOK_API as string | undefined;

type QueuedMessage = { text: string; from?: string; ts: number };

function readQueue(): QueuedMessage[] {
  try {
    return JSON.parse(window.localStorage.getItem(QUEUE_KEY) ?? "[]") as QueuedMessage[];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedMessage[]) {
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-20)));
}

async function post(message: QueuedMessage): Promise<boolean> {
  if (!API) return false;
  try {
    const res = await fetch(`${API.replace(/\/$/, "")}/api/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: message.text, from: message.from })
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 打字机留言发送：
 * - 配置了 VITE_GUESTBOOK_API → POST 到 Cloudflare Worker
 * - 未配置 / 发送失败 → 暂存 localStorage 待发队列，下次打开自动重寄
 */
export function useGuestbook() {
  const [status, setStatus] = useState<GuestbookStatus>("idle");
  const remote = Boolean(API);

  // 自动重寄本地待发队列
  useEffect(() => {
    if (!API) return;
    const queue = readQueue();
    if (queue.length === 0) return;
    void (async () => {
      const rest: QueuedMessage[] = [];
      for (const message of queue) {
        const ok = await post(message);
        if (!ok) rest.push(message);
      }
      writeQueue(rest);
    })();
  }, []);

  const send = useCallback(async (text: string, from?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return false;

    const message: QueuedMessage = { text: trimmed.slice(0, 500), from: from?.trim().slice(0, 40) || undefined, ts: Date.now() };
    setStatus("sending");

    const ok = await post(message);
    if (ok) {
      setStatus("sent");
      return true;
    }

    writeQueue([...readQueue(), message]);
    setStatus("queued");
    return true;
  }, []);

  const reset = useCallback(() => setStatus("idle"), []);

  return { send, status, reset, remote };
}
