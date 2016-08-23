"use strict";

/**
 * Created by zacharymartin on August 23, 2016.
 */

export function pdfSync(x, lowerSupportBound, upperSupportBound) {
  if (x < lowerSupportBound || x > upperSupportBound) {
    return 0;
  } else {
    return 1 / (upperSupportBound - lowerSupportBound);
  }
}

export function pdf(x, lowerSupportBound, upperSupportBound) {
  return Promise.resolve(pdfSync(x, lowerSupportBound, upperSupportBound));
}

export function cdfSync(x, lowerSupportBound, upperSupportBound, lowerTail = true) {
  if (x < lowerSupportBound) {
    if (lowerTail) {
      return 0;
    } else {
      return 1;
    }
  } else if (x > upperSupportBound) {
    if (lowerTail) {
      return 1;
    } else {
      return 0;
    }
  } else {
    if (lowerTail) {
      return (x - lowerSupportBound) / (upperSupportBound - lowerSupportBound);
    } else {
      return (upperSupportBound - x) / (upperSupportBound - lowerSupportBound);
    }
  }
}

export function cdf(x, lowerSupportBound, upperSupportBound, lowerTail = true) {
  return Promise.resolve(cdfSync(x, lowerSupportBound, upperSupportBound, lowerTail));
}

export function quantileSync(p, lowerSupportBound, upperSupportBound, lowerTail = true) {
  if (p === 0) {
    if (lowerTail) {
      return lowerSupportBound;
    } else {
      return upperSupportBound;
    }
  } else if (p === 1) {
    if (lowerTail) {
      return upperSupportBound;
    } else {
      return lowerSupportBound;
    }
  } else {
    if (lowerTail) {
      return (p * (upperSupportBound - lowerSupportBound)) + lowerSupportBound;
    } else {
      return upperSupportBound - (p * (upperSupportBound - lowerSupportBound));
    }
  }
}

export function quantile(p, lowerSupportBound, upperSupportBound, lowerTail = true) {
  return Promise.resolve(
    quantileSync(p, lowerSupportBound, upperSupportBound, lowerTail)
  );
}