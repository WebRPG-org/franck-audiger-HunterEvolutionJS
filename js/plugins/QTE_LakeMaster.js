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
  const parameters = PluginManager.parameters("QTE_LakeMaster");
  const successSwitch = Number(parameters['Success Switch ID'] || 10);

  const Y_MIN = 25;
  const Y_MAX = 350;
  const X_MIN = 400;
  const X_MAX = 750;

  function Sprite_QTEButton(letter, useTouch) {
    this._useTouch = useTouch;
    this.initialize(letter);
  }

  Sprite_QTEButton.prototype = Object.create(Sprite.prototype);
  Sprite_QTEButton.prototype.constructor = Sprite_QTEButton;

  Sprite_QTEButton.prototype.initialize = function(letter, useTouch) {
    Sprite.prototype.initialize.call(this);
    this._letter = letter;
    this.bitmap = ImageManager.loadSystem("Button");
    this._textSprite = new Sprite(new Bitmap(96, 96));
    this._textSprite.bitmap.fontSize = 36;
    this._textSprite.bitmap.textColor = "#ffffff";
    this._textSprite.bitmap.drawText(this._letter.toUpperCase(), 0, 0, 96, 96, 'center');
    this._textSprite.anchor.x = 0.5;
    this._textSprite.anchor.y = 0.5;
    this._textSprite.x = (this._letter === '↑' || this._letter === '↓') ? 5 : 0;
    this._textSprite.y = 0;
    if (!useTouch) this.addChild(this._textSprite);
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.opacity = 0;
    this.x = X_MIN + Math.random() * (X_MAX - X_MIN);
    this.y = Y_MIN + Math.random() * (Y_MAX - Y_MIN);
    this._life = 0;
  };

  Sprite_QTEButton.prototype.update = function() {
    if (this._useTouch && TouchInput.isTriggered()) {
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
    Sprite.prototype.update.call(this);
    if (this._life < 500) {
      this.opacity = Math.min(255, this._life * (255 / 500));
    } else if (this._life >= 500 && this._life <= 600) {
      this.opacity = 255;
    } else if (this._life > 600) {
      this.opacity = Math.max(0, 255 - ((this._life - 600) * (255 / 250)));
    }
    this._life++;
  };

  Sprite_QTEButton.prototype.isFinished = function() {
    return this._life > 800;
  }

  class QTE_Window extends Window_Base {
    initialize() {
      super.initialize(280, 405, 340, 80);
      this.resetState();
      this.deactivate();
      this.openness = 0;
    }

    resetState() {
      this._successes = this._successes || 0;
      this._failures = this._failures || 0;
      this._active = true;
      this._phase = 'waiting';
      this._timer = this._nextWait();
      this._spriteQTE = null;
      this._currentLetter = '...';
    }

    _nextWait() {
      return 200 + Math.floor(Math.random() * 100);
    }

    update() {
      super.update();
      if (!this._active) return;

      if (this._phase === 'waiting') {
        this._timer--;
        if (this._timer <= 0) this._startInput();
      } else if (this._phase === 'inputting') {
        if (this._spriteQTE) {
          if (TouchInput.isTriggered()){
            this._useTouchMode = true;
          } else if (Input.isTriggered('up') || Input.isTriggered('down') ||
                     Input.isTriggered('left') || Input.isTriggered('right')) {
            this._useTouchMode = false;
          }
          if (!this._useTouchMode) {
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
      this._useTouchMode = false;
      this._spriteQTE = new Sprite_QTEButton(letter, this._useTouchMode);
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
        //$gameMessage.add("Échec !");
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
    this._qteWindow = new QTE_Window();
    this.addWindow(this._qteWindow);
    this._qteWindow._active = false;
    this._qteWindow.close();
  };

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
  };

  Scene_Map.prototype.startQTE = function() {
    this._qteWindow.resetState();
    this._qteWindow.open();
    this._qteWindow.activate();
  };

  window.startQTE = function() {
    if (SceneManager._scene instanceof Scene_Map && SceneManager._scene._qteWindow) {
      SceneManager._scene.startQTE();
    }
  };

})();
