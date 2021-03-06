"use strict";

/**
 * (C) Copyright John Maddock 2006.
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
const Lanczos = require("./lanczos").Lanczos;
const Log1p = require("./log1p").Log1p;
const Expm1 = require("./expm1").Expm1;
const Series = require("../tools/series").Series;
const Fraction = require("../tools/fraction").Fraction;
const Gamma = require("./gamma").Gamma;
const UncheckedFactorial = require("./detail/unchecked_factorial").UncheckedFactorial;
const Constants = require("../tools/constants").Constants;
const Powm1 = require("./powm1").Powm1;


export class Beta {

  /**
   * Implementation of BetaDist(a,b) using the Lanczos approximation
   */
  private static beta_imp(a: number, b: number) {

    if(a <= 0 || b <= 0) {
      throw new Error(
        `The arguments to the beta function must be greater than zero (got a=${a
        }, b=${b}).`);
    }

    let result: number;
    let c = a + b;

    // Special cases:
    if((c === a) && (b < Precision.epsilon())) {
      return 1 / b;
    } else if((c === b) && (a < Precision.epsilon())) {
      return 1 / a;
    }

    if (b === 1) {
      return 1/a;
    } else if (a === 1) {
      return 1/b;
    } else if(c < Precision.epsilon()){
      result = c / a;
      result /= b;
      return result;
    }

    if(a < b) {
      let temp = a;
      a = b;
      b = temp;
    }

    // Lanczos calculation:
    let agh = a + Lanczos.g() - 0.5;
    let bgh = b + Lanczos.g() - 0.5;
    let cgh = c + Lanczos.g() - 0.5;
    result = Lanczos.lanczos_sum_expG_scaled(a) *
      (Lanczos.lanczos_sum_expG_scaled(b) / Lanczos.lanczos_sum_expG_scaled(c));
    let ambh = a - 0.5 - b;

    if((Math.abs(b * ambh) < (cgh * 100)) && (a > 100)) {
      // Special case where the base of the power term is close to 1
      // compute (1+x)^y instead:
      result *= Math.exp(ambh * Log1p.log1p(-b / cgh));
    } else {
      result *= Math.pow(agh / cgh, a - 0.5 - b);
    }
    if(cgh > 1e10) {
      // this avoids possible overflow, but appears to be marginally less accurate:
      result *= Math.pow((agh / cgh) * (bgh / cgh), b);
    } else {
      result *= Math.pow((agh * bgh) / (cgh * cgh), b);
    }

    result *= Math.sqrt(Math.E / bgh);

    return result;
  }

  /**
   * Compute the leading power terms in the incomplete BetaDist:
   *
   * (x^a)(y^b)/BetaDist(a,b) when normalised, and
   * (x^a)(y^b) otherwise.
   *
   * Almost all of the error in the incomplete beta comes from this
   * function: particularly when a and b are large. Computing large
   * powers are *hard* though, and using logarithms just leads to
   * horrendous cancellation errors.
   */
  public static ibeta_power_terms(a: number,
                                  b: number,
                                  x: number,
                                  y: number,
                                  normalised: boolean,
                                  prefix = 1):
  number {

    if(!normalised) {
      // can we do better here?
      return Math.pow(x, a) * Math.pow(y, b);
    }

    let result;

    let c = a + b;

    // combine power terms with Lanczos approximation:
    let agh = a + Lanczos.g() - 0.5;
    let bgh = b + Lanczos.g() - 0.5;
    let cgh = c + Lanczos.g() - 0.5;
    result = Lanczos.lanczos_sum_expG_scaled(c) /
      (Lanczos.lanczos_sum_expG_scaled(a) * Lanczos.lanczos_sum_expG_scaled(b));
    result *= prefix;
    // combine with the leftover terms from the Lanczos approximation:
    result *= Math.sqrt(bgh / Math.E);
    result *= Math.sqrt(agh / cgh);

    // l1 and l2 are the base of the exponents minus one:
    let l1 = (x * b - y * agh) / agh;
    let l2 = (y * a - x * bgh) / bgh;
    if((Math.min(Math.abs(l1), Math.abs(l2)) < 0.2)) {
      // when the base of the exponent is very near 1 we get really
      // gross errors unless extra care is taken:
      if((l1 * l2 > 0) || (Math.min(a, b) < 1)) {
        //
        // This first branch handles the simple cases where either:
        //
        // * The two power terms both go in the same direction
        // (towards zero or towards infinity).  In this case if either
        // term overflows or underflows, then the product of the two must
        // do so also.
        // *Alternatively if one exponent is less than one, then we
        // can't productively use it to eliminate overflow or underflow
        // from the other term.  Problems with spurious overflow/underflow
        // can't be ruled out in this case, but it is *very* unlikely
        // since one of the power terms will evaluate to a number close to 1.
        //
        if(Math.abs(l1) < 0.1) {
          result *= Math.exp(a * Log1p.log1p(l1));
        } else {
          result *= Math.pow((x * cgh) / agh, a);
        }

        if(Math.abs(l2) < 0.1) {
          result *= Math.exp(b * Log1p.log1p(l2));
        } else {
          result *= Math.pow((y * cgh) / bgh, b);
        }
      } else if(Math.max(Math.abs(l1), Math.abs(l2)) < 0.5){
        //
        // Both exponents are near one and both the exponents are
        // greater than one and further these two
        // power terms tend in opposite directions (one towards zero,
        // the other towards infinity), so we have to combine the terms
        // to avoid any risk of overflow or underflow.
        //
        // We do this by moving one power term inside the other, we have:
        //
        //    (1 + l1)^a * (1 + l2)^b
        //  = ((1 + l1)*(1 + l2)^(b/a))^a
        //  = (1 + l1 + l3 + l1*l3)^a   ;  l3 = (1 + l2)^(b/a) - 1
        //                                    = exp((b/a) * log(1 + l2)) - 1
        //
        // The tricky bit is deciding which term to move inside :-)
        // By preference we move the larger term inside, so that the
        // size of the largest exponent is reduced.  However, that can
        // only be done as long as l3 (see above) is also small.
        //
        let small_a: boolean = a < b;
        let ratio = b / a;
        if((small_a && (ratio * l2 < 0.1)) || (!small_a && (l1 / ratio > 0.1))) {
          let l3 = Expm1.expm1(ratio * Log1p.log1p(l2));
          l3 = l1 + l3 + l3 * l1;
          l3 = a * Log1p.log1p(l3);
          result *= Math.exp(l3);
        } else {
          let l3 = Expm1.expm1(Log1p.log1p(l1) / ratio);
          l3 = l2 + l3 + l3 * l2;
          l3 = b * Log1p.log1p(l3);
          result *= Math.exp(l3);
        }
      } else if (Math.abs(l1) < Math.abs(l2)) {
        // First base near 1 only:
        let l = a * Log1p.log1p(l1) + b * Math.log((y * cgh) / bgh);
        if((l <= Precision.log_min_value()) ||
            (l >= Precision.log_max_value())){
          l += Math.log(result);
          if(l >= Precision.log_max_value()) {
            throw new Error(`Overflow error`);
          }
          result = Math.exp(l);
        } else {
          result *= Math.exp(l);
        }
      } else {
        // Second base near 1 only:
        let l = b * Log1p.log1p(l2) + a * Math.log((x * cgh) / agh);
        if((l <= Precision.log_min_value()) ||
            (l >= Precision.log_max_value())) {
          l += Math.log(result);
          if(l >= Precision.log_max_value()) {
            throw new Error(`Overflow error`);
          }
          result = Math.exp(l);
        } else {
            result *= Math.exp(l);
        }
      }
    } else {
      // general case:
      let b1 = (x * cgh) / agh;
      let b2 = (y * cgh) / bgh;
      l1 = a * Math.log(b1);
      l2 = b * Math.log(b2);

      if((l1 >= Precision.log_max_value())
          || (l1 <= Precision.log_min_value())
          || (l2 >= Precision.log_max_value())
          || (l2 <= Precision.log_min_value())) {
        // Oops, under/overflow, sidestep if we can:
        if(a < b) {
          let p1 = Math.pow(b2, b / a);
          let l3 = a * (Math.log(b1) + Math.log(p1));
          if((l3 < Precision.log_max_value()) &&
              (l3 > Precision.log_min_value())) {
            result *= Math.pow(p1 * b1, a);
          } else {
            l2 += l1 + Math.log(result);
            if(l2 >= Precision.log_max_value()){
              throw new Error(`Overflow error`);
            }
            result = Math.exp(l2);
          }
        } else {
          let p1 = Math.pow(b1, a / b);
          let l3 = (Math.log(p1) + Math.log(b2)) * b;
          if((l3 < Precision.log_max_value()) &&
            (l3 > Precision.log_min_value())) {
            result *= Math.pow(p1 * b2, b);
          } else {
            l2 += l1 + Math.log(result);
            if(l2 >= Precision.log_max_value()){
              throw new Error(`Overflow error`);
            }
            result = Math.exp(l2);
          }
        }
      } else {
        // finally the normal case:
        result *= Math.pow(b1, a) * Math.pow(b2, b);
      }
    }

    return result;
  }

  /**
   * Generator for the terms of the series approximation to the incomplete beta
   */
  private static *i_beta_series_generator(a_: number,
                                          b_: number,
                                          x_: number,
                                          mult: number): IterableIterator<number> {
    let result = mult;
    let x = x_;
    let apn = a_;
    let poch = 1-b_;
    let n = 1;

    while(true) {
      let r = result / apn;
      apn += 1;
      result *= poch * x / n;
      n++;
      poch += 1;
      yield r;
    }
  }

  /**
   * Series approximation to the incomplete beta:
   */
  private static ibeta_series(a: number,
                             b: number,
                             x: number,
                             s0: number,
                             normalised: boolean,
                             y: number): {result: number, p_derivative: null | number} {
    let result;
    let p_derivative: null | number = null;

    if(normalised) {
      let c = a + b;

      // incomplete beta power term, combined with the Lanczos approximation:
      let agh = a + Lanczos.g() - 0.5;
      let bgh = b + Lanczos.g() - 0.5;
      let cgh = c + Lanczos.g() - 0.5;
      result = Lanczos.lanczos_sum_expG_scaled(c) /
        (Lanczos.lanczos_sum_expG_scaled(a) *
        Lanczos.lanczos_sum_expG_scaled(b));

      let l1 = Math.log(cgh / bgh) * (b - 0.5);
      let l2 = Math.log(x * cgh / agh) * a;

      //
      // Check for over/underflow in the power terms:
      //
      if((l1 > Precision.log_min_value())
          && (l1 < Precision.log_max_value())
          && (l2 > Precision.log_min_value())
          && (l2 < Precision.log_max_value())) {
        if(a * b < bgh * 10) {
          result *= Math.exp((b - 0.5) * Log1p.log1p(a / bgh));
        } else {
          result *= Math.pow(cgh / bgh, b - 0.5);
        }

        result *= Math.pow(x * cgh / agh, a);
        result *= Math.sqrt(agh / Math.E);

        p_derivative = result * Math.pow(y, b);
      } else {
        //
        // Oh dear, we need logs, and this *will* cancel:
        //
        result = Math.log(result) + l1 + l2 + (Math.log(agh) - 1) / 2;
        p_derivative = Math.exp(result + b * Math.log(y));
        result = Math.exp(result);
      }
    } else {
      // Non-normalised, just compute the power:
      result = Math.pow(x, a);
    }

    if(result < Number.MIN_VALUE) {
      // Safeguard: series can't cope with denorms.
      return {result: s0, p_derivative: p_derivative};
    }


    let s = Beta.i_beta_series_generator(a, b, x, result);
    let max_iter = 2000;
    result = Series.sum_series(s, Precision.epsilon(), max_iter, s0);

    return {result: result.sum, p_derivative: p_derivative};
  }


  /**
   * Continued fraction for the incomplete beta:
   */
  private static *i_beta_fraction2_generator(a_: number,
                                             b_: number,
                                             x_: number,
                                             y_: number):
  Iterator<{a: number, b: number}>{
    let a = a_;
    let b = b_;
    let x = x_;
    let y = y_;
    let m = 0;

    while(true) {
      let aN = (a + m - 1) * (a + b + m - 1) * m * (b - m) * x * x;
      let denom = (a + 2 * m - 1);
      aN /= denom * denom;

      let bN = m;
      bN += (m * (b - m) * x) / (a + 2*m - 1);
      bN += ((a + m) * (a * y - b * x + 1 + m *(2 - x))) / (a + 2*m + 1);

      m++;

      yield {a: aN, b: bN};
    }
  }

  /**
   * Evaluate the incomplete beta via the continued fraction representation:
   */
  private static ibeta_fraction2(a: number,
                                b: number,
                                x: number,
                                y: number,
                                normalised: boolean = true):
  {result: number, p_derivative: null | number} {
    let result = Beta.ibeta_power_terms(a, b, x, y, normalised);
    let p_derivative = result;

    if(result === 0) {
      return {result: result, p_derivative: p_derivative};
    }

    let f = Beta.i_beta_fraction2_generator(a, b, x, y);
    let fract = Fraction.continued_fraction("B", f, Precision.epsilon(), 500);

    return {result: result / fract.value, p_derivative: p_derivative};
  }

  /**
   * Computes the difference between ibeta(a,b,x) and ibeta(a+k,b,x):
   */
  private static ibeta_a_step(a: number,
                              b: number,
                              x: number,
                              y: number,
                              k: number,
                              normalised: boolean):
  {result: number, p_derivative: null | number} {

    let prefix = Beta.ibeta_power_terms(a, b, x, y, normalised);
    let p_derivative = prefix;

    prefix /= a;
    if(prefix === 0){
      return {result: prefix, p_derivative: p_derivative};
    }

    let sum = 1;
    let term = 1;
    // series summation from 0 to k-1:
    for(let i = 0; i < k-1; i++) {
      term *= (a+b+i) * x / (a+i+1);
      sum += term;
    }
    prefix *= sum;

    return {result: prefix, p_derivative: p_derivative };
  }

  /**
   * This function is only needed for the non-regular incomplete beta,
   * it computes the delta in:
   * beta(a,b,x) = prefix + delta * beta(a+k,b,x)
   * it is currently only called for small k.
   */
  private static rising_factorial_ratio(a: number, b: number, k: number): number {
    // calculate:
    // (a)(a+1)(a+2)...(a+k-1)
    // _______________________
    // (b)(b+1)(b+2)...(b+k-1)

    // This is only called with small k, for large k
    // it is grossly inefficient, do not use outside it's
    // intended purpose!!!
    if (k === 0) {
      return 1;
    }

    let result = 1;
    for (let i=0; i<k; i++) {
      result *= (a+i) / (b+i);
    }

    return result;
  }

  /**
   *
   * Routine for a > 15, b < 1
   *
   * Begin by figuring out how large our table of Pn's should be,
   * quoted accuracies are "guestimates" based on empiracal observation.
   * Note that the table size should never exceed the size of our
   * tables of factorials.
   */
  private static Pn_size(): number {return 30;}

  private static beta_small_b_large_a_series(a: number,
                                             b: number,
                                             x: number,
                                             y: number,
                                             s0: number,
                                             mult: number,
                                             normalised: boolean): number {
    //
    // This is DiDonato and Morris's BGRAT routine, see Eq's 9 through 9.6.
    //
    // Some values we'll need later, these are Eq 9.1:
    //
    let bm1 = b - 1;
    let t = a + bm1 / 2;
    let lx = y < 0.35 ?  Log1p.log1p(-y) : Math.log(x);
    let u = -t * lx;
    // and from from 9.2:
    let prefix;
    let h = Gamma.regularised_gamma_prefix(b, u);
    if (h <= Number.MIN_VALUE) {
      return s0;
    }

    if(normalised) {
      prefix = h / Gamma.tgamma_delta_ratio(a, b);
      prefix /= Math.pow(t, b);
    } else {
      prefix = Gamma.full_igamma_prefix(b, u) / Math.pow(t, b);
    }
    prefix *= mult;
    //
    // now we need the quantity Pn, unfortunatately this is computed
    // recursively, and requires a full history of all the previous values
    // so no choice but to declare a big table and hope it's big enough...
    //
    let p: number[] = [1];  // see 9.3.
    //
    // Now an initial value for J, see 9.6:
    //
    let j = Gamma.gamma_q(b, u) / h;
    //
    // Now we can start to pull things together and evaluate the sum in Eq 9:
    //
    let sum = s0 + prefix * j;  // Value at N = 0
    // some variables we'll need:
    let tnp1 = 1; // 2*N+1
    let lx2 = lx / 2;
    lx2 *= lx2;
    let lxp = 1;
    let t4 = 4 * t * t;
    let b2n = b;

    for(let n = 1; n < Beta.Pn_size(); n++){
      /*
       // debugging code, enable this if you want to determine whether
       // the table of Pn's is large enough...
       //
       static int max_count = 2;
       if(n > max_count)
       {
       max_count = n;
       std::cerr << "Max iterations in BGRAT was " << n << std::endl;
       }
       */
      //
      // begin by evaluating the next Pn from Eq 9.4:
      //
      tnp1 += 2;
      p.push(0);
      let mbn = b - n;
      let tmp1 = 3;
      for(let m = 1; m < n; m++){
        mbn = m * b - n;
        p[n] += mbn * p[n-m] / UncheckedFactorial.unchecked_factorial(tmp1);
        tmp1 += 2;
      }
      p[n] /= n;
      p[n] += bm1 / UncheckedFactorial.unchecked_factorial(tnp1);
      //
      // Now we want Jn from Jn-1 using Eq 9.6:
      //
      j = (b2n * (b2n + 1) * j + (u + b2n + 1) * lxp) / t4;
      lxp *= lx2;
      b2n += 2;
      //
      // pull it together with Eq 9:
      //
      let r = prefix * p[n] * j;
      sum += r;
      if(r > 1) {
        if(Math.abs(r) < Math.abs(Precision.epsilon() * sum))
        break;
      } else {
        if(Math.abs(r / Precision.epsilon()) < Math.abs(sum))
        break;
      }
    }
    return sum;
  }

  public static binomial_coefficient(n: number, k: number): number {
    const UncheckedFactorial = require("./detail/unchecked_factorial").UncheckedFactorial;
    if(k > n) {
      throw new Error(`Domain error: The binomial coefficient is undefined for k > n,${""
        } but got k = ${k}, n = ${n}.`);
    }

    let result;
    if((k === 0) || (k === n))
      return 1;
    if((k === 1) || (k === n-1))
      return n;

    if(n <= UncheckedFactorial.max_factorial()){
      // Use fast table lookup:
      result = UncheckedFactorial.unchecked_factorial(n);
      result /= UncheckedFactorial.unchecked_factorial(n-k);
      result /= UncheckedFactorial.unchecked_factorial(k);
    } else {
      // Use the beta function:
      if(k < n - k) {
        result = k * Beta.beta(k, n-k+1);
      } else {
        result = (n - k) * Beta.beta(k+1, n-k);
      }

      if(result === 0) {
        throw new Error(`Overflow error`);
      }
      result = 1 / result;
    }
    // convert to nearest integer:
    return Math.ceil(result - 0.5);
  }

  /**
   * For integer arguments we can relate the incomplete beta to the
   * complement of the binomial distribution cdf and use this finite sum.
   */
  private static binomial_ccdf(n: number, k: number, x: number, y: number): number {
    let result = Math.pow(x, n);

    if(result > Number.MIN_VALUE){
      let term = result;
      for(let i = Math.trunc(n - 1); i > k; i--) {
        term *= ((i + 1) * y) / ((n - i) * x);
        result += term;
      }
    } else {
      // First term underflows so we need to start at the mode of the
      // distribution and work outwards:
      let start = Math.trunc(n * x);
      if(start <= k + 1) {
        start = Math.trunc(k + 2);
      }
      result = Math.pow(x, start) * Math.pow(y, n - start) *
        Beta.binomial_coefficient(Math.trunc(n), Math.trunc(start));
      if(result === 0) {
        // OK, starting slightly above the mode didn't work,
        // we'll have to sum the terms the old fashioned way:
        for(let i = start - 1; i > k; i--) {
          result += Math.pow(x, i) * Math.pow(y, n - i) *
            Beta.binomial_coefficient(Math.trunc(n), Math.trunc(i));
        }
      } else {
        let term = result;
        let start_term = result;
        for(let i = start - 1; i > k; i--) {
          term *= ((i + 1) * y) / ((n - i) * x);
          result += term;
        }
        term = start_term;
        for(let i = start + 1; i <= n; i++)
        {
          term *= (n - i + 1) * x / (i * y);
          result += term;
        }
      }
    }

    return result;
  }

  /**
   * The incomplete beta function implementation:
   * This is just a big bunch of spaghetti code to divide up the
   * input range and select the right implementation method for
   * each domain:
   */
  public static ibeta_imp(a: number,
                           b: number,
                           x: number,
                           inv: boolean,
                           normalised: boolean): {result: number, pderivative: number} {

    let result: number;
    let resultObj: any;
    let invert: boolean = inv;
    let fract;
    let y = 1 - x;
    let pderivative = -1; // value not set.

    if((x < 0) || (x > 1)) {
      throw new Error(`Domain error: Parameter x outside the range [0,1] in the${""
      } incomplete beta function (got x=${x}).`);
    }

    if(normalised) {
      if(a < 0) {
        throw new Error(`Domain error: The argument a to the incomplete beta function${""
        } must be >= zero (got a=${a}).`);
      }
      if(b < 0) {
        throw new Error(`Domain error: The argument b to the incomplete beta function${""
        } must be >= zero (got b=${b}).`);
      }
      // extend to a few very special cases:
      if(a === 0) {
        if(b === 0){
          throw new Error(`Domain error: The arguments a and b to the incomplete beta${""
          } function cannot both be zero, with x=${x}.`);
        }
        if(b > 0) {
          result = inv ? 0 : 1;
          return {result: result, pderivative: pderivative};
        }
      } else if(b === 0) {
        if(a > 0) {
          result = inv ? 1 : 0;
          return {result: result, pderivative: pderivative};
        }
      }
    } else {
      if(a <= 0) {
        throw new Error(`Domain error: The argument a to the incomplete beta function${""
        } must be greater than zero (got a=${a}).`);
      }
      if(b <= 0) {
        throw new Error(`Domain error: The argument b to the incomplete beta function${""
        } must be greater than zero (got b=${b}).`);
      }
    }

    if(x === 0) {
      pderivative = (a === 1) ? 1 : (a < 1) ? Number.MAX_VALUE / 2 : Number.MIN_VALUE * 2;
      result = (invert ? (normalised ? 1 : Beta.beta(a, b)) : 0);
      return {result: result, pderivative: pderivative};
    }
    if(x === 1) {
      pderivative = (b === 1) ? 1 : (b < 1) ? Number.MAX_VALUE / 2 : Number.MIN_VALUE * 2;
      result = (!invert ? (normalised ? 1 : Beta.beta(a, b)) : 0);
    }
    if((a === 0.5) && (b === 0.5)) {
      // We have an arcsine distribution:
      pderivative = 1 / Math.PI * Math.sqrt(y * x);
      let p = invert ?
        Math.asin(Math.sqrt(y)) / Constants.HALFPI()
        :
        Math.asin(Math.sqrt(x)) / Constants.HALFPI();
      if(!normalised) {
        p *= Math.PI;
      }

      return {result: p, pderivative: pderivative};
    }
    if(a === 1) {
      let temp1 = a;
      a = b;
      b = temp1;
      let temp2 = x;
      x = y;
      y = temp2;
      invert = !invert;
    }
    if(b === 1) {
      //
      // Special case see:
      //      http://functions.wolfram.com/GammaBetaErf/BetaRegularized/03/01/01/
      //
      if(a === 1) {
        pderivative = 1;
        result = invert ? y : x;
        return {result: result, pderivative: pderivative};
      }

      pderivative = a * Math.pow(x, a - 1);
      let p;
      if(y < 0.5) {
        p = invert ?
          -Expm1.expm1(a*Log1p.log1p(-y)) : Math.exp(a*Log1p.log1p(-y));
      } else {
        p = invert ? -Powm1.powm1(x, a) : Math.pow(x, a);
      }

      if(!normalised){
        p /= a;
      }

      return {result: p, pderivative: pderivative};
    }

    if(Math.min(a, b) <= 1) {
      if(x > 0.5) {
        let temp1 = a;
        a = b;
        b = temp1;
        let temp2 = x;
        x = y;
        y = temp2;
        invert = !invert;
      }
      if(Math.max(a, b) <= 1) {
        // Both a,b < 1:
        if((a >= Math.min(0.2, b)) || (Math.pow(x, a) <= 0.9)) {
          if(!invert) {
            resultObj = Beta.ibeta_series(a, b, x, 0, normalised, y);
            pderivative = resultObj.p_derivative;
            fract = resultObj.result;
          } else {
            fract = -(normalised ? 1 : Beta.beta(a, b));
            invert = false;
            resultObj = Beta.ibeta_series(a, b, x, fract, normalised, y);
            pderivative = resultObj.p_derivative;
            fract = -resultObj.result;
          }
        } else {
          let temp1 = a;
          a = b;
          b = temp1;
          let temp2 = x;
          x = y;
          y = temp2;
          invert = !invert;
          if(y >= 0.3) {
            if(!invert) {
              resultObj = Beta.ibeta_series(a, b, x, 0, normalised, y);
              pderivative = resultObj.p_derivative;
              fract = resultObj.result;
            } else {
              fract = -(normalised ? 1 : Beta.beta(a, b));
              invert = false;
              resultObj = Beta.ibeta_series(a, b, x, fract, normalised, y);
              pderivative = resultObj.p_derivative;
              fract = -resultObj.result;
            }
          } else {
            // Sidestep on a, and then use the series representation:
            let prefix;
            if(!normalised) {
              prefix = Beta.rising_factorial_ratio(a+b, a, 20);
            } else {
              prefix = 1;
            }
            resultObj = Beta.ibeta_a_step(a, b, x, y, 20, normalised);
            pderivative = resultObj.p_derivative;
            fract = resultObj.result;
            if(!invert) {
              fract = Beta.beta_small_b_large_a_series(
                a + 20,
                b,
                x,
                y,
                fract,
                prefix,
                normalised
              );
            } else {
              fract -= (normalised ? 1 : Beta.beta(a, b));
              invert = false;
              fract = -Beta.beta_small_b_large_a_series(
                a + 20,
                b,
                x,
                y,
                fract,
                prefix,
                normalised
              );
            }
          }
        }
      } else {
        // One of a, b < 1 only:
        if((b <= 1) || ((x < 0.1) && (Math.pow(b * x, a) <= 0.7))) {
          if(!invert) {
            resultObj = Beta.ibeta_series(a, b, x, 0, normalised, y);
            pderivative = resultObj.p_derivative;
            fract = resultObj.result;
          } else {
            fract = -(normalised ? 1 : Beta.beta(a, b));
            invert = false;
            resultObj = Beta.ibeta_series(a, b, x, fract, normalised, y);
            pderivative = resultObj.p_derivative;
            fract = -resultObj.result;
          }
        } else {
          let temp1 = a;
          a = b;
          b = temp1;
          let temp2 = x;
          x = y;
          y = temp2;
          invert = !invert;

          if(y >= 0.3) {
            if(!invert) {
              resultObj = Beta.ibeta_series(a, b, x, 0, normalised, y);
              pderivative = resultObj.p_derivative;
              fract = resultObj.result;
            } else {
              fract = -(normalised ? 1 : Beta.beta(a, b));
              invert = false;
              resultObj = Beta.ibeta_series(a, b, x, fract, normalised, y);
              pderivative = resultObj.p_derivative;
              fract = -resultObj.result;
            }
          } else if(a >= 15) {
            if(!invert) {
              fract = Beta.beta_small_b_large_a_series(a, b, x, y, 0, 1, normalised);
            } else {
              fract = -(normalised ? 1 : Beta.beta(a, b));
              invert = false;
              fract = -Beta.beta_small_b_large_a_series(
                a,
                b,
                x,
                y,
                fract,
                1,
                normalised
              );
            }
          } else {
            // Sidestep to improve errors:
            let prefix;
            if(!normalised) {
              prefix = Beta.rising_factorial_ratio(a+b, a, 20);
            } else {
              prefix = 1;
            }
            resultObj = Beta.ibeta_a_step(a, b, x, y, 20, normalised);
            pderivative = resultObj.p_derivative;
            fract = resultObj.result;
            if(!invert) {
              fract = Beta.beta_small_b_large_a_series(
                a + 20,
                b,
                x,
                y,
                fract,
                prefix,
                normalised
              );
            } else {
              fract -= (normalised ? 1 : Beta.beta(a, b));
              invert = false;
              fract = -Beta.beta_small_b_large_a_series(
                a + 20,
                b,
                x,
                y,
                fract,
                prefix,
                normalised
              );
            }
          }
        }
      }
    } else {
      // Both a,b >= 1:
      let lambda;
      if(a < b) {
        lambda = a - (a + b) * x;
      } else {
        lambda = (a + b) * y - b;
      }
      if(lambda < 0) {
        let temp1 = a;
        a = b;
        b = temp1;
        let temp2 = x;
        x = y;
        y = temp2;
        invert = !invert;
      }

      if(b < 40) {
        if((Math.floor(a) == a) &&
           (Math.floor(b) == b) &&
           (a < (Number.MAX_SAFE_INTEGER - 100)) &&
           (y != 1)){
          // relate to the binomial distribution and use a finite sum:
          let k = a - 1;
          let n = b + k;
          fract = Beta.binomial_ccdf(n, k, x, y);
          if(!normalised) {
            fract *= Beta.beta(a, b);
          }

        } else if(b * x <= 0.7) {
          if(!invert) {
            resultObj = Beta.ibeta_series(a, b, x, 0, normalised, y);
            pderivative = resultObj.p_derivative;
            fract = resultObj.result;
          } else {
            fract = -(normalised ? 1 : Beta.beta(a, b));
            invert = false;
            resultObj = Beta.ibeta_series(a, b, x, fract, normalised, y);
            pderivative = resultObj.p_derivative;
            fract = -resultObj.result;
          }
        } else if(a > 15) {
          // sidestep so we can use the series representation:
          let n = Math.trunc(Math.floor(b));
          if(n === b) {
            n--;
          }
          let bbar = b - n;
          let prefix;
          if(!normalised) {
            prefix = Beta.rising_factorial_ratio(a+bbar, bbar, n);
          } else {
            prefix = 1;
          }
          fract = Beta.ibeta_a_step(bbar, a, y, x, n, normalised).result;
          fract = Beta.beta_small_b_large_a_series(
            a,
            bbar,
            x,
            y,
            fract,
            1,
            normalised
          );
          fract /= prefix;
        } else if(normalised) {
          // The formula here for the non-normalised case is tricky to figure
          // out (for me!!), and requires two pochhammer calculations rather
          // than one, so leave it for now and only use this in the normalized case....
          let n = Math.trunc(Math.floor(b));
          let bbar = b - n;
          if(bbar <= 0) {
            n--;
            bbar++;
          }
          fract = Beta.ibeta_a_step(bbar, a, y, x, n, normalised).result;
          fract += Beta.ibeta_a_step(a, bbar, x, y, 20, normalised).result;
          if(invert) {
            // Note this line would need changing if we ever enable this branch in
            // non-normalized case
            fract -= 1;
          }

          fract = Beta.beta_small_b_large_a_series(
            a+20,
            bbar,
            x,
            y,
            fract,
            1,
            normalised
          );
          if(invert) {
            fract = -fract;
            invert = false;
          }
        } else {
          resultObj = Beta.ibeta_fraction2(a, b, x, y, normalised);
          pderivative = resultObj.p_derivative;
          fract =  resultObj.result;
        }
      } else {
        resultObj = Beta.ibeta_fraction2(a, b, x, y, normalised);
        pderivative = resultObj.p_derivative;
        fract = resultObj.result;
      }
    }

    if(pderivative < 0){
      pderivative = Beta.ibeta_power_terms(a, b, x, y, true);
    }
    let div = y * x;

    if(pderivative !== 0) {
      if((Number.MAX_VALUE * div < pderivative)) {
        // overflow, return an arbitarily large value:
        pderivative = Number.MAX_VALUE / 2;
      } else {
        pderivative /= div;
      }
    }

    result = invert ? (normalised ? 1 : Beta.beta(a, b)) - fract : fract;

    return {result: result, pderivative: pderivative};
  }

  public static ibeta_derivative(a: number, b: number, x: number): number {
    //
    // start with the usual error checks:
    //
    if(a <= 0) {
      throw new Error(`Domain error: The argument a to the incomplete beta function${""
      } must be greater than zero (got a=${a}).`);
    }

    if(b <= 0) {
      throw new Error(`Domain error: The argument b to the incomplete beta function${""
      } must be greater than zero (got b=${b}).`);
    }

    if((x < 0) || (x > 1)) {
      throw new Error(`Domain error: Parameter x outside the range [0,1] in the${""
      } incomplete beta function (got x=${x}).`);
    }
    //
    // Now the corner cases:
    //
    if(x === 0) {
      if (a > 1) {
        return 0;
      } else {
        if (a === 1) {
          return 1 / Beta.beta(a, b);
        } else {
          throw new Error(`Overflow error`);
        }
      }
    } else if(x === 1) {
      if (b > 1) {
        return 0;
      } else {
        if (b === 1) {
          return 1 / Beta.beta(a, b);
        } else {
          throw new Error(`Overflow error`);
        }
      }
    }
    //
    // Now the regular cases:
    //
    let y = (1 - x) * x;
    let f1 = Beta.ibeta_power_terms(a, b, x, 1 - x, true, 1 / y);

    return f1;
  }

  /**
   * if x is included give the non-regularized incomplete beta function at a, b, and x,
   * otherwise gives the beta function at a and b.
   */
  public static beta(a: number, b: number, x?: number): number {
    if (typeof x === "undefined") {
      return Beta.beta_imp(a, b);
    } else {
      return Beta.ibeta_imp(a, b, x, false, false).result;
    }
  }

  public static betac(a: number, b: number, x: number): number {
    return Beta.ibeta_imp(a, b, x, true, false).result;
  }

  public static ibeta(a: number, b: number, x: number): number {
    return Beta.ibeta_imp(a, b, x, false, true).result;
  }

  public static ibetac(a: number, b: number, x: number): number {
    return Beta.ibeta_imp(a, b, x, true, true).result;
  }

}

