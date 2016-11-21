"use strict";

/**
 * (C) Copyright Anton Bikineev 2013.
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

const UncheckedFactorial = require("./unchecked_factorial").UncheckedFactorial;
const Gamma = require("../gamma").Gamma;
const Constants = require("../../tools/constants").Constants;
const Series = require("../../tools/series").Series;
const Precision = require("../../tools/precision").Precision;
const CosPI = require("../cos_pi").CosPI;


export class BesselJYDerivativesSeries {

  private static *bessel_j_derivative_small_z_series_term(v: number, x: number):
  IterableIterator<number> {
    let N = 0;
    let term = 1;
    let mult = x / 2;
    mult *= -mult;

    // iterate if v === 0; otherwise result of
    // first term is 0 and tools::sum_series stops
    if (v === 0) {
      N++;
      term *= mult / (N * (N + v));
    }

    while (true) {
      let r = term * (v + 2 * N);
      N++;
      term *= mult / (N * (N + v));
      yield r;
    }
  }

  /**
   * Series evaluation for BesselJ'(v, z) as z -> 0.
   * It's derivative of:
   * http://functions.wolfram.com/Bessel-TypeFunctions/BesselJ/06/01/04/01/01/0003/
   * Converges rapidly for all z << v.
   */
  public static bessel_j_derivative_small_z_series(v: number, x: number): number {
    let prefix;
    if (v < UncheckedFactorial.max_factorial()) {
      prefix = Math.pow(x / 2, v - 1) / 2 / Gamma.tgamma(v + 1);
    } else {
      prefix = (v - 1) * Math.log(x / 2) - Constants.LN2() -
        Gamma.lgamma(v + 1).result;
      prefix = Math.exp(prefix);
    }
    if (prefix === 0) {
      return prefix;
    }

    const s = BesselJYDerivativesSeries.bessel_j_derivative_small_z_series_term(
      v,
      x
    );
    const max_iter = 500;
    const result = Series.sum_series(s, Precision.epsilon(), max_iter, 0).sum;

    return prefix * result;
  }

  private static *bessel_y_derivative_small_z_series_term_a(v: number, x: number):
  IterableIterator<number> {
    let N = 0;
    let mult = x / 2;
    mult *= -mult;
    let term = 1;

    while (true) {
      let r = term * (-v + 2 * N);
      N++;
      term *= mult / (N * (N - v));
      yield r;
    }
  }

  private static *bessel_y_derivative_small_z_series_term_b(v: number, x: number):
  IterableIterator<number> {
    let N = 0;
    let mult = x / 2;
    mult *= -mult;
    let term = 1;

    while (true) {
      let r = term * (v + 2 * N);
      N++;
      term *= mult / (N * (N + v));
      yield r;
    }
  }

  /**
   * Series form for BesselY' as z -> 0,
   * It's derivative of:
   *      http://functions.wolfram.com/Bessel-TypeFunctions/BesselY/06/01/04/01/01/0003/
   * This series is only useful when the second term is small compared to the first
   * otherwise we get catestrophic cancellation errors.
   *
   * Approximating tgamma(v) by v^v, and assuming |tgamma(-z)| < eps we end up requiring:
   * eps/2 * v^v(x/2)^-v > (x/2)^v or log(eps/2) > v log((x/2)^2/v)
   */
  public static bessel_y_derivative_small_z_series(v: number, x: number): number {
    let prefix;
    let gam;
    let p = Math.log(x / 2);
    let scale = 1;
    let need_logs: boolean = (v >= UncheckedFactorial.max_factorial()) ||
                             (Precision.log_max_value() / v < Math.abs(p));
    if (!need_logs) {
      gam = Gamma.tgamma(v);
      p = Math.pow(x / 2, v + 1) * 2;
      if (Number.MAX_VALUE * p < gam) {
        scale /= gam;
        gam = 1;
        if (Number.MAX_VALUE * p < gam){
          // This term will overflow to -INF, when combined with the series below it becomes +INF:
          throw new Error(`Overflow error`);
        }
      }
      prefix = -gam / (Math.PI * p);
    } else {
      gam = Gamma.lgamma(v).result;
      p = (v + 1) * p + Constants.LN2();
      prefix = gam - Constants.LNPI() - p;
      if (Precision.log_max_value() < prefix) {
        prefix -= Math.log(Number.MAX_VALUE / 4);
        scale /= (Number.MAX_VALUE / 4);
        if (Precision.log_max_value() < prefix) {
          throw new Error(`Overflow error`);
        }
      }
      prefix = -Math.exp(prefix);
    }
    const s = BesselJYDerivativesSeries.bessel_y_derivative_small_z_series_term_a(
      v,
      x
    );
    let max_iter = 500;
    let result = Series.sum_series(s, Precision.epsilon(), max_iter, 0).sum;
    result *= prefix;

    p = Math.pow(x / 2, v - 1) / 2;
    if (!need_logs) {
      prefix = Gamma.tgamma(-v) * CosPI.cos_pi(v) * p / Math.PI;
    } else {
      const resultObj = Gamma.lgamma(-v);
      const sgn = resultObj.sign;
      prefix = resultObj.result + (v - 1) * Math.log(x / 2) - Constants.LN2();
      prefix = Math.exp(prefix) * sgn / Math.PI;
    }
    const s2 = BesselJYDerivativesSeries.bessel_y_derivative_small_z_series_term_b(
      v,
      x
    );
    max_iter = 500;
    const b = Series.sum_series(s2, Precision.epsilon(), max_iter, 0).sum;
    result += scale * prefix * b;
    return result;
  }

  // Calculating of BesselY'(v,x) with small x (x < epsilon) and integer x using
  // derivatives of formulas in
  //        http://functions.wolfram.com/Bessel-TypeFunctions/BesselY/06/01/04/01/02/
  // seems to lose precision. Instead using linear combination of regular Bessel is
  // preferred.

}