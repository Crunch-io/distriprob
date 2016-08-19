"use strict";

import * as gamma from "./gamma";
import * as beta from "./beta";
import * as rf from "./rootFind";
import * as cfs from "./continuedFractionSolver";
import {asyncGen} from "./async";

// This import and then renaming of imports is necessary to allow the async module to
// correctly generate web worker scripts.
const lnGamma = gamma.lnGamma;
const lnFactorial = gamma.lnFactorial;
const incompleteBeta = beta.incompleteBeta;
const discreteQuantileFind = rf.discreteQuantileFind;
const continuedFractionSolver = cfs.continuedFractionSolver;


function lnBinomialCoefficient(n, chooseK) {
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
    return 1
  }

  return lnFactorial(n) - (lnFactorial(chooseK) + lnFactorial(n-chooseK));
}

export function pmfSync(k, n, probSuccess) {
  const p = probSuccess;
  return Math.exp(
    lnBinomialCoefficient(n, k) + (k * Math.log(p)) + ((n-k) * Math.log(1 - p,))
  );
}

export function pmf(k, n, probSuccess) {
  function script(a,b,c) {
    return pmfSync(a, b, c);
  }
  return asyncGen([
    lnGamma,
    lnFactorial,
    lnBinomialCoefficient,
    pmfSync
  ], script, [k, n, probSuccess]);
}

export function cdfSync(k, n, probSuccess) {
  return 1 - incompleteBeta(probSuccess, k + 1, n - k);
}

export function cdf(k, n, probSuccess) {
  function script(a, b, c) {
    return cdfSync(a, b, c)
  }
  return asyncGen([
    beta.lnBeta,
    gamma.lnGamma,
    continuedFractionSolver,
    beta.d,
    beta.continuedFraction,
    beta.lnIncompleteBeta,
    beta.incompleteBeta,
    cdfSync
  ], script, [k, n, probSuccess]);
}

export function quantileSync(p, n, probSuccess) {
  function simplifiedCDF(val) {
    return cdfSync(val, n, probSuccess);
  }
  if (p === 0) {
    return 0;
  } else if (p === 1) {
    return n;
  } else {
    return discreteQuantileFind(simplifiedCDF, p, n, 0);
  }
}

export function quantile(p, n, probSuccess) {
  function script(a, b, c) {
    return quantileSync(a, b, c)
  }
  return asyncGen([
    discreteQuantileFind,
    beta.lnBeta,
    gamma.lnGamma,
    continuedFractionSolver,
    beta.d,
    beta.continuedFraction,
    beta.lnIncompleteBeta,
    beta.incompleteBeta,
    cdfSync,
    quantileSync
  ], script, [p, n, probSuccess]);
}





