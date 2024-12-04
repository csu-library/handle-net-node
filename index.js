import Axios from 'axios';
import https from 'https';
import Crypto from 'crypto';
import fs from 'fs';

class HandleNet {

  constructor(config = {}) {
    this.hashAlgorithm = config.hashAlgorithm || "sha1";
    this.authId = config.authId || "300:0.NA/12345";
    this.privateKeyPath = config.authPrivateKeyPath || "/admpriv.key";
    this.serverHost = config.serverHost || "localhost";
    this.serverPort = config.serverPort || "8000";
    this.serverPath = config.serverPath || "/api";
    this.serverSelfSigned = config.serverSelfSigned;
    this.testHandle = config.testHandle || "12345/test";
    this.sessionId = "";
  }

  apiConfig() {
    return {
      baseURL: `https://${this.serverHost}:${this.serverPort}${this.serverPath}`,
      httpsAgent: new https.Agent({
        rejectUnauthorized: !this.serverSelfSigned
      })
    };
  }

  async auth() {
    const handleAPI = Axios.create(this.apiConfig());

    const key = fs.readFileSync(this.privateKeyPath);

    let resUnauth = await handleAPI.post('/sessions/');

    let sessionId = resUnauth.data.sessionId;
    let serverNonce = resUnauth.data.nonce;
    let serverBuff = Buffer.from(serverNonce, 'base64');

    let clientBuff = await Crypto.randomBytes(16);
    let clientNonce = clientBuff.toString('base64');

    let combinedBuff = Buffer.concat([serverBuff, clientBuff]);
    // let combinedNonce = combinedBuff.toString('base64');

    let signatureBuff = Crypto.sign(this.hashAlgorithm, combinedBuff, key);
    let signatureNonce = signatureBuff.toString('base64');

    let authString = `Handle version="0", sessionId="${sessionId}", cnonce="${clientNonce}", id="${this.authId}", type="HS_PUBKEY", alg="${this.hashAlgorithm}", signature="${signatureNonce}"`;

    let resAuth = await handleAPI.post('/sessions/this', null, {
      headers: {
        'Authorization': authString
      }
    });

    this.sessionId = sessionId;

    if (!resAuth.data.authenticated) {
      throw new Error('Handle server responded, but did not authenticate');
    }
  }

  async req(method, path, body) {
    if (this.sessionId.length < 1) throw new Error('Not logged in');

    let reqConfig = Object.assign({}, this.apiConfig(), {
      method: method,
      url: path,
      data: body,
      headers: {
        'Authorization': `Handle version="0", sessionId="${this.sessionId}"`
      }
    });

    let api = Axios.create(reqConfig);

    return api.request(reqConfig);
  }

  async get(path) {
    return this.req('get', path, null);
  }

  async put(path, body) {
    return this.req('put', path, body);
  }

  async del(path, body) {
    return this.req('delete', path, body);
  }

  async getHandles(prefix) {
    return this.get(`/handles?prefix=${prefix}`);
  }

  async getHandle(handle) {
    return this.get(`/handles/${handle}`);
  }

  async createHandle(handle, data) {
    return this.put(`/handles/${handle}?overwrite=false`, data);
  }

  async updateHandle(handle, data) {
    return this.put(`/handles/${handle}?overwrite=true`, data);
  }

  async deleteHandle(handle) {
    return this.del(`/handles/${handle}`);
  }
}

export default HandleNet;
