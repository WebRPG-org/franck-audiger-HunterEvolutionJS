let canChangeSpeed = true;
const DELAY_INPUT_SPEED = 400;
const MAX_ENDURANCE = 2000;
const MAX_DISTANCE = 60;
const WARNING_DISTANCE = 30;
const SPACE_WITH_SATOTSU = 2; // Espace minimum entre le joueur et Satotsu pour changer de vitesse
const ASPIRATION_RANGE = 2;
let playerBlinking = false;
let counterEnableChangeSpeed = 0;
let counterBlinkPlayer = 0;
let blinkShown = false;
let showAspiration = false;
const MOVE_STRAIGHT = 0;
const MOVE_UP = 1;
const MOVE_DOWN = 2;
let lastMove = MOVE_STRAIGHT;
const LOAD_EVENT_VARIABLE_ID = 44;
const RESET_SHIFT = 190;
const MODE_DEBUG = false;

const defaultMiniGameAutoScrollRaceConfigs = {
  103 : {
    messagesShown : {},
    messagesConfig : {
    },
    speedValues : {
      1: +400,   // 1/8
      2: +100,   // 1/4
      3: +20,   // 1/2
      4: -20,     // x1
      5: -20,    // x2
      6: -20,    // x4
    },
    aspirationFactor : 0.4,
    nextMapFunction : function() {
      saveEvents();
      $gameVariables.setValue(LOAD_EVENT_VARIABLE_ID, 1);
      teleportPlayer(104);
    },
    satotsuSpeed : function() {
      return 4; 
    },
    animation : function(){
      const satotsu = getSatotsuEvent();
      if(!satotsu) return true;
      return satotsu.x <= 30;
    }
  },
  104 : {
    messagesShown : {},
    messagesConfig : {
    },
    speedValues : {
      1: +400,   // 1/8
      2: +100,   // 1/4
      3: +20,   // 1/2
      4: -20,     // x1
      5: -20,    // x2
      6: -20,    // x4
    },
    aspirationFactor : 0.4,
    nextMapFunction : function() {
      $gameVariables.setValue(24, 1);
      $gameScreen.startFadeOut(10);
      setTimeout(() => {
        teleportPlayer(106, 22, 8);
      }, 1000);
    },
    satotsuSpeed : function() {
      return 4; 
    },
    animation : function(){
      return false;
    }
  },
  playerEndurance : MAX_ENDURANCE,
  satotsu : null,
  frameExausted : 150,
  participants : {
    "Hanzo" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.5,
      enduranceFactor: 0.5,
      distanceWarning : 4,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "Bodoro" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.5,
      enduranceFactor: 0.5,
      distanceWarning : 9,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "Hisoka" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 2,
      isRecuperating : false,
      recupFactor: 1.5,
      enduranceFactor: 0,
      distanceWarning : 12,
      counterAspiration : 0,
      maxAspiration : 1,
    },
    "Sommy" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 2,
      isRecuperating : false,
      recupFactor: 1,
      enduranceFactor: 1,
      distanceWarning : 4,
      counterAspiration : 0,
      maxAspiration : 4,
    },
    "Ponzu" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.2,
      enduranceFactor: 0.8,
      distanceWarning : 12,
      counterAspiration : 0,
      maxAspiration : 4,
    },
    "Siper" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 0.7,
      distanceWarning : 7,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "Shishito" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.5,
      enduranceFactor: 1,
      distanceWarning : 12,
      counterAspiration : 0,
      maxAspiration : 4,
    },
    "Kyu" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.2,
      enduranceFactor: 0.5,
      distanceWarning : 6,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "Ryu" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 2,
      isRecuperating : false,
      recupFactor: 1.5,
      enduranceFactor: 0.5,
      distanceWarning : 5,
      counterAspiration : 0,
      maxAspiration : 4,
    },
    "Kenmi" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.4,
      enduranceFactor: 0.8,
      distanceWarning : 3,
      counterAspiration : 0,
      maxAspiration : 5,
    },
    "Agon" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 1,
      distanceWarning : 12,
      counterAspiration : 0,
      maxAspiration : 5,
    },
    "Goz" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 2,
      isRecuperating : false,
      recupFactor: 1.4,
      enduranceFactor: 1,
      distanceWarning : 13,
      counterAspiration : 0,
      maxAspiration : 5,
    },
    "Geretta" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 2,
      isRecuperating : false,
      recupFactor: 1.6,
      enduranceFactor: 0.6,
      distanceWarning : 7,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "Bourbon" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 2,
      isRecuperating : false,
      recupFactor: 1.4,
      enduranceFactor: 0.4,
      distanceWarning : 6,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "Tompa" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.2,
      enduranceFactor: 1,
      distanceWarning : 25,
      counterAspiration : 0,
      maxAspiration : 2,
    },
    "Cherry" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 1,
      distanceWarning : 20,
      counterAspiration : 0,
      maxAspiration : 5,
    },
    "CherrySbire1" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 1,
      distanceWarning : 20,
      counterAspiration : 0,
      maxAspiration : 5,
    },
    "CherrySbire2" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 1,
      distanceWarning : 22,
      counterAspiration : 0,
      maxAspiration : 5,
    },
    "CherrySbire3" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 1,
      distanceWarning : 22,
      counterAspiration : 0,
      maxAspiration : 5,
    },
    "CherrySbire4" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 1,
      distanceWarning : 20,
      counterAspiration : 0,
      maxAspiration : 5,
    },
    "CherrySbire5" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 1,
      distanceWarning : 22,
      counterAspiration : 0,
      maxAspiration : 5,
    },
    "Amory" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 0.7,
      distanceWarning : 15,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "Imory" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 0.7,
      distanceWarning : 16,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "Umory" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 0.7,
      distanceWarning : 16,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "Killua skate" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 0,
      distanceWarning : 14,
      counterAspiration : 0,
      maxAspiration : 1,
    },
    "Leolio" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 0.9,
      distanceWarning : 18,
      counterAspiration : 0,
      maxAspiration : 7,
    },
    "Kurapika" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 0.9,
      distanceWarning : 15,
      counterAspiration : 0,
      maxAspiration : 7,
    },
    "RandomCandidat2" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.5,
      enduranceFactor: 0.7,
      distanceWarning : 10,
      counterAspiration : 0,
      maxAspiration : 2,
    },
    "RandomCandidat1" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 2,
      isRecuperating : false,
      recupFactor: 1.2,
      enduranceFactor: 0.2,
      distanceWarning : 10,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "Pokkle" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.6,
      enduranceFactor: 0.4,
      distanceWarning : 12,
      counterAspiration : 0,
      maxAspiration : 2,
    },
    "Gitarakuru" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 2,
      isRecuperating : false,
      recupFactor: 1.5,
      enduranceFactor: 0,
      distanceWarning : 14,
      counterAspiration : 0,
      maxAspiration : 1,
    },
    "Todo" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 2,
      isRecuperating : false,
      recupFactor: 1.8,
      enduranceFactor: 1,
      distanceWarning : 18,
      counterAspiration : 0,
      maxAspiration : 1,
    },
    "RandomCandidat3" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 2,
      isRecuperating : false,
      recupFactor: 1.2,
      enduranceFactor: 0.2,
      distanceWarning : 22,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "RandomCandidat4" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.6,
      enduranceFactor: 0.8,
      distanceWarning : 26,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "RandomCandidat5" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1,
      enduranceFactor: 1,
      distanceWarning : 21,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "RandomCandidat6" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 2,
      isRecuperating : false,
      recupFactor: 1,
      enduranceFactor: 1,
      distanceWarning : 20,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "Nicholas" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 0.8,
      enduranceFactor: 1.2,
      distanceWarning : 14,
      counterAspiration : 0,
      maxAspiration : 3,
    },
  }
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

let miniGameAutoScrollRaceConfigs = JsonEx.makeDeepCopy(defaultMiniGameAutoScrollRaceConfigs);
restoreFunctions(defaultMiniGameAutoScrollRaceConfigs, miniGameAutoScrollRaceConfigs);

function isMiniGameAutoScrollRaceActive() {
  if(!$gameMap){
    return false;
  }
  return miniGameAutoScrollRaceConfigs[$gameMap.mapId()];
}

let miniGameAutoScrollRaceEnable = true;

window.resetMiniGameAutoScrollRace = function() {
  // Réinitialise les données globales
  miniGameAutoScrollRaceConfigs = JsonEx.makeDeepCopy(defaultMiniGameAutoScrollRaceConfigs);
  restoreFunctions(defaultMiniGameAutoScrollRaceConfigs, miniGameAutoScrollRaceConfigs);
  resetDx = 0;
  showAspiration = false;
  playerBlinking = false;
  counterEnableChangeSpeed = 0;
  counterBlinkPlayer = 0;
  blinkShown = false;
  $gameTemp._satotsuWarningShown = false;
};

window.resetSatotsu = function() {
  miniGameAutoScrollRaceConfigs.satotsu = null;
}

window.teleportPlayer = function (mapId, newX, newY){
  let x = newX ? newX : $gamePlayer.x - RESET_SHIFT + resetDx;
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
let resetDx = 0;

window.saveEvents = function () {
  if($gamePlayer.x < 30){
    resetDx = 30 - $gamePlayer.x;
  }
  $gameMap.events().forEach(element => {
    const name = element.event().name;

    // Vérifie que la structure existe avant d'y accéder
    if (miniGameAutoScrollRaceConfigs.participants &&
        miniGameAutoScrollRaceConfigs.participants[name]) {
      miniGameAutoScrollRaceConfigs.participants[name].event = element.event();
      miniGameAutoScrollRaceConfigs.participants[name].x = element.x;
      miniGameAutoScrollRaceConfigs.participants[name].y = element.y;
    }
  });
  const tmpSatotsu = getSatotsuEvent();
  miniGameAutoScrollRaceConfigs.satotsuEventSave = tmpSatotsu.event()
  resetSatotsu();
  miniGameAutoScrollRaceConfigs.satotsuX = tmpSatotsu.x;
  miniGameAutoScrollRaceConfigs.satotsuY = tmpSatotsu.y;
};

window.loadEvents = function () {
  const config = miniGameAutoScrollRaceConfigs.participants;
  if (!config) return;
  Object.keys(config).forEach(eventName => {
    const data = config[eventName];
    if (!data.event || data.event == null) return;

    restoreEvent(data.event, eventName, resetDx)
  });
  restoreEvent(miniGameAutoScrollRaceConfigs.satotsuEventSave, "Satotsu", resetDx)
  //miniGameAutoScrollRaceConfigs.satotsu = $gameMap.events().find(e => e.event().name === "Satotsu");
  resetDx = 0;
};

function restoreEvent(originalEvent, eventName, dx){
  const newEventId = $dataMap.events.length;
  const eventData = JsonEx.makeDeepCopy(originalEvent);
  // Appliquer le décalage X de -200, minimum 0
  if(eventName !== "Satotsu"){
    eventData.x = Math.max(0, miniGameAutoScrollRaceConfigs.participants[eventName].x) - RESET_SHIFT + dx;
    eventData.y = miniGameAutoScrollRaceConfigs.participants[eventName].y;
  } else {
    eventData.x = miniGameAutoScrollRaceConfigs.satotsuX - RESET_SHIFT + dx;
    eventData.y = miniGameAutoScrollRaceConfigs.satotsuY;
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
  miniGameAutoScrollRaceEnable = false;  
}

window.enableMiniGameAutoScrollRace = function() {
  miniGameAutoScrollRaceEnable = true;  
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
  if(!miniGameAutoScrollRaceConfigs.satotsu){
    miniGameAutoScrollRaceConfigs.satotsu = $gameMap.events().find(e => e.event().name === "Satotsu");
  }
  return miniGameAutoScrollRaceConfigs.satotsu;
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
    if (miniGameAutoScrollRaceConfigs.participants[event.event().name]) {
      applyStrategy(event, px, py);
    } 
  });
}

function applyStrategy(event, px, py) {
  const participant = miniGameAutoScrollRaceConfigs.participants[event.event().name];
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
  if(participant.endurance <= minThreshold*MAX_ENDURANCE/100 && !participant.isRecuperating) {
    participant.speed = speedRecuperation;
    participant.isRecuperating = true;
  } else if(!participant.isRecuperating) {
    participant.speed = satotsu.moveSpeed() + computeDistanceWarning(dx, distanceWarning); // Vitesse normale
    if(participant.speed > 7){
      participant.speed = 7; // Limite la vitesse maximale
    }
  } else if(participant.endurance > maxThreshold*MAX_ENDURANCE/100){
    participant.isRecuperating = false;
  }
  if((dx <= SPACE_WITH_SATOTSU) && (this.moveSpeed() > satotsu.moveSpeed())) {
    this.setMoveSpeed(satotsu.moveSpeed());
  } else {
    this.setMoveSpeed(participant.speed);
  }

  if (!this.isMoving() && this.canPass(this.x + 1, this.y) && dx > SPACE_WITH_SATOTSU && participant.counterAspiration <= participant.maxAspiration) {
    this.moveStraight(6);
    this.updateEndurance();
    if(py === this.y && this.x > px && this.x - px <= ASPIRATION_RANGE+1){
      this.requestAnimation(127);
      participant.counterAspiration += 1;
    }
  } else if (!this.isMoving() && dx > SPACE_WITH_SATOTSU){
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
  return miniGameAutoScrollRaceConfigs.participants[this.event().name].endurance;
};

Game_Event.prototype.setEndurance = function(val) {
  miniGameAutoScrollRaceConfigs.participants[this.event().name].endurance = Math.max(0, Math.min(MAX_ENDURANCE, val));
};

Game_Event.prototype.updateEndurance = function() {
  if(!miniGameAutoScrollRaceConfigs[$gameMap.mapId()].animation()){
    const speed = this.realMoveSpeed();
    let factor = miniGameAutoScrollRaceConfigs[$gameMap.mapId()].speedValues[speed] || 0;
    if(factor > 0){
      factor = factor * miniGameAutoScrollRaceConfigs.participants[this.event().name].recupFactor;
    } else {
      factor = factor * miniGameAutoScrollRaceConfigs.participants[this.event().name].enduranceFactor;
    }
    this.setEndurance(this.getEndurance() + factor);
  }
};

Scene_Map.prototype.updateSatotsuMovement = function() {
  const satotsu = getSatotsuEvent();
  if (satotsu && !satotsu.isMoving() && satotsu.canPass(satotsu.x + 1, satotsu.y)) {
    if(satotsu.x >= 230){
      miniGameAutoScrollRaceConfigs[$gameMap.mapId()].nextMapFunction();
    } else {
      const speed = miniGameAutoScrollRaceConfigs[$gameMap.mapId()].satotsuSpeed();
      satotsu.setMoveSpeed(speed);
      satotsu.moveStraight(6);
    }
  }
};




Scene_Map.prototype.updateEnduranceHUD = function() {
  if (!this._enduranceSprite || miniGameAutoScrollRaceConfigs[$gameMap.mapId()].animation()) return;
  const bmp = this._enduranceSprite.bitmap;
  bmp.clear();
  const val = $gameVariables.value(ENDURANCE_VAR_ID)*100/ MAX_ENDURANCE;
  const percent = val / 100;
  bmp.fillRect(0, 0, 200, 24, "#444");
  bmp.fillRect(0, 0, 200 * percent, 24, showAspiration? "#1c1fd8ff" : "#2ecc71");
  bmp.textColor = "white";
  bmp.drawText(`Endurance: ${val} Speed: ${$gamePlayer.moveSpeed()}`, 0, 0, 200, 24, 'center');
};

const _window_resetMessageToShow = window.resetMessageToShow;
window.resetMessageToShow = function() {
  if (miniGameAutoScrollRaceConfigs[$gameMap.mapId()]) {
    miniGameAutoScrollRaceConfigs[$gameMap.mapId()].messagesShown = {};
  }
  _window_resetMessageToShow.call(this);
}

const _Game_Player_moveByInput2 = Game_Player.prototype.moveByInput;
Game_Player.prototype.moveByInput = function() {
  if (isMiniGameAutoScrollRaceActive() && miniGameAutoScrollRaceEnable) {
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
  if (isMiniGameAutoScrollRaceActive() && miniGameAutoScrollRaceEnable) {
    return false; // Interdit la course
  }
  return _Game_Player_isDashing2.call(this);
};

function calculateDistanceWarningValue(distance) {
  const minDist = WARNING_DISTANCE;
  const maxDist = MAX_DISTANCE;
  const minValue = 1000;
  const maxValue = 500;

  if (distance <= minDist) return minValue;
  if (distance >= maxDist) return maxValue;

  // Interpolation linéaire
  const ratio = (distance - minDist) / (maxDist - minDist);
  return Math.floor(minValue + (maxValue - minValue) * ratio);
}

let touchTop = false;
let touchBottom = false;
let touchRight = false;
let touchLeft = false;

// === Mise à jour à chaque frame ===
const _Game_Player_update_MiniGame3 = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
  _Game_Player_update_MiniGame3.call(this, sceneActive);

  if (isMiniGameAutoScrollRaceActive() && miniGameAutoScrollRaceEnable) {
    const satotsu = getSatotsuEvent();
    if(!satotsu) return;
    const dx = Math.abs(this.x - satotsu.x);
    if (dx >= WARNING_DISTANCE && !$gameTemp._satotsuWarningShown) {
      $gameTemp._satotsuWarningShown = true;
      $gameScreen.startFlash([0, 0, 0, 255], 30); // Flash noir pendant 30 frames
      if (dx > MAX_DISTANCE) {
        SceneManager._scene._callGameOver = true;
        return;
      }
      setTimeout(() => {
        $gameTemp._satotsuWarningShown = false; 
      }, calculateDistanceWarningValue(dx)); // Réinitialise après 1 seconde
    }

    const isAnimation = miniGameAutoScrollRaceConfigs[$gameMap.mapId()].animation();

    console.log("is triggered : " + TouchInput.isTriggered());
    if (TouchInput.isPressed()) {
      //console.log("TouchInput.x : " + TouchInput.x + " TouchInput.y : " + TouchInput.y + " TouchInput._pressedX : " + TouchInput._pressedX + " TouchInput._pressedY : " + TouchInput._pressedY);
      const dx = TouchInput.x - Graphics.width / 2;
      const dy = TouchInput.y - Graphics.height / 2;

      console.log("dx : " + dx + " dy : " + dy);
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < -10) touchLeft = true;
        else if (dx > 10) touchRight = true;
      } else {
        if (dy < -10) touchTop = true;
        else if (dy > 10) touchBottom = true;
      }
    } 

    if(!isAnimation){
      const qPressed = Input.isPressed(Input.keyMapper[81]); // Q
      const dPressed = Input.isPressed(Input.keyMapper[68]); // D
      if(canChangeSpeed && counterEnableChangeSpeed <= 0) {
        // === Gestion de la vitesse ===
        if( qPressed || touchLeft) { // Touche Q
          const current = this.moveSpeed();
          if (current > 1) {
            this.setMoveSpeed(current - 1);
            canChangeSpeed = false;
            setTimeout(() => {
              canChangeSpeed = true;
            }, DELAY_INPUT_SPEED); // Réactive après 1 seconde
          }
          touchLeft = false;
        } else if (dPressed || touchRight) { // Touche D
          const current = this.moveSpeed();
          if (current < 6) {
            this.setMoveSpeed(current + 1);
            canChangeSpeed = false;
            setTimeout(() => {
              canChangeSpeed = true;
            }, DELAY_INPUT_SPEED); // Réactive après 1 seconde
          }
          touchRight = false;
        }
      }
    } else {
      this.setMoveSpeed(satotsu.moveSpeed());
    }
    
    if((satotsu._x - this._x < SPACE_WITH_SATOTSU) && (this.moveSpeed() > satotsu.moveSpeed())) {
      this.setMoveSpeed(satotsu.moveSpeed());
    } 
    if (this.canMove() && !this.isMoving()) {
      const canPassTop = this.canPass(this.x + 1, this.y - 1);
      const canPassBottom = this.canPass(this.x + 1, this.y + 1);
      const canPassStraight = this.canPass(this.x + 1, this.y);
      if(this.getEndurance() > 0 && counterEnableChangeSpeed <= 0) {
        
        const zPressed = Input.isPressed(Input.keyMapper[90]); // Z
        const sPressed = Input.isPressed(Input.keyMapper[83]); // S

        playerBlinking=false;
        if(!isAnimation){
          if (zPressed || touchTop) { // Touche Z
            this.moveDiagonally(6, 8); // Droite-Haut
            lastMove = MOVE_UP;
            touchTop = false;
          } else if (sPressed || touchBottom) { // Touche S
            this.moveDiagonally(6, 2); // Droite-Bas
            lastMove = MOVE_DOWN;
            touchBottom = false;
          } else {
            if(canPassStraight){
              this.moveStraight(6); // Avance droite
              lastMove = MOVE_STRAIGHT;
            } else {
              const direction = Math.random();
              if(direction > 0.5){
                if(this.y > 1){
                  this.moveDiagonally(6, 8)
                  lastMove = MOVE_UP;
                } else {
                  this.moveDiagonally(6, 2)
                  lastMove = MOVE_DOWN;
                }
              } else {
                if(this.y < $gameMap.height() - 1){
                  this.moveDiagonally(6, 2)
                  lastMove = MOVE_DOWN;
                } else {
                  this.moveDiagonally(6, 8)
                  lastMove = MOVE_UP;
                }
              }
            }
          }
        } else {
          this.moveStraight(6); // Avance droite
          lastMove = MOVE_STRAIGHT;
        }

        
      } else if(this.getEndurance() <= 0){
        this.setMoveSpeed(1);
        this.setEndurance(1);
        counterEnableChangeSpeed = miniGameAutoScrollRaceConfigs.frameExausted || 0;
        playerBlinking=true;
      } 
      if(!playerBlinking){
        if((lastMove === MOVE_STRAIGHT && canPassStraight) 
          || (lastMove === MOVE_UP && canPassTop)
          || (lastMove === MOVE_DOWN && canPassBottom)) {
          this.updateEndurancePursuit();
        }
      }
    }
    
    const spriteSet = SceneManager._scene._spriteset;
    const playerSprite = spriteSet._characterSprites.find(sprite => sprite._character === $gamePlayer);
    if(playerBlinking && counterBlinkPlayer <= 0){
      const ratio = 1-(counterEnableChangeSpeed/miniGameAutoScrollRaceConfigs.frameExausted);
      counterBlinkPlayer = 10+ratio*20;
      playerSprite.setBlendColor([255, 255, 255, 128]);
      if(blinkShown){
        blinkShown = false;
        playerSprite.setBlendColor([0, 0, 0, 0]);
      } else {
        blinkShown = true;
        playerSprite.setBlendColor([255, 255, 255, 128]);
      }
    } else if (counterBlinkPlayer <= 0) {
      playerSprite.setBlendColor([0, 0, 0, 0]);
    }

    counterEnableChangeSpeed--;
    counterBlinkPlayer--;
    checkMessagesToShow(this._x, miniGameAutoScrollRaceConfigs[$gameMap.mapId()]);
  }
};

Game_Player.prototype.getEndurance = function() {
  return $gameVariables.value(ENDURANCE_VAR_ID);
};

Game_Player.prototype.setEndurance = function(val) {
  $gameVariables.setValue(ENDURANCE_VAR_ID, Math.max(0, Math.min(MAX_ENDURANCE, val)));
};


Game_Player.prototype.updateEndurancePursuit = function() {
  if(!miniGameAutoScrollRaceConfigs[$gameMap.mapId()].animation()){
    const speed = this.realMoveSpeed();
    const baseFactor = miniGameAutoScrollRaceConfigs[$gameMap.mapId()].speedValues[speed] || 0;
    let finalFactor = baseFactor;

    // Vérifie l'aspiration
    if (isPlayerInAspirationZone()) {
      this.requestAnimation(126);
      if (baseFactor < 0) finalFactor = baseFactor * (1 - miniGameAutoScrollRaceConfigs[$gameMap.mapId()].aspirationFactor);
      else if (baseFactor > 0) finalFactor = baseFactor * (1 + miniGameAutoScrollRaceConfigs[$gameMap.mapId()].aspirationFactor);
    }
    const current = this.getEndurance();
    this.setEndurance(current + finalFactor);
  }
};


function isPlayerInAspirationZone() {
  const px = $gamePlayer.x;
  const py = $gamePlayer.y;
  for (let event of $gameMap.events()) {
    const participant = miniGameAutoScrollRaceConfigs.participants[event.event().name];
    if (participant){
      if(event.y == py) {
        if (event.x > px && event.x - px <= ASPIRATION_RANGE){
          showAspiration = true;
          return true;
        }
      }
    }
  }
  showAspiration = false;
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


if(MODE_DEBUG) {
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

      if (!miniGameAutoScrollRaceConfigs.participants[name]) continue;

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

      const participant = miniGameAutoScrollRaceConfigs.participants[char.event().name];
      if (!participant) continue;

      const bmp = bar.bitmap;
      bmp.clear();

      const percent = participant.endurance / MAX_ENDURANCE;
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