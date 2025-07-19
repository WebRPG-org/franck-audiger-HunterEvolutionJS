

DataManager.saveGameWeb = function() {
    var json = JsonEx.stringify(this.makeSaveContents());
    if (json.length >= 200000) {
        console.warn('Save data too big!');
    }
    StorageManager.saveWebToLocalFile(json);
    
    return true;
};

function saveAsFile(filename, content) {
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

function openSaveFileAndLoadGame() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.rpgsave';

    let fileSelected = false;

    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        fileSelected = true;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const compressed = e.target.result;
                const json = LZString.decompressFromBase64(compressed);
                const data = JsonEx.parse(json);
                if (data) {
                    DataManager.createGameObjects();
                    DataManager.extractSaveContents(data);
                    SoundManager.playLoad();
                    SceneManager._scene.fadeOutAll();
                    if ($gameSystem.versionId() !== $dataSystem.versionId) {
                        $gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y);
                        $gamePlayer.requestMapReload();
                    }
                    SceneManager.goto(Scene_Map);
                }
            } catch (err) {
                alert("Impossible de charger cette sauvegarde.");
                SceneManager.goto(Scene_Title);
            }
        };
        reader.readAsText(file);
    });

    input.click();

    setTimeout(() => {
        if (!fileSelected) {
            SceneManager.goto(Scene_Title);
        }
    }, 1000);
}

StorageManager.saveWebToLocalFile = function(json) {
    var data = LZString.compressToBase64(json);
    saveAsFile("Save1.rpgsave", data);
};


Scene_Menu.prototype.commandSave = function() {
    if(!StorageManager.isLocalMode()){
        DataManager.saveGameWeb();
        SceneManager.pop();
    } else {
        SceneManager.push(Scene_Save);
    }
};

Scene_Title.prototype.commandContinue = function() {
    if (!StorageManager.isLocalMode()) {
        openSaveFileAndLoadGame();
        
    } else {
        SceneManager.push(Scene_Load);
    }
};


Scene_Load.prototype.onLoadSuccess = function() {
    SoundManager.playLoad();
    this.fadeOutAll();
    this.reloadMapIfUpdated();
    SceneManager.goto(Scene_Map);
    this._loadSuccess = true;
};

Scene_Load.prototype.onLoadFailure = function() {
    SoundManager.playBuzzer();
    this.activateListWindow();
};

Window_TitleCommand.prototype.makeCommandList = function() {
    this.addCommand(TextManager.newGame,   'newGame');
    if (!StorageManager.isLocalMode()) {
        this.addCommand(TextManager.continue_, 'continue');
    } else {
        this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
    }
    this.addCommand(TextManager.options,   'options');
};


// Open Save Screen
Game_Interpreter.prototype.command352 = function() {
    if (!$gameParty.inBattle()) {
        if(StorageManager.isLocalMode()){
            SceneManager.push(Scene_Save);
        } else {
            return DataManager.saveGameWeb();
        }
    }
    return true;
};