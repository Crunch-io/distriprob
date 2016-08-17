"use strict";
import * as gamma from "./gamma";
import * as beta from "./beta";
import * as rf from "./rootFind";
import {asyncGen} from "./async";
import {continuedFractionSolver} from "./continuedFractionSolver";

const lnGamma = gamma.lnGamma;
const incompleteBeta = beta.incompleteBeta;
const rootFind = rf.rootFind;
/**
 * Created by zacharymartin on August 16, 2016.
 */


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

export function cdfSync(x, degreesOfFreedom) {
  function greaterThanOrEqualToZeroCase(val, dof) {
    return 1 - incompleteBeta(dof/(dof + val*val), dof/2, 1/2)/2
  }

  if (x >= 0) {
    return greaterThanOrEqualToZeroCase(x, degreesOfFreedom);
  } else {
    return 1 - cdfSync(-x, degreesOfFreedom);
  }
}

export function cdf(x, degreesOfFreedom) {
  function script(a,b) {
    return cdfSync(a, b)
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
  ], script, [x, degreesOfFreedom]);
}

// export function quantile(p, degreesOfFreedom) {
//   function greaterThanOrEqualToHalfCase(val, dof) {
//     let inv = inverseIncompleteBeta(0.5 * (1-val), dof/2, 0.5);
//
//     return Math.sqrt((dof/inverseIncompleteBeta(2 * (1-val), dof/2, 0.5)) - dof);
//   }
//
//   if (p >= 0.5) {
//     return greaterThanOrEqualToHalfCase(p, degreesOfFreedom);
//   } else {
//     return 1 - quantile(0.5 + p, degreesOfFreedom);
//   }
// }

export function quantileSync(p, degreesOfFreedom) {
  function f(val) {
    return cdfSync(val, degreesOfFreedom);
  }

  function fprime(val) {
    return pdfSync(val, degreesOfFreedom);
  }

  return rootFind(f, fprime, p, 0, null, null);
}

export function quantile(p, degreesOfFreedom) {
  function script(a,b) {
    return quantileSync(a, b)
  }
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
    cdfSync,
    quantileSync
  ], script, [p, degreesOfFreedom]);
}

let val = 0.95;

quantile(val, 27).then((result) => {
  console.log("async:", result);
});
console.log("sync:", quantileSync(val, 27));