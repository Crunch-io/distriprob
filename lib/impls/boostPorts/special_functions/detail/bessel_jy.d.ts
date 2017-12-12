export declare class BesselJY {
    /**
     * Simultaneous calculation of A&S 9.2.9 and 9.2.10
     * for use in A&S 9.2.5 and 9.2.6.
     * This series is quick to evaluate, but divergent unless
     * x is very large, in fact it's pretty hard to figure out
     * with any degree of precision when this series actually
     * *will* converge!!  Consequently, we may just have to
     * try it and see...
     */
    private static hankel_PQ(v, x);
    /**
     * Calculate Y(v, x) and Y(v+1, x) by Temme's method, see
     * Temme, Journal of Computational Physics, vol 21, 343 (1976)
     */
    private static temme_jy(v, x);
    /**
     * Evaluate continued fraction fv = J_(v+1) / J_v, see
     * Abramowitz and Stegun, Handbook of Mathematical Functions, 1972, 9.1.73
     */
    static CF1_jy(v: number, x: number): {
        fv: number;
        sign: number;
    };
    /**
     * This algorithm was originally written by Xiaogang Zhang
     * using std::complex to perform the complex arithmetic.
     * However, that turns out to 10x or more slower than using
     * all real-valued arithmetic, so it's been rewritten using
     * real values only.
     */
    private static CF2_jy(v, x);
    static bessel_jy(v: number, x: number, kind: "need_j" | "need_y"): {
        J: number;
        Y: number;
    };
}
