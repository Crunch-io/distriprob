"use strict";
import {continuedFractionSolver} from "./continuedFractionSolver";
import * as gamma from "./gamma";
import * as rf from "./rootFind";
import {asyncGen} from "./async";

// This import and then renaming of imports is necessary to allow the async module to
// correctly generate web worker scripts.
const lowerIncompleteGamma = gamma.lowerIncompleteGamma;
const upperIncompleteGamma = gamma.upperIncompleteGamma;
const rootFind = rf.rootFind;


export function pdfSync(x, mu, sigma) {
  if (!mu){
    mu = 0;
  }

  if (!sigma){
    sigma = 1;
  }

  const coefficient = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const exponentNumerator = Math.pow((x - mu), 2);
  const exponentDenominator = 2 * Math.pow(sigma, 2);
  const exponent = - (exponentNumerator / exponentDenominator);

  return coefficient * Math.pow(Math.E, exponent);
}

export function pdf(x, mu, sigma) {
  function script(a, b, c) {
    return pdfSync(a, b, c);
  }
  return asyncGen([pdfSync], script, [x, mu, sigma]);
}


export function cdfSync(x, mu, sigma, lowerTail = true) {
  if (!mu) {
    mu = 0;
  }

  if (!sigma) {
    sigma = 1;
  }

  const z = (x - mu) / sigma;

  function nonNegativeCase(val) {
    return (1/2) * (1 + lowerIncompleteGamma((val*val)/2, 1/2));
  }

  if ((z >= 0 && lowerTail) || (z < 0 && !lowerTail)) {
    return (1/2) + (lowerIncompleteGamma((x*x)/2, 1/2)/2);
  } else {
    return upperIncompleteGamma((x*x)/2, 1/2)/2;
  }
}

export function cdf(x, mu, sigma, lowerTail = true) {
  return asyncGen([
    continuedFractionSolver,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lnLowerIncompleteGamma,
    gamma.lowerIncompleteGamma,
    gamma.upperIncompleteGamma
  ], cdfSync, [x, mu, sigma, lowerTail]);
}

export function quantileSync(p, mu, sigma, lowerTail = true) {
  function f (val) {
    return cdfSync(val, 0, 1);
  }

  function fPrime(val) {
    if (lowerTail) {
      return pdfSync(val, 0, 1);
    } else {
      return - pdfSync(val, 0, 1);
    }
  }

  if (p === 0) {
    if (lowerTail) {
      return Number.NEGATIVE_INFINITY;
    } else {
      return Number.POSITIVE_INFINITY;
    }
  } else if (p === 1) {
    if (lowerTail) {
      return Number.POSITIVE_INFINITY;
    } else {
      return Number.NEGATIVE_INFINITY;
    }
  } else {
    let z = rootFind(f, fPrime, p, 0, null, null);

    return (z * sigma) + mu;
  }
}

export function quantile(p, mu, sigma, lowerTail = true) {
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
    gamma.upperIncompleteGamma,
    pdfSync,
    cdfSync
  ], quantileSync, [p, mu, sigma, lowerTail]);
}
