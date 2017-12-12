import { IRandomIterableIterator, IRandomState } from "./random";
export declare class SkewNormalDist {
    private static checkParameters(functionName, location, scale, shape, x?, lowerTail?, p?, n?, seed?);
    static pdf(x: number, location?: number, scale?: number, shape?: number): number;
    static cdf(x: number, location?: number, scale?: number, shape?: number, lowerTail?: boolean): number;
    private static mean(location, scale, shape);
    private static variance(scale, shape);
    private static standard_deviation(scale, shape);
    private static skewness(shape);
    private static kurtosis_excess(shape);
    private static skew_normal_quantile_functor(location, scale, shape, p);
    static quantile(p: number, location?: number, scale?: number, shape?: number, lowerTail?: boolean): number;
    static random(n: number, location?: number, scale?: number, shape?: number, seed?: number | string | IRandomState): number[];
    static randomIterator(n: number, location?: number, scale?: number, shape?: number, seed?: number | string | IRandomState): IRandomIterableIterator;
}
