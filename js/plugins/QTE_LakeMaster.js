/*:
 * @plugindesc QTE Plugin with Revised Timing Logic - Waiting/Inputting Cycle - v3.0
 * @author RPG Maker AI
 *
 * @param Success Switch ID
 * @type switch
 * @desc Switch to activate on QTE success
 * @default 10
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

  let useTouchMode = false;


  const parameters = PluginManager.parameters("QTE_LakeMaster");
  const successSwitch = Number(parameters['Success Switch ID'] || 10);


  function Sprite_QTEButton(letter, difficulty, yMin, yMax, xMin, xMax) {
    this._yMin = yMin || 25;
    this._yMax = yMax || 350;
    this._xMin = xMin || 400;
    this._xMax = xMax || 750;
    this.initialize(letter, difficulty);
  }

  Sprite_QTEButton.prototype = Object.create(Sprite.prototype);
  Sprite_QTEButton.prototype.constructor = Sprite_QTEButton;

  Sprite_QTEButton.prototype.initialize = function(letter, difficulty) {
    Sprite.prototype.initialize.call(this);
    this._letter = letter;
    this._difficulty = difficulty || 0;
    this.bitmap = ImageManager.loadSystem("Button");
    this._textSprite = new Sprite(new Bitmap(96, 96));
    this._textSprite.bitmap.fontSize = 36;
    this._textSprite.bitmap.textColor = "#ffffff";
    this._textSprite.bitmap.drawText(this._letter.toUpperCase(), 0, 0, 96, 96, 'center');
    this._textSprite.anchor.x = 0.5;
    this._textSprite.anchor.y = 0.5;
    this._textSprite.x = (this._letter === '↑' || this._letter === '↓') ? 5 : 0;
    this._textSprite.y = 0;
    if (!useTouchMode) this.addChild(this._textSprite);
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.opacity = 0;
    this.x = this._xMin + Math.random() * (this._xMax - this._xMin);
    this.y = this._yMin + Math.random() * (this._yMax - this._yMin);
    this._life = 0;
  };

  Sprite_QTEButton.prototype.update = function() {
    if (useTouchMode) {
      this.removeChild(this._textSprite);
    } else {
      this.addChild(this._textSprite);
    }
    if (useTouchMode && TouchInput.isTriggered()) {
      const tx = TouchInput.x;
      const ty = TouchInput.y;
      if (tx >= this.x - this.width / 2 && tx <= this.x + this.width / 2 &&
          ty >= this.y - this.height / 2 && ty <= this.y + this.height / 2) {
        if (SceneManager._scene && SceneManager._scene._qteWindow) {
          SceneManager._scene._qteWindow._handleSuccess();
        }
      } else {
        if (SceneManager._scene && SceneManager._scene._qteWindow) {
          SceneManager._scene._qteWindow._handleFail();
        }
      }
    }
    
    console.log("difficulty : " + this._difficulty);
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
    initialize() {
      this._difficulty = 0;
      super.initialize(280, 405, 340, 80);
      this.resetState();
      this.deactivate();
      this.openness = 0;
    }

    resetState(difficulty, yMin, yMax, xMin, xMax) {
      this._successes = this._successes || 0;
      this._failures = this._failures || 0;
      this._active = true;
      this._phase = 'waiting';
      this._difficulty = difficulty || 0;
      this._timer = this._nextWait();
      this._spriteQTE = null;
      this._currentLetter = '...';
      this._yMin = yMin || 25;
      this._yMax = yMax || 350;
      this._xMin = xMin || 400;
      this._xMax = xMax || 750;
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
            } else {
              this._spriteQTE.update();
              if (this._spriteQTE.isFinished()) this._handleFail();
            }
          } else if (TouchInput.isTriggered()) {
            const tx = TouchInput.x;
            const ty = TouchInput.y;
            const sprite = this._spriteQTE;
            if (sprite && tx >= sprite.x - sprite.width / 2 && tx <= sprite.x + sprite.width / 2 &&
                ty >= sprite.y - sprite.height / 2 && ty <= sprite.y + sprite.height / 2) {
              this._handleSuccess();
            } else {
              this._handleFail();
            }
          } 
        }
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
    console.log("created QTE window");
    this._qteWindow = new QTE_Window();
    this.addWindow(this._qteWindow);
    this._qteWindow._active = false;
    this._qteWindow.close();
  };

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
  };

  Scene_Map.prototype.startQTE = function(difficulty, yMin, yMax, xMin, xMax) {
    this._qteWindow.resetState(difficulty, yMin, yMax, xMin, xMax);
    this._qteWindow.open();
    this._qteWindow.activate();
  };

  const _TouchInput_onTouchEnd = TouchInput._onTouchEnd;
  TouchInput._onTouchEnd = function(event) {
    _TouchInput_onTouchEnd.call(this, event);
    useTouchMode = true;
    console.log("useTouchMode true : " + useTouchMode);
  };

  const _TouchInput_onLeftButtonDown = TouchInput._onLeftButtonDown;
  TouchInput._onLeftButtonDown = function(event) {
    _TouchInput_onLeftButtonDown.call(this, event);
    console.log("useTouchMode true : " + useTouchMode);
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

})();
