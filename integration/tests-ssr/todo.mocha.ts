import { expect } from 'chai';

const request = require('./request-service');
let body: string;

describe('NGXS + SSR', () => {
  // console.log(body);
  it('Should be exist "NgxsOnInit todo"', async () => {
    body = await request('http://localhost:4000/list');
    return expect(body.includes('NgxsOnInit todo')).to.equal(true);
  });
  it('Should be exist "ngOnInit todo"', async () => {
    body = await request('http://localhost:4000/list');
    expect(body.includes('ngOnInit todo')).to.equal(true);
  });
});
