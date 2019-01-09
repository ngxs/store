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

    const ngxsOnInitIndex = body.indexOf('NgxsOnInit todo');
    const ngxsAfterBootstrapIndex = body.indexOf('NgxsAfterBootstrap todo');
    const ngxsOnInitLazyIndex = body.indexOf('NgxsOnInit lazy');
    const ngxsAfterBootstrapLazyIndex = body.indexOf('NgxsAfterBootstrap lazy');
    const stringIndexes = [
      ngxsOnInitIndex,
      ngxsAfterBootstrapIndex,
      ngxsOnInitLazyIndex,
      ngxsAfterBootstrapLazyIndex
    ];

    stringIndexes.forEach(stringIndex => {
      expect(stringIndex).to.be.greaterThan(-1);
    });

    stringIndexes.forEach((stringIndex, index) => {
      // If it's not the first in the array
      // every next index should more than previous
      if (index) {
        expect(stringIndex).to.be.greaterThan(stringIndexes[index - 1]);
      }
    });
  });
});
