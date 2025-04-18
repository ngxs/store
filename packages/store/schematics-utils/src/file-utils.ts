import { DirEntry, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';

export function visitTsFiles(
  tree: Tree,
  dirPath = tree.root,
  visitor: (sourceFile: ts.SourceFile, filePath: string) => void
): void {
  function visit(directory: DirEntry) {
    for (const path of directory.subfiles) {
      if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
        const entry = directory.file(path);
        if (entry) {
          const content = entry.content;
          const source = ts.createSourceFile(
            entry.path,
            content.toString(),
            ts.ScriptTarget.Latest,
            true
          );
          visitor(source, entry.path);
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
