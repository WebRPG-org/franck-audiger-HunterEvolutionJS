const parameters = PluginManager.parameters('MultiLang');
const defaultLang = parameters['Language'] || 'fr';

window.TextManagerEx = {
  _data: {},
  _language: defaultLang,

  initLanguage(lang){
    this._language = lang || defaultLang;
  },

  setLanguage(lang, refresh = true) {
    this._language = lang;
    ConfigManager.language = lang;
    ConfigManager.save();

    const scene = SceneManager._scene;

    return this.loadTexts().then(() => {
      if(!refresh) return;
      // Si on est dans la scène Options et qu’elle a une sélection
      if (scene instanceof Scene_Options && scene._optionsWindow) {
        const selectedIndex = scene._optionsWindow.index();

        // Forcer un refresh propre
        const win = scene._optionsWindow;
        win.refresh();
        win.select(selectedIndex); // <- Réapplique la sélection

      } else if (scene && scene.refresh) {
        scene.refresh();
      } else {
        SceneManager.goto(scene.constructor);
      }
    });
  },

  getLanguage() {
    return this._language;
  },

  loadTexts() {
    const path = `data/lang/texts_${this._language}.json`;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', path);
      xhr.overrideMimeType('application/json');
      xhr.onload = () => {
        if (xhr.status < 400) {
          this._data = JSON.parse(xhr.responseText);
          resolve();
        } else {
          reject(`Impossible de charger ${path}`);
        }
      };
      xhr.onerror = () => reject(`Erreur réseau sur ${path}`);
      xhr.send();
    });
  },

  t(key) {
    return this._data[key] || `[${key}]`;
  }
};

const availableLanguages = ["fr", "en"];
const languageLabels = {
  "fr": "Français",
  "en": "English"
};

const _Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
Window_Options.prototype.addGeneralOptions = function() {
  _Window_Options_addGeneralOptions.call(this);
  this.addCommand(TextManagerEx.t("command.langue"), "language");
};

const _Window_Options_statusText = Window_Options.prototype.statusText;
Window_Options.prototype.statusText = function(index) {
  const symbol = this.commandSymbol(index);
  if (symbol === "language") {
    return `${languageLabels[TextManagerEx._language]}`;
  }
  return _Window_Options_statusText.call(this, index);
};

const _Window_Options_getConfigValue = Window_Options.prototype.getConfigValue;
Window_Options.prototype.getConfigValue = function(symbol) {
  if (symbol === "language") {
    return ConfigManager.language;
  }
  return _Window_Options_getConfigValue.call(this, symbol);
};

const _Window_Options_changeValue = Window_Options.prototype.changeValue;
Window_Options.prototype.changeValue = function(symbol, value) {
  if (symbol === "language") {
    const index = availableLanguages.indexOf(ConfigManager.language);
    const next = availableLanguages[(index + 1) % availableLanguages.length];
    ConfigManager.language = next;
    this.redrawItem(this.findSymbol(symbol));
    SoundManager.playCursor();
    TextManagerEx.setLanguage(next);
    return;
  }
  _Window_Options_changeValue.call(this, symbol, value);
};



const _ConfigManager_makeData = ConfigManager.makeData;
ConfigManager.makeData = function() {
  const config = _ConfigManager_makeData.call(this);
  config.language = this.language || "fr";
  return config;
};

const _ConfigManager_applyData = ConfigManager.applyData;
ConfigManager.applyData = function(config) {
  _ConfigManager_applyData.call(this, config);
  this.language = config.language || "fr";
};

const _Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function() {
  const originalStart = _Scene_Boot_start.bind(this);
  TextManagerEx.loadTexts().then(() => {
    originalStart();
  }).catch(err => {
    console.error(err);
    originalStart();
  });
};

const _Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
Window_Base.prototype.convertEscapeCharacters = function(text) {
  text = text.replace(/langText\[(.+?)\]/gi, (_, key) => {
    return TextManagerEx.t(key);
  });
  text = _Window_Base_convertEscapeCharacters.call(this, text);
  return wrapSmart(text);
};

//-----------------------------------------------------------------------------
// TextManager
//
// The static class that handles terms and messages.

function TextManager() {
    throw new Error('This is a static class');
}

TextManager.basic = function(basicId) {
    return $dataSystem.terms.basic[basicId] || '';
};

TextManager.param = function(paramId) {
    return $dataSystem.terms.params[paramId] || '';
};

TextManager.command = function(commandId) {
    return $dataSystem.terms.commands[commandId] || '';
};

TextManager.message = function(messageId) {
    return $dataSystem.terms.messages[messageId] || '';
};

TextManager.getter = function(method, param) {
    return {
        get: function() {
            return this[method](param).replace(/langText\[(.+?)\]/gi, (_, key) => TextManagerEx.t(key));
        },
        configurable: true
    };
};
Object.defineProperty(TextManager, 'currencyUnit', {
    get: function() { return $dataSystem.currencyUnit; },
    configurable: true
});

Object.defineProperties(TextManager, {
    level           : TextManager.getter('basic', 0),
    levelA          : TextManager.getter('basic', 1),
    hp              : TextManager.getter('basic', 2),
    hpA             : TextManager.getter('basic', 3),
    mp              : TextManager.getter('basic', 4),
    mpA             : TextManager.getter('basic', 5),
    tp              : TextManager.getter('basic', 6),
    tpA             : TextManager.getter('basic', 7),
    exp             : TextManager.getter('basic', 8),
    expA            : TextManager.getter('basic', 9),
    fight           : TextManager.getter('command', 0),
    escape          : TextManager.getter('command', 1),
    attack          : TextManager.getter('command', 2),
    guard           : TextManager.getter('command', 3),
    item            : TextManager.getter('command', 4),
    skill           : TextManager.getter('command', 5),
    equip           : TextManager.getter('command', 6),
    status          : TextManager.getter('command', 7),
    formation       : TextManager.getter('command', 8),
    save            : TextManager.getter('command', 9),
    gameEnd         : TextManager.getter('command', 10),
    options         : TextManager.getter('command', 11),
    weapon          : TextManager.getter('command', 12),
    armor           : TextManager.getter('command', 13),
    keyItem         : TextManager.getter('command', 14),
    equip2          : TextManager.getter('command', 15),
    optimize        : TextManager.getter('command', 16),
    clear           : TextManager.getter('command', 17),
    newGame         : TextManager.getter('command', 18),
    continue_       : TextManager.getter('command', 19),
    toTitle         : TextManager.getter('command', 21),
    cancel          : TextManager.getter('command', 22),
    buy             : TextManager.getter('command', 24),
    sell            : TextManager.getter('command', 25),
    inputsList      : TextManager.getter('command', 26),
    quit            : TextManager.getter('command', 27),
    alwaysDash      : TextManager.getter('message', 'alwaysDash'),
    commandRemember : TextManager.getter('message', 'commandRemember'),
    bgmVolume       : TextManager.getter('message', 'bgmVolume'),
    bgsVolume       : TextManager.getter('message', 'bgsVolume'),
    meVolume        : TextManager.getter('message', 'meVolume'),
    seVolume        : TextManager.getter('message', 'seVolume'),
    possession      : TextManager.getter('message', 'possession'),
    expTotal        : TextManager.getter('message', 'expTotal'),
    expNext         : TextManager.getter('message', 'expNext'),
    saveMessage     : TextManager.getter('message', 'saveMessage'),
    loadMessage     : TextManager.getter('message', 'loadMessage'),
    file            : TextManager.getter('message', 'file'),
    partyName       : TextManager.getter('message', 'partyName'),
    emerge          : TextManager.getter('message', 'emerge'),
    preemptive      : TextManager.getter('message', 'preemptive'),
    surprise        : TextManager.getter('message', 'surprise'),
    escapeStart     : TextManager.getter('message', 'escapeStart'),
    escapeSuccess   : TextManager.getter('message', 'escapeSuccess'),
    escapeFailure   : TextManager.getter('message', 'escapeFailure'),
    victory         : TextManager.getter('message', 'victory'),
    defeat          : TextManager.getter('message', 'defeat'),
    obtainExp       : TextManager.getter('message', 'obtainExp'),
    obtainGold      : TextManager.getter('message', 'obtainGold'),
    obtainItem      : TextManager.getter('message', 'obtainItem'),
    levelUp         : TextManager.getter('message', 'levelUp'),
    obtainSkill     : TextManager.getter('message', 'obtainSkill'),
    useItem         : TextManager.getter('message', 'useItem'),
    criticalToEnemy : TextManager.getter('message', 'criticalToEnemy'),
    criticalToActor : TextManager.getter('message', 'criticalToActor'),
    actorDamage     : TextManager.getter('message', 'actorDamage'),
    actorRecovery   : TextManager.getter('message', 'actorRecovery'),
    actorGain       : TextManager.getter('message', 'actorGain'),
    actorLoss       : TextManager.getter('message', 'actorLoss'),
    actorDrain      : TextManager.getter('message', 'actorDrain'),
    actorNoDamage   : TextManager.getter('message', 'actorNoDamage'),
    actorNoHit      : TextManager.getter('message', 'actorNoHit'),
    enemyDamage     : TextManager.getter('message', 'enemyDamage'),
    enemyRecovery   : TextManager.getter('message', 'enemyRecovery'),
    enemyGain       : TextManager.getter('message', 'enemyGain'),
    enemyLoss       : TextManager.getter('message', 'enemyLoss'),
    enemyDrain      : TextManager.getter('message', 'enemyDrain'),
    enemyNoDamage   : TextManager.getter('message', 'enemyNoDamage'),
    enemyNoHit      : TextManager.getter('message', 'enemyNoHit'),
    evasion         : TextManager.getter('message', 'evasion'),
    magicEvasion    : TextManager.getter('message', 'magicEvasion'),
    magicReflection : TextManager.getter('message', 'magicReflection'),
    counterAttack   : TextManager.getter('message', 'counterAttack'),
    substitute      : TextManager.getter('message', 'substitute'),
    buffAdd         : TextManager.getter('message', 'buffAdd'),
    debuffAdd       : TextManager.getter('message', 'debuffAdd'),
    buffRemove      : TextManager.getter('message', 'buffRemove'),
    actionFailure   : TextManager.getter('message', 'actionFailure'),
});

/**
 * wrapSmart(text: string) => string
 *
 * Ajouts :
 * - Priorité absolue à "le moins de lignes possible" via un coût fixe par ligne (LINE_WEIGHT).
 * - À nombre de lignes égal : même logique qu'avant (bonus fin de phrase, minimisation des espaces restants).
 * - ":" isolé (forme " :") attaché au token précédent (garde l'espace). ":" anglais (sans espace) est déjà collé.
 */
function wrapSmart(text) {
  if (typeof text !== 'string') throw new Error('Le texte doit être une chaîne.');
  if(text.includes("\n")) return text;
  var MAX_WIDTH = 42;
  var MAX_LINES = 4;
  var MAX_CHARS = 160;

  // Doit rester >> SENTENCE_BONUS + coût max de "raggedness" (≈ 4 * 42^2 = 7056)
  var LINE_WEIGHT = 1e7;       // pénalité par ligne pour minimiser le nb de lignes
  var SENTENCE_BONUS = 10000;  // favorise . ! ? (hors "...", abrév. "M."/"J.")

  if (text.length > MAX_CHARS) throw new Error('Le texte dépasse 160 caractères.');

  var normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  // Tokens avec méta-infos
  var raw = normalized.split(' ');
  var tokens = []; // { text, sticky, noSpaceBefore, ellipsis }
  for (var i = 0; i < raw.length; i++) {
    var t = raw[i];
    var isEllipsis = /^(\.\.\.)+$/.test(t);
    var isFRColon = (t === ':');
    tokens.push({
      text: t,
      sticky: isEllipsis || isFRColon,          // ne peut pas commencer une ligne
      noSpaceBefore: isEllipsis ? true : false, // '...' sans espace avant ; ':' garde l'espace
      ellipsis: isEllipsis
    });
  }

  // Aucun mot (hors ellipses) > MAX_WIDTH
  for (var k = 0; k < tokens.length; k++) {
    var tk = tokens[k];
    if (!tk.ellipsis && tk.text.length > MAX_WIDTH) {
      throw new Error('Un mot dépasse 42 caractères : "' + tk.text + '"');
    }
  }

  var n = tokens.length;
  var prefLen = new Array(n + 1);
  var prefNoSpace = new Array(n + 1);
  prefLen[0] = 0; prefNoSpace[0] = 0;
  for (var p = 0; p < n; p++) {
    prefLen[p + 1] = prefLen[p] + tokens[p].text.length;
    prefNoSpace[p + 1] = prefNoSpace[p] + (tokens[p].noSpaceBefore ? 1 : 0);
  }

  function lineLength(i, j) {
    var lenWords = prefLen[j + 1] - prefLen[i];
    var noSpaceInside = prefNoSpace[j + 1] - prefNoSpace[i + 1]; // (i+1..j)
    var spaces = (j - i) - noSpaceInside;
    if (spaces < 0) spaces = 0;
    return lenWords + spaces;
  }

  function isSentenceBreakBonus(j) {
    var s = tokens[j].text;
    if (/^(\.\.\.)+$/.test(s)) return false; // jamais pour "..."
    var stripped = s.replace(/[\)\]\}"'»”’]+$/g, '');
    if (/^[A-ZÀ-ÖØ-Ý]\.$/.test(stripped)) return false; // abrév. "M."/"J."
    return /[.!?]$/.test(stripped);
  }

  var INF = 1e15;
  var dp = new Array(n + 1);
  var nextChoice = new Array(n + 1);
  for (var a = 0; a <= n; a++) {
    dp[a] = new Array(MAX_LINES + 1);
    nextChoice[a] = new Array(MAX_LINES + 1);
    for (var b = 0; b <= MAX_LINES; b++) {
      dp[a][b] = INF;
      nextChoice[a][b] = -1;
    }
  }
  for (var r = 0; r <= MAX_LINES; r++) dp[n][r] = 0;

  // DP : coût d'une ligne = LINE_WEIGHT + raggedness - bonus
  for (var rlines = 1; rlines <= MAX_LINES; rlines++) {
    for (var idx = n - 1; idx >= 0; idx--) {
      var bestCost = INF, bestJ = -1;

      for (var j = idx; j < n; j++) {
        var L = lineLength(idx, j);
        if (L > MAX_WIDTH) break;

        // Interdit de couper si le prochain token est "attaché" (ex: "..." ou ":")
        if (j + 1 < n && tokens[j + 1].sticky) continue;

        var bonus = isSentenceBreakBonus(j) ? SENTENCE_BONUS : 0;
        var rest = dp[j + 1][rlines - 1];
        if (rest === INF) continue;

        var ragged = MAX_WIDTH - L;
        var cost = LINE_WEIGHT + (ragged * ragged) - bonus + rest;

        if (cost < bestCost) {
          bestCost = cost;
          bestJ = j;
        }
      }

      dp[idx][rlines] = bestCost;
      nextChoice[idx][rlines] = bestJ;
    }
  }

  if (dp[0][MAX_LINES] === INF) {
    throw new Error('Impossible de formater le texte sous les contraintes.');
  }

  // Reconstruction
  var lines = [];
  var i0 = 0, rleft = MAX_LINES;
  while (i0 < n && rleft > 0) {
    var j0 = nextChoice[i0][rleft];
    if (j0 === -1) throw new Error('Reconstruction impossible (état DP invalide).');

    var line = tokens[i0].text;
    for (var t = i0 + 1; t <= j0; t++) {
      line += (tokens[t].noSpaceBefore ? '' : ' ') + tokens[t].text;
    }
    if (line.length > MAX_WIDTH) {
      throw new Error('Une ligne dépasse 42 caractères (erreur interne).');
    }

    lines.push(line);
    i0 = j0 + 1;
    rleft--;
  }
  if (i0 < n) throw new Error('Le texte nécessite plus de 4 lignes.');

  return lines.join('\n');
}

