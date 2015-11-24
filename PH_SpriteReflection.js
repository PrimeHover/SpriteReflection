/*:

 PH - Sprite Reflection
 @plugindesc This plugin allows you to reflect any character in the water.
 @author PrimeHover
 @version 1.0
 @date 11/24/2015

 ---------------------------------------------------------------------------------------
 This work is licensed under the Creative Commons Attribution 4.0 International License.
 To view a copy of this license, visit http://creativecommons.org/licenses/by/4.0/
 ---------------------------------------------------------------------------------------

 @param --Reflection Options--
 @default

 @param Distance
 @desc Default distance in pixels between the reflection in the water and the actual character
 @default 30

 @param Scale Factor
 @desc Default scale factor of the reflections (%) (resize the reflection)
 @default 100

 @param Opacity
 @desc Default opacity value for the reflections (From 0 to 255)
 @default 50

 @param Blend Mode
 @desc Default blend more for the reflections (0: Normal, 1: Additive)
 @default 0

 @help

 Sprite Reflection
 created by PrimeHover

 ----------------------------------------------------------------------------------------------------------------------------------

 Plugin Commands:

 - PHSpriteReflection global on                         # Turns on the reflection of everything
 - PHSpriteReflection player on                         # Turns on the reflection of the player
 - PHSpriteReflection followers on                      # Turns on the reflection of the followers
 - PHSpriteReflection event on Name of the Event        # Turns on the reflection of a specific event

 - PHSpriteReflection global off                        # Turns off the reflection of everything
 - PHSpriteReflection player off                        # Turns off the reflection of the player
 - PHSpriteReflection followers off                     # Turns off the reflection of the followers
 - PHSpriteReflection event off Name of the Event       # Turns off the reflection of a specific event

 ----------------------------------------------------------------------------------------------------------------------------------

 Notes/Rules on Tilesets:

 You are allowed to give rules for each type of water tileset or bridge tileset you have based on the Terrain Tag.
 In order to set the rule for each tileset, you have to open the database and go to Tilesets.
 After that, use the Terrain Tag option to set a numeric tag (greater than 0) for the tilesets you want to make a rule.
 You are allowed to make rules 7 for tilesets which are in the section A1 (Animation) and 7 rules for tilesets in the sections B through E.

 In the Note section, you should follow the pattern below:

 <PH>
 [commands]
 </PH>

 You must replace "[commands]" using the following commands (one on each line of the note):

 - WaterN={distance:scale:opacity:blend}                   # Sets a rule for a specific water tileset (A1 tileset)
 - BridgeN={distance:scale:opacity:blend}                  # Sets a rule for a bridge tileset (B, C, D, E tilesets)

 Change the following parameters for the actual numbers you want to set:

 "N" = Terrain Tag number (From 1 to 7).
 "distance" = The distance between the reflection in the water and the actual character
 "scale" = Scale factor of the reflections (%) (resize the reflection)
 "opacity" = Opacity value for the reflections (From 0 to 255)
 "blend" = Blend more for the reflections (0: Normal, 1: Additive)


 You DO NOT need to state all those parameters when making a rule! Only the terrain tag and distance are necessary for the rules.
 If you do not specify a complete rule for a water tileset, it will get the default value that is set in the plugin.
 If you do not specify a complete rule for a bridge tileset, it will get the default value of the water tileset under the bridge. If it is still not set, it will get the default.

 There are some examples of some valid rules below:

 Water1={30}                  # Sets the terrain tag for a water tile and its distance
 Water2={30:100}              # Sets the terrain tag for a water tile, its distance and its scale
 Water3={30:100:127}          # Sets the terrain tag for a water tile, its distance, its scale and its opacity
 Water4={30:100:127:1}        # Sets the terrain tag for a water tile, its distance, its scale, its opacity and its blend mode

 Bridge1={13}                 # Sets the terrain tag for a bridge tile and its distance
 Bridge2={13:80}              # Sets the terrain tag for a bridge tile, its distance and its scale
 Bridge3={13:80:70}           # Sets the terrain tag for a bridge tile, its distance, its scale and its opacity
 Bridge4={13:80:70:0}         # Sets the terrain tag for a bridge tile, its distance, its scale, its opacity and its blend mode

 */

/* Global variable for PH Plugins */
var PHPlugins = PHPlugins || {};
PHPlugins.Parameters = PluginManager.parameters('PH_SpriteReflection');
PHPlugins.Params = PHPlugins.Params || {};

/* Global variable for the list of quests */
PHPlugins.PHSpriteReflection = {
    noReflection: {
        global: false,
        player: false,
        followers: false,
        events: []
    }
};

/* Getting the parameters */
PHPlugins.Params.PHSpriteReflectionDistance = Number(PHPlugins.Parameters['Distance']);
PHPlugins.Params.PHSpriteReflectionScaleFactor = Number(PHPlugins.Parameters['Scale Factor']);
PHPlugins.Params.PHSpriteReflectionOpacity = Number(PHPlugins.Parameters['Opacity']);
PHPlugins.Params.PHSpriteReflectionBlendMode = Number(PHPlugins.Parameters['Blend Mode']);

(function() {

    /* ---------------------------------------------------------- *
     *                   PH REFLECTION MANAGER                    *
     * ---------------------------------------------------------- */

    function PHReflectionManager() {
        this.initialize.apply(this, arguments);
    }
    PHReflectionManager.prototype.constructor = PHReflectionManager;

    PHReflectionManager.prototype.initialize = function(character) {
        this._character = character;
        this.updatePositions();
        this._tilesetNote = this.getNoteTag();
    };

    /* ------ UPDATE METHODS ------ */
    PHReflectionManager.prototype.getPreviousPosition = function() {
        if (this._character._realX > this._character._x || this._character._realY > this._character._y) {
            return { x: Math.ceil(this._character._realX), y: Math.ceil(this._character._realY) }
        }
        return { x: Math.floor(this._character._realX), y: Math.floor(this._character._realY) }
    };

    PHReflectionManager.prototype.getCurrentPosition = function() {
        return { x: this._character.x, y: this._character.y };
    };

    PHReflectionManager.prototype.getActualTileId = function() {
        return [ $gameMap.tileId(this._actualPosition.x, this._actualPosition.y, 0), $gameMap.tileId(this._actualPosition.x, this._actualPosition.y, 3) ];
    };

    PHReflectionManager.prototype.getActualTerrainTag = function() {
        return $gameMap.terrainTag(this._actualPosition.x, this._actualPosition.y);
    };

    PHReflectionManager.prototype.getUnderActualTileId = function() {
        return [ $gameMap.tileId(this._actualPosition.x, this._actualPosition.y + 1, 0), $gameMap.tileId(this._actualPosition.x, this._actualPosition.y + 1, 3) ];
    };

    PHReflectionManager.prototype.getUnderActualTerrainTag = function() {
        return $gameMap.terrainTag(this._actualPosition.x, this._actualPosition.y + 1);
    };

    PHReflectionManager.prototype.getPreviousTileId = function() {
        return [ $gameMap.tileId(this._previousPosition.x, this._previousPosition.y, 0), $gameMap.tileId(this._previousPosition.x, this._previousPosition.y, 3) ];
    };

    PHReflectionManager.prototype.getPreviousTerrainTag = function() {
        return $gameMap.terrainTag(this._previousPosition.x, this._previousPosition.y);
    };

    PHReflectionManager.prototype.getUnderPreviousTileId = function() {
        return [ $gameMap.tileId(this._previousPosition.x, this._previousPosition.y + 1, 0), $gameMap.tileId(this._previousPosition.x, this._previousPosition.y + 1, 3) ];
    };

    PHReflectionManager.prototype.getUnderPreviousTerrainTag = function() {
        return $gameMap.terrainTag(this._previousPosition.x, this._previousPosition.y + 1);
    };

    PHReflectionManager.prototype.getNoteTag = function() {
        for (var i = 0; i < $dataTilesets.length; i++) {
            if ($dataTilesets[i] && $dataTilesets[i].id == $gameMap._tilesetId && $dataTilesets[i].note.indexOf('<PH>') > -1) {

                var regex = /\<PH>([^)]+)\<\/PH>/;
                var regexInside = /\{([^)]+)\}/;

                var matches = regex.exec($dataTilesets[i].note);
                if (matches != null) {
                    matches[1] = matches[1].split("\n");

                    var temp;
                    var results;
                    var final = {};
                    for (var j = 0; j < matches[1].length; j++) {
                        temp = matches[1][j].split("=");
                        results = regexInside.exec(temp[1]);
                        if (results != null) {
                            temp[1] = results[1].split(":");
                        }
                        final[temp[0]] = temp[1];
                    }
                    return final;
                }
                return {};
            }
        }
        return {};
    };

    PHReflectionManager.prototype.updatePositions = function() {

        this._actualPosition = this.getCurrentPosition();
        this._previousPosition = this.getPreviousPosition();

        this._actualTileId = this.getActualTileId();
        this._previousTileId = this.getPreviousTileId();

        this._actualTerrainTag = this.getActualTerrainTag();
        this._previousTerrainTag = this.getPreviousTerrainTag();

        this._underPreviousTileId = this.getUnderPreviousTileId();
        this._underActualTileId = this.getUnderActualTileId();
        this._underActualTerrainTag = this.getUnderActualTerrainTag();
        this._underPreviousTerrainTag = this.getUnderPreviousTerrainTag();

    };


    /* ------ CHECKER METHODS ------ */
    PHReflectionManager.prototype.isCreatingReflection = function() {
        this.updatePositions();
        if (this.checkPermission()) {
            return !!this.checkMovement(this._character.isMoving());
        }
        return false;
    };

    PHReflectionManager.prototype.checkMovement = function(wasMoving) {
        if (Tilemap.isWaterTile(this._underActualTileId[0])) {
            if (Tilemap.isWaterTile(this._underPreviousTileId[0])) {
                if (this._underActualTileId[1] == 0) {
                    if (this._underPreviousTileId[1] == 0) {
                        return true;
                    } else {
                        return !wasMoving;
                    }
                } else {
                    return false;
                }
            } else {
                return !wasMoving;
            }
        } else {
            return false;
        }
    };

    PHReflectionManager.prototype.checkPermission = function() {
        if (!PHPlugins.PHSpriteReflection.noReflection.global) {
            if (this._character instanceof Game_Player && !PHPlugins.PHSpriteReflection.noReflection.player) {
                return true;
            }
            if (this._character instanceof Game_Follower && !PHPlugins.PHSpriteReflection.noReflection.followers) {
                return true;
            }
            if (this._character instanceof Game_Event && PHPlugins.PHSpriteReflection.noReflection.events.indexOf(this._character.event().name) == -1) {
                return true;
            }
        }
        return false;
    };


    /* ------ DRAWING METHODS ------ */
    PHReflectionManager.prototype.updateBody = function() {

            /* Lower Body */
            this.updateLowerBody();

            /* Upper Body */
            this.updateUpperBody();

    };

    PHReflectionManager.prototype.updateUpperBody = function() {
        var scaleFactor = this.getScaleFactor();
        this._upperBodyReflect.scale.x = -(scaleFactor / 100);
        this._upperBodyReflect.scale.y = scaleFactor / 100;
        this._upperBodyReflect.y = this.getYCoord();
        this._upperBodyReflect.blendMode = this.getBlendMode();
        this._upperBodyReflect.opacity = this.getOpacity();
    };

    PHReflectionManager.prototype.updateLowerBody = function() {
        var scaleFactor = this.getScaleFactor();
        this._lowerBodyReflect.scale.x = -(scaleFactor / 100);
        this._lowerBodyReflect.scale.y = scaleFactor / 100;
        this._lowerBodyReflect.y = this.getYCoord();
        this._lowerBodyReflect.blendMode = this.getBlendMode();
        this._lowerBodyReflect.opacity = this.getOpacity();
    };

    PHReflectionManager.prototype.createUpperBody = function() {
        this._upperBodyReflect = new Sprite();
        this._upperBodyReflect.anchor.x = 0.5;
        this._upperBodyReflect.anchor.y = 1;
        this._upperBodyReflect.rotation = Math.PI;
        this.updateUpperBody();
    };

    PHReflectionManager.prototype.createLowerBody = function() {
        this._lowerBodyReflect = new Sprite();
        this._lowerBodyReflect.anchor.x = 0.5;
        this._lowerBodyReflect.anchor.y = 1;
        this._lowerBodyReflect.rotation = Math.PI;
        this.updateLowerBody();
    };


    /* ------ DRAWING HELPER METHODS ------ */
    PHReflectionManager.prototype.getKey = function() {
        var key = 0;
        if (this._underActualTerrainTag > 0) {
            key = 'Water' + this._underActualTerrainTag;
        }
        if (this._actualTileId[1] > 0 && this._actualTerrainTag > 0) {
            key = 'Bridge' + this._actualTerrainTag;
        }
        return key;
    };

    PHReflectionManager.prototype.getValue = function(index, defaultReturn) {
        var key = this.getKey();
        if (key != 0) {
            if (this._tilesetNote.hasOwnProperty(key) && typeof this._tilesetNote[key][index] !== 'undefined') {
                return parseInt(this._tilesetNote[key][index]);
            } else if (key.indexOf('Bridge') > -1) {
                key = 'Water' + this._underActualTerrainTag;
                if (this._tilesetNote.hasOwnProperty(key) && typeof this._tilesetNote[key][index] !== 'undefined') {
                    return parseInt(this._tilesetNote[key][index]);
                }
            }
            return defaultReturn;
        }
        return defaultReturn;
    };

    PHReflectionManager.prototype.getYCoord = function() {
        return this.getValue(0, PHPlugins.Params.PHSpriteReflectionDistance);
    };

    PHReflectionManager.prototype.getScaleFactor = function() {
        return this.getValue(1, PHPlugins.Params.PHSpriteReflectionScaleFactor);
    };

    PHReflectionManager.prototype.getOpacity = function() {
        return this.getValue(2, PHPlugins.Params.PHSpriteReflectionOpacity);
    };

    PHReflectionManager.prototype.getBlendMode = function() {
        return this.getValue(3, PHPlugins.Params.PHSpriteReflectionBlendMode);
    };



    /* ---------------------------------------------------------- *
     *                 GAME INTERPRETER PROCESS                   *
     * ---------------------------------------------------------- */

    /* Creating PHSpriteReflection variable after loading the whole database */
    var _DataManager_createGameObjects_ = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects_.call(this);
        PHPlugins.PHSpriteReflection = {
            noReflection: {
                global: false,
                player: false,
                followers: false,
                events: []
            }
        };
    };

    /* Saves the sprites when the player saves the game */
    var _DataManager_makeSaveContents_ = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        var contents = _DataManager_makeSaveContents_.call(this);
        contents.phsprite = PHPlugins.PHSpriteReflection;
        return contents;
    };

    /* Retrieve the sprites from the save content */
    var _DataManager_extractSaveContents_ = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _DataManager_extractSaveContents_.call(this, contents);
        PHPlugins.PHSpriteReflection = contents.phsprite;
    };

    var getAllArguments = function(args, startIndex) {
        var str = args[startIndex].toString();
        for (var i = (startIndex+1); i < args.length; i++) {
            str += ' ' + args[i].toString();
        }
        return str;
    };

    /* Turn the reflection on and off */
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'PHSpriteReflection') {
            switch (args[0]) {
                case 'global':
                    switch (args[1]) {
                        case 'on':
                            PHPlugins.PHSpriteReflection.noReflection.global = false;
                            break;
                        case 'off':
                            PHPlugins.PHSpriteReflection.noReflection.global = true;
                            break;
                    }
                    break;
                case 'player':
                    switch (args[1]) {
                        case 'on':
                            PHPlugins.PHSpriteReflection.noReflection.player = false;
                            break;
                        case 'off':
                            PHPlugins.PHSpriteReflection.noReflection.player = true;
                            break;
                    }
                    break;
                case 'followers':
                    switch (args[1]) {
                        case 'on':
                            PHPlugins.PHSpriteReflection.noReflection.followers = false;
                            break;
                        case 'off':
                            PHPlugins.PHSpriteReflection.noReflection.followers = true;
                            break;
                    }
                    break;
                case 'event':
                    switch (args[1]) {
                        case 'on':
                            var value = getAllArguments(args, 2);
                            var indexOf = PHPlugins.PHSpriteReflection.noReflection.events.indexOf(value);
                            if (indexOf > -1) {
                                PHPlugins.PHSpriteReflection.noReflection.events.splice(indexOf, 1);
                            }
                            break;
                        case 'off':
                            PHPlugins.PHSpriteReflection.noReflection.events.push(getAllArguments(args, 2));
                            break;
                    }
                    break;
            }
        }
    };



    /* ---------------------------------------------------------- *
     *                      SPRITE PROCESS                        *
     * ---------------------------------------------------------- */

    var _Sprite_Character_prototype_initMembers = Sprite_Character.prototype.initMembers;
    Sprite_Character.prototype.initMembers = function() {
        _Sprite_Character_prototype_initMembers.call(this);
        this._lowerBodyReflect = null;
        this._upperBodyReflect = null;
        this._reflectionManager = null;
    };

    var _Sprite_Character_prototype_setCharacter = Sprite_Character.prototype.setCharacter;
    Sprite_Character.prototype.setCharacter = function(character) {
        _Sprite_Character_prototype_setCharacter.call(this, character);
        this._reflectionManager = new PHReflectionManager(character);
    };

    var _Sprite_Character_prototype_updateCharacterFrame = Sprite_Character.prototype.updateCharacterFrame;
    Sprite_Character.prototype.updateCharacterFrame = function() {
        _Sprite_Character_prototype_updateCharacterFrame.call(this);
        if (this._reflectionManager.isCreatingReflection()) {
            this.updateCharacterFrameReflection();
        } else {
            if (this._lowerBodyReflect) {
                this._lowerBodyReflect.visible = false;
            }
            if (this._upperBodyReflect) {
                this._upperBodyReflect.visible = false;
            }
        }
    };

    Sprite_Character.prototype.createHalfBodySpritesReflection = function() {
        if (!this._upperBodyReflect) {
            this._reflectionManager.createUpperBody();
            this._upperBodyReflect = this._reflectionManager._upperBodyReflect;
            this.addChild(this._upperBodyReflect);
        }

        if (!this._lowerBodyReflect) {
            this._reflectionManager.createLowerBody();
            this._lowerBodyReflect = this._reflectionManager._lowerBodyReflect;
            this.addChild(this._lowerBodyReflect);
        }
    };

    Sprite_Character.prototype.updateHalfBodySpritesReflection = function() {
        this.createHalfBodySpritesReflection();
        this._upperBodyReflect.bitmap = this.bitmap;
        this._upperBodyReflect.visible = true;
        this._lowerBodyReflect.bitmap = this.bitmap;
        this._lowerBodyReflect.visible = true;
        this._reflectionManager.updateBody();
    };

    Sprite_Character.prototype.updateCharacterFrameReflection = function() {
        var pw = this.patternWidth();
        var ph = this.patternHeight();
        var sx = (this.characterBlockX() + this.characterPatternX()) * pw;
        var sy = (this.characterBlockY() + this.characterPatternY()) * ph;
        this.updateHalfBodySpritesReflection();
        this._upperBodyReflect.setFrame(sx, sy, pw, ph);
        this._lowerBodyReflect.setFrame(sx, sy, pw, ph);
    };

})();