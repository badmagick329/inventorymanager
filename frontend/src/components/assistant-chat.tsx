'use client';

import { Bot, CircleHelp, MessageCircle, Plus, Send, X } from 'lucide-react';
import { Button, Textarea, Tooltip } from '@heroui/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePathname } from 'next/navigation';

import { consumeAssistantStream } from './assistant-stream';

export function AssistantMarkdown({ text }: { text: string }) {
  return (
    <div
      data-testid='assistant-markdown'
      className='prose prose-sm max-w-none break-words text-inherit prose-headings:mb-2 prose-headings:mt-4 prose-headings:text-inherit prose-p:my-2 prose-p:text-inherit prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-inherit prose-a:break-all prose-a:text-blue-700 prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:rounded-md prose-pre:bg-slate-900 prose-code:break-words prose-code:whitespace-pre-wrap dark:prose-invert dark:prose-a:text-blue-300 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:whitespace-nowrap [&_th]:bg-slate-100 [&_th]:px-2 [&_th]:py-1.5 [&_td]:px-2 [&_td]:py-1.5 dark:[&_th]:bg-slate-800'
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ node, ...props }) => (
            <div className='max-w-full overflow-x-auto rounded-md'>
              <pre {...props} className='max-w-full overflow-x-auto' />
            </div>
          ),
          table: ({ node, ...props }) => (
            <div className='max-w-full overflow-x-auto'>
              <table {...props} />
            </div>
          ),
          a: ({ node, ...props }) => (
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            <a {...props} target='_blank' rel='noreferrer' />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

type Usage = Record<string, number | null> | null;
type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  usage?: Usage;
  estimatedCostUsd?: number | null;
};
type Quota = { remaining: number; limit?: number };

export default function AssistantChat() {
  const pathname = usePathname();
  const locationId = pathname.match(/^\/app\/(?:items|vendors)\/(\d+)/)?.[1] ?? null;
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [quotaLimit, setQuotaLimit] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef<{ generation: number; controller?: AbortController }>({ generation: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const followOutputRef = useRef(true);

  function cancelRequest() {
    requestRef.current.controller?.abort();
    requestRef.current = { generation: requestRef.current.generation + 1 };
    setBusy(false);
  }

  useEffect(() => {
    cancelRequest();
    setConversationId(null);
    setMessages([]);
    setError('');
    setRemaining(null);
    if (!open || !locationId) return;
    const generation = requestRef.current.generation;
    axios
      .get(`/fetch/assistant?location_id=${locationId}`)
      .then(({ data }) => {
        if (generation !== requestRef.current.generation) return;
        setRemaining(data.quota.remaining);
        setQuotaLimit(data.quota.limit);
      })
      .catch(() => {
        if (generation === requestRef.current.generation) {
          setError('Could not load today\'s assistant quota.');
        }
      });
    return cancelRequest;
  }, [locationId, open]);

  useEffect(() => {
    if (followOutputRef.current) {
      const scroller = scrollRef.current;
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    }
  }, [messages, error, busy]);

  async function send() {
    if (!text.trim() || busy || remaining === 0 || !locationId) return;
    const message = text.trim();
    const userId = Date.now();
    const placeholderId = userId + 1;
    const controller = new AbortController();
    const generation = requestRef.current.generation + 1;
    requestRef.current.controller?.abort();
    requestRef.current = { generation, controller };
    followOutputRef.current = true;
    setText('');
    setBusy(true);
    setError('');
    setMessages((items) => [
      ...items,
      { id: userId, role: 'user', text: message },
      { id: placeholderId, role: 'assistant', text: '' },
    ]);
    const isCurrent = () =>
      requestRef.current.generation === generation && locationId === pathname.match(/^\/app\/(?:items|vendors)\/(\d+)/)?.[1];
    try {
      const response = await fetch('/fetch/assistant/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationId, locationId: Number(locationId) }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'The assistant request failed.');
      }
      await consumeAssistantStream(response.body, ({ event, data }) => {
        if (!isCurrent()) return;
        if (event === 'conversation') {
          setConversationId(data.conversationId as number);
          const quota = data.quota as Quota;
          setRemaining(quota.remaining);
          if (quota.limit) setQuotaLimit(quota.limit);
        } else if (event === 'delta' && typeof data.delta === 'string') {
          setMessages((items) =>
            items.map((item) =>
              item.id === placeholderId ? { ...item, text: item.text + data.delta } : item
            )
          );
        } else if (event === 'replace' && typeof data.text === 'string') {
          setMessages((items) =>
            items.map((item) =>
              item.id === placeholderId ? { ...item, text: data.text as string } : item
            )
          );
        } else if (event === 'complete') {
          const quota = data.quota as Quota;
          setRemaining(quota.remaining);
          if (quota.limit) setQuotaLimit(quota.limit);
          setMessages((items) =>
            items.map((item) =>
              item.id === placeholderId
                ? {
                    ...item,
                    id: data.id as number,
                    usage: data.usage as Usage,
                    estimatedCostUsd: data.estimatedCostUsd as number | null,
                  }
                : item
            )
          );
        } else if (event === 'error') {
          setMessages((items) => items.filter((item) => item.id !== placeholderId));
          setError(
            typeof data.error === 'string' ? data.error : 'The assistant request failed.'
          );
          if (data.quota) setRemaining((data.quota as Quota).remaining);
        }
      });
    } catch (caught) {
      if (isCurrent() && !controller.signal.aborted) {
        setMessages((items) => items.filter((item) => item.id !== placeholderId));
        setError(caught instanceof Error ? caught.message : 'The assistant request failed.');
      }
    } finally {
      if (isCurrent()) {
        requestRef.current = { generation };
        setBusy(false);
      }
    }
  }

  function newChat() {
    cancelRequest();
    setConversationId(null);
    setMessages([]);
    setError('');
    setText('');
    followOutputRef.current = true;
  }

  function closeChat() {
    cancelRequest();
    setOpen(false);
  }

  const totalCost = messages.reduce(
    (total, item) => total + (item.estimatedCostUsd || 0),
    0
  );
  if (!locationId) return null;
  if (!open) {
    return (
      <Button
        isIconOnly
        className='fixed bottom-4 right-4 z-50 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 sm:bottom-5 sm:right-5'
        onPress={() => setOpen(true)}
        aria-label='Open inventory assistant'
      >
        <MessageCircle />
      </Button>
    );
  }

  return (
    <section
      role='dialog'
      aria-modal='false'
      aria-labelledby='assistant-title'
      className='fixed inset-0 z-50 flex min-h-0 min-w-0 flex-col overflow-hidden border border-slate-200 bg-white text-slate-950 shadow-xl dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[min(680px,calc(100dvh-2rem))] sm:w-[min(440px,calc(100vw-2rem))] sm:rounded-lg'
    >
      <header className='shrink-0 border-b border-slate-200 px-3 py-2.5 dark:border-slate-800'>
        <div className='flex items-center gap-2'>
          <Bot size={20} className='shrink-0 text-blue-600 dark:text-blue-400' />
          <div className='min-w-0 flex-1'>
            <h2 id='assistant-title' className='truncate text-sm font-semibold'>
              Inventory assistant
            </h2>
            <p className='truncate text-xs text-slate-500 dark:text-slate-400'>
              {remaining === null
                ? 'Checking today\'s quota…'
                : `${remaining} of ${quotaLimit} questions left today`}
            </p>
          </div>
          <Tooltip
            content='Ask about vendor debt, unpaid sales, profit, margins, or item performance.'
            placement='bottom'
          >
            <Button isIconOnly size='sm' variant='light' aria-label='Assistant help'>
              <CircleHelp size={17} />
            </Button>
          </Tooltip>
          <Button
            size='sm'
            variant='flat'
            className='min-w-0 bg-slate-100 px-2 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
            startContent={<Plus size={15} />}
            onPress={newChat}
          >
            <span className='hidden xs:inline'>New chat</span>
            <span className='xs:hidden'>New</span>
          </Button>
          <Button isIconOnly size='sm' variant='light' aria-label='Close assistant' onPress={closeChat}>
            <X size={19} />
          </Button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className='min-h-0 min-w-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto p-3 sm:p-4'
        onScroll={(event) => {
          const node = event.currentTarget;
          followOutputRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
        }}
        aria-live='polite'
      >
        {messages.length === 0 && !error && (
          <div className='rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'>
            Ask about outstanding debt, unpaid sales, profit, margins, or stock performance.
          </div>
        )}
        {messages.map((item) => (
          <article
            key={item.id}
            className={
              item.role === 'user'
                ? 'ml-8 min-w-0 rounded-md bg-blue-600 px-3 py-2.5 text-sm text-white'
                : 'mr-4 min-w-0 border-l-2 border-blue-500 bg-slate-50 px-3 py-2.5 text-slate-900 dark:bg-slate-900 dark:text-slate-100'
            }
          >
            {item.role === 'assistant' ? (
              item.text ? (
                <AssistantMarkdown text={item.text} />
              ) : (
                <p className='text-sm text-slate-500 dark:text-slate-400'>Thinking…</p>
              )
            ) : (
              <p className='whitespace-pre-wrap break-words'>{item.text}</p>
            )}
            {item.role === 'assistant' && item.usage && (
              <details className='mt-2 text-xs text-slate-500 dark:text-slate-400'>
                <summary className='w-fit cursor-pointer select-none'>Response details</summary>
                <p className='mt-1 tabular-nums'>
                  {item.usage.total_tokens ?? 0} tokens
                  {typeof item.estimatedCostUsd !== 'number'
                    ? ' · cost unavailable'
                    : ` · $${item.estimatedCostUsd.toFixed(4)}`}
                </p>
              </details>
            )}
          </article>
        ))}
        {busy && messages.at(-1)?.role !== 'assistant' && (
          <p className='text-sm text-slate-500 dark:text-slate-400'>Thinking…</p>
        )}
        {error && (
          <div role='alert' className='rounded-md border border-rose-200 bg-rose-50 p-2.5 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200'>
            {error}
          </div>
        )}
      </div>

      <footer className='shrink-0 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950'>
        {remaining === 0 && (
          <p className='mb-2 text-sm text-amber-700 dark:text-amber-300' role='status'>
            Today\'s assistant quota is used. It resets tomorrow.
          </p>
        )}
        <label htmlFor='assistant-message' className='mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300'>
          Message
        </label>
        <div className='flex min-w-0 items-end gap-2'>
          <Textarea
            id='assistant-message'
            autoFocus
            className='min-w-0 flex-1'
            classNames={{
              input: 'text-slate-950 placeholder:text-slate-400 dark:text-slate-100',
              inputWrapper: 'rounded-md border border-slate-300 bg-white shadow-none dark:border-slate-700 dark:bg-slate-900',
            }}
            value={text}
            onValueChange={setText}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                void send();
              }
            }}
            minRows={2}
            maxRows={5}
            placeholder='Ask about debt, sales, profit, or stock…'
            isDisabled={remaining === 0}
          />
          <Button
            isIconOnly
            className='shrink-0 rounded-md bg-blue-600 text-white hover:bg-blue-700'
            isDisabled={busy || !text.trim() || remaining === 0}
            isLoading={busy}
            onPress={send}
            aria-label={busy ? 'Sending message' : 'Send message'}
          >
            {!busy && <Send size={18} />}
          </Button>
        </div>
        <div className='mt-1.5 flex items-start justify-between gap-2 text-xs text-slate-500 dark:text-slate-400'>
          <span>Ctrl or ⌘ + Enter to send</span>
          {totalCost > 0 && (
            <details className='text-right'>
              <summary className='cursor-pointer select-none'>Usage details</summary>
              <p className='mt-1 tabular-nums'>Chat cost ${totalCost.toFixed(4)}</p>
            </details>
          )}
        </div>
      </footer>
    </section>
  );
}
