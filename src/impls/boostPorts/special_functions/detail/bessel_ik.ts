"use strict";

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

const UncheckedFactorial = require("./unchecked_factorial").UncheckedFactorial;
const Gamma = require("../gamma").Gamma;
const Series = require("../../tools/series").Series;
const Precision = require("../../tools/precision").Precision;
const SinPI = require("../sin_pi").SinPI;
const Sign = require("../sign").Sign;
const BesselJYAsym = require("./bessel_jy_asym").BesselJYAsym;


export class BesselIK {
  private static *cyl_bessel_i_small_z (v: number, z: number): IterableIterator<number> {
    let k = 0;
    let mult = z*z/4;
    let term = 1;

    while (true) {
      let result = term;
      k++;
      term *= mult / k;
      term /= k + v;
      yield result;
    }
  }

  public static bessel_i_small_z_series(v: number, x: number): number {
    let prefix;
    if(v < UncheckedFactorial.max_factorial()) {
      prefix = Math.pow(x / 2, v) / Gamma.tgamma(v + 1);
    } else {
      prefix = v * Math.log(x / 2) - Gamma.lgamma(v + 1).result;
      prefix = Math.exp(prefix);
    }
    if(prefix === 0) {
      return prefix;
    }

    let s = BesselIK.cyl_bessel_i_small_z(v, x);
    const max_iter = 500;
    const result = Series.sum_series(s, Precision.epsilon(), max_iter, 0);

    return prefix * result.sum;
  }

  /**
   * Calculate K(v, x) and K(v+1, x) by method analogous to
   * Temme, Journal of Computational Physics, vol 21, 343 (1976)
   */
  private static temme_ik(v: number, x: number): {K: number, K1: number} {
    let f, h, p, q, coef, sum, sum1, tolerance;
    let a, b, c, d, sigma, gamma1, gamma2;
    let k;

    // |x| <= 2, Temme series converge rapidly
    // |x| > 2, the larger the |x|, the slower the convergence
    //BOOST_ASSERT(abs(x) <= 2);
    //BOOST_ASSERT(abs(v) <= 0.5f);

    let gp = Gamma.tgamma1pm1(v);
    let gm = Gamma.tgamma1pm1(-v);

    a = Math.log(x / 2);
    b = Math.exp(v * a);
    sigma = -a * v;
    c = Math.abs(v) < Precision.epsilon() ? 1 : SinPI.sin_pi(v) / (v * Math.PI);
    d = Math.abs(sigma) < Precision.epsilon() ? 1 : Math.sinh(sigma) / sigma;
    gamma1 = Math.abs(v) < Precision.epsilon() ? -Math.E : (0.5 / v) * (gp - gm) * c;
    gamma2 = (2 + gp + gm) * c / 2;

    // initial values
    p = (gp + 1) / (2 * b);
    q = (1 + gm) * b / 2;
    f = (Math.cosh(sigma) * gamma1 + d * (-a) * gamma2) / c;
    h = p;
    coef = 1;
    sum = coef * f;
    sum1 = coef * h;

    const max_iter = 500;

    // series summation
    tolerance = Precision.epsilon();
    for (k = 1; k < max_iter; k++) {
      f = (k * f + p + q) / (k*k - v*v);
      p /= k - v;
      q /= k + v;
      h = p - k * f;
      coef *= x * x / (4 * k);
      sum += coef * f;
      sum1 += coef * h;
      if (Math.abs(coef * f) < Math.abs(sum) * tolerance) {
        break;
      }
    }

    return {K: sum, K1: 2 * sum1 / x};
  }

  /**
   * Evaluate continued fraction fv = I_(v+1) / I_v, derived from
   * Abramowitz and Stegun, Handbook of Mathematical Functions, 1972, 9.1.73
   */
  private static CF1_ik(v: number, x: number): number {
    let C, D, f, a, b, delta, tiny, tolerance;
    let k;

    // |x| <= |v|, CF1_ik converges rapidly
    // |x| > |v|, CF1_ik needs O(|x|) iterations to converge

    // modified Lentz's method, see
    // Lentz, Applied Optics, vol 15, 668 (1976)
    // TODO: convert to use contiued fraction solver in tools/fraction
    tolerance = 2 * Precision.epsilon();
    tiny = Math.sqrt(Number.MIN_VALUE);
    C = f = tiny;                           // b0 = 0, replace with tiny
    D = 0;
    let max_iter = 500;
    for (k = 1; k < max_iter; k++) {
      a = 1;
      b = 2 * (v + k) / x;
      C = b + a / C;
      D = b + a * D;
      if (C === 0) { C = tiny; }
      if (D === 0) { D = tiny; }
      D = 1 / D;
      delta = C * D;
      f *= delta;
      if (Math.abs(delta - 1) <= tolerance) {
        break;
      }
    }

    return f;
  }

  /**
   * Calculate K(v, x) and K(v+1, x) by evaluating continued fraction
   * z1 / z0 = U(v+1.5, 2v+1, 2x) / U(v+0.5, 2v+1, 2x), see
   * Thompson and Barnett, Computer Physics Communications, vol 47, 245 (1987)
   */
  private static CF2_ik(v: number, x: number): {Kv: number, Kv1: number} {
    let S, C, Q, D, f, a, b, q, delta, tolerance, current, prev;
    let k;

    // |x| >= |v|, CF2_ik converges rapidly
    // |x| -> 0, CF2_ik fails to converge
    //BOOST_ASSERT(abs(x) > 1);

    // Steed's algorithm, see Thompson and Barnett,
    // Journal of Computational Physics, vol 64, 490 (1986)
    tolerance = Precision.epsilon();
    a = v * v - 0.25;
    b = 2 * (x + 1);                              // b1
    D = 1 / b;                                    // D1 = 1 / b1
    f = delta = D;                                // f1 = delta1 = D1, coincidence
    prev = 0;                                     // q0
    current = 1;                                  // q1
    Q = C = -a;                                   // Q1 = C1 because q1 = 1
    S = 1 + Q * delta;                            // S1

    const max_iter = 500;

    for (k = 2; k < max_iter; k++) {     // starting from 2
      // continued fraction f = z1 / z0
      a -= 2 * (k - 1);
      b += 2;
      D = 1 / (b + a * D);
      delta *= b * D - 1;
      f += delta;

      // series summation S = 1 + \sum_{n=1}^{\infty} C_n * z_n / z_0
      q = (prev - (b - 2) * current) / a;
      prev = current;
      current = q;                        // forward recurrence for q
      C *= -a / k;
      Q += C * q;
      S += Q * delta;
      //
      // Under some circumstances q can grow very small and C very
      // large, leading to under/overflow.  This is particularly an
      // issue for types which have many digits precision but a narrow
      // exponent range.  A typical example being a "double double" type.
      // To avoid this situation we can normalise q (and related prev/current)
      // and C.  All other variables remain unchanged in value.  A typical
      // test case occurs when x is close to 2, for example cyl_bessel_k(9.125, 2.125).
      //
      if(q < Precision.epsilon()) {
        C *= q;
        prev /= q;
        current /= q;
        q = 1;
      }

      // S converges slower than f
      if (Math.abs(Q * delta) < Math.abs(S) * tolerance) {
        break;
      }
    }

    let Kv, Kv1;

    if(x >= Precision.log_max_value()) {
      Kv = Math.exp(0.5 * Math.log(Math.PI / (2 * x)) - x - Math.log(S));
    } else {
      Kv = Math.sqrt(Math.PI / (2 * x)) * Math.exp(-x) / S;
    }

    Kv1 = Kv * (0.5 + v + x + (v * v - 0.25) * f) / x;

    return {Kv: Kv, Kv1: Kv1};
  }

  /**
   * Compute I(v, x) and K(v, x) simultaneously by Temme's method, see
   * Temme, Journal of Computational Physics, vol 19, 324 (1975)
   */
  public static bessel_ik(v: number, x: number, kind: "need_i" | "need_k"):
  {I: number, K: number} {
    // Kv1 = K_(v+1), fv = I_(v+1) / I_v
    // Ku1 = K_(u+1), fu = I_(u+1) / I_u
    const need_i = 1;
    const need_k = 2;
    let _kind = kind === "need_i" ? need_i : need_k;
    let u, Iv, Kv, Kv1, Ku, Ku1, fv;
    let W, current, prev, next;
    let reflect: boolean = false;
    let n, k;
    let org_kind = _kind;
    let I, K;

    if (v < 0) {
      reflect = true;
      v = -v;                             // v is non-negative from here
      _kind |= need_k;
    }
    n = Math.round(v);
    u = v - n;                              // -1/2 <= u < 1/2

    if (x < 0) {
      throw new Error(`Domain error: Got x = ${x} but real argument x must be${""
      } non-negative, complex number result not supported.`);
    }
    if (x === 0) {
      Iv = (v === 0) ? 1 : 0;
      if(_kind & need_k) {
        throw new Error(`Overflow error`);
        //Kv = policies::raise_overflow_error<T>(function, 0, pol);
      } else {
        Kv = NaN;
        //Kv = std::numeric_limits<T>::quiet_NaN(); // any value will do
      }

      if(reflect && (_kind & need_i)) {
        let z = (u + n % 2);
        if (SinPI.sin_pi(z) !== 0) {
          throw new Error(`Overflow error`);
        }
      }

      I = Iv;
      K = Kv;
      return {I: I, K: K};
    }

    // x is positive until reflection
    W = 1 / x;                                 // Wronskian
    if (x <= 2) {                                // x in (0, 2]
      let resultObj = BesselIK.temme_ik(u, x);  // Temme series
      Ku = resultObj.K;
      Ku1 = resultObj.K1;
    } else {                                       // x in (2, \infty)
      let resultObj = BesselIK.CF2_ik(u, x); // continued fraction CF2_ik
      Ku = resultObj.Kv;
      Ku1 = resultObj.Kv1;
    }
    prev = Ku;
    current = Ku1;
    let scale = 1;
    let scale_sign = 1;
    for (k = 1; k <= n; k++) {                   // forward recurrence for K
      let fact = 2 * (u + k) / x;
      if((Number.MAX_VALUE - Math.abs(prev)) / fact < Math.abs(current)){
        prev /= current;
        scale /= current;
        scale_sign *= Sign.sign(current);
        current = 1;
      }
      next = fact * current + prev;
      prev = current;
      current = next;
    }
    Kv = prev;
    Kv1 = current;

    if(_kind & need_i) {
      let lim = (4 * v * v + 10) / (8 * x);
      lim *= lim;
      lim *= lim;
      lim /= 24;
      if((lim < Precision.epsilon() * 10) && (x > 100)) {
        // x is huge compared to v, CF1 may be very slow
        // to converge so use asymptotic expansion for large
        // x case instead.  Note that the asymptotic expansion
        // isn't very accurate - so it's deliberately very hard
        // to get here - probably we're going to overflow:
        Iv = BesselJYAsym.asymptotic_bessel_i_large_x(v, x);
      } else if((v > 0) && (x / v < 0.25)) {
        Iv = BesselIK.bessel_i_small_z_series(v, x);
      } else {
        fv = BesselIK.CF1_ik(v, x);                   // continued fraction CF1_ik
        Iv = scale * W / (Kv * fv + Kv1);                  // Wronskian relation
      }
    } else {
      Iv = NaN;   // any value will do
    }


    if (reflect) {
      let z = (u + n % 2);
      let fact = (2 / Math.PI) * (SinPI.sin_pi(z) * Kv);
      if(fact === 0) {
        I = Iv;
      } else if(Number.MAX_VALUE * scale < fact) {
        if (org_kind & need_i) {
          throw new Error(`Overflow error`);
        } else {
          I = 0;
        }
      } else {
        I = Iv + fact / scale;   // reflection formula
      }
    } else {
      I = Iv;
    }

    if(Number.MAX_VALUE * scale < Kv) {
      if (org_kind & need_k) {
        throw new Error(`Overflow error`);
      } else {
        K = 0;
      }

    } else {
      K = Kv / scale;
    }

    return {I: I, K: K};
  }
}