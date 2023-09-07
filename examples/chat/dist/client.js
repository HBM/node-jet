/******/ ;(() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = [
    /* 0 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      var __resourceQuery =
        '?protocol=ws%3A&hostname=0.0.0.0&port=8080&pathname=%2Fws&logging=log&overlay=true&reconnect=10&hot=true&live-reload=true'
      __webpack_require__.r(__webpack_exports__)
      /* harmony import */ var webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(1)
      /* harmony import */ var webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(
          webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_0__
        )
      /* harmony import */ var _utils_stripAnsi_js__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(2)
      /* harmony import */ var _utils_parseURL_js__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(3)
      /* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_3__ =
        __webpack_require__(5)
      /* harmony import */ var _overlay_js__WEBPACK_IMPORTED_MODULE_4__ =
        __webpack_require__(9)
      /* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_5__ =
        __webpack_require__(7)
      /* harmony import */ var _utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__ =
        __webpack_require__(19)
      /* harmony import */ var _utils_reloadApp_js__WEBPACK_IMPORTED_MODULE_7__ =
        __webpack_require__(20)
      /* harmony import */ var _utils_createSocketURL_js__WEBPACK_IMPORTED_MODULE_8__ =
        __webpack_require__(23)
      function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object)
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(object)
          enumerableOnly &&
            (symbols = symbols.filter(function (sym) {
              return Object.getOwnPropertyDescriptor(object, sym).enumerable
            })),
            keys.push.apply(keys, symbols)
        }
        return keys
      }
      function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = null != arguments[i] ? arguments[i] : {}
          i % 2
            ? ownKeys(Object(source), !0).forEach(function (key) {
                _defineProperty(target, key, source[key])
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(
                target,
                Object.getOwnPropertyDescriptors(source)
              )
            : ownKeys(Object(source)).forEach(function (key) {
                Object.defineProperty(
                  target,
                  key,
                  Object.getOwnPropertyDescriptor(source, key)
                )
              })
        }
        return target
      }
      function _defineProperty(obj, key, value) {
        key = _toPropertyKey(key)
        if (key in obj) {
          Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
          })
        } else {
          obj[key] = value
        }
        return obj
      }
      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, 'string')
        return typeof key === 'symbol' ? key : String(key)
      }
      function _toPrimitive(input, hint) {
        if (typeof input !== 'object' || input === null) return input
        var prim = input[Symbol.toPrimitive]
        if (prim !== undefined) {
          var res = prim.call(input, hint || 'default')
          if (typeof res !== 'object') return res
          throw new TypeError('@@toPrimitive must return a primitive value.')
        }
        return (hint === 'string' ? String : Number)(input)
      }
      /* global __resourceQuery, __webpack_hash__ */
      /// <reference types="webpack/module" />

      /**
       * @typedef {Object} OverlayOptions
       * @property {boolean | (error: Error) => boolean} [warnings]
       * @property {boolean | (error: Error) => boolean} [errors]
       * @property {boolean | (error: Error) => boolean} [runtimeErrors]
       * @property {string} [trustedTypesPolicyName]
       */

      /**
       * @typedef {Object} Options
       * @property {boolean} hot
       * @property {boolean} liveReload
       * @property {boolean} progress
       * @property {boolean | OverlayOptions} overlay
       * @property {string} [logging]
       * @property {number} [reconnect]
       */

      /**
       * @typedef {Object} Status
       * @property {boolean} isUnloading
       * @property {string} currentHash
       * @property {string} [previousHash]
       */

      /**
       * @param {boolean | { warnings?: boolean | string; errors?: boolean | string; runtimeErrors?: boolean | string; }} overlayOptions
       */
      var decodeOverlayOptions = function decodeOverlayOptions(overlayOptions) {
        if (typeof overlayOptions === 'object') {
          ;['warnings', 'errors', 'runtimeErrors'].forEach(function (property) {
            if (typeof overlayOptions[property] === 'string') {
              var overlayFilterFunctionString = decodeURIComponent(
                overlayOptions[property]
              )

              // eslint-disable-next-line no-new-func
              var overlayFilterFunction = new Function(
                'message',
                'var callback = '.concat(
                  overlayFilterFunctionString,
                  '\n        return callback(message)'
                )
              )
              overlayOptions[property] = overlayFilterFunction
            }
          })
        }
      }

      /**
       * @type {Status}
       */
      var status = {
        isUnloading: false,
        // TODO Workaround for webpack v4, `__webpack_hash__` is not replaced without HotModuleReplacement
        // eslint-disable-next-line camelcase
        currentHash: true ? __webpack_require__.h() : 0
      }

      /** @type {Options} */
      var options = {
        hot: false,
        liveReload: false,
        progress: false,
        overlay: false
      }
      var parsedResourceQuery = (0,
      _utils_parseURL_js__WEBPACK_IMPORTED_MODULE_2__['default'])(
        __resourceQuery
      )
      var enabledFeatures = {
        'Hot Module Replacement': false,
        'Live Reloading': false,
        Progress: false,
        Overlay: false
      }
      if (parsedResourceQuery.hot === 'true') {
        options.hot = true
        enabledFeatures['Hot Module Replacement'] = true
      }
      if (parsedResourceQuery['live-reload'] === 'true') {
        options.liveReload = true
        enabledFeatures['Live Reloading'] = true
      }
      if (parsedResourceQuery.progress === 'true') {
        options.progress = true
        enabledFeatures.Progress = true
      }
      if (parsedResourceQuery.overlay) {
        try {
          options.overlay = JSON.parse(parsedResourceQuery.overlay)
        } catch (e) {
          _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.error(
            'Error parsing overlay options from resource query:',
            e
          )
        }

        // Fill in default "true" params for partially-specified objects.
        if (typeof options.overlay === 'object') {
          options.overlay = _objectSpread(
            {
              errors: true,
              warnings: true,
              runtimeErrors: true
            },
            options.overlay
          )
          decodeOverlayOptions(options.overlay)
        }
        enabledFeatures.Overlay = true
      }
      if (parsedResourceQuery.logging) {
        options.logging = parsedResourceQuery.logging
      }
      if (typeof parsedResourceQuery.reconnect !== 'undefined') {
        options.reconnect = Number(parsedResourceQuery.reconnect)
      }

      /**
       * @param {string} level
       */
      function setAllLogLevel(level) {
        // This is needed because the HMR logger operate separately from dev server logger
        webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_0___default().setLogLevel(
          level === 'verbose' || level === 'log' ? 'info' : level
        )
        ;(0, _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.setLogLevel)(level)
      }
      if (options.logging) {
        setAllLogLevel(options.logging)
      }
      ;(0, _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.logEnabledFeatures)(
        enabledFeatures
      )
      self.addEventListener('beforeunload', function () {
        status.isUnloading = true
      })
      var overlay =
        typeof window !== 'undefined'
          ? (0, _overlay_js__WEBPACK_IMPORTED_MODULE_4__.createOverlay)(
              typeof options.overlay === 'object'
                ? {
                    trustedTypesPolicyName:
                      options.overlay.trustedTypesPolicyName,
                    catchRuntimeError: options.overlay.runtimeErrors
                  }
                : {
                    trustedTypesPolicyName: false,
                    catchRuntimeError: options.overlay
                  }
            )
          : {
              send: function send() {}
            }
      var onSocketMessage = {
        hot: function hot() {
          if (parsedResourceQuery.hot === 'false') {
            return
          }
          options.hot = true
        },
        liveReload: function liveReload() {
          if (parsedResourceQuery['live-reload'] === 'false') {
            return
          }
          options.liveReload = true
        },
        invalid: function invalid() {
          _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(
            'App updated. Recompiling...'
          )

          // Fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.
          if (options.overlay) {
            overlay.send({
              type: 'DISMISS'
            })
          }
          ;(0, _utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__['default'])(
            'Invalid'
          )
        },
        /**
         * @param {string} hash
         */
        hash: function hash(_hash) {
          status.previousHash = status.currentHash
          status.currentHash = _hash
        },
        logging: setAllLogLevel,
        /**
         * @param {boolean} value
         */
        overlay: function overlay(value) {
          if (typeof document === 'undefined') {
            return
          }
          options.overlay = value
          decodeOverlayOptions(options.overlay)
        },
        /**
         * @param {number} value
         */
        reconnect: function reconnect(value) {
          if (parsedResourceQuery.reconnect === 'false') {
            return
          }
          options.reconnect = value
        },
        /**
         * @param {boolean} value
         */
        progress: function progress(value) {
          options.progress = value
        },
        /**
         * @param {{ pluginName?: string, percent: number, msg: string }} data
         */
        'progress-update': function progressUpdate(data) {
          if (options.progress) {
            _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(
              ''
                .concat(
                  data.pluginName ? '['.concat(data.pluginName, '] ') : ''
                )
                .concat(data.percent, '% - ')
                .concat(data.msg, '.')
            )
          }
          ;(0, _utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__['default'])(
            'Progress',
            data
          )
        },
        'still-ok': function stillOk() {
          _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(
            'Nothing changed.'
          )
          if (options.overlay) {
            overlay.send({
              type: 'DISMISS'
            })
          }
          ;(0, _utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__['default'])(
            'StillOk'
          )
        },
        ok: function ok() {
          ;(0, _utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__['default'])(
            'Ok'
          )
          if (options.overlay) {
            overlay.send({
              type: 'DISMISS'
            })
          }
          ;(0, _utils_reloadApp_js__WEBPACK_IMPORTED_MODULE_7__['default'])(
            options,
            status
          )
        },
        // TODO: remove in v5 in favor of 'static-changed'
        /**
         * @param {string} file
         */
        'content-changed': function contentChanged(file) {
          _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(
            ''.concat(
              file ? '"'.concat(file, '"') : 'Content',
              ' from static directory was changed. Reloading...'
            )
          )
          self.location.reload()
        },
        /**
         * @param {string} file
         */
        'static-changed': function staticChanged(file) {
          _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info(
            ''.concat(
              file ? '"'.concat(file, '"') : 'Content',
              ' from static directory was changed. Reloading...'
            )
          )
          self.location.reload()
        },
        /**
         * @param {Error[]} warnings
         * @param {any} params
         */
        warnings: function warnings(_warnings, params) {
          _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.warn(
            'Warnings while compiling.'
          )
          var printableWarnings = _warnings.map(function (error) {
            var _formatProblem = (0,
              _overlay_js__WEBPACK_IMPORTED_MODULE_4__.formatProblem)(
                'warning',
                error
              ),
              header = _formatProblem.header,
              body = _formatProblem.body
            return ''
              .concat(header, '\n')
              .concat(
                (0,
                _utils_stripAnsi_js__WEBPACK_IMPORTED_MODULE_1__['default'])(
                  body
                )
              )
          })
          ;(0, _utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__['default'])(
            'Warnings',
            printableWarnings
          )
          for (var i = 0; i < printableWarnings.length; i++) {
            _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.warn(
              printableWarnings[i]
            )
          }
          var overlayWarningsSetting =
            typeof options.overlay === 'boolean'
              ? options.overlay
              : options.overlay && options.overlay.warnings
          if (overlayWarningsSetting) {
            var warningsToDisplay =
              typeof overlayWarningsSetting === 'function'
                ? _warnings.filter(overlayWarningsSetting)
                : _warnings
            if (warningsToDisplay.length) {
              overlay.send({
                type: 'BUILD_ERROR',
                level: 'warning',
                messages: _warnings
              })
            }
          }
          if (params && params.preventReloading) {
            return
          }
          ;(0, _utils_reloadApp_js__WEBPACK_IMPORTED_MODULE_7__['default'])(
            options,
            status
          )
        },
        /**
         * @param {Error[]} errors
         */
        errors: function errors(_errors) {
          _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.error(
            'Errors while compiling. Reload prevented.'
          )
          var printableErrors = _errors.map(function (error) {
            var _formatProblem2 = (0,
              _overlay_js__WEBPACK_IMPORTED_MODULE_4__.formatProblem)(
                'error',
                error
              ),
              header = _formatProblem2.header,
              body = _formatProblem2.body
            return ''
              .concat(header, '\n')
              .concat(
                (0,
                _utils_stripAnsi_js__WEBPACK_IMPORTED_MODULE_1__['default'])(
                  body
                )
              )
          })
          ;(0, _utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__['default'])(
            'Errors',
            printableErrors
          )
          for (var i = 0; i < printableErrors.length; i++) {
            _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.error(
              printableErrors[i]
            )
          }
          var overlayErrorsSettings =
            typeof options.overlay === 'boolean'
              ? options.overlay
              : options.overlay && options.overlay.errors
          if (overlayErrorsSettings) {
            var errorsToDisplay =
              typeof overlayErrorsSettings === 'function'
                ? _errors.filter(overlayErrorsSettings)
                : _errors
            if (errorsToDisplay.length) {
              overlay.send({
                type: 'BUILD_ERROR',
                level: 'error',
                messages: _errors
              })
            }
          }
        },
        /**
         * @param {Error} error
         */
        error: function error(_error) {
          _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.error(_error)
        },
        close: function close() {
          _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info('Disconnected!')
          if (options.overlay) {
            overlay.send({
              type: 'DISMISS'
            })
          }
          ;(0, _utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__['default'])(
            'Close'
          )
        }
      }
      var socketURL = (0,
      _utils_createSocketURL_js__WEBPACK_IMPORTED_MODULE_8__['default'])(
        parsedResourceQuery
      )
      ;(0, _socket_js__WEBPACK_IMPORTED_MODULE_3__['default'])(
        socketURL,
        onSocketMessage,
        options.reconnect
      )

      /***/
    },
    /* 1 */
    /***/ (module) => {
      /** @typedef {"info" | "warning" | "error"} LogLevel */

      /** @type {LogLevel} */
      var logLevel = 'info'

      function dummy() {}

      /**
       * @param {LogLevel} level log level
       * @returns {boolean} true, if should log
       */
      function shouldLog(level) {
        var shouldLog =
          (logLevel === 'info' && level === 'info') ||
          (['info', 'warning'].indexOf(logLevel) >= 0 && level === 'warning') ||
          (['info', 'warning', 'error'].indexOf(logLevel) >= 0 &&
            level === 'error')
        return shouldLog
      }

      /**
       * @param {(msg?: string) => void} logFn log function
       * @returns {(level: LogLevel, msg?: string) => void} function that logs when log level is sufficient
       */
      function logGroup(logFn) {
        return function (level, msg) {
          if (shouldLog(level)) {
            logFn(msg)
          }
        }
      }

      /**
       * @param {LogLevel} level log level
       * @param {string|Error} msg message
       */
      module.exports = function (level, msg) {
        if (shouldLog(level)) {
          if (level === 'info') {
            console.log(msg)
          } else if (level === 'warning') {
            console.warn(msg)
          } else if (level === 'error') {
            console.error(msg)
          }
        }
      }

      /* eslint-disable node/no-unsupported-features/node-builtins */
      var group = console.group || dummy
      var groupCollapsed = console.groupCollapsed || dummy
      var groupEnd = console.groupEnd || dummy
      /* eslint-enable node/no-unsupported-features/node-builtins */

      module.exports.group = logGroup(group)

      module.exports.groupCollapsed = logGroup(groupCollapsed)

      module.exports.groupEnd = logGroup(groupEnd)

      /**
       * @param {LogLevel} level log level
       */
      module.exports.setLogLevel = function (level) {
        logLevel = level
      }

      /**
       * @param {Error} err error
       * @returns {string} formatted error
       */
      module.exports.formatError = function (err) {
        var message = err.message
        var stack = err.stack
        if (!stack) {
          return message
        } else if (stack.indexOf(message) < 0) {
          return message + '\n' + stack
        } else {
          return stack
        }
      }

      /***/
    },
    /* 2 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      var ansiRegex = new RegExp(
        [
          '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
          '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))'
        ].join('|'),
        'g'
      )

      /**
       *
       * Strip [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code) from a string.
       * Adapted from code originally released by Sindre Sorhus
       * Licensed the MIT License
       *
       * @param {string} string
       * @return {string}
       */
      function stripAnsi(string) {
        if (typeof string !== 'string') {
          throw new TypeError(
            'Expected a `string`, got `'.concat(typeof string, '`')
          )
        }
        return string.replace(ansiRegex, '')
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = stripAnsi

      /***/
    },
    /* 3 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var _getCurrentScriptSource_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(4)

      /**
       * @param {string} resourceQuery
       * @returns {{ [key: string]: string | boolean }}
       */
      function parseURL(resourceQuery) {
        /** @type {{ [key: string]: string }} */
        var options = {}
        if (typeof resourceQuery === 'string' && resourceQuery !== '') {
          var searchParams = resourceQuery.slice(1).split('&')
          for (var i = 0; i < searchParams.length; i++) {
            var pair = searchParams[i].split('=')
            options[pair[0]] = decodeURIComponent(pair[1])
          }
        } else {
          // Else, get the url from the <script> this file was called with.
          var scriptSource = (0,
          _getCurrentScriptSource_js__WEBPACK_IMPORTED_MODULE_0__['default'])()
          var scriptSourceURL
          try {
            // The placeholder `baseURL` with `window.location.href`,
            // is to allow parsing of path-relative or protocol-relative URLs,
            // and will have no effect if `scriptSource` is a fully valid URL.
            scriptSourceURL = new URL(scriptSource, self.location.href)
          } catch (error) {
            // URL parsing failed, do nothing.
            // We will still proceed to see if we can recover using `resourceQuery`
          }
          if (scriptSourceURL) {
            options = scriptSourceURL
            options.fromCurrentScript = true
          }
        }
        return options
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = parseURL

      /***/
    },
    /* 4 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /**
       * @returns {string}
       */
      function getCurrentScriptSource() {
        // `document.currentScript` is the most accurate way to find the current script,
        // but is not supported in all browsers.
        if (document.currentScript) {
          return document.currentScript.getAttribute('src')
        }

        // Fallback to getting all scripts running in the document.
        var scriptElements = document.scripts || []
        var scriptElementsWithSrc = Array.prototype.filter.call(
          scriptElements,
          function (element) {
            return element.getAttribute('src')
          }
        )
        if (scriptElementsWithSrc.length > 0) {
          var currentScript =
            scriptElementsWithSrc[scriptElementsWithSrc.length - 1]
          return currentScript.getAttribute('src')
        }

        // Fail as there was no script to use.
        throw new Error(
          '[webpack-dev-server] Failed to get current script source.'
        )
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
        getCurrentScriptSource

      /***/
    },
    /* 5 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ client: () => /* binding */ client,
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var _clients_WebSocketClient_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(6)
      /* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(7)
      /* provided dependency */ var __webpack_dev_server_client__ =
        __webpack_require__(6)
      /* global __webpack_dev_server_client__ */

      // this WebsocketClient is here as a default fallback, in case the client is not injected
      /* eslint-disable camelcase */
      var Client =
        // eslint-disable-next-line no-nested-ternary
        typeof __webpack_dev_server_client__ !== 'undefined'
          ? typeof __webpack_dev_server_client__.default !== 'undefined'
            ? __webpack_dev_server_client__.default
            : __webpack_dev_server_client__
          : _clients_WebSocketClient_js__WEBPACK_IMPORTED_MODULE_0__['default']
      /* eslint-enable camelcase */

      var retries = 0
      var maxRetries = 10

      // Initialized client is exported so external consumers can utilize the same instance
      // It is mutable to enforce singleton
      // eslint-disable-next-line import/no-mutable-exports
      var client = null

      /**
       * @param {string} url
       * @param {{ [handler: string]: (data?: any, params?: any) => any }} handlers
       * @param {number} [reconnect]
       */
      var socket = function initSocket(url, handlers, reconnect) {
        client = new Client(url)
        client.onOpen(function () {
          retries = 0
          if (typeof reconnect !== 'undefined') {
            maxRetries = reconnect
          }
        })
        client.onClose(function () {
          if (retries === 0) {
            handlers.close()
          }

          // Try to reconnect.
          client = null

          // After 10 retries stop trying, to prevent logspam.
          if (retries < maxRetries) {
            // Exponentially increase timeout to reconnect.
            // Respectfully copied from the package `got`.
            // eslint-disable-next-line no-restricted-properties
            var retryInMs = 1000 * Math.pow(2, retries) + Math.random() * 100
            retries += 1
            _utils_log_js__WEBPACK_IMPORTED_MODULE_1__.log.info(
              'Trying to reconnect...'
            )
            setTimeout(function () {
              socket(url, handlers, reconnect)
            }, retryInMs)
          }
        })
        client.onMessage(
          /**
           * @param {any} data
           */
          function (data) {
            var message = JSON.parse(data)
            if (handlers[message.type]) {
              handlers[message.type](message.data, message.params)
            }
          }
        )
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = socket

      /***/
    },
    /* 6 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ WebSocketClient
        /* harmony export */
      })
      /* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(7)
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError('Cannot call a class as a function')
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i]
          descriptor.enumerable = descriptor.enumerable || false
          descriptor.configurable = true
          if ('value' in descriptor) descriptor.writable = true
          Object.defineProperty(
            target,
            _toPropertyKey(descriptor.key),
            descriptor
          )
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps)
        if (staticProps) _defineProperties(Constructor, staticProps)
        Object.defineProperty(Constructor, 'prototype', { writable: false })
        return Constructor
      }
      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, 'string')
        return typeof key === 'symbol' ? key : String(key)
      }
      function _toPrimitive(input, hint) {
        if (typeof input !== 'object' || input === null) return input
        var prim = input[Symbol.toPrimitive]
        if (prim !== undefined) {
          var res = prim.call(input, hint || 'default')
          if (typeof res !== 'object') return res
          throw new TypeError('@@toPrimitive must return a primitive value.')
        }
        return (hint === 'string' ? String : Number)(input)
      }

      var WebSocketClient = /*#__PURE__*/ (function () {
        /**
         * @param {string} url
         */
        function WebSocketClient(url) {
          _classCallCheck(this, WebSocketClient)
          this.client = new WebSocket(url)
          this.client.onerror = function (error) {
            _utils_log_js__WEBPACK_IMPORTED_MODULE_0__.log.error(error)
          }
        }

        /**
         * @param {(...args: any[]) => void} f
         */
        _createClass(WebSocketClient, [
          {
            key: 'onOpen',
            value: function onOpen(f) {
              this.client.onopen = f
            }

            /**
             * @param {(...args: any[]) => void} f
             */
          },
          {
            key: 'onClose',
            value: function onClose(f) {
              this.client.onclose = f
            }

            // call f with the message string as the first argument
            /**
             * @param {(...args: any[]) => void} f
             */
          },
          {
            key: 'onMessage',
            value: function onMessage(f) {
              this.client.onmessage = function (e) {
                f(e.data)
              }
            }
          }
        ])
        return WebSocketClient
      })()

      /***/
    },
    /* 7 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ log: () => /* binding */ log,
        /* harmony export */ logEnabledFeatures: () =>
          /* binding */ logEnabledFeatures,
        /* harmony export */ setLogLevel: () => /* binding */ setLogLevel
        /* harmony export */
      })
      /* harmony import */ var _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(8)
      /* harmony import */ var _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(
          _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0__
        )

      var name = 'webpack-dev-server'
      // default level is set on the client side, so it does not need
      // to be set by the CLI or API
      var defaultLevel = 'info'

      // options new options, merge with old options
      /**
       * @param {false | true | "none" | "error" | "warn" | "info" | "log" | "verbose"} level
       * @returns {void}
       */
      function setLogLevel(level) {
        _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0___default().configureDefaultLogger(
          {
            level: level
          }
        )
      }
      setLogLevel(defaultLevel)
      var log =
        _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0___default().getLogger(
          name
        )
      var logEnabledFeatures = function logEnabledFeatures(features) {
        var enabledFeatures = Object.keys(features)
        if (!features || enabledFeatures.length === 0) {
          return
        }
        var logString = 'Server started:'

        // Server started: Hot Module Replacement enabled, Live Reloading enabled, Overlay disabled.
        for (var i = 0; i < enabledFeatures.length; i++) {
          var key = enabledFeatures[i]
          logString += ' '
            .concat(key, ' ')
            .concat(features[key] ? 'enabled' : 'disabled', ',')
        }
        // replace last comma with a period
        logString = logString.slice(0, -1).concat('.')
        log.info(logString)
      }

      /***/
    },
    /* 8 */
    /***/ (__unused_webpack_module, exports) => {
      /******/ ;(function () {
        // webpackBootstrap
        /******/ 'use strict'
        /******/ var __webpack_modules__ = {
          /***/ './client-src/modules/logger/SyncBailHookFake.js':
            /*!*******************************************************!*\
  !*** ./client-src/modules/logger/SyncBailHookFake.js ***!
  \*******************************************************/
            /***/ function (module) {
              /**
               * Client stub for tapable SyncBailHook
               */
              module.exports = function clientTapableSyncBailHook() {
                return {
                  call: function call() {}
                }
              }

              /***/
            },

          /***/ './node_modules/webpack/lib/logging/Logger.js':
            /*!****************************************************!*\
  !*** ./node_modules/webpack/lib/logging/Logger.js ***!
  \****************************************************/
            /***/ function (__unused_webpack_module, exports) {
              /*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

              function _toConsumableArray(arr) {
                return (
                  _arrayWithoutHoles(arr) ||
                  _iterableToArray(arr) ||
                  _unsupportedIterableToArray(arr) ||
                  _nonIterableSpread()
                )
              }
              function _nonIterableSpread() {
                throw new TypeError(
                  'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                )
              }
              function _unsupportedIterableToArray(o, minLen) {
                if (!o) return
                if (typeof o === 'string') return _arrayLikeToArray(o, minLen)
                var n = Object.prototype.toString.call(o).slice(8, -1)
                if (n === 'Object' && o.constructor) n = o.constructor.name
                if (n === 'Map' || n === 'Set') return Array.from(o)
                if (
                  n === 'Arguments' ||
                  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                )
                  return _arrayLikeToArray(o, minLen)
              }
              function _iterableToArray(iter) {
                if (
                  (typeof (typeof Symbol !== 'undefined'
                    ? Symbol
                    : function (i) {
                        return i
                      }) !== 'undefined' &&
                    iter[
                      (typeof Symbol !== 'undefined'
                        ? Symbol
                        : function (i) {
                            return i
                          }
                      ).iterator
                    ] != null) ||
                  iter['@@iterator'] != null
                )
                  return Array.from(iter)
              }
              function _arrayWithoutHoles(arr) {
                if (Array.isArray(arr)) return _arrayLikeToArray(arr)
              }
              function _arrayLikeToArray(arr, len) {
                if (len == null || len > arr.length) len = arr.length
                for (var i = 0, arr2 = new Array(len); i < len; i++)
                  arr2[i] = arr[i]
                return arr2
              }
              function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                  throw new TypeError('Cannot call a class as a function')
                }
              }
              function _defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i]
                  descriptor.enumerable = descriptor.enumerable || false
                  descriptor.configurable = true
                  if ('value' in descriptor) descriptor.writable = true
                  Object.defineProperty(
                    target,
                    _toPropertyKey(descriptor.key),
                    descriptor
                  )
                }
              }
              function _createClass(Constructor, protoProps, staticProps) {
                if (protoProps)
                  _defineProperties(Constructor.prototype, protoProps)
                if (staticProps) _defineProperties(Constructor, staticProps)
                Object.defineProperty(Constructor, 'prototype', {
                  writable: false
                })
                return Constructor
              }
              function _toPropertyKey(arg) {
                var key = _toPrimitive(arg, 'string')
                return typeof key === 'symbol' ? key : String(key)
              }
              function _toPrimitive(input, hint) {
                if (typeof input !== 'object' || input === null) return input
                var prim =
                  input[
                    (typeof Symbol !== 'undefined'
                      ? Symbol
                      : function (i) {
                          return i
                        }
                    ).toPrimitive
                  ]
                if (prim !== undefined) {
                  var res = prim.call(input, hint || 'default')
                  if (typeof res !== 'object') return res
                  throw new TypeError(
                    '@@toPrimitive must return a primitive value.'
                  )
                }
                return (hint === 'string' ? String : Number)(input)
              }
              var LogType = Object.freeze({
                error: /** @type {"error"} */ 'error',
                // message, c style arguments
                warn: /** @type {"warn"} */ 'warn',
                // message, c style arguments
                info: /** @type {"info"} */ 'info',
                // message, c style arguments
                log: /** @type {"log"} */ 'log',
                // message, c style arguments
                debug: /** @type {"debug"} */ 'debug',
                // message, c style arguments

                trace: /** @type {"trace"} */ 'trace',
                // no arguments

                group: /** @type {"group"} */ 'group',
                // [label]
                groupCollapsed:
                  /** @type {"groupCollapsed"} */ 'groupCollapsed',
                // [label]
                groupEnd: /** @type {"groupEnd"} */ 'groupEnd',
                // [label]

                profile: /** @type {"profile"} */ 'profile',
                // [profileName]
                profileEnd: /** @type {"profileEnd"} */ 'profileEnd',
                // [profileName]

                time: /** @type {"time"} */ 'time',
                // name, time as [seconds, nanoseconds]

                clear: /** @type {"clear"} */ 'clear',
                // no arguments
                status: /** @type {"status"} */ 'status' // message, arguments
              })

              exports.LogType = LogType

              /** @typedef {typeof LogType[keyof typeof LogType]} LogTypeEnum */

              var LOG_SYMBOL = (
                typeof Symbol !== 'undefined'
                  ? Symbol
                  : function (i) {
                      return i
                    }
              )('webpack logger raw log method')
              var TIMERS_SYMBOL = (
                typeof Symbol !== 'undefined'
                  ? Symbol
                  : function (i) {
                      return i
                    }
              )('webpack logger times')
              var TIMERS_AGGREGATES_SYMBOL = (
                typeof Symbol !== 'undefined'
                  ? Symbol
                  : function (i) {
                      return i
                    }
              )('webpack logger aggregated times')
              var WebpackLogger = /*#__PURE__*/ (function () {
                /**
                 * @param {function(LogTypeEnum, any[]=): void} log log function
                 * @param {function(string | function(): string): WebpackLogger} getChildLogger function to create child logger
                 */
                function WebpackLogger(log, getChildLogger) {
                  _classCallCheck(this, WebpackLogger)
                  this[LOG_SYMBOL] = log
                  this.getChildLogger = getChildLogger
                }
                _createClass(WebpackLogger, [
                  {
                    key: 'error',
                    value: function error() {
                      for (
                        var _len = arguments.length,
                          args = new Array(_len),
                          _key = 0;
                        _key < _len;
                        _key++
                      ) {
                        args[_key] = arguments[_key]
                      }
                      this[LOG_SYMBOL](LogType.error, args)
                    }
                  },
                  {
                    key: 'warn',
                    value: function warn() {
                      for (
                        var _len2 = arguments.length,
                          args = new Array(_len2),
                          _key2 = 0;
                        _key2 < _len2;
                        _key2++
                      ) {
                        args[_key2] = arguments[_key2]
                      }
                      this[LOG_SYMBOL](LogType.warn, args)
                    }
                  },
                  {
                    key: 'info',
                    value: function info() {
                      for (
                        var _len3 = arguments.length,
                          args = new Array(_len3),
                          _key3 = 0;
                        _key3 < _len3;
                        _key3++
                      ) {
                        args[_key3] = arguments[_key3]
                      }
                      this[LOG_SYMBOL](LogType.info, args)
                    }
                  },
                  {
                    key: 'log',
                    value: function log() {
                      for (
                        var _len4 = arguments.length,
                          args = new Array(_len4),
                          _key4 = 0;
                        _key4 < _len4;
                        _key4++
                      ) {
                        args[_key4] = arguments[_key4]
                      }
                      this[LOG_SYMBOL](LogType.log, args)
                    }
                  },
                  {
                    key: 'debug',
                    value: function debug() {
                      for (
                        var _len5 = arguments.length,
                          args = new Array(_len5),
                          _key5 = 0;
                        _key5 < _len5;
                        _key5++
                      ) {
                        args[_key5] = arguments[_key5]
                      }
                      this[LOG_SYMBOL](LogType.debug, args)
                    }
                  },
                  {
                    key: 'assert',
                    value: function assert(assertion) {
                      if (!assertion) {
                        for (
                          var _len6 = arguments.length,
                            args = new Array(_len6 > 1 ? _len6 - 1 : 0),
                            _key6 = 1;
                          _key6 < _len6;
                          _key6++
                        ) {
                          args[_key6 - 1] = arguments[_key6]
                        }
                        this[LOG_SYMBOL](LogType.error, args)
                      }
                    }
                  },
                  {
                    key: 'trace',
                    value: function trace() {
                      this[LOG_SYMBOL](LogType.trace, ['Trace'])
                    }
                  },
                  {
                    key: 'clear',
                    value: function clear() {
                      this[LOG_SYMBOL](LogType.clear)
                    }
                  },
                  {
                    key: 'status',
                    value: function status() {
                      for (
                        var _len7 = arguments.length,
                          args = new Array(_len7),
                          _key7 = 0;
                        _key7 < _len7;
                        _key7++
                      ) {
                        args[_key7] = arguments[_key7]
                      }
                      this[LOG_SYMBOL](LogType.status, args)
                    }
                  },
                  {
                    key: 'group',
                    value: function group() {
                      for (
                        var _len8 = arguments.length,
                          args = new Array(_len8),
                          _key8 = 0;
                        _key8 < _len8;
                        _key8++
                      ) {
                        args[_key8] = arguments[_key8]
                      }
                      this[LOG_SYMBOL](LogType.group, args)
                    }
                  },
                  {
                    key: 'groupCollapsed',
                    value: function groupCollapsed() {
                      for (
                        var _len9 = arguments.length,
                          args = new Array(_len9),
                          _key9 = 0;
                        _key9 < _len9;
                        _key9++
                      ) {
                        args[_key9] = arguments[_key9]
                      }
                      this[LOG_SYMBOL](LogType.groupCollapsed, args)
                    }
                  },
                  {
                    key: 'groupEnd',
                    value: function groupEnd() {
                      for (
                        var _len10 = arguments.length,
                          args = new Array(_len10),
                          _key10 = 0;
                        _key10 < _len10;
                        _key10++
                      ) {
                        args[_key10] = arguments[_key10]
                      }
                      this[LOG_SYMBOL](LogType.groupEnd, args)
                    }
                  },
                  {
                    key: 'profile',
                    value: function profile(label) {
                      this[LOG_SYMBOL](LogType.profile, [label])
                    }
                  },
                  {
                    key: 'profileEnd',
                    value: function profileEnd(label) {
                      this[LOG_SYMBOL](LogType.profileEnd, [label])
                    }
                  },
                  {
                    key: 'time',
                    value: function time(label) {
                      this[TIMERS_SYMBOL] = this[TIMERS_SYMBOL] || new Map()
                      this[TIMERS_SYMBOL].set(label, process.hrtime())
                    }
                  },
                  {
                    key: 'timeLog',
                    value: function timeLog(label) {
                      var prev =
                        this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label)
                      if (!prev) {
                        throw new Error(
                          "No such label '".concat(
                            label,
                            "' for WebpackLogger.timeLog()"
                          )
                        )
                      }
                      var time = process.hrtime(prev)
                      this[LOG_SYMBOL](
                        LogType.time,
                        [label].concat(_toConsumableArray(time))
                      )
                    }
                  },
                  {
                    key: 'timeEnd',
                    value: function timeEnd(label) {
                      var prev =
                        this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label)
                      if (!prev) {
                        throw new Error(
                          "No such label '".concat(
                            label,
                            "' for WebpackLogger.timeEnd()"
                          )
                        )
                      }
                      var time = process.hrtime(prev)
                      this[TIMERS_SYMBOL].delete(label)
                      this[LOG_SYMBOL](
                        LogType.time,
                        [label].concat(_toConsumableArray(time))
                      )
                    }
                  },
                  {
                    key: 'timeAggregate',
                    value: function timeAggregate(label) {
                      var prev =
                        this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label)
                      if (!prev) {
                        throw new Error(
                          "No such label '".concat(
                            label,
                            "' for WebpackLogger.timeAggregate()"
                          )
                        )
                      }
                      var time = process.hrtime(prev)
                      this[TIMERS_SYMBOL].delete(label)
                      this[TIMERS_AGGREGATES_SYMBOL] =
                        this[TIMERS_AGGREGATES_SYMBOL] || new Map()
                      var current = this[TIMERS_AGGREGATES_SYMBOL].get(label)
                      if (current !== undefined) {
                        if (time[1] + current[1] > 1e9) {
                          time[0] += current[0] + 1
                          time[1] = time[1] - 1e9 + current[1]
                        } else {
                          time[0] += current[0]
                          time[1] += current[1]
                        }
                      }
                      this[TIMERS_AGGREGATES_SYMBOL].set(label, time)
                    }
                  },
                  {
                    key: 'timeAggregateEnd',
                    value: function timeAggregateEnd(label) {
                      if (this[TIMERS_AGGREGATES_SYMBOL] === undefined) return
                      var time = this[TIMERS_AGGREGATES_SYMBOL].get(label)
                      if (time === undefined) return
                      this[TIMERS_AGGREGATES_SYMBOL].delete(label)
                      this[LOG_SYMBOL](
                        LogType.time,
                        [label].concat(_toConsumableArray(time))
                      )
                    }
                  }
                ])
                return WebpackLogger
              })()
              exports.Logger = WebpackLogger

              /***/
            },

          /***/ './node_modules/webpack/lib/logging/createConsoleLogger.js':
            /*!*****************************************************************!*\
  !*** ./node_modules/webpack/lib/logging/createConsoleLogger.js ***!
  \*****************************************************************/
            /***/ function (
              module,
              __unused_webpack_exports,
              __nested_webpack_require_11285__
            ) {
              /*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

              function _toConsumableArray(arr) {
                return (
                  _arrayWithoutHoles(arr) ||
                  _iterableToArray(arr) ||
                  _unsupportedIterableToArray(arr) ||
                  _nonIterableSpread()
                )
              }
              function _nonIterableSpread() {
                throw new TypeError(
                  'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                )
              }
              function _unsupportedIterableToArray(o, minLen) {
                if (!o) return
                if (typeof o === 'string') return _arrayLikeToArray(o, minLen)
                var n = Object.prototype.toString.call(o).slice(8, -1)
                if (n === 'Object' && o.constructor) n = o.constructor.name
                if (n === 'Map' || n === 'Set') return Array.from(o)
                if (
                  n === 'Arguments' ||
                  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                )
                  return _arrayLikeToArray(o, minLen)
              }
              function _iterableToArray(iter) {
                if (
                  (typeof (typeof Symbol !== 'undefined'
                    ? Symbol
                    : function (i) {
                        return i
                      }) !== 'undefined' &&
                    iter[
                      (typeof Symbol !== 'undefined'
                        ? Symbol
                        : function (i) {
                            return i
                          }
                      ).iterator
                    ] != null) ||
                  iter['@@iterator'] != null
                )
                  return Array.from(iter)
              }
              function _arrayWithoutHoles(arr) {
                if (Array.isArray(arr)) return _arrayLikeToArray(arr)
              }
              function _arrayLikeToArray(arr, len) {
                if (len == null || len > arr.length) len = arr.length
                for (var i = 0, arr2 = new Array(len); i < len; i++)
                  arr2[i] = arr[i]
                return arr2
              }
              var _require = __nested_webpack_require_11285__(
                  /*! ./Logger */ './node_modules/webpack/lib/logging/Logger.js'
                ),
                LogType = _require.LogType

              /** @typedef {import("../../declarations/WebpackOptions").FilterItemTypes} FilterItemTypes */
              /** @typedef {import("../../declarations/WebpackOptions").FilterTypes} FilterTypes */
              /** @typedef {import("./Logger").LogTypeEnum} LogTypeEnum */

              /** @typedef {function(string): boolean} FilterFunction */

              /**
               * @typedef {Object} LoggerConsole
               * @property {function(): void} clear
               * @property {function(): void} trace
               * @property {(...args: any[]) => void} info
               * @property {(...args: any[]) => void} log
               * @property {(...args: any[]) => void} warn
               * @property {(...args: any[]) => void} error
               * @property {(...args: any[]) => void=} debug
               * @property {(...args: any[]) => void=} group
               * @property {(...args: any[]) => void=} groupCollapsed
               * @property {(...args: any[]) => void=} groupEnd
               * @property {(...args: any[]) => void=} status
               * @property {(...args: any[]) => void=} profile
               * @property {(...args: any[]) => void=} profileEnd
               * @property {(...args: any[]) => void=} logTime
               */

              /**
               * @typedef {Object} LoggerOptions
               * @property {false|true|"none"|"error"|"warn"|"info"|"log"|"verbose"} level loglevel
               * @property {FilterTypes|boolean} debug filter for debug logging
               * @property {LoggerConsole} console the console to log to
               */

              /**
               * @param {FilterItemTypes} item an input item
               * @returns {FilterFunction} filter function
               */
              var filterToFunction = function filterToFunction(item) {
                if (typeof item === 'string') {
                  var regExp = new RegExp(
                    '[\\\\/]'.concat(
                      item.replace(
                        // eslint-disable-next-line no-useless-escape
                        /[-[\]{}()*+?.\\^$|]/g,
                        '\\$&'
                      ),
                      '([\\\\/]|$|!|\\?)'
                    )
                  )
                  return function (ident) {
                    return regExp.test(ident)
                  }
                }
                if (
                  item &&
                  typeof item === 'object' &&
                  typeof item.test === 'function'
                ) {
                  return function (ident) {
                    return item.test(ident)
                  }
                }
                if (typeof item === 'function') {
                  return item
                }
                if (typeof item === 'boolean') {
                  return function () {
                    return item
                  }
                }
              }

              /**
               * @enum {number}
               */
              var LogLevel = {
                none: 6,
                false: 6,
                error: 5,
                warn: 4,
                info: 3,
                log: 2,
                true: 2,
                verbose: 1
              }

              /**
               * @param {LoggerOptions} options options object
               * @returns {function(string, LogTypeEnum, any[]): void} logging function
               */
              module.exports = function (_ref) {
                var _ref$level = _ref.level,
                  level = _ref$level === void 0 ? 'info' : _ref$level,
                  _ref$debug = _ref.debug,
                  debug = _ref$debug === void 0 ? false : _ref$debug,
                  console = _ref.console
                var debugFilters =
                  typeof debug === 'boolean'
                    ? [
                        function () {
                          return debug
                        }
                      ]
                    : /** @type {FilterItemTypes[]} */ []
                        .concat(debug)
                        .map(filterToFunction)
                /** @type {number} */
                var loglevel = LogLevel[''.concat(level)] || 0

                /**
                 * @param {string} name name of the logger
                 * @param {LogTypeEnum} type type of the log entry
                 * @param {any[]} args arguments of the log entry
                 * @returns {void}
                 */
                var logger = function logger(name, type, args) {
                  var labeledArgs = function labeledArgs() {
                    if (Array.isArray(args)) {
                      if (args.length > 0 && typeof args[0] === 'string') {
                        return ['['.concat(name, '] ').concat(args[0])].concat(
                          _toConsumableArray(args.slice(1))
                        )
                      } else {
                        return ['['.concat(name, ']')].concat(
                          _toConsumableArray(args)
                        )
                      }
                    } else {
                      return []
                    }
                  }
                  var debug = debugFilters.some(function (f) {
                    return f(name)
                  })
                  switch (type) {
                    case LogType.debug:
                      if (!debug) return
                      // eslint-disable-next-line node/no-unsupported-features/node-builtins
                      if (typeof console.debug === 'function') {
                        // eslint-disable-next-line node/no-unsupported-features/node-builtins
                        console.debug.apply(
                          console,
                          _toConsumableArray(labeledArgs())
                        )
                      } else {
                        console.log.apply(
                          console,
                          _toConsumableArray(labeledArgs())
                        )
                      }
                      break
                    case LogType.log:
                      if (!debug && loglevel > LogLevel.log) return
                      console.log.apply(
                        console,
                        _toConsumableArray(labeledArgs())
                      )
                      break
                    case LogType.info:
                      if (!debug && loglevel > LogLevel.info) return
                      console.info.apply(
                        console,
                        _toConsumableArray(labeledArgs())
                      )
                      break
                    case LogType.warn:
                      if (!debug && loglevel > LogLevel.warn) return
                      console.warn.apply(
                        console,
                        _toConsumableArray(labeledArgs())
                      )
                      break
                    case LogType.error:
                      if (!debug && loglevel > LogLevel.error) return
                      console.error.apply(
                        console,
                        _toConsumableArray(labeledArgs())
                      )
                      break
                    case LogType.trace:
                      if (!debug) return
                      console.trace()
                      break
                    case LogType.groupCollapsed:
                      if (!debug && loglevel > LogLevel.log) return
                      if (!debug && loglevel > LogLevel.verbose) {
                        // eslint-disable-next-line node/no-unsupported-features/node-builtins
                        if (typeof console.groupCollapsed === 'function') {
                          // eslint-disable-next-line node/no-unsupported-features/node-builtins
                          console.groupCollapsed.apply(
                            console,
                            _toConsumableArray(labeledArgs())
                          )
                        } else {
                          console.log.apply(
                            console,
                            _toConsumableArray(labeledArgs())
                          )
                        }
                        break
                      }
                    // falls through
                    case LogType.group:
                      if (!debug && loglevel > LogLevel.log) return
                      // eslint-disable-next-line node/no-unsupported-features/node-builtins
                      if (typeof console.group === 'function') {
                        // eslint-disable-next-line node/no-unsupported-features/node-builtins
                        console.group.apply(
                          console,
                          _toConsumableArray(labeledArgs())
                        )
                      } else {
                        console.log.apply(
                          console,
                          _toConsumableArray(labeledArgs())
                        )
                      }
                      break
                    case LogType.groupEnd:
                      if (!debug && loglevel > LogLevel.log) return
                      // eslint-disable-next-line node/no-unsupported-features/node-builtins
                      if (typeof console.groupEnd === 'function') {
                        // eslint-disable-next-line node/no-unsupported-features/node-builtins
                        console.groupEnd()
                      }
                      break
                    case LogType.time: {
                      if (!debug && loglevel > LogLevel.log) return
                      var ms = args[1] * 1000 + args[2] / 1000000
                      var msg = '['
                        .concat(name, '] ')
                        .concat(args[0], ': ')
                        .concat(ms, ' ms')
                      if (typeof console.logTime === 'function') {
                        console.logTime(msg)
                      } else {
                        console.log(msg)
                      }
                      break
                    }
                    case LogType.profile:
                      // eslint-disable-next-line node/no-unsupported-features/node-builtins
                      if (typeof console.profile === 'function') {
                        // eslint-disable-next-line node/no-unsupported-features/node-builtins
                        console.profile.apply(
                          console,
                          _toConsumableArray(labeledArgs())
                        )
                      }
                      break
                    case LogType.profileEnd:
                      // eslint-disable-next-line node/no-unsupported-features/node-builtins
                      if (typeof console.profileEnd === 'function') {
                        // eslint-disable-next-line node/no-unsupported-features/node-builtins
                        console.profileEnd.apply(
                          console,
                          _toConsumableArray(labeledArgs())
                        )
                      }
                      break
                    case LogType.clear:
                      if (!debug && loglevel > LogLevel.log) return
                      // eslint-disable-next-line node/no-unsupported-features/node-builtins
                      if (typeof console.clear === 'function') {
                        // eslint-disable-next-line node/no-unsupported-features/node-builtins
                        console.clear()
                      }
                      break
                    case LogType.status:
                      if (!debug && loglevel > LogLevel.info) return
                      if (typeof console.status === 'function') {
                        if (args.length === 0) {
                          console.status()
                        } else {
                          console.status.apply(
                            console,
                            _toConsumableArray(labeledArgs())
                          )
                        }
                      } else {
                        if (args.length !== 0) {
                          console.info.apply(
                            console,
                            _toConsumableArray(labeledArgs())
                          )
                        }
                      }
                      break
                    default:
                      throw new Error('Unexpected LogType '.concat(type))
                  }
                }
                return logger
              }

              /***/
            },

          /***/ './node_modules/webpack/lib/logging/runtime.js':
            /*!*****************************************************!*\
  !*** ./node_modules/webpack/lib/logging/runtime.js ***!
  \*****************************************************/
            /***/ function (
              __unused_webpack_module,
              exports,
              __nested_webpack_require_21334__
            ) {
              /*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

              function _extends() {
                _extends = Object.assign
                  ? Object.assign.bind()
                  : function (target) {
                      for (var i = 1; i < arguments.length; i++) {
                        var source = arguments[i]
                        for (var key in source) {
                          if (
                            Object.prototype.hasOwnProperty.call(source, key)
                          ) {
                            target[key] = source[key]
                          }
                        }
                      }
                      return target
                    }
                return _extends.apply(this, arguments)
              }
              var SyncBailHook = __nested_webpack_require_21334__(
                /*! tapable/lib/SyncBailHook */ './client-src/modules/logger/SyncBailHookFake.js'
              )
              var _require = __nested_webpack_require_21334__(
                  /*! ./Logger */ './node_modules/webpack/lib/logging/Logger.js'
                ),
                Logger = _require.Logger
              var createConsoleLogger = __nested_webpack_require_21334__(
                /*! ./createConsoleLogger */ './node_modules/webpack/lib/logging/createConsoleLogger.js'
              )

              /** @type {createConsoleLogger.LoggerOptions} */
              var currentDefaultLoggerOptions = {
                level: 'info',
                debug: false,
                console: console
              }
              var currentDefaultLogger = createConsoleLogger(
                currentDefaultLoggerOptions
              )

              /**
               * @param {string} name name of the logger
               * @returns {Logger} a logger
               */
              exports.getLogger = function (name) {
                return new Logger(
                  function (type, args) {
                    if (
                      exports.hooks.log.call(name, type, args) === undefined
                    ) {
                      currentDefaultLogger(name, type, args)
                    }
                  },
                  function (childName) {
                    return exports.getLogger(
                      ''.concat(name, '/').concat(childName)
                    )
                  }
                )
              }

              /**
               * @param {createConsoleLogger.LoggerOptions} options new options, merge with old options
               * @returns {void}
               */
              exports.configureDefaultLogger = function (options) {
                _extends(currentDefaultLoggerOptions, options)
                currentDefaultLogger = createConsoleLogger(
                  currentDefaultLoggerOptions
                )
              }
              exports.hooks = {
                log: new SyncBailHook(['origin', 'type', 'args'])
              }

              /***/
            }

          /******/
        }
        /************************************************************************/
        /******/ // The module cache
        /******/ var __webpack_module_cache__ = {}
        /******/
        /******/ // The require function
        /******/ function __nested_webpack_require_23461__(moduleId) {
          /******/ // Check if module is in cache
          /******/ var cachedModule = __webpack_module_cache__[moduleId]
          /******/ if (cachedModule !== undefined) {
            /******/ return cachedModule.exports
            /******/
          }
          /******/ // Create a new module (and put it into the cache)
          /******/ var module = (__webpack_module_cache__[moduleId] = {
            /******/ // no module.id needed
            /******/ // no module.loaded needed
            /******/ exports: {}
            /******/
          })
          /******/
          /******/ // Execute the module function
          /******/ __webpack_modules__[moduleId](
            module,
            module.exports,
            __nested_webpack_require_23461__
          )
          /******/
          /******/ // Return the exports of the module
          /******/ return module.exports
          /******/
        }
        /******/
        /************************************************************************/
        /******/ /* webpack/runtime/define property getters */
        /******/ !(function () {
          /******/ // define getter functions for harmony exports
          /******/ __nested_webpack_require_23461__.d = function (
            exports,
            definition
          ) {
            /******/ for (var key in definition) {
              /******/ if (
                __nested_webpack_require_23461__.o(definition, key) &&
                !__nested_webpack_require_23461__.o(exports, key)
              ) {
                /******/ Object.defineProperty(exports, key, {
                  enumerable: true,
                  get: definition[key]
                })
                /******/
              }
              /******/
            }
            /******/
          }
          /******/
        })()
        /******/
        /******/ /* webpack/runtime/hasOwnProperty shorthand */
        /******/ !(function () {
          /******/ __nested_webpack_require_23461__.o = function (obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop)
          }
          /******/
        })()
        /******/
        /******/ /* webpack/runtime/make namespace object */
        /******/ !(function () {
          /******/ // define __esModule on exports
          /******/ __nested_webpack_require_23461__.r = function (exports) {
            /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
              /******/ Object.defineProperty(exports, Symbol.toStringTag, {
                value: 'Module'
              })
              /******/
            }
            /******/ Object.defineProperty(exports, '__esModule', {
              value: true
            })
            /******/
          }
          /******/
        })()
        /******/
        /************************************************************************/
        var __nested_webpack_exports__ = {}
        // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
        !(function () {
          /*!********************************************!*\
  !*** ./client-src/modules/logger/index.js ***!
  \********************************************/
          __nested_webpack_require_23461__.r(__nested_webpack_exports__)
          /* harmony export */ __nested_webpack_require_23461__.d(
            __nested_webpack_exports__,
            {
              /* harmony export */ default: function () {
                return /* reexport default export from named module */ webpack_lib_logging_runtime_js__WEBPACK_IMPORTED_MODULE_0__
              }
              /* harmony export */
            }
          )
          /* harmony import */ var webpack_lib_logging_runtime_js__WEBPACK_IMPORTED_MODULE_0__ =
            __nested_webpack_require_23461__(
              /*! webpack/lib/logging/runtime.js */ './node_modules/webpack/lib/logging/runtime.js'
            )
        })()
        var __webpack_export_target__ = exports
        for (var i in __nested_webpack_exports__)
          __webpack_export_target__[i] = __nested_webpack_exports__[i]
        if (__nested_webpack_exports__.__esModule)
          Object.defineProperty(__webpack_export_target__, '__esModule', {
            value: true
          })
        /******/
      })()

      /***/
    },
    /* 9 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ createOverlay: () => /* binding */ createOverlay,
        /* harmony export */ formatProblem: () => /* binding */ formatProblem
        /* harmony export */
      })
      /* harmony import */ var ansi_html_community__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(10)
      /* harmony import */ var ansi_html_community__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(
          ansi_html_community__WEBPACK_IMPORTED_MODULE_0__
        )
      /* harmony import */ var html_entities__WEBPACK_IMPORTED_MODULE_4__ =
        __webpack_require__(15)
      /* harmony import */ var html_entities__WEBPACK_IMPORTED_MODULE_4___default =
        /*#__PURE__*/ __webpack_require__.n(
          html_entities__WEBPACK_IMPORTED_MODULE_4__
        )
      /* harmony import */ var _overlay_runtime_error_js__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(11)
      /* harmony import */ var _overlay_state_machine_js__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(12)
      /* harmony import */ var _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__ =
        __webpack_require__(14)
      function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object)
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(object)
          enumerableOnly &&
            (symbols = symbols.filter(function (sym) {
              return Object.getOwnPropertyDescriptor(object, sym).enumerable
            })),
            keys.push.apply(keys, symbols)
        }
        return keys
      }
      function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = null != arguments[i] ? arguments[i] : {}
          i % 2
            ? ownKeys(Object(source), !0).forEach(function (key) {
                _defineProperty(target, key, source[key])
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(
                target,
                Object.getOwnPropertyDescriptors(source)
              )
            : ownKeys(Object(source)).forEach(function (key) {
                Object.defineProperty(
                  target,
                  key,
                  Object.getOwnPropertyDescriptor(source, key)
                )
              })
        }
        return target
      }
      function _defineProperty(obj, key, value) {
        key = _toPropertyKey(key)
        if (key in obj) {
          Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
          })
        } else {
          obj[key] = value
        }
        return obj
      }
      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, 'string')
        return typeof key === 'symbol' ? key : String(key)
      }
      function _toPrimitive(input, hint) {
        if (typeof input !== 'object' || input === null) return input
        var prim = input[Symbol.toPrimitive]
        if (prim !== undefined) {
          var res = prim.call(input, hint || 'default')
          if (typeof res !== 'object') return res
          throw new TypeError('@@toPrimitive must return a primitive value.')
        }
        return (hint === 'string' ? String : Number)(input)
      }
      // The error overlay is inspired (and mostly copied) from Create React App (https://github.com/facebookincubator/create-react-app)
      // They, in turn, got inspired by webpack-hot-middleware (https://github.com/glenjamin/webpack-hot-middleware).

      var colors = {
        reset: ['transparent', 'transparent'],
        black: '181818',
        red: 'E36049',
        green: 'B3CB74',
        yellow: 'FFD080',
        blue: '7CAFC2',
        magenta: '7FACCA',
        cyan: 'C3C2EF',
        lightgrey: 'EBE7E3',
        darkgrey: '6D7891'
      }
      ansi_html_community__WEBPACK_IMPORTED_MODULE_0___default().setColors(
        colors
      )

      /**
       * @param {string} type
       * @param {string  | { file?: string, moduleName?: string, loc?: string, message?: string; stack?: string[] }} item
       * @returns {{ header: string, body: string }}
       */
      function formatProblem(type, item) {
        var header = type === 'warning' ? 'WARNING' : 'ERROR'
        var body = ''
        if (typeof item === 'string') {
          body += item
        } else {
          var file = item.file || ''
          // eslint-disable-next-line no-nested-ternary
          var moduleName = item.moduleName
            ? item.moduleName.indexOf('!') !== -1
              ? ''
                  .concat(item.moduleName.replace(/^(\s|\S)*!/, ''), ' (')
                  .concat(item.moduleName, ')')
              : ''.concat(item.moduleName)
            : ''
          var loc = item.loc
          header += ''.concat(
            moduleName || file
              ? ' in '
                  .concat(
                    moduleName
                      ? ''
                          .concat(moduleName)
                          .concat(file ? ' ('.concat(file, ')') : '')
                      : file
                  )
                  .concat(loc ? ' '.concat(loc) : '')
              : ''
          )
          body += item.message || ''
        }
        if (Array.isArray(item.stack)) {
          item.stack.forEach(function (stack) {
            if (typeof stack === 'string') {
              body += '\r\n'.concat(stack)
            }
          })
        }
        return {
          header: header,
          body: body
        }
      }

      /**
       * @typedef {Object} CreateOverlayOptions
       * @property {string | null} trustedTypesPolicyName
       * @property {boolean | (error: Error) => void} [catchRuntimeError]
       */

      /**
       *
       * @param {CreateOverlayOptions} options
       */
      var createOverlay = function createOverlay(options) {
        /** @type {HTMLIFrameElement | null | undefined} */
        var iframeContainerElement
        /** @type {HTMLDivElement | null | undefined} */
        var containerElement
        /** @type {HTMLDivElement | null | undefined} */
        var headerElement
        /** @type {Array<(element: HTMLDivElement) => void>} */
        var onLoadQueue = []
        /** @type {TrustedTypePolicy | undefined} */
        var overlayTrustedTypesPolicy

        /**
         *
         * @param {HTMLElement} element
         * @param {CSSStyleDeclaration} style
         */
        function applyStyle(element, style) {
          Object.keys(style).forEach(function (prop) {
            element.style[prop] = style[prop]
          })
        }

        /**
         * @param {string | null} trustedTypesPolicyName
         */
        function createContainer(trustedTypesPolicyName) {
          // Enable Trusted Types if they are available in the current browser.
          if (window.trustedTypes) {
            overlayTrustedTypesPolicy = window.trustedTypes.createPolicy(
              trustedTypesPolicyName || 'webpack-dev-server#overlay',
              {
                createHTML: function createHTML(value) {
                  return value
                }
              }
            )
          }
          iframeContainerElement = document.createElement('iframe')
          iframeContainerElement.id = 'webpack-dev-server-client-overlay'
          iframeContainerElement.src = 'about:blank'
          applyStyle(
            iframeContainerElement,
            _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.iframeStyle
          )
          iframeContainerElement.onload = function () {
            var contentElement =
              /** @type {Document} */
              /** @type {HTMLIFrameElement} */
              iframeContainerElement.contentDocument.createElement('div')
            containerElement =
              /** @type {Document} */
              /** @type {HTMLIFrameElement} */
              iframeContainerElement.contentDocument.createElement('div')
            contentElement.id = 'webpack-dev-server-client-overlay-div'
            applyStyle(
              contentElement,
              _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.containerStyle
            )
            headerElement = document.createElement('div')
            headerElement.innerText = 'Compiled with problems:'
            applyStyle(
              headerElement,
              _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.headerStyle
            )
            var closeButtonElement = document.createElement('button')
            applyStyle(
              closeButtonElement,
              _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.dismissButtonStyle
            )
            closeButtonElement.innerText = '×'
            closeButtonElement.ariaLabel = 'Dismiss'
            closeButtonElement.addEventListener('click', function () {
              // eslint-disable-next-line no-use-before-define
              overlayService.send({
                type: 'DISMISS'
              })
            })
            contentElement.appendChild(headerElement)
            contentElement.appendChild(closeButtonElement)
            contentElement.appendChild(containerElement)

            /** @type {Document} */
            /** @type {HTMLIFrameElement} */
            iframeContainerElement.contentDocument.body.appendChild(
              contentElement
            )
            onLoadQueue.forEach(function (onLoad) {
              onLoad(/** @type {HTMLDivElement} */ contentElement)
            })
            onLoadQueue = []

            /** @type {HTMLIFrameElement} */
            iframeContainerElement.onload = null
          }
          document.body.appendChild(iframeContainerElement)
        }

        /**
         * @param {(element: HTMLDivElement) => void} callback
         * @param {string | null} trustedTypesPolicyName
         */
        function ensureOverlayExists(callback, trustedTypesPolicyName) {
          if (containerElement) {
            containerElement.innerHTML = ''
            // Everything is ready, call the callback right away.
            callback(containerElement)
            return
          }
          onLoadQueue.push(callback)
          if (iframeContainerElement) {
            return
          }
          createContainer(trustedTypesPolicyName)
        }

        // Successful compilation.
        function hide() {
          if (!iframeContainerElement) {
            return
          }

          // Clean up and reset internal state.
          document.body.removeChild(iframeContainerElement)
          iframeContainerElement = null
          containerElement = null
        }

        // Compilation with errors (e.g. syntax error or missing modules).
        /**
         * @param {string} type
         * @param {Array<string  | { moduleIdentifier?: string, moduleName?: string, loc?: string, message?: string }>} messages
         * @param {string | null} trustedTypesPolicyName
         * @param {'build' | 'runtime'} messageSource
         */
        function show(type, messages, trustedTypesPolicyName, messageSource) {
          ensureOverlayExists(function () {
            headerElement.innerText =
              messageSource === 'runtime'
                ? 'Uncaught runtime errors:'
                : 'Compiled with problems:'
            messages.forEach(function (message) {
              var entryElement = document.createElement('div')
              var msgStyle =
                type === 'warning'
                  ? _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.msgStyles
                      .warning
                  : _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.msgStyles
                      .error
              applyStyle(
                entryElement,
                _objectSpread(
                  _objectSpread({}, msgStyle),
                  {},
                  {
                    padding: '1rem 1rem 1.5rem 1rem'
                  }
                )
              )
              var typeElement = document.createElement('div')
              var _formatProblem = formatProblem(type, message),
                header = _formatProblem.header,
                body = _formatProblem.body
              typeElement.innerText = header
              applyStyle(
                typeElement,
                _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.msgTypeStyle
              )
              if (message.moduleIdentifier) {
                applyStyle(typeElement, {
                  cursor: 'pointer'
                })
                // element.dataset not supported in IE
                typeElement.setAttribute('data-can-open', true)
                typeElement.addEventListener('click', function () {
                  fetch(
                    '/webpack-dev-server/open-editor?fileName='.concat(
                      message.moduleIdentifier
                    )
                  )
                })
              }

              // Make it look similar to our terminal.
              var text =
                ansi_html_community__WEBPACK_IMPORTED_MODULE_0___default()(
                  (0, html_entities__WEBPACK_IMPORTED_MODULE_4__.encode)(body)
                )
              var messageTextNode = document.createElement('div')
              applyStyle(
                messageTextNode,
                _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.msgTextStyle
              )
              messageTextNode.innerHTML = overlayTrustedTypesPolicy
                ? overlayTrustedTypesPolicy.createHTML(text)
                : text
              entryElement.appendChild(typeElement)
              entryElement.appendChild(messageTextNode)

              /** @type {HTMLDivElement} */
              containerElement.appendChild(entryElement)
            })
          }, trustedTypesPolicyName)
        }
        var overlayService = (0,
        _overlay_state_machine_js__WEBPACK_IMPORTED_MODULE_2__['default'])({
          showOverlay: function showOverlay(_ref) {
            var _ref$level = _ref.level,
              level = _ref$level === void 0 ? 'error' : _ref$level,
              messages = _ref.messages,
              messageSource = _ref.messageSource
            return show(
              level,
              messages,
              options.trustedTypesPolicyName,
              messageSource
            )
          },
          hideOverlay: hide
        })
        if (options.catchRuntimeError) {
          /**
           * @param {Error | undefined} error
           * @param {string} fallbackMessage
           */
          var handleError = function handleError(error, fallbackMessage) {
            var errorObject =
              error instanceof Error
                ? error
                : new Error(error || fallbackMessage)
            var shouldDisplay =
              typeof options.catchRuntimeError === 'function'
                ? options.catchRuntimeError(errorObject)
                : true
            if (shouldDisplay) {
              overlayService.send({
                type: 'RUNTIME_ERROR',
                messages: [
                  {
                    message: errorObject.message,
                    stack: (0,
                    _overlay_runtime_error_js__WEBPACK_IMPORTED_MODULE_1__.parseErrorToStacks)(
                      errorObject
                    )
                  }
                ]
              })
            }
          }
          ;(0,
          _overlay_runtime_error_js__WEBPACK_IMPORTED_MODULE_1__.listenToRuntimeError)(
            function (errorEvent) {
              // error property may be empty in older browser like IE
              var error = errorEvent.error,
                message = errorEvent.message
              if (!error && !message) {
                return
              }
              handleError(error, message)
            }
          )
          ;(0,
          _overlay_runtime_error_js__WEBPACK_IMPORTED_MODULE_1__.listenToUnhandledRejection)(
            function (promiseRejectionEvent) {
              var reason = promiseRejectionEvent.reason
              handleError(reason, 'Unknown promise rejection reason')
            }
          )
        }
        return overlayService
      }

      /***/
    },
    /* 10 */
    /***/ (module) => {
      'use strict'

      module.exports = ansiHTML

      // Reference to https://github.com/sindresorhus/ansi-regex
      var _regANSI =
        /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/

      var _defColors = {
        reset: ['fff', '000'], // [FOREGROUD_COLOR, BACKGROUND_COLOR]
        black: '000',
        red: 'ff0000',
        green: '209805',
        yellow: 'e8bf03',
        blue: '0000ff',
        magenta: 'ff00ff',
        cyan: '00ffee',
        lightgrey: 'f0f0f0',
        darkgrey: '888'
      }
      var _styles = {
        30: 'black',
        31: 'red',
        32: 'green',
        33: 'yellow',
        34: 'blue',
        35: 'magenta',
        36: 'cyan',
        37: 'lightgrey'
      }
      var _openTags = {
        1: 'font-weight:bold', // bold
        2: 'opacity:0.5', // dim
        3: '<i>', // italic
        4: '<u>', // underscore
        8: 'display:none', // hidden
        9: '<del>' // delete
      }
      var _closeTags = {
        23: '</i>', // reset italic
        24: '</u>', // reset underscore
        29: '</del>' // reset delete
      }

      ;[0, 21, 22, 27, 28, 39, 49].forEach(function (n) {
        _closeTags[n] = '</span>'
      })

      /**
       * Converts text with ANSI color codes to HTML markup.
       * @param {String} text
       * @returns {*}
       */
      function ansiHTML(text) {
        // Returns the text if the string has no ANSI escape code.
        if (!_regANSI.test(text)) {
          return text
        }

        // Cache opened sequence.
        var ansiCodes = []
        // Replace with markup.
        var ret = text.replace(/\033\[(\d+)m/g, function (match, seq) {
          var ot = _openTags[seq]
          if (ot) {
            // If current sequence has been opened, close it.
            if (!!~ansiCodes.indexOf(seq)) {
              // eslint-disable-line no-extra-boolean-cast
              ansiCodes.pop()
              return '</span>'
            }
            // Open tag.
            ansiCodes.push(seq)
            return ot[0] === '<' ? ot : '<span style="' + ot + ';">'
          }

          var ct = _closeTags[seq]
          if (ct) {
            // Pop sequence
            ansiCodes.pop()
            return ct
          }
          return ''
        })

        // Make sure tags are closed.
        var l = ansiCodes.length
        l > 0 && (ret += Array(l + 1).join('</span>'))

        return ret
      }

      /**
       * Customize colors.
       * @param {Object} colors reference to _defColors
       */
      ansiHTML.setColors = function (colors) {
        if (typeof colors !== 'object') {
          throw new Error('`colors` parameter must be an Object.')
        }

        var _finalColors = {}
        for (var key in _defColors) {
          var hex = colors.hasOwnProperty(key) ? colors[key] : null
          if (!hex) {
            _finalColors[key] = _defColors[key]
            continue
          }
          if ('reset' === key) {
            if (typeof hex === 'string') {
              hex = [hex]
            }
            if (
              !Array.isArray(hex) ||
              hex.length === 0 ||
              hex.some(function (h) {
                return typeof h !== 'string'
              })
            ) {
              throw new Error(
                'The value of `' +
                  key +
                  '` property must be an Array and each item could only be a hex string, e.g.: FF0000'
              )
            }
            var defHexColor = _defColors[key]
            if (!hex[0]) {
              hex[0] = defHexColor[0]
            }
            if (hex.length === 1 || !hex[1]) {
              hex = [hex[0]]
              hex.push(defHexColor[1])
            }

            hex = hex.slice(0, 2)
          } else if (typeof hex !== 'string') {
            throw new Error(
              'The value of `' +
                key +
                '` property must be a hex string, e.g.: FF0000'
            )
          }
          _finalColors[key] = hex
        }
        _setTags(_finalColors)
      }

      /**
       * Reset colors.
       */
      ansiHTML.reset = function () {
        _setTags(_defColors)
      }

      /**
       * Expose tags, including open and close.
       * @type {Object}
       */
      ansiHTML.tags = {}

      if (Object.defineProperty) {
        Object.defineProperty(ansiHTML.tags, 'open', {
          get: function () {
            return _openTags
          }
        })
        Object.defineProperty(ansiHTML.tags, 'close', {
          get: function () {
            return _closeTags
          }
        })
      } else {
        ansiHTML.tags.open = _openTags
        ansiHTML.tags.close = _closeTags
      }

      function _setTags(colors) {
        // reset all
        _openTags['0'] =
          'font-weight:normal;opacity:1;color:#' +
          colors.reset[0] +
          ';background:#' +
          colors.reset[1]
        // inverse
        _openTags['7'] =
          'color:#' + colors.reset[1] + ';background:#' + colors.reset[0]
        // dark grey
        _openTags['90'] = 'color:#' + colors.darkgrey

        for (var code in _styles) {
          var color = _styles[code]
          var oriColor = colors[color] || '000'
          _openTags[code] = 'color:#' + oriColor
          code = parseInt(code)
          _openTags[(code + 10).toString()] = 'background:#' + oriColor
        }
      }

      ansiHTML.reset()

      /***/
    },
    /* 11 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ listenToRuntimeError: () =>
          /* binding */ listenToRuntimeError,
        /* harmony export */ listenToUnhandledRejection: () =>
          /* binding */ listenToUnhandledRejection,
        /* harmony export */ parseErrorToStacks: () =>
          /* binding */ parseErrorToStacks
        /* harmony export */
      })
      /**
       *
       * @param {Error} error
       */
      function parseErrorToStacks(error) {
        if (!error || !(error instanceof Error)) {
          throw new Error('parseErrorToStacks expects Error object')
        }
        if (typeof error.stack === 'string') {
          return error.stack.split('\n').filter(function (stack) {
            return stack !== 'Error: '.concat(error.message)
          })
        }
      }

      /**
       * @callback ErrorCallback
       * @param {ErrorEvent} error
       * @returns {void}
       */

      /**
       * @param {ErrorCallback} callback
       */
      function listenToRuntimeError(callback) {
        window.addEventListener('error', callback)
        return function cleanup() {
          window.removeEventListener('error', callback)
        }
      }

      /**
       * @callback UnhandledRejectionCallback
       * @param {PromiseRejectionEvent} rejectionEvent
       * @returns {void}
       */

      /**
       * @param {UnhandledRejectionCallback} callback
       */
      function listenToUnhandledRejection(callback) {
        window.addEventListener('unhandledrejection', callback)
        return function cleanup() {
          window.removeEventListener('unhandledrejection', callback)
        }
      }

      /***/
    },
    /* 12 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var _fsm_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(13)

      /**
       * @typedef {Object} ShowOverlayData
       * @property {'warning' | 'error'} level
       * @property {Array<string  | { moduleIdentifier?: string, moduleName?: string, loc?: string, message?: string }>} messages
       * @property {'build' | 'runtime'} messageSource
       */

      /**
       * @typedef {Object} CreateOverlayMachineOptions
       * @property {(data: ShowOverlayData) => void} showOverlay
       * @property {() => void} hideOverlay
       */

      /**
       * @param {CreateOverlayMachineOptions} options
       */
      var createOverlayMachine = function createOverlayMachine(options) {
        var hideOverlay = options.hideOverlay,
          showOverlay = options.showOverlay
        var overlayMachine = (0,
        _fsm_js__WEBPACK_IMPORTED_MODULE_0__['default'])(
          {
            initial: 'hidden',
            context: {
              level: 'error',
              messages: [],
              messageSource: 'build'
            },
            states: {
              hidden: {
                on: {
                  BUILD_ERROR: {
                    target: 'displayBuildError',
                    actions: ['setMessages', 'showOverlay']
                  },
                  RUNTIME_ERROR: {
                    target: 'displayRuntimeError',
                    actions: ['setMessages', 'showOverlay']
                  }
                }
              },
              displayBuildError: {
                on: {
                  DISMISS: {
                    target: 'hidden',
                    actions: ['dismissMessages', 'hideOverlay']
                  },
                  BUILD_ERROR: {
                    target: 'displayBuildError',
                    actions: ['appendMessages', 'showOverlay']
                  }
                }
              },
              displayRuntimeError: {
                on: {
                  DISMISS: {
                    target: 'hidden',
                    actions: ['dismissMessages', 'hideOverlay']
                  },
                  RUNTIME_ERROR: {
                    target: 'displayRuntimeError',
                    actions: ['appendMessages', 'showOverlay']
                  },
                  BUILD_ERROR: {
                    target: 'displayBuildError',
                    actions: ['setMessages', 'showOverlay']
                  }
                }
              }
            }
          },
          {
            actions: {
              dismissMessages: function dismissMessages() {
                return {
                  messages: [],
                  level: 'error',
                  messageSource: 'build'
                }
              },
              appendMessages: function appendMessages(context, event) {
                return {
                  messages: context.messages.concat(event.messages),
                  level: event.level || context.level,
                  messageSource:
                    event.type === 'RUNTIME_ERROR' ? 'runtime' : 'build'
                }
              },
              setMessages: function setMessages(context, event) {
                return {
                  messages: event.messages,
                  level: event.level || context.level,
                  messageSource:
                    event.type === 'RUNTIME_ERROR' ? 'runtime' : 'build'
                }
              },
              hideOverlay: hideOverlay,
              showOverlay: showOverlay
            }
          }
        )
        return overlayMachine
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
        createOverlayMachine

      /***/
    },
    /* 13 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object)
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(object)
          enumerableOnly &&
            (symbols = symbols.filter(function (sym) {
              return Object.getOwnPropertyDescriptor(object, sym).enumerable
            })),
            keys.push.apply(keys, symbols)
        }
        return keys
      }
      function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = null != arguments[i] ? arguments[i] : {}
          i % 2
            ? ownKeys(Object(source), !0).forEach(function (key) {
                _defineProperty(target, key, source[key])
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(
                target,
                Object.getOwnPropertyDescriptors(source)
              )
            : ownKeys(Object(source)).forEach(function (key) {
                Object.defineProperty(
                  target,
                  key,
                  Object.getOwnPropertyDescriptor(source, key)
                )
              })
        }
        return target
      }
      function _defineProperty(obj, key, value) {
        key = _toPropertyKey(key)
        if (key in obj) {
          Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
          })
        } else {
          obj[key] = value
        }
        return obj
      }
      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, 'string')
        return typeof key === 'symbol' ? key : String(key)
      }
      function _toPrimitive(input, hint) {
        if (typeof input !== 'object' || input === null) return input
        var prim = input[Symbol.toPrimitive]
        if (prim !== undefined) {
          var res = prim.call(input, hint || 'default')
          if (typeof res !== 'object') return res
          throw new TypeError('@@toPrimitive must return a primitive value.')
        }
        return (hint === 'string' ? String : Number)(input)
      }
      /**
       * @typedef {Object} StateDefinitions
       * @property {{[event: string]: { target: string; actions?: Array<string> }}} [on]
       */

      /**
       * @typedef {Object} Options
       * @property {{[state: string]: StateDefinitions}} states
       * @property {object} context;
       * @property {string} initial
       */

      /**
       * @typedef {Object} Implementation
       * @property {{[actionName: string]: (ctx: object, event: any) => object}} actions
       */

      /**
       * A simplified `createMachine` from `@xstate/fsm` with the following differences:
       *
       *  - the returned machine is technically a "service". No `interpret(machine).start()` is needed.
       *  - the state definition only support `on` and target must be declared with { target: 'nextState', actions: [] } explicitly.
       *  - event passed to `send` must be an object with `type` property.
       *  - actions implementation will be [assign action](https://xstate.js.org/docs/guides/context.html#assign-action) if you return any value.
       *  Do not return anything if you just want to invoke side effect.
       *
       * The goal of this custom function is to avoid installing the entire `'xstate/fsm'` package, while enabling modeling using
       * state machine. You can copy the first parameter into the editor at https://stately.ai/viz to visualize the state machine.
       *
       * @param {Options} options
       * @param {Implementation} implementation
       */
      function createMachine(_ref, _ref2) {
        var states = _ref.states,
          context = _ref.context,
          initial = _ref.initial
        var actions = _ref2.actions
        var currentState = initial
        var currentContext = context
        return {
          send: function send(event) {
            var currentStateOn = states[currentState].on
            var transitionConfig = currentStateOn && currentStateOn[event.type]
            if (transitionConfig) {
              currentState = transitionConfig.target
              if (transitionConfig.actions) {
                transitionConfig.actions.forEach(function (actName) {
                  var actionImpl = actions[actName]
                  var nextContextValue =
                    actionImpl && actionImpl(currentContext, event)
                  if (nextContextValue) {
                    currentContext = _objectSpread(
                      _objectSpread({}, currentContext),
                      nextContextValue
                    )
                  }
                })
              }
            }
          }
        }
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
        createMachine

      /***/
    },
    /* 14 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ containerStyle: () => /* binding */ containerStyle,
        /* harmony export */ dismissButtonStyle: () =>
          /* binding */ dismissButtonStyle,
        /* harmony export */ headerStyle: () => /* binding */ headerStyle,
        /* harmony export */ iframeStyle: () => /* binding */ iframeStyle,
        /* harmony export */ msgStyles: () => /* binding */ msgStyles,
        /* harmony export */ msgTextStyle: () => /* binding */ msgTextStyle,
        /* harmony export */ msgTypeStyle: () => /* binding */ msgTypeStyle
        /* harmony export */
      })
      // styles are inspired by `react-error-overlay`

      var msgStyles = {
        error: {
          backgroundColor: 'rgba(206, 17, 38, 0.1)',
          color: '#fccfcf'
        },
        warning: {
          backgroundColor: 'rgba(251, 245, 180, 0.1)',
          color: '#fbf5b4'
        }
      }
      var iframeStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        'z-index': 9999999999
      }
      var containerStyle = {
        position: 'fixed',
        boxSizing: 'border-box',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        fontSize: 'large',
        padding: '2rem 2rem 4rem 2rem',
        lineHeight: '1.2',
        whiteSpace: 'pre-wrap',
        overflow: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white'
      }
      var headerStyle = {
        color: '#e83b46',
        fontSize: '2em',
        whiteSpace: 'pre-wrap',
        fontFamily: 'sans-serif',
        margin: '0 2rem 2rem 0',
        flex: '0 0 auto',
        maxHeight: '50%',
        overflow: 'auto'
      }
      var dismissButtonStyle = {
        color: '#ffffff',
        lineHeight: '1rem',
        fontSize: '1.5rem',
        padding: '1rem',
        cursor: 'pointer',
        position: 'absolute',
        right: 0,
        top: 0,
        backgroundColor: 'transparent',
        border: 'none'
      }
      var msgTypeStyle = {
        color: '#e83b46',
        fontSize: '1.2em',
        marginBottom: '1rem',
        fontFamily: 'sans-serif'
      }
      var msgTextStyle = {
        lineHeight: '1.5',
        fontSize: '1rem',
        fontFamily: 'Menlo, Consolas, monospace'
      }

      /***/
    },
    /* 15 */
    /***/ function (__unused_webpack_module, exports, __webpack_require__) {
      'use strict'

      var __assign =
        (this && this.__assign) ||
        function () {
          __assign =
            Object.assign ||
            function (t) {
              for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i]
                for (var p in s)
                  if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
              }
              return t
            }
          return __assign.apply(this, arguments)
        }
      Object.defineProperty(exports, '__esModule', { value: true })
      var named_references_1 = __webpack_require__(16)
      var numeric_unicode_map_1 = __webpack_require__(17)
      var surrogate_pairs_1 = __webpack_require__(18)
      var allNamedReferences = __assign(
        __assign({}, named_references_1.namedReferences),
        { all: named_references_1.namedReferences.html5 }
      )
      var encodeRegExps = {
        specialChars: /[<>'"&]/g,
        nonAscii:
          /[<>'"&\u0080-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
        nonAsciiPrintable:
          /[<>'"&\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
        nonAsciiPrintableOnly:
          /[\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
        extensive:
          /[\x01-\x0c\x0e-\x1f\x21-\x2c\x2e-\x2f\x3a-\x40\x5b-\x60\x7b-\x7d\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g
      }
      var defaultEncodeOptions = {
        mode: 'specialChars',
        level: 'all',
        numeric: 'decimal'
      }
      /** Encodes all the necessary (specified by `level`) characters in the text */
      function encode(text, _a) {
        var _b = _a === void 0 ? defaultEncodeOptions : _a,
          _c = _b.mode,
          mode = _c === void 0 ? 'specialChars' : _c,
          _d = _b.numeric,
          numeric = _d === void 0 ? 'decimal' : _d,
          _e = _b.level,
          level = _e === void 0 ? 'all' : _e
        if (!text) {
          return ''
        }
        var encodeRegExp = encodeRegExps[mode]
        var references = allNamedReferences[level].characters
        var isHex = numeric === 'hexadecimal'
        encodeRegExp.lastIndex = 0
        var _b = encodeRegExp.exec(text)
        var _c
        if (_b) {
          _c = ''
          var _d = 0
          do {
            if (_d !== _b.index) {
              _c += text.substring(_d, _b.index)
            }
            var _e = _b[0]
            var result_1 = references[_e]
            if (!result_1) {
              var code_1 =
                _e.length > 1
                  ? surrogate_pairs_1.getCodePoint(_e, 0)
                  : _e.charCodeAt(0)
              result_1 =
                (isHex ? '&#x' + code_1.toString(16) : '&#' + code_1) + ';'
            }
            _c += result_1
            _d = _b.index + _e.length
          } while ((_b = encodeRegExp.exec(text)))
          if (_d !== text.length) {
            _c += text.substring(_d)
          }
        } else {
          _c = text
        }
        return _c
      }
      exports.encode = encode
      var defaultDecodeOptions = {
        scope: 'body',
        level: 'all'
      }
      var strict = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);/g
      var attribute = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+)[;=]?/g
      var baseDecodeRegExps = {
        xml: {
          strict: strict,
          attribute: attribute,
          body: named_references_1.bodyRegExps.xml
        },
        html4: {
          strict: strict,
          attribute: attribute,
          body: named_references_1.bodyRegExps.html4
        },
        html5: {
          strict: strict,
          attribute: attribute,
          body: named_references_1.bodyRegExps.html5
        }
      }
      var decodeRegExps = __assign(__assign({}, baseDecodeRegExps), {
        all: baseDecodeRegExps.html5
      })
      var fromCharCode = String.fromCharCode
      var outOfBoundsChar = fromCharCode(65533)
      var defaultDecodeEntityOptions = {
        level: 'all'
      }
      /** Decodes a single entity */
      function decodeEntity(entity, _a) {
        var _b = (_a === void 0 ? defaultDecodeEntityOptions : _a).level,
          level = _b === void 0 ? 'all' : _b
        if (!entity) {
          return ''
        }
        var _b = entity
        var decodeEntityLastChar_1 = entity[entity.length - 1]
        if (false) {
        } else if (false) {
        } else {
          var decodeResultByReference_1 =
            allNamedReferences[level].entities[entity]
          if (decodeResultByReference_1) {
            _b = decodeResultByReference_1
          } else if (entity[0] === '&' && entity[1] === '#') {
            var decodeSecondChar_1 = entity[2]
            var decodeCode_1 =
              decodeSecondChar_1 == 'x' || decodeSecondChar_1 == 'X'
                ? parseInt(entity.substr(3), 16)
                : parseInt(entity.substr(2))
            _b =
              decodeCode_1 >= 0x10ffff
                ? outOfBoundsChar
                : decodeCode_1 > 65535
                ? surrogate_pairs_1.fromCodePoint(decodeCode_1)
                : fromCharCode(
                    numeric_unicode_map_1.numericUnicodeMap[decodeCode_1] ||
                      decodeCode_1
                  )
          }
        }
        return _b
      }
      exports.decodeEntity = decodeEntity
      /** Decodes all entities in the text */
      function decode(text, _a) {
        var decodeSecondChar_1 = _a === void 0 ? defaultDecodeOptions : _a,
          decodeCode_1 = decodeSecondChar_1.level,
          level = decodeCode_1 === void 0 ? 'all' : decodeCode_1,
          _b = decodeSecondChar_1.scope,
          scope = _b === void 0 ? (level === 'xml' ? 'strict' : 'body') : _b
        if (!text) {
          return ''
        }
        var decodeRegExp = decodeRegExps[level][scope]
        var references = allNamedReferences[level].entities
        var isAttribute = scope === 'attribute'
        var isStrict = scope === 'strict'
        decodeRegExp.lastIndex = 0
        var replaceMatch_1 = decodeRegExp.exec(text)
        var replaceResult_1
        if (replaceMatch_1) {
          replaceResult_1 = ''
          var replaceLastIndex_1 = 0
          do {
            if (replaceLastIndex_1 !== replaceMatch_1.index) {
              replaceResult_1 += text.substring(
                replaceLastIndex_1,
                replaceMatch_1.index
              )
            }
            var replaceInput_1 = replaceMatch_1[0]
            var decodeResult_1 = replaceInput_1
            var decodeEntityLastChar_2 =
              replaceInput_1[replaceInput_1.length - 1]
            if (isAttribute && decodeEntityLastChar_2 === '=') {
              decodeResult_1 = replaceInput_1
            } else if (isStrict && decodeEntityLastChar_2 !== ';') {
              decodeResult_1 = replaceInput_1
            } else {
              var decodeResultByReference_2 = references[replaceInput_1]
              if (decodeResultByReference_2) {
                decodeResult_1 = decodeResultByReference_2
              } else if (
                replaceInput_1[0] === '&' &&
                replaceInput_1[1] === '#'
              ) {
                var decodeSecondChar_2 = replaceInput_1[2]
                var decodeCode_2 =
                  decodeSecondChar_2 == 'x' || decodeSecondChar_2 == 'X'
                    ? parseInt(replaceInput_1.substr(3), 16)
                    : parseInt(replaceInput_1.substr(2))
                decodeResult_1 =
                  decodeCode_2 >= 0x10ffff
                    ? outOfBoundsChar
                    : decodeCode_2 > 65535
                    ? surrogate_pairs_1.fromCodePoint(decodeCode_2)
                    : fromCharCode(
                        numeric_unicode_map_1.numericUnicodeMap[decodeCode_2] ||
                          decodeCode_2
                      )
              }
            }
            replaceResult_1 += decodeResult_1
            replaceLastIndex_1 = replaceMatch_1.index + replaceInput_1.length
          } while ((replaceMatch_1 = decodeRegExp.exec(text)))
          if (replaceLastIndex_1 !== text.length) {
            replaceResult_1 += text.substring(replaceLastIndex_1)
          }
        } else {
          replaceResult_1 = text
        }
        return replaceResult_1
      }
      exports.decode = decode

      /***/
    },
    /* 16 */
    /***/ (__unused_webpack_module, exports) => {
      'use strict'
      Object.defineProperty(exports, '__esModule', { value: true })
      exports.bodyRegExps = {
        xml: /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g,
        html4:
          /&notin;|&(?:nbsp|iexcl|cent|pound|curren|yen|brvbar|sect|uml|copy|ordf|laquo|not|shy|reg|macr|deg|plusmn|sup2|sup3|acute|micro|para|middot|cedil|sup1|ordm|raquo|frac14|frac12|frac34|iquest|Agrave|Aacute|Acirc|Atilde|Auml|Aring|AElig|Ccedil|Egrave|Eacute|Ecirc|Euml|Igrave|Iacute|Icirc|Iuml|ETH|Ntilde|Ograve|Oacute|Ocirc|Otilde|Ouml|times|Oslash|Ugrave|Uacute|Ucirc|Uuml|Yacute|THORN|szlig|agrave|aacute|acirc|atilde|auml|aring|aelig|ccedil|egrave|eacute|ecirc|euml|igrave|iacute|icirc|iuml|eth|ntilde|ograve|oacute|ocirc|otilde|ouml|divide|oslash|ugrave|uacute|ucirc|uuml|yacute|thorn|yuml|quot|amp|lt|gt|#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g,
        html5:
          /&centerdot;|&copysr;|&divideontimes;|&gtcc;|&gtcir;|&gtdot;|&gtlPar;|&gtquest;|&gtrapprox;|&gtrarr;|&gtrdot;|&gtreqless;|&gtreqqless;|&gtrless;|&gtrsim;|&ltcc;|&ltcir;|&ltdot;|&lthree;|&ltimes;|&ltlarr;|&ltquest;|&ltrPar;|&ltri;|&ltrie;|&ltrif;|&notin;|&notinE;|&notindot;|&notinva;|&notinvb;|&notinvc;|&notni;|&notniva;|&notnivb;|&notnivc;|&parallel;|&timesb;|&timesbar;|&timesd;|&(?:AElig|AMP|Aacute|Acirc|Agrave|Aring|Atilde|Auml|COPY|Ccedil|ETH|Eacute|Ecirc|Egrave|Euml|GT|Iacute|Icirc|Igrave|Iuml|LT|Ntilde|Oacute|Ocirc|Ograve|Oslash|Otilde|Ouml|QUOT|REG|THORN|Uacute|Ucirc|Ugrave|Uuml|Yacute|aacute|acirc|acute|aelig|agrave|amp|aring|atilde|auml|brvbar|ccedil|cedil|cent|copy|curren|deg|divide|eacute|ecirc|egrave|eth|euml|frac12|frac14|frac34|gt|iacute|icirc|iexcl|igrave|iquest|iuml|laquo|lt|macr|micro|middot|nbsp|not|ntilde|oacute|ocirc|ograve|ordf|ordm|oslash|otilde|ouml|para|plusmn|pound|quot|raquo|reg|sect|shy|sup1|sup2|sup3|szlig|thorn|times|uacute|ucirc|ugrave|uml|uuml|yacute|yen|yuml|#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g
      }
      exports.namedReferences = {
        xml: {
          entities: {
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&apos;': "'",
            '&amp;': '&'
          },
          characters: {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;',
            '&': '&amp;'
          }
        },
        html4: {
          entities: {
            '&apos;': "'",
            '&nbsp': ' ',
            '&nbsp;': ' ',
            '&iexcl': '¡',
            '&iexcl;': '¡',
            '&cent': '¢',
            '&cent;': '¢',
            '&pound': '£',
            '&pound;': '£',
            '&curren': '¤',
            '&curren;': '¤',
            '&yen': '¥',
            '&yen;': '¥',
            '&brvbar': '¦',
            '&brvbar;': '¦',
            '&sect': '§',
            '&sect;': '§',
            '&uml': '¨',
            '&uml;': '¨',
            '&copy': '©',
            '&copy;': '©',
            '&ordf': 'ª',
            '&ordf;': 'ª',
            '&laquo': '«',
            '&laquo;': '«',
            '&not': '¬',
            '&not;': '¬',
            '&shy': '­',
            '&shy;': '­',
            '&reg': '®',
            '&reg;': '®',
            '&macr': '¯',
            '&macr;': '¯',
            '&deg': '°',
            '&deg;': '°',
            '&plusmn': '±',
            '&plusmn;': '±',
            '&sup2': '²',
            '&sup2;': '²',
            '&sup3': '³',
            '&sup3;': '³',
            '&acute': '´',
            '&acute;': '´',
            '&micro': 'µ',
            '&micro;': 'µ',
            '&para': '¶',
            '&para;': '¶',
            '&middot': '·',
            '&middot;': '·',
            '&cedil': '¸',
            '&cedil;': '¸',
            '&sup1': '¹',
            '&sup1;': '¹',
            '&ordm': 'º',
            '&ordm;': 'º',
            '&raquo': '»',
            '&raquo;': '»',
            '&frac14': '¼',
            '&frac14;': '¼',
            '&frac12': '½',
            '&frac12;': '½',
            '&frac34': '¾',
            '&frac34;': '¾',
            '&iquest': '¿',
            '&iquest;': '¿',
            '&Agrave': 'À',
            '&Agrave;': 'À',
            '&Aacute': 'Á',
            '&Aacute;': 'Á',
            '&Acirc': 'Â',
            '&Acirc;': 'Â',
            '&Atilde': 'Ã',
            '&Atilde;': 'Ã',
            '&Auml': 'Ä',
            '&Auml;': 'Ä',
            '&Aring': 'Å',
            '&Aring;': 'Å',
            '&AElig': 'Æ',
            '&AElig;': 'Æ',
            '&Ccedil': 'Ç',
            '&Ccedil;': 'Ç',
            '&Egrave': 'È',
            '&Egrave;': 'È',
            '&Eacute': 'É',
            '&Eacute;': 'É',
            '&Ecirc': 'Ê',
            '&Ecirc;': 'Ê',
            '&Euml': 'Ë',
            '&Euml;': 'Ë',
            '&Igrave': 'Ì',
            '&Igrave;': 'Ì',
            '&Iacute': 'Í',
            '&Iacute;': 'Í',
            '&Icirc': 'Î',
            '&Icirc;': 'Î',
            '&Iuml': 'Ï',
            '&Iuml;': 'Ï',
            '&ETH': 'Ð',
            '&ETH;': 'Ð',
            '&Ntilde': 'Ñ',
            '&Ntilde;': 'Ñ',
            '&Ograve': 'Ò',
            '&Ograve;': 'Ò',
            '&Oacute': 'Ó',
            '&Oacute;': 'Ó',
            '&Ocirc': 'Ô',
            '&Ocirc;': 'Ô',
            '&Otilde': 'Õ',
            '&Otilde;': 'Õ',
            '&Ouml': 'Ö',
            '&Ouml;': 'Ö',
            '&times': '×',
            '&times;': '×',
            '&Oslash': 'Ø',
            '&Oslash;': 'Ø',
            '&Ugrave': 'Ù',
            '&Ugrave;': 'Ù',
            '&Uacute': 'Ú',
            '&Uacute;': 'Ú',
            '&Ucirc': 'Û',
            '&Ucirc;': 'Û',
            '&Uuml': 'Ü',
            '&Uuml;': 'Ü',
            '&Yacute': 'Ý',
            '&Yacute;': 'Ý',
            '&THORN': 'Þ',
            '&THORN;': 'Þ',
            '&szlig': 'ß',
            '&szlig;': 'ß',
            '&agrave': 'à',
            '&agrave;': 'à',
            '&aacute': 'á',
            '&aacute;': 'á',
            '&acirc': 'â',
            '&acirc;': 'â',
            '&atilde': 'ã',
            '&atilde;': 'ã',
            '&auml': 'ä',
            '&auml;': 'ä',
            '&aring': 'å',
            '&aring;': 'å',
            '&aelig': 'æ',
            '&aelig;': 'æ',
            '&ccedil': 'ç',
            '&ccedil;': 'ç',
            '&egrave': 'è',
            '&egrave;': 'è',
            '&eacute': 'é',
            '&eacute;': 'é',
            '&ecirc': 'ê',
            '&ecirc;': 'ê',
            '&euml': 'ë',
            '&euml;': 'ë',
            '&igrave': 'ì',
            '&igrave;': 'ì',
            '&iacute': 'í',
            '&iacute;': 'í',
            '&icirc': 'î',
            '&icirc;': 'î',
            '&iuml': 'ï',
            '&iuml;': 'ï',
            '&eth': 'ð',
            '&eth;': 'ð',
            '&ntilde': 'ñ',
            '&ntilde;': 'ñ',
            '&ograve': 'ò',
            '&ograve;': 'ò',
            '&oacute': 'ó',
            '&oacute;': 'ó',
            '&ocirc': 'ô',
            '&ocirc;': 'ô',
            '&otilde': 'õ',
            '&otilde;': 'õ',
            '&ouml': 'ö',
            '&ouml;': 'ö',
            '&divide': '÷',
            '&divide;': '÷',
            '&oslash': 'ø',
            '&oslash;': 'ø',
            '&ugrave': 'ù',
            '&ugrave;': 'ù',
            '&uacute': 'ú',
            '&uacute;': 'ú',
            '&ucirc': 'û',
            '&ucirc;': 'û',
            '&uuml': 'ü',
            '&uuml;': 'ü',
            '&yacute': 'ý',
            '&yacute;': 'ý',
            '&thorn': 'þ',
            '&thorn;': 'þ',
            '&yuml': 'ÿ',
            '&yuml;': 'ÿ',
            '&quot': '"',
            '&quot;': '"',
            '&amp': '&',
            '&amp;': '&',
            '&lt': '<',
            '&lt;': '<',
            '&gt': '>',
            '&gt;': '>',
            '&OElig;': 'Œ',
            '&oelig;': 'œ',
            '&Scaron;': 'Š',
            '&scaron;': 'š',
            '&Yuml;': 'Ÿ',
            '&circ;': 'ˆ',
            '&tilde;': '˜',
            '&ensp;': ' ',
            '&emsp;': ' ',
            '&thinsp;': ' ',
            '&zwnj;': '‌',
            '&zwj;': '‍',
            '&lrm;': '‎',
            '&rlm;': '‏',
            '&ndash;': '–',
            '&mdash;': '—',
            '&lsquo;': '‘',
            '&rsquo;': '’',
            '&sbquo;': '‚',
            '&ldquo;': '“',
            '&rdquo;': '”',
            '&bdquo;': '„',
            '&dagger;': '†',
            '&Dagger;': '‡',
            '&permil;': '‰',
            '&lsaquo;': '‹',
            '&rsaquo;': '›',
            '&euro;': '€',
            '&fnof;': 'ƒ',
            '&Alpha;': 'Α',
            '&Beta;': 'Β',
            '&Gamma;': 'Γ',
            '&Delta;': 'Δ',
            '&Epsilon;': 'Ε',
            '&Zeta;': 'Ζ',
            '&Eta;': 'Η',
            '&Theta;': 'Θ',
            '&Iota;': 'Ι',
            '&Kappa;': 'Κ',
            '&Lambda;': 'Λ',
            '&Mu;': 'Μ',
            '&Nu;': 'Ν',
            '&Xi;': 'Ξ',
            '&Omicron;': 'Ο',
            '&Pi;': 'Π',
            '&Rho;': 'Ρ',
            '&Sigma;': 'Σ',
            '&Tau;': 'Τ',
            '&Upsilon;': 'Υ',
            '&Phi;': 'Φ',
            '&Chi;': 'Χ',
            '&Psi;': 'Ψ',
            '&Omega;': 'Ω',
            '&alpha;': 'α',
            '&beta;': 'β',
            '&gamma;': 'γ',
            '&delta;': 'δ',
            '&epsilon;': 'ε',
            '&zeta;': 'ζ',
            '&eta;': 'η',
            '&theta;': 'θ',
            '&iota;': 'ι',
            '&kappa;': 'κ',
            '&lambda;': 'λ',
            '&mu;': 'μ',
            '&nu;': 'ν',
            '&xi;': 'ξ',
            '&omicron;': 'ο',
            '&pi;': 'π',
            '&rho;': 'ρ',
            '&sigmaf;': 'ς',
            '&sigma;': 'σ',
            '&tau;': 'τ',
            '&upsilon;': 'υ',
            '&phi;': 'φ',
            '&chi;': 'χ',
            '&psi;': 'ψ',
            '&omega;': 'ω',
            '&thetasym;': 'ϑ',
            '&upsih;': 'ϒ',
            '&piv;': 'ϖ',
            '&bull;': '•',
            '&hellip;': '…',
            '&prime;': '′',
            '&Prime;': '″',
            '&oline;': '‾',
            '&frasl;': '⁄',
            '&weierp;': '℘',
            '&image;': 'ℑ',
            '&real;': 'ℜ',
            '&trade;': '™',
            '&alefsym;': 'ℵ',
            '&larr;': '←',
            '&uarr;': '↑',
            '&rarr;': '→',
            '&darr;': '↓',
            '&harr;': '↔',
            '&crarr;': '↵',
            '&lArr;': '⇐',
            '&uArr;': '⇑',
            '&rArr;': '⇒',
            '&dArr;': '⇓',
            '&hArr;': '⇔',
            '&forall;': '∀',
            '&part;': '∂',
            '&exist;': '∃',
            '&empty;': '∅',
            '&nabla;': '∇',
            '&isin;': '∈',
            '&notin;': '∉',
            '&ni;': '∋',
            '&prod;': '∏',
            '&sum;': '∑',
            '&minus;': '−',
            '&lowast;': '∗',
            '&radic;': '√',
            '&prop;': '∝',
            '&infin;': '∞',
            '&ang;': '∠',
            '&and;': '∧',
            '&or;': '∨',
            '&cap;': '∩',
            '&cup;': '∪',
            '&int;': '∫',
            '&there4;': '∴',
            '&sim;': '∼',
            '&cong;': '≅',
            '&asymp;': '≈',
            '&ne;': '≠',
            '&equiv;': '≡',
            '&le;': '≤',
            '&ge;': '≥',
            '&sub;': '⊂',
            '&sup;': '⊃',
            '&nsub;': '⊄',
            '&sube;': '⊆',
            '&supe;': '⊇',
            '&oplus;': '⊕',
            '&otimes;': '⊗',
            '&perp;': '⊥',
            '&sdot;': '⋅',
            '&lceil;': '⌈',
            '&rceil;': '⌉',
            '&lfloor;': '⌊',
            '&rfloor;': '⌋',
            '&lang;': '〈',
            '&rang;': '〉',
            '&loz;': '◊',
            '&spades;': '♠',
            '&clubs;': '♣',
            '&hearts;': '♥',
            '&diams;': '♦'
          },
          characters: {
            "'": '&apos;',
            ' ': '&nbsp;',
            '¡': '&iexcl;',
            '¢': '&cent;',
            '£': '&pound;',
            '¤': '&curren;',
            '¥': '&yen;',
            '¦': '&brvbar;',
            '§': '&sect;',
            '¨': '&uml;',
            '©': '&copy;',
            ª: '&ordf;',
            '«': '&laquo;',
            '¬': '&not;',
            '­': '&shy;',
            '®': '&reg;',
            '¯': '&macr;',
            '°': '&deg;',
            '±': '&plusmn;',
            '²': '&sup2;',
            '³': '&sup3;',
            '´': '&acute;',
            µ: '&micro;',
            '¶': '&para;',
            '·': '&middot;',
            '¸': '&cedil;',
            '¹': '&sup1;',
            º: '&ordm;',
            '»': '&raquo;',
            '¼': '&frac14;',
            '½': '&frac12;',
            '¾': '&frac34;',
            '¿': '&iquest;',
            À: '&Agrave;',
            Á: '&Aacute;',
            Â: '&Acirc;',
            Ã: '&Atilde;',
            Ä: '&Auml;',
            Å: '&Aring;',
            Æ: '&AElig;',
            Ç: '&Ccedil;',
            È: '&Egrave;',
            É: '&Eacute;',
            Ê: '&Ecirc;',
            Ë: '&Euml;',
            Ì: '&Igrave;',
            Í: '&Iacute;',
            Î: '&Icirc;',
            Ï: '&Iuml;',
            Ð: '&ETH;',
            Ñ: '&Ntilde;',
            Ò: '&Ograve;',
            Ó: '&Oacute;',
            Ô: '&Ocirc;',
            Õ: '&Otilde;',
            Ö: '&Ouml;',
            '×': '&times;',
            Ø: '&Oslash;',
            Ù: '&Ugrave;',
            Ú: '&Uacute;',
            Û: '&Ucirc;',
            Ü: '&Uuml;',
            Ý: '&Yacute;',
            Þ: '&THORN;',
            ß: '&szlig;',
            à: '&agrave;',
            á: '&aacute;',
            â: '&acirc;',
            ã: '&atilde;',
            ä: '&auml;',
            å: '&aring;',
            æ: '&aelig;',
            ç: '&ccedil;',
            è: '&egrave;',
            é: '&eacute;',
            ê: '&ecirc;',
            ë: '&euml;',
            ì: '&igrave;',
            í: '&iacute;',
            î: '&icirc;',
            ï: '&iuml;',
            ð: '&eth;',
            ñ: '&ntilde;',
            ò: '&ograve;',
            ó: '&oacute;',
            ô: '&ocirc;',
            õ: '&otilde;',
            ö: '&ouml;',
            '÷': '&divide;',
            ø: '&oslash;',
            ù: '&ugrave;',
            ú: '&uacute;',
            û: '&ucirc;',
            ü: '&uuml;',
            ý: '&yacute;',
            þ: '&thorn;',
            ÿ: '&yuml;',
            '"': '&quot;',
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            Œ: '&OElig;',
            œ: '&oelig;',
            Š: '&Scaron;',
            š: '&scaron;',
            Ÿ: '&Yuml;',
            ˆ: '&circ;',
            '˜': '&tilde;',
            ' ': '&ensp;',
            ' ': '&emsp;',
            ' ': '&thinsp;',
            '‌': '&zwnj;',
            '‍': '&zwj;',
            '‎': '&lrm;',
            '‏': '&rlm;',
            '–': '&ndash;',
            '—': '&mdash;',
            '‘': '&lsquo;',
            '’': '&rsquo;',
            '‚': '&sbquo;',
            '“': '&ldquo;',
            '”': '&rdquo;',
            '„': '&bdquo;',
            '†': '&dagger;',
            '‡': '&Dagger;',
            '‰': '&permil;',
            '‹': '&lsaquo;',
            '›': '&rsaquo;',
            '€': '&euro;',
            ƒ: '&fnof;',
            Α: '&Alpha;',
            Β: '&Beta;',
            Γ: '&Gamma;',
            Δ: '&Delta;',
            Ε: '&Epsilon;',
            Ζ: '&Zeta;',
            Η: '&Eta;',
            Θ: '&Theta;',
            Ι: '&Iota;',
            Κ: '&Kappa;',
            Λ: '&Lambda;',
            Μ: '&Mu;',
            Ν: '&Nu;',
            Ξ: '&Xi;',
            Ο: '&Omicron;',
            Π: '&Pi;',
            Ρ: '&Rho;',
            Σ: '&Sigma;',
            Τ: '&Tau;',
            Υ: '&Upsilon;',
            Φ: '&Phi;',
            Χ: '&Chi;',
            Ψ: '&Psi;',
            Ω: '&Omega;',
            α: '&alpha;',
            β: '&beta;',
            γ: '&gamma;',
            δ: '&delta;',
            ε: '&epsilon;',
            ζ: '&zeta;',
            η: '&eta;',
            θ: '&theta;',
            ι: '&iota;',
            κ: '&kappa;',
            λ: '&lambda;',
            μ: '&mu;',
            ν: '&nu;',
            ξ: '&xi;',
            ο: '&omicron;',
            π: '&pi;',
            ρ: '&rho;',
            ς: '&sigmaf;',
            σ: '&sigma;',
            τ: '&tau;',
            υ: '&upsilon;',
            φ: '&phi;',
            χ: '&chi;',
            ψ: '&psi;',
            ω: '&omega;',
            ϑ: '&thetasym;',
            ϒ: '&upsih;',
            ϖ: '&piv;',
            '•': '&bull;',
            '…': '&hellip;',
            '′': '&prime;',
            '″': '&Prime;',
            '‾': '&oline;',
            '⁄': '&frasl;',
            '℘': '&weierp;',
            ℑ: '&image;',
            ℜ: '&real;',
            '™': '&trade;',
            ℵ: '&alefsym;',
            '←': '&larr;',
            '↑': '&uarr;',
            '→': '&rarr;',
            '↓': '&darr;',
            '↔': '&harr;',
            '↵': '&crarr;',
            '⇐': '&lArr;',
            '⇑': '&uArr;',
            '⇒': '&rArr;',
            '⇓': '&dArr;',
            '⇔': '&hArr;',
            '∀': '&forall;',
            '∂': '&part;',
            '∃': '&exist;',
            '∅': '&empty;',
            '∇': '&nabla;',
            '∈': '&isin;',
            '∉': '&notin;',
            '∋': '&ni;',
            '∏': '&prod;',
            '∑': '&sum;',
            '−': '&minus;',
            '∗': '&lowast;',
            '√': '&radic;',
            '∝': '&prop;',
            '∞': '&infin;',
            '∠': '&ang;',
            '∧': '&and;',
            '∨': '&or;',
            '∩': '&cap;',
            '∪': '&cup;',
            '∫': '&int;',
            '∴': '&there4;',
            '∼': '&sim;',
            '≅': '&cong;',
            '≈': '&asymp;',
            '≠': '&ne;',
            '≡': '&equiv;',
            '≤': '&le;',
            '≥': '&ge;',
            '⊂': '&sub;',
            '⊃': '&sup;',
            '⊄': '&nsub;',
            '⊆': '&sube;',
            '⊇': '&supe;',
            '⊕': '&oplus;',
            '⊗': '&otimes;',
            '⊥': '&perp;',
            '⋅': '&sdot;',
            '⌈': '&lceil;',
            '⌉': '&rceil;',
            '⌊': '&lfloor;',
            '⌋': '&rfloor;',
            '〈': '&lang;',
            '〉': '&rang;',
            '◊': '&loz;',
            '♠': '&spades;',
            '♣': '&clubs;',
            '♥': '&hearts;',
            '♦': '&diams;'
          }
        },
        html5: {
          entities: {
            '&AElig': 'Æ',
            '&AElig;': 'Æ',
            '&AMP': '&',
            '&AMP;': '&',
            '&Aacute': 'Á',
            '&Aacute;': 'Á',
            '&Abreve;': 'Ă',
            '&Acirc': 'Â',
            '&Acirc;': 'Â',
            '&Acy;': 'А',
            '&Afr;': '𝔄',
            '&Agrave': 'À',
            '&Agrave;': 'À',
            '&Alpha;': 'Α',
            '&Amacr;': 'Ā',
            '&And;': '⩓',
            '&Aogon;': 'Ą',
            '&Aopf;': '𝔸',
            '&ApplyFunction;': '⁡',
            '&Aring': 'Å',
            '&Aring;': 'Å',
            '&Ascr;': '𝒜',
            '&Assign;': '≔',
            '&Atilde': 'Ã',
            '&Atilde;': 'Ã',
            '&Auml': 'Ä',
            '&Auml;': 'Ä',
            '&Backslash;': '∖',
            '&Barv;': '⫧',
            '&Barwed;': '⌆',
            '&Bcy;': 'Б',
            '&Because;': '∵',
            '&Bernoullis;': 'ℬ',
            '&Beta;': 'Β',
            '&Bfr;': '𝔅',
            '&Bopf;': '𝔹',
            '&Breve;': '˘',
            '&Bscr;': 'ℬ',
            '&Bumpeq;': '≎',
            '&CHcy;': 'Ч',
            '&COPY': '©',
            '&COPY;': '©',
            '&Cacute;': 'Ć',
            '&Cap;': '⋒',
            '&CapitalDifferentialD;': 'ⅅ',
            '&Cayleys;': 'ℭ',
            '&Ccaron;': 'Č',
            '&Ccedil': 'Ç',
            '&Ccedil;': 'Ç',
            '&Ccirc;': 'Ĉ',
            '&Cconint;': '∰',
            '&Cdot;': 'Ċ',
            '&Cedilla;': '¸',
            '&CenterDot;': '·',
            '&Cfr;': 'ℭ',
            '&Chi;': 'Χ',
            '&CircleDot;': '⊙',
            '&CircleMinus;': '⊖',
            '&CirclePlus;': '⊕',
            '&CircleTimes;': '⊗',
            '&ClockwiseContourIntegral;': '∲',
            '&CloseCurlyDoubleQuote;': '”',
            '&CloseCurlyQuote;': '’',
            '&Colon;': '∷',
            '&Colone;': '⩴',
            '&Congruent;': '≡',
            '&Conint;': '∯',
            '&ContourIntegral;': '∮',
            '&Copf;': 'ℂ',
            '&Coproduct;': '∐',
            '&CounterClockwiseContourIntegral;': '∳',
            '&Cross;': '⨯',
            '&Cscr;': '𝒞',
            '&Cup;': '⋓',
            '&CupCap;': '≍',
            '&DD;': 'ⅅ',
            '&DDotrahd;': '⤑',
            '&DJcy;': 'Ђ',
            '&DScy;': 'Ѕ',
            '&DZcy;': 'Џ',
            '&Dagger;': '‡',
            '&Darr;': '↡',
            '&Dashv;': '⫤',
            '&Dcaron;': 'Ď',
            '&Dcy;': 'Д',
            '&Del;': '∇',
            '&Delta;': 'Δ',
            '&Dfr;': '𝔇',
            '&DiacriticalAcute;': '´',
            '&DiacriticalDot;': '˙',
            '&DiacriticalDoubleAcute;': '˝',
            '&DiacriticalGrave;': '`',
            '&DiacriticalTilde;': '˜',
            '&Diamond;': '⋄',
            '&DifferentialD;': 'ⅆ',
            '&Dopf;': '𝔻',
            '&Dot;': '¨',
            '&DotDot;': '⃜',
            '&DotEqual;': '≐',
            '&DoubleContourIntegral;': '∯',
            '&DoubleDot;': '¨',
            '&DoubleDownArrow;': '⇓',
            '&DoubleLeftArrow;': '⇐',
            '&DoubleLeftRightArrow;': '⇔',
            '&DoubleLeftTee;': '⫤',
            '&DoubleLongLeftArrow;': '⟸',
            '&DoubleLongLeftRightArrow;': '⟺',
            '&DoubleLongRightArrow;': '⟹',
            '&DoubleRightArrow;': '⇒',
            '&DoubleRightTee;': '⊨',
            '&DoubleUpArrow;': '⇑',
            '&DoubleUpDownArrow;': '⇕',
            '&DoubleVerticalBar;': '∥',
            '&DownArrow;': '↓',
            '&DownArrowBar;': '⤓',
            '&DownArrowUpArrow;': '⇵',
            '&DownBreve;': '̑',
            '&DownLeftRightVector;': '⥐',
            '&DownLeftTeeVector;': '⥞',
            '&DownLeftVector;': '↽',
            '&DownLeftVectorBar;': '⥖',
            '&DownRightTeeVector;': '⥟',
            '&DownRightVector;': '⇁',
            '&DownRightVectorBar;': '⥗',
            '&DownTee;': '⊤',
            '&DownTeeArrow;': '↧',
            '&Downarrow;': '⇓',
            '&Dscr;': '𝒟',
            '&Dstrok;': 'Đ',
            '&ENG;': 'Ŋ',
            '&ETH': 'Ð',
            '&ETH;': 'Ð',
            '&Eacute': 'É',
            '&Eacute;': 'É',
            '&Ecaron;': 'Ě',
            '&Ecirc': 'Ê',
            '&Ecirc;': 'Ê',
            '&Ecy;': 'Э',
            '&Edot;': 'Ė',
            '&Efr;': '𝔈',
            '&Egrave': 'È',
            '&Egrave;': 'È',
            '&Element;': '∈',
            '&Emacr;': 'Ē',
            '&EmptySmallSquare;': '◻',
            '&EmptyVerySmallSquare;': '▫',
            '&Eogon;': 'Ę',
            '&Eopf;': '𝔼',
            '&Epsilon;': 'Ε',
            '&Equal;': '⩵',
            '&EqualTilde;': '≂',
            '&Equilibrium;': '⇌',
            '&Escr;': 'ℰ',
            '&Esim;': '⩳',
            '&Eta;': 'Η',
            '&Euml': 'Ë',
            '&Euml;': 'Ë',
            '&Exists;': '∃',
            '&ExponentialE;': 'ⅇ',
            '&Fcy;': 'Ф',
            '&Ffr;': '𝔉',
            '&FilledSmallSquare;': '◼',
            '&FilledVerySmallSquare;': '▪',
            '&Fopf;': '𝔽',
            '&ForAll;': '∀',
            '&Fouriertrf;': 'ℱ',
            '&Fscr;': 'ℱ',
            '&GJcy;': 'Ѓ',
            '&GT': '>',
            '&GT;': '>',
            '&Gamma;': 'Γ',
            '&Gammad;': 'Ϝ',
            '&Gbreve;': 'Ğ',
            '&Gcedil;': 'Ģ',
            '&Gcirc;': 'Ĝ',
            '&Gcy;': 'Г',
            '&Gdot;': 'Ġ',
            '&Gfr;': '𝔊',
            '&Gg;': '⋙',
            '&Gopf;': '𝔾',
            '&GreaterEqual;': '≥',
            '&GreaterEqualLess;': '⋛',
            '&GreaterFullEqual;': '≧',
            '&GreaterGreater;': '⪢',
            '&GreaterLess;': '≷',
            '&GreaterSlantEqual;': '⩾',
            '&GreaterTilde;': '≳',
            '&Gscr;': '𝒢',
            '&Gt;': '≫',
            '&HARDcy;': 'Ъ',
            '&Hacek;': 'ˇ',
            '&Hat;': '^',
            '&Hcirc;': 'Ĥ',
            '&Hfr;': 'ℌ',
            '&HilbertSpace;': 'ℋ',
            '&Hopf;': 'ℍ',
            '&HorizontalLine;': '─',
            '&Hscr;': 'ℋ',
            '&Hstrok;': 'Ħ',
            '&HumpDownHump;': '≎',
            '&HumpEqual;': '≏',
            '&IEcy;': 'Е',
            '&IJlig;': 'Ĳ',
            '&IOcy;': 'Ё',
            '&Iacute': 'Í',
            '&Iacute;': 'Í',
            '&Icirc': 'Î',
            '&Icirc;': 'Î',
            '&Icy;': 'И',
            '&Idot;': 'İ',
            '&Ifr;': 'ℑ',
            '&Igrave': 'Ì',
            '&Igrave;': 'Ì',
            '&Im;': 'ℑ',
            '&Imacr;': 'Ī',
            '&ImaginaryI;': 'ⅈ',
            '&Implies;': '⇒',
            '&Int;': '∬',
            '&Integral;': '∫',
            '&Intersection;': '⋂',
            '&InvisibleComma;': '⁣',
            '&InvisibleTimes;': '⁢',
            '&Iogon;': 'Į',
            '&Iopf;': '𝕀',
            '&Iota;': 'Ι',
            '&Iscr;': 'ℐ',
            '&Itilde;': 'Ĩ',
            '&Iukcy;': 'І',
            '&Iuml': 'Ï',
            '&Iuml;': 'Ï',
            '&Jcirc;': 'Ĵ',
            '&Jcy;': 'Й',
            '&Jfr;': '𝔍',
            '&Jopf;': '𝕁',
            '&Jscr;': '𝒥',
            '&Jsercy;': 'Ј',
            '&Jukcy;': 'Є',
            '&KHcy;': 'Х',
            '&KJcy;': 'Ќ',
            '&Kappa;': 'Κ',
            '&Kcedil;': 'Ķ',
            '&Kcy;': 'К',
            '&Kfr;': '𝔎',
            '&Kopf;': '𝕂',
            '&Kscr;': '𝒦',
            '&LJcy;': 'Љ',
            '&LT': '<',
            '&LT;': '<',
            '&Lacute;': 'Ĺ',
            '&Lambda;': 'Λ',
            '&Lang;': '⟪',
            '&Laplacetrf;': 'ℒ',
            '&Larr;': '↞',
            '&Lcaron;': 'Ľ',
            '&Lcedil;': 'Ļ',
            '&Lcy;': 'Л',
            '&LeftAngleBracket;': '⟨',
            '&LeftArrow;': '←',
            '&LeftArrowBar;': '⇤',
            '&LeftArrowRightArrow;': '⇆',
            '&LeftCeiling;': '⌈',
            '&LeftDoubleBracket;': '⟦',
            '&LeftDownTeeVector;': '⥡',
            '&LeftDownVector;': '⇃',
            '&LeftDownVectorBar;': '⥙',
            '&LeftFloor;': '⌊',
            '&LeftRightArrow;': '↔',
            '&LeftRightVector;': '⥎',
            '&LeftTee;': '⊣',
            '&LeftTeeArrow;': '↤',
            '&LeftTeeVector;': '⥚',
            '&LeftTriangle;': '⊲',
            '&LeftTriangleBar;': '⧏',
            '&LeftTriangleEqual;': '⊴',
            '&LeftUpDownVector;': '⥑',
            '&LeftUpTeeVector;': '⥠',
            '&LeftUpVector;': '↿',
            '&LeftUpVectorBar;': '⥘',
            '&LeftVector;': '↼',
            '&LeftVectorBar;': '⥒',
            '&Leftarrow;': '⇐',
            '&Leftrightarrow;': '⇔',
            '&LessEqualGreater;': '⋚',
            '&LessFullEqual;': '≦',
            '&LessGreater;': '≶',
            '&LessLess;': '⪡',
            '&LessSlantEqual;': '⩽',
            '&LessTilde;': '≲',
            '&Lfr;': '𝔏',
            '&Ll;': '⋘',
            '&Lleftarrow;': '⇚',
            '&Lmidot;': 'Ŀ',
            '&LongLeftArrow;': '⟵',
            '&LongLeftRightArrow;': '⟷',
            '&LongRightArrow;': '⟶',
            '&Longleftarrow;': '⟸',
            '&Longleftrightarrow;': '⟺',
            '&Longrightarrow;': '⟹',
            '&Lopf;': '𝕃',
            '&LowerLeftArrow;': '↙',
            '&LowerRightArrow;': '↘',
            '&Lscr;': 'ℒ',
            '&Lsh;': '↰',
            '&Lstrok;': 'Ł',
            '&Lt;': '≪',
            '&Map;': '⤅',
            '&Mcy;': 'М',
            '&MediumSpace;': ' ',
            '&Mellintrf;': 'ℳ',
            '&Mfr;': '𝔐',
            '&MinusPlus;': '∓',
            '&Mopf;': '𝕄',
            '&Mscr;': 'ℳ',
            '&Mu;': 'Μ',
            '&NJcy;': 'Њ',
            '&Nacute;': 'Ń',
            '&Ncaron;': 'Ň',
            '&Ncedil;': 'Ņ',
            '&Ncy;': 'Н',
            '&NegativeMediumSpace;': '​',
            '&NegativeThickSpace;': '​',
            '&NegativeThinSpace;': '​',
            '&NegativeVeryThinSpace;': '​',
            '&NestedGreaterGreater;': '≫',
            '&NestedLessLess;': '≪',
            '&NewLine;': '\n',
            '&Nfr;': '𝔑',
            '&NoBreak;': '⁠',
            '&NonBreakingSpace;': ' ',
            '&Nopf;': 'ℕ',
            '&Not;': '⫬',
            '&NotCongruent;': '≢',
            '&NotCupCap;': '≭',
            '&NotDoubleVerticalBar;': '∦',
            '&NotElement;': '∉',
            '&NotEqual;': '≠',
            '&NotEqualTilde;': '≂̸',
            '&NotExists;': '∄',
            '&NotGreater;': '≯',
            '&NotGreaterEqual;': '≱',
            '&NotGreaterFullEqual;': '≧̸',
            '&NotGreaterGreater;': '≫̸',
            '&NotGreaterLess;': '≹',
            '&NotGreaterSlantEqual;': '⩾̸',
            '&NotGreaterTilde;': '≵',
            '&NotHumpDownHump;': '≎̸',
            '&NotHumpEqual;': '≏̸',
            '&NotLeftTriangle;': '⋪',
            '&NotLeftTriangleBar;': '⧏̸',
            '&NotLeftTriangleEqual;': '⋬',
            '&NotLess;': '≮',
            '&NotLessEqual;': '≰',
            '&NotLessGreater;': '≸',
            '&NotLessLess;': '≪̸',
            '&NotLessSlantEqual;': '⩽̸',
            '&NotLessTilde;': '≴',
            '&NotNestedGreaterGreater;': '⪢̸',
            '&NotNestedLessLess;': '⪡̸',
            '&NotPrecedes;': '⊀',
            '&NotPrecedesEqual;': '⪯̸',
            '&NotPrecedesSlantEqual;': '⋠',
            '&NotReverseElement;': '∌',
            '&NotRightTriangle;': '⋫',
            '&NotRightTriangleBar;': '⧐̸',
            '&NotRightTriangleEqual;': '⋭',
            '&NotSquareSubset;': '⊏̸',
            '&NotSquareSubsetEqual;': '⋢',
            '&NotSquareSuperset;': '⊐̸',
            '&NotSquareSupersetEqual;': '⋣',
            '&NotSubset;': '⊂⃒',
            '&NotSubsetEqual;': '⊈',
            '&NotSucceeds;': '⊁',
            '&NotSucceedsEqual;': '⪰̸',
            '&NotSucceedsSlantEqual;': '⋡',
            '&NotSucceedsTilde;': '≿̸',
            '&NotSuperset;': '⊃⃒',
            '&NotSupersetEqual;': '⊉',
            '&NotTilde;': '≁',
            '&NotTildeEqual;': '≄',
            '&NotTildeFullEqual;': '≇',
            '&NotTildeTilde;': '≉',
            '&NotVerticalBar;': '∤',
            '&Nscr;': '𝒩',
            '&Ntilde': 'Ñ',
            '&Ntilde;': 'Ñ',
            '&Nu;': 'Ν',
            '&OElig;': 'Œ',
            '&Oacute': 'Ó',
            '&Oacute;': 'Ó',
            '&Ocirc': 'Ô',
            '&Ocirc;': 'Ô',
            '&Ocy;': 'О',
            '&Odblac;': 'Ő',
            '&Ofr;': '𝔒',
            '&Ograve': 'Ò',
            '&Ograve;': 'Ò',
            '&Omacr;': 'Ō',
            '&Omega;': 'Ω',
            '&Omicron;': 'Ο',
            '&Oopf;': '𝕆',
            '&OpenCurlyDoubleQuote;': '“',
            '&OpenCurlyQuote;': '‘',
            '&Or;': '⩔',
            '&Oscr;': '𝒪',
            '&Oslash': 'Ø',
            '&Oslash;': 'Ø',
            '&Otilde': 'Õ',
            '&Otilde;': 'Õ',
            '&Otimes;': '⨷',
            '&Ouml': 'Ö',
            '&Ouml;': 'Ö',
            '&OverBar;': '‾',
            '&OverBrace;': '⏞',
            '&OverBracket;': '⎴',
            '&OverParenthesis;': '⏜',
            '&PartialD;': '∂',
            '&Pcy;': 'П',
            '&Pfr;': '𝔓',
            '&Phi;': 'Φ',
            '&Pi;': 'Π',
            '&PlusMinus;': '±',
            '&Poincareplane;': 'ℌ',
            '&Popf;': 'ℙ',
            '&Pr;': '⪻',
            '&Precedes;': '≺',
            '&PrecedesEqual;': '⪯',
            '&PrecedesSlantEqual;': '≼',
            '&PrecedesTilde;': '≾',
            '&Prime;': '″',
            '&Product;': '∏',
            '&Proportion;': '∷',
            '&Proportional;': '∝',
            '&Pscr;': '𝒫',
            '&Psi;': 'Ψ',
            '&QUOT': '"',
            '&QUOT;': '"',
            '&Qfr;': '𝔔',
            '&Qopf;': 'ℚ',
            '&Qscr;': '𝒬',
            '&RBarr;': '⤐',
            '&REG': '®',
            '&REG;': '®',
            '&Racute;': 'Ŕ',
            '&Rang;': '⟫',
            '&Rarr;': '↠',
            '&Rarrtl;': '⤖',
            '&Rcaron;': 'Ř',
            '&Rcedil;': 'Ŗ',
            '&Rcy;': 'Р',
            '&Re;': 'ℜ',
            '&ReverseElement;': '∋',
            '&ReverseEquilibrium;': '⇋',
            '&ReverseUpEquilibrium;': '⥯',
            '&Rfr;': 'ℜ',
            '&Rho;': 'Ρ',
            '&RightAngleBracket;': '⟩',
            '&RightArrow;': '→',
            '&RightArrowBar;': '⇥',
            '&RightArrowLeftArrow;': '⇄',
            '&RightCeiling;': '⌉',
            '&RightDoubleBracket;': '⟧',
            '&RightDownTeeVector;': '⥝',
            '&RightDownVector;': '⇂',
            '&RightDownVectorBar;': '⥕',
            '&RightFloor;': '⌋',
            '&RightTee;': '⊢',
            '&RightTeeArrow;': '↦',
            '&RightTeeVector;': '⥛',
            '&RightTriangle;': '⊳',
            '&RightTriangleBar;': '⧐',
            '&RightTriangleEqual;': '⊵',
            '&RightUpDownVector;': '⥏',
            '&RightUpTeeVector;': '⥜',
            '&RightUpVector;': '↾',
            '&RightUpVectorBar;': '⥔',
            '&RightVector;': '⇀',
            '&RightVectorBar;': '⥓',
            '&Rightarrow;': '⇒',
            '&Ropf;': 'ℝ',
            '&RoundImplies;': '⥰',
            '&Rrightarrow;': '⇛',
            '&Rscr;': 'ℛ',
            '&Rsh;': '↱',
            '&RuleDelayed;': '⧴',
            '&SHCHcy;': 'Щ',
            '&SHcy;': 'Ш',
            '&SOFTcy;': 'Ь',
            '&Sacute;': 'Ś',
            '&Sc;': '⪼',
            '&Scaron;': 'Š',
            '&Scedil;': 'Ş',
            '&Scirc;': 'Ŝ',
            '&Scy;': 'С',
            '&Sfr;': '𝔖',
            '&ShortDownArrow;': '↓',
            '&ShortLeftArrow;': '←',
            '&ShortRightArrow;': '→',
            '&ShortUpArrow;': '↑',
            '&Sigma;': 'Σ',
            '&SmallCircle;': '∘',
            '&Sopf;': '𝕊',
            '&Sqrt;': '√',
            '&Square;': '□',
            '&SquareIntersection;': '⊓',
            '&SquareSubset;': '⊏',
            '&SquareSubsetEqual;': '⊑',
            '&SquareSuperset;': '⊐',
            '&SquareSupersetEqual;': '⊒',
            '&SquareUnion;': '⊔',
            '&Sscr;': '𝒮',
            '&Star;': '⋆',
            '&Sub;': '⋐',
            '&Subset;': '⋐',
            '&SubsetEqual;': '⊆',
            '&Succeeds;': '≻',
            '&SucceedsEqual;': '⪰',
            '&SucceedsSlantEqual;': '≽',
            '&SucceedsTilde;': '≿',
            '&SuchThat;': '∋',
            '&Sum;': '∑',
            '&Sup;': '⋑',
            '&Superset;': '⊃',
            '&SupersetEqual;': '⊇',
            '&Supset;': '⋑',
            '&THORN': 'Þ',
            '&THORN;': 'Þ',
            '&TRADE;': '™',
            '&TSHcy;': 'Ћ',
            '&TScy;': 'Ц',
            '&Tab;': '\t',
            '&Tau;': 'Τ',
            '&Tcaron;': 'Ť',
            '&Tcedil;': 'Ţ',
            '&Tcy;': 'Т',
            '&Tfr;': '𝔗',
            '&Therefore;': '∴',
            '&Theta;': 'Θ',
            '&ThickSpace;': '  ',
            '&ThinSpace;': ' ',
            '&Tilde;': '∼',
            '&TildeEqual;': '≃',
            '&TildeFullEqual;': '≅',
            '&TildeTilde;': '≈',
            '&Topf;': '𝕋',
            '&TripleDot;': '⃛',
            '&Tscr;': '𝒯',
            '&Tstrok;': 'Ŧ',
            '&Uacute': 'Ú',
            '&Uacute;': 'Ú',
            '&Uarr;': '↟',
            '&Uarrocir;': '⥉',
            '&Ubrcy;': 'Ў',
            '&Ubreve;': 'Ŭ',
            '&Ucirc': 'Û',
            '&Ucirc;': 'Û',
            '&Ucy;': 'У',
            '&Udblac;': 'Ű',
            '&Ufr;': '𝔘',
            '&Ugrave': 'Ù',
            '&Ugrave;': 'Ù',
            '&Umacr;': 'Ū',
            '&UnderBar;': '_',
            '&UnderBrace;': '⏟',
            '&UnderBracket;': '⎵',
            '&UnderParenthesis;': '⏝',
            '&Union;': '⋃',
            '&UnionPlus;': '⊎',
            '&Uogon;': 'Ų',
            '&Uopf;': '𝕌',
            '&UpArrow;': '↑',
            '&UpArrowBar;': '⤒',
            '&UpArrowDownArrow;': '⇅',
            '&UpDownArrow;': '↕',
            '&UpEquilibrium;': '⥮',
            '&UpTee;': '⊥',
            '&UpTeeArrow;': '↥',
            '&Uparrow;': '⇑',
            '&Updownarrow;': '⇕',
            '&UpperLeftArrow;': '↖',
            '&UpperRightArrow;': '↗',
            '&Upsi;': 'ϒ',
            '&Upsilon;': 'Υ',
            '&Uring;': 'Ů',
            '&Uscr;': '𝒰',
            '&Utilde;': 'Ũ',
            '&Uuml': 'Ü',
            '&Uuml;': 'Ü',
            '&VDash;': '⊫',
            '&Vbar;': '⫫',
            '&Vcy;': 'В',
            '&Vdash;': '⊩',
            '&Vdashl;': '⫦',
            '&Vee;': '⋁',
            '&Verbar;': '‖',
            '&Vert;': '‖',
            '&VerticalBar;': '∣',
            '&VerticalLine;': '|',
            '&VerticalSeparator;': '❘',
            '&VerticalTilde;': '≀',
            '&VeryThinSpace;': ' ',
            '&Vfr;': '𝔙',
            '&Vopf;': '𝕍',
            '&Vscr;': '𝒱',
            '&Vvdash;': '⊪',
            '&Wcirc;': 'Ŵ',
            '&Wedge;': '⋀',
            '&Wfr;': '𝔚',
            '&Wopf;': '𝕎',
            '&Wscr;': '𝒲',
            '&Xfr;': '𝔛',
            '&Xi;': 'Ξ',
            '&Xopf;': '𝕏',
            '&Xscr;': '𝒳',
            '&YAcy;': 'Я',
            '&YIcy;': 'Ї',
            '&YUcy;': 'Ю',
            '&Yacute': 'Ý',
            '&Yacute;': 'Ý',
            '&Ycirc;': 'Ŷ',
            '&Ycy;': 'Ы',
            '&Yfr;': '𝔜',
            '&Yopf;': '𝕐',
            '&Yscr;': '𝒴',
            '&Yuml;': 'Ÿ',
            '&ZHcy;': 'Ж',
            '&Zacute;': 'Ź',
            '&Zcaron;': 'Ž',
            '&Zcy;': 'З',
            '&Zdot;': 'Ż',
            '&ZeroWidthSpace;': '​',
            '&Zeta;': 'Ζ',
            '&Zfr;': 'ℨ',
            '&Zopf;': 'ℤ',
            '&Zscr;': '𝒵',
            '&aacute': 'á',
            '&aacute;': 'á',
            '&abreve;': 'ă',
            '&ac;': '∾',
            '&acE;': '∾̳',
            '&acd;': '∿',
            '&acirc': 'â',
            '&acirc;': 'â',
            '&acute': '´',
            '&acute;': '´',
            '&acy;': 'а',
            '&aelig': 'æ',
            '&aelig;': 'æ',
            '&af;': '⁡',
            '&afr;': '𝔞',
            '&agrave': 'à',
            '&agrave;': 'à',
            '&alefsym;': 'ℵ',
            '&aleph;': 'ℵ',
            '&alpha;': 'α',
            '&amacr;': 'ā',
            '&amalg;': '⨿',
            '&amp': '&',
            '&amp;': '&',
            '&and;': '∧',
            '&andand;': '⩕',
            '&andd;': '⩜',
            '&andslope;': '⩘',
            '&andv;': '⩚',
            '&ang;': '∠',
            '&ange;': '⦤',
            '&angle;': '∠',
            '&angmsd;': '∡',
            '&angmsdaa;': '⦨',
            '&angmsdab;': '⦩',
            '&angmsdac;': '⦪',
            '&angmsdad;': '⦫',
            '&angmsdae;': '⦬',
            '&angmsdaf;': '⦭',
            '&angmsdag;': '⦮',
            '&angmsdah;': '⦯',
            '&angrt;': '∟',
            '&angrtvb;': '⊾',
            '&angrtvbd;': '⦝',
            '&angsph;': '∢',
            '&angst;': 'Å',
            '&angzarr;': '⍼',
            '&aogon;': 'ą',
            '&aopf;': '𝕒',
            '&ap;': '≈',
            '&apE;': '⩰',
            '&apacir;': '⩯',
            '&ape;': '≊',
            '&apid;': '≋',
            '&apos;': "'",
            '&approx;': '≈',
            '&approxeq;': '≊',
            '&aring': 'å',
            '&aring;': 'å',
            '&ascr;': '𝒶',
            '&ast;': '*',
            '&asymp;': '≈',
            '&asympeq;': '≍',
            '&atilde': 'ã',
            '&atilde;': 'ã',
            '&auml': 'ä',
            '&auml;': 'ä',
            '&awconint;': '∳',
            '&awint;': '⨑',
            '&bNot;': '⫭',
            '&backcong;': '≌',
            '&backepsilon;': '϶',
            '&backprime;': '‵',
            '&backsim;': '∽',
            '&backsimeq;': '⋍',
            '&barvee;': '⊽',
            '&barwed;': '⌅',
            '&barwedge;': '⌅',
            '&bbrk;': '⎵',
            '&bbrktbrk;': '⎶',
            '&bcong;': '≌',
            '&bcy;': 'б',
            '&bdquo;': '„',
            '&becaus;': '∵',
            '&because;': '∵',
            '&bemptyv;': '⦰',
            '&bepsi;': '϶',
            '&bernou;': 'ℬ',
            '&beta;': 'β',
            '&beth;': 'ℶ',
            '&between;': '≬',
            '&bfr;': '𝔟',
            '&bigcap;': '⋂',
            '&bigcirc;': '◯',
            '&bigcup;': '⋃',
            '&bigodot;': '⨀',
            '&bigoplus;': '⨁',
            '&bigotimes;': '⨂',
            '&bigsqcup;': '⨆',
            '&bigstar;': '★',
            '&bigtriangledown;': '▽',
            '&bigtriangleup;': '△',
            '&biguplus;': '⨄',
            '&bigvee;': '⋁',
            '&bigwedge;': '⋀',
            '&bkarow;': '⤍',
            '&blacklozenge;': '⧫',
            '&blacksquare;': '▪',
            '&blacktriangle;': '▴',
            '&blacktriangledown;': '▾',
            '&blacktriangleleft;': '◂',
            '&blacktriangleright;': '▸',
            '&blank;': '␣',
            '&blk12;': '▒',
            '&blk14;': '░',
            '&blk34;': '▓',
            '&block;': '█',
            '&bne;': '=⃥',
            '&bnequiv;': '≡⃥',
            '&bnot;': '⌐',
            '&bopf;': '𝕓',
            '&bot;': '⊥',
            '&bottom;': '⊥',
            '&bowtie;': '⋈',
            '&boxDL;': '╗',
            '&boxDR;': '╔',
            '&boxDl;': '╖',
            '&boxDr;': '╓',
            '&boxH;': '═',
            '&boxHD;': '╦',
            '&boxHU;': '╩',
            '&boxHd;': '╤',
            '&boxHu;': '╧',
            '&boxUL;': '╝',
            '&boxUR;': '╚',
            '&boxUl;': '╜',
            '&boxUr;': '╙',
            '&boxV;': '║',
            '&boxVH;': '╬',
            '&boxVL;': '╣',
            '&boxVR;': '╠',
            '&boxVh;': '╫',
            '&boxVl;': '╢',
            '&boxVr;': '╟',
            '&boxbox;': '⧉',
            '&boxdL;': '╕',
            '&boxdR;': '╒',
            '&boxdl;': '┐',
            '&boxdr;': '┌',
            '&boxh;': '─',
            '&boxhD;': '╥',
            '&boxhU;': '╨',
            '&boxhd;': '┬',
            '&boxhu;': '┴',
            '&boxminus;': '⊟',
            '&boxplus;': '⊞',
            '&boxtimes;': '⊠',
            '&boxuL;': '╛',
            '&boxuR;': '╘',
            '&boxul;': '┘',
            '&boxur;': '└',
            '&boxv;': '│',
            '&boxvH;': '╪',
            '&boxvL;': '╡',
            '&boxvR;': '╞',
            '&boxvh;': '┼',
            '&boxvl;': '┤',
            '&boxvr;': '├',
            '&bprime;': '‵',
            '&breve;': '˘',
            '&brvbar': '¦',
            '&brvbar;': '¦',
            '&bscr;': '𝒷',
            '&bsemi;': '⁏',
            '&bsim;': '∽',
            '&bsime;': '⋍',
            '&bsol;': '\\',
            '&bsolb;': '⧅',
            '&bsolhsub;': '⟈',
            '&bull;': '•',
            '&bullet;': '•',
            '&bump;': '≎',
            '&bumpE;': '⪮',
            '&bumpe;': '≏',
            '&bumpeq;': '≏',
            '&cacute;': 'ć',
            '&cap;': '∩',
            '&capand;': '⩄',
            '&capbrcup;': '⩉',
            '&capcap;': '⩋',
            '&capcup;': '⩇',
            '&capdot;': '⩀',
            '&caps;': '∩︀',
            '&caret;': '⁁',
            '&caron;': 'ˇ',
            '&ccaps;': '⩍',
            '&ccaron;': 'č',
            '&ccedil': 'ç',
            '&ccedil;': 'ç',
            '&ccirc;': 'ĉ',
            '&ccups;': '⩌',
            '&ccupssm;': '⩐',
            '&cdot;': 'ċ',
            '&cedil': '¸',
            '&cedil;': '¸',
            '&cemptyv;': '⦲',
            '&cent': '¢',
            '&cent;': '¢',
            '&centerdot;': '·',
            '&cfr;': '𝔠',
            '&chcy;': 'ч',
            '&check;': '✓',
            '&checkmark;': '✓',
            '&chi;': 'χ',
            '&cir;': '○',
            '&cirE;': '⧃',
            '&circ;': 'ˆ',
            '&circeq;': '≗',
            '&circlearrowleft;': '↺',
            '&circlearrowright;': '↻',
            '&circledR;': '®',
            '&circledS;': 'Ⓢ',
            '&circledast;': '⊛',
            '&circledcirc;': '⊚',
            '&circleddash;': '⊝',
            '&cire;': '≗',
            '&cirfnint;': '⨐',
            '&cirmid;': '⫯',
            '&cirscir;': '⧂',
            '&clubs;': '♣',
            '&clubsuit;': '♣',
            '&colon;': ':',
            '&colone;': '≔',
            '&coloneq;': '≔',
            '&comma;': ',',
            '&commat;': '@',
            '&comp;': '∁',
            '&compfn;': '∘',
            '&complement;': '∁',
            '&complexes;': 'ℂ',
            '&cong;': '≅',
            '&congdot;': '⩭',
            '&conint;': '∮',
            '&copf;': '𝕔',
            '&coprod;': '∐',
            '&copy': '©',
            '&copy;': '©',
            '&copysr;': '℗',
            '&crarr;': '↵',
            '&cross;': '✗',
            '&cscr;': '𝒸',
            '&csub;': '⫏',
            '&csube;': '⫑',
            '&csup;': '⫐',
            '&csupe;': '⫒',
            '&ctdot;': '⋯',
            '&cudarrl;': '⤸',
            '&cudarrr;': '⤵',
            '&cuepr;': '⋞',
            '&cuesc;': '⋟',
            '&cularr;': '↶',
            '&cularrp;': '⤽',
            '&cup;': '∪',
            '&cupbrcap;': '⩈',
            '&cupcap;': '⩆',
            '&cupcup;': '⩊',
            '&cupdot;': '⊍',
            '&cupor;': '⩅',
            '&cups;': '∪︀',
            '&curarr;': '↷',
            '&curarrm;': '⤼',
            '&curlyeqprec;': '⋞',
            '&curlyeqsucc;': '⋟',
            '&curlyvee;': '⋎',
            '&curlywedge;': '⋏',
            '&curren': '¤',
            '&curren;': '¤',
            '&curvearrowleft;': '↶',
            '&curvearrowright;': '↷',
            '&cuvee;': '⋎',
            '&cuwed;': '⋏',
            '&cwconint;': '∲',
            '&cwint;': '∱',
            '&cylcty;': '⌭',
            '&dArr;': '⇓',
            '&dHar;': '⥥',
            '&dagger;': '†',
            '&daleth;': 'ℸ',
            '&darr;': '↓',
            '&dash;': '‐',
            '&dashv;': '⊣',
            '&dbkarow;': '⤏',
            '&dblac;': '˝',
            '&dcaron;': 'ď',
            '&dcy;': 'д',
            '&dd;': 'ⅆ',
            '&ddagger;': '‡',
            '&ddarr;': '⇊',
            '&ddotseq;': '⩷',
            '&deg': '°',
            '&deg;': '°',
            '&delta;': 'δ',
            '&demptyv;': '⦱',
            '&dfisht;': '⥿',
            '&dfr;': '𝔡',
            '&dharl;': '⇃',
            '&dharr;': '⇂',
            '&diam;': '⋄',
            '&diamond;': '⋄',
            '&diamondsuit;': '♦',
            '&diams;': '♦',
            '&die;': '¨',
            '&digamma;': 'ϝ',
            '&disin;': '⋲',
            '&div;': '÷',
            '&divide': '÷',
            '&divide;': '÷',
            '&divideontimes;': '⋇',
            '&divonx;': '⋇',
            '&djcy;': 'ђ',
            '&dlcorn;': '⌞',
            '&dlcrop;': '⌍',
            '&dollar;': '$',
            '&dopf;': '𝕕',
            '&dot;': '˙',
            '&doteq;': '≐',
            '&doteqdot;': '≑',
            '&dotminus;': '∸',
            '&dotplus;': '∔',
            '&dotsquare;': '⊡',
            '&doublebarwedge;': '⌆',
            '&downarrow;': '↓',
            '&downdownarrows;': '⇊',
            '&downharpoonleft;': '⇃',
            '&downharpoonright;': '⇂',
            '&drbkarow;': '⤐',
            '&drcorn;': '⌟',
            '&drcrop;': '⌌',
            '&dscr;': '𝒹',
            '&dscy;': 'ѕ',
            '&dsol;': '⧶',
            '&dstrok;': 'đ',
            '&dtdot;': '⋱',
            '&dtri;': '▿',
            '&dtrif;': '▾',
            '&duarr;': '⇵',
            '&duhar;': '⥯',
            '&dwangle;': '⦦',
            '&dzcy;': 'џ',
            '&dzigrarr;': '⟿',
            '&eDDot;': '⩷',
            '&eDot;': '≑',
            '&eacute': 'é',
            '&eacute;': 'é',
            '&easter;': '⩮',
            '&ecaron;': 'ě',
            '&ecir;': '≖',
            '&ecirc': 'ê',
            '&ecirc;': 'ê',
            '&ecolon;': '≕',
            '&ecy;': 'э',
            '&edot;': 'ė',
            '&ee;': 'ⅇ',
            '&efDot;': '≒',
            '&efr;': '𝔢',
            '&eg;': '⪚',
            '&egrave': 'è',
            '&egrave;': 'è',
            '&egs;': '⪖',
            '&egsdot;': '⪘',
            '&el;': '⪙',
            '&elinters;': '⏧',
            '&ell;': 'ℓ',
            '&els;': '⪕',
            '&elsdot;': '⪗',
            '&emacr;': 'ē',
            '&empty;': '∅',
            '&emptyset;': '∅',
            '&emptyv;': '∅',
            '&emsp13;': ' ',
            '&emsp14;': ' ',
            '&emsp;': ' ',
            '&eng;': 'ŋ',
            '&ensp;': ' ',
            '&eogon;': 'ę',
            '&eopf;': '𝕖',
            '&epar;': '⋕',
            '&eparsl;': '⧣',
            '&eplus;': '⩱',
            '&epsi;': 'ε',
            '&epsilon;': 'ε',
            '&epsiv;': 'ϵ',
            '&eqcirc;': '≖',
            '&eqcolon;': '≕',
            '&eqsim;': '≂',
            '&eqslantgtr;': '⪖',
            '&eqslantless;': '⪕',
            '&equals;': '=',
            '&equest;': '≟',
            '&equiv;': '≡',
            '&equivDD;': '⩸',
            '&eqvparsl;': '⧥',
            '&erDot;': '≓',
            '&erarr;': '⥱',
            '&escr;': 'ℯ',
            '&esdot;': '≐',
            '&esim;': '≂',
            '&eta;': 'η',
            '&eth': 'ð',
            '&eth;': 'ð',
            '&euml': 'ë',
            '&euml;': 'ë',
            '&euro;': '€',
            '&excl;': '!',
            '&exist;': '∃',
            '&expectation;': 'ℰ',
            '&exponentiale;': 'ⅇ',
            '&fallingdotseq;': '≒',
            '&fcy;': 'ф',
            '&female;': '♀',
            '&ffilig;': 'ﬃ',
            '&fflig;': 'ﬀ',
            '&ffllig;': 'ﬄ',
            '&ffr;': '𝔣',
            '&filig;': 'ﬁ',
            '&fjlig;': 'fj',
            '&flat;': '♭',
            '&fllig;': 'ﬂ',
            '&fltns;': '▱',
            '&fnof;': 'ƒ',
            '&fopf;': '𝕗',
            '&forall;': '∀',
            '&fork;': '⋔',
            '&forkv;': '⫙',
            '&fpartint;': '⨍',
            '&frac12': '½',
            '&frac12;': '½',
            '&frac13;': '⅓',
            '&frac14': '¼',
            '&frac14;': '¼',
            '&frac15;': '⅕',
            '&frac16;': '⅙',
            '&frac18;': '⅛',
            '&frac23;': '⅔',
            '&frac25;': '⅖',
            '&frac34': '¾',
            '&frac34;': '¾',
            '&frac35;': '⅗',
            '&frac38;': '⅜',
            '&frac45;': '⅘',
            '&frac56;': '⅚',
            '&frac58;': '⅝',
            '&frac78;': '⅞',
            '&frasl;': '⁄',
            '&frown;': '⌢',
            '&fscr;': '𝒻',
            '&gE;': '≧',
            '&gEl;': '⪌',
            '&gacute;': 'ǵ',
            '&gamma;': 'γ',
            '&gammad;': 'ϝ',
            '&gap;': '⪆',
            '&gbreve;': 'ğ',
            '&gcirc;': 'ĝ',
            '&gcy;': 'г',
            '&gdot;': 'ġ',
            '&ge;': '≥',
            '&gel;': '⋛',
            '&geq;': '≥',
            '&geqq;': '≧',
            '&geqslant;': '⩾',
            '&ges;': '⩾',
            '&gescc;': '⪩',
            '&gesdot;': '⪀',
            '&gesdoto;': '⪂',
            '&gesdotol;': '⪄',
            '&gesl;': '⋛︀',
            '&gesles;': '⪔',
            '&gfr;': '𝔤',
            '&gg;': '≫',
            '&ggg;': '⋙',
            '&gimel;': 'ℷ',
            '&gjcy;': 'ѓ',
            '&gl;': '≷',
            '&glE;': '⪒',
            '&gla;': '⪥',
            '&glj;': '⪤',
            '&gnE;': '≩',
            '&gnap;': '⪊',
            '&gnapprox;': '⪊',
            '&gne;': '⪈',
            '&gneq;': '⪈',
            '&gneqq;': '≩',
            '&gnsim;': '⋧',
            '&gopf;': '𝕘',
            '&grave;': '`',
            '&gscr;': 'ℊ',
            '&gsim;': '≳',
            '&gsime;': '⪎',
            '&gsiml;': '⪐',
            '&gt': '>',
            '&gt;': '>',
            '&gtcc;': '⪧',
            '&gtcir;': '⩺',
            '&gtdot;': '⋗',
            '&gtlPar;': '⦕',
            '&gtquest;': '⩼',
            '&gtrapprox;': '⪆',
            '&gtrarr;': '⥸',
            '&gtrdot;': '⋗',
            '&gtreqless;': '⋛',
            '&gtreqqless;': '⪌',
            '&gtrless;': '≷',
            '&gtrsim;': '≳',
            '&gvertneqq;': '≩︀',
            '&gvnE;': '≩︀',
            '&hArr;': '⇔',
            '&hairsp;': ' ',
            '&half;': '½',
            '&hamilt;': 'ℋ',
            '&hardcy;': 'ъ',
            '&harr;': '↔',
            '&harrcir;': '⥈',
            '&harrw;': '↭',
            '&hbar;': 'ℏ',
            '&hcirc;': 'ĥ',
            '&hearts;': '♥',
            '&heartsuit;': '♥',
            '&hellip;': '…',
            '&hercon;': '⊹',
            '&hfr;': '𝔥',
            '&hksearow;': '⤥',
            '&hkswarow;': '⤦',
            '&hoarr;': '⇿',
            '&homtht;': '∻',
            '&hookleftarrow;': '↩',
            '&hookrightarrow;': '↪',
            '&hopf;': '𝕙',
            '&horbar;': '―',
            '&hscr;': '𝒽',
            '&hslash;': 'ℏ',
            '&hstrok;': 'ħ',
            '&hybull;': '⁃',
            '&hyphen;': '‐',
            '&iacute': 'í',
            '&iacute;': 'í',
            '&ic;': '⁣',
            '&icirc': 'î',
            '&icirc;': 'î',
            '&icy;': 'и',
            '&iecy;': 'е',
            '&iexcl': '¡',
            '&iexcl;': '¡',
            '&iff;': '⇔',
            '&ifr;': '𝔦',
            '&igrave': 'ì',
            '&igrave;': 'ì',
            '&ii;': 'ⅈ',
            '&iiiint;': '⨌',
            '&iiint;': '∭',
            '&iinfin;': '⧜',
            '&iiota;': '℩',
            '&ijlig;': 'ĳ',
            '&imacr;': 'ī',
            '&image;': 'ℑ',
            '&imagline;': 'ℐ',
            '&imagpart;': 'ℑ',
            '&imath;': 'ı',
            '&imof;': '⊷',
            '&imped;': 'Ƶ',
            '&in;': '∈',
            '&incare;': '℅',
            '&infin;': '∞',
            '&infintie;': '⧝',
            '&inodot;': 'ı',
            '&int;': '∫',
            '&intcal;': '⊺',
            '&integers;': 'ℤ',
            '&intercal;': '⊺',
            '&intlarhk;': '⨗',
            '&intprod;': '⨼',
            '&iocy;': 'ё',
            '&iogon;': 'į',
            '&iopf;': '𝕚',
            '&iota;': 'ι',
            '&iprod;': '⨼',
            '&iquest': '¿',
            '&iquest;': '¿',
            '&iscr;': '𝒾',
            '&isin;': '∈',
            '&isinE;': '⋹',
            '&isindot;': '⋵',
            '&isins;': '⋴',
            '&isinsv;': '⋳',
            '&isinv;': '∈',
            '&it;': '⁢',
            '&itilde;': 'ĩ',
            '&iukcy;': 'і',
            '&iuml': 'ï',
            '&iuml;': 'ï',
            '&jcirc;': 'ĵ',
            '&jcy;': 'й',
            '&jfr;': '𝔧',
            '&jmath;': 'ȷ',
            '&jopf;': '𝕛',
            '&jscr;': '𝒿',
            '&jsercy;': 'ј',
            '&jukcy;': 'є',
            '&kappa;': 'κ',
            '&kappav;': 'ϰ',
            '&kcedil;': 'ķ',
            '&kcy;': 'к',
            '&kfr;': '𝔨',
            '&kgreen;': 'ĸ',
            '&khcy;': 'х',
            '&kjcy;': 'ќ',
            '&kopf;': '𝕜',
            '&kscr;': '𝓀',
            '&lAarr;': '⇚',
            '&lArr;': '⇐',
            '&lAtail;': '⤛',
            '&lBarr;': '⤎',
            '&lE;': '≦',
            '&lEg;': '⪋',
            '&lHar;': '⥢',
            '&lacute;': 'ĺ',
            '&laemptyv;': '⦴',
            '&lagran;': 'ℒ',
            '&lambda;': 'λ',
            '&lang;': '⟨',
            '&langd;': '⦑',
            '&langle;': '⟨',
            '&lap;': '⪅',
            '&laquo': '«',
            '&laquo;': '«',
            '&larr;': '←',
            '&larrb;': '⇤',
            '&larrbfs;': '⤟',
            '&larrfs;': '⤝',
            '&larrhk;': '↩',
            '&larrlp;': '↫',
            '&larrpl;': '⤹',
            '&larrsim;': '⥳',
            '&larrtl;': '↢',
            '&lat;': '⪫',
            '&latail;': '⤙',
            '&late;': '⪭',
            '&lates;': '⪭︀',
            '&lbarr;': '⤌',
            '&lbbrk;': '❲',
            '&lbrace;': '{',
            '&lbrack;': '[',
            '&lbrke;': '⦋',
            '&lbrksld;': '⦏',
            '&lbrkslu;': '⦍',
            '&lcaron;': 'ľ',
            '&lcedil;': 'ļ',
            '&lceil;': '⌈',
            '&lcub;': '{',
            '&lcy;': 'л',
            '&ldca;': '⤶',
            '&ldquo;': '“',
            '&ldquor;': '„',
            '&ldrdhar;': '⥧',
            '&ldrushar;': '⥋',
            '&ldsh;': '↲',
            '&le;': '≤',
            '&leftarrow;': '←',
            '&leftarrowtail;': '↢',
            '&leftharpoondown;': '↽',
            '&leftharpoonup;': '↼',
            '&leftleftarrows;': '⇇',
            '&leftrightarrow;': '↔',
            '&leftrightarrows;': '⇆',
            '&leftrightharpoons;': '⇋',
            '&leftrightsquigarrow;': '↭',
            '&leftthreetimes;': '⋋',
            '&leg;': '⋚',
            '&leq;': '≤',
            '&leqq;': '≦',
            '&leqslant;': '⩽',
            '&les;': '⩽',
            '&lescc;': '⪨',
            '&lesdot;': '⩿',
            '&lesdoto;': '⪁',
            '&lesdotor;': '⪃',
            '&lesg;': '⋚︀',
            '&lesges;': '⪓',
            '&lessapprox;': '⪅',
            '&lessdot;': '⋖',
            '&lesseqgtr;': '⋚',
            '&lesseqqgtr;': '⪋',
            '&lessgtr;': '≶',
            '&lesssim;': '≲',
            '&lfisht;': '⥼',
            '&lfloor;': '⌊',
            '&lfr;': '𝔩',
            '&lg;': '≶',
            '&lgE;': '⪑',
            '&lhard;': '↽',
            '&lharu;': '↼',
            '&lharul;': '⥪',
            '&lhblk;': '▄',
            '&ljcy;': 'љ',
            '&ll;': '≪',
            '&llarr;': '⇇',
            '&llcorner;': '⌞',
            '&llhard;': '⥫',
            '&lltri;': '◺',
            '&lmidot;': 'ŀ',
            '&lmoust;': '⎰',
            '&lmoustache;': '⎰',
            '&lnE;': '≨',
            '&lnap;': '⪉',
            '&lnapprox;': '⪉',
            '&lne;': '⪇',
            '&lneq;': '⪇',
            '&lneqq;': '≨',
            '&lnsim;': '⋦',
            '&loang;': '⟬',
            '&loarr;': '⇽',
            '&lobrk;': '⟦',
            '&longleftarrow;': '⟵',
            '&longleftrightarrow;': '⟷',
            '&longmapsto;': '⟼',
            '&longrightarrow;': '⟶',
            '&looparrowleft;': '↫',
            '&looparrowright;': '↬',
            '&lopar;': '⦅',
            '&lopf;': '𝕝',
            '&loplus;': '⨭',
            '&lotimes;': '⨴',
            '&lowast;': '∗',
            '&lowbar;': '_',
            '&loz;': '◊',
            '&lozenge;': '◊',
            '&lozf;': '⧫',
            '&lpar;': '(',
            '&lparlt;': '⦓',
            '&lrarr;': '⇆',
            '&lrcorner;': '⌟',
            '&lrhar;': '⇋',
            '&lrhard;': '⥭',
            '&lrm;': '‎',
            '&lrtri;': '⊿',
            '&lsaquo;': '‹',
            '&lscr;': '𝓁',
            '&lsh;': '↰',
            '&lsim;': '≲',
            '&lsime;': '⪍',
            '&lsimg;': '⪏',
            '&lsqb;': '[',
            '&lsquo;': '‘',
            '&lsquor;': '‚',
            '&lstrok;': 'ł',
            '&lt': '<',
            '&lt;': '<',
            '&ltcc;': '⪦',
            '&ltcir;': '⩹',
            '&ltdot;': '⋖',
            '&lthree;': '⋋',
            '&ltimes;': '⋉',
            '&ltlarr;': '⥶',
            '&ltquest;': '⩻',
            '&ltrPar;': '⦖',
            '&ltri;': '◃',
            '&ltrie;': '⊴',
            '&ltrif;': '◂',
            '&lurdshar;': '⥊',
            '&luruhar;': '⥦',
            '&lvertneqq;': '≨︀',
            '&lvnE;': '≨︀',
            '&mDDot;': '∺',
            '&macr': '¯',
            '&macr;': '¯',
            '&male;': '♂',
            '&malt;': '✠',
            '&maltese;': '✠',
            '&map;': '↦',
            '&mapsto;': '↦',
            '&mapstodown;': '↧',
            '&mapstoleft;': '↤',
            '&mapstoup;': '↥',
            '&marker;': '▮',
            '&mcomma;': '⨩',
            '&mcy;': 'м',
            '&mdash;': '—',
            '&measuredangle;': '∡',
            '&mfr;': '𝔪',
            '&mho;': '℧',
            '&micro': 'µ',
            '&micro;': 'µ',
            '&mid;': '∣',
            '&midast;': '*',
            '&midcir;': '⫰',
            '&middot': '·',
            '&middot;': '·',
            '&minus;': '−',
            '&minusb;': '⊟',
            '&minusd;': '∸',
            '&minusdu;': '⨪',
            '&mlcp;': '⫛',
            '&mldr;': '…',
            '&mnplus;': '∓',
            '&models;': '⊧',
            '&mopf;': '𝕞',
            '&mp;': '∓',
            '&mscr;': '𝓂',
            '&mstpos;': '∾',
            '&mu;': 'μ',
            '&multimap;': '⊸',
            '&mumap;': '⊸',
            '&nGg;': '⋙̸',
            '&nGt;': '≫⃒',
            '&nGtv;': '≫̸',
            '&nLeftarrow;': '⇍',
            '&nLeftrightarrow;': '⇎',
            '&nLl;': '⋘̸',
            '&nLt;': '≪⃒',
            '&nLtv;': '≪̸',
            '&nRightarrow;': '⇏',
            '&nVDash;': '⊯',
            '&nVdash;': '⊮',
            '&nabla;': '∇',
            '&nacute;': 'ń',
            '&nang;': '∠⃒',
            '&nap;': '≉',
            '&napE;': '⩰̸',
            '&napid;': '≋̸',
            '&napos;': 'ŉ',
            '&napprox;': '≉',
            '&natur;': '♮',
            '&natural;': '♮',
            '&naturals;': 'ℕ',
            '&nbsp': ' ',
            '&nbsp;': ' ',
            '&nbump;': '≎̸',
            '&nbumpe;': '≏̸',
            '&ncap;': '⩃',
            '&ncaron;': 'ň',
            '&ncedil;': 'ņ',
            '&ncong;': '≇',
            '&ncongdot;': '⩭̸',
            '&ncup;': '⩂',
            '&ncy;': 'н',
            '&ndash;': '–',
            '&ne;': '≠',
            '&neArr;': '⇗',
            '&nearhk;': '⤤',
            '&nearr;': '↗',
            '&nearrow;': '↗',
            '&nedot;': '≐̸',
            '&nequiv;': '≢',
            '&nesear;': '⤨',
            '&nesim;': '≂̸',
            '&nexist;': '∄',
            '&nexists;': '∄',
            '&nfr;': '𝔫',
            '&ngE;': '≧̸',
            '&nge;': '≱',
            '&ngeq;': '≱',
            '&ngeqq;': '≧̸',
            '&ngeqslant;': '⩾̸',
            '&nges;': '⩾̸',
            '&ngsim;': '≵',
            '&ngt;': '≯',
            '&ngtr;': '≯',
            '&nhArr;': '⇎',
            '&nharr;': '↮',
            '&nhpar;': '⫲',
            '&ni;': '∋',
            '&nis;': '⋼',
            '&nisd;': '⋺',
            '&niv;': '∋',
            '&njcy;': 'њ',
            '&nlArr;': '⇍',
            '&nlE;': '≦̸',
            '&nlarr;': '↚',
            '&nldr;': '‥',
            '&nle;': '≰',
            '&nleftarrow;': '↚',
            '&nleftrightarrow;': '↮',
            '&nleq;': '≰',
            '&nleqq;': '≦̸',
            '&nleqslant;': '⩽̸',
            '&nles;': '⩽̸',
            '&nless;': '≮',
            '&nlsim;': '≴',
            '&nlt;': '≮',
            '&nltri;': '⋪',
            '&nltrie;': '⋬',
            '&nmid;': '∤',
            '&nopf;': '𝕟',
            '&not': '¬',
            '&not;': '¬',
            '&notin;': '∉',
            '&notinE;': '⋹̸',
            '&notindot;': '⋵̸',
            '&notinva;': '∉',
            '&notinvb;': '⋷',
            '&notinvc;': '⋶',
            '&notni;': '∌',
            '&notniva;': '∌',
            '&notnivb;': '⋾',
            '&notnivc;': '⋽',
            '&npar;': '∦',
            '&nparallel;': '∦',
            '&nparsl;': '⫽⃥',
            '&npart;': '∂̸',
            '&npolint;': '⨔',
            '&npr;': '⊀',
            '&nprcue;': '⋠',
            '&npre;': '⪯̸',
            '&nprec;': '⊀',
            '&npreceq;': '⪯̸',
            '&nrArr;': '⇏',
            '&nrarr;': '↛',
            '&nrarrc;': '⤳̸',
            '&nrarrw;': '↝̸',
            '&nrightarrow;': '↛',
            '&nrtri;': '⋫',
            '&nrtrie;': '⋭',
            '&nsc;': '⊁',
            '&nsccue;': '⋡',
            '&nsce;': '⪰̸',
            '&nscr;': '𝓃',
            '&nshortmid;': '∤',
            '&nshortparallel;': '∦',
            '&nsim;': '≁',
            '&nsime;': '≄',
            '&nsimeq;': '≄',
            '&nsmid;': '∤',
            '&nspar;': '∦',
            '&nsqsube;': '⋢',
            '&nsqsupe;': '⋣',
            '&nsub;': '⊄',
            '&nsubE;': '⫅̸',
            '&nsube;': '⊈',
            '&nsubset;': '⊂⃒',
            '&nsubseteq;': '⊈',
            '&nsubseteqq;': '⫅̸',
            '&nsucc;': '⊁',
            '&nsucceq;': '⪰̸',
            '&nsup;': '⊅',
            '&nsupE;': '⫆̸',
            '&nsupe;': '⊉',
            '&nsupset;': '⊃⃒',
            '&nsupseteq;': '⊉',
            '&nsupseteqq;': '⫆̸',
            '&ntgl;': '≹',
            '&ntilde': 'ñ',
            '&ntilde;': 'ñ',
            '&ntlg;': '≸',
            '&ntriangleleft;': '⋪',
            '&ntrianglelefteq;': '⋬',
            '&ntriangleright;': '⋫',
            '&ntrianglerighteq;': '⋭',
            '&nu;': 'ν',
            '&num;': '#',
            '&numero;': '№',
            '&numsp;': ' ',
            '&nvDash;': '⊭',
            '&nvHarr;': '⤄',
            '&nvap;': '≍⃒',
            '&nvdash;': '⊬',
            '&nvge;': '≥⃒',
            '&nvgt;': '>⃒',
            '&nvinfin;': '⧞',
            '&nvlArr;': '⤂',
            '&nvle;': '≤⃒',
            '&nvlt;': '<⃒',
            '&nvltrie;': '⊴⃒',
            '&nvrArr;': '⤃',
            '&nvrtrie;': '⊵⃒',
            '&nvsim;': '∼⃒',
            '&nwArr;': '⇖',
            '&nwarhk;': '⤣',
            '&nwarr;': '↖',
            '&nwarrow;': '↖',
            '&nwnear;': '⤧',
            '&oS;': 'Ⓢ',
            '&oacute': 'ó',
            '&oacute;': 'ó',
            '&oast;': '⊛',
            '&ocir;': '⊚',
            '&ocirc': 'ô',
            '&ocirc;': 'ô',
            '&ocy;': 'о',
            '&odash;': '⊝',
            '&odblac;': 'ő',
            '&odiv;': '⨸',
            '&odot;': '⊙',
            '&odsold;': '⦼',
            '&oelig;': 'œ',
            '&ofcir;': '⦿',
            '&ofr;': '𝔬',
            '&ogon;': '˛',
            '&ograve': 'ò',
            '&ograve;': 'ò',
            '&ogt;': '⧁',
            '&ohbar;': '⦵',
            '&ohm;': 'Ω',
            '&oint;': '∮',
            '&olarr;': '↺',
            '&olcir;': '⦾',
            '&olcross;': '⦻',
            '&oline;': '‾',
            '&olt;': '⧀',
            '&omacr;': 'ō',
            '&omega;': 'ω',
            '&omicron;': 'ο',
            '&omid;': '⦶',
            '&ominus;': '⊖',
            '&oopf;': '𝕠',
            '&opar;': '⦷',
            '&operp;': '⦹',
            '&oplus;': '⊕',
            '&or;': '∨',
            '&orarr;': '↻',
            '&ord;': '⩝',
            '&order;': 'ℴ',
            '&orderof;': 'ℴ',
            '&ordf': 'ª',
            '&ordf;': 'ª',
            '&ordm': 'º',
            '&ordm;': 'º',
            '&origof;': '⊶',
            '&oror;': '⩖',
            '&orslope;': '⩗',
            '&orv;': '⩛',
            '&oscr;': 'ℴ',
            '&oslash': 'ø',
            '&oslash;': 'ø',
            '&osol;': '⊘',
            '&otilde': 'õ',
            '&otilde;': 'õ',
            '&otimes;': '⊗',
            '&otimesas;': '⨶',
            '&ouml': 'ö',
            '&ouml;': 'ö',
            '&ovbar;': '⌽',
            '&par;': '∥',
            '&para': '¶',
            '&para;': '¶',
            '&parallel;': '∥',
            '&parsim;': '⫳',
            '&parsl;': '⫽',
            '&part;': '∂',
            '&pcy;': 'п',
            '&percnt;': '%',
            '&period;': '.',
            '&permil;': '‰',
            '&perp;': '⊥',
            '&pertenk;': '‱',
            '&pfr;': '𝔭',
            '&phi;': 'φ',
            '&phiv;': 'ϕ',
            '&phmmat;': 'ℳ',
            '&phone;': '☎',
            '&pi;': 'π',
            '&pitchfork;': '⋔',
            '&piv;': 'ϖ',
            '&planck;': 'ℏ',
            '&planckh;': 'ℎ',
            '&plankv;': 'ℏ',
            '&plus;': '+',
            '&plusacir;': '⨣',
            '&plusb;': '⊞',
            '&pluscir;': '⨢',
            '&plusdo;': '∔',
            '&plusdu;': '⨥',
            '&pluse;': '⩲',
            '&plusmn': '±',
            '&plusmn;': '±',
            '&plussim;': '⨦',
            '&plustwo;': '⨧',
            '&pm;': '±',
            '&pointint;': '⨕',
            '&popf;': '𝕡',
            '&pound': '£',
            '&pound;': '£',
            '&pr;': '≺',
            '&prE;': '⪳',
            '&prap;': '⪷',
            '&prcue;': '≼',
            '&pre;': '⪯',
            '&prec;': '≺',
            '&precapprox;': '⪷',
            '&preccurlyeq;': '≼',
            '&preceq;': '⪯',
            '&precnapprox;': '⪹',
            '&precneqq;': '⪵',
            '&precnsim;': '⋨',
            '&precsim;': '≾',
            '&prime;': '′',
            '&primes;': 'ℙ',
            '&prnE;': '⪵',
            '&prnap;': '⪹',
            '&prnsim;': '⋨',
            '&prod;': '∏',
            '&profalar;': '⌮',
            '&profline;': '⌒',
            '&profsurf;': '⌓',
            '&prop;': '∝',
            '&propto;': '∝',
            '&prsim;': '≾',
            '&prurel;': '⊰',
            '&pscr;': '𝓅',
            '&psi;': 'ψ',
            '&puncsp;': ' ',
            '&qfr;': '𝔮',
            '&qint;': '⨌',
            '&qopf;': '𝕢',
            '&qprime;': '⁗',
            '&qscr;': '𝓆',
            '&quaternions;': 'ℍ',
            '&quatint;': '⨖',
            '&quest;': '?',
            '&questeq;': '≟',
            '&quot': '"',
            '&quot;': '"',
            '&rAarr;': '⇛',
            '&rArr;': '⇒',
            '&rAtail;': '⤜',
            '&rBarr;': '⤏',
            '&rHar;': '⥤',
            '&race;': '∽̱',
            '&racute;': 'ŕ',
            '&radic;': '√',
            '&raemptyv;': '⦳',
            '&rang;': '⟩',
            '&rangd;': '⦒',
            '&range;': '⦥',
            '&rangle;': '⟩',
            '&raquo': '»',
            '&raquo;': '»',
            '&rarr;': '→',
            '&rarrap;': '⥵',
            '&rarrb;': '⇥',
            '&rarrbfs;': '⤠',
            '&rarrc;': '⤳',
            '&rarrfs;': '⤞',
            '&rarrhk;': '↪',
            '&rarrlp;': '↬',
            '&rarrpl;': '⥅',
            '&rarrsim;': '⥴',
            '&rarrtl;': '↣',
            '&rarrw;': '↝',
            '&ratail;': '⤚',
            '&ratio;': '∶',
            '&rationals;': 'ℚ',
            '&rbarr;': '⤍',
            '&rbbrk;': '❳',
            '&rbrace;': '}',
            '&rbrack;': ']',
            '&rbrke;': '⦌',
            '&rbrksld;': '⦎',
            '&rbrkslu;': '⦐',
            '&rcaron;': 'ř',
            '&rcedil;': 'ŗ',
            '&rceil;': '⌉',
            '&rcub;': '}',
            '&rcy;': 'р',
            '&rdca;': '⤷',
            '&rdldhar;': '⥩',
            '&rdquo;': '”',
            '&rdquor;': '”',
            '&rdsh;': '↳',
            '&real;': 'ℜ',
            '&realine;': 'ℛ',
            '&realpart;': 'ℜ',
            '&reals;': 'ℝ',
            '&rect;': '▭',
            '&reg': '®',
            '&reg;': '®',
            '&rfisht;': '⥽',
            '&rfloor;': '⌋',
            '&rfr;': '𝔯',
            '&rhard;': '⇁',
            '&rharu;': '⇀',
            '&rharul;': '⥬',
            '&rho;': 'ρ',
            '&rhov;': 'ϱ',
            '&rightarrow;': '→',
            '&rightarrowtail;': '↣',
            '&rightharpoondown;': '⇁',
            '&rightharpoonup;': '⇀',
            '&rightleftarrows;': '⇄',
            '&rightleftharpoons;': '⇌',
            '&rightrightarrows;': '⇉',
            '&rightsquigarrow;': '↝',
            '&rightthreetimes;': '⋌',
            '&ring;': '˚',
            '&risingdotseq;': '≓',
            '&rlarr;': '⇄',
            '&rlhar;': '⇌',
            '&rlm;': '‏',
            '&rmoust;': '⎱',
            '&rmoustache;': '⎱',
            '&rnmid;': '⫮',
            '&roang;': '⟭',
            '&roarr;': '⇾',
            '&robrk;': '⟧',
            '&ropar;': '⦆',
            '&ropf;': '𝕣',
            '&roplus;': '⨮',
            '&rotimes;': '⨵',
            '&rpar;': ')',
            '&rpargt;': '⦔',
            '&rppolint;': '⨒',
            '&rrarr;': '⇉',
            '&rsaquo;': '›',
            '&rscr;': '𝓇',
            '&rsh;': '↱',
            '&rsqb;': ']',
            '&rsquo;': '’',
            '&rsquor;': '’',
            '&rthree;': '⋌',
            '&rtimes;': '⋊',
            '&rtri;': '▹',
            '&rtrie;': '⊵',
            '&rtrif;': '▸',
            '&rtriltri;': '⧎',
            '&ruluhar;': '⥨',
            '&rx;': '℞',
            '&sacute;': 'ś',
            '&sbquo;': '‚',
            '&sc;': '≻',
            '&scE;': '⪴',
            '&scap;': '⪸',
            '&scaron;': 'š',
            '&sccue;': '≽',
            '&sce;': '⪰',
            '&scedil;': 'ş',
            '&scirc;': 'ŝ',
            '&scnE;': '⪶',
            '&scnap;': '⪺',
            '&scnsim;': '⋩',
            '&scpolint;': '⨓',
            '&scsim;': '≿',
            '&scy;': 'с',
            '&sdot;': '⋅',
            '&sdotb;': '⊡',
            '&sdote;': '⩦',
            '&seArr;': '⇘',
            '&searhk;': '⤥',
            '&searr;': '↘',
            '&searrow;': '↘',
            '&sect': '§',
            '&sect;': '§',
            '&semi;': ';',
            '&seswar;': '⤩',
            '&setminus;': '∖',
            '&setmn;': '∖',
            '&sext;': '✶',
            '&sfr;': '𝔰',
            '&sfrown;': '⌢',
            '&sharp;': '♯',
            '&shchcy;': 'щ',
            '&shcy;': 'ш',
            '&shortmid;': '∣',
            '&shortparallel;': '∥',
            '&shy': '­',
            '&shy;': '­',
            '&sigma;': 'σ',
            '&sigmaf;': 'ς',
            '&sigmav;': 'ς',
            '&sim;': '∼',
            '&simdot;': '⩪',
            '&sime;': '≃',
            '&simeq;': '≃',
            '&simg;': '⪞',
            '&simgE;': '⪠',
            '&siml;': '⪝',
            '&simlE;': '⪟',
            '&simne;': '≆',
            '&simplus;': '⨤',
            '&simrarr;': '⥲',
            '&slarr;': '←',
            '&smallsetminus;': '∖',
            '&smashp;': '⨳',
            '&smeparsl;': '⧤',
            '&smid;': '∣',
            '&smile;': '⌣',
            '&smt;': '⪪',
            '&smte;': '⪬',
            '&smtes;': '⪬︀',
            '&softcy;': 'ь',
            '&sol;': '/',
            '&solb;': '⧄',
            '&solbar;': '⌿',
            '&sopf;': '𝕤',
            '&spades;': '♠',
            '&spadesuit;': '♠',
            '&spar;': '∥',
            '&sqcap;': '⊓',
            '&sqcaps;': '⊓︀',
            '&sqcup;': '⊔',
            '&sqcups;': '⊔︀',
            '&sqsub;': '⊏',
            '&sqsube;': '⊑',
            '&sqsubset;': '⊏',
            '&sqsubseteq;': '⊑',
            '&sqsup;': '⊐',
            '&sqsupe;': '⊒',
            '&sqsupset;': '⊐',
            '&sqsupseteq;': '⊒',
            '&squ;': '□',
            '&square;': '□',
            '&squarf;': '▪',
            '&squf;': '▪',
            '&srarr;': '→',
            '&sscr;': '𝓈',
            '&ssetmn;': '∖',
            '&ssmile;': '⌣',
            '&sstarf;': '⋆',
            '&star;': '☆',
            '&starf;': '★',
            '&straightepsilon;': 'ϵ',
            '&straightphi;': 'ϕ',
            '&strns;': '¯',
            '&sub;': '⊂',
            '&subE;': '⫅',
            '&subdot;': '⪽',
            '&sube;': '⊆',
            '&subedot;': '⫃',
            '&submult;': '⫁',
            '&subnE;': '⫋',
            '&subne;': '⊊',
            '&subplus;': '⪿',
            '&subrarr;': '⥹',
            '&subset;': '⊂',
            '&subseteq;': '⊆',
            '&subseteqq;': '⫅',
            '&subsetneq;': '⊊',
            '&subsetneqq;': '⫋',
            '&subsim;': '⫇',
            '&subsub;': '⫕',
            '&subsup;': '⫓',
            '&succ;': '≻',
            '&succapprox;': '⪸',
            '&succcurlyeq;': '≽',
            '&succeq;': '⪰',
            '&succnapprox;': '⪺',
            '&succneqq;': '⪶',
            '&succnsim;': '⋩',
            '&succsim;': '≿',
            '&sum;': '∑',
            '&sung;': '♪',
            '&sup1': '¹',
            '&sup1;': '¹',
            '&sup2': '²',
            '&sup2;': '²',
            '&sup3': '³',
            '&sup3;': '³',
            '&sup;': '⊃',
            '&supE;': '⫆',
            '&supdot;': '⪾',
            '&supdsub;': '⫘',
            '&supe;': '⊇',
            '&supedot;': '⫄',
            '&suphsol;': '⟉',
            '&suphsub;': '⫗',
            '&suplarr;': '⥻',
            '&supmult;': '⫂',
            '&supnE;': '⫌',
            '&supne;': '⊋',
            '&supplus;': '⫀',
            '&supset;': '⊃',
            '&supseteq;': '⊇',
            '&supseteqq;': '⫆',
            '&supsetneq;': '⊋',
            '&supsetneqq;': '⫌',
            '&supsim;': '⫈',
            '&supsub;': '⫔',
            '&supsup;': '⫖',
            '&swArr;': '⇙',
            '&swarhk;': '⤦',
            '&swarr;': '↙',
            '&swarrow;': '↙',
            '&swnwar;': '⤪',
            '&szlig': 'ß',
            '&szlig;': 'ß',
            '&target;': '⌖',
            '&tau;': 'τ',
            '&tbrk;': '⎴',
            '&tcaron;': 'ť',
            '&tcedil;': 'ţ',
            '&tcy;': 'т',
            '&tdot;': '⃛',
            '&telrec;': '⌕',
            '&tfr;': '𝔱',
            '&there4;': '∴',
            '&therefore;': '∴',
            '&theta;': 'θ',
            '&thetasym;': 'ϑ',
            '&thetav;': 'ϑ',
            '&thickapprox;': '≈',
            '&thicksim;': '∼',
            '&thinsp;': ' ',
            '&thkap;': '≈',
            '&thksim;': '∼',
            '&thorn': 'þ',
            '&thorn;': 'þ',
            '&tilde;': '˜',
            '&times': '×',
            '&times;': '×',
            '&timesb;': '⊠',
            '&timesbar;': '⨱',
            '&timesd;': '⨰',
            '&tint;': '∭',
            '&toea;': '⤨',
            '&top;': '⊤',
            '&topbot;': '⌶',
            '&topcir;': '⫱',
            '&topf;': '𝕥',
            '&topfork;': '⫚',
            '&tosa;': '⤩',
            '&tprime;': '‴',
            '&trade;': '™',
            '&triangle;': '▵',
            '&triangledown;': '▿',
            '&triangleleft;': '◃',
            '&trianglelefteq;': '⊴',
            '&triangleq;': '≜',
            '&triangleright;': '▹',
            '&trianglerighteq;': '⊵',
            '&tridot;': '◬',
            '&trie;': '≜',
            '&triminus;': '⨺',
            '&triplus;': '⨹',
            '&trisb;': '⧍',
            '&tritime;': '⨻',
            '&trpezium;': '⏢',
            '&tscr;': '𝓉',
            '&tscy;': 'ц',
            '&tshcy;': 'ћ',
            '&tstrok;': 'ŧ',
            '&twixt;': '≬',
            '&twoheadleftarrow;': '↞',
            '&twoheadrightarrow;': '↠',
            '&uArr;': '⇑',
            '&uHar;': '⥣',
            '&uacute': 'ú',
            '&uacute;': 'ú',
            '&uarr;': '↑',
            '&ubrcy;': 'ў',
            '&ubreve;': 'ŭ',
            '&ucirc': 'û',
            '&ucirc;': 'û',
            '&ucy;': 'у',
            '&udarr;': '⇅',
            '&udblac;': 'ű',
            '&udhar;': '⥮',
            '&ufisht;': '⥾',
            '&ufr;': '𝔲',
            '&ugrave': 'ù',
            '&ugrave;': 'ù',
            '&uharl;': '↿',
            '&uharr;': '↾',
            '&uhblk;': '▀',
            '&ulcorn;': '⌜',
            '&ulcorner;': '⌜',
            '&ulcrop;': '⌏',
            '&ultri;': '◸',
            '&umacr;': 'ū',
            '&uml': '¨',
            '&uml;': '¨',
            '&uogon;': 'ų',
            '&uopf;': '𝕦',
            '&uparrow;': '↑',
            '&updownarrow;': '↕',
            '&upharpoonleft;': '↿',
            '&upharpoonright;': '↾',
            '&uplus;': '⊎',
            '&upsi;': 'υ',
            '&upsih;': 'ϒ',
            '&upsilon;': 'υ',
            '&upuparrows;': '⇈',
            '&urcorn;': '⌝',
            '&urcorner;': '⌝',
            '&urcrop;': '⌎',
            '&uring;': 'ů',
            '&urtri;': '◹',
            '&uscr;': '𝓊',
            '&utdot;': '⋰',
            '&utilde;': 'ũ',
            '&utri;': '▵',
            '&utrif;': '▴',
            '&uuarr;': '⇈',
            '&uuml': 'ü',
            '&uuml;': 'ü',
            '&uwangle;': '⦧',
            '&vArr;': '⇕',
            '&vBar;': '⫨',
            '&vBarv;': '⫩',
            '&vDash;': '⊨',
            '&vangrt;': '⦜',
            '&varepsilon;': 'ϵ',
            '&varkappa;': 'ϰ',
            '&varnothing;': '∅',
            '&varphi;': 'ϕ',
            '&varpi;': 'ϖ',
            '&varpropto;': '∝',
            '&varr;': '↕',
            '&varrho;': 'ϱ',
            '&varsigma;': 'ς',
            '&varsubsetneq;': '⊊︀',
            '&varsubsetneqq;': '⫋︀',
            '&varsupsetneq;': '⊋︀',
            '&varsupsetneqq;': '⫌︀',
            '&vartheta;': 'ϑ',
            '&vartriangleleft;': '⊲',
            '&vartriangleright;': '⊳',
            '&vcy;': 'в',
            '&vdash;': '⊢',
            '&vee;': '∨',
            '&veebar;': '⊻',
            '&veeeq;': '≚',
            '&vellip;': '⋮',
            '&verbar;': '|',
            '&vert;': '|',
            '&vfr;': '𝔳',
            '&vltri;': '⊲',
            '&vnsub;': '⊂⃒',
            '&vnsup;': '⊃⃒',
            '&vopf;': '𝕧',
            '&vprop;': '∝',
            '&vrtri;': '⊳',
            '&vscr;': '𝓋',
            '&vsubnE;': '⫋︀',
            '&vsubne;': '⊊︀',
            '&vsupnE;': '⫌︀',
            '&vsupne;': '⊋︀',
            '&vzigzag;': '⦚',
            '&wcirc;': 'ŵ',
            '&wedbar;': '⩟',
            '&wedge;': '∧',
            '&wedgeq;': '≙',
            '&weierp;': '℘',
            '&wfr;': '𝔴',
            '&wopf;': '𝕨',
            '&wp;': '℘',
            '&wr;': '≀',
            '&wreath;': '≀',
            '&wscr;': '𝓌',
            '&xcap;': '⋂',
            '&xcirc;': '◯',
            '&xcup;': '⋃',
            '&xdtri;': '▽',
            '&xfr;': '𝔵',
            '&xhArr;': '⟺',
            '&xharr;': '⟷',
            '&xi;': 'ξ',
            '&xlArr;': '⟸',
            '&xlarr;': '⟵',
            '&xmap;': '⟼',
            '&xnis;': '⋻',
            '&xodot;': '⨀',
            '&xopf;': '𝕩',
            '&xoplus;': '⨁',
            '&xotime;': '⨂',
            '&xrArr;': '⟹',
            '&xrarr;': '⟶',
            '&xscr;': '𝓍',
            '&xsqcup;': '⨆',
            '&xuplus;': '⨄',
            '&xutri;': '△',
            '&xvee;': '⋁',
            '&xwedge;': '⋀',
            '&yacute': 'ý',
            '&yacute;': 'ý',
            '&yacy;': 'я',
            '&ycirc;': 'ŷ',
            '&ycy;': 'ы',
            '&yen': '¥',
            '&yen;': '¥',
            '&yfr;': '𝔶',
            '&yicy;': 'ї',
            '&yopf;': '𝕪',
            '&yscr;': '𝓎',
            '&yucy;': 'ю',
            '&yuml': 'ÿ',
            '&yuml;': 'ÿ',
            '&zacute;': 'ź',
            '&zcaron;': 'ž',
            '&zcy;': 'з',
            '&zdot;': 'ż',
            '&zeetrf;': 'ℨ',
            '&zeta;': 'ζ',
            '&zfr;': '𝔷',
            '&zhcy;': 'ж',
            '&zigrarr;': '⇝',
            '&zopf;': '𝕫',
            '&zscr;': '𝓏',
            '&zwj;': '‍',
            '&zwnj;': '‌'
          },
          characters: {
            Æ: '&AElig;',
            '&': '&amp;',
            Á: '&Aacute;',
            Ă: '&Abreve;',
            Â: '&Acirc;',
            А: '&Acy;',
            '𝔄': '&Afr;',
            À: '&Agrave;',
            Α: '&Alpha;',
            Ā: '&Amacr;',
            '⩓': '&And;',
            Ą: '&Aogon;',
            '𝔸': '&Aopf;',
            '⁡': '&af;',
            Å: '&angst;',
            '𝒜': '&Ascr;',
            '≔': '&coloneq;',
            Ã: '&Atilde;',
            Ä: '&Auml;',
            '∖': '&ssetmn;',
            '⫧': '&Barv;',
            '⌆': '&doublebarwedge;',
            Б: '&Bcy;',
            '∵': '&because;',
            ℬ: '&bernou;',
            Β: '&Beta;',
            '𝔅': '&Bfr;',
            '𝔹': '&Bopf;',
            '˘': '&breve;',
            '≎': '&bump;',
            Ч: '&CHcy;',
            '©': '&copy;',
            Ć: '&Cacute;',
            '⋒': '&Cap;',
            ⅅ: '&DD;',
            ℭ: '&Cfr;',
            Č: '&Ccaron;',
            Ç: '&Ccedil;',
            Ĉ: '&Ccirc;',
            '∰': '&Cconint;',
            Ċ: '&Cdot;',
            '¸': '&cedil;',
            '·': '&middot;',
            Χ: '&Chi;',
            '⊙': '&odot;',
            '⊖': '&ominus;',
            '⊕': '&oplus;',
            '⊗': '&otimes;',
            '∲': '&cwconint;',
            '”': '&rdquor;',
            '’': '&rsquor;',
            '∷': '&Proportion;',
            '⩴': '&Colone;',
            '≡': '&equiv;',
            '∯': '&DoubleContourIntegral;',
            '∮': '&oint;',
            ℂ: '&complexes;',
            '∐': '&coprod;',
            '∳': '&awconint;',
            '⨯': '&Cross;',
            '𝒞': '&Cscr;',
            '⋓': '&Cup;',
            '≍': '&asympeq;',
            '⤑': '&DDotrahd;',
            Ђ: '&DJcy;',
            Ѕ: '&DScy;',
            Џ: '&DZcy;',
            '‡': '&ddagger;',
            '↡': '&Darr;',
            '⫤': '&DoubleLeftTee;',
            Ď: '&Dcaron;',
            Д: '&Dcy;',
            '∇': '&nabla;',
            Δ: '&Delta;',
            '𝔇': '&Dfr;',
            '´': '&acute;',
            '˙': '&dot;',
            '˝': '&dblac;',
            '`': '&grave;',
            '˜': '&tilde;',
            '⋄': '&diamond;',
            ⅆ: '&dd;',
            '𝔻': '&Dopf;',
            '¨': '&uml;',
            '⃜': '&DotDot;',
            '≐': '&esdot;',
            '⇓': '&dArr;',
            '⇐': '&lArr;',
            '⇔': '&iff;',
            '⟸': '&xlArr;',
            '⟺': '&xhArr;',
            '⟹': '&xrArr;',
            '⇒': '&rArr;',
            '⊨': '&vDash;',
            '⇑': '&uArr;',
            '⇕': '&vArr;',
            '∥': '&spar;',
            '↓': '&downarrow;',
            '⤓': '&DownArrowBar;',
            '⇵': '&duarr;',
            '̑': '&DownBreve;',
            '⥐': '&DownLeftRightVector;',
            '⥞': '&DownLeftTeeVector;',
            '↽': '&lhard;',
            '⥖': '&DownLeftVectorBar;',
            '⥟': '&DownRightTeeVector;',
            '⇁': '&rightharpoondown;',
            '⥗': '&DownRightVectorBar;',
            '⊤': '&top;',
            '↧': '&mapstodown;',
            '𝒟': '&Dscr;',
            Đ: '&Dstrok;',
            Ŋ: '&ENG;',
            Ð: '&ETH;',
            É: '&Eacute;',
            Ě: '&Ecaron;',
            Ê: '&Ecirc;',
            Э: '&Ecy;',
            Ė: '&Edot;',
            '𝔈': '&Efr;',
            È: '&Egrave;',
            '∈': '&isinv;',
            Ē: '&Emacr;',
            '◻': '&EmptySmallSquare;',
            '▫': '&EmptyVerySmallSquare;',
            Ę: '&Eogon;',
            '𝔼': '&Eopf;',
            Ε: '&Epsilon;',
            '⩵': '&Equal;',
            '≂': '&esim;',
            '⇌': '&rlhar;',
            ℰ: '&expectation;',
            '⩳': '&Esim;',
            Η: '&Eta;',
            Ë: '&Euml;',
            '∃': '&exist;',
            ⅇ: '&exponentiale;',
            Ф: '&Fcy;',
            '𝔉': '&Ffr;',
            '◼': '&FilledSmallSquare;',
            '▪': '&squf;',
            '𝔽': '&Fopf;',
            '∀': '&forall;',
            ℱ: '&Fscr;',
            Ѓ: '&GJcy;',
            '>': '&gt;',
            Γ: '&Gamma;',
            Ϝ: '&Gammad;',
            Ğ: '&Gbreve;',
            Ģ: '&Gcedil;',
            Ĝ: '&Gcirc;',
            Г: '&Gcy;',
            Ġ: '&Gdot;',
            '𝔊': '&Gfr;',
            '⋙': '&ggg;',
            '𝔾': '&Gopf;',
            '≥': '&geq;',
            '⋛': '&gtreqless;',
            '≧': '&geqq;',
            '⪢': '&GreaterGreater;',
            '≷': '&gtrless;',
            '⩾': '&ges;',
            '≳': '&gtrsim;',
            '𝒢': '&Gscr;',
            '≫': '&gg;',
            Ъ: '&HARDcy;',
            ˇ: '&caron;',
            '^': '&Hat;',
            Ĥ: '&Hcirc;',
            ℌ: '&Poincareplane;',
            ℋ: '&hamilt;',
            ℍ: '&quaternions;',
            '─': '&boxh;',
            Ħ: '&Hstrok;',
            '≏': '&bumpeq;',
            Е: '&IEcy;',
            Ĳ: '&IJlig;',
            Ё: '&IOcy;',
            Í: '&Iacute;',
            Î: '&Icirc;',
            И: '&Icy;',
            İ: '&Idot;',
            ℑ: '&imagpart;',
            Ì: '&Igrave;',
            Ī: '&Imacr;',
            ⅈ: '&ii;',
            '∬': '&Int;',
            '∫': '&int;',
            '⋂': '&xcap;',
            '⁣': '&ic;',
            '⁢': '&it;',
            Į: '&Iogon;',
            '𝕀': '&Iopf;',
            Ι: '&Iota;',
            ℐ: '&imagline;',
            Ĩ: '&Itilde;',
            І: '&Iukcy;',
            Ï: '&Iuml;',
            Ĵ: '&Jcirc;',
            Й: '&Jcy;',
            '𝔍': '&Jfr;',
            '𝕁': '&Jopf;',
            '𝒥': '&Jscr;',
            Ј: '&Jsercy;',
            Є: '&Jukcy;',
            Х: '&KHcy;',
            Ќ: '&KJcy;',
            Κ: '&Kappa;',
            Ķ: '&Kcedil;',
            К: '&Kcy;',
            '𝔎': '&Kfr;',
            '𝕂': '&Kopf;',
            '𝒦': '&Kscr;',
            Љ: '&LJcy;',
            '<': '&lt;',
            Ĺ: '&Lacute;',
            Λ: '&Lambda;',
            '⟪': '&Lang;',
            ℒ: '&lagran;',
            '↞': '&twoheadleftarrow;',
            Ľ: '&Lcaron;',
            Ļ: '&Lcedil;',
            Л: '&Lcy;',
            '⟨': '&langle;',
            '←': '&slarr;',
            '⇤': '&larrb;',
            '⇆': '&lrarr;',
            '⌈': '&lceil;',
            '⟦': '&lobrk;',
            '⥡': '&LeftDownTeeVector;',
            '⇃': '&downharpoonleft;',
            '⥙': '&LeftDownVectorBar;',
            '⌊': '&lfloor;',
            '↔': '&leftrightarrow;',
            '⥎': '&LeftRightVector;',
            '⊣': '&dashv;',
            '↤': '&mapstoleft;',
            '⥚': '&LeftTeeVector;',
            '⊲': '&vltri;',
            '⧏': '&LeftTriangleBar;',
            '⊴': '&trianglelefteq;',
            '⥑': '&LeftUpDownVector;',
            '⥠': '&LeftUpTeeVector;',
            '↿': '&upharpoonleft;',
            '⥘': '&LeftUpVectorBar;',
            '↼': '&lharu;',
            '⥒': '&LeftVectorBar;',
            '⋚': '&lesseqgtr;',
            '≦': '&leqq;',
            '≶': '&lg;',
            '⪡': '&LessLess;',
            '⩽': '&les;',
            '≲': '&lsim;',
            '𝔏': '&Lfr;',
            '⋘': '&Ll;',
            '⇚': '&lAarr;',
            Ŀ: '&Lmidot;',
            '⟵': '&xlarr;',
            '⟷': '&xharr;',
            '⟶': '&xrarr;',
            '𝕃': '&Lopf;',
            '↙': '&swarrow;',
            '↘': '&searrow;',
            '↰': '&lsh;',
            Ł: '&Lstrok;',
            '≪': '&ll;',
            '⤅': '&Map;',
            М: '&Mcy;',
            ' ': '&MediumSpace;',
            ℳ: '&phmmat;',
            '𝔐': '&Mfr;',
            '∓': '&mp;',
            '𝕄': '&Mopf;',
            Μ: '&Mu;',
            Њ: '&NJcy;',
            Ń: '&Nacute;',
            Ň: '&Ncaron;',
            Ņ: '&Ncedil;',
            Н: '&Ncy;',
            '​': '&ZeroWidthSpace;',
            '\n': '&NewLine;',
            '𝔑': '&Nfr;',
            '⁠': '&NoBreak;',
            ' ': '&nbsp;',
            ℕ: '&naturals;',
            '⫬': '&Not;',
            '≢': '&nequiv;',
            '≭': '&NotCupCap;',
            '∦': '&nspar;',
            '∉': '&notinva;',
            '≠': '&ne;',
            '≂̸': '&nesim;',
            '∄': '&nexists;',
            '≯': '&ngtr;',
            '≱': '&ngeq;',
            '≧̸': '&ngeqq;',
            '≫̸': '&nGtv;',
            '≹': '&ntgl;',
            '⩾̸': '&nges;',
            '≵': '&ngsim;',
            '≎̸': '&nbump;',
            '≏̸': '&nbumpe;',
            '⋪': '&ntriangleleft;',
            '⧏̸': '&NotLeftTriangleBar;',
            '⋬': '&ntrianglelefteq;',
            '≮': '&nlt;',
            '≰': '&nleq;',
            '≸': '&ntlg;',
            '≪̸': '&nLtv;',
            '⩽̸': '&nles;',
            '≴': '&nlsim;',
            '⪢̸': '&NotNestedGreaterGreater;',
            '⪡̸': '&NotNestedLessLess;',
            '⊀': '&nprec;',
            '⪯̸': '&npreceq;',
            '⋠': '&nprcue;',
            '∌': '&notniva;',
            '⋫': '&ntriangleright;',
            '⧐̸': '&NotRightTriangleBar;',
            '⋭': '&ntrianglerighteq;',
            '⊏̸': '&NotSquareSubset;',
            '⋢': '&nsqsube;',
            '⊐̸': '&NotSquareSuperset;',
            '⋣': '&nsqsupe;',
            '⊂⃒': '&vnsub;',
            '⊈': '&nsubseteq;',
            '⊁': '&nsucc;',
            '⪰̸': '&nsucceq;',
            '⋡': '&nsccue;',
            '≿̸': '&NotSucceedsTilde;',
            '⊃⃒': '&vnsup;',
            '⊉': '&nsupseteq;',
            '≁': '&nsim;',
            '≄': '&nsimeq;',
            '≇': '&ncong;',
            '≉': '&napprox;',
            '∤': '&nsmid;',
            '𝒩': '&Nscr;',
            Ñ: '&Ntilde;',
            Ν: '&Nu;',
            Œ: '&OElig;',
            Ó: '&Oacute;',
            Ô: '&Ocirc;',
            О: '&Ocy;',
            Ő: '&Odblac;',
            '𝔒': '&Ofr;',
            Ò: '&Ograve;',
            Ō: '&Omacr;',
            Ω: '&ohm;',
            Ο: '&Omicron;',
            '𝕆': '&Oopf;',
            '“': '&ldquo;',
            '‘': '&lsquo;',
            '⩔': '&Or;',
            '𝒪': '&Oscr;',
            Ø: '&Oslash;',
            Õ: '&Otilde;',
            '⨷': '&Otimes;',
            Ö: '&Ouml;',
            '‾': '&oline;',
            '⏞': '&OverBrace;',
            '⎴': '&tbrk;',
            '⏜': '&OverParenthesis;',
            '∂': '&part;',
            П: '&Pcy;',
            '𝔓': '&Pfr;',
            Φ: '&Phi;',
            Π: '&Pi;',
            '±': '&pm;',
            ℙ: '&primes;',
            '⪻': '&Pr;',
            '≺': '&prec;',
            '⪯': '&preceq;',
            '≼': '&preccurlyeq;',
            '≾': '&prsim;',
            '″': '&Prime;',
            '∏': '&prod;',
            '∝': '&vprop;',
            '𝒫': '&Pscr;',
            Ψ: '&Psi;',
            '"': '&quot;',
            '𝔔': '&Qfr;',
            ℚ: '&rationals;',
            '𝒬': '&Qscr;',
            '⤐': '&drbkarow;',
            '®': '&reg;',
            Ŕ: '&Racute;',
            '⟫': '&Rang;',
            '↠': '&twoheadrightarrow;',
            '⤖': '&Rarrtl;',
            Ř: '&Rcaron;',
            Ŗ: '&Rcedil;',
            Р: '&Rcy;',
            ℜ: '&realpart;',
            '∋': '&niv;',
            '⇋': '&lrhar;',
            '⥯': '&duhar;',
            Ρ: '&Rho;',
            '⟩': '&rangle;',
            '→': '&srarr;',
            '⇥': '&rarrb;',
            '⇄': '&rlarr;',
            '⌉': '&rceil;',
            '⟧': '&robrk;',
            '⥝': '&RightDownTeeVector;',
            '⇂': '&downharpoonright;',
            '⥕': '&RightDownVectorBar;',
            '⌋': '&rfloor;',
            '⊢': '&vdash;',
            '↦': '&mapsto;',
            '⥛': '&RightTeeVector;',
            '⊳': '&vrtri;',
            '⧐': '&RightTriangleBar;',
            '⊵': '&trianglerighteq;',
            '⥏': '&RightUpDownVector;',
            '⥜': '&RightUpTeeVector;',
            '↾': '&upharpoonright;',
            '⥔': '&RightUpVectorBar;',
            '⇀': '&rightharpoonup;',
            '⥓': '&RightVectorBar;',
            ℝ: '&reals;',
            '⥰': '&RoundImplies;',
            '⇛': '&rAarr;',
            ℛ: '&realine;',
            '↱': '&rsh;',
            '⧴': '&RuleDelayed;',
            Щ: '&SHCHcy;',
            Ш: '&SHcy;',
            Ь: '&SOFTcy;',
            Ś: '&Sacute;',
            '⪼': '&Sc;',
            Š: '&Scaron;',
            Ş: '&Scedil;',
            Ŝ: '&Scirc;',
            С: '&Scy;',
            '𝔖': '&Sfr;',
            '↑': '&uparrow;',
            Σ: '&Sigma;',
            '∘': '&compfn;',
            '𝕊': '&Sopf;',
            '√': '&radic;',
            '□': '&square;',
            '⊓': '&sqcap;',
            '⊏': '&sqsubset;',
            '⊑': '&sqsubseteq;',
            '⊐': '&sqsupset;',
            '⊒': '&sqsupseteq;',
            '⊔': '&sqcup;',
            '𝒮': '&Sscr;',
            '⋆': '&sstarf;',
            '⋐': '&Subset;',
            '⊆': '&subseteq;',
            '≻': '&succ;',
            '⪰': '&succeq;',
            '≽': '&succcurlyeq;',
            '≿': '&succsim;',
            '∑': '&sum;',
            '⋑': '&Supset;',
            '⊃': '&supset;',
            '⊇': '&supseteq;',
            Þ: '&THORN;',
            '™': '&trade;',
            Ћ: '&TSHcy;',
            Ц: '&TScy;',
            '\t': '&Tab;',
            Τ: '&Tau;',
            Ť: '&Tcaron;',
            Ţ: '&Tcedil;',
            Т: '&Tcy;',
            '𝔗': '&Tfr;',
            '∴': '&therefore;',
            Θ: '&Theta;',
            '  ': '&ThickSpace;',
            ' ': '&thinsp;',
            '∼': '&thksim;',
            '≃': '&simeq;',
            '≅': '&cong;',
            '≈': '&thkap;',
            '𝕋': '&Topf;',
            '⃛': '&tdot;',
            '𝒯': '&Tscr;',
            Ŧ: '&Tstrok;',
            Ú: '&Uacute;',
            '↟': '&Uarr;',
            '⥉': '&Uarrocir;',
            Ў: '&Ubrcy;',
            Ŭ: '&Ubreve;',
            Û: '&Ucirc;',
            У: '&Ucy;',
            Ű: '&Udblac;',
            '𝔘': '&Ufr;',
            Ù: '&Ugrave;',
            Ū: '&Umacr;',
            _: '&lowbar;',
            '⏟': '&UnderBrace;',
            '⎵': '&bbrk;',
            '⏝': '&UnderParenthesis;',
            '⋃': '&xcup;',
            '⊎': '&uplus;',
            Ų: '&Uogon;',
            '𝕌': '&Uopf;',
            '⤒': '&UpArrowBar;',
            '⇅': '&udarr;',
            '↕': '&varr;',
            '⥮': '&udhar;',
            '⊥': '&perp;',
            '↥': '&mapstoup;',
            '↖': '&nwarrow;',
            '↗': '&nearrow;',
            ϒ: '&upsih;',
            Υ: '&Upsilon;',
            Ů: '&Uring;',
            '𝒰': '&Uscr;',
            Ũ: '&Utilde;',
            Ü: '&Uuml;',
            '⊫': '&VDash;',
            '⫫': '&Vbar;',
            В: '&Vcy;',
            '⊩': '&Vdash;',
            '⫦': '&Vdashl;',
            '⋁': '&xvee;',
            '‖': '&Vert;',
            '∣': '&smid;',
            '|': '&vert;',
            '❘': '&VerticalSeparator;',
            '≀': '&wreath;',
            ' ': '&hairsp;',
            '𝔙': '&Vfr;',
            '𝕍': '&Vopf;',
            '𝒱': '&Vscr;',
            '⊪': '&Vvdash;',
            Ŵ: '&Wcirc;',
            '⋀': '&xwedge;',
            '𝔚': '&Wfr;',
            '𝕎': '&Wopf;',
            '𝒲': '&Wscr;',
            '𝔛': '&Xfr;',
            Ξ: '&Xi;',
            '𝕏': '&Xopf;',
            '𝒳': '&Xscr;',
            Я: '&YAcy;',
            Ї: '&YIcy;',
            Ю: '&YUcy;',
            Ý: '&Yacute;',
            Ŷ: '&Ycirc;',
            Ы: '&Ycy;',
            '𝔜': '&Yfr;',
            '𝕐': '&Yopf;',
            '𝒴': '&Yscr;',
            Ÿ: '&Yuml;',
            Ж: '&ZHcy;',
            Ź: '&Zacute;',
            Ž: '&Zcaron;',
            З: '&Zcy;',
            Ż: '&Zdot;',
            Ζ: '&Zeta;',
            ℨ: '&zeetrf;',
            ℤ: '&integers;',
            '𝒵': '&Zscr;',
            á: '&aacute;',
            ă: '&abreve;',
            '∾': '&mstpos;',
            '∾̳': '&acE;',
            '∿': '&acd;',
            â: '&acirc;',
            а: '&acy;',
            æ: '&aelig;',
            '𝔞': '&afr;',
            à: '&agrave;',
            ℵ: '&aleph;',
            α: '&alpha;',
            ā: '&amacr;',
            '⨿': '&amalg;',
            '∧': '&wedge;',
            '⩕': '&andand;',
            '⩜': '&andd;',
            '⩘': '&andslope;',
            '⩚': '&andv;',
            '∠': '&angle;',
            '⦤': '&ange;',
            '∡': '&measuredangle;',
            '⦨': '&angmsdaa;',
            '⦩': '&angmsdab;',
            '⦪': '&angmsdac;',
            '⦫': '&angmsdad;',
            '⦬': '&angmsdae;',
            '⦭': '&angmsdaf;',
            '⦮': '&angmsdag;',
            '⦯': '&angmsdah;',
            '∟': '&angrt;',
            '⊾': '&angrtvb;',
            '⦝': '&angrtvbd;',
            '∢': '&angsph;',
            '⍼': '&angzarr;',
            ą: '&aogon;',
            '𝕒': '&aopf;',
            '⩰': '&apE;',
            '⩯': '&apacir;',
            '≊': '&approxeq;',
            '≋': '&apid;',
            "'": '&apos;',
            å: '&aring;',
            '𝒶': '&ascr;',
            '*': '&midast;',
            ã: '&atilde;',
            ä: '&auml;',
            '⨑': '&awint;',
            '⫭': '&bNot;',
            '≌': '&bcong;',
            '϶': '&bepsi;',
            '‵': '&bprime;',
            '∽': '&bsim;',
            '⋍': '&bsime;',
            '⊽': '&barvee;',
            '⌅': '&barwedge;',
            '⎶': '&bbrktbrk;',
            б: '&bcy;',
            '„': '&ldquor;',
            '⦰': '&bemptyv;',
            β: '&beta;',
            ℶ: '&beth;',
            '≬': '&twixt;',
            '𝔟': '&bfr;',
            '◯': '&xcirc;',
            '⨀': '&xodot;',
            '⨁': '&xoplus;',
            '⨂': '&xotime;',
            '⨆': '&xsqcup;',
            '★': '&starf;',
            '▽': '&xdtri;',
            '△': '&xutri;',
            '⨄': '&xuplus;',
            '⤍': '&rbarr;',
            '⧫': '&lozf;',
            '▴': '&utrif;',
            '▾': '&dtrif;',
            '◂': '&ltrif;',
            '▸': '&rtrif;',
            '␣': '&blank;',
            '▒': '&blk12;',
            '░': '&blk14;',
            '▓': '&blk34;',
            '█': '&block;',
            '=⃥': '&bne;',
            '≡⃥': '&bnequiv;',
            '⌐': '&bnot;',
            '𝕓': '&bopf;',
            '⋈': '&bowtie;',
            '╗': '&boxDL;',
            '╔': '&boxDR;',
            '╖': '&boxDl;',
            '╓': '&boxDr;',
            '═': '&boxH;',
            '╦': '&boxHD;',
            '╩': '&boxHU;',
            '╤': '&boxHd;',
            '╧': '&boxHu;',
            '╝': '&boxUL;',
            '╚': '&boxUR;',
            '╜': '&boxUl;',
            '╙': '&boxUr;',
            '║': '&boxV;',
            '╬': '&boxVH;',
            '╣': '&boxVL;',
            '╠': '&boxVR;',
            '╫': '&boxVh;',
            '╢': '&boxVl;',
            '╟': '&boxVr;',
            '⧉': '&boxbox;',
            '╕': '&boxdL;',
            '╒': '&boxdR;',
            '┐': '&boxdl;',
            '┌': '&boxdr;',
            '╥': '&boxhD;',
            '╨': '&boxhU;',
            '┬': '&boxhd;',
            '┴': '&boxhu;',
            '⊟': '&minusb;',
            '⊞': '&plusb;',
            '⊠': '&timesb;',
            '╛': '&boxuL;',
            '╘': '&boxuR;',
            '┘': '&boxul;',
            '└': '&boxur;',
            '│': '&boxv;',
            '╪': '&boxvH;',
            '╡': '&boxvL;',
            '╞': '&boxvR;',
            '┼': '&boxvh;',
            '┤': '&boxvl;',
            '├': '&boxvr;',
            '¦': '&brvbar;',
            '𝒷': '&bscr;',
            '⁏': '&bsemi;',
            '\\': '&bsol;',
            '⧅': '&bsolb;',
            '⟈': '&bsolhsub;',
            '•': '&bullet;',
            '⪮': '&bumpE;',
            ć: '&cacute;',
            '∩': '&cap;',
            '⩄': '&capand;',
            '⩉': '&capbrcup;',
            '⩋': '&capcap;',
            '⩇': '&capcup;',
            '⩀': '&capdot;',
            '∩︀': '&caps;',
            '⁁': '&caret;',
            '⩍': '&ccaps;',
            č: '&ccaron;',
            ç: '&ccedil;',
            ĉ: '&ccirc;',
            '⩌': '&ccups;',
            '⩐': '&ccupssm;',
            ċ: '&cdot;',
            '⦲': '&cemptyv;',
            '¢': '&cent;',
            '𝔠': '&cfr;',
            ч: '&chcy;',
            '✓': '&checkmark;',
            χ: '&chi;',
            '○': '&cir;',
            '⧃': '&cirE;',
            ˆ: '&circ;',
            '≗': '&cire;',
            '↺': '&olarr;',
            '↻': '&orarr;',
            'Ⓢ': '&oS;',
            '⊛': '&oast;',
            '⊚': '&ocir;',
            '⊝': '&odash;',
            '⨐': '&cirfnint;',
            '⫯': '&cirmid;',
            '⧂': '&cirscir;',
            '♣': '&clubsuit;',
            ':': '&colon;',
            ',': '&comma;',
            '@': '&commat;',
            '∁': '&complement;',
            '⩭': '&congdot;',
            '𝕔': '&copf;',
            '℗': '&copysr;',
            '↵': '&crarr;',
            '✗': '&cross;',
            '𝒸': '&cscr;',
            '⫏': '&csub;',
            '⫑': '&csube;',
            '⫐': '&csup;',
            '⫒': '&csupe;',
            '⋯': '&ctdot;',
            '⤸': '&cudarrl;',
            '⤵': '&cudarrr;',
            '⋞': '&curlyeqprec;',
            '⋟': '&curlyeqsucc;',
            '↶': '&curvearrowleft;',
            '⤽': '&cularrp;',
            '∪': '&cup;',
            '⩈': '&cupbrcap;',
            '⩆': '&cupcap;',
            '⩊': '&cupcup;',
            '⊍': '&cupdot;',
            '⩅': '&cupor;',
            '∪︀': '&cups;',
            '↷': '&curvearrowright;',
            '⤼': '&curarrm;',
            '⋎': '&cuvee;',
            '⋏': '&cuwed;',
            '¤': '&curren;',
            '∱': '&cwint;',
            '⌭': '&cylcty;',
            '⥥': '&dHar;',
            '†': '&dagger;',
            ℸ: '&daleth;',
            '‐': '&hyphen;',
            '⤏': '&rBarr;',
            ď: '&dcaron;',
            д: '&dcy;',
            '⇊': '&downdownarrows;',
            '⩷': '&eDDot;',
            '°': '&deg;',
            δ: '&delta;',
            '⦱': '&demptyv;',
            '⥿': '&dfisht;',
            '𝔡': '&dfr;',
            '♦': '&diams;',
            ϝ: '&gammad;',
            '⋲': '&disin;',
            '÷': '&divide;',
            '⋇': '&divonx;',
            ђ: '&djcy;',
            '⌞': '&llcorner;',
            '⌍': '&dlcrop;',
            $: '&dollar;',
            '𝕕': '&dopf;',
            '≑': '&eDot;',
            '∸': '&minusd;',
            '∔': '&plusdo;',
            '⊡': '&sdotb;',
            '⌟': '&lrcorner;',
            '⌌': '&drcrop;',
            '𝒹': '&dscr;',
            ѕ: '&dscy;',
            '⧶': '&dsol;',
            đ: '&dstrok;',
            '⋱': '&dtdot;',
            '▿': '&triangledown;',
            '⦦': '&dwangle;',
            џ: '&dzcy;',
            '⟿': '&dzigrarr;',
            é: '&eacute;',
            '⩮': '&easter;',
            ě: '&ecaron;',
            '≖': '&eqcirc;',
            ê: '&ecirc;',
            '≕': '&eqcolon;',
            э: '&ecy;',
            ė: '&edot;',
            '≒': '&fallingdotseq;',
            '𝔢': '&efr;',
            '⪚': '&eg;',
            è: '&egrave;',
            '⪖': '&eqslantgtr;',
            '⪘': '&egsdot;',
            '⪙': '&el;',
            '⏧': '&elinters;',
            ℓ: '&ell;',
            '⪕': '&eqslantless;',
            '⪗': '&elsdot;',
            ē: '&emacr;',
            '∅': '&varnothing;',
            ' ': '&emsp13;',
            ' ': '&emsp14;',
            ' ': '&emsp;',
            ŋ: '&eng;',
            ' ': '&ensp;',
            ę: '&eogon;',
            '𝕖': '&eopf;',
            '⋕': '&epar;',
            '⧣': '&eparsl;',
            '⩱': '&eplus;',
            ε: '&epsilon;',
            ϵ: '&varepsilon;',
            '=': '&equals;',
            '≟': '&questeq;',
            '⩸': '&equivDD;',
            '⧥': '&eqvparsl;',
            '≓': '&risingdotseq;',
            '⥱': '&erarr;',
            ℯ: '&escr;',
            η: '&eta;',
            ð: '&eth;',
            ë: '&euml;',
            '€': '&euro;',
            '!': '&excl;',
            ф: '&fcy;',
            '♀': '&female;',
            ﬃ: '&ffilig;',
            ﬀ: '&fflig;',
            ﬄ: '&ffllig;',
            '𝔣': '&ffr;',
            ﬁ: '&filig;',
            fj: '&fjlig;',
            '♭': '&flat;',
            ﬂ: '&fllig;',
            '▱': '&fltns;',
            ƒ: '&fnof;',
            '𝕗': '&fopf;',
            '⋔': '&pitchfork;',
            '⫙': '&forkv;',
            '⨍': '&fpartint;',
            '½': '&half;',
            '⅓': '&frac13;',
            '¼': '&frac14;',
            '⅕': '&frac15;',
            '⅙': '&frac16;',
            '⅛': '&frac18;',
            '⅔': '&frac23;',
            '⅖': '&frac25;',
            '¾': '&frac34;',
            '⅗': '&frac35;',
            '⅜': '&frac38;',
            '⅘': '&frac45;',
            '⅚': '&frac56;',
            '⅝': '&frac58;',
            '⅞': '&frac78;',
            '⁄': '&frasl;',
            '⌢': '&sfrown;',
            '𝒻': '&fscr;',
            '⪌': '&gtreqqless;',
            ǵ: '&gacute;',
            γ: '&gamma;',
            '⪆': '&gtrapprox;',
            ğ: '&gbreve;',
            ĝ: '&gcirc;',
            г: '&gcy;',
            ġ: '&gdot;',
            '⪩': '&gescc;',
            '⪀': '&gesdot;',
            '⪂': '&gesdoto;',
            '⪄': '&gesdotol;',
            '⋛︀': '&gesl;',
            '⪔': '&gesles;',
            '𝔤': '&gfr;',
            ℷ: '&gimel;',
            ѓ: '&gjcy;',
            '⪒': '&glE;',
            '⪥': '&gla;',
            '⪤': '&glj;',
            '≩': '&gneqq;',
            '⪊': '&gnapprox;',
            '⪈': '&gneq;',
            '⋧': '&gnsim;',
            '𝕘': '&gopf;',
            ℊ: '&gscr;',
            '⪎': '&gsime;',
            '⪐': '&gsiml;',
            '⪧': '&gtcc;',
            '⩺': '&gtcir;',
            '⋗': '&gtrdot;',
            '⦕': '&gtlPar;',
            '⩼': '&gtquest;',
            '⥸': '&gtrarr;',
            '≩︀': '&gvnE;',
            ъ: '&hardcy;',
            '⥈': '&harrcir;',
            '↭': '&leftrightsquigarrow;',
            ℏ: '&plankv;',
            ĥ: '&hcirc;',
            '♥': '&heartsuit;',
            '…': '&mldr;',
            '⊹': '&hercon;',
            '𝔥': '&hfr;',
            '⤥': '&searhk;',
            '⤦': '&swarhk;',
            '⇿': '&hoarr;',
            '∻': '&homtht;',
            '↩': '&larrhk;',
            '↪': '&rarrhk;',
            '𝕙': '&hopf;',
            '―': '&horbar;',
            '𝒽': '&hscr;',
            ħ: '&hstrok;',
            '⁃': '&hybull;',
            í: '&iacute;',
            î: '&icirc;',
            и: '&icy;',
            е: '&iecy;',
            '¡': '&iexcl;',
            '𝔦': '&ifr;',
            ì: '&igrave;',
            '⨌': '&qint;',
            '∭': '&tint;',
            '⧜': '&iinfin;',
            '℩': '&iiota;',
            ĳ: '&ijlig;',
            ī: '&imacr;',
            ı: '&inodot;',
            '⊷': '&imof;',
            Ƶ: '&imped;',
            '℅': '&incare;',
            '∞': '&infin;',
            '⧝': '&infintie;',
            '⊺': '&intercal;',
            '⨗': '&intlarhk;',
            '⨼': '&iprod;',
            ё: '&iocy;',
            į: '&iogon;',
            '𝕚': '&iopf;',
            ι: '&iota;',
            '¿': '&iquest;',
            '𝒾': '&iscr;',
            '⋹': '&isinE;',
            '⋵': '&isindot;',
            '⋴': '&isins;',
            '⋳': '&isinsv;',
            ĩ: '&itilde;',
            і: '&iukcy;',
            ï: '&iuml;',
            ĵ: '&jcirc;',
            й: '&jcy;',
            '𝔧': '&jfr;',
            ȷ: '&jmath;',
            '𝕛': '&jopf;',
            '𝒿': '&jscr;',
            ј: '&jsercy;',
            є: '&jukcy;',
            κ: '&kappa;',
            ϰ: '&varkappa;',
            ķ: '&kcedil;',
            к: '&kcy;',
            '𝔨': '&kfr;',
            ĸ: '&kgreen;',
            х: '&khcy;',
            ќ: '&kjcy;',
            '𝕜': '&kopf;',
            '𝓀': '&kscr;',
            '⤛': '&lAtail;',
            '⤎': '&lBarr;',
            '⪋': '&lesseqqgtr;',
            '⥢': '&lHar;',
            ĺ: '&lacute;',
            '⦴': '&laemptyv;',
            λ: '&lambda;',
            '⦑': '&langd;',
            '⪅': '&lessapprox;',
            '«': '&laquo;',
            '⤟': '&larrbfs;',
            '⤝': '&larrfs;',
            '↫': '&looparrowleft;',
            '⤹': '&larrpl;',
            '⥳': '&larrsim;',
            '↢': '&leftarrowtail;',
            '⪫': '&lat;',
            '⤙': '&latail;',
            '⪭': '&late;',
            '⪭︀': '&lates;',
            '⤌': '&lbarr;',
            '❲': '&lbbrk;',
            '{': '&lcub;',
            '[': '&lsqb;',
            '⦋': '&lbrke;',
            '⦏': '&lbrksld;',
            '⦍': '&lbrkslu;',
            ľ: '&lcaron;',
            ļ: '&lcedil;',
            л: '&lcy;',
            '⤶': '&ldca;',
            '⥧': '&ldrdhar;',
            '⥋': '&ldrushar;',
            '↲': '&ldsh;',
            '≤': '&leq;',
            '⇇': '&llarr;',
            '⋋': '&lthree;',
            '⪨': '&lescc;',
            '⩿': '&lesdot;',
            '⪁': '&lesdoto;',
            '⪃': '&lesdotor;',
            '⋚︀': '&lesg;',
            '⪓': '&lesges;',
            '⋖': '&ltdot;',
            '⥼': '&lfisht;',
            '𝔩': '&lfr;',
            '⪑': '&lgE;',
            '⥪': '&lharul;',
            '▄': '&lhblk;',
            љ: '&ljcy;',
            '⥫': '&llhard;',
            '◺': '&lltri;',
            ŀ: '&lmidot;',
            '⎰': '&lmoustache;',
            '≨': '&lneqq;',
            '⪉': '&lnapprox;',
            '⪇': '&lneq;',
            '⋦': '&lnsim;',
            '⟬': '&loang;',
            '⇽': '&loarr;',
            '⟼': '&xmap;',
            '↬': '&rarrlp;',
            '⦅': '&lopar;',
            '𝕝': '&lopf;',
            '⨭': '&loplus;',
            '⨴': '&lotimes;',
            '∗': '&lowast;',
            '◊': '&lozenge;',
            '(': '&lpar;',
            '⦓': '&lparlt;',
            '⥭': '&lrhard;',
            '‎': '&lrm;',
            '⊿': '&lrtri;',
            '‹': '&lsaquo;',
            '𝓁': '&lscr;',
            '⪍': '&lsime;',
            '⪏': '&lsimg;',
            '‚': '&sbquo;',
            ł: '&lstrok;',
            '⪦': '&ltcc;',
            '⩹': '&ltcir;',
            '⋉': '&ltimes;',
            '⥶': '&ltlarr;',
            '⩻': '&ltquest;',
            '⦖': '&ltrPar;',
            '◃': '&triangleleft;',
            '⥊': '&lurdshar;',
            '⥦': '&luruhar;',
            '≨︀': '&lvnE;',
            '∺': '&mDDot;',
            '¯': '&strns;',
            '♂': '&male;',
            '✠': '&maltese;',
            '▮': '&marker;',
            '⨩': '&mcomma;',
            м: '&mcy;',
            '—': '&mdash;',
            '𝔪': '&mfr;',
            '℧': '&mho;',
            µ: '&micro;',
            '⫰': '&midcir;',
            '−': '&minus;',
            '⨪': '&minusdu;',
            '⫛': '&mlcp;',
            '⊧': '&models;',
            '𝕞': '&mopf;',
            '𝓂': '&mscr;',
            μ: '&mu;',
            '⊸': '&mumap;',
            '⋙̸': '&nGg;',
            '≫⃒': '&nGt;',
            '⇍': '&nlArr;',
            '⇎': '&nhArr;',
            '⋘̸': '&nLl;',
            '≪⃒': '&nLt;',
            '⇏': '&nrArr;',
            '⊯': '&nVDash;',
            '⊮': '&nVdash;',
            ń: '&nacute;',
            '∠⃒': '&nang;',
            '⩰̸': '&napE;',
            '≋̸': '&napid;',
            ŉ: '&napos;',
            '♮': '&natural;',
            '⩃': '&ncap;',
            ň: '&ncaron;',
            ņ: '&ncedil;',
            '⩭̸': '&ncongdot;',
            '⩂': '&ncup;',
            н: '&ncy;',
            '–': '&ndash;',
            '⇗': '&neArr;',
            '⤤': '&nearhk;',
            '≐̸': '&nedot;',
            '⤨': '&toea;',
            '𝔫': '&nfr;',
            '↮': '&nleftrightarrow;',
            '⫲': '&nhpar;',
            '⋼': '&nis;',
            '⋺': '&nisd;',
            њ: '&njcy;',
            '≦̸': '&nleqq;',
            '↚': '&nleftarrow;',
            '‥': '&nldr;',
            '𝕟': '&nopf;',
            '¬': '&not;',
            '⋹̸': '&notinE;',
            '⋵̸': '&notindot;',
            '⋷': '&notinvb;',
            '⋶': '&notinvc;',
            '⋾': '&notnivb;',
            '⋽': '&notnivc;',
            '⫽⃥': '&nparsl;',
            '∂̸': '&npart;',
            '⨔': '&npolint;',
            '↛': '&nrightarrow;',
            '⤳̸': '&nrarrc;',
            '↝̸': '&nrarrw;',
            '𝓃': '&nscr;',
            '⊄': '&nsub;',
            '⫅̸': '&nsubseteqq;',
            '⊅': '&nsup;',
            '⫆̸': '&nsupseteqq;',
            ñ: '&ntilde;',
            ν: '&nu;',
            '#': '&num;',
            '№': '&numero;',
            ' ': '&numsp;',
            '⊭': '&nvDash;',
            '⤄': '&nvHarr;',
            '≍⃒': '&nvap;',
            '⊬': '&nvdash;',
            '≥⃒': '&nvge;',
            '>⃒': '&nvgt;',
            '⧞': '&nvinfin;',
            '⤂': '&nvlArr;',
            '≤⃒': '&nvle;',
            '<⃒': '&nvlt;',
            '⊴⃒': '&nvltrie;',
            '⤃': '&nvrArr;',
            '⊵⃒': '&nvrtrie;',
            '∼⃒': '&nvsim;',
            '⇖': '&nwArr;',
            '⤣': '&nwarhk;',
            '⤧': '&nwnear;',
            ó: '&oacute;',
            ô: '&ocirc;',
            о: '&ocy;',
            ő: '&odblac;',
            '⨸': '&odiv;',
            '⦼': '&odsold;',
            œ: '&oelig;',
            '⦿': '&ofcir;',
            '𝔬': '&ofr;',
            '˛': '&ogon;',
            ò: '&ograve;',
            '⧁': '&ogt;',
            '⦵': '&ohbar;',
            '⦾': '&olcir;',
            '⦻': '&olcross;',
            '⧀': '&olt;',
            ō: '&omacr;',
            ω: '&omega;',
            ο: '&omicron;',
            '⦶': '&omid;',
            '𝕠': '&oopf;',
            '⦷': '&opar;',
            '⦹': '&operp;',
            '∨': '&vee;',
            '⩝': '&ord;',
            ℴ: '&oscr;',
            ª: '&ordf;',
            º: '&ordm;',
            '⊶': '&origof;',
            '⩖': '&oror;',
            '⩗': '&orslope;',
            '⩛': '&orv;',
            ø: '&oslash;',
            '⊘': '&osol;',
            õ: '&otilde;',
            '⨶': '&otimesas;',
            ö: '&ouml;',
            '⌽': '&ovbar;',
            '¶': '&para;',
            '⫳': '&parsim;',
            '⫽': '&parsl;',
            п: '&pcy;',
            '%': '&percnt;',
            '.': '&period;',
            '‰': '&permil;',
            '‱': '&pertenk;',
            '𝔭': '&pfr;',
            φ: '&phi;',
            ϕ: '&varphi;',
            '☎': '&phone;',
            π: '&pi;',
            ϖ: '&varpi;',
            ℎ: '&planckh;',
            '+': '&plus;',
            '⨣': '&plusacir;',
            '⨢': '&pluscir;',
            '⨥': '&plusdu;',
            '⩲': '&pluse;',
            '⨦': '&plussim;',
            '⨧': '&plustwo;',
            '⨕': '&pointint;',
            '𝕡': '&popf;',
            '£': '&pound;',
            '⪳': '&prE;',
            '⪷': '&precapprox;',
            '⪹': '&prnap;',
            '⪵': '&prnE;',
            '⋨': '&prnsim;',
            '′': '&prime;',
            '⌮': '&profalar;',
            '⌒': '&profline;',
            '⌓': '&profsurf;',
            '⊰': '&prurel;',
            '𝓅': '&pscr;',
            ψ: '&psi;',
            ' ': '&puncsp;',
            '𝔮': '&qfr;',
            '𝕢': '&qopf;',
            '⁗': '&qprime;',
            '𝓆': '&qscr;',
            '⨖': '&quatint;',
            '?': '&quest;',
            '⤜': '&rAtail;',
            '⥤': '&rHar;',
            '∽̱': '&race;',
            ŕ: '&racute;',
            '⦳': '&raemptyv;',
            '⦒': '&rangd;',
            '⦥': '&range;',
            '»': '&raquo;',
            '⥵': '&rarrap;',
            '⤠': '&rarrbfs;',
            '⤳': '&rarrc;',
            '⤞': '&rarrfs;',
            '⥅': '&rarrpl;',
            '⥴': '&rarrsim;',
            '↣': '&rightarrowtail;',
            '↝': '&rightsquigarrow;',
            '⤚': '&ratail;',
            '∶': '&ratio;',
            '❳': '&rbbrk;',
            '}': '&rcub;',
            ']': '&rsqb;',
            '⦌': '&rbrke;',
            '⦎': '&rbrksld;',
            '⦐': '&rbrkslu;',
            ř: '&rcaron;',
            ŗ: '&rcedil;',
            р: '&rcy;',
            '⤷': '&rdca;',
            '⥩': '&rdldhar;',
            '↳': '&rdsh;',
            '▭': '&rect;',
            '⥽': '&rfisht;',
            '𝔯': '&rfr;',
            '⥬': '&rharul;',
            ρ: '&rho;',
            ϱ: '&varrho;',
            '⇉': '&rrarr;',
            '⋌': '&rthree;',
            '˚': '&ring;',
            '‏': '&rlm;',
            '⎱': '&rmoustache;',
            '⫮': '&rnmid;',
            '⟭': '&roang;',
            '⇾': '&roarr;',
            '⦆': '&ropar;',
            '𝕣': '&ropf;',
            '⨮': '&roplus;',
            '⨵': '&rotimes;',
            ')': '&rpar;',
            '⦔': '&rpargt;',
            '⨒': '&rppolint;',
            '›': '&rsaquo;',
            '𝓇': '&rscr;',
            '⋊': '&rtimes;',
            '▹': '&triangleright;',
            '⧎': '&rtriltri;',
            '⥨': '&ruluhar;',
            '℞': '&rx;',
            ś: '&sacute;',
            '⪴': '&scE;',
            '⪸': '&succapprox;',
            š: '&scaron;',
            ş: '&scedil;',
            ŝ: '&scirc;',
            '⪶': '&succneqq;',
            '⪺': '&succnapprox;',
            '⋩': '&succnsim;',
            '⨓': '&scpolint;',
            с: '&scy;',
            '⋅': '&sdot;',
            '⩦': '&sdote;',
            '⇘': '&seArr;',
            '§': '&sect;',
            ';': '&semi;',
            '⤩': '&tosa;',
            '✶': '&sext;',
            '𝔰': '&sfr;',
            '♯': '&sharp;',
            щ: '&shchcy;',
            ш: '&shcy;',
            '­': '&shy;',
            σ: '&sigma;',
            ς: '&varsigma;',
            '⩪': '&simdot;',
            '⪞': '&simg;',
            '⪠': '&simgE;',
            '⪝': '&siml;',
            '⪟': '&simlE;',
            '≆': '&simne;',
            '⨤': '&simplus;',
            '⥲': '&simrarr;',
            '⨳': '&smashp;',
            '⧤': '&smeparsl;',
            '⌣': '&ssmile;',
            '⪪': '&smt;',
            '⪬': '&smte;',
            '⪬︀': '&smtes;',
            ь: '&softcy;',
            '/': '&sol;',
            '⧄': '&solb;',
            '⌿': '&solbar;',
            '𝕤': '&sopf;',
            '♠': '&spadesuit;',
            '⊓︀': '&sqcaps;',
            '⊔︀': '&sqcups;',
            '𝓈': '&sscr;',
            '☆': '&star;',
            '⊂': '&subset;',
            '⫅': '&subseteqq;',
            '⪽': '&subdot;',
            '⫃': '&subedot;',
            '⫁': '&submult;',
            '⫋': '&subsetneqq;',
            '⊊': '&subsetneq;',
            '⪿': '&subplus;',
            '⥹': '&subrarr;',
            '⫇': '&subsim;',
            '⫕': '&subsub;',
            '⫓': '&subsup;',
            '♪': '&sung;',
            '¹': '&sup1;',
            '²': '&sup2;',
            '³': '&sup3;',
            '⫆': '&supseteqq;',
            '⪾': '&supdot;',
            '⫘': '&supdsub;',
            '⫄': '&supedot;',
            '⟉': '&suphsol;',
            '⫗': '&suphsub;',
            '⥻': '&suplarr;',
            '⫂': '&supmult;',
            '⫌': '&supsetneqq;',
            '⊋': '&supsetneq;',
            '⫀': '&supplus;',
            '⫈': '&supsim;',
            '⫔': '&supsub;',
            '⫖': '&supsup;',
            '⇙': '&swArr;',
            '⤪': '&swnwar;',
            ß: '&szlig;',
            '⌖': '&target;',
            τ: '&tau;',
            ť: '&tcaron;',
            ţ: '&tcedil;',
            т: '&tcy;',
            '⌕': '&telrec;',
            '𝔱': '&tfr;',
            θ: '&theta;',
            ϑ: '&vartheta;',
            þ: '&thorn;',
            '×': '&times;',
            '⨱': '&timesbar;',
            '⨰': '&timesd;',
            '⌶': '&topbot;',
            '⫱': '&topcir;',
            '𝕥': '&topf;',
            '⫚': '&topfork;',
            '‴': '&tprime;',
            '▵': '&utri;',
            '≜': '&trie;',
            '◬': '&tridot;',
            '⨺': '&triminus;',
            '⨹': '&triplus;',
            '⧍': '&trisb;',
            '⨻': '&tritime;',
            '⏢': '&trpezium;',
            '𝓉': '&tscr;',
            ц: '&tscy;',
            ћ: '&tshcy;',
            ŧ: '&tstrok;',
            '⥣': '&uHar;',
            ú: '&uacute;',
            ў: '&ubrcy;',
            ŭ: '&ubreve;',
            û: '&ucirc;',
            у: '&ucy;',
            ű: '&udblac;',
            '⥾': '&ufisht;',
            '𝔲': '&ufr;',
            ù: '&ugrave;',
            '▀': '&uhblk;',
            '⌜': '&ulcorner;',
            '⌏': '&ulcrop;',
            '◸': '&ultri;',
            ū: '&umacr;',
            ų: '&uogon;',
            '𝕦': '&uopf;',
            υ: '&upsilon;',
            '⇈': '&uuarr;',
            '⌝': '&urcorner;',
            '⌎': '&urcrop;',
            ů: '&uring;',
            '◹': '&urtri;',
            '𝓊': '&uscr;',
            '⋰': '&utdot;',
            ũ: '&utilde;',
            ü: '&uuml;',
            '⦧': '&uwangle;',
            '⫨': '&vBar;',
            '⫩': '&vBarv;',
            '⦜': '&vangrt;',
            '⊊︀': '&vsubne;',
            '⫋︀': '&vsubnE;',
            '⊋︀': '&vsupne;',
            '⫌︀': '&vsupnE;',
            в: '&vcy;',
            '⊻': '&veebar;',
            '≚': '&veeeq;',
            '⋮': '&vellip;',
            '𝔳': '&vfr;',
            '𝕧': '&vopf;',
            '𝓋': '&vscr;',
            '⦚': '&vzigzag;',
            ŵ: '&wcirc;',
            '⩟': '&wedbar;',
            '≙': '&wedgeq;',
            '℘': '&wp;',
            '𝔴': '&wfr;',
            '𝕨': '&wopf;',
            '𝓌': '&wscr;',
            '𝔵': '&xfr;',
            ξ: '&xi;',
            '⋻': '&xnis;',
            '𝕩': '&xopf;',
            '𝓍': '&xscr;',
            ý: '&yacute;',
            я: '&yacy;',
            ŷ: '&ycirc;',
            ы: '&ycy;',
            '¥': '&yen;',
            '𝔶': '&yfr;',
            ї: '&yicy;',
            '𝕪': '&yopf;',
            '𝓎': '&yscr;',
            ю: '&yucy;',
            ÿ: '&yuml;',
            ź: '&zacute;',
            ž: '&zcaron;',
            з: '&zcy;',
            ż: '&zdot;',
            ζ: '&zeta;',
            '𝔷': '&zfr;',
            ж: '&zhcy;',
            '⇝': '&zigrarr;',
            '𝕫': '&zopf;',
            '𝓏': '&zscr;',
            '‍': '&zwj;',
            '‌': '&zwnj;'
          }
        }
      }

      /***/
    },
    /* 17 */
    /***/ (__unused_webpack_module, exports) => {
      'use strict'
      Object.defineProperty(exports, '__esModule', { value: true })
      exports.numericUnicodeMap = {
        0: 65533,
        128: 8364,
        130: 8218,
        131: 402,
        132: 8222,
        133: 8230,
        134: 8224,
        135: 8225,
        136: 710,
        137: 8240,
        138: 352,
        139: 8249,
        140: 338,
        142: 381,
        145: 8216,
        146: 8217,
        147: 8220,
        148: 8221,
        149: 8226,
        150: 8211,
        151: 8212,
        152: 732,
        153: 8482,
        154: 353,
        155: 8250,
        156: 339,
        158: 382,
        159: 376
      }

      /***/
    },
    /* 18 */
    /***/ (__unused_webpack_module, exports) => {
      'use strict'
      Object.defineProperty(exports, '__esModule', { value: true })
      exports.fromCodePoint =
        String.fromCodePoint ||
        function (astralCodePoint) {
          return String.fromCharCode(
            Math.floor((astralCodePoint - 65536) / 1024) + 55296,
            ((astralCodePoint - 65536) % 1024) + 56320
          )
        }
      exports.getCodePoint = String.prototype.codePointAt
        ? function (input, position) {
            return input.codePointAt(position)
          }
        : function (input, position) {
            return (
              (input.charCodeAt(position) - 55296) * 1024 +
              input.charCodeAt(position + 1) -
              56320 +
              65536
            )
          }
      exports.highSurrogateFrom = 55296
      exports.highSurrogateTo = 56319

      /***/
    },
    /* 19 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* global __resourceQuery WorkerGlobalScope */

      // Send messages to the outside, so plugins can consume it.
      /**
       * @param {string} type
       * @param {any} [data]
       */
      function sendMsg(type, data) {
        if (
          typeof self !== 'undefined' &&
          (typeof WorkerGlobalScope === 'undefined' ||
            !(self instanceof WorkerGlobalScope))
        ) {
          self.postMessage(
            {
              type: 'webpack'.concat(type),
              data: data
            },
            '*'
          )
        }
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = sendMsg

      /***/
    },
    /* 20 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(21)
      /* harmony import */ var webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(
          webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_0__
        )
      /* harmony import */ var _log_js__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(7)

      /** @typedef {import("../index").Options} Options
/** @typedef {import("../index").Status} Status

/**
 * @param {Options} options
 * @param {Status} status
 */
      function reloadApp(_ref, status) {
        var hot = _ref.hot,
          liveReload = _ref.liveReload
        if (status.isUnloading) {
          return
        }
        var currentHash = status.currentHash,
          previousHash = status.previousHash
        var isInitial =
          currentHash.indexOf(/** @type {string} */ previousHash) >= 0
        if (isInitial) {
          return
        }

        /**
         * @param {Window} rootWindow
         * @param {number} intervalId
         */
        function applyReload(rootWindow, intervalId) {
          clearInterval(intervalId)
          _log_js__WEBPACK_IMPORTED_MODULE_1__.log.info(
            'App updated. Reloading...'
          )
          rootWindow.location.reload()
        }
        var search = self.location.search.toLowerCase()
        var allowToHot = search.indexOf('webpack-dev-server-hot=false') === -1
        var allowToLiveReload =
          search.indexOf('webpack-dev-server-live-reload=false') === -1
        if (hot && allowToHot) {
          _log_js__WEBPACK_IMPORTED_MODULE_1__.log.info('App hot update...')
          webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_0___default().emit(
            'webpackHotUpdate',
            status.currentHash
          )
          if (typeof self !== 'undefined' && self.window) {
            // broadcast update to window
            self.postMessage('webpackHotUpdate'.concat(status.currentHash), '*')
          }
        }
        // allow refreshing the page only if liveReload isn't disabled
        else if (liveReload && allowToLiveReload) {
          var rootWindow = self

          // use parent window for reload (in case we're in an iframe with no valid src)
          var intervalId = self.setInterval(function () {
            if (rootWindow.location.protocol !== 'about:') {
              // reload immediately if protocol is valid
              applyReload(rootWindow, intervalId)
            } else {
              rootWindow = rootWindow.parent
              if (rootWindow.parent === rootWindow) {
                // if parent equals current window we've reached the root which would continue forever, so trigger a reload anyways
                applyReload(rootWindow, intervalId)
              }
            }
          })
        }
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = reloadApp

      /***/
    },
    /* 21 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      var EventEmitter = __webpack_require__(22)
      module.exports = new EventEmitter()

      /***/
    },
    /* 22 */
    /***/ (module) => {
      'use strict'
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      var R = typeof Reflect === 'object' ? Reflect : null
      var ReflectApply =
        R && typeof R.apply === 'function'
          ? R.apply
          : function ReflectApply(target, receiver, args) {
              return Function.prototype.apply.call(target, receiver, args)
            }

      var ReflectOwnKeys
      if (R && typeof R.ownKeys === 'function') {
        ReflectOwnKeys = R.ownKeys
      } else if (Object.getOwnPropertySymbols) {
        ReflectOwnKeys = function ReflectOwnKeys(target) {
          return Object.getOwnPropertyNames(target).concat(
            Object.getOwnPropertySymbols(target)
          )
        }
      } else {
        ReflectOwnKeys = function ReflectOwnKeys(target) {
          return Object.getOwnPropertyNames(target)
        }
      }

      function ProcessEmitWarning(warning) {
        if (console && console.warn) console.warn(warning)
      }

      var NumberIsNaN =
        Number.isNaN ||
        function NumberIsNaN(value) {
          return value !== value
        }

      function EventEmitter() {
        EventEmitter.init.call(this)
      }
      module.exports = EventEmitter
      module.exports.once = once

      // Backwards-compat with node 0.10.x
      EventEmitter.EventEmitter = EventEmitter

      EventEmitter.prototype._events = undefined
      EventEmitter.prototype._eventsCount = 0
      EventEmitter.prototype._maxListeners = undefined

      // By default EventEmitters will print a warning if more than 10 listeners are
      // added to it. This is a useful default which helps finding memory leaks.
      var defaultMaxListeners = 10

      function checkListener(listener) {
        if (typeof listener !== 'function') {
          throw new TypeError(
            'The "listener" argument must be of type Function. Received type ' +
              typeof listener
          )
        }
      }

      Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
        enumerable: true,
        get: function () {
          return defaultMaxListeners
        },
        set: function (arg) {
          if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
            throw new RangeError(
              'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
                arg +
                '.'
            )
          }
          defaultMaxListeners = arg
        }
      })

      EventEmitter.init = function () {
        if (
          this._events === undefined ||
          this._events === Object.getPrototypeOf(this)._events
        ) {
          this._events = Object.create(null)
          this._eventsCount = 0
        }

        this._maxListeners = this._maxListeners || undefined
      }

      // Obviously not all Emitters should be limited to 10. This function allows
      // that to be increased. Set to zero for unlimited.
      EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
        if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
          throw new RangeError(
            'The value of "n" is out of range. It must be a non-negative number. Received ' +
              n +
              '.'
          )
        }
        this._maxListeners = n
        return this
      }

      function _getMaxListeners(that) {
        if (that._maxListeners === undefined)
          return EventEmitter.defaultMaxListeners
        return that._maxListeners
      }

      EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
        return _getMaxListeners(this)
      }

      EventEmitter.prototype.emit = function emit(type) {
        var args = []
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i])
        var doError = type === 'error'

        var events = this._events
        if (events !== undefined)
          doError = doError && events.error === undefined
        else if (!doError) return false

        // If there is no 'error' event listener then throw.
        if (doError) {
          var er
          if (args.length > 0) er = args[0]
          if (er instanceof Error) {
            // Note: The comments on the `throw` lines are intentional, they show
            // up in Node's output if this results in an unhandled exception.
            throw er // Unhandled 'error' event
          }
          // At least give some kind of context to the user
          var err = new Error(
            'Unhandled error.' + (er ? ' (' + er.message + ')' : '')
          )
          err.context = er
          throw err // Unhandled 'error' event
        }

        var handler = events[type]

        if (handler === undefined) return false

        if (typeof handler === 'function') {
          ReflectApply(handler, this, args)
        } else {
          var len = handler.length
          var listeners = arrayClone(handler, len)
          for (var i = 0; i < len; ++i) ReflectApply(listeners[i], this, args)
        }

        return true
      }

      function _addListener(target, type, listener, prepend) {
        var m
        var events
        var existing

        checkListener(listener)

        events = target._events
        if (events === undefined) {
          events = target._events = Object.create(null)
          target._eventsCount = 0
        } else {
          // To avoid recursion in the case that type === "newListener"! Before
          // adding it to the listeners, first emit "newListener".
          if (events.newListener !== undefined) {
            target.emit(
              'newListener',
              type,
              listener.listener ? listener.listener : listener
            )

            // Re-assign `events` because a newListener handler could have caused the
            // this._events to be assigned to a new object
            events = target._events
          }
          existing = events[type]
        }

        if (existing === undefined) {
          // Optimize the case of one listener. Don't need the extra array object.
          existing = events[type] = listener
          ++target._eventsCount
        } else {
          if (typeof existing === 'function') {
            // Adding the second element, need to change to array.
            existing = events[type] = prepend
              ? [listener, existing]
              : [existing, listener]
            // If we've already got an array, just append.
          } else if (prepend) {
            existing.unshift(listener)
          } else {
            existing.push(listener)
          }

          // Check for listener leak
          m = _getMaxListeners(target)
          if (m > 0 && existing.length > m && !existing.warned) {
            existing.warned = true
            // No error code for this since it is a Warning
            // eslint-disable-next-line no-restricted-syntax
            var w = new Error(
              'Possible EventEmitter memory leak detected. ' +
                existing.length +
                ' ' +
                String(type) +
                ' listeners ' +
                'added. Use emitter.setMaxListeners() to ' +
                'increase limit'
            )
            w.name = 'MaxListenersExceededWarning'
            w.emitter = target
            w.type = type
            w.count = existing.length
            ProcessEmitWarning(w)
          }
        }

        return target
      }

      EventEmitter.prototype.addListener = function addListener(
        type,
        listener
      ) {
        return _addListener(this, type, listener, false)
      }

      EventEmitter.prototype.on = EventEmitter.prototype.addListener

      EventEmitter.prototype.prependListener = function prependListener(
        type,
        listener
      ) {
        return _addListener(this, type, listener, true)
      }

      function onceWrapper() {
        if (!this.fired) {
          this.target.removeListener(this.type, this.wrapFn)
          this.fired = true
          if (arguments.length === 0) return this.listener.call(this.target)
          return this.listener.apply(this.target, arguments)
        }
      }

      function _onceWrap(target, type, listener) {
        var state = {
          fired: false,
          wrapFn: undefined,
          target: target,
          type: type,
          listener: listener
        }
        var wrapped = onceWrapper.bind(state)
        wrapped.listener = listener
        state.wrapFn = wrapped
        return wrapped
      }

      EventEmitter.prototype.once = function once(type, listener) {
        checkListener(listener)
        this.on(type, _onceWrap(this, type, listener))
        return this
      }

      EventEmitter.prototype.prependOnceListener = function prependOnceListener(
        type,
        listener
      ) {
        checkListener(listener)
        this.prependListener(type, _onceWrap(this, type, listener))
        return this
      }

      // Emits a 'removeListener' event if and only if the listener was removed.
      EventEmitter.prototype.removeListener = function removeListener(
        type,
        listener
      ) {
        var list, events, position, i, originalListener

        checkListener(listener)

        events = this._events
        if (events === undefined) return this

        list = events[type]
        if (list === undefined) return this

        if (list === listener || list.listener === listener) {
          if (--this._eventsCount === 0) this._events = Object.create(null)
          else {
            delete events[type]
            if (events.removeListener)
              this.emit('removeListener', type, list.listener || listener)
          }
        } else if (typeof list !== 'function') {
          position = -1

          for (i = list.length - 1; i >= 0; i--) {
            if (list[i] === listener || list[i].listener === listener) {
              originalListener = list[i].listener
              position = i
              break
            }
          }

          if (position < 0) return this

          if (position === 0) list.shift()
          else {
            spliceOne(list, position)
          }

          if (list.length === 1) events[type] = list[0]

          if (events.removeListener !== undefined)
            this.emit('removeListener', type, originalListener || listener)
        }

        return this
      }

      EventEmitter.prototype.off = EventEmitter.prototype.removeListener

      EventEmitter.prototype.removeAllListeners = function removeAllListeners(
        type
      ) {
        var listeners, events, i

        events = this._events
        if (events === undefined) return this

        // not listening for removeListener, no need to emit
        if (events.removeListener === undefined) {
          if (arguments.length === 0) {
            this._events = Object.create(null)
            this._eventsCount = 0
          } else if (events[type] !== undefined) {
            if (--this._eventsCount === 0) this._events = Object.create(null)
            else delete events[type]
          }
          return this
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(events)
          var key
          for (i = 0; i < keys.length; ++i) {
            key = keys[i]
            if (key === 'removeListener') continue
            this.removeAllListeners(key)
          }
          this.removeAllListeners('removeListener')
          this._events = Object.create(null)
          this._eventsCount = 0
          return this
        }

        listeners = events[type]

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners)
        } else if (listeners !== undefined) {
          // LIFO order
          for (i = listeners.length - 1; i >= 0; i--) {
            this.removeListener(type, listeners[i])
          }
        }

        return this
      }

      function _listeners(target, type, unwrap) {
        var events = target._events

        if (events === undefined) return []

        var evlistener = events[type]
        if (evlistener === undefined) return []

        if (typeof evlistener === 'function')
          return unwrap ? [evlistener.listener || evlistener] : [evlistener]

        return unwrap
          ? unwrapListeners(evlistener)
          : arrayClone(evlistener, evlistener.length)
      }

      EventEmitter.prototype.listeners = function listeners(type) {
        return _listeners(this, type, true)
      }

      EventEmitter.prototype.rawListeners = function rawListeners(type) {
        return _listeners(this, type, false)
      }

      EventEmitter.listenerCount = function (emitter, type) {
        if (typeof emitter.listenerCount === 'function') {
          return emitter.listenerCount(type)
        } else {
          return listenerCount.call(emitter, type)
        }
      }

      EventEmitter.prototype.listenerCount = listenerCount
      function listenerCount(type) {
        var events = this._events

        if (events !== undefined) {
          var evlistener = events[type]

          if (typeof evlistener === 'function') {
            return 1
          } else if (evlistener !== undefined) {
            return evlistener.length
          }
        }

        return 0
      }

      EventEmitter.prototype.eventNames = function eventNames() {
        return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : []
      }

      function arrayClone(arr, n) {
        var copy = new Array(n)
        for (var i = 0; i < n; ++i) copy[i] = arr[i]
        return copy
      }

      function spliceOne(list, index) {
        for (; index + 1 < list.length; index++) list[index] = list[index + 1]
        list.pop()
      }

      function unwrapListeners(arr) {
        var ret = new Array(arr.length)
        for (var i = 0; i < ret.length; ++i) {
          ret[i] = arr[i].listener || arr[i]
        }
        return ret
      }

      function once(emitter, name) {
        return new Promise(function (resolve, reject) {
          function errorListener(err) {
            emitter.removeListener(name, resolver)
            reject(err)
          }

          function resolver() {
            if (typeof emitter.removeListener === 'function') {
              emitter.removeListener('error', errorListener)
            }
            resolve([].slice.call(arguments))
          }

          eventTargetAgnosticAddListener(emitter, name, resolver, {
            once: true
          })
          if (name !== 'error') {
            addErrorHandlerIfEventEmitter(emitter, errorListener, {
              once: true
            })
          }
        })
      }

      function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
        if (typeof emitter.on === 'function') {
          eventTargetAgnosticAddListener(emitter, 'error', handler, flags)
        }
      }

      function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
        if (typeof emitter.on === 'function') {
          if (flags.once) {
            emitter.once(name, listener)
          } else {
            emitter.on(name, listener)
          }
        } else if (typeof emitter.addEventListener === 'function') {
          // EventTarget does not have `error` event semantics like Node
          // EventEmitters, we do not listen for `error` events here.
          emitter.addEventListener(name, function wrapListener(arg) {
            // IE does not have builtin `{ once: true }` support so we
            // have to do it manually.
            if (flags.once) {
              emitter.removeEventListener(name, wrapListener)
            }
            listener(arg)
          })
        } else {
          throw new TypeError(
            'The "emitter" argument must be of type EventEmitter. Received type ' +
              typeof emitter
          )
        }
      }

      /***/
    },
    /* 23 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /**
       * @param {{ protocol?: string, auth?: string, hostname?: string, port?: string, pathname?: string, search?: string, hash?: string, slashes?: boolean }} objURL
       * @returns {string}
       */
      function format(objURL) {
        var protocol = objURL.protocol || ''
        if (protocol && protocol.substr(-1) !== ':') {
          protocol += ':'
        }
        var auth = objURL.auth || ''
        if (auth) {
          auth = encodeURIComponent(auth)
          auth = auth.replace(/%3A/i, ':')
          auth += '@'
        }
        var host = ''
        if (objURL.hostname) {
          host =
            auth +
            (objURL.hostname.indexOf(':') === -1
              ? objURL.hostname
              : '['.concat(objURL.hostname, ']'))
          if (objURL.port) {
            host += ':'.concat(objURL.port)
          }
        }
        var pathname = objURL.pathname || ''
        if (objURL.slashes) {
          host = '//'.concat(host || '')
          if (pathname && pathname.charAt(0) !== '/') {
            pathname = '/'.concat(pathname)
          }
        } else if (!host) {
          host = ''
        }
        var search = objURL.search || ''
        if (search && search.charAt(0) !== '?') {
          search = '?'.concat(search)
        }
        var hash = objURL.hash || ''
        if (hash && hash.charAt(0) !== '#') {
          hash = '#'.concat(hash)
        }
        pathname = pathname.replace(
          /[?#]/g,
          /**
           * @param {string} match
           * @returns {string}
           */
          function (match) {
            return encodeURIComponent(match)
          }
        )
        search = search.replace('#', '%23')
        return ''
          .concat(protocol)
          .concat(host)
          .concat(pathname)
          .concat(search)
          .concat(hash)
      }

      /**
       * @param {URL & { fromCurrentScript?: boolean }} parsedURL
       * @returns {string}
       */
      function createSocketURL(parsedURL) {
        var hostname = parsedURL.hostname

        // Node.js module parses it as `::`
        // `new URL(urlString, [baseURLString])` parses it as '[::]'
        var isInAddrAny =
          hostname === '0.0.0.0' || hostname === '::' || hostname === '[::]'

        // why do we need this check?
        // hostname n/a for file protocol (example, when using electron, ionic)
        // see: https://github.com/webpack/webpack-dev-server/pull/384
        if (
          isInAddrAny &&
          self.location.hostname &&
          self.location.protocol.indexOf('http') === 0
        ) {
          hostname = self.location.hostname
        }
        var socketURLProtocol = parsedURL.protocol || self.location.protocol

        // When https is used in the app, secure web sockets are always necessary because the browser doesn't accept non-secure web sockets.
        if (
          socketURLProtocol === 'auto:' ||
          (hostname && isInAddrAny && self.location.protocol === 'https:')
        ) {
          socketURLProtocol = self.location.protocol
        }
        socketURLProtocol = socketURLProtocol.replace(
          /^(?:http|.+-extension|file)/i,
          'ws'
        )
        var socketURLAuth = ''

        // `new URL(urlString, [baseURLstring])` doesn't have `auth` property
        // Parse authentication credentials in case we need them
        if (parsedURL.username) {
          socketURLAuth = parsedURL.username

          // Since HTTP basic authentication does not allow empty username,
          // we only include password if the username is not empty.
          if (parsedURL.password) {
            // Result: <username>:<password>
            socketURLAuth = socketURLAuth.concat(':', parsedURL.password)
          }
        }

        // In case the host is a raw IPv6 address, it can be enclosed in
        // the brackets as the brackets are needed in the final URL string.
        // Need to remove those as url.format blindly adds its own set of brackets
        // if the host string contains colons. That would lead to non-working
        // double brackets (e.g. [[::]]) host
        //
        // All of these web socket url params are optionally passed in through resourceQuery,
        // so we need to fall back to the default if they are not provided
        var socketURLHostname = (
          hostname ||
          self.location.hostname ||
          'localhost'
        ).replace(/^\[(.*)\]$/, '$1')
        var socketURLPort = parsedURL.port
        if (!socketURLPort || socketURLPort === '0') {
          socketURLPort = self.location.port
        }

        // If path is provided it'll be passed in via the resourceQuery as a
        // query param so it has to be parsed out of the querystring in order for the
        // client to open the socket to the correct location.
        var socketURLPathname = '/ws'
        if (parsedURL.pathname && !parsedURL.fromCurrentScript) {
          socketURLPathname = parsedURL.pathname
        }
        return format({
          protocol: socketURLProtocol,
          auth: socketURLAuth,
          hostname: socketURLHostname,
          port: socketURLPort,
          pathname: socketURLPathname,
          slashes: true
        })
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
        createSocketURL

      /***/
    },
    /* 24 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      /*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
      /* globals __webpack_hash__ */
      if (true) {
        /** @type {undefined|string} */
        var lastHash
        var upToDate = function upToDate() {
          return (
            /** @type {string} */ (lastHash).indexOf(__webpack_require__.h()) >=
            0
          )
        }
        var log = __webpack_require__(1)
        var check = function check() {
          module.hot
            .check(true)
            .then(function (updatedModules) {
              if (!updatedModules) {
                log(
                  'warning',
                  '[HMR] Cannot find update. ' +
                    (typeof window !== 'undefined'
                      ? 'Need to do a full reload!'
                      : 'Please reload manually!')
                )
                log(
                  'warning',
                  '[HMR] (Probably because of restarting the webpack-dev-server)'
                )
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
                return
              }

              if (!upToDate()) {
                check()
              }

              __webpack_require__(25)(updatedModules, updatedModules)

              if (upToDate()) {
                log('info', '[HMR] App is up to date.')
              }
            })
            .catch(function (err) {
              var status = module.hot.status()
              if (['abort', 'fail'].indexOf(status) >= 0) {
                log(
                  'warning',
                  '[HMR] Cannot apply update. ' +
                    (typeof window !== 'undefined'
                      ? 'Need to do a full reload!'
                      : 'Please reload manually!')
                )
                log('warning', '[HMR] ' + log.formatError(err))
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
              } else {
                log('warning', '[HMR] Update failed: ' + log.formatError(err))
              }
            })
        }
        var hotEmitter = __webpack_require__(21)
        hotEmitter.on('webpackHotUpdate', function (currentHash) {
          lastHash = currentHash
          if (!upToDate() && module.hot.status() === 'idle') {
            log('info', '[HMR] Checking for updates on the server...')
            check()
          }
        })
        log('info', '[HMR] Waiting for update signal from WDS...')
      } else {
      }

      /***/
    },
    /* 25 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      /*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

      /**
       * @param {(string | number)[]} updatedModules updated modules
       * @param {(string | number)[] | null} renewedModules renewed modules
       */
      module.exports = function (updatedModules, renewedModules) {
        var unacceptedModules = updatedModules.filter(function (moduleId) {
          return renewedModules && renewedModules.indexOf(moduleId) < 0
        })
        var log = __webpack_require__(1)

        if (unacceptedModules.length > 0) {
          log(
            'warning',
            "[HMR] The following modules couldn't be hot updated: (They would need a full reload!)"
          )
          unacceptedModules.forEach(function (moduleId) {
            log('warning', '[HMR]  - ' + moduleId)
          })
        }

        if (!renewedModules || renewedModules.length === 0) {
          log('info', '[HMR] Nothing hot updated.')
        } else {
          log('info', '[HMR] Updated modules:')
          renewedModules.forEach(function (moduleId) {
            if (typeof moduleId === 'string' && moduleId.indexOf('!') !== -1) {
              var parts = moduleId.split('!')
              log.groupCollapsed('info', '[HMR]  - ' + parts.pop())
              log('info', '[HMR]  - ' + moduleId)
              log.groupEnd('info')
            } else {
              log('info', '[HMR]  - ' + moduleId)
            }
          })
          var numberIds = renewedModules.every(function (moduleId) {
            return typeof moduleId === 'number'
          })
          if (numberIds)
            log(
              'info',
              '[HMR] Consider using the optimization.moduleIds: "named" for module names.'
            )
        }
      }

      /***/
    },
    /* 26 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony import */ var _src__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(27)
      /* harmony import */ var _base_css__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(56)
      /*
       * Jet client-server communications:
       */

      const peer = new _src__WEBPACK_IMPORTED_MODULE_0__.Peer({
        url: 'ws://localhost:8081/'
      })
      const renderMessages = (messages) => {
        const messageContainer = document.getElementById('messages')
        while (messageContainer.firstChild) {
          messageContainer.removeChild(messageContainer.firstChild)
        }
        messages.value.forEach((message) => {
          const entry = document.createElement('li')
          entry.innerText = message
          messageContainer.appendChild(entry)
        })
      }
      const messageFetcher = new _src__WEBPACK_IMPORTED_MODULE_0__.Fetcher()
        .path('equals', 'chat/messages')
        .on('data', renderMessages)
      document
        .getElementById('message-form')
        .addEventListener('submit', function (event) {
          event.preventDefault()
          const messageInput = document.getElementById('message')
          const sendButton = document.getElementById('send')
          const message = messageInput.value
          messageInput.disabled = true
          sendButton.disabled = true
          peer
            .call('chat/append', {
              message: message
            })
            .then(function () {
              messageInput.disabled = false
              sendButton.disabled = false
              messageInput.value = ''
              messageInput.focus()
            })
        })
      document.getElementById('clear').addEventListener('click', () => {
        peer.call('chat/clear', [])
      })
      peer.connect().then(() => peer.fetch(messageFetcher))

      /***/
    },
    /* 27 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ CONNECTION_ERROR_CODE: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.CONNECTION_ERROR_CODE,
        /* harmony export */ ConnectionClosed: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.ConnectionClosed,
        /* harmony export */ ConnectionInUse: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.ConnectionInUse,
        /* harmony export */ Daemon: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.Daemon,
        /* harmony export */ FetchOnly: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.FetchOnly,
        /* harmony export */ Fetcher: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.Fetcher,
        /* harmony export */ INTERNAL_ERROR_CODE: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.INTERNAL_ERROR_CODE,
        /* harmony export */ INVALID_PARAMS_CODE: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.INVALID_PARAMS_CODE,
        /* harmony export */ INVALID_PATH: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.INVALID_PATH,
        /* harmony export */ INVALID_REQUEST: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.INVALID_REQUEST,
        /* harmony export */ InvalidArgument: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument,
        /* harmony export */ InvalidParamError: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.InvalidParamError,
        /* harmony export */ InvvalidCredentials: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.InvvalidCredentials,
        /* harmony export */ JSONRPCError: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.JSONRPCError,
        /* harmony export */ JsonRPC: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.JsonRPC,
        /* harmony export */ LogLevel: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.LogLevel,
        /* harmony export */ Logger: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.Logger,
        /* harmony export */ METHOD_NOT_FOUND: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.METHOD_NOT_FOUND,
        /* harmony export */ Method: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.Method,
        /* harmony export */ NO_ERROR_CODE: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.NO_ERROR_CODE,
        /* harmony export */ NotAuthorized: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.NotAuthorized,
        /* harmony export */ NotFound: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.NotFound,
        /* harmony export */ Occupied: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.Occupied,
        /* harmony export */ PARSE_ERROR_CODE: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.PARSE_ERROR_CODE,
        /* harmony export */ ParseError: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.ParseError,
        /* harmony export */ Peer: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.Peer,
        /* harmony export */ PeerTimeout: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.PeerTimeout,
        /* harmony export */ RESPONSE_TIMEOUT_CODE: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.RESPONSE_TIMEOUT_CODE,
        /* harmony export */ State: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.State,
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
        /* harmony export */ events: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.events,
        /* harmony export */ fetchSimpleId: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.fetchSimpleId,
        /* harmony export */ invalidMethod: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.invalidMethod,
        /* harmony export */ invalidRequest: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.invalidRequest,
        /* harmony export */ invalidState: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.invalidState,
        /* harmony export */ methodNotFoundError: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.methodNotFoundError,
        /* harmony export */ notAllowed: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.notAllowed,
        /* harmony export */ operators: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.operators,
        /* harmony export */ pathRules: () =>
          /* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.pathRules
        /* harmony export */
      })
      /* harmony import */ var _jet__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(28)

      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
        _jet__WEBPACK_IMPORTED_MODULE_0__

      /***/
    },
    /* 28 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ CONNECTION_ERROR_CODE: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.CONNECTION_ERROR_CODE,
        /* harmony export */ ConnectionClosed: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.ConnectionClosed,
        /* harmony export */ ConnectionInUse: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.ConnectionInUse,
        /* harmony export */ Daemon: () =>
          /* reexport safe */ _3_jet_daemon__WEBPACK_IMPORTED_MODULE_0__.Daemon,
        /* harmony export */ FetchOnly: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.FetchOnly,
        /* harmony export */ Fetcher: () =>
          /* reexport safe */ _3_jet_peer_fetcher__WEBPACK_IMPORTED_MODULE_4__.Fetcher,
        /* harmony export */ INTERNAL_ERROR_CODE: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.INTERNAL_ERROR_CODE,
        /* harmony export */ INVALID_PARAMS_CODE: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.INVALID_PARAMS_CODE,
        /* harmony export */ INVALID_PATH: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.INVALID_PATH,
        /* harmony export */ INVALID_REQUEST: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.INVALID_REQUEST,
        /* harmony export */ InvalidArgument: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.InvalidArgument,
        /* harmony export */ InvalidParamError: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.InvalidParamError,
        /* harmony export */ InvvalidCredentials: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.InvvalidCredentials,
        /* harmony export */ JSONRPCError: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.JSONRPCError,
        /* harmony export */ JsonRPC: () =>
          /* reexport safe */ _2_jsonrpc__WEBPACK_IMPORTED_MODULE_8__.JsonRPC,
        /* harmony export */ LogLevel: () =>
          /* reexport safe */ _3_jet_log__WEBPACK_IMPORTED_MODULE_7__.LogLevel,
        /* harmony export */ Logger: () =>
          /* reexport safe */ _3_jet_log__WEBPACK_IMPORTED_MODULE_7__.Logger,
        /* harmony export */ METHOD_NOT_FOUND: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.METHOD_NOT_FOUND,
        /* harmony export */ Method: () =>
          /* reexport safe */ _3_jet_peer_method__WEBPACK_IMPORTED_MODULE_3__.Method,
        /* harmony export */ NO_ERROR_CODE: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.NO_ERROR_CODE,
        /* harmony export */ NotAuthorized: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.NotAuthorized,
        /* harmony export */ NotFound: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.NotFound,
        /* harmony export */ Occupied: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.Occupied,
        /* harmony export */ PARSE_ERROR_CODE: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.PARSE_ERROR_CODE,
        /* harmony export */ ParseError: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.ParseError,
        /* harmony export */ Peer: () =>
          /* reexport safe */ _3_jet_peer__WEBPACK_IMPORTED_MODULE_1__.Peer,
        /* harmony export */ PeerTimeout: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.PeerTimeout,
        /* harmony export */ RESPONSE_TIMEOUT_CODE: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.RESPONSE_TIMEOUT_CODE,
        /* harmony export */ State: () =>
          /* reexport safe */ _3_jet_peer_state__WEBPACK_IMPORTED_MODULE_2__.State,
        /* harmony export */ events: () =>
          /* reexport safe */ _3_jet_types__WEBPACK_IMPORTED_MODULE_6__.events,
        /* harmony export */ fetchSimpleId: () =>
          /* reexport safe */ _3_jet_types__WEBPACK_IMPORTED_MODULE_6__.fetchSimpleId,
        /* harmony export */ invalidMethod: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.invalidMethod,
        /* harmony export */ invalidRequest: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.invalidRequest,
        /* harmony export */ invalidState: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.invalidState,
        /* harmony export */ methodNotFoundError: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.methodNotFoundError,
        /* harmony export */ notAllowed: () =>
          /* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.notAllowed,
        /* harmony export */ operators: () =>
          /* reexport safe */ _3_jet_types__WEBPACK_IMPORTED_MODULE_6__.operators,
        /* harmony export */ pathRules: () =>
          /* reexport safe */ _3_jet_types__WEBPACK_IMPORTED_MODULE_6__.pathRules
        /* harmony export */
      })
      /* harmony import */ var _3_jet_daemon__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(29)
      /* harmony import */ var _3_jet_peer__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(50)
      /* harmony import */ var _3_jet_peer_state__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(54)
      /* harmony import */ var _3_jet_peer_method__WEBPACK_IMPORTED_MODULE_3__ =
        __webpack_require__(55)
      /* harmony import */ var _3_jet_peer_fetcher__WEBPACK_IMPORTED_MODULE_4__ =
        __webpack_require__(51)
      /* harmony import */ var _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__ =
        __webpack_require__(33)
      /* harmony import */ var _3_jet_types__WEBPACK_IMPORTED_MODULE_6__ =
        __webpack_require__(34)
      /* harmony import */ var _3_jet_log__WEBPACK_IMPORTED_MODULE_7__ =
        __webpack_require__(30)
      /* harmony import */ var _2_jsonrpc__WEBPACK_IMPORTED_MODULE_8__ =
        __webpack_require__(42)

      /***/
    },
    /* 29 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Daemon: () => /* binding */ Daemon,
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var _log__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(30)
      /* harmony import */ var _path_matcher__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(32)
      /* harmony import */ var _subscription__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(35)
      /* harmony import */ var _route__WEBPACK_IMPORTED_MODULE_3__ =
        __webpack_require__(38)
      /* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_4__ =
        __webpack_require__(33)
      /* harmony import */ var _2_jsonrpc_server__WEBPACK_IMPORTED_MODULE_5__ =
        __webpack_require__(41)
      /* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_6__ =
        __webpack_require__(39)
      /* harmony import */ var _UserManager__WEBPACK_IMPORTED_MODULE_7__ =
        __webpack_require__(49)

      const version = '2.2.0'
      const defaultListenOptions = {
        tcpPort: 11122,
        wsPort: 11123
      }
      class InfoObject {
        name
        version
        protocolVersion
        features
        constructor(options, authenticate = false) {
          this.name = options.name || 'node-jet'
          this.version = version
          this.protocolVersion = '1.1.0'
          this.features = {
            batches: options.features?.batches || false,
            fetch: options.features?.fetch || 'full',
            asNotification: options.features?.asNotification || false,
            authenticate: authenticate
          }
        }
      }
      /**
       * Creates a Daemon instance
       *
       * In most cases you need one Jet Daemon instance running.
       * All Peers connect to it as in typical master(Daemon) slave(Peer)
       * architectures.
       *
       */
      class Daemon extends _1_socket__WEBPACK_IMPORTED_MODULE_6__.EventEmitter {
        infoObject
        log
        jsonRPCServer
        routes = {}
        subscriber = []
        authenticator
        /**
         * Constructor for creating the instance
         * @param {DaemonOptions & InfoOptions} [options] Options for the daemon creation
         */
        constructor(options = {}) {
          super()
          this.authenticator =
            new _UserManager__WEBPACK_IMPORTED_MODULE_7__.Authenticator(
              options.username,
              options.password
            )
          this.infoObject = new InfoObject(options, this.authenticator.enabled)
          this.log = new _log__WEBPACK_IMPORTED_MODULE_0__.Logger(options.log)
        }
        asNotification = () => this.infoObject.features.asNotification
        simpleFetch = () => this.infoObject.features.fetch === 'simple'
        respond = (peer, id) => {
          if (this.asNotification()) {
            peer.respond(id, {}, true)
            this.emit('notify')
          } else {
            this.emit('notify')
            peer.respond(id, {}, true)
          }
        }
        authenticate = (peer, id, params) => {
          if (this.authenticator.login(params.user, params.password)) {
            peer.user = params.user
            peer.respond(id, {}, true)
          } else {
            peer.respond(
              id,
              new _errors__WEBPACK_IMPORTED_MODULE_4__.InvvalidCredentials(
                params.user
              ),
              false
            )
          }
        }
        /*
    Add as Notification: The message is acknowledged,then all the peers are informed about the new state
    Add synchronous: First all Peers are informed about the new value then message is acknowledged
    */
        add = (peer, id, params) => {
          const path = params.path
          if (path in this.routes) {
            peer.respond(
              id,
              new _errors__WEBPACK_IMPORTED_MODULE_4__.Occupied(path),
              false
            )
            return
          }
          this.routes[path] = new _route__WEBPACK_IMPORTED_MODULE_3__.Route(
            peer,
            path,
            params.value,
            params.access
          )
          if (typeof params.value !== 'undefined') {
            this.subscriber.forEach((fetchRule) => {
              if (this.simpleFetch() || fetchRule.matchesPath(path)) {
                fetchRule.addRoute(this.routes[path])
              }
            })
          }
          this.respond(peer, id)
        }
        /*
    Change as Notification: The message is acknowledged,then all the peers are informed about the value change
    change synchronous: First all Peers are informed about the new value then the message is acknowledged
    */
        change = (peer, id, msg) => {
          if (msg.path in this.routes && typeof msg.value !== 'undefined') {
            this.routes[msg.path].updateValue(msg.value)
            this.respond(peer, id)
          } else {
            peer.respond(
              id,
              new _errors__WEBPACK_IMPORTED_MODULE_4__.NotFound(),
              false
            )
          }
        }
        /*
    Fetch as Notification: The message is acknowledged,then the peer is informed of all the states matching the fetchrule
    Fetch synchronous: First the peer is informed of all the states matching the fetchrule then the message is acknowledged
    */
        fetch = (peer, id, msg) => {
          if (
            this.simpleFetch() &&
            this.subscriber.find((sub) => sub.owner === peer)
          ) {
            peer.respond(
              id,
              new _errors__WEBPACK_IMPORTED_MODULE_4__.ConnectionInUse(
                'Only one fetcher per peer in simple fetch Mode'
              ),
              false
            )
            return
          }
          if (this.subscriber.find((sub) => sub.id === msg.id)) {
            peer.respond(
              id,
              new _errors__WEBPACK_IMPORTED_MODULE_4__.Occupied(
                'FetchId already in use'
              ),
              false
            )
            return
          }
          try {
            const sub =
              new _subscription__WEBPACK_IMPORTED_MODULE_2__.Subscription(
                msg,
                peer
              )
            this.addListener('notify', sub.send)
            this.subscriber.push(sub)
            sub.setRoutes(
              Object.values(this.routes).filter(
                (route) =>
                  this.routes[route.path].value !== undefined && //check if state
                  (this.simpleFetch() || sub.matchesPath(route.path)) //check if simpleFetch or pathrule matches
              )
            )
            this.respond(peer, id)
          } catch (err) {
            peer.respond(id, err, false)
          }
        }
        /*
    Unfetch synchronous: Unfetch fires and no more updates are send with the given fetch_id. Message is acknowledged
    */
        unfetch = (peer, id, params) => {
          const subIdx = this.subscriber.findIndex(
            (fetch) => fetch.id === params.id
          )
          if (subIdx < 0) {
            peer.respond(
              id,
              new _errors__WEBPACK_IMPORTED_MODULE_4__.NotFound(
                `No Subscription with id ${params.id} found`
              ),
              false
            )
            return
          }
          if (this.subscriber[subIdx].owner !== peer) {
            peer.respond(
              id,
              new _errors__WEBPACK_IMPORTED_MODULE_4__.notAllowed(
                `Peer does not own subscription with id ${params.id}`
              ),
              false
            )
            return
          }
          this.subscriber[subIdx].close()
          this.subscriber.splice(subIdx, 1)
          peer.respond(id, {}, true)
        }
        /*
    Get synchronous: Only synchronous implementation-> all the values are added to an array and send as response
    */
        get = (peer, id, params) => {
          try {
            const matcher = (0,
            _path_matcher__WEBPACK_IMPORTED_MODULE_1__.createPathMatcher)(
              params
            )
            const resp = Object.keys(this.routes)
              .filter(
                (route) =>
                  matcher(route) &&
                  this.authenticator.isAllowed(
                    'get',
                    peer.user,
                    this.routes[route].access
                  )
              )
              .map((route) => {
                return { path: route, value: this.routes[route].value }
              })
            peer.respond(id, resp, true)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (ex) {
            peer.respond(id, ex, false)
          }
        }
        /*
    remove synchronous: Only synchronous implementation-> state is removed then message is acknowledged
    */
        remove = (peer, id, params) => {
          const route = params.path
          if (!(route in this.routes)) {
            peer.respond(
              id,
              new _errors__WEBPACK_IMPORTED_MODULE_4__.NotFound(route),
              false
            )
            return
          }
          this.routes[route].remove()
          delete this.routes[route]
          this.respond(peer, id)
        }
        /*
    Call and Set requests: Call and set requests are always forwarded synchronous
    */
        forward = (method, params) => {
          if (!(params.path in this.routes)) {
            return Promise.reject(
              new _errors__WEBPACK_IMPORTED_MODULE_4__.NotFound(params.path)
            )
          }
          return this.routes[params.path].owner.sendRequest(
            method,
            params,
            true
          )
        }
        /*
    Info requests: Info requests are always synchronous
    */
        info = (peer, id) => {
          peer.respond(id, this.infoObject, true)
        }
        configure = (peer, id) => {
          peer.respond(id, {}, true)
        }
        filterRoutesByPeer = (peer) =>
          Object.entries(this.routes)
            .filter(([, route]) => route.owner === peer)
            .map((el) => el[0])
        /**
         * This function starts to listen on the specified port
         * @param listenOptions
         */
        listen = (listenOptions = defaultListenOptions) => {
          this.jsonRPCServer =
            new _2_jsonrpc_server__WEBPACK_IMPORTED_MODULE_5__.JsonRPCServer(
              this.log,
              listenOptions,
              this.infoObject.features.batches
            )
          this.jsonRPCServer.addListener('connection', (newPeer) => {
            this.log.info('Peer connected')
            newPeer.addListener('info', this.info)
            newPeer.addListener('configure', this.configure)
            newPeer.addListener('authenticate', this.authenticate)
            newPeer.addListener('add', this.add)
            newPeer.addListener('change', this.change)
            newPeer.addListener('remove', this.remove)
            newPeer.addListener('get', this.get)
            newPeer.addListener('fetch', this.fetch)
            newPeer.addListener('unfetch', this.unfetch)
            newPeer.addListener('set', (_peer, id, params) =>
              this.forward('set', params)
                .then((res) => {
                  newPeer.respond(id, res, true)
                  newPeer.send()
                })
                .catch((err) => {
                  newPeer.respond(id, err, false)
                  newPeer.send()
                })
            )
            newPeer.addListener('call', (_peer, id, params) =>
              this.forward('call', params)
                .then((res) => {
                  newPeer.respond(id, res, true)
                  newPeer.send()
                })
                .catch((err) => {
                  newPeer.respond(id, err, false)
                  newPeer.send()
                })
            )
          })
          this.jsonRPCServer.addListener('disconnect', (peer) => {
            this.filterRoutesByPeer(peer).forEach((route) => {
              this.log.warn('Removing route that was owned by peer')
              this.routes[route].remove()
              delete this.routes[route]
            })
            this.subscriber = this.subscriber.filter((fetcher) => {
              if (fetcher.owner !== peer) {
                return true
              }
              fetcher.close()
              return false
            })
          })
          this.jsonRPCServer.listen()
          this.log.info('Daemon started')
        }
        close = () => {
          this.jsonRPCServer.close()
        }
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = Daemon

      /***/
    },
    /* 30 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ LogLevel: () => /* binding */ LogLevel,
        /* harmony export */ Logger: () => /* binding */ Logger
        /* harmony export */
      })
      /* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(31)
      /* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__)

      var LogLevel
      ;(function (LogLevel) {
        LogLevel[(LogLevel['socket'] = 1)] = 'socket'
        LogLevel[(LogLevel['debug'] = 2)] = 'debug'
        LogLevel[(LogLevel['info'] = 3)] = 'info'
        LogLevel[(LogLevel['warn'] = 4)] = 'warn'
        LogLevel[(LogLevel['error'] = 5)] = 'error'
        LogLevel[(LogLevel['none'] = 6)] = 'none'
      })(LogLevel || (LogLevel = {}))
      /**
       * Logger class used for logging. Logging can be done to a file to the console or to any callback
       */
      class Logger {
        logName
        logLevel
        callBacks
        stream
        /**
         * Constructor to create a new Logger instance
         * @param settings
         */
        constructor(settings = { logName: 'None' }) {
          this.logName = settings.logName
          this.logLevel = settings.logLevel || LogLevel['none']
          this.callBacks = settings.logCallbacks
          if (settings.logFile) {
            this.stream = fs__WEBPACK_IMPORTED_MODULE_0__.createWriteStream(
              settings.logFile
            )
          }
        }
        /**
         * Function that transforms a message into a string of the format "<Date> <Time> <LogName> <LogLevel> <Message>"
         * @param msg
         * @param level
         * @returns string
         */
        stringBuilder(msg, level) {
          const date = new Date(Date.now())
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}\t${
            this.logName
          }\t${LogLevel[level]}\t${msg}`
        }
        /**
         * Function called to log a message. Messages are only logged if the provided message log level is greater then the configured log level
         * @param msg
         * @param level
         * @returns string
         */
        log(msg, level = LogLevel.debug) {
          if (this.logLevel > level) {
            return
          }
          const logMessage = this.stringBuilder(msg, level)
          if (this.stream) {
            this.stream.write(logMessage)
            this.stream.write('\n')
          }
          if (this.callBacks) {
            this.callBacks.every((cb) => cb(logMessage))
          }
        }
        /**
         * Log a message on the socket level
         * @param msg
         */
        sock(msg) {
          this.log(msg, LogLevel.socket)
        }
        /**
         * Log a message on the debug level
         * @param msg
         */
        debug(msg) {
          this.log(msg, LogLevel.debug)
        }
        /**
         * Log a Info message
         * @param msg
         */
        info(msg) {
          this.log(msg, LogLevel.info)
        }
        /**
         * Log a warn message
         * @param msg
         */
        warn(msg) {
          this.log(msg, LogLevel.warn)
        }
        /**
         * Log an error message
         * @param msg
         */
        error(msg) {
          this.log(msg, LogLevel.error)
        }
        /**
         * Function that can be called to wait until the stream has completed to write everything
         */
        flush() {
          return new Promise((resolve) => {
            if (this.stream) {
              const interval = setInterval(() => {
                if (!this.stream || !this.stream.pending) {
                  clearInterval(interval)
                  resolve()
                }
              })
            }
          })
        }
        /**
         * Function to close the Logger and the fileStream in case any fileStream was used
         */
        close() {
          if (this.stream) {
            this.stream.end()
          }
        }
      }

      /***/
    },
    /* 31 */
    /***/ () => {
      /* (ignored) */
      /***/
    },
    /* 32 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ createPathMatcher: () =>
          /* binding */ createPathMatcher
        /* harmony export */
      })
      /* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(33)
      /* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(34)
      // import { Notification } from "./fetcher";

      const contains = (what) => (path) => path.indexOf(what) !== -1
      const containsAllOf = (whatArray) => {
        return (path) => {
          let i
          for (i = 0; i < whatArray.length; i = i + 1) {
            if (path.indexOf(whatArray[i]) === -1) {
              return false
            }
          }
          return true
        }
      }
      const containsOneOf = (whatArray) => {
        return (path) => {
          let i
          for (i = 0; i < whatArray.length; i = i + 1) {
            if (path.indexOf(whatArray[i]) !== -1) {
              return true
            }
          }
          return false
        }
      }
      const startsWith = (what) => (path) =>
        path.substring(0, what.length) === what
      const endsWith = (what) => (path) =>
        path.lastIndexOf(what) === path.length - what.length
      const equals = (what) => (path) => path === what
      const equalsOneOf = (whatArray) => (path) => {
        let i
        for (i = 0; i < whatArray.length; i = i + 1) {
          if (path === whatArray[i]) {
            return true
          }
        }
        return false
      }
      const negate =
        (gen) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (args) =>
        () =>
          !gen(args)
      const generators = {
        equals: equals,
        equalsNot: negate(equals),
        contains: contains,
        containsNot: negate(contains),
        containsAllOf: containsAllOf,
        containsOneOf: containsOneOf,
        startsWith: startsWith,
        startsNotWith: negate(startsWith),
        endsWith: endsWith,
        endsNotWith: negate(endsWith),
        equalsOneOf: equalsOneOf,
        equalsNotOneOf: negate(equalsOneOf)
      }
      const createPathMatcher = (options) => {
        if (!options.path) {
          return () => true
        }
        const po = options.path
        Object.keys(po).forEach((key) => {
          if (!(key in generators) && key !== 'caseInsensitive')
            throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument(
              'unknown rule ' + key
            )
        })
        const predicates = []
        _types__WEBPACK_IMPORTED_MODULE_1__.pathRules.forEach((name) => {
          let option = po[name]
          if (option) {
            const gen = generators[name]
            if (po.caseInsensitive) {
              if (Array.isArray(option)) {
                option = option.map((op) => op.toLowerCase())
              } else {
                option = option.toLowerCase()
              }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            predicates.push(gen(option))
          }
        })
        const applyPredicates = (path) => {
          for (let i = 0; i < predicates.length; ++i) {
            if (!predicates[i](path)) {
              return false
            }
          }
          return true
        }
        return predicates.length === 1
          ? (path) => predicates[0](path)
          : (path) => applyPredicates(path)
      }

      /***/
    },
    /* 33 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ CONNECTION_ERROR_CODE: () =>
          /* binding */ CONNECTION_ERROR_CODE,
        /* harmony export */ ConnectionClosed: () =>
          /* binding */ ConnectionClosed,
        /* harmony export */ ConnectionInUse: () =>
          /* binding */ ConnectionInUse,
        /* harmony export */ FetchOnly: () => /* binding */ FetchOnly,
        /* harmony export */ INTERNAL_ERROR_CODE: () =>
          /* binding */ INTERNAL_ERROR_CODE,
        /* harmony export */ INVALID_PARAMS_CODE: () =>
          /* binding */ INVALID_PARAMS_CODE,
        /* harmony export */ INVALID_PATH: () => /* binding */ INVALID_PATH,
        /* harmony export */ INVALID_REQUEST: () =>
          /* binding */ INVALID_REQUEST,
        /* harmony export */ InvalidArgument: () =>
          /* binding */ InvalidArgument,
        /* harmony export */ InvalidParamError: () =>
          /* binding */ InvalidParamError,
        /* harmony export */ InvvalidCredentials: () =>
          /* binding */ InvvalidCredentials,
        /* harmony export */ JSONRPCError: () => /* binding */ JSONRPCError,
        /* harmony export */ METHOD_NOT_FOUND: () =>
          /* binding */ METHOD_NOT_FOUND,
        /* harmony export */ NO_ERROR_CODE: () => /* binding */ NO_ERROR_CODE,
        /* harmony export */ NotAuthorized: () => /* binding */ NotAuthorized,
        /* harmony export */ NotFound: () => /* binding */ NotFound,
        /* harmony export */ Occupied: () => /* binding */ Occupied,
        /* harmony export */ PARSE_ERROR_CODE: () =>
          /* binding */ PARSE_ERROR_CODE,
        /* harmony export */ ParseError: () => /* binding */ ParseError,
        /* harmony export */ PeerTimeout: () => /* binding */ PeerTimeout,
        /* harmony export */ RESPONSE_TIMEOUT_CODE: () =>
          /* binding */ RESPONSE_TIMEOUT_CODE,
        /* harmony export */ invalidMethod: () => /* binding */ invalidMethod,
        /* harmony export */ invalidRequest: () => /* binding */ invalidRequest,
        /* harmony export */ invalidState: () => /* binding */ invalidState,
        /* harmony export */ methodNotFoundError: () =>
          /* binding */ methodNotFoundError,
        /* harmony export */ notAllowed: () => /* binding */ notAllowed
        /* harmony export */
      })

      const errorUrlBase =
        'https://github.com/lipp/node-jet/blob/master/doc/peer.markdown'
      const NO_ERROR_CODE = 1000
      const PARSE_ERROR_CODE = -32600
      const INVALID_REQUEST = -32600
      const METHOD_NOT_FOUND = -32601
      const INVALID_PARAMS_CODE = -32602
      const INTERNAL_ERROR_CODE = -32603
      const INVALID_PATH = -32604
      const RESPONSE_TIMEOUT_CODE = -32001
      const CONNECTION_ERROR_CODE = -32002
      class JSONRPCError extends Error {
        code
        message
        data
        constructor(code, name, message, details = '') {
          super()
          this.code = code
          this.name = 'jet.' + name
          this.message = message
          this.data = {
            name: 'jet.' + name,
            url: errorUrlBase + '#jet' + name.toLowerCase(),
            details: details
          }
        }
        toString = () =>
          `code: ${this.code} \nname: ${this.name} \n${this.message} \n${this.data}`
      }
      class ParseError extends JSONRPCError {
        constructor(details = '') {
          super(
            PARSE_ERROR_CODE,
            'ParseError',
            'Message could not be parsed',
            details
          )
        }
      }
      class InvalidParamError extends JSONRPCError {
        constructor(name, message, details = '') {
          super(INVALID_PARAMS_CODE, name, message, details)
        }
      }
      class NotFound extends InvalidParamError {
        constructor(details) {
          super(
            'NotFound',
            'No State/Method matching the specified path',
            details
          )
        }
      }
      class InvvalidCredentials extends InvalidParamError {
        constructor(details) {
          super('invalid params', 'invalid credentials', details)
        }
      }
      class NotAuthorized extends InvalidParamError {
        constructor(details) {
          super('invalid params', 'Missing authorization', details)
        }
      }
      class InvalidArgument extends InvalidParamError {
        constructor(details) {
          super(
            'InvalidArgument',
            'The provided argument(s) have been refused by the State/Method',
            details
          )
        }
      }
      class Occupied extends InvalidParamError {
        constructor(details) {
          super(
            'Occupied',
            'A State/Method with the same path has already been added',
            details
          )
        }
      }
      class FetchOnly extends InvalidParamError {
        constructor(details) {
          super('FetchOnly', 'The State cannot be modified', details)
        }
      }
      class methodNotFoundError extends JSONRPCError {
        constructor(details = '') {
          super(METHOD_NOT_FOUND, 'MethodNotFound', 'Method not found', details)
        }
      }
      class invalidMethod extends JSONRPCError {
        constructor(details) {
          super(
            INVALID_REQUEST,
            'invalidMethod',
            'The path does not support this method',
            details
          )
        }
      }
      class invalidState extends JSONRPCError {
        constructor(details) {
          super(
            INVALID_PATH,
            'invalidState',
            'The path is not supported',
            details
          )
        }
      }
      class invalidRequest extends JSONRPCError {
        constructor(
          name = 'invalidRequest',
          message = 'Invalid Request',
          details = ''
        ) {
          super(INVALID_REQUEST, name, message, details)
        }
      }
      class notAllowed extends invalidRequest {
        constructor(details) {
          super('NotAllowed', 'Not allowed', details)
        }
      }
      class ConnectionClosed extends JSONRPCError {
        constructor(details) {
          super(
            CONNECTION_ERROR_CODE,
            'ConnectionClosed',
            'The connection is closed',
            details
          )
        }
      }
      class ConnectionInUse extends JSONRPCError {
        constructor(err) {
          super(
            CONNECTION_ERROR_CODE,
            'ConnectionInUse',
            'Could not establish connection',
            err
          )
        }
      }
      class PeerTimeout extends JSONRPCError {
        constructor(details) {
          super(
            RESPONSE_TIMEOUT_CODE,
            'PeerTimeout',
            'The peer processing the request did not respond within the specified timeout',
            details
          )
        }
      }

      /***/
    },
    /* 34 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ events: () => /* binding */ events,
        /* harmony export */ fetchSimpleId: () => /* binding */ fetchSimpleId,
        /* harmony export */ operators: () => /* binding */ operators,
        /* harmony export */ pathRules: () => /* binding */ pathRules
        /* harmony export */
      })

      const events = [
        'authenticate',
        'configure',
        'info',
        'fetch',
        'unfetch',
        'remove',
        'change',
        'add',
        'data',
        'call',
        'get',
        'set'
      ]
      const pathRules = [
        'equals',
        'equalsNot',
        'endsWith',
        'startsWith',
        'contains',
        'containsNot',
        'containsAllOf',
        'containsOneOf',
        'startsNotWith',
        'endsNotWith',
        'equalsOneOf',
        'equalsNotOneOf'
      ]
      const operators = [
        'greaterThan',
        'lessThan',
        'equals',
        'equalsNot',
        'isType'
      ]
      const fetchSimpleId = 'fetch_all'

      /***/
    },
    /* 35 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Subscription: () => /* binding */ Subscription
        /* harmony export */
      })
      /* harmony import */ var _path_matcher__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(32)
      /* harmony import */ var _value_matcher__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(36)

      /** A subscription corresponds to a fetch request.
       * Each subscription contains all the routes that match the subscription  */
      class Subscription {
        owner
        id
        messages = []
        routes = []
        pathMatcher
        valueMatcher
        constructor(msg, peer = undefined) {
          this.pathMatcher = (0,
          _path_matcher__WEBPACK_IMPORTED_MODULE_0__.createPathMatcher)(msg)
          this.valueMatcher = (0,
          _value_matcher__WEBPACK_IMPORTED_MODULE_1__.create)(msg)
          this.owner = peer
          this.id = msg.id
        }
        close = () => {
          this.routes.forEach((route) => {
            route.removeListener('Change', this.handleChange)
            route.removeListener('Remove', this.handleRemove)
          })
        }
        handleChange = (path, value) =>
          this.enqueue({ path: path, event: 'Change', value })
        handleRemove = (path) => this.enqueue({ path: path, event: 'Remove' })
        addRoute = (route) => {
          this.routes.push(route)
          if (this.valueMatcher(route.value)) {
            this.enqueue({
              path: route.path,
              event: 'Add',
              value: route.value
            })
          }
          route.addListener('Change', this.handleChange)
          route.addListener('Remove', this.handleRemove)
        }
        setRoutes = (routes) => {
          routes.forEach((route) => this.addRoute(route))
        }
        matchesPath = (path) => this.pathMatcher(path)
        matchesValue = (value) => this.valueMatcher(value)
        enqueue = (msg) => {
          this.messages.push(msg)
        }
        send = () => {
          this.messages.forEach((msg) => this.owner?.queue(msg, this.id))
          this.messages = []
        }
      }

      /***/
    },
    /* 36 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ create: () => /* binding */ create
        /* harmony export */
      })
      /* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(33)
      /* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(37)

      const generators = {
        equals: (field, other) => (x) =>
          (0, _utils__WEBPACK_IMPORTED_MODULE_1__.getValue)(x, field) === other,
        lessThan: (field, other) => (x) =>
          (0, _utils__WEBPACK_IMPORTED_MODULE_1__.getValue)(x, field) < other,
        equalsNot: (field, other) => (x) =>
          (0, _utils__WEBPACK_IMPORTED_MODULE_1__.getValue)(x, field) !== other,
        greaterThan: (field, other) => (x) =>
          (0, _utils__WEBPACK_IMPORTED_MODULE_1__.getValue)(x, field) > other,
        isType: (field, other) => (x) =>
          typeof (0, _utils__WEBPACK_IMPORTED_MODULE_1__.getValue)(x, field) ===
          other
      }
      const generatePredicate = (field, rule) => {
        const gen = generators[rule.operator]
        if (!gen) {
          throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument(
            'unknown rule ' + rule.operator
          )
        } else {
          return gen(field, rule.value)
        }
      }
      const createValuePredicates = (valueOptions) => {
        const predicates = []
        Object.entries(valueOptions).forEach(([field, rule]) => {
          predicates.push(generatePredicate(field, rule))
        })
        return predicates
      }
      const create = (options) => {
        if (options.value) {
          const predicates = createValuePredicates(options.value)
          return (value) => {
            if (value === undefined) return false
            // eslint-disable-line consistent-return
            for (let i = 0; i < predicates.length; ++i) {
              if (!predicates[i](value)) {
                return false
              }
            }
            return true
          }
        }
        return () => true
      }

      /***/
    },
    /* 37 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ errorObject: () => /* binding */ errorObject,
        /* harmony export */ getValue: () => /* binding */ getValue,
        /* harmony export */ isState: () => /* binding */ isState
        /* harmony export */
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getValue = (o, field) => {
        if (field === '') return o
        const keys = field.split('.')
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          if (key in o) {
            o = o[key]
          } else {
            return undefined
          }
        }
        return o
      }
      const isJsonRPCError = (err) =>
        typeof err === 'object' && 'code' in err && 'message' in err
      const errorObject = (err) => {
        let data
        if (isJsonRPCError(err)) {
          return err
        } else {
          data = {}
          if (typeof err === 'string') {
            data.message = err
            data.stack = 'no stack available'
          } else {
            data.message = err.message
            data.stack = err.stack
            data.lineNumber = err.lineNumber
            data.fileName = err.fileName
          }
          return {
            code: -32603,
            message: 'Internal error',
            data: data
          }
        }
      }
      const isState = (stateOrMethod) => {
        return '_value' in stateOrMethod
      }

      /***/
    },
    /* 38 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Route: () => /* binding */ Route
        /* harmony export */
      })
      /* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(39)

      /**
       * A Route is a path and corresponds to a state.
       * The daemon keeps a local cache of all registered routes and all momentary values.
       * The corresponding owner of a route is also remembered
       */
      class Route extends _1_socket__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
        owner
        value
        path
        access
        constructor(owner, path, value = undefined, access) {
          super()
          this.owner = owner
          this.value = value
          this.path = path
          this.access = access
        }
        updateValue = (newValue) => {
          if (newValue === this.value) return
          this.value = newValue
          this.emit('Change', this.path, newValue)
        }
        remove = () => this.emit('Remove', this.path)
      }

      /***/
    },
    /* 39 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ EventEmitter: () => /* binding */ EventEmitter,
        /* harmony export */ WebSocketImpl: () => /* binding */ WebSocketImpl,
        /* harmony export */ isBrowser: () => /* binding */ isBrowser,
        /* harmony export */ isNodeJs: () => /* binding */ isNodeJs
        /* harmony export */
      })
      /* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(40)
      /* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(ws__WEBPACK_IMPORTED_MODULE_0__)
      /* harmony import */ var events__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(22)
      /* harmony import */ var events__WEBPACK_IMPORTED_MODULE_1___default =
        /*#__PURE__*/ __webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_1__)
      /* istanbul ignore file */

      const isNodeJs = typeof window === 'undefined'
      const isBrowser = typeof window !== 'undefined'
      const WebSocketImpl = isNodeJs
        ? ws__WEBPACK_IMPORTED_MODULE_0__.WebSocket
        : WebSocket
      const EventEmitter = events__WEBPACK_IMPORTED_MODULE_1__.EventEmitter

      /***/
    },
    /* 40 */
    /***/ () => {
      /* (ignored) */
      /***/
    },
    /* 41 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ JsonRPCServer: () => /* binding */ JsonRPCServer
        /* harmony export */
      })
      /* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(42)
      /* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(39)
      /* harmony import */ var _1_socket_tcpserver__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(47)
      /* harmony import */ var _1_socket_wsserver__WEBPACK_IMPORTED_MODULE_3__ =
        __webpack_require__(48)

      /**
       * JSONRPCServer instance
       */
      class JsonRPCServer extends _1_socket__WEBPACK_IMPORTED_MODULE_1__.EventEmitter {
        config
        tcpServer
        wsServer
        connections = {}
        log
        batches
        constructor(log, config, batches = false) {
          super()
          this.config = config
          this.batches = batches
          this.log = log
        }
        listen = () => {
          if (this.config.tcpPort) {
            this.tcpServer =
              new _1_socket_tcpserver__WEBPACK_IMPORTED_MODULE_2__.TCPServer(
                this.config
              )
            this.tcpServer.addListener('connection', (sock) => {
              const jsonRpc = new ___WEBPACK_IMPORTED_MODULE_0__['default'](
                this.log,
                { batches: this.batches },
                sock
              )
              this.connections[sock.id] = jsonRpc
              this.emit('connection', jsonRpc)
            })
            this.tcpServer.addListener('disconnect', (sock) => {
              this.emit('disconnect', this.connections[sock.id])
              delete this.connections[sock.id]
            })
            this.tcpServer.listen()
          }
          if (this.config.wsPort || this.config.server) {
            this.wsServer =
              new _1_socket_wsserver__WEBPACK_IMPORTED_MODULE_3__.WebsocketServer(
                this.config
              )
            this.wsServer.addListener('connection', (sock) => {
              const jsonRpc = new ___WEBPACK_IMPORTED_MODULE_0__['default'](
                this.log,
                { batches: this.batches },
                sock
              )
              this.connections[sock.id] = jsonRpc
              this.emit('connection', jsonRpc)
            })
            this.wsServer.addListener('disconnect', (sock) => {
              this.emit('disconnect', this.connections[sock.id])
              delete this.connections[sock.id]
            })
            this.wsServer.listen()
          }
        }
        close = () => {
          if (this.tcpServer) {
            this.tcpServer.close()
          }
          if (this.wsServer) {
            this.wsServer.close()
          }
        }
      }

      /***/
    },
    /* 42 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ JsonRPC: () => /* binding */ JsonRPC,
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var _3_jet_errors__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(33)
      /* harmony import */ var _3_jet_messages__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(43)
      /* harmony import */ var _1_socket_socket__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(44)
      /* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_3__ =
        __webpack_require__(39)

      /**
       * Helper shorthands.
       */
      const encode = JSON.stringify
      const decode = JSON.parse
      const isResultMessage = (msg) => {
        return 'result' in msg
      }
      const isErrorMessage = (msg) => {
        return 'error' in msg
      }
      /**
       * JsonRPC Instance
       * class used to interpret jsonrpc messages. This class can parse incoming socket messages to jsonrpc messages and fires events
       */
      class JsonRPC extends _1_socket__WEBPACK_IMPORTED_MODULE_3__.EventEmitter {
        sock
        config
        messages = []
        messageId = 1
        user = ''
        _isOpen = false
        openRequests = {}
        batchPromises = []
        requestId = ''
        resolveDisconnect
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rejectDisconnect
        disconnectPromise
        resolveConnect
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rejectConnect
        connectPromise
        logger
        abortController
        sendImmediate
        constructor(logger, config, sock) {
          super()
          this.config = config || {}
          this.sendImmediate = config?.batches ? false : true
          this.createDisconnectPromise()
          this.createConnectPromise()
          this.logger = logger
          if (sock) {
            this.sock = sock
            this._isOpen = true
            this.subscribeToSocketEvents()
          }
        }
        /**
         * Method called before disconnecting from the device to initialize Promise, that is only resolved when disconnected
         */
        createDisconnectPromise = () => {
          this.disconnectPromise = new Promise((resolve, reject) => {
            this.resolveDisconnect = resolve
            this.rejectDisconnect = reject
          })
        }
        /**
         * Method called before connecting to the device to initialize Promise, that is only resolved when a connection is established
         */
        createConnectPromise = () => {
          this.connectPromise = new Promise((resolve, reject) => {
            this.resolveConnect = resolve
            this.rejectConnect = reject
          })
        }
        /**
         * Method called to subscribe to all relevant socket events
         */
        subscribeToSocketEvents = () => {
          this.sock.addEventListener('error', this._handleError)
          this.sock.addEventListener('message', this._handleMessage)
          this.sock.addEventListener('open', () => {
            this._isOpen = true
            this.createDisconnectPromise()
            if (this.abortController.signal.aborted) {
              this.logger.warn('user requested abort')
              this.close()
              this.rejectConnect()
            } else {
              this.resolveConnect()
            }
          })
          this.sock.addEventListener('close', () => {
            this._isOpen = false
            this.resolveDisconnect()
            this.createConnectPromise()
          })
        }
        /**
         * Method to connect to a Server instance. Either TCP Server or Webserver
         * @params controller: an AbortController that can be used to abort the connection
         */
        connect = (controller = new AbortController()) => {
          if (this._isOpen) {
            return Promise.resolve()
          }
          this.abortController = controller
          const config = this.config
          this.sock = new _1_socket_socket__WEBPACK_IMPORTED_MODULE_2__.Socket()
          this.sock.connect(config.url, config.ip, config.port || 11122)
          this.subscribeToSocketEvents()
          return this.connectPromise
        }
        /**
         * Close.
         */
        close = () => {
          if (!this._isOpen) {
            return Promise.resolve()
          }
          this.send()
          this.sock.close()
          return this.disconnectPromise
        }
        _handleError = (err) => {
          this.logger.error(`Error in socket connection: ${err}`)
          if (!this._isOpen) {
            this.rejectConnect(err)
          }
        }
        _convertMessage = (message) => {
          if (message instanceof Blob) {
            return message
              .arrayBuffer()
              .then((buf) => new TextDecoder().decode(buf))
          }
          return Promise.resolve(message)
        }
        /**
         * _dispatchMessage
         *
         * @api private
         */
        _handleMessage = (event) => {
          this._convertMessage(event.data).then((message) => {
            this.logger.sock(`Received message: ${message}`)
            let decoded
            try {
              decoded = decode(message)
              if (Array.isArray(decoded)) {
                for (let i = 0; i < decoded.length; i++) {
                  this._dispatchSingleMessage(decoded[i])
                }
              } else {
                this._dispatchSingleMessage(decoded)
              }
              this.send()
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err) {
              const decodedId = (decoded && decoded.id) || ''
              this.respond(
                decodedId,
                new _3_jet_errors__WEBPACK_IMPORTED_MODULE_0__.ParseError(
                  message
                ),
                false
              )
              this.logger.error(err)
            }
          })
        }
        /**
         * _dispatchSingleMessage
         *
         * @api private
         */
        _dispatchSingleMessage = (message) => {
          if (isResultMessage(message) || isErrorMessage(message)) {
            this._dispatchResponse(message)
          } else {
            this._dispatchRequest(
              (0, _3_jet_messages__WEBPACK_IMPORTED_MODULE_1__.castMessage)(
                message
              )
            )
          }
        }
        /**
         * _dispatchResponse
         *
         * @api private
         */
        _dispatchResponse = (message) => {
          const mid = message.id
          if (isResultMessage(message)) {
            this.successCb(mid, message.result)
          }
          if (isErrorMessage(message)) {
            this.errorCb(mid, message.error)
          }
        }
        /**
         * _dispatchRequest.
         * Handles both method calls and fetchers (notifications)
         *
         * @api private
         */
        _dispatchRequest = (message) => {
          if (this.listenerCount(message.method) === 0) {
            this.logger.error(`Method ${message.method} is unknown`)
            this.respond(
              message.id,
              new _3_jet_errors__WEBPACK_IMPORTED_MODULE_0__.methodNotFoundError(
                message.method
              ),
              false
            )
          } else {
            this.emit(message.method, this, message.id, message.params)
          }
        }
        /**
         * Queue.
         */
        queue = (message, id = '') => {
          if (!this._isOpen) {
            return Promise.reject(
              new _3_jet_errors__WEBPACK_IMPORTED_MODULE_0__.ConnectionClosed()
            )
          }
          if (id) {
            this.messages.push({ method: id, params: message })
          } else {
            this.messages.push(message)
          }
          if (this.sendImmediate) {
            return this.send()
          } else {
            return Promise.resolve()
          }
        }
        /**
         * Send.
         */
        send = () => {
          if (this.messages.length > 0) {
            const encoded = encode(
              this.messages.length === 1 ? this.messages[0] : this.messages
            )
            this.logger.sock(`Sending message:  ${encoded}`)
            this.sock.send(encoded)
            this.messages = []
          } else {
            return Promise.resolve()
          }
          return Promise.all(this.batchPromises)
            .then((res) => {
              this.batchPromises = []
              return Promise.resolve(res)
            })
            .catch((ex) => {
              this.batchPromises = []
              this.logger.error(JSON.stringify(ex))
              return Promise.reject(ex)
            })
        }
        /**
         * Responding a request
         * @param id the request id to respond to
         * @param params the result of the request
         * @param success if the request was fulfilled
         */
        respond = (id, params, success) => {
          this.queue({ id, [success ? 'result' : 'error']: params })
        }
        successCb = (id, result) => {
          if (id in this.openRequests) {
            this.openRequests[id].resolve(result)
            delete this.openRequests[id]
          }
        }
        errorCb = (id, error) => {
          if (id in this.openRequests) {
            this.openRequests[id].reject(error)
            delete this.openRequests[id]
          }
        }
        /**
         * Method to send a request to a JSONRPC Server.
         */
        sendRequest = (method, params, immediate = undefined) => {
          const promise = new Promise((resolve, reject) => {
            if (!this._isOpen) {
              reject(
                new _3_jet_errors__WEBPACK_IMPORTED_MODULE_0__.ConnectionClosed()
              )
            } else {
              const rpcId = this.messageId.toString()
              this.messageId++
              this.openRequests[rpcId] = { resolve, reject }
              this.queue({
                id: rpcId.toString(),
                method,
                params
              })
              if (immediate) {
                this.send()
              }
            }
          })
          this.batchPromises.push(promise)
          if (immediate || this.sendImmediate)
            return promise.catch((err) => {
              this.logger.error(JSON.stringify(err))
              return Promise.reject(err)
            })
          else {
            return Promise.resolve({})
          }
        }
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = JsonRPC

      /***/
    },
    /* 43 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ castMessage: () => /* binding */ castMessage
        /* harmony export */
      })
      /* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(33)

      const castMessage = (msg) => {
        if (!('method' in msg))
          throw new _errors__WEBPACK_IMPORTED_MODULE_0__.invalidRequest(
            'No method'
          )
        const method = msg.method
        const params = msg.params
        switch (method) {
          case 'info':
            return msg
          case 'authenticate':
            if (!params || !('user' in params) || !('password' in params))
              throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument(
                'Only params.user & params.password supported'
              )
            return msg
          case 'configure':
            if (!params || !('name' in params))
              throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument(
                'Only params.name supported'
              )
            return msg
          case 'unfetch':
            if (!params || !('id' in params))
              throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument(
                'Fetch id required'
              )
            return msg
          default:
            if (!params || !('path' in params))
              throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument(
                'Path required'
              )
        }
        switch (method) {
          case 'fetch':
            if (!('id' in params))
              throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument(
                'Fetch id required'
              )
            return msg
          case 'change':
          case 'set':
            if (!('value' in params))
              throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument(
                'Value required'
              )
            return msg
          default:
            return msg
        }
      }

      /***/
    },
    /* 44 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Socket: () => /* binding */ Socket
        /* harmony export */
      })
      /* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(40)
      /* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(ws__WEBPACK_IMPORTED_MODULE_0__)
      /* harmony import */ var _message_socket__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(45)
      /* harmony import */ var ___WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(39)
      /* istanbul ignore file */

      /** Socket instance.
       * @class
       * @classdesc Class used as Interface to communicate between the native socket connection and the json rpc layer.
       */
      class Socket {
        id = ''
        sock
        type = ''
        constructor(socket) {
          if (socket) {
            this.sock = socket
            this.type =
              socket.constructor.name === 'MessageSocket' ? 'ms' : 'ws'
          }
        }
        /**
         * Method to connect to Server
         * @param url url to connect to
         * @param ip Ip address to connect to only valid in combination with port
         * @param port Port used to connect
         */
        connect = (url = undefined, ip = undefined, port = undefined) => {
          if (___WEBPACK_IMPORTED_MODULE_2__.isBrowser) {
            this.sock = new WebSocket(
              url || `ws://${window.location.host}:${port || 2315}`,
              'jet'
            )
            this.type = 'ws'
          } else if (___WEBPACK_IMPORTED_MODULE_2__.isNodeJs && url) {
            this.sock = new ws__WEBPACK_IMPORTED_MODULE_0__.WebSocket(
              url,
              'jet'
            )
            this.type = 'ws'
          } else {
            this.sock = new _message_socket__WEBPACK_IMPORTED_MODULE_1__[
              'default'
            ](port || 11122, ip)
            this.type = 'ms'
          }
        }
        /**
         * Closes the native socket connection
         */
        close = () => {
          if (this.sock) this.sock.close()
        }
        /**
         * Listening to socket events to socket events
         * @param event  "close": CloseEvent;"error": Event;"message": MessageEvent;"open": Event;
         * @param cb callback that is invoked when event is triggered
         * @emits CloseEvent in case of closing of the native socket
         * @emits Event in case of established socket connection
         * @emits MessageEvent in case of received message
         * @emits Event in case of error
         */
        addEventListener = (event, cb) => {
          if (
            (this.type === 'ws' && ___WEBPACK_IMPORTED_MODULE_2__.isBrowser) ||
            this.type === 'ms'
          ) {
            this.sock.addEventListener(event, cb)
          } else if (
            this.type === 'ws' &&
            ___WEBPACK_IMPORTED_MODULE_2__.isNodeJs
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.sock.addEventListener(event, cb)
          } else {
            throw Error('Could not detect socket type')
          }
        }
        /**
         * sending a message via the native socket
         * @param message //string that represents the message to send
         */
        send = (message) => {
          this.sock?.send(message)
        }
      }

      /***/
    },
    /* 45 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ MessageSocket: () => /* binding */ MessageSocket,
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var net__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(46)
      /* harmony import */ var net__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(net__WEBPACK_IMPORTED_MODULE_0__)
      /* harmony import */ var ___WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(39)
      /* istanbul ignore file */

      /**
       * Class Message socket
       */
      class MessageSocket extends ___WEBPACK_IMPORTED_MODULE_1__.EventEmitter {
        last = Buffer.alloc(0)
        len = -1
        socket
        constructor(port, ip = '') {
          super()
          if (port instanceof net__WEBPACK_IMPORTED_MODULE_0__.Socket) {
            this.socket = port
          } else {
            this.socket = (0, net__WEBPACK_IMPORTED_MODULE_0__.connect)(
              port,
              ip
            )
            this.socket.on('connect', () => {
              this.emit('open')
            })
          }
          this.socket.on('data', (buf) => {
            let bigBuf = Buffer.concat([this.last, buf])
            while (true) {
              // eslint-disable-line no-constant-condition
              if (this.len < 0) {
                if (bigBuf.length < 4) {
                  this.last = bigBuf
                  return
                } else {
                  this.len = bigBuf.readUInt32BE(0)
                  bigBuf = bigBuf.subarray(4)
                }
              }
              if (this.len > 0) {
                if (bigBuf.length < this.len) {
                  this.last = bigBuf
                  return
                } else {
                  this.emit('message', bigBuf.toString(undefined, 0, this.len))
                  bigBuf = bigBuf.subarray(this.len)
                  this.len = -1
                }
              }
            }
          })
          this.socket.setNoDelay(true)
          this.socket.setKeepAlive(true)
          this.socket.once('close', () => {
            this.emit('close')
          })
          this.socket.once('error', (e) => {
            this.emit('error', e)
          })
        }
        /**
         * Send.
         */
        send(msg) {
          const utf8Length = Buffer.byteLength(msg, 'utf8')
          const buf = Buffer.alloc(4 + utf8Length)
          buf.writeUInt32BE(utf8Length, 0)
          buf.write(msg, 4)
          process.nextTick(() => {
            this.socket.write(buf)
            this.emit('sent', msg)
          })
        }
        /**
         * Close.
         */
        close() {
          this.socket.end()
        }
        /**
         * addEventListener method needed for MessageSocket to be used in the browser.
         * It is a wrapper for plain EventEmitter events like ms.on('...', callback).
         *
         * npm module 'ws' also comes with this method.
         * See https://github.com/websockets/ws/blob/master/lib/WebSocket.js#L410
         * That way we can use node-jet with via browserify inside the browser.
         */
        addEventListener(
          method,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          listener
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const onMessage = (data) => {
            listener.call(this, new MessageEvent('data', { data: data }))
          }
          const onClose = (code, message) => {
            listener.call(this, new CloseEvent(code, message))
          }
          const onError = (event) => {
            listener.call(this, event)
          }
          const onOpen = () => {
            listener.call(this, new Event('open'))
          }
          if (typeof listener === 'function') {
            let cb
            switch (method) {
              case 'message':
                cb = onMessage
                break
              case 'close':
                cb = onClose
                break
              case 'error':
                cb = onError
                break
              case 'open':
                cb = onOpen
                break
              default:
                cb = listener
            }
            this.on(method, cb)
          }
        }
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
        MessageSocket

      /***/
    },
    /* 46 */
    /***/ (
      __unused_webpack_module,
      __unused_webpack_exports,
      __webpack_require__
    ) => {
      /*
Copyright 2013 Sleepless Software Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. 
*/

      // yes, I know this seems stupid, but I have my reasons.

      var net = __webpack_require__(46)
      for (k in net) __webpack_require__.g[k] = net[k]

      /***/
    },
    /* 47 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ TCPServer: () => /* binding */ TCPServer
        /* harmony export */
      })
      /* harmony import */ var net__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(46)
      /* harmony import */ var net__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(net__WEBPACK_IMPORTED_MODULE_0__)
      /* harmony import */ var ___WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(39)
      /* harmony import */ var _message_socket__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(45)
      /* harmony import */ var _socket__WEBPACK_IMPORTED_MODULE_3__ =
        __webpack_require__(44)
      /* istanbul ignore file */

      /**
       * Class implementation of a TCP server. This implementation only runs in a node.js environment
       */
      class TCPServer extends ___WEBPACK_IMPORTED_MODULE_1__.EventEmitter {
        config
        tcpServer
        connectionId = 1
        /**
         * Constructor to create a TCP Server instance
         */
        constructor(config) {
          super()
          this.config = config
        }
        /**
         * This function starts a TCP server listening on the port specified in the config
         */
        listen() {
          this.tcpServer = (0, net__WEBPACK_IMPORTED_MODULE_0__.createServer)(
            (peerSocket) => {
              const sock = new _socket__WEBPACK_IMPORTED_MODULE_3__.Socket(
                new _message_socket__WEBPACK_IMPORTED_MODULE_2__['default'](
                  peerSocket
                )
              )
              sock.id = `ws_${this.connectionId}`
              this.connectionId++
              peerSocket.addListener('close', () => {
                this.emit('disconnect', sock)
              })
              this.emit('connection', sock)
            }
          )
          this.tcpServer.listen(this.config.tcpPort)
        }
        /**
         * Function to stop the TCP server
         */
        close() {
          this.tcpServer.close()
        }
      }

      /***/
    },
    /* 48 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ WebsocketServer: () =>
          /* binding */ WebsocketServer
        /* harmony export */
      })
      /* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(39)
      /* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(40)
      /* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_1___default =
        /*#__PURE__*/ __webpack_require__.n(ws__WEBPACK_IMPORTED_MODULE_1__)
      /* harmony import */ var _socket__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(44)
      /* istanbul ignore file */

      /**
       * Class implementation of a WS server. This implementation only runs in a node.js environment
       */
      class WebsocketServer extends ___WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
        config
        wsServer
        connectionId = 1
        constructor(config) {
          super()
          this.config = config
        }
        /**
         * method to start listening on incoming websocket connections. Incoming websocket connections are validated if they accept jet protocol
         */
        listen() {
          this.wsServer = new ws__WEBPACK_IMPORTED_MODULE_1__.WebSocketServer({
            port: this.config.wsPort,
            server: this.config.server,
            path: this.config.wsPath,
            handleProtocols: (protocols) => {
              if (protocols.has('jet')) {
                return 'jet'
              } else {
                return false
              }
            }
          })
          this.wsServer.on('connection', (ws) => {
            const sock = new _socket__WEBPACK_IMPORTED_MODULE_2__.Socket(ws)
            sock.id = `ws_${this.connectionId}`
            this.connectionId++
            const pingMs = this.config.wsPingInterval || 5000
            let pingInterval
            if (pingMs) {
              pingInterval = setInterval(() => {
                if (
                  ws.readyState ===
                  ___WEBPACK_IMPORTED_MODULE_0__.WebSocketImpl.OPEN
                ) {
                  ws.ping()
                }
              }, pingMs)
            }
            ws.addListener('close', () => {
              clearInterval(pingInterval)
              this.emit('disconnect', sock)
            })
            ws.addListener('disconnect', () => {
              this.emit('disconnect', sock)
            })
            this.emit('connection', sock)
          })
        }
        /** Method to stop Websocket server */
        close() {
          this.wsServer.close()
        }
      }

      /***/
    },
    /* 49 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Authenticator: () => /* binding */ Authenticator
        /* harmony export */
      })
      /* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(33)

      class Authenticator {
        users
        groups
        enabled
        constructor(adminUser, password) {
          if (adminUser && password) {
            this.enabled = true
            this.users = { [adminUser]: password }
            this.groups = { admin: [adminUser], all: [adminUser] }
          } else {
            this.users = {}
            this.groups = {}
            this.enabled = false
          }
        }
        addUser = (requestUser, newUser, password, groups) => {
          if (!this.groups['admin'].includes(requestUser)) {
            throw new _errors__WEBPACK_IMPORTED_MODULE_0__.NotAuthorized(
              'Only admin users can create User'
            )
          }
          if (Object.keys(this.users).includes(newUser)) {
            throw new _errors__WEBPACK_IMPORTED_MODULE_0__.NotAuthorized(
              'User already exists'
            )
          }
          this.users[newUser] = password
          groups.forEach((group) => {
            if (!(group in Object.keys(this.groups))) {
              this.groups[group] = []
            }
            this.groups[group].push(newUser)
          })
          this.groups['all'].push(newUser)
        }
        login = (user, password) => {
          return (
            Object.keys(this.users).includes(user) &&
            password === this.users[user]
          )
        }
        isAllowed = (method, user, access) => {
          if (!access) return true
          const group = method === 'get' ? access.readgroup : access.writegroup
          if (!(group in this.groups)) {
            throw new _errors__WEBPACK_IMPORTED_MODULE_0__.invalidRequest(
              'Invalid group',
              'Requested group does not exist'
            )
          }
          return this.groups[group].includes(user)
        }
      }

      /***/
    },
    /* 50 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Peer: () => /* binding */ Peer,
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(34)
      /* harmony import */ var _2_jsonrpc__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(42)
      /* harmony import */ var _fetcher__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(51)
      /* harmony import */ var _log__WEBPACK_IMPORTED_MODULE_3__ =
        __webpack_require__(30)
      /* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ =
        __webpack_require__(37)
      /* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_5__ =
        __webpack_require__(33)
      /* harmony import */ var _daemon_subscription__WEBPACK_IMPORTED_MODULE_6__ =
        __webpack_require__(35)
      /* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_7__ =
        __webpack_require__(39)
      /* harmony import */ var nanoid__WEBPACK_IMPORTED_MODULE_8__ =
        __webpack_require__(52)

      const fallbackDaemonInfo = {
        name: 'unknown-daemon',
        version: '0.0.0',
        protocolVersion: '1.0.0',
        features: {
          fetch: 'full',
          batches: true,
          asNotification: false
        }
      }
      /**
       * Create a Jet Peer instance.
       * @class
       * @classdesc A Peer instance is required for all actions related to Jet.
       * A Peer connected to a Daemon is able to add content (States/Methods)
       * or to consume content (by fetching or by calling set).
       * The peer uses either the Websocket protocol or the TCP trivial protocol (default) as transport.
       * When specifying the url field, the peer uses the Websocket protocol as transport.
       * If no config is provided, the Peer connects to the local ('localhost') Daemon using
       * the trivial protocol.
       * Browsers do only support the Websocket transport and must be provided with a config with url field.
       *
       * @param {PeerConfig} [config] A peer configuration
       * @param {string} [config.url] The Jet Daemon Websocket URL, e.g. `ws://localhost:11123`
       * @param {string} [config.ip=localhost] The Jet Daemon TCP trivial protocol ip
       * @param {number} [config.port=11122] The Jet Daemon TCP trivial protocol port
       * @param {string} [config.user] The user name used for authentication
       * @param {string} [config.password] The user's password used for auhtentication
       * @returns {Peer} The newly created Peer instance.
       *
       * @example
       * var peer = new jet.Peer({url: 'ws://jetbus.io:8080'})
       */
      class Peer extends _1_socket__WEBPACK_IMPORTED_MODULE_7__.EventEmitter {
        #config
        #jsonrpc
        #daemonInfo = fallbackDaemonInfo
        #routes = {}
        #fetcher = {}
        #log
        cache = {}
        constructor(config, sock) {
          super()
          this.#config = config || {}
          this.#log = new _log__WEBPACK_IMPORTED_MODULE_3__.Logger(
            this.#config.log
          )
          this.#jsonrpc = new _2_jsonrpc__WEBPACK_IMPORTED_MODULE_1__[
            'default'
          ](this.#log, config, sock)
          this.#jsonrpc.addListener('get', (_peer, id, m) => {
            if (m.path in this.#routes) {
              const state = this.#routes[m.path]
              if (!(0, _utils__WEBPACK_IMPORTED_MODULE_4__.isState)(state)) {
                const error =
                  new _errors__WEBPACK_IMPORTED_MODULE_5__.invalidMethod(
                    `Tried to get value of ${m.path} which is a method`
                  )
                this.#log.error(error.toString())
                this.#jsonrpc.respond(id, error, false)
              } else {
                this.#jsonrpc.respond(id, state.toJson(), true)
              }
            } else {
              this.#jsonrpc.respond(
                id,
                new _errors__WEBPACK_IMPORTED_MODULE_5__.NotFound(m.path),
                false
              )
            }
          })
          this.#jsonrpc.addListener('set', (_peer, id, m) => {
            if (m.path in this.#routes) {
              const state = this.#routes[m.path]
              if (!(0, _utils__WEBPACK_IMPORTED_MODULE_4__.isState)(state)) {
                const error =
                  new _errors__WEBPACK_IMPORTED_MODULE_5__.invalidMethod(
                    `Tried to set ${m.path} which is a method`
                  )
                this.#log.error(error.toString())
                this.#jsonrpc.respond(id, error, false)
                return
              }
              try {
                state.emit('set', m.value)
                state.value(m.value)
                this.#jsonrpc.respond(id, state.toJson(), true)
              } catch (err) {
                this.#jsonrpc.respond(
                  id,
                  new _errors__WEBPACK_IMPORTED_MODULE_5__.InvalidParamError(
                    'InvalidParam',
                    'Failed to set value',
                    err && typeof err == 'object' ? err.toString() : undefined
                  ),
                  false
                )
              }
            } else {
              const error = new _errors__WEBPACK_IMPORTED_MODULE_5__.NotFound(
                m.path
              )
              this.#log.error(error.toString())
              this.#jsonrpc.respond(id, error, false)
            }
          })
          this.#jsonrpc.addListener('call', (_peer, id, m) => {
            if (m.path in this.#routes) {
              const method = this.#routes[m.path]
              if ((0, _utils__WEBPACK_IMPORTED_MODULE_4__.isState)(method)) {
                const error =
                  new _errors__WEBPACK_IMPORTED_MODULE_5__.invalidMethod(
                    `Tried to call ${m.path} which is a state`
                  )
                this.#log.error(error.toString())
                this.#jsonrpc.respond(id, error, false)
                return
              }
              method.call(m.args)
              this.#jsonrpc.respond(id, {}, true)
            } else {
              const error = new _errors__WEBPACK_IMPORTED_MODULE_5__.NotFound(
                m.path
              )
              this.#log.error(error.toString())
              this.#jsonrpc.respond(id, error, false)
            }
          })
          this.#jsonrpc.addListener(
            _types__WEBPACK_IMPORTED_MODULE_0__.fetchSimpleId,
            (_peer, _id, m) => {
              this.cache[m.path] = m
              Object.values(this.#fetcher).forEach((fetcher) => {
                if (fetcher.matches(m.path, m.value)) {
                  fetcher.emit('data', m)
                }
              })
            }
          )
        }
        isConnected = () => this.#jsonrpc._isOpen
        unfetch = (fetcher) => {
          const [id] = Object.entries(this.#fetcher).find(
            ([, f]) => f === fetcher
          ) || [null, null]
          if (!id) return Promise.reject('Could not find fetcher')
          if (!this.fetchFull()) {
            if (Object.keys(this.#fetcher).length === 2) {
              const param = {
                id: _types__WEBPACK_IMPORTED_MODULE_0__.fetchSimpleId
              }
              return this.#jsonrpc
                .sendRequest('unfetch', param)
                .then(() => delete this.#fetcher[id])
                .then(() => Promise.resolve())
            } else {
              delete this.#fetcher[id]
              return Promise.resolve()
            }
          } else {
            return this.#jsonrpc.sendRequest('unfetch', { id }).then(() => {
              delete this.#fetcher[id]
              return Promise.resolve()
            })
          }
        }
        fetchFull = () => this.#daemonInfo.features?.fetch === 'full'
        fetch = (fetcher) => {
          //check if daemon accepts path and value rules for fetching
          // otherwise rules must be applied on peer side
          const fetchFull = this.fetchFull()
          const fetcherId = `f_${(0,
          nanoid__WEBPACK_IMPORTED_MODULE_8__.nanoid)(5)}`
          this.#fetcher[fetcherId] = fetcher
          if (fetchFull) {
            const params = {
              ...fetcher.message,
              id: fetcherId
            }
            this.#jsonrpc.addListener(fetcherId, (_peer, _id, args) => {
              if (fetcherId in this.#fetcher)
                this.#fetcher[fetcherId].emit('data', args)
            })
            return this.#jsonrpc
              .sendRequest('fetch', params)
              .then(() => Promise.resolve())
          }
          const sub =
            new _daemon_subscription__WEBPACK_IMPORTED_MODULE_6__.Subscription(
              fetcher.message
            )
          Object.values(this.cache)
            .filter(
              (entry) =>
                sub.matchesPath(entry.path) && sub.matchesValue(entry.value)
            )
            .forEach((entry) => {
              fetcher.emit('data', entry)
            })
          if (
            !(
              _types__WEBPACK_IMPORTED_MODULE_0__.fetchSimpleId in this.#fetcher
            )
          ) {
            //create dummy fetcher to
            this.#fetcher[_types__WEBPACK_IMPORTED_MODULE_0__.fetchSimpleId] =
              new _fetcher__WEBPACK_IMPORTED_MODULE_2__['default']()
            const params = {
              id: _types__WEBPACK_IMPORTED_MODULE_0__.fetchSimpleId,
              path: { startsWith: '' }
            }
            return this.#jsonrpc
              .sendRequest('fetch', params)
              .then(() => Promise.resolve())
          } else {
            return Promise.resolve()
          }
        }
        /**
         * Actually connect the peer to the Jet Daemon
         * After the connect Promise has been resolved, the peer provides `peer.daemonInfo` object.
         *
         * ```javascript
         * peer.connect().then(function() {
         *   var daemonInfo = peer.daemonInfo
         *   console.log('name', daemonInfo.name) // string
         *   console.log('version', daemonInfo.version) // string
         *   console.log('protocolVersion', daemonInfo.protocolVersion) // number
         *   console.log('can process JSON-RPC batches', daemonInfo.features.batches) // boolean
         *   console.log('supports authentication', daemonInfo.features.authentication) // boolean
         *   console.log('fetch-mode', daemonInfo.features.fetch); // string: 'full' or 'simple'
         * })
         * ```
         *
         * @returns {external:Promise} A Promise which gets resolved once connected to the Daemon, or gets rejected with either:
         * - [jet.ConnectionClosed](#module:errors~ConnectionClosed)
         *
         * @example
         * var peer = new jet.Peer({url: 'ws://jetbus.io:8012'})
         * peer.connect().then(function() {
         *   console.log('connected')
         * }).catch(function(err) {
         *   console.log('connect failed', err)
         * })
         */
        authenticate = (user, password) => {
          return this.#jsonrpc.sendRequest('authenticate', { user, password })
        }
        connect = (controller = new AbortController()) =>
          this.#jsonrpc
            .connect(controller)
            .then(() => this.info())
            .then((daemonInfo) => {
              this.#daemonInfo = daemonInfo || fallbackDaemonInfo
              this.#jsonrpc.sendImmediate =
                !this.#daemonInfo.features?.batches || true
              return Promise.resolve()
            })
        /**
         * Close the connection to the Daemon. All associated States and Methods are automatically
         * removed by the Daemon.
         *
         * @returns {external:Promise}
         *
         */
        close = () => this.#jsonrpc.close()
        /**
         * Batch operations wrapper. Issue multiple commands to the Daemon
         * in one message batch. Only required for performance critical actions.
         *
         * @param {function} action A function performing multiple peer actions.
         *
         */
        batch = (action) => {
          if (this.#daemonInfo.features?.batches) {
            this.#jsonrpc.sendImmediate = false
          }
          action()
          this.#jsonrpc.sendImmediate = true
          return this.#jsonrpc.send()
        }
        /**
         * Get {State}s and/or {Method}s defined by a Peer.
         *
         * @param {object} expression A Fetch expression to retrieve a snapshot of the currently matching data.
         * @returns {external:Promise}
         */
        get = (expression) => this.#jsonrpc.sendRequest('get', expression)
        /**
         * Adds a state or method to the Daemon.
         *
         * @param {(State|Method)} content To content to be added.
         * @returns {external:Promise} Gets resolved as soon as the content has been added to the Daemon.
         */
        add = (stateOrMethod) => {
          if ((0, _utils__WEBPACK_IMPORTED_MODULE_4__.isState)(stateOrMethod)) {
            stateOrMethod.addListener('change', (newValue) => {
              this.#jsonrpc.sendRequest('change', {
                path: stateOrMethod._path,
                value: newValue
              })
            })
          }
          return this.#jsonrpc
            .sendRequest('add', stateOrMethod.toJson())
            .then(() => {
              this.#routes[stateOrMethod._path] = stateOrMethod
              return Promise.resolve()
            })
        }
        /**
         * Remove a state or method from the Daemon.
         *
         * @param {State|Method} content The content to be removed.
         * @returns {external:Promise} Gets resolved as soon as the content has been removed from the Daemon.
         */
        remove = (stateOrMethod) =>
          this.#jsonrpc
            .sendRequest('remove', { path: stateOrMethod.path() })
            .then(() => Promise.resolve())
        /**
         * Call a {Method} defined by another Peer.
         *
         * @param {string} path The unique path of the {Method}.
         * @param {Array} args The arguments provided to the {Method}.
         * @param {object} [options] Options.
         * @param {number} [options.timeout] A timeout for invoking the {Method} after which a timeout error rejects the promise.
         * @returns {external:Promise}
         */
        call = (path, callparams) => {
          const params = { path: path }
          if (callparams) params.args = callparams
          return this.#jsonrpc.sendRequest('call', params)
        }
        /**
         * Info
         * @private
         */
        info = () => this.#jsonrpc.sendRequest('info', {})
        /**
         * Authenticate
         * @private
         */
        // #authenticate = (user: string, password: string | undefined) =>
        //   this.#jsonrpc.send<AccessType>("authenticate", {
        //     user: user,
        //     password: password,
        //   });
        /**
         * Config
         *
         * @private
         */
        configure = (params) => this.#jsonrpc.sendRequest('config', params)
        /**
         * Set a {State} to another value.
         *
         * @param {string} path The unique path to the {State}.
         * @param {*} value The desired new value of the {State}.
         * @param {object} [options] Optional settings
         * @param {number} [options.timeout]
         *
         */
        set = (path, value) => this.#jsonrpc.sendRequest('set', { path, value })
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = Peer

      /***/
    },
    /* 51 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Fetcher: () => /* binding */ Fetcher,
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(39)
      /* harmony import */ var _daemon_subscription__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(35)

      class Fetcher extends _1_socket__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
        message = { id: '' }
        valueRules = {}
        constructor() {
          super()
          this.setMaxListeners(0)
        }
        path = (key, value) => {
          if (!this.message.path) {
            this.message.path = {}
          }
          this.message.path[key] = value
          return this
        }
        value = (operator, value, field = '') => {
          if (!this.message.value) {
            this.message.value = {}
          }
          this.message.value[field] = {
            operator,
            value
          }
          return this
        }
        matches = (path, value) => {
          const sub =
            new _daemon_subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription(
              this.message
            )
          return sub.matchesPath(path) && sub.matchesValue(value)
        }
        differential = () => {
          if (!this.message.sort) {
            this.message.sort = {}
          }
          this.message.sort.asArray = false
          return this
        }
        ascending = () => {
          if (!this.message.sort) {
            this.message.sort = {}
          }
          this.message.sort.descending = false
          return this
        }
        descending = () => {
          if (!this.message.sort) {
            this.message.sort = {}
          }
          this.message.sort.descending = true
          return this
        }
        sortByValue = (key = '') => {
          if (!this.message.sort) {
            this.message.sort = {}
          }
          this.message.sort.by = key ? `value.${key}` : 'value'
          return this
        }
        sortByPath = () => {
          if (!this.message.sort) {
            this.message.sort = {}
          }
          this.message.sort.by = 'path'
          return this
        }
        range = (_from, _to) => {
          if (!this.message.sort) {
            this.message.sort = {}
          }
          this.message.sort.from = _from
          this.message.sort.to = _to
          return this
        }
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = Fetcher

      /***/
    },
    /* 52 */
    /***/ (
      __unused_webpack___webpack_module__,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ customAlphabet: () => /* binding */ customAlphabet,
        /* harmony export */ customRandom: () => /* binding */ customRandom,
        /* harmony export */ nanoid: () => /* binding */ nanoid,
        /* harmony export */ random: () => /* binding */ random,
        /* harmony export */ urlAlphabet: () =>
          /* reexport safe */ _url_alphabet_index_js__WEBPACK_IMPORTED_MODULE_0__.urlAlphabet
        /* harmony export */
      })
      /* harmony import */ var _url_alphabet_index_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(53)

      let random = (bytes) => crypto.getRandomValues(new Uint8Array(bytes))
      let customRandom = (alphabet, defaultSize, getRandom) => {
        let mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1
        let step = -~((1.6 * mask * defaultSize) / alphabet.length)
        return (size = defaultSize) => {
          let id = ''
          while (true) {
            let bytes = getRandom(step)
            let j = step
            while (j--) {
              id += alphabet[bytes[j] & mask] || ''
              if (id.length === size) return id
            }
          }
        }
      }
      let customAlphabet = (alphabet, size = 21) =>
        customRandom(alphabet, size, random)
      let nanoid = (size = 21) =>
        crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
          byte &= 63
          if (byte < 36) {
            id += byte.toString(36)
          } else if (byte < 62) {
            id += (byte - 26).toString(36).toUpperCase()
          } else if (byte > 62) {
            id += '-'
          } else {
            id += '_'
          }
          return id
        }, '')

      /***/
    },
    /* 53 */
    /***/ (
      __unused_webpack___webpack_module__,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ urlAlphabet: () => /* binding */ urlAlphabet
        /* harmony export */
      })
      const urlAlphabet =
        'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

      /***/
    },
    /* 54 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ State: () => /* binding */ State,
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(39)
      /* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(33)

      /**
       * Create a Jet State instance
       * @class
       * @classdesc A Jet State associates a unique path with any piece of
       * cohesive data. The data may represent a Database entry, the configuration
       * of a certain part of software or observations of "real" things (through sensors).
       * A State can change its value at any time. It also can provide "behaviour" by providing
       * a "set" event handler. This event handler can do whatever seems appropriate (validation etc) and may
       * result in an auto-posted state change.
       *
       * @param {string} path A unique name, which identifies this State, e.g. 'persons/#23A51'
       * @param {*} initialValue The initial value of the state.
       * @param {object} [access] Access rights for this state. Per default unrestricted access to all Peers.
       *
       */
      class State extends _1_socket__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
        _path
        _value
        _readGroup
        _writeGroup
        constructor(path, initialValue, readgroup = 'all', writeGroup = 'all') {
          super()
          this._path = path
          this._value = initialValue
          this._readGroup = readgroup
          this._writeGroup = writeGroup
          if (typeof path === 'undefined') {
            throw new _errors__WEBPACK_IMPORTED_MODULE_1__.invalidState(
              `${path} is not allowed in path`
            )
          }
        }
        /**
         * Get the state's unchangable path.
         *
         * @returns {string} The state's path.
         *
         */
        path = () => this._path
        /**
         * Replies to a 'set' request. Either set `response.value` or `response.error`.
         * Only required for asynchronous working {State~setCallback}.
         *
         * @function State~reply
         * @param {object} response The response to send to the invoker of the 'set' callback.
         * @param {*} [response.value] The new State's value.
         * @param {Boolean} [response.dontNotify=false] If set to true, no state change is posted.
         * @param {string|object} [response.error] A error message or error object.
         *
         */
        value = (newValue = undefined) => {
          if (newValue !== undefined && newValue !== this._value) {
            this._value = newValue
            this.emit('change', newValue)
          }
          return this._value
        }
        toJson = () => ({
          path: this._path,
          value: this._value,
          access: { readgroup: this._readGroup, writegroup: this._writeGroup }
        })
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = State

      /***/
    },
    /* 55 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ Method: () => /* binding */ Method,
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(39)

      /**
       * A method is a path that can be called. The peer.call method can be used to call methods
       */
      class Method extends _1_socket__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
        _path
        constructor(path) {
          super()
          this._path = path
        }
        path = () => {
          return this._path
        }
        call = (args) => {
          this.emit('call', args)
        }
        toJson = () => {
          const params = {
            path: this._path
          }
          return params
        }
      }
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = Method

      /***/
    },
    /* 56 */
    /***/ (module, __webpack_exports__, __webpack_require__) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(57)
      /* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(
          _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__
        )
      /* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(58)
      /* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default =
        /*#__PURE__*/ __webpack_require__.n(
          _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__
        )
      /* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ =
        __webpack_require__(59)
      /* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default =
        /*#__PURE__*/ __webpack_require__.n(
          _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__
        )
      /* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ =
        __webpack_require__(60)
      /* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default =
        /*#__PURE__*/ __webpack_require__.n(
          _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__
        )
      /* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ =
        __webpack_require__(61)
      /* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default =
        /*#__PURE__*/ __webpack_require__.n(
          _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__
        )
      /* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ =
        __webpack_require__(62)
      /* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default =
        /*#__PURE__*/ __webpack_require__.n(
          _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__
        )
      /* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__ =
        __webpack_require__(63)

      var options = {}

      options.styleTagTransform =
        _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default()
      options.setAttributes =
        _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default()

      options.insert =
        _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(
          null,
          'head'
        )

      options.domAPI =
        _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default()
      options.insertStyleElement =
        _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default()

      var update =
        _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(
          _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__[
            'default'
          ],
          options
        )

      if (true) {
        if (
          !_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__[
            'default'
          ].locals ||
          module.hot.invalidate
        ) {
          var isEqualLocals = function isEqualLocals(a, b, isNamedExport) {
            if ((!a && b) || (a && !b)) {
              return false
            }
            var p
            for (p in a) {
              if (isNamedExport && p === 'default') {
                // eslint-disable-next-line no-continue
                continue
              }
              if (a[p] !== b[p]) {
                return false
              }
            }
            for (p in b) {
              if (isNamedExport && p === 'default') {
                // eslint-disable-next-line no-continue
                continue
              }
              if (!a[p]) {
                return false
              }
            }
            return true
          }
          var isNamedExport =
            !_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__[
              'default'
            ].locals
          var oldLocals = isNamedExport
            ? _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__
            : _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__[
                'default'
              ].locals

          module.hot.accept(63, (__WEBPACK_OUTDATED_DEPENDENCIES__) => {
            /* harmony import */ _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__ =
              __webpack_require__(63)
            ;(function () {
              if (
                !isEqualLocals(
                  oldLocals,
                  isNamedExport
                    ? _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__
                    : _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__[
                        'default'
                      ].locals,
                  isNamedExport
                )
              ) {
                module.hot.invalidate()

                return
              }

              oldLocals = isNamedExport
                ? _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__
                : _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__[
                    'default'
                  ].locals

              update(
                _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__[
                  'default'
                ]
              )
            })(__WEBPACK_OUTDATED_DEPENDENCIES__)
          })
        }

        module.hot.dispose(function () {
          update()
        })
      }

      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
        _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__[
          'default'
        ] &&
        _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__[
          'default'
        ].locals
          ? _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__[
              'default'
            ].locals
          : undefined

      /***/
    },
    /* 57 */
    /***/ (module) => {
      'use strict'

      var stylesInDOM = []
      function getIndexByIdentifier(identifier) {
        var result = -1
        for (var i = 0; i < stylesInDOM.length; i++) {
          if (stylesInDOM[i].identifier === identifier) {
            result = i
            break
          }
        }
        return result
      }
      function modulesToDom(list, options) {
        var idCountMap = {}
        var identifiers = []
        for (var i = 0; i < list.length; i++) {
          var item = list[i]
          var id = options.base ? item[0] + options.base : item[0]
          var count = idCountMap[id] || 0
          var identifier = ''.concat(id, ' ').concat(count)
          idCountMap[id] = count + 1
          var indexByIdentifier = getIndexByIdentifier(identifier)
          var obj = {
            css: item[1],
            media: item[2],
            sourceMap: item[3],
            supports: item[4],
            layer: item[5]
          }
          if (indexByIdentifier !== -1) {
            stylesInDOM[indexByIdentifier].references++
            stylesInDOM[indexByIdentifier].updater(obj)
          } else {
            var updater = addElementStyle(obj, options)
            options.byIndex = i
            stylesInDOM.splice(i, 0, {
              identifier: identifier,
              updater: updater,
              references: 1
            })
          }
          identifiers.push(identifier)
        }
        return identifiers
      }
      function addElementStyle(obj, options) {
        var api = options.domAPI(options)
        api.update(obj)
        var updater = function updater(newObj) {
          if (newObj) {
            if (
              newObj.css === obj.css &&
              newObj.media === obj.media &&
              newObj.sourceMap === obj.sourceMap &&
              newObj.supports === obj.supports &&
              newObj.layer === obj.layer
            ) {
              return
            }
            api.update((obj = newObj))
          } else {
            api.remove()
          }
        }
        return updater
      }
      module.exports = function (list, options) {
        options = options || {}
        list = list || []
        var lastIdentifiers = modulesToDom(list, options)
        return function update(newList) {
          newList = newList || []
          for (var i = 0; i < lastIdentifiers.length; i++) {
            var identifier = lastIdentifiers[i]
            var index = getIndexByIdentifier(identifier)
            stylesInDOM[index].references--
          }
          var newLastIdentifiers = modulesToDom(newList, options)
          for (var _i = 0; _i < lastIdentifiers.length; _i++) {
            var _identifier = lastIdentifiers[_i]
            var _index = getIndexByIdentifier(_identifier)
            if (stylesInDOM[_index].references === 0) {
              stylesInDOM[_index].updater()
              stylesInDOM.splice(_index, 1)
            }
          }
          lastIdentifiers = newLastIdentifiers
        }
      }

      /***/
    },
    /* 58 */
    /***/ (module) => {
      'use strict'

      /* istanbul ignore next  */
      function apply(styleElement, options, obj) {
        var css = ''
        if (obj.supports) {
          css += '@supports ('.concat(obj.supports, ') {')
        }
        if (obj.media) {
          css += '@media '.concat(obj.media, ' {')
        }
        var needLayer = typeof obj.layer !== 'undefined'
        if (needLayer) {
          css += '@layer'.concat(
            obj.layer.length > 0 ? ' '.concat(obj.layer) : '',
            ' {'
          )
        }
        css += obj.css
        if (needLayer) {
          css += '}'
        }
        if (obj.media) {
          css += '}'
        }
        if (obj.supports) {
          css += '}'
        }
        var sourceMap = obj.sourceMap
        if (sourceMap && typeof btoa !== 'undefined') {
          css += '\n/*# sourceMappingURL=data:application/json;base64,'.concat(
            btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))),
            ' */'
          )
        }

        // For old IE
        /* istanbul ignore if  */
        options.styleTagTransform(css, styleElement, options.options)
      }
      function removeStyleElement(styleElement) {
        // istanbul ignore if
        if (styleElement.parentNode === null) {
          return false
        }
        styleElement.parentNode.removeChild(styleElement)
      }

      /* istanbul ignore next  */
      function domAPI(options) {
        if (typeof document === 'undefined') {
          return {
            update: function update() {},
            remove: function remove() {}
          }
        }
        var styleElement = options.insertStyleElement(options)
        return {
          update: function update(obj) {
            apply(styleElement, options, obj)
          },
          remove: function remove() {
            removeStyleElement(styleElement)
          }
        }
      }
      module.exports = domAPI

      /***/
    },
    /* 59 */
    /***/ (module) => {
      'use strict'

      var memo = {}

      /* istanbul ignore next  */
      function getTarget(target) {
        if (typeof memo[target] === 'undefined') {
          var styleTarget = document.querySelector(target)

          // Special case to return head of iframe instead of iframe itself
          if (
            window.HTMLIFrameElement &&
            styleTarget instanceof window.HTMLIFrameElement
          ) {
            try {
              // This will throw an exception if access to iframe is blocked
              // due to cross-origin restrictions
              styleTarget = styleTarget.contentDocument.head
            } catch (e) {
              // istanbul ignore next
              styleTarget = null
            }
          }
          memo[target] = styleTarget
        }
        return memo[target]
      }

      /* istanbul ignore next  */
      function insertBySelector(insert, style) {
        var target = getTarget(insert)
        if (!target) {
          throw new Error(
            "Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid."
          )
        }
        target.appendChild(style)
      }
      module.exports = insertBySelector

      /***/
    },
    /* 60 */
    /***/ (module, __unused_webpack_exports, __webpack_require__) => {
      'use strict'

      /* istanbul ignore next  */
      function setAttributesWithoutAttributes(styleElement) {
        var nonce = true ? __webpack_require__.nc : 0
        if (nonce) {
          styleElement.setAttribute('nonce', nonce)
        }
      }
      module.exports = setAttributesWithoutAttributes

      /***/
    },
    /* 61 */
    /***/ (module) => {
      'use strict'

      /* istanbul ignore next  */
      function insertStyleElement(options) {
        var element = document.createElement('style')
        options.setAttributes(element, options.attributes)
        options.insert(element, options.options)
        return element
      }
      module.exports = insertStyleElement

      /***/
    },
    /* 62 */
    /***/ (module) => {
      'use strict'

      /* istanbul ignore next  */
      function styleTagTransform(css, styleElement) {
        if (styleElement.styleSheet) {
          styleElement.styleSheet.cssText = css
        } else {
          while (styleElement.firstChild) {
            styleElement.removeChild(styleElement.firstChild)
          }
          styleElement.appendChild(document.createTextNode(css))
        }
      }
      module.exports = styleTagTransform

      /***/
    },
    /* 63 */
    /***/ (module, __webpack_exports__, __webpack_require__) => {
      'use strict'
      __webpack_require__.r(__webpack_exports__)
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__
        /* harmony export */
      })
      /* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(64)
      /* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default =
        /*#__PURE__*/ __webpack_require__.n(
          _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__
        )
      /* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(65)
      /* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default =
        /*#__PURE__*/ __webpack_require__.n(
          _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__
        )
      // Imports

      var ___CSS_LOADER_EXPORT___ =
        _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()(
          _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()
        )
      // Module
      ___CSS_LOADER_EXPORT___.push([
        module.id,
        `html,
body {
	margin: 0;
	padding: 0;
	height: 100%;
	width: 100%;
}
`,
        '',
        {
          version: 3,
          sources: ['webpack://./base.css'],
          names: [],
          mappings: 'AAAA;;CAEC,SAAS;CACT,UAAU;CACV,YAAY;CACZ,WAAW;AACZ',
          sourceRoot: ''
        }
      ])
      // Exports
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
        ___CSS_LOADER_EXPORT___

      /***/
    },
    /* 64 */
    /***/ (module) => {
      'use strict'

      module.exports = function (item) {
        var content = item[1]
        var cssMapping = item[3]
        if (!cssMapping) {
          return content
        }
        if (typeof btoa === 'function') {
          var base64 = btoa(
            unescape(encodeURIComponent(JSON.stringify(cssMapping)))
          )
          var data =
            'sourceMappingURL=data:application/json;charset=utf-8;base64,'.concat(
              base64
            )
          var sourceMapping = '/*# '.concat(data, ' */')
          return [content].concat([sourceMapping]).join('\n')
        }
        return [content].join('\n')
      }

      /***/
    },
    /* 65 */
    /***/ (module) => {
      'use strict'

      /*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
      module.exports = function (cssWithMappingToString) {
        var list = []

        // return the list of modules as css string
        list.toString = function toString() {
          return this.map(function (item) {
            var content = ''
            var needLayer = typeof item[5] !== 'undefined'
            if (item[4]) {
              content += '@supports ('.concat(item[4], ') {')
            }
            if (item[2]) {
              content += '@media '.concat(item[2], ' {')
            }
            if (needLayer) {
              content += '@layer'.concat(
                item[5].length > 0 ? ' '.concat(item[5]) : '',
                ' {'
              )
            }
            content += cssWithMappingToString(item)
            if (needLayer) {
              content += '}'
            }
            if (item[2]) {
              content += '}'
            }
            if (item[4]) {
              content += '}'
            }
            return content
          }).join('')
        }

        // import a list of modules into the list
        list.i = function i(modules, media, dedupe, supports, layer) {
          if (typeof modules === 'string') {
            modules = [[null, modules, undefined]]
          }
          var alreadyImportedModules = {}
          if (dedupe) {
            for (var k = 0; k < this.length; k++) {
              var id = this[k][0]
              if (id != null) {
                alreadyImportedModules[id] = true
              }
            }
          }
          for (var _k = 0; _k < modules.length; _k++) {
            var item = [].concat(modules[_k])
            if (dedupe && alreadyImportedModules[item[0]]) {
              continue
            }
            if (typeof layer !== 'undefined') {
              if (typeof item[5] === 'undefined') {
                item[5] = layer
              } else {
                item[1] = '@layer'
                  .concat(item[5].length > 0 ? ' '.concat(item[5]) : '', ' {')
                  .concat(item[1], '}')
                item[5] = layer
              }
            }
            if (media) {
              if (!item[2]) {
                item[2] = media
              } else {
                item[1] = '@media '.concat(item[2], ' {').concat(item[1], '}')
                item[2] = media
              }
            }
            if (supports) {
              if (!item[4]) {
                item[4] = ''.concat(supports)
              } else {
                item[1] = '@supports ('
                  .concat(item[4], ') {')
                  .concat(item[1], '}')
                item[4] = supports
              }
            }
            list.push(item)
          }
        }
        return list
      }

      /***/
    }
    /******/
  ]
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {}
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId]
    /******/ if (cachedModule !== undefined) {
      /******/ if (cachedModule.error !== undefined) throw cachedModule.error
      /******/ return cachedModule.exports
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ id: moduleId,
      /******/ // no module.loaded needed
      /******/ exports: {}
      /******/
    })
    /******/
    /******/ // Execute the module function
    /******/ try {
      /******/ var execOptions = {
        id: moduleId,
        module: module,
        factory: __webpack_modules__[moduleId],
        require: __webpack_require__
      }
      /******/ __webpack_require__.i.forEach(function (handler) {
        handler(execOptions)
      })
      /******/ module = execOptions.module
      /******/ execOptions.factory.call(
        module.exports,
        module,
        module.exports,
        execOptions.require
      )
      /******/
    } catch (e) {
      /******/ module.error = e
      /******/ throw e
      /******/
    }
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports
    /******/
  }
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/ __webpack_require__.m = __webpack_modules__
  /******/
  /******/ // expose the module cache
  /******/ __webpack_require__.c = __webpack_module_cache__
  /******/
  /******/ // expose the module execution interceptor
  /******/ __webpack_require__.i =
    [] /* webpack/runtime/compat get default export */
  /******/
  /************************************************************************/
  /******/
  /******/
  ;(() => {
    /******/ // getDefaultExport function for compatibility with non-harmony modules
    /******/ __webpack_require__.n = (module) => {
      /******/ var getter =
        module && module.__esModule
          ? /******/ () => module['default']
          : /******/ () => module
      /******/ __webpack_require__.d(getter, { a: getter })
      /******/ return getter
      /******/
    }
    /******/
  })() /* webpack/runtime/define property getters */
  /******/
  /******/
  /******/
  ;(() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
      /******/ for (var key in definition) {
        /******/ if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          /******/ Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key]
          })
          /******/
        }
        /******/
      }
      /******/
    }
    /******/
  })() /* webpack/runtime/get javascript update chunk filename */
  /******/
  /******/
  /******/
  ;(() => {
    /******/ // This function allow to reference all chunks
    /******/ __webpack_require__.hu = (chunkId) => {
      /******/ // return url for filenames based on template
      /******/ return (
        '' + chunkId + '.' + __webpack_require__.h() + '.hot-update.js'
      )
      /******/
    }
    /******/
  })() /* webpack/runtime/get update manifest filename */
  /******/
  /******/
  /******/
  ;(() => {
    /******/ __webpack_require__.hmrF = () =>
      'main.' + __webpack_require__.h() + '.hot-update.json'
    /******/
  })() /* webpack/runtime/getFullHash */
  /******/
  /******/
  /******/
  ;(() => {
    /******/ __webpack_require__.h = () => '87f7c1d53ea220bad94a'
    /******/
  })() /* webpack/runtime/global */
  /******/
  /******/
  /******/
  ;(() => {
    /******/ __webpack_require__.g = (function () {
      /******/ if (typeof globalThis === 'object') return globalThis
      /******/ try {
        /******/ return this || new Function('return this')()
        /******/
      } catch (e) {
        /******/ if (typeof window === 'object') return window
        /******/
      }
      /******/
    })()
    /******/
  })() /* webpack/runtime/hasOwnProperty shorthand */
  /******/
  /******/
  /******/
  ;(() => {
    /******/ __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop)
    /******/
  })() /* webpack/runtime/load script */
  /******/
  /******/
  /******/
  ;(() => {
    /******/ var inProgress = {}
    /******/ // data-webpack is not used as build has no uniqueName
    /******/ // loadScript function to load a script via script tag
    /******/ __webpack_require__.l = (url, done, key, chunkId) => {
      /******/ if (inProgress[url]) {
        inProgress[url].push(done)
        return
      }
      /******/ var script, needAttach
      /******/ if (key !== undefined) {
        /******/ var scripts = document.getElementsByTagName('script')
        /******/ for (var i = 0; i < scripts.length; i++) {
          /******/ var s = scripts[i]
          /******/ if (s.getAttribute('src') == url) {
            script = s
            break
          }
          /******/
        }
        /******/
      }
      /******/ if (!script) {
        /******/ needAttach = true
        /******/ script = document.createElement('script')
        /******/
        /******/ script.charset = 'utf-8'
        /******/ script.timeout = 120
        /******/ if (__webpack_require__.nc) {
          /******/ script.setAttribute('nonce', __webpack_require__.nc)
          /******/
        }
        /******/
        /******/
        /******/ script.src = url
        /******/
      }
      /******/ inProgress[url] = [done]
      /******/ var onScriptComplete = (prev, event) => {
        /******/ // avoid mem leaks in IE.
        /******/ script.onerror = script.onload = null
        /******/ clearTimeout(timeout)
        /******/ var doneFns = inProgress[url]
        /******/ delete inProgress[url]
        /******/ script.parentNode && script.parentNode.removeChild(script)
        /******/ doneFns && doneFns.forEach((fn) => fn(event))
        /******/ if (prev) return prev(event)
        /******/
      }
      /******/ var timeout = setTimeout(
        onScriptComplete.bind(null, undefined, {
          type: 'timeout',
          target: script
        }),
        120000
      )
      /******/ script.onerror = onScriptComplete.bind(null, script.onerror)
      /******/ script.onload = onScriptComplete.bind(null, script.onload)
      /******/ needAttach && document.head.appendChild(script)
      /******/
    }
    /******/
  })() /* webpack/runtime/make namespace object */
  /******/
  /******/
  /******/
  ;(() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: 'Module'
        })
        /******/
      }
      /******/ Object.defineProperty(exports, '__esModule', { value: true })
      /******/
    }
    /******/
  })() /* webpack/runtime/hot module replacement */
  /******/
  /******/
  /******/
  ;(() => {
    /******/ var currentModuleData = {}
    /******/ var installedModules = __webpack_require__.c
    /******/
    /******/ // module and require creation
    /******/ var currentChildModule
    /******/ var currentParents = []
    /******/
    /******/ // status
    /******/ var registeredStatusHandlers = []
    /******/ var currentStatus = 'idle'
    /******/
    /******/ // while downloading
    /******/ var blockingPromises = 0
    /******/ var blockingPromisesWaiting = []
    /******/
    /******/ // The update info
    /******/ var currentUpdateApplyHandlers
    /******/ var queuedInvalidatedModules
    /******/
    /******/ // eslint-disable-next-line no-unused-vars
    /******/ __webpack_require__.hmrD = currentModuleData
    /******/
    /******/ __webpack_require__.i.push(function (options) {
      /******/ var module = options.module
      /******/ var require = createRequire(options.require, options.id)
      /******/ module.hot = createModuleHotObject(options.id, module)
      /******/ module.parents = currentParents
      /******/ module.children = []
      /******/ currentParents = []
      /******/ options.require = require
      /******/
    })
    /******/
    /******/ __webpack_require__.hmrC = {}
    /******/ __webpack_require__.hmrI = {}
    /******/
    /******/ function createRequire(require, moduleId) {
      /******/ var me = installedModules[moduleId]
      /******/ if (!me) return require
      /******/ var fn = function (request) {
        /******/ if (me.hot.active) {
          /******/ if (installedModules[request]) {
            /******/ var parents = installedModules[request].parents
            /******/ if (parents.indexOf(moduleId) === -1) {
              /******/ parents.push(moduleId)
              /******/
            }
            /******/
          } else {
            /******/ currentParents = [moduleId]
            /******/ currentChildModule = request
            /******/
          }
          /******/ if (me.children.indexOf(request) === -1) {
            /******/ me.children.push(request)
            /******/
          }
          /******/
        } else {
          /******/ console.warn(
            /******/ '[HMR] unexpected require(' +
              /******/ request +
              /******/ ') from disposed module ' +
              /******/ moduleId
            /******/
          )
          /******/ currentParents = []
          /******/
        }
        /******/ return require(request)
        /******/
      }
      /******/ var createPropertyDescriptor = function (name) {
        /******/ return {
          /******/ configurable: true,
          /******/ enumerable: true,
          /******/ get: function () {
            /******/ return require[name]
            /******/
          },
          /******/ set: function (value) {
            /******/ require[name] = value
            /******/
          }
          /******/
        }
        /******/
      }
      /******/ for (var name in require) {
        /******/ if (
          Object.prototype.hasOwnProperty.call(require, name) &&
          name !== 'e'
        ) {
          /******/ Object.defineProperty(
            fn,
            name,
            createPropertyDescriptor(name)
          )
          /******/
        }
        /******/
      }
      /******/ fn.e = function (chunkId) {
        /******/ return trackBlockingPromise(require.e(chunkId))
        /******/
      }
      /******/ return fn
      /******/
    }
    /******/
    /******/ function createModuleHotObject(moduleId, me) {
      /******/ var _main = currentChildModule !== moduleId
      /******/ var hot = {
        /******/ // private stuff
        /******/ _acceptedDependencies: {},
        /******/ _acceptedErrorHandlers: {},
        /******/ _declinedDependencies: {},
        /******/ _selfAccepted: false,
        /******/ _selfDeclined: false,
        /******/ _selfInvalidated: false,
        /******/ _disposeHandlers: [],
        /******/ _main: _main,
        /******/ _requireSelf: function () {
          /******/ currentParents = me.parents.slice()
          /******/ currentChildModule = _main ? undefined : moduleId
          /******/ __webpack_require__(moduleId)
          /******/
        },
        /******/
        /******/ // Module API
        /******/ active: true,
        /******/ accept: function (dep, callback, errorHandler) {
          /******/ if (dep === undefined) hot._selfAccepted = true
          /******/ else if (typeof dep === 'function') hot._selfAccepted = dep
          /******/ else if (typeof dep === 'object' && dep !== null) {
            /******/ for (var i = 0; i < dep.length; i++) {
              /******/ hot._acceptedDependencies[dep[i]] =
                callback || function () {}
              /******/ hot._acceptedErrorHandlers[dep[i]] = errorHandler
              /******/
            }
            /******/
          } else {
            /******/ hot._acceptedDependencies[dep] = callback || function () {}
            /******/ hot._acceptedErrorHandlers[dep] = errorHandler
            /******/
          }
          /******/
        },
        /******/ decline: function (dep) {
          /******/ if (dep === undefined) hot._selfDeclined = true
          /******/ else if (typeof dep === 'object' && dep !== null)
            /******/ for (var i = 0; i < dep.length; i++)
              /******/ hot._declinedDependencies[dep[i]] = true
          /******/ else hot._declinedDependencies[dep] = true
          /******/
        },
        /******/ dispose: function (callback) {
          /******/ hot._disposeHandlers.push(callback)
          /******/
        },
        /******/ addDisposeHandler: function (callback) {
          /******/ hot._disposeHandlers.push(callback)
          /******/
        },
        /******/ removeDisposeHandler: function (callback) {
          /******/ var idx = hot._disposeHandlers.indexOf(callback)
          /******/ if (idx >= 0) hot._disposeHandlers.splice(idx, 1)
          /******/
        },
        /******/ invalidate: function () {
          /******/ this._selfInvalidated = true
          /******/ switch (currentStatus) {
            /******/ case 'idle':
              /******/ currentUpdateApplyHandlers = []
              /******/ Object.keys(__webpack_require__.hmrI).forEach(function (
                key
              ) {
                /******/ __webpack_require__.hmrI[key](
                  /******/ moduleId,
                  /******/ currentUpdateApplyHandlers
                  /******/
                )
                /******/
              })
              /******/ setStatus('ready')
              /******/ break
            /******/ case 'ready':
              /******/ Object.keys(__webpack_require__.hmrI).forEach(function (
                key
              ) {
                /******/ __webpack_require__.hmrI[key](
                  /******/ moduleId,
                  /******/ currentUpdateApplyHandlers
                  /******/
                )
                /******/
              })
              /******/ break
            /******/ case 'prepare':
            /******/ case 'check':
            /******/ case 'dispose':
            /******/ case 'apply':
              /******/ ;(queuedInvalidatedModules =
                queuedInvalidatedModules || []).push(
                /******/ moduleId
                /******/
              )
              /******/ break
            /******/ default: // ignore requests in error states
              /******/ /******/ break
            /******/
          }
          /******/
        },
        /******/
        /******/ // Management API
        /******/ check: hotCheck,
        /******/ apply: hotApply,
        /******/ status: function (l) {
          /******/ if (!l) return currentStatus
          /******/ registeredStatusHandlers.push(l)
          /******/
        },
        /******/ addStatusHandler: function (l) {
          /******/ registeredStatusHandlers.push(l)
          /******/
        },
        /******/ removeStatusHandler: function (l) {
          /******/ var idx = registeredStatusHandlers.indexOf(l)
          /******/ if (idx >= 0) registeredStatusHandlers.splice(idx, 1)
          /******/
        },
        /******/
        /******/ //inherit from previous dispose call
        /******/ data: currentModuleData[moduleId]
        /******/
      }
      /******/ currentChildModule = undefined
      /******/ return hot
      /******/
    }
    /******/
    /******/ function setStatus(newStatus) {
      /******/ currentStatus = newStatus
      /******/ var results = []
      /******/
      /******/ for (var i = 0; i < registeredStatusHandlers.length; i++)
        /******/ results[i] = registeredStatusHandlers[i].call(null, newStatus)
      /******/
      /******/ return Promise.all(results)
      /******/
    }
    /******/
    /******/ function unblock() {
      /******/ if (--blockingPromises === 0) {
        /******/ setStatus('ready').then(function () {
          /******/ if (blockingPromises === 0) {
            /******/ var list = blockingPromisesWaiting
            /******/ blockingPromisesWaiting = []
            /******/ for (var i = 0; i < list.length; i++) {
              /******/ list[i]()
              /******/
            }
            /******/
          }
          /******/
        })
        /******/
      }
      /******/
    }
    /******/
    /******/ function trackBlockingPromise(promise) {
      /******/ switch (currentStatus) {
        /******/ case 'ready':
          /******/ setStatus('prepare')
        /******/ /* fallthrough */
        /******/ case 'prepare':
          /******/ blockingPromises++
          /******/ promise.then(unblock, unblock)
          /******/ return promise
        /******/ default:
          /******/ return promise
        /******/
      }
      /******/
    }
    /******/
    /******/ function waitForBlockingPromises(fn) {
      /******/ if (blockingPromises === 0) return fn()
      /******/ return new Promise(function (resolve) {
        /******/ blockingPromisesWaiting.push(function () {
          /******/ resolve(fn())
          /******/
        })
        /******/
      })
      /******/
    }
    /******/
    /******/ function hotCheck(applyOnUpdate) {
      /******/ if (currentStatus !== 'idle') {
        /******/ throw new Error('check() is only allowed in idle status')
        /******/
      }
      /******/ return setStatus('check')
        /******/ .then(__webpack_require__.hmrM)
        /******/ .then(function (update) {
          /******/ if (!update) {
            /******/ return setStatus(
              applyInvalidatedModules() ? 'ready' : 'idle'
            ).then(
              /******/ function () {
                /******/ return null
                /******/
              }
              /******/
            )
            /******/
          }
          /******/
          /******/ return setStatus('prepare').then(function () {
            /******/ var updatedModules = []
            /******/ currentUpdateApplyHandlers = []
            /******/
            /******/ return Promise.all(
              /******/ Object.keys(__webpack_require__.hmrC).reduce(
                function (
                  /******/ promises,
                  /******/ key
                  /******/
                ) {
                  /******/ __webpack_require__.hmrC[key](
                    /******/ update.c,
                    /******/ update.r,
                    /******/ update.m,
                    /******/ promises,
                    /******/ currentUpdateApplyHandlers,
                    /******/ updatedModules
                    /******/
                  )
                  /******/ return promises
                  /******/
                },
                /******/ []
              )
              /******/
            ).then(function () {
              /******/ return waitForBlockingPromises(function () {
                /******/ if (applyOnUpdate) {
                  /******/ return internalApply(applyOnUpdate)
                  /******/
                } else {
                  /******/ return setStatus('ready').then(function () {
                    /******/ return updatedModules
                    /******/
                  })
                  /******/
                }
                /******/
              })
              /******/
            })
            /******/
          })
          /******/
        })
      /******/
    }
    /******/
    /******/ function hotApply(options) {
      /******/ if (currentStatus !== 'ready') {
        /******/ return Promise.resolve().then(function () {
          /******/ throw new Error(
            /******/ 'apply() is only allowed in ready status (state: ' +
              /******/ currentStatus +
              /******/ ')'
            /******/
          )
          /******/
        })
        /******/
      }
      /******/ return internalApply(options)
      /******/
    }
    /******/
    /******/ function internalApply(options) {
      /******/ options = options || {}
      /******/
      /******/ applyInvalidatedModules()
      /******/
      /******/ var results = currentUpdateApplyHandlers.map(function (handler) {
        /******/ return handler(options)
        /******/
      })
      /******/ currentUpdateApplyHandlers = undefined
      /******/
      /******/ var errors = results
        /******/ .map(function (r) {
          /******/ return r.error
          /******/
        })
        /******/ .filter(Boolean)
      /******/
      /******/ if (errors.length > 0) {
        /******/ return setStatus('abort').then(function () {
          /******/ throw errors[0]
          /******/
        })
        /******/
      }
      /******/
      /******/ // Now in "dispose" phase
      /******/ var disposePromise = setStatus('dispose')
      /******/
      /******/ results.forEach(function (result) {
        /******/ if (result.dispose) result.dispose()
        /******/
      })
      /******/
      /******/ // Now in "apply" phase
      /******/ var applyPromise = setStatus('apply')
      /******/
      /******/ var error
      /******/ var reportError = function (err) {
        /******/ if (!error) error = err
        /******/
      }
      /******/
      /******/ var outdatedModules = []
      /******/ results.forEach(function (result) {
        /******/ if (result.apply) {
          /******/ var modules = result.apply(reportError)
          /******/ if (modules) {
            /******/ for (var i = 0; i < modules.length; i++) {
              /******/ outdatedModules.push(modules[i])
              /******/
            }
            /******/
          }
          /******/
        }
        /******/
      })
      /******/
      /******/ return Promise.all([disposePromise, applyPromise]).then(
        function () {
          /******/ // handle errors in accept handlers and self accepted module load
          /******/ if (error) {
            /******/ return setStatus('fail').then(function () {
              /******/ throw error
              /******/
            })
            /******/
          }
          /******/
          /******/ if (queuedInvalidatedModules) {
            /******/ return internalApply(options).then(function (list) {
              /******/ outdatedModules.forEach(function (moduleId) {
                /******/ if (list.indexOf(moduleId) < 0) list.push(moduleId)
                /******/
              })
              /******/ return list
              /******/
            })
            /******/
          }
          /******/
          /******/ return setStatus('idle').then(function () {
            /******/ return outdatedModules
            /******/
          })
          /******/
        }
      )
      /******/
    }
    /******/
    /******/ function applyInvalidatedModules() {
      /******/ if (queuedInvalidatedModules) {
        /******/ if (!currentUpdateApplyHandlers)
          currentUpdateApplyHandlers = []
        /******/ Object.keys(__webpack_require__.hmrI).forEach(function (key) {
          /******/ queuedInvalidatedModules.forEach(function (moduleId) {
            /******/ __webpack_require__.hmrI[key](
              /******/ moduleId,
              /******/ currentUpdateApplyHandlers
              /******/
            )
            /******/
          })
          /******/
        })
        /******/ queuedInvalidatedModules = undefined
        /******/ return true
        /******/
      }
      /******/
    }
    /******/
  })() /* webpack/runtime/publicPath */
  /******/
  /******/
  /******/
  ;(() => {
    /******/ var scriptUrl
    /******/ if (__webpack_require__.g.importScripts)
      scriptUrl = __webpack_require__.g.location + ''
    /******/ var document = __webpack_require__.g.document
    /******/ if (!scriptUrl && document) {
      /******/ if (document.currentScript)
        /******/ scriptUrl = document.currentScript.src
      /******/ if (!scriptUrl) {
        /******/ var scripts = document.getElementsByTagName('script')
        /******/ if (scripts.length) {
          /******/ var i = scripts.length - 1
          /******/ while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src
          /******/
        }
        /******/
      }
      /******/
    }
    /******/ // When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
    /******/ // or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
    /******/ if (!scriptUrl)
      throw new Error('Automatic publicPath is not supported in this browser')
    /******/ scriptUrl = scriptUrl
      .replace(/#.*$/, '')
      .replace(/\?.*$/, '')
      .replace(/\/[^\/]+$/, '/')
    /******/ __webpack_require__.p = scriptUrl
    /******/
  })() /* webpack/runtime/jsonp chunk loading */
  /******/
  /******/
  /******/
  ;(() => {
    /******/ // no baseURI
    /******/
    /******/ // object to store loaded and loading chunks
    /******/ // undefined = chunk not loaded, null = chunk preloaded/prefetched
    /******/ // [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
    /******/ var installedChunks = (__webpack_require__.hmrS_jsonp =
      __webpack_require__.hmrS_jsonp || {
        /******/ 0: 0
        /******/
      })
    /******/
    /******/ // no chunk on demand loading
    /******/
    /******/ // no prefetching
    /******/
    /******/ // no preloaded
    /******/
    /******/ var currentUpdatedModulesList
    /******/ var waitingUpdateResolves = {}
    /******/ function loadUpdateChunk(chunkId, updatedModulesList) {
      /******/ currentUpdatedModulesList = updatedModulesList
      /******/ return new Promise((resolve, reject) => {
        /******/ waitingUpdateResolves[chunkId] = resolve
        /******/ // start update chunk loading
        /******/ var url =
          __webpack_require__.p + __webpack_require__.hu(chunkId)
        /******/ // create error before stack unwound to get useful stacktrace later
        /******/ var error = new Error()
        /******/ var loadingEnded = (event) => {
          /******/ if (waitingUpdateResolves[chunkId]) {
            /******/ waitingUpdateResolves[chunkId] = undefined
            /******/ var errorType =
              event && (event.type === 'load' ? 'missing' : event.type)
            /******/ var realSrc = event && event.target && event.target.src
            /******/ error.message =
              'Loading hot update chunk ' +
              chunkId +
              ' failed.\n(' +
              errorType +
              ': ' +
              realSrc +
              ')'
            /******/ error.name = 'ChunkLoadError'
            /******/ error.type = errorType
            /******/ error.request = realSrc
            /******/ reject(error)
            /******/
          }
          /******/
        }
        /******/ __webpack_require__.l(url, loadingEnded)
        /******/
      })
      /******/
    }
    /******/
    /******/ self['webpackHotUpdate'] = (chunkId, moreModules, runtime) => {
      /******/ for (var moduleId in moreModules) {
        /******/ if (__webpack_require__.o(moreModules, moduleId)) {
          /******/ currentUpdate[moduleId] = moreModules[moduleId]
          /******/ if (currentUpdatedModulesList)
            currentUpdatedModulesList.push(moduleId)
          /******/
        }
        /******/
      }
      /******/ if (runtime) currentUpdateRuntime.push(runtime)
      /******/ if (waitingUpdateResolves[chunkId]) {
        /******/ waitingUpdateResolves[chunkId]()
        /******/ waitingUpdateResolves[chunkId] = undefined
        /******/
      }
      /******/
    }
    /******/
    /******/ var currentUpdateChunks
    /******/ var currentUpdate
    /******/ var currentUpdateRemovedChunks
    /******/ var currentUpdateRuntime
    /******/ function applyHandler(options) {
      /******/ if (__webpack_require__.f) delete __webpack_require__.f.jsonpHmr
      /******/ currentUpdateChunks = undefined
      /******/ function getAffectedModuleEffects(updateModuleId) {
        /******/ var outdatedModules = [updateModuleId]
        /******/ var outdatedDependencies = {}
        /******/
        /******/ var queue = outdatedModules.map(function (id) {
          /******/ return {
            /******/ chain: [id],
            /******/ id: id
            /******/
          }
          /******/
        })
        /******/ while (queue.length > 0) {
          /******/ var queueItem = queue.pop()
          /******/ var moduleId = queueItem.id
          /******/ var chain = queueItem.chain
          /******/ var module = __webpack_require__.c[moduleId]
          /******/ if (
            /******/ !module ||
            /******/ (module.hot._selfAccepted && !module.hot._selfInvalidated)
            /******/
          )
            /******/ continue
          /******/ if (module.hot._selfDeclined) {
            /******/ return {
              /******/ type: 'self-declined',
              /******/ chain: chain,
              /******/ moduleId: moduleId
              /******/
            }
            /******/
          }
          /******/ if (module.hot._main) {
            /******/ return {
              /******/ type: 'unaccepted',
              /******/ chain: chain,
              /******/ moduleId: moduleId
              /******/
            }
            /******/
          }
          /******/ for (var i = 0; i < module.parents.length; i++) {
            /******/ var parentId = module.parents[i]
            /******/ var parent = __webpack_require__.c[parentId]
            /******/ if (!parent) continue
            /******/ if (parent.hot._declinedDependencies[moduleId]) {
              /******/ return {
                /******/ type: 'declined',
                /******/ chain: chain.concat([parentId]),
                /******/ moduleId: moduleId,
                /******/ parentId: parentId
                /******/
              }
              /******/
            }
            /******/ if (outdatedModules.indexOf(parentId) !== -1) continue
            /******/ if (parent.hot._acceptedDependencies[moduleId]) {
              /******/ if (!outdatedDependencies[parentId])
                /******/ outdatedDependencies[parentId] = []
              /******/ addAllToSet(outdatedDependencies[parentId], [moduleId])
              /******/ continue
              /******/
            }
            /******/ delete outdatedDependencies[parentId]
            /******/ outdatedModules.push(parentId)
            /******/ queue.push({
              /******/ chain: chain.concat([parentId]),
              /******/ id: parentId
              /******/
            })
            /******/
          }
          /******/
        }
        /******/
        /******/ return {
          /******/ type: 'accepted',
          /******/ moduleId: updateModuleId,
          /******/ outdatedModules: outdatedModules,
          /******/ outdatedDependencies: outdatedDependencies
          /******/
        }
        /******/
      }
      /******/
      /******/ function addAllToSet(a, b) {
        /******/ for (var i = 0; i < b.length; i++) {
          /******/ var item = b[i]
          /******/ if (a.indexOf(item) === -1) a.push(item)
          /******/
        }
        /******/
      }
      /******/
      /******/ // at begin all updates modules are outdated
      /******/ // the "outdated" status can propagate to parents if they don't accept the children
      /******/ var outdatedDependencies = {}
      /******/ var outdatedModules = []
      /******/ var appliedUpdate = {}
      /******/
      /******/ var warnUnexpectedRequire = function warnUnexpectedRequire(
        module
      ) {
        /******/ console.warn(
          /******/ '[HMR] unexpected require(' +
            module.id +
            ') to disposed module'
          /******/
        )
        /******/
      }
      /******/
      /******/ for (var moduleId in currentUpdate) {
        /******/ if (__webpack_require__.o(currentUpdate, moduleId)) {
          /******/ var newModuleFactory = currentUpdate[moduleId]
          /******/ /** @type {TODO} */
          /******/ var result
          /******/ if (newModuleFactory) {
            /******/ result = getAffectedModuleEffects(moduleId)
            /******/
          } else {
            /******/ result = {
              /******/ type: 'disposed',
              /******/ moduleId: moduleId
              /******/
            }
            /******/
          }
          /******/ /** @type {Error|false} */
          /******/ var abortError = false
          /******/ var doApply = false
          /******/ var doDispose = false
          /******/ var chainInfo = ''
          /******/ if (result.chain) {
            /******/ chainInfo =
              '\nUpdate propagation: ' + result.chain.join(' -> ')
            /******/
          }
          /******/ switch (result.type) {
            /******/ case 'self-declined':
              /******/ if (options.onDeclined) options.onDeclined(result)
              /******/ if (!options.ignoreDeclined)
                /******/ abortError = new Error(
                  /******/ 'Aborted because of self decline: ' +
                    /******/ result.moduleId +
                    /******/ chainInfo
                  /******/
                )
              /******/ break
            /******/ case 'declined':
              /******/ if (options.onDeclined) options.onDeclined(result)
              /******/ if (!options.ignoreDeclined)
                /******/ abortError = new Error(
                  /******/ 'Aborted because of declined dependency: ' +
                    /******/ result.moduleId +
                    /******/ ' in ' +
                    /******/ result.parentId +
                    /******/ chainInfo
                  /******/
                )
              /******/ break
            /******/ case 'unaccepted':
              /******/ if (options.onUnaccepted) options.onUnaccepted(result)
              /******/ if (!options.ignoreUnaccepted)
                /******/ abortError = new Error(
                  /******/ 'Aborted because ' +
                    moduleId +
                    ' is not accepted' +
                    chainInfo
                  /******/
                )
              /******/ break
            /******/ case 'accepted':
              /******/ if (options.onAccepted) options.onAccepted(result)
              /******/ doApply = true
              /******/ break
            /******/ case 'disposed':
              /******/ if (options.onDisposed) options.onDisposed(result)
              /******/ doDispose = true
              /******/ break
            /******/ default:
              /******/ throw new Error('Unexception type ' + result.type)
            /******/
          }
          /******/ if (abortError) {
            /******/ return {
              /******/ error: abortError
              /******/
            }
            /******/
          }
          /******/ if (doApply) {
            /******/ appliedUpdate[moduleId] = newModuleFactory
            /******/ addAllToSet(outdatedModules, result.outdatedModules)
            /******/ for (moduleId in result.outdatedDependencies) {
              /******/ if (
                __webpack_require__.o(result.outdatedDependencies, moduleId)
              ) {
                /******/ if (!outdatedDependencies[moduleId])
                  /******/ outdatedDependencies[moduleId] = []
                /******/ addAllToSet(
                  /******/ outdatedDependencies[moduleId],
                  /******/ result.outdatedDependencies[moduleId]
                  /******/
                )
                /******/
              }
              /******/
            }
            /******/
          }
          /******/ if (doDispose) {
            /******/ addAllToSet(outdatedModules, [result.moduleId])
            /******/ appliedUpdate[moduleId] = warnUnexpectedRequire
            /******/
          }
          /******/
        }
        /******/
      }
      /******/ currentUpdate = undefined
      /******/
      /******/ // Store self accepted outdated modules to require them later by the module system
      /******/ var outdatedSelfAcceptedModules = []
      /******/ for (var j = 0; j < outdatedModules.length; j++) {
        /******/ var outdatedModuleId = outdatedModules[j]
        /******/ var module = __webpack_require__.c[outdatedModuleId]
        /******/ if (
          /******/ module &&
          /******/ (module.hot._selfAccepted || module.hot._main) &&
          /******/ // removed self-accepted modules should not be required
          /******/ appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
          /******/ // when called invalidate self-accepting is not possible
          /******/ !module.hot._selfInvalidated
          /******/
        ) {
          /******/ outdatedSelfAcceptedModules.push({
            /******/ module: outdatedModuleId,
            /******/ require: module.hot._requireSelf,
            /******/ errorHandler: module.hot._selfAccepted
            /******/
          })
          /******/
        }
        /******/
      }
      /******/
      /******/ var moduleOutdatedDependencies
      /******/
      /******/ return {
        /******/ dispose: function () {
          /******/ currentUpdateRemovedChunks.forEach(function (chunkId) {
            /******/ delete installedChunks[chunkId]
            /******/
          })
          /******/ currentUpdateRemovedChunks = undefined
          /******/
          /******/ var idx
          /******/ var queue = outdatedModules.slice()
          /******/ while (queue.length > 0) {
            /******/ var moduleId = queue.pop()
            /******/ var module = __webpack_require__.c[moduleId]
            /******/ if (!module) continue
            /******/
            /******/ var data = {}
            /******/
            /******/ // Call dispose handlers
            /******/ var disposeHandlers = module.hot._disposeHandlers
            /******/ for (j = 0; j < disposeHandlers.length; j++) {
              /******/ disposeHandlers[j].call(null, data)
              /******/
            }
            /******/ __webpack_require__.hmrD[moduleId] = data
            /******/
            /******/ // disable module (this disables requires from this module)
            /******/ module.hot.active = false
            /******/
            /******/ // remove module from cache
            /******/ delete __webpack_require__.c[moduleId]
            /******/
            /******/ // when disposing there is no need to call dispose handler
            /******/ delete outdatedDependencies[moduleId]
            /******/
            /******/ // remove "parents" references from all children
            /******/ for (j = 0; j < module.children.length; j++) {
              /******/ var child = __webpack_require__.c[module.children[j]]
              /******/ if (!child) continue
              /******/ idx = child.parents.indexOf(moduleId)
              /******/ if (idx >= 0) {
                /******/ child.parents.splice(idx, 1)
                /******/
              }
              /******/
            }
            /******/
          }
          /******/
          /******/ // remove outdated dependency from module children
          /******/ var dependency
          /******/ for (var outdatedModuleId in outdatedDependencies) {
            /******/ if (
              __webpack_require__.o(outdatedDependencies, outdatedModuleId)
            ) {
              /******/ module = __webpack_require__.c[outdatedModuleId]
              /******/ if (module) {
                /******/ moduleOutdatedDependencies =
                  /******/ outdatedDependencies[outdatedModuleId]
                /******/ for (
                  j = 0;
                  j < moduleOutdatedDependencies.length;
                  j++
                ) {
                  /******/ dependency = moduleOutdatedDependencies[j]
                  /******/ idx = module.children.indexOf(dependency)
                  /******/ if (idx >= 0) module.children.splice(idx, 1)
                  /******/
                }
                /******/
              }
              /******/
            }
            /******/
          }
          /******/
        },
        /******/ apply: function (reportError) {
          /******/ // insert new code
          /******/ for (var updateModuleId in appliedUpdate) {
            /******/ if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
              /******/ __webpack_require__.m[updateModuleId] =
                appliedUpdate[updateModuleId]
              /******/
            }
            /******/
          }
          /******/
          /******/ // run new runtime modules
          /******/ for (var i = 0; i < currentUpdateRuntime.length; i++) {
            /******/ currentUpdateRuntime[i](__webpack_require__)
            /******/
          }
          /******/
          /******/ // call accept handlers
          /******/ for (var outdatedModuleId in outdatedDependencies) {
            /******/ if (
              __webpack_require__.o(outdatedDependencies, outdatedModuleId)
            ) {
              /******/ var module = __webpack_require__.c[outdatedModuleId]
              /******/ if (module) {
                /******/ moduleOutdatedDependencies =
                  /******/ outdatedDependencies[outdatedModuleId]
                /******/ var callbacks = []
                /******/ var errorHandlers = []
                /******/ var dependenciesForCallbacks = []
                /******/ for (
                  var j = 0;
                  j < moduleOutdatedDependencies.length;
                  j++
                ) {
                  /******/ var dependency = moduleOutdatedDependencies[j]
                  /******/ var acceptCallback =
                    /******/ module.hot._acceptedDependencies[dependency]
                  /******/ var errorHandler =
                    /******/ module.hot._acceptedErrorHandlers[dependency]
                  /******/ if (acceptCallback) {
                    /******/ if (callbacks.indexOf(acceptCallback) !== -1)
                      continue
                    /******/ callbacks.push(acceptCallback)
                    /******/ errorHandlers.push(errorHandler)
                    /******/ dependenciesForCallbacks.push(dependency)
                    /******/
                  }
                  /******/
                }
                /******/ for (var k = 0; k < callbacks.length; k++) {
                  /******/ try {
                    /******/ callbacks[k].call(null, moduleOutdatedDependencies)
                    /******/
                  } catch (err) {
                    /******/ if (typeof errorHandlers[k] === 'function') {
                      /******/ try {
                        /******/ errorHandlers[k](err, {
                          /******/ moduleId: outdatedModuleId,
                          /******/ dependencyId: dependenciesForCallbacks[k]
                          /******/
                        })
                        /******/
                      } catch (err2) {
                        /******/ if (options.onErrored) {
                          /******/ options.onErrored({
                            /******/ type: 'accept-error-handler-errored',
                            /******/ moduleId: outdatedModuleId,
                            /******/ dependencyId: dependenciesForCallbacks[k],
                            /******/ error: err2,
                            /******/ originalError: err
                            /******/
                          })
                          /******/
                        }
                        /******/ if (!options.ignoreErrored) {
                          /******/ reportError(err2)
                          /******/ reportError(err)
                          /******/
                        }
                        /******/
                      }
                      /******/
                    } else {
                      /******/ if (options.onErrored) {
                        /******/ options.onErrored({
                          /******/ type: 'accept-errored',
                          /******/ moduleId: outdatedModuleId,
                          /******/ dependencyId: dependenciesForCallbacks[k],
                          /******/ error: err
                          /******/
                        })
                        /******/
                      }
                      /******/ if (!options.ignoreErrored) {
                        /******/ reportError(err)
                        /******/
                      }
                      /******/
                    }
                    /******/
                  }
                  /******/
                }
                /******/
              }
              /******/
            }
            /******/
          }
          /******/
          /******/ // Load self accepted modules
          /******/ for (
            var o = 0;
            o < outdatedSelfAcceptedModules.length;
            o++
          ) {
            /******/ var item = outdatedSelfAcceptedModules[o]
            /******/ var moduleId = item.module
            /******/ try {
              /******/ item.require(moduleId)
              /******/
            } catch (err) {
              /******/ if (typeof item.errorHandler === 'function') {
                /******/ try {
                  /******/ item.errorHandler(err, {
                    /******/ moduleId: moduleId,
                    /******/ module: __webpack_require__.c[moduleId]
                    /******/
                  })
                  /******/
                } catch (err2) {
                  /******/ if (options.onErrored) {
                    /******/ options.onErrored({
                      /******/ type: 'self-accept-error-handler-errored',
                      /******/ moduleId: moduleId,
                      /******/ error: err2,
                      /******/ originalError: err
                      /******/
                    })
                    /******/
                  }
                  /******/ if (!options.ignoreErrored) {
                    /******/ reportError(err2)
                    /******/ reportError(err)
                    /******/
                  }
                  /******/
                }
                /******/
              } else {
                /******/ if (options.onErrored) {
                  /******/ options.onErrored({
                    /******/ type: 'self-accept-errored',
                    /******/ moduleId: moduleId,
                    /******/ error: err
                    /******/
                  })
                  /******/
                }
                /******/ if (!options.ignoreErrored) {
                  /******/ reportError(err)
                  /******/
                }
                /******/
              }
              /******/
            }
            /******/
          }
          /******/
          /******/ return outdatedModules
          /******/
        }
        /******/
      }
      /******/
    }
    /******/ __webpack_require__.hmrI.jsonp = function (
      moduleId,
      applyHandlers
    ) {
      /******/ if (!currentUpdate) {
        /******/ currentUpdate = {}
        /******/ currentUpdateRuntime = []
        /******/ currentUpdateRemovedChunks = []
        /******/ applyHandlers.push(applyHandler)
        /******/
      }
      /******/ if (!__webpack_require__.o(currentUpdate, moduleId)) {
        /******/ currentUpdate[moduleId] = __webpack_require__.m[moduleId]
        /******/
      }
      /******/
    }
    /******/ __webpack_require__.hmrC.jsonp = function (
      /******/ chunkIds,
      /******/ removedChunks,
      /******/ removedModules,
      /******/ promises,
      /******/ applyHandlers,
      /******/ updatedModulesList
      /******/
    ) {
      /******/ applyHandlers.push(applyHandler)
      /******/ currentUpdateChunks = {}
      /******/ currentUpdateRemovedChunks = removedChunks
      /******/ currentUpdate = removedModules.reduce(function (obj, key) {
        /******/ obj[key] = false
        /******/ return obj
        /******/
      }, {})
      /******/ currentUpdateRuntime = []
      /******/ chunkIds.forEach(function (chunkId) {
        /******/ if (
          /******/ __webpack_require__.o(installedChunks, chunkId) &&
          /******/ installedChunks[chunkId] !== undefined
          /******/
        ) {
          /******/ promises.push(loadUpdateChunk(chunkId, updatedModulesList))
          /******/ currentUpdateChunks[chunkId] = true
          /******/
        } else {
          /******/ currentUpdateChunks[chunkId] = false
          /******/
        }
        /******/
      })
      /******/ if (__webpack_require__.f) {
        /******/ __webpack_require__.f.jsonpHmr = function (chunkId, promises) {
          /******/ if (
            /******/ currentUpdateChunks &&
            /******/ __webpack_require__.o(currentUpdateChunks, chunkId) &&
            /******/ !currentUpdateChunks[chunkId]
            /******/
          ) {
            /******/ promises.push(loadUpdateChunk(chunkId))
            /******/ currentUpdateChunks[chunkId] = true
            /******/
          }
          /******/
        }
        /******/
      }
      /******/
    }
    /******/
    /******/ __webpack_require__.hmrM = () => {
      /******/ if (typeof fetch === 'undefined')
        throw new Error('No browser support: need fetch API')
      /******/ return fetch(
        __webpack_require__.p + __webpack_require__.hmrF()
      ).then((response) => {
        /******/ if (response.status === 404) return // no update available
        /******/ if (!response.ok)
          throw new Error(
            'Failed to fetch update manifest ' + response.statusText
          )
        /******/ return response.json()
        /******/
      })
      /******/
    }
    /******/
    /******/ // no on chunks loaded
    /******/
    /******/ // no jsonp function
    /******/
  })() /* webpack/runtime/nonce */
  /******/
  /******/
  /******/
  ;(() => {
    /******/ __webpack_require__.nc = undefined
    /******/
  })()
  /******/
  /************************************************************************/
  /******/
  /******/ // module cache are used so entry inlining is disabled
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ __webpack_require__(0)
  /******/ __webpack_require__(24)
  /******/ var __webpack_exports__ = __webpack_require__(26)
  /******/
  /******/
})()
//# sourceMappingURL=client.js.map
