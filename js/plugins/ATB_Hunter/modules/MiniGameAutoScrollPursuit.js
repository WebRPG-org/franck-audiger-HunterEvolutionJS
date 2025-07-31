const miniGameAutoScrollPursuitConfigs = {
  35: {
    jump : false,
    messagesShown : {},
    messagesConfig : {
      160 : {
        actorName : "Kurapika", 
        actorIndex : 0, 
        text : "langText[FôretCèdre-RunForet1.Envt.dialogue1]", 
        duration : 300
      },
      140 : {
        actorName : "Faces-Gon", 
        actorIndex : 3, 
        text : "langText[FôretCèdre-RunForet1.Envt.dialogue2]", 
        duration : 300
      },
      125 : {
        actorName : "RatonRenard", 
        actorIndex : 0, 
        text : "langText[FôretCèdre-RunForet1.Envt.dialogue3]", 
        duration : 300
      },
      90 : {
        actorName : "Faces-Gon", 
        actorIndex : 6, 
        text : "langText[FôretCèdre-RunForet1.Envt.dialogue4]", 
        duration : 300
      },
      70 : {
        actorName : "Kurapika", 
        actorIndex : 0, 
        text : "langText[FôretCèdre-RunForet1.Envt.dialogue5]", 
        duration : 300
      },
      45 : {
        actorName : "Faces-Gon", 
        actorIndex : 7, 
        text : "langText[FôretCèdre-RunForet1.Envt.dialogue6]", 
        duration : 300
      }
    }
  },
  85: {
    jump : true,
    canJump : false,
    messagesShown : {},
    messagesConfig : {
      50 : {
        actorName : "Faces-Gon", 
        actorIndex : 4, 
        text : "langText[FôretCèdre-Falaise.Envt.dialogue1]", 
        duration : 300
      }
    }
  } 
};

let miniGameLives2 = 3;

function isMiniGameAutoScrollPursuitActive() {
  if(!$gameMap){
    return false;
  }
  return miniGameAutoScrollPursuitConfigs[$gameMap.mapId()];
}

let miniGameAutoScrollPursuitEnable = true;

window.disableMiniGameAutoScrollPursuit = function() {
  miniGameAutoScrollPursuitEnable = false;  
}

window.enableMiniGameAutoScrollPursuit = function() {
  miniGameAutoScrollPursuitEnable = true;  
};

window.decreaseLive = function() {
  miniGameLives2 -= 1;
}
window.resetLive = function() {
  miniGameLives2 = 3;
}
window.setCanJump = function() {
  miniGameAutoScrollPursuitConfigs[$gameMap.mapId()].canJump= true;
}

window.resetMessageToShow = function() {
  if (miniGameAutoScrollPursuitConfigs[$gameMap.mapId()]) {
    miniGameAutoScrollPursuitConfigs[$gameMap.mapId()].messagesShown = {};
  }
  SceneManager._scene.refreshMiniGameHUD2();
}

const _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
Game_Player.prototype.moveByInput = function() {
  if (isMiniGameAutoScrollPursuitActive() && miniGameAutoScrollPursuitEnable) {
    // Bloque les contrôles standards pendant le mini-jeu
    return;
  }
  _Game_Player_moveByInput.call(this);
};

const _Game_Player_isDashing = Game_Player.prototype.isDashing;
Game_Player.prototype.isDashing = function() {
  if (isMiniGameAutoScrollPursuitActive() && miniGameAutoScrollPursuitEnable) {
    return false; // Interdit la course
  }
  return _Game_Player_isDashing.call(this);
};

// === Mise à jour à chaque frame ===
const _Game_Player_update_MiniGame2 = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
  _Game_Player_update_MiniGame2.call(this, sceneActive);

  if (isMiniGameAutoScrollPursuitActive() && miniGameAutoScrollPursuitEnable) {

    if (this.canMove() && !this.isMoving()) {
      let jumping = false;
      let canJump = false;
      if (miniGameAutoScrollPursuitConfigs[$gameMap.mapId()]) {
        jumping = miniGameAutoScrollPursuitConfigs[$gameMap.mapId()].jump
        canJump = miniGameAutoScrollPursuitConfigs[$gameMap.mapId()].canJump;
      }
      // === Détection écran tactile ===
      let touchRight = false;
      let touchLeft = false;
      if (TouchInput.isPressed()) {
        const x = TouchInput.x;
        const screenMid = Graphics.width / 2;
        if (x > screenMid) touchRight = true;
        else touchLeft = true;
      }

      if (Input.isPressed(Input.keyMapper[81]) || touchLeft) { // Touche Q
        if (jumping && canJump) {
          this.jump(-2, -2);
          miniGameAutoScrollPursuitConfigs[$gameMap.mapId()].canJump= false; // Désactive le saut après utilisation
        } else if (!jumping) {
          this.moveDiagonally(4, 8);
        }
      } else if (Input.isPressed(Input.keyMapper[68]) || touchRight) { // Touche D
        if (jumping && canJump) {
          this.jump(2, -2);
          miniGameAutoScrollPursuitConfigs[$gameMap.mapId()].canJump= false; // Désactive le saut après utilisation
        } else if (!jumping) {
          this.moveDiagonally(6, 8);
        }
      } else {
        if (jumping && canJump) {
          this.jump(0, -2);
          miniGameAutoScrollPursuitConfigs[$gameMap.mapId()].canJump= false; // Désactive le saut après utilisation
        } else if (!jumping) {
          this.moveStraight(8);
        }
      }
    }
    checkMessagesToShow(this._y, miniGameAutoScrollPursuitConfigs[$gameMap.mapId()]);
  }
};

// === Affichage des cœurs ===
const _Scene_Map_createAllWindows2 = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
  _Scene_Map_createAllWindows2.call(this);
  if (isMiniGameAutoScrollPursuitActive()) {
    this.createMiniGameHUD2();
  }
};


Scene_Map.prototype.createMiniGameHUD2 = function() {
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
  this.refreshMiniGameHUD2();
};

Scene_Map.prototype.refreshMiniGameHUD2 = function() {
  if (!this._miniGameHearts) return;
  const bmp = this._miniGameHearts.bitmap;
  bmp.clear();

  for (let i = 0; i < 3; i++) {
    const x = i * 48;
    const iconIndex = i < miniGameLives2 ? 323 : 324;
    const pw = 32, ph = 32;
    const sx = (iconIndex % 16) * pw;
    const sy = Math.floor(iconIndex / 16) * ph;
    const iconSet = ImageManager.loadSystem('IconSet');
    iconSet.addLoadListener(() => {
      bmp.blt(iconSet, sx, sy, pw, ph, x, 0);
    });
  }
};