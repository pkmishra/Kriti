(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.brunch = true;
})();

window.require.register("application", function(exports, require, module) {
  (function() {
    var Application, ChaplinApplication, HomeController, NavigationController, SessionController, mediator, routes,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    ChaplinApplication = require('chaplin/application');

    NavigationController = require('controllers/navigation_controller');

    SessionController = require('controllers/session_controller');

    HomeController = require('controllers/home_controller');

    routes = require('routes');

    module.exports = Application = (function(_super) {

      __extends(Application, _super);

      function Application() {
        Application.__super__.constructor.apply(this, arguments);
      }

      Application.prototype.title = 'Example brunch application';

      Application.prototype.initialize = function() {
        console.debug('KritiApplication#initialize');
        Application.__super__.initialize.apply(this, arguments);
        new SessionController();
        new NavigationController();
        this.initRouter(routes, {
          pushState: false
        });
        return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
      };

      return Application;

    })(ChaplinApplication);

  }).call(this);
  
});
window.require.register("chaplin/application", function(exports, require, module) {
  (function() {
    var Application, ApplicationController, ApplicationView, Router, mediator;

    mediator = require('mediator');

    ApplicationController = require('chaplin/controllers/application_controller');

    ApplicationView = require('chaplin/views/application_view');

    Router = require('chaplin/lib/router');

    module.exports = Application = (function() {

      function Application() {}

      Application.prototype.title = '';

      Application.prototype.applicationController = null;

      Application.prototype.applicationView = null;

      Application.prototype.router = null;

      Application.prototype.initialize = function() {
        /*console.debug 'Application#initialize'
        */      this.applicationController = new ApplicationController();
        return this.applicationView = new ApplicationView({
          title: this.title
        });
      };

      Application.prototype.initRouter = function(routes, options) {
        this.router = new Router(options);
        if (typeof routes === "function") routes(this.router.match);
        return this.router.startHistory();
      };

      Application.prototype.disposed = false;

      Application.prototype.dispose = function() {
        /*console.debug 'Application#dispose'
        */
        var prop, properties, _i, _len;
        if (this.disposed) return;
        properties = ['applicationController', 'applicationView', 'router'];
        for (_i = 0, _len = properties.length; _i < _len; _i++) {
          prop = properties[_i];
          this[prop].dispose();
          delete this[prop];
        }
        this.disposed = true;
        return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
      };

      return Application;

    })();

  }).call(this);
  
});
window.require.register("chaplin/controllers/application_controller", function(exports, require, module) {
  (function() {
    var ApplicationController, Subscriber, mediator, utils;

    mediator = require('mediator');

    utils = require('chaplin/lib/utils');

    Subscriber = require('chaplin/lib/subscriber');

    module.exports = ApplicationController = (function() {

      _(ApplicationController.prototype).extend(Subscriber);

      ApplicationController.prototype.previousControllerName = null;

      ApplicationController.prototype.currentControllerName = null;

      ApplicationController.prototype.currentController = null;

      ApplicationController.prototype.currentAction = null;

      ApplicationController.prototype.currentParams = null;

      ApplicationController.prototype.url = null;

      function ApplicationController() {
        this.initialize();
      }

      ApplicationController.prototype.initialize = function() {
        /*console.debug 'ApplicationController#initialize'
        */      this.subscribeEvent('matchRoute', this.matchRoute);
        return this.subscribeEvent('!startupController', this.startupController);
      };

      ApplicationController.prototype.matchRoute = function(route, params) {
        return this.startupController(route.controller, route.action, params);
      };

      ApplicationController.prototype.startupController = function(controllerName, action, params) {
        var controllerFileName, handler, isSameController;
        if (action == null) action = 'index';
        if (params == null) params = {};
        /*console.debug 'ApplicationController#startupController', controllerName, action, params
        */
        if (params.changeURL !== false) params.changeURL = true;
        if (params.forceStartup !== true) params.forceStartup = false;
        isSameController = !params.forceStartup && this.currentControllerName === controllerName && this.currentAction === action && (!this.currentParams || _(params).isEqual(this.currentParams));
        if (isSameController) return;
        controllerFileName = utils.underscorize(controllerName) + '_controller';
        handler = _(this.controllerLoaded).bind(this, controllerName, action, params);
        return handler(require('controllers/' + controllerFileName));
      };

      ApplicationController.prototype.controllerLoaded = function(controllerName, action, params, ControllerConstructor) {
        var controller, currentController, currentControllerName;
        currentControllerName = this.currentControllerName || null;
        currentController = this.currentController || null;
        if (currentController) {
          mediator.publish('beforeControllerDispose', currentController);
          currentController.dispose(params, controllerName);
        }
        controller = new ControllerConstructor(params, currentControllerName);
        controller[action](params, currentControllerName);
        this.previousControllerName = currentControllerName;
        this.currentControllerName = controllerName;
        this.currentController = controller;
        this.currentAction = action;
        this.currentParams = params;
        this.adjustURL(controller, params);
        return mediator.publish('startupController', {
          previousControllerName: this.previousControllerName,
          controller: this.currentController,
          controllerName: this.currentControllerName,
          params: this.currentParams
        });
      };

      ApplicationController.prototype.adjustURL = function(controller, params) {
        var url;
        if (params.path) {
          url = params.path;
        } else if (typeof controller.historyURL === 'function') {
          url = controller.historyURL(params);
        } else if (typeof controller.historyURL === 'string') {
          url = controller.historyURL;
        } else {
          throw new Error('ApplicationController#adjustURL: controller for ' + ("" + this.currentControllerName + " does not provide a historyURL"));
        }
        if (params.changeURL) mediator.publish('!router:changeURL', url);
        return this.url = url;
      };

      ApplicationController.prototype.disposed = false;

      ApplicationController.prototype.dispose = function() {
        /*console.debug 'ApplicationController#dispose
        */      if (this.disposed) return;
        this.unsubscribeAllEvents();
        this.disposed = true;
        return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
      };

      return ApplicationController;

    })();

  }).call(this);
  
});
window.require.register("chaplin/controllers/controller", function(exports, require, module) {
  (function() {
    var Controller, Subscriber,
      __hasProp = Object.prototype.hasOwnProperty;

    Subscriber = require('chaplin/lib/subscriber');

    module.exports = Controller = (function() {

      _(Controller.prototype).extend(Subscriber);

      Controller.prototype.view = null;

      Controller.prototype.currentId = null;

      function Controller() {
        this.initialize.apply(this, arguments);
      }

      Controller.prototype.initialize = function() {};

      Controller.prototype.disposed = false;

      Controller.prototype.dispose = function() {
        /*console.debug 'Controller#dispose', this, 'disposed?', @disposed
        */
        var obj, prop, properties, _i, _len;
        if (this.disposed) return;
        for (prop in this) {
          if (!__hasProp.call(this, prop)) continue;
          obj = this[prop];
          if (obj && typeof obj.dispose === 'function') {
            obj.dispose();
            delete this[prop];
          }
        }
        this.unsubscribeAllEvents();
        properties = ['currentId'];
        for (_i = 0, _len = properties.length; _i < _len; _i++) {
          prop = properties[_i];
          delete this[prop];
        }
        this.disposed = true;
        return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
      };

      return Controller;

    })();

  }).call(this);
  
});
window.require.register("chaplin/lib/create_mediator", function(exports, require, module) {
  (function() {
    var descriptorsSupported, support;

    support = require('chaplin/lib/support');

    descriptorsSupported = support.propertyDescriptors;

    module.exports = function(options) {
      var defineProperty, mediator, privateUser, readonly, readonlyDescriptor;
      if (options == null) options = {};
      _(options).defaults({
        createUserProperty: false
      });
      defineProperty = function(prop, descriptor) {
        if (!descriptorsSupported) return;
        return Object.defineProperty(mediator, prop, descriptor);
      };
      readonlyDescriptor = {
        writable: false,
        enumerable: true,
        configurable: false
      };
      readonly = function() {
        var prop, _i, _len, _results;
        if (!descriptorsSupported) return;
        _results = [];
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          prop = arguments[_i];
          _results.push(defineProperty(prop, readonlyDescriptor));
        }
        return _results;
      };
      mediator = {};
      mediator.subscribe = mediator.on = Backbone.Events.on;
      mediator.unsubscribe = mediator.off = Backbone.Events.off;
      mediator.publish = mediator.trigger = Backbone.Events.trigger;
      mediator._callbacks = null;
      readonly('subscribe', 'unsubscribe', 'publish');
      if (options.createUserProperty) {
        mediator.user = null;
        privateUser = null;
        defineProperty('user', {
          get: function() {
            return privateUser;
          },
          set: function() {
            throw new Error('mediator.user is not writable directly. ' + 'Please use mediator.setUser instead.');
          },
          enumerable: true,
          configurable: false
        });
        mediator.setUser = function(user) {
          if (descriptorsSupported) {
            return privateUser = user;
          } else {
            return mediator.user = user;
          }
        };
        readonly('setUser');
      }
      return mediator;
    };

  }).call(this);
  
});
window.require.register("chaplin/lib/route", function(exports, require, module) {
  (function() {
    var Route, mediator,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty;

    mediator = require('mediator');

    module.exports = Route = (function() {
      var escapeRegExp, queryStringFieldSeparator, queryStringValueSeparator, reservedParams;

      reservedParams = 'path changeURL'.split(' ');

      escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;

      queryStringFieldSeparator = '&';

      queryStringValueSeparator = '=';

      function Route(pattern, target, options) {
        var _ref;
        this.options = options != null ? options : {};
        this.handler = __bind(this.handler, this);
        this.addParamName = __bind(this.addParamName, this);
        /*console.debug 'Route#constructor', pattern, target, options
        */
        this.pattern = pattern;
        _ref = target.split('#'), this.controller = _ref[0], this.action = _ref[1];
        this.createRegExp();
      }

      Route.prototype.createRegExp = function() {
        var pattern;
        if (_.isRegExp(this.pattern)) {
          this.regExp = this.pattern;
          return;
        }
        pattern = this.pattern.replace(escapeRegExp, '\\$&').replace(/:(\w+)/g, this.addParamName);
        return this.regExp = RegExp("^" + pattern + "(?=\\?|$)");
      };

      Route.prototype.addParamName = function(match, paramName) {
        if (this.paramNames == null) this.paramNames = [];
        if (_(reservedParams).include(paramName)) {
          throw new Error("Route#addParamName: parameter name " + paramName + " is reserved");
        }
        this.paramNames.push(paramName);
        return '([\\w-]+)';
      };

      Route.prototype.test = function(path) {
        /*console.debug 'Route#test', this, "path »#{path}«", typeof path
        */
        var constraint, constraints, matched, name, params;
        matched = this.regExp.test(path);
        if (!matched) return false;
        constraints = this.options.constraints;
        if (constraints) {
          params = this.extractParams(path);
          for (name in constraints) {
            if (!__hasProp.call(constraints, name)) continue;
            constraint = constraints[name];
            if (!constraint.test(params[name])) return false;
          }
        }
        return true;
      };

      Route.prototype.handler = function(path, options) {
        /*console.debug 'Route#handler', this, path, options
        */
        var params;
        params = this.buildParams(path, options);
        return mediator.publish('matchRoute', this, params);
      };

      Route.prototype.buildParams = function(path, options) {
        var params, patternParams, queryParams;
        params = {};
        queryParams = this.extractQueryParams(path);
        _(params).extend(queryParams);
        patternParams = this.extractParams(path);
        _(params).extend(patternParams);
        _(params).extend(this.options.params);
        params.changeURL = Boolean(options && options.changeURL);
        params.path = path;
        return params;
      };

      Route.prototype.extractParams = function(path) {
        var index, match, matches, paramName, params, _len, _ref;
        params = {};
        matches = this.regExp.exec(path);
        _ref = matches.slice(1);
        for (index = 0, _len = _ref.length; index < _len; index++) {
          match = _ref[index];
          paramName = this.paramNames ? this.paramNames[index] : index;
          params[paramName] = match;
        }
        return params;
      };

      Route.prototype.extractQueryParams = function(path) {
        var current, field, matches, pair, pairs, params, queryString, regExp, value, _i, _len, _ref;
        params = {};
        regExp = /\?(.+?)(?=#|$)/;
        matches = regExp.exec(path);
        if (!matches) return params;
        queryString = matches[1];
        pairs = queryString.split(queryStringFieldSeparator);
        for (_i = 0, _len = pairs.length; _i < _len; _i++) {
          pair = pairs[_i];
          if (!pair.length) continue;
          _ref = pair.split(queryStringValueSeparator), field = _ref[0], value = _ref[1];
          if (!field.length) continue;
          field = decodeURIComponent(field);
          value = decodeURIComponent(value);
          current = params[field];
          if (current) {
            if (current.push) {
              current.push(value);
            } else {
              params[field] = [current, value];
            }
          } else {
            params[field] = value;
          }
        }
        return params;
      };

      return Route;

    })();

  }).call(this);
  
});
window.require.register("chaplin/lib/router", function(exports, require, module) {
  (function() {
    var Route, Router, Subscriber, mediator,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

    mediator = require('mediator');

    Subscriber = require('chaplin/lib/subscriber');

    Route = require('chaplin/lib/route');

    module.exports = Router = (function() {

      _(Router.prototype).extend(Subscriber);

      function Router(options) {
        this.options = options != null ? options : {};
        this.route = __bind(this.route, this);
        this.match = __bind(this.match, this);
        /*console.debug 'Router#constructor'
        */
        _(this.options).defaults({
          pushState: true
        });
        this.subscribeEvent('!router:route', this.routeHandler);
        this.subscribeEvent('!router:changeURL', this.changeURLHandler);
        this.createHistory();
      }

      Router.prototype.createHistory = function() {
        return Backbone.history || (Backbone.history = new Backbone.History());
      };

      Router.prototype.startHistory = function() {
        return Backbone.history.start(this.options);
      };

      Router.prototype.stopHistory = function() {
        return Backbone.history.stop();
      };

      Router.prototype.match = function(pattern, target, options) {
        var route;
        if (options == null) options = {};
        route = new Route(pattern, target, options);
        return Backbone.history.route(route, route.handler);
      };

      Router.prototype.route = function(path) {
        /*console.debug 'Router#route', path
        */
        var handler, _i, _len, _ref;
        path = path.replace(/^(\/#|\/)/, '');
        _ref = Backbone.history.handlers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          handler = _ref[_i];
          if (handler.route.test(path)) {
            handler.callback(path, {
              changeURL: true
            });
            return true;
          }
        }
        return false;
      };

      Router.prototype.routeHandler = function(path, callback) {
        var routed;
        routed = this.route(path);
        return typeof callback === "function" ? callback(routed) : void 0;
      };

      Router.prototype.changeURL = function(url) {
        /*console.debug 'Router#changeURL', url
        */      return Backbone.history.navigate(url, {
          trigger: false
        });
      };

      Router.prototype.changeURLHandler = function(url) {
        return this.changeURL(url);
      };

      Router.prototype.disposed = false;

      Router.prototype.dispose = function() {
        /*console.debug 'Router#dispose'
        */      if (this.disposed) return;
        this.stopHistory();
        delete Backbone.history;
        this.unsubscribeAllEvents();
        this.disposed = true;
        return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
      };

      return Router;

    })();

  }).call(this);
  
});
window.require.register("chaplin/lib/subscriber", function(exports, require, module) {
  (function() {
    var Subscriber, mediator;

    mediator = require('mediator');

    Subscriber = {
      subscribeEvent: function(type, handler) {
        if (typeof type !== 'string') {
          throw new TypeError('Subscriber#subscribeEvent: ' + 'type argument must be a string');
        }
        if (typeof handler !== 'function') {
          throw new TypeError('Subscriber#subscribeEvent: ' + 'handler argument must be a function');
        }
        mediator.unsubscribe(type, handler, this);
        return mediator.subscribe(type, handler, this);
      },
      unsubscribeEvent: function(type, handler) {
        if (typeof type !== 'string') {
          throw new TypeError('Subscriber#unsubscribeEvent: ' + 'type argument must be a string');
        }
        if (typeof handler !== 'function') {
          throw new TypeError('Subscriber#unsubscribeEvent: ' + 'handler argument must be a function');
        }
        return mediator.unsubscribe(type, handler);
      },
      unsubscribeAllEvents: function() {
        return mediator.unsubscribe(null, null, this);
      }
    };

    if (typeof Object.freeze === "function") Object.freeze(Subscriber);

    module.exports = Subscriber;

  }).call(this);
  
});
window.require.register("chaplin/lib/support", function(exports, require, module) {
  (function() {
    var support;

    support = {
      propertyDescriptors: (function() {
        var o;
        if (!(typeof Object.defineProperty === 'function' && typeof Object.defineProperties === 'function')) {
          return false;
        }
        try {
          o = {};
          Object.defineProperty(o, 'foo', {
            value: 'bar'
          });
          return o.foo === 'bar';
        } catch (error) {
          return false;
        }
      })()
    };

    module.exports = support;

  }).call(this);
  
});
window.require.register("chaplin/lib/sync_machine", function(exports, require, module) {
  (function() {
    var STATE_CHANGE, SYNCED, SYNCING, SyncMachine, UNSYNCED, event, _fn, _i, _len, _ref;

    UNSYNCED = 'unsynced';

    SYNCING = 'syncing';

    SYNCED = 'synced';

    STATE_CHANGE = 'syncStateChange';

    SyncMachine = {
      _syncState: UNSYNCED,
      _previousSyncState: null,
      syncState: function() {
        return this._syncState;
      },
      isUnsynced: function() {
        return this._syncState === UNSYNCED;
      },
      isSynced: function() {
        return this._syncState === SYNCED;
      },
      isSyncing: function() {
        return this._syncState === SYNCING;
      },
      unsync: function() {
        var _ref;
        if ((_ref = this._syncState) === SYNCING || _ref === SYNCED) {
          this._previousSync = this._syncState;
          this._syncState = UNSYNCED;
          this.trigger(this._syncState, this, this._syncState);
          this.trigger(STATE_CHANGE, this, this._syncState);
        }
      },
      beginSync: function() {
        var _ref;
        if ((_ref = this._syncState) === UNSYNCED || _ref === SYNCED) {
          this._previousSync = this._syncState;
          this._syncState = SYNCING;
          this.trigger(this._syncState, this, this._syncState);
          this.trigger(STATE_CHANGE, this, this._syncState);
        }
      },
      finishSync: function() {
        if (this._syncState === SYNCING) {
          this._previousSync = this._syncState;
          this._syncState = SYNCED;
          this.trigger(this._syncState, this, this._syncState);
          this.trigger(STATE_CHANGE, this, this._syncState);
        }
      },
      abortSync: function() {
        if (this._syncState === SYNCING) {
          this._syncState = this._previousSync;
          this._previousSync = this._syncState;
          this.trigger(this._syncState, this, this._syncState);
          this.trigger(STATE_CHANGE, this, this._syncState);
        }
      }
    };

    _ref = [UNSYNCED, SYNCING, SYNCED, STATE_CHANGE];
    _fn = function(event) {
      return SyncMachine[event] = function(callback, context) {
        if (context == null) context = this;
        this.on(event, callback, context);
        if (this._syncState === event) return callback.call(context);
      };
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      event = _ref[_i];
      _fn(event);
    }

    if (typeof Object.freeze === "function") Object.freeze(SyncMachine);

    module.exports = SyncMachine;

  }).call(this);
  
});
window.require.register("chaplin/lib/utils", function(exports, require, module) {
  (function() {
    var mediator, utils,
      __hasProp = Object.prototype.hasOwnProperty,
      __slice = Array.prototype.slice;

    mediator = require('mediator');

    utils = {
      beget: (function() {
        var ctor;
        if (typeof Object.create === 'function') {
          return function(obj) {
            return Object.create(obj);
          };
        } else {
          ctor = function() {};
          return function(obj) {
            ctor.prototype = obj;
            return new ctor;
          };
        }
      })(),
      camelize: (function() {
        var camelizer, regexp;
        regexp = /[-_]([a-z])/g;
        camelizer = function(match, c) {
          return c.toUpperCase();
        };
        return function(string) {
          return string.replace(regexp, camelizer);
        };
      })(),
      upcase: function(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
      },
      underscorize: function(string) {
        return string.replace(/[A-Z]/g, function(char, index) {
          return (index !== 0 ? '_' : '') + char.toLowerCase();
        });
      },
      dasherize: function(string) {
        return string.replace(/[A-Z]/g, function(char, index) {
          return (index !== 0 ? '-' : '') + char.toLowerCase();
        });
      },
      sessionStorage: (function() {
        if (window.sessionStorage && sessionStorage.getItem && sessionStorage.setItem && sessionStorage.removeItem) {
          return function(key, value) {
            if (typeof value === 'undefined') {
              value = sessionStorage.getItem(key);
              if ((value != null) && value.toString) {
                return value.toString();
              } else {
                return value;
              }
            } else {
              sessionStorage.setItem(key, value);
              return value;
            }
          };
        } else {
          return function(key, value) {
            if (typeof value === 'undefined') {
              return utils.getCookie(key);
            } else {
              utils.setCookie(key, value);
              return value;
            }
          };
        }
      })(),
      sessionStorageRemove: (function() {
        if (window.sessionStorage && sessionStorage.getItem && sessionStorage.setItem && sessionStorage.removeItem) {
          return function(key) {
            return sessionStorage.removeItem(key);
          };
        } else {
          return function(key) {
            return utils.expireCookie(key);
          };
        }
      })(),
      getCookie: function(key) {
        var pair, pairs, val, _i, _len;
        pairs = document.cookie.split('; ');
        for (_i = 0, _len = pairs.length; _i < _len; _i++) {
          pair = pairs[_i];
          val = pair.split('=');
          if (decodeURIComponent(val[0]) === key) {
            return decodeURIComponent(val[1] || '');
          }
        }
        return null;
      },
      setCookie: function(key, value, options) {
        var expires, getOption, payload;
        if (options == null) options = {};
        payload = "" + (encodeURIComponent(key)) + "=" + (encodeURIComponent(value));
        getOption = function(name) {
          if (options[name]) {
            return "; " + name + "=" + options[name];
          } else {
            return '';
          }
        };
        expires = options.expires ? "; expires=" + (options.expires.toUTCString()) : '';
        return document.cookie = [payload, expires, getOption('path'), getOption('domain'), getOption('secure')].join('');
      },
      expireCookie: function(key) {
        return document.cookie = "" + key + "=nil; expires=" + ((new Date).toGMTString());
      },
      loadLib: function(url, success, error, timeout) {
        var head, onload, script, timeoutHandle;
        if (timeout == null) timeout = 7500;
        head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
        script = document.createElement('script');
        script.async = 'async';
        script.src = url;
        onload = function(_, aborted) {
          if (aborted == null) aborted = false;
          if (!(aborted || !script.readyState || script.readyState === 'complete')) {
            return;
          }
          clearTimeout(timeoutHandle);
          script.onload = script.onreadystatechange = script.onerror = null;
          if (head && script.parentNode) head.removeChild(script);
          script = void 0;
          if (success && !aborted) return success();
        };
        script.onload = script.onreadystatechange = onload;
        script.onerror = function() {
          onload(null, true);
          if (error) return error();
        };
        timeoutHandle = setTimeout(script.onerror, timeout);
        return head.insertBefore(script, head.firstChild);
      },
      /*
        Wrap methods so they can be called before a deferred is resolved.
        The actual methods are called once the deferred is resolved.
      
        Parameters:
      
        Expects an options hash with the following properties:
      
        deferred
          The Deferred object to wait for.
      
        methods
          Either:
          - A string with a method name e.g. 'method'
          - An array of strings e.g. ['method1', 'method2']
          - An object with methods e.g. {method: -> alert('resolved!')}
      
        host (optional)
          If you pass an array of strings in the `methods` parameter the methods
          are fetched from this object. Defaults to `deferred`.
      
        target (optional)
          The target object the new wrapper methods are created at.
          Defaults to host if host is given, otherwise it defaults to deferred.
      
        onDeferral (optional)
          An additional callback function which is invoked when the method is called
          and the Deferred isn't resolved yet.
          After the method is registered as a done handler on the Deferred,
          this callback is invoked. This can be used to trigger the resolving
          of the Deferred.
      
        Examples:
      
        deferMethods(deferred: def, methods: 'foo')
          Wrap the method named foo of the given deferred def and
          postpone all calls until the deferred is resolved.
      
        deferMethods(deferred: def, methods: def.specialMethods)
          Read all methods from the hash def.specialMethods and
          create wrapped methods with the same names at def.
      
        deferMethods(
          deferred: def, methods: def.specialMethods, target: def.specialMethods
        )
          Read all methods from the object def.specialMethods and
          create wrapped methods at def.specialMethods,
          overwriting the existing ones.
      
        deferMethods(deferred: def, host: obj, methods: ['foo', 'bar'])
          Wrap the methods obj.foo and obj.bar so all calls to them are postponed
          until def is resolved. obj.foo and obj.bar are overwritten
          with their wrappers.
      */
      deferMethods: function(options) {
        var deferred, func, host, methods, methodsHash, name, onDeferral, target, _i, _len, _results;
        deferred = options.deferred;
        methods = options.methods;
        host = options.host || deferred;
        target = options.target || host;
        onDeferral = options.onDeferral;
        methodsHash = {};
        if (typeof methods === 'string') {
          methodsHash[methods] = host[methods];
        } else if (methods.length && methods[0]) {
          for (_i = 0, _len = methods.length; _i < _len; _i++) {
            name = methods[_i];
            func = host[name];
            if (typeof func !== 'function') {
              throw new TypeError("utils.deferMethods: method " + name + " notfound on host " + host);
            }
            methodsHash[name] = func;
          }
        } else {
          methodsHash = methods;
        }
        _results = [];
        for (name in methodsHash) {
          if (!__hasProp.call(methodsHash, name)) continue;
          func = methodsHash[name];
          if (typeof func !== 'function') continue;
          _results.push(target[name] = utils.createDeferredFunction(deferred, func, target, onDeferral));
        }
        return _results;
      },
      createDeferredFunction: function(deferred, func, context, onDeferral) {
        if (context == null) context = deferred;
        return function() {
          var args;
          args = arguments;
          if (deferred.state() === 'resolved') {
            return func.apply(context, args);
          } else {
            deferred.done(function() {
              return func.apply(context, args);
            });
            if (typeof onDeferral === 'function') return onDeferral.apply(context);
          }
        };
      },
      accumulator: {
        collectedData: {},
        handles: {},
        handlers: {},
        successHandlers: {},
        errorHandlers: {},
        interval: 2000
      },
      wrapAccumulators: function(obj, methods) {
        var func, name, _i, _len,
          _this = this;
        for (_i = 0, _len = methods.length; _i < _len; _i++) {
          name = methods[_i];
          func = obj[name];
          if (typeof func !== 'function') {
            throw new TypeError("utils.wrapAccumulators: method " + name + " not found");
          }
          obj[name] = utils.createAccumulator(name, obj[name], obj);
        }
        return $(window).unload(function() {
          var handler, name, _ref, _results;
          _ref = utils.accumulator.handlers;
          _results = [];
          for (name in _ref) {
            handler = _ref[name];
            _results.push(handler({
              async: false
            }));
          }
          return _results;
        });
      },
      createAccumulator: function(name, func, context) {
        var acc, accumulatedError, accumulatedSuccess, cleanup, id;
        if (!(id = func.__uniqueID)) {
          id = func.__uniqueID = name + String(Math.random()).replace('.', '');
        }
        acc = utils.accumulator;
        cleanup = function() {
          delete acc.collectedData[id];
          delete acc.successHandlers[id];
          return delete acc.errorHandlers[id];
        };
        accumulatedSuccess = function() {
          var handler, handlers, _i, _len;
          handlers = acc.successHandlers[id];
          if (handlers) {
            for (_i = 0, _len = handlers.length; _i < _len; _i++) {
              handler = handlers[_i];
              handler.apply(this, arguments);
            }
          }
          return cleanup();
        };
        accumulatedError = function() {
          var handler, handlers, _i, _len;
          handlers = acc.errorHandlers[id];
          if (handlers) {
            for (_i = 0, _len = handlers.length; _i < _len; _i++) {
              handler = handlers[_i];
              handler.apply(this, arguments);
            }
          }
          return cleanup();
        };
        return function() {
          var data, error, handler, rest, success;
          data = arguments[0], success = arguments[1], error = arguments[2], rest = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
          if (data) {
            acc.collectedData[id] = (acc.collectedData[id] || []).concat(data);
          }
          if (success) {
            acc.successHandlers[id] = (acc.successHandlers[id] || []).concat(success);
          }
          if (error) {
            acc.errorHandlers[id] = (acc.errorHandlers[id] || []).concat(error);
          }
          if (acc.handles[id]) return;
          handler = function(options) {
            var args, collectedData;
            if (options == null) options = options;
            if (!(collectedData = acc.collectedData[id])) return;
            args = [collectedData, accumulatedSuccess, accumulatedError].concat(rest);
            func.apply(context, args);
            clearTimeout(acc.handles[id]);
            delete acc.handles[id];
            return delete acc.handlers[id];
          };
          acc.handlers[id] = handler;
          return acc.handles[id] = setTimeout((function() {
            return handler();
          }), acc.interval);
        };
      },
      afterLogin: function() {
        var args, context, eventType, func, loginHandler;
        context = arguments[0], func = arguments[1], eventType = arguments[2], args = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
        if (eventType == null) eventType = 'login';
        if (mediator.user) {
          return func.apply(context, args);
        } else {
          loginHandler = function() {
            mediator.unsubscribe(eventType, loginHandler);
            return func.apply(context, args);
          };
          return mediator.subscribe(eventType, loginHandler);
        }
      },
      deferMethodsUntilLogin: function(obj, methods, eventType) {
        var func, name, _i, _len, _results;
        if (eventType == null) eventType = 'login';
        if (typeof methods === 'string') methods = [methods];
        _results = [];
        for (_i = 0, _len = methods.length; _i < _len; _i++) {
          name = methods[_i];
          func = obj[name];
          if (typeof func !== 'function') {
            throw new TypeError("utils.deferMethodsUntilLogin: method " + name + "not found");
          }
          _results.push(obj[name] = _(utils.afterLogin).bind(null, obj, func, eventType));
        }
        return _results;
      },
      ensureLogin: function() {
        var args, context, e, eventType, func, loginContext;
        context = arguments[0], func = arguments[1], loginContext = arguments[2], eventType = arguments[3], args = 5 <= arguments.length ? __slice.call(arguments, 4) : [];
        if (eventType == null) eventType = 'login';
        utils.afterLogin.apply(utils, [context, func, eventType].concat(__slice.call(args)));
        if (!mediator.user) {
          if ((e = args[0]) && typeof e.preventDefault === 'function') {
            e.preventDefault();
          }
          return mediator.publish('!showLogin', loginContext);
        }
      },
      ensureLoginForMethods: function(obj, methods, loginContext, eventType) {
        var func, name, _i, _len, _results;
        if (eventType == null) eventType = 'login';
        if (typeof methods === 'string') methods = [methods];
        _results = [];
        for (_i = 0, _len = methods.length; _i < _len; _i++) {
          name = methods[_i];
          func = obj[name];
          if (typeof func !== 'function') {
            throw new TypeError("utils.ensureLoginForMethods: method " + name + "not found");
          }
          _results.push(obj[name] = _(utils.ensureLogin).bind(null, obj, func, loginContext, eventType));
        }
        return _results;
      },
      modifierKeyPressed: function(event) {
        return event.shiftKey || event.altKey || event.ctrlKey || event.metaKey;
      }
    };

    if (typeof Object.seal === "function") Object.seal(utils);

    module.exports = utils;

  }).call(this);
  
});
window.require.register("chaplin/models/collection", function(exports, require, module) {
  (function() {
    var Collection, Model, Subscriber, SyncMachine,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Subscriber = require('chaplin/lib/subscriber');

    SyncMachine = require('chaplin/lib/sync_machine');

    Model = require('chaplin/models/model');

    module.exports = Collection = (function(_super) {

      __extends(Collection, _super);

      function Collection() {
        Collection.__super__.constructor.apply(this, arguments);
      }

      _(Collection.prototype).extend(Subscriber);

      Collection.prototype.model = Model;

      Collection.prototype.initDeferred = function() {
        return _(this).extend($.Deferred());
      };

      Collection.prototype.initSyncMachine = function() {
        return _(this).extend(SyncMachine);
      };

      Collection.prototype.addAtomic = function(models, options) {
        var batch_direction, model;
        if (options == null) options = {};
        if (!models.length) return;
        options.silent = true;
        batch_direction = typeof options.at === 'number' ? 'pop' : 'shift';
        while (model = models[batch_direction]()) {
          this.add(model, options);
        }
        return this.trigger('reset');
      };

      Collection.prototype.update = function(newList, options) {
        var fingerPrint, i, ids, model, newFingerPrint, preexistent, _ids, _len, _results;
        if (options == null) options = {};
        fingerPrint = this.pluck('id').join();
        ids = _(newList).pluck('id');
        newFingerPrint = ids.join();
        if (fingerPrint !== newFingerPrint) {
          _ids = _(ids);
          i = this.models.length - 1;
          while (i >= 0) {
            model = this.models[i];
            if (!_ids.include(model.id)) this.remove(model);
            i--;
          }
        }
        if (!(fingerPrint === newFingerPrint && !options.deep)) {
          _results = [];
          for (i = 0, _len = newList.length; i < _len; i++) {
            model = newList[i];
            preexistent = this.get(model.id);
            if (preexistent) {
              if (!options.deep) continue;
              _results.push(preexistent.set(model));
            } else {
              _results.push(this.add(model, {
                at: i
              }));
            }
          }
          return _results;
        }
      };

      Collection.prototype.disposed = false;

      Collection.prototype.dispose = function() {
        /*console.debug 'Collection#dispose', this, 'disposed?', @disposed
        */
        var prop, properties, _i, _len;
        if (this.disposed) return;
        this.trigger('dispose', this);
        this.reset([], {
          silent: true
        });
        this.unsubscribeAllEvents();
        this.off();
        if (typeof this.reject === "function") this.reject();
        properties = ['model', 'models', '_byId', '_byCid', '_callbacks'];
        for (_i = 0, _len = properties.length; _i < _len; _i++) {
          prop = properties[_i];
          delete this[prop];
        }
        this.disposed = true;
        return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
      };

      return Collection;

    })(Backbone.Collection);

  }).call(this);
  
});
window.require.register("chaplin/models/model", function(exports, require, module) {
  (function() {
    var Model, Subscriber,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Subscriber = require('chaplin/lib/subscriber');

    module.exports = Model = (function(_super) {

      __extends(Model, _super);

      function Model() {
        Model.__super__.constructor.apply(this, arguments);
      }

      _(Model.prototype).extend(Subscriber);

      Model.prototype.initDeferred = function() {
        return _(this).extend($.Deferred());
      };

      Model.prototype.getAttributes = function() {
        return this.attributes;
      };

      Model.prototype.disposed = false;

      Model.prototype.dispose = function() {
        /*console.debug 'Model#dispose', this, 'disposed?', @disposed
        */
        var prop, properties, _i, _len;
        if (this.disposed) return;
        this.trigger('dispose', this);
        this.unsubscribeAllEvents();
        this.off();
        if (typeof this.reject === "function") this.reject();
        properties = ['collection', 'attributes', '_escapedAttributes', '_previousAttributes', '_silent', '_pending', '_callbacks'];
        for (_i = 0, _len = properties.length; _i < _len; _i++) {
          prop = properties[_i];
          delete this[prop];
        }
        this.disposed = true;
        return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
      };

      return Model;

    })(Backbone.Model);

  }).call(this);
  
});
window.require.register("chaplin/views/application_view", function(exports, require, module) {
  (function() {
    var ApplicationView, Subscriber, mediator, utils,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

    mediator = require('mediator');

    utils = require('chaplin/lib/utils');

    Subscriber = require('chaplin/lib/subscriber');

    module.exports = ApplicationView = (function() {

      _(ApplicationView.prototype).extend(Subscriber);

      ApplicationView.prototype.title = '';

      function ApplicationView(options) {
        if (options == null) options = {};
        this.openLink = __bind(this.openLink, this);
        /*console.debug 'ApplicationView#constructor', options
        */
        this.title = options.title;
        _(options).defaults({
          loginClasses: true,
          routeLinks: true
        });
        this.subscribeEvent('beforeControllerDispose', this.hideOldView);
        this.subscribeEvent('startupController', this.showNewView);
        this.subscribeEvent('startupController', this.removeFallbackContent);
        this.subscribeEvent('startupController', this.adjustTitle);
        if (options.loginClasses) {
          this.subscribeEvent('loginStatus', this.updateLoginClasses);
          this.updateLoginClasses();
        }
        if (options.routeLinks) this.initLinkRouting();
      }

      ApplicationView.prototype.hideOldView = function(controller) {
        var view;
        scrollTo(0, 0);
        view = controller.view;
        if (view) return view.$el.css('display', 'none');
      };

      ApplicationView.prototype.showNewView = function(context) {
        var view;
        view = context.controller.view;
        if (view) {
          return view.$el.css({
            display: 'block',
            opacity: 1,
            visibility: 'visible'
          });
        }
      };

      ApplicationView.prototype.adjustTitle = function(context) {
        var subtitle, title;
        title = this.title;
        subtitle = context.controller.title;
        if (subtitle) title = "" + subtitle + " \u2013 " + title;
        return setTimeout((function() {
          return document.title = title;
        }), 50);
      };

      ApplicationView.prototype.updateLoginClasses = function(loggedIn) {
        return $(document.body).toggleClass('logged-out', !loggedIn).toggleClass('logged-in', loggedIn);
      };

      ApplicationView.prototype.removeFallbackContent = function() {
        $('.accessible-fallback').remove();
        return this.unsubscribeEvent('startupController', this.removeFallbackContent);
      };

      ApplicationView.prototype.initLinkRouting = function() {
        return $(document).on('click', '.go-to', this.goToHandler).on('click', 'a', this.openLink);
      };

      ApplicationView.prototype.stopLinkRouting = function() {
        return $(document).off('click', '.go-to', this.goToHandler).off('click', 'a', this.openLink);
      };

      ApplicationView.prototype.openLink = function(event) {
        var currentHostname, el, external, href, path;
        if (utils.modifierKeyPressed(event)) return;
        el = event.currentTarget;
        href = el.getAttribute('href');
        if (href === null || href === '' || href.charAt(0) === '#' || $(el).hasClass('noscript')) {
          return;
        }
        currentHostname = location.hostname.replace('.', '\\.');
        external = !RegExp("" + currentHostname + "$", "i").test(el.hostname);
        if (external) return;
        path = el.pathname + el.search;
        if (path.charAt(0) !== '/') path = "/" + path;
        return mediator.publish('!router:route', path, function(routed) {
          if (routed) return event.preventDefault();
        });
      };

      ApplicationView.prototype.goToHandler = function(event) {
        var el, path;
        el = event.currentTarget;
        if (event.nodeName === 'A') return;
        path = $(el).data('href');
        if (!path) return;
        return mediator.publish('!router:route', path, function(routed) {
          if (routed) {
            return event.preventDefault();
          } else {
            return location.href = path;
          }
        });
      };

      ApplicationView.prototype.disposed = false;

      ApplicationView.prototype.dispose = function() {
        /*console.debug 'ApplicationView#dispose'
        */      if (this.disposed) return;
        this.stopLinkRouting();
        this.unsubscribeAllEvents();
        delete this.title;
        this.disposed = true;
        return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
      };

      return ApplicationView;

    })();

  }).call(this);
  
});
window.require.register("chaplin/views/collection_view", function(exports, require, module) {
  (function() {
    var CollectionView, View, utils,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    utils = require('lib/utils');

    View = require('chaplin/views/view');

    module.exports = CollectionView = (function(_super) {

      __extends(CollectionView, _super);

      function CollectionView() {
        this.renderAllItems = __bind(this.renderAllItems, this);
        this.showHideFallback = __bind(this.showHideFallback, this);
        this.itemsResetted = __bind(this.itemsResetted, this);
        this.itemRemoved = __bind(this.itemRemoved, this);
        this.itemAdded = __bind(this.itemAdded, this);
        CollectionView.__super__.constructor.apply(this, arguments);
      }

      CollectionView.prototype.animationDuration = 500;

      CollectionView.prototype.useCssAnimation = false;

      CollectionView.prototype.listSelector = null;

      CollectionView.prototype.$list = null;

      CollectionView.prototype.fallbackSelector = null;

      CollectionView.prototype.$fallback = null;

      CollectionView.prototype.loadingSelector = null;

      CollectionView.prototype.$loading = null;

      CollectionView.prototype.itemSelector = null;

      CollectionView.prototype.itemView = null;

      CollectionView.prototype.filterer = null;

      CollectionView.prototype.viewsByCid = null;

      CollectionView.prototype.visibleItems = null;

      CollectionView.prototype.getView = function(model) {
        if (this.itemView != null) {
          return new this.itemView({
            model: model
          });
        } else {
          throw new Error('The CollectionView#itemView property must be\
defined (or the getView() must be overridden)');
        }
      };

      CollectionView.prototype.getTemplateFunction = function() {};

      CollectionView.prototype.initialize = function(options) {
        if (options == null) options = {};
        CollectionView.__super__.initialize.apply(this, arguments);
        _(options).defaults({
          render: true,
          renderItems: true,
          filterer: null
        });
        if (options.itemView != null) this.itemView = options.itemView;
        this.viewsByCid = {};
        this.visibleItems = [];
        this.addCollectionListeners();
        if (options.filterer) this.filter(options.filterer);
        if (options.render) this.render();
        if (options.renderItems) return this.renderAllItems();
      };

      CollectionView.prototype.addCollectionListeners = function() {
        this.modelBind('add', this.itemAdded);
        this.modelBind('remove', this.itemRemoved);
        return this.modelBind('reset', this.itemsResetted);
      };

      CollectionView.prototype.itemAdded = function(item, collection, options) {
        if (options == null) options = {};
        return this.renderAndInsertItem(item, options.index);
      };

      CollectionView.prototype.itemRemoved = function(item) {
        return this.removeViewForItem(item);
      };

      CollectionView.prototype.itemsResetted = function() {
        return this.renderAllItems();
      };

      CollectionView.prototype.render = function() {
        CollectionView.__super__.render.apply(this, arguments);
        this.$list = this.listSelector ? this.$(this.listSelector) : this.$el;
        this.initFallback();
        return this.initLoadingIndicator();
      };

      CollectionView.prototype.initFallback = function() {
        if (!this.fallbackSelector) return;
        this.$fallback = this.$(this.fallbackSelector);
        this.bind('visibilityChange', this.showHideFallback);
        return this.modelBind('syncStateChange', this.showHideFallback);
      };

      CollectionView.prototype.showHideFallback = function() {
        var visible;
        visible = this.visibleItems.length === 0 && (typeof this.collection.isSynced === 'function' ? this.collection.isSynced() : true);
        return this.$fallback.css('display', visible ? 'block' : 'none');
      };

      CollectionView.prototype.initLoadingIndicator = function() {
        if (!(this.loadingSelector && typeof this.collection.isSyncing === 'function')) {
          return;
        }
        this.$loading = this.$(this.loadingSelector);
        this.modelBind('syncStateChange', this.showHideLoadingIndicator);
        return this.showHideLoadingIndicator();
      };

      CollectionView.prototype.showHideLoadingIndicator = function() {
        var visible;
        visible = this.collection.length === 0 && this.collection.isSyncing();
        return this.$loading.css('display', visible ? 'block' : 'none');
      };

      CollectionView.prototype.filter = function(filterer) {
        var included, index, item, view, _len, _ref;
        this.filterer = filterer;
        if (!_(this.viewsByCid).isEmpty()) {
          _ref = this.collection.models;
          for (index = 0, _len = _ref.length; index < _len; index++) {
            item = _ref[index];
            included = typeof filterer === 'function' ? filterer(item, index) : true;
            view = this.viewsByCid[item.cid];
            if (!view) {
              throw new Error('CollectionView#filter: ' + ("no view found for " + item.cid));
            }
            view.$el.stop(true, true).css('display', included ? '' : 'none');
            this.updateVisibleItems(item, included, false);
          }
        }
        return this.trigger('visibilityChange', this.visibleItems);
      };

      CollectionView.prototype.renderAllItems = function() {
        var cid, index, item, items, remainingViewsByCid, view, _i, _len, _len2, _ref;
        items = this.collection.models;
        this.visibleItems = [];
        remainingViewsByCid = {};
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          view = this.viewsByCid[item.cid];
          if (view) remainingViewsByCid[item.cid] = view;
        }
        _ref = this.viewsByCid;
        for (cid in _ref) {
          if (!__hasProp.call(_ref, cid)) continue;
          view = _ref[cid];
          if (!(cid in remainingViewsByCid)) this.removeView(cid, view);
        }
        for (index = 0, _len2 = items.length; index < _len2; index++) {
          item = items[index];
          view = this.viewsByCid[item.cid];
          if (view) {
            this.insertView(item, view, index, false);
          } else {
            this.renderAndInsertItem(item, index);
          }
        }
        if (!items.length) {
          return this.trigger('visibilityChange', this.visibleItems);
        }
      };

      CollectionView.prototype.renderAndInsertItem = function(item, index) {
        var view;
        view = this.renderItem(item);
        return this.insertView(item, view, index);
      };

      CollectionView.prototype.renderItem = function(item) {
        var view;
        view = this.viewsByCid[item.cid];
        if (!view) {
          view = this.getView(item);
          this.viewsByCid[item.cid] = view;
        }
        view.render();
        return view;
      };

      CollectionView.prototype.insertView = function(item, view, index, enableAnimation) {
        var $list, $next, $previous, $viewEl, children, included, length, position, viewEl,
          _this = this;
        if (index == null) index = null;
        if (enableAnimation == null) enableAnimation = true;
        position = typeof index === 'number' ? index : this.collection.indexOf(item);
        included = typeof this.filterer === 'function' ? this.filterer(item, position) : true;
        viewEl = view.el;
        $viewEl = view.$el;
        if (included) {
          if (enableAnimation) {
            if (this.useCssAnimation) {
              $viewEl.addClass('animated-item-view');
            } else {
              $viewEl.css('opacity', 0);
            }
          }
        } else {
          $viewEl.css('display', 'none');
        }
        $list = this.$list;
        children = $list.children(this.itemSelector || void 0);
        length = children.length;
        if (length === 0 || position === length) {
          $list.append(viewEl);
        } else {
          if (position === 0) {
            $next = children.eq(position);
            $next.before(viewEl);
          } else {
            $previous = children.eq(position - 1);
            $previous.after(viewEl);
          }
        }
        view.trigger('addedToDOM');
        this.updateVisibleItems(item, included);
        if (enableAnimation && included) {
          if (this.useCssAnimation) {
            return setTimeout(function() {
              return $viewEl.addClass('animated-item-view-end');
            }, 0);
          } else {
            return $viewEl.animate({
              opacity: 1
            }, this.animationDuration);
          }
        }
      };

      CollectionView.prototype.removeViewForItem = function(item) {
        var view;
        this.updateVisibleItems(item, false);
        view = this.viewsByCid[item.cid];
        return this.removeView(item.cid, view);
      };

      CollectionView.prototype.removeView = function(cid, view) {
        view.dispose();
        return delete this.viewsByCid[cid];
      };

      CollectionView.prototype.updateVisibleItems = function(item, includedInFilter, triggerEvent) {
        var includedInVisibleItems, visibilityChanged, visibleItemsIndex;
        if (triggerEvent == null) triggerEvent = true;
        visibilityChanged = false;
        visibleItemsIndex = _(this.visibleItems).indexOf(item);
        includedInVisibleItems = visibleItemsIndex > -1;
        if (includedInFilter && !includedInVisibleItems) {
          this.visibleItems.push(item);
          visibilityChanged = true;
        } else if (!includedInFilter && includedInVisibleItems) {
          this.visibleItems.splice(visibleItemsIndex, 1);
          visibilityChanged = true;
        }
        if (visibilityChanged && triggerEvent) {
          this.trigger('visibilityChange', this.visibleItems);
        }
        return visibilityChanged;
      };

      CollectionView.prototype.dispose = function() {
        var cid, prop, properties, view, _i, _len, _ref;
        if (this.disposed) return;
        _ref = this.viewsByCid;
        for (cid in _ref) {
          if (!__hasProp.call(_ref, cid)) continue;
          view = _ref[cid];
          view.dispose();
        }
        properties = ['$list', '$fallback', '$loading', 'viewsByCid', 'visibleItems'];
        for (_i = 0, _len = properties.length; _i < _len; _i++) {
          prop = properties[_i];
          delete this[prop];
        }
        return CollectionView.__super__.dispose.apply(this, arguments);
      };

      return CollectionView;

    })(View);

  }).call(this);
  
});
window.require.register("chaplin/views/view", function(exports, require, module) {
  (function() {
    var Subscriber, View, utils,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    utils = require('chaplin/lib/utils');

    Subscriber = require('chaplin/lib/subscriber');

    require('lib/view_helper');

    module.exports = View = (function(_super) {
      var wrapMethod;

      __extends(View, _super);

      _(View.prototype).extend(Subscriber);

      View.prototype.autoRender = false;

      View.prototype.containerSelector = null;

      View.prototype.containerMethod = 'append';

      View.prototype.subviews = null;

      View.prototype.subviewsByName = null;

      wrapMethod = function(obj, name) {
        var func;
        func = obj[name];
        return obj[name] = function() {
          func.apply(obj, arguments);
          return obj["after" + (utils.upcase(name))].apply(obj, arguments);
        };
      };

      function View() {
        if (this.initialize !== View.prototype.initialize) {
          wrapMethod(this, 'initialize');
        }
        if (this.initialize !== View.prototype.initialize) {
          wrapMethod(this, 'render');
        } else {
          this.render = _(this.render).bind(this);
        }
        View.__super__.constructor.apply(this, arguments);
      }

      View.prototype.initialize = function(options) {
        /*console.debug 'View#initialize', this, 'options', options
        */      this.subviews = [];
        this.subviewsByName = {};
        if (this.model || this.collection) this.modelBind('dispose', this.dispose);
        if (this.initialize === View.prototype.initialize) {
          return this.afterInitialize();
        }
      };

      View.prototype.afterInitialize = function() {
        var autoRender;
        autoRender = this.options.autoRender != null ? this.options.autoRender : this.autoRender;
        if (autoRender) return this.render();
      };

      View.prototype.delegate = function(eventType, second, third) {
        var handler, selector;
        if (typeof eventType !== 'string') {
          throw new TypeError('View#delegate: first argument must be a string');
        }
        if (arguments.length === 2) {
          handler = second;
        } else if (arguments.length === 3) {
          selector = second;
          if (typeof selector !== 'string') {
            throw new TypeError('View#delegate: ' + 'second argument must be a string');
          }
          handler = third;
        } else {
          throw new TypeError('View#delegate: ' + 'only two or three arguments are allowed');
        }
        if (typeof handler !== 'function') {
          throw new TypeError('View#delegate: ' + 'handler argument must be function');
        }
        eventType += ".delegate" + this.cid;
        handler = _(handler).bind(this);
        if (selector) {
          return this.$el.on(eventType, selector, handler);
        } else {
          return this.$el.on(eventType, handler);
        }
      };

      View.prototype.undelegate = function() {
        return this.$el.unbind(".delegate" + this.cid);
      };

      View.prototype.modelBind = function(type, handler) {
        var model;
        if (typeof type !== 'string') {
          throw new TypeError('View#modelBind: ' + 'type must be a string');
        }
        if (typeof handler !== 'function') {
          throw new TypeError('View#modelBind: ' + 'handler argument must be function');
        }
        model = this.model || this.collection;
        if (!model) {
          throw new TypeError('View#modelBind: no model or collection set');
        }
        model.off(type, handler, this);
        return model.on(type, handler, this);
      };

      View.prototype.modelUnbind = function(type, handler) {
        var model;
        if (typeof type !== 'string') {
          throw new TypeError('View#modelUnbind: ' + 'type argument must be a string');
        }
        if (typeof handler !== 'function') {
          throw new TypeError('View#modelUnbind: ' + 'handler argument must be a function');
        }
        model = this.model || this.collection;
        if (!model) return;
        return model.off(type, handler);
      };

      View.prototype.modelUnbindAll = function() {
        var model;
        model = this.model || this.collection;
        if (!model) return;
        return model.off(null, null, this);
      };

      View.prototype.pass = function(attribute, selector) {
        var _this = this;
        return this.modelBind("change:" + attribute, function(model, value) {
          var $el;
          $el = _this.$(selector);
          if ($el.is(':input')) {
            return $el.val(value);
          } else {
            return $el.text(value);
          }
        });
      };

      View.prototype.subview = function(name, view) {
        if (name && view) {
          this.removeSubview(name);
          this.subviews.push(view);
          this.subviewsByName[name] = view;
          return view;
        } else if (name) {
          return this.subviewsByName[name];
        }
      };

      View.prototype.removeSubview = function(nameOrView) {
        var index, name, otherName, otherView, view, _ref;
        if (!nameOrView) return;
        if (typeof nameOrView === 'string') {
          name = nameOrView;
          view = this.subviewsByName[name];
        } else {
          view = nameOrView;
          _ref = this.subviewsByName;
          for (otherName in _ref) {
            otherView = _ref[otherName];
            if (view === otherView) {
              name = otherName;
              break;
            }
          }
        }
        if (!(name && view && view.dispose)) return;
        view.dispose();
        index = _(this.subviews).indexOf(view);
        if (index > -1) this.subviews.splice(index, 1);
        return delete this.subviewsByName[name];
      };

      View.prototype.getTemplateData = function() {
        var modelAttributes, templateData;
        modelAttributes = this.model && this.model.getAttributes();
        templateData = modelAttributes ? utils.beget(modelAttributes) : {};
        if (this.model && typeof this.model.state === 'function') {
          templateData.resolved = this.model.state() === 'resolved';
        }
        return templateData;
      };

      View.prototype.getTemplateFunction = function() {
        throw new Error('View#getTemplateFunction must be overridden');
      };

      View.prototype.render = function() {
        /*console.debug 'View#render', this
        */
        var html, templateData, templateFunc;
        if (this.disposed) return;
        templateData = this.getTemplateData();
        templateFunc = this.getTemplateFunction();
        if (typeof templateFunc === 'function') {
          html = templateFunc(templateData);
          this.$el.empty().append(html);
        }
        return this;
      };

      View.prototype.afterRender = function() {
        var container, containerMethod;
        container = this.options.container != null ? this.options.container : this.containerSelector;
        if (container) {
          containerMethod = this.options.containerMethod != null ? this.options.containerMethod : this.containerMethod;
          $(container)[containerMethod](this.el);
          this.trigger('addedToDOM');
        }
        return this;
      };

      View.prototype.disposed = false;

      View.prototype.dispose = function() {
        /*console.debug 'View#dispose', this, 'disposed?', @disposed
        */
        var prop, properties, view, _i, _j, _len, _len2, _ref;
        if (this.disposed) return;
        _ref = this.subviews;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          view = _ref[_i];
          view.dispose();
        }
        this.unsubscribeAllEvents();
        this.modelUnbindAll();
        this.off();
        this.$el.remove();
        properties = ['el', '$el', 'options', 'model', 'collection', 'subviews', 'subviewsByName', '_callbacks'];
        for (_j = 0, _len2 = properties.length; _j < _len2; _j++) {
          prop = properties[_j];
          delete this[prop];
        }
        this.disposed = true;
        return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
      };

      return View;

    })(Backbone.View);

  }).call(this);
  
});
window.require.register("config", function(exports, require, module) {
  (function() {
    var config, production;

    config = {
      api: {}
    };

    production = false;

    config.api.root = production ? 'http://api.myapp.com' : 'http://127.0.0.1:8181';

    config.api.versionRoot = config.api.root + '/v1';

    module.exports = config;

  }).call(this);
  
});
window.require.register("controllers/authenticated_controller", function(exports, require, module) {
  (function() {
    var AuthenticatedController, Controller, eventDefinitions, mediator,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Controller = require('controllers/controller');

    mediator = require('mediator');

    eventDefinitions = require('lib/eventDefinitions');

    module.exports = AuthenticatedController = (function(_super) {

      __extends(AuthenticatedController, _super);

      function AuthenticatedController() {
        AuthenticatedController.__super__.constructor.apply(this, arguments);
      }

      AuthenticatedController.prototype.initialize = function(options) {
        AuthenticatedController.__super__.initialize.apply(this, arguments);
        if (!mediator.isCurrentUserAuthenticated()) {
          return mediator.publish(eventDefinitions.changeRoute, '/home');
        }
      };

      return AuthenticatedController;

    })(Controller);

  }).call(this);
  
});
window.require.register("controllers/controller", function(exports, require, module) {
  (function() {
    var ChaplinController, Controller,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ChaplinController = require('chaplin/controllers/controller');

    module.exports = Controller = (function(_super) {

      __extends(Controller, _super);

      function Controller() {
        Controller.__super__.constructor.apply(this, arguments);
      }

      return Controller;

    })(ChaplinController);

  }).call(this);
  
});
window.require.register("controllers/dashboard_controller", function(exports, require, module) {
  (function() {
    var AuthenticatedController, DashboardController, DashboardView, mediator,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    AuthenticatedController = require('controllers/authenticated_controller');

    DashboardView = require('views/dashboard_view');

    module.exports = DashboardController = (function(_super) {

      __extends(DashboardController, _super);

      function DashboardController() {
        DashboardController.__super__.constructor.apply(this, arguments);
      }

      DashboardController.prototype.historyURL = 'dashboard';

      DashboardController.prototype.index = function() {
        return this.view = new DashboardView();
      };

      return DashboardController;

    })(AuthenticatedController);

  }).call(this);
  
});
window.require.register("controllers/home_controller", function(exports, require, module) {
  (function() {
    var Controller, HomeController, HomeView, eventDefinitions, mediator,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    Controller = require('controllers/controller');

    HomeView = require('views/home_view');

    eventDefinitions = require('lib/eventDefinitions');

    module.exports = HomeController = (function(_super) {

      __extends(HomeController, _super);

      function HomeController() {
        HomeController.__super__.constructor.apply(this, arguments);
      }

      HomeController.prototype.historyURL = 'home';

      HomeController.prototype.initialize = function() {
        console.debug("HomeController#initialize");
        return HomeController.__super__.initialize.apply(this, arguments);
      };

      HomeController.prototype.index = function() {
        console.log('HomeController#index');
        return this.view = new HomeView();
      };

      return HomeController;

    })(Controller);

  }).call(this);
  
});
window.require.register("controllers/navigation_controller", function(exports, require, module) {
  (function() {
    var Controller, Navigation, NavigationController, NavigationView, User, mediator,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Controller = require('controllers/controller');

    mediator = require('mediator');

    Navigation = require('models/navigation');

    NavigationView = require('views/navigation_view');

    User = require('models/user');

    module.exports = NavigationController = (function(_super) {

      __extends(NavigationController, _super);

      function NavigationController() {
        NavigationController.__super__.constructor.apply(this, arguments);
      }

      NavigationController.prototype.historyURL = '';

      NavigationController.prototype.initialize = function() {
        console.debug('NavigationController#initialize');
        NavigationController.__super__.initialize.apply(this, arguments);
        this.model = new Navigation;
        return this.view = new NavigationView({
          model: this.model
        });
      };

      return NavigationController;

    })(Controller);

  }).call(this);
  
});
window.require.register("controllers/press_controller", function(exports, require, module) {
  (function() {
    var AuthenticatedController, Book, PressController, PressView, mediator,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    AuthenticatedController = require('controllers/authenticated_controller');

    PressView = require('views/press_view');

    Book = require('models/book');

    module.exports = PressController = (function(_super) {

      __extends(PressController, _super);

      function PressController() {
        PressController.__super__.constructor.apply(this, arguments);
      }

      PressController.prototype.historyUrl = 'books';

      PressController.prototype.initialize = function(options) {
        console.log("PressController#initialize");
        return PressController.__super__.initialize.apply(this, arguments);
      };

      PressController.prototype.index = function(data) {
        console.log("PressController#index");
        this.model = new Book({
          _id: data.id
        });
        this.view = new PressView({
          model: this.model
        });
        return this.model.fetch();
      };

      return PressController;

    })(AuthenticatedController);

  }).call(this);
  
});
window.require.register("controllers/session_controller", function(exports, require, module) {
  (function() {
    var Controller, Facebook, LoginView, SessionController, Twitter, User, eventDefinitions, mediator, router, utils,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    eventDefinitions = require('lib/eventDefinitions');

    utils = require('lib/utils');

    Twitter = require('lib/services/twitter');

    Facebook = require('lib/services/facebook');

    User = require('models/user');

    Controller = require('controllers/controller');

    LoginView = require('views/login_view');

    router = require('lib/router');

    module.exports = SessionController = (function(_super) {

      __extends(SessionController, _super);

      function SessionController() {
        this.logout = __bind(this.logout, this);
        this.serviceProviderSession = __bind(this.serviceProviderSession, this);
        this.loginAttempt = __bind(this.loginAttempt, this);
        this.triggerLogin = __bind(this.triggerLogin, this);
        SessionController.__super__.constructor.apply(this, arguments);
      }

      SessionController.prototype.historyUrl = 'logout';

      SessionController.serviceProviders = {
        twitter: new Twitter(),
        facebook: new Facebook()
      };

      SessionController.prototype.loginStatusDetermined = false;

      SessionController.prototype.loginView = null;

      SessionController.prototype.serviceProviderName = null;

      SessionController.prototype.initialize = function() {
        console.debug('SessionController#initialize');
        this.subscribeEvent(eventDefinitions.loginAttempt, this.loginAttempt);
        this.subscribeEvent(eventDefinitions.serviceproviderSessionCreation, this.serviceProviderSession);
        this.subscribeEvent(eventDefinitions.logout, this.logout);
        this.subscribeEvent(eventDefinitions.userDataRetrieved, this.userData);
        this.subscribeEvent(eventDefinitions.showLogin, this.showLoginView);
        this.subscribeEvent(eventDefinitions.loginGlobal, this.triggerLogin);
        this.subscribeEvent(eventDefinitions.logoutGlobal, this.triggerLogout);
        return this.getSession();
      };

      SessionController.prototype.load = function() {
        var name, serviceProvider, _ref, _results;
        _ref = SessionController.serviceProviders;
        _results = [];
        for (name in _ref) {
          serviceProvider = _ref[name];
          _results.push(serviceProvider.load());
        }
        return _results;
      };

      SessionController.prototype.createUser = function(userData) {
        var user;
        user = new User(userData);
        return mediator.setUser(user);
      };

      SessionController.prototype.getSession = function() {
        var name, serviceProvider, _ref, _results;
        this.load();
        _ref = SessionController.serviceProviders;
        _results = [];
        for (name in _ref) {
          serviceProvider = _ref[name];
          _results.push(serviceProvider.done(serviceProvider.getLoginStatus));
        }
        return _results;
      };

      SessionController.prototype.showLoginView = function() {
        console.debug('SessionController#showLoginView');
        if (!this.loginView) {
          this.load();
          this.loginView = new LoginView({
            serviceProviders: SessionController.serviceProviders
          });
        }
        return this.loginView.showView();
      };

      SessionController.prototype.hideLoginView = function() {
        if (!this.loginView) return;
        this.loginView.dispose();
        return this.loginView = null;
      };

      SessionController.prototype.triggerLogin = function(serviceProviderName) {
        var serviceProvider;
        serviceProvider = SessionController.serviceProviders[serviceProviderName];
        if (!serviceProvider.isLoaded()) {
          mediator.publish(eventDefinitions.serviceProviderMissing, serviceProviderName);
          return;
        }
        mediator.publish(eventDefinitions.loginAttempt, serviceProviderName);
        return serviceProvider.triggerLogin();
      };

      SessionController.prototype.loginAttempt = function() {};

      SessionController.prototype.serviceProviderSession = function(session) {
        this.serviceProviderName = session.provider.name;
        console.debug('SessionController#serviceProviderSession', session, this.serviceProviderName);
        this.hideLoginView();
        session.id = session.userId;
        delete session.userId;
        this.createUser(session);
        return this.publishLogin();
      };

      SessionController.prototype.publishLogin = function() {
        console.debug('SessionController#publishLogin', mediator.user);
        this.loginStatusDetermined = true;
        mediator.publish(eventDefinitions.login, mediator.user);
        mediator.publish(eventDefinitions.loginStatus, true);
        return mediator.publish(eventDefinitions.changeRoute, '/#dashboard');
      };

      SessionController.prototype.destroy = function() {
        console.debug('session#destroy:destroying the session & logging out from service provider');
        mediator.publish(eventDefinitions.logoutGlobal);
        return mediator.publish(eventDefinitions.changeRoute, '/#home');
      };

      SessionController.prototype.triggerLogout = function() {
        return mediator.publish(eventDefinitions.logout);
      };

      SessionController.prototype.logout = function() {
        console.debug('SessionController#logout');
        this.loginStatusDetermined = true;
        if (mediator.user) {
          mediator.user.dispose();
          mediator.user.set(null);
        }
        this.serviceProviderName = null;
        return mediator.publish(eventDefinitions.loginStatus, false);
      };

      SessionController.prototype.userData = function(data) {
        return mediator.user.set(data);
      };

      return SessionController;

    })(Controller);

  }).call(this);
  
});
window.require.register("controllers/titles_controller", function(exports, require, module) {
  (function() {
    var Controller, TitleController, Titles, TitlesView, mediator,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    Controller = require('controllers/controller');

    TitlesView = require('views/titles_view');

    Titles = require('models/titles');

    module.exports = TitleController = (function(_super) {

      __extends(TitleController, _super);

      function TitleController() {
        TitleController.__super__.constructor.apply(this, arguments);
      }

      TitleController.prototype.historyURL = 'titles';

      TitleController.prototype.initialize = function(options) {
        TitleController.__super__.initialize.apply(this, arguments);
        return this.collection = new Titles();
      };

      TitleController.prototype.index = function() {
        if (mediator.user && !mediator.user.disposed) {
          return this.view = new TitlesView({
            collection: this.collection
          });
        }
      };

      return TitleController;

    })(Controller);

  }).call(this);
  
});
window.require.register("initialize", function(exports, require, module) {
  (function() {
    var Application;

    Application = require('application');

    $(function() {
      var app;
      console.log('Initializing the Application');
      app = new Application();
      return app.initialize();
    });

  }).call(this);
  
});
window.require.register("lib/eventDefinitions", function(exports, require, module) {
  (function() {
    var EventDefinitions;

    module.exports = EventDefinitions = (function() {

      function EventDefinitions() {}

      EventDefinitions.login = "login";

      EventDefinitions.loginGlobal = "!login";

      EventDefinitions.loginAttempt = "login_attempt";

      EventDefinitions.logoutGlobal = "!logout";

      EventDefinitions.logout = "logout";

      EventDefinitions.loginStatus = "login_status";

      EventDefinitions.showLogin = "show_login";

      EventDefinitions.loginServicePicked = "login_pickService";

      EventDefinitions.serviceproviderSessionCreation = "serviceprovider_session_creation";

      EventDefinitions.serviceProviderMissing = "missing_serviceProvider";

      EventDefinitions.userDataRetrieved = "user_data_retrieved";

      EventDefinitions.serviceProviderSDKLoaded = "sdkLoaded";

      EventDefinitions.serviceProviderAuthComplete = "authComplete";

      EventDefinitions.serviceProviderSignOut = "signOut";

      EventDefinitions.serviceProviderSuccessfulLogin = "loginsSuccessful";

      EventDefinitions.serviceProviderFailedLogin = "failedLogin";

      EventDefinitions.startupController = "!startupController";

      EventDefinitions.navigationChange = "Navigation_change";

      EventDefinitions.changeRoute = "!router:route";

      EventDefinitions.tabChange = "tab_Change";

      EventDefinitions.parentViewAfterRender = "parent_view_after_render";

      EventDefinitions.sectionLoad = "section_load";

      EventDefinitions.chapterLoad = "chapter_load";

      return EventDefinitions;

    })();

  }).call(this);
  
});
window.require.register("lib/router", function(exports, require, module) {
  (function() {
    var ChaplinRouter, Router,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ChaplinRouter = require('chaplin/lib/router');

    module.exports = Router = (function(_super) {

      __extends(Router, _super);

      function Router() {
        Router.__super__.constructor.apply(this, arguments);
      }

      return Router;

    })(ChaplinRouter);

  }).call(this);
  
});
window.require.register("lib/services/facebook", function(exports, require, module) {
  (function() {
    var FACEBOOK_APP_SECRET, Facebook, ServiceProvider, mediator, utils,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    utils = require('lib/utils');

    ServiceProvider = require('lib/services/service_provider');

    FACEBOOK_APP_SECRET = "234bff5a14a829863933326321dbd1a3";

    module.exports = Facebook = (function(_super) {
      var facebookAppId, scope;

      __extends(Facebook, _super);

      facebookAppId = '153228098033488';

      scope = 'user_likes';

      Facebook.prototype.name = 'facebook';

      Facebook.prototype.status = null;

      Facebook.prototype.accessToken = null;

      function Facebook() {
        this.processUserData = __bind(this.processUserData, this);
        this.facebookLogout = __bind(this.facebookLogout, this);
        this.loginStatusAfterAbort = __bind(this.loginStatusAfterAbort, this);
        this.loginHandler = __bind(this.loginHandler, this);
        this.triggerLogin = __bind(this.triggerLogin, this);
        this.loginStatusHandler = __bind(this.loginStatusHandler, this);
        this.getLoginStatus = __bind(this.getLoginStatus, this);
        this.saveAuthResponse = __bind(this.saveAuthResponse, this);
        this.loadHandler = __bind(this.loadHandler, this);      Facebook.__super__.constructor.apply(this, arguments);
        utils.deferMethods({
          deferred: this,
          methods: ['parse', 'subscribe', 'postToGraph', 'getAccumulatedInfo', 'getInfo'],
          onDeferral: this.load
        });
        utils.wrapAccumulators(this, ['getAccumulatedInfo']);
        this.subscribeEvent('logout', this.logout);
      }

      Facebook.prototype.load = function() {
        if (this.state() === 'resolved' || this.loading) return;
        this.loading = true;
        window.fbAsyncInit = this.loadHandler;
        return utils.loadLib('http://connect.facebook.net/en_US/all.js', null, this.reject);
      };

      Facebook.prototype.loadHandler = function() {
        this.loading = false;
        try {
          delete window.fbAsyncInit;
        } catch (error) {
          window.fbAsyncInit = void 0;
        }
        FB.init({
          appId: facebookAppId,
          status: true,
          cookie: true,
          xfbml: false
        });
        this.registerHandlers();
        return this.resolve();
      };

      Facebook.prototype.registerHandlers = function() {
        this.subscribe('auth.logout', this.facebookLogout);
        this.subscribe('edge.create', this.processLike);
        return this.subscribe('comment.create', this.processComment);
      };

      Facebook.prototype.unregisterHandlers = function() {
        this.unsubscribe('auth.logout', this.facebookLogout);
        this.unsubscribe('edge.create', this.processLike);
        return this.unsubscribe('comment.create', this.processComment);
      };

      Facebook.prototype.isLoaded = function() {
        return Boolean(window.FB && FB.login);
      };

      Facebook.prototype.saveAuthResponse = function(response) {
        var authResponse;
        this.status = response.status;
        authResponse = response.authResponse;
        if (authResponse) {
          return this.accessToken = authResponse.accessToken;
        } else {
          return this.accessToken = null;
        }
      };

      Facebook.prototype.getLoginStatus = function(callback, force) {
        if (callback == null) callback = this.loginStatusHandler;
        if (force == null) force = false;
        return FB.getLoginStatus(callback, force);
      };

      Facebook.prototype.loginStatusHandler = function(response) {
        var authResponse;
        this.saveAuthResponse(response);
        authResponse = response.authResponse;
        if (authResponse) {
          this.publishSession(authResponse);
          return this.getUserData();
        } else {
          return mediator.publish('logout');
        }
      };

      Facebook.prototype.triggerLogin = function(loginContext) {
        return FB.login(_(this.loginHandler).bind(this, loginContext), {
          scope: scope
        });
      };

      Facebook.prototype.loginHandler = function(loginContext, response) {
        var authResponse, eventPayload, loginStatusHandler;
        this.saveAuthResponse(response);
        authResponse = response.authResponse;
        eventPayload = {
          provider: this,
          loginContext: loginContext
        };
        if (authResponse) {
          mediator.publish('loginSuccessful', eventPayload);
          this.publishSession(authResponse);
          return this.getUserData();
        } else {
          mediator.publish('loginAbort', eventPayload);
          loginStatusHandler = _(this.loginStatusAfterAbort).bind(this, loginContext);
          return this.getLoginStatus(loginStatusHandler, true);
        }
      };

      Facebook.prototype.loginStatusAfterAbort = function(loginContext, response) {
        var authResponse, eventPayload;
        this.saveAuthResponse(response);
        authResponse = response.authResponse;
        eventPayload = {
          provider: this,
          loginContext: loginContext
        };
        if (authResponse) {
          mediator.publish('loginSuccessful', eventPayload);
          return this.publishSession(authResponse);
        } else {
          return mediator.publish('loginFail', eventPayload);
        }
      };

      Facebook.prototype.publishSession = function(authResponse) {
        return mediator.publish('serviceProviderSession', {
          provider: this,
          userId: authResponse.userID,
          accessToken: authResponse.accessToken
        });
      };

      Facebook.prototype.facebookLogout = function(response) {
        return this.saveAuthResponse(response);
      };

      Facebook.prototype.logout = function() {
        return this.status = this.accessToken = null;
      };

      Facebook.prototype.processLike = function(url) {
        return mediator.publish('facebook:like', url);
      };

      Facebook.prototype.processComment = function(comment) {
        return mediator.publish('facebook:comment', comment.href);
      };

      Facebook.prototype.parse = function(el) {
        return FB.XFBML.parse(el);
      };

      Facebook.prototype.subscribe = function(eventType, handler) {
        return FB.Event.subscribe(eventType, handler);
      };

      Facebook.prototype.unsubscribe = function(eventType, handler) {
        return FB.Event.unsubscribe(eventType, handler);
      };

      Facebook.prototype.postToGraph = function(ogResource, data, callback) {
        return FB.api(ogResource, 'post', data, function(response) {
          if (callback) return callback(response);
        });
      };

      Facebook.prototype.getAccumulatedInfo = function(urls, callback) {
        if (typeof urls === 'string') urls = [urls];
        urls = _(urls).reduce(function(memo, url) {
          if (memo) memo += ',';
          return memo += encodeURIComponent(url);
        }, '');
        return FB.api("?ids=" + urls, callback);
      };

      Facebook.prototype.getInfo = function(id, callback) {
        return FB.api(id, callback);
      };

      Facebook.prototype.getUserData = function() {
        return this.getInfo('/me', this.processUserData);
      };

      Facebook.prototype.processUserData = function(response) {
        return mediator.publish('userData', response);
      };

      Facebook.prototype.dispose = function() {
        if (this.disposed) return;
        this.unregisterHandlers();
        delete this.status;
        delete this.accessToken;
        return Facebook.__super__.dispose.apply(this, arguments);
      };

      return Facebook;

    })(ServiceProvider);

  }).call(this);
  
});
window.require.register("lib/services/myauth", function(exports, require, module) {
  (function() {
    var MyAuth, ServiceProvider, config, mediator,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    config = require('config');

    mediator = require('mediator');

    ServiceProvider = require('lib/services/service_provider');

    module.exports = MyAuth = (function(_super) {

      __extends(MyAuth, _super);

      MyAuth.prototype.baseUrl = config.api.root;

      function MyAuth() {
        this.loginStatusHandler = __bind(this.loginStatusHandler, this);
        this.loginHandler = __bind(this.loginHandler, this);
        var authCallback;
        MyAuth.__super__.constructor.apply(this, arguments);
        this.accessToken = localStorage.getItem('accessToken');
        authCallback = _(this.loginHandler).bind(this, this.loginHandler);
        mediator.subscribe('auth:callback:ostio', authCallback);
      }

      MyAuth.prototype.load = function() {
        this.resolve();
        return this;
      };

      MyAuth.prototype.isLoaded = function() {
        return true;
      };

      MyAuth.prototype.ajax = function(type, url, data) {
        url = this.baseUrl + url;
        if (this.accessToken) url += "?access_token=" + this.accessToken;
        return $.ajax({
          url: url,
          data: data,
          type: type,
          dataType: 'json'
        });
      };

      MyAuth.prototype.triggerLogin = function(loginContext) {
        var callback;
        callback = _(this.loginHandler).bind(this, this.loginHandler);
        return window.location = URL;
      };

      MyAuth.prototype.loginHandler = function(loginContext, response) {
        if (response) {
          mediator.publish('loginSuccessful', {
            provider: this,
            loginContext: loginContext
          });
          this.accessToken = response.accessToken;
          localStorage.setItem('accessToken', this.accessToken);
          return this.getUserData().done(this.processUserData);
        } else {
          return mediator.publish('loginFail', {
            provider: this,
            loginContext: loginContext
          });
        }
      };

      MyAuth.prototype.getUserData = function() {
        return this.ajax('get', '/v1/users/me');
      };

      MyAuth.prototype.processUserData = function(response) {
        return mediator.publish('userData', response);
      };

      MyAuth.prototype.getLoginStatus = function(callback, force) {
        if (callback == null) callback = this.loginStatusHandler;
        if (force == null) force = false;
        return this.getUserData().always(callback);
      };

      MyAuth.prototype.loginStatusHandler = function(response, status) {
        if (!response || status === 'error') {
          return mediator.publish('logout');
        } else {
          return mediator.publish('serviceProviderSession', _.extend(response, {
            provider: this,
            userId: response.id,
            accessToken: this.accessToken
          }));
        }
      };

      return MyAuth;

    })(ServiceProvider);

  }).call(this);
  
});
window.require.register("lib/services/service_provider", function(exports, require, module) {
  (function() {
    var ServiceProvider, Subscriber, utils;

    utils = require('lib/utils');

    Subscriber = require('chaplin/lib/subscriber');

    module.exports = ServiceProvider = (function() {

      _(ServiceProvider.prototype).defaults(Subscriber);

      ServiceProvider.prototype.loading = false;

      function ServiceProvider() {
        _(this).extend($.Deferred());
        utils.deferMethods({
          deferred: this,
          methods: ['triggerLogin', 'getLoginStatus'],
          onDeferral: this.load
        });
      }

      ServiceProvider.prototype.disposed = false;

      ServiceProvider.prototype.dispose = function() {
        if (this.disposed) return;
        this.unsubscribeAllEvents();
        this.disposed = true;
        return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
      };

      return ServiceProvider;

    })();

    /*
    
      Standard methods and their signatures:
    
      loadSDK: ->
        # Load a script like this:
        utils.loadLib 'http://example.org/foo.js', @sdkLoadHandler, @reject
    
      sdkLoadHandler: =>
        # Init the SDK, then resolve
        someSDK.init(foo: 'bar')
        @resolve()
    
      isLoaded: ->
        # Return a Boolean
        Boolean window.someSDK and someSDK.login
    
      # Trigger login popup
      triggerLogin: (loginContext) ->
        callback = _(@loginHandler).bind(this, @loginHandler)
        someSDK.login callback
    
      # Callback for the login popup
      loginHandler: (loginContext, response) =>
    
        if response
          # Publish successful login
          mediator.publish 'loginSuccessful',
            provider: this, loginContext: loginContext
    
          # Publish the session
          mediator.publish 'serviceProviderSession',
            provider: this
            userId: response.userId
            accessToken: response.accessToken
            # etc.
    
        else
          mediator.publish 'loginFail', provider: this, loginContext: loginContext
    
      getLoginStatus: (callback = @loginStatusHandler, force = false) ->
        someSDK.getLoginStatus callback, force
    
      loginStatusHandler: (response) =>
        return unless response
        mediator.publish 'serviceProviderSession',
          provider: this
          userId: response.userId
          accessToken: response.accessToken
          # etc.
    */

  }).call(this);
  
});
window.require.register("lib/services/twitter", function(exports, require, module) {
  (function() {
    var ServiceProvider, Twitter, eventDefinitions, mediator, utils,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    utils = require('lib/utils');

    eventDefinitions = require('lib/eventDefinitions');

    ServiceProvider = require('lib/services/service_provider');

    module.exports = Twitter = (function(_super) {
      var consumerKey;

      __extends(Twitter, _super);

      consumerKey = 'w0uohox9lTgpKETJmscYIQ';

      Twitter.prototype.name = 'twitter';

      function Twitter() {
        this.loginStatusHandler = __bind(this.loginStatusHandler, this);
        this.loginHandler = __bind(this.loginHandler, this);
        this.sdkLoadHandler = __bind(this.sdkLoadHandler, this);      Twitter.__super__.constructor.apply(this, arguments);
        this.subscribeEvent(eventDefinitions.logoutGlobal, this.logoutFromTwitter);
      }

      Twitter.prototype.load = function() {
        if (this.state() === 'resolved' || this.loading) return;
        this.loading = true;
        return utils.loadLib("http://platform.twitter.com/anywhere.js?id=" + consumerKey + "&v=1", this.sdkLoadHandler, this.reject);
      };

      Twitter.prototype.sdkLoadHandler = function() {
        var _this = this;
        this.loading = false;
        return twttr.anywhere(function(T) {
          mediator.publish(eventDefinitions.serviceProviderSDKLoaded);
          _this.T = T;
          return _this.resolve();
        });
      };

      Twitter.prototype.isLoaded = function() {
        return Boolean(window.twttr);
      };

      Twitter.prototype.publish = function(event, callback) {
        return this.T.trigger(event, callback);
      };

      Twitter.prototype.subscribe = function(event, callback) {
        return this.T.bind(event, callback);
      };

      Twitter.prototype.unsubscribe = function(event) {
        return this.T.unbind(event);
      };

      Twitter.prototype.triggerLogin = function(loginContext) {
        var callback;
        callback = _(this.loginHandler).bind(this, loginContext);
        this.T.signIn();
        this.subscribe(eventDefinitions.serviceProviderAuthComplete, function(event, currentUser, accessToken) {
          return callback({
            currentUser: currentUser,
            accessToken: accessToken
          });
        });
        return this.subscribe(eventDefinitions.serviceProviderSignOut, function() {
          console.log('SIGNOUT EVENT');
          return callback();
        });
      };

      Twitter.prototype.publishSession = function(response) {
        var user;
        user = response.currentUser;
        mediator.publish(eventDefinitions.serviceproviderSessionCreation, {
          provider: this,
          userId: user.id,
          accessToken: response.accessToken || twttr.anywhere.token
        });
        return mediator.publish(eventDefinitions.userDataRetrieved, user.attributes);
      };

      Twitter.prototype.loginHandler = function(loginContext, response) {
        console.debug('Twitter#loginHandler', loginContext, response);
        if (response) {
          mediator.publish(eventDefinitions.serviceProviderSuccessfulLogin, {
            provider: this,
            loginContext: loginContext
          });
          return this.publishSession(response);
        } else {
          return mediator.publish(eventDefinitions.serviceProviderFailedLogin, {
            provider: this,
            loginContext: loginContext
          });
        }
      };

      Twitter.prototype.getLoginStatus = function(callback, force) {
        if (callback == null) callback = this.loginStatusHandler;
        if (force == null) force = false;
        console.debug('Twitter#getLoginStatus');
        return callback(this.T);
      };

      Twitter.prototype.loginStatusHandler = function(response) {
        console.debug('Twitter#loginStatusHandler', response);
        if (response.currentUser) {
          return this.publishSession(response);
        } else {
          return mediator.publish(eventDefinitions.logout);
        }
      };

      Twitter.prototype.logoutFromTwitter = function() {
        var _ref;
        console.log('Twitter#logout');
        return typeof twttr !== "undefined" && twttr !== null ? (_ref = twttr.anywhere) != null ? typeof _ref.signOut === "function" ? _ref.signOut() : void 0 : void 0 : void 0;
      };

      return Twitter;

    })(ServiceProvider);

  }).call(this);
  
});
window.require.register("lib/support", function(exports, require, module) {
  (function() {
    var chaplinSupport, support, utils;

    utils = require('lib/utils');

    chaplinSupport = require('chaplin/lib/support');

    support = utils.beget(chaplinSupport);

    module.exports = support;

  }).call(this);
  
});
window.require.register("lib/utils", function(exports, require, module) {
  (function() {
    var chaplinUtils, mediator, utils;

    mediator = require('mediator');

    chaplinUtils = require('chaplin/lib/utils');

    utils = chaplinUtils.beget(chaplinUtils);

    module.exports = utils;

  }).call(this);
  
});
window.require.register("lib/view_helper", function(exports, require, module) {
  (function() {
    var mediator, utils;

    mediator = require('mediator');

    utils = require('chaplin/lib/utils');

    Handlebars.registerHelper('if_logged_in', function(options) {
      if (mediator.user && !mediator.user.disposed) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });

    Handlebars.registerHelper('with', function(context, options) {
      if (!context || Handlebars.Utils.isEmpty(context)) {
        return options.inverse(this);
      } else {
        return options.fn(context);
      }
    });

    Handlebars.registerHelper('without', function(context, options) {
      var inverse;
      inverse = options.inverse;
      options.inverse = options.fn;
      options.fn = inverse;
      return Handlebars.helpers["with"].call(this, context, options);
    });

    Handlebars.registerHelper('with_user', function(options) {
      var context;
      context = mediator.user || {};
      return Handlebars.helpers["with"].call(this, context, options);
    });

    Handlebars.registerHelper('make_slag', function(text) {
      if (!text || Handlebars.Utils.isEmpty(text)) return text;
      return text.toLowerCase().replace(/[^\w ]+/g, "").replace(RegExp(" +", "g"), "-");
    });

  }).call(this);
  
});
window.require.register("mediator", function(exports, require, module) {
  (function() {
    var createMediator, mediator, support;

    createMediator = require('chaplin/lib/create_mediator');

    support = require('chaplin/lib/support');

    mediator = createMediator({
      createUserProperty: true
    });

    mediator.isCurrentUserAuthenticated = function() {
      return mediator.user && !mediator.user.disposed;
    };

    if (support.propertyDescriptors && Object.seal) Object.seal(mediator);

    module.exports = mediator;

  }).call(this);
  
});
window.require.register("models/book", function(exports, require, module) {
  (function() {
    var Book, Chapters, Model, Sections, config,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Model = require('models/model');

    config = require('config');

    Chapters = require('models/chapters');

    Sections = require('models/sections');

    module.exports = Book = (function(_super) {

      __extends(Book, _super);

      function Book() {
        Book.__super__.constructor.apply(this, arguments);
      }

      Book.prototype.defaults = {
        title: 'Sample Title',
        subtitle: 'Sample Subtitle',
        author: '',
        status: 'in-progress',
        toc: {},
        cover: {},
        version: '0.0.1',
        metadata: {}
      };

      Book.prototype.urlPath = function() {
        return "/books/";
      };

      return Book;

    })(Model);

  }).call(this);
  
});
window.require.register("models/bookTemplate", function(exports, require, module) {
  (function() {
    var BookTemplate, Model,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Model = require('models/model');

    module.exports = BookTemplate = (function(_super) {

      __extends(BookTemplate, _super);

      function BookTemplate() {
        BookTemplate.__super__.constructor.apply(this, arguments);
      }

      BookTemplate.prototype.urlPath = function() {
        return "/templates/book/?default=1&username=admin";
      };

      return BookTemplate;

    })(Model);

  }).call(this);
  
});
window.require.register("models/books", function(exports, require, module) {
  (function() {
    var Book, Books, Collection, config,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Collection = require('models/collection');

    Book = require('models/book');

    config = require('config');

    module.exports = Books = (function(_super) {

      __extends(Books, _super);

      function Books() {
        Books.__super__.constructor.apply(this, arguments);
      }

      Books.prototype.url = function() {
        return config.api.root + '/books/';
      };

      Books.prototype.model = Book;

      return Books;

    })(Collection);

  }).call(this);
  
});
window.require.register("models/chapter", function(exports, require, module) {
  (function() {
    var Chapter, Model,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Model = require('models/model');

    module.exports = Chapter = (function(_super) {

      __extends(Chapter, _super);

      function Chapter() {
        Chapter.__super__.constructor.apply(this, arguments);
      }

      Chapter.prototype.defaults = {
        name: '',
        title: '',
        summary: ''
      };

      Chapter.prototype.initialize = function(options) {
        Chapter.__super__.initialize.apply(this, arguments);
        return {
          book_id: options.book_id
        };
      };

      Chapter.prototype.urlPath = function() {
        return "/books/" + (this.get('book_id')) + "/chapters/";
      };

      return Chapter;

    })(Model);

  }).call(this);
  
});
window.require.register("models/chapters", function(exports, require, module) {
  (function() {
    var Chapter, Chapters, Collection, config,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Collection = require('models/collection');

    Chapter = require('models/chapter');

    config = require('config');

    module.exports = Chapters = (function(_super) {

      __extends(Chapters, _super);

      function Chapters() {
        Chapters.__super__.constructor.apply(this, arguments);
      }

      Chapters.prototype.model = Chapter;

      Chapters.prototype.initialize = function(models, options) {
        Chapters.__super__.initialize.apply(this, arguments);
        if ((options != null ? options.book_id : void 0) != null) {
          return this.book_id = options.book_id;
        }
      };

      return Chapters;

    })(Collection);

  }).call(this);
  
});
window.require.register("models/collection", function(exports, require, module) {
  (function() {
    var ChaplinCollection, Collection, Model,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ChaplinCollection = require('chaplin/models/collection');

    Model = require('models/model');

    module.exports = Collection = (function(_super) {

      __extends(Collection, _super);

      function Collection() {
        Collection.__super__.constructor.apply(this, arguments);
      }

      Collection.prototype.model = Model;

      Collection.prototype.initialize = function(models, options) {
        if ((options != null ? options.url : void 0) != null) {
          this.url = function() {
            return options.url;
          };
        }
        return Collection.__super__.initialize.apply(this, arguments);
      };

      return Collection;

    })(ChaplinCollection);

  }).call(this);
  
});
window.require.register("models/dashboard", function(exports, require, module) {
  (function() {



  }).call(this);
  
});
window.require.register("models/model", function(exports, require, module) {
  (function() {
    var ChaplinModel, Model, config,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ChaplinModel = require('chaplin/models/model');

    config = require('config');

    module.exports = Model = (function(_super) {

      __extends(Model, _super);

      function Model() {
        Model.__super__.constructor.apply(this, arguments);
      }

      Model.prototype.idAttribute = '_id';

      Model.prototype.apiRoot = config.api.root;

      Model.prototype.urlKey = '_id';

      Model.prototype.urlPath = function() {
        return '';
      };

      Model.prototype.urlParams = function() {};

      Model.prototype.urlRoot = function() {
        var urlPath;
        urlPath = this.urlPath();
        if (urlPath) {
          return this.apiRoot + urlPath;
        } else if (this.collection) {
          return this.collection.url();
        } else {
          throw new Error('Model must redefine urlPath');
        }
      };

      Model.prototype.url = function(data) {
        var base, full, params, payload, sep, url;
        if (data == null) data = '';
        base = this.urlRoot();
        full = this.get(this.urlKey) != null ? base + encodeURIComponent(this.get(this.urlKey)) + data : base + data;
        sep = full.indexOf('?') >= 0 ? '&' : '?';
        params = this.urlParams();
        if (params) {
          payload = _.keys(params).map(function(key) {
            return [key, params[key]];
          }).filter(function(pair) {
            return pair[1] != null;
          }).map(function(pair) {
            return pair.join('=');
          }).join('&');
        }
        url = payload ? full + sep + payload : full;
        return url;
      };

      Model.prototype.fetch = function(options) {
        return Model.__super__.fetch.apply(this, arguments);
      };

      return Model;

    })(ChaplinModel);

  }).call(this);
  
});
window.require.register("models/navigation", function(exports, require, module) {
  (function() {
    var Model, Navigation, eventDefinitions, mediator,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Model = require('models/model');

    mediator = require('mediator');

    eventDefinitions = require('lib/eventDefinitions');

    module.exports = Navigation = (function(_super) {

      __extends(Navigation, _super);

      function Navigation() {
        Navigation.__super__.constructor.apply(this, arguments);
      }

      Navigation.prototype.defaults = {
        items: [
          {
            href: 'https://github.com/',
            title: 'Github'
          }, {
            href: 'http://twitter.com',
            title: 'Twitter'
          }
        ],
        projectname: 'Kriti'
      };

      Navigation.prototype.initialize = function() {
        console.debug('NavigationModel#initialize');
        return Navigation.__super__.initialize.apply(this, arguments);
      };

      return Navigation;

    })(Model);

  }).call(this);
  
});
window.require.register("models/section", function(exports, require, module) {
  (function() {
    var Model, Section,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Model = require('models/model');

    module.exports = Section = (function(_super) {

      __extends(Section, _super);

      function Section() {
        Section.__super__.constructor.apply(this, arguments);
      }

      Section.prototype.defaults = {
        name: '',
        title: '',
        order: 0,
        content: ''
      };

      Section.prototype.initialize = function(options) {
        Section.__super__.initialize.apply(this, arguments);
        return {
          book_id: options.book_id,
          chapter_id: options.chapter_id
        };
      };

      Section.prototype.urlPath = function() {
        return "/books/" + (this.get('book_id')) + "/chapters/" + (this.get('chapter_id')) + "/sections/";
      };

      return Section;

    })(Model);

  }).call(this);
  
});
window.require.register("models/sections", function(exports, require, module) {
  (function() {
    var Collection, Section, Sections, config,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Collection = require('models/collection');

    Section = require('models/section');

    config = require('config');

    module.exports = Sections = (function(_super) {

      __extends(Sections, _super);

      function Sections() {
        Sections.__super__.constructor.apply(this, arguments);
      }

      Sections.prototype.model = Section;

      Sections.prototype.initialize = function(models, options) {
        Sections.__super__.initialize.apply(this, arguments);
        if ((options != null ? options.book_id : void 0) != null) {
          this.book_id = options.book_id;
        }
        if ((options != null ? options.chapter_id : void 0) != null) {
          return this.chapter_id = options.chapter_id;
        }
      };

      return Sections;

    })(Collection);

  }).call(this);
  
});
window.require.register("models/title", function(exports, require, module) {
  (function() {
    var Model, Title, config,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Model = require('models/model');

    config = require('config');

    module.exports = Title = (function(_super) {

      __extends(Title, _super);

      function Title() {
        Title.__super__.constructor.apply(this, arguments);
      }

      Title.prototype.defaults = {
        id: 100110,
        title: "First Book Title",
        status: 'In Progress',
        lastModifiedDtTm: '06-04-2012',
        stats: []
      };

      return Title;

    })(Model);

  }).call(this);
  
});
window.require.register("models/titles", function(exports, require, module) {
  (function() {
    var Collection, Title, Titles, config,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Collection = require('models/collection');

    Title = require('models/title');

    config = require('config');

    module.exports = Titles = (function(_super) {

      __extends(Titles, _super);

      function Titles() {
        Titles.__super__.constructor.apply(this, arguments);
      }

      Titles.model = Title;

      Titles.prototype.initialize = function() {
        Titles.__super__.initialize.apply(this, arguments);
        this.add(new Title({
          id: 1
        }));
        return this.add(new Title({
          id: 2
        }));
      };

      return Titles;

    })(Collection);

  }).call(this);
  
});
window.require.register("models/user", function(exports, require, module) {
  (function() {
    var Model, User, mediator,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Model = require('models/model');

    mediator = require('mediator');

    module.exports = User = (function(_super) {

      __extends(User, _super);

      function User() {
        User.__super__.constructor.apply(this, arguments);
      }

      User.prototype.isAuthenticated = function() {
        return mediator.user && !mediator.user.disposed;
      };

      return User;

    })(Model);

  }).call(this);
  
});
window.require.register("routes", function(exports, require, module) {
  (function() {

    module.exports = function(match) {
      match('', 'home#index');
      match('home', 'home#index');
      match('login', 'session#showLoginView');
      match('dashboard', 'dashboard#index');
      match('logout', 'session#destroy');
      match('titles', 'titles#index');
      return match('books/:id/:title', 'press#index');
    };

  }).call(this);
  
});
window.require.register("views/authenticatedpage_view", function(exports, require, module) {
  (function() {
    var AuthenticatedPageView, View, eventDefinitions, mediator,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    View = require('views/view');

    eventDefinitions = require('lib/eventDefinitions');

    module.exports = AuthenticatedPageView = (function(_super) {

      __extends(AuthenticatedPageView, _super);

      function AuthenticatedPageView() {
        AuthenticatedPageView.__super__.constructor.apply(this, arguments);
      }

      AuthenticatedPageView.prototype.renderedSubviews = false;

      AuthenticatedPageView.prototype.containerSelector = '#main-container';

      AuthenticatedPageView.prototype.initialize = function() {
        var rendered,
          _this = this;
        AuthenticatedPageView.__super__.initialize.apply(this, arguments);
        if (!mediator.isCurrentUserAuthenticated()) return;
        if (this.model || this.collection) {
          rendered = false;
          return this.modelBind('change', function() {
            if (!rendered) _this.render(true);
            return rendered = true;
          });
        }
      };

      AuthenticatedPageView.prototype.renderSubviews = function() {};

      AuthenticatedPageView.prototype.render = function(option) {
        if (!mediator.isCurrentUserAuthenticated()) return;
        AuthenticatedPageView.__super__.render.apply(this, arguments);
        if (!(this.renderedSubviews && !option)) {
          this.renderSubviews();
          return this.renderedSubviews = true;
        }
      };

      return AuthenticatedPageView;

    })(View);

  }).call(this);
  
});
window.require.register("views/chapter_view", function(exports, require, module) {
  (function() {
    var AuthenticatedPageView, ChapterView, Sections, SectionsView, eventDefinitions, mediator, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    AuthenticatedPageView = require('views/authenticatedpage_view');

    template = require('views/templates/chapter');

    SectionsView = require('views/sections_view');

    Sections = require('models/sections');

    eventDefinitions = require('lib/eventDefinitions');

    module.exports = ChapterView = (function(_super) {

      __extends(ChapterView, _super);

      function ChapterView() {
        ChapterView.__super__.constructor.apply(this, arguments);
      }

      ChapterView.prototype.template = template;

      ChapterView.prototype.className = 'accordion-group';

      ChapterView.prototype.autoRender = false;

      ChapterView.prototype.render = function() {
        console.log('ChapterView#render');
        return ChapterView.__super__.render.apply(this, arguments);
      };

      ChapterView.prototype.initialize = function() {
        console.debug('ChapterView#initialize');
        return ChapterView.__super__.initialize.apply(this, arguments);
      };

      ChapterView.prototype.renderSubviews = function(options) {
        var chapterid;
        console.log('chapter#renderSubViews', this.$el);
        this.sectionCollection = new Sections(null, {
          chapter_id: this.model.get('_id'),
          book_id: this.model.get('book_id'),
          url: this.model.url('/sections/')
        });
        this.sectionCollection.fetch({
          success: _.bind(function() {
            if (this.sectionCollection.length > 0) {
              return mediator.publish(eventDefinitions.sectionLoad, this.sectionCollection.first());
            }
          }, this)
        });
        chapterid = this.model.get('_id');
        return this.subview('sectionsview', new SectionsView({
          container: this.$('#section-container-' + chapterid),
          collection: this.sectionCollection
        }));
      };

      return ChapterView;

    })(AuthenticatedPageView);

  }).call(this);
  
});
window.require.register("views/chapters_view", function(exports, require, module) {
  (function() {
    var BookTemplate, Chapter, ChapterView, ChaptersView, CollectionView, mediator, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    CollectionView = require('views/collection_view');

    ChapterView = require('views/chapter_view');

    template = require('views/templates/chapters');

    Chapter = require('models/chapter');

    BookTemplate = require('models/bookTemplate');

    module.exports = ChaptersView = (function(_super) {

      __extends(ChaptersView, _super);

      function ChaptersView() {
        ChaptersView.__super__.constructor.apply(this, arguments);
      }

      ChaptersView.prototype.template = template;

      ChaptersView.prototype.id = 'book-chapters';

      ChaptersView.prototype.className = 'well sidebar-nav';

      ChaptersView.prototype.listSelector = '#chapter-list-container';

      ChaptersView.prototype.fallbackSelector = '.fallback';

      ChaptersView.prototype.loadingSelector = '.loading';

      ChaptersView.prototype.autoRender = false;

      ChaptersView.prototype.initialize = function(options) {
        console.debug('ChaptersView#initialize');
        ChaptersView.__super__.initialize.apply(this, arguments);
        return this.delegate('click', '#add-chapter', this.createNewChapter);
      };

      ChaptersView.prototype.render = function() {
        console.log('ChaptersView#render', this, this.$el);
        return ChaptersView.__super__.render.apply(this, arguments);
      };

      ChaptersView.prototype.createNewChapter = function() {
        var bookTemplate;
        bookTemplate = new BookTemplate;
        return bookTemplate.fetch({
          success: _.bind(function() {
            var chapter;
            chapter = new Chapter({
              book_id: this.collection.book_id
            });
            chapter.urlParams = function() {
              return {
                fromTemplate: 1,
                templateId: bookTemplate.get('_id')
              };
            };
            return chapter.save({}, {
              success: _.bind(function() {
                chapter.urlParams(function() {
                  return {};
                });
                return this.collection.add(chapter);
              }, this)
            });
          }, this)
        });
      };

      ChaptersView.prototype.getView = function(item) {
        return new ChapterView({
          model: item,
          container: this.$("#chapter-list-container")
        });
      };

      return ChaptersView;

    })(CollectionView);

  }).call(this);
  
});
window.require.register("views/collection_view", function(exports, require, module) {
  (function() {
    var ChaplinCollectionView, CollectionView,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ChaplinCollectionView = require('chaplin/views/collection_view');

    require('lib/view_helper');

    module.exports = CollectionView = (function(_super) {

      __extends(CollectionView, _super);

      function CollectionView() {
        CollectionView.__super__.constructor.apply(this, arguments);
      }

      CollectionView.prototype.getTemplateFunction = function() {
        return this.template;
      };

      return CollectionView;

    })(ChaplinCollectionView);

  }).call(this);
  
});
window.require.register("views/dashboard_view", function(exports, require, module) {
  (function() {
    var AuthenticatedPageView, Book, BookTemplate, Books, DashboardView, TitlesView, eventDefinitions, mediator, template, utils,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    eventDefinitions = require('lib/eventDefinitions');

    utils = require('lib/utils');

    AuthenticatedPageView = require('views/authenticatedpage_view');

    template = require('views/templates/dashboard');

    TitlesView = require('views/titles_view');

    Books = require('models/books');

    Book = require('models/book');

    BookTemplate = require('models/bookTemplate');

    module.exports = DashboardView = (function(_super) {

      __extends(DashboardView, _super);

      function DashboardView() {
        DashboardView.__super__.constructor.apply(this, arguments);
      }

      DashboardView.prototype.template = template;

      DashboardView.prototype.id = 'dashboard-container';

      DashboardView.prototype.className = 'dashboard-container';

      DashboardView.prototype.containerSelector = '#main-container';

      DashboardView.prototype.containerMethod = 'html';

      DashboardView.prototype.autoRender = true;

      DashboardView.prototype.initialize = function(options) {
        console.debug("Dashboard#initialize");
        DashboardView.__super__.initialize.apply(this, arguments);
        return this.delegate('click', '#create-new-book', this.createNewBook);
      };

      DashboardView.prototype.renderSubviews = function(options) {
        console.log('dashboard#renderSubViews', this.$el);
        DashboardView.__super__.renderSubviews.apply(this, arguments);
        this.collection = new Books(null);
        this.collection.fetch();
        return this.subview('titlesview', new TitlesView({
          collection: this.collection,
          container: this.$("#dashboard-content")
        }));
      };

      DashboardView.prototype.createNewBook = function() {
        var bookTemplate;
        bookTemplate = new BookTemplate;
        return bookTemplate.fetch({
          success: _.bind(function() {
            var book, bookUrl;
            book = new Book;
            bookUrl = book.url('?fromTemplate=1&templateId=' + bookTemplate.get('_id'));
            book.url = bookUrl;
            return book.save({}, {
              success: _.bind(function(book, resp) {
                return this.collection.push(book);
              }, this)
            });
          }, this)
        });
      };

      return DashboardView;

    })(AuthenticatedPageView);

  }).call(this);
  
});
window.require.register("views/home_view", function(exports, require, module) {
  (function() {
    var HomeView, View, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template = require('views/templates/home');

    View = require('views/view');

    module.exports = HomeView = (function(_super) {

      __extends(HomeView, _super);

      function HomeView() {
        HomeView.__super__.constructor.apply(this, arguments);
      }

      HomeView.prototype.template = template;

      HomeView.prototype.containerSelector = '#main-container';

      HomeView.prototype.containerMethod = 'html';

      HomeView.prototype.autoRender = true;

      HomeView.prototype.initialize = function() {
        return HomeView.__super__.initialize.apply(this, arguments);
      };

      return HomeView;

    })(View);

  }).call(this);
  
});
window.require.register("views/login_view", function(exports, require, module) {
  (function() {
    var EventDefinitions, LoginView, View, mediator, template, utils,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    EventDefinitions = require('lib/eventDefinitions');

    utils = require('lib/utils');

    View = require('views/view');

    template = require('views/templates/login');

    module.exports = LoginView = (function(_super) {

      __extends(LoginView, _super);

      function LoginView() {
        LoginView.__super__.constructor.apply(this, arguments);
      }

      LoginView.prototype.template = template;

      LoginView.prototype.id = 'loginModal';

      LoginView.prototype.className = 'modal hide fade';

      LoginView.prototype.containerSelector = '#login-container';

      LoginView.prototype.autoRender = true;

      LoginView.prototype.initialize = function(options) {
        console.debug('LoginView#initialize', this.el, this.$el, options, options.serviceProviders);
        LoginView.__super__.initialize.apply(this, arguments);
        return this.initButtons(options.serviceProviders);
      };

      LoginView.prototype.initButtons = function(serviceProviders) {
        var buttonSelector, failed, loaded, loginHandler, serviceProvider, serviceProviderName, _results;
        console.debug('LoginView#initButtons', serviceProviders);
        _results = [];
        for (serviceProviderName in serviceProviders) {
          serviceProvider = serviceProviders[serviceProviderName];
          buttonSelector = "." + serviceProviderName;
          this.$(buttonSelector).addClass('service-loading');
          loginHandler = _(this.loginWith).bind(this, serviceProviderName, serviceProvider);
          this.delegate('click', buttonSelector, loginHandler);
          loaded = _(this.serviceProviderLoaded).bind(this, serviceProviderName, serviceProvider);
          serviceProvider.done(loaded);
          failed = _(this.serviceProviderFailed).bind(this, serviceProviderName, serviceProvider);
          _results.push(serviceProvider.fail(failed));
        }
        return _results;
      };

      LoginView.prototype.loginWith = function(serviceProviderName, serviceProvider, e) {
        console.debug('LoginView#loginWith', serviceProviderName, serviceProvider);
        e.preventDefault();
        if (!serviceProvider.isLoaded()) return;
        mediator.publish(EventDefinitions.loginServicePicked, serviceProviderName);
        return mediator.publish(EventDefinitions.loginGlobal, serviceProviderName);
      };

      LoginView.prototype.showView = function() {
        return $("#loginModal").modal();
      };

      LoginView.prototype.serviceProviderLoaded = function(serviceProviderName) {
        return this.$("." + serviceProviderName).removeClass('service-loading');
      };

      LoginView.prototype.serviceProviderFailed = function(serviceProviderName) {
        return this.$("." + serviceProviderName).removeClass('service-loading').addClass('service-unavailable').attr('disabled', true).attr('title', "Error connecting. Please check whether you are blocking " + (utils.upcase(serviceProviderName)) + ".");
      };

      return LoginView;

    })(View);

  }).call(this);
  
});
window.require.register("views/navigation_view", function(exports, require, module) {
  (function() {
    var TopNavView, View, eventDefinitions, mediator, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    View = require('views/view');

    template = require('views/templates/navigation');

    eventDefinitions = require('lib/eventDefinitions');

    module.exports = TopNavView = (function(_super) {

      __extends(TopNavView, _super);

      function TopNavView() {
        TopNavView.__super__.constructor.apply(this, arguments);
      }

      TopNavView.prototype.template = template;

      TopNavView.prototype.containerSelector = '#navigation-container';

      TopNavView.prototype.autoRender = true;

      TopNavView.prototype.initialize = function() {
        console.log('TopNavView#initialized');
        TopNavView.__super__.initialize.apply(this, arguments);
        return this.subscribeEvent(eventDefinitions.loginStatus, this.render);
      };

      return TopNavView;

    })(View);

  }).call(this);
  
});
window.require.register("views/press_main_view", function(exports, require, module) {
  (function() {
    var PressMainView, View, eventDefinitions, mediator, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    View = require('views/view');

    eventDefinitions = require('lib/eventDefinitions');

    template = require('views/templates/press_main');

    module.exports = PressMainView = (function(_super) {

      __extends(PressMainView, _super);

      function PressMainView() {
        PressMainView.__super__.constructor.apply(this, arguments);
      }

      PressMainView.prototype.template = template;

      PressMainView.prototype.autoRender = true;

      PressMainView.prototype.editorRendered = false;

      PressMainView.prototype.containerMethod = 'html';

      PressMainView.prototype.initialize = function(options) {
        var _this = this;
        PressMainView.__super__.initialize.apply(this, arguments);
        mediator.subscribe(eventDefinitions.tabChange, this.tabChangeHandler);
        mediator.subscribe(eventDefinitions.sectionLoad, this.sectionLoadHandler);
        return this.delegate('submit', function(event) {
          event.preventDefault();
          return _this.saveHandler();
        });
      };

      PressMainView.prototype.tabChangeHandler = function(target) {
        return console.log('PressMainview#tabClickHandler');
      };

      PressMainView.prototype.render = function() {
        console.log('PressMainView#render', this.$el);
        return PressMainView.__super__.render.apply(this, arguments);
      };

      PressMainView.prototype.chapterLoadHandler = function(chapter) {
        this.model = chapter;
        if (!this.editorRendered) $("#book-editor").wysihtml5();
        $("#book-editor").val(chapter.get("name"));
        return this.editorRendered = true;
      };

      PressMainView.prototype.sectionLoadHandler = function(section) {
        $("#book-editor").wysihtml5();
        $("#book-editor").val(section.get("name"));
        return mediator.unsubscribe(eventDefinitions.sectionLoad);
      };

      PressMainView.prototype.saveHandler = function() {
        return this.model.save({
          name: this.$("#book-editor").val()
        });
      };

      return PressMainView;

    })(View);

  }).call(this);
  
});
window.require.register("views/press_sidebar_view", function(exports, require, module) {
  (function() {
    var PressSidebarView, View, eventDefinitions, mediator, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    View = require('views/view');

    eventDefinitions = require('lib/eventDefinitions');

    template = require('views/templates/press_sidebar');

    module.exports = PressSidebarView = (function(_super) {

      __extends(PressSidebarView, _super);

      function PressSidebarView() {
        PressSidebarView.__super__.constructor.apply(this, arguments);
      }

      PressSidebarView.prototype.template = template;

      PressSidebarView.prototype.autoRender = true;

      PressSidebarView.prototype.fallbackSelector = '.fallback';

      PressSidebarView.prototype.loadingSelector = '.loading';

      PressSidebarView.prototype.initialize = function(options) {
        PressSidebarView.__super__.initialize.apply(this, arguments);
        return mediator.subscribe(eventDefinitions.tabChange, this.tabChangeHandler);
      };

      PressSidebarView.prototype.tabChangeHandler = function(target) {
        return console.log('PressSidebarView#tabClickHandler');
      };

      PressSidebarView.prototype.render = function() {
        console.log('PressSidebarView#render', this.$el);
        return PressSidebarView.__super__.render.apply(this, arguments);
      };

      return PressSidebarView;

    })(View);

  }).call(this);
  
});
window.require.register("views/press_tab_view", function(exports, require, module) {
  (function() {
    var PressTabView, View, eventDefinitions, mediator, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    View = require('views/view');

    eventDefinitions = require('lib/eventDefinitions');

    template = require('views/templates/press_tab');

    module.exports = PressTabView = (function(_super) {

      __extends(PressTabView, _super);

      function PressTabView() {
        PressTabView.__super__.constructor.apply(this, arguments);
      }

      PressTabView.prototype.template = template;

      PressTabView.prototype.autoRender = true;

      PressTabView.prototype.containerSelector = '#press-tabs-container';

      PressTabView.prototype.initialize = function(options) {
        PressTabView.__super__.initialize.apply(this, arguments);
        return this.delegate('click', '.nav-tabs li', this.tabClickHandler);
      };

      PressTabView.prototype.render = function() {
        console.log('PressTabView#render', this.$el);
        return PressTabView.__super__.render.apply(this, arguments);
      };

      PressTabView.prototype.tabClickHandler = function(event) {
        return mediator.publish(eventDefinitions.tabChange, event.currentTarget);
      };

      return PressTabView;

    })(View);

  }).call(this);
  
});
window.require.register("views/press_view", function(exports, require, module) {
  (function() {
    var AuthenticatedPageView, Book, Chapters, ChaptersView, MainView, PressView, Section, SidebarView, TabView, eventDefinitions, mediator, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    AuthenticatedPageView = require('views/authenticatedpage_view');

    TabView = require('views/press_tab_view');

    SidebarView = require('views/press_sidebar_view');

    ChaptersView = require('views/chapters_view');

    MainView = require('views/press_main_view');

    template = require('views/templates/press');

    Book = require('models/book');

    Chapters = require('models/chapters');

    Section = require('models/section');

    eventDefinitions = require('lib/eventDefinitions');

    module.exports = PressView = (function(_super) {

      __extends(PressView, _super);

      function PressView() {
        PressView.__super__.constructor.apply(this, arguments);
      }

      PressView.prototype.template = template;

      PressView.prototype.containerSelector = '#main-container';

      PressView.prototype.autoRender = false;

      PressView.prototype.render = function() {
        console.log('PressView#render');
        return PressView.__super__.render.apply(this, arguments);
      };

      PressView.prototype.initialize = function(options) {
        return PressView.__super__.initialize.apply(this, arguments);
      };

      PressView.prototype.renderSubviews = function(options) {
        console.log('press#renderSubViews', this.$el);
        this.subview('tabview', new TabView({
          container: this.$('#press-tabs-container'),
          model: null
        }));
        this.subview('sidebarview', new SidebarView({
          container: this.$('#press-sidebar-container'),
          model: this.model
        }));
        this.chapterCollection = new Chapters(null, {
          book_id: this.model.id,
          url: this.model.url('/chapters/')
        });
        this.chapterCollection.fetch({
          success: _.bind(function() {
            if (this.chapterCollection.length > 0) {
              return mediator.publish(eventDefinitions.chapterLoad, this.chapterCollection.first());
            }
          }, this)
        });
        this.subview('chaptersview', new ChaptersView({
          container: this.$('#press-sidebar-container'),
          collection: this.chapterCollection
        }));
        return this.subview('mainview', new MainView({
          container: this.$("#press-main-container"),
          model: new Section(null)
        }));
      };

      return PressView;

    })(AuthenticatedPageView);

  }).call(this);
  
});
window.require.register("views/section_view", function(exports, require, module) {
  (function() {
    var SectionView, View, mediator, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    View = require('views/view');

    template = require('views/templates/section');

    module.exports = SectionView = (function(_super) {

      __extends(SectionView, _super);

      function SectionView() {
        SectionView.__super__.constructor.apply(this, arguments);
      }

      SectionView.prototype.template = template;

      SectionView.prototype.tagName = 'li';

      SectionView.prototype.initialize = function() {
        console.debug('SectionView#initialize');
        return SectionView.__super__.initialize.apply(this, arguments);
      };

      SectionView.prototype.render = function() {
        console.debug('SectionView#render', this, this.$el);
        return SectionView.__super__.render.apply(this, arguments);
      };

      return SectionView;

    })(View);

  }).call(this);
  
});
window.require.register("views/sections_view", function(exports, require, module) {
  (function() {
    var BookTemplate, CollectionView, Section, SectionView, SectionsView, mediator, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    CollectionView = require('views/collection_view');

    SectionView = require('views/section_view');

    template = require('views/templates/sections');

    Section = require('models/section');

    BookTemplate = require('models/bookTemplate');

    module.exports = SectionsView = (function(_super) {

      __extends(SectionsView, _super);

      function SectionsView() {
        SectionsView.__super__.constructor.apply(this, arguments);
      }

      SectionsView.prototype.template = template;

      SectionsView.prototype.id = 'chapter-sections';

      SectionsView.prototype.className = 'well sidebar-nav';

      SectionsView.prototype.listSelector = '#section-list-container';

      SectionsView.prototype.fallbackSelector = '.fallback';

      SectionsView.prototype.loadingSelector = '.loading';

      SectionsView.prototype.initialize = function(options) {
        console.debug('SectionsView#initialize');
        SectionsView.__super__.initialize.apply(this, arguments);
        return this.delegate('click', '#create-section', this.createNewSection);
      };

      SectionsView.prototype.render = function() {
        console.log('SectionsView#render', this, this.$el);
        return SectionsView.__super__.render.apply(this, arguments);
      };

      SectionsView.prototype.createNewSection = function() {
        var bookTemplate;
        bookTemplate = new BookTemplate;
        return bookTemplate.fetch({
          success: _.bind(function() {
            var section;
            section = new Section({
              book_id: this.collection.book_id,
              chapter_id: this.collection.chapter_id
            });
            section.urlParams = function() {
              return {
                fromTemplate: 1,
                templateId: bookTemplate.get('_id')
              };
            };
            return section.save({}, {
              success: _.bind(function() {
                section.urlParams(function() {
                  return {};
                });
                return this.collection.add(section);
              }, this)
            });
          }, this)
        });
      };

      SectionsView.prototype.getView = function(item) {
        return new SectionView({
          model: item,
          container: this.$("#section-list-container")
        });
      };

      return SectionsView;

    })(CollectionView);

  }).call(this);
  
});
window.require.register("views/templates/chapter", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<div class=\"accordion-heading\">\n<a data-target='#section-container-";
    foundHelper = helpers._id;
    stack1 = foundHelper || depth0._id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "_id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "' data-toggle=\"collapse\"\n    class=\"accordion-toggle\"> ";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + " </a>\n</div>\n<div class=\"accordion-body collapse\" id=\"section-container-";
    foundHelper = helpers._id;
    stack1 = foundHelper || depth0._id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "_id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + " - ";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + " </div>\n\n";
    return buffer;});
});
window.require.register("views/templates/chapters", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div id=\"chapter-list-container\" class=\"accordion\">\n    <li class=\"nav-header\">Chapters</li> \n    <li><a id=\"add-chapter\" class=\"btn btn-primary\"> Add Chapter </a></li>\n</div>\n<p class=\"fallback\">You have not added any chapters yet \n\n";});
});
window.require.register("views/templates/dashboard", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<h1> This is Dashboard which shouldn't be accessible without login </h1>\n<br />\n<p><input type=\"button\" value=\"Create New Book\" id=\"create-new-book\" /></p>\n<div id=\"dashboard-content\"></div>\n\n";});
});
window.require.register("views/templates/home", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"hero-unit\">\n    <h1>Hello, world!</h1>\n    <p>This is a template for a simple marketing or informational website. It includes a large callout called the hero unit and three supporting pieces of content. Use it as a starting point to create something more unique.</p>\n    <p><a class=\"btn btn-primary btn-large\">Learn more &raquo;</a></p>\n</div>\n<!-- Example row of columns -->\n<div class=\"row\">\n    <div class=\"span4\">\n        <h2>Heading</h2>\n        <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>\n        <p><a class=\"btn\" href=\"#\">View details &raquo;</a></p>\n    </div>\n    <div class=\"span4\">\n        <h2>Heading</h2>\n        <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>\n        <p><a class=\"btn\" href=\"#\">View details &raquo;</a></p>\n    </div>\n</div> \n\n\n";});
});
window.require.register("views/templates/login", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "    <div class=\"modal-header\">\n        <a class=\"close\" href=\"/\" data-dismiss=\"modal\">X</a>\n        <h3>Login with your twitter or Facebook account</h3>\n    </div>\n    <div id=\"modal-body\">\n        <p><img class=\"sign-in-button twitter\" src=\"https://si0.twimg.com/images/dev/buttons/sign-in-with-twitter-l.png\" alt=\"Sign in with Twitter\" /></p>\n        <p><button class=\"facebook\">Log in with Facebook</button></p>\n    </div>\n    <div id=\"modal-footer\">\n        <!-- nothing in footer -->\n    </div>\n";});
});
window.require.register("views/templates/navigation", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

  function program1(depth0,data) {
    
    
    return "\n                    <li> <a id=\"loginLink\"  href=\"#logout\">logout</a> </li>\n                    ";}

  function program3(depth0,data) {
    
    
    return "\n                    <li> <a id=\"loginLink\"  href=\"#login\">login</a> </li>\n                    ";}

  function program5(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n                    <li> <a  href=\"";
    foundHelper = helpers.href;
    stack1 = foundHelper || depth0.href;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "href", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a> </li>\n                    ";
    return buffer;}

    buffer += "<div class=\"navbar navbar-fixed-top\">\n    <div class=\"navbar-inner\">\n        <div class=\"container\">\n            <a class=\"btn btn-navbar\" data-toggle=\"collapse\" data-target=\".nav-collapse\">\n                <span class=\"icon-bar\"></span>\n                <span class=\"icon-bar\"></span>\n                <span class=\"icon-bar\"></span>\n            </a>\n            <a class=\"brand\" href=\"#\">";
    foundHelper = helpers.projectname;
    stack1 = foundHelper || depth0.projectname;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "projectname", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a>\n            <div class=\"nav-collapse\">\n                <ul class=\"nav\">\n                    <li> <a   href=\"\">home</a> </li>\n                    ";
    foundHelper = helpers.if_logged_in;
    stack1 = foundHelper || depth0.if_logged_in;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(3, program3, data);
    if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n                    <li> <a  href=\"#logout\">Force Logout</a> </li>\n                    ";
    foundHelper = helpers.items;
    stack1 = foundHelper || depth0.items;
    stack2 = helpers.each;
    tmp1 = self.program(5, program5, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n                </ul>\n            </div><!--/.nav-collapse -->\n        </div>\n    </div>\n</div>\n";
    return buffer;});
});
window.require.register("views/templates/press", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "\n<div class=\"row-fluid\">\n    <div id=\"press-sidebar-container\" class=\"span3\">\n    </div>\n    <div class=\"span9\">\n        <div id=\"press-tabs-container\">\n        </div>\n        <div id=\"press-main-container\">\n        </div>\n    </div>\n</div>\n";});
});
window.require.register("views/templates/press_main", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return " <div class=\"tab-content\">\n            <div class=\"tab-pane active\" id=\"create\">\n                <div id=\"editor\">\n                    <form> <textarea id=\"book-editor\"\n                            style=\"width:810px;height:700px;\" placeholder=\"Start writing your book ...\"></textarea>\n                        <input type=\"submit\" value=\"Save\"\n                        id=\"book-editor-save\" />\n                    </form>\n                </div>\n            </div>\n            <div class=\"tab-pane\" id=\"package\">\n                <p>I am package</p>\n            </div>\n            <div class=\"tab-pane\" id=\"publish\">\n                <p>I am publish</p>\n            </div>\n            <div class=\"tab-pane\" id=\"feedback\">\n                <p>I am feedback</p>\n            </div>\n        </div>\n\n";});
});
window.require.register("views/templates/press_sidebar", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<div id=\"book-details\" class=\"well sidebar-nav\">\n    <ul class=\"nav nav-list\"><li class=\"nav-header\">Book\n        outline</li> <li> <a href='#books/";
    foundHelper = helpers._id;
    stack1 = foundHelper || depth0._id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "_id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "/";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    foundHelper = helpers.make_slag;
    stack2 = foundHelper || depth0.make_slag;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "make_slag", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "'> ";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a> </li> \n        <li> <a href='#'> Cover </a> </li>\n        <li> <a href='#'> Introduction </a> </li>\n        <li> <a href='#'> Table of Contents </a> </li>\n\n        <li>";
    foundHelper = helpers.subtitle;
    stack1 = foundHelper || depth0.subtitle;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "subtitle", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</li>\n        <li>";
    foundHelper = helpers.author;
    stack1 = foundHelper || depth0.author;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "author", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</li></ul>\n</div>\n<hr />\n\n";
    return buffer;});
});
window.require.register("views/templates/press_tab", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<ul class=\"nav nav-tabs\">\n    <li class=\"active\"><a href=\"#create\" data-toggle=\"tab\">Create</a></li>\n    <li><a href=\"#package\"  data-toggle=\"tab\">Package</a></li>\n    <li><a href=\"#publish\" data-toggle=\"tab\">Publish</a></li>\n    <li><a href=\"#feedback\" data-toggle=\"tab\">Feedback</a></li>\n</ul>\n\n";});
});
window.require.register("views/templates/project", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "  <% _.each(rows, function(row) { %>\n        <tr class=\"defaultRow\" vook=\"<%= row.title.replace(/'/g, '&rsquo;') %>\" isbn=\"<%= row.isbn_enhanced %>\" >\n            <td class=\"project-title\">\n                <a href=\"/a/vookvook2/vookbuilder/<%= row.pk %>\">\n                    <%= row.title.replace(new RegExp(input, 'ig'), '<span class=\"search_highlight\">$&</span>') %>\n                </a>\n                <% if (row.current_publishing_state === \"PENDING_DELIVERY\" || row.current_publishing_state === \"DELIVERED\") { %>\n                <div class=\"title-status\">Read only</div>\n                <% } else if (row.num_incomplete_entitlements > 0) { %>\n                <div class=\"title-status\" tooltip='<a href=\"/api/v1/accounts/vookvook2/<%= row.pk %>/entitlement/\" class=\"cancel-distribution\">cancel distribution</a>'>\n                Preparing for distribution\n                </div>\n                <% } %>\n            </td>\n\n            <td class=\"ball-holder\">\n            </td>\n\n            <td class=\"icons\">\n                <% if (row.current_publishing_state == 'NEW' || row.current_publishing_state == 'VALIDATING' || row.current_publishing_state == 'CANNOT_PUBLISH') {%>\n                <a class=\"edit_link\" href=\"/a/vookvook2/vookbuilder/<%= row.pk %>\" tooltip=\"Edit eBook\"></a>\n                <% } else { %>\n                <a class=\"edit_link disabled\" tooltip=\"Sorry, you can&rsquo;t edit an eBook that was distributed. Remove the eBook from sale first.\"></a>\n                <% } %>\n\n                <% if (row.metricly_status) { %>\n                    <a class=\"metrics_link\" href=\"\" tooltip=\"Click here to see metrics for this title.\"></a>\n                <% } else { %>\n                    <a class=\"metrics_link disabled\" tooltip=\"Metrics enabled when eBook is published through Vook.\"></a>\n                <% } %>\n\n                <% if (row.current_publishing_state == 'NEW' || row.current_publishing_state == 'VALIDATING' || row.current_publishing_state == 'CANNOT_PUBLISH') {%>\n				<a class=\"delete_link\" href=\"/api/v1/vooks/vookvook2/<%= row.pk %>/\" tooltip=\"Delete this eBook\"></a>\n                <% } else { %>\n                <a class=\"delete_link disabled\" tooltip=\"Sorry, you can&rsquo;t delete an eBook that was distributed. Remove the eBook from sale first.\"></a>\n                <% } %>\n            </td>\n        </tr>\n    <% }) %>\n\n";});
});
window.require.register("views/templates/section", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<a href=\"\"> ";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + " </a>\n";
    return buffer;});
});
window.require.register("views/templates/sections", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div id=\"section-list-container\" class=\"nav nav-pills nav-stack\">\n    <li class=\"nav-header\">Sections</li> \n<a id=\"create-section\" class=\"btn btn-primary\"> Create One </a> </p>\n</div>\n<p class=\"fallback\">You have not added any sections yet \n\n";});
});
window.require.register("views/templates/title", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "    <td>\n        <a href='#books/";
    foundHelper = helpers._id;
    stack1 = foundHelper || depth0._id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "_id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "/";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    foundHelper = helpers.make_slag;
    stack2 = foundHelper || depth0.make_slag;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "make_slag", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "'> ";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + " </a>\n    </td>\n    <td>\n        ";
    foundHelper = helpers.subtitle;
    stack1 = foundHelper || depth0.subtitle;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "subtitle", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\n    </td>\n    <td>\n        ";
    foundHelper = helpers.author;
    stack1 = foundHelper || depth0.author;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "author", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\n    </td>\n    <td>\n        ";
    foundHelper = helpers.status;
    stack1 = foundHelper || depth0.status;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "status", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\n    </td>\n";
    return buffer;});
});
window.require.register("views/templates/titles", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "    <thead>\n        <th>Title</th>\n        <th>Status</th>\n        <th>Author</th>\n        <th>Stats</th>\n    </thead>\n    <tbody id=\"titleTableContent\"></tbody>\n<p class=\"loading\">Loading…</p>\n\n<p class=\"fallback\">No posts found.</p>\n";});
});
window.require.register("views/templates/titletemp", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + ", ";
    foundHelper = helpers.status;
    stack1 = foundHelper || depth0.status;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "status", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\n";
    return buffer;});
});
window.require.register("views/title_view", function(exports, require, module) {
  (function() {
    var TitleView, View, mediator, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    View = require('views/view');

    template = require('views/templates/title');

    module.exports = TitleView = (function(_super) {

      __extends(TitleView, _super);

      function TitleView() {
        TitleView.__super__.constructor.apply(this, arguments);
      }

      TitleView.prototype.template = template;

      TitleView.prototype.tagName = 'tr';

      TitleView.prototype.initialize = function() {
        console.debug('TitleView#initialize');
        return TitleView.__super__.initialize.apply(this, arguments);
      };

      TitleView.prototype.render = function() {
        console.debug('TitleView#render', this, this.$el);
        return TitleView.__super__.render.apply(this, arguments);
      };

      return TitleView;

    })(View);

  }).call(this);
  
});
window.require.register("views/titles_view", function(exports, require, module) {
  (function() {
    var CollectionView, TitleView, TitlesView, mediator, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    mediator = require('mediator');

    CollectionView = require('views/collection_view');

    TitleView = require('views/title_view');

    template = require('views/templates/titles');

    module.exports = TitlesView = (function(_super) {

      __extends(TitlesView, _super);

      function TitlesView() {
        TitlesView.__super__.constructor.apply(this, arguments);
      }

      TitlesView.prototype.template = template;

      TitlesView.prototype.id = 'titleTable';

      TitlesView.prototype.tagName = 'table';

      TitlesView.prototype.className = 'table table-bordered';

      TitlesView.prototype.listSelector = '#titleTableContent';

      TitlesView.prototype.fallbackSelector = '.fallback';

      TitlesView.prototype.loadingSelector = '.loading';

      TitlesView.prototype.initialize = function() {
        console.debug('TitlesView#initialize');
        return TitlesView.__super__.initialize.apply(this, arguments);
      };

      TitlesView.prototype.render = function() {
        console.log('TitlesView#render', this, this.$el);
        return TitlesView.__super__.render.apply(this, arguments);
      };

      TitlesView.prototype.getView = function(item) {
        return new TitleView({
          model: item
        });
      };

      return TitlesView;

    })(CollectionView);

  }).call(this);
  
});
window.require.register("views/view", function(exports, require, module) {
  (function() {
    var ChaplinView, View,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ChaplinView = require('chaplin/views/view');

    require('lib/view_helper');

    module.exports = View = (function(_super) {

      __extends(View, _super);

      function View() {
        View.__super__.constructor.apply(this, arguments);
      }

      View.prototype.getTemplateFunction = function() {
        return this.template;
      };

      return View;

    })(ChaplinView);

  }).call(this);
  
});
