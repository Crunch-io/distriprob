"use strict";
import * as gamma from "./gamma";
import * as beta from "./beta";
import * as rf from "./rootFind";
import {asyncGen} from "./async";
import {rand, randSync} from "./random";
import {continuedFractionSolver} from "./continuedFractionSolver";

// This import and then renaming of imports is necessary to allow the async module to
// correctly generate web worker scripts.
const lnGamma = gamma.lnGamma;
const lnBeta = beta.lnBeta;
const incompleteBeta = beta.incompleteBeta;
const rootFind = rf.rootFind;


export function pdfSync(x, dof1, dof2) {
  if (x <= 0) {
    return 0
  } else {
    const lnNumNum = (dof1 * Math.log(dof1 * x)) + (dof2 * Math.log(dof2));
    const lnNumDenom = (dof1 + dof2) * Math.log((dof1 * x) + dof2);
    const lnNum = 0.5 * (lnNumNum - lnNumDenom);
    const lnDenom = Math.log(x) + lnBeta(dof1/2, dof2/2);

    return Math.exp(lnNum - lnDenom);
  }
}

export function pdf(x, dof1, dof2) {
  return asyncGen([beta.lnBeta, gamma.lnGamma,], pdfSync, [x, dof1, dof2]);
}

export function cdfSync(x, dof1, dof2, lowerTail = true) {
  if (x <= 0) {
    if (lowerTail) {
      return 0;
    } else {
      return 1;
    }
  } else {
    if (lowerTail) {
      return incompleteBeta((dof1 * x)/(dof2 + (dof1 * x)), dof1/2, dof2/2);
    } else {
      return incompleteBeta(dof2/(dof2 + (dof1 * x)), dof2/2, dof1/2)
    }
  }
}

export function cdf(x, dof1, dof2, lowerTail = true) {
  return asyncGen([
    beta.lnBeta,
    gamma.lnGamma,
    continuedFractionSolver,
    beta.d,
    beta.continuedFraction,
    beta.lnIncompleteBeta,
    beta.incompleteBeta
  ], cdfSync, [x, dof1, dof2, lowerTail]);
}

export function quantileSync(p, dof1, dof2, lowerTail = true) {
  function f(val) {
    return cdfSync(val, dof1, dof2);
  }

  function fPrime(val) {
    return pdfSync(val, dof1, dof2);
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

export function quantile(p, dof1, dof2, lowerTail = true) {
  return asyncGen([
    rf.newton,
    rf.bisection,
    rootFind,
    beta.lnBeta,
    gamma.lnGamma,
    continuedFractionSolver,
    beta.d,
    beta.continuedFraction,
    beta.lnIncompleteBeta,
    beta.incompleteBeta,
    pdfSync,
    cdfSync
  ], quantileSync, [p, dof1, dof2, lowerTail]);
}

export function randomSync(n, dof1, dof2, seed?: number | string, randoms?) {
  return randSync(n, quantileSync, [dof1, dof2], seed, randoms);
}

export function random(n, dof1, dof2, seed?: number | string) {
  return rand(n, quantileSync, [dof1, dof2], seed, [
    rf.newton,
    rf.bisection,
    rootFind,
    beta.lnBeta,
    gamma.lnGamma,
    continuedFractionSolver,
    beta.d,
    beta.continuedFraction,
    beta.lnIncompleteBeta,
    beta.incompleteBeta,
    pdfSync,
    cdfSync
  ]);
}
