'use client';

import { ConnectionError, Spinner } from '@/components';
import useAssistantActivity, { AssistantActivityFilters } from '@/hooks/useAssistantActivity';
import { AssistantActivityConversation } from '@/types';
import { Button, Input } from '@heroui/react';
import { useState } from 'react';

const initialFilters: AssistantActivityFilters = {
  page: 1, userId: '', locationId: '', query: '', dateFrom: '', dateTo: '',
};

export default function AssistantActivityPage() {
  const [filters, setFilters] = useState(initialFilters);
  const { data, isLoading, isError } = useAssistantActivity(filters);
  const update = (changes: Partial<AssistantActivityFilters>) => setFilters((current) => ({ ...current, ...changes, page: changes.page ?? 1 }));

  if (isLoading && !data) return <Spinner />;
  if (isError || !data) return <ConnectionError />;

  return (
    <div className='flex w-full flex-col gap-5 p-4'>
      <div>
        <h1 className='text-2xl font-semibold'>Assistant activity</h1>
        <p className='text-sm text-muted-foreground'>Questions, replies, failures, usage, and cost.</p>
      </div>
      <section className='grid gap-3 rounded-md border p-3 md:grid-cols-3'>
        <Input label='Search questions or replies' value={filters.query} onValueChange={(query) => update({ query })} />
        <label className='flex flex-col gap-1 text-sm'>User
          <select className='rounded-md border bg-background p-2' value={filters.userId} onChange={(event) => update({ userId: event.target.value })}>
            <option value=''>All users</option>
            {data.filterOptions.users.map((user) => <option key={user.id} value={user.id}>{user.username}</option>)}
          </select>
        </label>
        <label className='flex flex-col gap-1 text-sm'>School
          <select className='rounded-md border bg-background p-2' value={filters.locationId} onChange={(event) => update({ locationId: event.target.value })}>
            <option value=''>All schools</option>
            {data.filterOptions.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
          </select>
        </label>
        <Input label='From' type='date' value={filters.dateFrom} onValueChange={(dateFrom) => update({ dateFrom })} />
        <Input label='To' type='date' value={filters.dateTo} onValueChange={(dateTo) => update({ dateTo })} />
        <div className='flex items-end'><Button variant='flat' onPress={() => setFilters(initialFilters)}>Clear filters</Button></div>
      </section>
      <p className='text-sm text-muted-foreground'>{data.pagination.total} conversations</p>
      {data.results.length === 0 ? <p className='text-sm text-muted-foreground'>No assistant activity matches these filters.</p> : data.results.map((conversation) => <Conversation key={conversation.id} conversation={conversation} />)}
      <div className='flex items-center justify-between'>
        <Button variant='flat' isDisabled={filters.page === 1} onPress={() => update({ page: filters.page - 1 })}>Previous</Button>
        <span className='text-sm'>Page {data.pagination.page}</span>
        <Button variant='flat' isDisabled={!data.pagination.hasNext} onPress={() => update({ page: filters.page + 1 })}>Next</Button>
      </div>
    </div>
  );
}

function Conversation({ conversation }: { conversation: AssistantActivityConversation }) {
  return (
    <article className='rounded-md border p-4'>
      <div className='mb-3 flex flex-wrap justify-between gap-2 text-sm'>
        <div><span className='font-semibold'>{conversation.user.username}</span> · {conversation.location?.name ?? 'No school'} · {formatDate(conversation.updatedAt)}</div>
        <div className={conversation.status === 'completed' ? 'text-success-600' : 'text-danger-500'}>{conversation.status === 'completed' ? 'Completed' : 'No response recorded'}</div>
      </div>
      <div className='space-y-2'>
        {conversation.messages.map((message) => <div key={message.id} className={message.role === 'user' ? 'rounded bg-blue-50 p-3 dark:bg-blue-950' : 'rounded bg-default-100 p-3'}>
          <div className='mb-1 text-xs font-semibold uppercase text-muted-foreground'>{message.role}</div>
          <p className='whitespace-pre-wrap'>{message.content}</p>
          {message.role === 'assistant' && <p className='mt-2 text-xs text-muted-foreground'>{message.model ?? 'Unknown model'} · {message.usage?.total_tokens ?? 0} tokens · {message.estimatedCostUsd === null ? 'cost unavailable' : `$${message.estimatedCostUsd.toFixed(4)}`}</p>}
        </div>)}
      </div>
      <p className='mt-3 text-right text-xs text-muted-foreground'>Conversation total: {conversation.totalTokens} tokens · ${conversation.totalCostUsd.toFixed(4)}</p>
    </article>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}
