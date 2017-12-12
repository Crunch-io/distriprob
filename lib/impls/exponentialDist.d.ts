import { IRandomIterableIterator, IRandomState } from "./random";
export declare class ExponentialDist {
    private static checkParameters(functionName, lambda, x?, lowerTail?, p?, n?, seed?);
    static pdf(x: number, lambda: number): number;
    static cdf(x: number, lambda: number, lowerTail?: boolean): number;
    static quantile(p: number, lambda: number, lowerTail?: boolean): number;
    static random(n: number, lambda: number, seed?: number | string | IRandomState): number[];
    static randomIterator(n: number, lambda: number, seed?: number | string | IRandomState): IRandomIterableIterator;
}
