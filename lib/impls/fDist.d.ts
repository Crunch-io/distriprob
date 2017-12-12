import { IRandomState, IRandomIterableIterator } from "./random";
export declare class FDist {
    private static checkParameters(functionName, dof1, dof2, ncp, x?, lowerTail?, p?, n?, seed?);
    static pdf(x: number, dof1: number, dof2: number, ncp?: number): number;
    static cdf(x: number, dof1: number, dof2: number, lowerTail?: boolean, ncp?: number): number;
    static quantile(p: number, dof1: number, dof2: number, lowerTail?: boolean, ncp?: number): number;
    static random(n: number, dof1: number, dof2: number, ncp?: number, seed?: number | string | IRandomState): number[];
    static randomIterator(n: number, dof1: number, dof2: number, ncp?: number, seed?: number | string | IRandomState): IRandomIterableIterator;
}
