"use strict";
import {asyncGen} from "./async";
import * as rf from "./rootFind";
import * as pf from "./primeFactors";

const discreteQuantileFind = rf.discreteQuantileFind;
const lnFactorialFractionEval = pf.lnFactorialFractionEval;
const primesLessThanOrEqualTo = pf.primesLessThanOrEqualTo;
const _factorialPrimes = pf._factorialPrimes;
const factorialPrimes = pf.factorialPrimes;

export function pmfSync(sampleSuccesses, draws, successPop, totalPop) {
  const k = sampleSuccesses;
  const n = draws;
  const K = successPop;
  const N = totalPop;

  if (N === 0 || K === 0 || n === 0) {
    if (k === 0) {
      return 1;
    } else {
      return 0;
    }
  } else if (N === K) {
    if (k === n) {
      return 1;
    } else {
      return 0;
    }
  } else if (N === n) {
    if (k === K) {
      return 1;
    } else {
      return 0;
    }
  } else if (k < 0 || k < (n + K - N) || k > K || k > n) {
    return 0;
  } else if (K === k) {
    if (n === k) {
      return Math.exp(lnFactorialFractionEval([N-K, n], [N]));
    } else {
      return Math.exp(lnFactorialFractionEval([N-K, n], [n-k, N]));
    }
  } else if (k === 0) {
    if (N - K - n === 0) {
      return Math.exp(lnFactorialFractionEval([N-K, N-n], [N]));
    } else {
      return Math.exp(lnFactorialFractionEval([N-K, N-n], [N-K-n, N]));
    }
  } else if ((N-K) === (n-k)) {
    return Math.exp(lnFactorialFractionEval([K, N-n, n], [K-k, k, N]));
  } else if (n === k) {
      return Math.exp(lnFactorialFractionEval([K, N-n], [K-n, N]));
  }else {
    return Math.exp(lnFactorialFractionEval([K, n, N-K, N-n],[N, k, K-k, n-k, N-K-n+k]));
  }
}

export function pmf(sampleSuccesses, draws, successPop, totalPop) {
  return asyncGen([
    primesLessThanOrEqualTo,
    _factorialPrimes,
    factorialPrimes,
    lnFactorialFractionEval
  ], pmfSync, [sampleSuccesses, draws, successPop, totalPop]);
}

export function cdfSync(sampleSuccesses, draws, successPop, totalPop, lowerTail = true) {
  const k = sampleSuccesses;
  const n = draws;
  const K = successPop;
  const N = totalPop;
  let mean = n * (K/N);

  let easyCaseResult = _cdfSyncEasyCases(k, n, K, N, lowerTail);

  if (easyCaseResult !== null) {
    return easyCaseResult;
  } else {
    if (k <= mean) {
      const lnh0Eval = lnh0(n, K, N);

      return _cdfSyncHardCase(lnh0Eval, k, draws, successPop, totalPop, lowerTail);
    } else {
      const lnhMaxEval = lnhMax(n, K, N);

      return _cdfSyncHardCase(lnhMaxEval, k, draws, successPop, totalPop, lowerTail);
    }
  }
}

export function cdf(sampleSuccesses, draws, successPop, totalPop, lowerTail = true) {
  return asyncGen([
    primesLessThanOrEqualTo,
    _factorialPrimes,
    factorialPrimes,
    lnFactorialFractionEval,
    _cdfSyncEasyCases,
    _cdfSyncHardCase,
    lnh0,
    lnhMax
  ], cdfSync, [sampleSuccesses, draws, successPop, totalPop, lowerTail]);
}

function _cdfSyncEasyCases(k, n, K, N, lowerTail) {
  if (N === 0 || K === 0 || n === 0) {
    if (k >= 0) {
      if (lowerTail) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (lowerTail) {
        return 0;
      } else {
        return 1;
      }
    }
  } else if ( N === K) {
    if (k >= n) {
      if (lowerTail) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (lowerTail) {
        return 0;
      } else {
        return 1;
      }
    }
  } else if (N === n) {
    if (k >= K) {
      if (lowerTail) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (lowerTail) {
        return 0;
      } else {
        return 1;
      }
    }
  } else if (k >= K || k >= n) {
    if (lowerTail) {
      return 1;
    } else {
      return 0;
    }
  } else if ( k < 0 || k < (n + K - N)) {
    if (lowerTail) {
      return 0;
    } else {
      return 1;
    }
  } else {
    return null;
  }
}

function _cdfSyncHardCase(lnhEval, k, n, K, N, lowerTail) {
  let sum = 0;
  let current = lnhEval;
  let mean = n * (K/N);

  if (k <= mean) {
    for (let i=0; i <= k; i++) {
      sum += Math.exp(current);
      current = Math.log(((K-i)*(n-i))/((i+1)*(N-K-n+i+1))) + current;
    }

    if (lowerTail) {
      return sum;
    } else {
      return 1 - sum;
    }
  } else {
    for (let i=Math.min(n, K); i > k; i--) {
      sum += Math.exp(current);
      current = Math.log((i*(N-K-n+i))/((K-i+1)*(n-i+1))) + current;
    }

    if (lowerTail) {
      return 1 - sum;
    } else {
      return sum;
    }
  }
}

export function quantileSync(p, draws, successPop, totalPop, lowerTail = true, lnh0Eval?, lnhMaxEval?){
  let h0log = lnh0Eval;
  let hMaxlog = lnhMaxEval;
  let mean = draws * (successPop/totalPop);

  function simplifiedCDF(val) {
    let easyCaseResult = _cdfSyncEasyCases(val, draws, successPop, totalPop, lowerTail);

    if (easyCaseResult !== null) {
      return easyCaseResult;
    } else {
      if (val <= mean) {
        h0log = !h0log ? lnh0(draws, successPop, totalPop) : h0log;

        return _cdfSyncHardCase(h0log, val, draws, successPop, totalPop, lowerTail);
      } else {
        hMaxlog = !hMaxlog ? lnhMax(draws, successPop, totalPop) : hMaxlog;

        return _cdfSyncHardCase(hMaxlog, val, draws, successPop, totalPop, lowerTail);
      }
    }
  }

  const max = Math.min(successPop, draws);
  const min = Math.max(0, draws + successPop - totalPop);

  if (p === 0) {
    if (lowerTail) {
      return min;
    } else {
      return max;
    }
  } else if (p === 1) {
    if (lowerTail) {
      return max;
    } else {
      return min;
    }
  } else {
    return discreteQuantileFind(simplifiedCDF, p, max, min, Math.floor(mean),lowerTail);
  }
}

export function quantile(p, draws, successPop, totalPop, lowerTail = true) {
  return asyncGen([
    discreteQuantileFind,
    primesLessThanOrEqualTo,
    _factorialPrimes,
    factorialPrimes,
    lnFactorialFractionEval,
    _cdfSyncEasyCases,
    _cdfSyncHardCase,
    lnh0,
    lnhMax
  ], quantileSync, [p, draws, successPop, totalPop, lowerTail]);
}

function lnh0(draws, successPop, totalPop) {
  const n = draws;
  const K = successPop;
  const N = totalPop;

  return lnFactorialFractionEval([N-K, N-n], [N, N-K-n]);
}

function lnhMax(draws, successPop, totalPop){
  const n = draws;
  const K = successPop;
  const N = totalPop;
  const max = Math.min(n, K);

  return lnFactorialFractionEval([K, N-max], [N, K-max]);
}

export function randomSync(n, draws, successPop, totalPop, seed?: string | number, randoms?) {
  // these two below are the heavy calculations for the distribution, so just do them once
  const lnh0Eval = lnh0(draws, successPop, totalPop);
  const lnhMaxEval = lnhMax(draws, successPop, totalPop);

  if (!randoms) {
    randoms = [];
    const sr = require("../../node_modules/seedrandom/seedrandom.min");
    let rng;
    if (seed) {
      rng = sr(seed);
    } else {
      rng = sr();
    }

    while (randoms.length < n) {
      let rand = rng();

      if (rand !== 0) {
        randoms.push(rng());
      }
    }
  }

  const result: any[] = [];

  while (randoms.length > 0) {
    result.push(
      quantileSync(randoms.pop(), draws, successPop, totalPop, true, lnh0Eval, lnhMaxEval)
    );
  }

  return result;
}

export function random(n, draws, successPop, totalPop, seed?: string | number) {
  const randoms: any = [];
  const sr = require("../../node_modules/seedrandom/seedrandom.min");
  let rng;
  if (seed) {
    rng = sr(seed);
  } else {
    rng = sr();
  }

  while (randoms.length < n) {
    let rand = rng();

    if (rand !== 0) {
      randoms.push(rng());
    }
  }

  return asyncGen([
    discreteQuantileFind,
    primesLessThanOrEqualTo,
    _factorialPrimes,
    factorialPrimes,
    lnFactorialFractionEval,
    _cdfSyncEasyCases,
    _cdfSyncHardCase,
    lnh0,
    lnhMax,
    quantileSync
  ], randomSync, [n, draws, successPop, totalPop, null, randoms]);
}