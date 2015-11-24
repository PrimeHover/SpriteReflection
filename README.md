# PH_SpriteReflection
This plugin allows you to reflect any character in the water.

### How to Use
* Download the JS file and include it into the ```/plugins``` folder of your project.
* Open the Plugin Manager, select the file **PH_SpriteReflection.js**, and turn it on.
* Create some rules in the tilesets using the Terrain Tag to specify the properties of the reflection for each water tileset.
* You are allowed to create some rules for bridges as well.

### Parameters
* ``Distance``: Default distance in pixels between the reflection in the water and the actual character
* ``Scale Factor``: Default scale factor of the reflections (%) (resize the reflection)
* ``Opacity``: Default opacity value for the reflections (From 0 to 255)
* ``Blend Mode``: Default blend more for the reflections (0: Normal, 1: Additive)

### Plugin Commands:
* ``PHSpriteReflection global on``: Turns on the reflection of everything
* ``PHSpriteReflection player on``: Turns on the reflection of the player
* ``PHSpriteReflection followers on``: Turns on the reflection of the followers
* ``PHSpriteReflection event on Name of the Event``: Turns on the reflection of a specific event
* ``PHSpriteReflection global off``: Turns off the reflection of everything
* ``PHSpriteReflection player off``: Turns off the reflection of the player
* ``PHSpriteReflection followers off``: Turns off the reflection of the followers
* ``PHSpriteReflection event off Name of the Event``: Turns off the reflection of a specific event

### Rules on Tilesets
* You are allowed to give rules for each type of water tileset or bridge tileset you have based on the Terrain Tag.
* In order to set the rule for each tileset, you have to open the database and go to Tilesets.
* After that, use the Terrain Tag option to set a numeric tag (greater than 0) for the tilesets you want to make a rule.
* You are allowed to make rules 7 for tilesets which are in the section A1 (Animation) and 7 rules for tilesets in the sections B through E.
* In the Note section, you should follow the pattern below:

    ``<PH>``
    
    ``[commands]``

    ``</PH>``

* You must replace ``[commands]`` using the following commands (one on each line of the note):
    * ``WaterN={distance:scale:opacity:blend}``: Sets a rule for a specific water tileset (A1 tileset)
    * ``BridgeN={distance:scale:opacity:blend}``: Sets a rule for a bridge tileset (B, C, D, E tilesets)
* Change the following parameters for the actual numbers you want to set:
    * ``N`` = Corresponding number of the Terrain Tag (From 1 to 7).
    * ``distance`` = The distance between the reflection in the water and the actual character
    * ``scale`` = Scale factor of the reflections (%) (resize the reflection)
    * ``opacity`` = Opacity value for the reflections (From 0 to 255)
    * ``blend`` = Blend more for the reflections (0: Normal, 1: Additive)

* You **DO NOT** need to state all those parameters when making a rule! Only the terrain tag and distance are necessary for the rules.
* If you do not specify a complete rule for a water tileset, it will get the default value that is set in the plugin.
* If you do not specify a complete rule for a bridge tileset, it will get the default value of the water tileset under the bridge. If it is still not set, it will get the default.

* There are some examples of some valid rules below:
    * ``Water1={30}`` : Sets the terrain tag for a water tile and its distance
    * ``Water2={30:100}`` : Sets the terrain tag for a water tile, its distance and its scale
    * ``Water3={30:100:127}`` : Sets the terrain tag for a water tile, its distance, its scale and its opacity
    * ``Water4={30:100:127:1}`` : Sets the terrain tag for a water tile, its distance, its scale, its opacity and its blend mode
    * ``Bridge1={13}`` : Sets the terrain tag for a bridge tile and its distance
    * ``Bridge2={13:80}`` : Sets the terrain tag for a bridge tile, its distance and its scale
    * ``Bridge3={13:80:70}`` : Sets the terrain tag for a bridge tile, its distance, its scale and its opacity
    * ``Bridge4={13:80:70:0}`` : Sets the terrain tag for a bridge tile, its distance, its scale, its opacity and its blend mode

### ChangeLog
* 11/24/2015: Version 1.0