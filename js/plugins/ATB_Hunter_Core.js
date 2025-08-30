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
    'Strawberry.js',
    'AutoMoveAnimationMarecage.js',
    'AutoMoveGonKillua.js',
    'ATB_GameBattler.js',
    'ATB_BattleManager.js',
    //'ATB_DataManager.js',
    'ATB_Windows.js',
    'ATB_Object.js',
    'ATB_Scene.js',
    'ATB_EnemyBars.js',
    'LangText.js',
    'MiniGameAutoScroll.js',
    'MiniGameAutoScrollPursuit.js',
    'MiniGameAutoScrollRace.js',
    'TwoChoiceWindows.js',
    'FogScreen.js'
  ];

  files.forEach(function(file) {
    const script = document.createElement('script');
    script.src = path + file;
    script.async = false;
    document.body.appendChild(script);
  });

StorageManager.localFileDirectoryPath = function() {
    const path = require('path');
    const fs = require('fs');
    const os = require('os');

    const appData = process.env.APPDATA || 
                    (process.platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Application Support') :
                    path.join(os.homedir(), '.config'));

    const baseDir = path.join(appData, 'HunterEvolution');
    const saveDir = path.join(baseDir, 'save');

    // Fonction utilitaire pour créer un dossier si nécessaire
    function ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath);
            } catch (err) {
                console.error(`Failed to create directory: ${dirPath}`, err);
            }
        }
    }

    // Création manuelle des dossiers un par un
    ensureDirectoryExists(baseDir);
    ensureDirectoryExists(saveDir);

    return saveDir + '/';
};

  Utils.isOptionValid = function(name) {
    if(name === "test"){
      return checkDebugMode();
    } else {
      if (location.search.slice(1).split('&').contains(name)) {return 1;};
      if (typeof nw !== "undefined" && nw.App.argv.length > 0 && nw.App.argv[0].split('&').contains(name)) {return 1;};
      return 0;
    }
  };


  window.checkDebugMode = async function() {
    try {
      // --- Cas Node.js / NW.js ---
      if (typeof require !== "undefined") {
        const fs = require("fs");
        const files = fs.readdirSync(".");
        if($gameVariables)
          $gameVariables.setValue(46, files.includes("debug.ini") ? 1 : 0);
        return files.includes("debug.ini");
      }
      // --- Cas Web (navigateur) ---
      else {
        // On teste via une requête HTTP si le fichier est servi par le serveur
        const response = await fetch("XXX_URL_DEBUG_INI_XXX", { method: "HEAD" });
        if($gameVariables)
          $gameVariables.setValue(46, response.ok ? 1 : 0);
        return response.ok;
      }
    } catch (err) {
      console.error("Erreur checkDebugMode:", err);
      if($gameVariables)
        $gameVariables.setValue(46, 0);
      return 0;
    }
  };

  AudioManager._replayBgmActive        = true;
  
  window.activeReplayBgm = function(){
    AudioManager._replayBgmActive = true;
    if(AudioManager._bgmBuffer instanceof WebAudio){
      if(AudioManager._bgmBuffer._sourceNode)
        AudioManager._bgmBuffer._sourceNode.loop = true;
    } else if (AudioManager._bgmBuffer instanceof Html5Audio){
      if(AudioManager._bgmBuffer._audioElement)
        AudioManager._bgmBuffer._audioElement.loop = true;
    }
  }

  window.deactiveReplayBgm = function(){
    AudioManager._replayBgmActive = false;
    if(AudioManager._bgmBuffer instanceof WebAudio){
      if(AudioManager._bgmBuffer._sourceNode)
        AudioManager._bgmBuffer._sourceNode.loop = false;
    } else if (AudioManager._bgmBuffer instanceof Html5Audio){
      if(AudioManager._bgmBuffer._audioElement)
        AudioManager._bgmBuffer._audioElement.loop = false;
    }
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

  window.allEventTurnTo = function(targetX, targetY, ignoredNames = []) {
    $gameMap.events().forEach(function(event) {
      const eventName = event.event().name.toLowerCase();

      if (ignoredNames.map(name => name.toLowerCase()).includes(eventName)) {
        return;
      } else {
        const dx = targetX - event.x;
        const dy = targetY - event.y;

        let direction;
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 6 : 4; // Droite ou gauche
        } else if (dy !== 0) {
          direction = dy > 0 ? 2 : 8; // Bas ou haut
        } else {
          direction = event.direction(); // Pas de changement si même position
        }

        event.setDirection(direction);
      }
    });
  };


  window.movePlayerTo = function(x, y, wait = false, increaseSpeed = 0) {
    if (!$gamePlayer) return;

    $gamePlayer.setThrough(true); // Traverser tout

    const dx = x - $gamePlayer.x;
    const dy = y - $gamePlayer.y;

    const routeList = [];

    const iterDiago = Math.min(Math.abs(dx), Math.abs(dy));
    routeList.push({ code: Game_Character.ROUTE_CHANGE_SPEED, parameters: [4 + increaseSpeed] });
    for (let i = 0; i < iterDiago; i++) {
      if (dx > 0 && dy > 0) {
        routeList.push({ code: Game_Character.ROUTE_MOVE_LOWER_R });
      } else if (dx > 0 && dy < 0) {
        routeList.push({ code: Game_Character.ROUTE_MOVE_UPPER_R });
      } else if (dx < 0 && dy > 0) {
        routeList.push({ code: Game_Character.ROUTE_MOVE_LOWER_L });
      } else if (dx < 0 && dy < 0) {
        routeList.push({ code: Game_Character.ROUTE_MOVE_UPPER_L });
      }
    }

    for (let i = 0; i < Math.abs(dx) - iterDiago; i++) {
      if(dx > 0){
        routeList.push({ code: Game_Character.ROUTE_MOVE_RIGHT });
      } else if (dx < 0){
        routeList.push({ code: Game_Character.ROUTE_MOVE_LEFT });
      }
    }

    for (let i = 0; i < Math.abs(dy) - iterDiago; i++) {
      if(dy > 0){
        routeList.push({ code: Game_Character.ROUTE_MOVE_DOWN });
      } else if (dy < 0){
        routeList.push({ code: Game_Character.ROUTE_MOVE_UP });
      }
    }

    routeList.push({ code: 0 }); // Fin de la route

    const route = {
      list: routeList,
      repeat: false,
      skippable: false,
      wait: wait
    };

    $gamePlayer.forceMoveRoute(route);

    // Si on veut que l'événement attende la fin :
    if (wait && SceneManager._scene && SceneManager._scene instanceof Scene_Map) {
      const interpreter = SceneManager._scene._interpreter;
      if (interpreter) {
        interpreter.setWaitMode('movement');
      }
    }
  };

  Game_Player.prototype.forceAutoMove = function() {
    if (!this._moveRouteForAutoMove) return;

    const route = {
      list: this._moveRouteForAutoMove.concat({ code: 0 }), // Fin de route
      repeat: false,
      skippable: true,
      wait: false
    };

    this.forceMoveRoute(route);
    this._moveRouteForAutoMove = null;
  };

  // Titre: fenêtre commandes personnalisée (identique)
  Scene_Title.prototype.createCommandWindow = function() {
      this._commandWindow = new Window_TitleCommand();
      this._commandWindow.setHandler('newGame',  this.commandNewGame.bind(this));
      this._commandWindow.setHandler('continue', this.commandContinue.bind(this));
      this._commandWindow.setHandler('options',  this.commandOptions.bind(this));
      this._commandWindow.setHandler('gameEnd',  this.commandQuit.bind(this));
      this.addWindow(this._commandWindow);
  };

  Scene_Title.prototype.commandQuit = function() {
      if (Utils.isNwjs()) {
          var nwWin = require('nw.gui').Window.get();
          nwWin.close();
      } else {
          window.location.href = "/";
      }
  };

  Window_TitleCommand.prototype.makeCommandList = function() {
      this.addCommand(TextManager.newGame,   'newGame');
      this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
      this.addCommand(TextManager.options,   'options');
      this.addCommand(TextManager.gameEnd,   'gameEnd');
  };

  const DEFAULT_WIDTH = 816;
  const DEFAULT_HEIGHT = 624;
  const MESSAGE_HEIGHT = 84;
  const MESSAGE_FONT_SIZE = 24;
  const MESSAGE_ID = 'video-message-overlay';

  window.showVideoMessage = function(text, duration = 180) {
    hideVideoMessage(); // Nettoyage si déjà présent

    var scaleX = window.innerWidth / DEFAULT_WIDTH;
    var scaleY = window.innerHeight / DEFAULT_HEIGHT;
    var scale = Math.max(scaleX, scaleY);
    
    const messageDiv = document.createElement('div');
    messageDiv.id = MESSAGE_ID;
    messageDiv.style.position = 'absolute';
    messageDiv.style.height = (MESSAGE_HEIGHT * scale) + 'px';
    messageDiv.style.bottom = '0px'
    messageDiv.style.left = '50%';
    messageDiv.style.width = ConfigManager.fullscreen ? (Utils.isNwjs() ? '100%' : '94%') : '94%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.maxWidth = ConfigManager.fullscreen ? (Utils.isNwjs() ? '100%' : '94%') : '94%';
    messageDiv.style.padding = '16px 24px';
    messageDiv.style.background = 'rgba(0, 0, 0, 1)';
    messageDiv.style.color = '#FFFFFF';
    messageDiv.style.fontSize = (MESSAGE_FONT_SIZE * (1+(scale-1)/2)) + 'px';
    messageDiv.style.fontFamily = 'GameFont, sans-serif';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.zIndex = 10;
    messageDiv.style.whiteSpace = 'pre-line'; // Gère les \n
    messageDiv.style.pointerEvents = 'none'; // Ne bloque pas les clics

    messageDiv.innerText = TextManagerEx.t(text);

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        hideVideoMessage();
    }, duration * 1000 / 60); // Convertit frames en millisecondes
  };

  window.hideVideoMessage = function() {
      const existing = document.getElementById(MESSAGE_ID);
      if (existing) {
          existing.remove();
      }
  };

})();