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
var Rational = require("../../tools/rational").Rational;
var BesselI1 = /** @class */ (function () {
    function BesselI1() {
    }
    BesselI1.bessel_i1 = function (x) {
        var P1 = [
            -1.4577180278143463643e+15,
            -1.7732037840791591320e+14,
            -6.9876779648010090070e+12,
            -1.3357437682275493024e+11,
            -1.4828267606612366099e+09,
            -1.0588550724769347106e+07,
            -5.1894091982308017540e+04,
            -1.8225946631657315931e+02,
            -4.7207090827310162436e-01,
            -9.1746443287817501309e-04,
            -1.3466829827635152875e-06,
            -1.4831904935994647675e-09,
            -1.1928788903603238754e-12,
            -6.5245515583151902910e-16,
            -1.9705291802535139930e-19,
        ];
        var Q1 = [
            -2.9154360556286927285e+15,
            9.7887501377547640438e+12,
            -1.4386907088588283434e+10,
            1.1594225856856884006e+07,
            -5.1326864679904189920e+03,
            1.0,
        ];
        var P2 = [
            1.4582087408985668208e-05,
            -8.9359825138577646443e-04,
            2.9204895411257790122e-02,
            -3.4198728018058047439e-01,
            1.3960118277609544334e+00,
            -1.9746376087200685843e+00,
            8.5591872901933459000e-01,
            -6.0437159056137599999e-02,
        ];
        var Q2 = [
            3.7510433111922824643e-05,
            -2.2835624489492512649e-03,
            7.4212010813186530069e-02,
            -8.5017476463217924408e-01,
            3.2593714889036996297e+00,
            -3.8806586721556593450e+00,
            1.0,
        ];
        var value, factor, r, w;
        w = Math.abs(x);
        if (x === 0) {
            return 0;
        }
        if (w <= 15) {
            var y = x * x;
            r = Rational.evaluate_polynomial(P1, y) /
                Rational.evaluate_polynomial(Q1, y);
            factor = w;
            value = factor * r;
        }
        else {
            var y = 1 / w - 1 / 15;
            r = Rational.evaluate_polynomial(P2, y) /
                Rational.evaluate_polynomial(Q2, y);
            factor = Math.exp(w) / Math.sqrt(w);
            value = factor * r;
        }
        return value;
    };
    return BesselI1;
}());
exports.BesselI1 = BesselI1;