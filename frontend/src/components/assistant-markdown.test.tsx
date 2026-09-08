import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AssistantMarkdown } from './assistant-chat';

const SAMPLE = [
  '## Debt summary',
  '',
  'FGS has Rs 10 due from Ali.',
  '',
  'Second paragraph with spacing.',
  '',
  '- first item',
  '- second item',
  '',
  '1. ordered one',
  '2. ordered two',
  '',
  '[School ledger](https://example.test/ledger)',
  '',
  '```text',
  'very-long-code-line-'.repeat(10),
  '```',
  '',
  '| Vendor | Due |',
  '| --- | --- |',
  '| Ali | Rs 10 |',
  '| Sara | Rs 20 |',
].join('\n');

function renderedMarkdown(theme: 'light' | 'dark') {
  const view = render(
    <div className={theme === 'dark' ? 'dark' : ''}>
      <AssistantMarkdown text={SAMPLE} />
    </div>
  );
  return view.container;
}

describe.each(['light', 'dark'] as const)('AssistantMarkdown (%s theme)', (theme) => {
  afterEach(() => cleanup());

  it('renders paragraphs, lists, headings, and links with local scroll containment', () => {
    const container = renderedMarkdown(theme);
    const root = container.querySelector('[data-testid="assistant-markdown"]');
    expect(root).not.toBeNull();

    expect(
      within(container as HTMLElement).getByRole('heading', { level: 2, name: 'Debt summary' })
    ).toBeDefined();
    expect(container.querySelectorAll('p').length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll('ul > li').length).toBe(2);
    expect(container.querySelectorAll('ol > li').length).toBe(2);

    const link = container.querySelector('a[href="https://example.test/ledger"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('target')).toBe('_blank');

    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    const preScroller = pre?.parentElement;
    expect(preScroller?.className).toMatch(/overflow-x-auto/);
    expect(preScroller?.className).toMatch(/max-w-full/);
    expect(preScroller && root?.contains(preScroller)).toBe(true);

    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    const tableScroller = table?.parentElement;
    expect(tableScroller?.className).toMatch(/overflow-x-auto/);
    expect(tableScroller?.className).toMatch(/max-w-full/);
    expect(tableScroller && root?.contains(tableScroller)).toBe(true);
    expect(table?.querySelectorAll('th').length).toBeGreaterThanOrEqual(2);
    expect(table?.querySelectorAll('td').length).toBeGreaterThanOrEqual(2);
  });
});
