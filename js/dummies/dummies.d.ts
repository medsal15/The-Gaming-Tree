type CompareResult = -1 | 0 | 1;
type DecimalSource = string | number | Decimal;
type Computable<T> = T | (() => T);
type Computed<T> = T extends (...args) => any ? ReturnType<T> : T;
type CSSStyles = { [k in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[k] }

declare class Decimal {
    //#region Constants
    static readonly dZero: Decimal;
    static readonly dOne: Decimal;
    static readonly dNegOne: Decimal;
    static readonly dTwo: Decimal;
    static readonly dTen: Decimal;
    static readonly dNaN: Decimal;
    static readonly dInf: Decimal;
    static readonly dNegInf: Decimal;
    static readonly dNumberMax: Decimal;
    static readonly dNumberMin: Decimal;
    //#endregion Constants

    //#region Static functions
    static fromComponents(sign: number, layer: number, mag: number): Decimal
    static fromComponents_noNormalize(sign: number, layer: number, mag: number): Decimal
    static fromMantissaExponent(mantissa: number, exponent: number): Decimal
    static fromMantissaExponent_noNormalize(mantissa: number, exponent: number): Decimal
    static fromDecimal(value: Decimal): Decimal
    static fromNumber(value: number): Decimal
    static fromString(value: string): Decimal
    static fromValue(value: DecimalSource): Decimal
    static fromValue_noAlloc(value: DecimalSource): Decimal
    static abs(value: DecimalSource): Decimal
    static neg(value: DecimalSource): Decimal
    static negate(value: DecimalSource): Decimal
    static negated(value: DecimalSource): Decimal
    static sign(value: DecimalSource): number
    static sgn(value: DecimalSource): number
    static round(value: DecimalSource): Decimal
    static floor(value: DecimalSource): Decimal
    static ceil(value: DecimalSource): Decimal
    static trunc(value: DecimalSource): Decimal
    static add(value: DecimalSource, other: DecimalSource): Decimal
    static plus(value: DecimalSource, other: DecimalSource): Decimal
    static sub(value: DecimalSource, other: DecimalSource): Decimal
    static subtract(value: DecimalSource, other: DecimalSource): Decimal
    static minus(value: DecimalSource, other: DecimalSource): Decimal
    static mul(value: DecimalSource, other: DecimalSource): Decimal
    static multiply(value: DecimalSource, other: DecimalSource): Decimal
    static times(value: DecimalSource, other: DecimalSource): Decimal
    static div(value: DecimalSource, other: DecimalSource): Decimal
    static divide(value: DecimalSource, other: DecimalSource): Decimal
    static recip(value: DecimalSource): Decimal
    static reciprocal(value: DecimalSource): Decimal
    static reciprocate(value: DecimalSource): Decimal
    static cmp(value: DecimalSource, other: DecimalSource): CompareResult
    static cmpabs(value: DecimalSource, other: DecimalSource): CompareResult
    static compare(value: DecimalSource, other: DecimalSource): CompareResult
    static isNaN(value: DecimalSource): boolean
    static isFinite(value: DecimalSource): boolean
    static eq(value: DecimalSource, other: DecimalSource): boolean
    static equals(value: DecimalSource, other: DecimalSource): boolean
    static neq(value: DecimalSource, other: DecimalSource): boolean
    static notEquals(value: DecimalSource, other: DecimalSource): boolean
    static lt(value: DecimalSource, other: DecimalSource): boolean
    static lte(value: DecimalSource, other: DecimalSource): boolean
    static gt(value: DecimalSource, other: DecimalSource): boolean
    static gte(value: DecimalSource, other: DecimalSource): boolean
    static max(value: DecimalSource, other: DecimalSource): Decimal
    static min(value: DecimalSource, other: DecimalSource): Decimal
    static minabs(value: DecimalSource, other: DecimalSource): Decimal
    static maxabs(value: DecimalSource, other: DecimalSource): Decimal
    static clamp(value: DecimalSource, min: DecimalSource, max: DecimalSource): Decimal
    static clampMin(value: DecimalSource, min: DecimalSource): Decimal
    static clampMax(value: DecimalSource, max: DecimalSource): Decimal
    static cmp_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): CompareResult
    static compare_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): CompareResult
    static eq_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static equals_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static neq_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static notEquals_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static lt_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static lte_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static gt_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static gte_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static pLog10(value: DecimalSource): Decimal
    static absLog10(value: DecimalSource): Decimal
    static log10(value: DecimalSource): Decimal
    static log(value: DecimalSource, base: DecimalSource): Decimal
    static log2(value: DecimalSource): Decimal
    static ln(value: DecimalSource): Decimal
    static logarithm(value: DecimalSource, base: DecimalSource): Decimal
    static pow(value: DecimalSource, other: DecimalSource): Decimal
    static pow10(value: DecimalSource): Decimal
    static root(value: DecimalSource, other: DecimalSource): Decimal
    static factorial(value: DecimalSource, _other?: never): Decimal
    static gamma(value: DecimalSource, _other?: never): Decimal
    static lngamma(value: DecimalSource, _other?: never): Decimal
    static exp(value: DecimalSource): Decimal
    static sqr(value: DecimalSource): Decimal
    static sqrt(value: DecimalSource): Decimal
    static cube(value: DecimalSource): Decimal
    static cbrt(value: DecimalSource): Decimal
    static tetrate(value: DecimalSource, height?: number, payload?: DecimalSource): Decimal
    static iteratedexp(value: DecimalSource, height?: number, payload?: Decimal): Decimal
    static iteratedlog(value: DecimalSource, base?: DecimalSource, times?: number): Decimal
    static layeradd10(value: DecimalSource, diff: DecimalSource): Decimal
    static layeradd(value: DecimalSource, diff: number, base?: number): Decimal
    static slog(value: DecimalSource, base?: number): Decimal
    static lambertw(value: DecimalSource): Decimal
    static ssqrt(value: DecimalSource): Decimal
    static pentate(value: DecimalSource, height?: number, payload?: DecimalSource): Decimal
    /**
     * If you're willing to spend 'resourcesAvailable' and want to buy something
     * with exponentially increasing cost each purchase (start at priceStart,
     * multiply by priceRatio, already own currentOwned), how much of it can you buy?
     * Adapted from Trimps source code.
     */
    static affordGeometricSeries(resourcesAvailable: DecimalSource, priceStart: DecimalSource, priceRatio: DecimalSource, currentOwned: DecimalSource): Decimal
    /**
     * How much resource would it cost to buy (numItems) items if you already have currentOwned,
     * the initial price is priceStart and it multiplies by priceRatio each purchase?
     */
    static sumGeometricSeries(numItems: DecimalSource, priceStart: DecimalSource, priceRatio: DecimalSource, currentOwned: DecimalSource): Decimal
    /**
     * If you're willing to spend 'resourcesAvailable' and want to buy something with additively
     * increasing cost each purchase (start at priceStart, add by priceAdd, already own currentOwned),
     * how much of it can you buy?
     */
    static affordArithmeticSeries(resourcesAvailable: DecimalSource, priceStart: DecimalSource, priceAdd: DecimalSource, currentOwned: DecimalSource): Decimal
    /**
     * How much resource would it cost to buy (numItems) items if you already have currentOwned,
     * the initial price is priceStart and it adds priceAdd each purchase?
     * Adapted from http://www.mathwords.com/a/arithmetic_series.htm
     */
    static sumArithmeticSeries(numItems: DecimalSource, priceStart: DecimalSource, priceAdd: DecimalSource, currentOwned: DecimalSource): Decimal
    /**
     * When comparing two purchases that cost (resource) and increase your resource/sec by (deltaRpS),
     * the lowest efficiency score is the better one to purchase.
     * From Frozen Cookies:
     * http://cookieclicker.wikia.com/wiki/Frozen_Cookies_(JavaScript_Add-on)#Efficiency.3F_What.27s_that.3F
     */
    static efficiencyOfPurchase(cost: DecimalSource, currentRpS: DecimalSource, deltaRpS: DecimalSource): Decimal
    static randomDecimalForTesting(maxLayers: number): Decimal
    static affordGeometricSeries_core(resourcesAvailable: Decimal, priceStart: Decimal, priceRatio: Decimal, currentOwned: DecimalSource): Decimal
    static sumGeometricSeries_core(numItems: DecimalSource, priceStart: Decimal, priceRatio: Decimal, currentOwned: DecimalSource): Decimal
    static affordArithmeticSeries_core(resourcesAvailable: Decimal, priceStart: Decimal, priceAdd: Decimal, currentOwned: Decimal): Decimal
    static sumArithmeticSeries_core(numItems: Decimal, priceStart: Decimal, priceAdd: Decimal, currentOwned: Decimal): Decimal
    static efficiencyOfPurchase_core(cost: Decimal, currentRpS: Decimal, deltaRpS: Decimal): Decimal
    static slog_critical(base: number, height: number): number
    static tetrate_critical(base: number, height: number): number
    static critical_section(base: number, height: number, grid: number[][]): number
    //#endregion Static functions

    constructor(value?: DecimalSource)

    //#region Properties
    sign: number;
    mag: number;
    layer: number;
    m: number;
    e: number;
    s: number;
    mantissa: number;
    exponent: number;
    //#endregion Properties

    //#region Methods
    normalize(): this
    fromComponents(sign: number, layer: number, mag: number): this
    fromComponents_noNormalize(sign: number, layer: number, mag: number): this
    fromMantissaExponent(mantissa: number, exponent: number): this
    fromMantissaExponent_noNormalize(mantissa: number, exponent: number): this
    fromDecimal(value: Decimal): this
    fromNumber(value: number): this
    fromString(value: string): Decimal
    fromValue(value: DecimalSource): Decimal
    toNumber(): number
    mantissaWithDecimalPlaces(places: number): number
    magnitudeWithDecimalPlaces(places: number): number
    toString(): string
    toExponential(places: number): string
    toFixed(places: number): string
    toPrecision(places: number): string
    valueOf(): string
    toJSON(): string
    toStringWithDecimalPlaces(places: number): string
    abs(): Decimal
    neg(): Decimal
    negate(): Decimal
    negated(): Decimal
    sgn(): number
    round(): this | Decimal
    floor(): this | Decimal
    ceil(): this | Decimal
    trunc(): this | Decimal
    add(value: DecimalSource): this | Decimal
    plus(value: DecimalSource): Decimal
    sub(value: DecimalSource): Decimal
    subtract(value: DecimalSource): Decimal
    minus(value: DecimalSource): Decimal
    mul(value: DecimalSource): Decimal
    multiply(value: DecimalSource): Decimal
    times(value: DecimalSource): Decimal
    div(value: DecimalSource): Decimal
    divide(value: DecimalSource): Decimal
    divideBy(value: DecimalSource): Decimal
    dividedBy(value: DecimalSource): Decimal
    recip(): Decimal
    reciprocal(): Decimal
    reciprocate(): Decimal
    /**
     * -1 for less than value, 0 for equals value, 1 for greater than value
     */
    cmp(value: DecimalSource): CompareResult
    cmpabs(value: DecimalSource): CompareResult
    compare(value: DecimalSource): CompareResult
    isNan(): boolean
    isFinite(): boolean
    eq(value: DecimalSource): boolean
    equals(value: DecimalSource): boolean
    neq(value: DecimalSource): boolean
    notEquals(value: DecimalSource): boolean
    lt(value: DecimalSource): boolean
    lte(value: DecimalSource): boolean
    gt(value: DecimalSource): boolean
    gte(value: DecimalSource): boolean
    max(value: DecimalSource): Decimal
    min(value: DecimalSource): Decimal
    maxabs(value: DecimalSource): Decimal
    minabs(value: DecimalSource): Decimal
    clamp(min: DecimalSource, max: DecimalSource): Decimal
    clampMin(min: DecimalSource): Decimal
    clampMax(max: DecimalSource): Decimal
    cmp_tolerance(value: DecimalSource, tolerance: number): CompareResult
    compare_tolerance(value: DecimalSource, tolerance: number): CompareResult
    /**
     * Tolerance is a relative tolerance, multiplied by the greater of the magnitudes of the two arguments.
     * For example, if you put in 1e-9, then any number closer to the
     * larger number than (larger number)*1e-9 will be considered equal.
     */
    eq_tolerance(value: DecimalSource, tolerance: number): boolean
    equals_tolerance(value: DecimalSource, tolerance: number): boolean
    neq_tolerance(value: DecimalSource, tolerance: number): boolean
    notEquals_tolerance(value: DecimalSource, tolerance: number): boolean
    lt_tolerance(value: DecimalSource, tolerance: number): boolean
    lte_tolerance(value: DecimalSource, tolerance: number): boolean
    gt_tolerance(value: DecimalSource, tolerance: number): boolean
    gte_tolerance(value: DecimalSource, tolerance: number): boolean
    pLog10(): Decimal
    absLog10(): Decimal
    log10(): Decimal
    log(base: DecimalSource): Decimal
    log2(): Decimal
    ln(): Decimal
    logarithm(base: DecimalSource): Decimal
    pow(value: DecimalSource): Decimal
    pow10(): Decimal
    pow_base(value: DecimalSource): Decimal
    root(value: DecimalSource): Decimal
    factorial(): Decimal
    gamma(): Decimal
    lngamma(): Decimal
    exp(): Decimal
    sqr(): Decimal
    sqrt(): Decimal
    cube(): Decimal
    cbrt(): Decimal
    tetrate(height?: number, payload?: DecimalSource): Decimal
    iteratedexp(height?: number, payload?: Decimal): Decimal
    iteratedlog(base?: DecimalSource, times?: number): Decimal
    slog(base?: DecimalSource): Decimal
    layeradd10(diff: DecimalSource): Decimal
    layeradd(diff: number, base: DecimalSource): Decimal
    lambertw(): Decimal
    ssqrt(): Decimal
    pentate(height?: number, payload?: DecimalSource): Decimal
    sin(): this | Decimal
    cos(): Decimal
    tan(): this | Decimal
    asin(): this | Decimal
    acos(): Decimal
    atan(): this | Decimal
    sinh(): Decimal
    cosh(): Decimal
    tanh(): Decimal
    asinh(): Decimal
    acosh(): Decimal
    atanh(): Decimal
    /**
     * Joke function from Realm Grinder
     */
    ascensionPenalty(ascensions: DecimalSource): Decimal
    /**
     * Joke function from Cookie Clicker. It's 'egg'
     */
    egg(): Decimal
    lessThanOrEqualTo(other: DecimalSource): boolean
    lessThan(other: DecimalSource): boolean
    greaterThanOrEqualTo(other: DecimalSource): boolean
    greaterThan(other: DecimalSource): boolean
    //#endregion Methods
}

declare class Layer<T extends LayerData> {
    /**
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar to access the saved value.
     * It makes copying code to new layers easier. It is also assigned to all upgrades and buyables and such.
     */
    readonly layer: string
    /**
     * Used in reset confirmations (and the default infobox title).
     * If absent, it just uses the layer's id.
     */
    name?: string
    /**
     * A function to return the default save data for this layer.
     * Add any variables you have to it. Make sure to use `Decimal` values rather than normal numbers.
     */
    startData(): T
    /**
     * A color associated with this layer, used in many places. (A string in hex format with a #)
     */
    color: string
    /**
     * The row of the layer, starting at 0.
     * This affects where the node appears on the standard tree, and which resets affect the layer.
     *
     * Using "side" instead of a number will cause the layer to appear off to the side as a smaller node
     * (useful for achievements and statistics). Side layers are not affected by resets unless you add a doReset to them.
     */
    row: number | 'side'
    /**
     * **OVERRIDE**
     *
     * Changes where the layer node appears without changing where it is in the reset order.
     */
    displayRow?: Computable<number>
    /**
     * Name of the main currency you gain by resetting on this layer.
     */
    resource: string
    /**
     * A function that calculates and returns the current values of any bonuses inherent to the main currency.
     * Can return a value or an object containing multiple values.
     * *You will also have to implement the effect where it is applied.*
     */
    effect?(): any
    /**
     * A function that returns a description of this effect.
     * If the text stays constant, it can just be a string.
     */
    effectDescription?: Computable<string>
    /**
     * A function returning a bool which determines if this layer's node should be visible on the tree.
     * It can also return "ghost", which will hide the layer, but its node will still take up space in the tree.
     * Defaults to true.
     */
    layerShown?(): boolean | 'ghost'
    /**
     * An array containing information on any hotkeys associated with this layer
     */
    hotkeys?: Hotkey[]
    /**
     * A "CSS object" where the keys are CSS attributes, containing any CSS that should affect this layer's entire tab.
     */
    style?: Computable<CSSStyles>
    /**
     * Use this if you want to add extra things to your tab or change the layout.
     *
     * See the docs about it.
     */
    tabFormat?: {
        [id: string]: {
            /**
             * The tab layout code for the subtab, in the tab layout format.
             */
            content: (string | [string, any])[],
            /**
             * Applies CSS to the whole subtab when switched to, in the form of an "CSS Object", where the keys are CSS attributes,
             * and the values are the values for those attributes (both as strings).
             */
            style?: Computable<CSSStyles>
            /**
             * A CSS object, which affects the appearance of the button for that subtab.
             */
            buttonStyle?: Computable<CSSStyles>,
            /**
             * A function to determine if the button for this subtab should be visible.
             * By default, a subtab is always unlocked. You can't use the "this" keyword in this function.
             */
            unlocked?: Computable<boolean>,
            /**
             * If true, the tab button will be highlighted to notify the player that there is something there.
             */
            shouldNotify?(): boolean,
            /**
             * If true, the tab button will be highlighted to notify the player that there is something there.
             */
            prestigeNotify?(): boolean,
            /**
             * specifies the color that the subtab glows. If this subtab is causing the main layer to node glow
             * (and it would't otherwise) the node also glows this color. Is NOT overridden by embedding a layer.
             */
            glowColor?: Computable<string>,
            /**
             * **SIGNIFICANT**
             *
             * The id of another layer. If you have this, it will override "content", "style" and "shouldNotify",
             * instead displaying the entire layer in the subtab.
             */
            embedLayer?: string,
        }
    }
    /**
     * An alternative to `tabFormat`, which is inserted in between Milestones and Buyables in the standard tab layout. (cannot do subtabs)
     */
    midsection?: (string | [string, any])[]

    // Big features
    /**
     * A set of one-time purchases which can have unique upgrade conditions, currency costs, and bonuses.
     */
    upgrades: { [id: number]: Upgrade }
    /**
     * A list of bonuses gained upon reaching certain thresholds of a resource. Often used for automation/QOL.
     */
    milestones: { [id: number]: Milestone }
    /**
     * The player can enter challenges, which make the game harder.
     * If they reach a goal and beat the challenge, they recieve a bonus.
     */
    challenges?: { [id: number]: Challenge }
    /**
     * Effectively upgrades that can be bought multiple times, and are optionally respeccable. Many uses.
     */
    buyables?: {
        /**
         * To add a respec button, or something similar,
         * add the respecBuyables function to the main buyables object (not individual buyables).
         */
        respecBuyables?(): void,
        /**
         * This is called when the button is pressed (after a toggleable confirmation message).
         */
        respec?(): void,
        /**
         * Text to display on the respec Button.
         */
        respecText?: Computable<string>
        /**
         * A function determining whether or not to show the button,
         * if `respecBuyables` is defined. Defaults to true if absent.
         */
        showRespec?(): boolean,
        /**
         * A custom confirmation message on respec, in place of the default one.
         */
        respecMessage?: Computable<string>
        [id: number]: Buyable,
    }
    /**
     * Extremely versatile and generalized buttons which can only be clicked sometimes.
     */
    clickables?: {
        /**
         * If present, an additional button will appear above the clickables. Pressing it will call this function.
         */
        masterButtonPress?(): void,
        /**
         * Text to display on the Master Button.
         */
        masterButtonText?: Computable<string>
        /**
         * A function determining whether or not to show the button, if `masterButtonPress` is defined. Defaults to true if absent.
         */
        showMasterButton?(): boolean,
        [id: number]: Clickable,
    }
    /**
     * An area that functions like a set of subtabs,
     * with buttons at the top changing the content within. (Advanced)
     */
    microtabs?: {
        [id: string]: {
            [id: string]: {
                /**
                 * The tab layout code for the subtab, in the tab layout format.
                 */
                content: (string | [string, any])[],
                /**
                 * Applies CSS to the whole subtab when switched to, in the form of an "CSS Object", where the keys are CSS attributes,
                 * and the values are the values for those attributes (both as strings).
                 */
                style?: Computable<CSSStyles>
                /**
                 * A CSS object, which affects the appearance of the button for that subtab.
                 */
                buttonStyle?: Computable<CSSStyles>,
                /**
                 * A function to determine if the button for this subtab should be visible.
                 * By default, a subtab is always unlocked. You can't use the "this" keyword in this function.
                 */
                unlocked?: Computable<boolean>,
                /**
                 * If true, the tab button will be highlighted to notify the player that there is something there.
                 */
                shouldNotify?(): boolean,
                /**
                 * If true, the tab button will be highlighted to notify the player that there is something there.
                 */
                prestigeNotify?(): boolean,
                /**
                 * specifies the color that the subtab glows. If this subtab is causing the main layer to node glow
                 * (and it would't otherwise) the node also glows this color. Is NOT overridden by embedding a layer.
                 */
                glowColor?: Computable<string>,
                /**
                 * **SIGNIFICANT**
                 *
                 * The id of another layer. If you have this, it will override "content", "style" and "shouldNotify",
                 * instead displaying the entire layer in the subtab.
                 */
                embedLayer?: string,
            }
        }
    }
    /**
     * Display some information as a progress bar, gague, or similar. They are highly customizable, and can be vertical as well.
     */
    bars?: { [id: string]: Bar }
    /**
     * Kind of like milestones, but with a different display style and some other differences. Extra features are on the way at a later date!
     */
    achievements?: { [id: number]: Achievement }
    /**
     * If false, disables popup message when you get the achievement. True by default.
     */
    achievementPopups?: Computable<boolean>;
    /**
     * If false, disables popup message when you get the milestone. True by default.
     */
    milestonePopups?: Computable<boolean>;
    /**
     * Displays some text in a box that can be shown or hidden.
     */
    infoboxes?: { [id: string]: Infobox }
    /**
     * A grid of buttons that behave the same, but have their own data.
     */
    grid?: {
        /**
         * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
         */
        readonly layer: string,

        /**
         * The amount of rows of gridable to display.
         */
        rows: Computable<number>,
        /**
         * The amount of columns of gridable to display.
         */
        cols: Computable<number>,
        /**
         * If rows are dynamic, you need to define the maximum amount that there can be
         * (you can increase it when you update the game though). These CANNOT be dynamic.
         */
        maxRows: number,
        /**
         * If cols are dynamic, you need to define the maximum amount that there can be
         * (you can increase it when you update the game though). These CANNOT be dynamic.
         */
        maxCols: number,
        /**
         * Creates the default data for the gridable at this position. This can be an object, or a regular value.
         */
        getStartData(id: number): any,
        /**
         * Returns true if the gridable at this position should be visible.
         */
        getUnlocked?(id: number): boolean,
        /**
         * Returns text that should displayed at the top in a larger font, based on the position and data of the gridable.
         */
        getTitle?(data: any, id: number): string,
        /**
         * Returns everything that should be displayed on the gridable after the title, based on the position and data of the gridable.
         */
        getDisplay?(data: any, id: number): string,
        /**
         * Returns CSS to apply to this gridable, in the form of an object where the keys are CSS attributes,
         * and the values are the values for those attributes (both as strings).
         */
        getStyle?(data: any, id: number): CSSStyles,
        /**
         * A function returning a bool to determine if you can click a gridable,
         * based on its data and position. If absent, you can always click it.
         */
        getCanClick?(data: any, id: number): boolean,
        /**
         * A function that implements clicking on the gridable, based on its position and data.
         */
        onClick(data: any, id: number): void,
        /**
         * A function that is called 20x/sec when the button is held for at least 0.25 seconds.
         */
        onHold?(data: any, id: number): void,
        /**
         * A function that calculates and returns a gridable's effect,
         * based on its position and data. (Whatever that means for a gridable)
         */
        getEffect?(data: any, id: number): void,
        /**
         * Adds a tooltip to the gridables, appears when they hovered over.
         * Can use basic HTML. Default is no tooltip. If this returns an empty value, that also disables the tooltip.
         */
        getTooltip?(data: any, id: number): string,
    }

    /**
     * Determines which prestige formula you use. Defaults to "none".
     *
     * - "normal": The amount of currency you gain is independent of its current amount (like Prestige). The formula before bonuses is based on `baseResource^exponent`
     * - "static": The cost is dependent on your total after reset. The formula before bonuses is based on `base^(x^exponent)`
     * - "custom": You can define everything, from the calculations to the text on the button, yourself. (See more at the bottom)
     * - "none": This layer does not prestige, and therefore does not need any of the other features in this section.
     */
    type?: 'normal' | 'static' | 'custom' | 'none'
    /**
     * The name of the resource that determines how much of the main currency you gain on reset.
     */
    baseResource: string
    /**
     * A function that gets the current value of the base resource.
     */
    baseAmount(): Decimal
    /**
     * A Decimal, the amount of the base needed to gain 1 of the prestige currency.
     * Also the amount required to unlock the layer.
     * You can instead make this a function, to make it harder if another layer was unlocked first (based on unlockOrder).
     */
    requires: Computable<Decimal>
    /**
     * Used as described in type
     */
    exponent: Decimal
    /**
     * Required for "static" layers, used as described in type.
     * If absent, defaults to 2. Must be greater than 1.
     */
    base?: Decimal
    /**
     * A bool, which is true if the resource cost needs to be rounded up.
     * (use if the base resource is a "static" currency.)
     */
    roundUpCost?: boolean
    /**
     * For normal layers, this function calculates the multiplier
     * on resource gain from upgrades and boosts and such. Plug in most bonuses here.
     *
     * For static layers, it instead multiplies the cost of the resource.
     * (So to make a boost you want to make gainMult smaller.)
     */
    gainMult?(): Decimal
    /**
     * For normal layers, this function calculates the exponent
     * on resource gain from upgrades and boosts and such. Plug in most bonuses here.
     *
     * For static layers, it instead roots the cost of the resource.
     * (So to make a boost you want to make gainExp larger.)
     */
    gainExp?(): Decimal
    /**
     * Directly multiplies the resource gain, after exponents and softcaps.
     *
     * For static layers, actually multiplies resource gain instead of reducing the cost.
     */
    directMult?(): Decimal
    /**
     * For normal layers, gain beyond `softcap` points is put to the `softcapPower`th power.
     *
     * Default for softcap is e1e7.
     */
    softcap?: Computable<Decimal>
    /**
     * For normal layers, gain beyond `softcap` points is put to the `softcapPower`th power.
     *
     * Default for power is 0.5.
     */
    softcapPower?: Computable<Decimal>

    /**
     * Required for static layers, function used to determine if buying max is permitted.
     */
    canBuyMax?: Computable<boolean>
    /**
     * A function that triggers when this layer prestiges, just before you gain the currency.
     * Can be used to have secondary resource gain on prestige, or to recalculate things or whatnot.
     */
    onPrestige?(gain: Decimal): void
    /**
     * Use this to replace "Reset for " on the Prestige button with something else.
     */
    resetDescription?: Computable<string>
    /**
     * Use this to make the entirety of the text a Prestige button contains.
     * Only required for custom layers, but usable by all types.
     */
    prestigeButtonText?(): string
    /**
     * You automatically generate your gain times this number every second (does nothing if absent).
     * This is good for automating Normal layers.
     */
    passiveGeneration?: Computable<number>
    /**
     * If true, the layer will always automatically do a prestige if it can.
     * This is good for automating Static layers.
     */
    autoPrestige?: Computable<boolean>

    /**
     * The text that appears on this layer's node. Default is the layer id with the first letter capitalized.
     */
    symbol?: Computable<string>
    /**
     * **override**
     *
     * The url (local or global) of an image that goes on the node. (Overrides symbol)
     */
    image?: string
    /**
     * Determines the horizontal position of the layer in its row in a standard tree.
     * By default, it uses the layer id, and layers are sorted in alphabetical order.
     */
    position?: number
    /**
     * An array of layer/node ids.
     * On a tree, a line will appear from this layer to all of the layers in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the layer id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
    /**
     * A CSS object, where the keys are CSS attributes, which styles this layer's node on the tree.
     */
    nodeStyle: Computable<CSSStyles>
    /**
     * Functions that return text, which is the tooltip for the node when the layer is unlocked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     * If the value is "", the tooltip will be disabled.
     */
    tooltip?(): string
    /**
     * Functions that return text, which is the tooltip for the node when the layer is locked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     * If the value is "", the tooltip will be disabled.
     */
    tooltipLocked?(): string
    /**
     * Adds a mark to the corner of the node. If it's "true" it will be a star, but it can also be an image URL.
     */
    marked?: Computable<string>

    /**
     * Is triggered when a layer on a row greater than or equal to this one does a reset.
     * The default behavior is to reset everything on the row, but only if it was triggered by a layer in a higher row.
     * `doReset` is always called for side layers, but for these the default behavior is to reset nothing.
     *
     * If you want to keep things, determine what to keep based on `resettingLayer`,
     * `milestones`, and such, then call `layerDataReset(layer, keep)`, where `layer` is this layer,
     * and `keep` is an array of the names of things to keep.
     * It can include things like "points", "best", "total" (for this layer's prestige currency),
     * "upgrades", any unique variables like "generatorPower", etc.
     * If you want to only keep specific upgrades or something like that, save them in a separate variable,
     * then call `layerDataReset`, and then set `player[this.layer].upgrades` to the saved upgrades.
     */
    doReset?(resettingLayer: string): void
    /**
     * This function is called every game tick.
     * Use it for any passive resource production or time-based things.
     * `diff` is the time since the last tick.
     */
    update?(diff: number): void
    /**
     * If true, the game will attempt to buy this layer's upgrades every tick. Defaults to false.
     */
    autoUpgrade?: Computable<boolean>
    /**
     * This function is called every game tick, after production.
     * Use it to activate automation things that aren't otherwise supported.
     */
    automate?(): void
    /**
     * Returns true if this layer shouldn't trigger any resets when you prestige.
     */
    resetsNothing?: Computable<boolean>
    /**
     * An array of layer ids. When this layer is unlocked for the first time,
     * the `unlockOrder` value for any not-yet-unlocked layers in this list increases.
     * This can be used to make them harder to unlock.
     */
    increaseUnlockOrder?: string[]
    /**
     * A function to return true if this layer should be highlighted in the tree.
     * The layer will automatically be highlighted if you can buy an upgrade whether you have this or not.
     */
    shouldNotify?(): boolean
    /**
     * The color that this layer will be highlighted if it should notify.
     * The default is red. You can use this if you want several different notification types!
     */
    glowColor?: Computable<string>
    /**
     * An object that contains a set of functions returning CSS objects. Each of these will be applied to any components on the layer with the type of its id. Example:
     *
     * ```js
     * componentStyles: {
     *     "challenge"() { return {'height': '200px'} },
     *     "prestige-button"() { return {'color': '#AA66AA'} }
     * }
     * ```
     */
    componentStyles?: Computable<{ [k: string]: CSSStyles }>
    /**
     * If true, this layer will use the left tab instead of the right tab.
     */
    leftTab?: Computable<boolean>
    /**
     * A layer's id. If a layer has a previousTab,
     * the layer will always have a back arrow and pressing the back arrow on this layer will take you to the layer with this id.
     */
    previousTab?: Computable<string>
    /**
     * If this is true, `hasUpgrade`, `hasChallenge`, `hasAchievement`,
     * and `hasMilestone` will return false for things in the layer,
     * and you will be unable to buy or click things, or gain achievements/milestones on the layer.
     * You will have to disable effects of buyables, the innate layer effect, and possibly other things yourself.
     */
    deactivated?: Computable<boolean>

    /**
     * Returns how many points you should get if you reset now.
     * You can call `getResetGain(this.layer, useType = "static")` or similar to calculate what
     * your gain would be under another prestige type (provided you have all of the required features in the layer).
     */
    getResetGain?(): Decimal
    /**
     * Returns how many of the base currency you need to get to the next point.
     * `canMax` is an optional variable used with Static-ish layers to differentiate between
     * if it's looking for the first point you can reset at, or the requirement for any gain at all (Supporting both is good).
     * You can also call `getNextAt(this.layer, canMax=false, useType = "static")` or
     * similar to calculate what your next at would be under another prestige type
     * (provided you have all of the required features in the layer).
     */
    getNextat?(canMax: boolean): Decimal
    /**
     * Return true only if you have the resources required to do a prestige here.
     */
    canReset?(): boolean
    /**
     * Returns true if this layer should be subtly highlighted to indicate you
     * can prestige for a meaningful gain.
     */
    prestigeNotify?(): boolean
}

declare class TempLayer {
    readonly layer: string
    readonly name?: string
    readonly color: string
    readonly row: number | 'side'
    readonly displayRow?: number
    readonly resource: string
    readonly effect?: any
    readonly layerShown?: boolean
    readonly style?: CSSStyles
    readonly tabFormat?: {
        [id: string]: {
            content: (string | [string, any])[],
            style?: CSSStyles,
            buttonStyle?: CSSStyles,
            unlocked?: boolean,
            shouldNotify?: boolean,
            prestigeNotify?: boolean,
            glowColor?: string,
            embedLayer?: string,
        }
    }
    readonly midsection?: (string | [string, any])[]

    readonly upgrades?: { [id: number]: Upgrade }
    readonly milestones?: { [id: number]: Milestone }
    readonly challenges?: { [id: number]: Challenge }
    readonly buyables?: {
        respecText?: string,
        showRespec?: boolean,
        respecMessage?: string,
        [id: number]: Buyable,
    }
    readonly clickables?: {
        masterButtonText?: string,
        showMasterButton?: boolean,
        [id: number]: Clickable,
    }
    readonly microtabs?: {
        [id: string]: {
            [id: string]: {
                content: (string | [string, any])[],
                style?: CSSStyles,
                buttonStyle?: CSSStyles,
                unlocked?: boolean,
                shouldNotify?: boolean,
                prestigeNotify?: boolean,
                glowColor?: string,
                embedLayer?: string,
            }
        }
    }
    readonly bars?: { [id: string]: Bar }
    readonly achievements?: { [id: number]: Achievement }
    readonly achievementPopups?: boolean
    readonly milestonePopups?: boolean
    readonly infoboxes?: { [id: string]: Infobox }
    readonly grid?: {
        readonly layer: string,

        readonly rows: number,
        readonly cols: number,
        readonly maxRows: number,
        readonly maxCols: number,
    }

    readonly type?: 'normal' | 'static' | 'custom' | 'none'
    readonly baseResource: string
    readonly baseAmount: Decimal
    readonly requires: Decimal
    readonly exponent: Decimal
    readonly base?: Decimal
    readonly roundUpCost?: boolean
    readonly gainMult?: Decimal
    readonly gainExp?: Decimal
    readonly directMult?: Decimal
    readonly softcap?: Decimal
    readonly softcapPower?: Decimal

    readonly canBuyMax?: boolean
    readonly onPrestige?: void
    readonly resetDescription?: string
    readonly prestigeButtonText?: string
    readonly passiveGeneration?: number
    readonly autoPrestige?: boolean

    readonly symbol?: string
    readonly image?: string
    readonly position?: number
    readonly branches?: string[] | [string, string | 1 | 2 | 3, number?][]
    readonly nodeStyle: CSSStyles
    readonly tooltip?: string
    readonly tooltipLocked?: string
    readonly marked?: string

    readonly autoUpgrade?: boolean
    readonly resetsNothing?: boolean
    readonly increaseUnlockOrder?: string[]
    readonly shouldNotify?: boolean
    readonly glowColor?: string
    readonly componentStyles?: { [k: string]: CSSStyles }
    readonly leftTab?: boolean
    readonly previousTab?: string
    readonly deactivated?: boolean

    readonly getResetGain?: Decimal
    readonly getNextAt?: Decimal
    readonly canReset?: boolean
    readonly prestigeNotify?: boolean
}

declare class Achievement {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: string;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the achievement was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Displayed at the top of the achievement. * The only visible text.
     * It can also be a function that returns updating text. * Can use basic HTML.
     */
    name?: Computable<string>;
    /**
     * A function returning a boolean to determine if the achievement should be awarded.
     */
    done(): boolean
    /**
     * Default tooltip for the achievement, appears when it is hovered over.
     * Should convey the goal and any reward for completing the achievement.
     * It can also be a function that returns updating text.
     * Can use basic HTML. Setting this to "" disables the tooltip.
     */
    tooltip?: Computable<string>;
    /**
     * A function that calculates and returns the current values of any bonuses from the achievement.
     * Can return a value or an object containing multiple values.
     */
    effect?(): any
    /**
     * A function returning a bool to determine if the achievement is visible or not. Default is unlocked.
     */
    unlocked?(): boolean
    /**
     * This function will be called when the achievement is completed.
     */
    onComplete?(): void
    /**
     * Puts the image from the given URL (relative or absolute) in the achievement.
     */
    image?: string;
    /**
     * Applies CSS to this achievement, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>;
    /**
     * Applies CSS to the text, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    textStyle?: Computable<CSSStyles>;
    /**
     * @deprecated
     *
     * Appears when the achievement is hovered over and locked, overrides the basic tooltip.
     * This is to display the goal (or a hint).
     * It can also be a function that returns updating text. Can use basic HTML.
     */
    goalTooltip?: Computable<string>;
    /**
     * @deprecated
     *
     * Appears when the achievement is hovered over and completed, overrides the basic tooltip.
     * This can display what the player achieved (the goal), and the rewards, if any.
     * It can also be a function that returns updating text. Can use basic HTML.
     */
    doneTooltip?: Computable<string>;
}

declare class Bar {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: string;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the bar was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * UP (0), DOWN (1), LEFT (2), or RIGHT (3) (not strings).
     *
     * Determines the direction that the bar is filled as it progresses.
     * RIGHT means from left to right.
     */
    direction: 0 | 1 | 2 | 3;
    /**
     * The size in pixels of the bar, but as numbers (no "px" at the end).
     */
    width: number;
    /**
     * The size in pixels of the bar, but as numbers (no "px" at the end).
     */
    height: number;
    /**
     * A function that returns the portion of the bar that is filled, from "empty" at 0 to "full" at 1, updating automatically.
     * (Nothing bad happens if the value goes out of these bounds, and it can be a number or `Decimal`.)
     */
    progress(): number | Decimal
    /**
     * A function that returns text to be displayed on top of the bar, can use HTML.
     */
    display?: Computable<string>
    /**
     * A function returning a bool to determine if the bar is visible or not.
     * Default is unlocked.
     */
    unlocked?(): boolean
    /**
     * Apply CSS to the unfilled portion on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    baseStyle?: Computable<CSSStyles>
    /**
     * Apply CSS to the filled portion on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    fillStyle?: Computable<CSSStyles>
    /**
     * Apply CSS to the border on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    borderStyle?: Computable<CSSStyles>
    /**
     * Apply CSS to the display text on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    textStyle?: Computable<CSSStyles>
    /**
     * If this is true, the bar will instantly snap to the current value instead of animating in between.
     * Good for things involving precise timing.
     */
    instant?: Computable<boolean>
}

declare class Buyable {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: string;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the buyable was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Displayed at the top in a larger font.
     */
    title?: Computable<string>
    /**
     * Cost for buying the next buyable.
     * Can have an optional argument "x" to calculate the cost of the x+1th purchase. (x is a `Decimal`).
     * Can return an object if there are multiple currencies.
     */
    cost(x: Decimal): any
    /**
     * A function that calculates and returns the current values of bonuses of this buyable.
     * Can have an optional argument "x" to calculate the effect of having x of the buyable.
     * Can return a value or an object containing multiple values.
     */
    effect?(x: Decimal): any
    /**
     * A function returning everything that should be displayed on the buyable after the title,
     * likely including the description, amount bought, cost, and current effect. Can use basic HTML.
     */
    display: Computable<string>
    /**
     * A function returning a bool to determine if the buyable is visible or not. Default is unlocked.
     */
    unlocked?: Computable<boolean>
    /**
     * A function returning a bool to determine if you can buy one of the buyables.
     */
    canAfford(): boolean
    /**
     * A function that implements buying one of the buyable, including spending the currency.
     */
    buy(): void
    /**
     * A function that implements buying as many of the buyable as possible.
     */
    buyMax?(): void
    /**
     * Applies CSS to this buyable, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>;
    /**
     * The limit on how many of the buyable can be bought.
     * The default is no limit.
     */
    purchaseLimit?: Computable<Decimal>
    /**
     * Adds a mark to the corner of the buyable.
     * If it's "true" it will be a star, but it can also be an image URL.
     */
    marked?: Computable<boolean | string>
    /**
     * Adds a tooltip to this buyable, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     */
    tooltip?: Computable<string>
    /**
     * Called when the button is pressed.
     * The standard use would be to decrease the amount of the buyable,
     * and possibly return some currency to the player.
     */
    sellOne?(): void
    /**
     * Called when the button is pressed.
     * The standard use would be to reset the amount of the buyable,
     * and possibly return some currency to the player.
     */
    sellAll?(): void
    /**
     * Booleans determining whether or not to show the buttons.
     * If `canSellOne` is absent but `sellOne` is present,
     * the appropriate button will always show.
     */
    canSellOne?(): boolean
    /**
     * Booleans determining whether or not to show the buttons.
     * If `canSellAll` is absent but `sellAll` is present,
     * the appropriate button will always show.
     */
    canSellAll?(): boolean
    /**
     * This is primarially useful for buyable trees. An array of buyable ids.
     * A line will appear from this buyable to all of the buyables in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the buyable id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
}

declare class Challenge {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: string;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the challenge was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Name of the challenge, can be a string or a function. Can use basic HTML.
     */
    name: Computable<string>
    /**
     * A description of what makes the challenge a challenge.
     * *You will need to implement these elsewhere.*
     * It can also be a function that returns updating text. Can use basic HTML.
     */
    challengeDescription: Computable<string>
    /**
     * A description of the win condition for the challenge.
     * It can also be a function that returns updating text.
     * Can use basic HTML.
     */
    goalDescription: Computable<string>
    /**
     * A function that returns true if you meet the win condition for the challenge.
     * Returning a number will allow bulk completing the challenge.
     */
    canComplete(): boolean | number
    /**
     * A description of the reward's effect.
     * *You will also have to implement the effect where it is applied.*
     * Can use basic HTML.
     */
    rewardDescription: Computable<string>
    /**
     * A function that calculates and returns the current values of any bonuses from the reward.
     * Can return a value or an object containing multiple values. Can use basic HTML.
     */
    rewardEffect?(): any
    /**
     * A function that returns a display of the current effects of the reward with formatting.
     * Default behavior is to just display the a number appropriately formatted.
     */
    rewardDisplay?(): string
    /**
     * **OVERRIDE**
     *
     * Overrides the other displays and descriptions,
     * and lets you set the full text for the challenge. Can use basic HTML.
     */
    fullDisplay?(): string
    /**
     * A function returning a bool to determine if the challenge is visible or not. Default is unlocked.
     */
    unlocked?(): boolean
    /**
     * This function will be called when the challenge is completed when previously incomplete.
     */
    onComplete?(): void
    /**
     * This function will be called when entering the challenge.
     */
    onEnter?(): void
    /**
     * This function will be called when exiting the challenge in any way.
     */
    onExit?(): void
    /**
     * If a challenge combines the effects of other challenges in this layer, you can use this.
     * An array of challenge ids. The player is effectively in all of those challenges when in the current one.
     */
    countAs?: number[]
    /**
     * The amount of times you can complete this challenge. Default is 1 completion.
     */
    completionLimit?: number
    /**
     * Applies CSS to this challenge, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * Adds a mark to the corner of the challenge.
     * If it's "true" it will be a star, but it can also be an image URL.
     * By default, if the challenge has multiple completions, it will be starred at max completions.
     */
    marked?: Computable<boolean | string>
}
/**
 * @deprecated
 */
declare class OldChallenge<T> extends Challenge {
    /**
     * @deprecated
     *
     * A Decimal for the amount of currency required to beat the challenge.
     * By default, the goal is in basic Points.
     * The goal can also be a function if its value changes.
     */
    goal: Computable<Decimal>
    /**
     * @deprecated
     *
     * The name to display for the currency for the goal.
     */
    currencyDisplayName: Computable<string>
    /**
     * @deprecated
     *
     * The internal name for that currency.
     */
    currencyInternalName: keyof T
    /**
     * @deprecated
     *
     * The internal name of the layer that currency is stored in.
     * If it's not in a layer, omit.
     * If it's not stored directly in a layer, instead use the next feature.
     */
    currencyLayer?: string
    /**
     * @deprecated
     *
     * If your currency is stored in something inside a layer (e.g. a buyable's amount), you can access it this way.
     * This is a function returning the object in "player" that contains the value (like `player[this.layer].buyables`).
     */
    currencyLocation?(): T
}

declare class Clickable {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: string;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the clickable was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Displayed at the top in a larger font.
     */
    title?: Computable<string>
    /**
     * A function that calculates and returns the current values of bonuses of this clickable.
     * Can return a value or an object containing multiple values.
     */
    effect?(): any
    /**
     * A function returning everything that should be displayed on the clickable after the title,
     * likely changing based on its state. Can use basic HTML.
     */
    display: Computable<string>
    /**
     * A function returning a bool to determine if the clickable is visible or not. Default is unlocked.
     */
    unlocked?(): boolean
    /**
     * A function returning a bool to determine if you can click the clickable.
     */
    canClick(): boolean
    /**
     * A function that implements clicking the clickable.
     */
    onClick(): void
    /**
     * A function that is called 20x/sec when the button is held for at least 0.25 seconds.
     */
    onHold(): void
    /**
     * Applies CSS to this clickable, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * Adds a mark to the corner of the clickable.
     * If it's "true" it will be a star, but it can also be an image URL.
     */
    marked?: Computable<boolean | string>
    /**
     * Adds a tooltip to this clickable, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     */
    tooltip?: Computable<string>
    /**
     * This is primarially useful for clickable trees. An array of clickable ids.
     * A line will appear from this clickable to all of the clickables in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the clickable id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
}

declare class Infobox {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: string;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the infobox was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * The text displayed above the main box. Can use basic HTML.
     */
    title: Computable<string>
    /**
     * The text displayed inside the box. Can use basic HTML.
     */
    body: Computable<string>
    /**
     * Apply CSS to the infobox in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * Apply CSS to the title button of the infobox,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    titleStyle?: Computable<CSSStyles>
    /**
     * Apply CSS to the body of the infobox,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    bodyStyle?: Computable<CSSStyles>
    /**
     * A function returning a bool to determine if the infobox is visible or not. Default is unlocked.
     */
    unlocked?(): boolean
}

declare class Hotkey {
    /**
     * What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
     */
    key: string
    /**
     * The description of the hotkey that is displayed in the game's How To Play tab.
     */
    description: Computable<string>
    onPress(): void
    /**
     * Determines if you can use the hotkey.
     */
    unlocked?(): boolean
}

declare class Milestone {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: string;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the milestone was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * A string describing the requirement for unlocking this milestone.
     * Suggestion: Use a "total". Can use basic HTML.
     */
    requirementDescription: Computable<string>
    /**
     * A string describing the reward for having the milestone.
     * *You will have to implement the reward elsewhere.*
     * Can use basic HTML.
     */
    effectDescription: Computable<string>
    /**
     * A function returning a boolean to determine if the milestone should be awarded.
     */
    done(): boolean
    /**
     * This function will be called when the milestone is completed.
     */
    onComplete?(): void
    /**
     * Creates toggle buttons that appear on the milestone when it is unlocked.
     * The toggles can toggle a given boolean value in a layer.
     * It is defined as an array of paired items, one pair per toggle.
     * The first is the internal name of the layer the value being toggled is stored in,
     * and the second is the internal name of the variable to toggle. (e.g. [["b", "auto"], ["g", "auto"])
     *
     * **Tip:** Toggles are not de-set if the milestone becomes locked! In this case, you should also check if the player has the milestone.
     */
    toggles?: [string, string][]
    /**
     * Applies CSS to this milestone, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * A function returning a boolean to determine if the milestone should be shown. If absent, it is always shown.
     */
    unlocked?: Computable<boolean>
    /**
     * Adds a tooltip to this milestone, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     */
    tooltip?: Computable<string>
}

declare class Particle {
    /**
     * The amount of time, in seconds, that the particle will last. Default is 3.
     */
    time?: number
    /**
     * The amount of seconds that fading out at the end should take (part of the total lifetime). Default is 1.
     */
    fadeOutTime?: number
    /**
     * The amount of seconds that fading in should take (part of the total lifetime). Default is 0.
     */
    fadeInTime?: number

    /**
     * The image the particle should display. `""` will display no image. Default is a generic particle.
     */
    image?: string
    /**
     * Displays text on the particle. Can use basic HTML.
     */
    text?: string
    /**
     * Lets you apply other CSS styling to the particle.
     */
    style?: CSSStyles
    /**
     * The dimensions of the particle. Default is 35.
     */
    width?: number
    /**
     * The dimensions of the particle. Default is 35.
     */
    height?: number
    /**
     * Sets the color of the image to this color.
     */
    color?: string

    /**
     * The angle that the particle should face. Default is 0.
     */
    angle?: number
    /**
     * The initial angle that the particles should move in, before spread is factored in. Default is whatever angle is.
     */
    dir?: number
    /**
     * If there are several particles, they will be spread out by this many degrees, centered on dir. Default is 30.
     */
    spread?: number

    /**
     * The amount that the (visual) angle of the particle should change by. Default is 0.
     */
    rotation?: number
    /**
     * The starting speed of the particle. Default is 15.
     */
    speed?: number
    /**
     * The amount the particle should accelerate downwards. Default is 0.
     */
    gravity?: number

    /**
     * The starting coordinates of the particle. Default is at the mouse position.
     */
    x?: number
    /**
     * The starting coordinates of the particle. Default is at the mouse position.
     */
    y?: number
    /**
     * How far from the start each particle should appear. Default is 10.
     */
    offset?: number
    /**
     * Set initially based on other properties, then used to update movement.
     */
    xVel?: number
    /**
     * Set initially based on other properties, then used to update movement.
     */
    yVel?: number

    /**
     * When changing tabs, if leaving the `layer` tab, this particle will be erased.
     */
    layer?: string

    /**
     * Called each tick. Lets you do more advanced visual and movement behaviors by changing other properties.
     */
    update?(): void
    /**
     * Called when the particle is interacted with.
     */
    onClick?(): void
    /**
     * Called when the particle is interacted with.
     */
    onMouseOver?(): void
    /**
     * Called when the particle is interacted with.
     */
    onMouseLeave?(): void
}

declare class TreeNode {
    /**
     * The node's color. (A string in hex format with a #)
     */
    color?: string
    /**
     * The text on the button (The id capitalized by default)
     */
    symbol?: string
    /**
     * Returns true if the player can click the node. ()
     */
    canClick?(): boolean
    /**
     * The function called when the node is clicked.
     */
    onClick?(): boolean
    /**
     * A function returning a bool which determines if this node should be visible.
     * It can also return "ghost", which will hide the layer,
     * but its node will still take up space in its tree.
     */
    layerShown?: Computable<number | 'ghost'>
    /**
     * An array of layer/node ids. On a tree, a line will appear from this node to all of the nodes in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
    /**
     * A CSS object, where the keys are CSS attributes, which styles this node on the tree.
     */
    nodeStyle?: Computable<CSSStyles>
    /**
     * Functions that return text, which is the tooltip for the node when the layer is unlocked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     */
    tooltip?: Computable<string>
    /**
     * Functions that return text, which is the tooltip for the node when the layer is locked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     */
    tooltipLocked?: Computable<string>
    /**
     * The row that this node appears in (for the default tree).
     */
    row?: number
    /**
     * Determines the horizontal position of the layer in its row in a default tree. By default, it uses the id,
     * and layers/nodes are sorted in alphabetical order.
     */
    position?: number
}

declare class Upgrade {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: string;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the upgradae was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Displayed at the top in a larger font. It can also be a function that returns updating text. Can use basic HTML.
     */
    title?: Computable<string>
    /**
     * A description of the upgrade's effect.
     * *You will also have to implement the effect where it is applied.*
     * It can also be a function that returns updating text. Can use basic HTML.
     */
    description: Computable<string>
    /**
     * A function that calculates and returns the current values of any bonuses from the upgrade.
     * Can return a value or an object containing multiple values.
     */
    effect?: Computable<any>
    /**
     * A function that returns a display of the current effects of the upgrade with formatting. Default displays nothing. Can use basic HTML.
     */
    effectDisplay?(): string
    /**
     * **OVERRIDE**
     *
     * Overrides the other displays and descriptions, and lets you set the full text for the upgrade. Can use basic HTML.
     */
    fullDisplay?: Computable<string>
    /**
     * **sort of optional**
     *
     * A Decimal for the cost of the upgrade.
     * By default, upgrades cost the main prestige currency for the layer.
     */
    cost?: Computable<Decimal>
    /**
     * A function returning a bool to determine if the upgrade is visible or not. Default is unlocked.
     */
    unlocked?: Computable<boolean>
    /**
     * This function will be called when the upgrade is purchased.
     * Good for upgrades like "makes this layer act like it was unlocked first".
     */
    onPurchase?(): void
    /**
     * Applies CSS to this upgrade, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * Adds a tooltip to this upgrade, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     */
    tooltip?: Computable<string>
    /**
     * **OVERRIDE**
     *
     * A function determining if you are able to buy the upgrade.
     *
     * (If you also have a cost, it will check both the cost and this function)
     */
    canAfford?(): boolean
    /**
     * **OVERRIDE**
     *
     * A function that reduces your currencies when you buy the upgrade.
     */
    pay?(): void
    /**
     * This is primarially useful for upgrade trees. An array of upgrade ids.
     * A line will appear from this upgrade to all of the upgrades in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the upgrade id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
}
declare class CurrencyUpgrade<T> extends Upgrade {
    /**
     * The name to display for the currency for the upgrade.
     */
    currencyDisplayName: string
    /**
     * The internal name for that currency.
     */
    currencyInternalName: keyof T
    /**
     * The internal name of the layer that currency is stored in.
     * If it's not in a layer (like Points), omit.
     * If it's not stored directly in a layer, instead use `currencyLocation`.
     */
    currencyLayer?: string
    /**
     * If your currency is stored in something inside a layer (e.g. a buyable's amount), you can access it this way.
     * This is a function returning the object in "player" that contains the value (like `player[this.layer].buyables`)
     */
    currencyLocation?(): T
}

declare class LayerData {
    unlocked: boolean
    points: Decimal
    total?: Decimal
    best?: Decimal
    unlockOrder?: string[]
    resetTime?: number
    upgrades?: number[]
    activeChallenge?: number | null
}