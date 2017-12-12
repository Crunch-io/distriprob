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
var Precision = require("../../tools/precision").Precision;
var BesselJYSeries = require("./bessel_jy_series").BesselJYSeries;
var BesselJYAsym = require("./bessel_jy_asym").BesselJYAsym;
var BesselY0 = require("./bessel_y0").BesselY0;
var BesselY1 = require("./bessel_y1").BesselY1;
var BesselYN = /** @class */ (function () {
    function BesselYN() {
    }
    BesselYN.bessel_yn = function (n, x) {
        var value, factor, current, prev;
        if ((x === 0) && (n === 0)) {
            throw new Error("Overflow error");
        }
        if (x <= 0) {
            throw new Error("Domain error: Got x = " + x + ", but x must be > 0, complex result" + "" + " not supported.");
        }
        //
        // Reflection comes first:
        //
        if (n < 0) {
            factor = (n & 0x1) ? -1 : 1; // Y_{-n}(z) = (-1)^n Y_n(z)
            n = -n;
        }
        else {
            factor = 1;
        }
        if (x < Precision.epsilon()) {
            var scale = 1;
            var resultObj = BesselJYSeries.bessel_yn_small_z(n, x, scale);
            value = resultObj.result;
            scale = resultObj.scale;
            if (Number.MAX_VALUE * Math.abs(scale) < Math.abs(value)) {
                throw new Error("Overflow error");
            }
            value /= scale;
        }
        else if (BesselJYAsym.asymptotic_bessel_large_x_limit_intv(n, x)) {
            value = factor * BesselJYAsym.asymptotic_bessel_y_large_x_2(Math.abs(n), x);
        }
        else if (n === 0) {
            value = BesselY0.bessel_y0(x);
        }
        else if (n === 1) {
            value = factor * BesselY1.bessel_y1(x);
        }
        else {
            prev = BesselY0.bessel_y0(x);
            current = BesselY1.bessel_y1(x);
            var k = 1;
            var mult = 2 * k / x;
            value = mult * current - prev;
            prev = current;
            current = value;
            k++;
            if ((mult > 1) && (Math.abs(current) > 1)) {
                prev /= current;
                factor /= current;
                value /= current;
                current = 1;
            }
            while (k < n) {
                mult = 2 * k / x;
                value = mult * current - prev;
                prev = current;
                current = value;
                k++;
            }
            if (Math.abs(Number.MAX_VALUE * factor) < Math.abs(value)) {
                throw new Error("Overflow error");
            }
            value /= factor;
        }
        return value;
    };
    return BesselYN;
}());
exports.BesselYN = BesselYN;