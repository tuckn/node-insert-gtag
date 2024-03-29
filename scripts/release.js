"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var AdmZip = require("adm-zip");
var fse = require("fs-extra");
var path = require("path");
var pkg = require("pkg");
var package_json_1 = require("../package.json");
var pjName = 'insert-gtag';
/**
 *
 */
function release() {
    return __awaiter(this, void 0, void 0, function () {
        var dirNpmBin, pathNpmBin, pathPjNameJs, dirAssets, dirAssetsBin, dirExe, releases, _i, releases_1, o, zip;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirNpmBin = path.resolve(__dirname, '..', 'dist', 'bin');
                    pathNpmBin = path.join(dirNpmBin, 'index.js');
                    pathPjNameJs = path.join(dirNpmBin, "".concat(pjName, ".js"));
                    return [4 /*yield*/, fse.copyFile(pathNpmBin, pathPjNameJs)];
                case 1:
                    _a.sent();
                    dirAssets = path.resolve(__dirname, '..', 'assets');
                    dirAssetsBin = path.join(dirAssets, 'bin');
                    dirExe = path.join(dirAssetsBin, pjName);
                    return [4 /*yield*/, fse.remove(dirAssetsBin)];
                case 2:
                    _a.sent(); // Clear
                    releases = [
                        {
                            target: 'latest-linux-x64',
                            srcPath: pathPjNameJs,
                            output: path.join(dirExe, pjName),
                            zipPath: path.join(dirAssetsBin, "".concat(pjName, "_v").concat(package_json_1.version, "_linux-x64.zip"))
                        },
                        {
                            target: 'latest-macos-x64',
                            srcPath: pathPjNameJs,
                            output: path.join(dirExe, pjName),
                            zipPath: path.join(dirAssetsBin, "".concat(pjName, "_v").concat(package_json_1.version, "_macos-x64.zip"))
                        },
                        {
                            target: 'latest-win-x64',
                            srcPath: pathPjNameJs,
                            output: path.join(dirExe, "".concat(pjName, ".exe")),
                            zipPath: path.join(dirAssetsBin, "".concat(pjName, "_v").concat(package_json_1.version, "_win-x64.zip"))
                        },
                        {
                            /*
                             * @NOTICE With pkg v5.7.0, conversion to win-x86 fails.
                             * The solution is using pkg 4.4.0. it works.
                             */
                            target: 'latest-win-x86',
                            srcPath: pathPjNameJs,
                            output: path.join(dirExe, "".concat(pjName, ".exe")),
                            zipPath: path.join(dirAssetsBin, "".concat(pjName, "_v").concat(package_json_1.version, "_win-x86.zip"))
                        },
                    ];
                    _i = 0, releases_1 = releases;
                    _a.label = 3;
                case 3:
                    if (!(_i < releases_1.length)) return [3 /*break*/, 8];
                    o = releases_1[_i];
                    return [4 /*yield*/, fse.ensureDir(dirExe)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, pkg.exec(['--target', o.target, '--output', o.output, o.srcPath])];
                case 5:
                    _a.sent();
                    zip = new AdmZip();
                    zip.addLocalFolder(dirExe);
                    zip.writeZip(o.zipPath);
                    return [4 /*yield*/, fse.remove(dirExe)];
                case 6:
                    _a.sent(); // Clear
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: 
                // Remove copied bin-JS
                return [4 /*yield*/, fse.remove(pathPjNameJs)];
                case 9:
                    // Remove copied bin-JS
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
release();
