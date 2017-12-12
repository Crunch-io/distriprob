import { IRandomState, IRandomIterableIterator } from "./random";
export declare class StudentsTDist {
    private static checkParameters(functionName, degreesOfFreedom, ncp, x?, lowerTail?, p?, n?, seed?);
    static pdf(x: number, degreesOfFreedom: number, ncp?: number): number;
    static cdf(x: number, degreesOfFreedom: number, lowerTail?: boolean, ncp?: number): number;
    static quantile(p: number, degreesOfFreedom: number, lowerTail?: boolean, ncp?: number): number;
    static random(n: number, degreesOfFreedom: number, ncp?: number, seed?: number | string | IRandomState): number[];
    static randomIterator(n: number, degreesOfFreedom: number, ncp?: number, seed?: number | string | IRandomState): IRandomIterableIterator;
}
