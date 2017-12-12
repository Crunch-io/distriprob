export declare class GenericQuantile {
    private static check_range_result(x);
    static generic_quantile(cdfRootFunctor: (x: number) => number, p: number, guess: number, comp: boolean, distRangeMin: number, distRangeMax: number): number;
}
