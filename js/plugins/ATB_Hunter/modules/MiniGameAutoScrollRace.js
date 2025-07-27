let canChangeSpeed = true;
const ENDURANCE_VAR_ID = 100;
const DELAY_INPUT_SPEED = 400;
const MAX_ENDURANCE = 2000;
const MAX_DISTANCE = 50;
const WARNING_DISTANCE = 25;
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

const miniGameAutoScrollRaceConfigs = {
  92: {
    messagesShown : {},
    messagesConfig : {
      45 : {
        actorName : "Faces-Gon", 
        actorIndex : 7, 
        text : "langText[FôretCèdre-RunForet1.Envt.dialogue6]", 
        duration : 300
      }
    },
    speedValues : {
      1: +200,   // 1/8
      2: +100,   // 1/4
      3: -20,   // 1/2
      4: -20,     // x1
      5: -20,    // x2
      6: -20,    // x4
    },
    satotsu : null,
  },
  frameExausted : 150,
  participants : {
    "Hanzo" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.5,
      enduranceFactor: 0.5,
      distanceWarning : (WARNING_DISTANCE/2)-10,
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
      distanceWarning : (WARNING_DISTANCE/2)-7,
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
      distanceWarning : (WARNING_DISTANCE+5),
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
      distanceWarning : (WARNING_DISTANCE/2),
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
      distanceWarning : (WARNING_DISTANCE/2)+2,
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
      distanceWarning : (WARNING_DISTANCE/2)-5,
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
      distanceWarning : (WARNING_DISTANCE/2)+10,
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
      distanceWarning : (WARNING_DISTANCE/2)+15,
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
      distanceWarning : (WARNING_DISTANCE/2)+15,
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
      distanceWarning : (WARNING_DISTANCE/2)+15,
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
      distanceWarning : (WARNING_DISTANCE/2)+15,
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
      distanceWarning : (WARNING_DISTANCE/2)+15,
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
      distanceWarning : (WARNING_DISTANCE/2)+15,
      counterAspiration : 0,
      maxAspiration : 5,
    },
    "Shishito" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 1,
      isRecuperating : false,
      recupFactor: 1.5,
      enduranceFactor: 1,
      distanceWarning : (WARNING_DISTANCE/2)-3,
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
      distanceWarning : (WARNING_DISTANCE/2)-7,
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
      distanceWarning : (WARNING_DISTANCE/2)-10,
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
      distanceWarning : (WARNING_DISTANCE/2)-5,
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
      distanceWarning : (WARNING_DISTANCE/2)+3,
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
      distanceWarning : (WARNING_DISTANCE/2)+4,
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
      distanceWarning : (WARNING_DISTANCE/2)+4,
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
      distanceWarning : (WARNING_DISTANCE/2)+2,
      counterAspiration : 0,
      maxAspiration : 3,
    },
    "Amory" : {
      speed : 4,
      endurance : MAX_ENDURANCE,
      strategy : 0,
      isRecuperating : false,
      recupFactor: 1.3,
      enduranceFactor: 0.7,
      distanceWarning : (WARNING_DISTANCE/2)+6,
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
      distanceWarning : (WARNING_DISTANCE/2)+7,
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
      distanceWarning : (WARNING_DISTANCE/2)+7,
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
      distanceWarning : (WARNING_DISTANCE/2)-7,
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
      distanceWarning : (WARNING_DISTANCE/2),
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
      distanceWarning : (WARNING_DISTANCE/2),
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
      distanceWarning : (WARNING_DISTANCE/2)-4,
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
      distanceWarning : (WARNING_DISTANCE/2)-4,
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
      distanceWarning : (WARNING_DISTANCE/2)+6,
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
      distanceWarning : (WARNING_DISTANCE+7),
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
      distanceWarning : (WARNING_DISTANCE+11),
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
      distanceWarning : (WARNING_DISTANCE+9),
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
      distanceWarning : (WARNING_DISTANCE+13),
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
      distanceWarning : (WARNING_DISTANCE+13),
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
      distanceWarning : (WARNING_DISTANCE+15),
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
      distanceWarning : (WARNING_DISTANCE),
      counterAspiration : 0,
      maxAspiration : 3,
    },
  }
};

function isMiniGameAutoScrollRaceActive() {
  if(!$gameMap){
    return false;
  }
  return miniGameAutoScrollRaceConfigs[$gameMap.mapId()];
}

let miniGameAutoScrollRaceEnable = true;

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
  if (isMiniGameAutoScrollRaceActive()) {
    $gameVariables.setValue(ENDURANCE_VAR_ID, MAX_ENDURANCE);
  }
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
  if(!miniGameAutoScrollRaceConfigs[$gameMap.mapId()].satotsu){
    miniGameAutoScrollRaceConfigs[$gameMap.mapId()].satotsu = $gameMap.events().find(e => e.event().name === "Satotsu");
  }
  return miniGameAutoScrollRaceConfigs[$gameMap.mapId()].satotsu;
}

const _Scene_Map_update3 = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
  if(this._callGameOver){
    this._callGameOver = false;
    SceneManager.goto(Scene_Gameover);
  }
  _Scene_Map_update3.call(this);
  if (isMiniGameAutoScrollRaceActive() && !this._callGameOver) {
    this.updateEnduranceHUD();
    this.updateSatotsuMovement();
    this.updateFollowerEvents();
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
  const speed = this.realMoveSpeed();
  let factor = miniGameAutoScrollRaceConfigs[$gameMap.mapId()].speedValues[speed] || 0;
  if(factor > 0){
    factor = factor * miniGameAutoScrollRaceConfigs.participants[this.event().name].recupFactor;
  } else {
    factor = factor * miniGameAutoScrollRaceConfigs.participants[this.event().name].enduranceFactor;
  }
  this.setEndurance(this.getEndurance() + factor);
};

Scene_Map.prototype.updateSatotsuMovement = function() {
  const satotsu = getSatotsuEvent();
  if (satotsu && !satotsu.isMoving() && satotsu.canPass(satotsu.x + 1, satotsu.y)) {
    const speed = satotsu.x >= 50 ? 4 : 3;
    satotsu.setMoveSpeed(speed);
    satotsu.moveStraight(6);
  }
};

Scene_Map.prototype.updateEnduranceHUD = function() {
  if (!this._enduranceSprite) return;
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

// === Mise à jour à chaque frame ===
const _Game_Player_update_MiniGame3 = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
  _Game_Player_update_MiniGame3.call(this, sceneActive);

  if (isMiniGameAutoScrollRaceActive() && miniGameAutoScrollRaceEnable) {
    const satotsu = getSatotsuEvent();
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

    const qPressed = Input.isPressed(Input.keyMapper[81]); // Q
    const dPressed = Input.isPressed(Input.keyMapper[68]); // D
    if(canChangeSpeed && counterEnableChangeSpeed <= 0) {
      // === Gestion de la vitesse ===
      if( qPressed) {
        const current = this.moveSpeed();
        if (current > 1) {
          this.setMoveSpeed(current - 1);
          canChangeSpeed = false;
          setTimeout(() => {
            canChangeSpeed = true;
          }, DELAY_INPUT_SPEED); // Réactive après 1 seconde
        }
      } else if (dPressed) {
        const current = this.moveSpeed();
        if (current < 6) {
          this.setMoveSpeed(current + 1);
          canChangeSpeed = false;
          setTimeout(() => {
            canChangeSpeed = true;
          }, DELAY_INPUT_SPEED); // Réactive après 1 seconde
        }
      }
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


        // === Détection écran tactile ===
        let touchTop = false;
        let touchBottom = false;
        if (TouchInput.isPressed()) {
          const y = TouchInput.y;
          const screenMid = Graphics.height / 2;
          if (y > screenMid) touchBottom = true;
          else touchTop = true;
        }

        playerBlinking=false;

        if (zPressed || touchTop) { // Touche Z
          this.moveDiagonally(6, 8); // Droite-Haut
          lastMove = MOVE_UP;
        } else if (sPressed || touchBottom) { // Touche S
          this.moveDiagonally(6, 2); // Droite-Bas
          lastMove = MOVE_DOWN;
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
    checkMessagesToShow2(this._x);
  }
};

Game_Player.prototype.getEndurance = function() {
  return $gameVariables.value(ENDURANCE_VAR_ID);
};

Game_Player.prototype.setEndurance = function(val) {
  $gameVariables.setValue(ENDURANCE_VAR_ID, Math.max(0, Math.min(MAX_ENDURANCE, val)));
};


Game_Player.prototype.updateEndurancePursuit = function() {
  const speed = this.realMoveSpeed();
  const baseFactor = miniGameAutoScrollRaceConfigs[$gameMap.mapId()].speedValues[speed] || 0;
  let finalFactor = baseFactor;

  // Vérifie l'aspiration
  if (isPlayerInAspirationZone()) {
    if (baseFactor < 0) finalFactor = baseFactor * 0.8;
    else if (baseFactor > 0) finalFactor = baseFactor * 1.2;
  }
  console.log("finalFactor : " + finalFactor);
  const current = this.getEndurance();
  this.setEndurance(current + finalFactor);
};


function isPlayerInAspirationZone() {
  const px = $gamePlayer.x;
  const py = $gamePlayer.y;
  for (let event of $gameMap.events()) {
    const participant = miniGameAutoScrollRaceConfigs.participants[event.event().name];
    if (participant){
      if(event.y == py) {
        console.log(event.x - px + " <= " + ASPIRATION_RANGE);
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

function showCustomAutoMessage2(scene, faceName, faceIndex, text, durationFrames = 240) {
  const spr = scene._customMessageSprite;
  if (!spr) return;


  text = text.replace(/langText\[(.+?)\]/gi, (_, key) => {
    return TextManagerEx.t(key);
  });
  spr.setMessage(faceName, faceIndex, text, durationFrames);
}


function checkMessagesToShow2(playerX) {
  if(miniGameAutoScrollRaceConfigs[$gameMap.mapId()].messagesConfig[playerX] && !miniGameAutoScrollRaceConfigs[$gameMap.mapId()].messagesShown[playerX]) {
    const config = miniGameAutoScrollRaceConfigs[$gameMap.mapId()].messagesConfig[playerX];
    if (!miniGameAutoScrollRaceConfigs[$gameMap.mapId()].messagesShown[playerX]) {
      showCustomAutoMessage2(SceneManager._scene, config.actorName, config.actorIndex, config.text, config.duration);
      miniGameAutoScrollRaceConfigs[$gameMap.mapId()].messagesShown[playerX] = true;
    }
  }
}
