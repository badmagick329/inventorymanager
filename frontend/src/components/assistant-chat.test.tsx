import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AssistantChat from './assistant-chat';

vi.mock('axios');
const navigation = vi.hoisted(() => ({ pathname: '/app/items/7' }));
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));

describe('AssistantChat request lifecycle', () => {
  beforeEach(() => {
    navigation.pathname = '/app/items/7';
    vi.mocked(axios.get).mockResolvedValue({
      data: { quota: { remaining: 49, limit: 50 } },
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('ignores a previous response after New chat', async () => {
    const encoder = new TextEncoder();
    let streamController: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
      )
    );

    render(<AssistantChat />);
    fireEvent.click(screen.getByLabelText('Open inventory assistant'));
    const input = await screen.findByLabelText('Message');
    fireEvent.change(input, { target: { value: 'Old question' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    fireEvent.click(screen.getByText('New chat'));
    await act(async () => {
      streamController!.enqueue(
        encoder.encode('event: delta\ndata: {"delta":"Stale answer"}\n\n')
      );
      streamController!.close();
    });

    expect(screen.queryByText('Old question')).toBeNull();
    expect(screen.queryByText('Stale answer')).toBeNull();
  });

  it('ignores a response after the active school changes', async () => {
    const encoder = new TextEncoder();
    let streamController: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
      )
    );
    const view = render(<AssistantChat />);
    fireEvent.click(screen.getByLabelText('Open inventory assistant'));
    fireEvent.change(await screen.findByLabelText('Message'), {
      target: { value: 'School seven question' },
    });
    fireEvent.click(screen.getByLabelText('Send message'));
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    navigation.pathname = '/app/items/8';
    view.rerender(<AssistantChat />);
    await act(async () => {
      streamController!.enqueue(
        encoder.encode('event: delta\ndata: {"delta":"Wrong school answer"}\n\n')
      );
      streamController!.close();
    });

    expect(screen.queryByText('School seven question')).toBeNull();
    expect(screen.queryByText('Wrong school answer')).toBeNull();
  });

  it('shows an interruption error and clears the placeholder on empty EOF', async () => {
    let streamController: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
      )
    );

    render(<AssistantChat />);
    fireEvent.click(screen.getByLabelText('Open inventory assistant'));
    fireEvent.change(await screen.findByLabelText('Message'), {
      target: { value: 'Empty stream question' },
    });
    fireEvent.click(screen.getByLabelText('Send message'));
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    await act(async () => {
      streamController!.close();
    });

    await waitFor(() => expect(screen.getByRole('alert')).toBeDefined());
    expect(screen.getByRole('alert').textContent).toMatch(/interrupted/i);
    expect(screen.queryByText('Thinking…')).toBeNull();
    expect(screen.getByText('Empty stream question')).toBeDefined();
  });

  it('removes a partial answer on EOF without completion', async () => {
    const encoder = new TextEncoder();
    let streamController: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
      )
    );

    render(<AssistantChat />);
    fireEvent.click(screen.getByLabelText('Open inventory assistant'));
    fireEvent.change(await screen.findByLabelText('Message'), {
      target: { value: 'Partial stream question' },
    });
    fireEvent.click(screen.getByLabelText('Send message'));
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    await act(async () => {
      streamController!.enqueue(
        encoder.encode('event: delta\ndata: {"delta":"Partial answer"}\n\n')
      );
      streamController!.close();
    });

    await waitFor(() => expect(screen.getByRole('alert')).toBeDefined());
    expect(screen.queryByText('Partial answer')).toBeNull();
    expect(screen.queryByText('Thinking…')).toBeNull();
  });

  it('keeps a completed answer and shows no error', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode('event: delta\ndata: {"delta":"Complete answer"}\n\n')
        );
        controller.enqueue(
          encoder.encode(
            'event: complete\ndata: {"id":9,"usage":null,"estimatedCostUsd":null,"quota":{"remaining":48,"limit":50}}\n\n'
          )
        );
        controller.close();
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
      )
    );

    render(<AssistantChat />);
    fireEvent.click(screen.getByLabelText('Open inventory assistant'));
    fireEvent.change(await screen.findByLabelText('Message'), {
      target: { value: 'Complete stream question' },
    });
    fireEvent.click(screen.getByLabelText('Send message'));

    await waitFor(() => expect(screen.getByText('Complete answer')).toBeDefined());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText('Thinking…')).toBeNull();
  });

  it('replaces streamed text when a replace event arrives', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode('event: delta\ndata: {"delta":"Checking debt now.\\n"}\n\n')
        );
        controller.enqueue(
          encoder.encode('event: replace\ndata: {"text":"FGS has Rs 10 due from Ali."}\n\n')
        );
        controller.enqueue(
          encoder.encode(
            'event: complete\ndata: {"id":9,"usage":null,"estimatedCostUsd":null,"quota":{"remaining":48,"limit":50}}\n\n'
          )
        );
        controller.close();
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
      )
    );

    render(<AssistantChat />);
    fireEvent.click(screen.getByLabelText('Open inventory assistant'));
    fireEvent.change(await screen.findByLabelText('Message'), {
      target: { value: 'Replace stream question' },
    });
    fireEvent.click(screen.getByLabelText('Send message'));

    await waitFor(() => expect(screen.getByText('FGS has Rs 10 due from Ali.')).toBeDefined());
    expect(screen.queryByText('Checking debt now.')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('stays silent when the request is cancelled', async () => {
    const fetchMock = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          (init.signal as AbortSignal)?.addEventListener('abort', () => {
            try {
              controller.error(new DOMException('Aborted', 'AbortError'));
            } catch {
              /* already closed */
            }
          });
        },
      });
      return Promise.resolve(
        new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AssistantChat />);
    fireEvent.click(screen.getByLabelText('Open inventory assistant'));
    fireEvent.change(await screen.findByLabelText('Message'), {
      target: { value: 'Cancelled question' },
    });
    fireEvent.click(screen.getByLabelText('Send message'));
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    fireEvent.click(screen.getByText('New chat'));
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText('Cancelled question')).toBeNull();
    expect(screen.queryByText('Thinking…')).toBeNull();
  });
});
