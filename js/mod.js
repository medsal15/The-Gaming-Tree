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
		'layers/automation.js', 'layers/achievements.js',
		'layers/experience.js', 'layers/ore.js',
		'layers/level.js', 'layers/loot.js',
		'layers/boss.js',

		'devtools.js',
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
	num: '0.3',
	/**
	 * The version's name, displayed alongside the number in the info tab.
	 */
	name: 'Wrath of the Slime King',
};

/**
 * HTML displayed in the changelog tab
 */
let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.3</h3><br>
		- Added Boss.<br>
		- Update endgame: Beat the boss<br>
	<h3>v0.2</h3><br>
		- Buff attack holding.<br>
		- Buff <span style="color:#7FBF7F">Kiting</span><br>
		- Added Levels and Loot.<br>
		- Update endgame: 1000 kills<br>
	<h3>v0.1.1</h3><br>
		- Fix memory error in experience with enemy color enabled.<br>
	<h3>v0.1</h3><br>
		- Added XP.<br>
		- Update endgame: 9 XP upgrades.`;

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`;

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
var doNotCallTheseFunctionsEveryTick = ['enemyColor', 'onKill', 'skill_row', 'itemId']

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
	() => {
		let id = player.b.activeChallenge;
		if (id === null) return '';

		return `In Boss challenge: ${layerColor('b', layers['b'].challenges[id].name)}`;
	},
];

/**
 * A function to determine if the player has reached the end of the game, at which point the "you win!" screen appears.
 *
 * @returns {Boolean}
 */
function isEndgame() {
	return hasChallenge('b', 11);
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
}
