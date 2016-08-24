"use strict";
import * as gamma from "./gamma";
import * as beta from "./beta";
import * as rf from "./rootFind";
import {asyncGen} from "./async";
import {continuedFractionSolver} from "./continuedFractionSolver";

// This import and then renaming of imports is necessary to allow the async module to
// correctly generate web worker scripts.
const lnGamma = gamma.lnGamma;
const incompleteBeta = beta.incompleteBeta;
const rootFind = rf.rootFind;


export function pdfSync(x, degreesOfFreedom) {
  const lnCoefficientNumerator = lnGamma((degreesOfFreedom + 1)/2);
  const lnCoefficientDenominator
    = ((1/2) * Math.log(degreesOfFreedom * Math.PI)) + lnGamma(degreesOfFreedom / 2);
  const lnCoefficient = lnCoefficientNumerator - lnCoefficientDenominator;
  const lnBase = Math.log(1 + ((x*x)/degreesOfFreedom));
  const exponent = - (degreesOfFreedom + 1)/2;

  return Math.exp(lnCoefficient + (exponent * lnBase));
}

export function pdf(x, degreesOfFreedom) {
  function script(a,b) {
    return pdfSync(a, b)
  }
  return asyncGen([beta.lnBeta, gamma.lnGamma, pdfSync], script, [x, degreesOfFreedom]);
}

export function cdfSync(x, degreesOfFreedom, lowerTail = true) {
  const incompleteBetaEval = incompleteBeta(
      degreesOfFreedom/(degreesOfFreedom + x*x),
      degreesOfFreedom/2,
      1/2
    );

  if ((x >= 0 && lowerTail) || (x < 0 && !lowerTail)) {
    return 1 - incompleteBetaEval/2;
  } else {
    return incompleteBetaEval/2;
  }
}

export function cdf(x, degreesOfFreedom, lowerTail = true) {
  return asyncGen([
    beta.lnBeta,
    gamma.lnGamma,
    continuedFractionSolver,
    beta.d,
    beta.continuedFraction,
    beta.lnIncompleteBeta,
    beta.incompleteBeta
  ], cdfSync, [x, degreesOfFreedom, lowerTail]);
}

export function quantileSync(p, degreesOfFreedom, lowerTail = true) {
  function f(val) {
    return cdfSync(val, degreesOfFreedom);
  }

  function fPrime(val) {
    if (lowerTail) {
      return pdfSync(val, degreesOfFreedom);
    } else {
      return - pdfSync(val, degreesOfFreedom);
    }
  }

  return rootFind(f, fPrime, p, 0, null, null);
}

export function quantile(p, degreesOfFreedom, lowerTail = true) {
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
  ], quantileSync, [p, degreesOfFreedom, lowerTail]);
}
