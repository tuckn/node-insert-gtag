import * as AdmZip from 'adm-zip';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as pkg from 'pkg';

import { version } from '../package.json';

/**
 *
 */
async function release() {
  // Copy (Rename) the bin-JS (index.js) to the project-name
  const dirNpmBin = path.resolve(__dirname, '..', 'dist', 'bin');

  const pathNpmBin = path.join(dirNpmBin, 'index.js');
  const pathPjNameJs = path.join(dirNpmBin, 'insert-gtag.js');
  await fse.copyFile(pathNpmBin, pathPjNameJs);

  // Create the directory for packaging
  const dirAssets = path.resolve(__dirname, '..', 'assets');
  const dirAssetsBin = path.join(dirAssets, 'bin');
  const dirExe = path.join(dirAssetsBin, 'insert-gtag');

  await fse.remove(dirAssetsBin); // Clear

  // Package the bin-JS into an executable
  const releases = [
    {
      srcPath: pathPjNameJs,
      target: 'node12-linux-x64',
      output: path.join(dirExe, 'insert-gtag'),
      zipPath: path.join(dirAssetsBin, `insert-gtag_v${version}_linux-x64.zip`),
    },
    {
      srcPath: pathPjNameJs,
      target: 'node12-macos-x64',
      output: path.join(dirExe, 'insert-gtag'),
      zipPath: path.join(dirAssetsBin, `insert-gtag_v${version}_macos-x64.zip`),
    },
    {
      srcPath: pathPjNameJs,
      target: 'node12-win-x86',
      output: path.join(dirExe, 'insert-gtag.exe'),
      zipPath: path.join(dirAssetsBin, `insert-gtag_v${version}_win-x86.zip`),
    },
    {
      srcPath: pathPjNameJs,
      target: 'node12-win-x64',
      output: path.join(dirExe, 'insert-gtag.exe'),
      zipPath: path.join(dirAssetsBin, `insert-gtag_v${version}_win-x64.zip`),
    },
  ];

  // Async funcs in sequential
  for (const o of releases) {
    await fse.ensureDir(dirExe);
    await pkg.exec([o.srcPath, '--target', o.target, '--output', o.output]);

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
