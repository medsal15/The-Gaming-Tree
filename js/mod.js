/**
 * Where most of the basic configuration for the mod is.
 */
let modInfo = {
	/**
	 * The name of your mod.
	 */
	name: 'The Gaming Tree',
	/**
	 * The id for your mod, a unique string that is used to determine savefile location.
	 * Be sure to set it when you start making a mod, and don't change it later because it will erase all saves.
	 */
	id: 'thegamingtreev3',
	/**
	 * The name of the author, displayed in the info tab.
	 */
	author: 'medsal15',
	/**
	 * This changes what is displayed instead of "points" for the main currency.
	 */
	pointsName: 'points',
	/**
	 * An array of file addresses which will be loaded for this mod.
	 * Using smaller files makes it easier to find what you're looking for.
	 */
	modFiles: [
		'moreutils.js', 'tree.js',
		'layers/hotkeys.js',
		'layers/side/achievements.js', 'layers/side/clock.js', 'layers/side/casino.js', 'layers/side/magic.js',
		'layers/0/experience.js', 'layers/0/mining.js', 'layers/0/tree.js',
		'layers/1/level.js', 'layers/1/loot.js', 'layers/1/forge.js',
		'layers/2/boss.js', 'layers/2/shop.js',
	],
	/**
	 * If you have a Discord server or other discussion place, you can add a link to it.
	 *
	 * The text on the link.
	 */
	discordName: '',
	/**
	 * If you have a Discord server or other discussion place, you can add a link to it.
	 *
	 * The url of an invite.
	 * If you're using a Discord invite, please make sure it's set to never expire
	 */
	discordLink: '',
	/**
	 * The maximum amount of offline time that the player can accumulate, in hours.
	 * Any extra time is lost.
	 */
	offlineLimit: 12,  // In hours
	/**
	 * A Decimal for the amount of points a new player should start with.
	 */
	initialStartPoints: new Decimal(0), // Used for hard resets and new players
};

/**
 * Used to describe the current version of your mod
 */
let VERSION = {
	/**
	 * The mod's version number, displayed at the top right of the tree tab.
	 */
	num: 'R0.5',
	/**
	 * The version's name, displayed alongside the number in the info tab.
	 */
	name: 'Sloth',
};

/**
 * HTML displayed in the changelog tab
 */
let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.5</h3><br>
		- Added 1 new layer.<br>
		- Added the 3rd boss, miniboss, and relic.<br>
		- QoL: Keep shop upgrades on reset (not the investments though).<br>
		- Update endgame: Beat the 3rd boss.<br>
	<h3>v0.4</h3><br>
		- Added 4 new layers.<br>
		- Added the 2nd boss, 2nd miniboss, and 2nd relic.<br>
		- Rewrote the enemy color algorithm.<br>
		- Added an option to disable luck.<br>
		- Update endgame: Beat the 2nd boss.<br>
	<h3>v0.3</h3><br>
		- Added 2 new layers.<br>
		- Added a boss, miniboss and a relic.<br>
		- Update endgame: Beat the boss.<br>
	<h3>v0.2</h3><br>
		- Added Levels and Loot.<br>
		- Update endgame: 1000 slime kills.<br>
	<h3>v0.1</h3><br>
		- Added XP.<br>
		- Update endgame: 9th XP upgrades.`;

let winText = `Congratulations! You have finished the current content in the game. Look forward for more.`;

/**
 * Very important, if you are adding non-standard functions.
 * TMT calls every function anywhere in "layers" every tick to store the result, unless specifically told not to.
 * Functions that have are used to do an action need to be identified.
 * "Official" functions (those in the documentation) are all fine, but if you make any new ones, add their names to this array.
 *
 * ```js
 * // (The ones here are examples, all official functions are already taken care of)
 * var doNotCallTheseFunctionsEveryTick = ["doReset", "buy", "onPurchase", "blowUpEverything"]
 * ```
 */
var doNotCallTheseFunctionsEveryTick = ['show_skill', 'grid_to_item', 'get_drops', 'format_chance', 'type_name', 'can_drop', 'gain_drops', 'show_fuel', 'show_smelt', 'randomize'];

/**
 * A function to determine the amount of points the player starts with after a reset.
 *
 * @returns {Decimal}
 */
function getStartPoints() {
	return new Decimal(modInfo.initialStartPoints);
}

/**
 * A function returning a boolean for if points should be generated.
 * Use this if you want an upgrade to unlock generating points.
 *
 * @returns {Boolean}
 */
function canGenPoints() {
	return false;
}

/**
 * A function that calculates your points per second.
 * Anything that affects your point gain should go into the calculation here.
 *
 * @returns {Decimal}
 */
function getPointGen() {
	return new Decimal(0);
}

/**
 * A function that returns any non-layer-related data that you want to be added to the save data and "player" object.
 *
 * ```js
 * function addedPlayerData() { return {
 * 	weather: "Yes",
 * 	happiness: new Decimal(72),
 * }}
 * ```
 */
function addedPlayerData() {
	return {};
}

/**
 * An array of functions used to display extra things at the top of the tree tab.
 * Each function returns a string, which is a line to display (with basic HTML support).
 * If a function returns nothing, nothing is displayed (and it doesn't take up a line).
 *
 * @type {Computable<string>[]}
 */
var displayThings = [
	() => isEndgame() ? '<span style="color:#60C0F0">You are past endgame. Content may not be balanced.</span>' : '',
	() => {
		const id = activeChallenge('b');
		if (!id) return '';
		return `In boss challenge: ${layerColor('b', layers.b.challenges[id].name)}`;
	},
];

/**
 * A function to determine if the player has reached the end of the game, at which point the "you win!" screen appears.
 *
 * @returns {Boolean}
 */
function isEndgame() {
	return hasChallenge('b', 21);
}



// Less important things beyond this point!

/**
 * A CSS object containing the styling for the background of the full game. Can be a function!
 *
 * @type {Computable<CSSStyleObject>}
 */
var backgroundStyle = {}

// You can change this if you have things that can be messed up by long tick lengths
/**
 * Returns the maximum tick length, in milliseconds.
 * Only really useful if you have something that reduces over time,
 * which long ticks mess up (usually a challenge).
 *
 * @returns {Number}
 */
function maxTickLength() {
	return (3600); // Default is 1 hour which is just arbitrarily large
}

/**
 * Can be used to modify a save file when loading into a new version of the game.
 * Use this to undo inflation, never forcibly hard reset your players.
 *
 * @param {string} oldVersion
 */
function fixOldSave(oldVersion) {
	if (oldVersion <= 'R0.4') {
		player.xp.enemies = Object.fromEntries(
			Object.keys(player.xp.enemies)
				.map(type => [type, {
					health: new Decimal(player.xp.health[type]),
					kills: new Decimal(player.xp.kills[type]),
					last_drops: player.xp.last_drops[type] ?? [],
				}])
		);
		Object.entries(player.t.trees)
			.forEach(([tree, data]) => {
				data.health = tree == (player.t.current || !(tree in tmp.t.trees)) ? player.t.health : tmp.t.trees[tree].health;
				data.last_drops = tree == player.t.current ? player.t.last_drops : [];
			});
	}
}
