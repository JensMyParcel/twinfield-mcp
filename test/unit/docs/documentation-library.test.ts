import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DocumentationLibrary } from '../../../src/docs/documentation-library.js';
import { DOCS_DIRECTORY } from '../../support/fake-twinfield.js';

describe('DocumentationLibrary over the vendored documentation', () => {
  const library = new DocumentationLibrary(DOCS_DIRECTORY);
  const files = readdirSync(DOCS_DIRECTORY).filter((file) => file.endsWith('.md'));

  it('lists every Markdown page once, without extension, sorted', () => {
    const pages = library.list();

    expect(pages).toHaveLength(files.length);
    expect(pages.length).toBeGreaterThan(0);
    expect([...pages].sort()).toEqual(pages);
    expect(pages.every((page) => !page.endsWith('.md'))).toBe(true);
  });

  it('reads a page as the file content', () => {
    const page = 'api__master-data__customers';

    expect(library.has(page)).toBe(true);
    expect(library.read(page)).toBe(readFileSync(join(DOCS_DIRECTORY, `${page}.md`), 'utf8'));
  });
});

describe('DocumentationLibrary', () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'twinfield-docs-'));
    writeFileSync(join(directory, 'b.md'), '# B');
    writeFileSync(join(directory, 'a.md'), '# A');
    writeFileSync(join(directory, 'notes.txt'), 'not a page');
    writeFileSync(join(directory, 'md'), 'no dot');
    mkdirSync(join(directory, 'sub'));
    writeFileSync(join(directory, 'sub', 'c.md'), '# C');
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  it('serves only .md files directly in the directory', () => {
    expect(new DocumentationLibrary(directory).list()).toEqual(['a', 'b']);
  });

  it('serves only the pages it found at start', () => {
    const library = new DocumentationLibrary(directory);
    writeFileSync(join(directory, 'late.md'), '# Late');

    expect(library.has('late')).toBe(false);
    expect(() => library.read('late')).toThrow('Unknown documentation page: late');
  });

  it.each(['missing', 'a.md', 'sub/c', '../a', 'notes', ''])(
    'rejects the unknown page %j',
    (page) => {
      const library = new DocumentationLibrary(directory);

      expect(library.has(page)).toBe(false);
      expect(() => library.read(page)).toThrow(`Unknown documentation page: ${page}`);
    },
  );

  it('rejects a directory that does not exist', () => {
    expect(() => new DocumentationLibrary(join(directory, 'missing'))).toThrow(/ENOENT/);
  });

  it('reads a known page', () => {
    expect(new DocumentationLibrary(directory).read('a')).toBe('# A');
  });

  describe('sourceUrl', () => {
    const library = (): DocumentationLibrary => new DocumentationLibrary(directory);

    it('maps the index page to the documentation root', () => {
      expect(library().sourceUrl('index')).toBe('https://developers.twinfield.com/documentation/');
    });

    it('maps every double underscore to a path separator', () => {
      expect(library().sourceUrl('api__master-data__customers')).toBe(
        'https://developers.twinfield.com/documentation/api/master-data/customers',
      );
    });

    it('keeps single underscores', () => {
      expect(library().sourceUrl('a_b')).toBe('https://developers.twinfield.com/documentation/a_b');
    });
  });
});
