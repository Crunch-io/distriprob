"use strict";
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
var Toms748 = require("../../tools/toms748_solve").Toms748;
var GenericQuantile = /** @class */ (function () {
    function GenericQuantile() {
    }
    GenericQuantile.check_range_result = function (x) {
        if ((x >= 0) && (x < Number.MIN_VALUE)) {
            throw new Error("Underflow error");
        }
        else if (x <= -Number.MAX_VALUE || x >= Number.MAX_VALUE) {
            throw new Error("Overflow error");
        }
        else {
            return x;
        }
    };
    GenericQuantile.generic_quantile = function (cdfRootFunctor, p, guess, comp, distRangeMin, distRangeMax) {
        //
        // Special cases first:
        //
        if (p === 0) {
            return comp ?
                GenericQuantile.check_range_result(distRangeMax)
                :
                    GenericQuantile.check_range_result(distRangeMin);
        }
        if (p === 1) {
            return !comp ?
                GenericQuantile.check_range_result(distRangeMax)
                :
                    GenericQuantile.check_range_result(distRangeMin);
        }
        var tol = Toms748.eps_tolerance(53 - 3);
        var max_iter = 500;
        var ir = Toms748.bracket_and_solve_root(cdfRootFunctor, guess, 2, true, tol, max_iter);
        var result = ir.a + (ir.b - ir.a) / 2;
        if (ir.iterations >= max_iter) {
            throw new Error("Evaluation error: Unable to locate solution in a reasonable" + "" + " time: either there is no answer to quantile or the answer is infinite." + "" + " Current best guess is " + result);
        }
        return result;
    };
    return GenericQuantile;
}());
exports.GenericQuantile = GenericQuantile;