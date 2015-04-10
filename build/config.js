// Generated by CoffeeScript 1.9.1

/*
 * FE build config
 * @date 2014-12-2 15:10:14
 * @author pjg <iampjg@gmail.com>
 * @link http://pjg.pw
 * @version $Id$
 */
var butil, cfg, cndDomain, htmlTplPath, path, phpHashMapPath, st_root, theme;

path = require('path');

butil = require('./lib/butil');

cfg = butil.getJSONSync('config.json');

theme = cfg.theme;

st_root = path.join(__dirname, "..", theme);

htmlTplPath = cfg.htmlTplPath;

phpHashMapPath = cfg.phpHashMapPath;

cndDomain = cfg.cndDomain;

module.exports = {
  evn: cfg.evn,
  isCombo: cfg.isCombo,
  rootPath: st_root,
  htmlPath: htmlTplPath,
  htmlSrc: '../' + theme + '/src/html/',
  prefix: cfg.jsPrefix,
  hashLength: cfg.hashLength,
  coreJsName: cfg.jsPrefix + cfg.coreJsName,
  indexJsDistName: cfg.jsPrefix + cfg.indexJsName,
  indexModuleName: cfg.indexJsModuleID,
  staticRoot: "//" + cndDomain + "/",
  staticPath: "//" + cndDomain + "/" + theme + "/",
  dataPath: './data',
  spriteDataPath: './data/sp.map.json',
  spriteHasPath: './data/sp.has.json',
  jsLibPath: '../libs/',
  docOutPath: '../' + theme + '/doc/',
  cssDistPath: '../' + theme + '/dist/css/',
  jsDistPath: '../' + theme + '/dist/js/',
  tplDistPath: '../' + theme + '/dist/js/',
  imgDistPath: '../' + theme + '/img/',
  spriteDistPath: '../' + theme + '/img/sp/',
  cssBgDistPath: '../' + theme + '/img/bg/',
  cssOutPath: '../' + theme + '/src/_css/',
  jsOutPath: '../' + theme + '/src/_js/',
  tplOutPath: '../' + theme + '/src/js/_tpl/',
  lessPath: '../' + theme + '/src/less/',
  jsSrcPath: '../' + theme + '/src/js/',
  tplSrcPath: '../' + theme + '/src/tpl/',
  imgSrcPath: '../' + theme + '/src/_img/',
  spriteSrcPath: '../' + theme + '/src/sprite/',
  spriteLessOutPath: '../' + theme + '/src/less/sprite/',
  spriteImgOutPath: '../' + theme + '/src/_img/sp/',
  mapPath: '../' + theme + '/dist/map/',
  phpMapPath: phpHashMapPath,
  jsMapName: 'jsmap.json',
  cssMapName: 'cssmap.json',
  spMapName: 'spmap.json',
  cssBgMap: 'cssbgmap.json',
  watchFiles: ['../' + theme + '/src/js/**/*.js', '../' + theme + '/src/sprite/**/*.png', '../' + theme + '/src/less/**/*.less', '../' + theme + '/src/tpl/**/*.html', '../' + theme + '/src/html/**/*.html', '!../' + theme + '/src/**/.DS_Store']
};
