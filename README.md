# Valor: The Heroic Roleplaying System for Foundry VTT

An implementation of the Valor: the Heroic Roleplay System (https://valorousgames.com/), for Foundry Virtual Tabletop (http://foundryvtt.com), utilizing Foundry Boilerplate System as a base (https://gitlab.com/asacolips-projects/foundry-mods/boilerplate). This work is permitted under the Creative Commons
Attribution-ShareAlike 4.0 license (CC BY-SA 4.0) (https://valorousgames.com/2020/09/07/valor-discord-community-and-creative-commons/).

Forked from TCX0Lt0X (https://github.com/TCX0Lt0X/foundryvtt-valor)

All core-book skills, flaws, mods, etc. are implemented, changes to numbers should automatically work. Verified working on Foundry 13.348
There are fields open to players that run arbitrary scripts. If you do not trust your players, I advise waiting for a more secure update.

Tips and Tricks:
- Clicking on the icon for a skill or flaw will output the text of it in chat. Clicking the icon of a technique will do the same and also roll the associated active attribute (including any roll bonuses)
- Shift+Clicking on the icon of a technique with attached skills or flaws will automatically create temporary versions of those skills and flaws on any actors that are targeted. As of now, this only applies to actors you have ownership over, so GMs will be the main beneficiaries, but everyone can apply boosts to themselves

Known Issues:
- Balanced Fighter is a little bit jank, if the effects aren't being properly applied, turn them off and on again until they look right
- There is not a built-in way to change character types (to flunkie, soldier, etc.). The best current workaround is to create an effect on the actor that overrides system.misc.type.value with the desired type. Note that the system spells flunkie with an 'ie' instead of a 'y'
- Number fields cannot be modified relatively, so inputting '-5' to the health field of the character sheet will set health to -5 instead of subtracting 5. This can be bypassed by using token bars for relative modifications
- Shift-clicking to apply skills/flaws still incurs costs of using a technique
- Changes to technique descriptions are not saved