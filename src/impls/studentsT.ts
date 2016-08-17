"use strict";
import {lnGamma} from "./gamma";
import {incompleteBeta, inverseIncompleteBeta} from "./beta";
import {rootFind} from "./rootFind";

/**
 * Created by zacharymartin on August 16, 2016.
 */


export function pdf(x, degreesOfFreedom) {
  const lnCoefficientNumerator = lnGamma((degreesOfFreedom + 1)/2);
  const lnCoefficientDenominator
    = ((1/2) * Math.log(degreesOfFreedom * Math.PI)) + lnGamma(degreesOfFreedom / 2);
  const lnCoefficient = lnCoefficientNumerator - lnCoefficientDenominator;
  const lnBase = Math.log(1 + ((x*x)/degreesOfFreedom));
  const exponent = - (degreesOfFreedom + 1)/2;

  return Math.exp(lnCoefficient + (exponent * lnBase));
}

export function cdf(x, degreesOfFreedom) {
  function greaterThanOrEqualToZeroCase(val, dof) {
    return 1 - incompleteBeta(dof/(dof + val*val), dof/2, 1/2)/2
  }

  if (x >= 0) {
    return greaterThanOrEqualToZeroCase(x, degreesOfFreedom);
  } else {
    return 1 - cdf(-x, degreesOfFreedom);
  }
}

export function quantile(p, degreesOfFreedom) {
  function greaterThanOrEqualToHalfCase(val, dof) {
    let inv = inverseIncompleteBeta(0.5 * (1-val), dof/2, 0.5);

    return Math.sqrt((dof/inverseIncompleteBeta(2 * (1-val), dof/2, 0.5)) - dof);
  }

  if (p >= 0.5) {
    return greaterThanOrEqualToHalfCase(p, degreesOfFreedom);
  } else {
    return 1 - quantile(0.5 + p, degreesOfFreedom);
  }
}

export function quantile2(p, degreesOfFreedom) {
  function f(val) {
    return cdf(val, degreesOfFreedom);
  }

  function fprime(val) {
    return pdf(val, degreesOfFreedom);
  }

  return rootFind(f, fprime, p, 0, null, null);
}

let val = 0.5;

console.log("studentsT pdf:", pdf(-1.5, 27));
console.log("studentsT cdf:", cdf(0, 27));
console.log("studentsT quantile:", quantile(val, 27));
console.log("studentsT quantile2:", quantile2(val, 27));