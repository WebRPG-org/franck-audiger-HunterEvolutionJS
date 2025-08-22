const miniGameAutoScrollConfigs = {
  1: {
    messagesShown : {},
    messagesConfig : {
      80 : {
        actorName : "Capitaine", 
        actorIndex : 0, 
        text : "langText[Mer.Evnt.dialogue1]", 
        duration : 300
      },
      75 : {
        actorName : "Capitaine", 
        actorIndex : 6, 
        text : "langText[Mer.Evnt.dialogue2]", 
        duration : 300
      },
      70 : {
        actorName : "Capitaine", 
        actorIndex : 5, 
        text : "langText[Mer.Evnt.dialogue3]", 
        duration : 300
      },
      62 : {
        actorName : "Capitaine", 
        actorIndex : 2, 
        text : "langText[Mer.Evnt.dialogue4]", 
        duration : 300
      },
      53 : {
        actorName : "Capitaine", 
        actorIndex : 2, 
        text : "langText[Mer.Evnt.dialogue5]", 
        duration : 300
      },
      43 : {
        actorName : "Capitaine", 
        actorIndex : 4, 
        text : "langText[Mer.Evnt.dialogue6]", 
        duration : 300
      },
      32 : {
        actorName : "Capitaine", 
        actorIndex : 0, 
        text : "langText[Mer.Evnt.dialogue7]", 
        duration : 300
      },
      22 : {
        actorName : "Capitaine", 
        actorIndex : 2, 
        text : "langText[Mer.Evnt.dialogue8]", 
        duration : 300
      },
      15 : {
        actorName : "Capitaine", 
        actorIndex : 3, 
        text : "langText[Mer.Evnt.dialogue9]", 
        duration : 300
      },
      10 : {
        actorName : "Capitaine", 
        actorIndex : 0, 
        text : "langText[Mer.Evnt.dialogue10]", 
        duration : 300
      }
    }
  } // ID des maps où le plugin est actif
};

let activeWaves = [];
let inactiveWaves = [];

const rockList = [
  // Y de 53 à 43 (tes originaux)
  {x: 13, y: 53},
  {x: 9, y: 48},
  {x: 6, y: 47},
  {x: 17, y: 46},
  {x: 18, y: 44},
  {x: 12, y: 43},
  {x: 13, y: 43},
  {x: 6, y: 43},

  // Y = 42 à 40
  {x: 8, y: 42},
  {x: 2, y: 42},
  {x: 15, y: 41},

  // Y = 39 à 37
  {x: 10, y: 39},
  {x: 6, y: 38},
  {x: 17, y: 38},

  // Y = 36 à 34
  {x: 12, y: 36},
  {x: 9, y: 35},
  {x: 3, y: 35},

  // Y = 33 à 31
  {x: 13, y: 33},
  {x: 6, y: 32},
  {x: 15, y: 31},

  // Y = 30 à 28
  {x: 18, y: 30}, 
  {x: 11, y: 30},
  {x: 4, y: 29}, 
  {x: 8, y: 28},

  // Y = 27 à 25
  {x: 14, y: 27},
  {x: 1, y: 27},
  {x: 6, y: 26},
  {x: 17, y: 25},
  {x: 2, y: 25},

  // Y = 24 à 22
  {x: 9, y: 24},
  {x: 12, y: 23},
  {x: 5, y: 22},

  // Y = 21 à 19
  {x: 7, y: 21},
  {x: 13, y: 20},

  // Y = 18 à 16
  {x: 10, y: 18},
  {x: 6, y: 17},
  {x: 4, y: 17},
  {x: 15, y: 16},

  // Y = 15 à 13
  {x: 18, y: 14},
  {x: 11, y: 14},
  {x: 9, y: 13},
  {x: 6, y: 13},

  // Y = 12 à 10
  {x: 13, y: 12},
  {x: 6, y: 11},
  {x: 17, y: 10},
  {x: 3, y: 10},

  // Y = 9 à 7
  {x: 12, y: 9},
  {x: 8, y: 8},
  {x: 1, y: 8},
  {x: 2, y: 7},

  // Y = 6 à 4
  {x: 14, y: 6},
  {x: 6, y: 5},

  //Edges
  
  {x: 0, y: 0},
  {x: 19, y: 0},
  {x: 0, y: 1},
  {x: 19, y: 1},
  {x: 0, y: 2},
  {x: 19, y: 2},
  {x: 0, y: 3},
  {x: 19, y: 3},
  {x: 0, y: 4},
  {x: 19, y: 4},
  {x: 0, y: 5},
  {x: 19, y: 5},
  {x: 0, y: 6},
  {x: 19, y: 6},
  {x: 0, y: 7},
  {x: 19, y: 7},
  {x: 0, y: 8},
  {x: 19, y: 8},
  {x: 0, y: 9},
  {x: 19, y: 9},
  {x: 0, y: 10},
  {x: 19, y: 10},
  {x: 0, y: 11},
  {x: 19, y: 11},
  {x: 0, y: 12},
  {x: 19, y: 12},
  {x: 0, y: 13},
  {x: 19, y: 13},
  {x: 0, y: 14},
  {x: 19, y: 14},
  {x: 0, y: 15},
  {x: 19, y: 15},
  {x: 0, y: 16},
  {x: 19, y: 16},
  {x: 0, y: 17},
  {x: 19, y: 17},
  {x: 0, y: 18},
  {x: 19, y: 18},
  {x: 0, y: 19},
  {x: 19, y: 19},
  {x: 0, y: 20},
  {x: 19, y: 20},
  {x: 0, y: 21},
  {x: 19, y: 21},
  {x: 0, y: 22},
  {x: 19, y: 22},
  {x: 0, y: 23},
  {x: 19, y: 23},
  {x: 0, y: 24},
  {x: 19, y: 24},
  {x: 0, y: 25},
  {x: 19, y: 25},
  {x: 0, y: 26},
  {x: 19, y: 26},
  {x: 0, y: 27},
  {x: 19, y: 27},
  {x: 0, y: 28},
  {x: 19, y: 28},
  {x: 0, y: 29},
  {x: 19, y: 29},
  {x: 0, y: 30},
  {x: 19, y: 30},
  {x: 0, y: 31},
  {x: 19, y: 31},
  {x: 0, y: 32},
  {x: 19, y: 32},
  {x: 0, y: 33},
  {x: 19, y: 33},
  {x: 0, y: 34},
  {x: 19, y: 34},
  {x: 0, y: 35},
  {x: 19, y: 35},
  {x: 0, y: 36},
  {x: 19, y: 36},
  {x: 0, y: 37},
  {x: 19, y: 37},
  {x: 0, y: 38},
  {x: 19, y: 38},
  {x: 0, y: 39},
  {x: 19, y: 39},
  {x: 0, y: 40},
  {x: 19, y: 40},
  {x: 0, y: 41},
  {x: 19, y: 41},
  {x: 0, y: 42},
  {x: 19, y: 42},
  {x: 0, y: 43},
  {x: 19, y: 43},
  {x: 0, y: 44},
  {x: 19, y: 44},
  {x: 0, y: 45},
  {x: 19, y: 45},
  {x: 0, y: 46},
  {x: 19, y: 46},
  {x: 0, y: 47},
  {x: 19, y: 47},
  {x: 0, y: 48},
  {x: 19, y: 48},
  {x: 0, y: 49},
  {x: 19, y: 49},
  {x: 0, y: 50},
  {x: 19, y: 50},
  {x: 0, y: 51},
  {x: 19, y: 51},
  {x: 0, y: 52},
  {x: 19, y: 52},
  {x: 0, y: 53},
  {x: 19, y: 53}
];

const DEFAULT_WIDTH = 816;
const MESSAGE_HEIGHT = 168;

function Sprite_CustomMessage() {
  Sprite.call(this);
  this._duration = 0;
  this._text = '';
  this._faceName = '';
  this._faceIndex = 0;

  this._container = new Sprite();
  this._container.bitmap = new Bitmap(Graphics.width, MESSAGE_HEIGHT);
  this.addChild(this._container);

  this.visible = false;
}


Sprite_CustomMessage.prototype = Object.create(Sprite.prototype);
Sprite_CustomMessage.prototype.constructor = Sprite_CustomMessage;

Sprite_CustomMessage.prototype.setMessage = function(faceName, faceIndex, text, duration) {
  this._faceName = faceName;
  this._faceIndex = faceIndex;
  this._text = text;
  this._duration = duration;
  this.visible = true;
  this.refresh();
};

Sprite_CustomMessage.prototype.refresh = function() {
  const bmp = this._container.bitmap;
  bmp.clear();

  const padding = 12;
  const faceWidth = 144;
  const faceHeight = 144;
  const height = bmp.height;

  // Calcul du décalage horizontal (centrage map)
  const visibleW = $gameMap.tileWidth() * $gameMap.width();
  const visibleH = $gameMap.tileHeight() * $gameMap.height();

  const w = Math.min(Graphics.boxWidth, visibleW);
  const h = Math.min(Graphics.boxHeight, visibleH);

  let dw = Graphics.boxWidth - w;
  let dh = Graphics.boxHeight - h;
  if (dw < 0) dw = 0;
  if (dh < 0) dh = 0;

  const left = dw / 2;
  const baseX = (w / 2) - (408 - (faceWidth/2));
  
  // === Fond (noir semi-transparent)
  bmp.fillRect(left-1, 0, w+2, height, 'rgba(0, 0, 0, 180)');

  // === Dessin du portrait (face)
  const faceBmp = ImageManager.loadFace(this._faceName);
  const pw = Window_Base._faceWidth;
  const ph = Window_Base._faceHeight;
  const sx = ((this._faceIndex % 4) * pw);
  const sy = Math.floor(this._faceIndex / 4) * ph;
  const faceY = (height - ph) / 2;

  faceBmp.addLoadListener(() => {
    bmp.blt(faceBmp, sx, sy, pw, ph, left + padding + baseX, faceY);
  });

  // === Texte
  const textX = (left + faceWidth + padding * 2) + baseX ;
  const textWidth = w - faceWidth - padding * 3;
  const lineHeight = 28;
  bmp.fontSize = 20;
  bmp.textColor = '#FFFFFF';

  const lines = this._text.split(/\r?\n/);
  const totalHeight = lines.length * lineHeight;
  const startY = Math.max(padding, (height - totalHeight) / 2);

  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;
    bmp.drawText(lines[i], textX, y, textWidth, lineHeight, 'left');
  }
};

Sprite_CustomMessage.prototype.update = function() {
  Sprite.prototype.update.call(this);
  if (this.visible && this._duration > 0) {
    this._duration--;
    if (this._duration <= 0) {
      this.visible = false;
      this._container.bitmap.clear();
    }
  }
};

let timerGameOver = -1;

// === GESTION DES MESSAGES CUSTOM ===
let customMessageTimer = 0;
let customMessageActive = false;


window.showCustomAutoMessage = function(faceName, faceIndex, text, durationFrames = 240) {
  const spr = SceneManager._scene._customMessageSprite;
  if (!spr) return;


  text = text.replace(/langText\[(.+?)\]/gi, (_, key) => {
    return TextManagerEx.t(key);
  });
  spr.setMessage(faceName, faceIndex, text, durationFrames);
}

function checkMessagesToShow(coord, configs) {
  if(configs.messagesConfig[coord] && !configs.messagesShown[coord]) {
    console.log("show message : " + configs.messagesConfig[coord].text);
    showCustomAutoMessage(configs.messagesConfig[coord].actorName, configs.messagesConfig[coord].actorIndex, configs.messagesConfig[coord].text, configs.messagesConfig[coord].duration);
    configs.messagesShown[coord] = true;
  }
}

function isMiniGameAutoScrollActive() {
  if(!$gameMap){
    return false;
  }
  return miniGameAutoScrollConfigs[$gameMap.mapId()];
}

// === Désactivation des contrôles ===
const _Game_Player_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function () {
  if (isMiniGameAutoScrollActive()) return false;
  return _Game_Player_canMove.call(this);
};

const _Game_Temp_setDestination = Game_Temp.prototype.setDestination;
Game_Temp.prototype.setDestination = function(x, y) {
  if (isMiniGameAutoScrollActive()) return;
  _Game_Temp_setDestination.call(this, x, y);
};

// === Initialisation du joueur ===
const _Game_Player_initialize = Game_Player.prototype.initialize;
Game_Player.prototype.initialize = function() {
  _Game_Player_initialize.call(this);
  this._directionBar = 0;
  this._directionOffsetX = 0;
  this._defaultX = this._x;
  this._lastOffsetTileX = this._x;
};

// === Barre directionnelle ===
Game_Player.prototype.updateDirectionBar = function() {
  if (this._directionBar === undefined) this._directionBar = 0;
  if (this._directionOffsetX === undefined) this._directionOffsetX = 0;
  if (this._defaultX === 0) this._defaultX = this._x;
  if (this._lastOffsetTileX === undefined) this._lastOffsetTileX = this._x;

  // === Détection clavier ===
  const rightHeld = Input.isPressed('right');
  const leftHeld = Input.isPressed('left');

  // === Détection écran tactile ===
  let touchRight = false;
  let touchLeft = false;
  if (TouchInput.isPressed()) {
    const x = TouchInput.x;
    const screenMid = Graphics.width / 2;
    if (x > screenMid) touchRight = true;
    else touchLeft = true;
  }

  const moveRight = (rightHeld || touchRight);
  const moveLeft = (leftHeld || touchLeft);

  if (moveRight && !moveLeft) {
    this._directionBar = Math.min(this._directionBar + 2, 150);
  } else if (moveLeft && !moveRight) {
    this._directionBar = Math.max(this._directionBar - 2, -150);
  } else {
    if (this._directionBar > 0) this._directionBar -= 1;
    else if (this._directionBar < 0) this._directionBar += 1;
  }

  this._directionOffsetX += this._directionBar / 150;

  const tileSize = $gameMap.tileWidth();
  const threshold = tileSize / 2;

  while (this._directionOffsetX >= threshold) {
    this._x += 1;
    this._realX = this._x;
    this._directionOffsetX -= tileSize;
  }

  while (this._directionOffsetX <= -threshold) {
    this._x -= 1;
    this._realX = this._x;
    this._directionOffsetX += tileSize;
  }
};

// === Décalage visuel horizontal ===
const _Game_CharacterBase_screenX = Game_CharacterBase.prototype.screenX;
Game_CharacterBase.prototype.screenX = function() {
  const base = _Game_CharacterBase_screenX.call(this);
  if (this === $gamePlayer && isMiniGameAutoScrollActive()) {
    return base + $gamePlayer._directionOffsetX;
  }
  return base;
};

// === Vie du mini-jeu ===
let miniGameLives = 3;
let miniGameHitCooldown = 0;


// === Affichage des cœurs ===
const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
  _Scene_Map_createAllWindows.call(this);
  if (isMiniGameAutoScrollActive()) {
    this.createMiniGameHUD();
  }


};

Scene_Map.prototype.createMiniGameHUD = function() {
  this._miniGameHearts = new Sprite();
  this._miniGameHearts.bitmap = new Bitmap(150, 48);
  
  const visibleW = $gameMap.tileWidth() * $gameMap.width();
  const visibleH = $gameMap.tileHeight() * $gameMap.height();

  const w = Math.min(Graphics.boxWidth, visibleW);
  const h = Math.min(Graphics.boxHeight, visibleH);

  let dw = Graphics.boxWidth - w;
  let dh = Graphics.boxHeight - h;
  if (dw < 0) dw = 0;
  if (dh < 0) dh = 0;

  const left = dw / 2;
  const top = dh / 2;
  this._miniGameHearts.x = left+10;
  this._miniGameHearts.y = top+10;
  this.addChild(this._miniGameHearts);
  this.refreshMiniGameHUD();
};

Scene_Map.prototype.refreshMiniGameHUD = function() {
  if (!this._miniGameHearts) return;
  const bmp = this._miniGameHearts.bitmap;
  bmp.clear();

  for (let i = 0; i < 3; i++) {
    const x = i * 48;
    const iconIndex = i < miniGameLives ? 323 : 324;
    const pw = 32, ph = 32;
    const sx = (iconIndex % 16) * pw;
    const sy = Math.floor(iconIndex / 16) * ph;
    const iconSet = ImageManager.loadSystem('IconSet');
    iconSet.addLoadListener(() => {
      bmp.blt(iconSet, sx, sy, pw, ph, x, 0);
    });
  }
};

Game_Player.prototype.setOpacity = function(value) {
  this._opacity = value;
};
// === Mise à jour du flash d'orage ===
// === Crée tous les éléments visuels (message) ===
const _Scene_Map_createDisplayObjects_Combined = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
  _Scene_Map_createDisplayObjects_Combined.call(this);

  this._customMessageSprite = new Sprite_CustomMessage();
  this._customMessageSprite.y = Graphics.height - MESSAGE_HEIGHT;
  this._customMessageSprite.x = (Graphics.boxWidth - Graphics.width) / 2;
  this.addChild(this._customMessageSprite);
};


// === Mise à jour à chaque frame ===
const _Game_Player_update_MiniGame = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
  _Game_Player_update_MiniGame.call(this, sceneActive);

  if (isMiniGameAutoScrollActive()) {
    this.updateDirectionBar();

    const newActive = [];
    activeWaves.forEach(event => {
      const eventY = event._y;

      if (eventY > $gamePlayer._y - 5) {
        inactiveWaves.push(event);
        return;
      }
      newActive.push(event);
    });
    activeWaves = newActive;

    inactiveWaves = inactiveWaves.filter(event => {
      const isVisible = event._y <= $gamePlayer._y + 30;
      if (!isVisible) {
        const sprite = SceneManager._scene._spriteset._characterSprites.find(s => s._character === event);
        if (sprite) {
          SceneManager._scene._spriteset._tilemap.removeChild(sprite);
        }
        delete $gameMap._events[event._eventId];
        return false;
      }
      return true;
    });

    spawnRandomWaveEvent(this._x, this._y);
    if (miniGameHitCooldown > 0) {
      miniGameHitCooldown--;
    }
    if (miniGameHitCooldown > 0) {
      this.setOpacity((Graphics.frameCount % 8 < 4) ? 100 : 255);
    } else {
      this.setOpacity(255);
    }

    const hittingRock = rockList.some(rock => rock.x === this._x && rock.y === this._y);
    if (hittingRock && miniGameHitCooldown === 0 && miniGameLives > 0) {
      miniGameLives--;
      miniGameHitCooldown = 120;
      SoundManager.playActorDamage();
      const scene = SceneManager._scene;
      if (scene.refreshMiniGameHUD) scene.refreshMiniGameHUD();
    }

    const tileW = $gameMap.tileWidth();
    const tileH = $gameMap.tileHeight();
    const playerOffsetY = 0.3;

    const playerRealX = $gamePlayer._x + $gamePlayer._directionOffsetX / tileW;
    const playerPixelX = playerRealX * tileW + tileW / 2;
    const playerPixelY = ($gamePlayer._realY + playerOffsetY) * tileH + tileH / 2;

    const hitboxHalfWidth = tileW * 0.4;
    const hitboxHalfHeight = tileH * 0.3;

    const hittingWave = inactiveWaves.some(wave => {
      const wavePixelX = wave._x * tileW + tileW / 2;
      const wavePixelY = wave._realY * tileH + tileH / 2;

      const dx = Math.abs(wavePixelX - playerPixelX);
      const dy = Math.abs(wavePixelY - playerPixelY);
      return dx < hitboxHalfWidth && dy < hitboxHalfHeight;
    });

    if (hittingWave && miniGameHitCooldown === 0 && miniGameLives > 0) {
      miniGameLives--;
      miniGameHitCooldown = 120;
      AudioManager.playSe({name:'water-splash-Fail', pan:0, pitch:100, volume:90});
      const scene = SceneManager._scene;
      if (scene.refreshMiniGameHUD) scene.refreshMiniGameHUD();
    }

    if(timerGameOver === 0){
      timerGameOver = -1
      // Transition propre
      SceneManager._scene.fadeOutAll();

      // Stop audio
      AudioManager.stopBgm();
      AudioManager.stopBgs();
      AudioManager.stopMe();
      AudioManager.stopSe();

      // Réinitialise la partie comme un vrai "Game Over"
      DataManager.setupNewGame();
      miniGameLives = 3;
      miniGameHitCooldown = 0;
      miniGameAutoScrollConfigs[$gameMap.mapId()].messagesShown = {};
      activeWaves = [];
      inactiveWaves = [];
      SceneManager.goto(Scene_Gameover);
      
    } else if(timerGameOver > 0){
      timerGameOver -= 1;
    }

    if (miniGameLives === 0 && timerGameOver < 0) {
      timerGameOver = 60;
    }

    checkMessagesToShow(this._y, miniGameAutoScrollConfigs[$gameMap.mapId()]);
  }

  Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
  };
};

const _Scene_Map_updateCallMenu = Scene_Map.prototype.updateCallMenu;
Scene_Map.prototype.updateCallMenu = function() {
  if (isMiniGameAutoScrollActive()) return;
  _Scene_Map_updateCallMenu.call(this);
};


function spawnRandomWaveEvent(playerX, playerY) {
  if(playerY > 60) return;

  const mapId = $gameMap.mapId();
  const eventNames = ["Wave1", "Wave2", "Wave3", "Wave4"];
  const chosenName = eventNames[Math.floor(Math.random() * eventNames.length)];

  const modelEvent = $dataMap.events.find(e => e && e.name === chosenName);
  if (!modelEvent) {
    console.error("Modèle d'événement non trouvé :", chosenName);
    return;
  }

  const xMin = Math.max(1, playerX - 5);
  const xMax = Math.min(18, playerX + 5);
  const possibleX = [];

  for (let x = xMin; x <= xMax; x++) {
    const blocked = activeWaves.some(e => e._x === x && e._y <= playerY + 5);
    if (!blocked) possibleX.push(x);
  }

  if (possibleX.length === 0) return;

  const finalX = possibleX[Math.floor(Math.random() * possibleX.length)];
  const finalY = playerY - 20;

  const newEvent = JSON.parse(JSON.stringify(modelEvent));
  const newEventId = $dataMap.events.length;

  newEvent.x = finalX;
  newEvent.y = finalY;

  $dataMap.events[newEventId] = newEvent;
  const gameEvent = new Game_Event(mapId, newEventId);
  gameEvent._x = finalX;
  gameEvent._y = finalY;
  $gameMap._events[newEventId] = gameEvent;

  activeWaves.push(gameEvent);

  const scene = SceneManager._scene;
  if (scene && scene._spriteset && scene._spriteset._characterSprites) {
    const sprite = new Sprite_Character(gameEvent);
    scene._spriteset._tilemap.addChild(sprite);
    scene._spriteset._characterSprites.push(sprite);
  }
}