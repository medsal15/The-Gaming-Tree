// Exists for IDE purposes
// No function is actually implemented and the file is not loaded
class Decimal {
    /** @type {Number} */
    sign;
    /** @type {Number} */
    layer;
    /** @type {Number} */
    mag;
    /** @type {Number} */
    m;
    /** @type {Number} */
    e;
    /** @type {Number} */
    s;
    /** @type {Number} */
    mantissa;
    /** @type {Number} */
    exponent;
    /** @type {Decimal} */
    static dZero;
    /** @type {Decimal} */
    static dOne;
    /** @type {Decimal} */
    static dNegOne;
    /** @type {Decimal} */
    static dTwo;
    /** @type {Decimal} */
    static dTen;
    /** @type {Decimal} */
    static dNaN;
    /** @type {Decimal} */
    static dInf;
    /** @type {Decimal} */
    static dNegInf;
    /** @type {Decimal} */
    static dNumberMax;
    /** @type {Decimal} */
    static dNumberMin;

    /** @param {Decimal|String|Number} value */
    constructor(value);

    /**
    * @param {Number} sign
    * @param {Number} layer
    * @param {Number} mag
    * @returns {Decimal}
    */
    static fromComponents(sign, layer, mag);
    /**
    * @param {Number} sign
    * @param {Number} layer
    * @param {Number} mag
    * @returns {Decimal}
    */
    static fromComponents_noNormalize(sign, layer, mag);
    /**
    * @param {Number} mantissa
    * @param {Number} exponent
    * @returns {Decimal}
    */
    static fromMantissaExponent(mantissa, exponent);
    /**
    * @param {Number} mantissa
    * @param {Number} exponent
    * @returns {Decimal}
    */
    static fromMantissaExponent_noNormalize(mantissa, exponent);
    /**
    * @param {Decimal} value
    * @returns {Decimal}
    */
    static fromDecimal(value);
    /**
    * @param {Number} value
    * @returns {Decimal}
    */
    static fromNumber(value);
    /**
    * @param {String} value
    * @returns {Decimal}
    */
    static fromString(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static fromValue(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static fromValue_noAlloc(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static abs(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static neg(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static megate(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static negated(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static sign(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static sgn(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static round(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static floor(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static ceil(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static trunc(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static add(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static plus(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static sub(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static subtract(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static minus(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static mul(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static multiply(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static times(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static div(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static divide(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static recip(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static reciprocal(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static reciprocate(value);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Number}
    */
    static cmp(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Number}
    */
    static cmpabs(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Number}
    */
    static compare(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Boolean}
    */
    static eq(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Boolean}
    */
    static equals(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Boolean}
    */
    static neq(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Boolean}
    */
    static notEquals(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Boolean}
    */
    static lt(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Boolean}
    */
    static lte(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Boolean}
    */
    static gt(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Boolean}
    */
    static gte(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Decimal}
    */
    static max(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Decimal}
    */
    static min(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Decimal}
    */
    static minabs(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Decimal}
    */
    static maxabs(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} min
    * @param {Decimal|String|Number} max
    * @returns {Decimal}
    */
    static clamp(value, min, max);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} min
    * @returns {Decimal}
    */
    static clampMin(value, min);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} max
    * @returns {Decimal}
    */
    static clampMax(value, max);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Number}
    */
    static cmp_tolerance(value, other, tolerance);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Number}
    */
    static compare_tolerance(value, other, tolerance);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    static eq_tolerance(value, other, tolerance);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    static equals_tolerance(value, other, tolerance);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    static neq_tolerance(value, other, tolerance);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    static notEquals_tolerance(value, other, tolerance);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    static lt_tolerance(value, other, tolerance);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    static lte_tolerance(value, other, tolerance);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    static gt_tolerance(value, other, tolerance);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    static gte_tolerance(value, other, tolerance);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static pLog10(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static absLog10(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static log10(value);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} base
    * @returns {Decimal}
    */
    static log(value, base);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static log2(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static ln(value);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} base
    * @returns {Decimal}
    */
    static logarithm(value, base);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Decimal}
    */
    static pow(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static pow10(value);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} other
    * @returns {Decimal}
    */
    static root(value, other);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static factorial(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static gamma(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static lngamma(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static exp(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static sqr(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static sqrt(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static cube(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static cbrt(value);
    /**
    * @param {Decimal|String|Number} value
    * @param {Number} height
    * @param {Decimal|String|Number} payload
    * @returns {Decimal}
    */
    static tetrate(value, height = null, payload = null);
    /**
    * @param {Decimal|String|Number} value
    * @param {Number} height
    * @param {Decimal|String|Number} payload
    * @returns {Decimal}
    */
    static iteratedexp(value, height = null, payload = null);
    /**
    * @param {Decimal|String|Number} value
    * @param {Number} base
    * @param {Number} times
    * @returns {Decimal}
    */
    static iteratedlog(value, base = null, times = null);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} diff
    * @returns {Decimal}
    */
    static layeradd10(value, diff);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} diff
    * @param {Decimal|String|Number} base
    * @returns {Decimal}
    */
    static layeradd(value, diff, base = null);
    /**
    * @param {Decimal|String|Number} value
    * @param {Decimal|String|Number} base
    * @returns {Decimal}
    */
    static slog(value, base = null);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static lambertw(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    static ssqrt(value);
    /**
    * @param {Decimal|String|Number} value
    * @param {Number} height
    * @param {Decimal|String|Number} payload
    * @returns {Decimal}
    */
    static pentate(value, height = null, payload = null);
    /**
    * @param {Decimal|String|Number} resourcesAvailable
    * @param {Decimal|String|Number} priceStart
    * @param {Decimal|String|Number} priceRatio
    * @param {Decimal|String|Number} currentOwned
    * @returns {Decimal}
    */
    static affordGeometricSeries(resourcesAvailable, priceStart, priceRatio, currentOwned);
    /**
    * @param {Decimal|String|Number} numItems
    * @param {Decimal|String|Number} priceStart
    * @param {Decimal|String|Number} priceRatio
    * @param {Decimal|String|Number} currentOwned
    * @returns {Decimal}
    */
    static sumGeometricSeries(numItems, priceStart, priceRatio, currentOwned);
    /**
    * @param {Decimal|String|Number} resourcesAvailable
    * @param {Decimal|String|Number} priceStart
    * @param {Decimal|String|Number} priceRatio
    * @param {Decimal|String|Number} currentOwned
    * @returns {Decimal}
    */
    static affordArithmeticSeries(resourcesAvailable, priceStart, priceRatio, currentOwned);
    /**
    * @param {Decimal|String|Number} numItems
    * @param {Decimal|String|Number} priceStart
    * @param {Decimal|String|Number} priceRatio
    * @param {Decimal|String|Number} currentOwned
    * @returns {Decimal}
    */
    static sumArithmeticSeries(numItems, priceStart, priceRatio, currentOwned);
    /**
    * @param {Decimal|String|Number} cost
    * @param {Decimal|String|Number} currentRpS
    * @param {Decimal|String|Number} deltaRpS
    * @returns {Decimal}
    */
    static efficiencyOfPurchase(cost, currentRpS, deltaRpS);
    /**
    * @param {Decimal|String|Number} maxLayers
    * @returns {Decimal}
    */
    static randomDecimalForTesting(maxLayers);
    /**
    * @param {Decimal} resourcesAvailable
    * @param {Decimal} priceStart
    * @param {Decimal} priceRatio
    * @param {Decimal|String|Number} currentOwned
    * @returns {Decimal}
    */
    static affordGeometricSeries_core(resourcesAvailable, priceStart, priceRatio, currentOwned);
    /**
    * @param {Decimal|String|Number} numItems
    * @param {Decimal} priceStart
    * @param {Decimal} priceRatio
    * @param {Decimal|String|Number} currentOwned
    * @returns {Decimal}
    */
    static sumGeometricSeries_core(numItems, priceStart, priceRatio, currentOwned);
    /**
    * @param {Decimal} resourcesAvailable
    * @param {Decimal} priceStart
    * @param {Decimal} priceRatio
    * @param {Decimal} currentOwned
    * @returns {Decimal}
    */
    static affordArithmeticSeries_core(resourcesAvailable, priceStart, priceRatio, currentOwned);
    /**
    * @param {Decimal} numItems
    * @param {Decimal} priceStart
    * @param {Decimal} priceRatio
    * @param {Decimal} currentOwned
    * @returns {Decimal}
    */
    static sumArithmeticSeries_core(numItems, priceStart, priceRatio, currentOwned);
    /**
    * @param {Decimal} cost
    * @param {Decimal} currentRpS
    * @param {Decimal} deltaRpS
    * @returns {Decimal}
    */
    static efficiencyOfPurchase_core(cost, currentRpS, deltaRpS);

    /** @returns {Decimal} */
    normalize();
    /**
    * @param {Number} sign
    * @param {Number} layer
    * @param {Number} mag
    * @returns {Decimal}
    */
    fromComponents(sign, layer, mag);
    /**
    * @param {Number} sign
    * @param {Number} layer
    * @param {Number} mag
    * @returns {Decimal}
    */
    fromComponents_noNormalize(sign, layer, mag);
    /**
    * @param {Number} mantissa
    * @param {Number} exponent
    * @returns {Decimal}
    */
    fromMantissaExponent(mantissa, exponent);
    /**
    * @param {Number} mantissa
    * @param {Number} exponent
    * @returns {Decimal}
    */
    fromMantissaExponent_noNormalize(mantissa, exponent);
    /**
    * @param {Decimal} value
    * @returns {Decimal}
    */
    fromDecimal(value);
    /**
    * @param {Number} value
    * @returns {Decimal}
    */
    fromNumber(value);
    /**
    * @param {String} value
    * @returns {Decimal}
    */
    fromString(value);
    /**
    * @param {Decimal|String|Number} value
    * @returns {Decimal}
    */
    fromValue(value);
    /** @returns {Number} */
    toNumber();
    /**
    * @param {Number} places
    * @returns {Number}
    */
    mantissaWithDecimalPlaces(places);
    /**
    * @param {Number} places
    * @returns {Number}
    */
    magnitudeWithDecimalPlaces(places);
    /** @returns {String} */
    toString();
    /** @returns {String} */
    toExponential();
    /** @returns {String} */
    toFixed();
    /** @returns {String} */
    toPrecision();
    /** @returns {String} */
    valueOf();
    /** @returns {String} */
    toJSON();
    /** @returns {String} */
    toStringWithDecimalPlaces();
    /** @returns {Decimal} */
    neg();
    /** @returns {Decimal} */
    negate();
    /** @returns {Decimal} */
    negated();
    /** @returns {Decimal} */
    sign();
    /** @returns {Decimal} */
    sgn();
    /** @returns {Decimal} */
    round();
    /** @returns {Decimal} */
    floor();
    /** @returns {Decimal} */
    ceil();
    /** @returns {Decimal} */
    trunc();
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    add(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    plus(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    sub(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    subtract(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    minus(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    mul(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    multiply(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    times(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    div(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    divide(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    divideBy(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    dividedBy(value);
    /** @returns {Decimal} */
    recip();
    /** @returns {Decimal} */
    reciprocal();
    /** @returns {Decimal} */
    reciprocate();
    /**
    * @param {String|Number|Decimal} value
    * @returns {1|-1|0}
    */
    cmp(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {1|-1|0}
    */
    cmpabs(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {1|-1|0}
    */
    compare(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Boolean}
    */
    eq(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Boolean}
    */
    equals(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Boolean}
    */
    neq(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Boolean}
    */
    notEquals(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Boolean}
    */
    lt(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Boolean}
    */
    lte(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Boolean}
    */
    gt(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Boolean}
    */
    gte(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    max(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    min(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    maxabs(value);
    /**
    * @param {String|Number|Decimal} value
    * @returns {Decimal}
    */
    minabs(value);
    /**
    * @param {Decimal|String|Number} min
    * @param {Decimal|String|Number} max
    * @returns {Decimal}
    */
    clamp(min, max);
    /**
    * @param {Decimal|String|Number} min
    * @returns {Decimal}
    */
    clampMin(min);
    /**
    * @param {Decimal|String|Number} max
    * @returns {Decimal}
    */
    clampMax(max);
    /**
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Number}
    */
    cmp_tolerance(other, tolerance);
    /**
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Number}
    */
    compare_tolerance(other, tolerance);
    /**
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    eq_tolerance(other, tolerance);
    /**
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    equals_tolerance(other, tolerance);
    /**
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    neq_tolerance(other, tolerance);
    /**
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    notEquals_tolerance(other, tolerance);
    /**
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    lt_tolerance(other, tolerance);
    /**
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    lte_tolerance(other, tolerance);
    /**
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    gt_tolerance(other, tolerance);
    /**
    * @param {Decimal|String|Number} other
    * @param {Number} tolerance
    * @returns {Boolean}
    */
    gte_tolerance(other, tolerance);
    /**
    * @returns {Decimal}
    */
    pLog10();
    /**
    * @returns {Decimal}
    */
    absLog10();
    /**
    * @returns {Decimal}
    */
    log10();
    /**
    * @param {Decimal|String|Number} base
    * @returns {Decimal}
    */
    log(base);
    /**
    * @returns {Decimal}
    */
    log2();
    /**
    * @returns {Decimal}
    */
    ln();
    /**
    * @param {Decimal|String|Number} base
    * @returns {Decimal}
    */
    logarithm(base);
    /**
    * @param {Decimal|String|Number} other
    * @returns {Decimal}
    */
    pow(other);
    /**
    * @returns {Decimal}
    */
    pow10();
    /**
    * @param {Decimal|String|Number} other
    * @returns {Decimal}
    */
    pow_base(other);
    /**
    * @param {Decimal|String|Number} other
    * @returns {Decimal}
    */
    root(other);
    /**
    * @returns {Decimal}
    */
    factorial();
    /**
    * @returns {Decimal}
    */
    gamma();
    /**
    * @returns {Decimal}
    */
    lngamma();
    /**
    * @returns {Decimal}
    */
    exp();
    /**
    * @returns {Decimal}
    */
    sqr();
    /**
    * @returns {Decimal}
    */
    sqrt();
    /**
    * @returns {Decimal}
    */
    cube();
    /**
    * @returns {Decimal}
    */
    cbrt();
    /**
    * @param {Number} height
    * @param {Decimal|String|Number} payload
    * @returns {Decimal}
    */
    tetrate(height = null, payload = null);
    /**
    * @param {Number} height
    * @param {Decimal|String|Number} payload
    * @returns {Decimal}
    */
    iteratedexp(height = null, payload = null);
    /**
    * @param {Number} base
    * @param {Number} times
    * @returns {Decimal}
    */
    iteratedlog(base = null, times = null);
    /**
    * @param {Decimal|String|Number} diff
    * @param {Decimal|String|Number} base
    * @returns {Decimal}
    */
    layeradd(diff, base = null);
    /**
    * @param {Decimal|String|Number} diff
    * @returns {Decimal}
    */
    layeradd10(diff);
    /**
    * @param {Decimal|String|Number} diff
    * @param {Decimal|String|Number} base
    * @returns {Decimal}
    */
    layeradd(diff, base = null);
    /**
    * @returns {Decimal}
    */
    lambertw();
    /**
    * @returns {Decimal}
    */
    ssqrt();
    /**
    * @param {Number} height
    * @param {Decimal|String|Number} payload
    * @returns {Decimal}
    */
    pentate(height = null, payload = null);
    /**
    * @returns {Decimal}
    */
    sin();
    /**
    * @returns {Decimal}
    */
    cos();
    /**
    * @returns {Decimal}
    */
    tan();
    /**
    * @returns {Decimal}
    */
    asin();
    /**
    * @returns {Decimal}
    */
    acos();
    /**
    * @returns {Decimal}
    */
    atan();
    /**
    * @returns {Decimal}
    */
    sinh();
    /**
    * @returns {Decimal}
    */
    cosh();
    /**
    * @returns {Decimal}
    */
    tanh();
    /**
    * @returns {Decimal}
    */
    asinh();
    /**
    * @returns {Decimal}
    */
    acosh();
    /**
    * @returns {Decimal}
    */
    atanh();
    /**
    * @returns {Decimal}
    */
    atanh();
    /**
    * @param {String|Number|Decimal} ascensions
    * @returns {Decimal}
    */
    ascensionPenalty(ascensions);
    /**
    * @returns {Decimal}
    */
    egg();
    /**
    * @param {String|Number|Decimal} other
    * @returns {Boolean}
    */
    lessThanOrEqualTo(other);
    /**
    * @param {String|Number|Decimal} other
    * @returns {Boolean}
    */
    lessThan(other);
    /**
    * @param {String|Number|Decimal} other
    * @returns {Boolean}
    */
    greaterThanOrEqualTo(other);
    /**
    * @param {String|Number|Decimal} other
    * @returns {Boolean}
    */
    greaterThan(other);
}
