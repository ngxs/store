const request = require('./request-service');

describe('NGXS + SSR', () => {
  try {
    it('Should be exit', async () => {
      await request('http://localhost:4000/test/exit');
    });
  } catch (e) {
    console.log(e);
  }
});
