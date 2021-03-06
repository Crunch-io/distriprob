"use strict";

/**
 * (C) Copyright John Maddock 2007, 2013.
 * (C) Copyright Christopher Kormanyos 2013.
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

const Precision = require("../tools/precision").Precision;
const BesselI0 = require("./detail/bessel_i0").BesselI0;
const BesselI1 = require("./detail/bessel_i1").BesselI1;
const BesselIK = require("./detail/bessel_ik").BesselIK;
const UncheckedFactorial = require("./detail/unchecked_factorial").UncheckedFactorial;
const Gamma = require("./gamma").Gamma;
const Series = require("../tools/series").Series;
const BesselJY = require("./detail/bessel_jy").BesselJY;
const BesselJN = require("./detail/bessel_jn").BesselJN;
const Sinc = require("./sinc").Sinc;
const BesselKN = require("./detail/bessel_kn").BesselKN;
const BesselYN = require("./detail/bessel_yn").BesselYN;
const BesselJYZero = require("./detail/bessel_jy_zero").BesselJYZero;
const Roots = require("../tools/roots").Roots;


export class Bessel {

  private static *sph_bessel_j_small_z_series_term(v: number, x: number):
  IterableIterator<number> {
    let N = 0;
    let mult = x / 2;
    let term;

    if(v + 3 > UncheckedFactorial.max_factorial()) {
      term = v * Math.log(mult) - Gamma.lgamma(v + 1.5).result;
      term = Math.exp(term);
    } else {
      term = Math.pow(mult, v) / Gamma.tgamma(v + 1.5);
    }
    mult *= -mult;

    while(true) {
      let r = term;
      N++;
      term *= mult / (N * (N + v + 0.5));
      yield r;
    }
  }

  private static sph_bessel_j_small_z_series(v: number, x: number): number {
    const s = Bessel.sph_bessel_j_small_z_series_term(v, x);
    const max_iter = 5000;
    const resultObj = Series.sum_series(s, Precision.epsilon(), max_iter, 0);

    return resultObj.sum * Math.sqrt(Math.PI / 4);
  }

  private static cyl_bessel_j_imp_no_int(v: number, x: number): number {
    if(x < 0) {
      // better have integer v:
      if(Math.floor(v) === v) {
        let r = Bessel.cyl_bessel_j_imp_no_int(v, -x);
        if(Math.round(v) & 1) {
          r = -r;
        }
        return r;
      } else {
        throw new Error(`Domain error: Got x = ${x}, but we need x >= 0`);
      }
    }

    return BesselJY.bessel_jy(v, x, "need_j").J;
  }

  public static cyl_bessel_j_imp_maybe_int(v: number, x: number): number {
    const ival = Math.round(v);
    // If v is an integer, use the integer recursion
    // method, both that and Steeds method are O(v):
    if((0 === v - ival)) {
      return BesselJN.bessel_jn(ival, x);
    }
    return Bessel.cyl_bessel_j_imp_no_int(v, x);
  }

  public static cyl_bessel_j_imp_int(v: number, x: number): number {
    return BesselJN.bessel_jn(v, x);
  }

  public static sph_bessel_j_imp(n: number, x: number): number {
    if(x < 0) {
      throw new Error(`Domain error: Got x = ${x}, but function requires x > 0.`);
    }

    //
    // Special case, n === 0 resolves down to the sinus cardinal of x:
    //
    if(n === 0) {
      return Sinc.sinc_pi(x);
    }

    //
    // Special case for x == 0:
    //
    if(x === 0) {
      return 0;
    }
    //
    // When x is small we may end up with 0/0, use series evaluation
    // instead, especially as it converges rapidly:
    //
    if(x < 1) {
      return Bessel.sph_bessel_j_small_z_series(n, x);
    }
    //
    // Default case is just a naive evaluation of the definition:
    //
    return Math.sqrt(Math.PI / (2 * x)) * Bessel.cyl_bessel_j_imp_no_int(n+0.5, x);
  }

  public static cyl_bessel_i_imp(v: number, x: number): number {
    //
    // This handles all the bessel I functions, note that we don't optimise
    // for integer v, other than the v = 0 or 1 special cases, as Millers
    // algorithm is at least as inefficient as the general case (the general
    // case has better error handling too).
    //
    if(x < 0) {
      // better have integer v:
      if(Math.floor(v) == v) {
        let r = Bessel.cyl_bessel_i(v, -x);
        if(Math.round(v) & 1) {
          r = -r;
        }
        return r;
      } else {
        throw new Error(`Domain error: Got x = ${x}, but we need x >= 0`);
      }
    }

    if(x === 0) {
      return (v === 0) ? 1 : 0;
    }

    if(v === 0.5) {
      // common special case, note try and avoid overflow in exp(x):
      if(x >= Precision.log_max_value()) {
        let e = Math.exp(x / 2);
        return e * (e / Math.sqrt(2 * x * Math.PI));
      }
      return Math.sqrt(2 / (x * Math.PI)) * Math.sinh(x);
    }

    if(v === 0) {
      return BesselI0.bessel_i0(x);
    }
    if(v === 1) {
      return BesselI1.bessel_i1(x);
    }

    if((v > 0) && (x / v < 0.25)) {
      return BesselIK.bessel_i_small_z_series(v, x);
    }

    return BesselIK.bessel_ik(v, x, "need_i").I;
  }

  private static cyl_bessel_k_imp_no_int(v: number, x: number): number {

    if(x < 0) {
      throw new Error(`Domain error: Got x = ${x}, but we need x > 0`);
    }

    if(x === 0) {
      if (v === 0) {
        throw new Error(`Overflow error`);
      } else {
        throw new Error(`Domain error: Got x = ${x}, but we need x > 0`);
      }
    }

    return BesselIK.bessel_ik(v, x, "need_k").K;
  }

  public static cyl_bessel_k_imp_maybe_int(v: number, x: number): number {
    if(Math.floor(v) === v) {
      return BesselKN.bessel_kn(Math.trunc(v), x);
    }

    return Bessel.cyl_bessel_k_imp_no_int(v, x);
  }

  public static cyl_bessel_k_imp_int(v: number, x: number): number {
    return BesselKN.bessel_kn(v, x);
  }

  private static cyl_neumann_imp_no_int(v: number, x: number): number {
    if(x <= 0) {
      if ((v === 0) && (x === 0)) {
        throw new Error(`Overflow error`);
      } else {
        throw new Error(`Domain error: Got x = ${x}, but result is complex for x <= 0`);
      }
    }

    return BesselJY.bessel_jy(v, x, "need_y").Y;
  }

  public static cyl_neumann_imp_maybe_int(v: number, x: number): number {
    if(Math.floor(v) === v) {
      return  BesselYN.bessel_yn(Math.trunc(v), x);
    }

    return Bessel.cyl_neumann_imp_no_int(v, x);
  }

  public static cyl_neumann_imp_int(v: number, x: number): number {
    return BesselYN.bessel_yn(v, x);
  }

  public static sph_neumann_imp(v: number, x: number): number {
    //
    // Nothing much to do here but check for errors, and
    // evaluate the function's definition directly:
    //
    if(x < 0) {throw new Error(`Domain error: Got x = ${1}, but function requires x > 0.`);}


    if(x < 2 * Number.MIN_VALUE) {
      throw new Error(`Overflow error`);
    }

    const result = Bessel.cyl_neumann_imp_no_int(v+0.5, x);
    const tx = Math.sqrt(Math.PI / (2 * x));

    if((tx > 1) && (Number.MAX_VALUE / tx < result)) {
      throw new Error(`Overflow error`);
    }

    return result * tx;
  }

  private static cyl_bessel_j_zero_imp(v: number, m: number): number {
    if (m !== Math.trunc(m)) {
      throw new Error(`Domain error: got m = ${m} but m must be a non-negative integer.`);
    }

    // Handle non-finite order.
    if (v === Number.POSITIVE_INFINITY || v === Number.NEGATIVE_INFINITY ) {
      throw new Error(`Domain error: Order argument is ${v}, but must be finite >= 0 !`);
    }

    // Handle negative rank.
    if(m < 0) {
      // Zeros of Jv(x) with negative rank are not defined and requesting one raises a
      // domain error.
      throw new Error(`Domain error: Requested the ${m}'th zero, but the rank must${""
      } be positive !`);
    }

    const half_epsilon = Precision.epsilon() / 2;

    // Get the absolute value of the order.
    const order_is_negative: boolean = (v < 0);
    const vv = (!order_is_negative) ? v : -v;

    // Check if the order is very close to zero or very close to an integer.
    const order_is_zero: boolean    = (vv < half_epsilon);
    const order_is_integer: boolean = ((vv - Math.floor(vv)) < half_epsilon);

    if(m === 0) {
      if(order_is_zero) {
        throw new Error(`Domain error: Requested the ${m}'th zero of J0, but the rank${""
        } must be > 0 !`);
      }

      // The zero'th zero of Jv(x) for v < 0 is not defined
      // unless the order is a negative integer.
      if(order_is_negative && (!order_is_integer)) {
        // For non-integer, negative order, requesting the zero'th zero raises a domain
        // error.
        throw new Error(`Domain error: Requested the ${m}'th zero of Jv for negative,${""
        } non-integer order, but the rank must be > 0 !`);
      }

      // The zero'th zero does exist and its value is zero.
      return 0;
    }

    // Set up the initial guess for the upcoming root-finding.
    // If the order is a negative integer, then use the corresponding
    // positive integer for the order.
    const guess_root = BesselJYZero.initial_guess_j((order_is_integer ? vv : v), m);

    // Select the maximum allowed iterations from the policy.
    let number_of_iterations = 5000;

    const delta_lo = ((guess_root > 0.2) ? 0.2 : guess_root / 2);

    // Perform the root-finding using Newton-Raphson iteration from Boost.Math.
    const jvm = Roots.newton_raphson_iterate(
      BesselJYZero.function_object_jv_and_jv_prime(
        (order_is_integer ? vv : v),
        order_is_zero
      ),
      guess_root,
      guess_root - delta_lo,
      guess_root + 0.2,
      53,
      number_of_iterations
    );

    if(jvm.iterations >= number_of_iterations) {
      throw new Error(`Evaluation error: Unable to locate root in a reasonable time:${""
      } Current best guess is ${jvm.result}`);
    }

    return jvm.result;
  }

  private static *cyl_bessel_j_zero_gen(v: number,
                                        startIndex?: number,
                                        numZeros?: number): IterableIterator<number> {
    let m = typeof startIndex === "number" ? startIndex : 1;
    let end = typeof numZeros === "number" ? m + numZeros : Number.POSITIVE_INFINITY;
    while (m < end) {
      yield Bessel.cyl_bessel_j_zero_imp(v, m);
      m++;
    }
  }

  private static cyl_neumann_zero_imp(v: number, m: number): number {
    if (m !== Math.trunc(m)) {
      throw new Error(`Domain error: got m = ${m} but m must be a non-negative integer.`);
    }

    // Handle non-finite order.
    if (v === Number.POSITIVE_INFINITY || v === Number.NEGATIVE_INFINITY ) {
      throw new Error(`Domain error: Order argument is ${v}, but must be finite >= 0 !`);
    }

    // Handle negative rank.
    if(m < 0) {
      // Zeros of Yv(x) with negative rank are not defined and requesting one raises a
      // domain error.
      throw new Error(`Domain error: Requested the ${m}'th zero, but the rank must${""
      } be positive !`);
    }

    const half_epsilon = Precision.epsilon() / 2;

    // Get the absolute value of the order.
    const order_is_negative: boolean = (v < 0);
    const vv = (!order_is_negative) ? v : -v;

    const order_is_integer: boolean = ((vv - Math.floor(vv)) < half_epsilon);

    // For negative integers, use reflection to positive integer order.
    if(order_is_negative && order_is_integer) {
      return Bessel.cyl_neumann_zero_imp(vv, m);
    }

    // Check if the order is very close to a negative half-integer.
    const delta_half_integer = vv - (Math.floor(vv) + 0.5);

    const order_is_negative_half_integer: boolean =
      (order_is_negative && ((delta_half_integer > -half_epsilon) &&
      (delta_half_integer < half_epsilon)));

    // The zero'th zero of Yv(x) for v < 0 is not defined
    // unless the order is a negative integer.
    if((m === 0) && (!order_is_negative_half_integer)) {
      // For non-integer, negative order, requesting the zero'th zero raises a domain
      // error.
      throw new Error(`Domain error: Requested the ${m}'th zero of Yv for negative,${""
      } non-half-integer order, but the rank must be > 0 !`);
    }

    // For negative half-integers, use the corresponding
    // spherical Bessel function of positive half-integer order.
    if(order_is_negative_half_integer) {
      return Bessel.cyl_bessel_j_zero_imp(vv, m);
    }

    // Set up the initial guess for the upcoming root-finding.
    // If the order is a negative integer, then use the corresponding
    // positive integer for the order.
    const guess_root = BesselJYZero.initial_guess_y(v, m);

    // Select the maximum allowed iterations from the policy.
    let number_of_iterations = 500;

    const delta_lo = ((guess_root > 0.2) ? 0.2 : guess_root / 2);

    // Perform the root-finding using Newton-Raphson iteration from Boost.Math.
    const yvm = Roots.newton_raphson_iterate(
      BesselJYZero.function_object_yv_and_yv_prime(v),
      guess_root,
      guess_root - delta_lo,
      guess_root + 0.2,
      53,
      number_of_iterations
    );

    if(yvm.iterations >= number_of_iterations) {
      throw new Error(`Evaluation error: Unable to locate root in a reasonable time:${""
        } Current best guess is ${yvm.result}`);
    }

    return yvm.result;
  }

  private static *cyl_neumann_zero_gen(v: number,
                                       startIndex?: number,
                                       numZeros?: number): IterableIterator<number> {
    let m = typeof startIndex === "number" ? startIndex : 1;
    let end = typeof numZeros === "number" ? m + numZeros : Number.POSITIVE_INFINITY;
    while (m < end) {
      yield Bessel.cyl_neumann_zero_imp(v, m);
      m++;
    }
  }

  public static cyl_bessel_j(v: number, x: number): number {
    return Bessel.cyl_bessel_j_imp_maybe_int(v, x);
  }

  public static sph_bessel(v: number, x: number): number {
    return Bessel.sph_bessel_j_imp(v, x);
  }

  public static cyl_bessel_i(v: number, x: number): number {
    return Bessel.cyl_bessel_i_imp(v, x);
  }

  public static cyl_bessel_k(v: number, x: number): number {
    return Bessel.cyl_bessel_k_imp_maybe_int(v, x);
  }

  public static cyl_neumann(v: number, x: number): number {
    return Bessel.cyl_neumann_imp_maybe_int(v, x);
  }

  public static sph_neumann(v: number, x: number): number {
    return Bessel.sph_neumann_imp(v, x);
  }

  public static cyl_bessel_j_zero(v: number, m: number): number {
    return Bessel.cyl_bessel_j_zero_imp(v, m);
  }

  public static cyl_bessel_j_zeros_iter(v: number,
                                        startIndex?: number,
                                        numZeros?: number):
  IterableIterator<number> {
    if (typeof startIndex === "number") {
      if (startIndex !== Math.trunc(startIndex)) {
        throw new Error(`Domain error: got startIndex = ${startIndex}, start index${""
        } must be a non-negative integer.`);
      }
    }

    if (typeof numZeros === "number") {
      if (numZeros !== Math.trunc(numZeros)) {
        throw new Error(`Domain error: got numZeros = ${numZeros}, number of zeros${""
          } must be a non-negative integer.`);
      }
    }

    return Bessel.cyl_bessel_j_zero_gen(v, startIndex, numZeros);
  }

  public static cyl_neumann_zero(v: number, m: number): number {
    return Bessel.cyl_neumann_zero_imp(v, m);
  }

  public static cyl_neumann_zeros_iter(v: number,
                                      startIndex?: number,
                                      numZeros?: number):
  IterableIterator<number> {
    if (typeof startIndex === "number") {
      if (startIndex !== Math.trunc(startIndex)) {
        throw new Error(`Domain error: got startIndex = ${startIndex}, start index${""
          } must be a non-negative integer.`);
      }
    }

    if (typeof numZeros === "number") {
      if (numZeros !== Math.trunc(numZeros)) {
        throw new Error(`Domain error: got numZeros = ${numZeros}, number of zeros${""
          } must be a non-negative integer.`);
      }
    }

    return Bessel.cyl_neumann_zero_gen(v, startIndex, numZeros);
  }

}
