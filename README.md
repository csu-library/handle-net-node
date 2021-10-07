# handle-net-node

a nodejs sdk for handle-net

## Installation

Make sure you have Node.js 14+ installed.

Install package dependencies:

```
npm install
```

Create a .env file from the example file:

```
cp example.env .env
```

Edit your .env file and make sure that the values pertinent to your environment and server are set up.

Here's a breakdown of the variables.

| Variable                      | Usage                                                                                     | Example         |
| ----------------------------- | ----------------------------------------------------------------------------------------- | --------------- |
| HANDLE_AUTH_HASH_ALGORITHM    | The digest algorithm used to create the client signature. Generally "SHA1" or "SHA256".   | SHA1            |
| HANDLE_AUTH_ID                | The handle identity of the caller, as {index}:{handle}                                    | 300:0.NA/12345  |
| HANDLE_AUTH_PRIVATE_KEY_PATH  | The path to your PEM-encoded private key file (not bin)                                   | /admpriv.key    |
| HANDLE_SERVER_HOST            | The hostname (IP address) of your handle server                                           | 127.0.0.1       |
| HANDLE_SERVER_PORT            | The port over which your handle server's API is accessed                                  | 8000            |
| HANDLE_SERVER_PATH            | The base path of your handle server's API (typically just /api)                           | /api            |
| HANDLE_SERVER_SELF_SIGNED     | Whether or not your server uses a self-signed SSL cert. "yes" or "no"                     | yes             |
| HANDLE_TEST_HANDLE            | The handle that you plan to use whenever you run tests (will be overwritten during tests) | 12345/test      |

**Keep in mind** that the HANDLE_TEST_HANDLE represents a handle that will actually be written to your handle server. It will overwrite a handle that already exists, so make sure that this handle is used purely for testing purposes.

## Testing

Once you have your .env configured, you can verify that it is working by running tests:

```
npm test
```

One thing to keep in mind regarding auth is that tests *could* fail because of a timeout depending on the speed of the handle server. Sometimes it takes a bit to authenticate.

## Usage

Refer to test/test.js to see an example of usage, but it's pretty simple.

Import the HandleNet class:

```
import HandleNet from 'handle-net';
```

Create a new HandleNet instance and authenticate:

```
let handleNet = new HandleNet();
await handleNet.auth();
```

Optionally, you can manually override settings. Otherwise, the class will use environment variables from .env. For example, you could override the following configuration settings:

```
let handleNet = new HandleNet();

handleNet.hashAlgorithm = 'sha1';
handleNet.authId = '300:0.NA/12345';
handleNet.privateKeyPath = '/admpriv.key';

handleNet.serverHost = 'localhost';
handleNet.serverPort = '8000';
handleNet.serverPath = '/api';
handleNet.serverSelfSigned = true;

handleNet.testHandle = '12345/test';

await handleNet.auth();
```

In this way, you could have multiple instances of the HandleNet class:

```
let firstClient = new HandleNet();
let secondClient = new HandleNet();

firstClient.authId = '300:0.NA/12345';
secondClient.authId = '300:0.NA/67891';

await firstClient.auth();
await secondClient.auth();

let firstHandles = await firstClient.getHandles('12345');
console.log(getHandlesRes.data);

let secondHandles = await secondClient.getHandles('67891');
console.log(secondHandles.data);
```

Other methods available on the class (note that every requires that the client is auth'd before calling):

| method                      | description                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| auth()                      | authenticates the client via session api endpoints based on the class properties         |
| getHandles(prefix)          | gets an array of all of the handles under a prefix                                       |
| getHandle(handle)           | get handle data from the specified handle                                                |
| createHandle(handle, data)  | creates a new handle with specified handle & data, fails if handle exists                |
| updateHandle(handle, data)  | creates or updates a handle with specified handle & data, does NOT fail if handle exists |
| deleteHandle(handle)        | deletes a handle with the specified handle                                               |








