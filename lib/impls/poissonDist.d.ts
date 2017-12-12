import { IRandomState, IRandomIterableIterator } from "./random";
export declare class PoissonDist {
    private static checkParameters(functionName, lambda, k?, lowerTail?, p?, n?, seed?);
    static pdf(k: number, lambda: number): number;
    static cdf(k: number, lambda: number, lowerTail?: boolean): number;
    static quantile(p: number, lambda: number, lowerTail?: boolean): number;
    static random(n: any, lambda: any, seed?: number | string | IRandomState): number[];
    static randomIterator(n: any, lambda: any, seed?: number | string | IRandomState): IRandomIterableIterator;
}
