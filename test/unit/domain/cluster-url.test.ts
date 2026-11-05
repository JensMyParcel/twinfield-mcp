import { describe, expect, it } from 'vitest';

import { ClusterUrl } from '../../../src/domain/cluster-url.js';

const CLUSTER = 'https://api.accounting.twinfield.com';

describe('ClusterUrl', () => {
  it.each([
    [CLUSTER, CLUSTER],
    [`${CLUSTER}/`, CLUSTER],
    ['https://api.accounting2.twinfield.com', 'https://api.accounting2.twinfield.com'],
    ['https://api.us-east-1.twinfield.com', 'https://api.us-east-1.twinfield.com'],
    ['https://API.Accounting.TWINFIELD.com', CLUSTER],
    [`${CLUSTER}:443`, CLUSTER],
  ])('accepts the Twinfield cluster %j as the origin %j', (value, origin) => {
    expect(ClusterUrl.parse(value).toString()).toBe(origin);
  });

  it.each(['', 'not a url', 'api.accounting.twinfield.com', '//api.accounting.twinfield.com'])(
    'rejects the invalid URL %j',
    (value) => {
      expect(() => ClusterUrl.parse(value)).toThrow('The cluster URL is not a valid URL.');
    },
  );

  it.each([
    'http://api.accounting.twinfield.com',
    'ftp://api.accounting.twinfield.com',
    'wss://api.accounting.twinfield.com',
    `${CLUSTER}:8443`,
    `${CLUSTER}:80`,
    `${CLUSTER}/webservices`,
    `${CLUSTER}/?x=1`,
    `${CLUSTER}/#x`,
    'https://user@api.accounting.twinfield.com',
    'https://user:pw@api.accounting.twinfield.com',
    'https://:pw@api.accounting.twinfield.com',
  ])('rejects %j, which is not a bare https origin', (value) => {
    expect(() => ClusterUrl.parse(value)).toThrow('The cluster URL must be a bare https origin.');
  });

  it.each([
    'https://twinfield.com',
    'https://api.twinfield.com',
    'https://accounting.twinfield.com',
    'https://evilapi.accounting.twinfield.com',
    'https://xapi.accounting.twinfield.com',
    'https://api.a.b.twinfield.com',
    'https://api.accounting.twinfield.com.evil.com',
    'https://api.x.twinfield.com.evil.com',
    'https://api.accounting.twinfield.co',
    'https://api.accounting.twinfieldxcom',
    'https://api.accounting-twinfield.com',
    'https://api.-accounting.twinfield.com',
    'https://api.accounting-.twinfield.com',
    'https://api.acc--ounting.twinfield.com',
    'https://api.accöunting.twinfield.com',
    'https://api.accounting.twinfield.com.',
    'https://api..twinfield.com',
    'https://127.0.0.1',
    'https://[::1]',
  ])('rejects the host of %j', (value) => {
    expect(() => ClusterUrl.parse(value)).toThrow(/^The host .+ is not a Twinfield cluster\.$/);
  });

  describe('endpoint', () => {
    const cluster = ClusterUrl.parse(CLUSTER);

    it('builds a web service URL on the cluster origin', () => {
      expect(cluster.endpoint('/webservices/processxml.asmx').href).toBe(
        `${CLUSTER}/webservices/processxml.asmx`,
      );
    });

    it.each([
      '/webservices/processxml.asmx',
      '/webservices/OfficeService.svc',
      '/webservices/X.asmx',
    ])('accepts the service file %j directly under /webservices/', (path) => {
      expect(cluster.endpoint(path).href).toBe(`${CLUSTER}${path}`);
    });

    it.each([
      '/',
      '',
      'webservices/processxml.asmx',
      '/webservices',
      '/webservices/',
      '/WebServices/processxml.asmx',
      '/auth/authentication/connect/token',
      '//evil.com/webservices/x.asmx',
      'https://evil.com/webservices/x.asmx',
      '/webservices/a.svc?wsdl',
      '/webservices/a.svc#x',
      '/webservices/../x.asmx',
      '/webservices/%2e%2e/x.asmx',
      '/webservices/%2E%2E/x.asmx',
      '/webservices/..%2fx.asmx',
      '/webservices/sub/x.asmx',
      '/webservices/x.asmx/',
      '/webservices/x.asmx/extra',
      '/webservices/@evil.com/x.asmx',
      '/webservices/x.aspx',
      '/webservices/x.ASMX',
      '/webservices/x1.asmx',
      '/webservices/x-y.svc',
      '/webservices/.asmx',
      '/webservices/x.asmx\n',
      '\\webservices\\x.asmx',
    ])('rejects the path %j', (path) => {
      expect(() => cluster.endpoint(path)).toThrow(
        `The path ${path} is not a Twinfield web service.`,
      );
    });
  });
});
