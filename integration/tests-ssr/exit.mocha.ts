const request = require('./request-service');

describe('NGXS + SSR', () => {
  it('Should be exit', async () => {
    await request('http://localhost:4000/test/exit');
  });
});
