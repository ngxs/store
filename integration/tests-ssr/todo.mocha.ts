import { expect } from 'chai';

const request = require('./request-service');

describe('NGXS + SSR', () => {
  it('"ngOnInit todo" should exist', async () => {
    const body = await request('http://localhost:4000/list');
    expect(body.includes('ngOnInit todo')).to.equal(true);
  });

  it('lifecycle hooks should exist in the correct order (root => lazy)', async () => {
    const body = await request('http://localhost:4000/list');

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

    stringIndexes.forEach((stringIndex, index) => {
      expect(stringIndex).to.be.greaterThan(-1);
      // If it's not the first in the array
      // every next index should more than previous
      if (index) {
        expect(stringIndex).to.be.greaterThan(stringIndexes[index - 1]);
      }
    });
  });

  it('should successfully resolve list of animals via the "router$" stream', async () => {
    const body = await request('http://localhost:4000/list');
    const animalsWereResolvedIndex = body.indexOf(
      'Animals were resolved via the "router$" stream zebras,pandas,lions,giraffes'
    );
    expect(animalsWereResolvedIndex).to.be.greaterThan(-1);
  });

  it('should resolve list of animals via the "snapshot$" stream', async () => {
    const body = await request('http://localhost:4000/list');
    const animalsWereResolvedIndex = body.indexOf(
      'Animals were resolved via the "snapshot$" stream zebras,pandas,lions,giraffes'
    );
    expect(animalsWereResolvedIndex).to.be.greaterThan(-1);
  });
});
