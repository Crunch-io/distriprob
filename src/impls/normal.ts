"use strict";
import {continuedFractionSolver} from "./continuedFractionSolver";
import * as gamma from "./gamma";
import * as rf from "./rootFind";
import {asyncGen} from "./async";

const lowerIncompleteGamma = gamma.lowerIncompleteGamma;
const rootFind = rf.rootFind;

/**
 * Created by zacharymartin on August 16, 2016.
 */

/**
 * This function calculates the probability density function for the normal
 * distribution.
 *
 * According to wikipedia (https://en.wikipedia.org/wiki/Normal_distribution), the
 * formula for the normal pdf is:
 *
 *pdf(x, mu, sigma) = (1/(sigma * sqrt(2 * PI))) * e ^ -(((x - mu)^2)/(2 * sigma ^ 2))
 *
 * @param x
 * @param mu - the mean of the normal distribution
 * @param sigma - the standard deviation of the normal distribution
 * @returns number - the probablity density of the normal distribution
 */
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
  function script(a,b,c) {
    return pdfSync(a, b, c)
  }
  return asyncGen([pdfSync], script, [x, mu, sigma]);
}


export function cdfSync(x, mu, sigma) {
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

  if (z >= 0) {
    return nonNegativeCase(z);
  } else {
    return 1 - nonNegativeCase(-z);
  }
}

export function cdf(x, mu, sigma) {
  function script(a,b,c) {
    return cdfSync(a, b, c);
  }

  return asyncGen([
    rootFind, // <<----- might not be necessary, TODO: check if necessary
    continuedFractionSolver,
    gamma.lnGamma,
    gamma.gammaContinuedFraction,
    gamma.lnLowerIncompleteGammaA,
    gamma.lnUpperIncompleteGammaB,
    gamma.lnLowerIncompleteGamma,
    gamma.lowerIncompleteGamma,
    cdfSync
  ], script, [x, mu, sigma]);
}

// export function quantile(p, mu, sigma) {
//   if (!mu) {
//     mu = 0;
//   }
//
//   if (!sigma) {
//     sigma = 1;
//   }
//
//   function initialEstimateOfZ(val) {
//     function lessThanOrEqualToHalfCase(val) {
//       const t = Math.sqrt(-2 * Math.log(val));
//
//       return ((2.30753 + 0.27061 * t)/(1 + 0.99229*t + 0.04481*t*t)) - t;
//     }
//
//     let z;
//
//     if (p <= 0.5) {
//       z = lessThanOrEqualToHalfCase(val);
//     } else {
//       z = - lessThanOrEqualToHalfCase(1 - val);
//     }
//
//     return z;
//   }
//
//   function greaterThanOrEqualToHalfCase(val) {
//     const zEstimate = initialEstimateOfZ(val);
//     const invLowIncGammaInitialEstimate = (zEstimate * zEstimate) / 2;
//     const invLowIncGamma = inverseLowerIncompleteGamma((2 * val) - 1,
//                                                        1/2,
//                                                        invLowIncGammaInitialEstimate);
//     console.log("z estimate:", zEstimate);
//     console.log("invLowGammaEst:", invLowIncGammaInitialEstimate);
//     console.log("invLowGammaFinal:", invLowIncGamma);
//
//     return Math.sqrt(2 * invLowIncGamma);
//   }
//
//   let z;
//
//   if (p >= 0.5) {
//     z = greaterThanOrEqualToHalfCase(p);
//   } else {
//     z = - greaterThanOrEqualToHalfCase(1 - p);
//   }
//
//   return (z * sigma) + mu;
// }

export function quantileSync(p, mu, sigma) {
  function f (val) {
    return cdfSync(val, 0, 1);
  }

  function fPrime(val) {
    return pdfSync(val, 0, 1);
  }

  let z = rootFind(f, fPrime, p, 0, null, null);

  return (z * sigma) + mu;
}

export function quantile(p, mu, sigma) {
  function script(a,b,c) {
    return quantileSync(a, b, c);
  }

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
    pdfSync,
    cdfSync,
    quantileSync
  ], script, [p, mu, sigma]);
}

let val = 0.005;

// console.log("q:", quantile(val, 0, 1));
// console.log("q2:", quantile2(val, 0, 1));
quantile(val, 0, 1).then((result) => {
  console.log("async quantile:", result);
});
console.log("sync quantile:", quantileSync(val, 0, 1));