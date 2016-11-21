"use strict";

/**
 * (C) Copyright John Maddock 2012.
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

const Bessel = require("./bessel").Bessel;
const Precision = require("../tools/precision").Precision;
const Gamma = require("./gamma").Gamma;
const Constants = require("../tools/constants").Constants;
const Roots = require("../tools/roots").Roots;
const AiryAiBiZero = require("./detail/airy_ai_bi_zero").AiryAiBiZero;

export class Airy {

  private static function_object_ai_and_ai_prime(x: number): {f0: number, f1: number} {
    return {
      f0: Airy.airy_ai(x),
      f1: Airy.airy_ai_prime(x)
    }
  }

  private static function_object_bi_and_bi_prime(x: number): {f0: number, f1: number} {
    return {
      f0: Airy.airy_bi(x),
      f1: Airy.airy_bi_prime(x)
    }
  }

  private static airy_ai_imp(x: number): number {
    if(x < 0) {
      const p = (-x * Math.sqrt(-x) * 2) / 3;
      const v = 1 / 3;
      const j1 = Bessel.cyl_bessel_j(v, p);
      const j2 = Bessel.cyl_bessel_j(-v, p);
      const ai = Math.sqrt(-x) * (j1 + j2) / 3;
      //T bi = sqrt(-x / 3) * (j2 - j1);
      return ai;
    } else if(Math.abs(x * x * x) / 6 < Precision.epsilon()){
      const tg = Gamma.tgamma(2/3);
      const ai = 1 / (Math.pow(3, 2/3) * tg);
      //T bi = 1 / (sqrt(boost::math::cbrt(T(3))) * tg);
      return ai;
    } else {
      const p = 2 * x * Math.sqrt(x) / 3;
      const v = 1 / 3;
      //T j1 = boost::math::cyl_bessel_i(-v, p, pol);
      //T j2 = boost::math::cyl_bessel_i(v, p, pol);
      //
      // Note that although we can calculate ai from j1 and j2, the accuracy is horrible
      // as we're subtracting two very large values, so use the Bessel K relation instead:
      //
      const ai = Bessel.cyl_bessel_k(v, p) * Math.sqrt(x / 3) / Math.PI;
      //T bi = sqrt(x / 3) * (j1 + j2);
      return ai;
    }
  }

  private static airy_bi_imp(x: number): number {
    if(x < 0) {
      const p = (-x * Math.sqrt(-x) * 2) / 3;
      const v = 1 / 3;
      const j1 = Bessel.cyl_bessel_j(v, p);
      const j2 = Bessel.cyl_bessel_j(-v, p);
      //T ai = sqrt(-x) * (j1 + j2) / 3;
      const bi = Math.sqrt(-x / 3) * (j2 - j1);
      return bi;
    } else if(Math.abs(x * x * x) / 6 < Precision.epsilon()) {
      const tg = Gamma.tgamma(2/3);
      //T ai = 1 / (pow(T(3), constants::twothirds<T>()) * tg);
      const bi = 1 / (Math.sqrt(Math.cbrt(3)) * tg);
      return bi;
    } else {
      const p = 2 * x * Math.sqrt(x) / 3;
      const v = 1 / 3;
      const j1 = Bessel.cyl_bessel_i(-v, p);
      const j2 = Bessel.cyl_bessel_i(v, p);
      const bi = Math.sqrt(x / 3) * (j1 + j2);
      return bi;
    }
  }

  private static airy_ai_prime_imp(x: number): number {
    if(x < 0) {
      const p = (-x * Math.sqrt(-x) * 2) / 3;
      const v = 2 / 3;
      const j1 = Bessel.cyl_bessel_j(v, p);
      const j2 = Bessel.cyl_bessel_j(-v, p);
      const aip = -x * (j1 - j2) / 3;
      return aip;
    }
    else if(Math.abs(x * x) / 2 < Precision.epsilon()) {
      const tg = Gamma.tgamma(1/3);
      const aip = 1 / (Math.cbrt(3) * tg);
      return -aip;
    } else {
      const p = 2 * x * Math.sqrt(x) / 3;
      const v = 2 / 3;
      //T j1 = boost::math::cyl_bessel_i(-v, p, pol);
      //T j2 = boost::math::cyl_bessel_i(v, p, pol);
      //
      // Note that although we can calculate ai from j1 and j2, the accuracy is horrible
      // as we're subtracting two very large values, so use the Bessel K relation instead:
      //
      const aip = -Bessel.cyl_bessel_k(v, p) * x / (Constants.SQRT3()*Math.PI);
      return aip;
    }
  }

  private static airy_bi_prime_imp(x: number): number {
    if(x < 0) {
      const p = (-x * Math.sqrt(-x) * 2) / 3;
      const v = 2 / 3;
      const j1 = Bessel.cyl_bessel_j(v, p);
      const j2 = Bessel.cyl_bessel_j(-v, p);
      const aip = -x * (j1 + j2) / Constants.SQRT3();
      return aip;
    } else if(Math.abs(x * x) / 2 < Precision.epsilon()) {
      const tg = Gamma.tgamma(1/3);
      const bip = Math.sqrt(Math.cbrt(3)) / tg;
      return bip;
    } else {
      const p = 2 * x * Math.sqrt(x) / 3;
      const v = 2 / 3;
      const j1 = Bessel.cyl_bessel_i(-v, p);
      const j2 = Bessel.cyl_bessel_i(v, p);
      const aip = x * (j1 + j2) / Constants.SQRT3();
      return aip;
    }
  }

  private static airy_ai_zero_imp(m: number): number {
    // Handle cases when a negative zero (negative rank) is requested.
    if(m < 0) {
      throw new Error(`Domain error: Requested the ${m}'th zero, but the rank must be${""
      } 1 or more !`);
    }

    // Handle case when the zero'th zero is requested.
    if(m === 0) {
      throw new Error(`Domain error: The requested rank of the zero is ${m}, but must${""
      } be 1 or more !`);
    }

    // Set up the initial guess for the upcoming root-finding.
    const guess_root = AiryAiBiZero.initial_guess_ai(m);

    // Select the maximum allowed iterations based on the number
    // of decimal digits in the numeric type T, being at least 12.
    const my_digits10 = Math.round(53 * 0.301);

    const iterations_allowed = Math.max(12, my_digits10 * 2);

    let iterations_used = iterations_allowed;

    // Use a dynamic tolerance because the roots get closer the higher m gets.
    let tolerance;

    if     (m <=   10) { tolerance = 0.3; }
    else if(m <=  100) { tolerance = 0.1; }
    else if(m <= 1000) { tolerance = 0.05; }
    else               { tolerance = 1 / Math.sqrt(m); }

    // Perform the root-finding using Newton-Raphson iteration from Boost.Math.
    const am = Roots.newton_raphson_iterate(
      Airy.function_object_ai_and_ai_prime,
      guess_root,
      guess_root - tolerance,
      guess_root + tolerance,
      53,
      iterations_used
    );

    return am.result;
  }

  private static *airy_ai_zero_gen(startIndex?: number, numZeros?: number):
  IterableIterator<number> {
    let m = typeof startIndex === "number" ? startIndex : 1;
    let end = typeof numZeros === "number" ? m + numZeros : Number.POSITIVE_INFINITY;
    while (m < end) {
      yield Airy.airy_ai_zero_imp(m);
      m++;
    }
  }

  private static airy_bi_zero_imp(m: number): number {
    // Handle cases when a negative zero (negative rank) is requested.
    if(m < 0) {
      throw new Error(`Domain error: Requested the ${m}'th zero, but the rank must be${""
        } 1 or more !`);
    }

    // Handle case when the zero'th zero is requested.
    if(m === 0){
      throw new Error(`Domain error: The requested rank of the zero is ${m}, but must${""
        } be 1 or more !`);
    }
    // Set up the initial guess for the upcoming root-finding.
    const guess_root = AiryAiBiZero.initial_guess_bi(m);

    // Select the maximum allowed iterations based on the number
    // of decimal digits in the numeric type T, being at least 12.
    const my_digits10 = Math.round(53 * 0.301);

    const iterations_allowed = Math.max(12, my_digits10 * 2);

    let iterations_used = iterations_allowed;

    // Use a dynamic tolerance because the roots get closer the higher m gets.
    let tolerance;

    if     (m <=   10) { tolerance = 0.3; }
    else if(m <=  100) { tolerance = 0.1; }
    else if(m <= 1000) { tolerance = 0.05; }
    else               { tolerance = 1 / Math.sqrt(m); }

    // Perform the root-finding using Newton-Raphson iteration from Boost.Math.
    const bm = Roots.newton_raphson_iterate(
      Airy.function_object_bi_and_bi_prime,
      guess_root,
      guess_root - tolerance,
      guess_root + tolerance,
      53,
      iterations_used
    );

    return bm.result;
  }

  private static *airy_bi_zero_gen(startIndex?: number, numZeros?: number):
  IterableIterator<number> {
    let m = typeof startIndex === "number" ? startIndex : 1;
    let end = typeof numZeros === "number" ? m + numZeros : Number.POSITIVE_INFINITY;
    while (m < end) {
      yield Airy.airy_bi_zero_imp(m);
      m++;
    }
  }

  public static airy_ai(x: number): number {
    return Airy.airy_ai_imp(x);
  }

  public static airy_bi(x: number): number {
    return Airy.airy_bi_imp(x);
  }

  public static airy_ai_prime(x: number): number {
    return Airy.airy_ai_prime_imp(x);
  }

  public static airy_bi_prime(x: number): number {
    return Airy.airy_bi_prime_imp(x);
  }

  public static airy_ai_zero(m: number): number {
    return Airy.airy_ai_zero_imp(m);
  }

  public static airy_ai_zeros_iter(startIndex?: number, numZeros?: number):
  IterableIterator<number> {
    if (typeof startIndex === "number") {
      if (startIndex !== Math.trunc(startIndex)) {
        throw new Error(`Domain error: got startIndex = ${startIndex}, start index${""
          } must be a positive integer.`);
      }
    }

    if (typeof numZeros === "number") {
      if (numZeros !== Math.trunc(numZeros)) {
        throw new Error(`Domain error: got numZeros = ${numZeros}, number of zeros${""
          } must be a positive integer.`);
      }
    }

    return Airy.airy_ai_zero_gen(startIndex, numZeros);
  }

  public static airy_bi_zero(m: number): number {
    return Airy.airy_bi_zero_imp(m);
  }

  public static airy_bi_zeros_iter(startIndex?: number, numZeros?: number):
  IterableIterator<number> {
    if (typeof startIndex === "number") {
      if (startIndex !== Math.trunc(startIndex)) {
        throw new Error(`Domain error: got startIndex = ${startIndex}, start index${""
          } must be a positive integer.`);
      }
    }

    if (typeof numZeros === "number") {
      if (numZeros !== Math.trunc(numZeros)) {
        throw new Error(`Domain error: got numZeros = ${numZeros}, number of zeros${""
          } must be a positive integer.`);
      }
    }

    return Airy.airy_bi_zero_gen(startIndex, numZeros);
  }

}