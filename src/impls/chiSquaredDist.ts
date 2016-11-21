"use strict";

/**
 * (C) Copyright John Maddock 2006-2008.
 * (C) Copyright Paul A. Bristow 2008, 2010.
 * (C) Copyright Zachary Martin 2016 (port to JavaScript).
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
// const Gamma = require("./boostPorts/special_functions/gamma").Gamma;
// const IGammaInverse =
//   require("./boostPorts/special_functions/detail/igamma_inverse").IGammaInverse;
const NonCentralChiSquared =
  require("./boostPorts/distributions/non_central_chi_squared").NonCentralChiSquared;
const check = require("./errorHandling").check;

import {IRandomState, IRandomIterableIterator} from "./random";

export class ChiSquaredDist {

  private static checkParameters(functionName: string,
                                 degreesOfFreedom,
                                 ncp,
                                 x?,
                                 lowerTail?,
                                 p?,
                                 n?,
                                 seed?):
  {ncp: number, lowerTail?: boolean} {
    const params: {ncp: number, lowerTail?: boolean} = {
      ncp: NaN,
      lowerTail: undefined
    };

    check(
      degreesOfFreedom,
      "degrees of freedom",
      `chi squared distribution ${functionName}`,
      "positive_real"
    );

    if (typeof ncp !== "undefined" && ncp !== null) {
      check(ncp, "ncp", `chi squared distribution ${functionName}`, "nonnegative_real");
      params.ncp = ncp;
    } else {
      params.ncp = 0;
    }

    if (typeof x !== "undefined") {
      check(x, "x", `chi squared distribution ${functionName}`, "real");
    }

    if (typeof lowerTail !== "undefined" && lowerTail !== null) {
      check(
        lowerTail,
        "lowerTail",
        `chi squared distribution ${functionName}`,
        "boolean"
      );
      params.lowerTail = lowerTail;
    } else {
      params.lowerTail = true;
    }

    if (typeof p !== "undefined") {
      check(p, "p", `chi squared distribution ${functionName}`, "probability");
    }

    if (typeof n !== "undefined") {
      check(n, "n", `chi squared distribution ${functionName}`, "nonnegative_integer");
    }

    if (typeof seed !== "undefined" && seed !== null) {
      check(seed, "seed", `chi squared distribution ${functionName}`, "seed");
    }

    return params;
  }

  public static pdf(x: number, degreesOfFreedom: number, ncp?: number): number {
    // first error checking
    const params = ChiSquaredDist.checkParameters("pdf", degreesOfFreedom, ncp, x);

    if (x < 0) {
      return 0
    } else if (x === 0) {
      if (degreesOfFreedom < 2) {
        throw new Error(`Overflow error`);
      } else if (degreesOfFreedom === 2) {
        return 0.5 * Math.exp(-params.ncp/2);
      } else {
        return 0;
      }
    } else {
      return NonCentralChiSquared.nccs_pdf(degreesOfFreedom, params.ncp, x);
    }
  }

  public static cdf(x: number,
                    degreesOfFreedom: number,
                    lowerTail?: boolean,
                    ncp?: number):
  number {
    // first error checking
    const params = ChiSquaredDist.checkParameters(
      "cdf",
      degreesOfFreedom,
      ncp,
      x,
      lowerTail
    );

    if (x <= 0) {
      if (params.lowerTail) {
        return 0;
      } else {
        return 1;
      }
    } else {
      return NonCentralChiSquared.non_central_chi_squared_cdf(
        x,
        degreesOfFreedom,
        params.ncp,
        !params.lowerTail
      );
    }
  }

  public static quantile(p:number,
                         degreesOfFreedom: number,
                         lowerTail?: boolean,
                         ncp?: number):
  number {
    // first error checking
    const params = ChiSquaredDist.checkParameters(
      "quantile",
      degreesOfFreedom,
      ncp,
      undefined,
      lowerTail,
      p
    );

    return NonCentralChiSquared.nccs_quantile(
      degreesOfFreedom,
      params.ncp,
      p,
      !params.lowerTail
    );
  }

  public static random(n: number,
                       degreesOfFreedom: number,
                       ncp?: number,
                       seed?: number | string):
  number[] {
    // first error checking
    const params = ChiSquaredDist.checkParameters(
      "random",
      degreesOfFreedom,
      ncp,
      undefined,
      undefined,
      undefined,
      n,
      seed
    );

    return Random.numbers(
      n,
      ChiSquaredDist.quantile,
      [degreesOfFreedom, true, params.ncp],
      seed
    );
  }

  public static randomIterator(n: number,
                               degreesOfFreedom: number,
                               ncp?: number,
                               seed?: number | string | IRandomState):
  IRandomIterableIterator {
    if (typeof n === "undefined" || n === null) {
      n = Number.POSITIVE_INFINITY;
    }

    // first error checking
    const params = ChiSquaredDist.checkParameters(
      "randomIterator",
      degreesOfFreedom,
      ncp,
      undefined,
      undefined,
      undefined,
      n,
      seed
    );

    return Random.numberIterator(
      n,
      ChiSquaredDist.quantile,
      [degreesOfFreedom, true, params.ncp],
      seed
    );
  }

} // end of class ChiSquaredDist

// console.log("chi squared pdf:", ChiSquaredDist.pdf(0.258, 5, 1));
// console.log("chi squared cdf:",ChiSquaredDist.cdf(0.258, 5, true, 1));
// console.log("chi squared quantile:",ChiSquaredDist.quantile(0.258, 5, true, 1));
// console.log("chi squared cdf:",ChiSquaredDist.random(20, 5, 9, "seed"));