//=============================================================================
// main.js
//=============================================================================

PluginManager.setup($plugins);

window.onload = function() {
    SceneManager.run(Scene_Boot);
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    if (lang) {
        TextManagerEx.initLanguage(lang);
    }
};
