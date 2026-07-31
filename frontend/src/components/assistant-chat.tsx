'use client';

import { Bot, CircleHelp, MessageCircle, Plus, Send, X } from 'lucide-react';
import { Button, Textarea, Tooltip } from '@heroui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { usePathname } from 'next/navigation';

type Usage = Record<string, number | null> | null;
type Message = { id: number; role: 'user' | 'assistant'; text: string; usage?: Usage; estimatedCostUsd?: number | null };
type Quota = { remaining: number };
type SavedConversation = { id: number; lastActiveAt: number };
const CHAT_IDLE_TIMEOUT_MS = 8 * 60 * 60 * 1000;

function parseBlock(block: string): { event: string; data: unknown } | null {
  const lines = block.replace(/\r/g, '').split('\n');
  const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim();
  const data = lines.filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n');
  if (!event || !data) return null;
  try { return { event, data: JSON.parse(data) }; } catch { return null; }
}

export default function AssistantChat() {
  const pathname = usePathname();
  const locationId = pathname.match(/^\/app\/(?:items|vendors)\/(\d+)/)?.[1] ?? null;
  const storageKey = locationId ? `inventory-assistant-conversation-${locationId}` : null;
  const [open, setOpen] = useState(false); const [conversationId, setConversationId] = useState<number | null>(null); const [messages, setMessages] = useState<Message[]>([]); const [text, setText] = useState(''); const [remaining, setRemaining] = useState<number | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    if (!open || !locationId || !storageKey) return;
    const saved = localStorage.getItem(storageKey);
    let conversationId: number | null = null;
    try {
      const parsed = saved ? JSON.parse(saved) as SavedConversation : null;
      if (parsed && Date.now() - parsed.lastActiveAt < CHAT_IDLE_TIMEOUT_MS) conversationId = parsed.id;
      else localStorage.removeItem(storageKey);
    } catch { localStorage.removeItem(storageKey); }
    const query = `?location_id=${locationId}${conversationId ? `&conversation_id=${conversationId}` : ''}`;
    axios.get(`/fetch/assistant${query}`).then(({ data }) => {
      setConversationId(data.conversationId);
      setMessages(data.messages || []);
      setRemaining(data.quota.remaining);
      if (!data.conversationId) localStorage.removeItem(storageKey);
    }).catch(() => setRemaining(50));
  }, [locationId, open, storageKey]);
  async function send() {
    if (!text.trim() || busy || remaining === 0) return;
    const message = text.trim(); const userId = Date.now(); const placeholderId = userId + 1;
    setText(''); setBusy(true); setError(''); setMessages((items) => [...items, { id: userId, role: 'user', text: message }, { id: placeholderId, role: 'assistant', text: '' }]);
    try {
      if (!locationId || !storageKey) throw new Error('Open a school first.');
      const response = await fetch('/fetch/assistant/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, conversationId, locationId: Number(locationId) }) });
      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => ({})); throw new Error(body.error || 'The assistant request failed.');
      }
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let pending = '';
      const handle = (block: string) => {
        const parsed = parseBlock(block); if (!parsed || typeof parsed.data !== 'object' || parsed.data === null) return;
        const data = parsed.data as Record<string, unknown>;
        if (parsed.event === 'conversation') { const id = data.conversationId as number; setConversationId(id); if (storageKey) localStorage.setItem(storageKey, JSON.stringify({ id, lastActiveAt: Date.now() })); setRemaining((data.quota as Quota).remaining); }
        if (parsed.event === 'delta' && typeof data.delta === 'string') setMessages((items) => items.map((item) => item.id === placeholderId ? { ...item, text: item.text + data.delta } : item));
        if (parsed.event === 'complete') { setRemaining((data.quota as Quota).remaining); setMessages((items) => items.map((item) => item.id === placeholderId ? { ...item, id: data.id as number, usage: (data.usage as Usage), estimatedCostUsd: data.estimatedCostUsd as number | null } : item)); }
        if (parsed.event === 'error') { setMessages((items) => items.filter((item) => item.id !== placeholderId)); setError(typeof data.error === 'string' ? data.error : 'The assistant request failed.'); if (data.quota) setRemaining((data.quota as Quota).remaining); }
      };
      while (true) { const { value, done } = await reader.read(); pending += decoder.decode(value || new Uint8Array(), { stream: !done }); let boundary; while ((boundary = pending.indexOf('\n\n')) >= 0) { handle(pending.slice(0, boundary)); pending = pending.slice(boundary + 2); } if (done) break; }
      if (pending) handle(pending);
    } catch (caught) { setMessages((items) => items.filter((item) => item.id !== placeholderId)); setError(caught instanceof Error ? caught.message : 'The assistant request failed.'); }
    finally { setBusy(false); }
  }
  function newChat() { if (storageKey) localStorage.removeItem(storageKey); setConversationId(null); setMessages([]); setError(''); }
  const totalCost = messages.reduce((total, item) => total + (item.estimatedCostUsd || 0), 0);
  if (!locationId) return null;
  if (!open) return <Button isIconOnly className='fixed bottom-5 right-5 z-50 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500' onPress={() => setOpen(true)} aria-label='Open financial assistant'><MessageCircle /></Button>;
  return <section className='fixed bottom-4 right-4 z-50 flex h-[min(640px,calc(100vh-2rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-950 text-slate-100 shadow-2xl'><header className='flex items-center justify-between border-b border-slate-800 p-3'><Bot className='text-blue-400' /><div className='flex items-center gap-1'><span className='text-sm text-slate-300'>{remaining === null ? '50 queries available today' : `${remaining} of 50 queries left today`}</span><Tooltip content='Ask about who owes money, vendor debt, unpaid sales, debt by school, profit, margins, or low-profit orders.' placement='bottom'><Button isIconOnly size='sm' variant='light' className='text-slate-300' aria-label='What can I ask?'><CircleHelp size={18} /></Button></Tooltip></div><div className='flex items-center gap-1'><Button size='sm' variant='flat' className='bg-slate-800 text-slate-100 hover:bg-slate-700' startContent={<Plus size={16} />} aria-label='Start a new chat' onPress={newChat}>New chat</Button><Button isIconOnly variant='light' className='text-slate-200' aria-label='Close assistant' onPress={() => setOpen(false)}><X /></Button></div></header><div className='flex-1 space-y-3 overflow-y-auto p-4'>{messages.length === 0 && <p className='text-sm text-slate-400'>Ask about outstanding debt, unpaid sales, or profit.</p>}{messages.map((item) => <div key={item.id} className={item.role === 'user' ? 'ml-8 rounded-lg bg-blue-600 p-3 text-white' : 'mr-8 rounded-lg bg-slate-800 p-3 text-slate-100'}>{item.role === 'assistant' ? <div className='prose prose-invert prose-sm max-w-none'><ReactMarkdown>{item.text || (busy ? 'Thinking…' : '')}</ReactMarkdown></div> : item.text}{item.role === 'assistant' && item.usage && <div className='mt-2 text-xs text-slate-400'>{item.usage.total_tokens ?? 0} tokens{typeof item.estimatedCostUsd !== 'number' ? ' · cost unavailable' : ` · $${item.estimatedCostUsd.toFixed(4)}`}</div>}</div>)}{totalCost > 0 && <p className='text-right text-xs text-slate-400'>Chat total: ${totalCost.toFixed(4)}</p>}{error && <p className='rounded bg-rose-950 p-2 text-sm text-rose-200'>{error}</p>}</div><div className='border-t border-slate-800 p-3'><div className='flex gap-2'><Textarea classNames={{ input: 'text-slate-100 placeholder:text-slate-400', inputWrapper: 'bg-slate-800' }} value={text} onValueChange={setText} onKeyDown={(event) => { if (event.ctrlKey && event.key === 'Enter') { event.preventDefault(); void send(); } }} minRows={2} placeholder='Ask about debt, unpaid sales, or profit…' /><Button isIconOnly className='bg-blue-600 text-white hover:bg-blue-500' isDisabled={busy || !text.trim() || remaining === 0} onPress={send} aria-label='Send message'><Send /></Button></div><p className='mt-2 text-right text-xs text-slate-400'>Ctrl + Enter to send</p></div></section>;
}
