
const MOVE_DELAY = 1;
const LOOKAHEAD = 20;

const lastMove = {};
let disableGon = false;

function setLastMove(ch, move) {
    lastMove[timerIdFor(ch)] = move;
}

function getLastMove(ch) {
    return lastMove[timerIdFor(ch)];
}

// --- Helpers position/déplacement ---
function nextXY(x, y, dir) {
    return [$gameMap.roundXWithDirection(x, dir), $gameMap.roundYWithDirection(y, dir)];
}
function nextXYDiag(x, y, horz, vert) {
    var nx = $gameMap.roundXWithDirection(x, horz);
    var ny = $gameMap.roundYWithDirection(y, vert);
    return [nx, ny];
}
function canPassDir(ch, x, y, dir) {
    return ch.canPass(x, y, dir);
}
function canPassDiag(ch, x, y, horz, vert) {
    return ch.canPassDiagonally(x, y, horz, vert);
}
// +++ AJOUT : fonction utilitaire pour l'axe central (en cases)
function centerLineX() {
    // centre "géométrique" de la map (peut valoir .5 sur une largeur paire)
    return ($gameMap.width() - 1) / 2;
}

// --- Simulation UP ---
function simulateUpSteps(ch, steps) {
    var x = ch.x, y = ch.y;
    for (var i = 0; i < steps; i++) {
        if (!canPassDir(ch, x, y, 8)) return { ok: false };
        var p = nextXY(x, y, 8); x = p[0]; y = p[1];
    }
    return { ok: true, x: x, y: y };
}
// --- Simulation DIAG ---
function simulateDiagSteps(ch, horz, vert, steps) {
    var x = ch.x, y = ch.y;
    for (var i = 0; i < steps; i++) {
        if (!canPassDiag(ch, x, y, horz, vert)) return { ok: false };
        var p = nextXYDiag(x, y, horz, vert); x = p[0]; y = p[1];
    }
    return { ok: true, x: x, y: y };
}

// --- Depuis une position simulée, y a-t-il une issue immédiate ?
function hasImmediateEscapeAt(ch, x, y) {
    // Continuer vers le haut
    if (canPassDir(ch, x, y, 8)) return true;
    // Ou diagonales depuis cette position
    if (canPassDiag(ch, x, y, 6, 8)) return true; // haut-droite
    if (canPassDiag(ch, x, y, 4, 8)) return true; // haut-gauche
    return false;
}

// --- Vérifie 3→2→1 pour le HAUT; vrai = on peut monter 1 pas maintenant
function canMoveUpNow(ch) {
    if (!canPassDir(ch, ch.x, ch.y, 8)) return false; // pas immédiat impossible
    for (var d = LOOKAHEAD; d >= 1; d--) {
        var sim = simulateUpSteps(ch, d);
        if (!sim.ok) continue; // d trop grand, on essaie d-1
        if (hasImmediateEscapeAt(ch, sim.x, sim.y)) return true;
    }
    return false;
}

// --- Vérifie 3→2→1 pour une diagonale; vrai = on peut faire 1 pas diagonale maintenant
function canMoveDiagNow(ch, horz, vert) {
    if (!canPassDiag(ch, ch.x, ch.y, horz, vert)) return false;
    for (var d = LOOKAHEAD; d >= 1; d--) {
        var sim = simulateDiagSteps(ch, horz, vert, d);
        if (!sim.ok) continue;
        if (hasImmediateEscapeAt(ch, sim.x, sim.y)) return true;
    }
    return false;
}

// --- Ancrage X initial par perso ---
var _initialX = Object.create(null);

function initialXFor(ch) {
    const id = timerIdFor(ch);
    if (_initialX[id] == null) _initialX[id] = ch.x; // capture la 1ère fois
    return _initialX[id];
}

function clearAnchors() {
    _initialX = Object.create(null);
}

// Vers quelle direction aller (à droite = true) pour se rapprocher de l'X initial ?
function preferRightTowardInitialX(ch) {
    const ix = initialXFor(ch);

    // Gestion propre des maps horizontales bouclées
    if ($gameMap.isLoopHorizontal && $gameMap.isLoopHorizontal()) {
        const w = $gameMap.width();
        const distRight = (ix - ch.x + w) % w; // distance en allant à droite
        const distLeft = (ch.x - ix + w) % w; // distance en allant à gauche
        if (distRight < distLeft) return 1;
        if (distLeft < distRight) return -1;
        return 0; // égalité parfaite → tie-breaker
    }

    // Map non bouclée
    if (ch.x < ix) return 1;     // aller à droite
    if (ch.x > ix) return -1;    // aller à gauche
    return 0;            // déjà sur l'axe initial → tie-breaker
}

// --- Décision d'un pas ---
function decideAndMove(ch) {
    if (ch.isMoving()) return;
    console.log(ch)
    if(disableGon && ch._characterName === "$Gon2") return; // ne pas bouger Gon
    // Assure que l'ancrage est capturé pour ce perso
    initialXFor(ch);

    const preferRightNow = preferRightTowardInitialX(ch);

    if (preferRightNow == 0) {
        // 1) Monter si l'anticipation (3→2→1) le permet
        if (canMoveUpNow(ch)) { ch.moveStraight(8); setLastMove(ch, 8); return; }
    }

    // 2) Sinon, diagonales qui rapprochent de l'X initial
    if (preferRightNow == 1) {
        if (canMoveDiagNow(ch, 6, 8)) { ch.moveDiagonally(6, 8); setLastMove(ch, 9); return; } // haut-droite
        if (canMoveDiagNow(ch, 4, 8)) { ch.moveDiagonally(4, 8); setLastMove(ch, 7); return; } // haut-gauche (fallback)
    } else {
        if (canMoveDiagNow(ch, 4, 8)) { ch.moveDiagonally(4, 8); setLastMove(ch, 7); return; } // haut-gauche
        if (canMoveDiagNow(ch, 6, 8)) { ch.moveDiagonally(6, 8); setLastMove(ch, 9); return; } // haut-droite (fallback)
    }

    if (getLastMove(ch) == 6) {
        if (canPassDir(ch, ch.x, ch.y, 6)) { ch.moveStraight(6); setLastMove(ch, 6); return; } // droite
    }

    if (getLastMove(ch) == 4) {
        if (canPassDir(ch, ch.x, ch.y, 4)) { ch.moveStraight(4); setLastMove(ch, 4); return; } // gauche
    }

    // 3) Derniers recours latéraux (toujours vers l'X initial d'abord)
    if (preferRightNow == 1) {
        if (canPassDir(ch, ch.x, ch.y, 6)) { ch.moveStraight(6); setLastMove(ch, 6); return; } // droite
        if (canPassDir(ch, ch.x, ch.y, 4)) { ch.moveStraight(4); setLastMove(ch, 4); return; } // gauche
    } else {
        if (canPassDir(ch, ch.x, ch.y, 4)) { ch.moveStraight(4); setLastMove(ch, 4); return; } // gauche
        if (canPassDir(ch, ch.x, ch.y, 6)) { ch.moveStraight(6); setLastMove(ch, 6); return; } // droite
    }
}

// --- Cadence ---
var _timers = Object.create(null);
function timerIdFor(ch) { return ch === $gamePlayer ? 'player' : ('e' + ch.eventId()); }

var _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);

    if (!autoMove) return;

    // Liste des personnages concernés
    var list = $gameMap.events().slice();
    //list.push($gamePlayer);

    for (var i = 0; i < list.length; i++) {
        var ch = list[i];
        var id = timerIdFor(ch);
        var t = _timers[id] || 0;

        if (t <= 0) {
            decideAndMove(ch);
            _timers[id] = MOVE_DELAY;
        } else {
            _timers[id] = t - 1;
        }
    }
};

let autoMove = false;

window.enableAutoMoveAnimationMarecage = function () {
    autoMove = true;
    _timers = Object.create(null); // redémarre la cadence
    clearAnchors();                // on recapture les X initiaux actuels

    // Capture immédiate pour tout ce qui est déjà présent
    var list = $gameMap.events().slice();
    list.push($gamePlayer);
    for (var i = 0; i < list.length; i++) {
        const ch = list[i];
        _initialX[timerIdFor(ch)] = ch.x;
    }
};

window.disableAutoMoveAnimationMarecage = function () {
    autoMove = false;
    _timers = Object.create(null);
    clearAnchors(); // reset des ancres
};

window.autoMoveAnimationMarecageGonDisable = function () {
    disableGon = true;
};

window.autoMoveAnimationMarecageGonEnable = function () {
    disableGon = false;
};