"use strict";

/**
 * (C) Copyright John Maddock 2006-7, 2013-14.
 * (C) Copyright Paul A. Bristow 2007, 2013-14.
 * (C) Copyright Nikhar Agrawal 2013-14
 * (C) Copyright Christopher Kormanyos 2013-14
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

const Lanczos = require("./lanczos").Lanczos;
const Precision = require("../tools/precision").Precision;
const Log1p = require("./log1p").Log1p;
const UncheckedFactorial = require("./detail/unchecked_factorial").UncheckedFactorial;
const Constants = require("../tools/constants").Constants;
const LGammaSmall = require("./detail/lgamma_small").LGammaSmall;
const IGammaLarge = require("./detail/igamma_large").IGammaLarge;
const Fraction = require("../tools/fraction").Fraction;
const Series = require("../tools/series").Series;
const Expm1 = require("./expm1").Expm1;
const Powm1 = require("./powm1").Powm1;
const Erf = require("./erf").Erf;


export class Gamma {

  private static is_odd(v: number): boolean {
    // Oh dear can't cast T to int!
    let modulus = v - 2 * Math.floor(v/2);
    return modulus !== 0;
  }

  /**
   * Ad hoc function calculates x * sin(pi * x),
   * taking extra care near when x is near a whole number.
   */
  private static sinpx(z: number): number {
    let sign = 1;
    if(z < 0) {
      z = -z;
    }
    let fl = Math.floor(z);
    let dist;
    if(Gamma.is_odd(fl)) {
      fl += 1;
      dist = fl - z;
      sign = -sign;
    } else {
      dist = z - fl;
    }

    if(dist > 0.5)
      dist = 1 - dist;
    let result = Math.sin(dist*Math.PI);
    return sign*z*result;
  }

  /**
   * tgamma(z), with Lanczos support:
   */
  public static gamma_imp(z: number) {
    let result = 1;

    if(z <= 0) {
      if(Math.floor(z) == z){
        throw new Error(`Pole error: evaluation of tgamma at a negative integer ${z}.`);
      }
      if(z <= -20) {
        result = Gamma.gamma_imp(-z) * Gamma.sinpx(z);
        if((Math.abs(result) < 1) && (Number.MAX_VALUE * Math.abs(result) < Math.PI)) {
          throw new Error(`Overflow error: Result of tgamma is too large to represent.`);
        }

        result = -Math.PI / result;
        if(result == 0) {
          throw new Error(`Underflow error: Result of tgamma is too small to represent.`);
        }

        if(Math.abs(result)< Number.MIN_VALUE && result !== 0) {
          throw new Error(`Denorm error: Result of tgamma is denormalized.`);
        }

        return result;
      }

      // shift z to > 1:
      while(z < 0) {
        result /= z;
        z += 1;
      }
    }

    if((Math.floor(z) === z) && (z < UncheckedFactorial.max_factorial())) {
      result *= UncheckedFactorial.unchecked_factorial(Math.trunc(z) - 1);
    } else if (z < 1 / Number.MAX_VALUE) {
      throw new Error(`Overflow error`);
    } else {
      result *= Lanczos.lanczos_sum(z);
      let zgh = (z + Lanczos.g() - 0.5);
      let lzgh = Math.log(zgh);

      if(z * lzgh > Precision.log_max_value()){
        // we're going to overflow unless this is done with care:
        if(lzgh * z / 2 > Precision.log_max_value()){
          throw new Error(`Overflow error: Result of tgamma is too large to represent.`);
        }
        let hp = Math.pow(zgh, (z / 2) - 0.25);
        result *= hp / Math.exp(zgh);
        if(Number.MAX_VALUE / hp < result) {
          throw new Error(`Overflow error: Result of tgamma is too large to represent.`);
        }
        result *= hp;
      } else {
        result *= Math.pow(zgh, z - 0.5) / Math.exp(zgh);
      }
    }
    return result;
  }

  /**
   * lgamma(z) with Lanczos support:
   */
  public static lgamma_imp(z: number): {result: number, sign: number} {
    let result = 0;
    let sresult = 1;

    if(z <= -Precision.root_epsilon()) {
      // reflection formula:
      if(Math.floor(z) === z) {
        throw new Error(`Pole error: evaluation of lgamma at a negative integer ${z}.`);
      }

      let t = Gamma.sinpx(z);
      z = -z;
      if(t < 0) {
        t = -t;
      } else {
        sresult = -sresult;
      }
      result = Constants.LNPI() - Gamma.lgamma_imp(z).result - Math.log(t);
    } else if (Math.abs(z) < 1 / Number.MAX_VALUE) {
      if (z === 0) {
        throw new Error(`Pole error: evaluation of lgamma at ${z}.`);
      }
      result = -Math.log(Math.abs(z));
    } else if(z < 15) {
      result = LGammaSmall.lgamma_small_imp(z, z - 1, z - 2);
    } else if((z >= 3) && (z < 100)/*&& (std::numeric_limits<T>::max_exponent >= 1024)*/){
      // taking the log of tgamma reduces the error, no danger of overflow here:
      result = Math.log(Gamma.gamma_imp(z));
    } else {
      // regular evaluation:
      let zgh = (z + Lanczos.g() - 0.5);
      result = Math.log(zgh) - 1;
      result *= z - 0.5;
      result += Math.log(Lanczos.lanczos_sum_expG_scaled(z));
    }

    return {result: result, sign: sresult};
  }

  //
  // Incomplete gamma functions follow:
  //
  private static *upper_incomplete_gamma_fract(a1: number, z1: number):
  IterableIterator<{a: number, b: number}> {
    let z = z1 - a1 + 1;
    let a = a1;
    let k = 0;

    while(true) {
      k++;
      z += 2;
      yield {a: k * (a - k), b: z};
    }
  }

  private static upper_gamma_fraction(a: number, z: number, eps: number): number {
    const f = Gamma.upper_incomplete_gamma_fract(a, z);

    return 1 / (z - a + 1 + Fraction.continued_fraction("A", f, eps, 500).value);
  }

  private static *lower_incomplete_gamma_series(a1: number, z1: number):
  IterableIterator<number>{
    let a = a1;
    let z = z1;
    let result = 1;

    let r;

    while(true) {
      r = result;
      a += 1;
      result *= z/a;
      yield r;
    }
  }

  private static lower_gamma_series(a: number, z: number, init_value = 0): number {
    let s = Gamma.lower_incomplete_gamma_series(a, z);
    let result = Series.sum_series(s, Precision.epsilon(), 5000, init_value);
    return result.sum;
  }

  /**
   * This helper calculates tgamma(dz+1)-1 without cancellation errors,
   * used by the upper incomplete gamma with z < 1:
   */
  private static tgammap1m1_imp(dz: number): number {
    let result;
    if(dz < 0) {
      if(dz < -0.5) {
        // Best method is simply to subtract 1 from tgamma:
        result = Gamma.tgamma(1+dz) - 1;
      } else {
        // Use expm1 on lgamma:
        result = Expm1.expm1(-Log1p.log1p(dz) +
          LGammaSmall.lgamma_small_imp(dz+2, dz + 1, dz));
      }
    } else {
      if(dz < 2) {
        // Use expm1 on lgamma:
        result = Expm1.expm1(LGammaSmall.lgamma_small_imp(dz+1, dz, dz-1));
      } else {
        // Best method is simply to subtract 1 from tgamma:
        result = Gamma.tgamma(1+dz) - 1;
      }
    }

    return result;
  }

  /**
   * Calculate power term prefix (z^a)(e^-z) used in the non-normalised
   * incomplete gammas:
   */
  public static full_igamma_prefix(a: number, z: number): number {
    let prefix;
    let alz = a * Math.log(z);

    if(z >= 1) {
      if((alz < Precision.log_max_value()) && (-z > Precision.log_min_value())){
        prefix = Math.pow(z, a) * Math.exp(-z);
      } else if(a >= 1) {
        prefix = Math.pow(z / Math.exp(z/a), a);
      } else {
        prefix = Math.exp(alz - z);
      }
    } else {
      if(alz > Precision.log_min_value()){
        prefix = Math.pow(z, a) * Math.exp(-z);
      } else if(z/a < Precision.log_max_value()) {
        prefix = Math.pow(z / Math.exp(z/a), a);
      } else {
        prefix = Math.exp(alz - z);
      }
    }
    //
    // This error handling isn't very good: it happens after the fact
    // rather than before it...
    //
    if(prefix === Number.POSITIVE_INFINITY || prefix === Number.NEGATIVE_INFINITY) {
      throw new Error(`Overflow error`);
    }

    return prefix;
  }

  /**
   * Compute (z^a)(e^-z)/tgamma(a)
   * most of the error occurs in this function:
   */
  public static regularised_gamma_prefix(a: number, z: number): number {
    let agh = a + Lanczos.g() - 0.5;
    let prefix;
    let d = ((z - a) - Lanczos.g() + 0.5) / agh;

    if(a < 1) {
      //
      // We have to treat a < 1 as a special case because our Lanczos
      // approximations are optimised against the factorials with a > 1,
      // and for high precision types especially (128-bit reals for example)
      // very small values of a can give rather erroneous results for gamma
      // unless we do this:
      //
      // TODO: is this still required?  Lanczos approx should be better now?
      //
      if(z <= Precision.log_min_value()){
        // Oh dear, have to use logs, should be free of cancellation errors though:
        return Math.exp(a * Math.log(z) - z - Gamma.lgamma_imp(a).result);
      } else {
        // direct calculation, no danger of overflow as gamma(a) < 1/a
        // for small a.
        return Math.pow(z, a) * Math.exp(-z) / Gamma.gamma_imp(a);
      }
    } else if((Math.abs(d*d*a) <= 100) && (a > 150)) {
      // special case for large a and a ~ z.
      prefix = a * Log1p.log1pmx(d) + z * (0.5 - Lanczos.g()) / agh;
      prefix = Math.exp(prefix);
    } else {
      //
      // general case.
      // direct computation is most accurate, but use various fallbacks
      // for different parts of the problem domain:
      //
      let alz = a * Math.log(z / agh);
      let amz = a - z;
      if((Math.min(alz, amz) <= Precision.log_min_value()) ||
         (Math.max(alz, amz) >= Precision.log_max_value())) {
        let amza = amz / a;
        if((Math.min(alz, amz)/2 > Precision.log_min_value()) &&
           (Math.max(alz, amz)/2 < Precision.log_max_value())) {
          // compute square root of the result and then square it:
          let sq = Math.pow(z / agh, a / 2) * Math.exp(amz / 2);
          prefix = sq * sq;
        } else if((Math.min(alz, amz)/4 > Precision.log_min_value()) &&
                  (Math.max(alz, amz)/4 < Precision.log_max_value()) &&
                  (z > a)){
          // compute the 4th root of the result then square it twice:
          let sq = Math.pow(z / agh, a / 4) * Math.exp(amz / 4);
          prefix = sq * sq;
          prefix *= prefix;
        } else if((amza > Precision.log_min_value()) &&
                  (amza < Precision.log_max_value())){
          prefix = Math.pow((z * Math.exp(amza)) / agh, a);
        } else {
          prefix = Math.exp(alz + amz);
        }
      } else {
        prefix = Math.pow(z / agh, a) * Math.exp(amz);
      }
    }
    prefix *= Math.sqrt(agh / Math.E) / Lanczos.lanczos_sum_expG_scaled(a);
    return prefix;
  }

  private static *small_gamma2_series(a_: number, x_: number):
  IterableIterator<number> {
    let result = -x_;
    let x = - x_;
    let apn = a_+1;
    let n = 1;

    let r;
    while(true) {
      r = result / apn;
      result *= x;
      n++;
      result /= n;
      apn++;
      yield r;
    }
  }

  /**
   * Upper gamma fraction for very small a:
   */
  private static tgamma_small_upper_part(a: number, x: number, invert: boolean):
  {result: number, pgam: number, pderivative: number} {
    // Compute the full upper fraction (Q) when a is very small:
    let result;
    result = Gamma.tgamma1pm1(a);
    let pgam = (result + 1) / a;
    let p = Powm1.powm1(x, a);
    result -= p;
    result /= a;
    let s = Gamma.small_gamma2_series(a, x);
    p += 1;
    let pderivative = p / (pgam * Math.exp(x));
    let init_value = invert ? pgam : 0;
    const max_iter = 5000;
    result = -p *
      Series.sum_series(
        s,
        Precision.epsilon(), max_iter, (init_value-result)/p).sum;
    if(invert){
      result = -result;
    }

    return {result: result, pgam: pgam, pderivative: pderivative};
  }

  /**
   * Upper gamma fraction for integer a:
   */
  private static finite_gamma_q(a: number, x: number):
  {result: number, pderivative: number} {
    //
    // Calculates normalised Q when a is an integer:
    //
    let e = Math.exp(-x);
    let sum = e;
    if(sum !== 0) {
      let term = sum;
      for(let n = 1; n < a; n++) {
        term /= n;
        term *= x;
        sum += term;
      }
    }

    let pderivative = e * Math.pow(x, a) /
      UncheckedFactorial.unchecked_factorial(Math.trunc(a - 1));

    return {result: sum, pderivative: pderivative};
  }

  /**
   * Upper gamma fraction for half integer a:
   */
  private static finite_half_gamma_q(a: number, x: number):
  {result: number, pderivative: number} {
    //
    // Calculates normalised Q when a is a half-integer:
    //
    let e = Erf.erfc(Math.sqrt(x));
    let pderivative;
    if((e !== 0) && (a > 1)) {
      let term = Math.exp(-x) / Math.sqrt(Math.PI * x);
      term *= x;
      term /= 0.5;
      let sum = term;
      for(let n = 2; n < a; n++) {
        term /= n - 0.5;
        term *= x;
        sum += term;
      }
      e += sum;
      pderivative = 0;
    } else {
      // We'll be dividing by x later, so calculate derivative * x:
      pderivative = Math.sqrt(x) * Math.exp(-x) / Constants.SQRTPI();
    }
    return {result: e, pderivative: pderivative};
  }

  /**
   * Main incomplete gamma entry point, handles all four incomplete gamma's:
   */
  public static gamma_incomplete_imp(a: number,
                                      x: number,
                                      normalised: boolean,
                                      invert: boolean):
  {result: number, pderivative: number} {
    if(a <= 0){
      throw new Error(`Domain Error: Argument a to the incomplete gamma function must${""
        } be greater than zero (got a=${a}).`);
    }

    if(x < 0) {
      throw new Error(`Domain Error: Argument x to the incomplete gamma function must${""
      } be >= 0 (got x=${x}).`);
    }

    let result = 0;
    let pderivative;
    let resultObj: any;

    if(a >= UncheckedFactorial.max_factorial() && !normalised){
      //
      // When we're computing the non-normalized incomplete gamma
      // and a is large the result is rather hard to compute unless
      // we use logs.  There are really two options - if x is a long
      // way from a in value then we can reliably use methods 2 and 4
      // below in logarithmic form and go straight to the result.
      // Otherwise we let the regularized gamma take the strain
      // (the result is unlikely to unerflow in the central region anyway)
      // and combine with lgamma in the hopes that we get a finite result.
      //
      if(invert && (a * 4 < x)) {
        // This is method 4 below, done in logs:
        result = a * Math.log(x) - x;
        pderivative = Math.exp(result);
        result += Math.log(
          Gamma.upper_gamma_fraction(a, x, Precision.epsilon()));
      } else if(!invert && (a > 4 * x)) {
        // This is method 2 below, done in logs:
        result = a * Math.log(x) - x;
        pderivative = Math.exp(result);
        let init_value = 0;
        result += Math.log(Gamma.lower_gamma_series(a, x, init_value) / a);
      } else {
        resultObj = Gamma.gamma_incomplete_imp(a, x, true, invert);
        result = resultObj.result;
        pderivative = resultObj.pderivative;
        if(result === 0) {
          if(invert) {
            // Try http://functions.wolfram.com/06.06.06.0039.01
            result = 1 + 1 / (12 * a) + 1 / (288 * a * a);
            result = Math.log(result) - a + (a - 0.5) * Math.log(a) +
              Math.log(Constants.SQRTTWOPI());
            pderivative = Math.exp(a * Math.log(x) - x);
          } else {
            // This is method 2 below, done in logs, we're really outside the
            // range of this method, but since the result is almost certainly
            // infinite, we should probably be OK:
            result = a * Math.log(x) - x;
            pderivative = Math.exp(result);
            let init_value = 0;
            result += Math.log(Gamma.lower_gamma_series(a, x, init_value) / a);
          }
        } else {
          result = Math.log(result) + Gamma.lgamma(a).result;
        }
      }
      if(result > Precision.log_max_value()) {
        throw new Error(`Overflow error`);
      }
      return {result: Math.exp(result), pderivative: pderivative};
    }


    let is_int: boolean, is_half_int: boolean;
    let is_small_a: boolean = (a < 30) && (a <= x + 1) &&
      (x < Precision.log_max_value());
    if(is_small_a) {
      let fa = Math.floor(a);
      is_int = (fa === a);
      is_half_int = is_int ? false : (Math.abs(fa - a) === 0.5);
    } else {
      is_int = is_half_int = false;
    }

    let eval_method: number;

    if(is_int && (x > 0.6)) {
      // calculate Q via finite sum:
      invert = !invert;
      eval_method = 0;
    } else if(is_half_int && (x > 0.2)) {
      // calculate Q via finite sum for half integer a:
      invert = !invert;
      eval_method = 1;
    }
    else if((x < Precision.root_epsilon()) && (a > 1)){
      eval_method = 6;
    } else if(x < 0.5) {
      //
      // Changeover criterion chosen to give a changeover at Q ~ 0.33
      //
      if(-0.4 / Math.log(x) < a) {
        eval_method = 2;
      } else {
        eval_method = 3;
      }
    } else if(x < 1.1) {
      //
      // Changover here occurs when P ~ 0.75 or Q ~ 0.25:
      //
      if(x * 0.75 < a) {
        eval_method = 2;
      } else {
        eval_method = 3;
      }
    } else {
      //
      // Begin by testing whether we're in the "bad" zone
      // where the result will be near 0.5 and the usual
      // series and continued fractions are slow to converge:
      //
      let use_temme: boolean = false;
      if(normalised /*&& std::numeric_limits<T>::is_specialized*/ && (a > 20)){
        let sigma = Math.abs((x-a)/a);
        if((a > 200) /*&& (policies::digits<T, Policy>() <= 113)*/){
          //
          // This limit is chosen so that we use Temme's expansion
          // only if the result would be larger than about 10^-6.
          // Below that the regular series and continued fractions
          // converge OK, and if we use Temme's method we get increasing
          // errors from the dominant erfc term as it's (inexact) argument
          // increases in magnitude.
          //
          if(20 / a > sigma * sigma)
            use_temme = true;
        }else /*if(policies::digits<T, Policy>() <= 64)*/{
          // Note in this zone we can't use Temme's expansion for
          // types longer than an 80-bit real:
          // it would require too many terms in the polynomials.
          if(sigma < 0.4) {
            use_temme = true;
          }
        }
      }

      if(use_temme) {
        eval_method = 5;
      } else {
        //
        // Regular case where the result will not be too close to 0.5.
        //
        // Changeover here occurs at P ~ Q ~ 0.5
        // Note that series computation of P is about x2 faster than continued fraction
        // calculation of Q, so try and use the CF only when really necessary, especially
        // for small x.
        //
        if(x - (1 / (3 * x)) < a) {
          eval_method = 2;
        } else {
          eval_method = 4;
          invert = !invert;
        }
      }
    }

    switch(eval_method) {
      case 0:
        resultObj = Gamma.finite_gamma_q(a, x);
        result = resultObj.result;
        pderivative = resultObj.pderivative;
        if(normalised == false){
          result *= Gamma.tgamma(a);
        }
        break;

      case 1:
        resultObj = Gamma.finite_half_gamma_q(a, x);
        result = resultObj.result;
        pderivative = resultObj.pderivative;
        if(normalised == false)
          result *= Gamma.tgamma(a);
        if(pderivative === 0) {
          pderivative = Gamma.regularised_gamma_prefix(a, x);
        }
        break;

      case 2:
        // Compute P:
        result = normalised ?
          Gamma.regularised_gamma_prefix(a, x) : Gamma.full_igamma_prefix(a, x);
        pderivative = result;
        if(result !== 0) {
          //
          // If we're going to be inverting the result then we can
          // reduce the number of series evaluations by quite
          // a few iterations if we set an initial value for the
          // series sum based on what we'll end up subtracting it from
          // at the end.
          // Have to be careful though that this optimization doesn't
          // lead to spurious numberic overflow.  Note that the
          // scary/expensive overflow checks below are more often
          // than not bypassed in practice for "sensible" input
          // values:
          //
          let init_value = 0;
          let optimised_invert: boolean = false;
          if(invert) {
            init_value = (normalised ? 1 : Gamma.tgamma(a));
            if(normalised || (result >= 1) || (Number.MAX_VALUE * result > init_value)){
              init_value /= result;
              if(normalised || (a < 1) || (Number.MAX_VALUE / a > init_value)){
                init_value *= -a;
                optimised_invert = true;
              } else {
                init_value = 0;
              }
            } else {
              init_value = 0;
            }
          }
          result *= Gamma.lower_gamma_series(a, x, init_value) / a;
          if(optimised_invert) {
            invert = false;
            result = -result;
          }
        }
        break;

      case 3:
        // Compute Q:
        invert = !invert;
        let g;
        resultObj = Gamma.tgamma_small_upper_part(a, x, invert);
        g = resultObj.pgam;
        result = resultObj.result;
        pderivative = resultObj.pderivative;
        invert = false;
        if(normalised) {
          result /= g;
        }
        break;

      case 4:
        // Compute Q:
        result = normalised ?
          Gamma.regularised_gamma_prefix(a, x) : Gamma.full_igamma_prefix(a, x);
        pderivative = result;
        if(result !== 0) {
          const frac = Gamma.upper_gamma_fraction(a, x, Precision.epsilon());
          result *= frac;
        }
        break;

      case 5:
        //
        // Use compile time dispatch to the appropriate
        // Temme asymptotic expansion.  This may be dead code
        // if T does not have numeric limits support, or has
        // too many digits for the most precise version of
        // these expansions, in that case we'll be calling
        // an empty function.
        //
        result = IGammaLarge.igamma_temme_large(a, x);
        if(x >= a) {
          invert = !invert;
        }
        pderivative = Gamma.regularised_gamma_prefix(a, x);
        break;

      case 6:
        // x is so small that P is necessarily very small too,
        // use http://functions.wolfram.com/GammaBetaErf/GammaRegularized/06/01/05/01/01/
        result = !normalised ?
          Math.pow(x, a) / (a) : Math.pow(x, a) / Gamma.tgamma(a + 1);
        result *= 1 - a * x / (a + 1);
        break;

    }

    if(normalised && (result > 1)) {
      result = 1;
    }

    if(invert) {
      let gam = normalised ? 1 : Gamma.tgamma(a);
      result = gam - result;
    }

    //
    // Need to convert prefix term to derivative:
    //
    if((x < 1) && (Number.MAX_VALUE * x < pderivative)){
      // overflow, just return an arbitrarily large value:
      pderivative = Number.MAX_VALUE / 2;
    }

    pderivative /= x;


    return {result: result, pderivative: pderivative};
  }

  /**
   * Ratios of two gamma functions:
   */
  private static tgamma_delta_ratio_imp_lanczos(z: number, delta: number): number {
    if(z < Precision.epsilon()) {
      //
      // We get spurious numeric overflow unless we're very careful, this
      // can occur either inside Lanczos::lanczos_sum(z) or in the
      // final combination of terms, to avoid this, split the product up
      // into 2 (or 3) parts:
      //
      // G(z) / G(L) = 1 / (z * G(L)) ; z < eps, L = z + delta = delta
      //    z * G(L) = z * G(lim) * (G(L)/G(lim)) ; lim = largest factorial
      //
      if(UncheckedFactorial.max_factorial() < delta){
        let ratio = Gamma.tgamma_delta_ratio_imp_lanczos(
          delta,
          (UncheckedFactorial.max_factorial() - delta)
        );
        ratio *= z;
        ratio *= UncheckedFactorial.unchecked_factorial(
          UncheckedFactorial.max_factorial() - 1
        );
        return 1 / ratio;
      } else {
        return 1 / (z * Gamma.tgamma(z + delta));
      }
    }
    let zgh = z + Lanczos.g() - 0.5;
    let result;
    if(z + delta === z) {
      if(Math.abs(delta) < 10){
        result = Math.exp((0.5 - z) * Log1p.log1p(delta / zgh));
      } else {
        result = 1;
      }
    } else {
      if(Math.abs(delta) < 10) {
        result = Math.exp((0.5 - z) * Log1p.log1p(delta / zgh));
      } else {
        result = Math.pow(zgh / (zgh + delta), z - 0.5);
      }
      // Split the calculation up to avoid spurious overflow:
      result *= Lanczos.lanczos_sum(z) / Lanczos.lanczos_sum(z + delta);
    }
    result *= Math.pow(Math.E / (zgh + delta), delta);
    return result;
  }

  private static tgamma_delta_ratio_imp(z: number, delta: number): number {

    if((z <= 0) || (z + delta <= 0)) {
      // This isn't very sofisticated, or accurate, but it does work:
      return Gamma.tgamma(z) / Gamma.tgamma(z + delta);
    }

    if(Math.floor(delta) === delta) {
      if(Math.floor(z) === z) {
        //
        // Both z and delta are integers, see if we can just use table lookup
        // of the factorials to get the result:
        //
        if((z <= UncheckedFactorial.max_factorial()) &&
           (z + delta <= UncheckedFactorial.max_factorial())) {
          return UncheckedFactorial.unchecked_factorial(Math.trunc(z) - 1) /
            UncheckedFactorial.unchecked_factorial(Math.trunc(z + delta) - 1);
        }
      }
      if(Math.abs(delta) < 20) {
        // delta is a small integer, we can use a finite product:
        if(delta === 0) {
          return 1;
        }

        if(delta < 0) {
          z -= 1;
          let result = z;
          while(0 !== (delta += 1)) {
            z -= 1;
            result *= z;
          }
          return result;
        } else {
          let result = 1 / z;
          while(0 != (delta -= 1)) {
            z += 1;
            result /= z;
          }
          return result;
        }
      }
    }

    return Gamma.tgamma_delta_ratio_imp_lanczos(z, delta);
  }

  private static tgamma_ratio_imp(x: number, y: number): number {
    if((x <= 0) || x === Number.POSITIVE_INFINITY) {
      throw new Error(`Domain error: Gamma function ratios only implemented for${""
      } positive arguments (got a=${x}).`);
    }
    if((y <= 0) || y === Number.POSITIVE_INFINITY) {
      throw new Error(`Domain error: Gamma function ratios only implemented for${""
        } positive arguments (got b=${y}).`);
    }

    if(x <= Number.MIN_VALUE){
      // Special case for denorms...Ugh.
      let shift = Math.pow(2, 53);
      return shift * Gamma.tgamma_ratio_imp(x * shift, y);
    }

    if((x < UncheckedFactorial.max_factorial()) &&
       (y < UncheckedFactorial.max_factorial())) {
      // Rather than subtracting values, lets just call the gamma functions directly:
      return Gamma.tgamma(x) / Gamma.tgamma(y);
    }
    let prefix = 1;
    if(x < 1) {
      if(y < 2 * UncheckedFactorial.max_factorial()){
        // We need to sidestep on x as well, otherwise we'll underflow
        // before we get to factor in the prefix term:
        prefix /= x;
        x += 1;
        while(y >=  UncheckedFactorial.max_factorial()){
          y -= 1;
          prefix /= y;
        }
        return prefix * Gamma.tgamma(x) / Gamma.tgamma(y);
      }
      //
      // result is almost certainly going to underflow to zero, try logs just in case:
      //
      return Math.exp(Gamma.lgamma(x).result - Gamma.lgamma(y).result);
    }
    if(y < 1) {
      if(x < 2 * UncheckedFactorial.max_factorial()) {
        // We need to sidestep on y as well, otherwise we'll overflow
        // before we get to factor in the prefix term:
        prefix *= y;
        y += 1;
        while(x >= UncheckedFactorial.max_factorial()) {
          x -= 1;
          prefix *= x;
        }
        return prefix * Gamma.tgamma(x) / Gamma.tgamma(y);
      }
      //
      // Result will almost certainly overflow, try logs just in case:
      //
      return Math.exp(Gamma.lgamma(x).result - Gamma.lgamma(y).result);
    }
    //
    // Regular case, x and y both large and similar in magnitude:
    //
    return Gamma.tgamma_delta_ratio(x, y - x);
  }

  private static gamma_p_derivative_imp(a: number, x: number): number {
    // Usual error checks first:
    if(a <= 0) {
      throw new Error(`Domain error: Argument a to the incomplete gamma function must${""
        } be greater than zero (got a=${a}).`);
    }

    if(x < 0) {
      throw new Error(`Domain error: Argument x to the incomplete gamma function must${""
        } be >= 0 (got x=${x}).`);
    }

    //
    // Now special cases:
    //
    if(x === 0) {
      if (a > 1) {
        return 0;
      } else {
        if (a === 1) {
          return 1;
        } else {
          throw new Error(`Overflow error`);
        }
      }
    }

    let f1 = Gamma.regularised_gamma_prefix(a, x);

    if((x < 1) && (Number.MAX_VALUE * x < f1)){
      // overflow:
      throw new Error(`Overflow error`);
    }

    if(f1 === 0) {
      // Underflow in calculation, use logs instead:
      f1 = a * Math.log(x) - x - Gamma.lgamma(a).result - Math.log(x);
      f1 = Math.exp(f1);
    } else {
      f1 /= x;
    }

    return f1;
  }

  /**
   * first tgamma overload for gamma function
   */
  public static tgamma(z: number): number;

  /**
   * second tgamma overload for non-regularized upper incomplete gamma function
   */
  public static tgamma(a: number, z: number): number;

  /**
   * implementation for the two overloads
   */
  public static tgamma(arg1: number, arg2?: number): number {
    if (typeof arg2 === "number") {
      const a = arg1;
      const z = arg2;
      return Gamma.gamma_incomplete_imp(a, z, false, true).result;
    } else {
      const z = arg1;
      return Gamma.gamma_imp(z);
    }
  }

  /**
   * non-regularized lower incomplete gamma function
   */
  public static tgamma_lower(a: number, z: number): number {
    return Gamma.gamma_incomplete_imp(a, z, false, false).result;
  }

  public static lgamma(z: number): {result: number, sign: number} {
    return Gamma.lgamma_imp(z);
  }

  public static tgamma1pm1(z: number): number {
    return Gamma.tgammap1m1_imp(z);
  }

  public static gamma_q(a: number, z: number): number {
    return Gamma.gamma_incomplete_imp(a, z, true, true).result;
  }

  public static gamma_p(a: number, z: number): number {
    return Gamma.gamma_incomplete_imp(a, z, true, false).result;
  }

  public static tgamma_delta_ratio(z: number, delta: number): number {
    return Gamma.tgamma_delta_ratio_imp(z, delta);
  }

  public static tgamma_ratio(a: number, b: number): number {
    return Gamma.tgamma_ratio_imp(a, b);
  }

  public static gamma_p_derivative(a: number, x: number): number {
    return Gamma.gamma_p_derivative_imp(a, x);
  }

  public static igamma_derivative(a: number,
                                  x: number,
                                  lower: boolean = true,
                                  normalised: boolean = true):
  number {
    // Usual error checks first:
    if(a <= 0) {
      throw new Error(`Domain error: Argument a to the incomplete gamma function must${""
        } be greater than zero (got a=${a}).`);
    }

    if(x < 0) {
      throw new Error(`Domain error: Argument x to the incomplete gamma function must${""
        } be >= 0 (got x=${x}).`);
    }

    //
    // Now special cases:
    //
    if(x === 0) {
      if (a > 1) {
        return 0;
      } else {
        if (a === 1) {
          return (normalised ? 1 : Gamma.tgamma(a));
        } else {
          throw new Error(`Overflow error`);
        }
      }
    }

    if (!normalised && a > UncheckedFactorial.max_factorial()) {
      throw new Error(`Overflow error`);
    }

    return  (lower ? 1 : -1) *
            (normalised ?
              Gamma.gamma_p_derivative(a, x)
              :
              Gamma.full_igamma_prefix(a, x)/x);
  }

}
