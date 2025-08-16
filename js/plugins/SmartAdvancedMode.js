/*:
 * @plugindesc v1.0 [SAM] Smart Advance A* — NorthBound & FollowLeader (RPG Maker MV / ES5)
 * @author Wil
 *
 * @help
 * ─────────────────────────────────────────────────────────────────────────────
 *  [SAM] Smart Advance A*  —  Déplacement auto « priorité nord » (A*)
 * ─────────────────────────────────────────────────────────────────────────────
 *  Objectifs de gameplay
 *  - Mode NorthBound (par défaut) : le joueur et les événements progressent
 *    vers le haut (Y décroissant) jusqu’à la rangée du haut (y = 0), ou vers
 *    le meilleur Y atteignable s’il n’existe pas de chemin complet.
 *  - Mode FollowLeader : tous les events suivent un event leader (par ID
 *    ou par nom). Replanification si le leader bouge/si la route change.
 *
 *  Directions autorisées
 *  - Haut (8), Haut-Droite (9 ↗), Haut-Gauche (7 ↖).
 *  - Latéraux (→/←) autorisés pour contourner selon paramètre.
 *  - Bas (2) interdit par défaut (configurable).
 *
 *  Obstacles & collisions
 *  - Utilise character.canPass(...) et character.canPassDiagonally(...)
 *    pour générer les voisins, évite naturellement le corner cutting.
 *  - Tient compte en temps réel des events non-through (pas de passage forcé).
 *
 *  Replanification
 *  - Au départ, si le chemin est vide, si la prochaine case devient bloquée,
 *    ou toutes les ReplanInterval frames. Recherche A* limitée par
 *    MaxNodesPerSearch. File de jobs pour étaler la charge.
 *
 *  Gestion des events
 *  - Par défaut, inclut tous les events (sauf <SAM_Ignore>).
 *  - Si Mode=OptIn, seuls les events marqués <SAM_AutoMove> sont bougés.
 *  - Le joueur est toujours pris en compte lorsque le plugin est activé.
 *
 *  Anti ping-pong
 *  - Mémoire de la dernière direction par personnage.
 *  - Tie-break avec préférence à droite (UR > UL > U) à score égal.
 *
 *  Boucles de map
 *  - Respecte $gameMap.isLoopHorizontal()/isLoopVertical() via roundX/roundY
 *    et distances en wrap pour les heuristiques générales. En NorthBound,
 *    la cible est la ligne y=0 ; l’heuristique verticale est compatible
 *    avec « uniquement vers le haut » (AllowDown=false).
 *
 *  Debug
 *  - Option DrawDebugPath : affiche un overlay (polyligne) du chemin prévu.
 *
 *  Compatibilité
 *  - ES5 pur, aucun async, aucune dépendance externe.
 *  - Ignore les events Through, les routes forcées (isMoveRouteForcing),
 *    et ceux marqués <SAM_Ignore>.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  Notetags (dans la note de l’événement)
 *    <SAM_Ignore>    → exclut cet event de la logique SAM.
 *    <SAM_AutoMove>  → inclut explicitement l’event si Mode=OptIn.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  Plugin Commands (MV)
 *    SAM_Enable true/false
 *    SAM_Mode NorthBound|FollowLeader|OptIn
 *    SAM_SetLeaderId  <id>
 *    SAM_SetLeaderName <name>
 *    SAM_Refresh
 *    SAM_Stop
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  Instructions d’installation / usage
 *  1) Collez ce fichier dans js/plugins/ sous le nom "SmartAdvanceAStar.js".
 *  2) Activez-le dans le Plugin Manager et réglez les paramètres.
 *  3) (Optionnel) Placez <SAM_Ignore> ou <SAM_AutoMove> sur des events.
 *  4) Lancez le jeu. Les personnages bougent automatiquement selon le Mode.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  Scénarios de test rapides
 *  • NorthBound : map avec couloirs/arbres/eau, plusieurs events et le joueur.
 *    Vérifiez que chacun cherche à remonter, contourne, et évite de se bloquer.
 *  • FollowLeader : définissez LeaderEventId/Name, déplacez le leader (route
 *    ou script). Les autres doivent le suivre en replanifiant.
 *  • Event bloquant : un event traverse la route dans le sens latéral ; les
 *    poursuivants doivent replanifier si la prochaine case est occupée.
 *  • Map loop : activez le loop horizontal/vertical ; testez les heuristiques
 *    et la progression vers la rangée du haut.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  Conseils de tuning
 *  • Coûts par défaut (Cardinal=10, Diagonal=14) + Heuristique=Octile
 *    donnent un comportement naturel pour A* 8 directions.
 *  • MaxNodesPerSearch : 800–2000 typiquement. Augmentez si vos maps sont
 *    complexes, réduisez si beaucoup d’events simultanés.
 *  • ReplanInterval : 12–30 frames pour un bon compromis.
 *  • Impact du nombre d’events : plus il y en a, plus la file de jobs sera
 *    sollicitée. Gardez un œil sur LogDebug et ajustez MoveDelay/ReplanInterval.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  Licence
 *  - Libre d’utilisation dans projets commerciaux et non commerciaux avec
 *    mention "[SAM] Smart Advance A*" quelque part (crédits/plugins).
 *
 * @param StartEnabled
 * @text Démarrer activé
 * @type boolean
 * @on Oui
 * @off Non
 * @default true
 *
 * @param EnableSwitchId
 * @text Interrupteur d’activation (0=ignoré)
 * @type number
 * @min 0
 * @default 0
 *
 * @param Mode
 * @text Mode par défaut
 * @type select
 * @option NorthBound
 * @option FollowLeader
 * @option OptIn
 * @default NorthBound
 *
 * @param LeaderEventId
 * @text Leader (ID)
 * @type number
 * @min 0
 * @default 0
 *
 * @param LeaderEventName
 * @text Leader (Nom)
 * @type string
 * @default 
 *
 * @param AllowDiagonals
 * @text Autoriser diagonales
 * @type boolean
 * @on Oui
 * @off Non
 * @default true
 *
 * @param AllowLateral
 * @text Autoriser latéraux (→/←)
 * @type boolean
 * @on Oui
 * @off Non
 * @default true
 *
 * @param AllowDown
 * @text Autoriser bas (2)
 * @type boolean
 * @on Oui
 * @off Non
 * @default false
 *
 * @param PreferRight
 * @text Tie-break: Préférence droite
 * @type boolean
 * @on Oui
 * @off Non
 * @default true
 *
 * @param ReplanInterval
 * @text Replanification (frames)
 * @type number
 * @min 1
 * @default 20
 *
 * @param MoveDelay
 * @text Délai entre pas (frames)
 * @type number
 * @min 0
 * @default 2
 *
 * @param MaxNodesPerSearch
 * @text Limite de nœuds par recherche
 * @type number
 * @min 100
 * @default 1200
 *
 * @param CardinalCost
 * @text Coût cardinal (↑→←↓)
 * @type number
 * @min 1
 * @default 10
 *
 * @param DiagonalCost
 * @text Coût diagonal (↗↖↘↙)
 * @type number
 * @min 1
 * @default 14
 *
 * @param Heuristic
 * @text Heuristique
 * @type select
 * @option Octile
 * @option Manhattan
 * @option Chebyshev
 * @default Octile
 *
 * @param DrawDebugPath
 * @text Debug: afficher chemin
 * @type boolean
 * @on Oui
 * @off Non
 * @default false
 *
 * @param LogDebug
 * @text Log debug (console)
 * @type boolean
 * @on Oui
 * @off Non
 * @default false
 *
 */
(function() {
  'use strict';

  var PLUGIN_NAME = 'SmartAdvanceAStar';

  // ────────────────────────────────────────────────────────────────────────────
  // Paramètres
  // ────────────────────────────────────────────────────────────────────────────
  var Params = PluginManager.parameters(PLUGIN_NAME);

  function toBool(p) { return String(p).toLowerCase() === 'true'; }
  function toNum(p, def) { var n = Number(p); return isNaN(n) ? def : n; }
  function toStr(p, def) { return (p == null) ? def : String(p); }

  var SAM = {};
  SAM.mode              = toStr(Params['Mode'], 'NorthBound');
  SAM.leaderEventId     = toNum(Params['LeaderEventId'], 0);
  SAM.leaderEventName   = toStr(Params['LeaderEventName'], '');
  SAM.allowDiagonals    = toBool(Params['AllowDiagonals']);
  SAM.allowLateral      = toBool(Params['AllowLateral']);
  SAM.allowDown         = toBool(Params['AllowDown']);
  SAM.preferRight       = toBool(Params['PreferRight']);
  SAM.replanInterval    = toNum(Params['ReplanInterval'], 20);
  SAM.moveDelay         = toNum(Params['MoveDelay'], 2);
  SAM.maxNodesPerSearch = toNum(Params['MaxNodesPerSearch'], 1200);
  SAM.cardinalCost      = toNum(Params['CardinalCost'], 10);
  SAM.diagonalCost      = toNum(Params['DiagonalCost'], 14);
  SAM.heuristicName     = toStr(Params['Heuristic'], 'Octile');
  SAM.drawDebugPath     = toBool(Params['DrawDebugPath']);
  SAM.logDebug          = toBool(Params['LogDebug']);

  // ────────────────────────────────────────────────────────────────────────────
  // Utilitaires
  // ────────────────────────────────────────────────────────────────────────────
  function log() {
    if (SAM.logDebug && console && console.log) {
      console.log.apply(console, arguments);
    }
  }

  function nowFrame() {
    return Graphics.frameCount || 0;
  }

  function dirToVector(d) {
    // 2,4,6,8, 1,3,7,9
    var dx = (d === 6 || d === 3 || d === 9) ? 1 :
             (d === 4 || d === 1 || d === 7) ? -1 : 0;
    var dy = (d === 2 || d === 1 || d === 3) ? 1 :
             (d === 8 || d === 7 || d === 9) ? -1 : 0;
    return {dx: dx, dy: dy};
  }

  function stepToDir(dx, dy) {
    if (dx === 0 && dy < 0) return 8;
    if (dx > 0 && dy < 0)  return 9;
    if (dx < 0 && dy < 0)  return 7;
    if (dx > 0 && dy === 0) return 6;
    if (dx < 0 && dy === 0) return 4;
    if (dx === 0 && dy > 0) return 2;
    if (dx > 0 && dy > 0) return 3;
    if (dx < 0 && dy > 0) return 1;
    return 0;
  }

  function oppositeDir(d) {
    if (d === 2) return 8;
    if (d === 8) return 2;
    if (d === 4) return 6;
    if (d === 6) return 4;
    if (d === 1) return 9;
    if (d === 9) return 1;
    if (d === 3) return 7;
    if (d === 7) return 3;
    return 0;
  }

  function keyXY(x,y) { return x + ',' + y; }

  function mapWidth()  { return $gameMap.width();  }
  function mapHeight() { return $gameMap.height(); }

  function roundX(x) { return $gameMap.roundX(x); }
  function roundY(y) { return $gameMap.roundY(y); }

  function xWithDir(x, d) {
    return roundX(x + (d === 6 ? 1 : d === 4 ? -1 : 0));
  }
  function yWithDir(y, d) {
    return roundY(y + (d === 2 ? 1 : d === 8 ? -1 : 0));
  }

  function dxLoop(a, b) {
    var dx = Math.abs(a - b);
    if ($gameMap.isLoopHorizontal()) {
      dx = Math.min(dx, mapWidth() - dx);
    }
    return dx;
  }
  function dyLoop(a, b) {
    var dy = Math.abs(a - b);
    if ($gameMap.isLoopVertical()) {
      dy = Math.min(dy, mapHeight() - dy);
    }
    return dy;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Notetags des events
  // ────────────────────────────────────────────────────────────────────────────
  var _Game_Event_setupPage = Game_Event.prototype.setupPage;
  Game_Event.prototype.setupPage = function() {
    _Game_Event_setupPage.call(this);
    this._samMeta = this._samMeta || {};
    var note = (this.event() && this.event().note) ? String(this.event().note) : '';
    this._samMeta.ignore = /<SAM_Ignore>/i.test(note);
    this._samMeta.auto   = /<SAM_AutoMove>/i.test(note);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // État par personnage (stocké sur l’instance)
  // ────────────────────────────────────────────────────────────────────────────
  function ensureSamState(ch) {
    if (!ch._sam) {
      ch._sam = {
        path: [],                 // [{x,y,dir}]
        target: null,             // {x,y} pour FollowLeader
        lastDir: 0,               // dernière direction réellement prise
        moveCooldown: 0,          // frames avant prochain pas
        replanAt: 0,              // frame pour replanifier
        lastPlannedAt: -999999,
        busy: false,              // si recherche en cours dans la file
        needsPlan: true           // force une première planification
      };
    }
    return ch._sam;
  }

  function characterTileXY(ch) {
    // position en tuiles (entiers)
    return { x: $gameMap.roundX(Math.floor(ch.x)), y: $gameMap.roundY(Math.floor(ch.y)) };
  }

  function isCharacterEligible(ch) {
    if (!ch) return false;
    if (!autoMove) return false;

    // Joueur : toujours pris en compte si SAM actif
    if (ch === $gamePlayer) return true;

    // Events
    if (ch instanceof Game_Event) {
      if (ch._erased) return false;
      if (ch._samMeta && ch._samMeta.ignore) return false;
      if (ch.isThrough()) return false; // laisse d'autres plugins le contrôler
      if (ch.isMoveRouteForcing && ch.isMoveRouteForcing()) return false;

      if (SAM.mode === 'OptIn') {
        return ch._samMeta && ch._samMeta.auto === true;
      }
      return true;
    }

    return false;
  }

  function leaderEvent() {
    var id = SAM.leaderEventId || 0;
    var name = (SAM.leaderEventName || '').trim();
    var ev = null;
    if (id > 0) ev = $gameMap.event(id);
    if (!ev && name) {
      var list = $gameMap.events();
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].event() && list[i].event().name === name) {
          ev = list[i];
          break;
        }
      }
    }
    return ev;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Min-Heap simple pour l'open set A*
  // ────────────────────────────────────────────────────────────────────────────
  function MinHeap(scoreFn) {
    this._a = [];
    this._score = scoreFn;
  }
  MinHeap.prototype.size = function() { return this._a.length; };
  MinHeap.prototype.clear = function() { this._a.length = 0; };
  MinHeap.prototype.push = function(v) {
    var a = this._a, s = this._score, i = a.length;
    a.push(v);
    while (i > 0) {
      var p = ((i - 1) >> 1);
      if (s(a[p]) <= s(v)) break;
      a[i] = a[p];
      i = p;
    }
    a[i] = v;
  };
  MinHeap.prototype.pop = function() {
    var a = this._a, s = this._score, n = a.length;
    if (n === 0) return undefined;
    var min = a[0];
    var v = a[n - 1];
    a.pop();
    if (n === 1) return min;
    var i = 0;
    while (true) {
      var l = i * 2 + 1, r = l + 1;
      if (l >= n - 1) break;
      var c = (r < n - 1 && s(a[r]) < s(a[l])) ? r : l;
      if (s(a[c]) >= s(v)) break;
      a[i] = a[c];
      i = c;
    }
    a[i] = v;
    return min;
  };

  // ────────────────────────────────────────────────────────────────────────────
  // A* Pathfinding (8 directions, coûts paramétrables, heuristiques)
  // ────────────────────────────────────────────────────────────────────────────
  function Heuristic(dx, dy) {
    var C = SAM.cardinalCost, D = SAM.diagonalCost;
    dx = Math.max(0, dx|0); dy = Math.max(0, dy|0);
    var m = Math.min(dx, dy), M = Math.max(dx, dy);
    var name = SAM.heuristicName;
    if (name === 'Manhattan') {
      return C * (dx + dy);
    } else if (name === 'Chebyshev') {
      return C * M + (D - C) * m;
    } else {
      // Octile
      return C * (dx + dy) + (D - 2 * C) * m;
    }
  }

  function isGoal_NorthBound(x, y) {
    return (y <= 0); // rangée du haut
  }

  function planGoal_FollowLeader(ch) {
    var lead = leaderEvent();
    if (!lead) return null;
    var p = characterTileXY(lead);
    return { x: p.x, y: p.y };
  }

  function neighborsFor(ch, x, y, lastDir) {
    // Génère les voisins autorisés en utilisant canPass / canPassDiagonally
    var dirs = [];
    // Priorité « vers le haut »
    dirs.push(8);
    if (SAM.allowDiagonals) {
      dirs.push(9); // UR
      dirs.push(7); // UL
    }
    if (SAM.allowLateral) {
      // Lateral moves for detours
      // Un ordre léger « droite puis gauche » pour aider la préférence
      dirs.push(6); // R
      dirs.push(4); // L
    }
    if (SAM.allowDown) {
      // Autoriser le bas pour détours si activé
      dirs.push(2);
      if (SAM.allowDiagonals) {
        dirs.push(3); // DR
        dirs.push(1); // DL
      }
    }

    var res = [];
    for (var i = 0; i < dirs.length; i++) {
      var d = dirs[i];
      var pass = false, nx, ny;
      if (d === 6 || d === 4 || d === 2 || d === 8) {
        pass = ch.canPass(x, y, d);
        if (pass) { nx = xWithDir(x, d); ny = yWithDir(y, d); }
      } else {
        // diagonales : canPassDiagonally(x, y, horz, vert)
        var v = dirToVector(d);
        var horz = v.dx > 0 ? 6 : 4;
        var vert = v.dy > 0 ? 2 : 8;
        pass = ch.canPassDiagonally(x, y, horz, vert);
        if (pass) { nx = roundX(x + v.dx); ny = roundY(y + v.dy); }
      }
      if (pass) {
        // Anti ping-pong : pénaliser le mouvement directement opposé à lastDir
        var pen = (lastDir && d === oppositeDir(lastDir)) ? 2 : 0; // petite pénalité
        res.push({ x: nx, y: ny, dir: d, penalty: pen });
      }
    }
    return res;
  }

  function fTieBreak(dir) {
    // À score égal : UR > UL > U (si PreferRight)
    if (!SAM.preferRight) return 0;
    if (dir === 9) return -0.003; // favorise légèrement UR
    if (dir === 7) return -0.002; // puis UL
    if (dir === 8) return -0.001; // puis U
    return 0;
  }

  function aStarSearch(ch, startX, startY, goalKind, goalPoint) {
    // goalKind: 'NorthBound' | 'FollowLeader'
    // goalPoint: {x,y} (FollowLeader) ou null
    var maxNodes = SAM.maxNodesPerSearch;
    var C = SAM.cardinalCost, D = SAM.diagonalCost;

    var open = new MinHeap(function(n){ return n.f; });
    var startKey = keyXY(startX, startY);
    var gScore = {};
    var came = {}; // key -> {px, py, dir}
    gScore[startKey] = 0;

    var startNode = {
      x: startX, y: startY,
      g: 0, h: 0, f: 0,
      dir: 0
    };

    open.push(startNode);

    var visited = {}; // fermés
    var visitedCount = 0;

    var bestFrontier = null; // meilleur y (NorthBound) ou meilleur h (Follow)
    var bestScore = Infinity;

    var lastDir = ensureSamState(ch).lastDir || 0;

    while (open.size() > 0) {
      var cur = open.pop();
      var ckey = keyXY(cur.x, cur.y);
      if (visited[ckey]) continue;
      visited[ckey] = true;
      visitedCount++;

      // Condition d'arrêt
      if (goalKind === 'NorthBound') {
        if (isGoal_NorthBound(cur.x, cur.y)) {
          // Trouvé une case sur la rangée du haut
          return reconstructPath(ch, came, cur);
        }
        // Mettre à jour meilleur frontier (y minimal)
        if (cur.y < bestScore) {
          bestScore = cur.y;
          bestFrontier = { x: cur.x, y: cur.y, dir: cur.dir };
        }
      } else {
        // FollowLeader : cible = goalPoint
        if (goalPoint && cur.x === goalPoint.x && cur.y === goalPoint.y) {
          return reconstructPath(ch, came, cur);
        }
        // Frontier = plus petit h
        if (cur.h < bestScore) {
          bestScore = cur.h;
          bestFrontier = { x: cur.x, y: cur.y, dir: cur.dir };
        }
      }

      if (visitedCount >= maxNodes) {
        // Limite atteinte : renvoyer meilleur frontier si dispo
        if (bestFrontier) return reconstructPath(ch, came, bestFrontier, true);
        break;
      }

      // Développer voisins
      var neigh = neighborsFor(ch, cur.x, cur.y, lastDir);
      for (var i = 0; i < neigh.length; i++) {
        var nb = neigh[i];
        var nkey = keyXY(nb.x, nb.y);
        if (visited[nkey]) continue;

        var moveCost = (nb.dir === 2 || nb.dir === 4 || nb.dir === 6 || nb.dir === 8) ? C : D;
        moveCost += nb.penalty; // anti ping-pong
        var tentativeG = cur.g + moveCost;

        if (!(nkey in gScore) || tentativeG < gScore[nkey]) {
          gScore[nkey] = tentativeG;

          var h = 0;
          if (goalKind === 'NorthBound') {
            // Heuristique admissible : dy = y, dx = 0 (ou dist latérale pour aider)
            var dy = nb.y; // nombre de pas vers y=0 en se limitant à "monter"
            // Utiliser une estimation latérale minimale vers un x "idéal" (0) (pas de cible x)
            // On garde un dx nul pour rester admissible.
            h = Heuristic(0, dy);
          } else {
            var dx = dxLoop(nb.x, goalPoint.x);
            var dy = dyLoop(nb.y, goalPoint.y);
            h = Heuristic(dx, dy);
          }

          var f = tentativeG + h + fTieBreak(nb.dir);
          came[nkey] = { px: cur.x, py: cur.y, dir: nb.dir };
          open.push({ x: nb.x, y: nb.y, g: tentativeG, h: h, f: f, dir: nb.dir });
        }
      }
    }

    // Échec : aucun chemin (ni frontier)
    return { path: [], reached: false, partial: false, last: {x:startX,y:startY} };
  }

  function reconstructPath(ch, came, endNode, partial) {
    var path = [];
    var cx = endNode.x, cy = endNode.y;
    var key = keyXY(cx, cy);
    while (came[key]) {
      var prev = came[key];
      path.push({ x: cx, y: cy, dir: prev.dir });
      cx = prev.px; cy = prev.py;
      key = keyXY(cx, cy);
    }
    path.reverse();
    return { path: path, reached: !partial, partial: !!partial, last: {x:endNode.x, y:endNode.y} };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // File de jobs (recherches A*) — un job traité par frame
  // ────────────────────────────────────────────────────────────────────────────
  var JobQueue = {
    _q: [],
    push: function(ch) {
      if (!ch) return;
      var s = ensureSamState(ch);
      if (s.busy) return;
      s.busy = true;
      this._q.push(ch);
    },
    clear: function() {
      for (var i = 0; i < this._q.length; i++) {
        var ch = this._q[i];
        if (ch && ch._sam) ch._sam.busy = false;
      }
      this._q.length = 0;
    },
    update: function() {
      if (this._q.length === 0) return;
      var ch = this._q.shift();
      if (!ch) return;

      var s = ensureSamState(ch);
      s.busy = false;

      if (!isCharacterEligible(ch)) return;

      var pos = characterTileXY(ch);
      var goalKind = (SAM.mode === 'FollowLeader') ? 'FollowLeader' : 'NorthBound';
      var goalPoint = null;
      if (goalKind === 'FollowLeader') {
        goalPoint = planGoal_FollowLeader(ch);
        s.target = goalPoint;
      } else {
        s.target = null;
      }

      var res = aStarSearch(ch, pos.x, pos.y, goalKind, goalPoint);
      s.lastPlannedAt = nowFrame();
      s.path = res.path || [];
      if (SAM.drawDebugPath) s._debugPathDirty = true;

      if (s.path.length === 0 && !res.reached && !res.partial) {
        // Rien trouvé : petite attente avant nouvelle tentative
        s.replanAt = nowFrame() + SAM.replanInterval;
      } else {
        // Chemin partiel ou complet : on commence à marcher
        s.replanAt = nowFrame() + SAM.replanInterval;
      }
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Moteur d’exécution : avance pas-à-pas le long des chemins
  // ────────────────────────────────────────────────────────────────────────────
  function shouldReplan(ch) {
    if (!isCharacterEligible(ch)) return false;
    var s = ensureSamState(ch);

    // besoin initial
    if (s.needsPlan) return true;

    // timer périodique
    if (nowFrame() >= s.replanAt) return true;

    // cible FollowLeader a changé ?
    if (SAM.mode === 'FollowLeader') {
      var lead = leaderEvent();
      if (!lead) return true;
      var t = characterTileXY(lead);
      var trg = s.target || {};
      if (trg.x !== t.x || trg.y !== t.y) return true;
    }

    // prochaine case bloquée ?
    if (s.path && s.path.length > 0) {
      var next = s.path[0];
      // vérifier en utilisant canPass depuis la position actuelle
      var pos = characterTileXY(ch);
      // Si la "prochaine" tuile n'est plus atteignable, replanifier
      var ok = false;
      if (next.dir === 6 || next.dir === 4 || next.dir === 2 || next.dir === 8) {
        ok = ch.canPass(pos.x, pos.y, next.dir);
      } else {
        var v = dirToVector(next.dir);
        var horz = v.dx > 0 ? 6 : 4;
        var vert = v.dy > 0 ? 2 : 8;
        ok = ch.canPassDiagonally(pos.x, pos.y, horz, vert);
      }
      if (!ok) return true;
    } else {
      // pas de chemin
      return true;
    }

    return false;
  }

  function stepAlongPath(ch) {
    var s = ensureSamState(ch);
    if (!s.path || s.path.length === 0) return;

    // Respecter un petit cooldown par pas
    if (s.moveCooldown > 0) { s.moveCooldown--; return; }
    if (ch.isMoving && ch.isMoving()) return;

    var next = s.path.shift();
    if (!next) return;

    var d = next.dir;
    // Exécuter le pas
    if (d === 6 || d === 4 || d === 2 || d === 8) {
      ch.moveStraight(d);
    } else {
      var v = dirToVector(d);
      var horz = v.dx > 0 ? 6 : 4;
      var vert = v.dy > 0 ? 2 : 8;
      ch.moveDiagonally(horz, vert);
    }
    s.lastDir = d;
    s.moveCooldown = Math.max(0, SAM.moveDelay|0);
  }

  function collectControlledCharacters() {
    var list = [];
    if (isCharacterEligible($gamePlayer)) list.push($gamePlayer);
    var evs = $gameMap.events();
    for (var i = 0; i < evs.length; i++) {
      var e = evs[i];
      if (isCharacterEligible(e)) list.push(e);
    }
    return list;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Hook Scene_Map.update — boucle principale
  // ────────────────────────────────────────────────────────────────────────────
  var _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    if (!autoMove) return;

    // 1) Déclencher (au plus) un job de recherche par frame
    if (JobQueue._q.length > 0) {
      JobQueue.update();
    } else {
      // Si file vide, détecter qui a besoin de replanifier et pousser 1 job
      var chars = collectControlledCharacters();
      for (var i = 0; i < chars.length; i++) {
        var ch = chars[i];
        var s = ensureSamState(ch);
        if (shouldReplan(ch)) {
          s.needsPlan = false;
          JobQueue.push(ch);
          break; // un job par frame
        }
      }
    }

    // 2) Avancer les personnages le long de leur chemin
    var chars2 = collectControlledCharacters();
    for (var j = 0; j < chars2.length; j++) {
      var ch2 = chars2[j];
      var s2 = ensureSamState(ch2);
      if (!s2.path || s2.path.length === 0) continue;
      stepAlongPath(ch2);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Réinitialiser l’état à chaque changement de map
  // ────────────────────────────────────────────────────────────────────────────
  var _Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function(mapId) {
    _Game_Map_setup.call(this, mapId);
    // purge file et états
    JobQueue.clear();
    if ($gamePlayer && $gamePlayer._sam) $gamePlayer._sam = null;
    var evs = this.events();
    for (var i = 0; i < evs.length; i++) {
      if (evs[i]) evs[i]._sam = null;
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Debug overlay (polyligne au-dessus du character)
  // ────────────────────────────────────────────────────────────────────────────
  var _Sprite_Character_update = Sprite_Character.prototype.update;
  Sprite_Character.prototype.update = function() {
    _Sprite_Character_update.call(this);
    if (!SAM.drawDebugPath) return;
    this.updateSamDebugPath();
  };

  Sprite_Character.prototype.updateSamDebugPath = function() {
    var ch = this._character;
    if (!ch || !ch._sam) {
      if (this._samGfx) { this._samGfx.clear(); this._samGfx.visible = false; }
      return;
    }
    var s = ch._sam;
    if (!this._samGfx) {
      this._samGfx = new PIXI.Graphics();
      this.addChild(this._samGfx);
    }
    if (!s._debugPathDirty && this._samGfx.visible === true) return;

    this._samGfx.clear();
    var path = s.path || [];
    if (path.length === 0) {
      this._samGfx.visible = false;
      return;
    }

    // Dessiner en coordonnées écran pour éviter les décalages de sprites
    var tw = $gameMap.tileWidth(), th = $gameMap.tileHeight();
    function screenXY(tx, ty) {
      var sx = Math.round(($gameMap.adjustX(tx) * tw) + tw / 2);
      var sy = Math.round(($gameMap.adjustY(ty) * th) + th / 2);
      return { x: sx, y: sy };
    }

    // Premier point = position actuelle
    var pos = characterTileXY(ch);
    var p0 = screenXY(pos.x, pos.y);

    this._samGfx.lineStyle(2, 0xff00ff, 0.8);
    this._samGfx.moveTo(p0.x - this.x, p0.y - this.y);

    for (var i = 0; i < path.length; i++) {
      var p = screenXY(path[i].x, path[i].y);
      this._samGfx.lineTo(p.x - this.x, p.y - this.y);
    }

    this._samGfx.visible = true;
    s._debugPathDirty = false;
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Plugin Commands (MV)
  // ────────────────────────────────────────────────────────────────────────────
  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (!command || command.indexOf('SAM_') !== 0) return;

    switch (command) {
      case 'SAM_Mode':
        if (args[0]) {
          var m = String(args[0]);
          if (m === 'NorthBound' || m === 'FollowLeader' || m === 'OptIn') {
            SAM.mode = m;
            log('[SAM] Mode =', SAM.mode);
            // replan immédiat
            SAM_RefreshAll();
          }
        }
        break;

      case 'SAM_SetLeaderId':
        SAM.leaderEventId = Number(args[0]) || 0;
        log('[SAM] LeaderEventId =', SAM.leaderEventId);
        SAM_RefreshAll();
        break;

      case 'SAM_SetLeaderName':
        SAM.leaderEventName = (args && args.length > 0) ? String(args.join(' ')) : '';
        log('[SAM] LeaderEventName =', SAM.leaderEventName);
        SAM_RefreshAll();
        break;

      case 'SAM_Refresh':
        SAM_RefreshAll();
        break;

      case 'SAM_Stop':
        JobQueue.clear();
        var list = [$gamePlayer].concat($gameMap.events());
        for (var j = 0; j < list.length; j++) {
          var c = list[j];
          if (c && c._sam) {
            c._sam.path = [];
            c._sam.needsPlan = false;
          }
        }
        log('[SAM] Stopped');
        break;
    }
  };

  function SAM_RefreshAll() {
    var list = [$gamePlayer].concat($gameMap.events());
    for (var i = 0; i < list.length; i++) {
      var ch = list[i];
      if (!ch) continue;
      var s = ensureSamState(ch);
      s.path = [];
      s.needsPlan = true;
      s.replanAt = 0;
      s.lastPlannedAt = -999999;
    }
    JobQueue.clear();
  }


  let autoMove = false;

  window.enableAutoMove = function(){
    autoMove = true;
  };

  window.disableAutoMove = function(){
    autoMove = false;
  };

})();
