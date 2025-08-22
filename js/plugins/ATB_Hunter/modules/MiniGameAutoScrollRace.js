// Refactored configuration for Auto Scroll Race Minigame
var raceConfig = {
  canChangeSpeed: true,
  DELAY_INPUT_SPEED: 400,
  MAX_ENDURANCE: 2000,
  MAX_DISTANCE: 60,
  WARNING_DISTANCE: 30,
  SPACE_WITH_SATOTSU: 2,
  ASPIRATION_RANGE: 2,
  MOVE_STRAIGHT: 0,
  MOVE_UP: 1,
  MOVE_DOWN: 2,
  LOAD_EVENT_VARIABLE_ID: 44,
  RESET_SHIFT: 190,
  MODE_DEBUG: false,

  defaultMiniGameAutoScrollRaceConfigs: {
    103: {
      messagesShown: {},
      messagesConfig: {},
      speedValues: {
        1: +400,
        2: +100,
        3: +20,
        4: -20,
        5: -20,
        6: -20
      },
      aspirationFactor: 0.4,
      nextMapFunction: function () {
        saveEvents();
        $gameVariables.setValue(raceConfig.LOAD_EVENT_VARIABLE_ID, 1);
        teleportPlayer(104);
      },
      satotsuSpeed: function () {
        return 4;
      },
      animation: function () {
        const satotsu = getSatotsuEvent();
        if (!satotsu) return true;
        return satotsu.x <= 30;
      }
    },
    104: {
      messagesShown: {},
      messagesConfig: {},
      speedValues: {
        1: +400,
        2: +100,
        3: +20,
        4: -20,
        5: -20,
        6: -20
      },
      aspirationFactor: 0.4,
      nextMapFunction: function () {
        $gameVariables.setValue(24, 1);
        $gameScreen.startFadeOut(10);
        setTimeout(() => {
          teleportPlayer(106, 22, 8);
        }, 1000);
      },
      satotsuSpeed: function () {
        return 4;
      },
      animation: function () {
        return false;
      }
    },

    playerEndurance: 2000,
    satotsu: null,
    frameExausted: 150,
    participants: {}
  },

  miniGameAutoScrollRaceConfigs: {},

  touchTop: false,
  touchBottom: false,
  touchRight: false,
  touchLeft: false,

  playerBlinking: false,
  counterEnableChangeSpeed: 0,
  counterBlinkPlayer: 0,
  blinkShown: false,
  showAspiration: false,
  lastMove: 0,

  miniGameAutoScrollRaceEnable: true,
  resetDx: 0,
};

function restoreFunctions(source, target) {
  Object.keys(source).forEach(key => {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (typeof sourceVal === 'function') {
      target[key] = sourceVal;
    } else if (typeof sourceVal === 'object' && sourceVal !== null) {
      if (!targetVal) target[key] = {};
      restoreFunctions(sourceVal, target[key]);
    }
  });
}

raceConfig.miniGameAutoScrollRaceConfigs = JsonEx.makeDeepCopy(raceConfig.defaultMiniGameAutoScrollRaceConfigs);
restoreFunctions(raceConfig.defaultMiniGameAutoScrollRaceConfigs, raceConfig.miniGameAutoScrollRaceConfigs);

function isMiniGameAutoScrollRaceActive() {
  if(!$gameMap){
    return false;
  }
  return raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()];
}

window.resetMiniGameAutoScrollRace = function() {
  // Réinitialise les données globales
  raceConfig.miniGameAutoScrollRaceConfigs = JsonEx.makeDeepCopy(raceConfig.defaultMiniGameAutoScrollRaceConfigs);
  restoreFunctions(raceConfig.defaultMiniGameAutoScrollRaceConfigs, raceConfig.miniGameAutoScrollRaceConfigs);
  raceConfig.resetDx = 0;
  raceConfig.showAspiration = false;
  raceConfig.playerBlinking = false;
  raceConfig.counterEnableChangeSpeed = 0;
  raceConfig.counterBlinkPlayer = 0;
  raceConfig.blinkShown = false;
  $gameTemp._satotsuWarningShown = false;
};

window.resetSatotsu = function() {
  raceConfig.miniGameAutoScrollRaceConfigs.satotsu = null;
}

window.teleportPlayer = function (mapId, newX, newY){
  let x = newX ? newX : $gamePlayer.x - raceConfig.RESET_SHIFT + raceConfig.resetDx;
  let y = newY ? newY : $gamePlayer.y;
  if(x < 0){
    x = 0;
  }
  const direction = 0; // 8 = inchangé
  const fadeType = 2; // 2 = aucun fondu
  // VÉRIFICATION : on ne doit pas appeler cette fonction à la volée si la scène n'est pas prête
  if (SceneManager._scene instanceof Scene_Map) {
    $gamePlayer.reserveTransfer(mapId, x, y, direction, fadeType);
  } else {
    console.warn("Teleportation échouée : la scène active n'est pas Scene_Map");
  }
}

window.saveEvents = function () {
  if($gamePlayer.x < 30){
    raceConfig.resetDx = 30 - $gamePlayer.x;
  }
  $gameMap.events().forEach(element => {
    const name = element.event().name;

    // Vérifie que la structure existe avant d'y accéder
    if (raceConfig.miniGameAutoScrollRaceConfigs.participants &&
        raceConfig.miniGameAutoScrollRaceConfigs.participants[name]) {
      raceConfig.miniGameAutoScrollRaceConfigs.participants[name].event = element.event();
      raceConfig.miniGameAutoScrollRaceConfigs.participants[name].x = element.x;
      raceConfig.miniGameAutoScrollRaceConfigs.participants[name].y = element.y;
    }
  });
  const tmpSatotsu = getSatotsuEvent();
  raceConfig.miniGameAutoScrollRaceConfigs.satotsuEventSave = tmpSatotsu.event()
  resetSatotsu();
  raceConfig.miniGameAutoScrollRaceConfigs.satotsuX = tmpSatotsu.x;
  raceConfig.miniGameAutoScrollRaceConfigs.satotsuY = tmpSatotsu.y;
};

window.loadEvents = function () {
  const config = raceConfig.miniGameAutoScrollRaceConfigs.participants;
  if (!config) return;
  Object.keys(config).forEach(eventName => {
    const data = config[eventName];
    if (!data.event || data.event == null) return;

    restoreEvent(data.event, eventName, raceConfig.resetDx)
  });
  restoreEvent(raceConfig.miniGameAutoScrollRaceConfigs.satotsuEventSave, "Satotsu", raceConfig.resetDx)
  //raceConfig.miniGameAutoScrollRaceConfigs.satotsu = $gameMap.events().find(e => e.event().name === "Satotsu");
  raceConfig.resetDx = 0;
};

function restoreEvent(originalEvent, eventName, dx){
  const newEventId = $dataMap.events.length;
  const eventData = JsonEx.makeDeepCopy(originalEvent);
  // Appliquer le décalage X de -200, minimum 0
  if(eventName !== "Satotsu"){
    eventData.x = Math.max(0, raceConfig.miniGameAutoScrollRaceConfigs.participants[eventName].x) - raceConfig.RESET_SHIFT + dx;
    eventData.y = raceConfig.miniGameAutoScrollRaceConfigs.participants[eventName].y;
  } else {
    eventData.x = raceConfig.miniGameAutoScrollRaceConfigs.satotsuX - raceConfig.RESET_SHIFT + dx;
    eventData.y = raceConfig.miniGameAutoScrollRaceConfigs.satotsuY;
  }

  // Ajouter aux données de la carte
  $dataMap.events[newEventId] = eventData;

  // Créer et insérer dans le gameMap
  const newEvent = new Game_Event($gameMap.mapId(), newEventId);
  $gameMap._events[newEventId] = newEvent;

  newEvent.refresh();
  // 🔽 Affichage dynamique
  if (SceneManager._scene instanceof Scene_Map) {
    const spriteSet = SceneManager._scene._spriteset;
    const sprite = new Sprite_Character(newEvent);
    spriteSet._characterSprites.push(sprite);
    spriteSet._tilemap.addChild(sprite);
  }
}

window.disableMiniGameAutoScrollRace = function() {
  raceConfig.miniGameAutoScrollRaceEnable = false;  
}

window.enableMiniGameAutoScrollRace = function() {
  raceConfig.miniGameAutoScrollRaceEnable = true;  
};

// === Affichage des cœurs & HUD===
const _Scene_Map_createAllWindows3 = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
  _Scene_Map_createAllWindows3.call(this);
  this.createEnduranceHUD();
};

Scene_Map.prototype.createEnduranceHUD = function() {
  const visibleW = $gameMap.tileWidth() * $gameMap.width();
  const visibleH = $gameMap.tileHeight() * $gameMap.height();

  const w = Math.min(Graphics.boxWidth, visibleW);
  const h = Math.min(Graphics.boxHeight, visibleH);
  let dw = Graphics.boxWidth - w;
  let dh = Graphics.boxHeight - h;
  if (dw < 0) dw = 0;
  if (dh < 0) dh = 0;

  this._enduranceSprite = new Sprite(new Bitmap(200, 24));
  this._enduranceSprite.x = dw/2+(Graphics.boxWidth/2-100);
  this._enduranceSprite.y = dh/2;
  this.addChild(this._enduranceSprite);
};

function getSatotsuEvent(){
  if(!raceConfig.miniGameAutoScrollRaceConfigs.satotsu){
    raceConfig.miniGameAutoScrollRaceConfigs.satotsu = $gameMap.events().find(e => e.event().name === "Satotsu");
  }
  return raceConfig.miniGameAutoScrollRaceConfigs.satotsu;
}

const _Scene_Map_update3 = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
  if(this._callGameOver){
    this._callGameOver = false;
    setTimeout(() => {
      resetMiniGameAutoScrollRace();
    }, 2000); // 2 secondes après
    SceneManager.goto(Scene_Gameover);
  }
  _Scene_Map_update3.call(this);
  if (isMiniGameAutoScrollRaceActive() && !this._callGameOver) {
    this.updateEnduranceHUD();
    this.updateFollowerEvents();
    this.updateSatotsuMovement();
  }
};

Scene_Map.prototype.updateFollowerEvents = function() {

  const px = $gamePlayer.x;
  const py = $gamePlayer.y;
  $gameMap.events().forEach(event => {
    if (raceConfig.miniGameAutoScrollRaceConfigs.participants[event.event().name]) {
      applyStrategy(event, px, py);
    } 
  });
}

function applyStrategy(event, px, py) {
  const participant = raceConfig.miniGameAutoScrollRaceConfigs.participants[event.event().name];
  if (!participant) return;

  switch (participant.strategy) {
    case 0: // Strategy 0
      event.applyStrategy(participant, 20, 70, 1, participant.distanceWarning, px, py);
      break;
    case 1: // Strategy 1
      event.applyStrategy(participant, 40, 60, 1, participant.distanceWarning, px, py);
      break;
    case 2: // Strategy 2
      event.applyStrategy(participant, 50, 80, 2, participant.distanceWarning, px, py);
      break;
  }
}


function computeDistanceWarning(dx, distanceWarning) {
  if( dx <= distanceWarning) {
    return 0;
  }
  return Math.round(dx/ distanceWarning);
}

Game_Event.prototype.applyStrategy = function(participant, minThreshold, maxThreshold, speedRecuperation, distanceWarning, px, py) {
  const satotsu = getSatotsuEvent();
  const dx = satotsu.x - this.x;

  // Ajuste la vitesse en fonction de l'endurance
  if(participant.endurance <= minThreshold*raceConfig.MAX_ENDURANCE/100 && !participant.isRecuperating) {
    participant.speed = speedRecuperation;
    participant.isRecuperating = true;
  } else if(!participant.isRecuperating) {
    participant.speed = satotsu.moveSpeed() + computeDistanceWarning(dx, distanceWarning); // Vitesse normale
    if(participant.speed > 7){
      participant.speed = 7; // Limite la vitesse maximale
    }
  } else if(participant.endurance > maxThreshold*raceConfig.MAX_ENDURANCE/100){
    participant.isRecuperating = false;
  }
  if((dx <= raceConfig.SPACE_WITH_SATOTSU) && (this.moveSpeed() > satotsu.moveSpeed())) {
    this.setMoveSpeed(satotsu.moveSpeed());
  } else {
    this.setMoveSpeed(participant.speed);
  }

  if (!this.isMoving() && this.canPass(this.x + 1, this.y) && dx > raceConfig.SPACE_WITH_SATOTSU && participant.counterAspiration <= participant.maxAspiration) {
    this.moveStraight(6);
    this.updateEndurance();
    if(py === this.y && this.x > px && this.x - px <= raceConfig.ASPIRATION_RANGE+1){
      this.requestAnimation(127);
      participant.counterAspiration += 1;
    }
  } else if (!this.isMoving() && dx > raceConfig.SPACE_WITH_SATOTSU){
    const direction = Math.random();
    if(direction > 0.5){
      if(this.y > 1){
        this.moveDiagonally(6, 8)
      } else {
        this.moveDiagonally(6, 2)
      }
    } else {
      if(this.y < $gameMap.height() - 1){
        this.moveDiagonally(6, 2)
      } else {
        this.moveDiagonally(6, 8)
      }
    }
  }
  if(py !== this.y){
    participant.counterAspiration = 0;
  }
};

Game_Event.prototype.getEndurance = function() {
  return raceConfig.miniGameAutoScrollRaceConfigs.participants[this.event().name].endurance;
};

Game_Event.prototype.setEndurance = function(val) {
  raceConfig.miniGameAutoScrollRaceConfigs.participants[this.event().name].endurance = Math.max(0, Math.min(raceConfig.MAX_ENDURANCE, val));
};

Game_Event.prototype.updateEndurance = function() {
  if(!raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()].animation()){
    const speed = this.realMoveSpeed();
    let factor = raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()].speedValues[speed] || 0;
    if(factor > 0){
      factor = factor * raceConfig.miniGameAutoScrollRaceConfigs.participants[this.event().name].recupFactor;
    } else {
      factor = factor * raceConfig.miniGameAutoScrollRaceConfigs.participants[this.event().name].enduranceFactor;
    }
    this.setEndurance(this.getEndurance() + factor);
  }
};

Scene_Map.prototype.updateSatotsuMovement = function() {
  const satotsu = getSatotsuEvent();
  if (satotsu && !satotsu.isMoving() && satotsu.canPass(satotsu.x + 1, satotsu.y)) {
    if(satotsu.x >= 230){
      raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()].nextMapFunction();
    } else {
      const speed = raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()].satotsuSpeed();
      satotsu.setMoveSpeed(speed);
      satotsu.moveStraight(6);
    }
  }
};




Scene_Map.prototype.updateEnduranceHUD = function() {
  if (!this._enduranceSprite || raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()].animation()) return;
  const bmp = this._enduranceSprite.bitmap;
  bmp.clear();
  const val = $gameVariables.value(ENDURANCE_VAR_ID)*100/ raceConfig.MAX_ENDURANCE;
  const percent = val / 100;
  bmp.fillRect(0, 0, 200, 24, "#444");
  bmp.fillRect(0, 0, 200 * percent, 24, raceConfig.showAspiration? "#1c1fd8ff" : "#2ecc71");
  bmp.textColor = "white";
  bmp.drawText(`Endurance: ${val} Speed: ${$gamePlayer.moveSpeed()}`, 0, 0, 200, 24, 'center');
};

const _window_resetMessageToShow = window.resetMessageToShow;
window.resetMessageToShow = function() {
  if (raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()]) {
    raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()].messagesShown = {};
  }
  _window_resetMessageToShow.call(this);
}

const _Game_Player_moveByInput2 = Game_Player.prototype.moveByInput;
Game_Player.prototype.moveByInput = function() {
  if (isMiniGameAutoScrollRaceActive() && raceConfig.miniGameAutoScrollRaceEnable) {
    // Bloque les contrôles standards pendant le mini-jeu
    return;
  }
  _Game_Player_moveByInput2.call(this);
};

const _Game_Player_isDashing2 = Game_Player.prototype.isDashing;
Game_Player.prototype.isDashing = function() {
  if($gameVariables.value(46) === 1){
    return false;
  }
  if (isMiniGameAutoScrollRaceActive() && raceConfig.miniGameAutoScrollRaceEnable) {
    return false; // Interdit la course
  }
  return _Game_Player_isDashing2.call(this);
};

function calculateDistanceWarningValue(distance) {
  const minDist = raceConfig.WARNING_DISTANCE;
  const maxDist = raceConfig.MAX_DISTANCE;
  const minValue = 1000;
  const maxValue = 500;

  if (distance <= minDist) return minValue;
  if (distance >= maxDist) return maxValue;

  // Interpolation linéaire
  const ratio = (distance - minDist) / (maxDist - minDist);
  return Math.floor(minValue + (maxValue - minValue) * ratio);
}

// === Mise à jour à chaque frame ===
const _Game_Player_update_MiniGame3 = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
  _Game_Player_update_MiniGame3.call(this, sceneActive);

  if (isMiniGameAutoScrollRaceActive() && raceConfig.miniGameAutoScrollRaceEnable) {
    const satotsu = getSatotsuEvent();
    if(!satotsu) return;
    const dx = Math.abs(this.x - satotsu.x);
    if (dx >= raceConfig.WARNING_DISTANCE && !$gameTemp._satotsuWarningShown) {
      $gameTemp._satotsuWarningShown = true;
      $gameScreen.startFlash([0, 0, 0, 255], 30); // Flash noir pendant 30 frames
      if (dx > raceConfig.MAX_DISTANCE) {
        SceneManager._scene._callGameOver = true;
        return;
      }
      setTimeout(() => {
        $gameTemp._satotsuWarningShown = false; 
      }, calculateDistanceWarningValue(dx)); // Réinitialise après 1 seconde
    }

    const isAnimation = raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()].animation();

    console.log("is triggered : " + TouchInput.isTriggered());
    if (TouchInput.isPressed()) {
      //console.log("TouchInput.x : " + TouchInput.x + " TouchInput.y : " + TouchInput.y + " TouchInput._pressedX : " + TouchInput._pressedX + " TouchInput._pressedY : " + TouchInput._pressedY);
      const dx = TouchInput.x - Graphics.width / 2;
      const dy = TouchInput.y - Graphics.height / 2;

      console.log("dx : " + dx + " dy : " + dy);
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < -10) raceConfig.touchLeft = true;
        else if (dx > 10) raceConfig.touchRight = true;
      } else {
        if (dy < -10) raceConfig.touchTop = true;
        else if (dy > 10) raceConfig.touchBottom = true;
      }
    } 

    if(!isAnimation){
      const qPressed = Input.isPressed(Input.keyMapper[81]); // Q
      const dPressed = Input.isPressed(Input.keyMapper[68]); // D
      if(raceConfig.canChangeSpeed && raceConfig.counterEnableChangeSpeed <= 0) {
        // === Gestion de la vitesse ===
        if( qPressed || raceConfig.touchLeft) { // Touche Q
          const current = this.moveSpeed();
          if (current > 1) {
            this.setMoveSpeed(current - 1);
            raceConfig.canChangeSpeed = false;
            setTimeout(() => {
              raceConfig.canChangeSpeed = true;
            }, raceConfig.DELAY_INPUT_SPEED); // Réactive après 1 seconde
          }
          raceConfig.touchLeft = false;
        } else if (dPressed || raceConfig.touchRight) { // Touche D
          const current = this.moveSpeed();
          if (current < 6) {
            this.setMoveSpeed(current + 1);
            raceConfig.canChangeSpeed = false;
            setTimeout(() => {
               raceConfig.canChangeSpeed = true;
            }, raceConfig.DELAY_INPUT_SPEED); // Réactive après 1 seconde
          }
          raceConfig.touchRight = false;
        }
      }
    } else {
      this.setMoveSpeed(satotsu.moveSpeed());
    }
    
    if((satotsu._x - this._x < raceConfig.SPACE_WITH_SATOTSU) && (this.moveSpeed() > satotsu.moveSpeed())) {
      this.setMoveSpeed(satotsu.moveSpeed());
    } 
    if (this.canMove() && !this.isMoving()) {
      const canPassTop = this.canPass(this.x + 1, this.y - 1);
      const canPassBottom = this.canPass(this.x + 1, this.y + 1);
      const canPassStraight = this.canPass(this.x + 1, this.y);
      if(this.getEndurance() > 0 && raceConfig.counterEnableChangeSpeed <= 0) {
        
        const zPressed = Input.isPressed(Input.keyMapper[90]); // Z
        const sPressed = Input.isPressed(Input.keyMapper[83]); // S

        raceConfig.playerBlinking=false;
        if(!isAnimation){
          if (zPressed || raceConfig.touchTop) { // Touche Z
            this.moveDiagonally(6, 8); // Droite-Haut
            raceConfig.lastMove = raceConfig.MOVE_UP;
            raceConfig.touchTop = false;
          } else if (sPressed || raceConfig.touchBottom) { // Touche S
            this.moveDiagonally(6, 2); // Droite-Bas
            raceConfig.lastMove = raceConfig.MOVE_DOWN;
            raceConfig.touchBottom = false;
          } else {
            if(canPassStraight){
              this.moveStraight(6); // Avance droite
              raceConfig.lastMove = raceConfig.MOVE_STRAIGHT;
            } else {
              const direction = Math.random();
              if(direction > 0.5){
                if(this.y > 1){
                  this.moveDiagonally(6, 8)
                  raceConfig.lastMove = raceConfig.MOVE_UP;
                } else {
                  this.moveDiagonally(6, 2)
                  raceConfig.lastMove = raceConfig.MOVE_DOWN;
                }
              } else {
                if(this.y < $gameMap.height() - 1){
                  this.moveDiagonally(6, 2)
                  raceConfig.lastMove = raceConfig.MOVE_DOWN;
                } else {
                  this.moveDiagonally(6, 8)
                  raceConfig.lastMove = raceConfig.MOVE_UP;
                }
              }
            }
          }
        } else {
          this.moveStraight(6); // Avance droite
          raceConfig.lastMove = raceConfig.MOVE_STRAIGHT;
        }

        
      } else if(this.getEndurance() <= 0){
        this.setMoveSpeed(1);
        this.setEndurance(1);
        raceConfig.counterEnableChangeSpeed = raceConfig.miniGameAutoScrollRaceConfigs.frameExausted || 0;
        raceConfig.playerBlinking=true;
      } 
      if(!raceConfig.playerBlinking){
        if((raceConfig.lastMove === raceConfig.MOVE_STRAIGHT && canPassStraight) 
          || (raceConfig.lastMove === raceConfig.MOVE_UP && canPassTop)
          || (raceConfig.lastMove === raceConfig.MOVE_DOWN && canPassBottom)) {
          this.updateEndurancePursuit();
        }
      }
    }
    
    const spriteSet = SceneManager._scene._spriteset;
    const playerSprite = spriteSet._characterSprites.find(sprite => sprite._character === $gamePlayer);
    if(raceConfig.playerBlinking && raceConfig.counterBlinkPlayer <= 0){
      const ratio = 1-(raceConfig.counterEnableChangeSpeed/raceConfig.miniGameAutoScrollRaceConfigs.frameExausted);
      raceConfig.counterBlinkPlayer = 10+ratio*20;
      playerSprite.setBlendColor([255, 255, 255, 128]);
      if(raceConfig.blinkShown){
        raceConfig.blinkShown = false;
        playerSprite.setBlendColor([0, 0, 0, 0]);
      } else {
        raceConfig.blinkShown = true;
        playerSprite.setBlendColor([255, 255, 255, 128]);
      }
    } else if (raceConfig.counterBlinkPlayer <= 0) {
      playerSprite.setBlendColor([0, 0, 0, 0]);
    }

    raceConfig.counterEnableChangeSpeed--;
    raceConfig.counterBlinkPlayer--;
    checkMessagesToShow(this._x, raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()]);
  }
};

Game_Player.prototype.getEndurance = function() {
  return $gameVariables.value(ENDURANCE_VAR_ID);
};

Game_Player.prototype.setEndurance = function(val) {
  $gameVariables.setValue(ENDURANCE_VAR_ID, Math.max(0, Math.min(raceConfig.MAX_ENDURANCE, val)));
};


Game_Player.prototype.updateEndurancePursuit = function() {
  if(!raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()].animation()){
    const speed = this.realMoveSpeed();
    const baseFactor = raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()].speedValues[speed] || 0;
    let finalFactor = baseFactor;

    // Vérifie l'aspiration
    if (isPlayerInAspirationZone()) {
      this.requestAnimation(126);
      if (baseFactor < 0) finalFactor = baseFactor * (1 - raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()].aspirationFactor);
      else if (baseFactor > 0) finalFactor = baseFactor * (1 + raceConfig.miniGameAutoScrollRaceConfigs[$gameMap.mapId()].aspirationFactor);
    }
    const current = this.getEndurance();
    this.setEndurance(current + finalFactor);
  }
};


function isPlayerInAspirationZone() {
  const px = $gamePlayer.x;
  const py = $gamePlayer.y;
  for (let event of $gameMap.events()) {
    const participant = raceConfig.miniGameAutoScrollRaceConfigs.participants[event.event().name];
    if (participant){
      if(event.y == py) {
        if (event.x > px && event.x - px <= raceConfig.ASPIRATION_RANGE){
          raceConfig.showAspiration = true;
          return true;
        }
      }
    }
  }
  raceConfig.showAspiration = false;
  return false;
}
// === LISTE DES COMMANDES DU MINI-JEU ===
const MiniGameInputs = [
  { label: "Touch haut / Touche Haut", value: "Déplacement vers le haut", touchIcon: 330, inputIcon: 326 },
  { label: "Touch bas / Touche Bas", value: "Déplacement vers le bas", touchIcon: 331, inputIcon: 327 },
  { label: "Double touch haut / Touche Droite", value: "Augmente la vitesse", touchIcon: 332, inputIcon: 328 },
  { label: "Double touch bas / Touche Gauche", value: "Réduit la vitesse", touchIcon: 333, inputIcon: 329 }
];

// === CLASSE FENÊTRE MINI-JEU ===
function Window_MiniGameInputList() { this.initialize.apply(this, arguments); }
Window_MiniGameInputList.prototype = Object.create(Window_Command.prototype);
Window_MiniGameInputList.prototype.constructor = Window_MiniGameInputList;

Window_MiniGameInputList.prototype.initialize = function(x, y) {
  this._inputList = MiniGameInputs;
  Window_Command.prototype.initialize.call(this, x, y);
  this.select(-1);
  this.deactivate(); // on activera juste après l’ajout
};

Window_MiniGameInputList.prototype.makeCommandList = function() {
  this._inputList.forEach(input => this.addCommand("", null, false, input));
};

Window_MiniGameInputList.prototype.drawItem = function(index) {
  const rect  = this.itemRect(index);
  const input = this._list[index].ext;
  const half  = rect.width / 2;
  this.resetTextColor();
  this.drawIcon(input.touchIcon, rect.x + this.textPadding(), rect.y + 2);
  this.drawText("/", rect.x + this.textPadding() + 40, rect.y, 20, 'left');
  this.drawIcon(input.inputIcon, rect.x + this.textPadding() + 60, rect.y + 2);
  this.drawText(input.value, rect.x + half, rect.y, half - this.textPadding(), 'right');
};

Window_MiniGameInputList.prototype.windowWidth  = function()  { return 480; };
Window_MiniGameInputList.prototype.windowHeight = function()  { return this.fittingHeight(this._inputList.length); };

Window_MiniGameInputList.prototype.playOkSound = function() {};

Window_MiniGameInputList.prototype.playBuzzerSound = function() {};

// === AFFICHER LA FENÊTRE & RÉSOUDRE SUR INPUT ===
window.showMinigameInputList = function() {
  return new Promise(resolve => {
    const scene = SceneManager._scene;
    if (!scene) return resolve();

    const tmp  = new Window_MiniGameInputList(0, 0);
    const x    = (Graphics.boxWidth  - tmp.windowWidth())  / 2;
    const y    = (Graphics.boxHeight - tmp.windowHeight()) / 2;
    const win  = new Window_MiniGameInputList(x, y);

    scene.addWindow(win);
    win.openness = 255;
    win.activate();
    win.select(-1);

    let done = false;
    const _origUpdate = scene.update.bind(scene);

    const timeoutId = setTimeout(() => {
      SoundManager.playOk();
      cleanup();
    }, 30000); // 30 secondes de sécurité

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (done) return;
      done = true;
      if (scene._windowLayer && win.parent === scene._windowLayer) {
        scene._windowLayer.removeChild(win);
      }
      scene.update = _origUpdate;
      resolve();
    };

    // Fermer proprement si changement de scène
    const _origStop = scene.stop || function(){};
    scene.stop = function() {
      try { cleanup(); } finally { _origStop.apply(this, arguments); }
    };

    // Surveiller l'input
    scene.update = function() {
      _origUpdate();
      if (done) return;

      if (Input.isTriggered('ok') || Input.isTriggered('cancel') || TouchInput.isTriggered()) {
        SoundManager.playOk(); // toujours jouer le son OK
        cleanup();
      }
    };
  });
};

console.log("End load Minigame Auto Scroll Race")

if(raceConfig.MODE_DEBUG) {
  let enduranceBarsReady = false;

  const _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
  Spriteset_Map.prototype.createCharacters = function() {
    _Spriteset_Map_createCharacters.call(this);
    this.createEnduranceBars();
  };

  Spriteset_Map.prototype.createEnduranceBars = function() {
    this._enduranceBars = {};
    for (let sprite of this._characterSprites) {
      const char = sprite._character;
      if (!(char instanceof Game_Event)) continue;

      const name = char.event().name;
      if (name === "Satotsu" || name === "Evnt") continue;

      if (!raceConfig.miniGameAutoScrollRaceConfigs.participants[name]) continue;

      const bar = new Sprite(new Bitmap(40, 6));
      bar.anchor.x = 0.5;
      bar.anchor.y = 1;
      sprite.addChild(bar);
      this._enduranceBars[char.eventId()] = bar;
    }
    enduranceBarsReady = true;
  };

  const _Spriteset_Map_update = Spriteset_Map.prototype.update;
  Spriteset_Map.prototype.update = function() {
    _Spriteset_Map_update.call(this);
    if (!enduranceBarsReady) this.createEnduranceBars();
    this.updateEnduranceBars();
  };

  Spriteset_Map.prototype.updateEnduranceBars = function() {
    if (!this._enduranceBars) return;

    for (let sprite of this._characterSprites) {
      const char = sprite._character;
      if (!(char instanceof Game_Event)) continue;

      const bar = this._enduranceBars[char.eventId()];
      if (!bar) continue;

      const participant = raceConfig.miniGameAutoScrollRaceConfigs.participants[char.event().name];
      if (!participant) continue;

      const bmp = bar.bitmap;
      bmp.clear();

      const percent = participant.endurance / raceConfig.MAX_ENDURANCE;
      const w = 40;
      const h = 6;
      const filled = Math.floor(w * percent);

      bmp.fillRect(0, 0, w, h, "#000000");
      bmp.fillRect(1, 1, filled - 2, h - 2, percent > 0.3 ? "#2ecc71" : "#e74c3c");

      bar.x = 0;
      bar.y = -sprite.patternHeight() / 2 - 4;
    }
  };

  // Ajout : forcer le refresh après téléportation
  const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
  Scene_Map.prototype.onMapLoaded = function() {
    _Scene_Map_onMapLoaded.call(this);
    enduranceBarsReady = false;
  };
}