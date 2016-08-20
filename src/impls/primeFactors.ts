"use strict";

export function primesLessThanOrEqualTo(n): number[] {
  if (n === 1) {
    return [1];
  } else {
    const isPrime: boolean[] = [];
    const sqrtN = Math.sqrt(n);
    let index;
    let jIndex;

    for (let i=2; i<=n; i++){
      isPrime.push(true);
    }

    for (let i=2; i<sqrtN; i++) {
      index = i - 2;
      if (isPrime[index]) {
        for (let j=i*i; j<=n; j += i) {
          jIndex = j -2;
          isPrime[jIndex] = false;
        }
      }
    }

    let result: number[] = [];

    for(let i=0; i<isPrime.length; i++){
      if (isPrime[i]){
        result.push(i+2);
      }
    }

    return result;
  }
}

export function _factorialPrimes(n) {
  if (n === 1) {
    return {};
  } else {
    const result: {[prime: number]: number} = {};
    const primesLessThanOrEqualToN = primesLessThanOrEqualTo(n);
    let pToi;

    for (let p of primesLessThanOrEqualToN){
      for (let i = 1; (pToi = Math.pow(p,i)) <= n; i++) {
        let bracketX = Math.floor(n/pToi);
        if (result[p]){
          result[p] += bracketX;
        } else {
          result[p] = bracketX;
        }
      }
    }

    return result;
  }
}

export function factorialPrimes(nOrArrayOfNs) {
  const result: {[prime: number]: number} = {};
  let current;
  const arrayOfNs = Array.isArray(nOrArrayOfNs) ? nOrArrayOfNs : [nOrArrayOfNs];

  for(let n of arrayOfNs) {
    current = _factorialPrimes(n);

    for (let p in current){
      if (result[p]){
        result[p] += current[p];
      } else {
        result[p] = current[p];
      }
    }
  }

  return result;
}

export function lnFactorialFractionEval(numFactArgs, denomFactArgs) {
  const numPrimeFactorization = factorialPrimes(numFactArgs);
  const denomPrimeFactorization = factorialPrimes(denomFactArgs);

  // cancel out prime factors common to both numerator and denominator
  for (let p in numPrimeFactorization) {
    if (p in denomPrimeFactorization) {
      if (numPrimeFactorization[p] === denomPrimeFactorization[p]) {
        numPrimeFactorization[p] = 0;
        denomPrimeFactorization[p] = 0;
      } else if (numPrimeFactorization[p] >= denomPrimeFactorization[p]) {
        numPrimeFactorization[p] -= denomPrimeFactorization[p];
        denomPrimeFactorization[p] = 0;
      } else {
        denomPrimeFactorization[p] -= numPrimeFactorization[p];
        numPrimeFactorization[p] = 0;
      }
    }
  }

  let lnResult = 0;

  for (let p in numPrimeFactorization) {
    for (let i=1; i<=numPrimeFactorization[p]; i++) {
      lnResult += Math.log(+p);
    }
  }
  for (let p in denomPrimeFactorization) {
    for (let i=1; i<= denomPrimeFactorization[p]; i++) {
      lnResult -= Math.log(+p);
    }
  }
  return lnResult;
}
