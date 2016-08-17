"use strict";
import {continuedFractionSolver} from "./continuedFractionSolver";
import {lnGamma} from "./gamma";
import {rootFind} from "./rootFind"

/**
 * Created by zacharymartin on August 13, 2016.
 */

function lnBeta(x, y){
  return (lnGamma(x) + lnGamma(y)) - lnGamma(x + y);;
}

/**
 * a function to calculate the "d_i" values from
 *      http://www.stat.tamu.edu/~jnewton/604/chap3.pdf  pp.15-16
 * in the calculation of the IB(incomplete beta function)
 *
 * @param i - the index of the d_i values
 * @param x - parameter from the IB function
 * @param a - parameter from the IB function
 * @param b - parameter from the IB function
 * @returns {any} - the d_i value
 */

function d(i: number, x: number, a: number, b: number): number{
  var result;
  var m;

  if (i % 2 === 0){
    m = i/2;

    result = (m * (b - m) * x)/((a + 2*m - 1) * (a + 2*m));
  } else if (i % 2 === 1){
    m = (i - 1)/2;

    result = - ((a + m)*(a + b + m) * x)/((a + 2 * m) * (a + 2 * m + 1));
  }

  return result;
}

function continuedFraction(x: number, a: number, b: number): number {
  function num(j: number): number{
    if (j === 1) {
      return 1;
    } else {
      return d(j - 1, x, a, b);
    }
  }

  function denom(j: number): number{
    if (j === 0) {
      return 0;
    } else {
      return 1;
    }
  }

  return continuedFractionSolver(num, denom);
}

export function lnIncompleteBeta(x: number, a: number, b: number): number {
  const comparator = (a + 1)/(a + b + 1);

  if (x >= comparator) {
    return Math.log(1 - Math.exp(lnIncompleteBeta(1 - x, b, a)));
  }

  const alnx = a * Math.log(x);
  const bln1MinusX = b * Math.log(1 - x);
  const lna = Math.log(a);
  const lnBetaAB = lnBeta(a, b);
  const lnContinuedFraction = Math.log(continuedFraction(x, a, b));

  return alnx + bln1MinusX - lna - lnBetaAB + lnContinuedFraction;
}

export function incompleteBeta(x, a, b){
  return Math.exp(lnIncompleteBeta(x, a, b))
}

export function inverseIncompleteBeta(p, a, b){

  const lnIncompBeta = function(x){
    return lnIncompleteBeta(x, a, b);
  };

  const derivativeLnIncompleteBeta = function(x){
    const lnBetaAB = lnBeta(a, b);
    const lnIncBetaXAB = lnIncompleteBeta(x, a, b);
    const bMinus1TimesLn1MinusX = (b - 1) * Math.log(1 - x);
    const aMinus1TimesLnX = (a - 1) * Math.log(x);

    return Math.exp(bMinus1TimesLn1MinusX + aMinus1TimesLnX - lnBetaAB - lnIncBetaXAB);
  };

  return rootFind(lnIncompBeta,
    derivativeLnIncompleteBeta,
    Math.log(p),
    0.5,
    1,
    0);
}