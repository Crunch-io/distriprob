"use strict";
import * as gamma from "./gamma";
import * as rf from "./rootFind";
import * as cfs from "./continuedFractionSolver";
import {asyncGen} from "./async";
import {rand, randSync} from "./random";

// This import and then renaming of imports is necessary to allow the async module to
// correctly generate web worker scripts.
const continuedFractionSolver = cfs.continuedFractionSolver;
const lnGamma = gamma.lnGamma;
const lnFactorial = gamma.lnFactorial;
const lowerIncompleteGamma = gamma.lowerIncompleteGamma;
const upperIncompleteGamma = gamma.upperIncompleteGamma;
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
  return asyncGen([lnGamma, lnFactorial ], pmfSync, [k, lambda]);
}


export function cdfSync(k, lambda, lowerTail = true) {
  if (k < 0) {
    if (lowerTail) {
      return 0;
    } else {
      return 1;
    }
  } else {
    k = Math.floor(k);

    // TODO: check into slow computation of lowerIncompleteGamma for large lambda
    if (lowerTail) {
      return upperIncompleteGamma(lambda, k + 1);
    } else {
      return lowerIncompleteGamma(lambda, k + 1);
    }
  }
}

export function cdf(k, lambda, lowerTail = true) {
  return asyncGen([
    continuedFractionSolver,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lnLowerIncompleteGamma,
    gamma.lnUpperIncompleteGamma,
    gamma.lowerIncompleteGamma,
    gamma.upperIncompleteGamma
  ], cdfSync, [k, lambda, lowerTail]);
}

export function quantileSync(p, lambda, lowerTail = true) {
  function simplifiedCDF(val) {
    return cdfSync(val, lambda, lowerTail);
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
    const mean = lambda;

    return discreteQuantileFind(simplifiedCDF, p, null, 0, mean, lowerTail);
  }
}

export function quantile(p, lambda, lowerTail = true) {
  return asyncGen([
    discreteQuantileFind,
    continuedFractionSolver,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lnLowerIncompleteGamma,
    gamma.lnUpperIncompleteGamma,
    gamma.lowerIncompleteGamma,
    gamma.upperIncompleteGamma,
    cdfSync
  ], quantileSync, [p, lambda, lowerTail]);
}

export function randomSync(n, lambda, seed?: number | string, randoms?) {
  return randSync(n, quantileSync, [lambda], seed, randoms);
}

export function random(n, lambda, seed?: number | string) {
  return rand(n, quantileSync, [lambda], seed, [
    discreteQuantileFind,
    continuedFractionSolver,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lnLowerIncompleteGamma,
    gamma.lnUpperIncompleteGamma,
    gamma.lowerIncompleteGamma,
    gamma.upperIncompleteGamma,
    cdfSync
  ]);
}
