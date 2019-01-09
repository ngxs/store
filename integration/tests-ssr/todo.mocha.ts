import { expect } from 'chai';

const request = require('./request-service');
let body: string;

describe('NGXS + SSR', () => {
  it('"ngOnInit todo" should exist', async () => {
    body = await request('http://localhost:4000/list');
    expect(body.includes('ngOnInit todo')).to.equal(true);
  });

  it('lifecycle hooks should exist in the correct order (root => feature)', async () => {
    body = await request('http://localhost:4000/list');

    const ngxsOnInitIndex = body.indexOf('NgxsOnInit todo');
    const ngxsAfterBootstrapIndex = body.indexOf('NgxsAfterBootstrap todo');
    const ngxsOnInitFeatureIndex = body.indexOf('NgxsOnInit feature');
    const ngxsAfterBootstrapFeatureIndex = body.indexOf('NgxsAfterBootstrap feature');
    const stringIndexes = [
      ngxsOnInitIndex,
      ngxsAfterBootstrapIndex,
      ngxsOnInitFeatureIndex,
      ngxsAfterBootstrapFeatureIndex
    ];

    stringIndexes.forEach((stringIndex, index) => {
      expect(stringIndex).to.be.greaterThan(-1);
      // If it's not the first in the array
      // every next index should more than previous
      if (index) {
        expect(stringIndex).to.be.greaterThan(stringIndexes[index - 1]);
      }
    });
  });
});
