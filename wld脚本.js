// ==UserScript==
// @name         wld脚本｜学习通｜雨课堂网课助手
// @namespace    wld-script
// @version      0.2.7
// @author       WLD
// @description  学习通与雨课堂的视频/音频自动播放、文档阅读、章节衔接与页面粘贴。
// @icon         https://vitejs.dev/logo.svg
// @match        *://yuketang.cn/*
// @match        *://rainclassroom.com/*
// @match        *://*.chaoxing.com/*
// @match        *://*.yuketang.cn/*
// @match        *://*.rainclassroom.com/*
// @match        *://*.gdufemooc.cn/*
// @match        *://*.edu.cn/*
// @match        *://*.nbdlib.cn/*
// @match         *://*.hnsyu.net/*
// @match        *://*.gdhkmooc.com/*
// @require      https://lib.baomitu.com/vue/3.5.0/vue.global.prod.js
// @require      https://lib.baomitu.com/vue-demi/0.14.7/index.iife.js
// @require      data:application/javascript,window.Vue%3DVue%3B
// @require      https://lib.baomitu.com/element-plus/2.7.2/index.full.min.js
// @require      https://lib.baomitu.com/pinia/2.3.1/pinia.iife.min.js
// @require      https://lib.baomitu.com/rxjs/7.8.2/rxjs.umd.min.js
// @require      https://lib.baomitu.com/blueimp-md5/2.19.0/js/md5.min.js
// @resource     ElementPlus       https://lib.baomitu.com/element-plus/2.7.2/index.css
// @resource     ElementPlusStyle  https://lib.baomitu.com/element-plus/2.8.2/index.min.css
// @resource     ttf               https://www.forestpolice.org/ttf/2.0/table.json
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_setValue
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(e=>{if(typeof GM_addStyle=="function"){GM_addStyle(e);return}const a=document.createElement("style");a.textContent=e,document.head.append(a)})(" .log[data-v-83e6bb0c] el-text{white-space:normal}.setting[data-v-9ea68a6a]{margin-top:-8px;font-size:14px}.setting[data-v-9ea68a6a] .el-form-item[data-v-9ea68a6a]{margin-bottom:0}.main-page{z-index:100003;position:fixed}.main-page .overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:1001}.main-page .el-card .card-header{display:flex;justify-content:space-between;flex-direction:row;align-items:center;margin:0;padding:0;cursor:move}.main-page .el-card .card-header .title{font-size:14px;display:flex;align-items:center;justify-content:center;font-weight:500}.main-page .el-card .minus{margin:5px 10px -10px 0}.main-page .demo-tabs{display:initial}.main-page .el-card__header{background-color:#1f71e0;color:#fff;padding:7px 10px 7px 16px;margin:0}.main-page .el-card__body{padding:0 16px 20px}.main-page .el-tabs__nav-wrap:after{height:1px}.main-page .el-tabs__active-bar{background-color:#176ae5}.main-page .el-tabs__item{font-size:13px;height:34px}.main-page .el-tabs__item.is-top{font-weight:400;color:#4e5969;padding:0 8px 0 12px}.main-page .el-tabs__item.is-active{font-weight:500;color:#176ae5;padding:0 8px 0 12px} ");

(function (vue, pinia, rxjs, md5, ElementPlus) {
  'use strict';

  const isTopWindow = (() => {
    try {
      return window.top === window.self;
    } catch (_error) {
      return true;
    }
  })();
  const YKT_HOST_SUFFIXES = [
    "yuketang.cn",
    "gdufemooc.cn",
    "nbdlib.cn",
    "hnsyu.net",
    "gdhkmooc.com",
    "rainclassroom.com"
  ];
  const YKT_PATH_HINTS = [
    "/web",
    "/v2/web",
    "/pro/lms",
    "/courselist",
    "/course",
    "/lesson",
    "/lesson-report",
    "/video",
    "/learn",
    "/studycontent"
  ];
  const YKT_PAGE_HINT_SELECTORS = [
    ".logs-list",
    ".logsList",
    ".logs_list",
    ".btn-next",
    ".leaf-detail",
    ".leaf_list__wrap",
    "iframe.lesson-report-mobile",
    ".header-bar",
    ".progress-wrap .text",
    ".video-box",
    ".swiper-wrapper",
    ".dialog-header",
    "video",
    "audio",
    "[class*='player']",
    "[class*='video']",
    "[class*='yuketang']",
    "[src*='yuketang']"
  ];
  const ROUTE_CHANGE_EVENT_NAME = "__xuexutongRouteChange__";
  const isLikelyYktHost = (hostname = "") => {
    return YKT_HOST_SUFFIXES.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  };
  const parseUrlSafe = (url, baseUrl = location.origin) => {
    try {
      return new URL(url, baseUrl);
    } catch (_error) {
      return null;
    }
  };
  const matchesYktUrlHints = (parsedUrl) => {
    return !!parsedUrl && (isLikelyYktHost(parsedUrl.hostname) || YKT_PATH_HINTS.some((pathPart) => parsedUrl.pathname.includes(pathPart)));
  };
  const allowFrameRuntime = (() => {
    try {
      const currentUrl = parseUrlSafe(location.href);
      const referrerUrl = parseUrlSafe(document.referrer || "");
      const frameSrcUrl = parseUrlSafe(window.frameElement?.getAttribute("src") || "");
      return matchesYktUrlHints(currentUrl) || matchesYktUrlHints(referrerUrl) || matchesYktUrlHints(frameSrcUrl);
    } catch (_error) {
      return false;
    }
  })();
  if (!isTopWindow && !allowFrameRuntime) {
    return;
  }

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  /*! Element Plus Icons Vue v2.3.2 */
  var _sfc_main89 = /* @__PURE__ */ vue.defineComponent({
    name: "DocumentRemove",
    __name: "document-remove",
    setup(__props) {
      return (_ctx, _cache) => (vue.openBlock(), vue.createElementBlock("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1024 1024"
      }, [
        vue.createElementVNode("path", {
          fill: "currentColor",
          d: "M805.504 320 640 154.496V320zM832 384H576V128H192v768h640zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m192 512h320v64H352z"
        })
      ]));
    }
  }), document_remove_default = _sfc_main89;
  var _sfc_main118 = /* @__PURE__ */ vue.defineComponent({
    name: "FullScreen",
    __name: "full-screen",
    setup(__props) {
      return (_ctx, _cache) => (vue.openBlock(), vue.createElementBlock("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1024 1024"
      }, [
        vue.createElementVNode("path", {
          fill: "currentColor",
          d: "m160 96.064 192 .192a32 32 0 0 1 0 64l-192-.192V352a32 32 0 0 1-64 0V96h64zm0 831.872V928H96V672a32 32 0 1 1 64 0v191.936l192-.192a32 32 0 1 1 0 64zM864 96.064V96h64v256a32 32 0 1 1-64 0V160.064l-192 .192a32 32 0 1 1 0-64zm0 831.872-192-.192a32 32 0 0 1 0-64l192 .192V672a32 32 0 1 1 64 0v256h-64z"
        })
      ]));
    }
  }), full_screen_default = _sfc_main118;
  var _sfc_main169 = /* @__PURE__ */ vue.defineComponent({
    name: "Minus",
    __name: "minus",
    setup(__props) {
      return (_ctx, _cache) => (vue.openBlock(), vue.createElementBlock("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1024 1024"
      }, [
        vue.createElementVNode("path", {
          fill: "currentColor",
          d: "M128 544h768a32 32 0 1 0 0-64H128a32 32 0 0 0 0 64"
        })
      ]));
    }
  }), minus_default = _sfc_main169;
  var _sfc_main203 = /* @__PURE__ */ vue.defineComponent({
    name: "Position",
    __name: "position",
    setup(__props) {
      return (_ctx, _cache) => (vue.openBlock(), vue.createElementBlock("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1024 1024"
      }, [
        vue.createElementVNode("path", {
          fill: "currentColor",
          d: "m249.6 417.088 319.744 43.072 39.168 310.272L845.12 178.88zm-129.024 47.168a32 32 0 0 1-7.68-61.44l777.792-311.04a32 32 0 0 1 41.6 41.6l-310.336 775.68a32 32 0 0 1-61.44-7.808L512 516.992z"
        })
      ]));
    }
  }), position_default = _sfc_main203;
  var _sfc_main231 = /* @__PURE__ */ vue.defineComponent({
    name: "Setting",
    __name: "setting",
    setup(__props) {
      return (_ctx, _cache) => (vue.openBlock(), vue.createElementBlock("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1024 1024"
      }, [
        vue.createElementVNode("path", {
          fill: "currentColor",
          d: "M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357 357 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a352 352 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357 357 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294 294 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293 293 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294 294 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288 288 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293 293 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a288 288 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384m0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256"
        })
      ]));
    }
  }), setting_default = _sfc_main231;
  var _sfc_main283 = /* @__PURE__ */ vue.defineComponent({
    name: "View",
    __name: "view",
    setup(__props) {
      return (_ctx, _cache) => (vue.openBlock(), vue.createElementBlock("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1024 1024"
      }, [
        vue.createElementVNode("path", {
          fill: "currentColor",
          d: "M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352m0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288m0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448m0 64a160.19 160.19 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160"
        })
      ]));
    }
  }), view_default = _sfc_main283;
  var _sfc_main288 = /* @__PURE__ */ vue.defineComponent({
    name: "Warning",
    __name: "warning",
    setup(__props) {
      return (_ctx, _cache) => (vue.openBlock(), vue.createElementBlock("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1024 1024"
      }, [
        vue.createElementVNode("path", {
          fill: "currentColor",
          d: "M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 832a384 384 0 0 0 0-768 384 384 0 0 0 0 768m48-176a48 48 0 1 1-96 0 48 48 0 0 1 96 0m-48-464a32 32 0 0 1 32 32v288a32 32 0 0 1-64 0V288a32 32 0 0 1 32-32"
        })
      ]));
    }
  }), warning_default = _sfc_main288;
  var _GM_getResourceText = /* @__PURE__ */ (() => typeof GM_getResourceText != "undefined" ? GM_getResourceText : void 0)();
  var _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_info = /* @__PURE__ */ (() => typeof GM_info != "undefined" ? GM_info : void 0)();
  var _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  var _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
  const SCRIPT_LIMITS = {
    maxLogCount: 200,
    maxQuestionCount: 120,
    iframeReadyTimeout: 15e3,
    mediaElementTimeout: 9e4,
    logDedupWindow: 2500,
    accessibleDocumentCacheMs: 1200,
    pasteUnlockInterval: 4e3,
    yktBackgroundInterval: 4500,
    observerDebounceMs: 240,
    yktUiSyncInterval: 1200
  };
  const RUNTIME_STATE_KEY = "__xuexutongRuntimeState__";
  const runtimeWindow = _unsafeWindow || window;
  const runtimeState = runtimeWindow[RUNTIME_STATE_KEY] || (runtimeWindow[RUNTIME_STATE_KEY] = {});
  runtimeState.chapterUrlWatcherStarted = runtimeState.chapterUrlWatcherStarted ?? false;
  runtimeState.errorHooked = runtimeState.errorHooked ?? false;
  runtimeState.webpackHooked = runtimeState.webpackHooked ?? false;
  runtimeState.pasteWatcherStarted = runtimeState.pasteWatcherStarted ?? false;
  runtimeState.yktScreenCheckPrevented = runtimeState.yktScreenCheckPrevented ?? false;
  runtimeState.routeWatcherStarted = runtimeState.routeWatcherStarted ?? false;
  runtimeState.routeMutationWatcherStarted = runtimeState.routeMutationWatcherStarted ?? false;
  runtimeState.historyHooked = runtimeState.historyHooked ?? false;
  runtimeState.routeEvaluationTimer = runtimeState.routeEvaluationTimer ?? 0;
  runtimeState.currentRouteLogicKey = runtimeState.currentRouteLogicKey ?? "";
  runtimeState.currentRouteSceneKey = runtimeState.currentRouteSceneKey ?? "";
  runtimeState.logicRunLocks = runtimeState.logicRunLocks && typeof runtimeState.logicRunLocks === "object" ? runtimeState.logicRunLocks : {};
  runtimeState.yktBackgroundWatcherStarted = runtimeState.yktBackgroundWatcherStarted ?? false;
  runtimeState.pasteMutationWatcherStarted = runtimeState.pasteMutationWatcherStarted ?? false;
  runtimeState.yktBackgroundMutationWatcherStarted = runtimeState.yktBackgroundMutationWatcherStarted ?? false;
  runtimeState.accessibleDocuments = Array.isArray(runtimeState.accessibleDocuments) ? runtimeState.accessibleDocuments : [];
  runtimeState.accessibleDocumentsUpdatedAt = runtimeState.accessibleDocumentsUpdatedAt ?? 0;
  runtimeState.accessibleDocumentRefreshTimer = runtimeState.accessibleDocumentRefreshTimer ?? 0;
  runtimeState.pasteUnlockTimer = runtimeState.pasteUnlockTimer ?? 0;
  runtimeState.yktBackgroundSyncTimer = runtimeState.yktBackgroundSyncTimer ?? 0;
  const getScriptInfo = () => {
    return {
      name: _GM_info.script.name,
      author: _GM_info.script.author,
      namespace: _GM_info.script.namespace,
      version: _GM_info.script.version,
      description: _GM_info.script.description
    };
  };
  const useConfigStore = pinia.defineStore("configStore", {
    state: () => {
      const scriptInfo = getScriptInfo();
      const menuIndexMap = {
        "0": "0",
        "1": "0",
        "2": "1",
        "3": "2",
        "4": "3"
      };
      const defaultConfig = {
        version: scriptInfo.version,
        isMinus: false,
        position: {
          x: "800px",
          y: "200px"
        },
        menuIndex: "0",
        platformName: "cx",
        platformParams: {
          cx: {
            name: "超星网课助手",
            parts: [
              {
                name: "章节设置",
                params: [
                  {
                    name: "是否自动下一章节",
                    value: true,
                    type: "boolean"
                  }
                ]
              }
            ]
          },
          ykt: {
            name: "雨课堂网课助手",
            parts: [
              {
                name: "播放设置",
                params: [
                  {
                    name: "视频/音频倍速",
                    value: 2,
                    type: "number",
                    min: 1,
                    max: 16,
                    step: 0.25,
                    precision: 2
                  }
                ]
              },
              {
                name: "课件设置",
                params: [
                  {
                    name: "PPT翻页间隔(毫秒)",
                    value: 3e3,
                    type: "number",
                    min: 1e3,
                    max: 6e4,
                    step: 500
                  }
                ]
              }
            ]
          },
          zhs: {
            name: "智慧树网课助手",
            parts: []
          },
          unknown: {
            name: "未知平台",
            parts: []
          }
        },
        otherParams: {
          name: "当前版本无额外参数",
          params: []
        }
      };
      let globalConfig = JSON.parse(JSON.stringify(defaultConfig));
      const storedConfig = _GM_getValue("config");
      if (storedConfig) {
        try {
          const parsedStoredConfig = JSON.parse(storedConfig);
          const isLegacyAnswerConfig = (parsedStoredConfig.platformParams?.cx?.parts?.[0]?.params?.length || 0) > defaultConfig.platformParams.cx.parts[0].params.length || !!parsedStoredConfig.platformParams?.zhs?.parts?.length || !!parsedStoredConfig.platformParams?.unknown?.parts?.length;
          if (typeof parsedStoredConfig.isMinus === "boolean") {
            globalConfig.isMinus = parsedStoredConfig.isMinus;
          }
          if (parsedStoredConfig.position) {
            globalConfig.position = parsedStoredConfig.position;
          }
          if (typeof parsedStoredConfig.menuIndex === "string") {
            if (isLegacyAnswerConfig) {
              globalConfig.menuIndex = menuIndexMap[parsedStoredConfig.menuIndex] || "0";
            } else if (["0", "1", "2", "3"].includes(parsedStoredConfig.menuIndex)) {
              globalConfig.menuIndex = parsedStoredConfig.menuIndex;
            }
          }
          if (parsedStoredConfig.platformParams) {
            Object.keys(globalConfig.platformParams).forEach((platformKey) => {
              const oldPlatform = parsedStoredConfig.platformParams[platformKey];
              const newPlatform = globalConfig.platformParams[platformKey];
              if (!(oldPlatform && newPlatform)) {
                return;
              }
              newPlatform.parts.forEach((newPart) => {
                const oldPart = oldPlatform.parts?.find((part) => part.name === newPart.name);
                if (!oldPart) {
                  return;
                }
                newPart.params.forEach((newParam) => {
                  const oldParam = oldPart.params?.find((param) => param.name === newParam.name);
                  if (oldParam && "value" in oldParam) {
                    newParam.value = oldParam.value;
                  }
                });
              });
            });
          }
          if (parsedStoredConfig.otherParams && parsedStoredConfig.otherParams.params) {
            globalConfig.otherParams.params.forEach((newParam) => {
              const oldParam = parsedStoredConfig.otherParams.params.find((param) => param.name === newParam.name);
              if (oldParam && "value" in oldParam) {
                newParam.value = oldParam.value;
              }
            });
          }
        } catch (error) {
          console.error(error);
        }
      }
      _GM_setValue("globalConfig", JSON.stringify(globalConfig));
      return globalConfig;
    },
    actions: {}
  });
  const formatDateTime = (dt) => {
    dt.getFullYear();
    dt.getMonth() + 1;
    dt.getDate();
    let hours = dt.getHours();
    let minutes = dt.getMinutes();
    let seconds = dt.getSeconds();
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };
  const pad = (n) => {
    return n < 10 ? "0" + n : n.toString();
  };
  const getDateTime = () => {
    let now = /* @__PURE__ */ new Date();
    return formatDateTime(now);
  };
  const useLogStore = pinia.defineStore("logStore", {
    state: () => ({
      logList: [],
      recentLogMap: {}
    }),
    actions: {
      addLog(message, type, dedupeWindow = SCRIPT_LIMITS.logDedupWindow) {
        const now = Date.now();
        const logKey = `${type || "info"}:${message}`;
        const lastTime = this.recentLogMap[logKey] || 0;
        if (dedupeWindow > 0 && now - lastTime < dedupeWindow) {
          return;
        }
        this.recentLogMap[logKey] = now;
        Object.keys(this.recentLogMap).forEach((key) => {
          if (now - this.recentLogMap[key] > SCRIPT_LIMITS.logDedupWindow * 6) {
            delete this.recentLogMap[key];
          }
        });
        const log = {
          message,
          time: getDateTime(),
          type
        };
        this.logList.push(log);
        if (this.logList.length > SCRIPT_LIMITS.maxLogCount) {
          this.logList.splice(0, this.logList.length - SCRIPT_LIMITS.maxLogCount);
        }
      }
    }
  });
  const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    props: {
      logList: {
        type: Array,
        required: true
      }
    },
    setup(__props) {
      return (_ctx, _cache) => {
        const _component_el_text = vue.resolveComponent("el-text");
        const _component_el_divider = vue.resolveComponent("el-divider");
        const _component_el_scrollbar = vue.resolveComponent("el-scrollbar");
        return vue.openBlock(), vue.createElementBlock("div", null, [
          vue.createVNode(_component_el_scrollbar, {
            always: "",
            class: "log",
            "max-height": "230px"
          }, {
            default: vue.withCtx(() => [
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(__props.logList, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("div", { key: index }, [
                  vue.createVNode(_component_el_text, {
                    size: "small",
                    style: { "font-weight": "normal" },
                    type: "info"
                  }, {
                    default: vue.withCtx(() => [
                      vue.createTextVNode(vue.toDisplayString(item.time), 1)
                    ]),
                    _: 2
                  }, 1024),
                  vue.createVNode(_component_el_text, null, {
                    default: vue.withCtx(() => _cache[0] || (_cache[0] = [
                      vue.createTextVNode(" ")
                    ])),
                    _: 1
                  }),
                  vue.createVNode(_component_el_text, {
                    type: item.type ? item.type : "primary",
                    size: "small",
                    innerHTML: item.message
                  }, null, 8, ["type", "innerHTML"]),
                  vue.createVNode(_component_el_divider, {
                    "border-style": "dashed",
                    style: { "margin": "0" }
                  })
                ]);
              }), 128))
            ]),
            _: 1
          })
        ]);
      };
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const ScriptHome = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-83e6bb0c"]]);
  const _hoisted_1$4 = { class: "setting" };
  const _hoisted_2$2 = { style: { "font-size": "13px" } };
  const _hoisted_3$1 = { style: { "font-size": "13px" } };
  const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    props: {
      globalConfig: {
        type: Object,
        required: true
      }
    },
    setup(__props) {
      return (_ctx, _cache) => {
        const _component_el_divider = vue.resolveComponent("el-divider");
        const _component_el_checkbox = vue.resolveComponent("el-checkbox");
        const _component_el_input_number = vue.resolveComponent("el-input-number");
        const _component_el_form_item = vue.resolveComponent("el-form-item");
        return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$4, [
          (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(__props.globalConfig.platformParams[__props.globalConfig.platformName].parts, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("div", { key: index }, [
              vue.createVNode(_component_el_divider, { "border-style": "dashed" }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode("span", _hoisted_2$2, vue.toDisplayString(item.name), 1)
                ]),
                _: 2
              }, 1024),
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(item.params, (param, index2) => {
                return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
                  param.type === "boolean" ? (vue.openBlock(), vue.createBlock(_component_el_checkbox, {
                    style: { "margin-bottom": "6px" },
                    key: index2,
                    modelValue: param.value,
                    "onUpdate:modelValue": ($event) => param.value = $event,
                    label: param.name,
                    size: "small"
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "label"])) : (vue.openBlock(), vue.createBlock(_component_el_form_item, {
                    key: 1,
                    label: param.name,
                    required: ""
                  }, {
                    default: vue.withCtx(() => [
                      vue.createVNode(_component_el_input_number, {
                        modelValue: param.value,
                        "onUpdate:modelValue": ($event) => param.value = $event,
                        min: param.min ?? 3e3,
                        max: param.max,
                        step: param.step ?? 1e3,
                        precision: param.precision,
                        "controls-position": "right",
                        size: "small"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "min", "max", "step", "precision"])
                    ]),
                    _: 2
                  }, 1032, ["label"]))
                ], 64);
              }), 256))
            ]);
          }), 128)),
          vue.createElementVNode("div", null, [
            vue.createVNode(_component_el_divider, { "border-style": "dashed" }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("span", _hoisted_3$1, vue.toDisplayString(__props.globalConfig.otherParams.name), 1)
              ]),
              _: 1
            }),
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(__props.globalConfig.otherParams.params, (item, index) => {
              return vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: index }, [
                item.type === "boolean" ? (vue.openBlock(), vue.createBlock(_component_el_checkbox, {
                  key: 0,
                  style: { "margin-bottom": "6px" },
                  modelValue: item.value,
                  "onUpdate:modelValue": ($event) => item.value = $event,
                  label: item.name,
                  size: "small"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "label"])) : (vue.openBlock(), vue.createBlock(_component_el_form_item, {
                  key: 1,
                  style: { "margin-top": "6px" },
                  label: item.name,
                  required: "",
                  size: "small"
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_el_input_number, {
                      modelValue: item.value,
                      "onUpdate:modelValue": ($event) => item.value = $event,
                      min: 1,
                      max: 100,
                      step: 1,
                      size: "small"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 2
                }, 1032, ["label"]))
              ], 64);
            }), 128))
          ])
        ]);
      };
    }
  });
  const ScriptSetting = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-9ea68a6a"]]);
  const _sfc_main$5 = {};
  const _hoisted_1$2 = { style: { "font-size": "12px" } };
  function _sfc_render$1(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$2, _cache[0] || (_cache[0] = [
      vue.createElementVNode("p", null, "1、进入课程目录、章节页或播放器页面后，脚本会自动识别。", -1),
      vue.createElementVNode("p", null, "2、学习通支持视频、音频、PPT、文档、电子书和章节衔接。", -1),
      vue.createElementVNode("p", null, "3、章节页遇到未完成作业时，会跳过当前作业任务点并继续后续流程。", -1),
      vue.createElementVNode("p", null, "4、雨课堂采用内容识别和后台跟进，列表页、任务页、播放器页都可持续运行。", -1),
      vue.createElementVNode("p", null, "5、作业页和考试页已启用允许粘贴。", -1),
      vue.createElementVNode("p", null, "6、维护作者为 WLD，感谢 isMobile、风之子、PY-DNG。", -1)
    ]));
  }
  const Tutorial = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$1]]);
  const _sfc_main$4 = {};
  const _hoisted_1$1 = { style: { "font-size": "12px" } };
  function _sfc_render(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$1, _cache[0] || (_cache[0] = [
      vue.createElementVNode("p", null, "1、建议直接在课程目录、章节页或内容页使用。", -1),
      vue.createElementVNode("p", null, "2、雨课堂支持同页切换和延迟加载，进入视频后会继续跟进。", -1),
      vue.createElementVNode("p", null, "3、如果当前页没有挂载面板，刷新当前课程页即可重新识别。", -1),
      vue.createElementVNode("p", null, "4、播放倍速和课件停留时间可在设置页调整。", -1),
      vue.createElementVNode("p", null, "5、反馈问题时附上页面类型和截图，会更容易定位。", -1)
    ]));
  }
  const ScriptTip = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render]]);
  function isFunction(value) {
    return typeof value === "function";
  }
  function hasLift(source) {
    return isFunction(source === null || source === void 0 ? void 0 : source.lift);
  }
  function operate(init) {
    return function(source) {
      if (hasLift(source)) {
        return source.lift(function(liftedSource) {
          try {
            return init(liftedSource, this);
          } catch (err) {
            this.error(err);
          }
        });
      }
      throw new TypeError("Unable to lift unknown Observable type");
    };
  }
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1)
        throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f)
        throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _)
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
            return t;
          if (y = 0, t)
            op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2])
                _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5)
        throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  }
  function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m)
      return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function() {
          if (o && i >= o.length)
            o = void 0;
          return { value: o && o[i++], done: !o };
        }
      };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m)
      return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"]))
          m.call(i);
      } finally {
        if (e)
          throw e.error;
      }
    }
    return ar;
  }
  function __spreadArray(to, from2, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from2.length, ar; i < l; i++) {
        if (ar || !(i in from2)) {
          if (!ar)
            ar = Array.prototype.slice.call(from2, 0, i);
          ar[i] = from2[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from2));
  }
  function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
  }
  function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
      return this;
    }, i;
    function awaitReturn(f) {
      return function(v) {
        return Promise.resolve(v).then(f, reject);
      };
    }
    function verb(n, f) {
      if (g[n]) {
        i[n] = function(v) {
          return new Promise(function(a, b) {
            q.push([n, v, a, b]) > 1 || resume(n, v);
          });
        };
        if (f)
          i[n] = f(i[n]);
      }
    }
    function resume(n, v) {
      try {
        step(g[n](v));
      } catch (e) {
        settle(q[0][3], e);
      }
    }
    function step(r) {
      r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
      resume("next", value);
    }
    function reject(value) {
      resume("throw", value);
    }
    function settle(f, v) {
      if (f(v), q.shift(), q.length)
        resume(q[0][0], q[0][1]);
    }
  }
  function __asyncValues(o) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
      return this;
    }, i);
    function verb(n) {
      i[n] = o[n] && function(v) {
        return new Promise(function(resolve, reject) {
          v = o[n](v), settle(resolve, reject, v.done, v.value);
        });
      };
    }
    function settle(resolve, reject, d, v) {
      Promise.resolve(v).then(function(v2) {
        resolve({ value: v2, done: d });
      }, reject);
    }
  }
  typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };
  var isArrayLike = function(x) {
    return x && typeof x.length === "number" && typeof x !== "function";
  };
  function isPromise(value) {
    return isFunction(value === null || value === void 0 ? void 0 : value.then);
  }
  function createErrorClass(createImpl) {
    var _super = function(instance) {
      Error.call(instance);
      instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
  }
  var UnsubscriptionError = createErrorClass(function(_super) {
    return function UnsubscriptionErrorImpl(errors) {
      _super(this);
      this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i) {
        return i + 1 + ") " + err.toString();
      }).join("\n  ") : "";
      this.name = "UnsubscriptionError";
      this.errors = errors;
    };
  });
  function arrRemove(arr, item) {
    if (arr) {
      var index = arr.indexOf(item);
      0 <= index && arr.splice(index, 1);
    }
  }
  var Subscription = function() {
    function Subscription2(initialTeardown) {
      this.initialTeardown = initialTeardown;
      this.closed = false;
      this._parentage = null;
      this._finalizers = null;
    }
    Subscription2.prototype.unsubscribe = function() {
      var e_1, _a, e_2, _b;
      var errors;
      if (!this.closed) {
        this.closed = true;
        var _parentage = this._parentage;
        if (_parentage) {
          this._parentage = null;
          if (Array.isArray(_parentage)) {
            try {
              for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                var parent_1 = _parentage_1_1.value;
                parent_1.remove(this);
              }
            } catch (e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return))
                  _a.call(_parentage_1);
              } finally {
                if (e_1)
                  throw e_1.error;
              }
            }
          } else {
            _parentage.remove(this);
          }
        }
        var initialFinalizer = this.initialTeardown;
        if (isFunction(initialFinalizer)) {
          try {
            initialFinalizer();
          } catch (e) {
            errors = e instanceof UnsubscriptionError ? e.errors : [e];
          }
        }
        var _finalizers = this._finalizers;
        if (_finalizers) {
          this._finalizers = null;
          try {
            for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
              var finalizer = _finalizers_1_1.value;
              try {
                execFinalizer(finalizer);
              } catch (err) {
                errors = errors !== null && errors !== void 0 ? errors : [];
                if (err instanceof UnsubscriptionError) {
                  errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                } else {
                  errors.push(err);
                }
              }
            }
          } catch (e_2_1) {
            e_2 = { error: e_2_1 };
          } finally {
            try {
              if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return))
                _b.call(_finalizers_1);
            } finally {
              if (e_2)
                throw e_2.error;
            }
          }
        }
        if (errors) {
          throw new UnsubscriptionError(errors);
        }
      }
    };
    Subscription2.prototype.add = function(teardown) {
      var _a;
      if (teardown && teardown !== this) {
        if (this.closed) {
          execFinalizer(teardown);
        } else {
          if (teardown instanceof Subscription2) {
            if (teardown.closed || teardown._hasParent(this)) {
              return;
            }
            teardown._addParent(this);
          }
          (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
        }
      }
    };
    Subscription2.prototype._hasParent = function(parent) {
      var _parentage = this._parentage;
      return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
    };
    Subscription2.prototype._addParent = function(parent) {
      var _parentage = this._parentage;
      this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription2.prototype._removeParent = function(parent) {
      var _parentage = this._parentage;
      if (_parentage === parent) {
        this._parentage = null;
      } else if (Array.isArray(_parentage)) {
        arrRemove(_parentage, parent);
      }
    };
    Subscription2.prototype.remove = function(teardown) {
      var _finalizers = this._finalizers;
      _finalizers && arrRemove(_finalizers, teardown);
      if (teardown instanceof Subscription2) {
        teardown._removeParent(this);
      }
    };
    Subscription2.EMPTY = function() {
      var empty = new Subscription2();
      empty.closed = true;
      return empty;
    }();
    return Subscription2;
  }();
  Subscription.EMPTY;
  function isSubscription(value) {
    return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
  }
  function execFinalizer(finalizer) {
    if (isFunction(finalizer)) {
      finalizer();
    } else {
      finalizer.unsubscribe();
    }
  }
  var config = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: void 0,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false
  };
  var timeoutProvider = {
    setTimeout: function(handler, timeout) {
      var args = [];
      for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
      }
      return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
    },
    clearTimeout: function(handle) {
      return (clearTimeout)(handle);
    },
    delegate: void 0
  };
  function reportUnhandledError(err) {
    timeoutProvider.setTimeout(function() {
      {
        throw err;
      }
    });
  }
  function noop() {
  }
  function errorContext(cb) {
    {
      cb();
    }
  }
  var Subscriber = function(_super) {
    __extends(Subscriber2, _super);
    function Subscriber2(destination) {
      var _this = _super.call(this) || this;
      _this.isStopped = false;
      if (destination) {
        _this.destination = destination;
        if (isSubscription(destination)) {
          destination.add(_this);
        }
      } else {
        _this.destination = EMPTY_OBSERVER;
      }
      return _this;
    }
    Subscriber2.create = function(next, error, complete) {
      return new SafeSubscriber(next, error, complete);
    };
    Subscriber2.prototype.next = function(value) {
      if (this.isStopped)
        ;
      else {
        this._next(value);
      }
    };
    Subscriber2.prototype.error = function(err) {
      if (this.isStopped)
        ;
      else {
        this.isStopped = true;
        this._error(err);
      }
    };
    Subscriber2.prototype.complete = function() {
      if (this.isStopped)
        ;
      else {
        this.isStopped = true;
        this._complete();
      }
    };
    Subscriber2.prototype.unsubscribe = function() {
      if (!this.closed) {
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
        this.destination = null;
      }
    };
    Subscriber2.prototype._next = function(value) {
      this.destination.next(value);
    };
    Subscriber2.prototype._error = function(err) {
      try {
        this.destination.error(err);
      } finally {
        this.unsubscribe();
      }
    };
    Subscriber2.prototype._complete = function() {
      try {
        this.destination.complete();
      } finally {
        this.unsubscribe();
      }
    };
    return Subscriber2;
  }(Subscription);
  var _bind = Function.prototype.bind;
  function bind(fn, thisArg) {
    return _bind.call(fn, thisArg);
  }
  var ConsumerObserver = function() {
    function ConsumerObserver2(partialObserver) {
      this.partialObserver = partialObserver;
    }
    ConsumerObserver2.prototype.next = function(value) {
      var partialObserver = this.partialObserver;
      if (partialObserver.next) {
        try {
          partialObserver.next(value);
        } catch (error) {
          handleUnhandledError(error);
        }
      }
    };
    ConsumerObserver2.prototype.error = function(err) {
      var partialObserver = this.partialObserver;
      if (partialObserver.error) {
        try {
          partialObserver.error(err);
        } catch (error) {
          handleUnhandledError(error);
        }
      } else {
        handleUnhandledError(err);
      }
    };
    ConsumerObserver2.prototype.complete = function() {
      var partialObserver = this.partialObserver;
      if (partialObserver.complete) {
        try {
          partialObserver.complete();
        } catch (error) {
          handleUnhandledError(error);
        }
      }
    };
    return ConsumerObserver2;
  }();
  var SafeSubscriber = function(_super) {
    __extends(SafeSubscriber2, _super);
    function SafeSubscriber2(observerOrNext, error, complete) {
      var _this = _super.call(this) || this;
      var partialObserver;
      if (isFunction(observerOrNext) || !observerOrNext) {
        partialObserver = {
          next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
          error: error !== null && error !== void 0 ? error : void 0,
          complete: complete !== null && complete !== void 0 ? complete : void 0
        };
      } else {
        var context_1;
        if (_this && config.useDeprecatedNextContext) {
          context_1 = Object.create(observerOrNext);
          context_1.unsubscribe = function() {
            return _this.unsubscribe();
          };
          partialObserver = {
            next: observerOrNext.next && bind(observerOrNext.next, context_1),
            error: observerOrNext.error && bind(observerOrNext.error, context_1),
            complete: observerOrNext.complete && bind(observerOrNext.complete, context_1)
          };
        } else {
          partialObserver = observerOrNext;
        }
      }
      _this.destination = new ConsumerObserver(partialObserver);
      return _this;
    }
    return SafeSubscriber2;
  }(Subscriber);
  function handleUnhandledError(error) {
    {
      reportUnhandledError(error);
    }
  }
  function defaultErrorHandler(err) {
    throw err;
  }
  var EMPTY_OBSERVER = {
    closed: true,
    next: noop,
    error: defaultErrorHandler,
    complete: noop
  };
  var observable = function() {
    return typeof Symbol === "function" && Symbol.observable || "@@observable";
  }();
  function identity(x) {
    return x;
  }
  function pipeFromArray(fns) {
    if (fns.length === 0) {
      return identity;
    }
    if (fns.length === 1) {
      return fns[0];
    }
    return function piped(input) {
      return fns.reduce(function(prev, fn) {
        return fn(prev);
      }, input);
    };
  }
  var Observable = function() {
    function Observable2(subscribe) {
      if (subscribe) {
        this._subscribe = subscribe;
      }
    }
    Observable2.prototype.lift = function(operator) {
      var observable2 = new Observable2();
      observable2.source = this;
      observable2.operator = operator;
      return observable2;
    };
    Observable2.prototype.subscribe = function(observerOrNext, error, complete) {
      var _this = this;
      var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
      errorContext(function() {
        var _a = _this, operator = _a.operator, source = _a.source;
        subscriber.add(operator ? operator.call(subscriber, source) : source ? _this._subscribe(subscriber) : _this._trySubscribe(subscriber));
      });
      return subscriber;
    };
    Observable2.prototype._trySubscribe = function(sink) {
      try {
        return this._subscribe(sink);
      } catch (err) {
        sink.error(err);
      }
    };
    Observable2.prototype.forEach = function(next, promiseCtor) {
      var _this = this;
      promiseCtor = getPromiseCtor(promiseCtor);
      return new promiseCtor(function(resolve, reject) {
        var subscriber = new SafeSubscriber({
          next: function(value) {
            try {
              next(value);
            } catch (err) {
              reject(err);
              subscriber.unsubscribe();
            }
          },
          error: reject,
          complete: resolve
        });
        _this.subscribe(subscriber);
      });
    };
    Observable2.prototype._subscribe = function(subscriber) {
      var _a;
      return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
    };
    Observable2.prototype[observable] = function() {
      return this;
    };
    Observable2.prototype.pipe = function() {
      var operations = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        operations[_i] = arguments[_i];
      }
      return pipeFromArray(operations)(this);
    };
    Observable2.prototype.toPromise = function(promiseCtor) {
      var _this = this;
      promiseCtor = getPromiseCtor(promiseCtor);
      return new promiseCtor(function(resolve, reject) {
        var value;
        _this.subscribe(function(x) {
          return value = x;
        }, function(err) {
          return reject(err);
        }, function() {
          return resolve(value);
        });
      });
    };
    Observable2.create = function(subscribe) {
      return new Observable2(subscribe);
    };
    return Observable2;
  }();
  function getPromiseCtor(promiseCtor) {
    var _a;
    return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
  }
  function isObserver(value) {
    return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
  }
  function isSubscriber(value) {
    return value && value instanceof Subscriber || isObserver(value) && isSubscription(value);
  }
  function isInteropObservable(input) {
    return isFunction(input[observable]);
  }
  function isAsyncIterable(obj) {
    return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
  }
  function createInvalidObservableTypeError(input) {
    return new TypeError("You provided " + (input !== null && typeof input === "object" ? "an invalid object" : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
  }
  function getSymbolIterator() {
    if (typeof Symbol !== "function" || !Symbol.iterator) {
      return "@@iterator";
    }
    return Symbol.iterator;
  }
  var iterator = getSymbolIterator();
  function isIterable(input) {
    return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
  }
  function readableStreamLikeToAsyncGenerator(readableStream) {
    return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
      var reader, _a, value, done;
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            reader = readableStream.getReader();
            _b.label = 1;
          case 1:
            _b.trys.push([1, , 9, 10]);
            _b.label = 2;
          case 2:
            return [4, __await(reader.read())];
          case 3:
            _a = _b.sent(), value = _a.value, done = _a.done;
            if (!done)
              return [3, 5];
            return [4, __await(void 0)];
          case 4:
            return [2, _b.sent()];
          case 5:
            return [4, __await(value)];
          case 6:
            return [4, _b.sent()];
          case 7:
            _b.sent();
            return [3, 2];
          case 8:
            return [3, 10];
          case 9:
            reader.releaseLock();
            return [7];
          case 10:
            return [2];
        }
      });
    });
  }
  function isReadableStreamLike(obj) {
    return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
  }
  function innerFrom(input) {
    if (input instanceof Observable) {
      return input;
    }
    if (input != null) {
      if (isInteropObservable(input)) {
        return fromInteropObservable(input);
      }
      if (isArrayLike(input)) {
        return fromArrayLike(input);
      }
      if (isPromise(input)) {
        return fromPromise(input);
      }
      if (isAsyncIterable(input)) {
        return fromAsyncIterable(input);
      }
      if (isIterable(input)) {
        return fromIterable(input);
      }
      if (isReadableStreamLike(input)) {
        return fromReadableStreamLike(input);
      }
    }
    throw createInvalidObservableTypeError(input);
  }
  function fromInteropObservable(obj) {
    return new Observable(function(subscriber) {
      var obs = obj[observable]();
      if (isFunction(obs.subscribe)) {
        return obs.subscribe(subscriber);
      }
      throw new TypeError("Provided object does not correctly implement Symbol.observable");
    });
  }
  function fromArrayLike(array) {
    return new Observable(function(subscriber) {
      for (var i = 0; i < array.length && !subscriber.closed; i++) {
        subscriber.next(array[i]);
      }
      subscriber.complete();
    });
  }
  function fromPromise(promise) {
    return new Observable(function(subscriber) {
      promise.then(function(value) {
        if (!subscriber.closed) {
          subscriber.next(value);
          subscriber.complete();
        }
      }, function(err) {
        return subscriber.error(err);
      }).then(null, reportUnhandledError);
    });
  }
  function fromIterable(iterable) {
    return new Observable(function(subscriber) {
      var e_1, _a;
      try {
        for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
          var value = iterable_1_1.value;
          subscriber.next(value);
          if (subscriber.closed) {
            return;
          }
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return))
            _a.call(iterable_1);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
      subscriber.complete();
    });
  }
  function fromAsyncIterable(asyncIterable) {
    return new Observable(function(subscriber) {
      process(asyncIterable, subscriber).catch(function(err) {
        return subscriber.error(err);
      });
    });
  }
  function fromReadableStreamLike(readableStream) {
    return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
  }
  function process(asyncIterable, subscriber) {
    var asyncIterable_1, asyncIterable_1_1;
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function() {
      var value, e_2_1;
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, 6, 11]);
            asyncIterable_1 = __asyncValues(asyncIterable);
            _b.label = 1;
          case 1:
            return [4, asyncIterable_1.next()];
          case 2:
            if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done))
              return [3, 4];
            value = asyncIterable_1_1.value;
            subscriber.next(value);
            if (subscriber.closed) {
              return [2];
            }
            _b.label = 3;
          case 3:
            return [3, 1];
          case 4:
            return [3, 11];
          case 5:
            e_2_1 = _b.sent();
            e_2 = { error: e_2_1 };
            return [3, 11];
          case 6:
            _b.trys.push([6, , 9, 10]);
            if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return)))
              return [3, 8];
            return [4, _a.call(asyncIterable_1)];
          case 7:
            _b.sent();
            _b.label = 8;
          case 8:
            return [3, 10];
          case 9:
            if (e_2)
              throw e_2.error;
            return [7];
          case 10:
            return [7];
          case 11:
            subscriber.complete();
            return [2];
        }
      });
    });
  }
  function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
    return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
  }
  var OperatorSubscriber = function(_super) {
    __extends(OperatorSubscriber2, _super);
    function OperatorSubscriber2(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
      var _this = _super.call(this, destination) || this;
      _this.onFinalize = onFinalize;
      _this.shouldUnsubscribe = shouldUnsubscribe;
      _this._next = onNext ? function(value) {
        try {
          onNext(value);
        } catch (err) {
          destination.error(err);
        }
      } : _super.prototype._next;
      _this._error = onError ? function(err) {
        try {
          onError(err);
        } catch (err2) {
          destination.error(err2);
        } finally {
          this.unsubscribe();
        }
      } : _super.prototype._error;
      _this._complete = onComplete ? function() {
        try {
          onComplete();
        } catch (err) {
          destination.error(err);
        } finally {
          this.unsubscribe();
        }
      } : _super.prototype._complete;
      return _this;
    }
    OperatorSubscriber2.prototype.unsubscribe = function() {
      var _a;
      if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
        var closed_1 = this.closed;
        _super.prototype.unsubscribe.call(this);
        !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
      }
    };
    return OperatorSubscriber2;
  }(Subscriber);
  function executeSchedule(parentSubscription, scheduler, work, delay, repeat) {
    if (delay === void 0) {
      delay = 0;
    }
    if (repeat === void 0) {
      repeat = false;
    }
    var scheduleSubscription = scheduler.schedule(function() {
      work();
      if (repeat) {
        parentSubscription.add(this.schedule(null, delay));
      } else {
        this.unsubscribe();
      }
    }, delay);
    parentSubscription.add(scheduleSubscription);
    if (!repeat) {
      return scheduleSubscription;
    }
  }
  function map(project, thisArg) {
    return operate(function(source, subscriber) {
      var index = 0;
      source.subscribe(createOperatorSubscriber(subscriber, function(value) {
        subscriber.next(project.call(thisArg, value, index++));
      }));
    });
  }
  function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalFinalizer) {
    var buffer = [];
    var active = 0;
    var index = 0;
    var isComplete = false;
    var checkComplete = function() {
      if (isComplete && !buffer.length && !active) {
        subscriber.complete();
      }
    };
    var outerNext = function(value) {
      return active < concurrent ? doInnerSub(value) : buffer.push(value);
    };
    var doInnerSub = function(value) {
      expand && subscriber.next(value);
      active++;
      var innerComplete = false;
      innerFrom(project(value, index++)).subscribe(createOperatorSubscriber(subscriber, function(innerValue) {
        onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
        if (expand) {
          outerNext(innerValue);
        } else {
          subscriber.next(innerValue);
        }
      }, function() {
        innerComplete = true;
      }, void 0, function() {
        if (innerComplete) {
          try {
            active--;
            var _loop_1 = function() {
              var bufferedValue = buffer.shift();
              if (innerSubScheduler) {
                executeSchedule(subscriber, innerSubScheduler, function() {
                  return doInnerSub(bufferedValue);
                });
              } else {
                doInnerSub(bufferedValue);
              }
            };
            while (buffer.length && active < concurrent) {
              _loop_1();
            }
            checkComplete();
          } catch (err) {
            subscriber.error(err);
          }
        }
      }));
    };
    source.subscribe(createOperatorSubscriber(subscriber, outerNext, function() {
      isComplete = true;
      checkComplete();
    }));
    return function() {
      additionalFinalizer === null || additionalFinalizer === void 0 ? void 0 : additionalFinalizer();
    };
  }
  function mergeMap(project, resultSelector, concurrent) {
    if (concurrent === void 0) {
      concurrent = Infinity;
    }
    if (isFunction(resultSelector)) {
      return mergeMap(function(a, i) {
        return map(function(b, ii) {
          return resultSelector(a, b, i, ii);
        })(innerFrom(project(a, i)));
      }, concurrent);
    } else if (typeof resultSelector === "number") {
      concurrent = resultSelector;
    }
    return operate(function(source, subscriber) {
      return mergeInternals(source, subscriber, project, concurrent);
    });
  }
  function mergeAll(concurrent) {
    if (concurrent === void 0) {
      concurrent = Infinity;
    }
    return mergeMap(identity, concurrent);
  }
  function concatAll() {
    return mergeAll(1);
  }
  function concatMap(project, resultSelector) {
    return isFunction(resultSelector) ? mergeMap(project, resultSelector, 1) : mergeMap(project, 1);
  }
  class IframeUtils {
    static getIframes(element) {
      return Array.from(element.querySelectorAll("iframe"));
    }
    static getAllNestedIframes(element) {
      const iframes = IframeUtils.getIframes(element);
      if (iframes.length === 0) {
        return rxjs.of([]);
      } else {
        return rxjs.from(iframes).pipe(
          mergeMap(
            (iframe) => new rxjs.Observable((subscriber) => {
              if (iframe.contentDocument) {
                const iframeDocument = iframe.contentDocument;
                const nestedIframes = IframeUtils.getAllNestedIframes(iframeDocument.documentElement);
                nestedIframes.subscribe((nestedIframes2) => {
                  subscriber.next([iframe, ...nestedIframes2]);
                  subscriber.complete();
                });
              } else {
                subscriber.next([]);
                subscriber.complete();
              }
            })
          ),
          concatAll(),
          rxjs.toArray()
        );
      }
    }
  }
  var Typr$1 = {};
  var Typr = {};
  Typr.parse = function(buff) {
    var bin = Typr._bin;
    var data = new Uint8Array(buff);
    var tag = bin.readASCII(data, 0, 4);
    if (tag == "ttcf") {
      var offset = 4;
      bin.readUshort(data, offset);
      offset += 2;
      bin.readUshort(data, offset);
      offset += 2;
      var numF = bin.readUint(data, offset);
      offset += 4;
      var fnts = [];
      for (var i = 0; i < numF; i++) {
        var foff = bin.readUint(data, offset);
        offset += 4;
        fnts.push(Typr._readFont(data, foff));
      }
      return fnts;
    } else
      return [Typr._readFont(data, 0)];
  };
  Typr._readFont = function(data, offset) {
    var bin = Typr._bin;
    var ooff = offset;
    bin.readFixed(data, offset);
    offset += 4;
    var numTables = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    var tags = [
      "cmap",
      "head",
      "hhea",
      "maxp",
      "hmtx",
      "name",
      "OS/2",
      "post",
      //"cvt",
      //"fpgm",
      "loca",
      "glyf",
      "kern",
      //"prep"
      //"gasp"
      "CFF ",
      "GPOS",
      "GSUB",
      "SVG "
      //"VORG",
    ];
    var obj = { _data: data, _offset: ooff };
    var tabs = {};
    for (var i = 0; i < numTables; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      bin.readUint(data, offset);
      offset += 4;
      var toffset = bin.readUint(data, offset);
      offset += 4;
      var length = bin.readUint(data, offset);
      offset += 4;
      tabs[tag] = { offset: toffset, length };
    }
    for (var i = 0; i < tags.length; i++) {
      var t = tags[i];
      if (tabs[t])
        obj[t.trim()] = Typr[t.trim()].parse(data, tabs[t].offset, tabs[t].length, obj);
    }
    return obj;
  };
  Typr._tabOffset = function(data, tab, foff) {
    var bin = Typr._bin;
    var numTables = bin.readUshort(data, foff + 4);
    var offset = foff + 12;
    for (var i = 0; i < numTables; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      bin.readUint(data, offset);
      offset += 4;
      var toffset = bin.readUint(data, offset);
      offset += 4;
      bin.readUint(data, offset);
      offset += 4;
      if (tag == tab)
        return toffset;
    }
    return 0;
  };
  Typr._bin = {
    readFixed: function(data, o) {
      return (data[o] << 8 | data[o + 1]) + (data[o + 2] << 8 | data[o + 3]) / (256 * 256 + 4);
    },
    readF2dot14: function(data, o) {
      var num = Typr._bin.readShort(data, o);
      return num / 16384;
    },
    readInt: function(buff, p) {
      return Typr._bin._view(buff).getInt32(p);
    },
    readInt8: function(buff, p) {
      return Typr._bin._view(buff).getInt8(p);
    },
    readShort: function(buff, p) {
      return Typr._bin._view(buff).getInt16(p);
    },
    readUshort: function(buff, p) {
      return Typr._bin._view(buff).getUint16(p);
    },
    readUshorts: function(buff, p, len) {
      var arr = [];
      for (var i = 0; i < len; i++)
        arr.push(Typr._bin.readUshort(buff, p + i * 2));
      return arr;
    },
    readUint: function(buff, p) {
      return Typr._bin._view(buff).getUint32(p);
    },
    readUint64: function(buff, p) {
      return Typr._bin.readUint(buff, p) * (4294967295 + 1) + Typr._bin.readUint(buff, p + 4);
    },
    readASCII: function(buff, p, l) {
      var s = "";
      for (var i = 0; i < l; i++)
        s += String.fromCharCode(buff[p + i]);
      return s;
    },
    readUnicode: function(buff, p, l) {
      var s = "";
      for (var i = 0; i < l; i++) {
        var c = buff[p++] << 8 | buff[p++];
        s += String.fromCharCode(c);
      }
      return s;
    },
    _tdec: typeof window !== "undefined" && window["TextDecoder"] ? new window["TextDecoder"]() : null,
    readUTF8: function(buff, p, l) {
      var tdec = Typr._bin._tdec;
      if (tdec && p == 0 && l == buff.length)
        return tdec["decode"](buff);
      return Typr._bin.readASCII(buff, p, l);
    },
    readBytes: function(buff, p, l) {
      var arr = [];
      for (var i = 0; i < l; i++)
        arr.push(buff[p + i]);
      return arr;
    },
    readASCIIArray: function(buff, p, l) {
      var s = [];
      for (var i = 0; i < l; i++)
        s.push(String.fromCharCode(buff[p + i]));
      return s;
    },
    _view: function(buff) {
      return buff._dataView || (buff._dataView = buff.buffer ? new DataView(buff.buffer, buff.byteOffset, buff.byteLength) : new DataView(new Uint8Array(buff).buffer));
    }
  };
  Typr._lctf = {};
  Typr._lctf.parse = function(data, offset, length, font, subt) {
    var bin = Typr._bin;
    var obj = {};
    var offset0 = offset;
    bin.readFixed(data, offset);
    offset += 4;
    var offScriptList = bin.readUshort(data, offset);
    offset += 2;
    var offFeatureList = bin.readUshort(data, offset);
    offset += 2;
    var offLookupList = bin.readUshort(data, offset);
    offset += 2;
    obj.scriptList = Typr._lctf.readScriptList(data, offset0 + offScriptList);
    obj.featureList = Typr._lctf.readFeatureList(data, offset0 + offFeatureList);
    obj.lookupList = Typr._lctf.readLookupList(data, offset0 + offLookupList, subt);
    return obj;
  };
  Typr._lctf.readLookupList = function(data, offset, subt) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = [];
    var count = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < count; i++) {
      var noff = bin.readUshort(data, offset);
      offset += 2;
      var lut = Typr._lctf.readLookupTable(data, offset0 + noff, subt);
      obj.push(lut);
    }
    return obj;
  };
  Typr._lctf.readLookupTable = function(data, offset, subt) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = { tabs: [] };
    obj.ltype = bin.readUshort(data, offset);
    offset += 2;
    obj.flag = bin.readUshort(data, offset);
    offset += 2;
    var cnt = bin.readUshort(data, offset);
    offset += 2;
    var ltype = obj.ltype;
    for (var i = 0; i < cnt; i++) {
      var noff = bin.readUshort(data, offset);
      offset += 2;
      var tab = subt(data, ltype, offset0 + noff, obj);
      obj.tabs.push(tab);
    }
    return obj;
  };
  Typr._lctf.numOfOnes = function(n) {
    var num = 0;
    for (var i = 0; i < 32; i++)
      if ((n >>> i & 1) != 0)
        num++;
    return num;
  };
  Typr._lctf.readClassDef = function(data, offset) {
    var bin = Typr._bin;
    var obj = [];
    var format = bin.readUshort(data, offset);
    offset += 2;
    if (format == 1) {
      var startGlyph = bin.readUshort(data, offset);
      offset += 2;
      var glyphCount = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < glyphCount; i++) {
        obj.push(startGlyph + i);
        obj.push(startGlyph + i);
        obj.push(bin.readUshort(data, offset));
        offset += 2;
      }
    }
    if (format == 2) {
      var count = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < count; i++) {
        obj.push(bin.readUshort(data, offset));
        offset += 2;
        obj.push(bin.readUshort(data, offset));
        offset += 2;
        obj.push(bin.readUshort(data, offset));
        offset += 2;
      }
    }
    return obj;
  };
  Typr._lctf.getInterval = function(tab, val) {
    for (var i = 0; i < tab.length; i += 3) {
      var start = tab[i], end = tab[i + 1];
      tab[i + 2];
      if (start <= val && val <= end)
        return i;
    }
    return -1;
  };
  Typr._lctf.readCoverage = function(data, offset) {
    var bin = Typr._bin;
    var cvg = {};
    cvg.fmt = bin.readUshort(data, offset);
    offset += 2;
    var count = bin.readUshort(data, offset);
    offset += 2;
    if (cvg.fmt == 1)
      cvg.tab = bin.readUshorts(data, offset, count);
    if (cvg.fmt == 2)
      cvg.tab = bin.readUshorts(data, offset, count * 3);
    return cvg;
  };
  Typr._lctf.coverageIndex = function(cvg, val) {
    var tab = cvg.tab;
    if (cvg.fmt == 1)
      return tab.indexOf(val);
    if (cvg.fmt == 2) {
      var ind = Typr._lctf.getInterval(tab, val);
      if (ind != -1)
        return tab[ind + 2] + (val - tab[ind]);
    }
    return -1;
  };
  Typr._lctf.readFeatureList = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = [];
    var count = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < count; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      var noff = bin.readUshort(data, offset);
      offset += 2;
      var feat = Typr._lctf.readFeatureTable(data, offset0 + noff);
      feat.tag = tag.trim();
      obj.push(feat);
    }
    return obj;
  };
  Typr._lctf.readFeatureTable = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var feat = {};
    var featureParams = bin.readUshort(data, offset);
    offset += 2;
    if (featureParams > 0) {
      feat.featureParams = offset0 + featureParams;
    }
    var lookupCount = bin.readUshort(data, offset);
    offset += 2;
    feat.tab = [];
    for (var i = 0; i < lookupCount; i++)
      feat.tab.push(bin.readUshort(data, offset + 2 * i));
    return feat;
  };
  Typr._lctf.readScriptList = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    var count = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < count; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      var noff = bin.readUshort(data, offset);
      offset += 2;
      obj[tag.trim()] = Typr._lctf.readScriptTable(data, offset0 + noff);
    }
    return obj;
  };
  Typr._lctf.readScriptTable = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    var defLangSysOff = bin.readUshort(data, offset);
    offset += 2;
    if (defLangSysOff > 0) {
      obj["default"] = Typr._lctf.readLangSysTable(data, offset0 + defLangSysOff);
    }
    var langSysCount = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < langSysCount; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      var langSysOff = bin.readUshort(data, offset);
      offset += 2;
      obj[tag.trim()] = Typr._lctf.readLangSysTable(data, offset0 + langSysOff);
    }
    return obj;
  };
  Typr._lctf.readLangSysTable = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    bin.readUshort(data, offset);
    offset += 2;
    obj.reqFeature = bin.readUshort(data, offset);
    offset += 2;
    var featureCount = bin.readUshort(data, offset);
    offset += 2;
    obj.features = bin.readUshorts(data, offset, featureCount);
    return obj;
  };
  Typr.CFF = {};
  Typr.CFF.parse = function(data, offset, length) {
    var bin = Typr._bin;
    data = new Uint8Array(data.buffer, offset, length);
    offset = 0;
    data[offset];
    offset++;
    data[offset];
    offset++;
    data[offset];
    offset++;
    data[offset];
    offset++;
    var ninds = [];
    offset = Typr.CFF.readIndex(data, offset, ninds);
    var names = [];
    for (var i = 0; i < ninds.length - 1; i++)
      names.push(bin.readASCII(data, offset + ninds[i], ninds[i + 1] - ninds[i]));
    offset += ninds[ninds.length - 1];
    var tdinds = [];
    offset = Typr.CFF.readIndex(data, offset, tdinds);
    var topDicts = [];
    for (var i = 0; i < tdinds.length - 1; i++)
      topDicts.push(Typr.CFF.readDict(data, offset + tdinds[i], offset + tdinds[i + 1]));
    offset += tdinds[tdinds.length - 1];
    var topdict = topDicts[0];
    var sinds = [];
    offset = Typr.CFF.readIndex(data, offset, sinds);
    var strings = [];
    for (var i = 0; i < sinds.length - 1; i++)
      strings.push(bin.readASCII(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
    offset += sinds[sinds.length - 1];
    Typr.CFF.readSubrs(data, offset, topdict);
    if (topdict.CharStrings) {
      offset = topdict.CharStrings;
      var sinds = [];
      offset = Typr.CFF.readIndex(data, offset, sinds);
      var cstr = [];
      for (var i = 0; i < sinds.length - 1; i++)
        cstr.push(bin.readBytes(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
      topdict.CharStrings = cstr;
    }
    if (topdict.ROS) {
      offset = topdict.FDArray;
      var fdind = [];
      offset = Typr.CFF.readIndex(data, offset, fdind);
      topdict.FDArray = [];
      for (var i = 0; i < fdind.length - 1; i++) {
        var dict = Typr.CFF.readDict(data, offset + fdind[i], offset + fdind[i + 1]);
        Typr.CFF._readFDict(data, dict, strings);
        topdict.FDArray.push(dict);
      }
      offset += fdind[fdind.length - 1];
      offset = topdict.FDSelect;
      topdict.FDSelect = [];
      var fmt = data[offset];
      offset++;
      if (fmt == 3) {
        var rns = bin.readUshort(data, offset);
        offset += 2;
        for (var i = 0; i < rns + 1; i++) {
          topdict.FDSelect.push(bin.readUshort(data, offset), data[offset + 2]);
          offset += 3;
        }
      } else
        throw fmt;
    }
    if (topdict.Encoding)
      topdict.Encoding = Typr.CFF.readEncoding(data, topdict.Encoding, topdict.CharStrings.length);
    if (topdict.charset)
      topdict.charset = Typr.CFF.readCharset(data, topdict.charset, topdict.CharStrings.length);
    Typr.CFF._readFDict(data, topdict, strings);
    return topdict;
  };
  Typr.CFF._readFDict = function(data, dict, ss) {
    var offset;
    if (dict.Private) {
      offset = dict.Private[1];
      dict.Private = Typr.CFF.readDict(data, offset, offset + dict.Private[0]);
      if (dict.Private.Subrs)
        Typr.CFF.readSubrs(data, offset + dict.Private.Subrs, dict.Private);
    }
    for (var p in dict)
      if (["FamilyName", "FontName", "FullName", "Notice", "version", "Copyright"].indexOf(p) != -1)
        dict[p] = ss[dict[p] - 426 + 35];
  };
  Typr.CFF.readSubrs = function(data, offset, obj) {
    var bin = Typr._bin;
    var gsubinds = [];
    offset = Typr.CFF.readIndex(data, offset, gsubinds);
    var bias, nSubrs = gsubinds.length;
    if (nSubrs < 1240)
      bias = 107;
    else if (nSubrs < 33900)
      bias = 1131;
    else
      bias = 32768;
    obj.Bias = bias;
    obj.Subrs = [];
    for (var i = 0; i < gsubinds.length - 1; i++)
      obj.Subrs.push(bin.readBytes(data, offset + gsubinds[i], gsubinds[i + 1] - gsubinds[i]));
  };
  Typr.CFF.tableSE = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    64,
    65,
    66,
    67,
    68,
    69,
    70,
    71,
    72,
    73,
    74,
    75,
    76,
    77,
    78,
    79,
    80,
    81,
    82,
    83,
    84,
    85,
    86,
    87,
    88,
    89,
    90,
    91,
    92,
    93,
    94,
    95,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    96,
    97,
    98,
    99,
    100,
    101,
    102,
    103,
    104,
    105,
    106,
    107,
    108,
    109,
    110,
    0,
    111,
    112,
    113,
    114,
    0,
    115,
    116,
    117,
    118,
    119,
    120,
    121,
    122,
    0,
    123,
    0,
    124,
    125,
    126,
    127,
    128,
    129,
    130,
    131,
    0,
    132,
    133,
    0,
    134,
    135,
    136,
    137,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    138,
    0,
    139,
    0,
    0,
    0,
    0,
    140,
    141,
    142,
    143,
    0,
    0,
    0,
    0,
    0,
    144,
    0,
    0,
    0,
    145,
    0,
    0,
    146,
    147,
    148,
    149,
    0,
    0,
    0,
    0
  ];
  Typr.CFF.glyphByUnicode = function(cff, code) {
    for (var i = 0; i < cff.charset.length; i++)
      if (cff.charset[i] == code)
        return i;
    return -1;
  };
  Typr.CFF.glyphBySE = function(cff, charcode) {
    if (charcode < 0 || charcode > 255)
      return -1;
    return Typr.CFF.glyphByUnicode(cff, Typr.CFF.tableSE[charcode]);
  };
  Typr.CFF.readEncoding = function(data, offset, num) {
    Typr._bin;
    var array = [".notdef"];
    var format = data[offset];
    offset++;
    if (format == 0) {
      var nCodes = data[offset];
      offset++;
      for (var i = 0; i < nCodes; i++)
        array.push(data[offset + i]);
    } else
      throw "error: unknown encoding format: " + format;
    return array;
  };
  Typr.CFF.readCharset = function(data, offset, num) {
    var bin = Typr._bin;
    var charset = [".notdef"];
    var format = data[offset];
    offset++;
    if (format == 0) {
      for (var i = 0; i < num; i++) {
        var first = bin.readUshort(data, offset);
        offset += 2;
        charset.push(first);
      }
    } else if (format == 1 || format == 2) {
      while (charset.length < num) {
        var first = bin.readUshort(data, offset);
        offset += 2;
        var nLeft = 0;
        if (format == 1) {
          nLeft = data[offset];
          offset++;
        } else {
          nLeft = bin.readUshort(data, offset);
          offset += 2;
        }
        for (var i = 0; i <= nLeft; i++) {
          charset.push(first);
          first++;
        }
      }
    } else
      throw "error: format: " + format;
    return charset;
  };
  Typr.CFF.readIndex = function(data, offset, inds) {
    var bin = Typr._bin;
    var count = bin.readUshort(data, offset) + 1;
    offset += 2;
    var offsize = data[offset];
    offset++;
    if (offsize == 1)
      for (var i = 0; i < count; i++)
        inds.push(data[offset + i]);
    else if (offsize == 2)
      for (var i = 0; i < count; i++)
        inds.push(bin.readUshort(data, offset + i * 2));
    else if (offsize == 3)
      for (var i = 0; i < count; i++)
        inds.push(bin.readUint(data, offset + i * 3 - 1) & 16777215);
    else if (count != 1)
      throw "unsupported offset size: " + offsize + ", count: " + count;
    offset += count * offsize;
    return offset - 1;
  };
  Typr.CFF.getCharString = function(data, offset, o) {
    var bin = Typr._bin;
    var b0 = data[offset], b1 = data[offset + 1];
    data[offset + 2];
    data[offset + 3];
    data[offset + 4];
    var vs = 1;
    var op = null, val = null;
    if (b0 <= 20) {
      op = b0;
      vs = 1;
    }
    if (b0 == 12) {
      op = b0 * 100 + b1;
      vs = 2;
    }
    if (21 <= b0 && b0 <= 27) {
      op = b0;
      vs = 1;
    }
    if (b0 == 28) {
      val = bin.readShort(data, offset + 1);
      vs = 3;
    }
    if (29 <= b0 && b0 <= 31) {
      op = b0;
      vs = 1;
    }
    if (32 <= b0 && b0 <= 246) {
      val = b0 - 139;
      vs = 1;
    }
    if (247 <= b0 && b0 <= 250) {
      val = (b0 - 247) * 256 + b1 + 108;
      vs = 2;
    }
    if (251 <= b0 && b0 <= 254) {
      val = -(b0 - 251) * 256 - b1 - 108;
      vs = 2;
    }
    if (b0 == 255) {
      val = bin.readInt(data, offset + 1) / 65535;
      vs = 5;
    }
    o.val = val != null ? val : "o" + op;
    o.size = vs;
  };
  Typr.CFF.readCharString = function(data, offset, length) {
    var end = offset + length;
    var bin = Typr._bin;
    var arr = [];
    while (offset < end) {
      var b0 = data[offset], b1 = data[offset + 1];
      data[offset + 2];
      data[offset + 3];
      data[offset + 4];
      var vs = 1;
      var op = null, val = null;
      if (b0 <= 20) {
        op = b0;
        vs = 1;
      }
      if (b0 == 12) {
        op = b0 * 100 + b1;
        vs = 2;
      }
      if (b0 == 19 || b0 == 20) {
        op = b0;
        vs = 2;
      }
      if (21 <= b0 && b0 <= 27) {
        op = b0;
        vs = 1;
      }
      if (b0 == 28) {
        val = bin.readShort(data, offset + 1);
        vs = 3;
      }
      if (29 <= b0 && b0 <= 31) {
        op = b0;
        vs = 1;
      }
      if (32 <= b0 && b0 <= 246) {
        val = b0 - 139;
        vs = 1;
      }
      if (247 <= b0 && b0 <= 250) {
        val = (b0 - 247) * 256 + b1 + 108;
        vs = 2;
      }
      if (251 <= b0 && b0 <= 254) {
        val = -(b0 - 251) * 256 - b1 - 108;
        vs = 2;
      }
      if (b0 == 255) {
        val = bin.readInt(data, offset + 1) / 65535;
        vs = 5;
      }
      arr.push(val != null ? val : "o" + op);
      offset += vs;
    }
    return arr;
  };
  Typr.CFF.readDict = function(data, offset, end) {
    var bin = Typr._bin;
    var dict = {};
    var carr = [];
    while (offset < end) {
      var b0 = data[offset], b1 = data[offset + 1];
      data[offset + 2];
      data[offset + 3];
      data[offset + 4];
      var vs = 1;
      var key = null, val = null;
      if (b0 == 28) {
        val = bin.readShort(data, offset + 1);
        vs = 3;
      }
      if (b0 == 29) {
        val = bin.readInt(data, offset + 1);
        vs = 5;
      }
      if (32 <= b0 && b0 <= 246) {
        val = b0 - 139;
        vs = 1;
      }
      if (247 <= b0 && b0 <= 250) {
        val = (b0 - 247) * 256 + b1 + 108;
        vs = 2;
      }
      if (251 <= b0 && b0 <= 254) {
        val = -(b0 - 251) * 256 - b1 - 108;
        vs = 2;
      }
      if (b0 == 255) {
        val = bin.readInt(data, offset + 1) / 65535;
        vs = 5;
        throw "unknown number";
      }
      if (b0 == 30) {
        var nibs = [];
        vs = 1;
        while (true) {
          var b = data[offset + vs];
          vs++;
          var nib0 = b >> 4, nib1 = b & 15;
          if (nib0 != 15)
            nibs.push(nib0);
          if (nib1 != 15)
            nibs.push(nib1);
          if (nib1 == 15)
            break;
        }
        var s = "";
        var chars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ".", "e", "e-", "reserved", "-", "endOfNumber"];
        for (var i = 0; i < nibs.length; i++)
          s += chars[nibs[i]];
        val = parseFloat(s);
      }
      if (b0 <= 21) {
        var keys = [
          "version",
          "Notice",
          "FullName",
          "FamilyName",
          "Weight",
          "FontBBox",
          "BlueValues",
          "OtherBlues",
          "FamilyBlues",
          "FamilyOtherBlues",
          "StdHW",
          "StdVW",
          "escape",
          "UniqueID",
          "XUID",
          "charset",
          "Encoding",
          "CharStrings",
          "Private",
          "Subrs",
          "defaultWidthX",
          "nominalWidthX"
        ];
        key = keys[b0];
        vs = 1;
        if (b0 == 12) {
          var keys = [
            "Copyright",
            "isFixedPitch",
            "ItalicAngle",
            "UnderlinePosition",
            "UnderlineThickness",
            "PaintType",
            "CharstringType",
            "FontMatrix",
            "StrokeWidth",
            "BlueScale",
            "BlueShift",
            "BlueFuzz",
            "StemSnapH",
            "StemSnapV",
            "ForceBold",
            0,
            0,
            "LanguageGroup",
            "ExpansionFactor",
            "initialRandomSeed",
            "SyntheticBase",
            "PostScript",
            "BaseFontName",
            "BaseFontBlend",
            0,
            0,
            0,
            0,
            0,
            0,
            "ROS",
            "CIDFontVersion",
            "CIDFontRevision",
            "CIDFontType",
            "CIDCount",
            "UIDBase",
            "FDArray",
            "FDSelect",
            "FontName"
          ];
          key = keys[b1];
          vs = 2;
        }
      }
      if (key != null) {
        dict[key] = carr.length == 1 ? carr[0] : carr;
        carr = [];
      } else
        carr.push(val);
      offset += vs;
    }
    return dict;
  };
  Typr.cmap = {};
  Typr.cmap.parse = function(data, offset, length) {
    data = new Uint8Array(data.buffer, offset, length);
    offset = 0;
    var bin = Typr._bin;
    var obj = {};
    bin.readUshort(data, offset);
    offset += 2;
    var numTables = bin.readUshort(data, offset);
    offset += 2;
    var offs = [];
    obj.tables = [];
    for (var i = 0; i < numTables; i++) {
      var platformID = bin.readUshort(data, offset);
      offset += 2;
      var encodingID = bin.readUshort(data, offset);
      offset += 2;
      var noffset = bin.readUint(data, offset);
      offset += 4;
      var id = "p" + platformID + "e" + encodingID;
      var tind = offs.indexOf(noffset);
      if (tind == -1) {
        tind = obj.tables.length;
        var subt;
        offs.push(noffset);
        var format = bin.readUshort(data, noffset);
        if (format == 0)
          subt = Typr.cmap.parse0(data, noffset);
        else if (format == 4)
          subt = Typr.cmap.parse4(data, noffset);
        else if (format == 6)
          subt = Typr.cmap.parse6(data, noffset);
        else if (format == 12)
          subt = Typr.cmap.parse12(data, noffset);
        else
          console.warn("unknown format: " + format, platformID, encodingID, noffset);
        obj.tables.push(subt);
      }
      if (obj[id] != null)
        throw "multiple tables for one platform+encoding";
      obj[id] = tind;
    }
    return obj;
  };
  Typr.cmap.parse0 = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    obj.format = bin.readUshort(data, offset);
    offset += 2;
    var len = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    obj.map = [];
    for (var i = 0; i < len - 6; i++)
      obj.map.push(data[offset + i]);
    return obj;
  };
  Typr.cmap.parse4 = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    obj.format = bin.readUshort(data, offset);
    offset += 2;
    var length = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    var segCountX2 = bin.readUshort(data, offset);
    offset += 2;
    var segCount = segCountX2 / 2;
    obj.searchRange = bin.readUshort(data, offset);
    offset += 2;
    obj.entrySelector = bin.readUshort(data, offset);
    offset += 2;
    obj.rangeShift = bin.readUshort(data, offset);
    offset += 2;
    obj.endCount = bin.readUshorts(data, offset, segCount);
    offset += segCount * 2;
    offset += 2;
    obj.startCount = bin.readUshorts(data, offset, segCount);
    offset += segCount * 2;
    obj.idDelta = [];
    for (var i = 0; i < segCount; i++) {
      obj.idDelta.push(bin.readShort(data, offset));
      offset += 2;
    }
    obj.idRangeOffset = bin.readUshorts(data, offset, segCount);
    offset += segCount * 2;
    obj.glyphIdArray = [];
    while (offset < offset0 + length) {
      obj.glyphIdArray.push(bin.readUshort(data, offset));
      offset += 2;
    }
    return obj;
  };
  Typr.cmap.parse6 = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    obj.format = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    obj.firstCode = bin.readUshort(data, offset);
    offset += 2;
    var entryCount = bin.readUshort(data, offset);
    offset += 2;
    obj.glyphIdArray = [];
    for (var i = 0; i < entryCount; i++) {
      obj.glyphIdArray.push(bin.readUshort(data, offset));
      offset += 2;
    }
    return obj;
  };
  Typr.cmap.parse12 = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    obj.format = bin.readUshort(data, offset);
    offset += 2;
    offset += 2;
    bin.readUint(data, offset);
    offset += 4;
    bin.readUint(data, offset);
    offset += 4;
    var nGroups = bin.readUint(data, offset);
    offset += 4;
    obj.groups = [];
    for (var i = 0; i < nGroups; i++) {
      var off = offset + i * 12;
      var startCharCode = bin.readUint(data, off + 0);
      var endCharCode = bin.readUint(data, off + 4);
      var startGlyphID = bin.readUint(data, off + 8);
      obj.groups.push([startCharCode, endCharCode, startGlyphID]);
    }
    return obj;
  };
  Typr.glyf = {};
  Typr.glyf.parse = function(data, offset, length, font) {
    var obj = [];
    for (var g = 0; g < font.maxp.numGlyphs; g++)
      obj.push(null);
    return obj;
  };
  Typr.glyf._parseGlyf = function(font, g) {
    var bin = Typr._bin;
    var data = font._data;
    var offset = Typr._tabOffset(data, "glyf", font._offset) + font.loca[g];
    if (font.loca[g] == font.loca[g + 1])
      return null;
    var gl = {};
    gl.noc = bin.readShort(data, offset);
    offset += 2;
    gl.xMin = bin.readShort(data, offset);
    offset += 2;
    gl.yMin = bin.readShort(data, offset);
    offset += 2;
    gl.xMax = bin.readShort(data, offset);
    offset += 2;
    gl.yMax = bin.readShort(data, offset);
    offset += 2;
    if (gl.xMin >= gl.xMax || gl.yMin >= gl.yMax)
      return null;
    if (gl.noc > 0) {
      gl.endPts = [];
      for (var i = 0; i < gl.noc; i++) {
        gl.endPts.push(bin.readUshort(data, offset));
        offset += 2;
      }
      var instructionLength = bin.readUshort(data, offset);
      offset += 2;
      if (data.length - offset < instructionLength)
        return null;
      gl.instructions = bin.readBytes(data, offset, instructionLength);
      offset += instructionLength;
      var crdnum = gl.endPts[gl.noc - 1] + 1;
      gl.flags = [];
      for (var i = 0; i < crdnum; i++) {
        var flag = data[offset];
        offset++;
        gl.flags.push(flag);
        if ((flag & 8) != 0) {
          var rep = data[offset];
          offset++;
          for (var j = 0; j < rep; j++) {
            gl.flags.push(flag);
            i++;
          }
        }
      }
      gl.xs = [];
      for (var i = 0; i < crdnum; i++) {
        var i8 = (gl.flags[i] & 2) != 0, same = (gl.flags[i] & 16) != 0;
        if (i8) {
          gl.xs.push(same ? data[offset] : -data[offset]);
          offset++;
        } else {
          if (same)
            gl.xs.push(0);
          else {
            gl.xs.push(bin.readShort(data, offset));
            offset += 2;
          }
        }
      }
      gl.ys = [];
      for (var i = 0; i < crdnum; i++) {
        var i8 = (gl.flags[i] & 4) != 0, same = (gl.flags[i] & 32) != 0;
        if (i8) {
          gl.ys.push(same ? data[offset] : -data[offset]);
          offset++;
        } else {
          if (same)
            gl.ys.push(0);
          else {
            gl.ys.push(bin.readShort(data, offset));
            offset += 2;
          }
        }
      }
      var x = 0, y = 0;
      for (var i = 0; i < crdnum; i++) {
        x += gl.xs[i];
        y += gl.ys[i];
        gl.xs[i] = x;
        gl.ys[i] = y;
      }
    } else {
      var ARG_1_AND_2_ARE_WORDS = 1 << 0;
      var ARGS_ARE_XY_VALUES = 1 << 1;
      var WE_HAVE_A_SCALE = 1 << 3;
      var MORE_COMPONENTS = 1 << 5;
      var WE_HAVE_AN_X_AND_Y_SCALE = 1 << 6;
      var WE_HAVE_A_TWO_BY_TWO = 1 << 7;
      var WE_HAVE_INSTRUCTIONS = 1 << 8;
      gl.parts = [];
      var flags;
      do {
        flags = bin.readUshort(data, offset);
        offset += 2;
        var part = { m: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, p1: -1, p2: -1 };
        gl.parts.push(part);
        part.glyphIndex = bin.readUshort(data, offset);
        offset += 2;
        if (flags & ARG_1_AND_2_ARE_WORDS) {
          var arg1 = bin.readShort(data, offset);
          offset += 2;
          var arg2 = bin.readShort(data, offset);
          offset += 2;
        } else {
          var arg1 = bin.readInt8(data, offset);
          offset++;
          var arg2 = bin.readInt8(data, offset);
          offset++;
        }
        if (flags & ARGS_ARE_XY_VALUES) {
          part.m.tx = arg1;
          part.m.ty = arg2;
        } else {
          part.p1 = arg1;
          part.p2 = arg2;
        }
        if (flags & WE_HAVE_A_SCALE) {
          part.m.a = part.m.d = bin.readF2dot14(data, offset);
          offset += 2;
        } else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) {
          part.m.a = bin.readF2dot14(data, offset);
          offset += 2;
          part.m.d = bin.readF2dot14(data, offset);
          offset += 2;
        } else if (flags & WE_HAVE_A_TWO_BY_TWO) {
          part.m.a = bin.readF2dot14(data, offset);
          offset += 2;
          part.m.b = bin.readF2dot14(data, offset);
          offset += 2;
          part.m.c = bin.readF2dot14(data, offset);
          offset += 2;
          part.m.d = bin.readF2dot14(data, offset);
          offset += 2;
        }
      } while (flags & MORE_COMPONENTS);
      if (flags & WE_HAVE_INSTRUCTIONS) {
        var numInstr = bin.readUshort(data, offset);
        offset += 2;
        gl.instr = [];
        for (var i = 0; i < numInstr; i++) {
          gl.instr.push(data[offset]);
          offset++;
        }
      }
    }
    return gl;
  };
  Typr.GPOS = {};
  Typr.GPOS.parse = function(data, offset, length, font) {
    return Typr._lctf.parse(data, offset, length, font, Typr.GPOS.subt);
  };
  Typr.GPOS.subt = function(data, ltype, offset, ltable) {
    var bin = Typr._bin, offset0 = offset, tab = {};
    tab.fmt = bin.readUshort(data, offset);
    offset += 2;
    if (ltype == 1 || ltype == 2 || ltype == 3 || ltype == 7 || ltype == 8 && tab.fmt <= 2) {
      var covOff = bin.readUshort(data, offset);
      offset += 2;
      tab.coverage = Typr._lctf.readCoverage(data, covOff + offset0);
    }
    if (ltype == 1 && tab.fmt == 1) {
      var valFmt1 = bin.readUshort(data, offset);
      offset += 2;
      var ones1 = Typr._lctf.numOfOnes(valFmt1);
      if (valFmt1 != 0)
        tab.pos = Typr.GPOS.readValueRecord(data, offset, valFmt1);
    } else if (ltype == 2 && tab.fmt >= 1 && tab.fmt <= 2) {
      var valFmt1 = bin.readUshort(data, offset);
      offset += 2;
      var valFmt2 = bin.readUshort(data, offset);
      offset += 2;
      var ones1 = Typr._lctf.numOfOnes(valFmt1);
      var ones2 = Typr._lctf.numOfOnes(valFmt2);
      if (tab.fmt == 1) {
        tab.pairsets = [];
        var psc = bin.readUshort(data, offset);
        offset += 2;
        for (var i = 0; i < psc; i++) {
          var psoff = offset0 + bin.readUshort(data, offset);
          offset += 2;
          var pvc = bin.readUshort(data, psoff);
          psoff += 2;
          var arr = [];
          for (var j = 0; j < pvc; j++) {
            var gid2 = bin.readUshort(data, psoff);
            psoff += 2;
            var value1, value2;
            if (valFmt1 != 0) {
              value1 = Typr.GPOS.readValueRecord(data, psoff, valFmt1);
              psoff += ones1 * 2;
            }
            if (valFmt2 != 0) {
              value2 = Typr.GPOS.readValueRecord(data, psoff, valFmt2);
              psoff += ones2 * 2;
            }
            arr.push({ gid2, val1: value1, val2: value2 });
          }
          tab.pairsets.push(arr);
        }
      }
      if (tab.fmt == 2) {
        var classDef1 = bin.readUshort(data, offset);
        offset += 2;
        var classDef2 = bin.readUshort(data, offset);
        offset += 2;
        var class1Count = bin.readUshort(data, offset);
        offset += 2;
        var class2Count = bin.readUshort(data, offset);
        offset += 2;
        tab.classDef1 = Typr._lctf.readClassDef(data, offset0 + classDef1);
        tab.classDef2 = Typr._lctf.readClassDef(data, offset0 + classDef2);
        tab.matrix = [];
        for (var i = 0; i < class1Count; i++) {
          var row = [];
          for (var j = 0; j < class2Count; j++) {
            var value1 = null, value2 = null;
            if (valFmt1 != 0) {
              value1 = Typr.GPOS.readValueRecord(data, offset, valFmt1);
              offset += ones1 * 2;
            }
            if (valFmt2 != 0) {
              value2 = Typr.GPOS.readValueRecord(data, offset, valFmt2);
              offset += ones2 * 2;
            }
            row.push({ val1: value1, val2: value2 });
          }
          tab.matrix.push(row);
        }
      }
    } else if (ltype == 9 && tab.fmt == 1) {
      var extType = bin.readUshort(data, offset);
      offset += 2;
      var extOffset = bin.readUint(data, offset);
      offset += 4;
      if (ltable.ltype == 9) {
        ltable.ltype = extType;
      } else if (ltable.ltype != extType) {
        throw "invalid extension substitution";
      }
      return Typr.GPOS.subt(data, ltable.ltype, offset0 + extOffset);
    } else
      console.warn("unsupported GPOS table LookupType", ltype, "format", tab.fmt);
    return tab;
  };
  Typr.GPOS.readValueRecord = function(data, offset, valFmt) {
    var bin = Typr._bin;
    var arr = [];
    arr.push(valFmt & 1 ? bin.readShort(data, offset) : 0);
    offset += valFmt & 1 ? 2 : 0;
    arr.push(valFmt & 2 ? bin.readShort(data, offset) : 0);
    offset += valFmt & 2 ? 2 : 0;
    arr.push(valFmt & 4 ? bin.readShort(data, offset) : 0);
    offset += valFmt & 4 ? 2 : 0;
    arr.push(valFmt & 8 ? bin.readShort(data, offset) : 0);
    offset += valFmt & 8 ? 2 : 0;
    return arr;
  };
  Typr.GSUB = {};
  Typr.GSUB.parse = function(data, offset, length, font) {
    return Typr._lctf.parse(data, offset, length, font, Typr.GSUB.subt);
  };
  Typr.GSUB.subt = function(data, ltype, offset, ltable) {
    var bin = Typr._bin, offset0 = offset, tab = {};
    tab.fmt = bin.readUshort(data, offset);
    offset += 2;
    if (ltype != 1 && ltype != 4 && ltype != 5 && ltype != 6)
      return null;
    if (ltype == 1 || ltype == 4 || ltype == 5 && tab.fmt <= 2 || ltype == 6 && tab.fmt <= 2) {
      var covOff = bin.readUshort(data, offset);
      offset += 2;
      tab.coverage = Typr._lctf.readCoverage(data, offset0 + covOff);
    }
    if (ltype == 1 && tab.fmt >= 1 && tab.fmt <= 2) {
      if (tab.fmt == 1) {
        tab.delta = bin.readShort(data, offset);
        offset += 2;
      } else if (tab.fmt == 2) {
        var cnt = bin.readUshort(data, offset);
        offset += 2;
        tab.newg = bin.readUshorts(data, offset, cnt);
        offset += tab.newg.length * 2;
      }
    } else if (ltype == 4) {
      tab.vals = [];
      var cnt = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < cnt; i++) {
        var loff = bin.readUshort(data, offset);
        offset += 2;
        tab.vals.push(Typr.GSUB.readLigatureSet(data, offset0 + loff));
      }
    } else if (ltype == 5 && tab.fmt == 2) {
      if (tab.fmt == 2) {
        var cDefOffset = bin.readUshort(data, offset);
        offset += 2;
        tab.cDef = Typr._lctf.readClassDef(data, offset0 + cDefOffset);
        tab.scset = [];
        var subClassSetCount = bin.readUshort(data, offset);
        offset += 2;
        for (var i = 0; i < subClassSetCount; i++) {
          var scsOff = bin.readUshort(data, offset);
          offset += 2;
          tab.scset.push(scsOff == 0 ? null : Typr.GSUB.readSubClassSet(data, offset0 + scsOff));
        }
      }
    } else if (ltype == 6 && tab.fmt == 3) {
      if (tab.fmt == 3) {
        for (var i = 0; i < 3; i++) {
          var cnt = bin.readUshort(data, offset);
          offset += 2;
          var cvgs = [];
          for (var j = 0; j < cnt; j++)
            cvgs.push(Typr._lctf.readCoverage(data, offset0 + bin.readUshort(data, offset + j * 2)));
          offset += cnt * 2;
          if (i == 0)
            tab.backCvg = cvgs;
          if (i == 1)
            tab.inptCvg = cvgs;
          if (i == 2)
            tab.ahedCvg = cvgs;
        }
        var cnt = bin.readUshort(data, offset);
        offset += 2;
        tab.lookupRec = Typr.GSUB.readSubstLookupRecords(data, offset, cnt);
      }
    } else if (ltype == 7 && tab.fmt == 1) {
      var extType = bin.readUshort(data, offset);
      offset += 2;
      var extOffset = bin.readUint(data, offset);
      offset += 4;
      if (ltable.ltype == 9) {
        ltable.ltype = extType;
      } else if (ltable.ltype != extType) {
        throw "invalid extension substitution";
      }
      return Typr.GSUB.subt(data, ltable.ltype, offset0 + extOffset);
    } else
      console.warn("unsupported GSUB table LookupType", ltype, "format", tab.fmt);
    return tab;
  };
  Typr.GSUB.readSubClassSet = function(data, offset) {
    var rUs = Typr._bin.readUshort, offset0 = offset, lset = [];
    var cnt = rUs(data, offset);
    offset += 2;
    for (var i = 0; i < cnt; i++) {
      var loff = rUs(data, offset);
      offset += 2;
      lset.push(Typr.GSUB.readSubClassRule(data, offset0 + loff));
    }
    return lset;
  };
  Typr.GSUB.readSubClassRule = function(data, offset) {
    var rUs = Typr._bin.readUshort, rule = {};
    var gcount = rUs(data, offset);
    offset += 2;
    var scount = rUs(data, offset);
    offset += 2;
    rule.input = [];
    for (var i = 0; i < gcount - 1; i++) {
      rule.input.push(rUs(data, offset));
      offset += 2;
    }
    rule.substLookupRecords = Typr.GSUB.readSubstLookupRecords(data, offset, scount);
    return rule;
  };
  Typr.GSUB.readSubstLookupRecords = function(data, offset, cnt) {
    var rUs = Typr._bin.readUshort;
    var out = [];
    for (var i = 0; i < cnt; i++) {
      out.push(rUs(data, offset), rUs(data, offset + 2));
      offset += 4;
    }
    return out;
  };
  Typr.GSUB.readChainSubClassSet = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, lset = [];
    var cnt = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < cnt; i++) {
      var loff = bin.readUshort(data, offset);
      offset += 2;
      lset.push(Typr.GSUB.readChainSubClassRule(data, offset0 + loff));
    }
    return lset;
  };
  Typr.GSUB.readChainSubClassRule = function(data, offset) {
    var bin = Typr._bin, rule = {};
    var pps = ["backtrack", "input", "lookahead"];
    for (var pi = 0; pi < pps.length; pi++) {
      var cnt = bin.readUshort(data, offset);
      offset += 2;
      if (pi == 1)
        cnt--;
      rule[pps[pi]] = bin.readUshorts(data, offset, cnt);
      offset += rule[pps[pi]].length * 2;
    }
    var cnt = bin.readUshort(data, offset);
    offset += 2;
    rule.subst = bin.readUshorts(data, offset, cnt * 2);
    offset += rule.subst.length * 2;
    return rule;
  };
  Typr.GSUB.readLigatureSet = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, lset = [];
    var lcnt = bin.readUshort(data, offset);
    offset += 2;
    for (var j = 0; j < lcnt; j++) {
      var loff = bin.readUshort(data, offset);
      offset += 2;
      lset.push(Typr.GSUB.readLigature(data, offset0 + loff));
    }
    return lset;
  };
  Typr.GSUB.readLigature = function(data, offset) {
    var bin = Typr._bin, lig = { chain: [] };
    lig.nglyph = bin.readUshort(data, offset);
    offset += 2;
    var ccnt = bin.readUshort(data, offset);
    offset += 2;
    for (var k = 0; k < ccnt - 1; k++) {
      lig.chain.push(bin.readUshort(data, offset));
      offset += 2;
    }
    return lig;
  };
  Typr.head = {};
  Typr.head.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    bin.readFixed(data, offset);
    offset += 4;
    obj.fontRevision = bin.readFixed(data, offset);
    offset += 4;
    bin.readUint(data, offset);
    offset += 4;
    bin.readUint(data, offset);
    offset += 4;
    obj.flags = bin.readUshort(data, offset);
    offset += 2;
    obj.unitsPerEm = bin.readUshort(data, offset);
    offset += 2;
    obj.created = bin.readUint64(data, offset);
    offset += 8;
    obj.modified = bin.readUint64(data, offset);
    offset += 8;
    obj.xMin = bin.readShort(data, offset);
    offset += 2;
    obj.yMin = bin.readShort(data, offset);
    offset += 2;
    obj.xMax = bin.readShort(data, offset);
    offset += 2;
    obj.yMax = bin.readShort(data, offset);
    offset += 2;
    obj.macStyle = bin.readUshort(data, offset);
    offset += 2;
    obj.lowestRecPPEM = bin.readUshort(data, offset);
    offset += 2;
    obj.fontDirectionHint = bin.readShort(data, offset);
    offset += 2;
    obj.indexToLocFormat = bin.readShort(data, offset);
    offset += 2;
    obj.glyphDataFormat = bin.readShort(data, offset);
    offset += 2;
    return obj;
  };
  Typr.hhea = {};
  Typr.hhea.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    bin.readFixed(data, offset);
    offset += 4;
    obj.ascender = bin.readShort(data, offset);
    offset += 2;
    obj.descender = bin.readShort(data, offset);
    offset += 2;
    obj.lineGap = bin.readShort(data, offset);
    offset += 2;
    obj.advanceWidthMax = bin.readUshort(data, offset);
    offset += 2;
    obj.minLeftSideBearing = bin.readShort(data, offset);
    offset += 2;
    obj.minRightSideBearing = bin.readShort(data, offset);
    offset += 2;
    obj.xMaxExtent = bin.readShort(data, offset);
    offset += 2;
    obj.caretSlopeRise = bin.readShort(data, offset);
    offset += 2;
    obj.caretSlopeRun = bin.readShort(data, offset);
    offset += 2;
    obj.caretOffset = bin.readShort(data, offset);
    offset += 2;
    offset += 4 * 2;
    obj.metricDataFormat = bin.readShort(data, offset);
    offset += 2;
    obj.numberOfHMetrics = bin.readUshort(data, offset);
    offset += 2;
    return obj;
  };
  Typr.hmtx = {};
  Typr.hmtx.parse = function(data, offset, length, font) {
    var bin = Typr._bin;
    var obj = {};
    obj.aWidth = [];
    obj.lsBearing = [];
    var aw = 0, lsb = 0;
    for (var i = 0; i < font.maxp.numGlyphs; i++) {
      if (i < font.hhea.numberOfHMetrics) {
        aw = bin.readUshort(data, offset);
        offset += 2;
        lsb = bin.readShort(data, offset);
        offset += 2;
      }
      obj.aWidth.push(aw);
      obj.lsBearing.push(lsb);
    }
    return obj;
  };
  Typr.kern = {};
  Typr.kern.parse = function(data, offset, length, font) {
    var bin = Typr._bin;
    var version = bin.readUshort(data, offset);
    offset += 2;
    if (version == 1)
      return Typr.kern.parseV1(data, offset - 2, length, font);
    var nTables = bin.readUshort(data, offset);
    offset += 2;
    var map2 = { glyph1: [], rval: [] };
    for (var i = 0; i < nTables; i++) {
      offset += 2;
      var length = bin.readUshort(data, offset);
      offset += 2;
      var coverage = bin.readUshort(data, offset);
      offset += 2;
      var format = coverage >>> 8;
      format &= 15;
      if (format == 0)
        offset = Typr.kern.readFormat0(data, offset, map2);
      else
        throw "unknown kern table format: " + format;
    }
    return map2;
  };
  Typr.kern.parseV1 = function(data, offset, length, font) {
    var bin = Typr._bin;
    bin.readFixed(data, offset);
    offset += 4;
    var nTables = bin.readUint(data, offset);
    offset += 4;
    var map2 = { glyph1: [], rval: [] };
    for (var i = 0; i < nTables; i++) {
      bin.readUint(data, offset);
      offset += 4;
      var coverage = bin.readUshort(data, offset);
      offset += 2;
      bin.readUshort(data, offset);
      offset += 2;
      var format = coverage >>> 8;
      format &= 15;
      if (format == 0)
        offset = Typr.kern.readFormat0(data, offset, map2);
      else
        throw "unknown kern table format: " + format;
    }
    return map2;
  };
  Typr.kern.readFormat0 = function(data, offset, map2) {
    var bin = Typr._bin;
    var pleft = -1;
    var nPairs = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    for (var j = 0; j < nPairs; j++) {
      var left = bin.readUshort(data, offset);
      offset += 2;
      var right = bin.readUshort(data, offset);
      offset += 2;
      var value = bin.readShort(data, offset);
      offset += 2;
      if (left != pleft) {
        map2.glyph1.push(left);
        map2.rval.push({ glyph2: [], vals: [] });
      }
      var rval = map2.rval[map2.rval.length - 1];
      rval.glyph2.push(right);
      rval.vals.push(value);
      pleft = left;
    }
    return offset;
  };
  Typr.loca = {};
  Typr.loca.parse = function(data, offset, length, font) {
    var bin = Typr._bin;
    var obj = [];
    var ver = font.head.indexToLocFormat;
    var len = font.maxp.numGlyphs + 1;
    if (ver == 0)
      for (var i = 0; i < len; i++)
        obj.push(bin.readUshort(data, offset + (i << 1)) << 1);
    if (ver == 1)
      for (var i = 0; i < len; i++)
        obj.push(bin.readUint(data, offset + (i << 2)));
    return obj;
  };
  Typr.maxp = {};
  Typr.maxp.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    var ver = bin.readUint(data, offset);
    offset += 4;
    obj.numGlyphs = bin.readUshort(data, offset);
    offset += 2;
    if (ver == 65536) {
      obj.maxPoints = bin.readUshort(data, offset);
      offset += 2;
      obj.maxContours = bin.readUshort(data, offset);
      offset += 2;
      obj.maxCompositePoints = bin.readUshort(data, offset);
      offset += 2;
      obj.maxCompositeContours = bin.readUshort(data, offset);
      offset += 2;
      obj.maxZones = bin.readUshort(data, offset);
      offset += 2;
      obj.maxTwilightPoints = bin.readUshort(data, offset);
      offset += 2;
      obj.maxStorage = bin.readUshort(data, offset);
      offset += 2;
      obj.maxFunctionDefs = bin.readUshort(data, offset);
      offset += 2;
      obj.maxInstructionDefs = bin.readUshort(data, offset);
      offset += 2;
      obj.maxStackElements = bin.readUshort(data, offset);
      offset += 2;
      obj.maxSizeOfInstructions = bin.readUshort(data, offset);
      offset += 2;
      obj.maxComponentElements = bin.readUshort(data, offset);
      offset += 2;
      obj.maxComponentDepth = bin.readUshort(data, offset);
      offset += 2;
    }
    return obj;
  };
  Typr.name = {};
  Typr.name.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    bin.readUshort(data, offset);
    offset += 2;
    var count = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    var names = [
      "copyright",
      "fontFamily",
      "fontSubfamily",
      "ID",
      "fullName",
      "version",
      "postScriptName",
      "trademark",
      "manufacturer",
      "designer",
      "description",
      "urlVendor",
      "urlDesigner",
      "licence",
      "licenceURL",
      "---",
      "typoFamilyName",
      "typoSubfamilyName",
      "compatibleFull",
      "sampleText",
      "postScriptCID",
      "wwsFamilyName",
      "wwsSubfamilyName",
      "lightPalette",
      "darkPalette"
    ];
    var offset0 = offset;
    for (var i = 0; i < count; i++) {
      var platformID = bin.readUshort(data, offset);
      offset += 2;
      var encodingID = bin.readUshort(data, offset);
      offset += 2;
      var languageID = bin.readUshort(data, offset);
      offset += 2;
      var nameID = bin.readUshort(data, offset);
      offset += 2;
      var slen = bin.readUshort(data, offset);
      offset += 2;
      var noffset = bin.readUshort(data, offset);
      offset += 2;
      var cname = names[nameID];
      var soff = offset0 + count * 12 + noffset;
      var str;
      if (platformID == 0)
        str = bin.readUnicode(data, soff, slen / 2);
      else if (platformID == 3 && encodingID == 0)
        str = bin.readUnicode(data, soff, slen / 2);
      else if (encodingID == 0)
        str = bin.readASCII(data, soff, slen);
      else if (encodingID == 1)
        str = bin.readUnicode(data, soff, slen / 2);
      else if (encodingID == 3)
        str = bin.readUnicode(data, soff, slen / 2);
      else if (platformID == 1) {
        str = bin.readASCII(data, soff, slen);
        console.warn("reading unknown MAC encoding " + encodingID + " as ASCII");
      } else
        throw "unknown encoding " + encodingID + ", platformID: " + platformID;
      var tid = "p" + platformID + "," + languageID.toString(16);
      if (obj[tid] == null)
        obj[tid] = {};
      obj[tid][cname !== void 0 ? cname : nameID] = str;
      obj[tid]._lang = languageID;
    }
    for (var p in obj)
      if (obj[p].postScriptName != null && obj[p]._lang == 1033)
        return obj[p];
    for (var p in obj)
      if (obj[p].postScriptName != null && obj[p]._lang == 0)
        return obj[p];
    for (var p in obj)
      if (obj[p].postScriptName != null && obj[p]._lang == 3084)
        return obj[p];
    for (var p in obj)
      if (obj[p].postScriptName != null)
        return obj[p];
    var tname;
    for (var p in obj) {
      tname = p;
      break;
    }
    console.warn("returning name table with languageID " + obj[tname]._lang);
    return obj[tname];
  };
  Typr["OS/2"] = {};
  Typr["OS/2"].parse = function(data, offset, length) {
    var bin = Typr._bin;
    var ver = bin.readUshort(data, offset);
    offset += 2;
    var obj = {};
    if (ver == 0)
      Typr["OS/2"].version0(data, offset, obj);
    else if (ver == 1)
      Typr["OS/2"].version1(data, offset, obj);
    else if (ver == 2 || ver == 3 || ver == 4)
      Typr["OS/2"].version2(data, offset, obj);
    else if (ver == 5)
      Typr["OS/2"].version5(data, offset, obj);
    else
      throw "unknown OS/2 table version: " + ver;
    return obj;
  };
  Typr["OS/2"].version0 = function(data, offset, obj) {
    var bin = Typr._bin;
    obj.xAvgCharWidth = bin.readShort(data, offset);
    offset += 2;
    obj.usWeightClass = bin.readUshort(data, offset);
    offset += 2;
    obj.usWidthClass = bin.readUshort(data, offset);
    offset += 2;
    obj.fsType = bin.readUshort(data, offset);
    offset += 2;
    obj.ySubscriptXSize = bin.readShort(data, offset);
    offset += 2;
    obj.ySubscriptYSize = bin.readShort(data, offset);
    offset += 2;
    obj.ySubscriptXOffset = bin.readShort(data, offset);
    offset += 2;
    obj.ySubscriptYOffset = bin.readShort(data, offset);
    offset += 2;
    obj.ySuperscriptXSize = bin.readShort(data, offset);
    offset += 2;
    obj.ySuperscriptYSize = bin.readShort(data, offset);
    offset += 2;
    obj.ySuperscriptXOffset = bin.readShort(data, offset);
    offset += 2;
    obj.ySuperscriptYOffset = bin.readShort(data, offset);
    offset += 2;
    obj.yStrikeoutSize = bin.readShort(data, offset);
    offset += 2;
    obj.yStrikeoutPosition = bin.readShort(data, offset);
    offset += 2;
    obj.sFamilyClass = bin.readShort(data, offset);
    offset += 2;
    obj.panose = bin.readBytes(data, offset, 10);
    offset += 10;
    obj.ulUnicodeRange1 = bin.readUint(data, offset);
    offset += 4;
    obj.ulUnicodeRange2 = bin.readUint(data, offset);
    offset += 4;
    obj.ulUnicodeRange3 = bin.readUint(data, offset);
    offset += 4;
    obj.ulUnicodeRange4 = bin.readUint(data, offset);
    offset += 4;
    obj.achVendID = [bin.readInt8(data, offset), bin.readInt8(data, offset + 1), bin.readInt8(data, offset + 2), bin.readInt8(data, offset + 3)];
    offset += 4;
    obj.fsSelection = bin.readUshort(data, offset);
    offset += 2;
    obj.usFirstCharIndex = bin.readUshort(data, offset);
    offset += 2;
    obj.usLastCharIndex = bin.readUshort(data, offset);
    offset += 2;
    obj.sTypoAscender = bin.readShort(data, offset);
    offset += 2;
    obj.sTypoDescender = bin.readShort(data, offset);
    offset += 2;
    obj.sTypoLineGap = bin.readShort(data, offset);
    offset += 2;
    obj.usWinAscent = bin.readUshort(data, offset);
    offset += 2;
    obj.usWinDescent = bin.readUshort(data, offset);
    offset += 2;
    return offset;
  };
  Typr["OS/2"].version1 = function(data, offset, obj) {
    var bin = Typr._bin;
    offset = Typr["OS/2"].version0(data, offset, obj);
    obj.ulCodePageRange1 = bin.readUint(data, offset);
    offset += 4;
    obj.ulCodePageRange2 = bin.readUint(data, offset);
    offset += 4;
    return offset;
  };
  Typr["OS/2"].version2 = function(data, offset, obj) {
    var bin = Typr._bin;
    offset = Typr["OS/2"].version1(data, offset, obj);
    obj.sxHeight = bin.readShort(data, offset);
    offset += 2;
    obj.sCapHeight = bin.readShort(data, offset);
    offset += 2;
    obj.usDefault = bin.readUshort(data, offset);
    offset += 2;
    obj.usBreak = bin.readUshort(data, offset);
    offset += 2;
    obj.usMaxContext = bin.readUshort(data, offset);
    offset += 2;
    return offset;
  };
  Typr["OS/2"].version5 = function(data, offset, obj) {
    var bin = Typr._bin;
    offset = Typr["OS/2"].version2(data, offset, obj);
    obj.usLowerOpticalPointSize = bin.readUshort(data, offset);
    offset += 2;
    obj.usUpperOpticalPointSize = bin.readUshort(data, offset);
    offset += 2;
    return offset;
  };
  Typr.post = {};
  Typr.post.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    obj.version = bin.readFixed(data, offset);
    offset += 4;
    obj.italicAngle = bin.readFixed(data, offset);
    offset += 4;
    obj.underlinePosition = bin.readShort(data, offset);
    offset += 2;
    obj.underlineThickness = bin.readShort(data, offset);
    offset += 2;
    return obj;
  };
  Typr.SVG = {};
  Typr.SVG.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = { entries: [] };
    var offset0 = offset;
    bin.readUshort(data, offset);
    offset += 2;
    var svgDocIndexOffset = bin.readUint(data, offset);
    offset += 4;
    bin.readUint(data, offset);
    offset += 4;
    offset = svgDocIndexOffset + offset0;
    var numEntries = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < numEntries; i++) {
      var startGlyphID = bin.readUshort(data, offset);
      offset += 2;
      var endGlyphID = bin.readUshort(data, offset);
      offset += 2;
      var svgDocOffset = bin.readUint(data, offset);
      offset += 4;
      var svgDocLength = bin.readUint(data, offset);
      offset += 4;
      var sbuf = new Uint8Array(data.buffer, offset0 + svgDocOffset + svgDocIndexOffset, svgDocLength);
      var svg = bin.readUTF8(sbuf, 0, sbuf.length);
      for (var f = startGlyphID; f <= endGlyphID; f++) {
        obj.entries[f] = svg;
      }
    }
    return obj;
  };
  Typr.SVG.toPath = function(str) {
    var pth = { cmds: [], crds: [] };
    if (str == null)
      return pth;
    var prsr = new DOMParser();
    var doc = prsr["parseFromString"](str, "image/svg+xml");
    var svg = doc.firstChild;
    while (svg.tagName != "svg")
      svg = svg.nextSibling;
    var vb = svg.getAttribute("viewBox");
    if (vb)
      vb = vb.trim().split(" ").map(parseFloat);
    else
      vb = [0, 0, 1e3, 1e3];
    Typr.SVG._toPath(svg.children, pth);
    for (var i = 0; i < pth.crds.length; i += 2) {
      var x = pth.crds[i], y = pth.crds[i + 1];
      x -= vb[0];
      y -= vb[1];
      y = -y;
      pth.crds[i] = x;
      pth.crds[i + 1] = y;
    }
    return pth;
  };
  Typr.SVG._toPath = function(nds, pth, fill) {
    for (var ni = 0; ni < nds.length; ni++) {
      var nd = nds[ni], tn = nd.tagName;
      var cfl = nd.getAttribute("fill");
      if (cfl == null)
        cfl = fill;
      if (tn == "g")
        Typr.SVG._toPath(nd.children, pth, cfl);
      else if (tn == "path") {
        pth.cmds.push(cfl ? cfl : "#000000");
        var d = nd.getAttribute("d");
        var toks = Typr.SVG._tokens(d);
        Typr.SVG._toksToPath(toks, pth);
        pth.cmds.push("X");
      } else if (tn == "defs")
        ;
      else
        console.warn(tn, nd);
    }
  };
  Typr.SVG._tokens = function(d) {
    var ts = [], off = 0, rn = false, cn = "";
    while (off < d.length) {
      var cc = d.charCodeAt(off), ch = d.charAt(off);
      off++;
      var isNum = 48 <= cc && cc <= 57 || ch == "." || ch == "-";
      if (rn) {
        if (ch == "-") {
          ts.push(parseFloat(cn));
          cn = ch;
        } else if (isNum)
          cn += ch;
        else {
          ts.push(parseFloat(cn));
          if (ch != "," && ch != " ")
            ts.push(ch);
          rn = false;
        }
      } else {
        if (isNum) {
          cn = ch;
          rn = true;
        } else if (ch != "," && ch != " ")
          ts.push(ch);
      }
    }
    if (rn)
      ts.push(parseFloat(cn));
    return ts;
  };
  Typr.SVG._toksToPath = function(ts, pth) {
    var i = 0, x = 0, y = 0, ox = 0, oy = 0;
    var pc = { "M": 2, "L": 2, "H": 1, "V": 1, "S": 4, "C": 6 };
    var cmds = pth.cmds, crds = pth.crds;
    while (i < ts.length) {
      var cmd = ts[i];
      i++;
      if (cmd == "z") {
        cmds.push("Z");
        x = ox;
        y = oy;
      } else {
        var cmu = cmd.toUpperCase();
        var ps = pc[cmu], reps = Typr.SVG._reps(ts, i, ps);
        for (var j = 0; j < reps; j++) {
          var xi = 0, yi = 0;
          if (cmd != cmu) {
            xi = x;
            yi = y;
          }
          if (cmu == "M") {
            x = xi + ts[i++];
            y = yi + ts[i++];
            cmds.push("M");
            crds.push(x, y);
            ox = x;
            oy = y;
          } else if (cmu == "L") {
            x = xi + ts[i++];
            y = yi + ts[i++];
            cmds.push("L");
            crds.push(x, y);
          } else if (cmu == "H") {
            x = xi + ts[i++];
            cmds.push("L");
            crds.push(x, y);
          } else if (cmu == "V") {
            y = yi + ts[i++];
            cmds.push("L");
            crds.push(x, y);
          } else if (cmu == "C") {
            var x1 = xi + ts[i++], y1 = yi + ts[i++], x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
            cmds.push("C");
            crds.push(x1, y1, x2, y2, x3, y3);
            x = x3;
            y = y3;
          } else if (cmu == "S") {
            var co = Math.max(crds.length - 4, 0);
            var x1 = x + x - crds[co], y1 = y + y - crds[co + 1];
            var x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
            cmds.push("C");
            crds.push(x1, y1, x2, y2, x3, y3);
            x = x3;
            y = y3;
          } else
            console.warn("Unknown SVG command " + cmd);
        }
      }
    }
  };
  Typr.SVG._reps = function(ts, off, ps) {
    var i = off;
    while (i < ts.length) {
      if (typeof ts[i] == "string")
        break;
      i += ps;
    }
    return (i - off) / ps;
  };
  if (Typr == null)
    Typr = {};
  if (Typr.U == null)
    Typr.U = {};
  Typr.U.codeToGlyph = function(font, code) {
    var cmap = font.cmap;
    for (var _i = 0, _a = [cmap.p0e4, cmap.p3e1, cmap.p3e10, cmap.p0e3, cmap.p1e0]; _i < _a.length; _i++) {
      var tind = _a[_i];
      if (tind == null)
        continue;
      var tab = cmap.tables[tind];
      if (tab.format == 0) {
        if (code >= tab.map.length)
          continue;
        return tab.map[code];
      } else if (tab.format == 4) {
        var sind = -1;
        for (var i = 0; i < tab.endCount.length; i++) {
          if (code <= tab.endCount[i]) {
            sind = i;
            break;
          }
        }
        if (sind == -1)
          continue;
        if (tab.startCount[sind] > code)
          continue;
        var gli = 0;
        if (tab.idRangeOffset[sind] != 0) {
          gli = tab.glyphIdArray[code - tab.startCount[sind] + (tab.idRangeOffset[sind] >> 1) - (tab.idRangeOffset.length - sind)];
        } else {
          gli = code + tab.idDelta[sind];
        }
        return gli & 65535;
      } else if (tab.format == 12) {
        if (code > tab.groups[tab.groups.length - 1][1])
          continue;
        for (var i = 0; i < tab.groups.length; i++) {
          var grp = tab.groups[i];
          if (grp[0] <= code && code <= grp[1])
            return grp[2] + (code - grp[0]);
        }
        continue;
      } else {
        throw "unknown cmap table format " + tab.format;
      }
    }
    return 0;
  };
  Typr.U.glyphToPath = function(font, gid) {
    var path = { cmds: [], crds: [] };
    if (font.SVG && font.SVG.entries[gid]) {
      var p = font.SVG.entries[gid];
      if (p == null)
        return path;
      if (typeof p == "string") {
        p = Typr.SVG.toPath(p);
        font.SVG.entries[gid] = p;
      }
      return p;
    } else if (font.CFF) {
      var state = { x: 0, y: 0, stack: [], nStems: 0, haveWidth: false, width: font.CFF.Private ? font.CFF.Private.defaultWidthX : 0, open: false };
      var cff = font.CFF, pdct = font.CFF.Private;
      if (cff.ROS) {
        var gi = 0;
        while (cff.FDSelect[gi + 2] <= gid)
          gi += 2;
        pdct = cff.FDArray[cff.FDSelect[gi + 1]].Private;
      }
      Typr.U._drawCFF(font.CFF.CharStrings[gid], state, cff, pdct, path);
    } else if (font.glyf) {
      Typr.U._drawGlyf(gid, font, path);
    }
    return path;
  };
  Typr.U._drawGlyf = function(gid, font, path) {
    var gl = font.glyf[gid];
    if (gl == null)
      gl = font.glyf[gid] = Typr.glyf._parseGlyf(font, gid);
    if (gl != null) {
      if (gl.noc > -1) {
        Typr.U._simpleGlyph(gl, path);
      } else {
        Typr.U._compoGlyph(gl, font, path);
      }
    }
  };
  Typr.U._simpleGlyph = function(gl, p) {
    for (var c = 0; c < gl.noc; c++) {
      var i0 = c == 0 ? 0 : gl.endPts[c - 1] + 1;
      var il = gl.endPts[c];
      for (var i = i0; i <= il; i++) {
        var pr = i == i0 ? il : i - 1;
        var nx = i == il ? i0 : i + 1;
        var onCurve = gl.flags[i] & 1;
        var prOnCurve = gl.flags[pr] & 1;
        var nxOnCurve = gl.flags[nx] & 1;
        var x = gl.xs[i], y = gl.ys[i];
        if (i == i0) {
          if (onCurve) {
            if (prOnCurve) {
              Typr.U.P.moveTo(p, gl.xs[pr], gl.ys[pr]);
            } else {
              Typr.U.P.moveTo(p, x, y);
              continue;
            }
          } else {
            if (prOnCurve) {
              Typr.U.P.moveTo(p, gl.xs[pr], gl.ys[pr]);
            } else {
              Typr.U.P.moveTo(p, (gl.xs[pr] + x) / 2, (gl.ys[pr] + y) / 2);
            }
          }
        }
        if (onCurve) {
          if (prOnCurve)
            Typr.U.P.lineTo(p, x, y);
        } else {
          if (nxOnCurve) {
            Typr.U.P.qcurveTo(p, x, y, gl.xs[nx], gl.ys[nx]);
          } else {
            Typr.U.P.qcurveTo(p, x, y, (x + gl.xs[nx]) / 2, (y + gl.ys[nx]) / 2);
          }
        }
      }
      Typr.U.P.closePath(p);
    }
  };
  Typr.U._compoGlyph = function(gl, font, p) {
    for (var j = 0; j < gl.parts.length; j++) {
      var path = { cmds: [], crds: [] };
      var prt = gl.parts[j];
      Typr.U._drawGlyf(prt.glyphIndex, font, path);
      var m = prt.m;
      for (var i = 0; i < path.crds.length; i += 2) {
        var x = path.crds[i], y = path.crds[i + 1];
        p.crds.push(x * m.a + y * m.b + m.tx);
        p.crds.push(x * m.c + y * m.d + m.ty);
      }
      for (var i = 0; i < path.cmds.length; i++) {
        p.cmds.push(path.cmds[i]);
      }
    }
  };
  Typr.U._getGlyphClass = function(g, cd) {
    var intr = Typr._lctf.getInterval(cd, g);
    return intr == -1 ? 0 : cd[intr + 2];
  };
  Typr.U.getPairAdjustment = function(font, g1, g2) {
    var hasGPOSkern = false;
    if (font.GPOS) {
      var gpos = font["GPOS"];
      var llist = gpos.lookupList, flist = gpos.featureList;
      var tused = [];
      for (var i = 0; i < flist.length; i++) {
        var fl = flist[i];
        if (fl.tag != "kern")
          continue;
        hasGPOSkern = true;
        for (var ti = 0; ti < fl.tab.length; ti++) {
          if (tused[fl.tab[ti]])
            continue;
          tused[fl.tab[ti]] = true;
          var tab = llist[fl.tab[ti]];
          for (var j = 0; j < tab.tabs.length; j++) {
            if (tab.tabs[j] == null)
              continue;
            var ltab = tab.tabs[j], ind;
            if (ltab.coverage) {
              ind = Typr._lctf.coverageIndex(ltab.coverage, g1);
              if (ind == -1)
                continue;
            }
            if (tab.ltype == 1)
              ;
            else if (tab.ltype == 2) {
              var adj = null;
              if (ltab.fmt == 1) {
                var right = ltab.pairsets[ind];
                for (var i = 0; i < right.length; i++) {
                  if (right[i].gid2 == g2)
                    adj = right[i];
                }
              } else if (ltab.fmt == 2) {
                var c1 = Typr.U._getGlyphClass(g1, ltab.classDef1);
                var c2 = Typr.U._getGlyphClass(g2, ltab.classDef2);
                adj = ltab.matrix[c1][c2];
              }
              if (adj) {
                var offset = 0;
                if (adj.val1 && adj.val1[2])
                  offset += adj.val1[2];
                if (adj.val2 && adj.val2[0])
                  offset += adj.val2[0];
                return offset;
              }
            }
          }
        }
      }
    }
    if (font.kern && !hasGPOSkern) {
      var ind1 = font.kern.glyph1.indexOf(g1);
      if (ind1 != -1) {
        var ind2 = font.kern.rval[ind1].glyph2.indexOf(g2);
        if (ind2 != -1)
          return font.kern.rval[ind1].vals[ind2];
      }
    }
    return 0;
  };
  Typr.U.stringToGlyphs = function(font, str) {
    var gls = [];
    for (var i = 0; i < str.length; i++) {
      var cc = str.codePointAt(i);
      if (cc > 65535)
        i++;
      gls.push(Typr.U.codeToGlyph(font, cc));
    }
    for (var i = 0; i < str.length; i++) {
      var cc = str.codePointAt(i);
      if (cc == 2367) {
        var t = gls[i - 1];
        gls[i - 1] = gls[i];
        gls[i] = t;
      }
      if (cc > 65535)
        i++;
    }
    var gsub = font["GSUB"];
    if (gsub == null)
      return gls;
    var llist = gsub.lookupList, flist = gsub.featureList;
    var cligs = [
      "rlig",
      "liga",
      "mset",
      "isol",
      "init",
      "fina",
      "medi",
      "half",
      "pres",
      "blws"
      /* Tibetan fonts like Himalaya.ttf */
    ];
    var tused = [];
    for (var fi = 0; fi < flist.length; fi++) {
      var fl = flist[fi];
      if (cligs.indexOf(fl.tag) == -1)
        continue;
      for (var ti = 0; ti < fl.tab.length; ti++) {
        if (tused[fl.tab[ti]])
          continue;
        tused[fl.tab[ti]] = true;
        var tab = llist[fl.tab[ti]];
        for (var ci = 0; ci < gls.length; ci++) {
          var feat = Typr.U._getWPfeature(str, ci);
          if ("isol,init,fina,medi".indexOf(fl.tag) != -1 && fl.tag != feat)
            continue;
          Typr.U._applySubs(gls, ci, tab, llist);
        }
      }
    }
    return gls;
  };
  Typr.U._getWPfeature = function(str, ci) {
    var wsep = '\n	" ,.:;!?()  ،';
    var R = "آأؤإاةدذرزوٱٲٳٵٶٷڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙۀۃۄۅۆۇۈۉۊۋۍۏےۓەۮۯܐܕܖܗܘܙܞܨܪܬܯݍݙݚݛݫݬݱݳݴݸݹࡀࡆࡇࡉࡔࡧࡩࡪࢪࢫࢬࢮࢱࢲࢹૅેૉ૊૎૏ૐ૑૒૝ૡ૤૯஁ஃ஄அஉ஌எஏ஑னப஫஬";
    var L = "ꡲ્૗";
    var slft = ci == 0 || wsep.indexOf(str[ci - 1]) != -1;
    var srgt = ci == str.length - 1 || wsep.indexOf(str[ci + 1]) != -1;
    if (!slft && R.indexOf(str[ci - 1]) != -1)
      slft = true;
    if (!srgt && R.indexOf(str[ci]) != -1)
      srgt = true;
    if (!srgt && L.indexOf(str[ci + 1]) != -1)
      srgt = true;
    if (!slft && L.indexOf(str[ci]) != -1)
      slft = true;
    var feat = null;
    if (slft) {
      feat = srgt ? "isol" : "init";
    } else {
      feat = srgt ? "fina" : "medi";
    }
    return feat;
  };
  Typr.U._applySubs = function(gls, ci, tab, llist) {
    var rlim = gls.length - ci - 1;
    for (var j = 0; j < tab.tabs.length; j++) {
      if (tab.tabs[j] == null)
        continue;
      var ltab = tab.tabs[j], ind;
      if (ltab.coverage) {
        ind = Typr._lctf.coverageIndex(ltab.coverage, gls[ci]);
        if (ind == -1)
          continue;
      }
      if (tab.ltype == 1) {
        gls[ci];
        if (ltab.fmt == 1)
          gls[ci] = gls[ci] + ltab.delta;
        else
          gls[ci] = ltab.newg[ind];
      } else if (tab.ltype == 4) {
        var vals = ltab.vals[ind];
        for (var k = 0; k < vals.length; k++) {
          var lig = vals[k], rl = lig.chain.length;
          if (rl > rlim)
            continue;
          var good = true, em1 = 0;
          for (var l = 0; l < rl; l++) {
            while (gls[ci + em1 + (1 + l)] == -1)
              em1++;
            if (lig.chain[l] != gls[ci + em1 + (1 + l)])
              good = false;
          }
          if (!good)
            continue;
          gls[ci] = lig.nglyph;
          for (var l = 0; l < rl + em1; l++)
            gls[ci + l + 1] = -1;
          break;
        }
      } else if (tab.ltype == 5 && ltab.fmt == 2) {
        var cind = Typr._lctf.getInterval(ltab.cDef, gls[ci]);
        var cls = ltab.cDef[cind + 2], scs = ltab.scset[cls];
        for (var i = 0; i < scs.length; i++) {
          var sc = scs[i], inp = sc.input;
          if (inp.length > rlim)
            continue;
          var good = true;
          for (var l = 0; l < inp.length; l++) {
            var cind2 = Typr._lctf.getInterval(ltab.cDef, gls[ci + 1 + l]);
            if (cind == -1 && ltab.cDef[cind2 + 2] != inp[l]) {
              good = false;
              break;
            }
          }
          if (!good)
            continue;
          var lrs = sc.substLookupRecords;
          for (var k = 0; k < lrs.length; k += 2) {
            lrs[k];
            lrs[k + 1];
          }
        }
      } else if (tab.ltype == 6 && ltab.fmt == 3) {
        if (!Typr.U._glsCovered(gls, ltab.backCvg, ci - ltab.backCvg.length))
          continue;
        if (!Typr.U._glsCovered(gls, ltab.inptCvg, ci))
          continue;
        if (!Typr.U._glsCovered(gls, ltab.ahedCvg, ci + ltab.inptCvg.length))
          continue;
        var lr = ltab.lookupRec;
        for (var i = 0; i < lr.length; i += 2) {
          var cind = lr[i], tab2 = llist[lr[i + 1]];
          Typr.U._applySubs(gls, ci + cind, tab2, llist);
        }
      }
    }
  };
  Typr.U._glsCovered = function(gls, cvgs, ci) {
    for (var i = 0; i < cvgs.length; i++) {
      var ind = Typr._lctf.coverageIndex(cvgs[i], gls[ci + i]);
      if (ind == -1)
        return false;
    }
    return true;
  };
  Typr.U.glyphsToPath = function(font, gls, clr) {
    var tpath = { cmds: [], crds: [] };
    var x = 0;
    for (var i = 0; i < gls.length; i++) {
      var gid = gls[i];
      if (gid == -1)
        continue;
      var gid2 = i < gls.length - 1 && gls[i + 1] != -1 ? gls[i + 1] : 0;
      var path = Typr.U.glyphToPath(font, gid);
      for (var j = 0; j < path.crds.length; j += 2) {
        tpath.crds.push(path.crds[j] + x);
        tpath.crds.push(path.crds[j + 1]);
      }
      if (clr)
        tpath.cmds.push(clr);
      for (var j = 0; j < path.cmds.length; j++)
        tpath.cmds.push(path.cmds[j]);
      if (clr)
        tpath.cmds.push("X");
      x += font.hmtx.aWidth[gid];
      if (i < gls.length - 1)
        x += Typr.U.getPairAdjustment(font, gid, gid2);
    }
    return tpath;
  };
  Typr.U.pathToSVG = function(path, prec) {
    if (prec == null)
      prec = 5;
    var out = [], co = 0, lmap = { "M": 2, "L": 2, "Q": 4, "C": 6 };
    for (var i = 0; i < path.cmds.length; i++) {
      var cmd = path.cmds[i], cn = co + (lmap[cmd] ? lmap[cmd] : 0);
      out.push(cmd);
      while (co < cn) {
        var c = path.crds[co++];
        out.push(parseFloat(c.toFixed(prec)) + (co == cn ? "" : " "));
      }
    }
    return out.join("");
  };
  Typr.U.pathToContext = function(path, ctx) {
    var c = 0, crds = path.crds;
    for (var j = 0; j < path.cmds.length; j++) {
      var cmd = path.cmds[j];
      if (cmd == "M") {
        ctx.moveTo(crds[c], crds[c + 1]);
        c += 2;
      } else if (cmd == "L") {
        ctx.lineTo(crds[c], crds[c + 1]);
        c += 2;
      } else if (cmd == "C") {
        ctx.bezierCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3], crds[c + 4], crds[c + 5]);
        c += 6;
      } else if (cmd == "Q") {
        ctx.quadraticCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3]);
        c += 4;
      } else if (cmd.charAt(0) == "#") {
        ctx.beginPath();
        ctx.fillStyle = cmd;
      } else if (cmd == "Z") {
        ctx.closePath();
      } else if (cmd == "X") {
        ctx.fill();
      }
    }
  };
  Typr.U.P = {};
  Typr.U.P.moveTo = function(p, x, y) {
    p.cmds.push("M");
    p.crds.push(x, y);
  };
  Typr.U.P.lineTo = function(p, x, y) {
    p.cmds.push("L");
    p.crds.push(x, y);
  };
  Typr.U.P.curveTo = function(p, a, b, c, d, e, f) {
    p.cmds.push("C");
    p.crds.push(a, b, c, d, e, f);
  };
  Typr.U.P.qcurveTo = function(p, a, b, c, d) {
    p.cmds.push("Q");
    p.crds.push(a, b, c, d);
  };
  Typr.U.P.closePath = function(p) {
    p.cmds.push("Z");
  };
  Typr.U._drawCFF = function(cmds, state, font, pdct, p) {
    var stack = state.stack;
    var nStems = state.nStems, haveWidth = state.haveWidth, width = state.width, open = state.open;
    var i = 0;
    var x = state.x, y = state.y, c1x = 0, c1y = 0, c2x = 0, c2y = 0, c3x = 0, c3y = 0, c4x = 0, c4y = 0, jpx = 0, jpy = 0;
    var o = { val: 0, size: 0 };
    while (i < cmds.length) {
      Typr.CFF.getCharString(cmds, i, o);
      var v = o.val;
      i += o.size;
      if (v == "o1" || v == "o18") {
        var hasWidthArg;
        hasWidthArg = stack.length % 2 !== 0;
        if (hasWidthArg && !haveWidth) {
          width = stack.shift() + pdct.nominalWidthX;
        }
        nStems += stack.length >> 1;
        stack.length = 0;
        haveWidth = true;
      } else if (v == "o3" || v == "o23") {
        var hasWidthArg;
        hasWidthArg = stack.length % 2 !== 0;
        if (hasWidthArg && !haveWidth) {
          width = stack.shift() + pdct.nominalWidthX;
        }
        nStems += stack.length >> 1;
        stack.length = 0;
        haveWidth = true;
      } else if (v == "o4") {
        if (stack.length > 1 && !haveWidth) {
          width = stack.shift() + pdct.nominalWidthX;
          haveWidth = true;
        }
        if (open)
          Typr.U.P.closePath(p);
        y += stack.pop();
        Typr.U.P.moveTo(p, x, y);
        open = true;
      } else if (v == "o5") {
        while (stack.length > 0) {
          x += stack.shift();
          y += stack.shift();
          Typr.U.P.lineTo(p, x, y);
        }
      } else if (v == "o6" || v == "o7") {
        var count = stack.length;
        var isX = v == "o6";
        for (var j = 0; j < count; j++) {
          var sval = stack.shift();
          if (isX) {
            x += sval;
          } else {
            y += sval;
          }
          isX = !isX;
          Typr.U.P.lineTo(p, x, y);
        }
      } else if (v == "o8" || v == "o24") {
        var count = stack.length;
        var index = 0;
        while (index + 6 <= count) {
          c1x = x + stack.shift();
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          x = c2x + stack.shift();
          y = c2y + stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
          index += 6;
        }
        if (v == "o24") {
          x += stack.shift();
          y += stack.shift();
          Typr.U.P.lineTo(p, x, y);
        }
      } else if (v == "o11") {
        break;
      } else if (v == "o1234" || v == "o1235" || v == "o1236" || v == "o1237") {
        if (v == "o1234") {
          c1x = x + stack.shift();
          c1y = y;
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          jpx = c2x + stack.shift();
          jpy = c2y;
          c3x = jpx + stack.shift();
          c3y = c2y;
          c4x = c3x + stack.shift();
          c4y = y;
          x = c4x + stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
          Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
        }
        if (v == "o1235") {
          c1x = x + stack.shift();
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          jpx = c2x + stack.shift();
          jpy = c2y + stack.shift();
          c3x = jpx + stack.shift();
          c3y = jpy + stack.shift();
          c4x = c3x + stack.shift();
          c4y = c3y + stack.shift();
          x = c4x + stack.shift();
          y = c4y + stack.shift();
          stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
          Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
        }
        if (v == "o1236") {
          c1x = x + stack.shift();
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          jpx = c2x + stack.shift();
          jpy = c2y;
          c3x = jpx + stack.shift();
          c3y = c2y;
          c4x = c3x + stack.shift();
          c4y = c3y + stack.shift();
          x = c4x + stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
          Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
        }
        if (v == "o1237") {
          c1x = x + stack.shift();
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          jpx = c2x + stack.shift();
          jpy = c2y + stack.shift();
          c3x = jpx + stack.shift();
          c3y = jpy + stack.shift();
          c4x = c3x + stack.shift();
          c4y = c3y + stack.shift();
          if (Math.abs(c4x - x) > Math.abs(c4y - y)) {
            x = c4x + stack.shift();
          } else {
            y = c4y + stack.shift();
          }
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
          Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
        }
      } else if (v == "o14") {
        if (stack.length > 0 && !haveWidth) {
          width = stack.shift() + font.nominalWidthX;
          haveWidth = true;
        }
        if (stack.length == 4) {
          var adx = stack.shift();
          var ady = stack.shift();
          var bchar = stack.shift();
          var achar = stack.shift();
          var bind2 = Typr.CFF.glyphBySE(font, bchar);
          var aind = Typr.CFF.glyphBySE(font, achar);
          Typr.U._drawCFF(font.CharStrings[bind2], state, font, pdct, p);
          state.x = adx;
          state.y = ady;
          Typr.U._drawCFF(font.CharStrings[aind], state, font, pdct, p);
        }
        if (open) {
          Typr.U.P.closePath(p);
          open = false;
        }
      } else if (v == "o19" || v == "o20") {
        var hasWidthArg;
        hasWidthArg = stack.length % 2 !== 0;
        if (hasWidthArg && !haveWidth) {
          width = stack.shift() + pdct.nominalWidthX;
        }
        nStems += stack.length >> 1;
        stack.length = 0;
        haveWidth = true;
        i += nStems + 7 >> 3;
      } else if (v == "o21") {
        if (stack.length > 2 && !haveWidth) {
          width = stack.shift() + pdct.nominalWidthX;
          haveWidth = true;
        }
        y += stack.pop();
        x += stack.pop();
        if (open)
          Typr.U.P.closePath(p);
        Typr.U.P.moveTo(p, x, y);
        open = true;
      } else if (v == "o22") {
        if (stack.length > 1 && !haveWidth) {
          width = stack.shift() + pdct.nominalWidthX;
          haveWidth = true;
        }
        x += stack.pop();
        if (open)
          Typr.U.P.closePath(p);
        Typr.U.P.moveTo(p, x, y);
        open = true;
      } else if (v == "o25") {
        while (stack.length > 6) {
          x += stack.shift();
          y += stack.shift();
          Typr.U.P.lineTo(p, x, y);
        }
        c1x = x + stack.shift();
        c1y = y + stack.shift();
        c2x = c1x + stack.shift();
        c2y = c1y + stack.shift();
        x = c2x + stack.shift();
        y = c2y + stack.shift();
        Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
      } else if (v == "o26") {
        if (stack.length % 2) {
          x += stack.shift();
        }
        while (stack.length > 0) {
          c1x = x;
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          x = c2x;
          y = c2y + stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
        }
      } else if (v == "o27") {
        if (stack.length % 2) {
          y += stack.shift();
        }
        while (stack.length > 0) {
          c1x = x + stack.shift();
          c1y = y;
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          x = c2x + stack.shift();
          y = c2y;
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
        }
      } else if (v == "o10" || v == "o29") {
        var obj = v == "o10" ? pdct : font;
        if (stack.length == 0) {
          console.warn("error: empty stack");
        } else {
          var ind = stack.pop();
          var subr = obj.Subrs[ind + obj.Bias];
          state.x = x;
          state.y = y;
          state.nStems = nStems;
          state.haveWidth = haveWidth;
          state.width = width;
          state.open = open;
          Typr.U._drawCFF(subr, state, font, pdct, p);
          x = state.x;
          y = state.y;
          nStems = state.nStems;
          haveWidth = state.haveWidth;
          width = state.width;
          open = state.open;
        }
      } else if (v == "o30" || v == "o31") {
        var count, count1 = stack.length;
        var index = 0;
        var alternate = v == "o31";
        count = count1 & ~2;
        index += count1 - count;
        while (index < count) {
          if (alternate) {
            c1x = x + stack.shift();
            c1y = y;
            c2x = c1x + stack.shift();
            c2y = c1y + stack.shift();
            y = c2y + stack.shift();
            if (count - index == 5) {
              x = c2x + stack.shift();
              index++;
            } else {
              x = c2x;
            }
            alternate = false;
          } else {
            c1x = x;
            c1y = y + stack.shift();
            c2x = c1x + stack.shift();
            c2y = c1y + stack.shift();
            x = c2x + stack.shift();
            if (count - index == 5) {
              y = c2y + stack.shift();
              index++;
            } else {
              y = c2y;
            }
            alternate = true;
          }
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
          index += 4;
        }
      } else if ((v + "").charAt(0) == "o") {
        console.warn("Unknown operation: " + v, cmds);
        throw v;
      } else
        stack.push(v);
    }
    state.x = x;
    state.y = y;
    state.nStems = nStems;
    state.haveWidth = haveWidth;
    state.width = width;
    state.open = open;
  };
  Typr$1.Typr = Typr;
  var Typr_js_1 = Typr$1;
  var friendlyTags = { "aalt": "Access All Alternates", "abvf": "Above-base Forms", "abvm": "Above - base Mark Positioning", "abvs": "Above - base Substitutions", "afrc": "Alternative Fractions", "akhn": "Akhands", "blwf": "Below - base Forms", "blwm": "Below - base Mark Positioning", "blws": "Below - base Substitutions", "calt": "Contextual Alternates", "case": "Case - Sensitive Forms", "ccmp": "Glyph Composition / Decomposition", "cfar": "Conjunct Form After Ro", "cjct": "Conjunct Forms", "clig": "Contextual Ligatures", "cpct": "Centered CJK Punctuation", "cpsp": "Capital Spacing", "cswh": "Contextual Swash", "curs": "Cursive Positioning", "c2pc": "Petite Capitals From Capitals", "c2sc": "Small Capitals From Capitals", "dist": "Distances", "dlig": "Discretionary Ligatures", "dnom": "Denominators", "dtls": "Dotless Forms", "expt": "Expert Forms", "falt": "Final Glyph on Line Alternates", "fin2": "Terminal Forms #2", "fin3": "Terminal Forms #3", "fina": "Terminal Forms", "flac": "Flattened accent forms", "frac": "Fractions", "fwid": "Full Widths", "half": "Half Forms", "haln": "Halant Forms", "halt": "Alternate Half Widths", "hist": "Historical Forms", "hkna": "Horizontal Kana Alternates", "hlig": "Historical Ligatures", "hngl": "Hangul", "hojo": "Hojo Kanji Forms(JIS X 0212 - 1990 Kanji Forms)", "hwid": "Half Widths", "init": "Initial Forms", "isol": "Isolated Forms", "ital": "Italics", "jalt": "Justification Alternates", "jp78": "JIS78 Forms", "jp83": "JIS83 Forms", "jp90": "JIS90 Forms", "jp04": "JIS2004 Forms", "kern": "Kerning", "lfbd": "Left Bounds", "liga": "Standard Ligatures", "ljmo": "Leading Jamo Forms", "lnum": "Lining Figures", "locl": "Localized Forms", "ltra": "Left - to - right alternates", "ltrm": "Left - to - right mirrored forms", "mark": "Mark Positioning", "med2": "Medial Forms #2", "medi": "Medial Forms", "mgrk": "Mathematical Greek", "mkmk": "Mark to Mark Positioning", "mset": "Mark Positioning via Substitution", "nalt": "Alternate Annotation Forms", "nlck": "NLC Kanji Forms", "nukt": "Nukta Forms", "numr": "Numerators", "onum": "Oldstyle Figures", "opbd": "Optical Bounds", "ordn": "Ordinals", "ornm": "Ornaments", "palt": "Proportional Alternate Widths", "pcap": "Petite Capitals", "pkna": "Proportional Kana", "pnum": "Proportional Figures", "pref": "Pre - Base Forms", "pres": "Pre - base Substitutions", "pstf": "Post - base Forms", "psts": "Post - base Substitutions", "pwid": "Proportional Widths", "qwid": "Quarter Widths", "rand": "Randomize", "rclt": "Required Contextual Alternates", "rkrf": "Rakar Forms", "rlig": "Required Ligatures", "rphf": "Reph Forms", "rtbd": "Right Bounds", "rtla": "Right - to - left alternates", "rtlm": "Right - to - left mirrored forms", "ruby": "Ruby Notation Forms", "rvrn": "Required Variation Alternates", "salt": "Stylistic Alternates", "sinf": "Scientific Inferiors", "size": "Optical size", "smcp": "Small Capitals", "smpl": "Simplified Forms", "ssty": "Math script style alternates", "stch": "Stretching Glyph Decomposition", "subs": "Subscript", "sups": "Superscript", "swsh": "Swash", "titl": "Titling", "tjmo": "Trailing Jamo Forms", "tnam": "Traditional Name Forms", "tnum": "Tabular Figures", "trad": "Traditional Forms", "twid": "Third Widths", "unic": "Unicase", "valt": "Alternate Vertical Metrics", "vatu": "Vattu Variants", "vert": "Vertical Writing", "vhal": "Alternate Vertical Half Metrics", "vjmo": "Vowel Jamo Forms", "vkna": "Vertical Kana Alternates", "vkrn": "Vertical Kerning", "vpal": "Proportional Alternate Vertical Metrics", "vrt2": "Vertical Alternates and Rotation", "vrtr": "Vertical Alternates for Rotation", "zero": "Slashed Zero" };
  var Font = (
    /** @class */
    function() {
      function Font2(data) {
        var obj = Typr_js_1.Typr.parse(data);
        if (!obj.length || typeof obj[0] !== "object" || typeof obj[0].hasOwnProperty !== "function") {
          throw "unable to parse font";
        }
        for (var n in obj[0]) {
          this[n] = obj[0][n];
        }
        this.enabledGSUB = {};
      }
      Font2.prototype.getFamilyName = function() {
        return this.name && (this.name.typoFamilyName || this.name.fontFamily) || "";
      };
      Font2.prototype.getSubFamilyName = function() {
        return this.name && (this.name.typoSubfamilyName || this.name.fontSubfamily) || "";
      };
      Font2.prototype.glyphToPath = function(gid) {
        return Typr_js_1.Typr.U.glyphToPath(this, gid);
      };
      Font2.prototype.getPairAdjustment = function(gid1, gid2) {
        return Typr_js_1.Typr.U.getPairAdjustment(this, gid1, gid2);
      };
      Font2.prototype.stringToGlyphs = function(str) {
        return Typr_js_1.Typr.U.stringToGlyphs(this, str);
      };
      Font2.prototype.glyphsToPath = function(gls) {
        return Typr_js_1.Typr.U.glyphsToPath(this, gls);
      };
      Font2.prototype.pathToSVG = function(path, prec) {
        return Typr_js_1.Typr.U.pathToSVG(path, prec);
      };
      Font2.prototype.pathToContext = function(path, ctx) {
        return Typr_js_1.Typr.U.pathToContext(path, ctx);
      };
      Font2.prototype.lookupFriendlyName = function(table, feature) {
        if (this[table] !== void 0) {
          var tbl = this[table];
          var feat = tbl.featureList[feature];
          return this.featureFriendlyName(feat);
        }
        return "";
      };
      Font2.prototype.featureFriendlyName = function(feature) {
        if (friendlyTags[feature.tag]) {
          return friendlyTags[feature.tag];
        }
        if (feature.tag.match(/ss[0-2][0-9]/)) {
          var name_1 = "Stylistic Set " + Number(feature.tag.substr(2, 2)).toString();
          if (feature.featureParams) {
            var version = Typr_js_1.Typr._bin.readUshort(this._data, feature.featureParams);
            if (version === 0) {
              var nameID = Typr_js_1.Typr._bin.readUshort(this._data, feature.featureParams + 2);
              if (this.name && this.name[nameID] !== void 0) {
                return name_1 + " - " + this.name[nameID];
              }
            }
          }
          return name_1;
        }
        if (feature.tag.match(/cv[0-9][0-9]/)) {
          return "Character Variant " + Number(feature.tag.substr(2, 2)).toString();
        }
        return "";
      };
      Font2.prototype.enableGSUB = function(featureNumber) {
        if (this.GSUB) {
          var feature = this.GSUB.featureList[featureNumber];
          if (feature) {
            for (var i = 0; i < feature.tab.length; ++i) {
              this.enabledGSUB[feature.tab[i]] = (this.enabledGSUB[feature.tab[i]] || 0) + 1;
            }
          }
        }
      };
      Font2.prototype.disableGSUB = function(featureNumber) {
        if (this.GSUB) {
          var feature = this.GSUB.featureList[featureNumber];
          if (feature) {
            for (var i = 0; i < feature.tab.length; ++i) {
              if (this.enabledGSUB[feature.tab[i]] > 1) {
                --this.enabledGSUB[feature.tab[i]];
              } else {
                delete this.enabledGSUB[feature.tab[i]];
              }
            }
          }
        }
      };
      Font2.prototype.codeToGlyph = function(code) {
        var g = Typr_js_1.Typr.U.codeToGlyph(this, code);
        if (this.GSUB) {
          var gls = [g];
          for (var n in this.enabledGSUB) {
            var l = this.GSUB.lookupList[n];
            Typr_js_1.Typr.U._applySubs(gls, 0, l, this.GSUB.lookupList);
          }
          if (gls.length === 1)
            return gls[0];
        }
        return g;
      };
      return Font2;
    }()
  );
  var Font_1 = Font;
  let cachedCxSecretFontTable = null;
  function decrypt(iframeDocument) {
    var _a, _b, _c;
    const styles = iframeDocument.querySelectorAll("style");
    let tip;
    for (let i = 0; i < styles.length; i++) {
      if ((_a = styles[i].textContent) == null ? void 0 : _a.includes("font-cxsecret")) {
        tip = styles[i];
        break;
      }
    }
    if (!tip)
      return;
    const fontData = (_c = (_b = tip.textContent) == null ? void 0 : _b.match(/base64,([\w\W]+?)'/)) == null ? void 0 : _c[1];
    if (!fontData)
      return;
    const fontArrayBuffer = base64ToArrayBuffer(fontData);
    const font = new Font_1(fontArrayBuffer);
    const table = cachedCxSecretFontTable || (cachedCxSecretFontTable = JSON.parse(_GM_getResourceText("ttf")));
    const match = {};
    for (let i = 19968; i < 40870; i++) {
      const glyph = font.codeToGlyph(i);
      if (!glyph)
        continue;
      const path = font.glyphToPath(glyph);
      const hash = md5(JSON.stringify(path)).slice(24);
      match[i] = table[hash];
    }
    const elements = iframeDocument.querySelectorAll(".font-cxsecret");
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      let html = el.innerHTML;
      for (const key in match) {
        const value = String.fromCharCode(match[key]);
        const regExp = new RegExp(String.fromCharCode(Number(key)), "g");
        html = html.replace(regExp, value);
      }
      el.innerHTML = html;
      el.classList.remove("font-cxsecret");
    }
    function base64ToArrayBuffer(base64) {
      const data = window.atob(base64);
      const buffer = new ArrayBuffer(data.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < data.length; ++i) {
        view[i] = data.charCodeAt(i);
      }
      return buffer;
    }
  }
  const sleep = (second) => {
    return new Promise((resolve) => setTimeout(resolve, second * 1e3));
  };
  const PASTE_UNLOCK_KEY = "__xuexutongPasteUnlock__";
  const IFRAME_REFRESH_BIND_KEY = "__xuexutongFrameRefreshBound__";
  const scheduleRuntimeTimer = (timerKey, callback, delay = 0) => {
    if (runtimeState[timerKey]) {
      clearTimeout(runtimeState[timerKey]);
    }
    runtimeState[timerKey] = window.setTimeout(() => {
      runtimeState[timerKey] = 0;
      callback();
    }, delay);
  };
  const elementMatchesAnySelector = (element, selectors) => {
    if (!element || element.nodeType !== 1) {
      return false;
    }
    return getSelectorList(selectors).some((selector) => {
      try {
        return element.matches(selector) || !!element.querySelector(selector);
      } catch (_error) {
        return false;
      }
    });
  };
  const isRelevantMutationNode = (node, selectors) => {
    if (node?.nodeType === 1 && node.tagName === "IFRAME") {
      return true;
    }
    return elementMatchesAnySelector(node, selectors);
  };
  const refreshAccessibleDocuments = () => {
    const documents = [];
    const visited = /* @__PURE__ */ new Set();
    const queue = [document];
    while (queue.length) {
      const currentDocument = queue.shift();
      if (!currentDocument || visited.has(currentDocument) || !currentDocument.documentElement) {
        continue;
      }
      visited.add(currentDocument);
      documents.push(currentDocument);
      currentDocument.querySelectorAll("iframe").forEach((iframeElement) => {
        try {
          if (!iframeElement[IFRAME_REFRESH_BIND_KEY]) {
            iframeElement[IFRAME_REFRESH_BIND_KEY] = true;
            iframeElement.addEventListener("load", () => {
              scheduleAccessibleDocumentRefresh(120);
            });
          }
          const iframeDocument = iframeElement.contentDocument;
          if (iframeDocument && iframeDocument.documentElement) {
            queue.push(iframeDocument);
          }
        } catch (_error) {
        }
      });
    }
    runtimeState.accessibleDocuments = documents;
    runtimeState.accessibleDocumentsUpdatedAt = Date.now();
    return documents;
  };
  const scheduleAccessibleDocumentRefresh = (delay = 120) => {
    scheduleRuntimeTimer("accessibleDocumentRefreshTimer", () => {
      refreshAccessibleDocuments();
    }, delay);
  };
  const isPasteRelevantDocument = (targetDocument) => {
    if (!targetDocument) {
      return false;
    }
    if (targetDocument === document) {
      return true;
    }
    return !!targetDocument.querySelector("iframe[id^='ueditor'],iframe[src*='ueditor'],textarea,input,[contenteditable],body[contenteditable='true'],body[contenteditable='']");
  };
  const unlockPasteForDocument = (targetDocument) => {
    if (!isPasteRelevantDocument(targetDocument)) {
      return;
    }
    const html = targetDocument.documentElement;
    if (!html) {
      return;
    }
    if (!html[PASTE_UNLOCK_KEY]) {
      html[PASTE_UNLOCK_KEY] = true;
      ["paste", "copy", "cut", "contextmenu", "selectstart"].forEach((eventName) => {
        html.addEventListener(eventName, (event) => {
          event.stopImmediatePropagation();
        }, true);
      });
    }
    const allowAction = () => true;
    const body = targetDocument.body;
    [targetDocument, html, body].forEach((target) => {
      if (!target) {
        return;
      }
      try {
        target.onpaste = allowAction;
        target.oncopy = allowAction;
        target.oncut = allowAction;
        target.oncontextmenu = allowAction;
        target.onselectstart = allowAction;
      } catch (_error) {
      }
    });
    queryAll(["textarea", "input", "[contenteditable]", "body"], targetDocument).forEach((element) => {
      if (!element) {
        return;
      }
      try {
        element.onpaste = allowAction;
        element.oncopy = allowAction;
        element.oncut = allowAction;
        element.oncontextmenu = allowAction;
        element.onselectstart = allowAction;
      } catch (_error) {
      }
      if ("readOnly" in element) {
        try {
          element.readOnly = false;
        } catch (_error) {
        }
      }
      if ("disabled" in element) {
        try {
          element.disabled = false;
        } catch (_error) {
        }
      }
      try {
        element.removeAttribute("readonly");
        element.removeAttribute("disabled");
        element.removeAttribute("onpaste");
        element.removeAttribute("oncopy");
        element.removeAttribute("oncut");
        element.removeAttribute("oncontextmenu");
        element.removeAttribute("onselectstart");
        if (element.matches("[contenteditable='false']")) {
          element.setAttribute("contenteditable", "true");
        }
      } catch (_error) {
      }
    });
    try {
      if (targetDocument.designMode === "off" && queryFirst(["iframe[id^='ueditor']", "iframe[src*='ueditor']"], targetDocument)) {
        targetDocument.designMode = "on";
      }
    } catch (_error) {
    }
  };
  const getAccessibleDocuments = ({ force = false } = {}) => {
    if (!force && runtimeState.accessibleDocuments.length && Date.now() - runtimeState.accessibleDocumentsUpdatedAt < SCRIPT_LIMITS.accessibleDocumentCacheMs) {
      return runtimeState.accessibleDocuments.filter((targetDocument) => !!targetDocument?.documentElement);
    }
    return refreshAccessibleDocuments();
  };
  const startPasteUnlockWatcher = () => {
    if (runtimeState.pasteWatcherStarted) {
      return;
    }
    runtimeState.pasteWatcherStarted = true;
    const unlockAllDocuments = () => {
      getAccessibleDocuments().forEach((targetDocument) => unlockPasteForDocument(targetDocument));
    };
    const schedulePasteUnlock = (delay = 120) => {
      scheduleRuntimeTimer("pasteUnlockTimer", () => {
        unlockAllDocuments();
      }, delay);
    };
    unlockAllDocuments();
    if (!runtimeState.pasteMutationWatcherStarted && document.documentElement) {
      runtimeState.pasteMutationWatcherStarted = true;
      runtimeState.pasteMutationObserver = new MutationObserver((mutationList) => {
        const shouldRefresh = mutationList.some((mutation) => {
          if (mutation.type !== "childList") {
            return false;
          }
          return Array.from(mutation.addedNodes).some((node) => isRelevantMutationNode(node, ["textarea", "input", "[contenteditable]", "iframe", "body"]));
        });
        if (shouldRefresh) {
          scheduleAccessibleDocumentRefresh();
          schedulePasteUnlock();
        }
      });
      runtimeState.pasteMutationObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
    setInterval(() => {
      unlockAllDocuments();
    }, SCRIPT_LIMITS.pasteUnlockInterval);
  };
  const preventScreenCheck = () => {
    if (runtimeState.yktScreenCheckPrevented) {
      return;
    }
    runtimeState.yktScreenCheckPrevented = true;
    const blockedEvents = /* @__PURE__ */ new Set(["visibilitychange", "blur", "pagehide"]);
    const wrapAddEventListener = (target, backupKey) => {
      if (!target || target[backupKey] || typeof target.addEventListener !== "function") {
        return;
      }
      const originalAddEventListener = target.addEventListener;
      target[backupKey] = originalAddEventListener;
      target.addEventListener = function(type, ...args) {
        if (blockedEvents.has(type)) {
          return;
        }
        return originalAddEventListener.call(this, type, ...args);
      };
    };
    const safeDefine = (target, descriptors) => {
      if (!target) {
        return;
      }
      Object.keys(descriptors).forEach((key) => {
        try {
          Object.defineProperty(target, key, {
            configurable: true,
            ...descriptors[key]
          });
        } catch (_error) {
        }
      });
    };
    wrapAddEventListener(runtimeWindow, "__xuexutongWinAddEventListener__");
    wrapAddEventListener(document, "__xuexutongDocAddEventListener__");
    safeDefine(document, {
      hidden: { get: () => false },
      visibilityState: { get: () => "visible" },
      hasFocus: { value: () => true },
      onvisibilitychange: {
        get: () => void 0,
        set: () => {
        }
      },
      onblur: {
        get: () => void 0,
        set: () => {
        }
      }
    });
    safeDefine(runtimeWindow, {
      onblur: {
        get: () => void 0,
        set: () => {
        }
      },
      onpagehide: {
        get: () => void 0,
        set: () => {
        }
      }
    });
  };
  const sleepMs = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  const YKT_PROGRESS_STORAGE_KEY = "__xuexutongYktProgress__";
  const YKT_DEFAULT_PLAYBACK_RATE = 2;
  const YKT_PPT_INTERVAL_MS = 3e3;
  const getConfigNumberValue = (platformName, partName, paramName, fallbackValue) => {
    try {
      const configStore = useConfigStore();
      const platform = configStore.platformParams?.[platformName];
      const part = platform?.parts?.find((item) => item.name === partName);
      const param = part?.params?.find((item) => item.name === paramName);
      const parsedValue = Number(param?.value);
      return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
    } catch (_error) {
      return fallbackValue;
    }
  };
  const getYktPlaybackRate = () => Math.min(Math.max(getConfigNumberValue("ykt", "播放设置", "视频/音频倍速", YKT_DEFAULT_PLAYBACK_RATE), 1), 16);
  const getYktPptIntervalMs = () => Math.min(Math.max(getConfigNumberValue("ykt", "课件设置", "PPT翻页间隔(毫秒)", YKT_PPT_INTERVAL_MS), 1e3), 6e4);
  const getYktProgressKey = () => `${location.origin}${location.pathname}${location.search}`;
  const readYktProgressMap = () => {
    try {
      const raw = localStorage.getItem(YKT_PROGRESS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_error) {
      return {};
    }
  };
  const writeYktProgressMap = (progressMap) => {
    localStorage.setItem(YKT_PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
  };
  const getYktProgress = (key) => {
    const progressMap = readYktProgressMap();
    if (!progressMap[key]) {
      progressMap[key] = {
        outside: 0,
        inside: 0
      };
      writeYktProgressMap(progressMap);
    }
    return progressMap[key];
  };
  const setYktProgress = (key, outside, inside = 0) => {
    const progressMap = readYktProgressMap();
    progressMap[key] = { outside, inside };
    writeYktProgressMap(progressMap);
  };
  const clearYktProgress = (key) => {
    const progressMap = readYktProgressMap();
    delete progressMap[key];
    writeYktProgressMap(progressMap);
  };
  const getSelectorList = (selectors) => Array.isArray(selectors) ? selectors : [selectors];
  const queryFirst = (selectors, root = document) => {
    if (!(root == null ? void 0 : root.querySelector)) {
      return null;
    }
    for (const selector of getSelectorList(selectors)) {
      try {
        const target = root.querySelector(selector);
        if (target) {
          return target;
        }
      } catch (_error) {
      }
    }
    return null;
  };
  const queryAll = (selectors, root = document) => {
    if (!(root == null ? void 0 : root.querySelectorAll)) {
      return [];
    }
    for (const selector of getSelectorList(selectors)) {
      try {
        const targets = Array.from(root.querySelectorAll(selector));
        if (targets.length) {
          return targets;
        }
      } catch (_error) {
      }
    }
    return [];
  };
  const isElementVisible = (element) => {
    if (!element) {
      return false;
    }
    try {
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
    } catch (_error) {
      return true;
    }
  };
  const getVisibleElements = (elements) => elements.filter((element) => isElementVisible(element));
  const queryFirstVisible = (selectors, root = document) => getVisibleElements(queryAll(selectors, root))[0] || null;
  const yktPoll = (checker, { interval = 1e3, timeout = 2e4 } = {}) => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const runCheck = () => {
        let passed = false;
        try {
          passed = !!checker();
        } catch (_error) {
          passed = false;
        }
        if (passed) {
          resolve(true);
          return;
        }
        if (Date.now() - startTime > timeout) {
          resolve(false);
          return;
        }
        setTimeout(runCheck, interval);
      };
      runCheck();
    });
  };
  const yktIsProgressDone = (text) => {
    if (!text) {
      return false;
    }
    return text.includes("100%") || text.includes("99%") || text.includes("98%") || text.includes("已完成") || text.includes("已读");
  };
  const yktScrollToBottom = (selector) => {
    const element = queryFirst(selector);
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  };
  const waitForSelector = async (selectors, { timeout = 15e3, interval = 500, root = document } = {}) => {
    await yktPoll(() => !!queryFirst(selectors, root), { interval, timeout });
    return queryFirst(selectors, root);
  };
  const clickElementLikeUser = (element) => {
    if (!element) {
      return false;
    }
    try {
      element.dispatchEvent(new MouseEvent("mousemove", {
        bubbles: true,
        clientX: 9999,
        clientY: 9999,
        view: _unsafeWindow || window
      }));
      element.dispatchEvent(new MouseEvent("mousedown", {
        bubbles: true,
        clientX: 9999,
        clientY: 9999,
        view: _unsafeWindow || window
      }));
      element.dispatchEvent(new MouseEvent("mouseup", {
        bubbles: true,
        clientX: 9999,
        clientY: 9999,
        view: _unsafeWindow || window
      }));
    } catch (_error) {
    }
    try {
      element.click();
      return true;
    } catch (_error) {
      return false;
    }
  };
  const getYktTaskMeta = (element) => {
    const title = queryFirst(["h2", ".title", ".header-bar"], element)?.innerText?.trim() || "";
    const tagText = queryFirst([".tag"], element)?.innerText?.trim() || "";
    const tagHref = queryFirst([".tag use", "use"], element)?.getAttribute("xlink:href") || queryFirst([".tag use", "use"], element)?.getAttribute("href") || "";
    const raw = [title, tagText, tagHref, element == null ? void 0 : element.className].filter(Boolean).join(" ").toLowerCase();
    let type = "unknown";
    if (raw.includes("音频") || raw.includes("audio")) {
      type = "audio";
    } else if (raw.includes("shipin") || raw.includes("视频") || raw.includes("video")) {
      type = "video";
    } else if (raw.includes("piliang") || raw.includes("批量")) {
      type = "batch";
    } else if (raw.includes("kejian") || raw.includes("课件") || raw.includes("ppt")) {
      type = "courseware";
    } else if (raw.includes("tuwen") || raw.includes("图文") || raw.includes("阅读") || raw.includes("文档")) {
      type = "reading";
    } else if (raw.includes("taolun") || raw.includes("讨论")) {
      type = "discussion";
    } else if (raw.includes("zuoye") || raw.includes("作业")) {
      type = "homework";
    } else if (raw.includes("kaoshi") || raw.includes("考试")) {
      type = "exam";
    } else if (raw.includes("ketang") || raw.includes("课堂")) {
      type = "classroom";
    }
    return {
      type,
      title: title || tagText || "未命名任务",
      raw,
      tagText,
      tagHref
    };
  };
  const getYktV2CourseItems = () => {
    const listRoot = queryFirst([".logs-list", ".logsList", ".logs_list"]);
    if (!listRoot) {
      return [];
    }
    return getVisibleElements(Array.from(listRoot.children)).filter((item) => !!queryFirst([".content-box section", ".content-box", "section", ".tag"], item));
  };
  const getYktBatchActivities = (course) => {
    const scopedRoot = course?.parentElement?.parentElement || course?.parentElement || course;
    const scopedActivities = queryAll([".leaf_list__wrap .activity__wrap"], scopedRoot);
    if (scopedActivities.length) {
      return scopedActivities;
    }
    const wraps = getVisibleElements(Array.from(document.querySelectorAll(".leaf_list__wrap")));
    if (!wraps.length) {
      return [];
    }
    wraps.sort((left, right) => right.querySelectorAll(".activity__wrap").length - left.querySelectorAll(".activity__wrap").length);
    return Array.from(wraps[0].querySelectorAll(".activity__wrap"));
  };
  const getYktProNextButton = () => queryFirstVisible([".btn-next"]);
  const getYktProLessonNodes = () => getVisibleElements(Array.from(document.querySelectorAll(".leaf-detail")));
  const getYktProStatusText = () => {
    const statusContainer = queryFirst(["section.title", ".title"]);
    return statusContainer?.lastElementChild?.innerText || statusContainer?.innerText || "";
  };
  const isLikelyYktUrl = (url = location.href) => {
    const currentUrl = parseUrlSafe(url);
    const referrerUrl = parseUrlSafe(document.referrer || "");
    return matchesYktUrlHints(currentUrl) || matchesYktUrlHints(referrerUrl);
  };
  const isLikelyYktPage = (url = location.href, targetDocument = document) => {
    if (isLikelyYktUrl(url)) {
      return true;
    }
    try {
      const frameSrcUrl = parseUrlSafe(window.frameElement?.getAttribute("src") || "");
      return !!queryFirst(YKT_PAGE_HINT_SELECTORS, targetDocument) || /雨课堂/i.test(targetDocument.title || "") || isLikelyYktUrl(targetDocument.referrer || "") || matchesYktUrlHints(frameSrcUrl);
    } catch (_error) {
      return false;
    }
  };
  const getYktRuntimeMode = (targetDocument = document) => {
    const currentUrl = parseUrlSafe(location.href);
    const pathname = currentUrl?.pathname || "";
    if (pathname.includes("/pro/lms") || getYktProNextButton() || getYktProLessonNodes().length > 0 || !!queryFirst([".header-bar", "section.title"], targetDocument)) {
      return "pro";
    }
    if (pathname.includes("/v2/web") || getYktV2CourseItems().length > 0 || !!queryFirst([".logs-list", ".logsList", ".logs_list", ".leaf_list__wrap", ".dialog-header", ".video-box", ".progress-wrap .text", ".swiper-wrapper"], targetDocument)) {
      return "v2";
    }
    if (!!queryFirst(["video", "audio", ".play-btn-tip", ".xt_video_player_common_icon"], targetDocument)) {
      return "media";
    }
    return isLikelyYktPage(location.href, targetDocument) ? "shell" : "";
  };
  const getYktSceneSignature = (targetDocument = document) => {
    const flags = [getYktRuntimeMode(targetDocument)];
    if (queryFirst(["video", "audio"], targetDocument)) {
      flags.push("media");
    }
    if (queryFirst([".progress-wrap .text"], targetDocument)) {
      flags.push("progress");
    }
    if (queryFirst([".btn-next"], targetDocument)) {
      flags.push("next");
    }
    if (queryFirst([".leaf_list__wrap"], targetDocument)) {
      flags.push("batch");
    }
    if (queryFirst(["iframe.lesson-report-mobile"], targetDocument)) {
      flags.push("iframe");
    }
    if (queryFirst([".video-box", ".swiper-wrapper"], targetDocument)) {
      flags.push("courseware");
    }
    return flags.filter(Boolean).join("|") || "shell";
  };
  const getPageSceneKey = (url = location.href) => {
    if (isLikelyYktPage(url)) {
      return `ykt:${getYktSceneSignature(document)}`;
    }
    const parsedUrl = parseUrlSafe(url);
    return parsedUrl ? `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}` : url;
  };
  const dispatchRouteChange = () => {
    try {
      window.dispatchEvent(new CustomEvent(ROUTE_CHANGE_EVENT_NAME, {
        detail: { href: location.href }
      }));
    } catch (_error) {
      window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT_NAME));
    }
  };
  const queueRouteChange = () => {
    Promise.resolve().then(() => dispatchRouteChange());
  };
  const hookHistoryRouteEvents = () => {
    if (runtimeState.historyHooked) {
      return;
    }
    runtimeState.historyHooked = true;
    ["pushState", "replaceState"].forEach((method) => {
      try {
        const original = history[method];
        if (typeof original !== "function" || original.__xuexutongPatched) {
          return;
        }
        const wrapped = function(...args) {
          const result = original.apply(this, args);
          queueRouteChange();
          return result;
        };
        wrapped.__xuexutongPatched = true;
        history[method] = wrapped;
      } catch (_error) {
      }
    });
    window.addEventListener("popstate", dispatchRouteChange);
    window.addEventListener("hashchange", dispatchRouteChange);
  };
  const runExclusiveLogic = (logicKey, logic) => {
    const lockKey = logicKey || "__default__";
    if (!logic || runtimeState.logicRunLocks[lockKey]) {
      return false;
    }
    runtimeState.logicRunLocks[lockKey] = true;
    Promise.resolve().then(() => logic()).catch((error) => {
      console.error(`[wld-script] ${lockKey} run failed`, error);
    }).finally(() => {
      runtimeState.logicRunLocks[lockKey] = false;
    });
    return true;
  };
  const leaveYktTaskView = async ({ waitSelectors = [".logs-list"], previousUrl = location.href, delay = 1500 } = {}) => {
    const backButton = queryFirstVisible([
      ".header-bar .left-btn",
      ".header-bar .btn-back",
      ".header-bar .back-btn",
      ".dialog-header .el-icon-close",
      ".el-dialog__headerbtn"
    ]);
    if (!clickElementLikeUser(backButton)) {
      history.back();
    }
    await sleepMs(delay);
    await yktPoll(() => !!queryFirst(waitSelectors) || location.href !== previousUrl, {
      interval: 500,
      timeout: 1e4
    });
  };
  const waitForYktMedia = async (targetDocument = document, timeout = 15e3) => {
    await yktPoll(() => !!targetDocument.querySelector("video, audio"), {
      interval: 500,
      timeout
    });
    return targetDocument.querySelector("video, audio");
  };
  const isYktMediaEnded = (media) => {
    if (!media) {
      return false;
    }
    const duration = Number(media.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
      return !!media.ended;
    }
    return !!media.ended || media.currentTime >= Math.max(duration - 1, 0);
  };
  const getYktMediaTimeout = async (targetDocument = document) => {
    const media = targetDocument.querySelector("video, audio");
    const fallback = 18e4;
    if (!media) {
      return fallback;
    }
    let duration = Number(media.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
      await new Promise((resolve) => media.addEventListener("loadedmetadata", resolve, { once: true }));
      duration = Number(media.duration);
    }
    if (!Number.isFinite(duration) || duration <= 0) {
      return fallback;
    }
    return Math.max(duration * 3e3, 1e4);
  };
  const syncYktControlPanel = (targetDocument = document, rate = getYktPlaybackRate()) => {
    const root = targetDocument.documentElement;
    if (!root) {
      return;
    }
    const now = Date.now();
    const lastSyncAt = root.__xuexutongUiSyncAt || 0;
    const lastRate = root.__xuexutongUiRate;
    if (now - lastSyncAt < SCRIPT_LIMITS.yktUiSyncInterval && lastRate === rate && root.__xuexutongUiMuted) {
      return;
    }
    const speedButton = targetDocument.querySelector("xt-speedlist xt-button") || targetDocument.getElementsByTagName("xt-speedlist")[0]?.firstElementChild?.firstElementChild;
    const speedWrap = targetDocument.getElementsByTagName("xt-speedbutton")[0];
    if (speedButton && speedWrap && lastRate !== rate) {
      speedButton.setAttribute("data-speed", rate);
      speedButton.setAttribute("keyt", `${rate}.00`);
      speedButton.innerText = `${rate}.00X`;
      speedWrap.dispatchEvent(new MouseEvent("mousemove", {
        bubbles: true,
        clientX: 10,
        clientY: 10,
        view: _unsafeWindow || window
      }));
      speedButton.click();
    }
    const muteButton = targetDocument.querySelector("#video-box xt-volumebutton xt-icon, .xt_video_player_common_icon");
    if (muteButton && !root.__xuexutongUiMuted) {
      muteButton.click();
      root.__xuexutongUiMuted = true;
    }
    root.__xuexutongUiRate = rate;
    root.__xuexutongUiSyncAt = now;
  };
  const setYktPlaybackRate = (targetDocument = document, rate = getYktPlaybackRate()) => {
    syncYktControlPanel(targetDocument, rate);
    targetDocument.querySelectorAll("video, audio").forEach((media) => {
      if (Math.abs((Number(media.playbackRate) || 0) - rate) > 0.01) {
        media.playbackRate = rate;
      }
    });
  };
  const muteYktMedia = (targetDocument = document) => {
    syncYktControlPanel(targetDocument);
    targetDocument.querySelectorAll("video, audio").forEach((media) => {
      if (!media.muted || media.volume !== 0) {
        media.muted = true;
        media.volume = 0;
      }
    });
  };
  const applyYktMediaDefaults = (media, targetDocument = document) => {
    if (!media) {
      return;
    }
    const rate = getYktPlaybackRate();
    try {
      media.autoplay = true;
      media.defaultMuted = true;
      media.playsInline = true;
      media.muted = true;
      media.volume = 0;
      if (Math.abs((Number(media.playbackRate) || 0) - rate) > 0.01) {
        media.playbackRate = rate;
      }
    } catch (_error) {
    }
    syncYktControlPanel(targetDocument, rate);
    try {
      media.play().catch(() => {
      });
    } catch (_error) {
    }
  };
  const bindYktPassiveMedia = (media, targetDocument = document) => {
    if (!media || media.__xuexutongPassiveBound) {
      return;
    }
    media.__xuexutongPassiveBound = true;
    const syncMedia = () => applyYktMediaDefaults(media, targetDocument);
    const resumeMedia = () => {
      if (!media.ended) {
        syncMedia();
      }
    };
    media.addEventListener("loadedmetadata", syncMedia);
    media.addEventListener("canplay", syncMedia);
    media.addEventListener("play", syncMedia);
    media.addEventListener("pause", () => {
      if (!media.ended) {
        setTimeout(resumeMedia, 600);
      }
    });
    media.addEventListener("ratechange", () => {
      const rate = getYktPlaybackRate();
      if (Math.abs((Number(media.playbackRate) || 0) - rate) > 0.01) {
        media.playbackRate = rate;
      }
    });
    media.addEventListener("volumechange", () => {
      if (!media.muted || media.volume !== 0) {
        media.muted = true;
        media.volume = 0;
      }
    });
    syncMedia();
  };
  const scanYktMediaDocuments = () => {
    if (!isLikelyYktPage(location.href) && !allowFrameRuntime) {
      return;
    }
    preventScreenCheck();
    getAccessibleDocuments().forEach((targetDocument) => {
      queryAll(["video", "audio"], targetDocument).forEach((media) => bindYktPassiveMedia(media, targetDocument));
    });
  };
  const startYktBackgroundWatcher = () => {
    if (runtimeState.yktBackgroundWatcherStarted) {
      return;
    }
    runtimeState.yktBackgroundWatcherStarted = true;
    const syncMedia = () => {
      if (isLikelyYktPage(location.href) || allowFrameRuntime) {
        scanYktMediaDocuments();
      }
    };
    const scheduleBackgroundSync = (delay = SCRIPT_LIMITS.observerDebounceMs) => {
      scheduleRuntimeTimer("yktBackgroundSyncTimer", () => {
        syncMedia();
      }, delay);
    };
    syncMedia();
    if (!runtimeState.yktBackgroundMutationWatcherStarted && document.documentElement) {
      runtimeState.yktBackgroundMutationWatcherStarted = true;
      runtimeState.yktBackgroundMutationObserver = new MutationObserver((mutationList) => {
        const shouldSync = mutationList.some((mutation) => {
          if (mutation.type !== "childList") {
            return false;
          }
          return Array.from(mutation.addedNodes).some((node) => isRelevantMutationNode(node, ["video", "audio", "iframe", ".progress-wrap", ".dialog-header", ".header-bar", ".video-box", ".swiper-wrapper", "[class*='player']", "[class*='video']"]));
        });
        if (shouldSync) {
          scheduleAccessibleDocumentRefresh();
          scheduleBackgroundSync();
        }
      });
      runtimeState.yktBackgroundMutationObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        scheduleBackgroundSync(80);
      }
    });
    window.addEventListener("focus", () => {
      scheduleBackgroundSync(80);
    });
    setInterval(() => {
      syncMedia();
    }, SCRIPT_LIMITS.yktBackgroundInterval);
  };
  const keepYktMediaPlaying = (media, targetDocument = document) => {
    if (!media) {
      return () => {
      };
    }
    const resumePlayback = () => {
      applyYktMediaDefaults(media, targetDocument);
    };
    resumePlayback();
    const onPause = () => {
      if (!media.ended) {
        setTimeout(resumePlayback, 800);
      }
    };
    media.addEventListener("pause", onPause);
    const timer = setInterval(() => {
      if (!media.ended) {
        resumePlayback();
      }
    }, 3e3);
    return () => {
      clearInterval(timer);
      media.removeEventListener("pause", onPause);
    };
  };
  const goBackAfterYktTask = async (selector = ".logs-list", delay = 1500) => {
    await leaveYktTaskView({
      waitSelectors: selector ? [selector] : [],
      delay
    });
  };
  const useYktV2Logic = async () => {
    const logStore = useLogStore();
    preventScreenCheck();
    const progressKey = getYktProgressKey();
    let { outside, inside } = getYktProgress(progressKey);
    const updateProgress = (nextOutside, nextInside = 0) => {
      outside = nextOutside;
      inside = nextInside;
      setYktProgress(progressKey, outside, inside);
    };
    const handleYktMediaTask = async (taskTitle) => {
      const media = await waitForYktMedia(document);
      const stopKeepingAlive = keepYktMediaPlaying(media, document);
      try {
        await yktPoll(() => {
          const progressText = document.querySelector(".progress-wrap .text")?.innerText || "";
          return yktIsProgressDone(progressText) || isYktMediaEnded(media);
        }, {
          interval: 1e3,
          timeout: await getYktMediaTimeout(document)
        });
      } finally {
        stopKeepingAlive();
      }
      logStore.addLog(`${taskTitle} 已处理完成`, "success");
    };
    const handleYktSimpleRead = async (taskTitle, backSelector = ".logs-list") => {
      window.scrollTo(0, document.body.scrollHeight);
      await sleepMs(1500);
      window.scrollTo(0, 0);
      await sleepMs(800);
      logStore.addLog(`${taskTitle} 已处理完成`, "success");
      await goBackAfterYktTask(backSelector);
    };
    const handleYktStandaloneRead = async (course, taskTitle) => {
      const previousUrl = location.href;
      clickElementLikeUser(course);
      await waitForSelector([".title", ".dialog-header", ".el-card__body", "section.title"], { timeout: 12e3 });
      await sleepMs(1200);
      window.scrollTo(0, document.body.scrollHeight);
      await sleepMs(1500);
      window.scrollTo(0, 0);
      logStore.addLog(`${taskTitle} 已处理完成`, "success");
      updateProgress(outside + 1, 0);
      await leaveYktTaskView({
        waitSelectors: [".logs-list"],
        previousUrl
      });
    };
    const handleYktSingleVideo = async (course) => {
      const previousUrl = location.href;
      clickElementLikeUser(course);
      await yktPoll(() => location.href !== previousUrl || !!queryFirst([".progress-wrap .text", "video", "audio", ".title"]), {
        interval: 500,
        timeout: 12e3
      });
      await sleepMs(1500);
      const title = document.querySelector(".title")?.innerText || "视频";
      const deadlinePassed = document.querySelector(".box")?.innerText.includes("已过考核截止时间");
      if (deadlinePassed) {
        logStore.addLog(`${title} 已过截止时间，直接跳过`, "warning");
      } else {
        await handleYktMediaTask(title);
      }
      updateProgress(outside + 1, 0);
      await leaveYktTaskView({
        waitSelectors: [".logs-list"],
        previousUrl
      });
    };
    const handleYktAudioItem = async (item, title, index) => {
      const previousUrl = location.href;
      clickElementLikeUser(item);
      await waitForSelector([".progress-wrap .text", "audio", "video"], { timeout: 12e3 });
      await sleepMs(1500);
      await handleYktMediaTask(title);
      updateProgress(outside, index + 1);
      await leaveYktTaskView({
        waitSelectors: [".leaf_list__wrap", ".logs-list"],
        previousUrl
      });
      return index + 1;
    };
    const handleYktVideoItem = async (item, title, index) => {
      const previousUrl = location.href;
      clickElementLikeUser(item);
      await waitForSelector([".progress-wrap .text", "video", "audio"], { timeout: 12e3 });
      await sleepMs(1500);
      await handleYktMediaTask(title);
      updateProgress(outside, index + 1);
      await leaveYktTaskView({
        waitSelectors: [".leaf_list__wrap", ".logs-list"],
        previousUrl
      });
      return index + 1;
    };
    const handleYktReadingItem = async (item, title, typeText, index) => {
      logStore.addLog(`开始处理${typeText}：${title}`, "primary");
      clickElementLikeUser(item);
      await waitForSelector([".title", ".dialog-header", ".el-card__header", "section.title"], { timeout: 1e4 });
      await sleepMs(1200);
      await handleYktSimpleRead(title, ".leaf_list__wrap");
      updateProgress(outside, index + 1);
      return index + 1;
    };
    const skipYktTaskItem = async (title, typeText, index) => {
      logStore.addLog(`${typeText}不自动作答，已跳过：${title}`, "warning");
      updateProgress(outside, index + 1);
      await sleepMs(800);
      return index + 1;
    };
    const handleYktCourseware = async (course) => {
      const previousUrl = location.href;
      clickElementLikeUser(course);
      await waitForSelector([".dialog-header", ".swiper-wrapper", ".video-box", ".el-card__header"], { timeout: 12e3 });
      await sleepMs(1200);
      const className = document.querySelector(".dialog-header")?.firstElementChild?.innerText || course.querySelector("h2")?.innerText || "课件";
      const slides = Array.from(document.querySelector(".swiper-wrapper")?.children || []);
      if (slides.length) {
        logStore.addLog(`开始阅读 PPT：${className}`, "primary");
        for (const [index, slide] of slides.entries()) {
          clickElementLikeUser(slide);
          logStore.addLog(`${className}：第 ${index + 1 } 张`, "primary");
          await sleepMs(getYktPptIntervalMs());
        }
      } else {
        window.scrollTo(0, document.body.scrollHeight);
        await sleepMs(1500);
        window.scrollTo(0, 0);
      }
      const videoBoxes = Array.from(document.querySelectorAll(".video-box"));
      if (videoBoxes.length) {
        logStore.addLog(`${className} 中检测到视频，继续处理`, "primary");
        for (const [index, videoBox] of videoBoxes.entries()) {
          if (videoBox.innerText.includes("已完成")) {
            logStore.addLog(`第 ${index + 1} 个课件视频已完成，跳过`, "success");
            continue;
          }
          clickElementLikeUser(videoBox);
          await sleepMs(2e3);
          const media = await waitForYktMedia(document);
          const stopKeepingAlive = keepYktMediaPlaying(media, document);
          try {
            await yktPoll(() => isYktMediaEnded(media), {
              interval: 1e3,
              timeout: await getYktMediaTimeout(document)
            });
          } finally {
            stopKeepingAlive();
          }
        }
      }
      logStore.addLog(`${className} 已处理完成`, "success");
      updateProgress(outside + 1, 0);
      await leaveYktTaskView({
        waitSelectors: [".logs-list"],
        previousUrl
      });
    };
    const handleYktClassroom = async (course) => {
      const previousUrl = location.href;
      clickElementLikeUser(course);
      await waitForSelector(["iframe.lesson-report-mobile", "video", "audio", ".title"], { timeout: 15e3 });
      await sleepMs(2e3);
      const classroomIframe = document.querySelector("iframe.lesson-report-mobile");
      const targetDocument = classroomIframe?.contentDocument || document;
      const media = await waitForYktMedia(targetDocument, 1e4);
      if (media) {
        const stopKeepingAlive = keepYktMediaPlaying(media, targetDocument);
        try {
          await yktPoll(() => isYktMediaEnded(media), {
            interval: 1e3,
            timeout: await getYktMediaTimeout(targetDocument)
          });
        } finally {
          stopKeepingAlive();
        }
      } else {
        logStore.addLog("未找到课堂媒体，按已处理跳过", "warning");
      }
      updateProgress(outside + 1, 0);
      await leaveYktTaskView({
        waitSelectors: [".logs-list"],
        previousUrl
      });
    };
    const handleYktBatch = async (course) => {
      const expandButton = queryFirst([".sub-info .gray span", ".sub-info .gray", ".sub-info span"], course);
      if (!expandButton) {
        logStore.addLog("未找到批量任务展开按钮，跳过当前任务", "warning");
        updateProgress(outside + 1, 0);
        return;
      }
      clickElementLikeUser(expandButton);
      await yktPoll(() => getYktBatchActivities(course).length > 0, {
        interval: 500,
        timeout: 8e3
      });
      await sleepMs(800);
      let currentIndex = inside;
      while (true) {
        const activities = getYktBatchActivities(course);
        if (currentIndex >= activities.length) {
          break;
        }
        const item = activities[currentIndex];
        if (!item) {
          break;
        }
        const taskMeta = getYktTaskMeta(item);
        if (taskMeta.type === "audio") {
          currentIndex = await handleYktAudioItem(item, taskMeta.title, currentIndex);
        } else if (taskMeta.type === "video") {
          currentIndex = await handleYktVideoItem(item, taskMeta.title, currentIndex);
        } else if (taskMeta.type === "reading") {
          currentIndex = await handleYktReadingItem(item, taskMeta.title, "图文", currentIndex);
        } else if (taskMeta.type === "discussion") {
          currentIndex = await handleYktReadingItem(item, taskMeta.title, "讨论", currentIndex);
        } else if (taskMeta.type === "homework") {
          currentIndex = await skipYktTaskItem(taskMeta.title, "作业", currentIndex);
        } else if (taskMeta.type === "exam") {
          currentIndex = await skipYktTaskItem(taskMeta.title, "考试", currentIndex);
        } else {
          logStore.addLog(`未识别的批量任务，已跳过：${taskMeta.title}`, "warning");
          currentIndex += 1;
          updateProgress(outside, currentIndex);
        }
      }
      updateProgress(outside + 1, 0);
      await sleepMs(1e3);
    };
    logStore.addLog("检测到雨课堂 v2 页面，开始准备刷课", "primary");
    while (true) {
      await yktPoll(() => getYktV2CourseItems().length > 0, {
        interval: 800,
        timeout: 2e4
      });
      const courseList = getYktV2CourseItems();
      if (!courseList.length) {
        logStore.addLog("未找到雨课堂课程列表，请进入课程目录页面使用", "danger");
        return;
      }
      const loadFrequency = Math.floor((outside + 1) / 20) + 1;
      for (let index = 0; index < loadFrequency; index++) {
        yktScrollToBottom([".viewContainer", ".el-scrollbar__wrap", ".logs-list"]);
        await sleepMs(800);
      }
      if (outside >= courseList.length) {
        clearYktProgress(progressKey);
        logStore.addLog("雨课堂课程已全部处理完成", "success");
        return;
      }
      const course = queryFirst([".content-box section", ".content-box", "section"], courseList[outside]);
      if (!course) {
        logStore.addLog("未找到当前课程节点，已自动跳过", "warning");
        updateProgress(outside + 1, 0);
        continue;
      }
      const taskMeta = getYktTaskMeta(course);
      logStore.addLog(`雨课堂正在处理第 ${outside + 1}/${courseList.length} 个任务：${taskMeta.title}`, "primary");
      if (taskMeta.type === "video" || taskMeta.type === "audio") {
        await handleYktSingleVideo(course);
      } else if (taskMeta.type === "batch") {
        await handleYktBatch(course);
      } else if (taskMeta.type === "classroom") {
        await handleYktClassroom(course);
      } else if (taskMeta.type === "courseware" || taskMeta.type === "reading") {
        await handleYktCourseware(course);
      } else if (taskMeta.type === "homework") {
        logStore.addLog("雨课堂作业不自动作答，已跳过当前任务", "warning");
        updateProgress(outside + 1, 0);
      } else if (taskMeta.type === "exam") {
        logStore.addLog("雨课堂考试不自动作答，已跳过当前任务", "warning");
        updateProgress(outside + 1, 0);
      } else if (taskMeta.type === "discussion") {
        logStore.addLog("雨课堂讨论任务按阅读模式处理后跳过", "warning");
        await handleYktStandaloneRead(course, taskMeta.title);
      } else {
        logStore.addLog("未识别的雨课堂任务类型，已跳过", "warning");
        updateProgress(outside + 1, 0);
      }
      await sleepMs(1200);
    }
  };
  const useYktProLogic = async () => {
    const logStore = useLogStore();
    preventScreenCheck();
    const progressKey = getYktProgressKey();
    let classCount = Math.max(getYktProgress(progressKey).outside || 1, 1);
    const tryOpenLegacyYktLesson = async () => {
      const lessonNodes = getYktProLessonNodes();
      if (!lessonNodes.length) {
        return false;
      }
      let currentIndex = Math.max(classCount - 1, 0);
      while (lessonNodes[currentIndex] && yktIsProgressDone(lessonNodes[currentIndex].innerText || "")) {
        currentIndex += 1;
      }
      const targetLesson = lessonNodes[currentIndex];
      if (!targetLesson) {
        return false;
      }
      clickElementLikeUser(targetLesson);
      classCount = currentIndex + 1;
      setYktProgress(progressKey, classCount, 0);
      logStore.addLog(`已打开雨课堂旧版第 ${classCount} 个任务`, "primary");
      await sleepMs(4e3);
      return true;
    };
    logStore.addLog("检测到雨课堂 pro/lms 页面，开始准备刷课", "primary");
    while (true) {
      await yktPoll(() => !!getYktProNextButton() || getYktProLessonNodes().length > 0 || !!queryFirst([".header-bar", "section.title"]), {
        interval: 500,
        timeout: 15e3
      });
      if (!getYktProNextButton()) {
        const opened = await tryOpenLegacyYktLesson();
        if (!opened) {
          logStore.addLog("未找到雨课堂新版下一项按钮，请进入具体课程内容页再使用", "danger");
          return;
        }
      }
      await sleepMs(2e3);
      const headerNode = queryFirst([".header-bar > *", ".header-bar"]);
      const taskMeta = getYktTaskMeta(headerNode || document.body);
      const className = taskMeta.title || `第 ${classCount} 项`;
      const classStatus = getYktProStatusText();
      if (["reading", "courseware", "discussion"].includes(taskMeta.type) && !yktIsProgressDone(classStatus)) {
        logStore.addLog(`正在阅读：${className}`, "primary");
        window.scrollTo(0, document.body.scrollHeight);
        await sleepMs(1500);
        window.scrollTo(0, 0);
      } else if ((["video", "audio"].includes(taskMeta.type) || !!queryFirst(["video", "audio"])) && !yktIsProgressDone(classStatus)) {
        logStore.addLog(`正在播放：${className}`, "primary");
        const media = await waitForYktMedia(document);
        const stopKeepingAlive = keepYktMediaPlaying(media, document);
        try {
          await yktPoll(() => {
            const statusText = getYktProStatusText();
            return yktIsProgressDone(statusText) || isYktMediaEnded(media);
          }, {
            interval: 1e3,
            timeout: await getYktMediaTimeout(document)
          });
        } finally {
          stopKeepingAlive();
        }
      } else if (taskMeta.type === "homework") {
        logStore.addLog(`进入作业：${className}，已跳过`, "warning");
        await sleepMs(1200);
      } else if (taskMeta.type === "exam") {
        logStore.addLog(`进入考试：${className}，已跳过`, "warning");
        await sleepMs(1200);
      } else if (taskMeta.type === "classroom") {
        logStore.addLog(`进入课堂：${className}，无自动功能，已跳过`, "warning");
        await sleepMs(1200);
      } else if (taskMeta.type === "discussion") {
        logStore.addLog(`进入讨论：${className}，按阅读流程处理后跳过`, "warning");
        await sleepMs(1200);
      } else {
        logStore.addLog(`已处理：${className}`, "success");
        await sleepMs(1200);
      }
      classCount += 1;
      setYktProgress(progressKey, classCount, 0);
      const nextButton = getYktProNextButton();
      if (!nextButton) {
        clearYktProgress(progressKey);
        logStore.addLog("雨课堂课程已全部处理完成", "success");
        return;
      }
      clickElementLikeUser(nextButton);
      await sleepMs(4e3);
    }
  };
  const useYktAutoLogic = () => {
    const logStore = useLogStore();
    const mode = getYktRuntimeMode();
    if (mode === "v2") {
      useYktV2Logic();
      return;
    }
    if (mode === "pro") {
      useYktProLogic();
      return;
    }
    if (mode === "media") {
      scanYktMediaDocuments();
      logStore.addLog("已进入雨课堂内容页，后台跟进已开启", "success");
      return;
    }
    logStore.addLog("已识别到雨课堂页面，进入课程内容后会自动跟进", "warning");
  };
  const useGenericFrameCourseChapterLogic = ({
    platformKey = "cx",
    entryLabel = "章节学习页面",
    readyUrlTransformer = null,
    nextChapterSelector = "#prevNextFocusNext",
    nextChapterAction = () => document.querySelector(".jb_btn.jb_btn_92.fr.fs14.nextChapter")?.click()
  } = {}) => {
    const logStore = useLogStore();
    const init = () => {
      const currentUrl = window.location.href;
      const nextReadyUrl = typeof readyUrlTransformer === "function" ? readyUrlTransformer(currentUrl) : null;
      if (nextReadyUrl && nextReadyUrl !== currentUrl) {
        window.location.href = nextReadyUrl;
      }
      logStore.addLog(`检测到用户进入到${entryLabel}`, "primary");
      logStore.addLog(`正在解析任务点，请稍等5-10秒（如果长时间没有反应，请刷新页面）`, "warning");
    };
    const configStore = useConfigStore();
    const processIframeTask = () => {
      const documentElement = document.documentElement;
      const iframe = documentElement.querySelector("iframe");
      if (!iframe) {
        console.warn("No iframe found.");
        return;
      }
      watchIframe(documentElement);
      const iframeLoadHandlerKey = "__xuexutongIframeLoadHandler__";
      if (!iframe[iframeLoadHandlerKey]) {
        iframe[iframeLoadHandlerKey] = () => {
          watchIframe(documentElement);
        };
        iframe.addEventListener("load", iframe[iframeLoadHandlerKey]);
      }
    };
    const setupInterceptor = () => {
      if (runtimeState.chapterUrlWatcherStarted) {
        return;
      }
      runtimeState.chapterUrlWatcherStarted = true;
      let currentUrl = window.location.href;
      setInterval(() => {
        if (currentUrl !== window.location.href) {
          currentUrl = window.location.href;
          processIframeTask();
        }
      }, 2e3);
    };
    let currentWatchIframeTaskId = 0;
    const watchIframe = (documentElement) => {
      const thisTaskId = ++currentWatchIframeTaskId;
      const taskState = {
        skippedWorkCount: 0
      };
      IframeUtils.getAllNestedIframes(documentElement).subscribe((allIframes) => {
        rxjs.from(allIframes).pipe(concatMap((iframe) => processIframe(iframe, taskState))).subscribe({
          complete: async () => {
            if (thisTaskId !== currentWatchIframeTaskId) {
              return;
            }
            if (taskState.skippedWorkCount > 0) {
              logStore.addLog(`检测到${taskState.skippedWorkCount}个未完成章节作业，已自动跳过并继续后续流程`, "warning");
            }
            logStore.addLog(`本页任务点已全部完成，正前往下一章节`, "success");
            const isAutoNextEnabled = configStore.platformParams?.[platformKey]?.parts?.[0]?.params?.[0]?.value ?? true;
            if (isAutoNextEnabled) {
              const nextBtn = documentElement.querySelector(nextChapterSelector);
              if (!nextBtn || nextBtn.style.display === "none") {
                logStore.addLog(`已经到达最后一章节，无法跳转`, "danger");
              } else {
                await sleep(3);
                nextChapterAction();
              }
            } else {
              logStore.addLog(`已经关闭自动下一章节，在设置里可更改`, "danger");
            }
          }
        });
      });
    };
    const processMedia = async (mediaType, iframeDocument) => {
      return new Promise((resolve) => {
        logStore.addLog(`发现一个${mediaType}，正在解析`, "warning");
        logStore.addLog(`正在尝试播放${mediaType}，请稍等5s`, "primary");
        let isExecuted = false;
        let isResolved = false;
        let targetMediaElement = null;
        let pauseListener = null;
        logStore.addLog("播放成功", "success");
        let intervalId = 0;
        const finalize = () => {
          if (isResolved) {
            return;
          }
          isResolved = true;
          clearInterval(intervalId);
          clearTimeout(timeoutId);
          if (targetMediaElement && pauseListener) {
            targetMediaElement.removeEventListener("pause", pauseListener);
          }
          resolve();
        };
        const timeoutId = setTimeout(() => {
          if (!isExecuted) {
            logStore.addLog(`${mediaType}鍔犺浇瓒呮椂锛岃烦杩囧綋鍓嶄换鍔＄偣`, "warning");
            finalize();
          }
        }, SCRIPT_LIMITS.mediaElementTimeout);
        intervalId = setInterval(async () => {
          const mediaElement = iframeDocument.documentElement.querySelector(mediaType);
          if (mediaElement && !isExecuted) {
            targetMediaElement = mediaElement;
            clearTimeout(timeoutId);
            try {
              await mediaElement.pause();
            } catch (_error) {
            }
            mediaElement.muted = true;
            try {
              await mediaElement.play();
            } catch (_error) {
            }
            pauseListener = async () => {
              await sleep(3);
              try {
                await mediaElement.play();
              } catch (_error) {
              }
            };
            mediaElement.addEventListener("pause", pauseListener);
            mediaElement.addEventListener("ended", () => {
              logStore.addLog(`${mediaType}已播放完成`, "success");
              finalize();
            }, { once: true });
            isExecuted = true;
            clearInterval(intervalId);
          }
        }, 2500);
      });
    };
    const processWork = async (iframeDocument, taskState) => {
      logStore.addLog("发现一个作业任务点，正在检查状态", "warning");
      if (!iframeDocument) {
        return Promise.resolve();
      }
      if (iframeDocument.documentElement.innerText.includes("已完成") || iframeDocument.documentElement.innerText.includes("待批阅")) {
        logStore.addLog("作业已经完成，跳过", "success");
        return Promise.resolve();
      }
      decrypt(iframeDocument);
      taskState.skippedWorkCount += 1;
      logStore.addLog("检测到未完成章节作业，已自动跳过当前任务点", "warning");
      logStore.addLog("如需手动处理，可进入作业页作答；页面已支持粘贴", "primary");
      return Promise.resolve();
    };
    const processPpt = async (iframeWindow) => {
      const pptWindow = iframeWindow.document.querySelector("#panView").contentWindow;
      logStore.addLog("发现一个PPT，正在解析", "warning");
      await pptWindow.scrollTo(
        {
          top: pptWindow.document.body.scrollHeight,
          behavior: "smooth"
        }
      );
      logStore.addLog("阅读完成", "success");
      return Promise.resolve();
    };
    const processBook = async (iframeWindow) => {
      logStore.addLog("发现一个电子书，正在解析", "warning");
      _unsafeWindow.top.onchangepage(iframeWindow.getFrameAttr("end"));
      logStore.addLog("阅读完成", "success");
      return Promise.resolve();
    };
    const waitIframeLoad = async (iframe) => {
      return new Promise((resolve) => {
        const startTime = Date.now();
        const intervalId = setInterval(async () => {
          var _a;
          if (iframe.contentDocument && ((_a = iframe.contentDocument) == null ? void 0 : _a.readyState) == "complete") {
            resolve();
            clearInterval(intervalId);
          } else if (Date.now() - startTime > SCRIPT_LIMITS.iframeReadyTimeout) {
            resolve();
            clearInterval(intervalId);
          }
        }, 500);
      });
    };
    const processIframe = async (iframe, taskState) => {
      var _a, _b;
      const iframeSrc = iframe.src;
      const iframeDocument = iframe.contentDocument;
      const iframeWindow = iframe.contentWindow;
      if (!iframeDocument || !iframeWindow)
        return Promise.resolve();
      if (iframeSrc.includes("javascript:"))
        return Promise.resolve();
      await waitIframeLoad(iframe);
      const parentClass = ((_a = iframe.parentElement) == null ? void 0 : _a.className) || "";
      if (parentClass.includes("ans-job-finished")) {
        logStore.addLog("发现一个已完成任务点", "success");
      } else {
        if (iframeSrc.includes("api/work")) {
          return processWork(iframeDocument, taskState);
        }
        const ansJobIcon = (_b = iframe.parentElement) == null ? void 0 : _b.querySelector(".ans-job-icon");
        if (ansJobIcon) {
          if (iframeSrc.includes("video")) {
            return processMedia("video", iframeDocument);
          } else if (iframeSrc.includes("audio")) {
            return processMedia("audio", iframeDocument);
          } else if (["ppt", "doc", "pptx", "docx", "pdf"].some((type) => iframeSrc.includes("modules/" + type))) {
            return processPpt(iframeWindow);
          } else if (["innerbook"].some((type) => iframeSrc.includes("modules/" + type))) {
            return processBook(iframeWindow);
          }
        }
      }
      return Promise.resolve();
    };
    init();
    processIframeTask();
    setupInterceptor();
  };
  const useCxChapterLogic = () => useGenericFrameCourseChapterLogic({
    platformKey: "cx",
    entryLabel: "学习通章节学习页面",
    readyUrlTransformer: (currentUrl) => currentUrl.includes("&mooc2=1") ? currentUrl : currentUrl + "&mooc2=1",
    nextChapterSelector: "#prevNextFocusNext",
    nextChapterAction: () => document.querySelector(".jb_btn.jb_btn_92.fr.fs14.nextChapter")?.click()
  });
  const useCxWorkLogic = async () => {
    const logStore = useLogStore();
    decrypt(document);
    logStore.addLog(`检测到作业页面`, "primary");
    logStore.addLog(`当前页面已启用允许粘贴，可直接粘贴内容`, "success");
  };
  const useCxExamLogic = async () => {
    const logStore = useLogStore();
    decrypt(document);
    logStore.addLog(`检测到考试页面`, "primary");
    logStore.addLog(`当前页面已启用允许粘贴，可直接粘贴内容`, "success");
  };
  const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
    __name: "Index",
    emits: ["customEvent"],
    setup(__props, { emit: __emit }) {
      var _a;
      const cardWidth = vue.ref("310px");
      const isShow = vue.ref(false);
      (_a = document.querySelector("li>a.experience:not([onclick])")) == null ? void 0 : _a.click();
      const configStore = useConfigStore();
      const logStore = useLogStore();
      const url2 = window.location.href;
      logStore.addLog("脚本已启动，正在识别页面", "primary");
      if (isLikelyYktPage(url2) || allowFrameRuntime) {
        logStore.addLog("雨课堂后台监听已开启", "success");
      }
      const urlLogicPairs = [
        { key: "cx-chapter", lockKey: "cx-chapter", test: (url22) => url22.includes("/mycourse/studentstudy"), logic: useCxChapterLogic },
        { key: "cx-work", lockKey: "cx-work", test: (url22) => url22.includes("/mooc2/work/dowork"), logic: useCxWorkLogic },
        { key: "cx-exam", lockKey: "cx-exam", test: (url22) => url22.includes("/exam-ans/exam"), logic: useCxExamLogic },
        { key: "ykt-v2", lockKey: "ykt", test: (url22) => url22.includes("/v2/web"), logic: useYktV2Logic },
        { key: "ykt-pro", lockKey: "ykt", test: (url22) => url22.includes("/pro/lms"), logic: useYktProLogic },
        { key: "ykt-auto", lockKey: "ykt", test: (url22) => isLikelyYktPage(url22), logic: useYktAutoLogic },
        {
          key: "cx-empty",
          lockKey: "cx-empty",
          test: (url22) => url22.includes("mycourse/stu?courseid"),
          logic: () => {
            logStore.addLog("该页面无任务，请进入章节或任务页面使用", "danger");
          }
        }
      ];
      const getMatchedLogicPair = (url22) => {
        for (const routeItem of urlLogicPairs) {
          if (routeItem.test(url22)) {
            return routeItem;
          }
        }
        return null;
      };
      const executeLogicByUrl = (url22, force = false) => {
        const matchedPair = getMatchedLogicPair(url22);
        const nextLogicKey = matchedPair?.key || "";
        const nextSceneKey = getPageSceneKey(url22);
        const shouldKeepVisible = !!matchedPair || isLikelyYktPage(url22) || url22.includes("chaoxing");
        if (!force && runtimeState.currentRouteLogicKey === nextLogicKey && runtimeState.currentRouteSceneKey === nextSceneKey) {
          isShow.value = shouldKeepVisible;
          return;
        }
        runtimeState.currentRouteLogicKey = nextLogicKey;
        runtimeState.currentRouteSceneKey = nextSceneKey;
        if (matchedPair) {
          runExclusiveLogic(matchedPair.lockKey || matchedPair.key, matchedPair.logic);
          isShow.value = true;
          return;
        }
        isShow.value = shouldKeepVisible;
      };
      const emit = __emit;
      const scheduleRouteSync = (force = false) => {
        if (runtimeState.routeEvaluationTimer) {
          clearTimeout(runtimeState.routeEvaluationTimer);
        }
        runtimeState.routeEvaluationTimer = window.setTimeout(() => {
          runtimeState.routeEvaluationTimer = 0;
          executeLogicByUrl(window.location.href, force);
          emit("customEvent", isShow.value);
        }, force ? 0 : SCRIPT_LIMITS.observerDebounceMs);
      };
      const startRouteWatcher = () => {
        if (runtimeState.routeWatcherStarted) {
          return;
        }
        runtimeState.routeWatcherStarted = true;
        hookHistoryRouteEvents();
        let currentUrl = window.location.href;
        const syncByUrl = (force = false) => {
          if (force || currentUrl !== window.location.href) {
            currentUrl = window.location.href;
            scheduleRouteSync(force);
          }
        };
        setInterval(() => {
          syncByUrl();
        }, 1e3);
        window.addEventListener(ROUTE_CHANGE_EVENT_NAME, () => syncByUrl(true));
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden) {
            scheduleRouteSync();
          }
        });
        if (!runtimeState.routeMutationWatcherStarted && document.documentElement) {
          runtimeState.routeMutationWatcherStarted = true;
          runtimeState.routeMutationObserver = new MutationObserver((mutationList) => {
            const shouldSync = mutationList.some((mutation) => {
              if (mutation.type !== "childList") {
                return false;
              }
              return Array.from(mutation.addedNodes).some((node) => isRelevantMutationNode(node, [
                "iframe",
                "video",
                "audio",
                ".ans-job-icon",
                ".header-bar",
                ".dialog-header",
                ".logs-list",
                ".leaf_list__wrap",
                ".btn-next",
                ".video-box",
                ".swiper-wrapper",
                "#prevNextFocusNext"
              ]));
            });
            if (shouldSync && (allowFrameRuntime || isLikelyYktPage(window.location.href) || window.location.href.includes("chaoxing"))) {
              scheduleRouteSync();
            }
          });
          runtimeState.routeMutationObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
          });
        }
      };
      executeLogicByUrl(url2, true);
      startRouteWatcher();
      emit("customEvent", isShow.value);
      const tabs = [
        {
          label: "首页",
          icon: position_default,
          component: ScriptHome,
          props: { "log-list": logStore.logList }
        },
        {
          label: "设置",
          icon: setting_default,
          component: ScriptSetting,
          props: { "global-config": configStore }
        },
        {
          label: "教程",
          icon: view_default,
          component: Tutorial
        },
        {
          label: "说明",
          icon: view_default,
          component: ScriptTip
        }
      ];
      return (_ctx, _cache) => {
        const _component_el_tab_pane = vue.resolveComponent("el-tab-pane");
        const _component_el_tabs = vue.resolveComponent("el-tabs");
        return vue.openBlock(), vue.createElementBlock("div", {
          style: vue.normalizeStyle({ width: cardWidth.value }),
          class: "card_content"
        }, [
          vue.createVNode(_component_el_tabs, {
            modelValue: vue.unref(configStore).menuIndex,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => vue.unref(configStore).menuIndex = $event),
            class: "demo-tabs"
          }, {
            default: vue.withCtx(() => [
              (vue.openBlock(), vue.createElementBlock(vue.Fragment, null, vue.renderList(tabs, (tab) => {
                return vue.createVNode(_component_el_tab_pane, {
                  key: tab.label,
                  label: tab.label
                }, {
                  default: vue.withCtx(() => [
                    tab.component ? (vue.openBlock(), vue.createBlock(vue.resolveDynamicComponent(tab.component), vue.mergeProps({
                      key: 0,
                      ref_for: true
                    }, tab.props), null, 16)) : vue.createCommentVNode("", true)
                  ]),
                  _: 2
                }, 1032, ["label"]);
              }), 64))
            ]),
            _: 1
          }, 8, ["modelValue"])
        ], 4);
      };
    }
  });
  const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
    __name: "ZoomButtons",
    emits: ["toggleZoom"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      const toggleZoom = (value) => {
        emit("toggleZoom", value);
      };
      return (_ctx, _cache) => {
        const _component_el_icon = vue.resolveComponent("el-icon");
        return vue.openBlock(), vue.createElementBlock("div", {
          onMousedown: _cache[2] || (_cache[2] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createVNode(_component_el_icon, {
            onClick: _cache[0] || (_cache[0] = ($event) => toggleZoom(true)),
            size: "small",
            style: { "cursor": "pointer" }
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(vue.unref(minus_default))
            ]),
            _: 1
          }),
          vue.createVNode(_component_el_icon, {
            onClick: _cache[1] || (_cache[1] = ($event) => toggleZoom(false)),
            size: "small",
            style: { "cursor": "pointer", "margin-left": "8px" }
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(vue.unref(full_screen_default))
            ]),
            _: 1
          })
        ], 32);
      };
    }
  });
  const _hoisted_1 = { class: "overlay" };
  const _hoisted_2 = { class: "title" };
  const _hoisted_3 = { class: "minus" };
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "layout",
    setup(__props) {
      const isShow = vue.ref(false);
      const configStore = useConfigStore();
      vue.watch(configStore, (newVal) => {
        _GM_setValue("config", JSON.stringify(newVal));
      }, { deep: true });
      const isDragging = vue.ref(false);
      const offsetX = vue.ref(0);
      const offsetY = vue.ref(0);
      const moveStyle = vue.ref({
        left: configStore.position.x,
        top: configStore.position.y
      });
      const startDrag = (event) => {
        isDragging.value = true;
        offsetX.value = event.clientX - event.target.getBoundingClientRect().left;
        offsetY.value = event.clientY - event.target.getBoundingClientRect().top;
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", endDrag);
      };
      const drag = (event) => {
        if (!isDragging.value)
          return;
        const x = event.clientX - offsetX.value;
        const y = event.clientY - offsetY.value;
        moveStyle.value = {
          left: `${x - 11}px`,
          top: `${y - 11}px`
        };
        configStore.position.x = x - 11 + "px";
        configStore.position.y = y - 11 + "px";
        if (x < 0) {
          moveStyle.value.left = "0px";
          configStore.position.x = "0px";
        }
        if (y < 0) {
          moveStyle.value.top = "0px";
          configStore.position.y = "0px";
        }
        if (x > window.innerWidth - 334) {
          moveStyle.value.left = `${window.innerWidth - 334}px`;
          configStore.position.x = `${window.innerWidth - 334}px`;
        }
        if (y > window.innerHeight - 35) {
          moveStyle.value.top = `${window.innerHeight - 35}px`;
          configStore.position.y = `${window.innerHeight - 35}px`;
        }
      };
      const endDrag = () => {
        isDragging.value = false;
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", endDrag);
      };
      return (_ctx, _cache) => {
        const _component_el_icon = vue.resolveComponent("el-icon");
        const _component_el_tooltip = vue.resolveComponent("el-tooltip");
        const _component_el_text = vue.resolveComponent("el-text");
        const _component_el_divider = vue.resolveComponent("el-divider");
        const _component_el_card = vue.resolveComponent("el-card");
        return vue.withDirectives((vue.openBlock(), vue.createElementBlock("div", {
          style: vue.normalizeStyle(moveStyle.value),
          class: "main-page"
        }, [
          vue.withDirectives(vue.createElementVNode("div", _hoisted_1, null, 512), [
            [vue.vShow, isDragging.value]
          ]),
          vue.createVNode(_component_el_card, {
            style: { "border": "0" },
            "close-on-click-modal": false,
            "lock-scroll": false,
            modal: false,
            "show-close": false,
            "modal-class": "modal"
          }, {
            header: vue.withCtx(() => [
              vue.createElementVNode("div", {
                class: "card-header",
                onMousedown: startDrag
              }, [
                vue.createElementVNode("div", _hoisted_2, [
                  vue.createElementVNode("span", null, vue.toDisplayString(vue.unref(configStore).platformParams[vue.unref(configStore).platformName].name), 1),
                  vue.createVNode(_component_el_tooltip, {
                    teleported: "",
                    effect: "dark",
                    placement: "top-start",
                    content: "<span>注意事项：<br/>请尽量使用新版，不要使用旧版。<br/></span>",
                    "raw-content": ""
                  }, {
                    default: vue.withCtx(() => [
                      vue.createVNode(_component_el_icon, {
                        style: { "margin-left": "5px" },
                        size: "small"
                      }, {
                        default: vue.withCtx(() => [
                          vue.createVNode(vue.unref(warning_default))
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                vue.createVNode(_sfc_main$2, {
                  onToggleZoom: _cache[0] || (_cache[0] = ($event) => vue.unref(configStore).isMinus = $event)
                })
              ], 32)
            ]),
            default: vue.withCtx(() => [
              vue.withDirectives(vue.createVNode(_sfc_main$3, {
                onCustomEvent: _cache[1] || (_cache[1] = (newValue) => isShow.value = newValue)
              }, null, 512), [
                [vue.vShow, !vue.unref(configStore).isMinus]
              ]),
              vue.withDirectives(vue.createElementVNode("div", _hoisted_3, [
                vue.createVNode(_component_el_text, {
                  type: "info",
                  size: "small"
                }, {
                  default: vue.withCtx(() => _cache[2] || (_cache[2] = [
                    vue.createTextVNode("已最小化，点击上方按钮恢复")
                  ])),
                  _: 1
                }),
                vue.createVNode(_component_el_divider, {
                  "border-style": "dashed",
                  style: { "margin": "0" }
                })
              ], 512), [
                [vue.vShow, vue.unref(configStore).isMinus]
              ])
            ]),
            _: 1
          })
        ], 4)), [
          [vue.vShow, isShow.value || vue.unref(configStore).platformName === "ykt"]
        ]);
      };
    }
  });
  const _sfc_main = /* @__PURE__ */ vue.defineComponent({
    __name: "App",
    setup(__props) {
      const configStore = useConfigStore();
      const url2 = window.location.href;
      if (url2.includes("chaoxing"))
        configStore.platformName = "cx";
      else if (isLikelyYktPage(url2) || allowFrameRuntime)
        configStore.platformName = "ykt";
      else if (url2.includes("zhihuishu"))
        configStore.platformName = "zhs";
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createBlock(_sfc_main$1);
      };
    }
  });
  const cssLoader = (e) => {
    const t = GM_getResourceText(e);
    return GM_addStyle(t), t;
  };
  cssLoader("ElementPlus");
  const layoutCss = ".main-page{z-index:100003;position:fixed}.main-page .overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:1001}.main-page .el-card .card-header{display:flex;justify-content:space-between;flex-direction:row;align-items:center;margin:0;padding:0;cursor:move}.main-page .el-card .card-header .title{font-size:14px;display:flex;align-items:center;justify-content:center;font-weight:500}.main-page .el-card .minus{margin:5px 10px -10px 0}.main-page .demo-tabs{display:initial}.main-page .el-card__header{background-color:#1f71e0;color:#fff;padding:7px 10px 7px 16px;margin:0}.main-page .el-card__body{padding:0 16px 20px}.main-page .el-tabs__nav-wrap:after{height:1px}.main-page .el-tabs__active-bar{background-color:#176ae5}.main-page .el-tabs__item{font-size:13px;height:34px}.main-page .el-tabs__item.is-top{font-weight:400;color:#4e5969;padding:0 8px 0 12px}.main-page .el-tabs__item.is-active{font-weight:500;color:#176ae5;padding:0 8px 0 12px}\n";
  startPasteUnlockWatcher();
  startYktBackgroundWatcher();
  const timer = setInterval(() => {
    if (document.readyState === "complete") {
      clearInterval(timer);
      const app = vue.createApp(_sfc_main);
      const pinia$1 = pinia.createPinia();
      app.use(pinia$1);
      app.use(ElementPlus);
      app.mount(
        (() => {
          const shadow_root = document.createElement("div");
          const app2 = document.createElement("div");
          document.body.append(shadow_root);
          const shadow = shadow_root.attachShadow({ mode: "closed" });
          shadow.appendChild(app2);
          const sheet = new CSSStyleSheet();
          const sheet1 = new CSSStyleSheet();
          const eleStyle = _GM_getResourceText("ElementPlusStyle");
          sheet.replace(eleStyle);
          sheet1.replace(layoutCss);
          shadow.adoptedStyleSheets = [sheet, sheet1];
          return app2;
        })()
      );
    }
  }, 100);

})(Vue, Pinia, rxjs, md5, ElementPlus);
