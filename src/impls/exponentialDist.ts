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

const Expm1 = require("./boostPorts/special_functions/expm1").Expm1;
const Log1p = require("./boostPorts/special_functions/log1p").Log1p;
const Random = require("./random").Random;
const check = require("./errorHandling").check;

import {IRandomIterableIterator, IRandomState} from "./random";


export class ExponentialDist {

  private static checkParameters(functionName: string,
                                 lambda,
                                 x?,
                                 lowerTail?,
                                 p?,
                                 n?,
                                 seed?):
  {lowerTail?: boolean} {
    const params: {lowerTail?: boolean} = {
      lowerTail: undefined
    };

    check(lambda, "lambda", `exponential distribution ${functionName}`, "positive_real");

    if (typeof x !== "undefined") {
      check(x, "x", `exponential distribution ${functionName}`, "real");
    }

    if (typeof lowerTail !== "undefined" && lowerTail !== null) {
      check(
        lowerTail,
        "lowerTail",
        `exponential distribution ${functionName}`,
        "boolean"
      );
      params.lowerTail = lowerTail;
    } else {
      params.lowerTail = true;
    }

    if (typeof p !== "undefined") {
      check(p, "p", `exponential distribution ${functionName}`, "probability");
    }

    if (typeof n !== "undefined") {
      check(n, "n", `exponential distribution ${functionName}`, "nonnegative_integer");
    }

    if (typeof seed !== "undefined" && seed !== null) {
      check(seed, "seed", `exponential distribution ${functionName}`, "seed");
    }

    return params;
  }

  public static pdf(x: number, lambda: number): number {
    const params = ExponentialDist.checkParameters("pdf", lambda, x);

    if (x < 0) {
      return 0;
    } else if (x === 0) {
      return lambda;
    } else {
      return lambda * Math.exp((- lambda) * x);
    }
  }

  public static cdf(x: number, lambda: number, lowerTail?: boolean): number {
    const params = ExponentialDist.checkParameters("pdf", lambda, x, lowerTail);

    if (x <= 0) {
      if (params.lowerTail) {
        return 0;
      } else {
        return 1;
      }
    } else {
      if (params.lowerTail) {
        return -Expm1.expm1(-x * lambda);
      } else {
        return Math.exp((- lambda) * x);
      }
    }
  }

  public static quantile(p: number, lambda: number, lowerTail?: boolean): number {
    const params = ExponentialDist.checkParameters(
      "pdf",
      lambda,
      undefined,
      lowerTail,
      p
    );

    if (p === 0) {
      if (params.lowerTail) {
        return 0;
      } else {
        return Number.POSITIVE_INFINITY;
      }
    } else if (p === 1) {
      if (params.lowerTail) {
        return Number.POSITIVE_INFINITY;
      } else {
        return 0;
      }
    } else {
      if (params.lowerTail) {
        return -Log1p.log1p(-p)/lambda;
      } else {
        return -Math.log(p)/lambda;
      }
    }
  }

  public static random(n: number,
                       lambda: number,
                       seed?: number | string | IRandomState):
  number[] {
    const params = ExponentialDist.checkParameters(
      "pdf",
      lambda,
      undefined,
      undefined,
      undefined,
      n,
      seed
    );

    return Random.numbers(n, ExponentialDist.quantile, [lambda], seed);
  }

  public static randomIterator(n: number,
                               lambda: number,
                               seed?: number | string | IRandomState):
  IRandomIterableIterator {
    if (typeof n === "undefined" || n === null) {
      n = Number.POSITIVE_INFINITY;
    }

    const params = ExponentialDist.checkParameters(
      "pdf",
      lambda,
      undefined,
      undefined,
      undefined,
      n,
      seed
    );

    return Random.numberIterator(n, ExponentialDist.quantile, [lambda], seed);
  }

}

// console.log("pdf:",ExponentialDist.pdf(1.482, Math.PI));
// console.log("cdf:",ExponentialDist.cdf(1.482, Math.PI));
// console.log("quantile:",ExponentialDist.quantile(.0438, Math.PI, true));
// console.log("random:",ExponentialDist.random(20, Math.PI, "HI"));
//
// const it = ExponentialDist.randomIterator(20, Math.PI, "HI");
//
// for (let r of it) {
//   console.log(r);
// }