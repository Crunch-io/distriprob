"use strict";

import * as _normal from "./impls/normal";
import * as studentsT from "./impls/studentsT";
import * as chiSquared from "./impls/chiSquared";
import * as fDist from "./impls/fDist";
import * as binom from "./impls/binomial";
import * as _poisson from "./impls/poisson";
import * as hypergeo from "./impls/hypergeometric";
import * as _gamma from "./impls/gamma";

export const normal = {
  pdf: function(x, mu?, sigma?): Promise<number> {
    return _normal.pdf(x, mu, sigma);
  },
  cdf: function(x, mu?, sigma?): Promise<number> {
    return _normal.cdf(x, mu, sigma);
  },
  quantile: function(p, mu?, sigma?): Promise<number> {
    return _normal.quantile(p, mu, sigma);
  },
  pdfSync: function(x, mu?, sigma?): number {
    return _normal.pdfSync(x, mu, sigma);
  },
  cdfSync: function(x, mu?, sigma?): number {
    return _normal.cdfSync(x, mu, sigma);
  },
  quantileSync: function(p, mu?, sigma?): number {
    return _normal.quantileSync(p, mu, sigma);
  }
};

export const t = {
  pdf: function(x, degreesOfFreedom): Promise<number> {
    return studentsT.pdf(x, degreesOfFreedom);
  },
  cdf: function(x, degreesOfFreedom): Promise<number> {
    return studentsT.cdf(x, degreesOfFreedom);
  },
  quantile: function(p, degreesOfFreedom): Promise<number> {
    return studentsT.quantile(p, degreesOfFreedom);
  },
  pdfSync: function(x, degreesOfFreedom): number {
    return studentsT.pdfSync(x, degreesOfFreedom);
  },
  cdfSync: function(x, degreesOfFreedom): number {
    return studentsT.cdfSync(x, degreesOfFreedom);
  },
  quantileSync: function(p, degreesOfFreedom): number {
    return studentsT.quantileSync(p, degreesOfFreedom);
  }
};

export const chi2 = {
  pdf: function(x, degreesOfFreedom): Promise<number> {
    return chiSquared.pdf(x, degreesOfFreedom);
  },
  cdf: function(x, degreesOfFreedom): Promise<number> {
    return chiSquared.cdf(x, degreesOfFreedom);
  },
  quantile: function(p, degreesOfFreedom): Promise<number> {
    return chiSquared.quantile(p, degreesOfFreedom);
  },
  pdfSync: function(x, degreesOfFreedom): number {
    return chiSquared.pdfSync(x, degreesOfFreedom);
  },
  cdfSync: function(x, degreesOfFreedom): number {
    return chiSquared.cdfSync(x, degreesOfFreedom);
  },
  quantileSync: function(p, degreesOfFreedom): number {
    return chiSquared.quantileSync(p, degreesOfFreedom);
  }
};

export const F = {
  pdf: function(x, dof1, dof2): Promise<number> {
    return fDist.pdf(x, dof1, dof2);
  },
  cdf: function(x, dof1, dof2): Promise<number> {
    return fDist.cdf(x, dof1, dof2);
  },
  quantile: function(p, dof1, dof2): Promise<number> {
    return fDist.quantile(p, dof1, dof2);
  },
  pdfSync: function(x, dof1, dof2): number {
    return fDist.pdfSync(x, dof1, dof2);
  },
  cdfSync: function(x, dof1, dof2): number {
    return fDist.cdfSync(x, dof1, dof2);
  },
  quantileSync: function(p, dof1, dof2): number {
    return fDist.quantileSync(p, dof1, dof2);
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
  pdfSync: function(x, shape, scale): number {
    return _gamma.pdfSync(x, shape, scale);
  },
  cdfSync: function(x, shape, scale, lowerTail = true): number {
    return _gamma.cdfSync(x, shape, scale, lowerTail);
  },
  quantileSync: function(p, shape, scale, lowerTail = true): number {
    return _gamma.quantileSync(p, shape, scale, lowerTail);
  }
};

export const binomial = {
  pdf: function(k, n, probSuccess): Promise<number> {
    return binom.pmf(k, n, probSuccess);
  },
  cdf: function(k, n, probSuccess): Promise<number> {
    return binom.cdf(k, n, probSuccess);
  },
  quantile: function(p, n, probSuccess): Promise<number> {
    return binom.quantile(p, n, probSuccess);
  },
  pdfSync: function(k, n, probSuccess): number {
    return binom.pmfSync(k, n, probSuccess);
  },
  cdfSync: function(k, n, probSuccess): number {
    return binom.cdfSync(k, n, probSuccess);
  },
  quantileSync: function(p, n, probSuccess): number {
    return binom.quantileSync(p, n, probSuccess);
  }
};

export const poisson = {
  pdf: function(k, lambda): Promise<number> {
    return _poisson.pmf(k, lambda);
  },
  cdf: function(k, lambda): Promise<number> {
    return _poisson.cdf(k, lambda);
  },
  quantile: function(p, lambda): Promise<number> {
    return _poisson.quantile(p, lambda);
  },
  pdfSync: function(k, lambda): number {
    return _poisson.pmfSync(k, lambda);
  },
  cdfSync: function(k, lambda): number {
    return _poisson.cdfSync(k, lambda);
  },
  quantileSync: function(p, lambda): number {
    return _poisson.quantileSync(p, lambda);
  }
};

export const hypergeometric = {
  pdf: function(sampleSuccesses, draws, successPop, totalPop): Promise<number> {
    return hypergeo.pmf(sampleSuccesses, draws, successPop, totalPop);
  },
  cdf: function(sampleSuccesses, draws, successPop, totalPop): Promise<number> {
    return hypergeo.cdf(sampleSuccesses, draws, successPop, totalPop);
  },
  quantile: function(p, draws, successPop, totalPop): Promise<number> {
    return hypergeo.quantile(p, draws, successPop, totalPop);
  },
  pdfSync: function(sampleSuccesses, draws, successPop, totalPop): number {
    return hypergeo.pmfSync(sampleSuccesses, draws, successPop, totalPop);
  },
  cdfSync: function(sampleSuccesses, draws, successPop, totalPop): number {
    return hypergeo.cdfSync(sampleSuccesses, draws, successPop, totalPop);
  },
  quantileSync: function(p, draws, successPop, totalPop): number {
    return hypergeo.quantileSync(p, draws, successPop, totalPop);
  }
};


