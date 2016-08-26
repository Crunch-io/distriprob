"use strict";

import * as gamma from "./gamma";
import * as beta from "./beta";
import * as rf from "./rootFind";
import * as cfs from "./continuedFractionSolver";
import * as pf from "./primeFactors";
import {asyncGen} from "./async";
import {rand, randSync} from "./random";

// This import and then renaming of imports is necessary to allow the async module to
// correctly generate web worker scripts.
const lnGamma = gamma.lnGamma;
const lnFactorial = gamma.lnFactorial;
const incompleteBeta = beta.incompleteBeta;
const discreteQuantileFind = rf.discreteQuantileFind;
const continuedFractionSolver = cfs.continuedFractionSolver;
const lnFactorialFractionEval = pf.lnFactorialFractionEval;

export function lnBinomialCoefficient(n, chooseK) {
  if (typeof n !== "number" || typeof chooseK !== "number") {
    throw new Error(`The binomial coefficient function is only defined for numeric${""
    } arguments n and k.`);
  }

  if (n < chooseK) {
    throw new Error(`The binomial coefficient function is only defined for n greater${""
      } than or equal to k.`);
  }

  if (!Number.isInteger(n) || !Number.isInteger(chooseK)) {
    throw new Error(`The binomial coefficient function is defined for integer${""
    } arguments n and k.`)
  }

  if (chooseK === 0 || chooseK === n) {
    return 0;
  }

  return lnFactorialFractionEval([n], [chooseK, n-chooseK]);
}

export function pmfSync(k, trials, probSuccess) {
  const p = probSuccess;

  if (!Number.isInteger(k) || k < 0 || k > trials) {
    return 0
  } else {
    return Math.exp(
      lnBinomialCoefficient(trials, k) + (k * Math.log(p)) +
      ((trials-k) * Math.log(1 - p,))
    );
  }
}

export function pmf(k, trials, probSuccess) {
  return asyncGen([
    pf.primesLessThanOrEqualTo,
    pf._factorialPrimes,
    pf.factorialPrimes,
    lnFactorialFractionEval,
    lnBinomialCoefficient
  ], pmfSync, [k, trials, probSuccess]);
}

export function cdfSync(k, trials, probSuccess, lowerTail = true) {
  if (k < 0) {
    if (lowerTail) {
      return 0;
    } else {
      return 1;
    }
  } else if (k > trials) {
    if (lowerTail) {
      return 1;
    } else {
      return 0;
    }
  } else {
    k = Math.floor(k);
    if (lowerTail) {
      return incompleteBeta(1 - probSuccess, trials - k, k + 1);
    } else {
      return incompleteBeta(probSuccess, k + 1, trials - k)
    }
  }
}

export function cdf(k, trials, probSuccess, lowerTail = true) {
  return asyncGen([
    beta.lnBeta,
    gamma.lnGamma,
    continuedFractionSolver,
    beta.d,
    beta.continuedFraction,
    beta.lnIncompleteBeta,
    beta.incompleteBeta
  ], cdfSync, [k, trials, probSuccess, lowerTail]);
}

export function quantileSync(p, trials, probSuccess, lowerTail = true) {
  function simplifiedCDF(val) {
    return cdfSync(val, trials, probSuccess, lowerTail);
  }
  if (p === 0) {
    if (lowerTail) {
      return 0;
    } else {
      return trials;
    }
  } else if (p === 1) {
    if (lowerTail) {
      return trials;
    } else {
      return 0;
    }
  } else {
    const mean = Math.floor(trials*p);

    return discreteQuantileFind(simplifiedCDF, p, trials, 0, mean, lowerTail);
  }
}

export function quantile(p, trials, probSuccess, lowerTail = true) {
  return asyncGen([
    discreteQuantileFind,
    beta.lnBeta,
    gamma.lnGamma,
    continuedFractionSolver,
    beta.d,
    beta.continuedFraction,
    beta.lnIncompleteBeta,
    beta.incompleteBeta,
    cdfSync
  ], quantileSync, [p, trials, probSuccess, lowerTail]);
}

export function randomSync(n, trials, probSuccess, seed?: number | string, randoms?) {
  return randSync(n, quantileSync, [trials, probSuccess], seed, randoms);
}

export function random(n, trials, probSuccess, seed?: number | string) {
  return rand(n, quantileSync, [trials, probSuccess], seed, [
    discreteQuantileFind,
    beta.lnBeta,
    gamma.lnGamma,
    continuedFractionSolver,
    beta.d,
    beta.continuedFraction,
    beta.lnIncompleteBeta,
    beta.incompleteBeta,
    cdfSync
  ]);
}



