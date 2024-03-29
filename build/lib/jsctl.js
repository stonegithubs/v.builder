// Generated by CoffeeScript 1.9.1

/**
 * js生产文件构建类库
 * @date 2014-12-2 15:10:14
 * @author pjg <iampjg@gmail.com>
 * @link http://pjg.pw
 * @version $Id$
 */
var _, _buildJs, _buildJsDistMap, _oldMap, _updateJsDistMap, amdclean, butil, color, config, cssBgMap, e, errrHandler, filterDepMap, fs, gulp, gutil, info, jsDepBuilder, jsDistMapName, jsHash, jsImgRegex, jsToDist, md5, path, pkg, plumber, revall, rjs, rootPath, tryEval, uglify,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

fs = require('fs');

path = require('path');

config = require('./config');

_ = require('lodash');

amdclean = require('amdclean');

gulp = require('gulp');

revall = require('gulp-rev-all');

uglify = require('uglify-js');

pkg = require('../package.json');

info = "/**\n *Uglify by " + pkg.name + "@v" + pkg.version + "\n *@description:" + pkg.description + "\n *@author:Pang.J.G\n *@homepage:" + pkg.author.url + "\n */\n";

rjs = require('gulp-requirejs');

plumber = require('gulp-plumber');

gutil = require('gulp-util');

color = gutil.colors;

butil = require('./butil');

errrHandler = butil.errrHandler;

md5 = butil.md5;

jsDistMapName = config.jsDistMapName;

rootPath = config.rootPath;


/* '[ ]'标志符内的依赖字符串转化为数组 */

tryEval = function(str) {
  var err, json;
  try {
    return json = eval('(' + str + ')');
  } catch (_error) {
    err = _error;
  }
};

jsHash = {};

jsImgRegex = /STATIC_PATH\s*\+\s*(('|")[\s\S]*?(.jpg|.png|.gif)('|"))/g;

cssBgMap = {};

_oldMap = {};

try {
  cssBgMap = JSON.parse(fs.readFileSync(path.join(config.mapPath, config.cssBgMap), 'utf8'));
  _oldMap = JSON.parse(fs.readFileSync(path.join(config.mapPath, jsDistMapName), 'utf8'));
} catch (_error) {
  e = _error;
}

_buildJsDistMap = function(map) {
  var _map, jsonData, mapPath;
  mapPath = config.mapPath;
  _map = _.assign(_oldMap, map);
  jsonData = JSON.stringify(_map, null, 2);
  !fs.existsSync(mapPath) && butil.mkdirsSync(mapPath);
  return fs.writeFileSync(path.join(rootPath, mapPath, jsDistMapName), jsonData, 'utf8');
};

_updateJsDistMap = function(newMap) {
  var _newMap, jsonData, mapPath;
  mapPath = config.mapPath;
  _newMap = JSON.stringify(newMap, null, 2);
  !fs.existsSync(mapPath) && butil.mkdirsSync(mapPath);
  jsonData = _.assign(_oldMap, _newMap);
  return fs.writeFileSync(path.join(rootPath, mapPath, jsDistMapName), jsonData, 'utf8');
};

_buildJs = function(source, outName, cb) {
  var _content, _distPath, _distname, _hash, _jsHash, _oldPath, _source, mangled, outPath;
  _jsHash = {};
  outPath = path.join(rootPath, config.jsDistPath);
  !fs.existsSync(outPath) && butil.mkdirsSync(outPath);
  _source = source.replace(jsImgRegex, function(str, map) {
    var _str, key, val;
    key = map.replace(/(^\'|\")|(\'|\"$)/g, '').replace('/_img/', '');
    val = _.has(cssBgMap, key) ? cssBgMap[key].distname : (map.indexOf('data:') > -1 || map.indexOf('about:') > -1 ? map : key + '?=t' + String(new Date().getTime()).substr(0, 8));
    _str = str.replace(key, val).replace('/_img/', '/img/');
    return _str;
  });
  _content = amdclean.clean({
    code: _source,
    wrap: {
      start: outName === config.coreJsName ? '' : '',
      end: outName === config.coreJsName ? '' : ''
    }
  });
  _oldPath = path.join(outPath, outName + '.js');
  mangled = uglify.minify(_content, {
    fromString: true
  });
  _source = mangled.code;
  _source = [info, _source].join(';');
  _hash = md5(_source);
  _distname = outName + '.' + _hash.substring(0, config.hashLength) + '.js';
  _jsHash[outName + ".js"] = {
    hash: _hash,
    distname: _distname
  };
  _distPath = path.join(outPath, _distname);
  fs.writeFileSync(_oldPath, _source, 'utf8');
  !config.isDebug && fs.writeFileSync(_distPath, _source, 'utf8');
  return cb(_jsHash);
};


/* 过滤依赖表里的关键词，排除空依赖 */

filterDepMap = function(depMap) {
  depMap = depMap.filter(function(dep) {
    return ["require", "exports", "module", ""].indexOf(dep) === -1;
  });
  return depMap.map(function(dep) {
    return dep.replace(/\.js$/, '');
  });
};


/* AMD模块的依赖构建工具类库 */

jsDepBuilder = (function() {
  function jsDepBuilder() {
    this.makeRelateList = bind(this.makeRelateList, this);
    this.makeDeps = bind(this.makeDeps, this);
    this.allJsDep = bind(this.allJsDep, this);
    this.oneJsDep = bind(this.oneJsDep, this);
  }

  jsDepBuilder.prototype.srcPath = config.jsOutPath;

  jsDepBuilder.prototype.amdRegex = /;?\s*define\s*\(([^(]*),?\s*?function\s*\([^\)]*\)/;

  jsDepBuilder.prototype.depArrRegex = /^[^\[]*(\[[^\]\[]*\]).*$/;

  jsDepBuilder.prototype.oneJsDep = function(file_path, file_name) {
    var _amdRegex, _depArrRegex, _filePath, _jscontents, _list;
    _list = [];
    _amdRegex = this.amdRegex;
    _depArrRegex = this.depArrRegex;
    _filePath = path.join(file_path, file_name);
    _jscontents = fs.readFileSync(_filePath, 'utf8').toString();
    _jscontents.replace(_amdRegex, function(str, map) {
      var arr, depStr, error;
      depStr = map.replace(_depArrRegex, "$1");
      if (/^\[/.test(depStr)) {
        arr = tryEval(depStr);
        try {
          return _list = filterDepMap(arr);
        } catch (_error) {
          error = _error;
        }
      }
    });
    return _list;
  };

  jsDepBuilder.prototype.allJsDep = function() {
    var _oneJsDep, _srcPath, depMap;
    depMap = {};
    _srcPath = this.srcPath;
    _oneJsDep = this.oneJsDep;
    fs.readdirSync(_srcPath).forEach(function(v) {
      var jsPath;
      jsPath = path.join(_srcPath, v);
      if (fs.statSync(jsPath).isDirectory() && v !== 'vendor') {
        return fs.readdirSync(jsPath).forEach(function(f) {
          var fileDep, jsPath_lv2, name;
          if (f.indexOf('.') !== 0 && f.indexOf('.js') !== -1) {
            fileDep = _oneJsDep(jsPath, f);
            name = f.replace('.js', '');
            return depMap[v + "/" + name] = fileDep;
          } else if (f.indexOf('.coffee') === -1) {
            jsPath_lv2 = path.join(jsPath, f);
            if (fs.statSync(jsPath_lv2).isDirectory()) {
              return fs.readdirSync(jsPath_lv2).forEach(function(ff) {
                var name_lv2;
                if (ff.indexOf('.') !== 0 && ff.indexOf('.js') !== -1) {
                  name_lv2 = ff.replace('.js', '');
                  fileDep = _oneJsDep(jsPath_lv2, ff);
                  return depMap[v + "/" + f + "/" + name_lv2] = fileDep;
                }
              });
            }
          }
        });
      }
    });
    return depMap;
  };

  jsDepBuilder.prototype.makeDeps = function() {
    var __obj, _allDeps, _alljsDep, _depLibs, _file, _lib, _list, _tempArr, depList, file, i, len, makeDep;
    _allDeps = {};
    _depLibs = [];
    _alljsDep = this.allJsDep();
    makeDep = function(deps) {
      var _list, make;
      _list = [];
      make = function(deps) {
        return deps.forEach(function(dep) {
          var currDeps;
          currDeps = _alljsDep[dep];
          if (currDeps || dep.indexOf("/") !== -1) {
            make(currDeps);
          }
          return _list.push(dep);
        });
      };
      make(deps);
      return _list;
    };
    for (file in _alljsDep) {
      depList = _alljsDep[file];
      _allDeps[file] = {};
      _list = [];
      _lib = [];
      if (depList.length > 0) {
        _tempArr = makeDep(depList);
        _tempArr = _.union(_tempArr);
        for (i = 0, len = _tempArr.length; i < len; i++) {
          _file = _tempArr[i];
          if (indexOf.call(_list, _file) < 0 && _file.indexOf("/") !== -1) {
            _list.push(_file);
          } else {
            if (indexOf.call(_lib, _file) < 0) {
              _lib.push(_file);
            }
          }
          if (_file.indexOf("/") === -1) {
            _depLibs.push(_file);
          }
        }
      }
      _allDeps[file] = {
        modList: _list,
        libList: _lib
      };
    }
    __obj = {
      allDeps: _allDeps,
      depLibs: _depLibs
    };
    return __obj;
  };

  jsDepBuilder.prototype.makeRelateList = function(module_name) {
    var _allDeps, _depLibs, _list, _makeDeps, _module_name, deps, module;
    _module_name = module_name;
    if (_module_name.indexOf("/") === -1 || _module_name.indexOf('.') === 0) {
      gutil.log(color.red(_module_name), "not an AMD module");
      return false;
    }
    _list = [];
    _makeDeps = this.makeDeps();
    _allDeps = _makeDeps.allDeps;
    _depLibs = _makeDeps.depLibs;
    for (module in _allDeps) {
      deps = _allDeps[module];
      if (indexOf.call(deps.modList, _module_name) >= 0 || module === _module_name) {
        _list.push(module);
      }
    }
    return _list;
  };

  return jsDepBuilder;

})();


/*
 * 合并AMD模块到dist目录的继承类
 */

jsToDist = (function(superClass) {
  extend(jsToDist, superClass);

  function jsToDist() {
    this.noamd = bind(this.noamd, this);
    this.core = bind(this.core, this);
    this.init = bind(this.init, this);
    this.modulesToDev = bind(this.modulesToDev, this);
    this.oneModule = bind(this.oneModule, this);
    this.coreModule = bind(this.coreModule, this);
    this.rjsBuilder = bind(this.rjsBuilder, this);
    return jsToDist.__super__.constructor.apply(this, arguments);
  }

  jsToDist.prototype.prefix = config.prefix;

  jsToDist.prototype.outPath = config.jsDistPath;

  jsToDist.prototype.distPath = config.jsDistPath;

  jsToDist.prototype.coreMods = config.coreJsMods;

  jsToDist.prototype.configStr = "window['" + config.configName + "'] = " + (JSON.stringify(config.configDate, null, 2));


  /* AMD模块加载JS与第三方JS合并成核心JS库 */

  jsToDist.prototype.rjsBuilder = function(modules, cb) {
    var _baseUrl, _cb, _coreMods, _destPath, _include, _outName, _paths, _rjs, _shim;
    _cb = cb || function() {};
    _baseUrl = this.srcPath;
    _destPath = this.distPath;
    _outName = config.coreJsName;
    _coreMods = this.coreMods;
    _include = _.union(_coreMods.concat(modules));
    _paths = JSON.parse(fs.readFileSync(path.join(config.dataPath, 'jslibs.json'), 'utf8'));
    _shim = JSON.parse(fs.readFileSync(path.join(config.dataPath, 'shim.json'), 'utf8'));
    _rjs = rjs({
      baseUrl: _baseUrl,
      paths: _paths,
      include: _include,
      out: _outName + '.js',
      shim: _shim
    });
    return _rjs.on('data', function(output) {
      var _source;
      _source = String(output.contents);
      return _buildJs(_source, _outName, function(map) {
        _.assign(jsHash, map);
        return _cb();
      });
    });
  };


  /* 合并核心js模块 */

  jsToDist.prototype.coreModule = function(cb) {
    var _cb, _depLibs, _makeDeps;
    gutil.log(color.yellow("Combine " + config.coreJsName + " module! Waitting..."));
    _cb = cb || function() {};
    _makeDeps = this.makeDeps();
    _depLibs = _makeDeps.depLibs;
    return this.rjsBuilder(_depLibs, function() {
      return _cb();
    });
  };


  /* 合并单个模块 */

  jsToDist.prototype.oneModule = function(name, cb) {
    var _cb, _jsData, _jsFile, _moduleDeps, _module_name, _module_path, _num, _outName, _out_path, _source, _tempHash, _this_js, content, error, f, i, len;
    _cb = cb || function() {};
    _module_name = name;
    if (_module_name.indexOf("_") === 0) {
      return _cb();
    }
    _num = 0;
    if (_module_name.indexOf("/") === -1 || _module_name.indexOf('.') === 0) {
      gutil.log(_module_name + "not an AMD module");
    } else {
      _tempHash = {};
      _jsData = [];
      _module_path = this.srcPath;
      _out_path = this.outPath;
      _moduleDeps = this.makeDeps().allDeps[_module_name].modList;
      _this_js = path.join(_module_path, _module_name + '.js');
      _outName = this.prefix + _module_name.replace(/\//g, '_');
      for (i = 0, len = _moduleDeps.length; i < len; i++) {
        f = _moduleDeps[i];
        _jsFile = path.join(_module_path, f + '.js');
        if (fs.statSync(_jsFile).isFile()) {
          _source = fs.readFileSync(_jsFile, 'utf8');
          _jsData.push(_source + ';');
        }
      }
      _jsData.push(fs.readFileSync(_this_js, 'utf8') + ';');
      try {
        content = String(_jsData.join(''));
        _buildJs(content, _outName, function(map) {
          gutil.log("Combine", color.cyan(_module_name), "----> " + _outName + ".js");
          return _updateJsDistMap(map);
        });
      } catch (_error) {
        error = _error;
        gutil.log("Error: " + _devName);
        gutil.log(error);
      }
    }
    return _cb();
  };


  /* 合并js模块 */

  jsToDist.prototype.modulesToDev = function(cb) {
    var _allDeps, _cb, _depList, _jsData, _jsFile, _modList, _num, _outName, _source, _srcPath, _this_js, deps, error, f, i, len, module;
    _cb = cb || function() {};
    _srcPath = this.srcPath;
    _allDeps = this.makeDeps().allDeps;
    _depList = _allDeps.modList;
    _num = 0;
    gutil.log(color.yellow("Combine javascript modules! Waitting..."));
    for (module in _allDeps) {
      deps = _allDeps[module];
      if (module.indexOf("_") !== 0) {
        _this_js = path.join(_srcPath, module + '.js');
        _outName = this.prefix + module.replace(/\//g, '_');
        _jsData = [];
        _modList = deps.modList;
        for (i = 0, len = _modList.length; i < len; i++) {
          f = _modList[i];
          _jsFile = path.join(_srcPath, f + '.js');
          if (fs.statSync(_jsFile).isFile() && f.indexOf('.') !== 0) {
            _source = fs.readFileSync(_jsFile, 'utf8');
            _jsData.push(_source + ';');
          }
        }
        _jsData.push(fs.readFileSync(_this_js, 'utf8') + ';');
        if (_num % 10 === 0 && _num > 1) {
          gutil.log("Waitting...");
        }
        try {
          _source = String(_jsData.join(''));
          _buildJs(_source, _outName, function(map) {
            gutil.log("Combine", color.cyan("'" + module + "'"), "---> " + _outName);
            return jsHash = _.assign(jsHash, map);
          });
          _num++;
        } catch (_error) {
          error = _error;
          gutil.log("Error: " + _outName);
          gutil.log(error);
        }
      }
    }
    return _cb(_num);
  };

  jsToDist.prototype.init = function(cb) {
    var _cb, _modulesToDev;
    _cb = cb || function() {};
    _modulesToDev = this.modulesToDev;
    return _modulesToDev(function(num) {
      gutil.log(color.cyan(num), "javascript modules combined!");
      _buildJsDistMap(jsHash);
      return _cb();
    });
  };

  jsToDist.prototype.core = function(cb) {
    var _cb, _coreModule;
    _cb = cb || function() {};
    _coreModule = this.coreModule;
    return _coreModule(function() {
      gutil.log('\'' + color.cyan("" + config.coreJsName) + '\'', "combined!");
      _buildJsDistMap(jsHash);
      return _cb();
    });
  };

  jsToDist.prototype.noamd = function(cb) {
    var _cb, _srcPath;
    _cb = cb || function() {};
    _srcPath = this.srcPath;
    fs.readdirSync(_srcPath).forEach(function(v) {
      var _jsFile, _outName, _source;
      _jsFile = path.join(_srcPath, v);
      if (fs.statSync(_jsFile).isFile() && v.indexOf('.') !== 0) {
        _source = fs.readFileSync(_jsFile, 'utf8');
        _outName = v.replace('.js', '');
        return _buildJs(_source, _outName, function(map) {
          jsHash = _.assign(jsHash, map);
          return _buildJsDistMap(jsHash);
        });
      }
    });
    return _cb();
  };

  return jsToDist;

})(jsDepBuilder);

exports.bder = jsDepBuilder;

exports.dist = jsToDist;
