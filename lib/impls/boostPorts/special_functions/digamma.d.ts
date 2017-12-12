export declare class Digamma {
    /**
     * Begin by defining the smallest value for which it is safe to
     * use the asymptotic expansion for digamma:
     */
    private static digamma_large_lim();
    /**
     * Implementations of the asymptotic expansion come next,
     * the coefficients of the series have been evaluated
     * in advance at high precision, and the series truncated
     * at the first term that's too small to effect the result.
     * Note that the series becomes divergent after a while
     * so truncation is very important.
     */
    /**
     * 17-digit precision for x >= 10:
     */
    private static digamma_imp_large(x);
    /**
     * Now follow rational approximations over the range [1,2].
     *
     * 18-digit precision:
     */
    private static digamma_imp_1_2(x);
    static digamma(x: number): number;
}
