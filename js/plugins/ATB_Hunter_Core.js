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


  window.allEventTurnTo = function(targetX, targetY, ignoredNames = []) {
    $gameMap.events().forEach(function(event) {
      const eventName = event.event().name.toLowerCase();

      // Ignore les événements dont le nom commence par "door"
      if (eventName.startsWith("Door")) {
        return;
      }

      if (ignoredNames.includes(eventName)) {
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



})();