"use strict";

import * as gamma from "./gamma";
import * as beta from "./beta";
import * as rf from "./rootFind";
import * as cfs from "./continuedFractionSolver";
import * as pf from "./primeFactors";
import {asyncGen} from "./async";

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

export function pmfSync(k, n, probSuccess) {
  const p = probSuccess;

  if (!Number.isInteger(k) || k < 0 || k > n) {
    return 0
  } else {
    return Math.exp(
      lnBinomialCoefficient(n, k) + (k * Math.log(p)) + ((n-k) * Math.log(1 - p,))
    );
  }
}

export function pmf(k, n, probSuccess) {
  return asyncGen([
    pf.primesLessThanOrEqualTo,
    pf._factorialPrimes,
    pf.factorialPrimes,
    lnFactorialFractionEval,
    lnBinomialCoefficient
  ], pmfSync, [k, n, probSuccess]);
}

export function cdfSync(k, n, probSuccess, lowerTail = true) {
  if (k < 0) {
    if (lowerTail) {
      return 0;
    } else {
      return 1;
    }
  } else if (k > n) {
    if (lowerTail) {
      return 1;
    } else {
      return 0;
    }
  } else {
    k = Math.floor(k);
    if (lowerTail) {
      return incompleteBeta(1 - probSuccess, n - k, k + 1);
    } else {
      return incompleteBeta(probSuccess, k + 1, n - k)
    }
  }
}

export function cdf(k, n, probSuccess, lowerTail = true) {
  return asyncGen([
    beta.lnBeta,
    gamma.lnGamma,
    continuedFractionSolver,
    beta.d,
    beta.continuedFraction,
    beta.lnIncompleteBeta,
    beta.incompleteBeta
  ], cdfSync, [k, n, probSuccess, lowerTail]);
}

export function quantileSync(p, n, probSuccess, lowerTail = true) {
  function simplifiedCDF(val) {
    return cdfSync(val, n, probSuccess, lowerTail);
  }
  if (p === 0) {
    if (lowerTail) {
      return 0;
    } else {
      return n;
    }
  } else if (p === 1) {
    if (lowerTail) {
      return n;
    } else {
      return 0;
    }
  } else {
    const mean = Math.floor(n*p);

    return discreteQuantileFind(simplifiedCDF, p, n, 0, mean, lowerTail);
  }
}

export function quantile(p, n, probSuccess, lowerTail = true) {
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
  ], quantileSync, [p, n, probSuccess, lowerTail]);
}



