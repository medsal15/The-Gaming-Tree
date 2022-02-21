// Exists for IDE purposes
// No function is actually implemented and the file is not loaded

/**
 * @template T
 * @typedef {T|() => T} CanBePredicate
 */

class Layer {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer,
     * so you can do `player[this.layer].points` or similar to access the saved value.
     * It makes copying code to new layers easier.
     * It is also assigned to all upgrades and buyables and such.
     *
     * @type {String}
     * @readonly
     */
    layer;
    /**
     * **optional**
     *
     * Used in reset confirmations (and the default infobox title). If absent, it just uses the layer's id.
     *
     * @type {CanBePredicate<String>}
     */
    name;
    /**
     * A function to return the default save data for this layer.
     * Add any variables you have to it.
     * Make sure to use `Decimal` values rather than normal numbers.
     *
     * @type {() => LayerData}
     */
    startData;
    /**
     * A color associated with this layer, used in many places.
     * (A string in hex format with a #)
     *
     * @type {CanBePredicate<String>}
     */
    color;
    /**
     * The row of the layer, starting at 0. This affects where the node appears on the standard tree, and which resets affect the layer.
     *
     * Using "side" instead of a number will cause the layer to appear off to the side as a smaller node (useful for achievements and statistics).
     * Side layers are not affected by resets unless you add a doReset to them.
     *
     * @type {Number|'side'}
     */
    row;
    /**
     * **OVERRIDE**
     *
     * Changes where the layer node appears without changing where it is in the reset order.
     *
     * @type {CanBePredicate<Number|'side'>}
     */
    displayRow;
    /**
     * Name of the main currency you gain by resetting on this layer.
     *
     * @type {String}
     */
    resource;
    /**
     * **optional**
     *
     * A function that calculates and returns the current values of any bonuses inherent to the main currency.
     * Can return a value or an object containing multiple values.
     * *You will also have to implement the effect where it is applied.*
     *
     * @type {() => any}
     */
    effect;
    /**
     * **optional**
     *
     * A function that returns a description of this effect.
     * If the text stays constant, it can just be a string.
     *
     * @type {CanBePredicate<String>}
     */
    effectDescription;
    /**
     * **optional**
     *
     * A function returning a bool which determines if this layer's node should be visible on the tree.
     * It can also return "ghost", which will hide the layer, but its node will still take up space in the tree.
     *
     * Defaults to true.
     *
     * @type {CanBePredicate<'ghost'|Boolean>}
     */
    layerShown;
    /**
     * **optional**
     *
     * An array containing information on any hotkeys associated with this layer.
     *
     * @type {Hotkey[]}
     */
    hotkeys;
    /**
     * **optional**
     *
     * A "CSS object" where the keys are CSS attributes,
     * containing any CSS that should affect this layer's entire tab.
     *
     * @type {CanBePredicate<{[key: String]: String}>}
     */
    style;
    /**
     * **optional**
     *
     * Use this if you want to add extra things to your tab or change the layout.
     *
     * @type {{[key: String]: SubTab}|TabFormat}
     */
    tabFormat;
    /**
     * **optional**
     *
     * An alternative to `tabFormat`, which is inserted in between Milestones and Buyables in the standard tab layout.
     * (cannot do subtabs)
     *
     * @type {{[key: String]: TabFormat}}
     */
    midsection;
    /**
     * A set of one-time purchases which can have unique upgrade conditions, currency costs, and bonuses.
     *
     * @type {{[key: Number]: Upgrade}}
     */
    upgrades;
    /**
     * A list of bonuses gained upon reaching certain thresholds of a resource. Often used for automation/QOL.
     *
     * @type {{[key: Number]: Milestone}}
     */
    milestones;
    /**
     * The player can enter challenges, which make the game harder.
     * If they reach a goal and beat the challenge, they recieve a bonus.
     *
     * @type {{[key: Number]: Challenge}}
     */
    challenges;
    /**
     * Effectively upgrades that can be bought multiple times, and are optionally respeccable. Many uses.
     *
     * @type {{
     *  [key: Number]: Buyable,
     *  respec?: () => void,
     *  respecText?: String,
     *  showRespec?: () => Boolean,
     *  respecMessage?: String,
     *  layer: String,
     * }}
     */
    buyables;
    /**
     * Extremely versatile and generalized buttons which can only be clicked sometimes.
     *
     * @type {{
     *  [key: Number]: Clickable,
     *  masterButtonPress: () => void,
     *  masterButtonText: String,
     *  showMasterButton: () => Boolean
     * }}
     */
    clickables;
    /**
     * An area that functions like a set of subtabs,
     * with buttons at the top changing the content within. (Advanced)
     *
     * @type {{[key: String]: TabFormat}}
     */
    microtabs;
    /**
     * Display some information as a progress bar, gague, or similar.
     * They are highly customizable, and can be vertical as well.
     *
     * @type {{[key: Number]: Bar}}
     */
    bars;
    /**
     * Kind of like milestones, but with a different display style and some other differences.
     * Extra features are on the way at a later date!
     *
     * @type {{[key: Number]: Achievement}}
     */
    achievements;
    /**
     * If false, disables popup message when you get the achievement.
     * True by default.
     *
     * @type {Boolean}
     */
    achievementPopups;
    /**
     * If false, disables popup message when you get the milestone.
     * True by default.
     *
     * @type {Boolean}
     */
    milestonePopups;
    /**
     * Displays some text in a box that can be shown or hidden.
     *
     * @type {{[key: Number]: InfoBox}}
     */
    infoboxes;
    /**
     * A grid of buttons that behave the same, but have their own data.
     *
     * @type {Grid}
     */
    grid;
    /**
     * **optional**
     * Determines which prestige formula you use.
     * Defaults to "none".
     *
     * - "normal": The amount of currency you gain is independent of its current amount (like Prestige).
     *      The formula before bonuses is based on `baseResource^exponent`
     * - "static": The cost is dependent on your total after reset. The formula before bonuses is based on `base^(x^exponent)`
     * - "custom": You can define everything, from the calculations to the text on the button, yourself.
     * - "none": This layer does not prestige, and therefore does not need any of the other prestige related features.
     *
     * @type {'normal'|'static'|'custom'|'none'}
     */
    type;
    /**
     * The name of the resource that determines how much of the main currency you gain on reset.
     *
     * @type {String}
     */
    baseResource;
    /**
     * A function that gets the current value of the base resource.
     *
     * @type {() => Decimal}
     */
    baseAmount;
    /**
     * A Decimal, the amount of the base needed to gain 1 of the prestige currency.
     * Also the amount required to unlock the layer.
     * You can instead make this a function, to make it harder if another layer was unlocked first (based on unlockOrder).
     *
     * @type {Decimal|() => Decimal}
     */
    requires;
    /**
     * Used as described in `type`.
     *
     * @type {Decimal}
     */
    exponent;
    /**
     * **required for "static" layers**
     *
     * Used as described in `type`.
     * If absent, defaults to 2. Must be greater than 1.
     *
     * @type {Decimal}
     */
    base;
    /**
     * **optional**
     *
     * A bool, which is true if the resource cost needs to be rounded up.
     * (use if the base resource is a "static" currency.)
     *
     * @type {Boolean}
     */
    roundUpCost;
    /**
     * **optional**
     *
     * For normal layers, this function calculate the multiplier on resource gain from upgrades and boosts and such.
     * Plug in most bonuses here.
     *
     * For static layers, they instead multiply the cost of the resource.
     * (So to make a boost you want to make gainMult smaller.)
     *
     * @type {() => Decimal}
     */
    gainMult;
    /**
     * **optional**
     *
     * For normal layers, this function calculate the exponent on resource gain from upgrades and boosts and such.
     * Plug in most bonuses here.
     *
     * For static layers, they instead root the cost of the resource.
     * (So to make a boost you want to make gainExp larger.)
     *
     * @type {() => Decimal}
     */
    gainExp;
    /**
     * **optional**
     *
     * Directly multiplies the resource gain, after exponents and softcaps.
     * For static layers, actually multiplies resource gain instead of reducing the cost.
     *
     * @type {Decimal}
     */
    directMult;
    /**
     * **optional**
     *
     * For normal layers, gain beyond `softcap` points is put to the `softcapPower`th power
     *
     * Default for softcap is e1e7, and for power is 0.5.
     *
     * @type {Decimal}
     */
    softcap;
    /**
     * **optional**
     *
     * For normal layers, gain beyond `softcap` points is put to the `softcapPower`th power
     *
     * Default for softcap is e1e7, and for power is 0.5.
     *
     * @type {Decimal}
     */
    softcapPower;
    /**
     * **required for static layers**
     *
     * Function used to determine if buying max is permitted.
     *
     * @type {() => Boolean}
     */
    canBuyMax;
    /**
     * **optional**
     *
     * A function that triggers when this layer prestiges,
     * just before you gain the currency.
     * Can be used to have secondary resource gain on prestige,
     * or to recalculate things or whatnot.
     *
     * @type {(gain: Decimal) => void}
     */
    onPrestige(gain) {};
    /**
     * **optional**
     *
     * Use this to replace "Reset for " on the Prestige button with something else.
     *
     * @type {String}
     */
    resetDescription;
    /**
     * **required for custom layers**
     *
     * Use this to make the entirety of the text a Prestige button contains.
     * Only required for custom layers, but usable by all types.
     *
     * @type {() => String}
     */
    prestigeButtonText;
    /**
     * **optional**
     *
     * Returns a regular number.
     * You automatically generate your gain times this number every second
     * (does nothing if absent)
     *
     * This is good for automating Normal layers.
     *
     * @type {() => (Number)}
     */
    passiveGeneration;
    /**
     * **optional**
     *
     * Returns a boolean,
     * if true, the layer will always automatically do a prestige if it can.
     *
     * This is good for automating Static layers.
     *
     * @type {() => Boolean}
     */
    autoPrestige;
    /**
     * **optional**
     *
     * The text that appears on this layer's node.
     * Default is the layer id with the first letter capitalized.
     *
     * @type {String}
     */
    symbol;
    /**
     * **override**
     *
     * The url (local or global) of an image that goes on the node.
     * (Overrides symbol)
     *
     * @type {String}
     */
    image;
    /**
     * **optional**
     *
     * Determines the horizontal position of the layer in its row in a standard tree.
     * By default, it uses the layer id, and layers are sorted in alphabetical order.
     *
     * @type {String|Number}
     */
    position;
    /**
     * **optional**
     *
     * An array of layer/node ids.
     * On a tree, a line will appear from this layer to all of the layers in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the layer id and a color value.
     * The color value can either be a string with a hex color code,
     * or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     *
     * @type {[String, (String|Number), Number][]}
     */
    branches;
    /**
     * **optional**
     *
     * A CSS object, where the keys are CSS attributes,
     * which styles this layer's node on the tree.
     *
     * @type {{[key: String]: String}}
     */
    nodeStyle;
    /**
     * **optional**
     *
     * Function that return text, which is the tooltip for the node when the layer is unlocked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     *
     * If the value is "", the tooltip will be disabled.
     *
     * @type {() => String}
     */
    tooltip;
    /**
     * **optional**
     *
     * Function that return text, which is the tooltip for the node when the layer is locked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     *
     * If the value is "", the tooltip will be disabled.
     *
     * @type {() => String}
     */
    tooltipLocked;
    /**
     * **optional**
     *
     * Adds a mark to the corner of the node.
     * If it's "true" it will be a star, but it can also be an image URL.
     *
     * @type {Boolean|String}
     */
    marked;
    /**
     * **optional**
     *
     * Is triggered when a layer on a row greater than or equal to this one does a reset.
     * The default behavior is to reset everything on the row, but only if it was triggered by a layer in a higher row.
     * `doReset` is always called for side layers, but for these the default behavior is to reset nothing.
     *
     * @type {(resettingLayer: String) => void}
     */
    doReset(resettingLayer) {};
    /**
     * **optional**
     *
     * This function is called every game tick.
     * Use it for any passive resource production or time-based things.
     * `diff` is the time since the last tick.
     *
     * @param {Number} diff time in seconds
     */
    update(diff) {};
    /**
     * **optional**
     *
     * A boolean value, if true, the game will attempt to buy this layer's upgrades every tick.
     * Defaults to false.
     *
     * @type {Boolean}
     */
    autoUpgrade;
    /**
     * **optional**
     *
     * This function is called every game tick, after production.
     * Use it to activate automation things that aren't otherwise supported.
     *
     * @type {() => void}
     */
    automate;
    /**
     * **optional**
     *
     * Returns true if this layer shouldn't trigger any resets when you prestige.
     *
     * @type {Boolean}
     */
    resetsNothing;
    /**
     * **optional**
     *
     * An array of layer ids. When this layer is unlocked for the first time,
     * the `unlockOrder` value for any not-yet-unlocked layers in this list increases.
     * This can be used to make them harder to unlock.
     *
     * @type {String[]}
     */
    increaseUnlockOrder;
    /**
     * **optional**
     *
     * A function to return true if this layer should be highlighted in the tree.
     * The layer will automatically be highlighted if you can buy an upgrade whether you have this or not.
     *
     * @type {() => Boolean}
     */
    shouldNotify;
    /**
     * **optional**
     *
     * The color that this layer will be highlighted if it should notify.
     * The default is red.
     * You can use this if you want several different notification types!
     *
     * @type {String}
     */
    glowColor;
    /**
     * **optional**
     *
     * An object that contains a set of functions returning CSS objects.
     * Each of these will be applied to any components on the layer with the type of its id.
     *
     * @type {{
     *  [key: String]: () => {{[key: String]: String}}
     * }}
     */
    componentStyles;
    /**
     * **optional**
     *
     * If true, this layer will use the left tab instead of the right tab.
     *
     * @type {Boolean}
     */
    leftTab;
    /**
     * **optional**
     *
     * A layer's id. If a layer has a previousTab,
     * the layer will always have a back arrow and pressing the back arrow on this layer will take you to the layer with this id.
     *
     * @type {String}
     */
    previousTab;
    /**
     * **optional**
     *
     * If this is true, hasUpgrade, hasChallenge, hasAchievement, and hasMilestone will return false for things in the layer,
     * and you will be unable to buy or click things, or gain achievements/milestones on the layer.
     * You will have to disable effects of buyables, the innate layer effect, and possibly other things yourself.
     *
     * @type {Boolean}
     */
    deactivated;
    /**
     * **mostly for custom prestige type**
     *
     * Returns how many points you should get if you reset now.
     * You can call `getResetGain(this.layer, useType = "static")`
     * or similar to calculate what your gain would be under another prestige type
     * (provided you have all of the required features in the layer).
     *
     * @type {() => Decimal}
     */
    getResetGain;
    /**
     * **mostly for custom prestige type**
     *
     * Returns how many of the base currency you need to get to the next point.
     * `canMax` is an optional variable used with Static-ish layers to
     * differentiate between if it's looking for the first point you can reset at,
     * or the requirement for any gain at all (Supporting both is good).
     * You can also call `getNextAt(this.layer, canMax=false, useType = "static")`
     * or similar to calculate what your next at would be under another prestige type
     * (provided you have all of the required features in the layer).
     *
     * @type {(canMax?: Boolean) => Decimal}
     */
    getNextAt(canMax=false) {};
    /**
     * **mostly for custom prestige type**
     *
     * Return true only if you have the resources required to do a prestige here.
     *
     * @type {() => Boolean}
     */
    canReset;
    /**
     * **mostly for custom prestige types**
     *
     * Returns true if this layer should be subtly highlighted to indicate you can prestige for a meaningful gain.
     *
     * @type {() => Boolean}
     */
    prestigeNotify;
}

class LayerData {
    /**
     * A bool determining if this layer is unlocked or not
     *
     * @type {Boolean}
     */
    unlocked;
    /**
     * A Decimal, the main currency for the layer
     *
     * @type {Decimal}
     */
    points;
    /**
     * A Decimal, tracks total amount of main prestige currency.
     * Always tracked, but only shown if you add it here.
     *
     * @type {Decimal}
     */
    total;
    /**
     * A Decimal, tracks highest amount of main prestige currency.
     * Always tracked, but only shown if you add it here.
     *
     * @type {Decimal}
     */
    best;
    /**
     * Used to keep track of relevant layers unlocked before this one.
     *
     * @type {Number}
     */
    unlockOrder;
    /**
     * A number, time since this layer was last prestiged (or reset by another layer)
     *
     * @type {Number}
     */
    resetTime;
    /**
     * @type {number[]}
     */
    upgrades;
    /**
     * @type {Decimal}
     */
    buyables;
};

class Hotkey {
    /**
     * What the hotkey button is.
     * Use uppercase if it's combined with shift,
     * or "ctrl+x" for holding down ctrl.
     *
     * @type {String}
     */
    key;
    /**
     * The description of the hotkey that is displayed in the game's How To Play tab
     *
     * @type {String}
     */
    description;
    /**
     * @type {() => void}
     */
    onPress;
    /**
     * Determines if you can use the hotkey, optional
     *
     * @type {() => Boolean}
     */
    unlocked;
};

/**
 * @typedef {[
 *  ['display-text', String|() => String]|
 *  ['display-image', String]|
 *  'h-line'|'v-line'|
 *  ['raw-html', String|() => String]|
 *  'blank', ['blank', String, String]|
 *  ['row', ...any]|['column', ...any]|
 *  'main-display'|['main-display', Number]|
 *  'resource-display'|'prestige-button'|
 *  ['text-input', String]|
 *  ['slider', [String, Number, Number]]|
 *  ['drop-down', [String, String[]]]|
 *  'upgrades'|['upgrades', Number]|
 *  'milestones'|['milestones', Number]|
 *  'challenges'|['challenges', Number]|
 *  'achievements'|['achievements', Number]|
 *  'buyables'|['buyables', Number]|
 *  'clickables'|['clickables', Number]|
 *  ['microtabs', String]|
 *  ['bar', Number]|
 *  ['infobox', Number]|
 *  ['tree', String[][]]|
 *  ['upgrade-tree', String[][]]|
 *  ['buyable-tree', String[][]]|
 *  ['clickable-tree', String[][]]|
 *  ['toggle', [String, Number]]|
 *  'grid'|['grid', String]|
 *  ['layer-proxy', [String, String[]]]|
 *  ['upgrade', Number]|
 *  ['milestone', Number]|
 *  ['challenge', Number]|
 *  ['buyable', Number]|
 *  ['clickable', Number]|
 *  ['achievement', Number]|
 *  ['gridable', Number]|
 *  'respec-button'|'master-button'|
 *  'sell-one'|['sell-one', Number]|
 *  'sell-all'|['sell-all', Number]
 * ][]} TabFormat
 */

class SubTab {
    /**
     * The tab layout code for the subtab, in the tab layout format
     *
     * @type {TabFormat}
     */
    content;
    /**
     * **optional**
     *
     * Applies CSS to the whole subtab when switched to, in the form of an "CSS Object",
     * where the keys are CSS attributes, and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    style;
    /**
     * **optional**
     *
     * A CSS object, which affects the appearance of the button for that subtab.
     *
     * @type {{[key: String]: String}}
     */
    buttonStyle;
    /**
     * **optional**
     *
     * A function to determine if the button for this subtab should be visible.
     * By default, a subtab is always unlocked. You can't use the "this" keyword in this function.
     *
     * @type {() => Boolean}
     */
    unlocked;
    /**
     * **optional**
     *
     * If true, the tab button will be highlighted to notify the player that there is something there.
     *
     * @type {() => Boolean}
     */
    shouldNotify;
    /**
     * **optional**
     *
     * If true, the tab button will be highlighted to notify the player that there is something there.
     *
     * @type {() => Boolean}
     */
    prestigeNotify;
    /**
     * **optional**
     *
     * Specifies the color that the subtab glows. If this subtab is causing the main layer to node glow
     * (and it would't otherwise) the node also glows this color. Is NOT overridden by embedding a layer.
     *
     * @type {String}
     */
    glowColor;
    /**
     * **SIGNIFICANT**
     *
     * The id of another layer. If you have this,
     * it will override "content", "style" and "shouldNotify",
     * instead displaying the entire layer in the subtab.
     *
     * @type {String}
     */
    embedLayer;
};

/** @template T */
class Upgrade {
    /**
     * **optional**
     *
     * Displayed at the top in a larger font.
     * It can also be a function that returns updating text.
     * Can use basic HTML.
     *
     * @type {String|() => String}
     */
    title;
    /**
     * A description of the upgrade's effect.
     * *You will also have to implement the effect where it is applied.*
     * It can also be a function that returns updating text. Can use basic HTML.
     *
     * @type {String|() => String}
     */
    description;
    /**
     * **optional**
     *
     * A function that calculates and returns the current values of any bonuses from the upgrade.
     * Can return a value or an object containing multiple values.
     *
     * @type {() => any}
     */
    effect;
    /**
     * **optional**
     *
     * A function that returns a display of the current effects of the upgrade with formatting.
     * Default displays nothing. Can use basic HTML.
     *
     * @type {() => String}
     */
    effectDisplay;
    /**
     * **OVERRIDE**
     *
     * Overrides the other displays and descriptions,
     * and lets you set the full text for the upgrade.
     * Can use basic HTML.
     *
     * @type {() => String}
     */
    fullDisplay;
    /**
     * **sort of optional**
     *
     * A Decimal for the cost of the upgrade.
     * By default, upgrades cost the main prestige currency for the layer.
     *
     * @type {Decimal}
     */
    cost;
    /**
     * **optional**
     *
     * A function returning a bool to determine if the upgrade is visible or not. Default is unlocked.
     *
     * @type {() => Boolean}
     */
    unlocked;
    /**
     * **optional**
     *
     * This function will be called when the upgrade is purchased.
     * Good for upgrades like "makes this layer act like it was unlocked first".
     *
     * @type {() => void}
     */
    onPurchase;
    /**
     * **optional**
     *
     * Applies CSS to this upgrade, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    style;
    /**
     * **optional**
     *
     * Adds a tooltip to this upgrade, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     *
     * @type {String|() => String}
     */
    tooltip;
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer,
     * so you can do `player[this.layer].points` or similar.
     *
     * @type {String}
     * @readonly
     */
    layer;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the upgrade was stored under,
     * for convenient access.
     *
     * @type {Number}
     * @readonly
     */
    id;
    /**
     * **optional**
     *
     * The name to display for the currency for the upgrade.
     *
     * @type {String}
     */
    currencyDisplayName;
    /**
     * **optional**
     *
     * The internal name for that currency.
     *
     * @type {keyof T}
     */
    currencyInternalName;
    /**
     * **optional**
     *
     * The internal name of the layer that currency is stored in.
     * If it's not in a layer (like Points), omit.
     * If it's not stored directly in a layer, instead use `currencyLocation`.
     *
     * @type {String}
     */
    currencyLayer;
    /**
     * **optional**
     *
     * If your currency is stored in something inside a layer
     * (e.g. a buyable's amount), you can access it this way.
     * This is a function returning the object in "player" that contains the value (like `player[this.layer].buyables`)
     *
     * @type {() => T}
     */
    currencyLocation;
    /**
     * **OVERRIDE**
     *
     * A function determining if you are able to buy the upgrade.
     * (If you also have a cost, it will check both the cost and this function)
     *
     * @type {() => Boolean}
     */
    canAfford;
    /**
     * **OVERRIDE**
     *
     * A function that reduces your currencies when you buy the upgrade
     *
     * @type {() => void}
     */
    pay;
    /**
     * **optional**
     *
     * This is primarially useful for upgrade trees. An array of upgrade ids.
     * A line will appear from this upgrade to all of the upgrades in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the upgrade id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     *
     * @type {[Number, (String|Number), Number][]}
     */
    branches;
};

class Milestone {
    /**
     * A string describing the requirement for unlocking this milestone.
     * Suggestion: Use a "total".
     * It can also be a function that returns updating text. Can use basic HTML.
     *
     * @type {String}
     */
    requirementDescription;
    /**
     * A string describing the reward for having the milestone.
     * *You will have to implement the reward elsewhere.*
     * It can also be a function that returns updating text. Can use basic HTML.
     *
     * @type {String|() => String}
     */
    effectDescription;
    /**
     * A function returning a boolean to determine if the milestone should be awarded.
     *
     * @type {() => Boolean}
     */
    done;
    /**
     * **optional**
     *
     * This function will be called when the milestone is completed.
     *
     * @type {() => void}
     */
    onComplete;
    /**
     * **optional**
     *
     * Creates toggle buttons that appear on the milestone when it is unlocked.
     * The toggles can toggle a given boolean value in a layer.
     * It is defined as an array of paired items, one pair per toggle.
     * The first is the internal name of the layer the value being toggled is stored in,
     * and the second is the internal name of the variable to toggle. (e.g. [["b", "auto"], ["g", "auto"])
     *
     * **Tip:** Toggles are not de-set if the milestone becomes locked!
     * In this case, you should also check if the player has the milestone.
     *
     * @type {[String, String][]}
     */
    toggles;
    /**
     * **optional**
     *
     * Applies CSS to this milestone, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    style;
    /**
     * **optional**
     *
     * A function returning a boolean to determine if the milestone should be shown.
     * If absent, it is always shown.
     *
     * @type {() => Boolean}
     */
    unlocked;
    /**
     * **optional**
     *
     * Adds a tooltip to this milestone, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     *
     * @type {String|() => String}
     */
    tooltip;
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer,
     * so you can do `player[this.layer].points` or similar.
     *
     * @type {String}
     * @readonly
     */
    layer;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the milestone was stored under,
     * for convenient access.
     *
     * @type {Number}
     * @readonly
     */
    id;
};

class Challenge {
    /**
     * Name of the challenge, can be a string or a function. Can use basic HTML.
     *
     * @type {String|() => String}
     */
    name;
    /**
     * A description of what makes the challenge a challenge.
     * *You will need to implement these elsewhere.*
     * It can also be a function that returns updating text. Can use basic HTML.
     *
     * @type {String|() => String}
     */
    challengeDescription;
    /**
     * A description of the win condition for the challenge.
     * It can also be a function that returns updating text.
     * Can use basic HTML.
     *
     * @type {String|() => String}
     */
    goalDescription;
    /**
     * A function that returns true if you meet the win condition for the challenge.
     * Returning a number will allow bulk completing the challenge.
     *
     * @type {() => (Boolean|Number)}
     */
    canComplete;
    /**
     * A description of the reward's effect.
     * *You will also have to implement the effect where it is applied.*
     * It can also be a function that returns updating text. Can use basic HTML.
     *
     * @type {String|() => String}
     */
    rewardDescription;
    /**
     * **optional**
     *
     * A function that calculates and returns the current values of any bonuses from the reward.
     * Can return a value or an object containing multiple values.
     *
     * @type {() => any}
     */
    rewardEffect;
    /**
     * **optional**
     *
     * A function that returns a display of the current effects of the reward with formatting.
     * Default behavior is to just display the a number appropriately formatted. Can use basic HTML.
     *
     * @type {() => String}
     */
    rewardDisplay;
    /**
     * **OVERRIDE**
     *
     * Overrides the other displays and descriptions,
     * and lets you set the full text for the challenge. Can use basic HTML.
     *
     * @type {() => String}
     */
    fullDisplay;
    /**
     * **optional**
     *
     * A function returning a bool to determine if the challenge is visible or not. Default is unlocked.
     *
     * @type {() => Boolean}
     */
    unlocked;
    /**
     * **optional**
     *
     * This function will be called when the challenge is completed when previously incomplete.
     *
     * @type {() => void}
     */
    onComplete;
    /**
     * **optional**
     *
     * This function will be called when entering the challenge
     *
     * @type {() => void}
     */
    onEnter;
    /**
     * **optional**
     *
     * This function will be called when exiting the challenge in any way
     *
     * @type {() => void}
     */
    onExit;
    /**
     * **optional**
     *
     * If a challenge combines the effects of other challenges in this layer, you can use this.
     * An array of challenge ids. The player is effectively in all of those challenges when in the current one.
     *
     * @type {String[]}
     */
    countsAs;
    /**
     * **optional**
     *
     * The amount of times you can complete this challenge. Default is 1 completion.
     *
     * @type {Number}
     */
    completionLimit;
    /**
     * **optional**
     *
     * Applies CSS to this challenge, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    style;
    /**
     * **optional**
     *
     * Adds a mark to the corner of the challenge.
     * If it's "true" it will be a star, but it can also be an image URL.
     * By default, if the challenge has multiple completions, it will be starred at max completions.
     *
     * @type {Boolean|String}
     */
    marked;
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer,
     * so you can do `player[this.layer].points` or similar.
     *
     * @type {String}
     * @readonly
     */
    layer;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the challenge was stored under,
     * for convenient access.
     *
     * @type {Number}
     * @readonly
     */
    id;
};

class Buyable {
    /**
     * **optional**
     *
     * Displayed at the top in a larger font. It can also be a function that returns updating text.
     *
     * @type {String|() => String}
     */
    title;
    /**
     * Cost for buying the next buyable.
     * Can have an optional argument "x" to calculate the cost of the x+1th purchase. (x is a `Decimal`).
     * Can return an object if there are multiple currencies.
     *
     * @type {(x?: Decimal) => (Decimal|{[key: String]: Decimal})}
     */
    cost;
    /**
     * **optional**
     *
     * A function that calculates and returns the current values of bonuses of this buyable.
     * Can have an optional argument "x" to calculate the effect of having x of the buyable.
     * Can return a value or an object containing multiple values.
     *
     * @type {(x?: Decimal) => any}
     */
    effect;
    /**
     * A function returning everything that should be displayed on the buyable after the title,
     * likely including the description, amount bought, cost, and current effect. Can use basic HTML.
     *
     * @type {() => String}
     */
    display;
    /**
     * **optional**
     *
     * A function returning a bool to determine if the buyable is visible or not. Default is unlocked.
     *
     * @type {() => Boolean}
     */
    unlocked;
    /**
     * A function returning a bool to determine if you can buy one of the buyables.
     *
     * @type {() => Boolean}
     */
    canAfford;
    /**
     * A function that implements buying one of the buyable, including spending the currency.
     *
     * @type {() => void}
     */
    buy;
    /**
     * **optional**
     *
     * A function that implements buying as many of the buyable as possible.
     *
     * @type {() => void}
     */
    buyMax;
    /**
     * **optional**
     *
     * Applies CSS to this buyable, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    style;
    /**
     * **optional**
     *
     * The limit on how many of the buyable can be bought. The default is no limit.
     *
     * @type {Decimal}
     */
    purchaseLimit;
    /**
     * **optional**
     *
     * Adds a mark to the corner of the buyable.
     * If it's "true" it will be a star, but it can also be an image URL.
     *
     * @type {Boolean|String}
     */
    marked;
    /**
     * **optional**
     *
     * Adds a tooltip to this buyable, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     *
     * @type {String}
     */
    tooltip;
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer,
     * so you can do `player[this.layer].points` or similar.
     *
     * @type {String}
     * @readonly
     */
    layer;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the buyable was stored under,
     * for convenient access.
     *
     * @type {Number}
     * @readonly
     */
    id;
    /**
     * **optional**
     *
     * Called when the button is pressed.
     * The standard use would be to decrease the amount of the buyable,
     * and possibly return some currency to the player.
     *
     * @type {() => void}
     */
    sellOne;
    /**
     * **optional**
     *
     * Called when the button is pressed.
     * The standard use would be to reset the amount of the buyable,
     * and possibly return some currency to the player.
     *
     * @type {() => void}
     */
    sellAll;
    /**
     * **optional**
     *
     * Booleans determining whether or not to show the buttons.
     * If "canSellOne" is absent but "sellOne" is present,
     * the button will always show.
     *
     * @type {Boolean}
     */
    canSellOne;
    /**
     * **optional**
     *
     * Booleans determining whether or not to show the buttons.
     * If "canSellAll" is absent but "sellAll" is present,
     * the button will always show.
     *
     * @type {Boolean}
     */
    canSellAll;
    /**
     * **optional**
     *
     * This is primarially useful for buyable trees. An array of buyable ids.
     * A line will appear from this buyable to all of the buyables in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the buyable id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     *
     * @type {[Number, (String|Number), Number][]}
     */
    branches;
};

class Clickable {
    /**
     * **optional**
     *
     * Displayed at the top in a larger font. It can also be a function that returns updating text.
     *
     * @type {String|() => String}
     */
    title;
    /**
     * **optional**
     *
     * A function that calculates and returns the current values of bonuses of this clickable.
     * Can return a value or an object containing multiple values.
     *
     * @type {() => any}
     */
    effect;
    /**
     * A function returning everything that should be displayed on the clickable after the title,
     * likely changing based on its state. Can use basic HTML.
     *
     * @type {() => String}
     */
    display;
    /**
     * **optional**
     *
     * A function returning a bool to determine if the clickable is visible or not. Default is unlocked.
     *
     * @type {() => Boolean}
     */
    unlocked;
    /**
     * A function returning a bool to determine if you can click the clickable.
     *
     * @type {() => Boolean}
     */
    canClick;
    /**
     * A function that implements clicking the clickable.
     *
     * @type {() => void}
     */
    onClick;
    /**
     * **optional**
     *
     * A function that is called 20x/sec when the button is held for at least 0.25 seconds.
     *
     * @type {() => void}
     */
    onHold;
    /**
     * **optional**
     *
     * Applies CSS to this clickable, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    style;
    /**
     * **optional**
     *
     * Adds a mark to the corner of the clickable. If it's "true" it will be a star, but it can also be an image URL.
     *
     * @type {Boolean|String}
     */
    marked;
    /**
     * **optional**
     *
     * Adds a tooltip to this clickable, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     *
     * @type {String}
     */
    tooltip;
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer,
     * so you can do `player[this.layer].points` or similar.
     *
     * @type {String}
     * @readonly
     */
    layer;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the clickable was stored under,
     * for convenient access.
     *
     * @type {Number}
     * @readonly
     */
    id;
    /**
     * **optional**
     *
     * This is primarially useful for clickable trees. An array of clickable ids.
     * A line will appear from this clickable to all of the clickables in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the clickable id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     *
     * @type {[Number, (String|Number), Number][]}
     */
    branches;
};

class Bar {
    /**
     * Determines the direction that the bar is filled as it progresses. RIGHT means from left to right.
     *
     * @type {UP|DOWN|LEFT|RIGHT}
     */
    direction;
    /**
     * The size in pixels of the bar, but as numbers (no "px" at the end).
     *
     * @type {Number}
     */
    width;
    /**
     * The size in pixels of the bar, but as numbers (no "px" at the end).
     *
     * @type {Number}
     */
    height;
    /**
     * A function that returns the portion of the bar that is filled, from "empty" at 0 to "full" at 1, updating automatically.
     *
     * (Nothing bad happens if the value goes out of these bounds)
     *
     * @type {() => (Number|Decimal)}
     */
    progress;
    /**
     * **optional**
     *
     * A function that returns text to be displayed on top of the bar, can use HTML.
     *
     * @type {() => String}
     */
    display;
    /**
     * **optional**
     *
     * A function returning a bool to determine if the bar is visible or not. Default is unlocked.
     *
     * @type {() => Boolean}
     */
    unlocked;
    /**
     * **Optional**
     *
     * Apply CSS to the unfilled portion on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    baseStyle;
    /**
     * **Optional**
     *
     * Apply CSS to the filled portion on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    fillStyle;
    /**
     * **Optional**
     *
     * Apply CSS to the border of the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    borderStyle;
    /**
     * **Optional**
     *
     * Apply CSS to the display text on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    textStyle;
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer,
     * so you can do `player[this.layer].points` or similar.
     *
     * @type {String}
     * @readonly
     */
    layer;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the bar was stored under,
     * for convenient access.
     *
     * @type {Number}
     * @readonly
     */
    id;
    /**
     * **very optional**
     *
     * If this is true, the bar will instantly snap to the current value instead of animating in between.
     * Good for things involving precise timing.
     *
     * @type {Boolean}
     */
    instant;
};

class Achievement {
    /**
     * **optional**
     *
     * Displayed at the top of the achievement. The only visible text.
     * It can also be a function that returns updating text. Can use basic HTML.
     *
     * @type {String|() => String}
     */
    name;
    /**
     * A function returning a boolean to determine if the achievement should be awarded.
     *
     * @type {() => Boolean}
     */
    done;
    /**
     * Default tooltip for the achievement, appears when it is hovered over.
     * Should convey the goal and any reward for completing the achievement.
     * It can also be a function that returns updating text.
     * Can use basic HTML. Setting this to "" disables the tooltip.
     *
     * @type {String|() => String}
     */
    tooltip;
    /**
     * **optional**
     *
     * A function that calculates and returns the current values of any bonuses from the achievement.
     * Can return a value or an object containing multiple values.
     *
     * @type {() => any}
     */
    effect;
    /**
     * **optional**
     *
     * A function returning a bool to determine if the achievement is visible or not. Default is unlocked.
     *
     * @type {() => Boolean}
     */
    unlocked;
    /**
     * **optional**
     *
     * This function will be called when the achievement is completed.
     *
     * @type {() => void}
     */
    onComplete;
    /**
     * **optional**
     *
     * Puts the image from the given URL (relative or absolute) in the achievement
     *
     * @type {String}
     */
    image;
    /**
     * **optional**
     *
     * Applies CSS to this achievement, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    style;
    /**
     * **optional**
     *
     * Applies CSS to the text, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    textStyle;
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer,
     * so you can do `player[this.layer].points` or similar.
     *
     * @type {String}
     * @readonly
     */
    layer;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the achievement was stored under,
     * for convenient access.
     *
     * @type {Number}
     * @readonly
     */
    id;
};

class InfoBox {
    /**
     * The text displayed above the main box.
     * Can be a function to be dynamic, and can use basic HTML.
     *
     * @type {String|() => String}
     */
    title;
    /**
     * The text displayed inside the box. Can be a function to be dynamic, and can use basic HTML.
     *
     * @type {String|() => String}
     */
    body;
    /**
     * **optional**
     *
     * Applies CSS to the infobox, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    style;
    /**
     * **optional**
     *
     * Applies CSS to the title button of the infobox, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    titleStyle;
    /**
     * **optional**
     *
     * Applies CSS to the body of the infobox, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {{[key: String]: String}}
     */
    bodyStyle;
    /**
     * **optional**
     *
     * A function returning a bool to determine if the infobox is visible or not. Default is unlocked.
     *
     * @type {() => Boolean}
     */
    unlocked;
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer,
     * so you can do `player[this.layer].points` or similar.
     *
     * @type {String}
     * @readonly
     */
    layer;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the infobox was stored under,
     * for convenient access.
     *
     * @type {Number}
     * @readonly
     */
    id;
};

class Grid {
    /**
     * The amount of rows of gridable to display.
     *
     * @type {Number}
     */
    rows;
    /**
     * The amount of columns of gridable to display.
     *
     * @type {Number}
     */
    cols;
    /**
     * **sometimes needed**
     *
     * If rows are dynamic, you need to define the maximum amount that there can be
     * (you can increase it when you update the game though). These CANNOT be dynamic.
     *
     * @type {Number}
     */
    maxRows;
    /**
     * **sometimes needed**
     *
     * If cols are dynamic, you need to define the maximum amount that there can be
     * (you can increase it when you update the game though). These CANNOT be dynamic.
     *
     * @type {Number}
     */
    maxCols;
    /**
     * Creates the default data for the gridable at this position. This can be an object, or a regular value.
     *
     * @type {(id: Number) => any}
     */
    getStartData;
    /**
     * **optional**
     *
     * Returns true if the gridable at this position should be visible.
     *
     * @type {(id: Number) => Boolean}
     */
    getUnlocked;
    /**
     * **optional**
     *
     * Returns text that should displayed at the top in a larger font,
     * based on the position and data of the gridable.
     *
     * @type {(data: any, id: Number) => String}
     */
    getTitle;
    /**
     * **optional**
     *
     * Returns everything that should be displayed on the gridable after the title,
     * based on the position and data of the gridable.
     *
     * @type {(data: any, id: Number) => String}
     */
    getDisplay;
    /**
     * **optional**
     *
     * Returns CSS to apply to this gridable, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     *
     * @type {(data: any, id: Number) => {[key: String]: String}}
     */
    getStyle;
    /**
     * **optional**
     *
     * A function returning a bool to determine if you can click a gridable,
     * based on its data and position. If absent, you can always click it.
     *
     * @type {(data: any, id: Number) => Boolean}
     */
    getCanClick;
    /**
     * A function that implements clicking on the gridable, based on its position and data.
     *
     * @type {(data: any, id: Number) => void}
     */
    onClick;
    /**
     * **optional**
     *
     * A function that is called 20x/sec when the button is held for at least 0.25 seconds.
     *
     * @type {(data: any, id: Number) => void}
     */
    onHold;
    /**
     * **optional**
     *
     * A function that calculates and returns a gridable's effect,
     * based on its position and data. (Whatever that means for a gridable)
     *
     * @type {(data: any, id: Number) => any}
     */
    getEffect;
    /**
     * **optional**
     *
     * Adds a tooltip to the gridables, appears when they hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     *
     * @type {(data: any, id: Number) => String}
     */
    getTooltip;
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer,
     * so you can do `player[this.layer].points` or similar.
     *
     * @type {String}
     * @readonly
     */
    layer;
};
