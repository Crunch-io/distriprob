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
    // return Math.exp(lnBinomialCoefficient(K, k) + lnBinomialCoefficient(N-K, n-k) -
    //   lnBinomialCoefficient(N, n));
    return Math.exp(lnFactorialFractionEval([K, n, N-K, N-n],[N, k, K-k, n-k, N-K-n+k]));
  }
}

export function pmf(sampleSuccesses, draws, successPop, totalPop) {
  function script(a, b, c, d) {
    return pmfSync(a, b, c, d);
  }

  return asyncGen([
    primesLessThanOrEqualTo,
    _factorialPrimes,
    factorialPrimes,
    lnFactorialFractionEval,
    pmfSync
  ], script, [sampleSuccesses, draws, successPop, totalPop]);
}

export function cdfSync(sampleSuccesses, draws, successPop, totalPop) {
  const k = sampleSuccesses;
  const n = draws;
  const K = successPop;
  const N = totalPop;
  let mean = n * (K/N);

  let easyCaseResult = _cdfSyncEasyCases(k, n, K, N);

  if (easyCaseResult !== null) {
    return easyCaseResult;
  } else {
    if (k <= mean) {
      let lnh0Eval = lnh0(n, K, N);

      return _cdfSyncHardCase(lnh0Eval, k, draws, successPop, totalPop);
    } else {
      let lnhMaxEval = lnhMax(n, K, N);

      return _cdfSyncHardCase(lnhMaxEval, k, draws, successPop, totalPop);
    }
  }
}

export function cdf(sampleSuccesses, draws, successPop, totalPop) {
  function script(a, b, c, d) {
    return cdfSync(a, b, c, d);
  }

  return asyncGen([
    primesLessThanOrEqualTo,
    _factorialPrimes,
    factorialPrimes,
    lnFactorialFractionEval,
    _cdfSyncEasyCases,
    _cdfSyncHardCase,
    lnh0,
    lnhMax,
    cdfSync
  ], script, [sampleSuccesses, draws, successPop, totalPop]);
}

function _cdfSyncEasyCases(k, n, K, N) {
  if (N === 0 || K === 0 || n === 0) {
    if (k >= 0) {
      return 1;
    } else {
      return 0;
    }
  } else if ( N === K) {
    if (k >= n) {
      return 1;
    } else {
      return 0;
    }
  } else if (N === n) {
    if (k >= K) {
      return 1;
    } else {
      return 0;
    }
  } else if (k >= K || k >= n) {
    return 1;
  } else if ( k < 0 || k < (n + K - N)) {
    return 0;
  } else {
    return null;
  }
}

function _cdfSyncHardCase(lnhEval, k, n, K, N) {
  let sum = 0;
  let current = lnhEval;
  let mean = n * (K/N);

  if (k <= mean) {
    for (let i=0; i <= k; i++) {
      sum += Math.exp(current);
      current = Math.log(((K-i)*(n-i))/((i+1)*(N-K-n+i+1))) + current;
    }

    return sum;
  } else {
    for (let i=Math.min(n, K); i > k; i--) {
      sum += Math.exp(current);
      current = Math.log((i*(N-K-n+i))/((K-i+1)*(n-i+1))) + current;
    }

    return 1 - sum;
  }
}

export function quantileSync(p, draws, successPop, totalPop){
  let lnh0Eval: number | null = null;
  let lnhMaxEval: number | null = null;
  let mean = draws * (successPop/totalPop);

  function simplifiedCDF(val) {
    let easyCaseResult = _cdfSyncEasyCases(val, draws, successPop, totalPop);

    if (easyCaseResult !== null) {
      return easyCaseResult;
    } else {
      if (val <= mean) {
        lnh0Eval = lnh0Eval === null ? lnh0(draws, successPop, totalPop) : lnh0Eval;

        return _cdfSyncHardCase(lnh0Eval, val, draws, successPop, totalPop);
      } else {
        lnhMaxEval = lnhMaxEval === null ? lnhMax(draws, successPop, totalPop):lnhMaxEval;

        return _cdfSyncHardCase(lnhMaxEval, val, draws, successPop, totalPop);
      }
    }
  }

  const max = Math.min(successPop, draws);
  const min = Math.max(0, draws + successPop - totalPop);

  return discreteQuantileFind(simplifiedCDF, p, null, null, Math.floor(mean));
}

export function quantile(p, draws, successPop, totalPop) {
  function script(a, b, c, d) {
    return quantileSync(a, b, c, d);
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
  ], script, [p, draws, successPop, totalPop]);
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

