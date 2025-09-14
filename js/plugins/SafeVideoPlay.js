/*:
 * @plugindesc Fixe les courses entre play() et load() dans Graphics : 
 * séquencement sûr, attente de 'playing', et capture des Promises de play(). v1.0
 * @author RPG Maker AI Support
 * @help
 * Installez ce plugin APRES les fichiers core (rpg_core.js etc).
 * Il remplace Graphics.playVideo, Graphics._playVideo, Graphics._onVideoLoad, 
 * et Graphics._onTouchEnd par des versions sûres.
 *
 * - Evite "The play() request was interrupted by a new load request".
 * - Affiche la vidéo seulement quand 'playing' est émis (plus de frame figée).
 * - Ne lance pas play() depuis _onTouchEnd si la vidéo n’est pas prête.
 */

(function() {
    'use strict';

    // --- Helpers -------------------------------------------------------------

    Graphics._safeVideoPlay = function() {
        var p = this._video && this._video.play ? this._video.play() : null;
        if (p && p.catch) {
            p.catch(function(err){
                // On ignore les rejets typiques dus à load()/politiques autoplay
                if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) {
                    // no-op
                } else if (window.console) {
                    console.warn('[Graphics] play() rejected:', err);
                }
            });
        }
    };

    Graphics._abortVideoIfAny = function() {
        var v = this._video;
        if (!v) return;
        try { v.pause(); } catch (e) {}
        // Nettoyage des handlers pour éviter des callbacks obsolètes
        v.onloadeddata = null;
        v.onerror = null;
        v.onended = null;
        // Réinitialisation de la ressource (stoppe les téléchargements en cours)
        try { v.removeAttribute('src'); } catch (e) {}
        try { v.load(); } catch (e) {}
        this._videoLoading = false;
        this._updateVisibility(false);
    };

    // --- Overrides -----------------------------------------------------------

    // On force un abort propre avant tout nouveau playVideo
    Graphics.playVideo = function(src) {
        this._videoLoader = ResourceHandler.createLoader(
            null,
            this._playVideo.bind(this, src),
            this._onVideoError.bind(this)
        );
        this._abortVideoIfAny();      // <--- important
        this._playVideo(src);
    };

    Graphics._playVideo = function(src) {
        var v = this._video;
        if (!v) return;

        // Reset propre des handlers pour éviter les doublons
        v.onloadeddata = null;
        v.onerror = null;
        v.onended = null;

        this._videoLoading = true;
        this._updateVisibility(false);

        // Conseillé pour un chargement fiable
        v.preload = 'auto';
        v.volume = this._videoVolume;

        // Assigne la source en premier
        v.src = src;

        // Déclare les handlers APRES l'assignation du src
        v.onloadeddata = this._onVideoLoad.bind(this);
        v.onerror = this._videoLoader;
        v.onended = this._onVideoEnd.bind(this);

        // Démarre réellement le chargement si nécessaire.
        // (Setting src suffit souvent, mais on garde load() conditionnel et tardif)
        if (v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            try { v.load(); } catch (e) { /* certains browsers n'en ont pas besoin */ }
        }
    };

    Graphics._onVideoLoad = function() {
        var v = this._video;
        if (!v) { this._videoLoading = false; return; }

        // Assure la lecture depuis le début
        try { v.currentTime = 0; } catch (e) {}

        // N'affiche la vidéo qu'une fois réellement EN LECTURE
        var onPlaying = function() {
            v.removeEventListener('playing', onPlaying);
            Graphics._updateVisibility(true);
        };
        v.addEventListener('playing', onPlaying);

        // Lance la lecture de manière sûre (Promise catchée)
        this._safeVideoPlay();

        this._videoLoading = false;
    };

    // On ne tente pas de play() tant que la vidéo n'a pas de data.
    Graphics._onTouchEnd = function(event) {
        if (!this._videoUnlocked) {
            this._videoUnlocked = true; // on marque le déverrouillage utilisateur
        }
        if (this._isVideoVisible() && this._video && this._video.paused &&
            this._video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            this._safeVideoPlay();
        }
    };

    // Optionnel : s'assurer d'arrêter correctement à la fin
    var _Graphics__onVideoEnd = Graphics._onVideoEnd;
    Graphics._onVideoEnd = function() {
        try { if (this._video) this._video.pause(); } catch (e) {}
        _Graphics__onVideoEnd.call(this);
    };

})();
