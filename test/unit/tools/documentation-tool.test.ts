import { describe, expect, it } from 'vitest';

import { DocumentationLibrary } from '../../../src/docs/documentation-library.js';
import { InvalidArgumentError } from '../../../src/serialization/invalid-argument-error.js';
import { DocumentationTool } from '../../../src/tools/documentation-tool.js';
import { DOCS_DIRECTORY } from '../../support/fake-twinfield.js';

const library = new DocumentationLibrary(DOCS_DIRECTORY);
const tool = new DocumentationTool(library);

describe('DocumentationTool', () => {
  it('offers exactly the pages of the library as the page enum', () => {
    expect(tool.inputSchema).toEqual({
      type: 'object',
      properties: { page: { type: 'string', enum: [...library.list()] } },
      required: ['page'],
      additionalProperties: false,
    });
  });

  it('is a read-only tool that stays in the closed world of the vendored pages', () => {
    expect(tool.annotations).toEqual({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    });
  });

  it('returns the markdown and the public source of a page', async () => {
    const result = await tool.execute({ page: 'api__miscellaneous__finder' });

    expect(result.isError).toBe(false);
    expect(result.payload).toEqual({
      source: 'https://developers.twinfield.com/documentation/api/miscellaneous/finder',
      markdown: library.read('api__miscellaneous__finder'),
    });
    expect(JSON.stringify(result.payload)).toContain('# Finder');
  });

  it.each([
    '../package',
    '../../package.json',
    '/etc/passwd',
    'api__miscellaneous__finder.md',
    'API__MISCELLANEOUS__FINDER',
    '',
  ])('rejects the page %j that is not in the library', (page) => {
    expect(() => tool.execute({ page })).toThrow(InvalidArgumentError);
    expect(() => tool.execute({ page })).toThrow(
      'page: must be one of the listed documentation pages',
    );
  });

  it.each([undefined, 3, null, ['api__miscellaneous__finder']])(
    'rejects the non-string page %j',
    (page) => {
      expect(() => tool.execute({ page })).toThrow(InvalidArgumentError);
    },
  );
});
