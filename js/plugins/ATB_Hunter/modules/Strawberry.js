const kurapikaLeolioStrawberry = {}
let enableStrawberry = false;

window.getKurapikaLeolioStrawberry = function () {
    return kurapikaLeolioStrawberry;
}

window.getKurapikaLeolioStrawberry = function (index) {
    return kurapikaLeolioStrawberry[index];
}

window.enableKurapikaLeolioStrawberry = function () {
    enableStrawberry = true;
}

window.disableKurapikaLeolioStrawberry = function () {
    enableStrawberry = false;
}

window.allStrawberryInvisible = function() {
    $gameMap.events().forEach(ev => {
        if ($dataMap.events[ev.eventId()].name === "Strawberry") {
            $gameMap.event(ev.eventId()).setTransparent(true);
            kurapikaLeolioStrawberry[ev.eventId()] = initTimeStrawberry();
        }
    });
}

window.startStrawberryFight = function (eventId) {   
    BattleManager.setup(9, true, false);
    BattleManager.onEncounter();
    SceneManager.push(Scene_Battle);
    increaseOpacityFog(-100);
    $gameMap.event(eventId).erase();
}

function initTimeStrawberry() {
    return -150 - Math.floor(Math.random() * 150);
}

const STRAWBERRY_APPARITION_TIME = 350;


Game_Event.prototype.isNearThePlayerEuclidian = function(range = 20) {
  var sx = Math.abs(this.deltaXFrom($gamePlayer.x));
  var sy = Math.abs(this.deltaYFrom($gamePlayer.y));
  var distance = Math.sqrt(sx * sx + sy * sy);
  return distance < range;
};

var _Scene_Map_update4 = Scene_Map.prototype.update;
Scene_Map.prototype.update = function () {
    _Scene_Map_update4.call(this);
    if (!enableStrawberry) return;

    $gameMap.events().forEach(ev => {
        const name = $dataMap.events[ev.eventId()].name;
        if (name === "Strawberry") {
            if(ev.isNearThePlayerEuclidian(10)){
                if(kurapikaLeolioStrawberry[ev.eventId()] < -1 ) {
                    kurapikaLeolioStrawberry[ev.eventId()]++;
                } else if(kurapikaLeolioStrawberry[ev.eventId()] > 1) {
                    if(kurapikaLeolioStrawberry[ev.eventId()] < 5) {
                        $gameMap.event(ev.eventId()).setOpacity(0);
                    } else if(kurapikaLeolioStrawberry[ev.eventId()] < 10) {
                        $gameMap.event(ev.eventId()).setOpacity(50);
                    } else if(kurapikaLeolioStrawberry[ev.eventId()] < 15) {
                        $gameMap.event(ev.eventId()).setOpacity(100);
                    } else if(kurapikaLeolioStrawberry[ev.eventId()] < 20) {
                        $gameMap.event(ev.eventId()).setOpacity(150);
                    } else if(kurapikaLeolioStrawberry[ev.eventId()] < 25) {
                        $gameMap.event(ev.eventId()).setOpacity(200);
                    } else if(kurapikaLeolioStrawberry[ev.eventId()] < STRAWBERRY_APPARITION_TIME-26) {
                        if(kurapikaLeolioStrawberry[ev.eventId()]%25 == 0){
                            if($gameMap.event(ev.eventId()).direction() == 2) {
                                $gameMap.event(ev.eventId()).setDirection(4);
                            } else if($gameMap.event(ev.eventId()).direction() == 4) {
                                $gameMap.event(ev.eventId()).setDirection(6);
                            } else if($gameMap.event(ev.eventId()).direction() == 6) {
                                $gameMap.event(ev.eventId()).setDirection(8);
                            } else if($gameMap.event(ev.eventId()).direction() == 8) {
                                $gameMap.event(ev.eventId()).setDirection(2);
                            } 
                        }
                    } else if(kurapikaLeolioStrawberry[ev.eventId()] < STRAWBERRY_APPARITION_TIME-25) {
                        $gameMap.event(ev.eventId()).setOpacity(255);
                    } else if(kurapikaLeolioStrawberry[ev.eventId()] < STRAWBERRY_APPARITION_TIME-20) {
                        $gameMap.event(ev.eventId()).setOpacity(200);
                    } else if(kurapikaLeolioStrawberry[ev.eventId()] < STRAWBERRY_APPARITION_TIME-15) {
                        $gameMap.event(ev.eventId()).setOpacity(150);
                    } else if(kurapikaLeolioStrawberry[ev.eventId()] < STRAWBERRY_APPARITION_TIME-10) {
                        $gameMap.event(ev.eventId()).setOpacity(100);
                    } else if(kurapikaLeolioStrawberry[ev.eventId()] < STRAWBERRY_APPARITION_TIME-5) {
                        $gameMap.event(ev.eventId()).setOpacity(50);
                    }
                    kurapikaLeolioStrawberry[ev.eventId()]--;
                } else if(kurapikaLeolioStrawberry[ev.eventId()] == 1) {
                    $gameMap.event(ev.eventId()).setTransparent(true);
                    const dirIndex = Math.floor(Math.random() * 4);
                    const dirs = [2, 4, 6, 8];
                    $gameMap.event(ev.eventId()).moveStraight(dirs[dirIndex]);
                    $gameMap.event(ev.eventId()).setDirection(2);
                    kurapikaLeolioStrawberry[ev.eventId()] = initTimeStrawberry();
                } else if(kurapikaLeolioStrawberry[ev.eventId()] == -1) {
                    $gameMap.event(ev.eventId()).setTransparent(false);
                    $gameMap.event(ev.eventId()).setOpacity(0);
                    kurapikaLeolioStrawberry[ev.eventId()] = STRAWBERRY_APPARITION_TIME;
                } 
            }
        }
    });
};