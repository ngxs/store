import { exit } from 'shelljs';
const request = require('./request-service');

setTimeout(async () => {
  try {
    const body: string = await request('http://localhost:4000/list');
    console.log(body);
    if (body.indexOf('NgxsOnInit todo') === -1 || body.indexOf('ngOnInit todo') === -1) {
      console.log('SSR check = false');
      await exitServer();
      exit(1);
    }
    await exitServer();
    exit(0);
  } catch (e) {
    console.log(e);
    exit(1);
  }
}, 2000);

async function exitServer(): Promise<any> {
  await request('http://localhost:4000/test/exit');
}
