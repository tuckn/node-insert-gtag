import * as fsh from '@tuckn/fs-hospitality';
import * as jsdiff from 'diff';
import * as fse from 'fs-extra';
import * as path from 'path';

import * as insGtag from './index';

// Hack to make iconv load the encodings module, otherwise jest crashes. Compare
// https://github.com/sidorares/node-mysql2/issues/489
require('@tuckn/fs-hospitality/node_modules/iconv-lite').encodingExists('foo');

const dirAssets = path.resolve(__dirname, '../../assets');
const dirGtags = path.join(dirAssets, 'gtags');
const analyticsJs = path.join(dirGtags, 'gtag.js');
const tagManagerJs = path.join(dirGtags, 'gtag-manager.js');
const tagManagerJsNo = path.join(dirGtags, 'gtag-manager_noscript.js');

const inspectDiff = (diffs: jsdiff.Change[], indents: number): void => {
  diffs.forEach((part, i) => {
    if (part.added) {
      expect(part.value).toMatch(/^[\r\n B]+$/);

      if (/^B+$/.test(part.value)) {
        expect(diffs[i - 1].value).toMatch(/^A+$/);

        const numsY = part.value.length;
        expect(diffs[i - 1].value).toHaveLength(numsY);
      } else {
        expect(part.value).toMatch(/^[\r\n ]+$/);
        const spaces = part.value.replace(/[\r\n]/, '');
        expect(spaces).toHaveLength(indents);
      }
    }

    if (part.removed) {
      expect(part.value).toMatch(/^A+$/);
    }
  });
};

describe('insert-gtag', () => {
  test('makeAnalyticsCode', () => {
    const trackingId = 'UA-BBBBBBBB-B';
    const analyticsSrc = fsh.readAsTextSync(analyticsJs);

    let analyticsCode: string;
    let diffs: jsdiff.Change[];

    analyticsCode = insGtag.makeAnalyticsCode(trackingId);
    diffs = jsdiff.diffChars(analyticsSrc, analyticsCode);
    inspectDiff(diffs, 4);

    analyticsCode = insGtag.makeAnalyticsCode(trackingId, 0);
    diffs = jsdiff.diffChars(analyticsSrc, analyticsCode);
    inspectDiff(diffs, 0);

    analyticsCode = insGtag.makeAnalyticsCode(trackingId, 2);
    diffs = jsdiff.diffChars(analyticsSrc, analyticsCode);
    inspectDiff(diffs, 2);

    expect(() => insGtag.makeAnalyticsCode('')).toThrow();
  });

  test('makeTagManagerCode', () => {
    const gtmId = 'GTM-BBBBBBB';
    const tagMangerSrc = fsh.readAsTextSync(tagManagerJs);

    let analyticsCode: string;
    let diffs: jsdiff.Change[];

    analyticsCode = insGtag.makeTagManagerCode(gtmId);
    diffs = jsdiff.diffChars(tagMangerSrc, analyticsCode);
    inspectDiff(diffs, 4);

    analyticsCode = insGtag.makeTagManagerCode(gtmId, 0);
    diffs = jsdiff.diffChars(tagMangerSrc, analyticsCode);
    inspectDiff(diffs, 0);

    analyticsCode = insGtag.makeTagManagerCode(gtmId, 2);
    diffs = jsdiff.diffChars(tagMangerSrc, analyticsCode);
    inspectDiff(diffs, 2);

    expect(() => insGtag.makeTagManagerCode('')).toThrow();
  });

  test('makeTagManagerCodeNoScript', () => {
    const gtmId = 'GTM-BBBBBBB';
    const tagMangerNoSrc = fsh.readAsTextSync(tagManagerJsNo);

    let analyticsCode: string;
    let diffs: jsdiff.Change[];

    analyticsCode = insGtag.makeTagManagerCodeNoScript(gtmId);
    diffs = jsdiff.diffChars(tagMangerNoSrc, analyticsCode);
    inspectDiff(diffs, 4);

    analyticsCode = insGtag.makeTagManagerCodeNoScript(gtmId, 0);
    diffs = jsdiff.diffChars(tagMangerNoSrc, analyticsCode);
    inspectDiff(diffs, 0);

    analyticsCode = insGtag.makeTagManagerCodeNoScript(gtmId, 2);
    diffs = jsdiff.diffChars(tagMangerNoSrc, analyticsCode);
    inspectDiff(diffs, 2);

    expect(() => insGtag.makeTagManagerCodeNoScript('')).toThrow();
  });

  const dirSrc = path.join(dirAssets, 'test-docs_src');
  /*
   * @note A structure to test
test-docs_src
│  file to exclude.html
│  file to install1.html
│  file to install2.htm
│
├─scripts
│      collapse.js
│      linenumber.js
│      nav.js
│      polyfill.js
│      search.js
│
├─styles
│      jsdoc.css
│      prettify.css
│
└─subdir
      file to exclude.html
      file to install1.html
      file to install2.htm
   */

  test('insertGtagCode', async (done) => {
    const dirTest = fsh.makeTmpPath('', 'test-insertGtagCode');
    const trackingId = 'UA-BBBBBBBB-B';
    const codeToInsert = insGtag.makeAnalyticsCode(trackingId);

    await fse.copy(dirSrc, dirTest);
    await insGtag.insertGtagCode(dirTest, trackingId, {
      ignoredRegExp: 'TO EXCLUDE',
    });

    const relPaths = await insGtag.listFilesToAdd(dirTest);

    await Promise.all(
      relPaths.map(async (relPath) => {
        const srcPath = path.resolve(dirSrc, relPath);
        const testPath = path.resolve(dirTest, relPath);

        const srcCode = await fsh.readAsText(srcPath);
        const testCode = await fsh.readAsText(testPath);

        if (/to exclude/i.test(relPath)) {
          expect(srcCode === testCode).toBeTruthy();
        } else {
          expect(testCode.indexOf(`<head>${codeToInsert}`)).not.toBe(-1);
          expect(
            srcCode === testCode.replace(`<head>${codeToInsert}`, '<head>'),
          ).toBeTruthy();
        }
      }),
    );

    await fse.remove(dirTest);

    done();
  });

  test('insertGTagManagerCode', async (done) => {
    const dirTest = fsh.makeTmpPath('', 'test-insertGTagManagerCode');
    const gtmId = 'GTM-BBBBBBB';
    const codeToInsert = insGtag.makeTagManagerCode(gtmId);
    const codeToInsertNoJs = insGtag.makeTagManagerCodeNoScript(gtmId);

    await fse.copy(dirSrc, dirTest);
    await insGtag.insertGTagManagerCode(dirTest, gtmId, {
      ignoredRegExp: 'TO EXCLUDE',
    });

    const relPaths = await insGtag.listFilesToAdd(dirTest);

    await Promise.all(
      relPaths.map(async (relPath) => {
        const srcPath = path.resolve(dirSrc, relPath);
        const testPath = path.resolve(dirTest, relPath);

        const srcCode = await fsh.readAsText(srcPath);
        const testCode = await fsh.readAsText(testPath);

        if (/to exclude/i.test(relPath)) {
          expect(srcCode === testCode).toBeTruthy();
        } else {
          expect(testCode.indexOf(`<head>${codeToInsert}`)).not.toBe(-1);
          expect(testCode.indexOf(`<body>${codeToInsertNoJs}`)).not.toBe(-1);
          expect(
            srcCode ===
              testCode
                .replace(`<head>${codeToInsert}`, '<head>')
                .replace(`<body>${codeToInsertNoJs}`, '<body>'),
          ).toBeTruthy();
        }
      }),
    );

    await fse.remove(dirTest);

    done();
  });
});
