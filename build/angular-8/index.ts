import { ngPackagr } from 'ng-packagr';
import { buildPackages, getOptionsFromProcessArgs } from '../../tools/build-packages';
import { setMetadata } from '../../tools/set-metadata';

const options = getOptionsFromProcessArgs();

buildPackages(options, ngPackagr)
  .then(() => {
    setMetadata();
  })
  .catch(err => {
    console.error('Error building ngxs', err);
    process.exit(111);
  });
