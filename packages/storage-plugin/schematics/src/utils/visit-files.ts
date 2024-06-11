import { DirEntry, Tree } from '@angular-devkit/schematics';

export function visitTsFiles(
  tree: Tree,
  dirPath = tree.root,
  visitor: (path: string) => void
): void {
  function visit(directory: DirEntry) {
    for (const path of directory.subfiles) {
      if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
        const entry = directory.file(path);
        if (entry) {
          visitor(entry.path);
        }
      }
    }

    for (const path of directory.subdirs) {
      if (path === 'node_modules') {
        continue;
      }

      visit(directory.dir(path));
    }
  }

  visit(dirPath);
}
