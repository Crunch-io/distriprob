export declare class Beta {
    /**
     * Implementation of BetaDist(a,b) using the Lanczos approximation
     */
    private static beta_imp(a, b);
    /**
     * Compute the leading power terms in the incomplete BetaDist:
     *
     * (x^a)(y^b)/BetaDist(a,b) when normalised, and
     * (x^a)(y^b) otherwise.
     *
     * Almost all of the error in the incomplete beta comes from this
     * function: particularly when a and b are large. Computing large
     * powers are *hard* though, and using logarithms just leads to
     * horrendous cancellation errors.
     */
    static ibeta_power_terms(a: number, b: number, x: number, y: number, normalised: boolean, prefix?: number): number;
    /**
     * Generator for the terms of the series approximation to the incomplete beta
     */
    private static i_beta_series_generator(a_, b_, x_, mult);
    /**
     * Series approximation to the incomplete beta:
     */
    private static ibeta_series(a, b, x, s0, normalised, y);
    /**
     * Continued fraction for the incomplete beta:
     */
    private static i_beta_fraction2_generator(a_, b_, x_, y_);
    /**
     * Evaluate the incomplete beta via the continued fraction representation:
     */
    private static ibeta_fraction2(a, b, x, y, normalised?);
    /**
     * Computes the difference between ibeta(a,b,x) and ibeta(a+k,b,x):
     */
    private static ibeta_a_step(a, b, x, y, k, normalised);
    /**
     * This function is only needed for the non-regular incomplete beta,
     * it computes the delta in:
     * beta(a,b,x) = prefix + delta * beta(a+k,b,x)
     * it is currently only called for small k.
     */
    private static rising_factorial_ratio(a, b, k);
    /**
     *
     * Routine for a > 15, b < 1
     *
     * Begin by figuring out how large our table of Pn's should be,
     * quoted accuracies are "guestimates" based on empiracal observation.
     * Note that the table size should never exceed the size of our
     * tables of factorials.
     */
    private static Pn_size();
    private static beta_small_b_large_a_series(a, b, x, y, s0, mult, normalised);
    static binomial_coefficient(n: number, k: number): number;
    /**
     * For integer arguments we can relate the incomplete beta to the
     * complement of the binomial distribution cdf and use this finite sum.
     */
    private static binomial_ccdf(n, k, x, y);
    /**
     * The incomplete beta function implementation:
     * This is just a big bunch of spaghetti code to divide up the
     * input range and select the right implementation method for
     * each domain:
     */
    static ibeta_imp(a: number, b: number, x: number, inv: boolean, normalised: boolean): {
        result: number;
        pderivative: number;
    };
    static ibeta_derivative(a: number, b: number, x: number): number;
    /**
     * if x is included give the non-regularized incomplete beta function at a, b, and x,
     * otherwise gives the beta function at a and b.
     */
    static beta(a: number, b: number, x?: number): number;
    static betac(a: number, b: number, x: number): number;
    static ibeta(a: number, b: number, x: number): number;
    static ibetac(a: number, b: number, x: number): number;
}
