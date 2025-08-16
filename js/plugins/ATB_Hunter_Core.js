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


  const MOVE_DELAY       = 1;
  const LOOKAHEAD        = 20;

  const lastMove = {};

  function setLastMove(ch, move){
    lastMove[timerIdFor(ch)] = move;
  }

  function getLastMove(ch){
    return lastMove[timerIdFor(ch)];
  } 

  // --- Helpers position/déplacement ---
  function nextXY(x, y, dir){
    return [$gameMap.roundXWithDirection(x, dir), $gameMap.roundYWithDirection(y, dir)];
  }
  function nextXYDiag(x, y, horz, vert){
    var nx = $gameMap.roundXWithDirection(x, horz);
    var ny = $gameMap.roundYWithDirection(y, vert);
    return [nx, ny];
  }
  function canPassDir(ch, x, y, dir){
    return ch.canPass(x, y, dir);
  }
  function canPassDiag(ch, x, y, horz, vert){
    return ch.canPassDiagonally(x, y, horz, vert);
  }
  // +++ AJOUT : fonction utilitaire pour l'axe central (en cases)
  function centerLineX(){
    // centre "géométrique" de la map (peut valoir .5 sur une largeur paire)
    return ($gameMap.width() - 1) / 2;
  }

  // --- Simulation UP ---
  function simulateUpSteps(ch, steps){
    var x = ch.x, y = ch.y;
    for (var i=0; i<steps; i++){
      if (!canPassDir(ch, x, y, 8)) return {ok:false};
      var p = nextXY(x, y, 8); x = p[0]; y = p[1];
    }
    return {ok:true, x:x, y:y};
  }
  // --- Simulation DIAG ---
  function simulateDiagSteps(ch, horz, vert, steps){
    var x = ch.x, y = ch.y;
    for (var i=0; i<steps; i++){
      if (!canPassDiag(ch, x, y, horz, vert)) return {ok:false};
      var p = nextXYDiag(x, y, horz, vert); x = p[0]; y = p[1];
    }
    return {ok:true, x:x, y:y};
  }

  // --- Depuis une position simulée, y a-t-il une issue immédiate ?
  function hasImmediateEscapeAt(ch, x, y){
    // Continuer vers le haut
    if (canPassDir(ch, x, y, 8)) return true;
    // Ou diagonales depuis cette position
    if (canPassDiag(ch, x, y, 6, 8)) return true; // haut-droite
    if (canPassDiag(ch, x, y, 4, 8)) return true; // haut-gauche
    return false;
  }

  // --- Vérifie 3→2→1 pour le HAUT; vrai = on peut monter 1 pas maintenant
  function canMoveUpNow(ch){
    if (!canPassDir(ch, ch.x, ch.y, 8)) return false; // pas immédiat impossible
    for (var d = LOOKAHEAD; d >= 1; d--){
      var sim = simulateUpSteps(ch, d);
      if (!sim.ok) continue; // d trop grand, on essaie d-1
      if (hasImmediateEscapeAt(ch, sim.x, sim.y)) return true;
    }
    return false;
  }

  // --- Vérifie 3→2→1 pour une diagonale; vrai = on peut faire 1 pas diagonale maintenant
  function canMoveDiagNow(ch, horz, vert){
    if (!canPassDiag(ch, ch.x, ch.y, horz, vert)) return false;
    for (var d = LOOKAHEAD; d >= 1; d--){
      var sim = simulateDiagSteps(ch, horz, vert, d);
      if (!sim.ok) continue;
      if (hasImmediateEscapeAt(ch, sim.x, sim.y)) return true;
    }
    return false;
  }

  // --- Ancrage X initial par perso ---
  var _initialX = Object.create(null);

  function initialXFor(ch){
    const id = timerIdFor(ch);
    if (_initialX[id] == null) _initialX[id] = ch.x; // capture la 1ère fois
    return _initialX[id];
  }

  function clearAnchors(){
    _initialX = Object.create(null);
  }

  // Vers quelle direction aller (à droite = true) pour se rapprocher de l'X initial ?
  function preferRightTowardInitialX(ch){
    const ix = initialXFor(ch);

    // Gestion propre des maps horizontales bouclées
    if ($gameMap.isLoopHorizontal && $gameMap.isLoopHorizontal()){
      const w = $gameMap.width();
      const distRight = (ix - ch.x + w) % w; // distance en allant à droite
      const distLeft  = (ch.x - ix + w) % w; // distance en allant à gauche
      if (distRight < distLeft) return 1;
      if (distLeft  < distRight) return -1;
      return 0; // égalité parfaite → tie-breaker
    }

    // Map non bouclée
    if (ch.x < ix) return 1;     // aller à droite
    if (ch.x > ix) return -1;    // aller à gauche
    return 0;            // déjà sur l'axe initial → tie-breaker
  }

  // --- Décision d'un pas ---
function decideAndMove(ch){
  if (ch.isMoving()) return;

  // Assure que l'ancrage est capturé pour ce perso
  initialXFor(ch);

  const preferRightNow = preferRightTowardInitialX(ch);

  if(preferRightNow == 0){
    // 1) Monter si l'anticipation (3→2→1) le permet
    if (canMoveUpNow(ch)) { ch.moveStraight(8); setLastMove(ch, 8); return; }
  }

  // 2) Sinon, diagonales qui rapprochent de l'X initial
  if (preferRightNow==1) {
    if (canMoveDiagNow(ch, 6, 8)) { ch.moveDiagonally(6, 8); setLastMove(ch, 9); return; } // haut-droite
    if (canMoveDiagNow(ch, 4, 8)) { ch.moveDiagonally(4, 8); setLastMove(ch, 7); return; } // haut-gauche (fallback)
  } else {
    if (canMoveDiagNow(ch, 4, 8)) { ch.moveDiagonally(4, 8); setLastMove(ch, 7); return; } // haut-gauche
    if (canMoveDiagNow(ch, 6, 8)) { ch.moveDiagonally(6, 8); setLastMove(ch, 9); return; } // haut-droite (fallback)
  }

  if(getLastMove(ch) == 6){
    if (canPassDir(ch, ch.x, ch.y, 6)) { ch.moveStraight(6); setLastMove(ch, 6); return; } // droite
  }

  if(getLastMove(ch) == 4){
    if (canPassDir(ch, ch.x, ch.y, 4)) { ch.moveStraight(4); setLastMove(ch, 4); return; } // gauche
  }

  // 3) Derniers recours latéraux (toujours vers l'X initial d'abord)
  if (preferRightNow==1) {
    if (canPassDir(ch, ch.x, ch.y, 6)) { ch.moveStraight(6); setLastMove(ch, 6); return; } // droite
    if (canPassDir(ch, ch.x, ch.y, 4)) { ch.moveStraight(4); setLastMove(ch, 4); return; } // gauche
  } else {
    if (canPassDir(ch, ch.x, ch.y, 4)) { ch.moveStraight(4); setLastMove(ch, 4); return; } // gauche
    if (canPassDir(ch, ch.x, ch.y, 6)) { ch.moveStraight(6); setLastMove(ch, 6); return; } // droite
  }
}

  // --- Cadence ---
  var _timers = Object.create(null);
  function timerIdFor(ch){ return ch === $gamePlayer ? 'player' : ('e' + ch.eventId()); }

  var _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function(){
    _Scene_Map_update.call(this);

    if(!autoMove) return;

    // Liste des personnages concernés
    var list = $gameMap.events().slice();
    //list.push($gamePlayer);

    for(var i=0; i<list.length; i++){
      var ch = list[i];
      var id = timerIdFor(ch);
      var t = _timers[id] || 0;

      if(t <= 0){
        decideAndMove(ch);
        _timers[id] = MOVE_DELAY;
      }else{
        _timers[id] = t - 1;
      }
    }
  };

  let autoMove = false;

  window.enableAutoMove = function(){
    autoMove = true;
    _timers = Object.create(null); // redémarre la cadence
    clearAnchors();                // on recapture les X initiaux actuels

    // Capture immédiate pour tout ce qui est déjà présent
    var list = $gameMap.events().slice();
    list.push($gamePlayer);
    for (var i=0; i<list.length; i++){
      const ch = list[i];
      _initialX[timerIdFor(ch)] = ch.x;
    }
  };

  window.disableAutoMove = function(){
    autoMove = false;
    _timers = Object.create(null);
    clearAnchors(); // reset des ancres
  };

})();