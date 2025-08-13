
const fogConfigs = {
  1: { name: "Rain1", speedX: 0.2, speedY: -0.8, opacity: 160, restrictedVision: false, restrictedVisionOpacity: 0.93, visionRadius: 150, lightningActivated: true },
  13: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 160, restrictedVision: true, restrictedVisionOpacity: 0.93, visionRadius: 150, lightningActivated: false },
  18: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 230, restrictedVision: true, restrictedVisionOpacity: 0.96, visionRadius: 110, lightningActivated: false },
  19: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 300, restrictedVision: true, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false },
  24: { name: "Fog1", speedX: 1.2, speedY: -0.8, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: true },
  33: { name: null, speedX: 0.7, speedY: -0.8, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  34: { name: null, speedX: 0.7, speedY: -0.8, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 170 },
  35: { name: "Fog1", speedX: 0.7, speedY: -1.8, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  36: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  37: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  38: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  39: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  40: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  41: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  42: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  43: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  44: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  45: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  46: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  47: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  48: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  49: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  50: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  51: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  52: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  53: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  54: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  55: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  56: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  57: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  58: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  59: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  60: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  61: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  62: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  63: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  64: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  65: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  66: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  67: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  68: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  69: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  70: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  71: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  72: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  73: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  74: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  75: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  76: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  77: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  78: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  79: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  80: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  81: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  82: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  83: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  85: { name: "Fog1", speedX: 0.7, speedY: -0.8, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  87: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  88: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: true, nightOpacity: 190 },
  120: { name: "Fog1", speedX: 0.7, speedY: 0.7, opacity: 300, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: false, nightOpacity: 190 },
  122: { name: "Fog1", speedX: 0.7, speedY: 0.7, opacity: 300, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false, nightOverlay: false, nightOpacity: 190 },
};

let hiddingFog = false;

let lastDisplayX = 0; // Variable pour suivre la dernière position d'affichage
let counterDelayThunder = -1;

// === FLASH ORAGE — Variables globales ===
let lightningFlashFrame = Graphics.frameCount + Math.floor(Math.random() * 1200) + 600;
let flashDuration = 0;
let enable = true;

function scheduleNextFlash() {
  const interval = Math.floor(Math.random() * 1200) + 600; 
  lightningFlashFrame = Graphics.frameCount + interval;
}

function instantFlash() {
  lightningFlashFrame = Graphics.frameCount + 1; // Force le flash instantanément
}

window.hideFog = function() {
  hiddingFog = true;
}

window.showFog = function() {
  hiddingFog = false;
}

window.instantFlash = instantFlash; // Rendre la fonction accessible globalement

window.switchWeather = function() {
   enable = !enable;
}

function createFogOverlay() {
  const config = fogConfigs[$gameMap.mapId()];
  if (!config) return;

  const bounds = getVisibleMapBounds();

  // === Overlay nuit
  if (config.nightOverlay) {
    console.log("Création de l'overlay nuit");
    const bitmap = new Bitmap(bounds.width, bounds.height);
    bitmap.fillAll('black');
    const sprite = new Sprite(bitmap);
    sprite.opacity = config.nightOpacity;
    sprite.x = bounds.x;
    sprite.y = bounds.y;
    this._nightOverlay = sprite;
    this._spriteset.addChild(this._nightOverlay);
  } else if (this._nightOverlay) {
    console.log("Suppression de l'overlay nuit");
    this._spriteset.removeChild(this._nightOverlay);
    this._nightOverlay = null;
  }

  // === Fog animé
  if (config.name) {
    const bitmap = ImageManager.loadPicture(config.name);
    this._fogOverlay = new TilingSprite(bitmap);
    const fogBounds = this instanceof Scene_Battle
      ? { x: 0, y: 0, width: Graphics.boxWidth, height: Graphics.boxHeight }
      : bounds;

    this._fogOverlay.move(fogBounds.x, fogBounds.y, fogBounds.width, fogBounds.height);
    this._fogOverlay.opacity = config.opacity || 128;
    this._fogOverlay.fogSpeedX = config.speedX || 0;
    this._fogOverlay.fogSpeedY = config.speedY || 0;
    this._spriteset.addChild(this._fogOverlay);
  } else if (this._fogOverlay) {
    this._spriteset.removeChild(this._fogOverlay);
    this._fogOverlay = null;
  }
}

function createVisionOverlay() {
  const config = fogConfigs[$gameMap.mapId()];
  if (!config || !config.restrictedVision) return;

  const width = Graphics.width;
  const height = Graphics.height;

  this._visionBitmap = new Bitmap(width, height);
  this._visionOverlay = new Sprite(this._visionBitmap);
  this._spriteset.addChild(this._visionOverlay);
}

function updateFogOverlay() {
  const config = fogConfigs[$gameMap.mapId()];
  if (!config) return;

  const isBattle = SceneManager._scene instanceof Scene_Battle;
  const bounds = isBattle
    ? { x: 0, y: 0, width: Graphics.boxWidth, height: Graphics.boxHeight }
    : getVisibleMapBounds();

  // === Fog
  if (this._fogOverlay) {
    this._fogOverlay.visible = enable && !hiddingFog;
    this._fogOverlay.move(bounds.x, bounds.y, bounds.width, bounds.height);

    if (enable && config.name) {
      this._fogOverlay.origin.x += this._fogOverlay.fogSpeedX + (($gameMap._displayX - lastDisplayX) * 50);
      this._fogOverlay.origin.y += this._fogOverlay.fogSpeedY;
    }
  }

  // === Overlay nuit
  if (this._nightOverlay) {
    this._nightOverlay.visible = enable && !hiddingFog;
    this._nightOverlay.move(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  // === Flash
  if (this._lightningFlash) {
    this._lightningFlash.visible = enable && !hiddingFog;
    this._lightningFlash.move(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  lastDisplayX = $gameMap._displayX;
}

function updateVisionOverlay() {
  const config = fogConfigs[$gameMap.mapId()];
  if (!this._visionOverlay) return;

  this._visionOverlay.visible = enable && config && config.restrictedVision && !hiddingFog;

  if (!enable || !config || !config.restrictedVision) return;

  const bitmap = this._visionBitmap;
  bitmap.clear();

  let px, py;
  if (this instanceof Scene_Battle) {
    px = Graphics.width / 2;
    py = Graphics.height / 2;
  } else {
    px = $gamePlayer.screenX();
    py = $gamePlayer.screenY() - 16;
  }

  const radius = config.visionRadius || 30;
  const gradientRadius = radius + 90;

  const ctx = bitmap._context;
  const grad = ctx.createRadialGradient(px, py, radius, px, py, gradientRadius);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(0, 0, 0, ' + config.restrictedVisionOpacity + ')');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, bitmap.width, bitmap.height);
  bitmap._setDirty();
}

// === MAP SETUP ===
const _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;

Scene_Map.prototype.createDisplayObjects = function() {
  _Scene_Map_createDisplayObjects.call(this);
  
  this.createFogOverlay();
  this.createVisionOverlay();

  const bounds = getVisibleMapBounds();

  // Flash d'orage
  const flashBitmap = new Bitmap(bounds.width, bounds.height);
  flashBitmap.fillAll('white');
  const flashSprite = new Sprite(flashBitmap);
  flashSprite.opacity = 0;
  flashSprite.x = bounds.x;
  flashSprite.y = bounds.y;
  this._lightningFlash = flashSprite;
  this._spriteset.addChild(this._lightningFlash);
};

Scene_Map.prototype.updateLightningFlash = function() {
  if (!enable) {
    if (this._lightningFlash) this._lightningFlash.opacity = 0;
    return;
  }
  if(!$gameMap){
    return;
  }
  if(!fogConfigs[$gameMap.mapId()]) return;
  if(fogConfigs[$gameMap.mapId()].lightningActivated){
    if(counterDelayThunder >= 0) 
      counterDelayThunder--;

    if(counterDelayThunder == 0){
      AudioManager.playSe({ name: 'Thunder9', volume: 90, pitch: 100, pan: 0 });
    }

    if (Graphics.frameCount >= lightningFlashFrame) {
      this._lightningFlash.opacity = 255;
      flashDuration = 10;
      counterDelayThunder = Math.floor(Math.random() * 120);
      scheduleNextFlash();
    }

    if (flashDuration > 0) {
      flashDuration--;
      if (flashDuration === 0) {
        this._lightningFlash.opacity = 0;
      }
    }
  }
}

// === Met à jour tous les effets visuels (fog + vision + flash) ===
const _Scene_Map_update_Combined = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
  _Scene_Map_update_Combined.call(this);
  if(enable) {
    this.updateFogOverlay();
    this.updateVisionOverlay();
    this.updateLightningFlash();
  }
};


// === BATTLE SETUP ===
const _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
Scene_Battle.prototype.createDisplayObjects = function() {
  _Scene_Battle_createDisplayObjects.call(this);
  this.createFogOverlay();
  this.createVisionOverlay();
};

const _Scene_Battle_update = Scene_Battle.prototype.update;
Scene_Battle.prototype.update = function() {
  _Scene_Battle_update.call(this);
  this.updateFogOverlay();
};

Scene_Map.prototype.createFogOverlay = createFogOverlay;
Scene_Map.prototype.createVisionOverlay = createVisionOverlay;
Scene_Map.prototype.updateFogOverlay = updateFogOverlay;
Scene_Map.prototype.updateVisionOverlay = updateVisionOverlay;

Scene_Battle.prototype.createFogOverlay = createFogOverlay;
Scene_Battle.prototype.createVisionOverlay = createVisionOverlay;
Scene_Battle.prototype.updateFogOverlay = updateFogOverlay;
Scene_Battle.prototype.updateVisionOverlay = updateVisionOverlay;

function getVisibleMapBounds() {
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
  return { x: left, y: top, width: w, height: h };
}
/*
function resizeFogOverlays(scene) {
  const bounds = getVisibleMapBounds();

  if (scene._fogOverlay) {
    z._fogOverlay.move(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  if (scene._visionOverlay && scene._visionBitmap) {
    scene._visionOverlay.x = bounds.x;
    scene._visionOverlay.y = bounds.y;
    scene._visionBitmap.resize(bounds.width, bounds.height);
  }

  if (scene._nightOverlay) {
    scene._nightOverlay.x = bounds.x;
    scene._nightOverlay.y = bounds.y;
    scene._nightOverlay.bitmap.resize(bounds.width, bounds.height);
  }

  if (scene._lightningFlash) {
    scene._lightningFlash.x = bounds.x;
    scene._lightningFlash.y = bounds.y;
    scene._lightningFlash.bitmap.resize(bounds.width, bounds.height);
  }
}

const _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
  _Scene_Map_start.call(this);
  resizeFogOverlays(this);
};

const _Scene_Battle_start = Scene_Battle.prototype.start;
Scene_Battle.prototype.start = function() {
  _Scene_Battle_start.call(this);
  resizeFogOverlays(this);
};*/