import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ReportProblem from './report-problem';

vi.mock('axios');

describe('ReportProblem', () => {
  beforeEach(() => {
    vi.mocked(axios.post).mockResolvedValue({ data: { id: 1 } });
  });

  it('submits the linked event and shows confirmation', async () => {
    render(
      <ReportProblem
        frictionEventId={12}
        submittedData={{ vendor: 'Test Vendor', quantity: 5 }}
      />
    );

    fireEvent.click(screen.getByTestId('report-problem-button'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/fetch/feedback/reports', {
        friction_event_id: 12,
        submitted_data: { vendor: 'Test Vendor', quantity: 5 },
      });
    });
    expect(await screen.findByText('Problem reported.')).toBeTruthy();
  });
});
