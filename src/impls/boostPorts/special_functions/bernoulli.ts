"use strict";

/**
 * (C) Copyright Zachary Martin 2016.
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

const UncheckedBernoulli = require("./detail/unchecked_bernoulli").UncheckedBernoulli;


export class Bernoulli {

  private static *bernoulli_b2n_gen(startIndex: number, numBernoullis: number):
  IterableIterator<number> {
    if (startIndex + numBernoullis - 1 > UncheckedBernoulli.max_bernoulli_b2n()) {
      throw new Error(`Overflow error: the sum of "startIndex" and "numBernoullis"${""
      } less one cannot exceed ${UncheckedBernoulli.max_bernoulli_b2n()}.`);
    }

    for (let i = startIndex; i < startIndex + numBernoullis; i++) {
      yield UncheckedBernoulli.unchecked_bernoulli_b2n(i);
    }
    return;
  }

  // overload - number return case
  public static bernoulli_b2n(n: number): number;

  // overload - iterable return case 1
  public static bernoulli_b2n(startIndex: number, numBernoullis: number):
  IterableIterator<number>;

  // overload - iterable return case 2
  public static bernoulli_b2n(): IterableIterator<number>;

  // implementation of all overloads
  public static bernoulli_b2n(arg1?: number, arg2?: number):
  number | IterableIterator<number> {
    if (typeof arg1 === "undefined" && typeof arg2 === "undefined") {
      // iterable return case 1
      return Bernoulli.bernoulli_b2n_gen(
        0,
        UncheckedBernoulli.max_bernoulli_b2n() + 1
      );
    } else if (typeof arg1 === "number" && typeof arg2 === "number") {
      // iterable return case 2
      return Bernoulli.bernoulli_b2n_gen(arg1, arg2);
    } else if (typeof arg1 === "number") {
      // number return case
      return UncheckedBernoulli.unchecked_bernoulli_b2n(arg1);
    } else {
      throw new Error(`Incorrect arguments error`);
    }
  }

  private static bernoulli_val(n: number, type: "first" | "second" = "first"): number {
    if (n % 2 === 0) {
      if (n / 2 > UncheckedBernoulli.max_bernoulli_b2n()) {
        throw new Error(`Overflow error: cannot return even bernoulli number for index${""
        } greater than ${UncheckedBernoulli.max_bernoulli_b2n()*2}, given n = ${n}`);
      }

      return UncheckedBernoulli.unchecked_bernoulli_b2n(n / 2);
    } else if (n === 1) {
      return type === "first" ? -0.5 : 0.5;
    } else {
      return 0;
    }
  }

  private static *bernoulli_gen(startIndex: number,
                                numBernoullis: number,
                                type: "first" | "second" = "first"):
  IterableIterator<number> {
    if (startIndex + numBernoullis > UncheckedBernoulli.max_bernoulli_b2n() * 2 + 2)
    {
      throw new Error(`Overflow error: the sum of "startIndex" and "numBernoullis"${""
        } less one cannot exceed ${
      UncheckedBernoulli.max_bernoulli_b2n() * 2 + 2}.`);
    }

    for (let i = startIndex; i < startIndex + numBernoullis; i++) {
      yield Bernoulli.bernoulli_val(i, type);
    }
    return;
  }

  // overload - number return case
  public static bernoulli(n: number, type?: "first" | "second"): number;

  // overload - iterable return case 1
  public static bernoulli(type?: "first" | "second"): IterableIterator<number>;

  // overload - iterable return case 2
  public static bernoulli(startIndex: number,
                          numBernoullis: number,
                          type?: "first" | "second"): IterableIterator<number>;

  // implementation of overload
  public static bernoulli(arg1?: number | "first" | "second",
                          arg2?: number | "first" | "second",
                          arg3?: "first" | "second"): number | IterableIterator<number> {
    if ((arg1 === "first" || arg1 === "second" || typeof arg1 === "undefined") &&
        typeof arg2 === "undefined" &&
        typeof arg3 === "undefined") {
      // iterable return case 1

      if (!arg1) {
        arg1 = "first";
      }

      return Bernoulli.bernoulli_gen(
        0,
        UncheckedBernoulli.max_bernoulli_b2n() * 2 + 2,
        <"first" | "second">arg1
      );

    } else if (typeof arg1 === "number" && typeof arg2 === "number" &&
      (typeof arg3 === "undefined" || arg3 === "first" || arg3 === "second")) {
      // iterable return case 2

      if (!arg3) {
        arg3 = "first";
      }
      return Bernoulli.bernoulli_gen(arg1, arg2, arg3);
    } else if (typeof arg1 === "number" &&
              (typeof arg2 === "undefined" || arg2 === "first" || arg2 === "second") &&
               typeof arg3 === "undefined") {
      if (!arg2) {
        arg2 = "first";
      }

      return Bernoulli.bernoulli_val(arg1, <"first" | "second">arg2);
    } else {
      throw new Error(`Incorrect arguments error`);
    }
  }

  public static max_tangent(): number {return 93;}

  private static tangent_val(n: number): number {
    const twoTo2n = Math.pow(2, 2*n);
    const b2n = Bernoulli.bernoulli_b2n(n);
    return (twoTo2n * (twoTo2n - 1) * Math.abs(b2n)) / (2 * n);
  }

  private static *tangent_gen(startIndex: number, numTangents: number):
  IterableIterator<number> {
    if (startIndex + numTangents > Bernoulli.max_tangent() + 1) {
      throw new Error(`Overflow error: the sum of "startIndex" and "numTangents"${""
        } less one cannot exceed ${Bernoulli.max_tangent() + 1}.`);
    }

    for (let i = startIndex; i < startIndex + numTangents; i++) {
      yield Bernoulli.tangent_val(i);
    }
    return;
  }

  // overload - number return case
  public static tangent(n: number): number;

  // overload - iterable return case 1
  public static tangent(): IterableIterator<number>;

  // overload - iterable return case 2
  public static tangent(startIndex: number,
                          numBernoullis: number): IterableIterator<number>;



  public static tangent(arg1?: number,
                        arg2?: number):
  number | IterableIterator<number> {
    if (typeof arg1 === "undefined" && typeof arg2 === "undefined") {
      // iterable return case 1
      return Bernoulli.tangent_gen(
        1,
        Bernoulli.max_tangent()
      );

    } else if (typeof arg1 === "number" && typeof arg2 === "number") {
      // iterable return case 2
      return Bernoulli.tangent_gen(arg1, arg2);
    } else if (typeof arg1 === "number" && typeof arg2 === "undefined") {
      return Bernoulli.tangent_val(arg1);
    } else {
      throw new Error(`Incorrect arguments error`);
    }
  }

}