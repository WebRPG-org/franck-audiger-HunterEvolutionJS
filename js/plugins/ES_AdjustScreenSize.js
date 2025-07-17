//=============================================================================
// ES_AdjustScreenSize.js
//=============================================================================

/*:
 * @plugindesc v1.0 Adjust the width and height of the game screen and center the window on the screen.
 * @author Eroik StyLeR
 *
 * @param Screen Width
 * @type number
 * @min 0
 * @desc Adjusts the width of the screen.
 * Default: 816
 * @default 816
 *
 * @param Screen Height
 * @type number
 * @min 0
 * @desc Adjusts the height of the screen.
 * Default: 624
 * @default 624
 *
 * @param Fullscreen
 * @type boolean
 * @desc Activate fullscreen on game start.
 * @default false
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin allows you to customize the screen resolution of your RPG Maker 
 * MV game. Set your desired width and height through the plugin parameters, 
 * and the game will adjust to your chosen resolution and center the window.
 *
 * Example: Play your game in 1920x1080 for a fullscreen HD experience, or 
 * choose any other resolution that fits your needs.
 *
 * ============================================================================
 * How to Use
 * ============================================================================
 *
 * 1. Open the Plugin Manager in RPG Maker MV.
 * 2. Add the ES_AdjustScreenSize plugin to your project.
 * 3. Adjust the "Screen Width", "Screen Height", and "Fullscreen" parameters as desired.
 * 4. Save and test your game.
 *
 * ============================================================================
 * Compatibility
 * ============================================================================
 *
 * This plugin is compatible with RPG Maker MV only.
 * Version: v1.0
 *
 */

function _0x3dd5(){var _0x4c019d=['1267152CokKqC','innerWidth','updateResolution','moveBy','26VPWQks','_boxWidth','run','_screenHeight','start','32tHchNx','5813670oTnjem','ES_AdjustScreenSize','7277710rwgmmF','33IzYsre','prototype','3369765MhNVnP','resizeBy','1846359MMWBsJ','413292dvYtWn','7tKUfMT','35661eugpkI','parameters','_requestFullScreen','call'];_0x3dd5=function(){return _0x4c019d;};return _0x3dd5();}function _0x2bf4(_0x1d95cb,_0xa6f446){var _0x3dd510=_0x3dd5();return _0x2bf4=function(_0x2bf42b,_0x370665){_0x2bf42b=_0x2bf42b-0x6a;var _0x40c57e=_0x3dd510[_0x2bf42b];return _0x40c57e;},_0x2bf4(_0x1d95cb,_0xa6f446);}(function(_0x7209ad,_0x350c02){var _0x5abc02=_0x2bf4,_0x30058a=_0x7209ad();while(!![]){try{var _0x4b7363=parseInt(_0x5abc02(0x75))/0x1*(-parseInt(_0x5abc02(0x7d))/0x2)+parseInt(_0x5abc02(0x70))/0x3+-parseInt(_0x5abc02(0x73))/0x4+-parseInt(_0x5abc02(0x6b))/0x5+-parseInt(_0x5abc02(0x79))/0x6*(-parseInt(_0x5abc02(0x74))/0x7)+parseInt(_0x5abc02(0x6a))/0x8*(-parseInt(_0x5abc02(0x72))/0x9)+-parseInt(_0x5abc02(0x6d))/0xa*(-parseInt(_0x5abc02(0x6e))/0xb);if(_0x4b7363===_0x350c02)break;else _0x30058a['push'](_0x30058a['shift']());}catch(_0x309660){_0x30058a['push'](_0x30058a['shift']());}}}(_0x3dd5,0xec352),(function(){var _0x2d07d9=_0x2bf4,_0x1f0a75=PluginManager[_0x2d07d9(0x76)](_0x2d07d9(0x6c)),_0x2d967d=Number(_0x1f0a75['Screen\x20Width']||0x330),_0x345721=Number(_0x1f0a75['Screen\x20Height']||0x270),_0x35cba9=_0x1f0a75['Fullscreen']==='true';SceneManager['_screenWidth']=_0x2d967d,SceneManager[_0x2d07d9(0x80)]=_0x345721,SceneManager[_0x2d07d9(0x7e)]=_0x2d967d,SceneManager['_boxHeight']=_0x345721;var _0x355fa8=SceneManager[_0x2d07d9(0x7f)];SceneManager['run']=function(_0x53a7d6){var _0x2a8d6c=_0x2d07d9;_0x355fa8[_0x2a8d6c(0x78)](this,_0x53a7d6);if(!Utils['isNwjs']())return;ES_AdjustScreenSize[_0x2a8d6c(0x7b)]();},ES_AdjustScreenSize={},ES_AdjustScreenSize[_0x2d07d9(0x7b)]=function(){var _0x220f55=_0x2d07d9,_0x2251e0=_0x2d967d-window[_0x220f55(0x7a)],_0x1b9d81=_0x345721-window['innerHeight'];window[_0x220f55(0x7c)](-0x1*_0x2251e0/0x2,-0x1*_0x1b9d81/0x2),window[_0x220f55(0x71)](_0x2251e0,_0x1b9d81);};var _0x3a88ee=Scene_Boot[_0x2d07d9(0x6f)][_0x2d07d9(0x81)];Scene_Boot[_0x2d07d9(0x6f)][_0x2d07d9(0x81)]=function(){var _0x4cb9b0=_0x2d07d9;_0x3a88ee[_0x4cb9b0(0x78)](this),_0x35cba9&&Graphics[_0x4cb9b0(0x77)]();};var _0x4a0691=Scene_Base['prototype']['start'];Scene_Base[_0x2d07d9(0x6f)][_0x2d07d9(0x81)]=function(){var _0x4cb6b6=_0x2d07d9;_0x4a0691[_0x4cb6b6(0x78)](this),_0x35cba9&&Graphics[_0x4cb6b6(0x77)]();};}()));

