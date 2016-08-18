"use strict";
import * as gamma from "./gamma";
import * as beta from "./beta";
import * as rf from "./rootFind";
import {asyncGen} from "./async";
import {continuedFractionSolver} from "./continuedFractionSolver";

const lnGamma = gamma.lnGamma;
const lnBeta = beta.lnBeta;
const incompleteBeta = beta.incompleteBeta;
const rootFind = rf.rootFind;

/**
 * Created by zacharymartin on August 17, 2016.
 */

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
  function script(a, b, c) {
    return pdfSync(a, b, c)
  }
  return asyncGen([beta.lnBeta, gamma.lnGamma, pdfSync], script, [x, dof1, dof2]);
}

export function cdfSync(x, dof1, dof2) {
  if (x <= 0) {
    return 0;
  } else {
    return 1 - incompleteBeta(dof2/(dof2 + (dof1 * x)), dof2/2, dof1/2);
  }
}

export function cdf(x, dof1, dof2) {
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
  ], script, [x, dof1, dof2]);
}

export function quantileSync(p, dof1, dof2) {
  function f(val) {
    return cdfSync(val, dof1, dof2);
  }

  function fPrime(val) {
    return pdfSync(val, dof1, dof2);
  }

  return rootFind(f, fPrime, p, 1, null, 0);
}

export function quantile(p, dof1, dof2) {
  function script(a, b, c) {
    return quantileSync(a, b, c)
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
  ], script, [p, dof1, dof2]);
}

let val = 0.5;

quantile(val, 19, 8).then((result) => {
  console.log("async:", result);
});
console.log("sync:", quantileSync(val, 19, 8));

