/*:
 * @plugindesc [HUNTERxATB] Plugin central ATB en fichiers séparés - v1.0
 * @author Franck Audiger
 *
 * @help Ce fichier est le cœur du système ATB. Il charge les modules.
 */

// Charge les modules (ordre important)
(function() {
    const path = 'js/plugins/ATB_Hunter/modules/';
    const files = [
      'ATB_GameBattler.js',
      'ATB_BattleManager.js',
      'ATB_DataManager.js',
      'ATB_Windows.js',
      'ATB_Object.js',
      'ATB_Scene.js',
      'ATB_EnemyBars.js',
      'LangText.js',
      'MiniGameAutoScroll.js',
      'MiniGameAutoScrollPursuit.js',
      'MiniGameAutoScrollRace.js',
      'FogScreen.js'
    ];
  
    files.forEach(function(file) {
      const script = document.createElement('script');
      script.src = path + file;
      script.async = false;
      document.body.appendChild(script);
    });

    AudioManager._replayBgmActive        = true;
    
    window.activeReplayBgm = function(){
      AudioManager._replayBgmActive = true;
    }

    window.deactiveReplayBgm = function(){
      AudioManager._replayBgmActive = false;
    }

    AudioManager.playBgm = function(bgm, pos) {
        if (this.isCurrentBgm(bgm)) {
            this.updateBgmParameters(bgm);
        } else {
            this.stopBgm();
            if (bgm.name) { 
                if(Decrypter.hasEncryptedAudio && this.shouldUseHtml5Audio()){
                    this.playEncryptedBgm(bgm, pos);
                }
                else {
                    this._bgmBuffer = this.createBuffer('bgm', bgm.name);
                    this.updateBgmParameters(bgm);
                    if (!this._meBuffer) {
                        this._bgmBuffer.play(this._replayBgmActive, pos || 0);
                    }
                }
            }
        }
        this.updateCurrentBgm(bgm, pos);
    };

})();