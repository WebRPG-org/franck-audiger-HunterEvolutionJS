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
    const path = require('path');
    const fs = require('fs');

    function ensureDirectoryExists(dirPath) {
        const segments = dirPath.split(path.sep);
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
})();