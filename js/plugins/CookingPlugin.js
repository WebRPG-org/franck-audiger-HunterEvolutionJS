/*:
 * @plugindesc Cooking UI: zone centrale + Ingrédients avec sous-catégories + plan de travail + barre du bas (objet tenu).
 * @author RPG Maker AI Support
 *
 * @help
 * Appel : SceneManager.push(Scene_CookingBase)
 * Contrôles :
 *  - Zone centrale : ← → pour changer (Ingrédients / Rôtisserie / Casserole), Entrée pour valider
 *  - Ingrédients : flèches pour choisir catégorie (barre), Entrée pour ouvrir la liste,
 *    Entrée sur un item = le tenir (affiché en bas). Échap = retour.
 */

(function () {
  "use strict";

  // --- Liste d'ingrédients "hardcodée" + catégorie ---
  // cat: 'protein' | 'vegetal' | 'condiment'
  var CookingIngredients = [
    { id: 1, name: "Viande de Sanglier", cat: "protein",  iconIndex: 0 },
    { id: 2, name: "Pommes",             cat: "vegetal",  iconIndex: 1 },
    { id: 3, name: "Herbes Sauvages",    cat: "condiment",iconIndex: 2 },
    { id: 4, name: "Sel",                cat: "condiment",iconIndex: 3 },
    { id: 5, name: "Poivre",             cat: "condiment",iconIndex: 4 },
    { id: 6, name: "Eau",                cat: "condiment",iconIndex: 5 }
  ];

  // Planche d'icônes dédiée
  var ING_SHEET = "Ingredients";   // img/pictures/Ingredients.png
  var ING_ICON_W = 32;
  var ING_ICON_H = 32;
  var ING_ICON_COLS = 16;

  // --- État UI minimal : objet tenu (objet CookingIngredients) ---
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
    this.createIngredientWindows(); // <-- nouvelles fenêtres de la vue Ingrédients
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

  Scene_CookingBase.prototype.createBackground = function () {
    var w = Graphics.width, h = Graphics.height;
    var bmp = new Bitmap(w, h);
    bmp.fillRect(0, 0, w, h, "black");
    this._backSprite = new Sprite(bmp);
    this.addChild(this._backSprite);
  };

  Scene_CookingBase.prototype.createHelpWindow = function () {
    this._helpWindow = new Window_Help(1);
    this._helpWindow.y = 0;
    this._helpWindow.setText("←/→ choisir | Entrée valider | Échap retour");
    this.addWindow(this._helpWindow);
  };

  // --- Sélecteur de zone (centre) ---
  Scene_CookingBase.prototype.createZoneWindow = function () {
    var top = this._helpWindow.height;
    var barH = 72;
    var h = Graphics.boxHeight - top - barH;
    this._zoneWindow = new Window_CookingZoneSelect(0, top, Graphics.boxWidth, h);
    this._zoneWindow.setHandler('ok', this.onZoneOk.bind(this));
    this._zoneWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._zoneWindow);
  };

  // --- Fenêtres de la vue "Ingrédients" ---
  Scene_CookingBase.prototype.createIngredientWindows = function () {
    var top = this._helpWindow.height;
    var bottomBarH = 72;
    var zoneTop = top, zoneH = Graphics.boxHeight - top - bottomBarH;
    var margin = 24;

    // Barre de catégories
    var catX = margin, catY = zoneTop + 12, catW = Graphics.boxWidth - margin * 2;
    this._ingrCatWindow = new Window_CookingCategoryBar(catX, catY, catW);
    this._ingrCatWindow.setHandler('ok', this.onCategoryOk.bind(this));
    this._ingrCatWindow.setHandler('cancel', this.onIngredientViewCancel.bind(this));
    this._ingrCatWindow.setChangeHandler(this.onCategoryChanged.bind(this));
    this.addWindow(this._ingrCatWindow);

    // Liste d'ingrédients (au milieu)
    var listY = this._ingrCatWindow.y + this._ingrCatWindow.height + 6;
    var workH = 120; // hauteur du plan de travail
    var listH = (zoneTop + zoneH) - listY - workH - 18;
    var listW = Graphics.boxWidth - margin * 2;
    this._ingrWindow = new Window_CookingItemList(margin, listY, listW, listH);
    this._ingrWindow.setHandler('ok',     this.onIngredientOk.bind(this));
    this._ingrWindow.setHandler('cancel', this.onIngredientCancel.bind(this)); // retour à la barre de catégories
    this.addWindow(this._ingrWindow);

    // Plan de travail (en bas de la vue Ingrédients)
    var workY = listY + listH + 6;
    this._workbenchWindow = new Window_CookingWorkbench(margin, workY, listW, workH);
    this.addWindow(this._workbenchWindow);

    // Cacher par défaut la vue Ingrédients (affichée seulement quand on y entre)
    this.showIngredientView(false);
  };

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

  // --- Handlers de scène ---
  Scene_CookingBase.prototype.onZoneOk = function () {
    var index = this._zoneWindow.index();
    if (index === 0) {           // Ingrédients
      this.openIngredients();
    } else if (index === 1) {    // Rôtisserie
      SoundManager.playOk();
      this._helpWindow.setText("Rôtisserie : (placeholder) Déposer l'objet tenu ici.");
    } else if (index === 2) {    // Casserole
      SoundManager.playOk();
      this._helpWindow.setText("Casserole : (placeholder) Déposer l'objet tenu ici.");
    }
  };

  Scene_CookingBase.prototype.openIngredients = function () {
    this._helpWindow.setText("Ingrédients : ←/→ catégorie | Entrée = ouvrir la liste | Échap = retour");
    this.showIngredientView(true);
    this._zoneWindow.deactivate();

    // Catégorie par défaut / actuelle
    var cat = this._ingrCatWindow.currentCategory() || 'protein';
    this._ingrWindow.setCategory(cat);
    this._ingrCatWindow.activate();
    this._ingrCatWindow.select(this._ingrCatWindow.index() || 0);
  };

  // OK sur la barre de catégories => focus liste
  Scene_CookingBase.prototype.onCategoryOk = function(){
    this._helpWindow.setText("Sélectionne un ingrédient | Entrée = tenir | Échap = catégories");
    this._ingrWindow.select(0);
    this._ingrWindow.activate();
  };

  // Changement de catégorie => refiltrer la liste
  Scene_CookingBase.prototype.onCategoryChanged = function(){
    var cat = this._ingrCatWindow.currentCategory();
    this._ingrWindow.setCategory(cat);
  };

  // OK sur un ingrédient => tenir l'objet
  Scene_CookingBase.prototype.onIngredientOk = function () {
    var item = this._ingrWindow.item();
    if (item) {
      SoundManager.playOk();
      CookingUI.setHeldItem(item);
      this.refreshBottomBar();
    } else {
      SoundManager.playBuzzer();
    }
    // Retour aux catégories (on reste dans la vue Ingrédients)
    this._ingrWindow.deselect();
    this._ingrWindow.deactivate();
    this._ingrCatWindow.activate();
    this._helpWindow.setText("Ingrédients : ←/→ catégorie | Entrée = ouvrir la liste | Échap = retour");
  };

  // Échap dans la liste => revenir à la barre de catégories
  Scene_CookingBase.prototype.onIngredientCancel = function(){
    this._ingrWindow.deactivate();
    this._ingrCatWindow.activate();
    this._helpWindow.setText("Ingrédients : ←/→ catégorie | Entrée = ouvrir la liste | Échap = retour");
  };

  // Échap dans la barre de catégories => quitter la vue Ingrédients
  Scene_CookingBase.prototype.onIngredientViewCancel = function(){
    this.showIngredientView(false);
    this._zoneWindow.activate();
    this._helpWindow.setText("←/→ choisir | Entrée valider | Échap retour");
  };

  Scene_CookingBase.prototype.refreshBottomBar = function () {
    this._bottomBar.setHeldItem(CookingUI.heldItem());
  };

  Scene_CookingBase.prototype.showIngredientView = function(show){
    var m = show ? 'show' : 'hide';
    var a = show ? 'activate' : 'deactivate';
    this._ingrCatWindow[m](); this._ingrCatWindow[a]();
    this._ingrWindow[m]();    this._ingrWindow.deactivate();
    this._workbenchWindow[m]();
  };

  window.Scene_CookingBase = Scene_CookingBase;

  //-----------------------------------------------------------------------------
  // Window_CookingZoneSelect (centre)
  //-----------------------------------------------------------------------------
  function Window_CookingZoneSelect() { this.initialize.apply(this, arguments); }
  Window_CookingZoneSelect.prototype = Object.create(Window_Selectable.prototype);
  Window_CookingZoneSelect.prototype.constructor = Window_CookingZoneSelect;

  Window_CookingZoneSelect.prototype.initialize = function (x, y, w, h) {
    this._data = ["Ingrédients", "Rôtisserie", "Casserole"];
    Window_Selectable.prototype.initialize.call(this, x, y, w, h);
    this.refresh();
    this.activate();
    this.select(0);
  };

  Window_CookingZoneSelect.prototype.maxItems = function () { return this._data ? this._data.length : 0; };
  Window_CookingZoneSelect.prototype.maxCols = function () { return 3; };
  Window_CookingZoneSelect.prototype.spacing = function () { return 24; };

  Window_CookingZoneSelect.prototype.itemRect = function (index) {
    var rect = new Rectangle();
    var cols = this.maxCols();
    var space = this.spacing();
    var wAvail = this.contentsWidth() - space * (cols - 1);
    var itemW = Math.floor(wAvail / cols);
    var itemH = Math.floor(this.contentsHeight() * 0.6);
    rect.width = itemW;
    rect.height = itemH;
    rect.x = (itemW + space) * (index % cols);
    rect.y = Math.floor((this.contentsHeight() - itemH) / 2);
    return rect;
  };

  Window_CookingZoneSelect.prototype.drawItem = function (index) {
    var rect = this.itemRect(index);
    var label = this._data[index];
    this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, "rgba(255,255,255,0.08)");
    this.changeTextColor(this.normalColor());
    this.contents.fontSize = 26;
    this.drawText(label, rect.x, rect.y + rect.height/2 - this.lineHeight()/2, rect.width, "center");
  };

  Window_CookingZoneSelect.prototype.update = function(){
    Window_Selectable.prototype.update.call(this);
    if (this.isOpenAndActive()){
      if (Input.isTriggered('left'))  this.cursorLeft(false);
      if (Input.isTriggered('right')) this.cursorRight(false);
    }
  };

  //-----------------------------------------------------------------------------
  // Window_CookingCategoryBar (barre horizontale Protéine / Végétaux / Condiment)
  //-----------------------------------------------------------------------------
  function Window_CookingCategoryBar(){ this.initialize.apply(this, arguments); }
  Window_CookingCategoryBar.prototype = Object.create(Window_HorzCommand.prototype);
  Window_CookingCategoryBar.prototype.constructor = Window_CookingCategoryBar;

  Window_CookingCategoryBar.prototype.initialize = function(x, y, width){
    this._forcedWidth = width || Graphics.boxWidth;
    Window_HorzCommand.prototype.initialize.call(this, x, y);
    this.select(0);
  };
  Window_CookingCategoryBar.prototype.windowWidth  = function(){ return this._forcedWidth; };
  Window_CookingCategoryBar.prototype.windowHeight = function(){ return this.fittingHeight(1); };
  Window_CookingCategoryBar.prototype.maxCols      = function(){ return 3; };

  Window_CookingCategoryBar.prototype.makeCommandList = function(){
    this.addCommand("Protéine",  'cat', true, 'protein');
    this.addCommand("Végétaux",  'cat', true, 'vegetal');
    this.addCommand("Condiment", 'cat', true, 'condiment');
  };

  Window_CookingCategoryBar.prototype.currentCategory = function(){ return this.currentExt(); };
  Window_CookingCategoryBar.prototype.setChangeHandler = function(handler){ this._onChange = handler; };

  // notifier le changement quand on bouge le curseur
  Window_CookingCategoryBar.prototype.cursorRight = function(wrap){
    Window_HorzCommand.prototype.cursorRight.call(this, wrap);
    if (this._onChange) this._onChange();
  };
  Window_CookingCategoryBar.prototype.cursorLeft = function(wrap){
    Window_HorzCommand.prototype.cursorLeft.call(this, wrap);
    if (this._onChange) this._onChange();
  };

  //-----------------------------------------------------------------------------
  // Window_CookingItemList (liste filtrée par catégorie)
  //-----------------------------------------------------------------------------
  function Window_CookingItemList(){ this.initialize.apply(this, arguments); }
  Window_CookingItemList.prototype = Object.create(Window_Selectable.prototype);
  Window_CookingItemList.prototype.constructor = Window_CookingItemList;

  Window_CookingItemList.prototype.initialize = function(x, y, w, h){
    this._category = 'protein';
    this._all = CookingIngredients;
    this._data = [];
    Window_Selectable.prototype.initialize.call(this, x, y, w, h);
    this.refresh();
  };

  Window_CookingItemList.prototype.setCategory = function(cat){
    this._category = cat || 'protein';
    this.refresh();
  };

  Window_CookingItemList.prototype.refresh = function(){
    this.makeItemList();
    Window_Selectable.prototype.refresh.call(this);
  };

  Window_CookingItemList.prototype.makeItemList = function(){
    var cat = this._category;
    this._data = this._all.filter(function(it){ return it.cat === cat; });
    this.createContents();
    this.drawAllItems();
  };

  Window_CookingItemList.prototype.maxItems = function(){ return this._data ? this._data.length : 0; };
  Window_CookingItemList.prototype.maxCols  = function(){ return 2; };
  Window_CookingItemList.prototype.item     = function(){ return this._data[this.index()]; };

  Window_CookingItemList.prototype.drawItem = function(index){
    var item = this._data[index];
    if(!item) return;
    var rect = this.itemRect(index);
    rect.width -= this.textPadding();
    this.resetTextColor();
    this.drawIngredientIcon(item.iconIndex, rect.x, rect.y + 2);
    this.drawText(item.name, rect.x + 36, rect.y, rect.width - 36, rect.height);
  };

  Window_CookingItemList.prototype.drawIngredientIcon = function(iconIndex, x, y){
    var bmp = ImageManager.loadPicture(ING_SHEET);
    if (!bmp.isReady()){ bmp.addLoadListener(this.refresh.bind(this)); return; }
    var sx = (iconIndex % ING_ICON_COLS) * ING_ICON_W;
    var sy = Math.floor(iconIndex / ING_ICON_COLS) * ING_ICON_H;
    this.contents.blt(bmp, sx, sy, ING_ICON_W, ING_ICON_H, x, y);
  };

  //-----------------------------------------------------------------------------
  // Window_CookingWorkbench (plan de travail)
  //-----------------------------------------------------------------------------
  function Window_CookingWorkbench(){ this.initialize.apply(this, arguments); }
  Window_CookingWorkbench.prototype = Object.create(Window_Base.prototype);
  Window_CookingWorkbench.prototype.constructor = Window_CookingWorkbench;

  Window_CookingWorkbench.prototype.initialize = function(x, y, w, h){
    Window_Base.prototype.initialize.call(this, x, y, w, h);
    this.refresh();
  };

  Window_CookingWorkbench.prototype.refresh = function(){
    this.contents.clear();
    var cw = this.contentsWidth(), ch = this.contentsHeight();
    // Titre
    this.changeTextColor(this.systemColor());
    this.drawText("Plan de travail", 0, 0, cw, "left");
    this.changeTextColor(this.normalColor());
    // Trois emplacements visuels (placeholder)
    var pad = 12, boxW = 64, boxH = 64;
    var totalW = boxW*3 + pad*2;
    var startX = Math.floor((cw - totalW)/2);
    var y = Math.floor((ch - boxH)/2);
    for (var i=0;i<3;i++){
      var x = startX + i*(boxW+pad);
      this.contents.fillRect(x, y, boxW, boxH, "rgba(255,255,255,0.10)");
    }
    // Astuce
    this.changeTextColor(this.textColor(7));
    this.drawText("(Dépose à venir)", 0, ch - this.lineHeight(), cw, "center");
    this.changeTextColor(this.normalColor());
  };

  //-----------------------------------------------------------------------------
  // Window_CookingBottomBar (objet tenu)
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

})();
