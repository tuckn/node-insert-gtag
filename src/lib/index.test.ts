import * as fsh from '@tuckn/fs-hospitality';
import * as jsdiff from 'diff';
import * as fse from 'fs-extra';
import * as path from 'path';

import * as insGtag from './index';

const dirAssets = path.resolve(__dirname, '../../assets');

const inspectDiff = (diffs: jsdiff.Change[], indents: number): void => {
  /*
   * @NOTE example of jsdiff (5.1.0) result
gtag-manager.js before after
[
  {
    count: 1,
    value: "\n",
  },
  {
    count: 4,
    added: true,
    removed: undefined,
    value: "    ",
  },
  {
    count: 28,
    value: "<!-- Google Tag Manager -->\n",
  },
  {
    count: 4,
    added: true,
    removed: undefined,
    value: "    ",
  },
  {
    count: 67,
    value: "<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n",
  },
  {
    count: 4,
    added: true,
    removed: undefined,
    value: "    ",
  },
  {
    count: 74,
    value: "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n",
  },
  {
    count: 4,
    added: true,
    removed: undefined,
    value: "    ",
  },
  {
    count: 70,
    value: "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n",
  },
  {
    count: 4,
    added: true,
    removed: undefined,
    value: "    ",
  },
  {
    count: 83,
    value: "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n",
  },
  {
    count: 4,
    added: true,
    removed: undefined,
    value: "    ",
  },
  {
    count: 45,
    value: "})(window,document,'script','dataLayer','GTM-",
  },
  {
    count: 7,
    added: undefined,
    removed: true,
    value: "AAAAAAA",
  },
  {
    count: 7,
    added: true,
    removed: undefined,
    value: "BBBBBBB",
  },
  {
    count: 13,
    value: "');</script>\n",
  },
  {
    count: 4,
    added: true,
    removed: undefined,
    value: "    ",
  },
  {
    count: 32,
    value: "<!-- End Google Tag Manager -->\n",
  },
]
   */
  diffs.forEach((part, i) => {
    if (!part.added && !part.removed) return; // The some part

    if (part.added) {
      // @NOTE /\s/ include '\r' and '\n'
      if (/^[ ]+$/.test(part.value)) {
        expect(part.value).toHaveLength(indents); // Check indent num
        return;
      }
    }

    expect(part.value).toBe(0); // error
  });
};

describe('insert-gtag', () => {
  test('makeAnalyticsCode', () => {
    const trackingId = 'UA-BBBBBBBB-B';
    const expectedCode = `
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${trackingId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${trackingId}');
</script>
`;

    let analyticsCode: string;
    let diffs: jsdiff.Change[];

    analyticsCode = insGtag.makeAnalyticsCode(trackingId);
    diffs = jsdiff.diffChars(expectedCode, analyticsCode);
    inspectDiff(diffs, 4);

    analyticsCode = insGtag.makeAnalyticsCode(trackingId, 0);
    diffs = jsdiff.diffChars(expectedCode, analyticsCode);
    inspectDiff(diffs, 0);

    analyticsCode = insGtag.makeAnalyticsCode(trackingId, 2);
    diffs = jsdiff.diffChars(expectedCode, analyticsCode);
    inspectDiff(diffs, 2);

    expect(() => insGtag.makeAnalyticsCode('')).toThrow();
  });

  test('makeTagManagerCode', () => {
    const gtmId = 'GTM-BBBBBBB';
    const tagMangerSrc = `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');</script>
<!-- End Google Tag Manager -->
`;

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
    const tagMangerNoSrc = `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
`;

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

  test('insertGtagCode', async () => {
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
          // Check the inserted position
          expect(testCode).toMatch(/<head>\s*<!-- Global site tag \(gtag\.js\) /i);
          if (/CRLF\.html?$/.test(relPath)) {
            // To check the code insertion is completed for CRLF.
            expect(testCode).toContain(codeToInsert.replace(/\n/g, '\r\n'));
          } else {
            // To check the code insertion is completed.
            expect(testCode).toContain(codeToInsert);
          }
        }
      }),
    );

    await fse.remove(dirTest);
  });

  test('insertGTagManagerCode', async () => {
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
          // Check the inserted position
          expect(testCode).toMatch(/<head>\s*<!-- Google Tag Manager -->/i);
          expect(testCode).toMatch(/<body>\s*<!-- Google Tag Manager \(noscript\) -->/i);

          if (/CRLF\.html?$/.test(relPath)) {
            // To check the code insertion is completed for CRLF.
            expect(testCode).toContain(codeToInsert.replace(/\n/g, '\r\n'));
            expect(testCode).toContain(codeToInsertNoJs.replace(/\n/g, '\r\n'));
          } else {
            // To check the code insertion is completed.
            expect(testCode).toContain(codeToInsert);
            expect(testCode).toContain(codeToInsertNoJs);
          }
        }
      }),
    );

    await fse.remove(dirTest);
  });
});
