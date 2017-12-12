import { IRandomState, IRandomIterableIterator } from "./random";
export declare class GammaDist {
    private static checkParameters(functionName, shape, scale, x?, lowerTail?, p?, n?, seed?);
    static pdf(x: number, shape: number, scale: number): number;
    static cdf(x: number, shape: number, scale: number, lowerTail?: boolean): number;
    static quantile(p: number, shape: number, scale: number, lowerTail?: boolean): number;
    static random(n: number, shape: number, scale: number, seed?: number | string | IRandomState): number[];
    static randomIterator(n: number, shape: number, scale: number, seed?: number | string | IRandomState): IRandomIterableIterator;
}
