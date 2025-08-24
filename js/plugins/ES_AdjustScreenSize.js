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
    const FIT_MODE = "fitMode";
    const PARAM_FULLSCREEN = "fullscreen";

    let isScaleModeFit = true;
    let initialModeFit = true;
    let isFullScreen = true;
    let initialFullScreen = true;

    // Override SceneManager.run to adjust screen size early
    const _SceneManager_run = SceneManager.run;
    SceneManager.run = function(sceneClass) {
        isScaleModeFit = ConfigManager.fitMode;
        initialModeFit = isScaleModeFit;
        isFullScreen = ConfigManager.fullscreen;
        initialFullScreen = isFullScreen;
        _SceneManager_run.call(this, sceneClass);
        if (Utils.isNwjs()) {
            if (initialFullScreen) {
                Graphics._requestFullScreen();
            }
        }
        adjustScreenSize();
    };

    function adjustScreenSize() {
        const windowW = window.innerWidth;
        const windowH = window.innerHeight;

        // 🚫 Si écran trop petit, ne pas toucher à la résolution
        if (windowW <= DEFAULT_WIDTH || windowH <= DEFAULT_HEIGHT) {
            console.warn("Résolution trop petite. Utilisation de la résolution par défaut RPG Maker.");
            return;
        }

        const scaleX = windowW / DEFAULT_WIDTH;
        const scaleY = windowH / DEFAULT_HEIGHT;
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
    }

    

    // 🔁 Ajuste dynamiquement à chaque redimensionnement de la fenêtre
    let _previousW = window.innerWidth;
    let _previousH = window.innerHeight;
    
    const _Scene_Base_onResolutionChange = Scene_Base.prototype.onResolutionChange;
    Scene_Base.prototype.onResolutionChange = function() {
        if(initialModeFit){
            _Scene_Base_onResolutionChange.call(this);
        } else {
            const boxW = Graphics.boxWidth;
            const boxH = Graphics.boxHeight;

            if (boxW <= DEFAULT_WIDTH || boxH <= DEFAULT_HEIGHT) {
                // 👇 Stratégie "petit écran" : mise à l’échelle globale
                const scaleX = boxW / DEFAULT_WIDTH;
                const scaleY = boxH / DEFAULT_HEIGHT;
                const scale = Math.min(scaleX, scaleY);

                this.scale.x = scale;
                this.scale.y = scale;

                // Centrage de la scène pour éviter décalages
                this.x = (boxW - DEFAULT_WIDTH * scale) / 2;
                this.y = (boxH - DEFAULT_HEIGHT * scale) / 2;
            } else {
                // 🧼 Reset échelle et position (en cas de retour à grand écran)
                this.scale.x = 1;
                this.scale.y = 1;
                this.x = 0;
                this.y = 0;


                // ♻️ Recharge les composants de la scène sans changer de scène
                if (typeof this.create === 'function') {
                    this._windowLayer && this.removeChild(this._windowLayer);
                    this._spriteset && this.removeChild(this._spriteset);
                    this._windowLayer = null;
                    this._spriteset = null;
                    this.create(false);
                }
            }
        }
    };

    
    //SCENE PART 

    const _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);
        if(!initialModeFit){
            adjustScreenSize();
        }
        TextManagerEx.setLanguage(ConfigManager.language, false)
    };

    const _Scene_Base_start = Scene_Base.prototype.start;
    Scene_Base.prototype.start = function() {
        _Scene_Base_start.call(this);
        if(!initialModeFit){
            adjustScreenSize();
        }
    };

    const _Scene_Title_createBackground = Scene_Title.prototype.createBackground;
    Scene_Title.prototype.createBackground = function() {
        if(initialModeFit){
            _Scene_Title_createBackground.call(this);
        } else {
            this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
            this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
            const scaleToFit = sprite => {
                sprite.bitmap.addLoadListener(() => {
                    const scale = Math.max(
                        Graphics.boxWidth / sprite.bitmap.width,
                        Graphics.boxHeight / sprite.bitmap.height
                    );
                    sprite.scale.x = sprite.scale.y = scale;
                    this.centerSprite(sprite);
                });
            };
            scaleToFit(this._backSprite1);
            scaleToFit(this._backSprite2);

            this.addChild(this._backSprite1);
            this.addChild(this._backSprite2);
        }
    };



    const _Scene_Gameover_centerSprite = Scene_Gameover.prototype.centerSprite;
    Scene_Gameover.prototype.centerSprite = function(sprite) {
        if(initialModeFit){
            _Scene_Gameover_centerSprite.call(this);
        } else {
            sprite.x = (Graphics.boxWidth - sprite.width * sprite.scale.x) / 2;
            sprite.y = (Graphics.boxHeight - sprite.height * sprite.scale.y) / 2;
        }
    };

    const _Scene_Gameover_createBackground = Scene_Gameover.prototype.createBackground;
    Scene_Gameover.prototype.createBackground = function() {
        if(initialModeFit){
            _Scene_Gameover_createBackground.call(this);
        } else {
            this._backSprite = new Sprite();
            this._backSprite.bitmap = ImageManager.loadSystem('GameOver');
            const scaleToFit = sprite => {
                sprite.bitmap.addLoadListener(() => {
                    const scale = Math.max(
                        Graphics.boxWidth / sprite.bitmap.width,
                        Graphics.boxHeight / sprite.bitmap.height
                    );
                    sprite.scale.x = sprite.scale.y = scale;
                    this.centerSprite(sprite);
                });
            };
            scaleToFit(this._backSprite);
            this.addChild(this._backSprite);
        }
    };

    const _SceneManager_snapForBackground = SceneManager.snapForBackground;
    SceneManager.snapForBackground = function() {
        if(initialModeFit){
            _SceneManager_snapForBackground.call(this);
        } else {
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
        }
    };

    //SPRITE PART
    
    // Forcer la position à (0,0) même si elle a été définie par l’événement
    const _Sprite_Picture_updatePosition = Sprite_Picture.prototype.updatePosition;
    Sprite_Picture.prototype.updatePosition = function() {
        if(initialModeFit){
            _Sprite_Picture_updatePosition.call(this);
        } else {
            this.x = 0;
            this.y = 0;
        }
    };
    
    // Empêche RPG Maker de modifier le scale
    const _Sprite_Picture_updateScale = Sprite_Picture.prototype.updateScale;
    Sprite_Picture.prototype.updateScale = function() {
        if(initialModeFit){
            _Sprite_Picture_updateScale.call(this);
        }
    };
    
    const _Sprite_Picture_updateBitmap = Sprite_Picture.prototype.updateBitmap;
    Sprite_Picture.prototype.updateBitmap = function() {
        _Sprite_Picture_updateBitmap.call(this);
        if(!initialModeFit){
            if (this._pictureName !== this._lastScaledName) {
                this._lastScaledName = this._pictureName;

                if (this.bitmap) {
                    this.bitmap.addLoadListener(() => {
                        // Déforme l’image pour remplir toute la box
                        const w = Graphics.boxWidth;
                        const h = Graphics.boxHeight;

                        this.scale.x = w / this.bitmap.width;
                        this.scale.y = h / this.bitmap.height;

                        // Position en haut à gauche
                        this.x = 0;
                        this.y = 0;
                    });
                }
            }
        }
    };

    const _Spriteset_Battle_createBattleback = Spriteset_Battle.prototype.createBattleback;
    Spriteset_Battle.prototype.createBattleback = function() {
        if(initialModeFit){
            _Spriteset_Battle_createBattleback.call(this);
        } else {
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
        }
    };

    const _Spriteset_Battle_createEnemies = Spriteset_Battle.prototype.createEnemies;
    Spriteset_Battle.prototype.createEnemies = function() {
        if(initialModeFit){
            _Spriteset_Battle_createEnemies.call(this);
        } else {
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
        }
    };
    
    const _Spriteset_Battle_locateBattleback = Spriteset_Battle.prototype.locateBattleback;
    Spriteset_Battle.prototype.locateBattleback = function() { 
        if(initialModeFit){
            _Spriteset_Battle_locateBattleback.call(this);
        } 
    };
    
    const _Sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome;
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

    //WINDOW PART

    // Calcule la largeur du texte avec icônes
    const Window_Base_textWidthWithIcons = Window_Base.prototype.textWidthWithIcons;
    Window_Base.prototype.textWidthWithIcons = function(text) {
        if(initialModeFit){
            return Window_Base_textWidthWithIcons.call(this, text);
        } else {
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
        }
    };

    const _Window_Message_drawMessageFace = Window_Message.prototype.drawMessageFace;
    Window_Message.prototype.drawMessageFace = function() {
        if(initialModeFit){
            return _Window_Message_drawMessageFace.call(this);
        } else {
            const baseX = (Graphics.boxWidth - DEFAULT_WIDTH) / 2;
            this.drawFace($gameMessage.faceName(), $gameMessage.faceIndex(), baseX, 0);
            ImageManager.releaseReservation(this._imageReservationId);
        }
    };

    const _Window_Message_newLineX = Window_Message.prototype.newLineX;
    Window_Message.prototype.newLineX = function() {
        if(initialModeFit){
            return _Window_Message_newLineX.call(this);
        } else {
            const baseX = (Graphics.boxWidth - DEFAULT_WIDTH) / 2;
            return $gameMessage.faceName() === '' ? baseX : baseX+168;
        }
    };

    const _Window_BattleStatus_drawItem = Window_BattleStatus.prototype.drawItem; 
    Window_BattleStatus.prototype.drawItem = function(index) {
        var actor = $gameParty.battleMembers()[index];
        this.drawBasicArea(this.basicAreaRect(index), actor);
        this.drawGaugeArea(this.gaugeAreaRect(index), actor);
    };

    const _Window_BattleStatus_basicAreaRect = Window_BattleStatus.prototype.basicAreaRect;
    Window_BattleStatus.prototype.basicAreaRect = function(index) {
        var rect = this.itemRectForText(index);
        rect.width -= this.gaugeAreaWidth() + 15;
        return rect;
    };

    const _Window_BattleStatus_gaugeAreaRect = Window_BattleStatus.prototype.gaugeAreaRect;
    Window_BattleStatus.prototype.gaugeAreaRect = function(index) {
        var rect = this.itemRectForText(index);
        rect.x += rect.width - this.gaugeAreaWidth();
        rect.width = this.gaugeAreaWidth();
        return rect;
    };

    const _Window_BattleStatus_gaugeAreaWidth = Window_BattleStatus.prototype.gaugeAreaWidth;
    Window_BattleStatus.prototype.gaugeAreaWidth = function() {
        return 330+(Graphics.boxWidth - DEFAULT_WIDTH);
    };

    const _Window_BattleStatus_drawBasicArea = Window_BattleStatus.prototype.drawBasicArea;
    Window_BattleStatus.prototype.drawBasicArea = function(rect, actor) {
        this.drawActorName(actor, rect.x + 0, rect.y, 150);
        this.drawActorIcons(actor, rect.x + 156, rect.y, rect.width - 156);
    };

    const _Window_BattleStatus_drawGaugeArea = Window_BattleStatus.prototype.drawGaugeArea;
    Window_BattleStatus.prototype.drawGaugeArea = function(rect, actor) {
        if ($dataSystem.optDisplayTp) {
            this.drawGaugeAreaWithTp(rect, actor);
        } else {
            this.drawGaugeAreaWithoutTp(rect, actor);
        }
    };

    const _Window_BattleStatus_drawGaugeAreaWithTp = Window_BattleStatus.prototype.drawGaugeAreaWithTp;
    Window_BattleStatus.prototype.drawGaugeAreaWithTp = function(rect, actor) {
            this.drawActorHp(actor, rect.x + 0, rect.y, 108);
            this.drawActorMp(actor, rect.x + 123, rect.y, 96);
            this.drawActorTp(actor, rect.x + 234, rect.y, 96);
    };

    const _Window_BattleStatus_drawGaugeAreaWithoutTp = Window_BattleStatus.prototype.drawGaugeAreaWithoutTp;
    Window_BattleStatus.prototype.drawGaugeAreaWithoutTp = function(rect, actor) {
            const third = (Graphics.boxWidth - DEFAULT_WIDTH)/3;
            const hpWidth = 201+ ($gameVariables.value(37) === 1? 0 + 2*third : 129+ 3*third) ;
            const mapWidth = 114 + third;
            this.drawActorHp(actor, rect.x + 0, rect.y, hpWidth);
            this.drawActorMp(actor, rect.x + hpWidth + 15, rect.y, mapWidth);
    };

    const _Window_ChoiceList_updatePlacement = Window_ChoiceList.prototype.updatePlacement;
    Window_ChoiceList.prototype.updatePlacement = function() {
        if(initialModeFit){
            return _Window_ChoiceList_updatePlacement.call(this);
        } else {
            var positionType = $gameMessage.choicePositionType();
            var messageY = this._messageWindow.y;
            this.width = this.windowWidth();
            this.height = this.windowHeight();


            const visibleW = $gameMap.tileWidth() * $gameMap.width();
            const visibleH = $gameMap.tileHeight() * $gameMap.height();

            const w = Math.min(Graphics.boxWidth, visibleW);
            const h = Math.min(Graphics.boxHeight, visibleH);
            let dw = Graphics.boxWidth - w;
            let dh = Graphics.boxHeight - h;
            if (dw < 0) dw = 0;
            if (dh < 0) dh = 0;

            const left = dw/2;
            const right = left + w;

            switch (positionType) {
            case 0:
                this.x = left;
                break;
            case 1:
                this.x = w / 2;
                break;
            case 2:
                this.x = right - this.width;
                break;
            }
            if (messageY >= Graphics.boxHeight / 2) {
                this.y = messageY - this.height;
            } else {
                this.y = messageY + this._messageWindow.height;
            }
        }
    };

    //WEATHER PART 

    const _Weather_initialize = Weather.prototype.initialize;
    Weather.prototype.initialize = function() {
        if(initialModeFit){
            return _Weather_initialize.call(this);
        } else {
            PIXI.Container.call(this);

            const visibleW = $gameMap.tileWidth() * $gameMap.width();
            const visibleH = $gameMap.tileHeight() * $gameMap.height();

            const w = Math.min(Graphics.boxWidth, visibleW);
            const h = Math.min(Graphics.boxHeight, visibleH);

            let dw = Graphics.boxWidth - w;
            let dh = Graphics.boxHeight - h;
            if (dw < 0) dw = 0;
            if (dh < 0) dh = 0;

            this._left = dw / 2;
            this._top = dh / 2;
            this._width = w;
            this._height = h;

            this._sprites = [];
            this.origin = new Point();
            this.type = 'none';
            this.power = 0;

            // Container interne qui contient les sprites météo
            this._weatherLayer = new PIXI.Container();
            this.addChild(this._weatherLayer);

            this._createBitmaps();
            this._createDimmer();

            // Création du masque
            const mask = new PIXI.Graphics();
            mask.beginFill(0xffffff);
            mask.drawRect(this._left, this._top, this._width, this._height);
            mask.endFill();
            mask.visible = false;
            this._maskSprite = mask;
            this.addChild(this._maskSprite);

            this._weatherLayer.mask = this._maskSprite;
        }
    };

    const _Weather__addSprite = Weather.prototype._addSprite;
    Weather.prototype._addSprite = function() {
        if(initialModeFit){
            return _Weather__addSprite.call(this);
        } else {
            var sprite = new Sprite();
            sprite.opacity = 0;
            this._sprites.push(sprite);
            this._weatherLayer.addChild(sprite); // <- ici au lieu de `this.addChild(sprite)`
        }
    };

    const _Weather__createDimmer = Weather.prototype._createDimmer;
    Weather.prototype._createDimmer = function() {
        if(initialModeFit){
            return _Weather__createDimmer.call(this);
        } else {
            const bitmap = new Bitmap(this._width, this._height);
            bitmap.fillAll('black');

            this._dimmerSprite = new Sprite(bitmap);
            this._dimmerSprite.x = this._left;
            this._dimmerSprite.y = this._top;
            this._dimmerSprite.opacity = Math.floor(this.power * 6); // init
            this.addChild(this._dimmerSprite);
        }
    };

    const _Weather__updateDimmer = Weather.prototype._updateDimmer;
    Weather.prototype._updateDimmer = function() {
        if(initialModeFit){
            return _Weather__updateDimmer.call(this);
        } else {
            if (this._dimmerSprite) {
                this._dimmerSprite.opacity = Math.floor(this.power * 6);
            }
        }
    };

    const _Weather__updateAllSprites = Weather.prototype._updateAllSprites;
    Weather.prototype._updateAllSprites = function() {
        if(initialModeFit){
            return _Weather__updateAllSprites.call(this);
        } else {
            var maxSprites = Math.floor(this.power * 10);
            while (this._sprites.length < maxSprites) {
                this._addSprite();
            }
            while (this._sprites.length > maxSprites) {
                this._removeSprite();
            }
            this._sprites.forEach(function(sprite) {
                this._updateSprite(sprite);
                sprite.x = sprite.ax - this.origin.x + this._left;
                sprite.y = sprite.ay - this.origin.y + this._top;
            }, this);
        }
    };


    //Options management part 
    Scene_Options.prototype.createHeaderWindow = function() {
        this._headerWindow = new Window_TitleHeader();
        this.addWindow(this._headerWindow);
    };


    Scene_Options.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createHeaderWindow();
        this.createOptionsWindow();
    };

    //-----------------------------------------------------------------------------
    // Window_TitleHeader
    //
    // The window class with cursor movement and scroll functions.

    function Window_TitleHeader() {
        this.initialize.apply(this, arguments);
    }

    Window_TitleHeader.prototype = Object.create(Window_Base.prototype);
    Window_TitleHeader.prototype.constructor = Window_TitleHeader;
    
    optionsFittingHeight = function() {
        return (Utils.isNwjs() ? 10 : 9) * 36 + 18 * 2;
    };
    
    Window_TitleHeader.prototype.initialize = function() {
        var width = 400;
        var height = this.fittingHeight(1);
        let px = (Graphics.boxWidth - width) / 2;
        let py = ((Graphics.boxHeight - optionsFittingHeight()) / 2) - height;
        Window_Base.prototype.initialize.call(this, px, py, width, height);
        this.deactivate();
    };

    Window_TitleHeader.prototype.maxCols = function() {
        return 1;
    };

    Window_TitleHeader.prototype.maxItems = function() {
        return 1;
    };

    Window_TitleHeader.prototype.spacing = function() {
        return 12;
    };

    Window_TitleHeader.prototype.itemWidth = function() {
        return Math.floor((this.width - this.padding * 2 +
                        this.spacing()) / this.maxCols() - this.spacing());
    };

    Window_TitleHeader.prototype.itemHeight = function() {
        return this.lineHeight();
    };

    Window_TitleHeader.prototype.maxRows = function() {
        return 1;
    };

    Window_TitleHeader.prototype.activate = function() {
        Window_Base.prototype.activate.call(this);
    };

    Window_TitleHeader.prototype.deactivate = function() {
        Window_Base.prototype.deactivate.call(this);
    };

    Window_TitleHeader.prototype.itemRect = function(index) {
        var rect = new Rectangle();
        var maxCols = this.maxCols();
        rect.width = this.itemWidth();
        rect.height = this.itemHeight();
        rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
        rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
        return rect;
    };

    Window_TitleHeader.prototype.itemRectForText = function(index) {
        var rect = this.itemRect(index);
        rect.x += this.textPadding();
        rect.width -= this.textPadding() * 2;
        return rect;
    };

    Window_TitleHeader.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        this.drawAllItems();
    };

    Window_TitleHeader.prototype.drawAllItems = function() {
        this.contents.clear();
        this.drawItem();
    };

    Window_TitleHeader.prototype.drawItem = function() {
        var rect = this.itemRectForText(1);
        var align = "center";
        this.resetTextColor();
        this.changeTextColor(this.deathColor());
        this.drawText(TextManagerEx.t('command.restartHelp'), 0, 0, 360, align);
    };

    Window_TitleHeader.prototype.clearItem = function() {
        var rect = this.itemRect(1);
        this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
    };

    Window_TitleHeader.prototype.redrawItem = function() {
        this.clearItem();
        this.drawItem();
    };

    Window_TitleHeader.prototype.redrawCurrentItem = function() {
        this.redrawItem();
    };

    Window_TitleHeader.prototype.refresh = function() {
        if (this.contents) {
            this.contents.clear();
            this.drawAllItems();
        }
    };

    Window_Options.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var statusWidth = this.statusWidth();
        var titleWidth = rect.width - statusWidth;
        if(this.isHighlightRed(index)){
            this.changeTextColor(this.deathColor());
        } else {
            this.resetTextColor();
        }
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x, rect.y, titleWidth, 'left');
        this.drawText(this.statusText(index), titleWidth, rect.y, statusWidth, 'right');
    };



    Window_Options.prototype.addCommand = function(name, symbol, enabled, ext, highlightRed = false) {
        if (enabled === undefined) {
            enabled = true;
        }
        if (ext === undefined) {
            ext = null;
        }
        this._list.push({ name: name, symbol: symbol, enabled: enabled, ext: ext, highlightRed: highlightRed });
    };


    Window_Options.prototype.isHighlightRed = function(index) {
        return this._list[index].highlightRed;
    };

    Window_Options.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var statusWidth = this.statusWidth();
        var titleWidth = rect.width - statusWidth;
        if(this.isHighlightRed(index)){
            this.changeTextColor(this.deathColor());
        } else {
            this.resetTextColor();
        }
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x, rect.y, titleWidth, 'left');
        this.drawText(this.statusText(index), titleWidth, rect.y, statusWidth, 'right');
    };
    
    Window_Options.prototype.statusText = function(index) {
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        if (this.isVolumeSymbol(symbol)) {
            return this.volumeStatusText(value);
        } else {
            if(symbol === FIT_MODE) {
                return value ? TextManagerEx.t('command.scaleMode.on') : TextManagerEx.t('command.scaleMode.off');
            } else {
                return this.booleanStatusText(value);
            }
        } 
    };
    
    const _Window_Options_addGeneralOptions2 = Window_Options.prototype.addGeneralOptions;
    Window_Options.prototype.addGeneralOptions = function() {
        _Window_Options_addGeneralOptions2.call(this);
        this.addCommand(TextManagerEx.t("command.scaleMode"), FIT_MODE, true, null, true);
        if(Utils.isNwjs()){
            this.addCommand(TextManagerEx.t("command.screen"), PARAM_FULLSCREEN, true, null, true);
        }
    };

    // Bascule entre les modes quand on appuie sur Entrée
    const _Window_Options_processOk2 = Window_Options.prototype.processOk;
    Window_Options.prototype.processOk = function() {
        const symbol = this.commandSymbol(this.index());
        if(Utils.isNwjs()){
            if (symbol === PARAM_FULLSCREEN) {
                isFullScreen = !isFullScreen;
                this.changeValue(symbol, isFullScreen);
                ConfigManager.fullscreen = isFullScreen;
                return;
            }
        }
        if (symbol === FIT_MODE) {
                isScaleModeFit = !isScaleModeFit;
                this.changeValue(symbol, isScaleModeFit);
                ConfigManager.fitMode = isScaleModeFit;
                return;
            }
        _Window_Options_processOk2.call(this);
    };    

})();