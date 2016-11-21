"use strict";

/**
 * (C) Copyright John Maddock 2005-2006.
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

export class Fraction {

  /**
   * continued_fraction with type = "A"
   * Evaluates:
   *
   *            a1
   *      ---------------
   *      b1 +     a2
   *           ----------
   *           b2 +   a3
   *                -----
   *                b3 + ...
   *
   *
   *
   * continued_fraction with type = "B"
   * Evaluates:
   *
   * b0 +       a1
   *      ---------------
   *      b1 +     a2
   *           ----------
   *           b2 +   a3
   *                -----
   *                b3 + ...
   *
   * Note that the first a0 returned by generator g is disarded.
   */
  public static continued_fraction(type: "A" | "B",
                                     g: Iterator<{a: number, b: number}>,
                                     factor: number,
                                     max_terms: number):
  {value: number, terms_evaluated: number} {

    let tiny = Number.MIN_VALUE;
    let v = g.next();

    let f, C, D, delta, a0;
    f = v.value.b;
    a0 = v.value.a;
    if(f === 0){
      f = tiny;
    }

    C = f;
    D = 0;

    let counter = max_terms;

    do{
      v = g.next();
      D = v.value.b + v.value.a * D;
      if(D === 0){
        D = tiny;
      }
      C = v.value.b + v.value.a / C;
      if(C === 0){
        C = tiny;
      }
      D = 1/D;
      delta = C*D;
      f = f * delta;
    }while((Math.abs(delta - 1) > factor) && --counter);

    let result = type === "A" ? a0/f : f;

    return {value: result, terms_evaluated: max_terms - counter};
  }
}
