
// --- Réglages spécifiques à ce mode ---
var SATOTSU_MOVE_DELAY = 1;  // cadence en frames
var SATOTSU_LOOKAHEAD = 20; // anticipation
var SATOTSU_NAME = "Satotsu";
var SATOTSU_EXCLUDED = { "Trap": true, "Satotsu": true };
const ZERO_EXHAUST_COOLDOWN_FRAMES = 180;
const ENDURANCE_VAR_ID = 100;
const MAX_ENDURANCE = 2000;
const SAT_DIST_THRESHOLD = 15;
const HUD_W = 220, HUD_H = 24;   // taille du bandeau
const HUD_MARGIN = 0;


// Vitesse d'usure / régénération (par frame)
const ENDURANCE_DRAIN_DASH = 16;  // ↓ rapide quand on dash + bouge
const ENDURANCE_REGEN_NODASH = 1;  // ↑ lent quand on ne dash pas

// Délai avant de recommencer à régénérer après avoir dashé (en frames)
const ENDURANCE_REGEN_DELAY_FRAMES = 20;

// --- Espaces mémoire (indépendants du 1er script) ---
var _satotsuTimers = Object.create(null);
var _satotsuLastMove = Object.create(null);

function satotsuTimerKey(ch) {
    return 'sat_' + (ch === $gamePlayer ? 'player' : ('e' + ch.eventId()));
}
function satotsuSetLastMove(ch, mv) {
    _satotsuLastMove[satotsuTimerKey(ch)] = mv;
}
function satotsuGetLastMove(ch) {
    return _satotsuLastMove[satotsuTimerKey(ch)];
}

// --- Utils (ne collisionnent pas avec l'autre script) ---
function satNextXY(x, y, dir) { return [$gameMap.roundXWithDirection(x, dir), $gameMap.roundYWithDirection(y, dir)]; }
function satNextXYDiag(x, y, h, v) { return [$gameMap.roundXWithDirection(x, h), $gameMap.roundYWithDirection(y, v)]; }
function satCanPassDir(ch, x, y, dir) { return ch.canPass(x, y, dir); }
function satCanPassDiag(ch, x, y, h, v) { return ch.canPassDiagonally(x, y, h, v); }
function satEventName(ch) { var e = ch.event && ch.event(); return e ? String(e.name || "").trim() : ""; }
function satCenterLineX() { return ($gameMap.width() - 1) / 2; }

function satFindSatotsu() {
    var evs = $gameMap.events();
    for (var i = 0; i < evs.length; i++) {
        if (satEventName(evs[i]) === SATOTSU_NAME) return evs[i];
    }
    return null;
}
function satSatotsuAxisX() {
    var s = satFindSatotsu();
    return s ? s.x : satCenterLineX();
}

// --- Simulations ---
function satSimulateUp(ch, steps) {
    var x = ch.x, y = ch.y;
    for (var i = 0; i < steps; i++) {
        if (!satCanPassDir(ch, x, y, 8)) return { ok: false };
        var p = satNextXY(x, y, 8); x = p[0]; y = p[1];
    }
    return { ok: true, x: x, y: y };
}
function satSimulateDiag(ch, h, v, steps) {
    var x = ch.x, y = ch.y;
    for (var i = 0; i < steps; i++) {
        if (!satCanPassDiag(ch, x, y, h, v)) return { ok: false };
        var p = satNextXYDiag(x, y, h, v); x = p[0]; y = p[1];
    }
    return { ok: true, x: x, y: y };
}
function satHasEscape(ch, x, y) {
    if (satCanPassDir(ch, x, y, 8)) return true;
    if (satCanPassDiag(ch, x, y, 6, 8)) return true;
    if (satCanPassDiag(ch, x, y, 4, 8)) return true;
    return false;
}
function satCanUp(ch) {
    if (!satCanPassDir(ch, ch.x, ch.y, 8)) return false;
    for (var d = SATOTSU_LOOKAHEAD; d >= 1; d--) {
        var sim = satSimulateUp(ch, d);
        if (!sim.ok) continue;
        if (satHasEscape(ch, sim.x, sim.y)) return true;
    }
    return false;
}
function satCanDiag(ch, h, v) {
    if (!satCanPassDiag(ch, ch.x, ch.y, h, v)) return false;
    for (var d = SATOTSU_LOOKAHEAD; d >= 1; d--) {
        var sim = satSimulateDiag(ch, h, v, d);
        if (!sim.ok) continue;
        if (satHasEscape(ch, sim.x, sim.y)) return true;
    }
    return false;
}

function satMaxY() {
    var s = satFindSatotsu();
    return s ? (s.y + 1) : $gameMap.height(); // si pas trouvé => aucune limite
}

// --- Préférence droite/gauche vers l'axe de Satotsu ---
function satPreferRight(ch) {
    var tx = satSatotsuAxisX();
    if ($gameMap.isLoopHorizontal && $gameMap.isLoopHorizontal()) {
        var w = $gameMap.width();
        var distR = (tx - ch.x + w) % w;
        var distL = (ch.x - tx + w) % w;
        if (distR < distL) return 1;
        if (distL < distR) return -1;
        return 0;
    }
    if (ch.x < tx) return 1;
    if (ch.x > tx) return -1;
    return 0;
}

// --- Décision d'un pas ---
function satDecideMove(ch) {
    if (ch.isMoving()) return;

    var maxY = satMaxY();

    // Si le perso est déjà au-dessus de la limite (y <= maxY), on ne le laisse plus monter
    if (ch.y <= maxY) {
        return; // il peut encore bouger latéralement si tu veux, mais pas monter
    }

    var pr = satPreferRight(ch);

    if (pr === 0) {
        if (satCanUp(ch)) { ch.moveStraight(8); satotsuSetLastMove(ch, 8); return; }
    }
    if (pr === 1) {
        if (satCanDiag(ch, 6, 8)) { ch.moveDiagonally(6, 8); satotsuSetLastMove(ch, 9); return; }
        if (satCanDiag(ch, 4, 8)) { ch.moveDiagonally(4, 8); satotsuSetLastMove(ch, 7); return; }
    } else {
        if (satCanDiag(ch, 4, 8)) { ch.moveDiagonally(4, 8); satotsuSetLastMove(ch, 7); return; }
        if (satCanDiag(ch, 6, 8)) { ch.moveDiagonally(6, 8); satotsuSetLastMove(ch, 9); return; }
    }

    if (satotsuGetLastMove(ch) === 6 && satCanPassDir(ch, ch.x, ch.y, 6)) { ch.moveStraight(6); satotsuSetLastMove(ch, 6); return; }
    if (satotsuGetLastMove(ch) === 4 && satCanPassDir(ch, ch.x, ch.y, 4)) { ch.moveStraight(4); satotsuSetLastMove(ch, 4); return; }

    if (pr === 1) {
        if (satCanPassDir(ch, ch.x, ch.y, 6)) { ch.moveStraight(6); satotsuSetLastMove(ch, 6); return; }
        if (satCanPassDir(ch, ch.x, ch.y, 4)) { ch.moveStraight(4); satotsuSetLastMove(ch, 4); return; }
    } else {
        if (satCanPassDir(ch, ch.x, ch.y, 4)) { ch.moveStraight(4); satotsuSetLastMove(ch, 4); return; }
        if (satCanPassDir(ch, ch.x, ch.y, 6)) { ch.moveStraight(6); satotsuSetLastMove(ch, 6); return; }
    }
}

// --- Boucle ---
var _satotsuAuto = false;
var _Scene_Map_update2 = Scene_Map.prototype.update;
Scene_Map.prototype.update = function () {
    _Scene_Map_update2.call(this);
    if (!_satotsuAuto) return;

    // --- Endurance: 
    this.updateEnduranceValue2();

    var list = $gameMap.events().filter(function (ev) {
        return !SATOTSU_EXCLUDED[satEventName(ev)];
    });

    for (var i = 0; i < list.length; i++) {
        var ch = list[i], key = satotsuTimerKey(ch);
        var t = _satotsuTimers[key] || 0;
        if (t <= 0) { satDecideMove(ch); _satotsuTimers[key] = SATOTSU_MOVE_DELAY; }
        else _satotsuTimers[key] = t - 1;
    }

    this.updateEnduranceHUD2();

    if (this._satDistSprite) this.updateSatotsuDistanceHUD();
};


Scene_Map.prototype._satotsuFindCached = function () {
    const mapId = $gameMap.mapId();
    if (this._satDist_cachedSat && this._satDist_cachedMapId === mapId) {
        return this._satDist_cachedSat;
    }
    const evs = $gameMap.events();
    for (let i = 0; i < evs.length; i++) {
        const data = evs[i].event && evs[i].event();
        const name = data ? String(data.name || "") : "";
        if (name === "Satotsu") {
            this._satDist_cachedSat = evs[i];
            this._satDist_cachedMapId = mapId;
            return evs[i];
        }
    }
    this._satDist_cachedSat = null;
    this._satDist_cachedMapId = mapId;
    return null;
};

Scene_Map.prototype.updateSatotsuDistanceHUD = function () {
    const bmp = this._satDistSprite.bitmap;
    bmp.clear();

    const sat = this._satotsuFindCached();
    let text = "Satotsu: --";
    let color = "#bbbbbb";

    if (sat) {        
        // Distance euclidienne (Pythagore)
        const dx = $gamePlayer.x - sat.x;
        const dy = $gamePlayer.y - sat.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // arrondi à 1 décimale (tu peux mettre 0 si tu veux entier)
        const distRounded = Math.round(dist * 10) / 10;

        text = "Satotsu: " + distRounded;
        color = (dist < SAT_DIST_THRESHOLD) ? "#ffffff" : "#ff3b30";
    }

    // Fond léger pour la lisibilité
    bmp.fillRect(0, 0, HUD_W, HUD_H, "rgba(0,0,0,0.35)");
    bmp.textColor = color;
    bmp.outlineWidth = 3;
    bmp.outlineColor = "rgba(0,0,0,0.6)";
    bmp.fontSize = 18;
    bmp.drawText(text, 6, 0, HUD_W - 12, HUD_H, "left");
};


// === Affichage des cœurs & HUD===
const _Scene_Map_createAllWindows4 = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function () {
    _Scene_Map_createAllWindows4.call(this);
    this.createEnduranceHUD2();
    this.createSatotsuDistanceHUD();
};


Scene_Map.prototype.createSatotsuDistanceHUD = function () {
    // Calcule la zone "visible" (utile si la map est plus petite que la box)
    const visibleW = $gameMap.tileWidth() * $gameMap.width();
    const visibleH = $gameMap.tileHeight() * $gameMap.height();
    const w = Math.min(Graphics.boxWidth, visibleW);
    const h = Math.min(Graphics.boxHeight, visibleH);
    let dw = Graphics.boxWidth - w;
    let dh = Graphics.boxHeight - h;
    if (dw < 0) dw = 0;
    if (dh < 0) dh = 0;

    const bmp = new Bitmap(HUD_W, HUD_H);
    this._satDistSprite = new Sprite(bmp);
    // Ancré au coin haut-gauche de la zone visible
    this._satDistSprite.x = Math.floor(dw / 2) + HUD_MARGIN;
    this._satDistSprite.y = Math.floor(dh / 2) + HUD_MARGIN;
    this.addChild(this._satDistSprite);

    // Cache événement + map courante pour éviter de chercher à chaque frame
    this._satDist_cachedSat = null;
    this._satDist_cachedMapId = 0;
};


Scene_Map.prototype.createEnduranceHUD2 = function () {
    const visibleW = $gameMap.tileWidth() * $gameMap.width();
    const visibleH = $gameMap.tileHeight() * $gameMap.height();

    const w = Math.min(Graphics.boxWidth, visibleW);
    const h = Math.min(Graphics.boxHeight, visibleH);
    let dw = Graphics.boxWidth - w;
    let dh = Graphics.boxHeight - h;
    if (dw < 0) dw = 0;
    if (dh < 0) dh = 0;

    this._enduranceSprite = new Sprite(new Bitmap(200, 24));
    this._enduranceSprite.x = dw / 2 + (Graphics.boxWidth / 2 - 100);
    this._enduranceSprite.y = dh / 2;
    this.addChild(this._enduranceSprite);
};

Scene_Map.prototype.updateEnduranceHUD2 = function () {
    if (!_satotsuAuto) return;
    const bmp = this._enduranceSprite.bitmap;
    bmp.clear();
    const val = $gameVariables.value(ENDURANCE_VAR_ID) * 100 / MAX_ENDURANCE;
    const percent = val / 100;
    bmp.fillRect(0, 0, 200, 24, "#444");
    bmp.fillRect(0, 0, 200 * percent, 24, "#2ecc71");
    bmp.textColor = "white";
    bmp.drawText(`Endurance: ${val}`, 0, 0, 200, 24, 'center');
};

Scene_Map.prototype.updateEnduranceValue2 = function () {
    // Lecture/clamp
    var cur = Number($gameVariables.value(ENDURANCE_VAR_ID) || 0);
    if (isNaN(cur)) cur = 0;

    // Timers/états internes
    if (this._enduranceRegenWait2 == null) this._enduranceRegenWait2 = 0; // délai après dash
    if (this._enduranceZeroCD2 == null) this._enduranceZeroCD2 = 0; // cooldown "à zéro"
    if (this._endurancePrev2 == null) this._endurancePrev2 = cur; // pour détecter la transition >0→0

    // État courant
    var isMoving = $gamePlayer.isMoving();
    var isDashingOk = $gamePlayer.isDashing() && isMoving; // sera forcé à false par notre hook si interdit

    // --- Drain quand on dash ---
    if (isDashingOk && cur > 0) {
        cur -= ENDURANCE_DRAIN_DASH;
        if (cur <= 0) {
            cur = 0;
            this._enduranceZeroCD2 = ZERO_EXHAUST_COOLDOWN_FRAMES; // cooldown déclenché UNIQUEMENT ici
        }
        this._enduranceRegenWait2 = ENDURANCE_REGEN_DELAY_FRAMES;
    } else {
        // --- Régénération / cooldown ---
        if (cur <= 0) {
            // On ne réarme PAS le cooldown si on reste à 0.
            if (this._enduranceZeroCD2 > 0) {
                this._enduranceZeroCD2--;        // pendant le cooldown : pas de regen
            } else {
                // Cooldown terminé : on attend le petit délai post-dash puis on remonte
                if (this._enduranceRegenWait2 > 0) this._enduranceRegenWait2--;
                else cur += ENDURANCE_REGEN_NODASH;
            }
        } else {
            // cur > 0 : régénération normale quand le délai est écoulé
            if (this._enduranceRegenWait2 > 0) this._enduranceRegenWait2--;
            else cur += ENDURANCE_REGEN_NODASH;
        }
    }

    // Forcer le dash OFF si endurance vide ou cooldown en cours
    $gameSystem._disableDash = (cur <= 0) || (this._enduranceZeroCD2 > 0);

    // Clamp + write
    if (cur < 0) cur = 0;
    if (cur > MAX_ENDURANCE) cur = MAX_ENDURANCE;
    $gameVariables.setValue(ENDURANCE_VAR_ID, cur);

    this._endurancePrev2 = cur;
};

var _GP_moveByInput_sat = Game_Player.prototype.moveByInput;

Game_Player.prototype.moveByInput = function () {
    // En dehors du mini-jeu : comportement vanilla
    if (!_satotsuAuto) {
        return _GP_moveByInput_sat.call(this);
    }

    if (this.isMoving() || !this.canMove()) return;

    // --- Clavier: détection des 2 directions simultanées ---
    var horz = 0, vert = 0;
    if (Input.isPressed('left')) horz = 4;
    else if (Input.isPressed('right')) horz = 6;
    if (Input.isPressed('up')) vert = 8;
    else if (Input.isPressed('down')) vert = 2;

    if (horz && vert) {
        if (this.canPassDiagonally(this.x, this.y, horz, vert)) {
            this.moveDiagonally(horz, vert);
            $gameTemp.clearDestination();
            return;
        } else {
            // Fallback si la diagonale est bloquée
            if (this.canPass(this.x, this.y, vert)) { this.moveStraight(vert); $gameTemp.clearDestination(); return; }
            if (this.canPass(this.x, this.y, horz)) { this.moveStraight(horz); $gameTemp.clearDestination(); return; }
        }
    }

    // --- Tactile/Souris: destination en diagonale par rapport au joueur ---
    if ($gameTemp.isDestinationValid()) {
        var dx = $gameTemp.destinationX() - this.x;
        var dy = $gameTemp.destinationY() - this.y;
        var h = dx > 0 ? 6 : (dx < 0 ? 4 : 0);
        var v = dy > 0 ? 2 : (dy < 0 ? 8 : 0);

        if (h && v) { // diagonale demandée
            if (this.canPassDiagonally(this.x, this.y, h, v)) {
                this.moveDiagonally(h, v);
                // Si on visait juste la case voisine, on consomme la destination
                if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) $gameTemp.clearDestination();
                return;
            } else {
                // Fallback
                if (this.canPass(this.x, this.y, v)) { this.moveStraight(v); return; }
                if (this.canPass(this.x, this.y, h)) { this.moveStraight(h); return; }
            }
        }
    }

    // Sinon, laisse le moteur gérer (4 directions + pathfinding)
    _GP_moveByInput_sat.call(this);
};


var _GP_isDashing_sat = Game_Player.prototype.isDashing;
var _GP_updateDashing_sat = Game_Player.prototype.updateDashing;

// Empêche le dash quand endurance == 0 ou cooldown actif (pendant le mini-jeu)
Game_Player.prototype.isDashing = function () {
    if (_satotsuAuto) {
        var cur = Number($gameVariables.value(ENDURANCE_VAR_ID) || 0);
        var scene = SceneManager._scene;
        var zeroCd = scene && scene._enduranceZeroCD2 || 0;
        if (cur <= 0 || zeroCd > 0) return false;
    }
    return _GP_isDashing_sat.call(this);
};

// Même verrou après le calcul vanilla pour être 100% sûr
Game_Player.prototype.updateDashing = function () {
    _GP_updateDashing_sat.call(this);
    if (_satotsuAuto) {
        var cur = Number($gameVariables.value(ENDURANCE_VAR_ID) || 0);
        var scene = SceneManager._scene;
        var zeroCd = scene && scene._enduranceZeroCD2 || 0;
        if (cur <= 0 || zeroCd > 0) this._dashing = false;
    }
};

window.checkWinSatotsu = function () {
    var sat = satFindSatotsu();
    var dx = $gamePlayer.x - sat.x;
    var dy = $gamePlayer.y - sat.y;
    var dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < SAT_DIST_THRESHOLD) {
        $gameVariables.setValue(49, 1);
    } else {
        $gameVariables.setValue(49, 0);
    }
}

// --- Script calls ---
window.enableSatotsuAutoMove = function () {
    _satotsuAuto = true;
    _satotsuTimers = Object.create(null);
    _satotsuLastMove = Object.create(null);
};

window.disableSatotsuAutoMove = function () {
    _satotsuAuto = false;
    _satotsuTimers = Object.create(null);
    _satotsuLastMove = Object.create(null);
};

window.stopPlayer = function () {
    // 1) Empêche le joueur de bouger
    $gamePlayer._moveSpeed = 0;        // "gèle" la vitesse
    $gamePlayer._locked = true;        // évite les inputs (flag custom)

    // Empêche toutes les entrées pendant la durée
    Input.clear();
    TouchInput.clear();

    // 3) Joue une animation sur le joueur (exemple: ID 1)
    $gamePlayer.requestAnimation(1);

    // 4) Après 2 secondes, on redonne le contrôle
    setTimeout(function () {
        $gamePlayer._moveSpeed = 3;      // vitesse par défaut (modifie selon ton jeu)
        $gamePlayer._locked = false;
    }, 2000);
}

window.slowPlayer = function () {
    // 1) Empêche le joueur de bouger
    $gamePlayer._moveSpeed = 2;        // "gèle" la vitesse

    // 3) Joue une animation sur le joueur (exemple: ID 1)
    $gamePlayer.requestAnimation(1);

    // 4) Après 2 secondes, on redonne le contrôle
    setTimeout(function () {
        $gamePlayer._moveSpeed = 3;      // vitesse par défaut (modifie selon ton jeu)
    }, 2000);
}