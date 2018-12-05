process.env.TS_NODE_PROJECT = './tsconfig.spec.json';
import 'reflect-metadata';

require('ts-mocha');
const Mocha = require('mocha');

const mocha = new Mocha();
mocha.addFile(`./tests-ssr/todo.mocha.ts`);
mocha.addFile(`./tests-ssr/exit.mocha.ts`);
mocha.run((failures: number) => {
  process.on('exit', () => {
    process.exit(failures); // exit with non-zero status if there were failures
  });
});
