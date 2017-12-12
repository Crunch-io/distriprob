import { IRandomState, IRandomIterableIterator } from "./random";
export declare class BetaDist {
    private static checkParameters(functionName, alpha, beta, ncp, x?, lowerTail?, p?, n?, seed?);
    static pdf(x: number, alpha: number, beta: number, ncp?: number): number;
    static cdf(x: number, alpha: number, beta: number, lowerTail?: boolean, ncp?: number): number;
    static quantile(p: number, alpha: number, beta: number, lowerTail?: boolean, ncp?: number): number;
    static random(n: number, alpha: number, beta: number, ncp?: number, seed?: number | string | IRandomState): number[];
    static randomIterator(n: number, alpha: number, beta: number, ncp?: number, seed?: number | string | IRandomState): IRandomIterableIterator;
}
