"use strict";
import {continuedFractionSolver} from "./continuedFractionSolver";
import * as gamma from "./gamma";
import * as rf from "./rootFind";
import {asyncGen} from "./async";

// This import and then renaming of imports is necessary to allow the async module to
// correctly generate web worker scripts.
const lowerIncompleteGamma = gamma.lowerIncompleteGamma;
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
  function script(a,b) {
    return pdfSync(a, b)
  }
  return asyncGen([lnGamma, pdfSync], script, [x, degreesOfFreedom]);
}

export function cdfSync(x, degreesOfFreedom) {
  if (x <= 0) {
    return 0;
  } else {
    return lowerIncompleteGamma(x/2, degreesOfFreedom/2);
  }
}

export function cdf(x, degreesOfFreedom) {
  function script(a, b) {
    return cdfSync(a, b);
  }

  return asyncGen([
    continuedFractionSolver,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lnLowerIncompleteGamma,
    gamma.lowerIncompleteGamma,
    cdfSync
  ], script, [x, degreesOfFreedom]);
}

export function quantileSync(p, degreesOfFreedom) {
  function f(val) {
    return cdfSync(val, degreesOfFreedom);
  }

  function fPrime(val) {
    return pdfSync(val, degreesOfFreedom);
  }

  return rootFind(f, fPrime, p, 1, null, 0);
}

export function quantile(p, degreesOfFreedom) {
  function script(a, b) {
    return quantileSync(a, b);
  }

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
    cdfSync,
    quantileSync
  ], script, [p, degreesOfFreedom]);
}