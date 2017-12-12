import { IRandomState, IRandomIterableIterator } from "./random";
import { Cache } from "./cache";
export declare class HypergeometricDist {
    private cache;
    constructor(cache: Cache);
    private static checkParameters(functionName, draws, successPop, totalPop, sampleSuccesses?, lowerTail?, p?, n?, seed?);
    pdf(sampleSuccesses: number, draws: number, successPop: number, totalPop: number): number;
    cdf(sampleSuccesses: number, draws: number, successPop: number, totalPop: number, lowerTail?: boolean, primes?: number[]): number;
    quantile(p: number, draws: number, successPop: number, totalPop: number, lowerTail?: boolean, primes?: number[]): number;
    random(n: number, draws: number, successPop: number, totalPop: number, seed?: number | string | IRandomState): number[];
    randomIterator(n: number, draws: number, successPop: number, totalPop: number, seed?: number | string | IRandomState, primes?: number[]): IRandomIterableIterator;
}
