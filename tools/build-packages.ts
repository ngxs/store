import { getPackages, ArgvType, Package } from './utils';
import { join } from 'path';
import * as childProcess from 'child_process';
import { promisify } from 'util';

const exec = promisify(childProcess.exec);

type Options = {
  specificPackage?: string;
  watch?: boolean;
};

type NgPackagr = {
  forProject(ngPackagrProjectPath: string): NgPackagr;
  withOptions(options: { watch: boolean }): NgPackagr;
  withTsConfig(tsConfigPath: string): NgPackagr;
  build(): Promise<void>;
};

export function getOptionsFromProcessArgs(): Options {
  const options: string[] = process.argv.slice(2, process.argv.length) || [];
  const packageFlag: number = options.indexOf(ArgvType.PACKAGE);
  const specificPackage: string = packageFlag > -1 ? options[packageFlag + 1] : '';
  const watch: boolean = options.includes(ArgvType.WATCH);
  return { specificPackage, watch };
}

export async function buildPackages(options: Options, ngPackagr: () => NgPackagr) {
  const { specificPackage = null, watch = false } = options || {};
  // get all packages
  let packages = getPackages();

  // build a specific package that is passed via the command line
  // `yarn build:packages --package router-plugin`
  if (specificPackage) {
    console.log(`Specific: ${specificPackage}`);
    packages = packages.filter(p => p.name === specificPackage);
  }

  // run through all our packages and build and link them
  for (const pack of packages) {
    // build package
    try {
      await ngPackagr()
        .forProject(pack.ngPackagrProjectPath)
        .withOptions({ watch })
        .withTsConfig(join(__dirname, '../tsconfig.build.json'))
        .build();
      if (hasSchematics(pack)) {
        await buildPackageSchematics(pack);
      }
    } catch (err) {
      console.error('ngPackagr build failed', err);
      throw err;
    }
  }
}

function hasSchematics(pkg: Package): boolean {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const packageJson = require(pkg.ngPackagrProjectPath);
  return !!packageJson.schematics;
}

async function buildPackageSchematics(pkg: Package): Promise<void> {
  await exec(`cd ${pkg.ngPackagrProjectPath.replace('/package.json', '')} && yarn build`);
}
