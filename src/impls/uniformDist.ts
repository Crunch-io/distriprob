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

const Random = require("./random").Random;
const check = require("./errorHandling").check;

import {IRandomState, IRandomIterableIterator} from "./random";


export class UniformDist {

  private static checkParameters(functionName: string,
                                 lowerSupportBound,
                                 upperSupportBound,
                                 x?,
                                 lowerTail?,
                                 p?,
                                 n?,
                                 seed?):
  {lowerTail?: boolean} {
    const params: {lowerTail?: boolean} = {
      lowerTail: undefined
    };

    check(
      lowerSupportBound,
      "lower support bound",
      `uniform distribution ${functionName}`,
      "real"
    );
    check(
      upperSupportBound,
      "upper support bound",
      `uniform distribution ${functionName}`,
      "real"
    );

    if (typeof x !== "undefined") {
      check(x, "x", `uniform distribution ${functionName}`, "real");
    }

    if (typeof lowerTail !== "undefined" && lowerTail !== null) {
      check(lowerTail, "lowerTail", `uniform distribution ${functionName}`, "boolean");
      params.lowerTail = lowerTail;
    } else {
      params.lowerTail = true;
    }

    if (typeof p !== "undefined") {
      check(p, "p", `uniform distribution ${functionName}`, "probability");
    }

    if (typeof n !== "undefined") {
      check(n, "n", `uniform distribution ${functionName}`, "nonnegative_integer");
    }

    if (typeof seed !== "undefined" && seed !== null) {
      check(seed, "seed", `uniform distribution ${functionName}`, "seed");
    }

    return params;
  }

  public static pdf(x: number, lowerSupportBound: number, upperSupportBound: number):
  number {
    const params = UniformDist.checkParameters(
      "pdf",
      lowerSupportBound,
      upperSupportBound,
      x
    );

    if (x < lowerSupportBound || x > upperSupportBound) {
      return 0;
    } else {
      return 1 / (upperSupportBound - lowerSupportBound);
    }
  }

  public static cdf(x: number,
                    lowerSupportBound: number,
                    upperSupportBound: number,
                    lowerTail?: boolean):
  number {
    const params = UniformDist.checkParameters(
      "cdf",
      lowerSupportBound,
      upperSupportBound,
      x,
      lowerTail
    );

    if (lowerSupportBound >= upperSupportBound) {
      return 0;
    }

    if (x < lowerSupportBound) {
      if (params.lowerTail) {
        return 0;
      } else {
        return 1;
      }
    } else if (x > upperSupportBound) {
      if (params.lowerTail) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (params.lowerTail) {
        return (x - lowerSupportBound) / (upperSupportBound - lowerSupportBound);
      } else {
        return (upperSupportBound - x) / (upperSupportBound - lowerSupportBound);
      }
    }
  }

  public static quantile(p: number,
                         lowerSupportBound: number,
                         upperSupportBound: number,
                         lowerTail?: boolean): number {
    const params = UniformDist.checkParameters(
      "quantile",
      lowerSupportBound,
      upperSupportBound,
      undefined,
      lowerTail,
      p
    );

    if (lowerSupportBound >= upperSupportBound) {
      throw new Error(`Domain error: lower support bound must be less than upper${""
      } support bound, got lsb = ${lowerSupportBound}, usb = ${upperSupportBound}`);
    }

    if (p === 0) {
      if (params.lowerTail) {
        return lowerSupportBound;
      } else {
        return upperSupportBound;
      }
    } else if (p === 1) {
      if (params.lowerTail) {
        return upperSupportBound;
      } else {
        return lowerSupportBound;
      }
    } else {
      if (params.lowerTail) {
        return (p * (upperSupportBound - lowerSupportBound)) + lowerSupportBound;
      } else {
        return upperSupportBound - (p * (upperSupportBound - lowerSupportBound));
      }
    }
  }

  public static random(n: number,
                       lowerSupportBound: number,
                       upperSupportBound: number,
                       seed?: number | string | IRandomState):
  number[] {
    const params = UniformDist.checkParameters(
      "random",
      lowerSupportBound,
      upperSupportBound,
      undefined,
      undefined,
      undefined,
      n,
      seed
    );

    return Random.numbers(
      n,
      UniformDist.quantile,
      [lowerSupportBound, upperSupportBound],
      seed
    );
  }

  public static randomIterator(n: number,
                               lowerSupportBound: number,
                               upperSupportBound: number,
                               seed?: number | string | IRandomState):
  IRandomIterableIterator {
    if (typeof n === "undefined" || n === null) {
      n = Number.POSITIVE_INFINITY;
    }

    const params = UniformDist.checkParameters(
      "random",
      lowerSupportBound,
      upperSupportBound,
      undefined,
      undefined,
      undefined,
      n,
      seed
    );

    return Random.numberIterator(
      n,
      UniformDist.quantile,
      [lowerSupportBound, upperSupportBound],
      seed
    );
  }
} // end of class UniformDist

// console.log("pdf:", UniformDist.pdf(0.323, 0.000038482, 1.9383));
// console.log("cdf:", UniformDist.cdf(0.323, 0.000038482, 1.9383, true));
// console.log("quantile:", UniformDist.quantile(0.323, 0.000038482, 1.9383, false));
// console.log("random:", UniformDist.random(20, 0.000038482, 1.9383, "seed"));
//
// const it = UniformDist.randomIterator(20, 0.000038482, 1.9383, "seed");
//
// for (let r of it) {
//   console.log(r);
// }