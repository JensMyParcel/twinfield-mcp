/** A tool argument that does not match the operation's schema. Nothing was sent to Twinfield. */
export class InvalidArgumentError extends Error {
  override readonly name = 'InvalidArgumentError';

  constructor(
    readonly path: string,
    reason: string,
  ) {
    super(`${path === '' ? 'arguments' : path}: ${reason}`);
  }
}

export function childPath(parent: string, child: string | number): string {
  if (typeof child === 'number') {
    return `${parent}[${child}]`;
  }

  return parent === '' ? child : `${parent}.${child}`;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
