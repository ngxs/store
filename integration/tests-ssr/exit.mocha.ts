const request = require('./request-service');

describe('NGXS + SSR', () => {
  it('should exit', async () => {
    await request('http://localhost:4000/test/exit');
  });
});
