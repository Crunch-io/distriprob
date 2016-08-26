"use strict";

import * as _normal from "./impls/normal";
import * as studentsT from "./impls/studentsT";
import * as chiSquared from "./impls/chiSquared";
import * as fDist from "./impls/fDist";
import * as binom from "./impls/binomial";
import * as _poisson from "./impls/poisson";
import * as hypergeo from "./impls/hypergeometric";
import * as _gamma from "./impls/gamma";
import * as exp from "./impls/exponential";
import * as _uniform from "./impls/uniform";
import * as _beta from "./impls/beta";

export const uniform = {
  pdf: function(x, lowerSupportBound, upperSupportBound): Promise<number> {
    return _uniform.pdf(x, lowerSupportBound, upperSupportBound);
  },
  cdf: function(x, lowerSupportBound, upperSupportBound, lowerTail = true):
    Promise<number> {
    return _uniform.cdf(x, lowerSupportBound, upperSupportBound, lowerTail);
  },
  quantile: function(x, lowerSupportBound, upperSupportBound, lowerTail = true):
    Promise<number> {
    return _uniform.quantile(x, lowerSupportBound, upperSupportBound, lowerTail);
  },
  random: function(n, lowerSupportBound, upperSupportBound, seed?: number | string):
    Promise<number[]> {
    return _uniform.random(n, lowerSupportBound, upperSupportBound, seed);
  },
  pdfSync: function(x, lowerSupportBound, upperSupportBound): number {
    return _uniform.pdfSync(x, lowerSupportBound, upperSupportBound);
  },
  cdfSync: function(x, lowerSupportBound, upperSupportBound, lowerTail = true): number {
    return _uniform.cdfSync(x, lowerSupportBound, upperSupportBound, lowerTail);
  },
  quantileSync: function(x, lowerSupportBound, upperSupportBound, lowerTail = true):
    number {
    return _uniform.quantileSync(x, lowerSupportBound, upperSupportBound, lowerTail);
  },
  randomSync: function(n, lowerSupportBound, upperSupportBound, seed?: number | string):
    number[] {
    return _uniform.randomSync(n, lowerSupportBound, upperSupportBound, seed);
  }
};

export const normal = {
  pdf: function(x, mu?, sigma?): Promise<number> {
    return _normal.pdf(x, mu, sigma);
  },
  cdf: function(x, mu?, sigma?, lowerTail = true): Promise<number> {
    return _normal.cdf(x, mu, sigma, lowerTail);
  },
  quantile: function(p, mu?, sigma?, lowerTail = true): Promise<number> {
    return _normal.quantile(p, mu, sigma, lowerTail);
  },
  random: function(n, mu?, sigma?, seed?: number | string): Promise<number[]> {
    return _normal.random(n, mu, sigma, seed);
  },
  pdfSync: function(x, mu?, sigma?): number {
    return _normal.pdfSync(x, mu, sigma);
  },
  cdfSync: function(x, mu?, sigma?, lowerTail = true): number {
    return _normal.cdfSync(x, mu, sigma, lowerTail);
  },
  quantileSync: function(p, mu?, sigma?, lowerTail = true): number {
    return _normal.quantileSync(p, mu, sigma, lowerTail);
  },
  randomSync: function(n, mu?, sigma?, seed?: number | string): number[] {
    return _normal.randomSync(n, mu, sigma, seed);
  },
};

export const t = {
  pdf: function(x, degreesOfFreedom): Promise<number> {
    return studentsT.pdf(x, degreesOfFreedom);
  },
  cdf: function(x, degreesOfFreedom, lowerTail = true): Promise<number> {
    return studentsT.cdf(x, degreesOfFreedom, lowerTail);
  },
  quantile: function(p, degreesOfFreedom, lowerTail = true): Promise<number> {
    return studentsT.quantile(p, degreesOfFreedom, lowerTail);
  },
  random: function(n, degreesOfFreedom, seed?: number | string): Promise<number[]> {
    return studentsT.random(n, degreesOfFreedom, seed);
  },
  pdfSync: function(x, degreesOfFreedom): number {
    return studentsT.pdfSync(x, degreesOfFreedom);
  },
  cdfSync: function(x, degreesOfFreedom, lowerTail = true): number {
    return studentsT.cdfSync(x, degreesOfFreedom, lowerTail);
  },
  quantileSync: function(p, degreesOfFreedom, lowerTail = true): number {
    return studentsT.quantileSync(p, degreesOfFreedom, lowerTail);
  },
  randomSync: function(n, degreesOfFreedom, seed?: number | string): number[] {
    return studentsT.randomSync(n, degreesOfFreedom, seed);
  }
};

export const chi2 = {
  pdf: function(x, degreesOfFreedom): Promise<number> {
    return chiSquared.pdf(x, degreesOfFreedom);
  },
  cdf: function(x, degreesOfFreedom, lowerTail = true): Promise<number> {
    return chiSquared.cdf(x, degreesOfFreedom, lowerTail);
  },
  quantile: function(p, degreesOfFreedom, lowerTail = true): Promise<number> {
    return chiSquared.quantile(p, degreesOfFreedom, lowerTail);
  },
  random: function(n, degreesOfFreedom, seed?: number | string): Promise<number[]> {
    return chiSquared.random(n, degreesOfFreedom, seed);
  },
  pdfSync: function(x, degreesOfFreedom): number {
    return chiSquared.pdfSync(x, degreesOfFreedom);
  },
  cdfSync: function(x, degreesOfFreedom, lowerTail = true): number {
    return chiSquared.cdfSync(x, degreesOfFreedom, lowerTail);
  },
  quantileSync: function(p, degreesOfFreedom, lowerTail = true): number {
    return chiSquared.quantileSync(p, degreesOfFreedom, lowerTail);
  },
  randomSync: function(n, degreesOfFreedom, seed?: number | string): number[] {
    return chiSquared.randomSync(n, degreesOfFreedom, seed);
  }
};

export const F = {
  pdf: function(x, dof1, dof2): Promise<number> {
    return fDist.pdf(x, dof1, dof2);
  },
  cdf: function(x, dof1, dof2, lowerTail = true): Promise<number> {
    return fDist.cdf(x, dof1, dof2, lowerTail);
  },
  quantile: function(p, dof1, dof2, lowerTail = true): Promise<number> {
    return fDist.quantile(p, dof1, dof2, lowerTail);
  },
  random: function(n, dof1, dof2, seed?: number | string): Promise<number[]> {
    return fDist.random(n, dof1, dof2, seed);
  },
  pdfSync: function(x, dof1, dof2): number {
    return fDist.pdfSync(x, dof1, dof2);
  },
  cdfSync: function(x, dof1, dof2, lowerTail = true): number {
    return fDist.cdfSync(x, dof1, dof2, lowerTail);
  },
  quantileSync: function(p, dof1, dof2, lowerTail = true): number {
    return fDist.quantileSync(p, dof1, dof2, lowerTail);
  },
  randomSync: function(n, dof1, dof2, seed?: number | string): number[] {
    return fDist.randomSync(n, dof1, dof2, seed);
  }
};

export const exponential = {
  pdf: function(x, lambda): Promise<number> {
    return exp.pdf(x, lambda);
  },
  cdf: function(x, lambda, lowerTail = true): Promise<number> {
    return exp.cdf(x, lambda, lowerTail);
  },
  quantile: function(p, lambda, lowerTail = true): Promise<number> {
    return exp.quantile(p, lambda, lowerTail);
  },
  random: function(n, lambda, seed?: number | string): Promise<number[]> {
    return exp.random(n, lambda, seed);
  },
  pdfSync: function(x, lambda): number {
    return exp.pdfSync(x, lambda);
  },
  cdfSync: function(x, lambda, lowerTail = true): number {
    return exp.cdfSync(x, lambda, lowerTail);
  },
  quantileSync: function(p, lambda, lowerTail = true): number {
    return exp.quantileSync(p, lambda, lowerTail);
  },
  randomSync: function(n, lambda, seed?: number | string): number[] {
    return exp.randomSync(n, lambda, seed);
  }
};

export const gamma = {
  pdf: function(x, shape, scale): Promise<number> {
    return _gamma.pdf(x, shape, scale);
  },
  cdf: function(x, shape, scale, lowerTail = true): Promise<number> {
    return _gamma.cdf(x, shape, scale, lowerTail);
  },
  quantile: function(p, shape, scale, lowerTail = true): Promise<number> {
    return _gamma.quantile(p, shape, scale, lowerTail);
  },
  random: function(n, shape, scale, seed?: number | string): Promise<number[]> {
    return _gamma.random(n, shape, scale, seed);
  },
  pdfSync: function(x, shape, scale): number {
    return _gamma.pdfSync(x, shape, scale);
  },
  cdfSync: function(x, shape, scale, lowerTail = true): number {
    return _gamma.cdfSync(x, shape, scale, lowerTail);
  },
  quantileSync: function(p, shape, scale, lowerTail = true): number {
    return _gamma.quantileSync(p, shape, scale, lowerTail);
  },
  randomSync: function(n, shape, scale, seed?: number | string): number[] {
    return _gamma.randomSync(n, shape, scale, seed);
  }
};

export const beta = {
  pdf: function(x, alpha, beta): Promise<number> {
    return _beta.pdf(x, alpha, beta);
  },
  cdf: function(x, alpha, beta, lowerTail = true): Promise<number> {
    return _beta.cdf(x, alpha, beta, lowerTail);
  },
  quantile: function(x, alpha, beta, lowerTail = true): Promise<number> {
    return _beta.quantile(x, alpha, beta, lowerTail);
  },
  random: function(n, alpha, beta, seed?: number | string): Promise<number[]> {
    return _beta.random(n, alpha, beta, seed);
  },
  pdfSync: function(x, alpha, beta): number {
    return _beta.pdfSync(x, alpha, beta);
  },
  cdfSync: function(x, alpha, beta, lowerTail = true): number {
    return _beta.cdfSync(x, alpha, beta, lowerTail);
  },
  quantileSync: function(x, alpha, beta, lowerTail = true): number {
    return _beta.quantileSync(x, alpha, beta, lowerTail);
  },
  randomSync: function(n, alpha, beta, seed?: number | string): number[] {
    return _beta.randomSync(n, alpha, beta, seed);
  }
};

export const binomial = {
  pdf: function(k, trials, probSuccess): Promise<number> {
    return binom.pmf(k, trials, probSuccess);
  },
  cdf: function(k, trials, probSuccess, lowerTail = true): Promise<number> {
    return binom.cdf(k, trials, probSuccess, lowerTail);
  },
  quantile: function(p, trials, probSuccess, lowerTail = true): Promise<number> {
    return binom.quantile(p, trials, probSuccess, lowerTail);
  },
  random: function(n, trials, probSuccess, seed?: number | string): Promise<number[]> {
    return binom.random(n, trials, probSuccess, seed);
  },
  pdfSync: function(k, trials, probSuccess): number {
    return binom.pmfSync(k, trials, probSuccess);
  },
  cdfSync: function(k, trials, probSuccess, lowerTail = true): number {
    return binom.cdfSync(k, trials, probSuccess, lowerTail);
  },
  quantileSync: function(p, trials, probSuccess, lowerTail = true): number {
    return binom.quantileSync(p, trials, probSuccess, lowerTail);
  },
  randomSync: function(n, trials, probSuccess, seed?: number | string): number[] {
    return binom.randomSync(n, trials, probSuccess, seed);
  }
};

export const poisson = {
  pdf: function(k, lambda): Promise<number> {
    return _poisson.pmf(k, lambda);
  },
  cdf: function(k, lambda, lowerTail = true): Promise<number> {
    return _poisson.cdf(k, lambda, lowerTail);
  },
  quantile: function(p, lambda, lowerTail = true): Promise<number> {
    return _poisson.quantile(p, lambda, lowerTail);
  },
  random: function(n, lambda, seed?: number | string): Promise<number[]> {
    return _poisson.random(n, lambda, seed);
  },
  pdfSync: function(k, lambda): number {
    return _poisson.pmfSync(k, lambda);
  },
  cdfSync: function(k, lambda, lowerTail = true): number {
    return _poisson.cdfSync(k, lambda, lowerTail);
  },
  quantileSync: function(p, lambda, lowerTail = true): number {
    return _poisson.quantileSync(p, lambda, lowerTail);
  },
  randomSync: function(n, lambda, seed?: number | string): number[] {
    return _poisson.randomSync(n, lambda, seed);
  }
};

export const hypergeometric = {
  pdf: function(sampleSuccesses, draws, successPop, totalPop): Promise<number> {
    return hypergeo.pmf(sampleSuccesses, draws, successPop, totalPop);
  },
  cdf: function(sampleSuccesses, draws, successPop, totalPop, lowerTail = true):
    Promise<number> {
    return hypergeo.cdf(sampleSuccesses, draws, successPop, totalPop, lowerTail);
  },
  quantile: function(p, draws, successPop, totalPop, lowerTail = true): Promise<number> {
    return hypergeo.quantile(p, draws, successPop, totalPop, lowerTail);
  },
  random: function(n, draws, successPop, totalPop, seed?: string | number):
    Promise<number[]> {
    return hypergeo.random(n, draws, successPop, totalPop, seed);
  },
  pdfSync: function(sampleSuccesses, draws, successPop, totalPop): number {
    return hypergeo.pmfSync(sampleSuccesses, draws, successPop, totalPop);
  },
  cdfSync: function(sampleSuccesses, draws, successPop, totalPop, lowerTail = true):
    number {
    return hypergeo.cdfSync(sampleSuccesses, draws, successPop, totalPop, lowerTail);
  },
  quantileSync: function(p, draws, successPop, totalPop, lowerTail = true): number {
    return hypergeo.quantileSync(p, draws, successPop, totalPop, lowerTail);
  },
  randomSync: function(n, draws, successPop, totalPop, seed?: string | number): number[] {
    return hypergeo.randomSync(n, draws, successPop, totalPop, seed);
  }
};


