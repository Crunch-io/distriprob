export declare class InvDiscreteQuantile {
    private static distribution_quantile_finder(simplifiedCDF, targetP, comp);
    /**
     * The purpose of adjust_bounds, is to toggle the last bit of the
     * range so that both ends round to the same integer, if possible.
     * If they do both round the same then we terminate the search
     * for the root *very* quickly when finding an integer result.
     * At the point that this function is called we know that "a" is
     * below the root and "b" above it, so this change can not result
     * in the root no longer being bracketed.
     */
    private static adjust_bounds(bounds, type);
    private static getTol(type);
    /**
     * This is where all the work is done:
     */
    private static do_inverse_discrete_quantile(simplifiedCDF, p, comp, guess, multiplier, adder, tolType, max_iter, max_bound, min_bound);
    private static round_to_floor(simplifiedCDF, result, p, c, max_bound, min_bound);
    private static round_to_ceil(simplifiedCDF, result, p, c, max_bound, min_bound);
    static inverse_discrete_quantile(simplifiedPDF: (x: number) => number, simplifiedCDF: (x: number, lowerTail: boolean) => number, p: number, c: boolean, guess: number, multiplier: number, adder: number, round: "up" | "down" | "real", max_iter: number, max_bound: number, min_bound: number): number;
}
