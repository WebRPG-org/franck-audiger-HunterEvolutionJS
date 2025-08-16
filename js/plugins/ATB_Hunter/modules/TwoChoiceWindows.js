
Scene_Map.prototype.callTwoButtonChoice = function() {
    SceneManager.push(Scene_TwoButtonChoice);
    Window_TwoButtonChoice.initCommandPosition();
    $gameTemp.clearDestination();
    this._mapNameWindow.hide();
    this._waitCount = 2;
};


//-----------------------------------------------------------------------------
// Scene_MenuBase
//
// The superclass of all the menu-type scenes.

function Scene_TwoButtonChoice() {
    this.initialize.apply(this, arguments);
}

Scene_TwoButtonChoice.prototype = Object.create(Scene_Base.prototype);
Scene_TwoButtonChoice.prototype.constructor = Scene_TwoButtonChoice;

Scene_TwoButtonChoice.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_TwoButtonChoice.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createWindowLayer();
    this.createCommandWindow();
};

Scene_TwoButtonChoice.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this.addChild(this._backgroundSprite);
};

Scene_TwoButtonChoice.prototype.setBackgroundOpacity = function(opacity) {
    this._backgroundSprite.opacity = opacity;
};

Scene_TwoButtonChoice.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
};

Scene_TwoButtonChoice.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_TwoButtonChoice(0, 0);
    this._commandWindow.setHandler('KurapikaLeolio',      this.commandKurapikaLeolio.bind(this));
    this._commandWindow.setHandler('GonKillua',     this.commandGonKillua.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_TwoButtonChoice.prototype.commandKurapikaLeolio = function() {
    // Handle Kurapika & Leolio choice
    this._commandWindow.close();
    console.log("Kurapika & Leolio chosen");
};

Scene_TwoButtonChoice.prototype.commandGonKillua = function() {
    // Handle Gon & Killua choice
    this._commandWindow.close();
    console.log("Gon & Killua chosen");
};

// --------------------------------------------------------------------------
// Window_TwoButtonChoice
// --------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Window_MenuCommand
//
// The window for selecting a command on the menu screen.

function Window_TwoButtonChoice() {
    this.initialize.apply(this, arguments);
}

Window_TwoButtonChoice.prototype = Object.create(Window_Command.prototype);
Window_TwoButtonChoice.prototype.constructor = Window_TwoButtonChoice;

Window_TwoButtonChoice.prototype.initialize = function(x, y) {
    Window_Command.prototype.initialize.call(this, x, y);
    this.selectLast();
};

Window_TwoButtonChoice._lastCommandSymbol = null;

Window_TwoButtonChoice.initCommandPosition = function() {
    this._lastCommandSymbol = null;
};

Window_TwoButtonChoice.prototype.windowWidth = function() {
    return Math.max(816, Graphics.boxWidth);
};

Window_TwoButtonChoice.prototype.windowHeight = function() {
    return Math.max(624, Graphics.boxHeight);
};

Window_TwoButtonChoice.prototype.numVisibleRows = function() {
    return this.maxItems();
};

Window_TwoButtonChoice.prototype.makeCommandList = function() {
    this.addMainCommands();
};

Window_TwoButtonChoice.prototype.addMainCommands = function() {
    this.addCommand("Kurapika & Leolio", 'KurapikaLeolio');
    this.addCommand("Gon & Killua", 'GonKillua');
};

Window_TwoButtonChoice.prototype.processOk = function() {
    Window_TwoButtonChoice._lastCommandSymbol = this.currentSymbol();
    Window_Command.prototype.processOk.call(this);
};

Window_TwoButtonChoice.prototype.selectLast = function() {
    this.selectSymbol(Window_TwoButtonChoice._lastCommandSymbol);
};


Window_TwoButtonChoice.prototype.drawItem = function(index) {
    this.drawImage(index);

    var rect = this.itemRectForText(index);
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.contents.fontSize = 24; // taille de police du label
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
};


Window_TwoButtonChoice.prototype.drawImage = function(index) {
    var area = this.itemRectForImage(index);

    // IMPORTANT: pas d'extension pour ImageManager.loadPicture
    var imageName = (index === 0) ? "KurapikaLeolio" : "GonKillua";
    var bmp = ImageManager.loadPicture(imageName);
    var self = this;

    // Si pas encore chargé, on rafraîchit quand c'est prêt
    if (!bmp.isReady()) {
        bmp.addLoadListener(function() { self.refresh(); });
        return;
    }

    var bw = bmp.width, bh = bmp.height;
    if (bw <= 0 || bh <= 0) return;

    // Fit = "cover" : l'image remplit la zone, recadrée si nécessaire
    var dx = Math.floor(area.x);
    var dy = Math.floor(area.y);
    var dw = Math.floor(area.width);
    var dh = Math.floor(area.height);

    var scale = Math.max(dw / bw, dh / bh);
    var sw = Math.floor(dw / scale);
    var sh = Math.floor(dh / scale);
    var sx = Math.floor((bw - sw) / 2);
    var sy = Math.floor((bh - sh) / 2);

    this.contents.blt(bmp, sx, sy, sw, sh, dx, dy, dw, dh);
};

Window_TwoButtonChoice.prototype.itemRectForImage = function(index) {
    var rect = this.itemRect(index);     
    var pad    = 12;   // marge intérieure
    var labelH = 48;   // hauteur du bandeau texte
    var gap    = 8;    // petit espace entre image et bandeau

    rect.x += pad;
    rect.y += pad;
    rect.width  -= pad * 2;
    rect.height  = Math.max(1, rect.height - (labelH + pad + gap));
    return rect;
};

Window_TwoButtonChoice.prototype.itemRectForText = function(index) {
    var rect = this.itemRect(index);        // zone du bouton (moitié d'écran)
    var pad  = 12;                          // marge intérieure
    var labelH = 48;                        // hauteur du bandeau texte (à ajuster)

    rect.y = rect.y + rect.height/2 - labelH - pad; // place le bandeau en bas
    rect.height = labelH;
    rect.x += pad;
    rect.width -= pad * 2;
    return rect;
};


Window_TwoButtonChoice.prototype.itemRect = function(index) {
    var rect = new Rectangle();
    var maxCols = this.maxCols();
    rect.width = this.itemWidth();
    rect.height = this.itemHeight();
    rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
    rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
    return rect;
};

Window_TwoButtonChoice.prototype.itemHeight = function() {
    return this.lineHeight();
};

Window_TwoButtonChoice.prototype.lineHeight = function() {
    return Graphics.boxHeight-42;
};


Window_TwoButtonChoice.prototype.maxCols = function() {
    return 2;
};
