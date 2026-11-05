import { describe, expect, it } from 'vitest';

import { OperationEffect } from '../../../src/catalog/catalog-types.js';
import { annotationsFor, documentationHint } from '../../../src/tools/twinfield-tool.js';

describe('annotationsFor', () => {
  it('marks a read as read-only, idempotent and not destructive', () => {
    expect(annotationsFor(OperationEffect.read)).toEqual({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    });
  });

  it('marks a write as neither read-only, idempotent nor destructive', () => {
    expect(annotationsFor(OperationEffect.write)).toEqual({
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    });
  });

  it('marks a destructive operation as destructive and not read-only', () => {
    expect(annotationsFor(OperationEffect.destructive)).toEqual({
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    });
  });
});

describe('documentationHint', () => {
  it('names one page', () => {
    expect(documentationHint(['api__master-data__vat'])).toBe(
      'Field reference: call twinfield_documentation with page "api__master-data__vat".',
    );
  });

  it('names every page as alternatives', () => {
    expect(documentationHint(['a', 'b', 'c'])).toBe(
      'Field reference: call twinfield_documentation with page "a" or "b" or "c".',
    );
  });
});
