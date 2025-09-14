/*:
 * @plugindesc Cooking UI v2: zone centrale + Ingrédients + Plan de travail + Barre d’actions (vider main/plan/casserole/rôtisserie) + barre du bas.
 * @author RPG Maker AI Support
 *
 * @help
 * Appel : SceneManager.push(Scene_CookingBase)
 *
 * Nouveautés v2 :
 *  - Ajout d'une Barre d’actions visible UNIQUEMENT avec le sélecteur de zones.
 *  - Navigation vers la Barre d’actions depuis Window_CookingZoneSelect (↓) et retour (↑ ou Échap).
 *  - 4 actions : Vider la main, Vider le Plan de travail, Vider la Casserole, Vider la Rôtisserie.
 *  - États Casserole/Rôtisserie internes (placeholders) + fonctions de vidage.
 *  - Actualisation dynamique (actions grisées si rien à vider).
 *
 * Contrôles :
 *  - Zone centrale : ←/→ changer (Ingrédients / Rôtisserie / Casserole), Entrée valider, ↓ = aller aux Actions
 *  - Barre d’actions : ←/→ choisir | Entrée exécuter | ↑/Échap = retour Zones
 *  - Ingrédients : ←/→ changer de catégorie, Entrée = ouvrir la liste
 *  - Liste ingrédients : Entrée = tenir l'objet, Échap = retour aux catégories
 *  - Catégories (avec un objet tenu) : ↓ pour aller au Plan de travail
 *  - Plan de travail : Entrée = déposer, Échap = retour catégories
 */

(function () {
    "use strict";

    // --- Constantes de layout ---
    var BOTTOM_BAR_H = 72;     // barre du bas (objet tenu)
    var ACTION_BAR_H = 72;     // nouvelle barre d'actions (au-dessus de la barre du bas)
    var ACTION_BAR_MARGIN = 0;     // nouvelle barre d'actions (au-dessus de la barre du bas)
    
    var COOK_MODE_ZONES = 'zones';
    var COOK_MODE_INGR  = 'ingredients';
    var COOK_MODE_ROTI  = 'rotisserie';

    var tasteScoreRotisserie = null;
    var cookScoreRotisserie = null;

    // --- Liste d'ingrédients "hardcodée" + catégorie ---
    // cat: 'protein' | 'vegetal' | 'condiment'
    var CookingIngredients = [
        { id: 1,  name: "Viande de Sanglier",           cat: "protein",     iconIndex: 0, canRotisserie: true,  baseTasteScore : 10, targetCookingScore : 1000 },
        { id: 2,  name: "Pommes de terre",              cat: "vegetal",     iconIndex: 1, canRotisserie: false,  baseTasteScore : 5, targetCookingScore : 100 },
        { id: 3,  name: "Herbes Sauvages",              cat: "condiment",   iconIndex: 2, canRotisserie: false,  baseTasteScore : 3, targetCookingScore : 50 },
        { id: 4,  name: "Sel",                          cat: "condiment",   iconIndex: 3, canRotisserie: false,  baseTasteScore : 1, targetCookingScore : 10 },
        { id: 5,  name: "Poivre",                       cat: "condiment",   iconIndex: 4, canRotisserie: false,  baseTasteScore : 1, targetCookingScore : 10 },
        { id: 6,  name: "Eau",                          cat: "condiment",   iconIndex: 5, canRotisserie: false,  baseTasteScore : 0, targetCookingScore : 0 },

        { id: 7,  name: "Eau Salée",                    cat: "combinaison", iconIndex: 5, canRotisserie: false,  baseTasteScore : 2, targetCookingScore : 20 },
        { id: 8,  name: "Eau Poivrée",                  cat: "combinaison", iconIndex: 5, canRotisserie: false,  baseTasteScore : 2, targetCookingScore : 20 },
        { id: 9,  name: "Eau Aromatisée",               cat: "combinaison", iconIndex: 5, canRotisserie: false,  baseTasteScore : 4, targetCookingScore : 40 },
        { id: 10, name: "Eau Aromatisée Salée",         cat: "combinaison", iconIndex: 5, canRotisserie: false,  baseTasteScore : 6, targetCookingScore : 60 },
        { id: 11, name: "Eau Aromatisée Poivrée",       cat: "combinaison", iconIndex: 5, canRotisserie: false,  baseTasteScore : 6, targetCookingScore : 60 },
        { id: 12, name: "Eau Assaisonnée",              cat: "combinaison", iconIndex: 5, canRotisserie: false,  baseTasteScore : 4, targetCookingScore : 40 },
        { id: 13, name: "Eau Assaisonnée+",             cat: "combinaison", iconIndex: 5, canRotisserie: false,  baseTasteScore : 8, targetCookingScore : 80 },

        { id: 14, name: "Sanglier Salée",               cat: "combinaison", iconIndex: 0, canRotisserie: true,  baseTasteScore : 12, targetCookingScore : 1000 },
        { id: 15, name: "Sanglier Poivrée",             cat: "combinaison", iconIndex: 0, canRotisserie: true,  baseTasteScore : 12, targetCookingScore : 1000 },
        { id: 16, name: "Sanglier Aromatisée",          cat: "combinaison", iconIndex: 0, canRotisserie: true,  baseTasteScore : 14, targetCookingScore : 1000 },
        { id: 17, name: "Sanglier Aromatisée Salée",    cat: "combinaison", iconIndex: 0, canRotisserie: true,  baseTasteScore : 16, targetCookingScore : 1000 },
        { id: 18, name: "Sanglier Aromatisée Poivrée",  cat: "combinaison", iconIndex: 0, canRotisserie: true,  baseTasteScore : 16, targetCookingScore : 1000 },
        { id: 19, name: "Sanglier Assaisonnée",         cat: "combinaison", iconIndex: 0, canRotisserie: true,  baseTasteScore : 14, targetCookingScore : 1000 },
        { id: 20, name: "Sanglier Assaisonnée+",        cat: "combinaison", iconIndex: 0, canRotisserie: true,  baseTasteScore : 18, targetCookingScore : 1000 }
    ];

    // Planche d'icônes dédiée (img/pictures/Ingredients.png)
    var ING_SHEET = "Ingredients";
    var ING_ICON_W = 32;
    var ING_ICON_H = 32;
    var ING_ICON_COLS = 16;

    // --- État UI minimal : objet tenu (objet CookingIngredients) ---
    var CookingUI = {
        _held: null,
        heldItem: function () { return this._held; },
        setHeldItem: function (item) { this._held = item || null; },
        _heldTasteScore : null,
        heldTasteScore: function() { return this._heldTasteScore || 0; },
        setHeldTasteScore: function(score) { this._heldTasteScore = score; },
        _heldCookScoreRotisserie: null,
        heldCookScoreRotisserie: function() { return this._heldCookScoreRotisserie || 0; },
        setHeldCookScoreRotisserie: function(score) { this._heldCookScoreRotisserie = score; },
        clearHeld: function () {
            var had = !!this._held;
            this._held = null;
            this._heldTasteScore = null;
            this._heldCookScoreRotisserie = null;
            return had;
        }
    };
    window.CookingUI = CookingUI;

    // --- Règles de combinaison sur le Plan de travail ---
    // canPlace(base, top) : true si on peut poser "top" par-dessus "base"
    var WorkbenchRules = {
        // Nouvelle structure : topId -> { baseId: resultId }
        rules: {
            1: {},
            2: {},
            3: { // Herbes
                1: 16,
                6: 9,
                7: 10,
                8: 11,
                12: 13,
                14: 17,
                15: 18,
                19: 20
            },
            4: { // Sel
                1: 14,
                6: 7,
                8: 12,
                9: 10,
                11: 13,
                15: 19,
                16: 17,
                18: 20
            },
            5: { // Poivre
                1: 15,
                6: 8,
                7: 12,
                9: 11,
                10: 13,
                14: 19,
                16: 18,
                17: 20
            },
            6: {},
            7: {},
            8: {}
        },
        getResultId: function (base, top) {
            if (!top) return null;
            var baseId = (base && base.id) || base;
            var topId = (top && top.id) || top;
            var map = this.rules[topId] || {};
            var res = map[baseId];
            return (typeof res === 'number') ? res : null;
        },
        canPlace: function (base, top) {
            if (!top) return false;
            if (!base) return true; // plateau vide → on peut poser n'importe quoi
            return !!this.getResultId(base, top);
        }
    };



    // --- Règles de combinaison pour la rôtisserie (similaire au plan de travail)
    var RotisserieRules = {
        rules: {
            1: {},
            2: {},
            3: { // Herbes
                1: 16,
                6: 9,
                7: 10,
                8: 11,
                12: 13,
                14: 17,
                15: 18,
                19: 20
            },
            4: { // Sel
                1: 14,
                6: 7,
                8: 12,
                9: 10,
                11: 13,
                15: 19,
                16: 17,
                18: 20
            },
            5: { // Poivre
                1: 15,
                6: 8,
                7: 12,
                9: 11,
                10: 13,
                14: 19,
                16: 18,
                17: 20
            },
            6: {},
            7: {},
            8: {}
        },
        getResultId: function (base, top) {
            if (!top) return null;
            var baseId = (base && base.id) || base;
            var topId = (top && top.id) || top;
            var map = this.rules[topId] || {};
            var res = map[baseId];
            return (typeof res === 'number') ? res : null;
        },
        canPlace: function (base, top) {
            if (!top) return false;
            if (!base) return !!(top && top.canRotisserie); // vide -> viande only
            return !!this.getResultId(base, top);
        }
    };

    //-----------------------------------------------------------------------------
    // Scene_CookingBase
    //-----------------------------------------------------------------------------
    function Scene_CookingBase() { this.initialize.apply(this, arguments); }
    Scene_CookingBase.prototype = Object.create(Scene_Base.prototype);
    Scene_CookingBase.prototype.constructor = Scene_CookingBase;

    Scene_CookingBase.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
        // États internes placeholders pour Casserole/Rôtisserie
        this._pot = [];         // contenu casserole (simple pile pour l'instant)
        this._rotisserie = [];  // contenu rôtisserie (simple pile pour l'instant)
    };

    Scene_CookingBase.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createWindowLayer();
        this.createHelpWindow();
        this.createZoneWindow();
        this.createIngredientWindows();
        this.createRotisserieWindow();
        this.createRotisserieActionBar();
        this.createActionBar();
        this.createBottomBar();
    };

    // Cache/désactive tout sauf le groupe du mode demandé
    Scene_CookingBase.prototype.setUIMode = function(mode){
        this._uiMode = mode;

        // 1) Tout cacher/désactiver par défaut (sauf Help + BottomBar)
        var hide = function(w){ if (!w) return; w.hide(); w.deactivate(); };
        hide(this._zoneWindow);
        hide(this._ingrCatWindow);
        hide(this._ingrWindow);
        hide(this._workbenchWindow);
        hide(this._rotiWindow);
        this.setActionBarVisible(false);
        this.setRotiActionBarVisible(false);
        if (this._actionBar) this._actionBar.deactivate();
        if (this._rotiActionBar) this._rotiActionBar.deactivate();

        // 2) Mode Zones
        if (mode === COOK_MODE_ZONES){
            if (this._zoneWindow){ this._zoneWindow.show(); this._zoneWindow.activate(); }
            this.setActionBarVisible(true); // barre d’actions générale visible seulement ici
            if (this._helpWindow) this._helpWindow.setText("←/→ choisir | Entrée valider | ↓ Actions | Échap retour");
            this.refreshBottomBar();
            this.refreshActionBar();
            return;
        }

        // 3) Mode Ingrédients
        if (mode === COOK_MODE_INGR){
            this.showIngredientView(true);  // n’affiche que le trio catégories/liste/plan
            if (this._ingrCatWindow){ this._ingrCatWindow.activate(); this._ingrCatWindow.select(this._ingrCatWindow.index() || 0); }
            if (this._helpWindow) this._helpWindow.setText("Ingrédients : ←/→ catégorie | Entrée = ouvrir la liste | Échap = retour | ↓ Plan de travail");
            this.refreshBottomBar();
            this.refreshActionBar();
            return;
        }

        // 4) Mode Rôtisserie
        if (mode === COOK_MODE_ROTI){
            this.showRotisserieView(true);  // juste la rôtisserie
            if (this._rotiWindow){ this._rotiWindow.activate(); this._rotiWindow.select(0); }
            this.setRotiActionBarVisible(true); // barre ON/OFF dédiée
            this.refreshRotiActionBar();
            if (this._helpWindow) this._helpWindow.setText("Rôtisserie : Entrée = déposer/prendre | ↓ Actions | Échap = retour");
            this.refreshBottomBar();
            this.refreshActionBar();
            return;
        }
    };

    // --- Affichage/masquage synchronisé avec la vue Rôtisserie
    Scene_CookingBase.prototype.setRotiActionBarVisible = function(visible){
        if (!this._rotiActionBar) return;
        if (visible) {
            this._rotiActionBar.show();
            this._rotiActionBar.deactivate();
        } else {
            this._rotiActionBar.hide();
            this._rotiActionBar.deactivate();
        }
    };

    Scene_CookingBase.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
        this.centerSprite(this._backSprite);
        this.startFadeIn(this.fadeSpeed(), false);
        this.setUIMode(COOK_MODE_ZONES);
    };

    Scene_CookingBase.prototype.update = function () {
        Scene_Base.prototype.update.call(this);

        // Raccourci: depuis la barre de catégories, ↓ tente d'aller au Plan de travail
        if (this._ingrCatWindow && this._ingrCatWindow.active) {
            if (Input.isTriggered('down')) {
                var held = CookingUI.heldItem();
                // Nouveau comportement :
                //  - Si main vide ET plan de travail possède des items → on peut DESCENDRE pour PRENDRE
                //  - Si main pleine → on peut DESCENDRE seulement si canAccept(held)
                //  - Sinon → buzzer
                if (!held) {
                    if (this._workbenchWindow && this._workbenchWindow.hasItems()) {
                        this._ingrCatWindow.deactivate();
                        this._workbenchWindow.select(0);
                        this._workbenchWindow.activate();
                        this._helpWindow.setText("Plan de travail : Entrée = prendre | Échap = catégories");
                    } else {
                        SoundManager.playBuzzer();
                    }
                } else {
                    if (!this._workbenchWindow.canAccept(held)) {
                        SoundManager.playBuzzer();
                    } else {
                        this._ingrCatWindow.deactivate();
                        this._workbenchWindow.select(0);
                        this._workbenchWindow.activate();
                        this._helpWindow.setText("Plan de travail : Entrée = déposer | Échap = catégories");
                    }
                }
            }
        }

        // ↓ : Zones -> Barre d’actions
        if (this._zoneWindow && this._zoneWindow.active && this._actionBar && this._actionBar.visible) {
            if (Input.isTriggered('down')) {
                this._zoneWindow.deactivate();
                this._actionBar.select(0);
                this._actionBar.activate();
                this._helpWindow.setText("Actions : ←/→ choisir | Entrée exécuter | ↑/Échap retour");
            }
        }
        // ↑ : Barre d’actions -> Zones
        if (this._actionBar && this._actionBar.active) {
            if (Input.isTriggered('up')) {
                this.onActionCancel();
            }
        }

        
        // ↓ : Rôtisserie -> barre d’actions rôtisserie
        if (this._rotiWindow && this._rotiWindow.active && this._rotiActionBar && this._rotiActionBar.visible){
            if (Input.isTriggered('down')){
                this._rotiWindow.deactivate();
                this._rotiActionBar.select(0);
                this._rotiActionBar.activate();
                this._helpWindow.setText("Actions Rôtisserie : ←/→ choisir | Entrée exécuter | ↑ retour");
            }
        }
        // ↑ : barre d’actions rôtisserie -> Rôtisserie
        if (this._rotiActionBar && this._rotiActionBar.active){
            if (Input.isTriggered('up')){
                this.onRotiActionCancel();
            }
        }

        // Timer de cuisson : +1 par seconde quand ON et qu'il y a un item
        if (this._rotiIsOn && this._rotiWindow && this._rotiWindow.hasItems()){
            this._rotiCookFrames = (this._rotiCookFrames || 0) + 1;
            if (this._rotiCookFrames >= 60){
                this._rotiCookFrames = 0;
                cookScoreRotisserie = (cookScoreRotisserie == null) ? 0 : cookScoreRotisserie + 1;
                var top = this._rotiWindow.topItem && this._rotiWindow.topItem();
                var target = top && typeof top.targetCookingScore === 'number' ? top.targetCookingScore : '∞';
                console.log("[Rotisserie] cookScore = "+cookScoreRotisserie+" / target="+target);
            }
        }
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
        this._helpWindow.setText("←/→ choisir | Entrée valider | ↓ Actions | Échap retour");
        this.addWindow(this._helpWindow);
    };

    // --- Sélecteur de zone (centre) ---
    Scene_CookingBase.prototype.createZoneWindow = function () {
        var top = this._helpWindow.height;
        var h = Graphics.boxHeight - top - BOTTOM_BAR_H - ACTION_BAR_H; // réserve l'espace de la barre d'actions + bas
        this._zoneWindow = new Window_CookingZoneSelect(0, top, Graphics.boxWidth, h);
        this._zoneWindow.setHandler('ok', this.onZoneOk.bind(this));
        this._zoneWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._zoneWindow);
    };

    // --- Fenêtres de la vue "Ingrédients" ---
    Scene_CookingBase.prototype.createIngredientWindows = function () {
        var top = this._helpWindow.height;
        var zoneTop = top, zoneH = Graphics.boxHeight - top - BOTTOM_BAR_H; // la vue ingrédients n'utilise pas la barre d'actions
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
        var workH = 120;
        var listH = (zoneTop + zoneH) - listY - workH - 18;
        var listW = Graphics.boxWidth - margin * 2;
        this._ingrWindow = new Window_CookingItemList(margin, listY, listW, listH);
        this._ingrWindow.setHandler('ok', this.onIngredientOk.bind(this));
        this._ingrWindow.setHandler('cancel', this.onIngredientCancel.bind(this));
        this.addWindow(this._ingrWindow);

        // Plan de travail (sélectionnable)
        var workY = listY + listH + 6;
        this._workbenchWindow = new Window_CookingWorkbench(margin, workY, listW, workH);
        this._workbenchWindow.setHandler('ok', this.onWorkbenchOk.bind(this));
        this._workbenchWindow.setHandler('cancel', this.onWorkbenchCancel.bind(this));
        this.addWindow(this._workbenchWindow);

        // Cacher la vue Ingrédients au départ
        this.showIngredientView(false);
    };

    Scene_CookingBase.prototype.createActionBar = function () {
        var y = Graphics.boxHeight - BOTTOM_BAR_H - ACTION_BAR_H; // juste au-dessus de la barre du bas
        this._actionBar = new Window_CookingActionBar(0, y, Graphics.boxWidth, ACTION_BAR_H);
        // Handlers par symbole
        this._actionBar.setHandler('clearHand', this.doClearHand.bind(this));
        this._actionBar.setHandler('clearWorkbench', this.doClearWorkbench.bind(this));
        this._actionBar.setHandler('clearPot', this.doClearPot.bind(this));
        this._actionBar.setHandler('clearRoti', this.doClearRoti.bind(this));
        this._actionBar.setHandler('cancel', this.onActionCancel.bind(this));
        this.addWindow(this._actionBar);
        this._actionBar.hide();
        this._actionBar.deactivate(); // IMPORTANT : inactive par défaut pour éviter la double prise des flèches
        this._actionBar.select(0);
    };

    Scene_CookingBase.prototype.createBottomBar = function () {
        var h = BOTTOM_BAR_H;
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
        if (index === 0) {                 // Ingrédients
            this.setUIMode(COOK_MODE_INGR);
            var cat = this._ingrCatWindow.currentCategory() || 'protein';
            this._ingrWindow.setCategory(cat);
        } else if (index === 1) {          // Rôtisserie
            this.setUIMode(COOK_MODE_ROTI);
        } else if (index === 2) {          // Casserole (placeholder)
            SoundManager.playOk();
            this._helpWindow.setText("Casserole : (placeholder) Déposer l'objet tenu ici.");
        }
    };

    Scene_CookingBase.prototype.openIngredients = function () {
        this.setUIMode(COOK_MODE_INGR);
        var cat = this._ingrCatWindow.currentCategory() || 'protein';
        this._ingrWindow.setCategory(cat);
    };

    // Catégories -> Liste
    Scene_CookingBase.prototype.onCategoryOk = function () {
        this._helpWindow.setText("Sélectionne un ingrédient | Entrée = tenir | Échap = catégories");
        this._ingrWindow.select(0);
        this._ingrWindow.activate();
    };

    // Changement de catégorie
    Scene_CookingBase.prototype.onCategoryChanged = function () {
        var cat = this._ingrCatWindow.currentCategory();
        this._ingrWindow.setCategory(cat);
    };

    // Liste -> tenir l'objet
    Scene_CookingBase.prototype.onIngredientOk = function () {
        var item = this._ingrWindow.item();
        if (item) {
            SoundManager.playOk();
            CookingUI.setHeldItem(item);
            CookingUI.setHeldTasteScore(item.baseTasteScore);
            this.refreshBottomBar();
        } else {
            SoundManager.playBuzzer();
        }
        this._ingrWindow.deselect();
        this._ingrWindow.deactivate();
        this._ingrCatWindow.activate();
        this._helpWindow.setText("Ingrédients : ←/→ catégorie | Entrée = ouvrir la liste | Échap = retour | ↓ Plan de travail");
    };

    // Liste -> retour catégories
    Scene_CookingBase.prototype.onIngredientCancel = function () {
        this._ingrWindow.deactivate();
        this._ingrCatWindow.activate();
        this._helpWindow.setText("Ingrédients : ←/→ catégorie | Entrée = ouvrir la liste | Échap = retour | ↓ Plan de travail");
    };

    // Catégories -> quitter vue Ingrédients
    Scene_CookingBase.prototype.onIngredientViewCancel = function () {
        this.setUIMode(COOK_MODE_ZONES);
    };

    // Plan de travail -> déposer
    Scene_CookingBase.prototype.onWorkbenchOk = function () {
        var held = CookingUI.heldItem();
        // Main vide → PRENDRE depuis le plan de travail (si dispo)
        if (!held) {
            if (this._workbenchWindow && this._workbenchWindow.hasItems()) {
                var taken = this._workbenchWindow.takeTop();
                if (taken) {
                    CookingUI.setHeldItem(taken);
                    CookingUI.setHeldTasteScore(taken.baseTasteScore);
                    this.refreshBottomBar();
                    SoundManager.playOk();
                } else {
                    SoundManager.playBuzzer();
                    return;
                }
            } else {
                SoundManager.playBuzzer();
                return;
            }
        } else {
            // Main pleine → tenter de DÉPOSER
            if (this._workbenchWindow.placeHeldItem(held)) {
                CookingUI.setHeldItem(null);
                CookingUI.setHeldTasteScore(null);
                this.refreshBottomBar();
                SoundManager.playOk();
            } else {
                SoundManager.playBuzzer();
                return; // on reste ici si refusé
            }
        }

        // Retour propre sur la barre catégories, forcée sur "protein"
        this._workbenchWindow.deselect();
        this._workbenchWindow.deactivate();

        if (this._ingrCatWindow.selectByExt) {
            this._ingrCatWindow.selectByExt('protein');
        } else {
            this._ingrCatWindow.select(0);
            this.onCategoryChanged();
        }

        this._ingrCatWindow.activate();
        this._helpWindow.setText("Ingrédients : ←/→ catégorie | Entrée = ouvrir la liste | Échap = retour | ↓ Plan de travail");
    };

    // Plan de travail -> retour catégories
    Scene_CookingBase.prototype.onWorkbenchCancel = function () {
        this._workbenchWindow.deactivate();
        this._ingrCatWindow.activate();
        this._helpWindow.setText("Ingrédients : ←/→ catégorie | Entrée = ouvrir la liste | Échap = retour | ↓ Plan de travail");
    };

    Scene_CookingBase.prototype.refreshBottomBar = function () {
        this._bottomBar.setHeldItem(CookingUI.heldItem());
        this.refreshActionBar();
    };

    Scene_CookingBase.prototype.refreshActionBar = function () {
        if (!this._actionBar) return;
        var flags = {
            hand: !!CookingUI.heldItem(),
            bench: this._workbenchWindow && this._workbenchWindow.hasItems(),
            pot:   false, // placeholder tant que la Casserole n'est pas implémentée
            roti:  this._rotiWindow && this._rotiWindow.hasItems()
        };
        this._actionBar.setEnabledStates(flags);
    };

    Scene_CookingBase.prototype.setActionBarVisible = function (visible) {
        if (!this._actionBar) return;
        if (visible) {
            this._actionBar.show();
            this._actionBar.deactivate(); // visible mais ne capte rien tant qu'on n'appuie pas sur ↓
        } else {
            this._actionBar.hide();
            this._actionBar.deactivate();
        }
    };

    Scene_CookingBase.prototype.showIngredientView = function (show) {
        var m = show ? 'show' : 'hide';
        var a = show ? 'activate' : 'deactivate';
        if (this._ingrCatWindow){ this._ingrCatWindow[m](); this._ingrCatWindow[a](); }
        if (this._ingrWindow){    this._ingrWindow[m]();    this._ingrWindow.deactivate(); }
        if (this._workbenchWindow){ this._workbenchWindow[m](); this._workbenchWindow.deactivate(); }
    };

    // --- Actions ---
    Scene_CookingBase.prototype.doClearHand = function () {
        var msg;
        if (CookingUI.clearHeld()) {
            SoundManager.playOk();
            this.refreshBottomBar();
            msg = "Main vidée.";
        } else {
            SoundManager.playBuzzer();
            msg = "Rien en main.";
        }
        this.refreshActionBar();
        this.returnToZoneFromAction(msg);
    };

    Scene_CookingBase.prototype.doClearWorkbench = function () {
        var ok = this._workbenchWindow && this._workbenchWindow.clearAll();
        var msg;
        if (ok) {
            SoundManager.playOk();
            msg = "Plan de travail vidé.";
        } else {
            SoundManager.playBuzzer();
            msg = "Plan de travail déjà vide.";
        }
        this.refreshActionBar();
        this.returnToZoneFromAction(msg);
    };

    Scene_CookingBase.prototype.doClearPot = function () {
        var had = this._pot && this._pot.length > 0;
        this._pot = [];
        var msg;
        if (had) {
            SoundManager.playOk();
            msg = "Casserole vidée.";
        } else {
            SoundManager.playBuzzer();
            msg = "Casserole déjà vide.";
        }
        this.refreshActionBar();
        this.returnToZoneFromAction(msg);
    };

    Scene_CookingBase.prototype.doClearRoti = function () {
        var ok = this._rotiWindow && this._rotiWindow.clearAll();
        var msg;
        if (ok) {
            SoundManager.playOk();
            msg = "Rôtisserie vidée.";
        } else {
            SoundManager.playBuzzer();
            msg = "Rôtisserie déjà vide.";
        }
        this.refreshActionBar();
        this.returnToZoneFromAction(msg);
        this._rotiIsOn = false;                  
        cookScoreRotisserie = null;              
        tasteScoreRotisserie = null;             
        this.refreshRotiActionBar();      
    };

    Scene_CookingBase.prototype.onActionCancel = function () {
        this.setUIMode(COOK_MODE_ZONES);
    };

    // Revenir proprement aux Zones après une action
    Scene_CookingBase.prototype.returnToZoneFromAction = function (message) {
        this.setUIMode(COOK_MODE_ZONES);
        if (this._helpWindow) {
            this._helpWindow.setText(message || "←/→ choisir | Entrée valider | ↓ Actions | Échap retour");
        }
    };

    // NEW: Création de la fenêtre Rôtisserie
    Scene_CookingBase.prototype.createRotisserieWindow = function () {
        var top = this._helpWindow.height;
        var y   = top + 24;
        var h   = Graphics.boxHeight - top - BOTTOM_BAR_H - ACTION_BAR_H - 48;
        var x   = 24;
        var w   = Graphics.boxWidth - 48;

        this._rotiWindow = new Window_CookingRotisserie(x, y, w, h);
        this._rotiWindow.setHandler('ok',     this.onRotisserieOk.bind(this));
        this._rotiWindow.setHandler('cancel', this.onRotisserieCancel.bind(this));
        this.addWindow(this._rotiWindow);
        this._rotiWindow.hide();
        this._rotiWindow.deactivate();
    };

    Scene_CookingBase.prototype.createRotisserieActionBar = function(){
        var y = Graphics.boxHeight - BOTTOM_BAR_H - ACTION_BAR_H;
        this._rotiActionBar = new Window_RotisserieActionBar(0, y, Graphics.boxWidth, ACTION_BAR_H);
        this._rotiActionBar.setHandler('rotiOn',  this.doRotiOn.bind(this));
        this._rotiActionBar.setHandler('rotiOff', this.doRotiOff.bind(this));
        this._rotiActionBar.setHandler('cancel',  this.onRotiActionCancel.bind(this));
        this.addWindow(this._rotiActionBar);
        this._rotiActionBar.hide();
        this._rotiActionBar.deactivate();
        this._rotiActionBar.select(0);
    };

    Scene_CookingBase.prototype.showRotisserieView = function (show) {
        var m = show ? 'show' : 'hide';
        var a = show ? 'activate' : 'deactivate';
        if (this._rotiWindow){ this._rotiWindow[m](); this._rotiWindow[a](); }
    };
        
    // --- État/mise à jour des boutons Allumer/Éteindre
    Scene_CookingBase.prototype.refreshRotiActionBar = function(){
        if (!this._rotiActionBar) return;
        this._rotiActionBar.setPowerState(!!this._rotiIsOn);
    };

    // NEW: handlers Rôtisserie
    Scene_CookingBase.prototype.onRotisserieOk = function () {
        var held = CookingUI.heldItem();
        var success = false;

        if (!held) {
            // Main vide -> PRENDRE
            if (this._rotiWindow && this._rotiWindow.hasItems()) {
                var taken = this._rotiWindow.takeTop();
                if (taken) {
                    CookingUI.setHeldItem(taken);
                    CookingUI.setHeldTasteScore(tasteScoreRotisserie);
                    // NEW: emporte aussi le score de cuisson
                    CookingUI.setHeldCookScoreRotisserie(cookScoreRotisserie);

                    this.refreshBottomBar();
                    success = true;

                    // Si plus rien sur la broche, on éteint et on remet à zéro le score courant
                    if (!this._rotiWindow.hasItems()){
                        this._rotiIsOn = false;
                        cookScoreRotisserie = null;
                        this.refreshRotiActionBar();
                    }
                }
            }
        } else {
            // Main pleine -> DÉPOSER
            if (this._rotiWindow.placeHeldItem(held)) {
                // NEW: le score de cuisson courant repart de 0 si absent
                if (cookScoreRotisserie === null) cookScoreRotisserie = 0;

                CookingUI.setHeldTasteScore(null);
                CookingUI.setHeldCookScoreRotisserie(null); // NEW
                CookingUI.setHeldItem(null);
                this.refreshBottomBar();
                success = true;
            }
        }

        if (success) SoundManager.playOk();
        else SoundManager.playBuzzer();

        // IMPORTANT : toujours remettre la fenêtre dans un état stable
        this._rotiWindow.select(0);
        this._rotiWindow.activate();
        this._helpWindow.setText("Rôtisserie : Entrée = déposer/prendre | Échap = retour");
    };

    Scene_CookingBase.prototype.onRotisserieCancel = function () {
        this.setUIMode(COOK_MODE_ZONES);
    };

    
    // --- Handlers ON/OFF
    Scene_CookingBase.prototype.doRotiOn = function(){
        if (!this._rotiWindow || !this._rotiWindow.hasItems()) { SoundManager.playBuzzer(); return; }
        if (cookScoreRotisserie === null) cookScoreRotisserie = 0;
        this._rotiIsOn = true;
        console.log("[Rotisserie] ON (cookScore="+cookScoreRotisserie+")");
        this.refreshRotiActionBar();
        this.onRotiActionCancel(); // retour à la grille
    };

    Scene_CookingBase.prototype.doRotiOff = function(){
        this._rotiIsOn = false;
        console.log("[Rotisserie] OFF (cookScore="+cookScoreRotisserie+")");
        this.refreshRotiActionBar();
        this.onRotiActionCancel();
    };

    Scene_CookingBase.prototype.onRotiActionCancel = function(){
        if (this._rotiActionBar) this._rotiActionBar.deactivate();
        if (this._rotiWindow)    { this._rotiWindow.activate(); this._rotiWindow.select(0); }
        if (this._helpWindow)    this._helpWindow.setText("Rôtisserie : Entrée = déposer/prendre | ↓ Actions | Échap = retour");
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
        this.drawText(label, rect.x, rect.y + rect.height / 2 - this.lineHeight() / 2, rect.width, "center");
    };

    //-----------------------------------------------------------------------------
    // Window_CookingActionBar (nouvelle barre d’actions, 4 boutons)
    //-----------------------------------------------------------------------------
    function Window_CookingActionBar() { this.initialize.apply(this, arguments); }
    Window_CookingActionBar.prototype = Object.create(Window_HorzCommand.prototype);
    Window_CookingActionBar.prototype.constructor = Window_CookingActionBar;

    Window_CookingActionBar.prototype.initialize = function (x, y, width, height) {
        this._forcedWidth = width || Graphics.boxWidth;
        this._enabled = { hand: false, bench: false, pot: false, roti: false };
        Window_HorzCommand.prototype.initialize.call(this, x, y);
        this.select(0);
        this.openness = 255;
    };
    Window_CookingActionBar.prototype.windowWidth = function () { return this._forcedWidth; };
    Window_CookingActionBar.prototype.windowHeight = function () { return this.fittingHeight(1) + ACTION_BAR_MARGIN; };
    Window_CookingActionBar.prototype.maxCols = function () { return 4; };
    Window_CookingActionBar.prototype.spacing = function () { return 20; };

    Window_CookingActionBar.prototype.setEnabledStates = function (flags) {
        // flags = {hand, bench, pot, roti}
        this._enabled = this._enabled || {};
        this._enabled.hand = !!flags.hand;
        this._enabled.bench = !!flags.bench;
        this._enabled.pot = !!flags.pot;
        this._enabled.roti = !!flags.roti;
        this.refresh();
    };

    Window_CookingActionBar.prototype.makeCommandList = function () {
        var en = this._enabled || { hand: false, bench: false, pot: false, roti: false };
        this.addCommand("Vider Main", 'clearHand', en.hand);
        this.addCommand("Vider Plan", 'clearWorkbench', en.bench);
        this.addCommand("Vider Casserole", 'clearPot', en.pot);
        this.addCommand("Vider Rôtisserie", 'clearRoti', en.roti);
    };

    // Petite touche visuelle
    Window_CookingActionBar.prototype.drawItem = function (index) {
        var rect = this.itemRectForText(index);
        var enabled = this.isCommandEnabled(index);
        this.changePaintOpacity(enabled);
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
        this.changePaintOpacity(true);
    };
    // Empêche la barre d’actions de traiter les entrées quand elle n'est pas active
    Window_CookingActionBar.prototype.processHandling = function () {
        if (!this.active) return;
        Window_HorzCommand.prototype.processHandling.call(this);
    };

    //-----------------------------------------------------------------------------
    function Window_CookingCategoryBar() {
        // Robust constructor: si initialize n'est pas encore assignée, on appelle le parent
        var x = arguments[0] || 0, y = arguments[1] || 0, width = arguments[2];
        this._forcedWidth = width || Graphics.boxWidth;
        if (this.initialize && this.initialize.apply) {
            this.initialize.apply(this, arguments);
        } else {
            Window_HorzCommand.prototype.initialize.call(this, x, y);
            this.select(0);
        }
    }
    Window_CookingCategoryBar.prototype = Object.create(Window_HorzCommand.prototype);
    Window_CookingCategoryBar.prototype.constructor = Window_CookingCategoryBar;

    Window_CookingCategoryBar.prototype.initialize = function (x, y, width) {
        this._forcedWidth = width || Graphics.boxWidth;
        Window_HorzCommand.prototype.initialize.call(this, x, y);
        this.select(0);
    };
    Window_CookingCategoryBar.prototype.windowWidth = function () { return this._forcedWidth; };
    Window_CookingCategoryBar.prototype.windowHeight = function () { return this.fittingHeight(1); };
    Window_CookingCategoryBar.prototype.maxCols = function () { return 3; };

    Window_CookingCategoryBar.prototype.makeCommandList = function () {
        this.addCommand("Protéine", 'cat', true, 'protein');
        this.addCommand("Végétaux", 'cat', true, 'vegetal');
        this.addCommand("Condiment", 'cat', true, 'condiment');
    };

    Window_CookingCategoryBar.prototype.currentCategory = function () { return this.currentExt(); };
    Window_CookingCategoryBar.prototype.setChangeHandler = function (handler) { this._onChange = handler; };
    Window_CookingCategoryBar.prototype.cursorRight = function (wrap) {
        Window_HorzCommand.prototype.cursorRight.call(this, wrap);
        if (this._onChange) this._onChange();
    };
    Window_CookingCategoryBar.prototype.cursorLeft = function (wrap) {
        Window_HorzCommand.prototype.cursorLeft.call(this, wrap);
        if (this._onChange) this._onChange();
    };
    // Barre catégories
    Window_CookingCategoryBar.prototype.selectByExt = function (ext) {
        for (var i = 0; i < this._list.length; i++) {
            if (this._list[i].ext === ext) {
                this.select(i);
                if (this._onChange) this._onChange(); // notifie le changement
                return;
            }
        }
    };

    //-----------------------------------------------------------------------------
    // Window_CookingItemList (filtrée par catégorie)
    //-----------------------------------------------------------------------------
    function Window_CookingItemList() { this.initialize.apply(this, arguments); }
    Window_CookingItemList.prototype = Object.create(Window_Selectable.prototype);
    Window_CookingItemList.prototype.constructor = Window_CookingItemList;

    Window_CookingItemList.prototype.initialize = function (x, y, w, h) {
        this._category = 'protein';
        this._all = CookingIngredients;
        this._data = [];
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this.refresh();
    };

    Window_CookingItemList.prototype.setCategory = function (cat) {
        this._category = cat || 'protein';
        this.refresh();
    };

    Window_CookingItemList.prototype.refresh = function () {
        this.makeItemList();
        Window_Selectable.prototype.refresh.call(this);
    };

    Window_CookingItemList.prototype.makeItemList = function () {
        var cat = this._category;
        // N'affiche JAMAIS les ingrédients de type 'combinaison' dans les listes de base
        this._data = this._all.filter(function (it) { return it.cat === cat && it.cat !== 'combinaison'; });
        this.createContents();
        this.drawAllItems();
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

    //-----------------------------------------------------------------------------
    // Window_CookingWorkbench (Plan de travail, 1 slot empilable)
    //-----------------------------------------------------------------------------
    function Window_CookingWorkbench() { this.initialize.apply(this, arguments); }
    Window_CookingWorkbench.prototype = Object.create(Window_Selectable.prototype);
    Window_CookingWorkbench.prototype.constructor = Window_CookingWorkbench;

    Window_CookingWorkbench.prototype.initialize = function (x, y, w, h) {
        this._stack = []; // [base, ...]
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this.refresh();
    };

    Window_CookingWorkbench.prototype.maxItems = function () { return 1; };
    Window_CookingWorkbench.prototype.maxCols = function () { return 1; };

    Window_CookingWorkbench.prototype.itemRect = function (index) {
        var rect = new Rectangle();
        var boxW = 96, boxH = 72;
        rect.width = boxW;
        rect.height = boxH;
        rect.x = Math.floor((this.contentsWidth() - boxW) / 2);
        rect.y = Math.floor((this.contentsHeight() - boxH) / 2);
        return rect;
    };

    Window_CookingWorkbench.prototype.refresh = function () {
        this.contents.clear();
        var rect = this.itemRect(0);
        // cadre
        this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, "rgba(255,255,255,0.10)");
        this.changeTextColor(this.systemColor());
        this.drawText("Plan de travail", 0, 0, this.contentsWidth(), "left");
        this.changeTextColor(this.normalColor());

        if (this._stack.length > 0) {
            // Dessiner la pile (jusqu'à 3 icônes)
            var maxIcons = Math.min(3, this._stack.length);
            for (var i = 0; i < maxIcons; i++) {
                var it = this._stack[this._stack.length - 1 - i]; // du haut vers le bas
                var dx = rect.x + 8 + i * 18;
                var dy = rect.y + 8 + i * 6;
                this.drawIngredientIcon(it.iconIndex, dx, dy);
            }
            // Nom du top
            var top = this._stack[this._stack.length - 1];
            this.drawText(top.name, rect.x + 8, rect.y + rect.height - this.lineHeight(), rect.width - 16, "center");
        } else {
            this.changeTextColor(this.textColor(7));
            this.drawText("(vide)", rect.x, rect.y + rect.height / 2 - this.lineHeight() / 2, rect.width, "center");
            this.changeTextColor(this.normalColor());
        }
    };

    Window_CookingWorkbench.prototype.drawIngredientIcon = function (iconIndex, x, y) {
        var bmp = ImageManager.loadPicture(ING_SHEET);
        if (!bmp.isReady()) { bmp.addLoadListener(this.refresh.bind(this)); return; }
        var sx = (iconIndex % ING_ICON_COLS) * ING_ICON_W;
        var sy = Math.floor(iconIndex / ING_ICON_COLS) * ING_ICON_H;
        this.contents.blt(bmp, sx, sy, ING_ICON_W, ING_ICON_H, x, y);
    };

    // Peut-on accepter cet ingrédient maintenant ?
    Window_CookingWorkbench.prototype.canAccept = function (item) {
        var base = this._stack.length ? this._stack[this._stack.length - 1] : null;
        return WorkbenchRules.canPlace(base, item);
    };

    // Tente de placer l'objet tenu
    Window_CookingWorkbench.prototype.placeHeldItem = function (item) {
        if (this._stack.length === 0) {
            // Plateau vide → on pose simplement
            this._stack.push(item);
            this.refresh();
            return true;
        }

        // Sinon, tentative de combinaison base+top → résultat
        var base = this._stack[this._stack.length - 1];
        
        var resId = WorkbenchRules.getResultId(base, item);
        if (!resId) return false; // combinaison impossible
        // Résout l'objet résultat par id
        var result = null;
        for (var i = 0; i < CookingIngredients.length; i++) {
            if (CookingIngredients[i].id === resId) { result = CookingIngredients[i]; break; }
        }
        if (!result) return false; // id inconnu
        this._stack[this._stack.length - 1] = result; // remplace le sommet par le résultat
        this.refresh();
        return true;
    };

    Window_CookingWorkbench.prototype.hasItems = function () { return this._stack.length > 0; };
    Window_CookingWorkbench.prototype.clearAll = function () {
        if (this._stack.length === 0) return false;
        this._stack = [];
        this.refresh();
        return true;
    };

    // Prendre le dessus de la pile
    Window_CookingWorkbench.prototype.takeTop = function () {
        if (this._stack.length === 0) return null;
        var it = this._stack.pop();
        this.refresh();
        return it || null;
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

    //-----------------------------------------------------------------------------
    // NEW: Window_CookingRotisserie (1 slot empilable, démarrage viande only)
    //-----------------------------------------------------------------------------
    function Window_CookingRotisserie() { this.initialize.apply(this, arguments); }
    Window_CookingRotisserie.prototype = Object.create(Window_Selectable.prototype);
    Window_CookingRotisserie.prototype.constructor = Window_CookingRotisserie;

    Window_CookingRotisserie.prototype.initialize = function (x, y, w, h) {
        this._stack = []; // [base, ...]
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this.refresh();
    };

    Window_CookingRotisserie.prototype.maxItems = function () { return 1; };
    Window_CookingRotisserie.prototype.maxCols  = function () { return 1; };

    Window_CookingRotisserie.prototype.itemRect = function () {
        var rect = new Rectangle();
        var boxW = 96, boxH = 72;
        rect.width  = boxW;
        rect.height = boxH;
        rect.x = Math.floor((this.contentsWidth()  - boxW) / 2);
        rect.y = Math.floor((this.contentsHeight() - boxH) / 2);
        return rect;
    };

    Window_CookingRotisserie.prototype.refresh = function () {
        this.contents.clear();
        var rect = this.itemRect(0);
        // cadre
        this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, "rgba(255,255,255,0.10)");
        this.changeTextColor(this.systemColor());
        this.drawText("Rôtisserie", 0, 0, this.contentsWidth(), "left");
        this.changeTextColor(this.normalColor());

        if (this._stack.length > 0) {
            var maxIcons = Math.min(3, this._stack.length);
            for (var i = 0; i < maxIcons; i++) {
                var it = this._stack[this._stack.length - 1 - i];
                var dx = rect.x + 8 + i * 18;
                var dy = rect.y + 8 + i * 6;
                this.drawIngredientIcon(it.iconIndex, dx, dy);
            }
            var top = this._stack[this._stack.length - 1];
            this.drawText(top.name, rect.x + 8, rect.y + rect.height - this.lineHeight(), rect.width - 16, "center");
        } else {
            this.changeTextColor(this.textColor(7));
            this.drawText("(vide — viande uniquement)", rect.x, rect.y + rect.height / 2 - this.lineHeight() / 2, rect.width, "center");
            this.changeTextColor(this.normalColor());
        }
    };

    Window_CookingRotisserie.prototype.drawIngredientIcon = function (iconIndex, x, y) {
        var bmp = ImageManager.loadPicture(ING_SHEET);
        if (!bmp.isReady()) { bmp.addLoadListener(this.refresh.bind(this)); return; }
        var sx = (iconIndex % ING_ICON_COLS) * ING_ICON_W;
        var sy = Math.floor(iconIndex / ING_ICON_COLS) * ING_ICON_H;
        this.contents.blt(bmp, sx, sy, ING_ICON_W, ING_ICON_H, x, y);
    };

    // Peut-on accepter cet ingrédient maintenant ?
    Window_CookingRotisserie.prototype.canAccept = function (item) {
        var base = this._stack.length ? this._stack[this._stack.length - 1] : null;
        return RotisserieRules.canPlace(base, item);
    };

    // Tenter de placer l'objet tenu
    Window_CookingRotisserie.prototype.placeHeldItem = function (item) {
        if (this._stack.length === 0) {
            if (!item || !item.canRotisserie) return false; // démarrage viande only
            
            tasteScoreRotisserie = CookingUI.heldTasteScore();
            cookScoreRotisserie  = (CookingUI.heldCookScoreRotisserie && CookingUI.heldCookScoreRotisserie()) || 0; // NEW
            console.log("tasteScoreRotisserie : "+ tasteScoreRotisserie)
            this._stack.push(item);
            this.refresh();
            return true;
        }

        var base  = this._stack[this._stack.length - 1];
        var resId = RotisserieRules.getResultId(base, item);
        if (!resId) return false;
        var result = null;
        for (var i = 0; i < CookingIngredients.length; i++) {
            if (CookingIngredients[i].id === resId) { result = CookingIngredients[i]; break; }
        }
        if (!result) return false;
        
        tasteScoreRotisserie += item.baseTasteScore;
        console.log("tasteScoreRotisserie : "+ tasteScoreRotisserie)
        this._stack[this._stack.length - 1] = result;
        this.refresh();
        return true;
    };

    Window_CookingRotisserie.prototype.hasItems = function () { return this._stack.length > 0; };
    Window_CookingRotisserie.prototype.clearAll = function () {
        if (this._stack.length === 0) return false;
        this._stack = [];
        this.refresh();
        return true;
    };
    Window_CookingRotisserie.prototype.takeTop = function () {
        if (this._stack.length === 0) return null;
        var it = this._stack.pop();
        this.refresh();
        return it || null;
    };

    // NEW: utilitaires Rôtisserie
    Window_CookingRotisserie.prototype.topItem = function(){
        return this._stack.length ? this._stack[this._stack.length-1] : null;
    };


    //-----------------------------------------------------------------------------
// NEW: Window_RotisserieActionBar (Allumer / Éteindre)
//-----------------------------------------------------------------------------
function Window_RotisserieActionBar() { this.initialize.apply(this, arguments); }
Window_RotisserieActionBar.prototype = Object.create(Window_HorzCommand.prototype);
Window_RotisserieActionBar.prototype.constructor = Window_RotisserieActionBar;

Window_RotisserieActionBar.prototype.initialize = function(x, y, width){
    this._forcedWidth = width || Graphics.boxWidth;
    this._isOn = false;
    Window_HorzCommand.prototype.initialize.call(this, x, y);
    this.select(0);
    this.openness = 255;
};

Window_RotisserieActionBar.prototype.windowWidth  = function(){ return this._forcedWidth; };
Window_RotisserieActionBar.prototype.windowHeight = function(){ return this.fittingHeight(1) + ACTION_BAR_MARGIN; }; // identique aux autres
Window_RotisserieActionBar.prototype.maxCols      = function(){ return 2; };
Window_RotisserieActionBar.prototype.spacing      = function(){ return 20; };

Window_RotisserieActionBar.prototype.setPowerState = function(isOn){
    this._isOn = !!isOn;
    this.refresh();
};

Window_RotisserieActionBar.prototype.makeCommandList = function(){
    this.addCommand("Allumer",  'rotiOn',  !this._isOn);
    this.addCommand("Éteindre", 'rotiOff',  this._isOn);
};

Window_RotisserieActionBar.prototype.drawItem = function(index){
    var rect = this.itemRectForText(index);
    var enabled = this.isCommandEnabled(index);
    this.changePaintOpacity(enabled);
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
    this.changePaintOpacity(true);
};

// N'accepte l'input que quand elle est active (même pattern que ta barre d'actions)
Window_RotisserieActionBar.prototype.processHandling = function(){
    if (!this.active) return;
    Window_HorzCommand.prototype.processHandling.call(this);
};

})();
