import { IRandomState, IRandomIterableIterator } from "./random";
export declare class NormalDist {
    private static checkParameters(functionName, mu?, sigma?, x?, lowerTail?, p?, n?, seed?);
    static pdf(x: number, mu?: number, sigma?: number): number;
    static cdf(x: number, mu?: number, sigma?: number, lowerTail?: boolean): number;
    static quantile(p: number, mu?: number, sigma?: number, lowerTail?: boolean): number;
    static random(n: any, mu?: any, sigma?: any, seed?: number | string): any;
    static randomIterator(n?: number, mu?: number, sigma?: number, seed?: number | string | IRandomState): IRandomIterableIterator;
}
