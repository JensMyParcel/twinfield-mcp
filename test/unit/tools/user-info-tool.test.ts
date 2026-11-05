import { describe, expect, it } from 'vitest';

import { OAuthError } from '../../../src/auth/token-endpoint.js';
import { UserInfoTool } from '../../../src/tools/user-info-tool.js';
import { CLUSTER } from '../../support/fake-twinfield.js';
import { ToolsStack } from '../../support/tools-stack.js';

describe('UserInfoTool', () => {
  it('returns the cluster of the session and the claims of its access token', async () => {
    const stack = new ToolsStack();
    const tool = new UserInfoTool(stack.sessions, stack.userInfo);

    const result = await tool.execute();

    expect(result).toEqual({
      isError: false,
      payload: { cluster: CLUSTER, claims: { sub: 'user-1', 'twf.organisationCode': 'ORG' } },
    });
    const userInfo = stack.twinfield.requests.find((request) =>
      request.url.pathname.endsWith('/connect/userinfo'),
    );
    expect(userInfo?.headers['authorization']).toBe('Bearer access-1');
  });

  it('takes no arguments and only reads', () => {
    const stack = new ToolsStack();
    const tool = new UserInfoTool(stack.sessions, stack.userInfo);

    expect(tool.inputSchema).toEqual({
      type: 'object',
      properties: {},
      additionalProperties: false,
    });
    expect(tool.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false });
  });

  it('asks for no claims when the session cannot be renewed', async () => {
    const stack = new ToolsStack();
    stack.twinfield.tokenStatus = 400;
    const tool = new UserInfoTool(stack.sessions, stack.userInfo);

    await expect(tool.execute()).rejects.toThrow(OAuthError);
    expect(
      stack.twinfield.requests.some((request) => request.url.pathname.endsWith('/userinfo')),
    ).toBe(false);
  });
});
