import tutorialkit from '@tutorialkit/astro';
import { defineConfig } from 'astro/config';

export default defineConfig({
  outDir: '../../@tutorials/create-app',
  devToolbar: {
    enabled: false
  },
  integrations: [tutorialkit()],
  site: 'https://ngxs.github.io/store'
});
