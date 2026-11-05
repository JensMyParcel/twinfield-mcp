import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const EXTENSION = '.md';

/** The vendored Twinfield documentation pages, as Markdown. Only files found at start are served. */
export class DocumentationLibrary {
  private readonly pages: readonly string[];

  constructor(private readonly directory: string) {
    this.pages = readdirSync(directory)
      .filter((file) => file.endsWith(EXTENSION))
      .map((file) => file.slice(0, -EXTENSION.length))
      .sort();
  }

  list(): readonly string[] {
    return this.pages;
  }

  has(page: string): boolean {
    return this.pages.includes(page);
  }

  read(page: string): string {
    if (!this.has(page)) {
      throw new Error(`Unknown documentation page: ${page}`);
    }

    return readFileSync(join(this.directory, `${page}${EXTENSION}`), 'utf8');
  }

  /** The public URL of a page on developers.twinfield.com. */
  sourceUrl(page: string): string {
    const path = page === 'index' ? '' : page.replaceAll('__', '/');

    return `https://developers.twinfield.com/documentation/${path}`;
  }
}
