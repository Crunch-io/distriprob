"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * (C) Copyright John Maddock 2006.
 * (C) Copyright Paul A. Bristow 2007.
 * (C) Copyright Zachary Martin 2016 (port to JavaScript).
 * Use, modification and distribution are subject to the
 * Boost Software License:
 *
 * Permission is hereby granted, free of charge, to any person or organization
 * obtaining a copy of the software and accompanying documentation covered by
 * this license (the "Software") to use, reproduce, display, distribute,
 * execute, and transmit the Software, and to prepare derivative works of the
 * Software, and to permit third-parties to whom the Software is furnished to
 * do so, all subject to the following:
 *
 * The copyright notices in the Software and this entire statement, including
 * the above license grant, this restriction and the following disclaimer,
 * must be included in all copies of the Software, in whole or in part, and
 * all derivative works of the Software, unless such copies or derivative
 * works are solely in the form of machine-executable object code generated by
 * a source language processor.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE SOFTWARE BE LIABLE
 * FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */
var Beta = require("./boostPorts/special_functions/beta").Beta;
var InvDiscreteQuantile = require("./boostPorts/distributions/detail/inv_discrete_quantile").InvDiscreteQuantile;
var ErfInv = require("./boostPorts/special_functions/detail/erf_inv").ErfInv;
var Constants = require("./boostPorts/tools/constants").Constants;
var Random = require("./random").Random;
var check = require("./errorHandling").check;
var BinomialDist = /** @class */ (function () {
    function BinomialDist() {
    }
    BinomialDist.checkParameters = function (functionName, trials, probSuccess, k, lowerTail, p, n, seed) {
        var params = {
            lowerTail: undefined
        };
        check(trials, "trials", "binomial distribution " + functionName, "nonnegative_real");
        check(probSuccess, "probability of success", "binomial distribution " + functionName, "probability");
        if (typeof k !== "undefined") {
            check(k, "k", "binomial distribution " + functionName, "real");
        }
        if (typeof lowerTail !== "undefined" && lowerTail !== null) {
            check(lowerTail, "lowerTail", "binomial distribution " + functionName, "boolean");
            params.lowerTail = lowerTail;
        }
        else {
            params.lowerTail = true;
        }
        if (typeof p !== "undefined") {
            check(p, "p", "binomial distribution " + functionName, "probability");
        }
        if (typeof n !== "undefined") {
            check(n, "n", "binomial distribution " + functionName, "nonnegative_integer");
        }
        if (typeof seed !== "undefined" && seed !== null) {
            check(seed, "seed", "binomial distribution " + functionName, "seed");
        }
        return params;
    };
    BinomialDist.pdf = function (k, trials, probSuccess) {
        var params = BinomialDist.checkParameters("pdf", trials, probSuccess, k);
        var p = probSuccess;
        if (k < 0 || k > trials) {
            return 0;
        }
        else if (p === 0) {
            if (k === 0) {
                return 1;
            }
            else {
                return 0;
            }
        }
        else if (p === 1) {
            if (k === trials) {
                return 1;
            }
            else {
                return 0;
            }
        }
        else if (trials === 0) {
            return 1;
        }
        else if (k === 0) {
            return Math.pow(1 - p, trials);
        }
        else if (k === trials) {
            return Math.pow(p, k);
        }
        else {
            return Beta.ibeta_derivative(k + 1, trials - k + 1, p) / (trials + 1);
        }
    };
    BinomialDist.cdf = function (k, trials, probSuccess, lowerTail) {
        var params = BinomialDist.checkParameters("cdf", trials, probSuccess, k, lowerTail);
        if (k < 0) {
            return params.lowerTail ? 0 : 1;
        }
        else if (k >= trials) {
            return params.lowerTail ? 1 : 0;
        }
        else if (probSuccess === 0) {
            return params.lowerTail ? 1 : 0;
        }
        else if (probSuccess === 1) {
            return params.lowerTail ? 0 : 1;
        }
        else {
            if (params.lowerTail) {
                return Beta.ibetac(k + 1, trials - k, probSuccess);
            }
            else {
                return Beta.ibeta(k + 1, trials - k, probSuccess);
            }
        }
    };
    BinomialDist.quantile = function (p, trials, probSuccess, lowerTail) {
        var params = BinomialDist.checkParameters("quantile", trials, probSuccess, undefined, lowerTail, p);
        function simplifiedPDF(val) {
            return BinomialDist.pdf(val, trials, probSuccess);
        }
        function simplifiedCDF(val, lt) {
            return BinomialDist.cdf(val, trials, probSuccess, lt);
        }
        if (p === 0) {
            if (params.lowerTail) {
                return 0;
            }
            else {
                return trials;
            }
        }
        else if (p === 1) {
            if (params.lowerTail) {
                return trials;
            }
            else {
                return 0;
            }
        }
        else if (probSuccess === 1) {
            // our formulas break down in this case
            return trials;
        }
        else {
            var max_iter = 50;
            var pp = params.lowerTail ? p : 1 - p;
            var qq = params.lowerTail ? 1 - p : p;
            var guess = BinomialDist.inverse_binomial_cornish_fisher(trials, probSuccess, pp, qq);
            var factor = 8;
            if (trials > 100) {
                factor = 1.01; // guess is pretty accurate
            }
            else if ((trials > 10) && (trials - 1 > guess) && (guess > 3)) {
                factor = 1.15; // less accurate but OK.
            }
            else if (trials < 10) {
                // pretty inaccurate guess in this area:
                if (guess > trials / 64) {
                    guess = trials / 4;
                    factor = 2;
                }
                else {
                    guess = trials / 1024;
                }
            }
            else {
                factor = 2; // trials largish, but in far tails.
            }
            return InvDiscreteQuantile.inverse_discrete_quantile(simplifiedPDF, simplifiedCDF, params.lowerTail ? pp : qq, !params.lowerTail, guess, factor, 1, "up", max_iter, trials, 0);
        }
    };
    BinomialDist.random = function (n, trials, probSuccess, seed) {
        var params = BinomialDist.checkParameters("random", trials, probSuccess, undefined, undefined, undefined, n, seed);
        return Random.numbers(n, BinomialDist.quantile, [trials, probSuccess, true], seed);
    };
    BinomialDist.randomIterator = function (n, trials, probSuccess, seed) {
        if (typeof n === "undefined" || n === null) {
            n = Number.POSITIVE_INFINITY;
        }
        var params = BinomialDist.checkParameters("randomIterator", trials, probSuccess, undefined, undefined, undefined, n, seed);
        return Random.numberIterator(n, BinomialDist.quantile, [trials, probSuccess, true], seed);
    };
    BinomialDist.inverse_binomial_cornish_fisher = function (n, sf, p, q) {
        // mean:
        var m = n * sf;
        // standard deviation:
        var sigma = Math.sqrt(n * sf * (1 - sf));
        // skewness
        var sk = (1 - 2 * sf) / sigma;
        // kurtosis:
        // T k = (1 - 6 * sf * (1 - sf) ) / (n * sf * (1 - sf));
        // Get the inverse of a std normal distribution:
        var x = ErfInv.erfc_inv(p > q ? 2 * q : 2 * p) * Constants.SQRT2();
        // Set the sign:
        if (p < 0.5) {
            x = -x;
        }
        var x2 = x * x;
        // w is correction term due to skewness
        var w = x + sk * (x2 - 1) / 6;
        /*
         // Add on correction due to kurtosis.
         // Disabled for now, seems to make things worse?
         //
         if(n >= 10)
         w += k * x * (x2 - 3) / 24 + sk * sk * x * (2 * x2 - 5) / -36;
         */
        w = m + sigma * w;
        if (w < Number.MIN_VALUE) {
            return Math.sqrt(Number.MIN_VALUE);
        }
        if (w > n) {
            return n;
        }
        return w;
    };
    return BinomialDist;
}()); // end of class Binomial
exports.BinomialDist = BinomialDist;
