/*:
 * @plugindesc Cooking UI: zone centrale (Ingrédients / Rôtisserie / Casserole) + barre du bas avec objet tenu.
 * @author RPG Maker AI Support
 *
 * @help
 * Appel : SceneManager.push(Scene_CookingBase)
 * Contrôles :
 *  - Zone centrale : ← → pour changer, Entrée pour valider
 *  - Ingrédients : valider un item pour le “tenir” (affiché en bas)
 *  - Échap : retour
 */

(function () {
    "use strict";

    // Liste d'ingrédients "hardcodée"
    var CookingIngredients = [
        { id: 1, name: "Viande de Sanglier", iconIndex: 0 },
        { id: 2, name: "Pommes", iconIndex: 1 },
        { id: 3, name: "Herbes Sauvages", iconIndex: 2 },
        { id: 4, name: "Sel", iconIndex: 3 },
        { id: 5, name: "Poivre", iconIndex: 4 },
        { id: 6, name: "Eau", iconIndex: 5 },
    ];

    var ING_SHEET = "Ingredients"; // img/pictures/Ingredients.png
    var ING_ICON_W = 32;
    var ING_ICON_H = 32;
    var ING_ICON_COLS = 16; // 16 icônes par ligne, comme IconSet

    // -- État UI minimal : objet tenu (objet CookingIngredients) --
    var CookingUI = {
        _held: null,
        heldItem: function () { return this._held; },
        setHeldItem: function (item) { this._held = item || null; }
    };
    window.CookingUI = CookingUI;

    //-----------------------------------------------------------------------------
    // Scene_CookingBase
    //-----------------------------------------------------------------------------
    function Scene_CookingBase() { this.initialize.apply(this, arguments); }
    Scene_CookingBase.prototype = Object.create(Scene_Base.prototype);
    Scene_CookingBase.prototype.constructor = Scene_CookingBase;

    Scene_CookingBase.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
    };

    Scene_CookingBase.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createWindowLayer();
        this.createHelpWindow();
        this.createZoneWindow();
        this.createBottomBar();
    };

    Scene_CookingBase.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
        this.centerSprite(this._backSprite);
        this._zoneWindow.activate();
        this._zoneWindow.select(0);
        this.refreshBottomBar();
        this.startFadeIn(this.fadeSpeed(), false);
    };

    Scene_CookingBase.prototype.update = function () {
        Scene_Base.prototype.update.call(this);
    };

    Scene_CookingBase.prototype.terminate = function () {
        Scene_Base.prototype.terminate.call(this);
    };

    // --- fond noir plein écran ---
    Scene_CookingBase.prototype.createBackground = function () {
        var w = Graphics.width, h = Graphics.height;
        var bmp = new Bitmap(w, h);
        bmp.fillRect(0, 0, w, h, "black");
        this._backSprite = new Sprite(bmp);
        this.addChild(this._backSprite);
    };

    // --- help en haut (instructions) ---
    Scene_CookingBase.prototype.createHelpWindow = function () {
        this._helpWindow = new Window_Help(1);
        this._helpWindow.y = 0;
        this._helpWindow.setText("←/→ choisir | Entrée valider | Échap retour");
        this.addWindow(this._helpWindow);
    };

    // --- zone centrale : sélecteur de zone ---
    Scene_CookingBase.prototype.createZoneWindow = function () {
        var top = this._helpWindow.height;
        var barH = 72;
        var h = Graphics.boxHeight - top - barH;
        this._zoneWindow = new Window_CookingZoneSelect(0, top, Graphics.boxWidth, h);
        this._zoneWindow.setHandler('ok', this.onZoneOk.bind(this));
        this._zoneWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._zoneWindow);

        // Fenêtre liste d'ingrédients (cachée au départ)
        var listH = h - 24;
        this._ingrWindow = new Window_CookingItemList(24, top + 12, Graphics.boxWidth - 48, listH);
        this._ingrWindow.setHandler('ok', this.onIngredientOk.bind(this));
        this._ingrWindow.setHandler('cancel', this.onIngredientCancel.bind(this));
        this._ingrWindow.hide();
        this._ingrWindow.deactivate();
        this._ingrWindow.setHelpWindow(this._helpWindow);
        this.addWindow(this._ingrWindow);
    };

    // --- barre du bas : objet tenu au centre ---
    Scene_CookingBase.prototype.createBottomBar = function () {
        var h = 72;
        var y = Graphics.boxHeight - h;
        this._bottomBar = new Window_CookingBottomBar(0, y, Graphics.boxWidth, h);
        this.addWindow(this._bottomBar);
    };

    Scene_CookingBase.prototype.centerSprite = function (sprite) {
        sprite.x = Graphics.width / 2;
        sprite.y = Graphics.height / 2;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
    };

    // --- handlers ---
    Scene_CookingBase.prototype.onZoneOk = function () {
        var index = this._zoneWindow.index();
        if (index === 0) {           // Ingrédients
            this.openIngredients();
        } else if (index === 1) {    // Rôtisserie
            SoundManager.playOk();
            this._helpWindow.setText("  ddq : (placeholder) Déposer l'objet tenu ici.");
        } else if (index === 2) {    // Casserole
            SoundManager.playOk();
            this._helpWindow.setText("Casserole : (placeholder) Déposer l'objet tenu ici.");
        }
    };

    Scene_CookingBase.prototype.openIngredients = function () {
        this._helpWindow.setText("Ingrédients : Entrée = tenir l'objet | Échap = retour");
        this._ingrWindow.refresh();
        this._ingrWindow.select(0);
        this._ingrWindow.show();
        this._ingrWindow.activate();
        this._zoneWindow.deactivate();
    };

    Scene_CookingBase.prototype.onIngredientOk = function () {
        var item = this._ingrWindow.item();
        if (item) {
            SoundManager.playOk();
            CookingUI.setHeldItem(item);
            this.refreshBottomBar();
        } else {
            SoundManager.playBuzzer();
        }
        this.onIngredientCancel(); // Retour au sélecteur
    };

    Scene_CookingBase.prototype.onIngredientCancel = function () {
        this._ingrWindow.hide();
        this._ingrWindow.deactivate();
        this._zoneWindow.activate();
        this._helpWindow.setText("←/→ choisir | Entrée valider | Échap retour");
    };

    Scene_CookingBase.prototype.refreshBottomBar = function () {
        this._bottomBar.setHeldItem(CookingUI.heldItem());
    };

    window.Scene_CookingBase = Scene_CookingBase;

    //-----------------------------------------------------------------------------
    // Window_CookingZoneSelect (centre)
    //-----------------------------------------------------------------------------
    function Window_CookingZoneSelect() { this.initialize.apply(this, arguments); }
    Window_CookingZoneSelect.prototype = Object.create(Window_Selectable.prototype);
    Window_CookingZoneSelect.prototype.constructor = Window_CookingZoneSelect;

    Window_CookingZoneSelect.prototype.initialize = function (x, y, w, h) {
        this._data = ["Ingrédients", "Rôtisserie", "Casserole"]; // <-- AVANT
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this.refresh();
        this.activate();
        this.select(0);
    };

    Window_CookingZoneSelect.prototype.maxItems = function () {
        return (this._data && this._data.length) || 0; // garde-fou
    };
    Window_CookingZoneSelect.prototype.maxCols = function () { return 3; };
    Window_CookingZoneSelect.prototype.spacing = function () { return 24; };

    Window_CookingZoneSelect.prototype.itemRect = function (index) {
        var rect = new Rectangle();
        var cols = this.maxCols();
        var space = this.spacing();
        var wAvail = this.contentsWidth() - space * (cols - 1);
        var itemW = Math.floor(wAvail / cols);
        var itemH = Math.floor(this.contentsHeight() * 0.6); // gros boutons
        rect.width = itemW;
        rect.height = itemH;
        rect.x = (itemW + space) * (index % cols);
        rect.y = Math.floor((this.contentsHeight() - itemH) / 2);
        return rect;
    };

    Window_CookingZoneSelect.prototype.drawItem = function (index) {
        var rect = this.itemRect(index);
        var label = this._data[index];
        // fond doux
        this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, "rgba(255,255,255,0.08)");
        this.changeTextColor(this.normalColor());
        this.contents.fontSize = 26;
        this.drawText(label, rect.x, rect.y + rect.height / 2 - this.lineHeight() / 2, rect.width, "center");
    };

    Window_CookingZoneSelect.prototype.update = function () {
        Window_Selectable.prototype.update.call(this);
        // Navigation gauche/droite “douce”
        if (this.isOpenAndActive()) {
            if (Input.isTriggered('left')) this.cursorLeft(false);
            if (Input.isTriggered('right')) this.cursorRight(false);
        }
    };

    //-----------------------------------------------------------------------------
    // Window_CookingBottomBar (bas)
    //-----------------------------------------------------------------------------
    function Window_CookingBottomBar() { this.initialize.apply(this, arguments); }
    Window_CookingBottomBar.prototype = Object.create(Window_Base.prototype);
    Window_CookingBottomBar.prototype.constructor = Window_CookingBottomBar;

    Window_CookingBottomBar.prototype.initialize = function (x, y, w, h) {
        Window_Base.prototype.initialize.call(this, x, y, w, h);
        this._heldItem = null;
        this.refresh();
    };

    Window_CookingBottomBar.prototype.setHeldItem = function (item) {
        this._heldItem = item || null;
        this.refresh();
    };

    Window_CookingBottomBar.prototype.refresh = function () {
        this.contents.clear();
        var cw = this.contentsWidth(), ch = this.contentsHeight();
        var slotW = 280, slotH = this.lineHeight() + 12;
        var sx = Math.floor((cw - slotW) / 2);
        var sy = Math.floor((ch - slotH) / 2);
        this.contents.fillRect(sx, sy, slotW, slotH, "rgba(255,255,255,0.10)");

        if (this._heldItem) {
            var iconX = sx + 12;
            var textX = iconX + 36;
            var textW = slotW - (textX - sx) - 12;
            this.drawIngredientIcon(this._heldItem.iconIndex, iconX, sy + 6);
            this.changeTextColor(this.systemColor());
            this.drawText("Objet tenu :", textX, sy, 100);
            this.changeTextColor(this.normalColor());
            this.drawText(this._heldItem.name, textX + 100, sy, textW - 100);
        } else {
            this.changeTextColor(this.textColor(7));
            this.drawText("— Aucun objet en main —", sx, sy, slotW, "center");
            this.changeTextColor(this.normalColor());
        }
    };

    Window_CookingBottomBar.prototype.drawIngredientIcon = function (iconIndex, x, y) {
        var bmp = ImageManager.loadPicture(ING_SHEET);
        if (!bmp.isReady()) { bmp.addLoadListener(this.refresh.bind(this)); return; }
        var sx = (iconIndex % ING_ICON_COLS) * ING_ICON_W;
        var sy = Math.floor(iconIndex / ING_ICON_COLS) * ING_ICON_H;
        this.contents.blt(bmp, sx, sy, ING_ICON_W, ING_ICON_H, x, y);
    };

    //-----------------------------------------------------------------------------
    // Window_CookingItemList (filtre ingrédients)
    //-----------------------------------------------------------------------------
    function Window_CookingItemList() { this.initialize.apply(this, arguments); }
    Window_CookingItemList.prototype = Object.create(Window_Selectable.prototype);
    Window_CookingItemList.prototype.constructor = Window_CookingItemList;

    Window_CookingItemList.prototype.initialize = function (x, y, w, h) {
        this._data = CookingIngredients; // <-- AVANT
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this.refresh();
    };

    Window_CookingItemList.prototype.maxItems = function () { return this._data ? this._data.length : 0; };
    Window_CookingItemList.prototype.maxCols = function () { return 2; };
    Window_CookingItemList.prototype.item = function () { return this._data[this.index()]; };

    Window_CookingItemList.prototype.drawItem = function (index) {
        var item = this._data[index];
        if (!item) return;
        var rect = this.itemRect(index);
        rect.width -= this.textPadding();
        this.resetTextColor();
        this.drawIngredientIcon(item.iconIndex, rect.x, rect.y + 2);
        this.drawText(item.name, rect.x + 36, rect.y, rect.width - 36, rect.height);
    };

    Window_CookingItemList.prototype.drawIngredientIcon = function (iconIndex, x, y) {
        var bmp = ImageManager.loadPicture(ING_SHEET);
        if (!bmp.isReady()) { bmp.addLoadListener(this.refresh.bind(this)); return; }
        var sx = (iconIndex % ING_ICON_COLS) * ING_ICON_W;
        var sy = Math.floor(iconIndex / ING_ICON_COLS) * ING_ICON_H;
        this.contents.blt(bmp, sx, sy, ING_ICON_W, ING_ICON_H, x, y);
    };
})();
