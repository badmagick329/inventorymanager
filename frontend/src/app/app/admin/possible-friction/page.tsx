'use client';

import { ConnectionError, Spinner } from '@/components';
import { usePossibleFriction } from '@/hooks';
import { PossibleFrictionSummary, ProblemReport } from '@/types';

export default function PossibleFrictionPage() {
  const { isLoading, isError, data } = usePossibleFriction();

  if (isLoading) {
    return <Spinner />;
  }
  if (isError || !data) {
    return <ConnectionError />;
  }

  return (
    <div className='flex w-full flex-col gap-8 p-4'>
      <h1
        data-testid='possible-friction-title'
        className='text-2xl font-semibold'
      >
        Possible friction
      </h1>
      <section className='flex flex-col gap-3'>
        <h2 className='text-xl font-semibold'>Reported problems</h2>
        {data.reports.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No reported problems.</p>
        ) : (
          data.reports.map((report) => (
            <ReportedProblem key={report.id} report={report} />
          ))
        )}
      </section>
      <section className='flex flex-col gap-3'>
        <h2 className='text-xl font-semibold'>Possible friction</h2>
        {data.summary.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No failed saves in the last 30 days.
          </p>
        ) : (
          data.summary.map((item) => (
            <FrictionSummary
              key={`${item.action}-${item.route}-${item.error.message}`}
              item={item}
            />
          ))
        )}
      </section>
    </div>
  );
}

function ReportedProblem({ report }: { report: ProblemReport }) {
  return (
    <article
      data-testid='reported-problem'
      className='rounded-md border p-3 text-sm'
    >
      <div className='flex flex-wrap justify-between gap-2'>
        <span className='font-semibold'>
          {formatAction(report.friction_event.action)}
        </span>
        <span>{formatDate(report.created_at)}</span>
      </div>
      <p>
        {report.user} · {report.friction_event.route}
      </p>
      <p className='text-danger-500'>{report.friction_event.error.message}</p>
      <p>
        Location: {report.friction_event.location_id ?? '—'} · Order:{' '}
        {report.friction_event.order_id ?? '—'}
      </p>
      <dl className='mt-2 grid grid-cols-2 gap-x-4 gap-y-1'>
        {Object.entries(report.submitted_data).map(([key, value]) => (
          <div key={key}>
            <dt className='inline text-muted-foreground'>{key}: </dt>
            <dd className='inline'>{value ?? '—'}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function FrictionSummary({ item }: { item: PossibleFrictionSummary }) {
  return (
    <article
      data-testid='friction-summary'
      className='rounded-md border p-3 text-sm'
    >
      <div className='flex flex-wrap justify-between gap-2'>
        <span className='font-semibold'>{formatAction(item.action)}</span>
        <span>{item.failure_count} failed saves</span>
      </div>
      <p>{item.route}</p>
      <p className='text-danger-500'>{item.error.message}</p>
      <p>
        {item.affected_user_count} affected users · Last:{' '}
        {formatDate(item.last_occurred)}
      </p>
    </article>
  );
}

function formatAction(action: string) {
  return action.replace('_', ' ');
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}
