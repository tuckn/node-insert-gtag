import * as AdmZip from 'adm-zip';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as pkg from 'pkg';

import { version } from '../package.json';

const pjName = 'insert-gtag';

/**
 *
 */
async function release() {
  // Copy (Rename) the bin-JS (index.js) to the project-name
  const dirNpmBin = path.resolve(__dirname, '..', 'dist', 'bin');

  const pathNpmBin = path.join(dirNpmBin, 'index.js');
  const pathPjNameJs = path.join(dirNpmBin, `${pjName}.js`);
  await fse.copyFile(pathNpmBin, pathPjNameJs);

  // Create the directory for packaging
  const dirAssets = path.resolve(__dirname, '..', 'assets');
  const dirAssetsBin = path.join(dirAssets, 'bin');
  const dirExe = path.join(dirAssetsBin, pjName);

  await fse.remove(dirAssetsBin); // Clear

  // Package the bin-JS into an executable
  const releases = [
    {
      target: 'latest-linux-x64',
      srcPath: pathPjNameJs,
      output: path.join(dirExe, pjName),
      zipPath: path.join(dirAssetsBin, `${pjName}_v${version}_linux-x64.zip`),
    },
    {
      target: 'latest-macos-x64',
      srcPath: pathPjNameJs,
      output: path.join(dirExe, pjName),
      zipPath: path.join(dirAssetsBin, `${pjName}_v${version}_macos-x64.zip`),
    },
    {
      target: 'latest-win-x64',
      srcPath: pathPjNameJs,
      output: path.join(dirExe, `${pjName}.exe`),
      zipPath: path.join(dirAssetsBin, `${pjName}_v${version}_win-x64.zip`),
    },
    {
      /*
       * @NOTICE With pkg v5.7.0, conversion to win-x86 fails.
       * The solution is using pkg 4.4.0. it works.
       */
      target: 'latest-win-x86',
      srcPath: pathPjNameJs,
      output: path.join(dirExe, `${pjName}.exe`),
      zipPath: path.join(dirAssetsBin, `${pjName}_v${version}_win-x86.zip`),
    },
  ];

  // Async funcs in sequential
  for (const o of releases) {
    await fse.ensureDir(dirExe);
    await pkg.exec(['--target', o.target, '--output', o.output, o.srcPath]);

    // Zipping the directory
    const zip = new AdmZip();
    zip.addLocalFolder(dirExe);
    zip.writeZip(o.zipPath);
    await fse.remove(dirExe); // Clear
  }

  // Remove copied bin-JS
  await fse.remove(pathPjNameJs);
}

release();
