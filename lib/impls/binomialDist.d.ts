import { IRandomState, IRandomIterableIterator } from "./random";
export declare class BinomialDist {
    private static checkParameters(functionName, trials, probSuccess, k?, lowerTail?, p?, n?, seed?);
    static pdf(k: number, trials: number, probSuccess: number): number;
    static cdf(k: number, trials: number, probSuccess: number, lowerTail?: boolean): number;
    static quantile(p: number, trials: number, probSuccess: number, lowerTail?: boolean): number;
    static random(n: number, trials: number, probSuccess: number, seed?: number | string | IRandomState): number[];
    static randomIterator(n: number, trials: number, probSuccess: number, seed?: number | string | IRandomState): IRandomIterableIterator;
    private static inverse_binomial_cornish_fisher(n, sf, p, q);
}
