import Axios from 'axios';
import Dotenv from 'dotenv';
import https from 'https';
import Crypto from 'crypto';
import fs from 'fs';

Dotenv.config(0);

const config = {
  hashAlg: process.env.HASH_ALGORITHM || 'sha1',
  authId: process.env.AUTH_ID || '300:0.NA/12345',
  privateKeyPath: process.env.PRIVATE_KEY_PATH || '/admpriv.key',
  server: {
    host: process.env.HANDLE_SERVER_HOST || 'localhost',
    port: process.env.HANDLE_SERVER_PORT || '8000',
    path: process.env.HANDLE_SERVER_PATH || '/api',
    alg: process.env.HANDLE_SERVER_ALGORITHM || 'sha1',
    selfSigned: process.env.HANDLE_SERVER_SELF_SIGNED.toLowerCase() == 'yes'
  }
};

const apiConfig = {
  baseURL: `https://${config.server.host}:${config.server.port}${config.server.path}`,
  httpsAgent: new https.Agent({
    rejectUnauthorized: !config.server.selfSigned
  })
};

const handleAPI = Axios.create(apiConfig);

async function auth() {
  const key = fs.readFileSync(config.privateKeyPath);
  
  let resUnauth = await handleAPI.post('/sessions/');

  let sessionId = resUnauth.data.sessionId;
  let serverNonce = resUnauth.data.nonce;
  let serverBuff = Buffer.from(serverNonce, 'base64');
  
  let clientBuff = await Crypto.randomBytes(16);
  let clientNonce = clientBuff.toString('base64');

  let combinedBuff = Buffer.concat([serverBuff, clientBuff]);
  let combinedNonce = combinedBuff.toString('base64');

  let signatureBuff = Crypto.sign(config.hashAlg, combinedBuff, key);
  let signatureNonce = signatureBuff.toString('base64');

  let authString = `Handle version="0", sessionId="${sessionId}", cnonce="${clientNonce}", id="${config.authId}", type="HS_PUBKEY", alg="${config.hashAlg}", signature="${signatureNonce}"`;
  
  // console.log(`SESSION ID: ${sessionId}`);
  // console.log(`SERVER NONCE: ${serverNonce}`);
  // console.log(`CLIENT NONCE: ${clientNonce}`);
  // console.log(`COMBINED NONCE: ${combinedNonce}`);
  // console.log(`SIGNATURE NONCE: ${signatureNonce}`);
  // console.log(`AUTH STRING: ${authString}`);

  let resAuth = await handleAPI.post('/sessions/this', null, {
    headers: {
      'Authorization': authString
    }
  });

  if (resAuth.data.authenticated) return sessionId;
  throw new Error('Handle server responded, but did not authenticate');
}

async function req(sessionId, method, path, body) {
  let reqConfig = Object.assign({}, apiConfig, {
    method: method,
    url: path,
    data: body,
    headers: {
      'Authorization': `Handle version="0", sessionId="${sessionId}"`
    }
  });

  let api = Axios.create(reqConfig);

  return api.request(reqConfig);
}

async function get(sessionId, path) {
  return req(sessionId, 'get', path, null);
}

async function put(sessionId, path, body) {
  return req(sessionId, 'put', path, body);
}

async function del(sessionId, path, body) {
  return req(sessionId, 'delete', path, body);
}

async function getHandles(sessionId, prefix) {
  return get(sessionId, `/handles?prefix=${prefix}`);
}

async function getHandle(sessionId, handle) {
  return get(sessionId, `/handles/${handle}`);
}

async function createHandle(sessionId, handle, data) {
  return put(sessionId, `/handles/${handle}?overwrite=false`, data);
}

async function updateHandle(sessionId, handle, data) {
  return put(sessionId, `/handles/${handle}?overwrite=true`, data);
}

async function deleteHandle(sessionId, handle) {
  return del(sessionId, `/handles/${handle}`);
}

(async () => {
  let sessionId = await auth();
  console.log(`Session ID: ${sessionId}`);
  
  let nowISO = (new Date()).toISOString();
  console.log(`Current Date/Time: ${nowISO}`);

  console.log('Testing get all handles...');
  let getHandlesRes = await getHandles(sessionId, '10217');
  console.log(getHandlesRes.data);

  console.log('Testing get handle...');
  let getHandleRes = await getHandle(sessionId, '10217/marcus');
  console.log(getHandleRes.data);

  console.log('Testing delete handle...');
  let deleteHandleRes = await deleteHandle(sessionId, '10217/marcus');
  console.log(deleteHandleRes.data);

  console.log('Testing create handle...');
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
  console.log(createHandleRes.data);

  console.log('Testing update handle...');
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
  console.log(updateHandleRes.data);
})();

export {
  auth,
  getHandles,
  getHandle,
  createHandle,
  updateHandle,
  deleteHandle
}