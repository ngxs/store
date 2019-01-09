import { expect } from 'chai';

const request = require('./request-service');
let body: string;

describe('NGXS + SSR', () => {
  it('"ngOnInit todo" should exist', async () => {
    body = await request('http://localhost:4000/list');
    expect(body.includes('ngOnInit todo')).to.equal(true);
  });

  it(`"NgxsOnInit todo" + "NgxsAfterBootstrap todo" + "NgxsOnInit lazy" + "NgxsAfterBootstrap lazy" should exist`, async () => {
    body = await request('http://localhost:4000/list');
    expect(body.includes('NgxsOnInit todo')).to.equal(true);
    expect(body.includes('NgxsAfterBootstrap todo')).to.equal(true);
    expect(body.includes('NgxsOnInit lazy')).to.equal(true);
    expect(body.includes('NgxsAfterBootstrap lazy')).to.equal(true);
  });
});
