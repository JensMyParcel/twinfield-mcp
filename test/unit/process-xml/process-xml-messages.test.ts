import { describe, expect, it } from 'vitest';

import { OperationEffect } from '../../../src/catalog/catalog-types.js';
import { DocumentationLibrary } from '../../../src/docs/documentation-library.js';
import {
  DIMENSION_PAGES,
  TRANSACTION_PAGES,
} from '../../../src/process-xml/documentation-pages.js';
import { PROCESS_XML_MESSAGES } from '../../../src/process-xml/process-xml-messages.js';
import { WRITE_MESSAGES } from '../../../src/process-xml/write-messages.js';
import { DOCS_DIRECTORY } from '../../support/fake-twinfield.js';

const library = new DocumentationLibrary(DOCS_DIRECTORY);

function message(root: string) {
  return PROCESS_XML_MESSAGES.find((candidate) => candidate.root === root);
}

describe('PROCESS_XML_MESSAGES', () => {
  it('has a unique root for every message', () => {
    const roots = PROCESS_XML_MESSAGES.map((candidate) => candidate.root);

    expect(new Set(roots).size).toBe(roots.length);
  });

  it.each(PROCESS_XML_MESSAGES.map((candidate) => [candidate.root, candidate] as const))(
    'points %s only to documentation pages that exist',
    (_root, candidate) => {
      expect(candidate.documentation.length).toBeGreaterThan(0);
      expect(candidate.documentation.filter((page) => !library.has(page))).toEqual([]);
    },
  );

  it('keeps the shared dimension and transaction page lists on existing pages', () => {
    expect([...DIMENSION_PAGES, ...TRANSACTION_PAGES].filter((page) => !library.has(page))).toEqual(
      [],
    );
  });

  it('has roots that make valid tool names', () => {
    for (const { root } of PROCESS_XML_MESSAGES) {
      expect(`process_xml_${root}`).toMatch(/^[a-z][a-z0-9_]{0,63}$/);
    }
  });

  it.each(['read', 'list'])('gives %s a non-empty enum of unique types', (root) => {
    const types = message(root)?.types ?? [];

    expect(types.length).toBeGreaterThan(0);
    expect(new Set(types).size).toBe(types.length);
  });

  it('gives no other message a type enum', () => {
    const typed = PROCESS_XML_MESSAGES.filter((candidate) => candidate.types !== undefined);

    expect(typed.map((candidate) => candidate.root)).toEqual(['read', 'list']);
  });

  it('lets only list run without a company', () => {
    const optional = PROCESS_XML_MESSAGES.filter((candidate) => candidate.companyOptional === true);

    expect(optional.map((candidate) => candidate.root)).toEqual(['list']);
    expect(message('list')?.types).toContain('offices');
  });

  it('marks every write message destructive, because a write can delete', () => {
    expect(WRITE_MESSAGES.length).toBeGreaterThan(0);
    expect(
      WRITE_MESSAGES.every((candidate) => candidate.effect === OperationEffect.destructive),
    ).toBe(true);
  });

  it('marks every other message as a read', () => {
    const reads = PROCESS_XML_MESSAGES.filter((candidate) => !WRITE_MESSAGES.includes(candidate));

    expect(reads.map((candidate) => candidate.root)).toEqual([
      'read',
      'list',
      'columns',
      'accountcode',
      'period',
    ]);
    expect(reads.every((candidate) => candidate.effect === OperationEffect.read)).toBe(true);
  });
});
