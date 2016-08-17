"use strict";

/**
 * Created by zacharymartin on August 13, 2016.
 */
import * as _normal from "./impls/normal";

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