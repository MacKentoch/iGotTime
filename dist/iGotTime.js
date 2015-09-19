"format global";
(function(global) {

  var defined = {};

  // indexOf polyfill for IE8
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  var getOwnPropertyDescriptor = true;
  try {
    Object.getOwnPropertyDescriptor({ a: 0 }, 'a');
  }
  catch(e) {
    getOwnPropertyDescriptor = false;
  }

  var defineProperty;
  (function () {
    try {
      if (!!Object.defineProperty({}, 'a', {}))
        defineProperty = Object.defineProperty;
    }
    catch (e) {
      defineProperty = function(obj, prop, opt) {
        try {
          obj[prop] = opt.value || opt.get.call(obj);
        }
        catch(e) {}
      }
    }
  })();

  function register(name, deps, declare) {
    if (arguments.length === 4)
      return registerDynamic.apply(this, arguments);
    doRegister(name, {
      declarative: true,
      deps: deps,
      declare: declare
    });
  }

  function registerDynamic(name, deps, executingRequire, execute) {
    doRegister(name, {
      declarative: false,
      deps: deps,
      executingRequire: executingRequire,
      execute: execute
    });
  }

  function doRegister(name, entry) {
    entry.name = name;

    // we never overwrite an existing define
    if (!(name in defined))
      defined[name] = entry;

    // we have to normalize dependencies
    // (assume dependencies are normalized for now)
    // entry.normalizedDeps = entry.deps.map(normalize);
    entry.normalizedDeps = entry.deps;
  }


  function buildGroups(entry, groups) {
    groups[entry.groupIndex] = groups[entry.groupIndex] || [];

    if (indexOf.call(groups[entry.groupIndex], entry) != -1)
      return;

    groups[entry.groupIndex].push(entry);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];

      // not in the registry means already linked / ES6
      if (!depEntry || depEntry.evaluated)
        continue;

      // now we know the entry is in our unlinked linkage group
      var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);

      // the group index of an entry is always the maximum
      if (depEntry.groupIndex === undefined || depEntry.groupIndex < depGroupIndex) {

        // if already in a group, remove from the old group
        if (depEntry.groupIndex !== undefined) {
          groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1);

          // if the old group is empty, then we have a mixed depndency cycle
          if (groups[depEntry.groupIndex].length == 0)
            throw new TypeError("Mixed dependency cycle detected");
        }

        depEntry.groupIndex = depGroupIndex;
      }

      buildGroups(depEntry, groups);
    }
  }

  function link(name) {
    var startEntry = defined[name];

    startEntry.groupIndex = 0;

    var groups = [];

    buildGroups(startEntry, groups);

    var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = groups[i];
      for (var j = 0; j < group.length; j++) {
        var entry = group[j];

        // link each group
        if (curGroupDeclarative)
          linkDeclarativeModule(entry);
        else
          linkDynamicModule(entry);
      }
      curGroupDeclarative = !curGroupDeclarative; 
    }
  }

  // module binding records
  var moduleRecords = {};
  function getOrCreateModuleRecord(name) {
    return moduleRecords[name] || (moduleRecords[name] = {
      name: name,
      dependencies: [],
      exports: {}, // start from an empty module and extend
      importers: []
    })
  }

  function linkDeclarativeModule(entry) {
    // only link if already not already started linking (stops at circular)
    if (entry.module)
      return;

    var module = entry.module = getOrCreateModuleRecord(entry.name);
    var exports = entry.module.exports;

    var declaration = entry.declare.call(global, function(name, value) {
      module.locked = true;
      exports[name] = value;

      for (var i = 0, l = module.importers.length; i < l; i++) {
        var importerModule = module.importers[i];
        if (!importerModule.locked) {
          for (var j = 0; j < importerModule.dependencies.length; ++j) {
            if (importerModule.dependencies[j] === module) {
              importerModule.setters[j](exports);
            }
          }
        }
      }

      module.locked = false;
      return value;
    });

    module.setters = declaration.setters;
    module.execute = declaration.execute;

    // now link all the module dependencies
    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];
      var depModule = moduleRecords[depName];

      // work out how to set depExports based on scenarios...
      var depExports;

      if (depModule) {
        depExports = depModule.exports;
      }
      else if (depEntry && !depEntry.declarative) {
        depExports = depEntry.esModule;
      }
      // in the module registry
      else if (!depEntry) {
        depExports = load(depName);
      }
      // we have an entry -> link
      else {
        linkDeclarativeModule(depEntry);
        depModule = depEntry.module;
        depExports = depModule.exports;
      }

      // only declarative modules have dynamic bindings
      if (depModule && depModule.importers) {
        depModule.importers.push(module);
        module.dependencies.push(depModule);
      }
      else
        module.dependencies.push(null);

      // run the setter for this dependency
      if (module.setters[i])
        module.setters[i](depExports);
    }
  }

  // An analog to loader.get covering execution of all three layers (real declarative, simulated declarative, simulated dynamic)
  function getModule(name) {
    var exports;
    var entry = defined[name];

    if (!entry) {
      exports = load(name);
      if (!exports)
        throw new Error("Unable to load dependency " + name + ".");
    }

    else {
      if (entry.declarative)
        ensureEvaluated(name, []);

      else if (!entry.evaluated)
        linkDynamicModule(entry);

      exports = entry.module.exports;
    }

    if ((!entry || entry.declarative) && exports && exports.__useDefault)
      return exports['default'];

    return exports;
  }

  function linkDynamicModule(entry) {
    if (entry.module)
      return;

    var exports = {};

    var module = entry.module = { exports: exports, id: entry.name };

    // AMD requires execute the tree first
    if (!entry.executingRequire) {
      for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = defined[depName];
        if (depEntry)
          linkDynamicModule(depEntry);
      }
    }

    // now execute
    entry.evaluated = true;
    var output = entry.execute.call(global, function(name) {
      for (var i = 0, l = entry.deps.length; i < l; i++) {
        if (entry.deps[i] != name)
          continue;
        return getModule(entry.normalizedDeps[i]);
      }
      throw new TypeError('Module ' + name + ' not declared as a dependency.');
    }, exports, module);

    if (output)
      module.exports = output;

    // create the esModule object, which allows ES6 named imports of dynamics
    exports = module.exports;
 
    if (exports && exports.__esModule) {
      entry.esModule = exports;
    }
    else {
      entry.esModule = {};
      
      // don't trigger getters/setters in environments that support them
      if (typeof exports == 'object' || typeof exports == 'function') {
        if (getOwnPropertyDescriptor) {
          var d;
          for (var p in exports)
            if (d = Object.getOwnPropertyDescriptor(exports, p))
              defineProperty(entry.esModule, p, d);
        }
        else {
          var hasOwnProperty = exports && exports.hasOwnProperty;
          for (var p in exports) {
            if (!hasOwnProperty || exports.hasOwnProperty(p))
              entry.esModule[p] = exports[p];
          }
         }
       }
      entry.esModule['default'] = exports;
      defineProperty(entry.esModule, '__useDefault', {
        value: true
      });
    }
  }

  /*
   * Given a module, and the list of modules for this current branch,
   *  ensure that each of the dependencies of this module is evaluated
   *  (unless one is a circular dependency already in the list of seen
   *  modules, in which case we execute it)
   *
   * Then we evaluate the module itself depth-first left to right 
   * execution to match ES6 modules
   */
  function ensureEvaluated(moduleName, seen) {
    var entry = defined[moduleName];

    // if already seen, that means it's an already-evaluated non circular dependency
    if (!entry || entry.evaluated || !entry.declarative)
      return;

    // this only applies to declarative modules which late-execute

    seen.push(moduleName);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      if (indexOf.call(seen, depName) == -1) {
        if (!defined[depName])
          load(depName);
        else
          ensureEvaluated(depName, seen);
      }
    }

    if (entry.evaluated)
      return;

    entry.evaluated = true;
    entry.module.execute.call(global);
  }

  // magical execution function
  var modules = {};
  function load(name) {
    if (modules[name])
      return modules[name];

    var entry = defined[name];

    // first we check if this module has already been defined in the registry
    if (!entry)
      throw "Module " + name + " not present.";

    // recursively ensure that the module and all its 
    // dependencies are linked (with dependency group handling)
    link(name);

    // now handle dependency execution in correct order
    ensureEvaluated(name, []);

    // remove from the registry
    defined[name] = undefined;

    // exported modules get __esModule defined for interop
    if (entry.declarative)
      defineProperty(entry.module.exports, '__esModule', { value: true });

    // return the defined module object
    return modules[name] = entry.declarative ? entry.module.exports : entry.esModule;
  };

  return function(mains, depNames, declare) {
    return function(formatDetect) {
      formatDetect(function(deps) {
        var System = {
          _nodeRequire: typeof require != 'undefined' && require.resolve && typeof process != 'undefined' && require,
          register: register,
          registerDynamic: registerDynamic,
          get: load, 
          set: function(name, module) {
            modules[name] = module; 
          },
          newModule: function(module) {
            return module;
          }
        };
        System.set('@empty', {});

        // register external dependencies
        for (var i = 0; i < depNames.length; i++) (function(depName, dep) {
          if (dep && dep.__esModule)
            System.register(depName, [], function(_export) {
              return {
                setters: [],
                execute: function() {
                  for (var p in dep)
                    if (p != '__esModule' && !(typeof p == 'object' && p + '' == 'Module'))
                      _export(p, dep[p]);
                }
              };
            });
          else
            System.registerDynamic(depName, [], false, function() {
              return dep;
            });
        })(depNames[i], arguments[i]);

        // register modules in this bundle
        declare(System);

        // load mains
        var firstLoad = load(mains[0]);
        if (mains.length > 1)
          for (var i = 1; i < mains.length; i++)
            load(mains[i]);

        if (firstLoad.__useDefault)
          return firstLoad['default'];
        else
          return firstLoad;
      });
    };
  };

})(typeof self != 'undefined' ? self : global)
/* (['mainModule'], ['external-dep'], function($__System) {
  System.register(...);
})
(function(factory) {
  if (typeof define && define.amd)
    define(['external-dep'], factory);
  // etc UMD / module pattern
})*/

(['0'], [], function($__System) {

(function(__global) {
  var loader = $__System;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  function readMemberExpression(p, value) {
    var pParts = p.split('.');
    while (pParts.length)
      value = value[pParts.shift()];
    return value;
  }

  // bare minimum ignores for IE8
  var ignoredGlobalProps = ['_g', 'sessionStorage', 'localStorage', 'clipboardData', 'frames', 'external', 'mozAnimationStartTime', 'webkitStorageInfo', 'webkitIndexedDB'];

  var globalSnapshot;

  function forEachGlobal(callback) {
    if (Object.keys)
      Object.keys(__global).forEach(callback);
    else
      for (var g in __global) {
        if (!hasOwnProperty.call(__global, g))
          continue;
        callback(g);
      }
  }

  function forEachGlobalValue(callback) {
    forEachGlobal(function(globalName) {
      if (indexOf.call(ignoredGlobalProps, globalName) != -1)
        return;
      try {
        var value = __global[globalName];
      }
      catch (e) {
        ignoredGlobalProps.push(globalName);
      }
      callback(globalName, value);
    });
  }

  loader.set('@@global-helpers', loader.newModule({
    prepareGlobal: function(moduleName, exportName, globals) {
      // disable module detection
      var curDefine = __global.define;
       
      __global.define = undefined;
      __global.exports = undefined;
      if (__global.module && __global.module.exports)
        __global.module = undefined;

      // set globals
      var oldGlobals;
      if (globals) {
        oldGlobals = {};
        for (var g in globals) {
          oldGlobals[g] = globals[g];
          __global[g] = globals[g];
        }
      }

      // store a complete copy of the global object in order to detect changes
      if (!exportName) {
        globalSnapshot = {};

        forEachGlobalValue(function(name, value) {
          globalSnapshot[name] = value;
        });
      }

      // return function to retrieve global
      return function() {
        var globalValue;

        if (exportName) {
          globalValue = readMemberExpression(exportName, __global);
        }
        else {
          var singleGlobal;
          var multipleExports;
          var exports = {};

          forEachGlobalValue(function(name, value) {
            if (globalSnapshot[name] === value)
              return;
            if (typeof value == 'undefined')
              return;
            exports[name] = value;

            if (typeof singleGlobal != 'undefined') {
              if (!multipleExports && singleGlobal !== value)
                multipleExports = true;
            }
            else {
              singleGlobal = value;
            }
          });
          globalValue = multipleExports ? exports : singleGlobal;
        }

        // revert globals
        if (oldGlobals) {
          for (var g in oldGlobals)
            __global[g] = oldGlobals[g];
        }
        __global.define = curDefine;

        return globalValue;
      };
    }
  }));

})(typeof self != 'undefined' ? self : global);

$__System.registerDynamic("2", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = $__System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {})();
  return _retrieveGlobal();
});

$__System.registerDynamic("b", ["d"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _Object$defineProperty = require("d")["default"];
  exports["default"] = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        _Object$defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("c", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports["default"] = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("a", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = "<h1>\n\t<p \tid=\"iGotTimeTimer\" \n\t\t\tstyle=\"{{customization.style.fontSize}}\"\n\t\t\tclass=\"{{customization.cssClass.iGotTimeTimerClass}}\">\n\t\t\t{{iGotTimeCtrl.timer | date: 'hh:mm:ss'}}\n\t</p>\t\n</h1>\n";
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("d", ["e"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("e"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("e", ["f"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("f");
  module.exports = function defineProperty(it, key, desc) {
    return $.setDesc(it, key, desc);
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("f", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $Object = Object;
  module.exports = {
    create: $Object.create,
    getProto: $Object.getPrototypeOf,
    isEnum: {}.propertyIsEnumerable,
    getDesc: $Object.getOwnPropertyDescriptor,
    setDesc: $Object.defineProperty,
    setDescs: $Object.defineProperties,
    getKeys: $Object.keys,
    getNames: $Object.getOwnPropertyNames,
    getSymbols: $Object.getOwnPropertySymbols,
    each: [].forEach
  };
  global.define = __define;
  return module.exports;
});

$__System.register('0', ['1'], function (_export) {
  'use strict';

  var mainModule;
  return {
    setters: [function (_) {
      mainModule = _['default'];
    }],
    execute: function () {

      angular.element(document).ready(function () {
        angular.bootstrap(document, [mainModule.name], { strictDi: true });
        //angular.bootstrap(document, [mainModule.name]);
      });
    }
  };
});
$__System.register('1', ['2', '3', '4'], function (_export) {
										'use strict';

										var iGotTimeModule, appConfig, MAIN_MODULE_NAME, mainModule;
										return {
																				setters: [function (_) {}, function (_2) {
																														iGotTimeModule = _2['default'];
																				}, function (_3) {
																														appConfig = _3['default'];
																				}],
																				execute: function () {
																														MAIN_MODULE_NAME = 'demoApp';
																														mainModule = angular.module(MAIN_MODULE_NAME, [iGotTimeModule.name]).config(appConfig);

																														_export('default', mainModule);
																				}
										};
});
$__System.register('4', [], function (_export) {
	'use strict';

	var FONT_SIZE_SETTING, FONT_SIZE_UNIT_SETTING;

	function appConfig(iGotTimeConfigProvider) {
		iGotTimeConfigProvider.setFontSize(FONT_SIZE_SETTING, FONT_SIZE_UNIT_SETTING);
	}

	return {
		setters: [],
		execute: function () {
			FONT_SIZE_SETTING = 52;
			FONT_SIZE_UNIT_SETTING = 'px';
			appConfig.$inject = ['iGotTimeConfigProvider'];

			_export('default', appConfig);
		}
	};
});
$__System.register('3', ['5', '6'], function (_export) {
                'use strict';

                var iGotTimeDirective, iGotTimeConfigProvider, I_GOT_TIME_MODULE_NAME, I_GOT_TIME_CONFIG_PROVIDER;
                return {
                                setters: [function (_) {
                                                iGotTimeDirective = _['default'];
                                }, function (_2) {
                                                iGotTimeConfigProvider = _2['default'];
                                }],
                                execute: function () {
                                                I_GOT_TIME_MODULE_NAME = 'iGotTime';
                                                I_GOT_TIME_CONFIG_PROVIDER = 'iGotTimeConfig';

                                                _export('default', angular.module(I_GOT_TIME_MODULE_NAME, []).directive(I_GOT_TIME_MODULE_NAME, iGotTimeDirective).provider(I_GOT_TIME_CONFIG_PROVIDER, iGotTimeConfigProvider));
                                }
                };
});
$__System.register('6', ['7'], function (_export) {
	'use strict';

	var DEFAULT_SIZE_UNIT, DEFAULT_FONT_SIZE, applyFontSize;

	function iGotTimeConfigProviderFct() {

		var _defaultConfig = {
			fontSize: applyFontSize(DEFAULT_FONT_SIZE, DEFAULT_SIZE_UNIT)
		};
		var _customization = initCustomization();

		this.getFontSize = getFontSizeFct;
		this.setFontSize = setFontSizeFct;
		/* jshint validthis:true */
		this.$get = iGotTimeConfig;

		/**
   * applies default config to customization
   */
		function initCustomization() {
			return angular.copy(_defaultConfig);
		}

		function getFontSizeFct() {
			return _customization.fontSize;
		}

		function setFontSizeFct(targetFontSize, targetFontSizeUnit) {
			console.warn('applyFontSize(targetFontSize, targetFontSizeUnit); \n\t\t= ' + applyFontSize(targetFontSize, targetFontSizeUnit) + ' \n\t\tavec targetFontSize = ' + targetFontSize + '\n\t\tet targetFontSizeUnit = ' + targetFontSizeUnit);

			_customization.fontSize = applyFontSize(targetFontSize, targetFontSizeUnit);
		}

		//$get injection here
		iGotTimeConfig.$inject = [];
		function iGotTimeConfig() {

			var service = {
				getDefaultFontSize: getDefaultFontSize,
				getFontSize: getFontSizeFct,
				setFontSize: setFontSizeFct
			};
			return service;

			/**
    * return default font size value
    */
			function getDefaultFontSize() {
				return _defaultConfig.fontSize;
			}
			/**
    * retuns actual customized font size
    */
			function getFontSizeFct() {
				var actualFontSize = angular.copy(_customization.fontSize);
				return actualFontSize;
			}
			/**
    * set a new font size */
			function setFontSizeFct(targetFontSize, targetFontSizeUnit) {
				_customization.fontSize = applyFontSize(targetFontSize, targetFontSizeUnit);
			}
		}
	}

	return {
		setters: [function (_) {
			DEFAULT_SIZE_UNIT = _.DEFAULT_SIZE_UNIT;
			DEFAULT_FONT_SIZE = _.DEFAULT_FONT_SIZE;
			applyFontSize = _.applyFontSize;
		}],
		execute: function () {
			iGotTimeConfigProviderFct.$inject = [];

			_export('default', iGotTimeConfigProviderFct);
		}
	};
});
$__System.register('5', ['8', '9', 'a'], function (_export) {
  'use strict';

  var iGotTimeController, iGotTimeTimerCss, iGotTimeTemplate;

  function iGotTimeDirective() {
    var directive = {
      restrict: "E",
      scope: {},
      template: iGotTimeTemplate,
      bindToController: true,
      controllerAs: "iGotTimeCtrl",
      controller: iGotTimeController,
      link: linkfct
    };
    return directive;

    function linkfct(scope, element, attrs, ctrl, transclude) {

      scope.customization = {}; //customization object

      angular.extend(scope.customization, {
        style: {
          fontSize: 'font-size:' + scope.iGotTimeCtrl.currentFontSize + ';'
        },
        cssClass: {
          iGotTimeTimerClass: iGotTimeTimerCss
        }
      });

      console.info('from directive, font size is : ' + scope.iGotTimeCtrl.currentFontSize);

      var MESSAGE = 'don\'t tap this timer, it is delicate!';
      element.on('click', function () {
        return console.log(MESSAGE);
      });
    }
  }

  return {
    setters: [function (_) {
      iGotTimeController = _['default'];
    }, function (_2) {
      iGotTimeTimerCss = _2.iGotTimeTimerCss;
    }, function (_a) {
      iGotTimeTemplate = _a['default'];
    }],
    execute: function () {
      iGotTimeDirective.$inject = [];

      _export('default', iGotTimeDirective);
    }
  };
});
$__System.register('7', [], function (_export) {
	'use strict';

	var FONT_SIZE_UNITS, DEFAULT_SIZE_UNIT, DEFAULT_FONT_SIZE, isValidFontSizeUnit, applyFontSize;
	return {
		setters: [],
		execute: function () {
			FONT_SIZE_UNITS = ['px', 'em'];
			DEFAULT_SIZE_UNIT = FONT_SIZE_UNITS[0];
			DEFAULT_FONT_SIZE = 12;

			/**
    * check is targetFontSizeUnit exists in managed font size (FONT_SIZE_UNITS)
    */

			isValidFontSizeUnit = function isValidFontSizeUnit(targetFontSizeUnit) {
				var isValid = false;
				if (angular.isDefined(targetFontSizeUnit)) {
					angular.forEach(FONT_SIZE_UNITS, function (value) {
						isValid = targetFontSizeUnit === value ? isValid || true : isValid || false;
					});
				}
				return isValid;
			};

			/**
    * return valid font-size (string)
    * 
    * NOTE : To return target font size and unit : 
    * - target font-size 
    * - target font size unit 
    * -> must be both valid
    */

			applyFontSize = function applyFontSize(targetFontSize, targetFontSizeUnit) {
				var fontSizeApplied = '' + DEFAULT_FONT_SIZE + DEFAULT_SIZE_UNIT;

				if (isValidFontSizeUnit(targetFontSizeUnit)) {
					if (angular.isDefined(targetFontSize)) {
						fontSizeApplied = '' + targetFontSize + targetFontSizeUnit;
					}
				}
				return fontSizeApplied;
			};

			_export('DEFAULT_SIZE_UNIT', DEFAULT_SIZE_UNIT);

			_export('DEFAULT_FONT_SIZE', DEFAULT_FONT_SIZE);

			_export('applyFontSize', applyFontSize);
		}
	};
});
$__System.register("9", [], function (_export) {
  "use strict";

  var iGotTimeTimerCss;
  return {
    setters: [],
    execute: function () {
      iGotTimeTimerCss = "iGotTimeTimerNeon";

      _export("iGotTimeTimerCss", iGotTimeTimerCss);
    }
  };
});
$__System.register('8', ['b', 'c'], function (_export) {
  var _createClass, _classCallCheck, ONE_SECOND, iGotTimeController;

  return {
    setters: [function (_b) {
      _createClass = _b['default'];
    }, function (_c) {
      _classCallCheck = _c['default'];
    }],
    execute: function () {
      'use strict';

      ONE_SECOND = 1000;

      iGotTimeController = (function () {
        function iGotTimeController($timeout, iGotTimeConfig) {
          _classCallCheck(this, iGotTimeController);

          this.$timeout = $timeout;
          this.iGotTimeConfig = iGotTimeConfig;

          this.init();
          //let's go infinite count :
          this.oneAnotherSec();
        }

        _createClass(iGotTimeController, [{
          key: 'init',
          value: function init() {
            this.timer = this.newTime();
            this.timeoutPromise = {};

            this.currentFontSize = this.iGotTimeConfig.getFontSize();
          }
        }, {
          key: 'newTime',
          value: function newTime() {
            return new Date();
          }
        }, {
          key: 'oneAnotherSec',
          value: function oneAnotherSec() {
            var _this = this;

            this.timer = this.newTime();
            //cancel previous timeout before starting another (NOTE : $timeout return promise)
            if (this.timeoutPromise) this.$timeout.cancel(this.timeoutPromise);
            this.timeoutPromise = this.$timeout(function () {
              return _this.oneAnotherSec();
            }, ONE_SECOND);
          }
        }]);

        return iGotTimeController;
      })();

      iGotTimeController.$inject = ['$timeout', 'iGotTimeConfig'];

      _export('default', iGotTimeController);
    }
  };
});
})
(function(factory) {
  factory();
});
//# sourceMappingURL=iGotTime.js.map