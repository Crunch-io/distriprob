"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * (C) Copyright 2014 David Bau.
 * (C) Copyright 2016 Zachary Martin (modifications for Distriprob library)
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var Utility = require("./utility").Utility;
var Random = /** @class */ (function () {
    /**
     * The ARC4 constructor
     * @param seed - a key in the form of an array of at most (width) integers that should
     *              be 0 <= x < (width), or a previous IRandomState
     */
    function Random(seed) {
        if (Random.isIRandomState(seed)) {
            console.log("re-establishing random");
            this._i = seed.i;
            this._j = seed.j;
            this._s = seed.s.slice();
        }
        else {
            var key = [];
            var shortseed = Random.mixkey(seed !== null && typeof seed !== "undefined" ? seed + "\0" : Random.autoseed(), key);
            this._i = 0;
            this._j = 0;
            this._s = [];
            // The empty key [] is treated as [0].
            if (key.length === 0) {
                key = [0];
            }
            var keylen = key.length;
            var t = void 0;
            // Set up S using the standard key scheduling algorithm.
            while (this._i < Random.WIDTH()) {
                this._s[this._i] = this._i++;
            }
            for (this._i = 0; this._i < Random.WIDTH(); this._i++) {
                this._s[this._i] = this._s[this._j = Random.MASK() & (this._j +
                    key[this._i % keylen] + (t = this._s[this._i]))];
                this._s[this._j] = t;
            }
            // For robust unpredictability, the function call below automatically
            // discards an initial batch of values.  This is called RC4-drop[256].
            // See http://google.com/search?q=rsa+fluhrer+response&btnI
            this.g(Random.WIDTH());
        }
    }
    // *****The following constants are related to IEEE 754 limits*********
    Random.WIDTH = function () { return 256; };
    ; // each RC4 output is 0 <= x < 256
    Random.MASK = function () { return Random.WIDTH() - 1; };
    // at least six RC4 outputs for each double
    Random.CHUNKS = function () { return 6; };
    // there are 53 significant digits in a double
    Random.DIGITS = function () { return 53; };
    Random.START_DENOM = function () { return Math.pow(Random.WIDTH(), Random.CHUNKS()); };
    Random.SIGNIFICANCE = function () { return Math.pow(2, Random.DIGITS()); };
    Random.OVERFLOW = function () { return Random.SIGNIFICANCE() * 2; };
    /**
     * The g(count) method returns a pseudorandom integer that concatenates
     * the next (count) outputs from ARC4.  Its return value is a number x
     * that is in the range 0 <= x < (width ^ count).
     * @param count
     */
    Random.prototype.g = function (count) {
        // Using instance members instead of closure state nearly doubles speed.
        var t, r = 0;
        while (count--) {
            t = this._s[this._i = Random.MASK() & (this._i + 1)];
            r = r * Random.WIDTH() + this._s[Random.MASK() &
                ((this._s[this._i] = this._s[this._j = Random.MASK() & (this._j + t)]) +
                    (this._s[this._j] = t))];
        }
        return r;
    };
    // This function returns a random double in [0, 1) that contains
    // randomness in every bit of the mantissa of the IEEE 754 value.
    Random.prototype.double = function () {
        var n = this.g(Random.CHUNKS()), // Start with a numerator n < 2 ^ 48
        d = Random.START_DENOM(), //   and denominator d = 2 ^ 48.
        x = 0; //   and no 'extra last byte'.
        while (n < Random.SIGNIFICANCE()) {
            n = (n + x) * Random.WIDTH(); //   shifting numerator and
            d *= Random.WIDTH(); //   denominator and generating a
            x = this.g(1); //   new least-significant-byte.
        }
        while (n >= Random.OVERFLOW()) {
            n /= 2; //   last byte, shift everything
            d /= 2; //   right using integer math until
            x >>>= 1; //   we have exactly the desired bits.
        }
        return (n + x) / d; // Form the number within [0, 1).
    };
    Random.prototype.int32 = function () { return this.g(4) | 0; };
    Random.prototype.quick = function () { return this.g(4) / 0x100000000; };
    Object.defineProperty(Random.prototype, "i", {
        get: function () {
            return this.i;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Random.prototype, "j", {
        get: function () {
            return this.j;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Random.prototype, "s", {
        get: function () {
            return this.s.slice();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Random.prototype, "state", {
        get: function () {
            return {
                i: this._i,
                j: this._j,
                s: this._s
            };
        },
        enumerable: true,
        configurable: true
    });
    Random.numbers = function (n, quantileFctn, quantileFctnArgs, seed, thisRef) {
        var result = [];
        var iter = Random.numberIterator(n, quantileFctn, quantileFctnArgs, seed, thisRef);
        for (var _a = 0, iter_1 = iter; _a < iter_1.length; _a++) {
            var randomVal = iter_1[_a];
            result.push(randomVal);
        }
        return result;
    };
    Random.numberIterator = function (n, quantileFctn, quantileFctnArgs, seed, thisRef) {
        var rng = new Random(seed);
        var k = 0;
        function next() {
            var randomDouble = rng.double();
            var args = [randomDouble].concat(quantileFctnArgs);
            if (k < n) {
                k++;
                return {
                    value: quantileFctn.apply(thisRef, args),
                    done: false
                };
            }
            else {
                return {
                    value: NaN,
                    done: true
                };
            }
        }
        function symbolIterator() {
            return _a = {},
                _a[Symbol.iterator] = symbolIterator,
                _a.next = next,
                _a;
            var _a;
        }
        var iterator = (_a = {
                next: next
            },
            _a[Symbol.iterator] = symbolIterator,
            _a.state = function () { return rng.state; },
            _a);
        return iterator;
        var _a;
    };
    /**
     * flatten()
     * Converts an object tree to a string
     */
    Random.flatten = function (obj, depth) {
        var result = [], typ = typeof obj, prop;
        if (depth && typ === "object") {
            for (prop in obj) {
                try {
                    result.push(Random.flatten(obj[prop], depth - 1));
                }
                catch (e) { }
            }
        }
        return result + "";
    };
    /**
     * mixkey()
     * Mixes a string seed into a key that is an array of integers, and
     * returns a shortened string seed that is equivalent to the result key.
     */
    Random.mixkey = function (seed, key) {
        var stringseed = seed + '';
        var smear;
        var j = 0;
        while (j < stringseed.length) {
            key[Random.MASK() & j] =
                Random.MASK() & ((smear ^= key[Random.MASK() & j] * 19) +
                    stringseed.charCodeAt(j++));
        }
        return Random.tostring(key);
    };
    /**
     * autoseed()
     * Returns an object for autoseeding, using window.crypto and Node crypto
     * module if available.
     */
    Random.autoseed = function () {
        if (Utility.environmentIsNode()) {
            var crypto_1 = require("crypto");
            return Random.tostring(crypto_1.randomBytes(Random.WIDTH()));
        }
        else if (crypto) {
            var out = new Uint8Array(Random.WIDTH());
            crypto.getRandomValues(out);
            return Random.tostring(out);
        }
        else {
            // mix a few bits from the built-in RNG into the entropy pool.  Because we do
            // not want to interfere with deterministic PRNG state later, we will not call
            // math.random on its own again after initialization.
            var pool = [];
            Random.mixkey(Math.random(), pool);
            var browser = window.navigator;
            var plugins = browser && browser.plugins;
            return Random.flatten([+new Date(), window, plugins, window.screen, Random.tostring(pool)], 3);
        }
    };
    Random.tostring = function (a) {
        return String.fromCharCode.apply(null, a);
    };
    Random.isIRandomState = function (obj) {
        if (!obj) {
            return false;
        }
        if (typeof obj.i !== "number") {
            return false;
        }
        if (typeof obj.j !== "number") {
            return false;
        }
        if (!Array.isArray(obj.s)) {
            return false;
        }
        for (var _a = 0, _b = obj.s; _a < _b.length; _a++) {
            var element = _b[_a];
            if (typeof element !== "number") {
                return false;
            }
        }
        return true;
    };
    return Random;
}());
exports.Random = Random;
