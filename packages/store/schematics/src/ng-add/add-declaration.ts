import { Rule, chain } from '@angular-devkit/schematics';
import { addRootImport, addRootProvider } from '../utils/ng-utils/standalone/rules';
import {
  applyChangesToFile,
  findBootstrapApplicationCall,
  getMainFilePath,
  getSourceFile
} from '../utils/ng-utils/standalone/util';
import { insertImport } from '@schematics/angular/utility/ast-utils';
import { findAppConfig } from '../utils/ng-utils/standalone/app_config';
import { LIBRARIES } from '../utils/common/lib.config';
import { NormalizedNgxsPackageSchema } from './ng-add.factory';

export function addDeclarationToStandaloneApp(options: NormalizedNgxsPackageSchema): Rule {
  return async host => {
    const mainFilePath = await getMainFilePath(host, options.project);
    const bootstrapCall = findBootstrapApplicationCall(host, mainFilePath);
    const appConfigFilePath =
      findAppConfig(bootstrapCall, host, mainFilePath)?.filePath || mainFilePath;

    const plugins = options.plugins
      .filter(p => pluginData.has(p))
      .map((p): [LIBRARIES, string] => [p, pluginData.get(p)!.standalone]);

    const importPluginRules = plugins.map(([plugin, standaloneDeclaration]): Rule => {
      return importTree => {
        const change = insertImport(
          getSourceFile(host, appConfigFilePath),
          appConfigFilePath,
          standaloneDeclaration,
          plugin
        );
        applyChangesToFile(importTree, appConfigFilePath, [change]);
      };
    });
    const pluginDeclarations = plugins
      .map(([, standaloneDeclaration]) => `${standaloneDeclaration}()`)
      .join(',\n');
    return chain([
      ...importPluginRules,
      addRootProvider(
        options.project,
        ({ code, external }) =>
          code`${external('provideStore', '@ngxs/store')}(\n[],\n${pluginDeclarations})`
      )
    ]);
  };
}

export function addDeclarationToNonStandaloneApp(options: NormalizedNgxsPackageSchema): Rule {
  const pluginRules = options.plugins
    .map(p => [p, pluginData.get(p)?.module])
    .filter((v): v is [LIBRARIES, string] => !!v[1])
    .map(([plugin, moduleName]) => {
      return addRootImport(
        options.project,
        ({ code, external }) => code`${external(moduleName, plugin)}.forRoot()`
      );
    });

  const importPath = '@ngxs/store';

  const moduleImportExtras =
    '.forRoot([], { developmentMode: /** !environment.production */ false, selectorOptions: { suppressErrors: false, injectContainerState: false } })';

  return chain([
    addRootImport(
      options.project,
      ({ code, external }) => code`${external('NgxsModule', importPath)}${moduleImportExtras}`
    ),
    ...pluginRules
  ]);
}

const pluginData: ReadonlyMap<LIBRARIES, { module?: string; standalone: string }> = new Map([
  [
    LIBRARIES.DEVTOOLS,
    {
      module: 'NgxsReduxDevtoolsPluginModule',
      standalone: 'withNgxsReduxDevtoolsPlugin'
    }
  ],
  [
    LIBRARIES.FORM,
    {
      module: 'NgxsFormPluginModule',
      standalone: 'withNgxsFormPlugin'
    }
  ],
  [
    LIBRARIES.LOGGER,
    {
      module: 'NgxsLoggerPluginModule',
      standalone: 'withNgxsLoggerPlugin'
    }
  ],
  [
    LIBRARIES.ROUTER,
    {
      module: 'NgxsRouterPluginModule',
      standalone: 'withNgxsRouterPlugin'
    }
  ],
  [
    LIBRARIES.STORAGE,
    {
      module: 'NgxsStoragePluginModule',
      standalone: 'withNgxsStoragePlugin'
    }
  ],
  [
    LIBRARIES.STORE,
    {
      standalone: 'provideStore'
    }
  ],
  [
    LIBRARIES.WEBSOCKET,
    {
      module: 'NgxsWebSocketPluginModule',
      standalone: 'withNgxsWebSocketPlugin'
    }
  ]
]);
