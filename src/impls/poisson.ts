"use strict";
import * as gamma from "./gamma";
import * as rf from "./rootFind";
import * as cfs from "./continuedFractionSolver";
import {asyncGen} from "./async";

// This import and then renaming of imports is necessary to allow the async module to
// correctly generate web worker scripts.
const continuedFractionSolver = cfs.continuedFractionSolver;
const lnGamma = gamma.lnGamma;
const lnFactorial = gamma.lnFactorial;
const lowerIncompleteGamma = gamma.lowerIncompleteGamma;
const lnUpperIncompleteGammaB = gamma.lnUpperIncompleteGammaB;
const discreteQuantileFind = rf.discreteQuantileFind;

export function pmfSync(k, lambda) {
  if (k === 0) {
    return Math.exp((k * Math.log(lambda)) - lambda);
  } else {
    return Math.exp((k * Math.log(lambda)) - lambda - lnFactorial(k));
  }
}

export function pmf(k, lambda) {
  function script(a,b) {
    return pmfSync(a, b)
  }
  return asyncGen([lnGamma, lnFactorial, pmfSync], script, [k, lambda]);
}


export function cdfSync(k, lambda) {
  // TODO: check into slow computation of lowerIncompleteGamma for large lambda
  let result = 1 - lowerIncompleteGamma(lambda, k + 1);
  if (result === 0) {
    result = Math.exp(lnUpperIncompleteGammaB(lambda, k + 1));
  }
  return result;
}

export function cdf(k, lambda) {
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
  ], script, [k, lambda]);
}

export function quantileSync(p, lambda) {
  function simplifiedCDF(val) {
    return cdfSync(val, lambda);
  }
  return discreteQuantileFind(simplifiedCDF, p, null, 0, lambda);
}

export function quantile(p, lambda) {
  function script(a, b) {
    return quantileSync(a, b);
  }

  return asyncGen([
    discreteQuantileFind,
    continuedFractionSolver,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lnLowerIncompleteGamma,
    gamma.lowerIncompleteGamma,
    cdfSync,
    quantileSync
  ], script, [p, lambda]);
}
