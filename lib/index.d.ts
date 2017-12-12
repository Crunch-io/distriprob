import { Laborer } from "./impls/Laborer";
export declare const airy: {
    ai: (x: number) => number;
    aiPrime: (x: number) => number;
    aiRoot: (m: number) => number;
    aiRootIter: (startIndex?: number, numRoots?: number | undefined) => any;
    bi: (x: number) => number;
    biPrime: (x: number) => number;
    biRoot: (m: number) => number;
    biRootIter: (startIndex?: number, numRoots?: number | undefined) => any;
};
export declare const bessel: {
    i: (v: number, x: number) => number;
    iPrime: (v: number, x: number) => number;
    j: (v: number, x: number) => number;
    jPrime: (v: number, x: number) => number;
    jRoot: (v: number, m: number) => number;
    jRootIter: (v: number, startIndex?: number, numRoots?: number | undefined) => any;
    k: (v: number, x: number) => number;
    kPrime: (v: number, x: number) => number;
    y: (v: number, x: number) => number;
    yPrime: (v: number, x: number) => number;
    yRoot: (v: number, m: number) => number;
    yRootIter: (v: number, startIndex?: number, numRoots?: number | undefined) => any;
    sphJ: (v: number, x: number) => number;
    sphJPrime: (v: number, x: number) => number;
    sphY: (v: number, x: number) => number;
    sphYPrime: (v: number, x: number) => number;
};
export declare const beta: {
    "function": (a: number, b: number) => number;
    incomplete: (a: number, b: number, x: number, lower?: boolean, regularized?: boolean) => number;
    incompleteInverse: (a: number, b: number, p: number, lower?: boolean) => number;
    incompleteInverseParameter: (otherParamVal: number, x: number, p: number, parameterToFind?: "B" | "A", lower?: boolean) => number;
    incompleteDerivative: (a: number, b: number, x: number) => number;
    pdf: (x: number, alpha: number, beta: number, ncp?: number) => number;
    cdf: (x: number, alpha: number, beta: number, lowerTail?: boolean, ncp?: number) => number;
    quantile: (x: number, alpha: number, beta: number, lowerTail?: boolean, ncp?: number) => number;
    random: (n: number, alpha: number, beta: number, ncp?: number, seed?: string | number | undefined) => number[];
};
export declare const binomial: {
    coefficient: (n: number, k: number) => number;
    pdf: (k: number, trials: number, probSuccess: number) => number;
    cdf: (k: number, trials: number, probSuccess: number, lowerTail?: boolean) => number;
    quantile: (p: number, trials: number, probSuccess: number, lowerTail?: boolean) => number;
    random: (n: number, trials: number, probSuccess: number, seed?: string | number | undefined) => number[];
};
export declare const chi2: {
    pdf: (x: number, degreesOfFreedom: number, ncp?: number) => number;
    cdf: (x: number, degreesOfFreedom: number, lowerTail?: boolean, ncp?: number) => number;
    quantile: (p: number, degreesOfFreedom: number, lowerTail?: boolean, ncp?: number) => number;
    random: (n: number, degreesOfFreedom: number, ncp?: number, seed?: string | number | undefined) => number[];
};
export declare const error: {
    "function": (z: number, complement?: boolean) => number;
    functionInverse: (p: number, complement?: boolean) => number;
};
export declare const exponential: {
    pdf: (x: number, lambda: number) => number;
    cdf: (x: number, lambda: number, lowerTail?: boolean) => number;
    quantile: (p: number, lambda: number, lowerTail?: boolean) => number;
    random: (n: number, lambda: number, seed?: string | number | undefined) => number[];
};
export declare const F: {
    pdf: (x: number, dof1: number, dof2: number, ncp?: number) => number;
    cdf: (x: number, dof1: number, dof2: number, lowerTail?: boolean, ncp?: number) => number;
    quantile: (p: number, dof1: number, dof2: number, lowerTail?: boolean, ncp?: number) => number;
    random: (n: number, dof1: number, dof2: number, ncp: number, seed?: string | number | undefined) => number[];
};
export declare const factorial: {
    value: (n: number) => number;
    double: (n: number) => number;
    rising: (x: number, n: number) => number;
    falling: (x: number, n: number) => number;
};
export declare const gamma: {
    "function": (z: number) => number;
    function1pm1: (dz: number) => number;
    functionRatio: (a: number, b: number) => number;
    functionDeltaRatio: (a: number, delta: number) => number;
    functionLog: (z: number) => number;
    di: (z: number) => number;
    tri: (z: number) => number;
    poly: (n: number, z: number) => number;
    incomplete: (a: number, z: number, lower?: boolean, regularized?: boolean) => number;
    incompletePrime: (a: number, z: number, lower?: boolean, regularized?: boolean) => number;
    incompleteInverse: (a: number, p: number, lower?: boolean) => number;
    incompleteInverseParameter: (z: number, p: number, lower?: boolean) => number;
    pdf: (x: number, shape: number, scale: number) => number;
    cdf: (x: number, shape: number, scale: number, lowerTail?: boolean) => number;
    quantile: (p: number, shape: number, scale: number, lowerTail?: boolean) => number;
    random: (n: number, shape: number, scale: number, seed?: string | number | undefined) => number[];
};
export declare const hypergeometric: {
    pdf: (sampleSuccesses: number, draws: number, successPop: number, totalPop: number) => number;
    cdf: (sampleSuccesses: number, draws: number, successPop: number, totalPop: number, lowerTail?: boolean) => number;
    quantile: (p: number, draws: number, successPop: number, totalPop: number, lowerTail?: boolean) => number;
    random: (n: number, draws: number, successPop: number, totalPop: number, seed?: string | number | undefined) => number[];
};
export declare const normal: {
    pdf: (x: number, mu?: number | undefined, sigma?: number | undefined) => number;
    cdf: (x: number, mu?: number | undefined, sigma?: number | undefined, lowerTail?: boolean) => number;
    quantile: (p: number, mu?: number | undefined, sigma?: number | undefined, lowerTail?: boolean) => number;
    random: (n: number, mu?: number | undefined, sigma?: number | undefined, seed?: string | number | undefined) => number[];
};
export declare const owensT: (h: number, a: number) => number;
export declare const poisson: {
    pdf: (k: number, lambda: number) => number;
    cdf: (k: number, lambda: number, lowerTail?: boolean) => number;
    quantile: (p: number, lambda: number, lowerTail?: boolean) => number;
    random: (n: number, lambda: number, seed?: string | number | undefined) => number[];
};
export declare const t: {
    pdf: (x: number, degreesOfFreedom: number, ncp?: number) => number;
    cdf: (x: number, degreesOfFreedom: number, lowerTail?: boolean, ncp?: number) => number;
    quantile: (p: number, degreesOfFreedom: number, lowerTail?: boolean, ncp?: number) => number;
    random: (n: number, degreesOfFreedom: number, ncp?: number, seed?: string | number | undefined) => number[];
};
export declare const uniform: {
    pdf: (x: number, lowerSupportBound: number, upperSupportBound: number) => number;
    cdf: (x: number, lowerSupportBound: number, upperSupportBound: number, lowerTail?: boolean) => number;
    quantile: (x: number, lowerSupportBound: number, upperSupportBound: number, lowerTail?: boolean) => number;
    random: (n: number, lowerSupportBound: number, upperSupportBound: number, seed?: string | number | undefined) => number[];
};
export declare const worker: (config?: {
    maxPrimesTable?: number | undefined;
} | undefined) => Laborer;
export declare const zeta: (s: number) => number;
