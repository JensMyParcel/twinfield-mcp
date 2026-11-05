import { describe, expect, it } from 'vitest';

import { SchemaContext } from '../../../src/serialization/json-schema.js';
import { typeRef } from '../../support/core-catalog.js';

describe('SchemaContext', () => {
  it('returns the root unchanged when nothing was defined', () => {
    const root = { type: 'object' };

    expect(new SchemaContext().document(root)).toBe(root);
  });

  it('stores a type once under $defs and refers to it from every use', () => {
    const context = new SchemaContext();
    let built = 0;
    const build = () => {
      built += 1;

      return { type: 'object' };
    };

    const first = context.reference(typeRef('Office'), build);
    const second = context.reference(typeRef('Office'), build);

    expect(first).toEqual({ $ref: '#/$defs/Office' });
    expect(second).toEqual(first);
    expect(built).toBe(1);
    expect(context.document({ type: 'object', properties: { office: first } })).toEqual({
      type: 'object',
      properties: { office: { $ref: '#/$defs/Office' } },
      $defs: { Office: { type: 'object' } },
    });
  });

  it('gives types with the same name in other namespaces a numbered name', () => {
    const context = new SchemaContext();

    expect(context.reference(typeRef('Office', 'urn:a'), () => ({ a: 1 }))).toEqual({
      $ref: '#/$defs/Office',
    });
    expect(context.reference(typeRef('Office', 'urn:b'), () => ({ b: 1 }))).toEqual({
      $ref: '#/$defs/Office2',
    });
    expect(context.reference(typeRef('Office', 'urn:c'), () => ({ c: 1 }))).toEqual({
      $ref: '#/$defs/Office3',
    });
    expect(context.reference(typeRef('Office', 'urn:b'), () => ({ other: 1 }))).toEqual({
      $ref: '#/$defs/Office2',
    });
    expect(context.document({})['$defs']).toEqual({
      Office: { a: 1 },
      Office2: { b: 1 },
      Office3: { c: 1 },
    });
  });

  it('replaces dots in type names, and numbers a clash with a name that has an underscore', () => {
    const context = new SchemaContext();

    expect(context.reference(typeRef('Finder.Query'), () => ({}))).toEqual({
      $ref: '#/$defs/Finder_Query',
    });
    expect(context.reference(typeRef('Finder_Query'), () => ({}))).toEqual({
      $ref: '#/$defs/Finder_Query2',
    });
  });

  it('ends a recursive definition with a $ref to itself instead of building it again', () => {
    const context = new SchemaContext();
    const node = typeRef('Node');
    let built = 0;
    const build = (): Record<string, unknown> => {
      built += 1;

      return { type: 'object', properties: { child: context.reference(node, build) } };
    };

    expect(context.reference(node, build)).toEqual({ $ref: '#/$defs/Node' });
    expect(built).toBe(1);
    expect(context.document({})['$defs']).toEqual({
      Node: { type: 'object', properties: { child: { $ref: '#/$defs/Node' } } },
    });
  });

  it('reserves the name while the definition is built, so a nested clash gets its own name', () => {
    const context = new SchemaContext();

    context.reference(typeRef('Office', 'urn:a'), () => ({
      inner: context.reference(typeRef('Office', 'urn:b'), () => ({ b: 1 })),
    }));

    expect(context.document({})['$defs']).toEqual({
      Office: { inner: { $ref: '#/$defs/Office2' } },
      Office2: { b: 1 },
    });
  });
});
