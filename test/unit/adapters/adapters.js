import adapters from '../../../lib/adapters/adapters.js';
import assert from 'assert';

import axios from '../../../index.js';

const SERVER_PORT = 8010;
const LOCAL_SERVER_URL = `http://localhost:${SERVER_PORT}`;

const fetchAxios = axios.create({
  baseURL: LOCAL_SERVER_URL,
  adapter: 'fetch',
});

(typeof fetch === 'function' ? describe : describe.skip)('supports fetch with nodejs', () => {
  it('should reject request headers containing CRLF characters', async () => {
    await assert.rejects(
      async () => fetchAxios.get(`${LOCAL_SERVER_URL}/`, {
        headers: {
          'x-test': 'ok\r\nInjected: yes',
        },
      }),
      /(invalid.*header|header.*invalid)/i
    );
  });
});

describe('adapters', function () {
  const store = {...adapters.adapters};

  beforeEach(() => {
    Object.keys(adapters.adapters).forEach((name) => {
      delete adapters.adapters[name];
    });

    Object.assign(adapters.adapters, store);
  });

  it('should support loading by fn handle', function () {
    const adapter = () => {};
    assert.strictEqual(adapters.getAdapter(adapter), adapter);
  });

  it('should support loading by name', function () {
    const adapter = () => {};
    adapters.adapters['testadapter'] = adapter;
    assert.strictEqual(adapters.getAdapter('testAdapter'), adapter);
  });

  it('should detect adapter unavailable status', function () {
    adapters.adapters['testadapter'] = null;
    assert.throws(()=> adapters.getAdapter('testAdapter'), /is not available in the build/)
  });

  it('should detect adapter unsupported status', function () {
    adapters.adapters['testadapter'] = false;
    assert.throws(()=> adapters.getAdapter('testAdapter'), /is not supported by the environment/)
  });

  it('should pick suitable adapter from the list', function () {
    const adapter = () => {};

    Object.assign(adapters.adapters, {
      foo: false,
      bar: null,
      baz: adapter
    });

    assert.strictEqual(adapters.getAdapter(['foo', 'bar', 'baz']), adapter);
  });
});
