"use strict";

import {asyncGen} from "./async";
import {rand, randSync} from "./random";
import * as gamma from "./gamma";
import * as cf from "./continuedFractionSolver";
import * as rf from "./rootFind";

const gammaCDF = gamma.gammaCDF;
const rootFind = rf.rootFind;

export function pdfSync(x, lambda) {
  if (x < 0) {
    return 0;
  } else {
    return lambda * Math.exp((- lambda) * x);
  }
}

export function pdf(x, lambda) {
  return asyncGen([], pdfSync, [x, lambda]);
}

export function cdfSync(x, lambda, lowerTail = true) {
  if (x < 0) {
    if (lowerTail) {
      return 0;
    } else {
      return 1;
    }
  } else {
    if (lowerTail) {
      const possibleResult = 1 - Math.exp((- lambda) * x);

      if (possibleResult >= 0.1) {
        return possibleResult;
      } else {
        return gammaCDF(x, 1, 1/lambda, true);
      }
    } else {
      return Math.exp((- lambda) * x);
    }
  }
}

export function cdf(x, lambda, lowerTail = true) {
  return asyncGen([
    gammaCDF,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    cf.continuedFractionSolver,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lowerIncompleteGamma,
    gamma.upperIncompleteGamma
  ], cdfSync, [x, lambda, lowerTail]);
}

export function quantileSync(p, lambda, lowerTail = true) {
  function f(val) {
    return cdfSync(val, lambda, lowerTail);
  }

  function fPrime(val) {
    if (lowerTail) {
      return pdfSync(val, lambda);
    } else {
      return - pdfSync(val, lambda);
    }
  }
  const mean = 1/lambda;

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
    return rootFind(f, fPrime, p, mean, null, 0);
  }
}

export function quantile(p, lambda, lowerTail = true) {
  return asyncGen([
    gammaCDF,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    cf.continuedFractionSolver,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lowerIncompleteGamma,
    gamma.upperIncompleteGamma,
    rootFind,
    rf.newton,
    rf.bisection,
    pdfSync,
    cdfSync
  ], quantileSync, [p, lambda, lowerTail]);
}

export function randomSync(n, lambda, seed?: number | string, randoms?) {
  return randSync(n, quantileSync, [lambda], seed, randoms);
}

export function random(n, lambda, seed?: number | string) {
  return rand(n, quantileSync, [lambda], seed, [
    gammaCDF,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    cf.continuedFractionSolver,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lowerIncompleteGamma,
    gamma.upperIncompleteGamma,
    rootFind,
    rf.newton,
    rf.bisection,
    pdfSync,
    cdfSync
  ]);
}
