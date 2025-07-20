/*:
 * @plugindesc QTE Plugin with Revised Timing Logic - Waiting/Inputting Cycle - v3.0
 * @author RPG Maker AI
 *
 * @param Success Switch ID
 * @type switch
 * @desc Switch to activate on QTE success
 * 
 * @param Active Overlay
 * @type boolean
 * @desc Whether to show the overlay during QTE
 * @default false
 */

(function() {
  const difficulties = {
    0 : {
      fullOpacity : 50,
      fadeOutStart : 150,
      fadeOutDuration : 100,
      minimumWaitInterval : 100,
      randomWaitInterval : 50,
    },
    1 : {
      fullOpacity : 50,
      fadeOutStart : 100,
      fadeOutDuration : 75,
      minimumWaitInterval : 50,
      randomWaitInterval : 100,
    },
    2 : {
      fullOpacity : 50,
      fadeOutStart : 75,
      fadeOutDuration : 50,
      minimumWaitInterval : 50,
      randomWaitInterval : 100,
    },
    3 : {
      fullOpacity : 50,
      fadeOutStart : 50,
      fadeOutDuration : 50,
      minimumWaitInterval : 20,
      randomWaitInterval : 50,
    }
  }

  const QTE_WINDOW_WIDTH = 340;
  const QTE_WINDOW_HEIGHT = 80;

  let useTouchMode = false;


  const parameters = PluginManager.parameters("QTE_LakeMaster");
  const successSwitch = Number(parameters['Success Switch ID'] || 10);

  const activeOverlay = parameters['Active Overlay']==='true' || false;

  function Sprite_QTEButton(letter, difficulty, yMin, yMax, xMin, xMax) {
    this._yMin = yMin;
    this._yMax = yMax;
    this._xMin = xMin;
    this._xMax = xMax;
    this.initialize(letter, difficulty);
  }

  Sprite_QTEButton.prototype = Object.create(Sprite.prototype);
  Sprite_QTEButton.prototype.constructor = Sprite_QTEButton;

  Sprite_QTEButton.prototype.initialize = function(letter, difficulty) {
    Sprite.prototype.initialize.call(this);
    this._letter = letter;
    this._difficulty = difficulty || 0;
    this.bitmap = ImageManager.loadSystem("Button");
    this._textSprite = new Sprite(new Bitmap(50, 50));
    this._textSprite.bitmap.fontSize = 36;
    this._textSprite.bitmap.textColor = "#ffffff";
    this._textSprite.bitmap.drawText(this._letter.toUpperCase(), 0, 0, 50, 50, 'center');
    this._textSprite.anchor.x = 0.0;
    this._textSprite.anchor.y = 0.0;
    this._textSprite.x = (this._letter === '↑' || this._letter === '↓') ? 5 : 0;
    this._textSprite.y = 0;
    if (!useTouchMode) this.addChild(this._textSprite);
    this.anchor.x = 0.0;
    this.anchor.y = 0.0;
    this.opacity = 0;
    
    const visibleW = $gameMap.tileWidth() * $gameMap.width();
    const visibleH = $gameMap.tileHeight() * $gameMap.height();

    const w = Math.min(Graphics.boxWidth, visibleW);
    const h = Math.min(Graphics.boxHeight, visibleH);
    let dw = Graphics.boxWidth - w;
    let dh = Graphics.boxHeight - h;
    if (dw < 0) dw = 0;
    if (dh < 0) dh = 0;

    const left = dw/2 + this._xMin * $gameMap.tileWidth();
    const top = dh/2 + this._yMin * $gameMap.tileHeight();
    const width = (this._xMax*$gameMap.tileWidth() - this._xMin*$gameMap.tileWidth());
    const height = (this._yMax*$gameMap.tileHeight() - this._yMin*$gameMap.tileHeight());
    const right = left + width;
    const bottom = top + height;

    this.x = left + Math.random() * (right - left)
    this.y = top + Math.random() * (bottom - top)
    this._life = 0;
  };

  Sprite_QTEButton.prototype.update = function() {
    if (useTouchMode) {
      this.removeChild(this._textSprite);
    } else {
      this.addChild(this._textSprite);
    }
    if (this._life < difficulties[this._difficulty].fullOpacity) {
      this.opacity = Math.min(255, this._life * (255 / difficulties[this._difficulty].fullOpacity));
    } else if (this._life >= difficulties[this._difficulty].fullOpacity && this._life <= difficulties[this._difficulty].fadeOutStart) {
      this.opacity = 255;
    } else if (this._life > difficulties[this._difficulty].fadeOutStart) {
      this.opacity = Math.max(0, 255 - ((this._life - difficulties[this._difficulty].fadeOutStart) * (255 / difficulties[this._difficulty].fadeOutDuration)));
    }
    this._life++;
    Sprite.prototype.update.call(this);
  };

  Sprite_QTEButton.prototype.isFinished = function() {
    return this._life > difficulties[this._difficulty].fadeOutStart && this.opacity <= 0;
  }

  class QTE_Window extends Window_Base {
    
    constructor(x, y, yMin, yMax, xMin, xMax, difficulty) {

      const visibleW = $gameMap.tileWidth() * $gameMap.width();
      const visibleH = $gameMap.tileHeight() * $gameMap.height();

      const w = Math.min(Graphics.boxWidth, visibleW);
      const h = Math.min(Graphics.boxHeight, visibleH);
      let dw = Graphics.boxWidth - w;
      let dh = Graphics.boxHeight - h;
      if (dw < 0) dw = 0;
      if (dh < 0) dh = 0;
      const left = dw/2 + x * $gameMap.tileWidth();
      const top = dh/2 + y * $gameMap.tileHeight();
      super();
      super.initialize(left, top, QTE_WINDOW_WIDTH, QTE_WINDOW_HEIGHT);
      this.deactivate();
      this.openness = 0;
      this._yMin = yMin;
      this._yMax = yMax;
      this._xMin = xMin;
      this._xMax = xMax;
      this._difficulty = difficulty || 0;
    }

    resetState() {
      this._successes = this._successes || 0;
      this._failures = this._failures || 0;
      this._phase = 'waiting';
      this._timer = this._nextWait();
      this._spriteQTE = null;
      this._currentLetter = '...';
      const scene = SceneManager._scene;
      if (this._overlaySprite) {
        scene.removeChild(this._overlaySprite);
        this._overlaySprite = null;
      }
      this._overlaySprite = Sprite_QTEOverlay(this._xMin, this._xMax, this._yMin, this._yMax);
      //if (scene) scene.addChild(this._overlaySprite);
      if (scene && this._active && activeOverlay) scene.addChild(this._overlaySprite);
    }

    _nextWait() {
      return difficulties[this._difficulty].minimumWaitInterval + Math.floor(Math.random() * difficulties[this._difficulty].randomWaitInterval);
    }

    update() {
      super.update();
      if (!this._active) return;

      if (this._phase === 'waiting') {
        this._timer--;
        if (this._timer <= 0) this._startInput();
      } else if (this._phase === 'inputting') {
        if (this._spriteQTE) {
          if (!useTouchMode) {
            if(Input._dir8 === this._translateKey(this._spriteQTE._letter)){
              this._handleSuccess();
            } else if(Input._dir8 != 0){
              this._handleFail();
            }
          } else if (TouchInput.isTriggered()) {
            const tx = TouchInput.x;
            const ty = TouchInput.y;
            if (tx >= this._spriteQTE.x && tx <= this._spriteQTE.x + this._spriteQTE.width &&
                ty >= this._spriteQTE.y && ty <= this._spriteQTE.y + this._spriteQTE.height) {
              if (SceneManager._scene && SceneManager._scene._qteWindow) {
                SceneManager._scene._qteWindow._handleSuccess();
              }
            } else {
              if (SceneManager._scene && SceneManager._scene._qteWindow) {
                SceneManager._scene._qteWindow._handleFail();
              } 
            }
          } 
        }
      }
      if(this._spriteQTE){
        this._spriteQTE.update();
        if (this._spriteQTE.isFinished()) this._handleFail();
      }
      this.refresh();
    }

    onInput(letter) {
      if (this._phase !== 'inputting') return;
      if (letter === this._currentLetter) {
        
      } else {
      }
    }

    _translateKey(key) {
      switch(key){
        case '↑' : return 8;
        case '→' : return 6;
        case '←' : return 4;
        case '↓' : return 2;
      }
    }

    _startInput() {
      this._phase = 'inputting';
      const all = '↑↓→←'.split('');
      const letter = all[Math.floor(Math.random() * all.length)];
      this._currentLetter = letter;
      this._timer = 200 + Math.floor(Math.random() * 100);
      const scene = SceneManager._scene;
      this._spriteQTE = new Sprite_QTEButton(letter, this._difficulty, this._yMin, this._yMax, this._xMin, this._xMax);
      scene.addChild(this._spriteQTE);
    }

    _handleSuccess() {
      this._successes++;
      AudioManager.playSe({ name: 'Up1', pan: 0, pitch: 100, volume: 90 });
      this._removeSprite();
      this._phase = 'waiting';
      this._timer = this._nextWait();
      if (this._successes >= 5) {
        $gameSwitches.setValue(successSwitch, true);
        this._active = false;
        if (this._overlaySprite) {
          const scene = SceneManager._scene;
          scene.removeChild(this._overlaySprite);
          scene.removeChild(this);
          this._overlaySprite = null;
        }
        this._successes = 0;
        this._failures = 0;
        this.close();
      }
    }

    _handleFail() {
      this._removeSprite();
      this._failures++;
      AudioManager.playSe({name:'water-splash-Fail', pan:0, pitch:100, volume:90});
      this._successes = 0;
      if (this._failures >= 3) {
        this._active = false;
        if (this._overlaySprite) {
          const scene = SceneManager._scene;
          scene.removeChild(this._overlaySprite);
          scene.removeChild(this);
          this._overlaySprite = null;
        }
        this._successes = 0;
        this._failures = 0;
        setTimeout(() => SceneManager.goto(Scene_Gameover), 1000);
      } else {
        this._phase = 'waiting';
        this._timer = this._nextWait();
      }
    }

    _removeSprite() {
      if (this._spriteQTE && this._spriteQTE.parent) this._spriteQTE.parent.removeChild(this._spriteQTE);
      this._spriteQTE = null;
      this._currentLetter = '...';
    }

    refresh() {
      this.contents.clear();
      this._drawProgressBoxes();
    }

    _drawProgressBoxes() {
      const total = 8, boxW = 30, sp = 5, xo = 10;
      for (let i = 0; i < total; i++) {
        const x = xo + i * (boxW + sp);
        let col = '#444444';
        if (i < 3 && this._failures > (2 - i)) col = '#ff0000';
        if (i >= 3 && (i - 3) < this._successes) col = '#00ff00';
        this.contents.fillRect(x, 30, boxW, 10, col);
      }
    }
  }

  const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
  Scene_Map.prototype.createAllWindows = function() {
    _Scene_Map_createAllWindows.call(this);
  };

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
  };

  Scene_Map.prototype.startQTE = function(difficulty, yMin, yMax, xMin, xMax, x, y) { 
    this._qteWindow = new QTE_Window(x, y, yMin, yMax, xMin, xMax, difficulty);
    const scene = SceneManager._scene;
    scene.addChild(this._qteWindow);
    this._qteWindow._active = false;
    this._qteWindow.close();
    this._qteWindow._active = true;
    this._qteWindow.resetState();
    this._qteWindow.open();
    this._qteWindow.activate();
  };

  const _TouchInput_onTouchEnd = TouchInput._onTouchEnd;
  TouchInput._onTouchEnd = function(event) {
    _TouchInput_onTouchEnd.call(this, event);
    useTouchMode = true;
  };

  const _TouchInput_onLeftButtonDown = TouchInput._onLeftButtonDown;
  TouchInput._onLeftButtonDown = function(event) {
    _TouchInput_onLeftButtonDown.call(this, event);
    useTouchMode = true;
  };

  const _Input_onKeyDown = Input._onKeyDown;
  Input._onKeyDown = function(event) {
    _Input_onKeyDown.call(this, event);
    useTouchMode = false;
  };
  
  const _Graphics_onKeyDown = Graphics._onKeyDown;
  Graphics._onKeyDown = function(event) {
    _Graphics_onKeyDown.call(this, event);
    useTouchMode = false;
  };

  window.startQTE = function(difficulty) {
    if (SceneManager._scene instanceof Scene_Map && SceneManager._scene._qteWindow) {
      SceneManager._scene.startQTE(difficulty, yMin, yMax, xMin, xMax);
    }
  };
  
  const alias_canMove2 = Game_Player.prototype.canMove;
  Game_Player.prototype.canMove = function() {
    if (SceneManager._scene && SceneManager._scene._qteWindow && SceneManager._scene._qteWindow._active) return false;
    return alias_canMove2.call(this);
  };

  function Sprite_QTEOverlay(xMin, xMax, yMin, yMax) {
    const visibleW = $gameMap.tileWidth() * $gameMap.width();
    const visibleH = $gameMap.tileHeight() * $gameMap.height();

    const w = Math.min(Graphics.boxWidth, visibleW);
    const h = Math.min(Graphics.boxHeight, visibleH);
    let dw = Graphics.boxWidth - w;
    let dh = Graphics.boxHeight - h;
    if (dw < 0) dw = 0;
    if (dh < 0) dh = 0;

    const left = dw/2 + xMin * $gameMap.tileWidth();
    const top = dh/2 + yMin * $gameMap.tileHeight();
    const width = (xMax*$gameMap.tileWidth() - xMin*$gameMap.tileWidth())+$gameMap.tileWidth();
    const height = (yMax*$gameMap.tileHeight() - yMin*$gameMap.tileHeight())+$gameMap.tileWidth();

    const sprite = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
    const bitmap = sprite.bitmap;

    bitmap.fillRect(left, top, width, height, 'rgba(255, 0, 0, 0.3)');

    sprite.anchor.x = 0;
    sprite.anchor.y = 0;
    sprite.x = 0;
    sprite.y = 0;

    return sprite;
  }
    
})();
