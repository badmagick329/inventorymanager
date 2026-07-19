'use client';

import { NEXT_PROBLEM_REPORTS } from '@/consts/urls';
import { Button } from '@heroui/react';
import axios from 'axios';
import { useState } from 'react';

export default function ReportProblem({
  frictionEventId,
  submittedData,
}: {
  frictionEventId: number;
  submittedData: Record<string, string | number | boolean | null>;
}) {
  const [reported, setReported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (reported) {
    return <span className='text-sm text-success-500'>Problem reported.</span>;
  }

  return (
    <Button
      data-testid='report-problem-button'
      size='sm'
      variant='light'
      color='default'
      isLoading={isSubmitting}
      onPress={async () => {
        setIsSubmitting(true);
        try {
          await axios.post(NEXT_PROBLEM_REPORTS, {
            friction_event_id: frictionEventId,
            submitted_data: submittedData,
          });
          setReported(true);
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      Report a problem
    </Button>
  );
}
