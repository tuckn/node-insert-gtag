import * as fsh from '@tuckn/fs-hospitality';
import * as fs from 'fs';
// import jQuery from 'jquery';
// import { JSDOM } from 'jsdom';
import * as _ from 'lodash';
import * as path from 'path';

/** @namespace API */

/** @private */
const ARG_ERR = 'TypeError [ERR_INVALID_ARG_VALUE]: ';

/**
 * @private
 * @param {Function} fn - Function where the Error occurred
 * @returns {string} - Returns "  at ${Function.name} (${__filename})"
 */
const _errLoc = (fn: Function) => `\n    at ${fn.name} (${__filename})`;

/**
 * Lists file paths to be inserted.
 *
 * @private
 * @param {string} dirPath - A directory path
 * @param {object} [options] - Options
 * @param {string} [options.matchedRegExp] - RegExp pattern of extensions of file to be inserted. Default. "\\.html?$"
 * @param {string} [options.ignoredRegExp] - RegExp pattern of file to be exclude. Ex. "[_\\-.]cache\\d+"
 * @returns {Promise<string[]>} - Returns a Array of full-paths.
 */
export async function listFilesToAdd(
  dirPath: string,
  options = {},
): Promise<string[]> {
  if (!dirPath) {
    throw new Error(`${ARG_ERR}dirPath is empty.${_errLoc(Function)}`);
  }

  const matchedRegExp = _.get(options, 'matchedRegExp', '\\.html?$');
  const ignoredRegExp = _.get(options, 'ignoredRegExp', null);

  const fullDirPath = path.resolve(dirPath);
  if (!fs.existsSync(fullDirPath)) {
    throw new Error(
      `${ARG_ERR}"${fullDirPath}" is not existing.${_errLoc(Function)}`,
    );
  }

  return (await fsh.readdirRecursively(fullDirPath, {
    matchedRegExp,
    ignoredRegExp,
  })) as Array<string>;
}

/**
 * Makes Google Analytics html code (gtag.js). {@link https://support.google.com/analytics/topic/1008079|Set up (web) Google Analytics}
 *
 * @memberof API
 * @param {string|string[]} trackingId - A tracking ID(s)
 * @param {string} [indentNum=4] - Number of indenting white spaces.
 * @returns {string} - A Google Analytics html code
 */
export function makeAnalyticsCode(
  trackingId: string | string[],
  indentNum = 4,
): string {
  if (!trackingId) {
    throw new Error(`${ARG_ERR}trackingId is empty.${_errLoc(Function)}`);
  }

  const indent = _.repeat(' ', indentNum);
  let code = `
${indent}<!-- Global site tag (gtag.js) - Google Analytics -->
${indent}<script async src="https://www.googletagmanager.com/gtag/js?id=${trackingId}"></script>
${indent}<script>
${indent}  window.dataLayer = window.dataLayer || [];
${indent}  function gtag(){dataLayer.push(arguments);}
${indent}  gtag('js', new Date());
`;

  const trackingIds = _.isArray(trackingId) ? trackingId : [trackingId];
  trackingIds.forEach((id) => {
    code += `
${indent}  gtag('config', '${id}');`;
  });

  code += `
${indent}</script>
`;

  return code;
}

/**
 * Insert Google Analytics code (gtag.js) in html files. {@link https://support.google.com/analytics/topic/1008079|Set up (web) Google Analytics}
 *
 * @memberof API
 * @param {string} dirPath - A directory path
 * @param {string|string[]} trackingId - A tracking ID(s)
 * @param {object} [options] - See {@link API.listFilesToAdd}
 */
export async function insertGtagCode(
  dirPath: string,
  trackingId: string | string[],
  options = {},
): Promise<any> {
  if (!trackingId) {
    throw new Error(`${ARG_ERR}trackingId is empty.${_errLoc(Function)}`);
  }

  const srcRelPaths = await listFilesToAdd(dirPath, options);

  await Promise.all(
    srcRelPaths.map(async (srcRelPath) => {
      const srcFullPath = path.resolve(dirPath, srcRelPath);
      const data = await fsh.readFilePromise(srcFullPath);
      const encoding = fsh.detectTextEncoding(data);
      const eol = fsh.detectTextEol(data);

      let htmlCode = await fsh.readAsText(data);
      htmlCode = htmlCode.replace(
        /<head>/i,
        `<head>${makeAnalyticsCode(trackingId)}`,
      );

      return fsh.writeAsText(srcFullPath, htmlCode, { eol, encoding });
    }),
  );
}

/**
 * Makes Google Tag Manager html code. {@link https://developers.google.com/tag-manager|Google Tag Manager}
 *
 * @memberof API
 * @param {string} gtmId - A GTM ID
 * @param {string} [indentNum=4] - Number of indenting white spaces.
 * @returns {string} - A Google Tag Manager html code
 */
export function makeTagManagerCode(gtmId: string, indentNum = 4): string {
  if (!gtmId) {
    throw new Error(`${ARG_ERR}gtmId is empty.${_errLoc(Function)}`);
  }

  const indent = _.repeat(' ', indentNum);

  return `
${indent}<!-- Google Tag Manager -->
${indent}<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
${indent}new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
${indent}j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
${indent}'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
${indent}})(window,document,'script','dataLayer','${gtmId}');</script>
${indent}<!-- End Google Tag Manager -->
`;
}

/**
 * Makes Google Tag Manager html code for noscript.
 *
 * @memberof API
 * @param {string} gtmId - A GTM ID
 * @param {string} [indentNum=4] - Number of indenting white spaces.
 * @returns {string} - A Google Tag Manager html code for noscript
 */
export function makeTagManagerCodeNoScript(
  gtmId: string,
  indentNum = 4,
): string {
  if (!gtmId) {
    throw new Error(`${ARG_ERR}gtmId is empty.${_errLoc(Function)}`);
  }

  const indent = _.repeat(' ', indentNum);

  return `
${indent}<!-- Google Tag Manager (noscript) -->
${indent}<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
${indent}height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
${indent}<!-- End Google Tag Manager (noscript) -->
`;
}

/**
 * Insert Google Tag Manager code in html files. {@link https://support.google.com/analytics/topic/1008079|Set up (web) Google Tag Manager}
 *
 * @memberof API
 * @param {string} dirPath - A directory path
 * @param {string} gtmId - A GTM ID
 * @param {object} [options] - See {@link API.listFilesToAdd}
 */
export async function insertGTagManagerCode(
  dirPath: string,
  gtmId: string,
  options = {},
): Promise<any> {
  if (!gtmId) {
    throw new Error(`${ARG_ERR}gtmId is empty.${_errLoc(Function)}`);
  }

  const srcRelPaths = await listFilesToAdd(dirPath, options);

  await Promise.all(
    srcRelPaths.map(async (srcRelPath) => {
      const srcFullPath = path.resolve(dirPath, srcRelPath);
      const data = await fsh.readFilePromise(srcFullPath);
      const encoding = fsh.detectTextEncoding(data);
      const eol = fsh.detectTextEol(data);

      let htmlCode = await fsh.readAsText(data);
      htmlCode = htmlCode.replace(
        /<head>/i,
        `<head>${makeTagManagerCode(gtmId)}`,
      );

      htmlCode = htmlCode.replace(
        /<body>/i,
        `<body>${makeTagManagerCodeNoScript(gtmId)}`,
      );

      return fsh.writeAsText(srcFullPath, htmlCode, { eol, encoding });
    }),
  );
}

/**
 * [W.I.P] jQuery version: Insert Google Analytics code (gtag.js) in html files. {@link https://support.google.com/analytics/topic/1008079|Set up (web) Google Analytics}
 *
 * @memberof API
 * @param {string} dirPath - A directory path
 * @param {string} trackingId - A tracking ID
 * @param {object} [options]
 * @param {string} [options.matchedRegExp] - RegExp pattern of extensions of file to be inserted. Default. "\\.html?$"
 * @param {string} [options.ignoredRegExp] - RegExp pattern of file to be exclude. Ex. "[_\\-.]cache\\d+"
 */
// export function insertGtagWithJquery(
//   dirPath: string,
//   trackingId: string,
//   options = {},
// ): void {
//   if (!trackingId) {
//     throw new Error(`${ARG_ERR}trackingId is empty.${_errLoc(Function)}`);
//   }
//
//   const ext = _.get(options, 'ext', '@(.html|.htm)');
//   let globPattern = path.join(fullDirPath, `**/*${ext}`);
//   if (os.platform() === 'win32') {
//     globPattern = globPattern.replace(/\\/g, '/');
//   }
//
//   glob(globPattern, (err, matchedPaths) => {
//     matchedPaths.forEach(async (fpath) => {
//       const htmlCode = await fsh.readAsText(fpath);
//       const { window } = new JSDOM(htmlCode);
//       const $: JQueryStatic = jQuery(window) as any;
//       const innerHtml = makeAnalyticsCode(trackingId) + $('head').html();
//
//       $('head').html(innerHtml);
//       console.log($('head').html()); // @todo ???
//     });
//   });
// }
