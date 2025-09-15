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
    // === Couleurs et réglages (en haut du plugin idéalement) ===
    // Tolérance de cuisson (±10% autour de la cible)
    var COOK_TOLERANCE = 0.10;          // si déjà présent, garde ta valeur


    // Gabarit de la forme : (position en % de z, valeur y)
    const TEMPLATE_COOK_CURVE = [
        [0.00, 0.00],
        [0.15, 0.51],
        [0.50, 1.00],
        [0.65, 0.49],
        [0.85, 0.21],
        [1.00, 0.00],
    ];


    // Échelle fixe: toute la largeur = 2000 "points" de cuisson
    var MAX_COOK_SCALE = 200;
    var HELP_LINES = 1;   // hauteur visible (1 ou 2 lignes)
    var HELP_FONT_SIZE = 22;  // taille de police de la fenêtre d’aide
    var HELP_SCROLL_SPEED = 0.6; // pixels par frame (0.5–1.0 est doux)
    var HELP_SCROLL_WAIT = 45;  // pause (en frames) en haut et en bas
    var HELP_SCROLL_GAP = 12;  // espace entre 2 copies pour la boucle

    // Couleurs
    var COLOR_BLUE_RAW = "#2f7afc";
    var COLOR_GREEN_GOOD = "#34d399";     // zone parfaite (uniforme)
    var COLOR_RED_OVER = "#ff5b5b";
    var COLOR_BLACK_BURN = "#000000";
    var COLOR_FUTURE_GRAY = "#3a403e";   // gris opaque pour masquer le futur

    // --- Réglages visuels de la barre de cuisson ---
    var COOK_VISUAL = {
        // 1) Accentuation : >1 = zone verte plus fine (1 = inchangé)
        GREEN_GAMMA: 2.4,
        // 2) Même si cookFunction1=1, on ne "verdit" jamais à 100% (0..1)
        MIX_MAX: 0.85,
        // 3) Si tu veux garder un mini-plateau vert autour de target:
        //    0 = aucun plateau ; 0.2 = 20% de l'ex-zone tolérance
        FLAT_RATIO: 0.0,
        // 4) Optionnel: si tu veux une tolérance d'affichage plus petite que la logique
        //    (n’influe QUE l’affichage quand FLAT_RATIO > 0)
        TOL_RATIO_VISUAL: 0.5 // 50% de ta COOK_TOLERANCE pour la partie "plate"
    };

    var TEXT_ZONE = "Zones : ←/→ = choisir | Entrée = valider \n ↓ = Actions | Échap = retour"
    var TEXT_ACTION = "Actions : ←/→ = choisir | Entrée = exécuter \n ↑/Échap = retour";
    var TEXT_INGREDIENTS = "Ingrédients : ←/→ = catégorie | Entrée = ouvrir la liste \n Échap = retour | ↓ = Plan de travail";

    var TEXT_SELECT = "Sélectionne un ingrédient | Entrée = tenir \n Échap = catégories";
    var TEXT_ROTI = "Rôtisserie : Entrée = déposer/prendre | ↓ = Actions \n Échap = retour";
    var TEXT_WORKBENCH = "Plan de travail : Entrée = déposer/prendre \n Échap = catégories";
    var TEXT_PLATE = "Dressage : Entrée = déposer/prendre | ↓ = Actions \n Échap/↑ = retour";
    var TEXT_POT = "Casserole : Entrée = déposer/prendre | ↓ = Actions \n Échap = retour"; // AJOUT

    // Où le rouge est "plein" avant de tirer vers le noir
    var RED_PEAK_RATIO = 1.60;          // = 1.6 × target

    // --- Constantes de layout ---
    var BOTTOM_BAR_H = 72;     // barre du bas (objet tenu)
    var ACTION_BAR_H = 72;     // nouvelle barre d'actions (au-dessus de la barre du bas)
    var ACTION_BAR_MARGIN = 0;     // nouvelle barre d'actions (au-dessus de la barre du bas)

    var COOK_MODE_ZONES = 'zones';
    var COOK_MODE_INGR = 'ingredients';
    var COOK_MODE_ROTI = 'rotisserie';
    var COOK_MODE_PLATE = 'plate';
    var COOK_MODE_POT = 'pot';              // AJOUT
    var PLATE_RESULT_VARIABLE_ID = 54;
    var PLATE_DISH_SCORE_VARIABLE_ID = 55;
    var PLATE_DISH_SCORE_TOTAL_VARIABLE_ID = 56; // AJOUT

    var COOK_TOLERANCE = 0.10;

    var BAR_DIM_OFF_ALPHA = 0.45;

    // --- Liste d'ingrédients "hardcodée" + catégorie ---
    // cat: 'main' | 'side' | 'condiment' | 'combinaison'
    // subcat: 'main' | 'side' | 'condiment'
    var CookingIngredients = [
        { id: 1, name: "Viande de Sanglier", cat: "main", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 10, targetCookingScore: 40 },

        { id: 2, name: "Pommes de terre", cat: "side", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 5, targetCookingScore: 20 },

        { id: 3, name: "Herbes Sauvages", cat: "condiment", subcat: "condiment", iconIndex: 2, canPot : false, canRotisserie: false, baseTasteScore: 3, targetCookingScore: 50 },
        { id: 4, name: "Sel", cat: "condiment", subcat: "condiment", iconIndex: 3, canPot : false, canRotisserie: false, baseTasteScore: 1, targetCookingScore: 10 },
        { id: 5, name: "Poivre", cat: "condiment", subcat: "condiment", iconIndex: 4, canPot : false, canRotisserie: false, baseTasteScore: 1, targetCookingScore: 10 },
        { id: 6, name: "Eau", cat: "condiment", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 0, targetCookingScore: 0 },

        { id: 7, name: "Eau Salée", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 2, targetCookingScore: 20 },
        { id: 8, name: "Eau Poivrée", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 2, targetCookingScore: 20 },
        { id: 9, name: "Eau Aromatisée", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 4, targetCookingScore: 40 },
        { id: 10, name: "Eau Aromatisée Salée", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 6, targetCookingScore: 60 },
        { id: 11, name: "Eau Aromatisée Poivrée", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 6, targetCookingScore: 60 },
        { id: 12, name: "Eau Assaisonnée", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 4, targetCookingScore: 40 },
        { id: 13, name: "Eau Assaisonnée+", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 8, targetCookingScore: 80 },

        { id: 14, name: "Sanglier Salée", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 12, targetCookingScore: 40 },
        { id: 15, name: "Sanglier Poivrée", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 12, targetCookingScore: 40 },
        { id: 16, name: "Sanglier Aromatisée", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 14, targetCookingScore: 40 },
        { id: 17, name: "Sanglier Aromatisée Salée", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 16, targetCookingScore: 40 },
        { id: 18, name: "Sanglier Aromatisée Poivrée", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 16, targetCookingScore: 40 },
        { id: 19, name: "Sanglier Assaisonnée", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 14, targetCookingScore: 40 },
        { id: 20, name: "Sanglier Assaisonnée+", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 18, targetCookingScore: 40 },

        { id: 21, name: "Pommes de terre Salée", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 7, targetCookingScore: 20 },
        { id: 22, name: "Pommes de terre Poivrée", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 7, targetCookingScore: 20 },
        { id: 23, name: "Pommes de terre Aromatisée", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 9, targetCookingScore: 20 },
        { id: 24, name: "Pommes de terre Aromatisée Salée", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 11, targetCookingScore: 20 },
        { id: 25, name: "Pommes de terre Aromatisée Poivrée", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 11, targetCookingScore: 20 },
        { id: 26, name: "Pommes de terre Assaisonnée", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 9, targetCookingScore: 20 },
        { id: 27, name: "Pommes de terre Assaisonnée+", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 13, targetCookingScore: 20 },
    ];
    window.CookingIngredients = CookingIngredients;

    // Planche d'icônes dédiée (img/pictures/Ingredients.png)
    var ING_SHEET = "Ingredients";
    var ING_ICON_W = 32;
    var ING_ICON_H = 32;
    var ING_ICON_COLS = 16;

    var nextMandatoryDishId = null;

    // ======================================================
    // Registre d'instances (multi-plateaux) + API d'ouverture
    // ======================================================
    var CookingManager = (function () {
        function tmpl(id) {
            return {
                id: String(id),
                ui: {
                    held: null,
                    heldTasteScore: null,
                    heldCookScore: null
                },
                workbench: { stack: [], cookScore: null, tasteScore: null },
                pot: {
                    stack: [],
                    cookScore: null,
                    tasteScore: null,
                    isOn: false,
                    cookFrames: 0
                },
                rotisserie: {
                    stack: [],        // pile de la broche
                    cookScore: null,  // score de cuisson courant
                    tasteScore: null, // cumul goût
                    isOn: false,      // état ON/OFF
                    cookFrames: 0     // timer pour +1/s
                },
                plate: { slots: [null, null, null] }
            };
        }
        var api = {
            _instances: {}, _currentId: "default",
            instance: function (id) {
                id = (id != null) ? String(id) : "default";
                if (!this._instances[id]) this._instances[id] = tmpl(id);
                return this._instances[id];
            },
            setCurrent: function (id) { this._currentId = (id != null) ? String(id) : "default"; return this.instance(this._currentId); },
            current: function () { return this.instance(this._currentId); },
            allIds: function () { var a = []; for (var k in this._instances) { if (this._instances.hasOwnProperty(k)) a.push(k); } return a; },
            reset: function (id) { if (this._instances[id]) this._instances[id] = tmpl(id); }
        };
        return api;
    })();

    CookingManager._lastUpdateMs = null;
    CookingManager.update = function () {
        var now = Date.now();
        if (this._lastUpdateMs == null) this._lastUpdateMs = now;
        var dt = now - this._lastUpdateMs;
        if (dt <= 0) return;
        if (dt > 3000) dt = 3000;
        this._lastUpdateMs = now;

        for (var id in this._instances) {
            if (!this._instances.hasOwnProperty(id)) continue;
            var inst = this._instances[id];

            // === RÔTISSERIE === (indépendant)
            var R = inst.rotisserie;
            if (R && R.isOn && R.stack && R.stack.length > 0) {
                R._accMs = (R._accMs || 0) + dt;
                var steps = Math.floor(R._accMs / 1000);
                if (steps > 0) {
                    R._accMs -= steps * 1000;
                    R.cookScore = (R.cookScore == null) ? steps : (R.cookScore + steps);
                    R._changed = true;
                }
            }

            // === CASSEROLE === (indépendant)
            var P = inst.pot;
            if (P && P.isOn && P.stack && P.stack.length > 0) {
                P._accMs = (P._accMs || 0) + dt;
                var stepsP = Math.floor(P._accMs / 1000);
                if (stepsP > 0) {
                    P._accMs -= stepsP * 1000;
                    P.cookScore = (P.cookScore == null) ? stepsP : (P.cookScore + stepsP);
                    P._changed = true;
                }
            }
        }
    };
    window.CookingManager = CookingManager;

    var _SceneBase_update = Scene_Base.prototype.update;
    Scene_Base.prototype.update = function () {
        _SceneBase_update.call(this);
        if (window.CookingManager && CookingManager.update) CookingManager.update();
    };

    // --- CookingUI devient un "proxy" vers l'instance courante ---
    var CookingUI = {
        heldItem: function () { return CookingManager.current().ui.held; },
        setHeldItem: function (item) { CookingManager.current().ui.held = item || null; },
        heldTasteScore: function () { return CookingManager.current().ui.heldTasteScore || 0; },
        setHeldTasteScore: function (s) { CookingManager.current().ui.heldTasteScore = (s != null) ? s : null; },
        heldCookScoreRotisserie: function () { return CookingManager.current().ui.heldCookScore || 0; },
        setHeldCookScoreRotisserie: function (s) { CookingManager.current().ui.heldCookScore = (s != null) ? s : null; },
        heldCookDevice: function () { return CookingManager.current().ui.heldCookDevice || null; },
        setHeldCookDevice: function (dev) { CookingManager.current().ui.heldCookDevice = dev || null; },
        clearHeld: function () {
            var inst = CookingManager.current(); var had = !!inst.ui.held;
            inst.ui.heldCookDevice = null;
            inst.ui.held = null; inst.ui.heldTasteScore = null; inst.ui.heldCookScore = null; return had;
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
                2: 23,
                6: 9,
                7: 10,
                8: 11,
                12: 13,
                14: 17,
                15: 18,
                19: 20,
                21: 24,
                22: 25,
                26: 27,
            },
            4: { // Sel
                1: 14,
                2: 21,
                6: 7,
                8: 12,
                9: 10,
                11: 13,
                15: 19,
                16: 17,
                18: 20,
                22: 26,
                23: 24,
                25: 27,
            },
            5: { // Poivre
                1: 15,
                2: 22,
                6: 8,
                7: 12,
                9: 11,
                10: 13,
                14: 19,
                16: 18,
                17: 20,
                21: 26,
                23: 25,
                24: 27,
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
                2: 23,
                6: 9,
                7: 10,
                8: 11,
                12: 13,
                14: 17,
                15: 18,
                19: 20,
                21: 24,
                22: 25,
                26: 27,
            },
            4: { // Sel
                1: 14,
                2: 21,
                6: 7,
                8: 12,
                9: 10,
                11: 13,
                15: 19,
                16: 17,
                18: 20,
                22: 26,
                23: 24,
                25: 27,
            },
            5: { // Poivre
                1: 15,
                2: 22,
                6: 8,
                7: 12,
                9: 11,
                10: 13,
                14: 19,
                16: 18,
                17: 20,
                21: 26,
                23: 25,
                24: 27,
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



    var CookingIngredients = [
        { id: 1, name: "Viande de Sanglier", cat: "main", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 10, targetCookingScore: 40 },

        { id: 2, name: "Pommes de terre", cat: "side", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 5, targetCookingScore: 20 },

        { id: 3, name: "Herbes Sauvages", cat: "condiment", subcat: "condiment", iconIndex: 2, canPot : false, canRotisserie: false, baseTasteScore: 3, targetCookingScore: 0 },
        { id: 4, name: "Sel", cat: "condiment", subcat: "condiment", iconIndex: 3, canPot : false, canRotisserie: false, baseTasteScore: 1, targetCookingScore: 0 },
        { id: 5, name: "Poivre", cat: "condiment", subcat: "condiment", iconIndex: 4, canPot : false, canRotisserie: false, baseTasteScore: 1, targetCookingScore: 0 },
        { id: 6, name: "Eau", cat: "condiment", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 0, targetCookingScore: 0 },

        { id: 7, name: "Eau Salée", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 2, targetCookingScore: 0 },
        { id: 8, name: "Eau Poivrée", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 2, targetCookingScore: 0 },
        { id: 9, name: "Eau Aromatisée", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 4, targetCookingScore: 0 },
        { id: 10, name: "Eau Aromatisée Salée", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 6, targetCookingScore: 0 },
        { id: 11, name: "Eau Aromatisée Poivrée", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 6, targetCookingScore: 0 },
        { id: 12, name: "Eau Assaisonnée", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 4, targetCookingScore: 0 },
        { id: 13, name: "Eau Assaisonnée+", cat: "combinaison", subcat: "condiment", iconIndex: 5, canPot : true, canRotisserie: false, baseTasteScore: 8, targetCookingScore: 0 },

        { id: 14, name: "Sanglier Salée", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 12, targetCookingScore: 40 },
        { id: 15, name: "Sanglier Poivrée", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 12, targetCookingScore: 40 },
        { id: 16, name: "Sanglier Aromatisée", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 14, targetCookingScore: 40 },
        { id: 17, name: "Sanglier Aromatisée Salée", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 16, targetCookingScore: 40 },
        { id: 18, name: "Sanglier Aromatisée Poivrée", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 16, targetCookingScore: 40 },
        { id: 19, name: "Sanglier Assaisonnée", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 14, targetCookingScore: 40 },
        { id: 20, name: "Sanglier Assaisonnée+", cat: "combinaison", subcat: "main", iconIndex: 0, canPot : false, canRotisserie: true, baseTasteScore: 18, targetCookingScore: 40 },

        { id: 21, name: "Pommes de terre Salée", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 7, targetCookingScore: 20 },
        { id: 22, name: "Pommes de terre Poivrée", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 7, targetCookingScore: 20 },
        { id: 23, name: "Pommes de terre Aromatisée", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 9, targetCookingScore: 20 },
        { id: 24, name: "Pommes de terre Aromatisée Salée", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 11, targetCookingScore: 20 },
        { id: 25, name: "Pommes de terre Aromatisée Poivrée", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 11, targetCookingScore: 20 },
        { id: 26, name: "Pommes de terre Assaisonnée", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 9, targetCookingScore: 20 },
        { id: 27, name: "Pommes de terre Assaisonnée+", cat: "combinaison", subcat: "side", iconIndex: 1, canPot : false, canRotisserie: true, baseTasteScore: 13, targetCookingScore: 20 },
    ];
    var PotRules = {
        rules: {
            3: {
                6: 9,
                7: 10,
                8: 11,
            },
            4: { // Sel
                6: 7,
                8: 12,
                9: 10,
                11: 13,
            },
            5: { // Poivre  
                6: 8,
                7: 12,
                9: 11,
                10: 13,
            },
        },
        getResultId: function (base, top) {
            if (!top) return null;
            var baseId = (base && base.id) || base;
            var topId = (top && top.id) || top;
            var map = this.rules[topId] || {};
            var res = map[baseId];
            return (typeof res === 'number') ? res : null;
        },
        canStartInPot: function (item) {
            if (!item) return false;
            // si canPot existe → l'utiliser ; sinon fallback: cat main/side
            if (typeof item.canPot === 'boolean') return item.canPot;
            return (item.cat === 'main' || item.cat === 'side');
        },
        canPlace: function (base, top) {
            if (!top) return false;
            if (!base) return !!this.canStartInPot(top); // vide → doit pouvoir aller à la casserole
            return !!this.getResultId(base, top);
        }
    };

    /*=============================================================================
    * CookingScore – Scoring helpers (ES5)
    *-----------------------------------------------------------------------------
    * - Facteur de cuisson : 1 si cook ~ target (±5%), 0.5 si 0% (ou très loin)
    * - Score ingrédient : taste * cookingFactor
    * - Score plat : somme des scores en pénalisant la redondance de subcat :
    *   si un subcat apparaît >1 fois, on IGNORE le meilleur score de ce groupe.
    *============================================================================*/
    var CookingScore = (function () {
        'use strict';

        /**
         * Facteur de cuisson selon la proximité avec la cible.
         * - 1.0 si |cook - target|/target <= 5%
         * - décroît linéairement jusqu'à 0.5 quand on est très loin (ex. 0% ou >> target)
         * - si target <= 0 (ex. eau / non-cuisinable) => 1.0
         */
        function cookingFactor(cook, target) {
            if (!target || target <= 0) return 1.0;
            var err = Math.abs((cook || 0) - target) / target; // écart relatif [0..+∞)
            if (err <= 0.05) return 1.0;
            // mappe err ∈ [0.05..1+] vers facteur ∈ [~1..0.5], clamp min à 0.5
            var t = (err - 0.05) / 0.95;          // normalise à [0..1] sur 5%..100%
            if (t < 0) t = 0;
            if (t > 1) t = 1;
            var f = 1.0 - 0.5 * t;                // 1 -> 0.5
            if (f < 0.5) f = 0.5;
            return f;
        }

        /**
         * Score d'un ingrédient cuisiné.
         * entry: { id, cook, taste, ... }
         * ingredientsById: dictionnaire { id -> meta (cible, subcat, etc.) }
         */
        function cookFunction1(x, z = 20) {
            // normalise x dans [0,1] et borne
            const t = Math.min(Math.max(x / z, 0), 1);

            // interpolation linéaire entre les points du gabarit
            for (let i = 0; i < TEMPLATE_COOK_CURVE.length - 1; i++) {
                const [t0, y0] = TEMPLATE_COOK_CURVE[i];
                const [t1, y1] = TEMPLATE_COOK_CURVE[i + 1];
                if (t <= t1) {
                    const u = (t - t0) / (t1 - t0); // 0..1
                    return y0 + u * (y1 - y0);
                }
            }
            return 0;
        }
        window.cookFunction1 = cookFunction1;

        /**
         * Calcule le score total du plat en pénalisant la redondance de subcat.
         * results: [{id, cook, taste, ...}, ...]
         * ingredientsList: tableau d’ingrédients (avec subcat, targetCookingScore, etc.)
         * options.strategy:
         *   - "ignoreBest" (défaut): si redondant, on ignore LE meilleur de chaque subcat
         *   - "keepBestOnly"       : si redondant, on ne garde que le meilleur de chaque subcat
         * 
         */
        function dishScoreSingle(plate, ingredientsListMap) {
            var cookScore = plate.cook || 0;
            var cookRatio = cookFunction1(cookScore, ingredientsListMap[plate.id].targetCookingScore * 2);
            var cookFactor = 0.5 + (0.5 * cookRatio);

            return plate.taste * cookFactor;
        }

        function dishScore(results, ingredientsList, options, mandatoryDishId) {
            options = options || {};
            mandatoryDishId = mandatoryDishId || [];
            var strategy = options.strategy || "ignoreBest";

            // Index rapide par id
            function indexById(list) {
                var map = {};
                for (var i = 0; i < (list || []).length; i++) {
                    var it = list[i];
                    if (it && it.id != null) map[it.id] = it;
                }
                return map;
            }

            var ingredientsListMap = indexById(ingredientsList || []);
            var kept = [];
            var ignored = [];

            var resultsPerCategory = { main: null, side: null, condiment: null };
            results.forEach(element => {
                if (element == null || element.id == null) return;
                if (resultsPerCategory[ingredientsListMap[element.id].subcat] == null) {
                    resultsPerCategory[ingredientsListMap[element.id].subcat] = element;
                    kept.push(element);
                } else {
                    var oldElement = resultsPerCategory[ingredientsListMap[element.id].subcat];
                    var oldElementScore = dishScoreSingle(oldElement, ingredientsListMap);
                    var newElementScore = dishScoreSingle(element, ingredientsListMap);
                    if (strategy === "ignoreBest") {
                        if (oldElementScore >= newElementScore) {
                            const index = kept.indexOf(oldElement);
                            if (index !== -1) {
                                kept.splice(index, 1); // enlève 1 élément à la position index
                            }
                            kept.push(element);
                            resultsPerCategory[ingredientsListMap[element.id].subcat] = element;
                            ignored.push(oldElement);
                        } else {
                            ignored.push(element);
                        }
                    } else { //KeepBest
                        if (oldElementScore >= newElementScore) {
                            ignored.push(element);
                        } else {
                            const index = kept.indexOf(oldElement);
                            if (index !== -1) {
                                kept.splice(index, 1); // enlève 1 élément à la position index
                            }
                            kept.push(element);
                            resultsPerCategory[ingredientsListMap[element.id].subcat] = element;
                            ignored.push(oldElement);
                        }
                    }
                }
            });

            var finalScore = 0;

            // 4) Vérifier la contrainte "mandatoryDishId": [[A,B], [C,D], ...] => (A|B)&(C|D)...
            var mandatoryFail = false;
            if (mandatoryDishId && mandatoryDishId.length) {

                // Construire l'ensemble des IDs présents dans le plat (à partir de results bruts)
                var present = {};
                for (var r = 0; r < kept.length; r++) {
                    var it = kept[r];
                    if (it && it.id != null) present[it.id] = true;
                }

                for (var i = 0; i < mandatoryDishId.length; i++) {
                    var group = mandatoryDishId[i];
                    var testGroup = false;
                    for (var j = 0; j < group.length; j++) {
                        var id = group[j];
                        if (present[id]) {
                            testGroup = true;
                            break;
                        }
                    }
                }

                if (!testGroup) {
                    mandatoryFail = true;
                }
            }

            if (!mandatoryFail) {
                // 3) Calculer le score total
                for (var k = 0; k < kept.length; k++) {
                    var entry = kept[k];
                    var score = dishScoreSingle(entry, ingredientsListMap);
                    finalScore += score;
                }
            }

            return {
                total: finalScore,
                kept: kept,
                ignored: ignored
            };
        }

        // Expose public API
        return {
            cookingFactor: cookingFactor,
            cookFunction1: cookFunction1,
            dishScore: dishScore
        };
    })();

    window.CookingScore = CookingScore;
    //-----------------------------------------------------------------------------
    // Scene_CookingBase
    //-----------------------------------------------------------------------------
    function Scene_CookingBase() { this.initialize.apply(this, arguments); }
    Scene_CookingBase.prototype = Object.create(Scene_Base.prototype);
    Scene_CookingBase.prototype.constructor = Scene_CookingBase;

    // Avant "Scene_CookingBase.prototype.initialize = function() { ... }"
    Scene_CookingBase.prepare = function (id, lockUntilFinish = false, mandatoryDishId) {
        this._nextInstanceId = (id != null) ? String(id) : "default";
        this._nextLockExit = !!lockUntilFinish;
        this._nextmandatoryDishId = mandatoryDishId || [];
        nextMandatoryDishId = this._nextmandatoryDishId
    };

    Scene_CookingBase.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
        // Branche l'instance courante
        var id = Scene_CookingBase._nextInstanceId || "default";
        this._instanceId = id;
        this._inst = CookingManager.setCurrent(id);

        // AJOUT: récupérer le verrou de sortie préparé
        this._lockExit = !!Scene_CookingBase._nextLockExit;
        Scene_CookingBase._nextLockExit = null; // reset statique
        Scene_CookingBase._nextInstanceId = null;
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
        this.createPotWindow();       // AJOUT
        this.createPotActionBar();
        this.createActionBar();
        this.createBottomBar();
        this.createPlateWindow();
        this.createPlateActionBar();
    };

    Scene_CookingBase.prototype.createPlateWindow = function () {
        var top = this._helpWindow.height;
        var y = top + 24;
        var h = Graphics.boxHeight - top - BOTTOM_BAR_H - ACTION_BAR_H - 48;
        var x = 24;
        var w = Graphics.boxWidth - 48;
        this._plateWindow = new Window_CookingPlate(x, y, w, h);
        this._plateWindow.setInstance(this._inst);
        this._plateWindow.setHandler('ok', this.onPlateOk.bind(this));
        this._plateWindow.setHandler('cancel', this.onPlateCancel.bind(this));
        this.addWindow(this._plateWindow);
        this._plateWindow.hide();
        this._plateWindow.deactivate();
    };

    Scene_CookingBase.prototype.createPlateActionBar = function () {
        var y = Graphics.boxHeight - BOTTOM_BAR_H - ACTION_BAR_H;
        this._plateActionBar = new Window_PlateActionBar(0, y, Graphics.boxWidth, ACTION_BAR_H);
        this._plateActionBar.setHandler('plateClear', this.doPlateClear.bind(this));
        this._plateActionBar.setHandler('plateFinish', this.doPlateFinish.bind(this));
        this._plateActionBar.setHandler('cancel', this.onPlateActionCancel.bind(this));
        this.addWindow(this._plateActionBar);
        this._plateActionBar.hide();
        this._plateActionBar.deactivate();
        this._plateActionBar.select(0);
    };

    Scene_CookingBase.prototype.setPlateActionBarVisible = function (visible) {
        if (!this._plateActionBar) return;
        if (visible) { this._plateActionBar.show(); this._plateActionBar.deactivate(); }
        else { this._plateActionBar.hide(); this._plateActionBar.deactivate(); }
    };

    // Cache/désactive tout sauf le groupe du mode demandé
    Scene_CookingBase.prototype.setUIMode = function (mode) {
        this._uiMode = mode;

        // 1) Tout cacher/désactiver par défaut (sauf Help + BottomBar)
        var hide = function (w) { if (!w) return; w.hide(); w.deactivate(); };
        hide(this._zoneWindow);
        hide(this._ingrCatWindow);
        hide(this._ingrWindow);
        hide(this._workbenchWindow);
        hide(this._rotiWindow);
        hide(this._potWindow);
        hide(this._plateWindow);
        this.setPlateActionBarVisible(false);
        this.setActionBarVisible(false);
        this.setRotiActionBarVisible(false);
        if (this._actionBar) this._actionBar.deactivate();
        if (this._rotiActionBar) this._rotiActionBar.deactivate();

        // 2) Mode Zones
        if (mode === COOK_MODE_ZONES) {
            if (this._zoneWindow) { this._zoneWindow.show(); this._zoneWindow.activate(); }
            this.setActionBarVisible(true); // barre d’actions générale visible seulement ici
            if (this._helpWindow) this._helpWindow.setText(TEXT_ZONE);
            this.refreshBottomBar();
            this.refreshActionBar();
            return;
        }

        // 3) Mode Ingrédients
        if (mode === COOK_MODE_INGR) {
            this.showIngredientView(true);  // n’affiche que le trio catégories/liste/plan
            if (this._ingrCatWindow) { this._ingrCatWindow.activate(); this._ingrCatWindow.select(this._ingrCatWindow.index() || 0); }
            if (this._helpWindow) this._helpWindow.setText(TEXT_INGREDIENTS);
            this.refreshBottomBar();
            this.refreshActionBar();
            return;
        }

        // 4) Mode Rôtisserie
        if (mode === COOK_MODE_ROTI) {
            this.showRotisserieView(true);  // juste la rôtisserie
            if (this._rotiWindow) { this._rotiWindow.activate(); this._rotiWindow.select(0); }
            this.setRotiActionBarVisible(true); // barre ON/OFF dédiée
            this.refreshRotiActionBar();
            if (this._helpWindow) this._helpWindow.setText(TEXT_ROTI);
            this.refreshBottomBar();
            this.refreshActionBar();
            return;
        }

        // 5) Mode Pot
        if (mode === COOK_MODE_POT) {
            this.showPotView(true);
            if (this._potWindow) { this._potWindow.activate(); this._potWindow.select(0); }
            this.setPotActionBarVisible(true);
            this.refreshPotActionBar();
            if (this._helpWindow) this._helpWindow.setText(TEXT_POT);
            this.refreshBottomBar();
            this.refreshActionBar();
            return;
        }

        // 6) Mode Dressage
        if (mode === COOK_MODE_PLATE) {
            if (this._plateWindow) { this._plateWindow.show(); this._plateWindow.activate(); this._plateWindow.select(0); }
            this.setPlateActionBarVisible(true);
            if (this._helpWindow) this._helpWindow.setText(TEXT_PLATE);
            this.refreshBottomBar();
            return;
        }
    };

    // --- Affichage/masquage synchronisé avec la vue Rôtisserie
    Scene_CookingBase.prototype.setRotiActionBarVisible = function (visible) {
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
                        this._helpWindow.setText(TEXT_WORKBENCH);
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
                        this._helpWindow.setText(TEXT_WORKBENCH);
                    }
                }
            }
        }

        // ↓ : Dressage -> barre d’actions dressage
        if (this._plateWindow && this._plateWindow.active && this._plateActionBar && this._plateActionBar.visible) {
            if (Input.isTriggered('down')) {
                this._plateWindow.deactivate();
                this._plateActionBar.select(0);
                this._plateActionBar.activate();
                this._helpWindow.setText(TEXT_ACTION);
            }
        }
        // ↑ : barre d’actions dressage -> Dressage
        if (this._plateActionBar && this._plateActionBar.active) {
            if (Input.isTriggered('up')) {
                this.onPlateActionCancel();
            }
        }

        // ↓ : Zones -> Barre d’actions
        if (this._zoneWindow && this._zoneWindow.active && this._actionBar && this._actionBar.visible) {
            if (Input.isTriggered('down')) {
                this._zoneWindow.deactivate();
                this._actionBar.select(0);
                this._actionBar.activate();
                this._helpWindow.setText(TEXT_ACTION);
            }
        }
        // ↑ : Barre d’actions -> Zones
        if (this._actionBar && this._actionBar.active) {
            if (Input.isTriggered('up')) {
                this.onActionCancel();
            }
        }

        // ↑ : Barre d’actions -> Zones
        if (this._workbenchWindow && this._workbenchWindow.active) {
            if (Input.isTriggered('up')) {
                this.onWorkbenchCancel();
            }
        }


        // ↓ : Rôtisserie -> barre d’actions rôtisserie
        if (this._rotiWindow && this._rotiWindow.active && this._rotiActionBar && this._rotiActionBar.visible) {
            if (Input.isTriggered('down')) {
                this._rotiWindow.deactivate();
                this._rotiActionBar.select(0);
                this._rotiActionBar.activate();
                this._helpWindow.setText(TEXT_ACTION);
            }
        }
        // ↑ : barre d’actions rôtisserie -> Rôtisserie
        if (this._rotiActionBar && this._rotiActionBar.active) {
            if (Input.isTriggered('up')) {
                this.onRotiActionCancel();
            }
        }

        // --- Synchro UI si l'état de rôtisserie a changé (par le ticker global)
        var R = this._inst.rotisserie;
        if (R && (R._changed || this._lastRotiOn !== R.isOn || this._lastRotiStackLen !== (R.stack ? R.stack.length : 0))) {
            R._changed = false;
            this._lastRotiOn = R.isOn;
            this._lastRotiStackLen = (R.stack ? R.stack.length : 0);
            if (this._rotiWindow) this._rotiWindow.refresh();
            this.refreshRotiActionBar(); // met à jour Allumer/Éteindre si besoin
        }



        // ↓ : Casserole -> barre d'actions casserole
        if (this._potWindow && this._potWindow.active && this._potActionBar && this._potActionBar.visible) {
            if (Input.isTriggered('down')) {
                this._potWindow.deactivate();
                this._potActionBar.select(0);
                this._potActionBar.activate();
                this._helpWindow.setText(TEXT_ACTION);
            }
        }
        // ↑ : barre d'actions casserole -> Casserole
        if (this._potActionBar && this._potActionBar.active) {
            if (Input.isTriggered('up')) {
                this.onPotActionCancel();
            }
        }

        var P = this._inst.pot;
        if (P && (P._changed || this._lastPotOn !== P.isOn || this._lastPotStackLen !== (P.stack ? P.stack.length : 0))) {
            P._changed = false;
            this._lastPotOn = P.isOn;
            this._lastPotStackLen = (P.stack ? P.stack.length : 0);
            if (this._potWindow) this._potWindow.refresh();
            this.refreshPotActionBar();
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
        this._helpWindow = new Window_CookHelp();
        this._helpWindow.y = 0;
        this._helpWindow.setText(TEXT_ZONE);
        this.addWindow(this._helpWindow);
    };

    Scene_CookingBase.prototype.onZoneCancelLocked = function () {
        SoundManager.playBuzzer();
        if (this._helpWindow) {
            this._helpWindow.setText(
                "Échap désactivé : va dans Dressage (Entrée), puis choisis \"Finaliser plat\" pour quitter."
            );
        }
        this._zoneWindow.deactivate();
        this._zoneWindow.activate();
        this._zoneWindow.select(0);
    };

    // --- Sélecteur de zone (centre) ---
    Scene_CookingBase.prototype.createZoneWindow = function () {
        var top = this._helpWindow.height;
        var h = Graphics.boxHeight - top - BOTTOM_BAR_H - ACTION_BAR_H; // réserve l'espace de la barre d'actions + bas
        this._zoneWindow = new Window_CookingZoneSelect(0, top, Graphics.boxWidth, h);
        this._zoneWindow.setHandler('ok', this.onZoneOk.bind(this));
        var cancelHandler = this._lockExit ? this.onZoneCancelLocked.bind(this) : this.popScene.bind(this);
        this._zoneWindow.setHandler('cancel', cancelHandler);
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
        this._workbenchWindow.setInstance(this._inst);
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

    Scene_CookingBase.prototype.onPotOk = function () {
        var held = CookingUI.heldItem();
        var success = false;
        var P = this._inst.pot;

        if (!held) {
            if (this._potWindow && this._potWindow.hasItems()) {
                var taken = this._potWindow.takeTop();
                if (taken) {
                    CookingUI.setHeldItem(taken);
                    CookingUI.setHeldTasteScore(P.tasteScore);
                    CookingUI.setHeldCookScoreRotisserie(P.cookScore);
                    CookingUI.setHeldCookDevice('pot'); // AJOUT
                    this.refreshBottomBar();
                    success = true;
                    if (!this._potWindow.hasItems()) {
                        P.isOn = false;
                        // P.cookScore = null;
                        P.tasteScore = null;
                        P.cookFrames = 0;
                        this.refreshPotActionBar();
                    }
                }
            }
        } else {
            if (this._potWindow.placeHeldItem(held)) {
                if (P.cookScore === null) P.cookScore = 0;
                CookingUI.setHeldTasteScore(null);
                CookingUI.setHeldCookScoreRotisserie(null);
                CookingUI.setHeldCookDevice(null); // AJOUT
                CookingUI.setHeldItem(null);
                this.refreshBottomBar();
                success = true;
            }
        }

        if (success) SoundManager.playOk(); else SoundManager.playBuzzer();

        if (P && P.isOn) {
            this._potWindow.select(0);
            this._potWindow.activate();
            this._helpWindow.setText(TEXT_POT);
        } else {
            if (this._potActionBar) {
                this._potWindow.deactivate();
                this._potActionBar.select(0);
                this._potActionBar.activate();
                this._helpWindow.setText(TEXT_ACTION);
            }
        }
    };

    Scene_CookingBase.prototype.onPotCancel = function () { this.setUIMode(COOK_MODE_ZONES); };

    Scene_CookingBase.prototype.doPotOn = function () {
        var P = this._inst.pot;
        if (!this._potWindow || !this._potWindow.hasItems()) SoundManager.playBuzzer();
        else { if (P.cookScore === null) P.cookScore = 0; P.isOn = true; }
        this.refreshPotActionBar(); this.onPotActionCancel(); if (this._potWindow) this._potWindow.refresh();
    };

    Scene_CookingBase.prototype.doPotOff = function () {
        var P = this._inst.pot;
        P.isOn = false;
        this.refreshPotActionBar(); this.onPotActionCancel(); if (this._potWindow) this._potWindow.refresh();
    };

    Scene_CookingBase.prototype.onPotActionCancel = function () {
        if (this._potActionBar) this._potActionBar.deactivate();
        if (this._potWindow) { this._potWindow.activate(); this._potWindow.select(0); }
        if (this._helpWindow) this._helpWindow.setText(TEXT_POT);
    };

    Scene_CookingBase.prototype.onZoneOk = function () {
        var index = this._zoneWindow.index();
        if (index === 0) {                 // Ingrédients
            this.setUIMode(COOK_MODE_INGR);
            var cat = this._ingrCatWindow.currentCategory() || 'main';
            this._ingrWindow.setCategory(cat);
        } else if (index === 1) {          // Rôtisserie
            this.setUIMode(COOK_MODE_ROTI);
        } else if (index === 2) {
            this.setUIMode(COOK_MODE_POT);   // Casserole 
        } else if (index === 3) {      // Dressage
            this.setUIMode(COOK_MODE_PLATE);
        }
    };

    Scene_CookingBase.prototype.openIngredients = function () {
        this.setUIMode(COOK_MODE_INGR);
        var cat = this._ingrCatWindow.currentCategory() || 'main';
        this._ingrWindow.setCategory(cat);
    };

    Scene_CookingBase.prototype.onPlateOk = function () {
        var held = CookingUI.heldItem();
        var R = this._inst.rotisserie;

        // === MAIN VIDE -> PRENDRE DEPUIS LE DRESSAGE ===
        if (!held) {
            var slot = this._plateWindow.takeItem(); // { item, cook, taste }
            if (slot) {
                // Récupère l'item + RESTAURE ses scores dans la main
                CookingUI.setHeldItem(slot.item);
                CookingUI.setHeldTasteScore(slot.taste || 0);
                CookingUI.setHeldCookScoreRotisserie(slot.cook || 0);
                CookingUI.setHeldCookDevice(slot.device || null);

                // Pré-initialise le cook de la rôtissoire si elle est vide (facilite la 2e cuisson)
                if (!this._rotiWindow || !this._rotiWindow.hasItems()) {
                    R._accMs = 0;
                    R.cookScore = slot.cook || 0;
                    // (on ne rallume pas automatiquement)
                }

                this.refreshBottomBar();
                SoundManager.playOk();
            } else {
                SoundManager.playBuzzer();
            }
        } else {
            // === MAIN PLEINE -> DÉPOSER DANS LE DRESSAGE ===
            // On sauvegarde ce qu'on a en main (cook/taste) dans le slot courant
            var cook = CookingUI.heldCookScoreRotisserie ? CookingUI.heldCookScoreRotisserie() : 0;
            var taste = CookingUI.heldTasteScore ? CookingUI.heldTasteScore() : (held.baseTasteScore || 0);

            if (this._plateWindow.placeItem(held, cook, taste)) {
                // Après sauvegarde dans le dressage, on RESET le cook courant de la rôtissoire
                if (!this._rotiWindow || !this._rotiWindow.hasItems()) {
                    R._accMs = 0;
                    R.cookScore = 0; // reset demandé
                    // (on laisse R.isOn inchangé ; à toi de rallumer quand tu veux)
                }

                CookingUI.clearHeld();
                this.refreshBottomBar();
                SoundManager.playOk();
            } else {
                SoundManager.playBuzzer();
            }
        }

        // Reste focus sur la fenêtre
        if (this._plateWindow) { this._plateWindow.activate(); }
    };

    Scene_CookingBase.prototype.onPlateCancel = function () {
        this.setUIMode(COOK_MODE_ZONES);
    };

    Scene_CookingBase.prototype.onPlateActionCancel = function () {
        if (this._plateActionBar) this._plateActionBar.deactivate();
        if (this._plateWindow) { this._plateWindow.activate(); this._plateWindow.select(this._plateWindow.index() || 0); }
        if (this._helpWindow) this._helpWindow.setText(TEXT_PLATE);
    };

    Scene_CookingBase.prototype.doPlateClear = function () {
        if (this._plateWindow) this._plateWindow.clearAll();
        SoundManager.playOk();
        if (this._helpWindow) this._helpWindow.setText("Dressage : plat nettoyé.");

        // ➜ AJOUT : on rend la main à la fenêtre de dressage (sinon sensation de freeze)
        this.onPlateActionCancel();
    };

    Scene_CookingBase.prototype.doPlateFinish = function () {
        var slots = (this._inst && this._inst.plate && this._inst.plate.slots) ? this._inst.plate.slots : [null, null, null];
        var result = [];
        for (var i = 0; i < 3; i++) {
            var s = slots[i];
            if (s && s.item) {
                result.push({
                    id: s.item.id, name: s.item.name, iconIndex: s.item.iconIndex,
                    cook: s.cook || 0, taste: s.taste || 0
                });
            } else {
                result.push(null);
            }
        }
        $gameVariables.setValue(PLATE_RESULT_VARIABLE_ID, result); // tableau de 3 entrées (ou null)
        var dishScore = CookingScore.dishScore(result, CookingIngredients, { strategy: "keepBest" }, nextMandatoryDishId);
        $gameVariables.setValue(PLATE_DISH_SCORE_VARIABLE_ID, dishScore);
        $gameVariables.setValue(PLATE_DISH_SCORE_TOTAL_VARIABLE_ID, dishScore.total);
        SoundManager.playOk();
        if (this._helpWindow) this._helpWindow.setText("Dressage : plat final dressé.");
        this._plateWindow.clearAll();
        this.onPlateActionCancel();
        setTimeout(() => { SceneManager.pop() }, 2000)
    };

    // Catégories -> Liste
    Scene_CookingBase.prototype.onCategoryOk = function () {
        this._helpWindow.setText(TEXT_SELECT);
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
        // Si on a déjà quelque chose en main, on refuse de prendre un nouvel ingrédient
        if (CookingUI.heldItem()) {
            SoundManager.playBuzzer();
            // On reste dans la liste (pas de deselect/deactivate) pour que le joueur dépose d'abord

        } else {
            var item = this._ingrWindow.item();
            if (item) {
                SoundManager.playOk();
                CookingUI.setHeldItem(item);
                CookingUI.setHeldTasteScore(item.baseTasteScore || 0);
                CookingUI.setHeldCookDevice(null)
                CookingUI.setHeldCookScoreRotisserie(0);
            } else {
                SoundManager.playBuzzer();
            }
        }
        this.refreshBottomBar();
        // Flux d’origine
        this._ingrWindow.deselect();
        this._ingrWindow.deactivate();
        this._ingrCatWindow.activate();
        this._helpWindow.setText(TEXT_INGREDIENTS);
    };

    // Liste -> retour catégories
    Scene_CookingBase.prototype.onIngredientCancel = function () {
        this._ingrWindow.deactivate();
        this._ingrCatWindow.activate();
        this._helpWindow.setText(TEXT_INGREDIENTS);
    };

    // Catégories -> quitter vue Ingrédients
    Scene_CookingBase.prototype.onIngredientViewCancel = function () {
        this.setUIMode(COOK_MODE_ZONES);
    };

    // Plan de travail -> déposer
    Scene_CookingBase.prototype.onWorkbenchOk = function () {
        var held = CookingUI.heldItem();
        var WB = this._inst.workbench; // AJOUT: raccourci instance WB

        // MAIN VIDE -> PRENDRE depuis le plan de travail
        if (!held) {
            if (this._workbenchWindow && this._workbenchWindow.hasItems()) {
                var taken = this._workbenchWindow.takeTop();
                if (taken) {
                    CookingUI.setHeldItem(taken);

                    // AJOUT: restaurer taste/cook depuis le plan de travail s'il y en a
                    var savedTaste = (WB && WB.tasteScore != null) ? WB.tasteScore : (taken.baseTasteScore || 0);
                    var savedCook = (WB && typeof WB.cookScore === 'number') ? WB.cookScore : 0;
                    CookingUI.setHeldTasteScore(savedTaste);
                    CookingUI.setHeldCookScoreRotisserie(savedCook);
                    CookingUI.setHeldCookDevice((WB && WB.cookDevice) ? WB.cookDevice : null); // AJOUT
                    if (WB) { WB.tasteScore = null; WB.cookScore = null; WB.cookDevice = null; } // AJOUT

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
            // MAIN PLEINE -> TENTER DE DEPOSER
            if (this._workbenchWindow.placeHeldItem(held)) {
                // AJOUT: sauver les scores actuels dans le bench
                if (WB) {
                    WB.cookScore = (typeof CookingUI.heldCookScoreRotisserie === 'function')
                        ? CookingUI.heldCookScoreRotisserie() : 0;
                    WB.tasteScore = (typeof CookingUI.heldTasteScore === 'function')
                        ? CookingUI.heldTasteScore() : (held.baseTasteScore || 0);
                    WB.cookDevice = (typeof CookingUI.heldCookDevice === 'function') ? CookingUI.heldCookDevice() : null;
                }

                // Vider complètement la main (inclut cookScore)
                if (typeof CookingUI.clearHeld === 'function') CookingUI.clearHeld();
                else { CookingUI.setHeldItem(null); CookingUI.setHeldTasteScore(null); CookingUI.setHeldCookScoreRotisserie(null); } // secours

                this.refreshBottomBar();
                SoundManager.playOk();
            } else {
                SoundManager.playBuzzer();
                return; // on reste ici si refusé
            }
        }

        // Retour propre sur la barre catégories, forcée sur "main"
        this._workbenchWindow.deselect();
        this._workbenchWindow.deactivate();

        if (this._ingrCatWindow.selectByExt) {
            this._ingrCatWindow.selectByExt('main');
        } else {
            this._ingrCatWindow.select(0);
            this.onCategoryChanged();
        }
        this._ingrCatWindow.activate();
        this._helpWindow.setText(TEXT_INGREDIENTS);
    };

    // Plan de travail -> retour catégories
    Scene_CookingBase.prototype.onWorkbenchCancel = function () {
        this._workbenchWindow.deactivate();
        this._ingrCatWindow.activate();
        this._helpWindow.setText(TEXT_INGREDIENTS);
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
            pot: this._potWindow && this._potWindow.hasItems(),
            roti: this._rotiWindow && this._rotiWindow.hasItems()
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
        if (this._ingrCatWindow) { this._ingrCatWindow[m](); this._ingrCatWindow[a](); }
        if (this._ingrWindow) { this._ingrWindow[m](); this._ingrWindow.deactivate(); }
        if (this._workbenchWindow) { this._workbenchWindow[m](); this._workbenchWindow.deactivate(); }
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
        var P = this._inst.pot;
        var had = P && P.stack && P.stack.length > 0;
        if (P) {
            P.stack = [];
            P.isOn = false;
            P.cookScore = null;
            P.tasteScore = null;
            P.cookFrames = 0;
        }
        var msg = had ? "Casserole vidée." : "Casserole déjà vide.";
        if (had) SoundManager.playOk(); else SoundManager.playBuzzer();
        this.refreshActionBar();
        this.returnToZoneFromAction(msg);
        this.refreshPotActionBar();
    };

    Scene_CookingBase.prototype.doClearRoti = function () {
        var ok = this._rotiWindow && this._rotiWindow.clearAll();
        var msg;
        var R = this._inst.rotisserie;
        if (ok) {
            SoundManager.playOk();
            msg = "Rôtisserie vidée.";
        } else {
            SoundManager.playBuzzer();
            msg = "Rôtisserie déjà vide.";
        }
        this.refreshActionBar();
        this.returnToZoneFromAction(msg);
        R.isOn = false;
        R.cookScore = null;
        R.tasteScore = null;
        R.cookFrames = 0;
        this.refreshRotiActionBar();
    };

    Scene_CookingBase.prototype.onActionCancel = function () {
        this.setUIMode(COOK_MODE_ZONES);
    };

    // Revenir proprement aux Zones après une action
    Scene_CookingBase.prototype.returnToZoneFromAction = function (message) {
        this.setUIMode(COOK_MODE_ZONES);
        if (this._helpWindow) {
            this._helpWindow.setText(message || TEXT_ZONE);
        }
    };

    // NEW: Création de la fenêtre Rôtisserie
    Scene_CookingBase.prototype.createRotisserieWindow = function () {
        var top = this._helpWindow.height;
        var y = top + 24;
        var h = Graphics.boxHeight - top - BOTTOM_BAR_H - ACTION_BAR_H - 48;
        var x = 24;
        var w = Graphics.boxWidth - 48;

        this._rotiWindow = new Window_CookingRotisserie(x, y, w, h);
        this._rotiWindow.setInstance(this._inst);
        this._rotiWindow.setHandler('ok', this.onRotisserieOk.bind(this));
        this._rotiWindow.setHandler('cancel', this.onRotisserieCancel.bind(this));
        this.addWindow(this._rotiWindow);
        this._rotiWindow.hide();
        this._rotiWindow.deactivate();
    };

    Scene_CookingBase.prototype.createRotisserieActionBar = function () {
        var y = Graphics.boxHeight - BOTTOM_BAR_H - ACTION_BAR_H;
        this._rotiActionBar = new Window_RotisserieActionBar(0, y, Graphics.boxWidth, ACTION_BAR_H);
        this._rotiActionBar.setHandler('rotiOn', this.doRotiOn.bind(this));
        this._rotiActionBar.setHandler('rotiOff', this.doRotiOff.bind(this));
        this._rotiActionBar.setHandler('cancel', this.onRotiActionCancel.bind(this));
        this.addWindow(this._rotiActionBar);
        this._rotiActionBar.hide();
        this._rotiActionBar.deactivate();
        this._rotiActionBar.select(0);
    };

    Scene_CookingBase.prototype.createPotWindow = function () {
        var top = this._helpWindow.height;
        var y = top + 24;
        var h = Graphics.boxHeight - top - BOTTOM_BAR_H - ACTION_BAR_H - 48;
        var x = 24;
        var w = Graphics.boxWidth - 48;

        this._potWindow = new Window_CookingPot(x, y, w, h);
        this._potWindow.setInstance(this._inst);
        this._potWindow.setHandler('ok', this.onPotOk.bind(this));
        this._potWindow.setHandler('cancel', this.onPotCancel.bind(this));
        this.addWindow(this._potWindow);
        this._potWindow.hide(); this._potWindow.deactivate();
    };

    Scene_CookingBase.prototype.createPotActionBar = function () {
        var y = Graphics.boxHeight - BOTTOM_BAR_H - ACTION_BAR_H;
        this._potActionBar = new Window_PotActionBar(0, y, Graphics.boxWidth);
        this._potActionBar.setHandler('potOn', this.doPotOn.bind(this));
        this._potActionBar.setHandler('potOff', this.doPotOff.bind(this));
        this._potActionBar.setHandler('cancel', this.onPotActionCancel.bind(this));
        this.addWindow(this._potActionBar);
        this._potActionBar.hide(); this._potActionBar.deactivate(); this._potActionBar.select(0);
    };


    Scene_CookingBase.prototype.setPotActionBarVisible = function (visible) {
        if (!this._potActionBar) return;
        if (visible) { this._potActionBar.show(); this._potActionBar.deactivate(); }
        else { this._potActionBar.hide(); this._potActionBar.deactivate(); }
    };

    Scene_CookingBase.prototype.showPotView = function (show) {
        var m = show ? 'show' : 'hide';
        var a = show ? 'activate' : 'deactivate';
        if (this._potWindow) { this._potWindow[m](); this._potWindow[a](); }
    };

    Scene_CookingBase.prototype.refreshPotActionBar = function () {
        if (!this._potActionBar) return;
        this._potActionBar.setPowerState(!!this._inst.pot.isOn);
    };

    Scene_CookingBase.prototype.showRotisserieView = function (show) {
        var m = show ? 'show' : 'hide';
        var a = show ? 'activate' : 'deactivate';
        if (this._rotiWindow) { this._rotiWindow[m](); this._rotiWindow[a](); }
    };

    // --- État/mise à jour des boutons Allumer/Éteindre
    Scene_CookingBase.prototype.refreshRotiActionBar = function () {
        if (!this._rotiActionBar) return;
        this._rotiActionBar.setPowerState(!!this._inst.rotisserie.isOn);
    };

    // NEW: handlers Rôtisserie
    Scene_CookingBase.prototype.onRotisserieOk = function () {
        var held = CookingUI.heldItem();
        var success = false;
        var R = this._inst.rotisserie;

        if (!held) {
            // PRENDRE
            if (this._rotiWindow && this._rotiWindow.hasItems()) {
                var taken = this._rotiWindow.takeTop();
                if (taken) {
                    CookingUI.setHeldItem(taken);
                    CookingUI.setHeldTasteScore(R.tasteScore);
                    CookingUI.setHeldCookScoreRotisserie(R.cookScore);
                    CookingUI.setHeldCookDevice('roti');
                    this.refreshBottomBar();
                    success = true;
                    if (!this._rotiWindow.hasItems()) {
                        R.isOn = false;
                        //R.cookScore = null;
                        R.tasteScore = null;
                        R.cookFrames = 0;
                        this.refreshRotiActionBar();
                    }
                }
            }
        } else {
            // DÉPOSER
            if (this._rotiWindow.placeHeldItem(held)) {
                if (R.cookScore === null) R.cookScore = 0; // démarre si absent
                CookingUI.setHeldTasteScore(null);
                CookingUI.setHeldCookScoreRotisserie(null);
                CookingUI.setHeldCookDevice(null);
                CookingUI.setHeldItem(null);
                this.refreshBottomBar();
                success = true;
            }
        }

        if (success) SoundManager.playOk(); else SoundManager.playBuzzer();

        if (R && R.isOn) {
            // Feu allumé → comportement courant
            this._rotiWindow.select(0);
            this._rotiWindow.activate();
            this._helpWindow.setText(TEXT_ROTI);
        } else {
            // Feu éteint → on bascule sur la barre d’action rotissoire
            if (this._rotiActionBar) {
                this._rotiWindow.deactivate();
                this._rotiActionBar.select(0);
                this._rotiActionBar.activate();
                this._helpWindow.setText(TEXT_ACTION);
            }
        }
    };

    Scene_CookingBase.prototype.onRotisserieCancel = function () {
        this.setUIMode(COOK_MODE_ZONES);
    };


    // --- Handlers ON/OFF
    Scene_CookingBase.prototype.doRotiOn = function () {
        var R = this._inst.rotisserie;
        if (!this._rotiWindow || !this._rotiWindow.hasItems()) {
            SoundManager.playBuzzer();
        } else {
            if (R.cookScore === null) R.cookScore = 0;
            R.isOn = true;
        }
        this.refreshRotiActionBar();
        this.onRotiActionCancel();
        if (this._rotiWindow) this._rotiWindow.refresh();
    };

    Scene_CookingBase.prototype.doRotiOff = function () {
        var R = this._inst.rotisserie;
        R.isOn = false;
        this.refreshRotiActionBar();
        this.onRotiActionCancel();
        if (this._rotiWindow) this._rotiWindow.refresh();
    };

    Scene_CookingBase.prototype.onRotiActionCancel = function () {
        if (this._rotiActionBar) this._rotiActionBar.deactivate();
        if (this._rotiWindow) { this._rotiWindow.activate(); this._rotiWindow.select(0); }
        if (this._helpWindow) this._helpWindow.setText(TEXT_ROTI);
    };

    window.Scene_CookingBase = Scene_CookingBase;

    //-----------------------------------------------------------------------------
    // Window_CookingZoneSelect (centre)
    //-----------------------------------------------------------------------------
    function Window_CookingZoneSelect() { this.initialize.apply(this, arguments); }
    Window_CookingZoneSelect.prototype = Object.create(Window_Selectable.prototype);
    Window_CookingZoneSelect.prototype.constructor = Window_CookingZoneSelect;

    Window_CookingZoneSelect.prototype.initialize = function (x, y, w, h) {
        this._data = ["Ingrédients", "Rôtisserie", "Casserole", "Dressage"];
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this.refresh();
        this.activate();
        this.select(0);
    };

    Window_CookingZoneSelect.prototype.maxItems = function () { return this._data ? this._data.length : 0; };
    Window_CookingZoneSelect.prototype.maxCols = function () { return 4; };
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
        this.addCommand("Principal", 'cat', true, 'main');
        this.addCommand("Accompagnement", 'cat', true, 'side');
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
        this._category = 'main';
        this._all = CookingIngredients;
        this._data = [];
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this.refresh();
    };

    Window_CookingItemList.prototype.setCategory = function (cat) {
        this._category = cat || 'main';
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
        if (!this._stack || this._stack.length === 0) return false;
        this._stack.length = 0;  // au lieu de this._stack = [];

        if (this._inst && this._inst.workbench) {
            this._inst.workbench.cookScore = null;
            this._inst.workbench.tasteScore = null;
            this._inst.workbench.cookDevice = null;
        }
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

    Window_CookingWorkbench.prototype.setInstance = function (inst) {
        this._inst = inst;
        this._stack = inst.workbench.stack;
        this.refresh();
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
    Window_CookingRotisserie.prototype.maxCols = function () { return 1; };

    Window_CookingRotisserie.prototype.itemRect = function () {
        var rect = new Rectangle();
        var boxW = 96, boxH = 72;
        rect.width = boxW;
        rect.height = boxH;
        rect.x = Math.floor((this.contentsWidth() - boxW) / 2);
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
        this.drawCookBar();
    };

    /* ---------------------------------------------------------- */
    // --- Helpers couleur (ES5) ---
    function _hexToRgb(hex) {
        hex = String(hex || "").replace("#", "");
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        var r = parseInt(hex.substr(0, 2), 16) || 0;
        var g = parseInt(hex.substr(2, 2), 16) || 0;
        var b = parseInt(hex.substr(4, 2), 16) || 0;
        return { r: r, g: g, b: b };
    }
    function _mixColor(c1, c2, t) {
        if (t < 0) t = 0; if (t > 1) t = 1;
        return {
            r: Math.round(c1.r + (c2.r - c1.r) * t),
            g: Math.round(c1.g + (c2.g - c1.g) * t),
            b: Math.round(c1.b + (c2.b - c1.b) * t)
        };
    }
    function _rgba(c, a) {
        if (a == null) a = 1;
        return 'rgba(' + (c.r | 0) + ',' + (c.g | 0) + ',' + (c.b | 0) + ',' + a + ')';
    }
    Window_CookingRotisserie.prototype.drawCookBar = function () {
        var top = this._stack.length ? this._stack[this._stack.length - 1] : null;
        var cw = this.contentsWidth();

        var barX = 0, barW = cw, barH = 12;
        var rect = this.itemRect(0);
        var barY = rect.y + rect.height + 14;

        // Rien sur la broche → barre grise
        if (!top) { this.contents.fillRect(barX, barY, barW, barH, COLOR_FUTURE_GRAY); return; }

        var target = (typeof top.targetCookingScore === 'number') ? top.targetCookingScore : 0;
        var R = this._inst && this._inst.rotisserie ? this._inst.rotisserie : null;
        var cook = (R && typeof R.cookScore === 'number') ? R.cookScore : 0;

        var max = MAX_COOK_SCALE;
        if (cook < 0) cook = 0;
        if (cook > max) cook = max;

        // Repères : centre = target, pic rouge = RED_PEAK_RATIO * target
        var mid = max > 0 ? (target / max) : 0; // 0..1
        var redPeakVal = Math.min(max, Math.max(target, Math.round(target * RED_PEAK_RATIO)));
        var tPeak = max > 0 ? (redPeakVal / max) : 1;

        // Optionnel : mini plateau central si demandé (par défaut: aucun)
        var tolVis = (typeof COOK_VISUAL !== 'undefined' && COOK_VISUAL.TOL_RATIO_VISUAL != null)
            ? (COOK_VISUAL.TOL_RATIO_VISUAL * COOK_TOLERANCE)
            : COOK_TOLERANCE;
        var halfPlate = (COOK_VISUAL && COOK_VISUAL.FLAT_RATIO > 0)
            ? (target * tolVis * COOK_VISUAL.FLAT_RATIO) / max
            : 0; // en unités normalisées (0..1)
        var tFlatLow = mid - halfPlate;
        var tFlatHigh = mid + halfPlate;
        if (tFlatLow < 0) tFlatLow = 0;
        if (tFlatHigh > 1) tFlatHigh = 1;

        // Couleurs de base
        var cBlue = _hexToRgb(COLOR_BLUE_RAW);
        var cGreen = _hexToRgb(COLOR_GREEN_GOOD);
        var cRed = _hexToRgb(COLOR_RED_OVER);
        var cBlack = _hexToRgb(COLOR_BLACK_BURN);

        var gamma = (COOK_VISUAL && COOK_VISUAL.GREEN_GAMMA) || 1.0;
        var mixMax = (COOK_VISUAL && COOK_VISUAL.MIX_MAX != null) ? COOK_VISUAL.MIX_MAX : 1.0;

        // Peinture par colonne
        for (var x = 0; x < barW; x++) {
            var t = barW > 0 ? (x / barW) : 0;  // 0..1
            var base;

            if (halfPlate > 0 && t >= tFlatLow && t <= tFlatHigh) {
                // Petit plateau vert (si activé)
                base = cGreen;
            } else if (t <= mid) {
                // Bleu -> Vert jusqu'au centre (pas de plateau)
                var u0 = mid > 0 ? (t / mid) : 0;
                base = _mixColor(cBlue, cGreen, u0);
            } else if (t <= tPeak) {
                // Vert -> Rouge jusque pic rouge
                var u1 = (tPeak - mid) > 0 ? ((t - mid) / (tPeak - mid)) : 1;
                base = _mixColor(cGreen, cRed, u1);
            } else {
                // Rouge -> Noir
                var u2 = (1 - tPeak) > 0 ? ((t - tPeak) / (1 - tPeak)) : 1;
                base = _mixColor(cRed, cBlack, u2);
            }

            // Intensité selon cookFunction1, resserrée par gamma et plafonnée
            var xCookUnits = t * max; // 0..MAX_COOK_SCALE
            var raw = (typeof cookFunction1 === 'function') ? cookFunction1(xCookUnits, target * 2) : 0;
            if (raw < 0) raw = 0; if (raw > 1) raw = 1;
            var w = Math.pow(raw, gamma) * mixMax; // <-- rétrécit la zone verte

            var finalCol = _mixColor(base, cGreen, w);
            this.contents.fillRect(barX + x, barY, 1, barH, _rgba(finalCol, 1));
        }

        // Masque “futur” (après la position de cuisson actuelle)
        var toPx = function (v) { v = Math.max(0, Math.min(max, v)); return Math.floor(barW * v / max); };
        var pxC = toPx(cook);
        if (pxC < barW) this.contents.fillRect(barX + pxC, barY, barW - pxC, barH, COLOR_FUTURE_GRAY);

        // Dim si OFF
        var isOn = R ? !!R.isOn : false;
        if (!isOn) this.contents.fillRect(barX, barY, barW, barH, 'rgba(0,0,0,' + BAR_DIM_OFF_ALPHA + ')');

        // Curseur actuel
        this.contents.fillRect(barX + pxC, barY - 1, 2, barH + 2, "#ffffff");
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
        var R = this._inst && this._inst.rotisserie;
        if (!R) return false;

        if (CookingUI.heldCookDevice && CookingUI.heldCookDevice() === 'pot') return false;

        if (this._stack.length === 0) {
            if (!item || !item.canRotisserie) return false; // démarrage viande only

            // Reprendre cook/taste depuis la main si dispo
            var cookHeld = (typeof CookingUI.heldCookScoreRotisserie === 'function') ? CookingUI.heldCookScoreRotisserie() : null;
            var tasteHeld = (typeof CookingUI.heldTasteScore === 'function') ? CookingUI.heldTasteScore() : null;

            if (R.cookScore == null || R.stack.length === 0) {
                R._accMs = 0;
                R.cookScore = (typeof cookHeld === 'number') ? cookHeld : 0;
            }
            if (R.tasteScore == null) {
                R.tasteScore = (typeof tasteHeld === 'number') ? tasteHeld : (item.baseTasteScore || 0);
            }

            this._stack.push(item);
            this.refresh();
            return true;
        }

        var base = this._stack[this._stack.length - 1];
        var resId = RotisserieRules.getResultId(base, item);
        if (!resId) return false;

        var result = null;
        for (var i = 0; i < CookingIngredients.length; i++) {
            if (CookingIngredients[i].id === resId) { result = CookingIngredients[i]; break; }
        }
        if (!result) return false;

        R.tasteScore = (R.tasteScore || 0) + (item.baseTasteScore || 0);
        this._stack[this._stack.length - 1] = result;
        this.refresh();
        return true;
    };

    Window_CookingRotisserie.prototype.hasItems = function () { return this._stack.length > 0; };
    Window_CookingRotisserie.prototype.clearAll = function () {
        if (!this._stack || this._stack.length === 0) return false;
        // Vider "in place" pour conserver la même référence
        this._stack.length = 0;

        // Sécurité : s'assurer que l'instance pointe bien sur la même référence
        if (this._inst && this._inst.rotisserie && this._inst.rotisserie.stack !== this._stack) {
            this._inst.rotisserie.stack = this._stack;
        }
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
    Window_CookingRotisserie.prototype.topItem = function () {
        return this._stack.length ? this._stack[this._stack.length - 1] : null;
    };

    Window_CookingRotisserie.prototype.setInstance = function (inst) {
        this._inst = inst;
        this._stack = inst.rotisserie.stack;
        this.refresh();
    };

    //-----------------------------------------------------------------------------
    // NEW: Window_RotisserieActionBar (Allumer / Éteindre)
    //-----------------------------------------------------------------------------
    function Window_RotisserieActionBar() { this.initialize.apply(this, arguments); }
    Window_RotisserieActionBar.prototype = Object.create(Window_HorzCommand.prototype);
    Window_RotisserieActionBar.prototype.constructor = Window_RotisserieActionBar;

    Window_RotisserieActionBar.prototype.initialize = function (x, y, width) {
        this._forcedWidth = width || Graphics.boxWidth;
        this._isOn = false;
        Window_HorzCommand.prototype.initialize.call(this, x, y);
        this.select(0);
        this.openness = 255;
    };

    Window_RotisserieActionBar.prototype.windowWidth = function () { return this._forcedWidth; };
    Window_RotisserieActionBar.prototype.windowHeight = function () { return this.fittingHeight(1) + ACTION_BAR_MARGIN; }; // identique aux autres
    Window_RotisserieActionBar.prototype.maxCols = function () { return 2; };
    Window_RotisserieActionBar.prototype.spacing = function () { return 20; };

    Window_RotisserieActionBar.prototype.setPowerState = function (isOn) {
        this._isOn = !!isOn;
        this.refresh();
    };

    Window_RotisserieActionBar.prototype.makeCommandList = function () {
        this.addCommand("Allumer", 'rotiOn', !this._isOn);
        this.addCommand("Éteindre", 'rotiOff', this._isOn);
    };

    Window_RotisserieActionBar.prototype.drawItem = function (index) {
        var rect = this.itemRectForText(index);
        var enabled = this.isCommandEnabled(index);
        this.changePaintOpacity(enabled);
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
        this.changePaintOpacity(true);
    };

    // N'accepte l'input que quand elle est active (même pattern que ta barre d'actions)
    Window_RotisserieActionBar.prototype.processHandling = function () {
        if (!this.active) return;
        Window_HorzCommand.prototype.processHandling.call(this);
    };
    function Window_CookHelp() { this.initialize.apply(this, arguments); }
    Window_CookHelp.prototype = Object.create(Window_Help.prototype);
    Window_CookHelp.prototype.constructor = Window_CookHelp;

    Window_CookHelp.prototype.initialize = function () {
        Window_Help.prototype.initialize.call(this, HELP_LINES);
        // État de défilement
        this._rawText = "";
        this._wrappedText = "";
        this._fullTextHeight = 0;
        this._scrollOffset = 0;
        this._scrollWait = 0;
        this._needsScroll = false;
    };

    // Police plus petite uniquement pour cette fenêtre
    Window_CookHelp.prototype.standardFontSize = function () { return HELP_FONT_SIZE; };
    // (option) garde une hauteur compacte
    Window_CookHelp.prototype.lineHeight = function () { return this.standardFontSize() + 8; };

    // --- Wrap doux, puis défilement auto s'il y a trop de lignes ---
    Window_CookHelp.prototype.setText = function (text) {
        text = text || "";
        this._rawText = text;

        // 1) Wrap sur largeur (sans limiter à HELP_LINES)
        this._wrappedText = this._wrapToWidth(this._rawText);

        // 2) Mesure de la hauteur totale du texte
        this._fullTextHeight = this._measureTextHeight(this._wrappedText);

        // 3) Active/désactive le scroll
        this._needsScroll = (this._fullTextHeight > this.contentsHeight() + 1);
        this._scrollOffset = 0;
        this._scrollWait = this._needsScroll ? HELP_SCROLL_WAIT : 0;

        // Stocke le texte pour compat MV et déclenche refresh
        this._text = this._wrappedText;
        this.refresh();
    };

    // Dessin avec offset vertical + boucle
    Window_CookHelp.prototype.refresh = function () {
        this.contents.clear();
        if (!this._wrappedText) return;

        var x = this.textPadding();
        var y = -Math.floor(this._scrollOffset);

        // Dessine 1ère copie
        this.drawTextEx(this._wrappedText, x, y);

        // Si on scrolle, on dessine une seconde copie plus bas pour boucler proprement
        if (this._needsScroll) {
            this.drawTextEx(this._wrappedText, x, y + this._fullTextHeight + HELP_SCROLL_GAP);
        }
    };

    // Animation
    Window_CookHelp.prototype.update = function () {
        Window_Help.prototype.update.call(this);
        if (!this._needsScroll || this.openness === 0) return;

        if (this._scrollWait > 0) {
            this._scrollWait--;
            return;
        }

        this._scrollOffset += HELP_SCROLL_SPEED;
        var loopH = this._fullTextHeight + HELP_SCROLL_GAP;
        if (this._scrollOffset >= loopH) {
            this._scrollOffset = 0;
            this._scrollWait = HELP_SCROLL_WAIT; // petite pause en haut
        }
        this.refresh();
    };

    // --- Helpers -------------------------------------------------
    Window_CookHelp.prototype._measureTextHeight = function (text) {
        // Utilise la métrique MV pour un texte avec codes d'échappement
        this.resetFontSettings();
        var st = { index: 0, x: 0, y: 0, text: text, height: 0 };
        var h = this.calcTextHeight(st, true);
        return Math.max(h, this.lineHeight());
    };

    // Wrap doux: d'abord sur " | ", puis rewrap par mots si besoin
    Window_CookHelp.prototype._wrapToWidth = function (text) {
        var maxW = this.contentsWidth();
        var parts = (text || "").split("|");
        var out = "", line = "";

        for (var i = 0; i < parts.length; i++) {
            var seg = (parts[i] || "").trim();
            if (!seg) continue;
            var candidate = line ? (line + "  |  " + seg) : seg;
            if (this.textWidth(candidate) > maxW && line) {
                out += line + "\n";
                line = seg;
            } else {
                line = candidate;
            }
        }
        if (line) out += line;

        // Sécurité: rewrap par mots si une ligne dépasse encore
        var lines = out.split("\n");
        for (var li = 0; li < lines.length; li++) {
            var words = lines[li].split(/\s+/);
            var cur = "", fixed = [];
            for (var w = 0; w < words.length; w++) {
                var cand = cur ? (cur + " " + words[w]) : words[w];
                if (this.textWidth(cand) > maxW && cur) {
                    fixed.push(cur);
                    cur = words[w];
                } else {
                    cur = cand;
                }
            }
            if (cur) fixed.push(cur);
            lines[li] = fixed.join("\n");
        }
        out = lines.join("\n");

        return out; // ← IMPORTANT : on renvoie bien le texte wrapé
    };

    //-----------------------------------------------------------------------------

    function Window_CookingPlate() { this.initialize.apply(this, arguments); }
    Window_CookingPlate.prototype = Object.create(Window_Selectable.prototype);
    Window_CookingPlate.prototype.constructor = Window_CookingPlate;

    Window_CookingPlate.prototype.initialize = function (x, y, w, h) {
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this._slots = [null, null, null];
        this.refresh();
        this.select(0);
    };

    Window_CookingPlate.prototype.setInstance = function (inst) {
        this._inst = inst;
        this._slots = inst.plate.slots;  // référence directe à l’instance
        this.refresh();
    };

    Window_CookingPlate.prototype.maxItems = function () { return 3; };
    Window_CookingPlate.prototype.maxCols = function () { return 3; };

    Window_CookingPlate.prototype.itemRect = function (index) {
        var rect = new Rectangle();
        var w = Math.floor(this.contentsWidth() / 3);
        rect.x = w * index;
        rect.y = 0;
        rect.width = (index === 2) ? (this.contentsWidth() - w * 2) : w;
        rect.height = this.contentsHeight();
        return rect;
    };

    Window_CookingPlate.prototype.refresh = function () {
        this.contents.clear();
        this.createContents(); // ← AJOUT : garantit un canvas propre selon la taille actuelle
        this.changeTextColor(this.systemColor());
        this.drawText("Dressage (3 emplacements)", 0, 0, this.contentsWidth(), "left");
        this.changeTextColor(this.normalColor());

        for (var i = 0; i < 3; i++) {
            this.drawSlot(i);
        }
    };

    Window_CookingPlate.prototype.drawSlot = function (i) {
        var slot = this._slots[i];
        var rect = this.itemRect(i);
        var boxW = Math.min(128, rect.width - 24);
        var boxH = 72;
        var bx = rect.x + Math.floor((rect.width - boxW) / 2);
        var by = rect.y + Math.floor((rect.height - boxH) / 2) - 8;

        // cadre
        this.contents.fillRect(bx, by, boxW, boxH, "rgba(255,255,255,0.10)");
        if (!slot) {
            this.changeTextColor(this.textColor(7));
            this.drawText("(vide)", rect.x, by + boxH / 2 - this.lineHeight() / 2, rect.width, "center");
            this.changeTextColor(this.normalColor());
            return;
        }

        // Affichage item (icône + nom) — PAS de cuisson/goût
        var item = slot.item;
        if (item) {
            var bmp = ImageManager.loadPicture(ING_SHEET);
            if (bmp.isReady()) {
                var sx = (item.iconIndex % ING_ICON_COLS) * ING_ICON_W;
                var sy = Math.floor(item.iconIndex / ING_ICON_COLS) * ING_ICON_H;
                this.contents.blt(bmp, sx, sy, ING_ICON_W, ING_ICON_H, bx + 8, by + 8);
            } else {
                bmp.addLoadListener(this.refresh.bind(this));
            }
            this.drawText(item.name, bx + 8 + 36, by + 4, boxW - 44);
        }
    };

    Window_CookingPlate.prototype.placeItem = function (item, cook, taste) {
        var i = this.index();
        if (!this._slots[i]) {
            this._slots[i] = { item: item, cook: cook || 0, taste: taste || 0, device: (CookingUI.heldCookDevice && CookingUI.heldCookDevice()) || null }; // AJOUT device
            this.refresh();
            return true;
        }
        return false; // slot occupé -> refuser (comportement simple)
    };

    Window_CookingPlate.prototype.takeItem = function () {
        var i = this.index();
        var slot = this._slots[i];
        if (!slot) return null;
        this._slots[i] = null;
        this.refresh();
        return slot; // { item, cook, taste }
    };

    Window_CookingPlate.prototype.clearAll = function () {
        for (var i = 0; i < 3; i++) this._slots[i] = null; // conserve la même référence
        this.refresh();
    };

    //-----------------------------------------------------------------------------

    function Window_PlateActionBar() { this.initialize.apply(this, arguments); }
    Window_PlateActionBar.prototype = Object.create(Window_HorzCommand.prototype);
    Window_PlateActionBar.prototype.constructor = Window_PlateActionBar;

    Window_PlateActionBar.prototype.initialize = function (x, y, width) {
        this._forcedWidth = width || Graphics.boxWidth;
        Window_HorzCommand.prototype.initialize.call(this, x, y);
        this.select(0);
        this.openness = 255;
    };

    Window_PlateActionBar.prototype.windowWidth = function () { return this._forcedWidth; };
    Window_PlateActionBar.prototype.windowHeight = function () { return this.fittingHeight(1) + ACTION_BAR_MARGIN; };
    Window_PlateActionBar.prototype.maxCols = function () { return 2; };
    Window_PlateActionBar.prototype.spacing = function () { return 20; };

    Window_PlateActionBar.prototype.makeCommandList = function () {
        this.addCommand("Nettoyer", 'plateClear', true);
        this.addCommand("Finaliser plat", 'plateFinish', true);
    };

    Window_PlateActionBar.prototype.drawItem = function (index) {
        var rect = this.itemRectForText(index);
        var enabled = this.isCommandEnabled(index);
        this.changePaintOpacity(enabled);
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
        this.changePaintOpacity(true);
    };

    // Empêche d'absorber l'input quand inactive (même pattern que la tienne)
    Window_PlateActionBar.prototype.processHandlidng = function () {
        if (!this.active) return;
        Window_HorzCommand.prototype.processHandling.call(this);
    };


    function Window_CookingPot() { this.initialize.apply(this, arguments); }
    Window_CookingPot.prototype = Object.create(Window_Selectable.prototype);
    Window_CookingPot.prototype.constructor = Window_CookingPot;

    Window_CookingPot.prototype.initialize = function (x, y, w, h) {
        this._stack = [];
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this.refresh();
    };
    Window_CookingPot.prototype.maxItems = function () { return 1; };
    Window_CookingPot.prototype.maxCols = function () { return 1; };
    Window_CookingPot.prototype.itemRect = function () {
        var rect = new Rectangle(); var boxW = 96, boxH = 72;
        rect.width = boxW; rect.height = boxH;
        rect.x = Math.floor((this.contentsWidth() - boxW) / 2);
        rect.y = Math.floor((this.contentsHeight() - boxH) / 2);
        return rect;
    };

    Window_CookingPot.prototype.refresh = function () {
        this.contents.clear();
        var rect = this.itemRect(0);
        this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, "rgba(255,255,255,0.10)");
        this.changeTextColor(this.systemColor());
        this.drawText("Casserole", 0, 0, this.contentsWidth(), "left");
        this.changeTextColor(this.normalColor());

        if (this._stack.length > 0) {
            var maxIcons = Math.min(3, this._stack.length);
            for (var i = 0; i < maxIcons; i++) {
                var it = this._stack[this._stack.length - 1 - i];
                var dx = rect.x + 8 + i * 18, dy = rect.y + 8 + i * 6;
                this.drawIngredientIcon(it.iconIndex, dx, dy);
            }
            var top = this._stack[this._stack.length - 1];
            this.drawText(top.name, rect.x + 8, rect.y + rect.height - this.lineHeight(), rect.width - 16, "center");
        } else {
            this.changeTextColor(this.textColor(7));
            this.drawText("(vide — plat/principal/side)", rect.x, rect.y + rect.height / 2 - this.lineHeight() / 2, rect.width, "center");
            this.changeTextColor(this.normalColor());
        }
        this.drawCookBar(); // même barre/gradient que rôtisserie
    };

    // ==== reprend les helpers couleur déjà déclarés ====
    // Copie quasi-identique de drawCookBar de la rôtisserie,
    // mais en lisant l'état "pot" au lieu de "rotisserie".
    Window_CookingPot.prototype.drawCookBar = function () {
        var top = this._stack.length ? this._stack[this._stack.length - 1] : null;
        var cw = this.contentsWidth();
        var barX = 0, barW = cw, barH = 12;
        var rect = this.itemRect(0);
        var barY = rect.y + rect.height + 14;

        if (!top) { this.contents.fillRect(barX, barY, barW, barH, COLOR_FUTURE_GRAY); return; }

        var target = (typeof top.targetCookingScore === 'number') ? top.targetCookingScore : 0;
        var P = this._inst && this._inst.pot ? this._inst.pot : null;
        var cook = (P && typeof P.cookScore === 'number') ? P.cookScore : 0;

        var max = MAX_COOK_SCALE;
        if (cook < 0) cook = 0; if (cook > max) cook = max;

        var mid = max > 0 ? (target / max) : 0;
        var redPeakVal = Math.min(max, Math.max(target, Math.round(target * RED_PEAK_RATIO)));
        var tPeak = max > 0 ? (redPeakVal / max) : 1;

        var tolVis = (typeof COOK_VISUAL !== 'undefined' && COOK_VISUAL.TOL_RATIO_VISUAL != null)
            ? (COOK_VISUAL.TOL_RATIO_VISUAL * COOK_TOLERANCE) : COOK_TOLERANCE;
        var halfPlate = (COOK_VISUAL && COOK_VISUAL.FLAT_RATIO > 0) ? (target * tolVis * COOK_VISUAL.FLAT_RATIO) / max : 0;
        var tFlatLow = Math.max(0, mid - halfPlate);
        var tFlatHigh = Math.min(1, mid + halfPlate);

        var cBlue = _hexToRgb(COLOR_BLUE_RAW), cGreen = _hexToRgb(COLOR_GREEN_GOOD),
            cRed = _hexToRgb(COLOR_RED_OVER), cBlack = _hexToRgb(COLOR_BLACK_BURN);
        var gamma = (COOK_VISUAL && COOK_VISUAL.GREEN_GAMMA) || 1.0;
        var mixMax = (COOK_VISUAL && COOK_VISUAL.MIX_MAX != null) ? COOK_VISUAL.MIX_MAX : 1.0;

        for (var x = 0; x < barW; x++) {
            var t = barW > 0 ? (x / barW) : 0;
            var base;
            if (halfPlate > 0 && t >= tFlatLow && t <= tFlatHigh) { base = cGreen; }
            else if (t <= mid) { var u0 = mid > 0 ? (t / mid) : 0; base = _mixColor(cBlue, cGreen, u0); }
            else if (t <= tPeak) { var u1 = (tPeak - mid) > 0 ? ((t - mid) / (tPeak - mid)) : 1; base = _mixColor(cGreen, cRed, u1); }
            else { var u2 = (1 - tPeak) > 0 ? ((t - tPeak) / (1 - tPeak)) : 1; base = _mixColor(cRed, cBlack, u2); }

            var xCookUnits = t * max;
            var raw = (typeof cookFunction1 === 'function') ? cookFunction1(xCookUnits, target * 2) : 0;
            if (raw < 0) raw = 0; if (raw > 1) raw = 1;
            var w = Math.pow(raw, gamma) * mixMax;
            var finalCol = _mixColor(base, cGreen, w);
            this.contents.fillRect(barX + x, barY, 1, barH, _rgba(finalCol, 1));
        }

        var toPx = function (v) { v = Math.max(0, Math.min(max, v)); return Math.floor(barW * v / max); };
        var pxC = toPx(cook);
        if (pxC < barW) this.contents.fillRect(barX + pxC, barY, barW - pxC, barH, COLOR_FUTURE_GRAY);

        var isOn = P ? !!P.isOn : false;
        if (!isOn) this.contents.fillRect(barX, barY, barW, barH, 'rgba(0,0,0,' + BAR_DIM_OFF_ALPHA + ')');

        this.contents.fillRect(barX + pxC, barY - 1, 2, barH + 2, "#ffffff");
    };

    Window_CookingPot.prototype.drawIngredientIcon = Window_CookingRotisserie.prototype.drawIngredientIcon;

    Window_CookingPot.prototype.canAccept = function (item) {
        var base = this._stack.length ? this._stack[this._stack.length - 1] : null;
        return PotRules.canPlace(base, item);
    };

    Window_CookingPot.prototype.placeHeldItem = function (item) {
        var P = this._inst && this._inst.pot;
        if (!P) return false;

        // Interdiction “double cuisson” (déjà passé en rôtisserie)
        if (CookingUI.heldCookDevice && CookingUI.heldCookDevice() === 'roti') return false; // AJOUT

        if (this._stack.length === 0) {
            if (!item || !PotRules.canStartInPot(item)) return false;
            var cookHeld = (typeof CookingUI.heldCookScoreRotisserie === 'function') ? CookingUI.heldCookScoreRotisserie() : null;
            var tasteHeld = (typeof CookingUI.heldTasteScore === 'function') ? CookingUI.heldTasteScore() : null;

            if (P.cookScore == null || P.stack.length === 0) {
                P._accMs = 0;
                P.cookScore = (typeof cookHeld === 'number') ? cookHeld : 0;
            }
            if (P.tasteScore == null) {
                P.tasteScore = (typeof tasteHeld === 'number') ? tasteHeld : (item.baseTasteScore || 0);
            }
            this._stack.push(item);
            this.refresh();
            return true;
        }

        var base = this._stack[this._stack.length - 1];
        var resId = PotRules.getResultId(base, item);
        if (!resId) return false;

        var result = null;
        for (var i = 0; i < CookingIngredients.length; i++) { if (CookingIngredients[i].id === resId) { result = CookingIngredients[i]; break; } }
        if (!result) return false;

        P.tasteScore = (P.tasteScore || 0) + (item.baseTasteScore || 0);
        this._stack[this._stack.length - 1] = result;
        this.refresh();
        return true;
    };

    Window_CookingPot.prototype.hasItems = function () { return this._stack.length > 0; };
    Window_CookingPot.prototype.clearAll = function () {
        if (!this._stack || this._stack.length === 0) return false;
        this._stack.length = 0;
        if (this._inst && this._inst.pot && this._inst.pot.stack !== this._stack) {
            this._inst.pot.stack = this._stack;
        }
        this.refresh();
        return true;
    };
    Window_CookingPot.prototype.takeTop = function () {
        if (this._stack.length === 0) return null;
        var it = this._stack.pop();
        this.refresh();
        return it || null;
    };
    Window_CookingPot.prototype.topItem = function () { return this._stack.length ? this._stack[this._stack.length - 1] : null; };
    Window_CookingPot.prototype.setInstance = function (inst) { this._inst = inst; this._stack = inst.pot.stack; this.refresh(); };

    function Window_PotActionBar() { this.initialize.apply(this, arguments); }
    Window_PotActionBar.prototype = Object.create(Window_HorzCommand.prototype);
    Window_PotActionBar.prototype.constructor = Window_PotActionBar;

    Window_PotActionBar.prototype.initialize = function (x, y, width) {
        this._forcedWidth = width || Graphics.boxWidth;
        this._isOn = false;
        Window_HorzCommand.prototype.initialize.call(this, x, y);
        this.select(0); this.openness = 255;
    };
    Window_PotActionBar.prototype.windowWidth = function () { return this._forcedWidth; };
    Window_PotActionBar.prototype.windowHeight = function () { return this.fittingHeight(1) + ACTION_BAR_MARGIN; };
    Window_PotActionBar.prototype.maxCols = function () { return 2; };
    Window_PotActionBar.prototype.spacing = function () { return 20; };

    Window_PotActionBar.prototype.setPowerState = function (isOn) { this._isOn = !!isOn; this.refresh(); };
    Window_PotActionBar.prototype.makeCommandList = function () {
        this.addCommand("Allumer", 'potOn', !this._isOn);
        this.addCommand("Éteindre", 'potOff', this._isOn);
    };
    Window_PotActionBar.prototype.drawItem = function (index) {
        var rect = this.itemRectForText(index);
        var enabled = this.isCommandEnabled(index);
        this.changePaintOpacity(enabled);
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
        this.changePaintOpacity(true);
    };
    Window_PotActionBar.prototype.processHandling = function () {
        if (!this.active) return;
        Window_HorzCommand.prototype.processHandling.call(this);
    };

})();
