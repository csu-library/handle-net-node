import assert from 'assert';
import { auth, getHandles, getHandle, createHandle, updateHandle, deleteHandle } from '../index.js';

let sessionId = '';
let nowISO = (new Date()).toISOString();

describe('Auth', () => {
  it('can authenticate', async () => {
    sessionId = await auth();
    assert.notEqual(sessionId, '');
  });
});

describe('API', () => {
  it('can get all handles', async () => {
    let getHandlesRes = await getHandles(sessionId, '10217');
    assert.strictEqual(getHandlesRes.data.responseCode, 1);
  });

  it('can get single handle', async () => {
    let getHandleRes = await getHandle(sessionId, '10217/marcus');
    assert.strictEqual(getHandleRes.data.responseCode, 1);
  });

  it('can delete handle', async () => {
    let deleteHandleRes = await deleteHandle(sessionId, '10217/marcus');
    assert.strictEqual(deleteHandleRes.data.responseCode, 1);
  });

  it('can create new handle', async () => {
    let createHandleRes = await createHandle(sessionId, '10217/marcus', {
      handle: '10217/marcus',
      values: [
        {
          index: 1,
          type: 'URL',
          ttl: 86400,
          timestamp: nowISO,
          data: {
            value: 'https://longwell.tech',
            format: 'string'
          }
        },
        {
          index: 2,
          ttl: 86400,
          type: 'EMAIL',
          timestamp: nowISO,
          data: {
            value: 'marcus.longwell@colostate.edu',
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
              handle: config.authId,
              permissions: '111111111111'
            }
          }
        }
      ]
    });
    assert.strictEqual(createHandleRes.data.responseCode, 1);
  });

  it('can update existing handle', async () => {
    let updateHandleRes = await updateHandle(sessionId, '10217/marcus', {
      values: [
        {
          index: 2, 
          ttl: 86400,
          type: 'EMAIL',
          timestamp: nowISO,
          data: {
            value: 'marcuslongwell@gmail.com',
            format: 'string'
          }
        }
      ]
    });
    assert.strictEqual(updateHandleRes.data.responseCode, 1);
  });
});