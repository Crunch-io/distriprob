import { IRandomState, IRandomIterableIterator } from "./random";
export declare class NegativeBinomialDist {
    private static checkParameters(functionName, numSuccesses, probSuccess, numFailures?, lowerTail?, p?, n?, seed?);
    static pdf(numFailures: number, numSuccesses: number, probSuccess: number): number;
    static cdf(numFailures: number, numSuccesses: number, probSuccess: number, lowerTail?: boolean): number;
    static quantile(p: number, numSuccesses: number, probSuccess: number, lowerTail?: boolean): number;
    static random(n: number, numSuccesses: number, probSuccess: number, seed?: number | string | IRandomState): number[];
    static randomIterator(n: number, numSuccesses: number, probSuccess: number, seed?: number | string | IRandomState): IRandomIterableIterator;
}
