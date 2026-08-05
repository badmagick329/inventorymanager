'use client';

import { ConnectionError, Spinner } from '@/components';
import useAssistantActivity, {
  AssistantActivityFilters,
} from '@/hooks/useAssistantActivity';
import { AssistantActivityConversation } from '@/types';
import { Button, Card, CardBody, Input, Select, SelectItem } from '@heroui/react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const initialFilters: AssistantActivityFilters = {
  page: 1,
  userId: '',
  locationId: '',
  query: '',
  dateFrom: '',
  dateTo: '',
};

export default function AssistantActivityPage() {
  const [filters, setFilters] = useState(initialFilters);
  const { data, isLoading, isError } = useAssistantActivity(filters);
  const update = (changes: Partial<AssistantActivityFilters>) =>
    setFilters((current) => ({ ...current, ...changes, page: changes.page ?? 1 }));

  if (isLoading && !data) return <Spinner />;
  if (isError || !data) return <ConnectionError />;
  const users = [{ key: 'all', label: 'All users' }, ...data.filterOptions.users.map((user) => ({ key: String(user.id), label: user.username }))];
  const locations = [{ key: 'all', label: 'All schools' }, ...data.filterOptions.locations.map((location) => ({ key: String(location.id), label: location.name }))];

  return (
    <div className='flex w-full flex-col gap-5 p-4'>
      <div>
        <h1 className='text-2xl font-semibold text-foreground'>Assistant activity</h1>
        <p className='text-sm text-muted-foreground'>Questions, replies, failures, usage, and cost.</p>
      </div>
      <Card className='bg-content1'>
        <CardBody className='grid gap-3 md:grid-cols-3'>
          <Input label='Search questions or replies' value={filters.query} onValueChange={(query) => update({ query })} />
          <Select label='User' items={users} selectedKeys={[filters.userId || 'all']} onChange={(event) => update({ userId: event.target.value === 'all' ? '' : event.target.value })}>
            {(user) => <SelectItem key={user.key}>{user.label}</SelectItem>}
          </Select>
          <Select label='School' items={locations} selectedKeys={[filters.locationId || 'all']} onChange={(event) => update({ locationId: event.target.value === 'all' ? '' : event.target.value })}>
            {(location) => <SelectItem key={location.key}>{location.label}</SelectItem>}
          </Select>
          <Input label='From' type='date' value={filters.dateFrom} onValueChange={(dateFrom) => update({ dateFrom })} />
          <Input label='To' type='date' value={filters.dateTo} onValueChange={(dateTo) => update({ dateTo })} />
          <div className='flex items-end'><Button color='default' variant='flat' onPress={() => setFilters(initialFilters)}>Clear filters</Button></div>
        </CardBody>
      </Card>
      <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground'>
        <p>{data.pagination.total} conversations</p>
        <p>Filtered total cost: ${data.summary.totalCostUsd.toFixed(4)}</p>
      </div>
      {data.results.length === 0 ? <p className='text-sm text-muted-foreground'>No assistant activity matches these filters.</p> : data.results.map((conversation) => <Conversation key={conversation.id} conversation={conversation} />)}
      <div className='flex items-center justify-between'>
        <Button color='default' variant='flat' isDisabled={filters.page === 1} onPress={() => update({ page: filters.page - 1 })}>Previous</Button>
        <span className='text-sm text-muted-foreground'>Page {data.pagination.page}</span>
        <Button color='default' variant='flat' isDisabled={!data.pagination.hasNext} onPress={() => update({ page: filters.page + 1 })}>Next</Button>
      </div>
    </div>
  );
}

function Conversation({ conversation }: { conversation: AssistantActivityConversation }) {
  const status = conversation.status === 'completed' ? 'Completed' : conversation.status === 'failed' ? 'Failed' : 'No recorded response';
  return (
    <Card className='bg-content1'>
      <CardBody className='gap-3'>
        <div className='flex flex-wrap justify-between gap-2 text-sm text-foreground'>
          <div><span className='font-semibold'>{conversation.user.username}</span> · {conversation.location?.name ?? 'No school'} · {formatDate(conversation.updatedAt)}</div>
          <div className={conversation.status === 'completed' ? 'text-success' : 'text-danger'}>{status}</div>
        </div>
        <div className='space-y-2'>
          {conversation.messages.map((message) => <section key={message.id} className={message.role === 'user' ? 'rounded-lg bg-message-user p-3 text-message-user-foreground' : 'rounded-lg bg-message-assistant p-3 text-message-assistant-foreground'}>
            <div className='mb-1 text-xs font-semibold uppercase text-muted-foreground'>{message.role} · {formatDate(message.createdAt)}</div>
            {message.errorMessage ? <p className='text-danger'>{message.errorMessage}</p> : message.role === 'assistant' ? <div className='prose prose-sm max-w-none text-message-assistant-foreground dark:prose-invert'><ReactMarkdown>{message.content}</ReactMarkdown></div> : <p className='whitespace-pre-wrap'>{message.content}</p>}
            {message.role === 'assistant' && !message.errorMessage && <p className='mt-2 text-xs text-muted-foreground'>{message.model ?? 'Unknown model'} · {message.usage?.total_tokens ?? 0} tokens · {message.estimatedCostUsd === null ? 'cost unavailable' : `$${message.estimatedCostUsd.toFixed(4)}`}</p>}
          </section>)}
        </div>
        <p className='text-right text-xs text-muted-foreground'>Conversation total: {conversation.totalTokens} tokens · ${conversation.totalCostUsd.toFixed(4)}</p>
      </CardBody>
    </Card>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}
