import { IRandomState, IRandomIterableIterator } from "./random";
export declare class UniformDist {
    private static checkParameters(functionName, lowerSupportBound, upperSupportBound, x?, lowerTail?, p?, n?, seed?);
    static pdf(x: number, lowerSupportBound: number, upperSupportBound: number): number;
    static cdf(x: number, lowerSupportBound: number, upperSupportBound: number, lowerTail?: boolean): number;
    static quantile(p: number, lowerSupportBound: number, upperSupportBound: number, lowerTail?: boolean): number;
    static random(n: number, lowerSupportBound: number, upperSupportBound: number, seed?: number | string | IRandomState): number[];
    static randomIterator(n: number, lowerSupportBound: number, upperSupportBound: number, seed?: number | string | IRandomState): IRandomIterableIterator;
}
