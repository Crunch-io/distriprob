"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * (C) Copyright John Maddock 2008.
 * (C) Copyright Zachary Martin 2016 (port to javascript).
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
var Precision = require("../tools/precision").Precision;
var Gamma = require("../special_functions/gamma").Gamma;
var Beta = require("../special_functions/beta").Beta;
var Toms748 = require("../tools/toms748_solve").Toms748;
var Sign = require("../special_functions/sign").Sign;
var Series = require("../tools/series").Series;
var NonCentralBeta = /** @class */ (function () {
    function NonCentralBeta() {
    }
    NonCentralBeta.non_central_beta_p = function (a, b, lam, x, y, init_val) {
        if (init_val === void 0) { init_val = 0; }
        //
        // Variables come first:
        //
        var max_iter = 500000;
        var errtol = Precision.epsilon();
        var l2 = lam / 2;
        //
        // k is the starting point for iteration, and is the
        // maximum of the poisson weighting term,
        // note that unlike other similar code, we do not set
        // k to zero, when l2 is small, as forward iteration
        // is unstable:
        //
        var k = Math.trunc(l2);
        if (k === 0) {
            k = 1;
        }
        // Starting PoissonDist weight:
        var pois = Gamma.gamma_p_derivative(k + 1, l2);
        if (pois === 0) {
            return init_val;
        }
        var betaObj = x < y ?
            Beta.ibeta_imp(a + k, b, x, false, true)
            :
                Beta.ibeta_imp(b, a + k, y, true, true);
        // recurrence term:
        var xterm = betaObj.pderivative;
        // Starting beta term:
        var beta = betaObj.result;
        xterm *= y / (a + b + k - 1);
        var poisf = pois;
        var betaf = beta;
        var xtermf = xterm;
        var sum = init_val;
        if ((beta === 0) && (xterm === 0)) {
            return init_val;
        }
        //
        // Backwards recursion first, this is the stable
        // direction for recursion:
        //
        var last_term = 0;
        var count = k;
        for (var i = k; i >= 0; i--) {
            var term = beta * pois;
            sum += term;
            if (((Math.abs(term / sum) < errtol) && (last_term >= term)) || (term === 0)) {
                count = k - i;
                break;
            }
            pois *= i / l2;
            beta += xterm;
            xterm *= (a + i - 1) / (x * (a + b + i - 2));
            last_term = term;
        }
        for (var i = k + 1;; i++) {
            poisf *= l2 / i;
            xtermf *= (x * (a + b + i - 2)) / (a + i - 1);
            betaf -= xtermf;
            var term = poisf * betaf;
            sum += term;
            if ((Math.abs(term / sum) < errtol) || (term === 0)) {
                break;
            }
            if (count + i - k > max_iter) {
                console.log("count:", count + i - k);
                throw new Error("Evaluation error: Series did not converge, closest value was " + sum);
            }
        }
        return sum;
    };
    NonCentralBeta.non_central_beta_q = function (a, b, lam, x, y, init_val) {
        if (init_val === void 0) { init_val = 0; }
        //
        // Variables come first:
        //
        var max_iter = 500000;
        var errtol = Precision.epsilon();
        var l2 = lam / 2;
        //
        // k is the starting point for iteration, and is the
        // maximum of the poisson weighting term:
        //
        var k = Math.trunc(l2);
        var pois;
        if (k <= 30) {
            //
            // Might as well start at 0 since we'll likely have this number of terms anyway:
            //
            if (a + b > 1) {
                k = 0;
            }
            else if (k === 0) {
                k = 1;
            }
        }
        if (k === 0) {
            // Starting PoissonDist weight:
            pois = Math.exp(-l2);
        }
        else {
            // Starting PoissonDist weight:
            pois = Gamma.gamma_p_derivative(k + 1, l2);
        }
        if (pois === 0) {
            return init_val;
        }
        var betaObj = x < y ?
            Beta.ibeta_imp(a + k, b, x, true, true)
            :
                Beta.ibeta_imp(b, a + k, y, false, true);
        // recurance term:
        var xterm = betaObj.pderivative;
        // Starting beta term:
        var beta = betaObj.result;
        xterm *= y / (a + b + k - 1);
        var poisf = pois;
        var betaf = beta;
        var xtermf = xterm;
        var sum = init_val;
        if ((beta === 0) && (xterm === 0)) {
            return init_val;
        }
        //
        // Forwards recursion first, this is the stable
        // direction for recursion, and the location
        // of the bulk of the sum:
        //
        var last_term = 0;
        var count = 0;
        for (var i = k + 1;; i++) {
            poisf *= l2 / i;
            xtermf *= (x * (a + b + i - 2)) / (a + i - 1);
            betaf += xtermf;
            var term = poisf * betaf;
            sum += term;
            if ((Math.abs(term / sum) < errtol) && (last_term >= term)) {
                count = i - k;
                break;
            }
            if ((i - k) > max_iter) {
                throw new Error("Evaluation error: Series did not converge, closest" + "" + " value was " + sum);
            }
            last_term = term;
        }
        for (var i = k; i >= 0; i--) {
            var term = beta * pois;
            sum += term;
            if (Math.abs(term / sum) < errtol) {
                count += k - i;
                break;
            }
            if ((count + k - i) > max_iter) {
                throw new Error("Evaluation error: Series did not converge, closest" + "" + " value was " + sum);
            }
            pois *= i / l2;
            beta -= xterm;
            xterm *= (a + i - 1) / (x * (a + b + i - 2));
        }
        return sum;
    };
    NonCentralBeta.non_central_beta_cdf = function (x, y, a, b, l, invert) {
        if (x === 0) {
            return invert ? 1.0 : 0.0;
        }
        if (y === 0) {
            return invert ? 0.0 : 1.0;
        }
        var result;
        var c = a + b + l / 2;
        var cross = 1 - (b / c) * (1 + l / (2 * c * c));
        if (l === 0) {
            if (x === 0) {
                result = invert ? 1 : 0;
            }
            if (x === 1) {
                result = invert ? 0 : 1;
            }
            return invert ? Beta.ibetac(a, b, x) : Beta.ibeta(a, b, x);
        }
        else if (x > cross) {
            // Complement is the smaller of the two:
            result = NonCentralBeta.non_central_beta_q(a, b, l, x, y, invert ? 0 : -1);
            invert = !invert;
        }
        else {
            result = NonCentralBeta.non_central_beta_p(a, b, l, x, y, invert ? -1 : 0);
        }
        if (invert) {
            result = -result;
        }
        return result;
    };
    NonCentralBeta.nc_beta_quantile_functor = function (a, b, l, t, c) {
        var target = t;
        var complement = c;
        return function (x) {
            var cdfEval = NonCentralBeta.non_central_beta_cdf(x, 1 - x, a, b, l, complement);
            return complement ? target - cdfEval : cdfEval - target;
        };
    };
    NonCentralBeta.bracket_and_solve_root01 = function (f, guess, factor, rising, tol, max_iter) {
        //
        // Set up inital brackets:
        //
        var a = guess;
        var b = a;
        var fa = f(a);
        var fb = fa;
        //
        // Set up invocation count:
        //
        var count = max_iter - 1;
        if ((fa < 0) == (guess < 0 ? !rising : rising)) {
            //
            // Zero is to the right of b, so walk upwards
            // until we find it:
            //
            while (Sign.sign(fb) === Sign.sign(fa)) {
                if (count === 0) {
                    throw new Error("Evaluation error: Unable to bracket root, last nearest" + "" + " value was " + b);
                }
                //
                // Heuristic: every 20 iterations we double the growth factor in case the
                // initial guess was *really* bad !
                //
                if ((max_iter - count) % 20 === 0) {
                    factor *= 2;
                }
                //
                // Now go ahead and move our guess by "factor",
                // we do this by reducing 1-guess by factor:
                //
                a = b;
                fa = fb;
                b = 1 - ((1 - b) / factor);
                fb = f(b);
                count--;
            }
        }
        else {
            //
            // Zero is to the left of a, so walk downwards
            // until we find it:
            //
            while (Sign.sign(fb) === Sign.sign(fa)) {
                if (Math.abs(a) < Number.MIN_VALUE) {
                    // Escape route just in case the answer is zero!
                    max_iter -= count;
                    max_iter += 1;
                    return a > 0 ?
                        { a: 0, b: a, iterations: max_iter }
                        :
                            { a: a, b: 0, iterations: max_iter };
                }
                if (count === 0) {
                    throw new Error("Evaluation error: Unable to bracket root, last nearest" + "" + " value was " + a);
                }
                //
                // Heuristic: every 20 iterations we double the growth factor in case the
                // initial guess was *really* bad !
                //
                if ((max_iter - count) % 20 === 0) {
                    factor *= 2;
                }
                //
                // Now go ahead and move are guess by "factor":
                //
                b = a;
                fb = fa;
                a /= factor;
                fa = f(a);
                count--;
            }
        }
        max_iter -= count;
        max_iter += 1;
        var r = Toms748.toms748_solve(f, (a < 0 ? b : a), (a < 0 ? a : b), (a < 0 ? fb : fa), (a < 0 ? fa : fb), tol, count);
        r.iterations += max_iter;
        return r;
    };
    NonCentralBeta.nc_beta_quantile = function (a, b, l, p, comp) {
        //
        // Special cases first:
        //
        if (p === 0) {
            return comp ? 1.0 : 0.0;
        }
        if (p === 1) {
            return !comp ? 1.0 : 0.0;
        }
        var c = a + b + l / 2;
        var mean = 1 - (b / c) * (1 + l / (2 * c * c));
        var guess = mean;
        var f = NonCentralBeta.nc_beta_quantile_functor(a, b, l, p, comp);
        var tol = Toms748.eps_tolerance(53);
        var max_iter = 500;
        var ir = NonCentralBeta.bracket_and_solve_root01(f, guess, 2.5, true, tol, max_iter);
        var result = ir.a + (ir.b - ir.a) / 2;
        return result;
    };
    NonCentralBeta.non_central_beta_pdf = function (a, b, lam, x, y) {
        //
        // Special cases:
        //
        if ((x === 0) || (y === 0)) {
            return 0;
        }
        //
        // Variables come first:
        //
        var max_iter = 50;
        var errtol = Precision.epsilon();
        var l2 = lam / 2;
        //
        // k is the starting point for iteration, and is the
        // maximum of the poisson weighting term:
        //
        var k = Math.trunc(l2);
        // Starting PoissonDist weight:
        var pois = Gamma.gamma_p_derivative(k + 1, l2);
        // Starting beta term:
        var beta = x < y ?
            Beta.ibeta_derivative(a + k, b, x)
            :
                Beta.ibeta_derivative(b, a + k, y);
        var sum = 0;
        var poisf = pois;
        var betaf = beta;
        //
        // Stable backwards recursion first:
        //
        var count = k;
        for (var i = k; i >= 0; i--) {
            var term = beta * pois;
            sum += term;
            if ((Math.abs(term / sum) < errtol) || (term === 0)) {
                count = k - i;
                break;
            }
            pois *= i / l2;
            beta *= (a + i - 1) / (x * (a + i + b - 1));
        }
        for (var i = k + 1;; i++) {
            poisf *= l2 / i;
            betaf *= x * (a + b + i - 1) / (a + i - 1);
            var term = poisf * betaf;
            sum += term;
            if ((Math.abs(term / sum) < errtol) || (term === 0)) {
                break;
            }
            if ((count + i - k) > max_iter) {
                throw new Error("Evaluation error: Series did not converge, closest value" + "" + " was " + sum);
            }
        }
        return sum;
    };
    NonCentralBeta.nc_beta_pdf = function (a, b, lam, x) {
        if (lam === 0) {
            return Beta.ibeta_derivative(a, b, x);
        }
        return NonCentralBeta.non_central_beta_pdf(a, b, lam, x, 1 - x);
    };
    NonCentralBeta.hypergeometric_2F2_sum = function (a1, a2, b1, b2, z) {
        var term, k, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    term = 1;
                    k = 0;
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    result = term;
                    term *= a1 * a2 / (b1 * b2);
                    a1 += 1;
                    a2 += 1;
                    b1 += 1;
                    b2 += 1;
                    k += 1;
                    term /= k;
                    term *= z;
                    return [4 /*yield*/, result];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    };
    NonCentralBeta.hypergeometric_2F2 = function (a1, a2, b1, b2, z) {
        var s = NonCentralBeta.hypergeometric_2F2_sum(a1, a2, b1, b2, z);
        var max_iter = 50;
        var result = Series.sum_series(s, Precision.epsilon(), max_iter, 0);
        return result.sum;
    };
    return NonCentralBeta;
}());
exports.NonCentralBeta = NonCentralBeta;
var a = 1.992940368652343750000000000000000000000e2; //3;
var b = 9.964702148437500000000000000000000000000e2; //1;
var ncp = 1.962219390869140625000000000000000000000e2; //0;
var x = 4.865405857563018798828125000000000000000e-1; //0.24435906140769345;
var p = 0.01;
var y = 1 - x;
var invert = true;
