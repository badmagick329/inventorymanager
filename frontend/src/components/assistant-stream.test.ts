import { describe, expect, it } from 'vitest';

import {
  AssistantStreamInterruptedError,
  consumeAssistantStream,
} from './assistant-stream';

function fragmentedStream(parts: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      parts.forEach((part) => controller.enqueue(encoder.encode(part)));
      controller.close();
    },
  });
}

describe('consumeAssistantStream', () => {
  it('parses events fragmented across chunks and CRLF boundaries', async () => {
    const events: { event: string; data: Record<string, unknown> }[] = [];
    await consumeAssistantStream(
      fragmentedStream([
        'event: conversa',
        'tion\r\ndata: {"conversationId":4}\r',
        '\n\r\nevent: delta\ndata: {"delta":"Hel',
        'lo"}\n\nevent: complete\ndata: {"id":9}',
      ]),
      (event) => events.push(event)
    );

    expect(events).toEqual([
      { event: 'conversation', data: { conversationId: 4 } },
      { event: 'delta', data: { delta: 'Hello' } },
      { event: 'complete', data: { id: 9 } },
    ]);
  });

  it('rejects empty EOF without a terminal event', async () => {
    await expect(consumeAssistantStream(fragmentedStream([]), () => {})).rejects.toBeInstanceOf(
      AssistantStreamInterruptedError
    );
  });

  it('rejects partial-answer EOF without a terminal event', async () => {
    const events: { event: string; data: Record<string, unknown> }[] = [];
    await expect(
      consumeAssistantStream(
        fragmentedStream(['event: delta\ndata: {"delta":"Partial"}\n\n']),
        (event) => events.push(event)
      )
    ).rejects.toBeInstanceOf(AssistantStreamInterruptedError);
    expect(events).toEqual([{ event: 'delta', data: { delta: 'Partial' } }]);
  });

  it('accepts a valid completion', async () => {
    const events: { event: string; data: Record<string, unknown> }[] = [];
    await consumeAssistantStream(
      fragmentedStream([
        'event: delta\ndata: {"delta":"Hello"}\n\n',
        'event: complete\ndata: {"id":9}\n\n',
      ]),
      (event) => events.push(event)
    );
    expect(events).toEqual([
      { event: 'delta', data: { delta: 'Hello' } },
      { event: 'complete', data: { id: 9 } },
    ]);
  });

  it('accepts a server error as terminal', async () => {
    const events: { event: string; data: Record<string, unknown> }[] = [];
    await consumeAssistantStream(
      fragmentedStream(['event: error\ndata: {"error":"failed"}\n\n']),
      (event) => events.push(event)
    );
    expect(events).toEqual([{ event: 'error', data: { error: 'failed' } }]);
  });

  it('lets intentional cancellation propagate without an interruption error', async () => {
    const aborted = new DOMException('Aborted', 'AbortError');
    const body = {
      getReader: () => ({
        read: () => Promise.reject(aborted),
        releaseLock: () => {},
      }),
    } as unknown as ReadableStream<Uint8Array>;
    await expect(consumeAssistantStream(body, () => {})).rejects.toBe(aborted);
  });
});
