import { NEXT_FRICTION_EVENTS } from '@/consts/urls';
import { FrictionAction, FrictionError } from '@/types';
import axios from 'axios';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type SubmittedData = Record<string, string | number | boolean | null>;

export type ReportableFailure = {
  frictionEventId: number;
  submittedData: SubmittedData;
};

export default function useFailureReporting({
  action,
  locationId,
  orderId,
}: {
  action: FrictionAction;
  locationId: string;
  orderId?: string;
}) {
  const pathname = usePathname();
  const [failure, setFailure] = useState<ReportableFailure | null>(null);

  function recordFailure(error: unknown, submittedData: SubmittedData) {
    const details = failureDetails(error);
    if (!details) {
      return;
    }
    void axios
      .post(NEXT_FRICTION_EVENTS, {
        action,
        route: pathname,
        location_id: Number(locationId),
        order_id: orderId ? Number(orderId) : null,
        status_code: details.statusCode,
        error: details.error,
      })
      .then(({ data }) => {
        setFailure({ frictionEventId: data.id, submittedData });
      })
      .catch(() => undefined);
  }

  return { failure, recordFailure };
}

function failureDetails(error: unknown): {
  statusCode: number;
  error: FrictionError;
} | null {
  if (
    !axios.isAxiosError(error) ||
    !error.response ||
    error.response.status < 400
  ) {
    return null;
  }
  const body = error.response.data;
  if (body && typeof body === 'object') {
    for (const [field, value] of Object.entries(body)) {
      if (Array.isArray(value) && typeof value[0] === 'string') {
        return {
          statusCode: error.response.status,
          error: { field, message: value[0] },
        };
      }
      if (typeof value === 'string') {
        return {
          statusCode: error.response.status,
          error: { field, message: value },
        };
      }
    }
  }
  return {
    statusCode: error.response.status,
    error: { field: 'form', message: 'The save request failed.' },
  };
}
