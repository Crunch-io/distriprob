"use strict";

/**
 * Created by zacharymartin on August 13, 2016.
 */
import * as _normal from "./impls/normal";
import * as studentsT from "./impls/studentsT";

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