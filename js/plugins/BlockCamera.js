(function() {
    var parameters = PluginManager.parameters('BlockCamera');
    var _blockCamera = false;

    function switchBlockCamera() {
        _blockCamera = !_blockCamera;
    }
    
    // 👉 Rendre la fonction globale
    window.switchBlockCamera = switchBlockCamera;

    // Surcharge de Game_Player.center
    const _Game_Player_center = Game_Player.prototype.center;
    Game_Player.prototype.center = function(x, y) {
        if (!_blockCamera) {
            _Game_Player_center.call(this, x, y);
        }
    };

    // Empêche la recentration automatique après mouvement
    const _Game_Player_updateScroll = Game_Player.prototype.updateScroll;
    Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
        if (!_blockCamera) {
            _Game_Player_updateScroll.call(this, lastScrolledX, lastScrolledY);
        }
    };
})();