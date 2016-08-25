"use strict";
import {continuedFractionSolver} from "./continuedFractionSolver";
import * as gamma from "./gamma";
import * as rf from "./rootFind";
import {asyncGen} from "./async";
import {rand, randSync} from "./random";

// This import and then renaming of imports is necessary to allow the async module to
// correctly generate web worker scripts.
const lowerIncompleteGamma = gamma.lowerIncompleteGamma;
const upperIncompleteGamma = gamma.upperIncompleteGamma;
const lnGamma = gamma.lnGamma;
const rootFind = rf.rootFind;


export function pdfSync(x, degreesOfFreedom) {
  if (x <= 0) {
    return 0
  } else {
    let k = degreesOfFreedom;
    let lnNumerator = ((k/2) - 1) * Math.log(x) - (x/2);
    let lnDenominator = ((k/2) * Math.log(2)) + lnGamma(k/2);

    return Math.exp(lnNumerator - lnDenominator);
  }
}

export function pdf(x, degreesOfFreedom) {
  return asyncGen([lnGamma, pdfSync], pdfSync, [x, degreesOfFreedom]);
}

export function cdfSync(x, degreesOfFreedom, lowerTail = true) {
  if (x <= 0) {
    if (lowerTail) {
      return 0;
    } else {
      return 1;
    }
  } else {
    if (lowerTail) {
      return lowerIncompleteGamma(x/2, degreesOfFreedom/2);
    } else {
      return upperIncompleteGamma(x/2, degreesOfFreedom/2);
    }
  }
}

export function cdf(x, degreesOfFreedom, lowerTail = true) {
  return asyncGen([
    continuedFractionSolver,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lnLowerIncompleteGamma,
    gamma.lowerIncompleteGamma
  ], cdfSync, [x, degreesOfFreedom, lowerTail]);
}

export function quantileSync(p, degreesOfFreedom, lowerTail = true) {
  function f(val) {
    return cdfSync(val, degreesOfFreedom);
  }

  function fPrime(val) {
    return pdfSync(val, degreesOfFreedom);
  }

  if (p === 0) {
    if (lowerTail) {
      return 0;
    } else {
      return Number.POSITIVE_INFINITY;
    }
  } else if (p === 1) {
    if (lowerTail) {
      return Number.POSITIVE_INFINITY;
    } else {
      return 0;
    }
  } else {
    return rootFind(f, fPrime, p, 1, null, 0);
  }
}

export function quantile(p, degreesOfFreedom, lowerTail = true) {
  return asyncGen([
    rf.newton,
    rf.bisection,
    rootFind,
    continuedFractionSolver,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lnLowerIncompleteGamma,
    gamma.lowerIncompleteGamma,
    pdfSync,
    cdfSync
  ], quantileSync, [p, degreesOfFreedom, lowerTail]);
}

export function randomSync(n, degreesOfFreedom, seed?: number | string, randoms?) {
  return randSync(n, quantileSync, [degreesOfFreedom], seed, randoms);
}

export function random(n, degreesOfFreedom, seed?: number | string) {
  return rand(n, quantileSync, [degreesOfFreedom], seed, [
    rf.newton,
    rf.bisection,
    rootFind,
    continuedFractionSolver,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lnLowerIncompleteGamma,
    gamma.lowerIncompleteGamma,
    pdfSync,
    cdfSync
  ]);
}