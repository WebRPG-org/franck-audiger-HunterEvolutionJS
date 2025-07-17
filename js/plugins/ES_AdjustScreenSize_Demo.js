function _0x3dd5() {
 var moveBy = ["1267152CokKqC", "innerWidth", "updateResolution", "moveBy", "26VPWQks", "_boxWidth", "run", "_screenHeight", "start", "32tHchNx", "5813670oTnjem", "ES_AdjustScreenSize", "7277710rwgmmF", "33IzYsre", "prototype", "3369765MhNVnP", "resizeBy", "1846359MMWBsJ", "413292dvYtWn", "7tKUfMT", "35661eugpkI", "parameters", "_requestFullScreen", "call"];
 _0x3dd5 = function() {
   return moveBy;
 };
 return _0x3dd5();
}
function _0x2bf4(opt_attributes, deepDataAndEvents) {
 var args = _0x3dd5();
 return _0x2bf4 = function(opt_attributes, deepDataAndEvents) {
   opt_attributes = opt_attributes - 106;
   var pageY = args[opt_attributes];
   return pageY;
 }, _0x2bf4(opt_attributes, deepDataAndEvents);
}
(function(topic, b) {
 var getter = _0x2bf4;
 var out = topic();
 for (;!![];) {
   try {
     var a = parseInt(getter(117)) / 1 * (-parseInt(getter(125)) / 2) + parseInt(getter(112)) / 3 + -parseInt(getter(115)) / 4 + -parseInt(getter(107)) / 5 + -parseInt(getter(121)) / 6 * (-parseInt(getter(116)) / 7) + parseInt(getter(106)) / 8 * (-parseInt(getter(114)) / 9) + -parseInt(getter(109)) / 10 * (-parseInt(getter(110)) / 11);
     if (a === b) {
       break;
     } else {
       out["push"](out["shift"]());
     }
   } catch (_0x309660) {
     out["push"](out["shift"]());
   }
 }
})(_0x3dd5, 967506), function() {
    
 const scaleX = window.innerWidth / 816;
 const scaleY = window.innerHeight / 624;
 const scale = Math.min(scaleX, scaleY);
 var throttledUpdate = _0x2bf4;
 var global = PluginManager[throttledUpdate(118)](throttledUpdate(108));
 var length = Number(global["Screen Width"] || 816*scale);
 var len = Number(global["Screen Height"] || 624*scale);
 var isReadOnly = true;
 SceneManager["_screenWidth"] = length;
 SceneManager[throttledUpdate(128)] = len;
 SceneManager[throttledUpdate(126)] = length;
 SceneManager["_boxHeight"] = len;
 var collection = SceneManager[throttledUpdate(127)];
 SceneManager["run"] = function(options) {
   var tryIt = throttledUpdate;
   collection[tryIt(120)](this, options);
   if (!Utils["isNwjs"]()) {
     return;
   }
   ES_AdjustScreenSize[tryIt(123)]();
 };
 ES_AdjustScreenSize = {};
 ES_AdjustScreenSize[throttledUpdate(123)] = function() {
   var getFirstIn = throttledUpdate;
   var padLength = length - window[getFirstIn(122)];
   var last = len - window["innerHeight"];
   window[getFirstIn(124)](-1 * padLength / 2, -1 * last / 2);
   window[getFirstIn(113)](padLength, last);
 };
 var target = Scene_Boot[throttledUpdate(111)][throttledUpdate(129)];
 Scene_Boot[throttledUpdate(111)][throttledUpdate(129)] = function() {
   var exposedName = throttledUpdate;
   target[exposedName(120)](this);
   if (isReadOnly) {
     Graphics[exposedName(119)]();
   }
 };
 var vertex1 = Scene_Base["prototype"]["start"];
 Scene_Base[throttledUpdate(111)][throttledUpdate(129)] = function() {
   var tryIt = throttledUpdate;
   vertex1[tryIt(120)](this);
   if (isReadOnly) {
     Graphics[tryIt(119)]();
   }
 };
}();