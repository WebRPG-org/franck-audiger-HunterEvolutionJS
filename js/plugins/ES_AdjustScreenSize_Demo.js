/*:
 * @plugindesc Met automatiquement le jeu en plein écran et ajuste la résolution à la taille de la fenêtre - v1.1
 * @author RPG Maker AI
 *
 * @help
 * Ce plugin met automatiquement le jeu en plein écran au démarrage
 * et redimensionne la résolution du jeu selon la taille de la fenêtre.
 *
 * Aucun paramètre ou commande de plugin nécessaire.
 */

(function() {
    const DEFAULT_WIDTH = 816;
    const DEFAULT_HEIGHT = 624;

    function adjustScreenSize() {
        const scaleX = window.innerWidth / DEFAULT_WIDTH;
        const scaleY = window.innerHeight / DEFAULT_HEIGHT;
        const scale = Math.min(scaleX, scaleY);

        const newWidth = Math.floor(DEFAULT_WIDTH * scale);
        const newHeight = Math.floor(DEFAULT_HEIGHT * scale);

        SceneManager._screenWidth = newWidth;
        SceneManager._screenHeight = newHeight;
        SceneManager._boxWidth = newWidth;
        SceneManager._boxHeight = newHeight;

        Graphics._width = newWidth;
        Graphics._height = newHeight;
        Graphics.boxWidth = newWidth;
        Graphics.boxHeight = newHeight;

        Graphics._updateAllElements();

        const offsetX = (window.innerWidth - newWidth) / 2;
        const offsetY = (window.innerHeight - newHeight) / 2;

        window.moveBy(-offsetX, -offsetY);
        window.resizeBy(newWidth - window.innerWidth, newHeight - window.innerHeight);
    }

    // Override SceneManager.run to adjust screen size early
    const _SceneManager_run = SceneManager.run;
    SceneManager.run = function(sceneClass) {
        _SceneManager_run.call(this, sceneClass);
        if (Utils.isNwjs()) {
            Graphics._requestFullScreen();
        }
        adjustScreenSize();
    };

    const _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);
        adjustScreenSize();
    };

    const _Scene_Base_start = Scene_Base.prototype.start;
    Scene_Base.prototype.start = function() {
        _Scene_Base_start.call(this);
        adjustScreenSize();
    };

    
    const _SceneManager_snapForBackground = SceneManager.snapForBackground;
    SceneManager.snapForBackground = function() {
        // Supprime temporairement le scale CSS
        const canvas = Graphics._canvas;
        const prevTransform = canvas.style.transform;
        const prevOrigin = canvas.style.transformOrigin;

        canvas.style.transform = '';
        canvas.style.transformOrigin = '';

        try {
            _SceneManager_snapForBackground.call(this);
        } catch (e) {
            
        }

        // Restaure l'affichage
        canvas.style.transform = prevTransform;
        canvas.style.transformOrigin = prevOrigin;
    };

    Spriteset_Battle.prototype.createBattleback = function() {
        const width = Graphics.width;
        const height = Graphics.height;

        const back1Bitmap = this.battleback1Bitmap();
        const back2Bitmap = this.battleback2Bitmap();

        this._back1Sprite = new Sprite();
        this._back2Sprite = new Sprite();

        this._back1Sprite.bitmap = back1Bitmap;
        this._back2Sprite.bitmap = back2Bitmap;

        // Mise à l’échelle une fois que l’image est chargée
        back1Bitmap.addLoadListener(() => {
            this._back1Sprite.scale.x = width / back1Bitmap.width;
            this._back1Sprite.scale.y = height / back1Bitmap.height;
        });

        back2Bitmap.addLoadListener(() => {
            this._back2Sprite.scale.x = width / back2Bitmap.width;
            this._back2Sprite.scale.y = height / back2Bitmap.height;
        });

        this._battleField.addChild(this._back1Sprite);
        this._battleField.addChild(this._back2Sprite);
    };

Sprite_Actor.prototype.setActorHome = function(index) {
    const scaleX = Graphics.boxWidth / 816;
    const scaleY = Graphics.boxHeight / 624;
    const baseX = (550*scaleX) + index * 32;
    const baseY = (360*scaleY) + index * 48;


    const offsetX = (Graphics.boxWidth - 816) / 2;

    const finalX = Math.round(baseX);
    const finalY = Math.round(baseY);

    this.setHome(finalX, finalY);
};
    
    Spriteset_Battle.prototype.createEnemies = function() {
        const scaleX = Graphics.boxWidth / 816;
        const scaleY = Graphics.boxHeight / 624;

        const enemies = $gameTroop.members();
        const sprites = [];

        for (let i = 0; i < enemies.length; i++) {
            const sprite = new Sprite_Enemy(enemies[i]);
            // Applique la nouvelle position
            if (sprite._homeX !== undefined && sprite._homeY !== undefined) {
                sprite.setHome(
                    Math.round(sprite._homeX * scaleX),
                    Math.round(sprite._homeY * scaleY)
                );
            }
            sprites[i] = sprite;
        }

        sprites.sort(this.compareEnemySprite.bind(this));
        for (let j = 0; j < sprites.length; j++) {
            this._battleField.addChild(sprites[j]);
        }

        this._enemySprites = sprites;
    };


    Spriteset_Battle.prototype.locateBattleback = function() {
        // Do nothing because we're using stretched Sprites instead of TilingSprites
    };

    // Calcule la largeur du texte avec icônes
    Window_Base.prototype.textWidthWithIcons = function(text) {
        text = this.convertEscapeCharacters(text);
        let width = 0;
        let i = 0;
        while (i < text.length) {
            if (text[i] === '\x1b') {
                const code = text[i + 1];
                if (code === 'I') {
                    const match = text.slice(i).match(/\x1bI\[(\d+)\]/);
                    if (match) {
                        width += Window_Base._iconWidth + 4;
                        i += match[0].length;
                        continue;
                    }
                }
            }
            width += this.textWidth(text[i]);
            i++;
        }
        return width;
    };

    Window_Message.prototype.drawMessageFace = function() {
        const baseX = (Graphics.boxWidth - DEFAULT_WIDTH) / 2;
        this.drawFace($gameMessage.faceName(), $gameMessage.faceIndex(), baseX, 0);
        ImageManager.releaseReservation(this._imageReservationId);
    };
    
    Window_Message.prototype.newLineX = function() {
        const baseX = (Graphics.boxWidth - DEFAULT_WIDTH) / 2;
        return $gameMessage.faceName() === '' ? baseX : baseX+168;
    };

    
Window_BattleStatus.prototype.drawItem = function(index) {
    var actor = $gameParty.battleMembers()[index];
    this.drawBasicArea(this.basicAreaRect(index), actor);
    this.drawGaugeArea(this.gaugeAreaRect(index), actor);
};

Window_BattleStatus.prototype.basicAreaRect = function(index) {
    var rect = this.itemRectForText(index);
    rect.width -= this.gaugeAreaWidth() + 15;
    return rect;
};

Window_BattleStatus.prototype.gaugeAreaRect = function(index) {
    var rect = this.itemRectForText(index);
    rect.x += rect.width - this.gaugeAreaWidth();
    rect.width = this.gaugeAreaWidth();
    return rect;
};

Window_BattleStatus.prototype.gaugeAreaWidth = function() {
    return 330+(Graphics.boxWidth - DEFAULT_WIDTH);
};

Window_BattleStatus.prototype.drawBasicArea = function(rect, actor) {
    this.drawActorName(actor, rect.x + 0, rect.y, 150);
    this.drawActorIcons(actor, rect.x + 156, rect.y, rect.width - 156);
};

Window_BattleStatus.prototype.drawGaugeArea = function(rect, actor) {
    if ($dataSystem.optDisplayTp) {
        this.drawGaugeAreaWithTp(rect, actor);
    } else {
        this.drawGaugeAreaWithoutTp(rect, actor);
    }
};

Window_BattleStatus.prototype.drawGaugeAreaWithTp = function(rect, actor) {
    this.drawActorHp(actor, rect.x + 0, rect.y, 108);
    this.drawActorMp(actor, rect.x + 123, rect.y, 96);
    this.drawActorTp(actor, rect.x + 234, rect.y, 96);
};

Window_BattleStatus.prototype.drawGaugeAreaWithoutTp = function(rect, actor) {
    const third = (Graphics.boxWidth - DEFAULT_WIDTH)/3;
    const hpWidth = 201+ ($gameVariables.value(37) === 1? 0 + 2*third : 129+ 3*third) ;
    const mapWidth = 114 + third;
    this.drawActorHp(actor, rect.x + 0, rect.y, hpWidth);
    this.drawActorMp(actor, rect.x + hpWidth + 15, rect.y, mapWidth);
};


})();