Window_Base.prototype.fittingHeight = function(numLines) {
    return numLines * (this.lineHeight()+2) + this.standardPadding() * 2;
};

const lineIncreaseForIcons = 0;

// Increase the height of each battle status row so icons fit correctly.
var _BS_lineHeight = Window_Base.prototype.lineHeight;
Window_BattleStatus.prototype.lineHeight = function() {
    return _BS_lineHeight.call(this) + lineIncreaseForIcons;
};

// Increase the height of each battle status row so icons fit correctly.
var _PC_lineHeight = Window_PartyCommand.prototype.lineHeight;
Window_PartyCommand.prototype.lineHeight = function() {
    return _PC_lineHeight.call(this) + lineIncreaseForIcons;
};

// Increase the height of each battle status row so icons fit correctly.
var _AC_lineHeight = Window_ActorCommand.prototype.lineHeight;
Window_ActorCommand.prototype.lineHeight = function() {
    return _PC_lineHeight.call(this) + lineIncreaseForIcons;
};


Window_BattleStatus.prototype.initialize = function() {
    var width = this.windowWidth();
    var height = this.windowHeight();
    var x = 0-Graphics.boxWidth;
    var y = Graphics.boxHeight - height;
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.openness = 0;
};

var _ATB_drawBasicArea = Window_BattleStatus.prototype.drawBasicArea;
Window_BattleStatus.prototype.drawBasicArea = function(rect, actor) {
    _ATB_drawBasicArea.call(this, rect, actor);
    this.drawActorGuardCount(actor, rect.x, rect.y);
};

Window_BattleStatus.prototype.drawActorGuardCount = function(actor, x, y) {
    var guard = actor.guardRatio ? actor.guardRatio() : 0;
    if (guard > 0) {
        this.contents.fontSize -= 8;
        var nameWidth = this.textWidth(actor.name());
        var baseX = x + nameWidth + 16;
        var baseY = (y - this.lineHeight() / 4)+10;
        var iconIndex = 322; // Icon at grid position (0,11)
        this.drawIcon(iconIndex, baseX, baseY);
        const prevFontSize = this.contents.fontSize;
        this.contents.fontSize = 16;
        this.drawText(guard, baseX+12, baseY-2, 48);
        this.contents.fontSize = prevFontSize;
        this.resetFontSettings();
    }
};


Window_BattleStatus.prototype.drawAtbGauge = function(actor, x, y, width) {
    var atbRate = actor.atb() / 100;
    this.drawGauge(x, y+5, width, atbRate, this.textColor(6), this.textColor(0));
};



Window_BattleStatus.prototype.drawGaugeArea = function(rect, actor) {
    if ($dataSystem.optDisplayTp) {
        this.drawGaugeAreaWithTp(rect, actor);
    } else {
        this.drawGaugeAreaWithoutTp(rect, actor);
    }
    var gaugeX = rect.x + 0;
    var gaugeY = rect.y + rect.height - this.lineHeight();
    var gaugeWidth = rect.width;
    this.drawAtbGauge(actor, gaugeX, gaugeY, gaugeWidth);
};

Window_BattleStatus.prototype.drawAtbGauge = function(actor, x, y, width) {
    var atbRate = actor.atb() / 100;
    this.drawGauge(x, y+5, width, atbRate, this.textColor(6), this.textColor(0));
};


var _BL_initialize = Window_BattleLog.prototype.initialize;
Window_BattleLog.prototype.initialize = function() {
    _BL_initialize.call(this);
    this._lineDurations = [];
};

var _BL_update = Window_BattleLog.prototype.update;
Window_BattleLog.prototype.update = function() {
    this.updateLineDurations();
    _BL_update.call(this);
};

var _BL_clear = Window_BattleLog.prototype.clear;
Window_BattleLog.prototype.clear = function() {
    this._lineDurations = [];
    _BL_clear.call(this);
};


var _BL_addText = Window_BattleLog.prototype.addText;
Window_BattleLog.prototype.addText = function(text) {
    this._lineDurations.push(this.lineDisplayDuration());
    _BL_addText.call(this, text);
};

Window_BattleLog.prototype.updateLineDurations = function() {
    for (var i = 0; i < this._lineDurations.length; i++) {
        this._lineDurations[i]--;
    }
    if (this._lineDurations.length > 0 && this._lineDurations[0] <= 0) {
        this._lineDurations.shift();
        this._lines.shift();
        this.refresh();
    }
};


Window_BattleLog.prototype.endAction = function(subject) {
    this.push('waitForNewLine');
    this.push('performActionEnd', subject);
};

Window_BattleLog.prototype.displayCurrentState = function(subject) {
    var stateText = subject.mostImportantStateText();
    if (stateText) {
        this.push('addText', subject.name() + stateText);
        this.push('wait');
    }
};

Window_BattleLog.prototype.displayAutoAffectedStatus = function(target) {
    if (target.result().isStatusAffected()) {
        this.displayAffectedStatus(target, null);
    }
};

Window_BattleLog.prototype.displayGyoUse = function(subject) {
    this.push('addText', "Gyo consomme du Nen pour " + subject.name() + "!");
};


Window_BattleLog.prototype.displayGuardFinished = function(subject) {
    this.push('addText', "La garde de  "+ subject.name() + " est fini !");
};

Window_BattleLog.prototype.displayGuardDecrease = function(subject) {
    this.push('addText', "La garde de  "+ subject.name() + " faibli !");
};

Window_BattleLog.prototype.displayGuardRemain = function(subject) {
    this.push('addText', subject.name() + " conserve sa garde !");
};

Window_BattleLog.prototype.lineDisplayDuration = function() {
    return 360;
};

Window_BattleLog.prototype.displayActionResults = function(subject, target) {
    if (target.result().used) {
        this.displayCritical(target);
        this.push('popupDamage', target);
        this.push('popupDamage', subject);
        this.displayDamage(target);
        this.displayAffectedStatus(target);
        this.displayFailure(target);
    }
};


Window_ActorCommand.prototype.makeCommandList = function() {
    if (this._actor) {
        this.addAttackCommand();
        this.addSkillCommands();
        this.addGuardCommand();
        this.addItemCommand();
        if(!BattleManager.noEscapeTroop().includes($gameTroop.troop().id)){
            this.addCommand(TextManager.escape, 'escape', BattleManager.canEscape());
        }
    }
};


Scene_Menu.prototype.createGoldWindow = function() {
    this._goldWindow = new Window_Gold(0, 0, true);
    this._goldWindow.y = Graphics.boxHeight - this._goldWindow.height;
    this.addWindow(this._goldWindow);
};

Scene_Shop.prototype.createGoldWindow = function() {
    this._goldWindow = new Window_Gold(0, this._helpWindow.height, false);
    this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width;
    this.addWindow(this._goldWindow);
};


Window_Message.prototype.createSubWindows = function() {
    this._goldWindow = new Window_Gold(0, 0, false);
    this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width;
    this._goldWindow.openness = 0;
    this._choiceWindow = new Window_ChoiceList(this);
    this._numberWindow = new Window_NumberInput(this);
    this._itemWindow = new Window_EventItem(this);
};

//-----------------------------------------------------------------------------
// Window_Gold
//
// The window for displaying the party's gold.

function Window_Gold() {
    this.initialize.apply(this, arguments);
}

Window_Gold.prototype = Object.create(Window_Base.prototype);
Window_Gold.prototype.constructor = Window_Gold;

Window_Gold.prototype.initialize = function(x, y, withFidelity) {
    this._withFidelity = withFidelity;
    var width = this.windowWidth();
    var height = this.windowHeight();
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
};


Window_Gold.prototype.windowWidth = function() {
    return 240;
};

Window_Gold.prototype.windowHeight = function() {
    if(this._withFidelity) {
        return this.fittingHeight(2);
    }
    return this.fittingHeight(1);
};

Window_Gold.prototype.refresh = function() {
    const x = this.textPadding();
    const width = this.contents.width - this.textPadding() * 2;
    this.contents.clear();

    const loyalty = $gameVariables.value(8); 
    const loyaltyMax = $gameVariables.value(36); 
    let yCurrency = this.lineHeight()
    if(this._withFidelity) {
        this.drawText(TextManagerEx.t('system.fidelityLabel') + loyalty + "/" + loyaltyMax, x, 0, width, 'left');
    } else {
        yCurrency = 0;
    }
  
    this.drawCurrencyValue(this.value(), this.currencyUnit(), x, yCurrency, width);
};


Window_Gold.prototype.value = function() {
    return $gameParty.gold();
};

Window_Gold.prototype.currencyUnit = function() {
    return TextManager.currencyUnit;
};

Window_Gold.prototype.open = function() {
    this.refresh();
    Window_Base.prototype.open.call(this);
};

const _Window_Base_drawActorMp = Window_Base.prototype.drawActorMp;
Window_Base.prototype.drawActorMp = function(actor, x, y, width) {
    if ($gameVariables.value(37) === 1) {
        _Window_Base_drawActorMp.call(this, actor, x, y, width);
    }
};


const _Window_Base_drawActorClass= Window_Base.prototype.drawActorClass;
Window_Base.prototype.drawActorClass = function(actor, x, y, width) {
    if ($gameVariables.value(37) === 1) {
        _Window_Base_drawActorClass.call(this, actor, x, y, width);
    }
};


Window_Base.prototype.drawActorSimpleStatus = function(actor, x, y, width) {
    var lineHeight = this.lineHeight();
    var x2 = x + 180;
    var width2 = Math.min(200, width - 180 - this.textPadding());
    this.drawActorName(actor, x, y);
    this.drawActorLevel(actor, x, y + lineHeight * 1);
    this.drawActorIcons(actor, x, y + lineHeight * 2);
    this.drawActorClass(actor, x2, y);
    this.drawActorHp(actor, x2, y + lineHeight * 1, width2);
    if ($gameVariables.value(37) === 1) {
        this.drawActorMp(actor, x2, y + lineHeight * 2, width2);
    }
};


Window_ActorCommand.prototype.addSkillCommands = function() {
    var skillTypes = this._actor.addedSkillTypes();
    skillTypes.sort(function(a, b) {
        return a - b;
    });
    skillTypes.forEach(function(stypeId) {
        var name = $dataSystem.skillTypes[stypeId];
        if(name === "Nen"){
            if ($gameVariables.value(37) === 1) {
                this.addCommand(name, 'skill', true, stypeId);
            }
        } else {
            this.addCommand(name, 'skill', true, stypeId);
        }
    }, this);
};



Window_SkillType.prototype.makeCommandList = function() {
    if (this._actor) {
        var skillTypes = this._actor.addedSkillTypes();
        skillTypes.sort(function(a, b) {
            return a - b;
        });
        skillTypes.forEach(function(stypeId) {
            var name = $dataSystem.skillTypes[stypeId];
            if(name === "Nen"){
                if ($gameVariables.value(37) === 1) {
                    this.addCommand(name, 'skill', true, stypeId);
                }
            } else {
            this.addCommand(name, 'skill', true, stypeId);
            }
        }, this);
    }
};


Window_Status.prototype.drawParameters = function(x, y) {
    var lineHeight = this.lineHeight();
    for (var i = 0; i < ($gameVariables.value(37) === 1?6:4); i++) {
        var paramId = i + 2 + (($gameVariables.value(37) === 0 && i>=2)?2:0);
        var text = TextManager.param(paramId);
        var y2 = y + lineHeight * i;
        this.changeTextColor(this.systemColor());
        this.drawText(text, x, y2, 160);
        this.resetTextColor();
        this.drawText(this._actor.param(paramId), x + 160, y2, 60, 'right');
    }
};


Window_EquipStatus.prototype.refresh = function() {
    this.contents.clear();
    if (this._actor) {
        this.drawActorName(this._actor, this.textPadding(), 0);
        for (var i = 0; i < ($gameVariables.value(37) === 1?6:4); i++) {
            this.drawItem(0, this.lineHeight() * (1 + i), 2 + i + (($gameVariables.value(37) === 0 && i>=2)?2:0));
        }
    }
};


Window_Base.prototype.drawText = function(text, x, y, maxWidth, align) {
    if (text && String(text).startsWith('langText')) {
        text = this.convertEscapeCharacters(text);
    }
    this.contents.drawText(text, x, y, maxWidth, this.lineHeight(), align);
};



// === MENU PRINCIPAL ===
Window_MenuCommand.prototype.makeCommandList = function() {
    this.addMainCommands();
    this.addOriginalCommands();
    this.addOptionsCommand();
    this.addSaveCommand();
    this.addGameEndCommand();
};

Window_MenuCommand.prototype.addOriginalCommands = function() {
    this.addCommand(TextManager.inputsList, "inputsList", true);
};


// === SCENE INPUT CONFIG ===
function Scene_InputConfig() {
    this.initialize.apply(this, arguments);
}

Scene_InputConfig.prototype = Object.create(Scene_MenuBase.prototype);
Scene_InputConfig.prototype.constructor = Scene_InputConfig;

Scene_InputConfig.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_InputConfig.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this._inputWindow = new Window_InputList(0, 0);
    this._inputWindow.setHandler('cancel', this.popScene.bind(this));
    this._inputWindow.x = (Graphics.boxWidth - this._inputWindow.width) / 2;
    this._inputWindow.y = (Graphics.boxHeight - this._inputWindow.height) / 2;
    this.addWindow(this._inputWindow);
};

Scene_InputConfig.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);

    if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
        SoundManager.playCancel();
        this.popScene();
    }
};

// === APPEL VIA MENU ===
const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
    _Scene_Menu_createCommandWindow.call(this);
    this._commandWindow.setHandler('inputsList', this.commandInputConfig.bind(this));
};

Scene_Menu.prototype.commandInputConfig = function() {
    SceneManager.push(Scene_InputConfig);
};

// === WINDOW DE LISTE DES TOUCHES ===
function Window_InputList() {
    this.initialize.apply(this, arguments);
}

const InputLists = {
    "ok" : {
        label : 'langText[commandList.ok.key]',
        value : 'langText[commandList.ok.value]'
    },
    "cancel" : {
        label : 'langText[commandList.cancel.key]',
        value : 'langText[commandList.cancel.value]'
    },
    "run" : { 
        label : 'langText[commandList.run.key]',
        value : 'langText[commandList.run.value]'
    },
    "left" : {
        label : 'langText[commandList.left.key]',
        value : 'langText[commandList.left.value]'
    },
    "up" : {   
        label : 'langText[commandList.up.key]',
        value : 'langText[commandList.up.value]'
    },
    "right" : {
        label : 'langText[commandList.right.key]',
        value : 'langText[commandList.right.value]'
    },
    "down" : {
        label : 'langText[commandList.down.key]',
        value : 'langText[commandList.down.value]'
    }
};

Window_InputList.prototype = Object.create(Window_Command.prototype);
Window_InputList.prototype.constructor = Window_InputList;

Window_InputList.prototype.initialize = function(x, y) {
    this._inputList = this.buildInputList();
    Window_Command.prototype.initialize.call(this, x, y);
    this.select(-1);         // ⛔ pas de sélection active
    this.deactivate();       // ⛔ pas de contrôle clavier
};

Window_InputList.prototype.buildInputList = function() {
    const list = [];
    const map = InputLists;
    for (const key in InputLists) {
        const action = map[key].key;
        list.push({ name: action, key });
    }
    return list;
};

Window_InputList.prototype.makeCommandList = function() {
    Object.keys(InputLists).forEach(key => {
        this.addCommand(InputLists[key].label, null, false, InputLists[key].value); // pas de handler
    });
};

Window_InputList.prototype.drawItem = function(index) {
    const rect = this.itemRect(index);
    const name = this.commandName(index);
   // const name = getBeautifyName(this.commandName(index));
    const key = this._list[index].ext;
    const half = rect.width / 2;

    this.resetTextColor();
    this.drawText(name, rect.x + this.textPadding(), rect.y, half - this.textPadding(), 'left');
    this.drawText(key, rect.x + half, rect.y, half - this.textPadding(), 'right');
};

Window_InputList.prototype.windowWidth = function() {
    return 480;
};

Window_InputList.prototype.windowHeight = function() {
    return this.fittingHeight(this._inputList.length);
};

