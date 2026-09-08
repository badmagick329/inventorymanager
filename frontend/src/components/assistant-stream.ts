export type AssistantEvent = { event: string; data: Record<string, unknown> };

export function parseSseBlock(block: string): AssistantEvent | null {
  const lines = block.replace(/\r/g, '').split('\n');
  const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim();
  const rawData = lines
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n');
  if (!event || !rawData) return null;
  try {
    const data: unknown = JSON.parse(rawData);
    return typeof data === 'object' && data !== null
      ? { event, data: data as Record<string, unknown> }
      : null;
  } catch {
    return null;
  }
}

export class AssistantStreamInterruptedError extends Error {
  constructor() {
    super('The assistant response was interrupted. Please try again.');
    this.name = 'AssistantStreamInterruptedError';
  }
}

const TERMINAL_EVENTS = new Set(['complete', 'error']);

export async function consumeAssistantStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: AssistantEvent) => void
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  let terminal = false;
  const handle = (block: string) => {
    const parsed = parseSseBlock(block);
    if (parsed) {
      if (TERMINAL_EVENTS.has(parsed.event)) terminal = true;
      onEvent(parsed);
    }
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      pending += decoder.decode(value ?? new Uint8Array(), { stream: !done });
      let match = /\r?\n\r?\n/.exec(pending);
      while (match?.index !== undefined) {
        handle(pending.slice(0, match.index));
        pending = pending.slice(match.index + match[0].length);
        match = /\r?\n\r?\n/.exec(pending);
      }
      if (done) break;
    }
    handle(pending);
  } finally {
    reader.releaseLock();
  }
  if (!terminal) {
    throw new AssistantStreamInterruptedError();
  }
}
