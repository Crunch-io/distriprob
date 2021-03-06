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
 * (C) Copyright John Maddock 2005-2006.
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
var Rational = require("../tools/rational").Rational;
var Series = require("../tools/series").Series;
var Log1p = /** @class */ (function () {
    function Log1p() {
    }
    /**
     * Functor log1p_series returns the next term in the Taylor series
     *   pow(-1, k-1)*pow(x, k) / k
     * each time that operator() is invoked.
     */
    Log1p.log1p_series = function (x) {
        var k, m_mult, m_prod;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    k = 0;
                    m_mult = -x;
                    m_prod = -1;
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    m_prod *= m_mult;
                    return [4 /*yield*/, m_prod / ++k];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    };
    Log1p.log1p = function (x) {
        if (x < -1) {
            throw new Error("log1p(x) requires x > -1, but got x = " + x + ".");
        }
        if (x === -1) {
            throw new Error("Overflow error");
        }
        var a = Math.abs(x);
        if (a > 0.5) {
            return Math.log(1 + x);
        }
        // Note that without numeric_limits specialisation support,
        // epsilon just returns zero, and our "optimisation" will always fail:
        if (a < Precision.epsilon()) {
            return x;
        }
        // Maximum Deviation Found:                     1.846e-017
        // Expected Error Term:                         1.843e-017
        // Maximum Relative Change in Control Points:   8.138e-004
        // Max Error found at double precision =        3.250766e-016
        var P = [
            0.15141069795941984e-16,
            0.35495104378055055e-15,
            0.33333333333332835,
            0.99249063543365859,
            1.1143969784156509,
            0.58052937949269651,
            0.13703234928513215,
            0.011294864812099712
        ];
        var Q = [
            1,
            3.7274719063011499,
            5.5387948649720334,
            4.159201143419005,
            1.6423855110312755,
            0.31706251443180914,
            0.022665554431410243,
            -0.29252538135177773e-5
        ];
        var result = 1 - x / 2 + Rational.evaluate_polynomial(P, x) /
            Rational.evaluate_polynomial(Q, x);
        result *= x;
        return result;
    };
    /**
     * compute log(1+x)-x;
     */
    Log1p.log1pmx = function (x) {
        if (x < -1) {
            throw new Error("Domain error: log1pmx(x) requires x > -1, but got x = " + x + ".");
        }
        if (x === -1) {
            throw new Error("Overflow error");
        }
        var a = Math.abs(x);
        if (a > 0.95) {
            return Math.log(1 + x) - x;
        }
        // Note that without numeric_limits specialisation support,
        // epsilon just returns zero, and our "optimisation" will always fail:
        if (a < Precision.epsilon()) {
            return -x * x / 2;
        }
        var s = Log1p.log1p_series(x);
        s.next();
        var max_iter = 500;
        var result = Series.sum_series(s, Precision.epsilon(), max_iter, 0);
        // return Log1p.log1p(x) - x;
        return result.sum;
    };
    return Log1p;
}());
exports.Log1p = Log1p;
