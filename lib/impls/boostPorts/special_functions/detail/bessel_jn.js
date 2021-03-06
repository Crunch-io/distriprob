"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * (C) Copyright Xiaogang Zhang 2006.
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
var BesselJ0 = require("./bessel_j0").BesselJ0;
var BesselJ1 = require("./bessel_j1").BesselJ1;
var BesselJYAsym = require("./bessel_jy_asym").BesselJYAsym;
var BesselJYSeries = require("./bessel_jy_series").BesselJYSeries;
var BesselJY = require("./bessel_jy").BesselJY;
var BesselJN = /** @class */ (function () {
    function BesselJN() {
    }
    BesselJN.bessel_jn = function (n, x) {
        var value = 0, factor, current, prev, next;
        //
        // Reflection has to come first:
        //
        if (n < 0) {
            factor = (n & 0x1) ? -1 : 1; // J_{-n}(z) = (-1)^n J_n(z)
            n = -n;
        }
        else {
            factor = 1;
        }
        if (x < 0) {
            factor *= (n & 0x1) ? -1 : 1; // J_{n}(-z) = (-1)^n J_n(z)
            x = -x;
        }
        //
        // Special cases:
        //
        if (BesselJYAsym.asymptotic_bessel_large_x_limit_realv(n, x))
            return factor * BesselJYAsym.asymptotic_bessel_j_large_x_2(n, x);
        if (n === 0) {
            return factor * BesselJ0.bessel_j0(x);
        }
        if (n === 1) {
            return factor * BesselJ1.bessel_j1(x);
        }
        if (x === 0) {
            return 0;
        }
        var scale = 1;
        if (n < Math.abs(x)) {
            prev = BesselJ0.bessel_j0(x);
            current = BesselJ1.bessel_j1(x);
            for (var k = 1; k < n; k++) {
                var fact = 2 * k / x;
                //
                // rescale if we would overflow or underflow:
                //
                if ((Math.abs(fact) > 1) &&
                    ((Number.MAX_VALUE - Math.abs(prev)) / Math.abs(fact) < Math.abs(current))) {
                    scale /= current;
                    prev /= current;
                    current = 1;
                }
                value = fact * current - prev;
                prev = current;
                current = value;
            }
        }
        else if ((x < 1) || (n > x * x / 4) || (x < 5)) {
            return factor * BesselJYSeries.bessel_j_small_z_series(n, x);
        }
        else {
            var fn = void 0, s = void 0; // fn = J_(n+1) / J_n
            // |x| <= n, fast convergence  for continued fraction CF1
            var resultObj = BesselJY.CF1_jy(n, x);
            fn = resultObj.fv;
            s = resultObj.sign;
            prev = fn;
            current = 1;
            // Check recursion won't go on too far:
            for (var k = n; k > 0; k--) {
                var fact = 2 * k / x;
                if ((Math.abs(fact) > 1) &&
                    ((Number.MAX_VALUE - Math.abs(prev)) / Math.abs(fact) < Math.abs(current))) {
                    prev /= current;
                    scale /= current;
                    current = 1;
                }
                next = fact * current - prev;
                prev = current;
                current = next;
            }
            value = BesselJ0.bessel_j0(x) / current; // normalization
            scale = 1 / scale;
        }
        value *= factor;
        if (Number.MAX_VALUE * scale < Math.abs(value)) {
            throw new Error("Overflow error");
        }
        return value / scale;
    };
    return BesselJN;
}());
exports.BesselJN = BesselJN;
