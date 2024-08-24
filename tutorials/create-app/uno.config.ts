import { theme } from '@tutorialkit/astro';
import transformerDirectives from '@unocss/transformer-directives';
import { globSync, convertPathToPattern } from 'fast-glob';
import fs from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { defineConfig, presetIcons, presetUno } from 'unocss';

const iconPaths = globSync('./icons/*.svg');

const customIconCollection = iconPaths.reduce(
  (acc, iconPath) => {
    const collectionName = basename(dirname(iconPath));
    const [iconName] = basename(iconPath).split('.');

    acc[collectionName] ??= {};
    acc[collectionName][iconName] = async () => fs.readFile(iconPath, 'utf8');

    return acc;
  },
  {} as Record<string, Record<string, () => Promise<string>>>
);

export default defineConfig({
  theme,
  content: {
    inline: globSync(
      `${convertPathToPattern(join(require.resolve('@tutorialkit/components-react'), '..'))}/**/*.js`
    ).map(filePath => {
      return () => fs.readFile(filePath, { encoding: 'utf8' });
    })
  },
  rules: [
    ['scrollbar-transparent', { 'scrollbar-color': '#0000004d transparent' }],
    ['nav-box-shadow', { 'box-shadow': '0 2px 4px -1px rgba(0, 0, 0, 0.1)' }],
    ['transition-background', { 'transition-property': 'background' }]
  ],
  shortcuts: {
    'panel-container': 'grid grid-rows-[min-content_1fr] h-full',
    'panel-header':
      'flex items-center px-4 py-2 bg-tk-elements-panel-header-backgroundColor min-h-[38px] overflow-x-hidden',
    'panel-tabs-header': 'flex bg-tk-elements-panel-header-backgroundColor h-[38px]',
    'panel-title': 'flex items-center gap-1.5 text-tk-elements-panel-header-textColor',
    'panel-icon': 'text-tk-elements-panel-header-iconColor',
    'panel-button':
      'flex items-center gap-1.5 whitespace-nowrap rounded-md text-sm bg-tk-elements-panel-headerButton-backgroundColor hover:bg-tk-elements-panel-headerButton-backgroundColorHover text-tk-elements-panel-headerButton-textColor hover:text-tk-elements-panel-headerButton-textColorHover'
  },
  transformers: [transformerDirectives()],
  presets: [
    presetUno({
      dark: {
        dark: '[data-theme="dark"]'
      }
    }),
    presetIcons({
      collections: {
        ...customIconCollection
      }
    })
  ]
});
