/*:
 * @plugindesc Redirige les sauvegardes vers un dossier AppData personnalisé (HxHEvo/save) pour version Desktop (NW.js/Electron). ⌁
 * @author GPT
 * 
 * @help
 * Ce plugin redirige tous les fichiers de sauvegarde vers :
 * - Windows : %APPDATA%/HxHEvo/save/
 * - macOS   : ~/Library/Application Support/HxHEvo/save/
 * - Linux   : ~/.config/HxHEvo/save/
 * 
 * ⚠️ Fonctionne uniquement en mode local (Desktop).
 * Aucun plugin command requis. Intégration native avec le menu RPG Maker.
 */

(function() {

    if (!window.showDirectoryPicker || StorageManager.isLocalMode()) {

        
        const fs = require('fs');

        function ensureDirectoryExists(dirPath) {
            const segments = dirPath.split('/');
            let currentPath = segments[0];

            for (let i = 1; i < segments.length; i++) {
                currentPath = path.join(currentPath, segments[i]);
                if (!fs.existsSync(currentPath)) {
                    try {
                        fs.mkdirSync(currentPath);
                    } catch (e) {
                        console.error("Impossible de créer le dossier :", currentPath, e);
                    }
                }
            }
        }

        StorageManager.localFileDirectoryPath = function() {
            const appName = 'HxHEvo';
            let base;

            if (process.platform === 'win32') {
                base = process.env.APPDATA;
            } else if (process.platform === 'darwin') {
                base = path.join(process.env.HOME, 'Library', 'Application Support');
            } else {
                base = path.join(process.env.HOME || process.env.XDG_CONFIG_HOME, '.config');
            }

            const savePath = path.join(base, appName, 'save');

            ensureDirectoryExists(savePath);

            return savePath + path.sep;
        };

        
        StorageManager.save = function(savefileId, json) {
            this.saveToLocalFile(savefileId, json);
        };

        StorageManager.load = function(savefileId) {
            return this.loadFromLocalFile(savefileId);
        };

        StorageManager.exists = function(savefileId) {
            return this.localFileExists(savefileId);
        };

        StorageManager.remove = function(savefileId) {
            this.removeLocalFile(savefileId);
        };
        
        StorageManager.backup = function(savefileId) {
            if (this.exists(savefileId)) {
                var data = this.loadFromLocalFile(savefileId);
                var compressed = LZString.compressToBase64(data);
                var fs = require('fs');
                var dirPath = this.localFileDirectoryPath();
                var filePath = this.localFilePath(savefileId) + ".bak";
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath);
                }
                fs.writeFileSync(filePath, compressed);
            }
        };


        StorageManager.cleanBackup = function(savefileId) {
            if (this.backupExists(savefileId)) {
                var fs = require('fs');
                var dirPath = this.localFileDirectoryPath();
                var filePath = this.localFilePath(savefileId);
                fs.unlinkSync(filePath + ".bak");
            }
        };

        StorageManager.restoreBackup = function(savefileId) {
            if (this.backupExists(savefileId)) {
                var data = this.loadFromLocalBackupFile(savefileId);
                var compressed = LZString.compressToBase64(data);
                var fs = require('fs');
                var dirPath = this.localFileDirectoryPath();
                var filePath = this.localFilePath(savefileId);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath);
                }
                fs.writeFileSync(filePath, compressed);
                fs.unlinkSync(filePath + ".bak");
            }
        };

        StorageManager.saveToLocalFile = function(savefileId, json) {
            var data = LZString.compressToBase64(json);
            var fs = require('fs');
            var dirPath = this.localFileDirectoryPath();
            var filePath = this.localFilePath(savefileId);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
            fs.writeFileSync(filePath, data);
        };

    } else {
        const SAVE_DIR_KEY = "hxhevo_save_dir";

        async function getSaveDirectoryHandle() {
            if (window._hxhevo_cachedHandle) return window._hxhevo_cachedHandle;

            const storedHandle = await window.hxhevo_db.get(SAVE_DIR_KEY);
            if (storedHandle && (await verifyPermission(storedHandle))) {
                window._hxhevo_cachedHandle = storedHandle;
                return storedHandle;
            }

            const handle = await window.showDirectoryPicker();
            if (await verifyPermission(handle)) {
                await window.hxhevo_db.set(SAVE_DIR_KEY, handle);
                window._hxhevo_cachedHandle = handle;
                return handle;
            }

            throw new Error("Permission refusée pour accéder au dossier.");
        }

        async function verifyPermission(handle) {
            const options = { mode: 'readwrite' };
            if ((await handle.queryPermission(options)) === 'granted') return true;
            if ((await handle.requestPermission(options)) === 'granted') return true;
            return false;
        }

        async function initIndexedDB() {
            const db = await idbKeyvalPromisify();
            window.hxhevo_db = db;
        }

        async function idbKeyvalPromisify() {
            const dbName = "HxHEvoSaveFS";
            const storeName = "handles";
            return {
                async get(key) {
                    return new Promise((resolve, reject) => {
                        const open = indexedDB.open(dbName);
                        open.onerror = () => reject(open.error);
                        open.onsuccess = () => {
                            const tx = open.result.transaction(storeName, "readonly");
                            const store = tx.objectStore(storeName);
                            const req = store.get(key);
                            req.onsuccess = () => resolve(req.result);
                            req.onerror = () => reject(req.error);
                        };
                        open.onupgradeneeded = () => {
                            open.result.createObjectStore(storeName);
                        };
                    });
                },
                async set(key, value) {
                    return new Promise((resolve, reject) => {
                        const open = indexedDB.open(dbName);
                        open.onerror = () => reject(open.error);
                        open.onsuccess = () => {
                            const tx = open.result.transaction(storeName, "readwrite");
                            const store = tx.objectStore(storeName);
                            const req = store.put(value, key);
                            req.onsuccess = () => resolve();
                            req.onerror = () => reject(req.error);
                        };
                        open.onupgradeneeded = () => {
                            open.result.createObjectStore(storeName);
                        };
                    });
                }
            };
        }

        async function saveToFileSystem(savefileId, json) {
            const dirHandle = await getSaveDirectoryHandle();
            const filename = StorageManager.webStorageKey(savefileId) + ".rpgsave";
            const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(LZString.compressToBase64(json));
            await writable.close();
        }

        async function loadFromFileSystem(savefileId) {
            const dirHandle = await getSaveDirectoryHandle();
            const filename = StorageManager.webStorageKey(savefileId) + ".rpgsave";
            const fileHandle = await dirHandle.getFileHandle(filename);
            const file = await fileHandle.getFile();
            const text = await file.text();
            const json = LZString.decompressFromBase64(text);
            return json;
        }

        // Initialisation IndexedDB
        initIndexedDB();

        // Remplacer les méthodes web natives
        StorageManager.saveToWebStorage = function(savefileId, json) {
            return saveToFileSystem(savefileId, json);
        };

        StorageManager.loadFromWebStorage = function(savefileId) {
            return loadFromFileSystem(savefileId);
        };

    };
})();