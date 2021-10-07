import assert from 'assert';
import HandleNet from '../index.js';

let handleNet = new HandleNet();
let nowISO = (new Date()).toISOString();

describe('Auth', () => {
  it('can authenticate', async () => {
    // await auth();
    await handleNet.auth();
    assert.notEqual(handleNet.sessionId, '');
  });
});

describe('API', () => {
  it('can create new handle', async () => {
    let createHandleRes = await handleNet.createHandle(handleNet.testHandle, {
      handle: handleNet.testHandle,
      values: [
        {
          index: 1,
          type: 'URL',
          ttl: 86400,
          timestamp: nowISO,
          data: {
            value: 'https://example.com',
            format: 'string'
          }
        },
        {
          index: 2,
          ttl: 86400,
          type: 'EMAIL',
          timestamp: nowISO,
          data: {
            value: 'email@example.com',
            format: 'string'
          }
        },
        {
          index: 100,
          ttl: 86400,
          type: 'HS_ADMIN',
          timestamp: nowISO,
          data: {
            format: 'admin',
            value: {
              index: 200,
              handle: handleNet.authId,
              permissions: '111111111111'
            }
          }
        }
      ]
    });
    assert.strictEqual(createHandleRes.data.responseCode, 1);
  });

  it('can get all handles', async () => {
    let getHandlesRes = await handleNet.getHandles(handleNet.testHandle.split('/')[0]);
    assert.strictEqual(getHandlesRes.data.responseCode, 1);
  });

  it('can get single handle', async () => {
    let getHandleRes = await handleNet.getHandle(handleNet.testHandle);
    assert.strictEqual(getHandleRes.data.responseCode, 1);
  });

  it('can update existing handle', async () => {
    let updateHandleRes = await handleNet.updateHandle(handleNet.testHandle, {
      values: [
        {
          index: 2, 
          ttl: 86400,
          type: 'EMAIL',
          timestamp: nowISO,
          data: {
            value: 'email2@example.com',
            format: 'string'
          }
        }
      ]
    });
    assert.strictEqual(updateHandleRes.data.responseCode, 1);
  });

  it('can delete handle', async () => {
    let deleteHandleRes = await handleNet.deleteHandle(handleNet.testHandle);
    assert.strictEqual(deleteHandleRes.data.responseCode, 1);
  });
});