export declare class Gamma {
    private static is_odd(v);
    /**
     * Ad hoc function calculates x * sin(pi * x),
     * taking extra care near when x is near a whole number.
     */
    private static sinpx(z);
    /**
     * tgamma(z), with Lanczos support:
     */
    static gamma_imp(z: number): number;
    /**
     * lgamma(z) with Lanczos support:
     */
    static lgamma_imp(z: number): {
        result: number;
        sign: number;
    };
    private static upper_incomplete_gamma_fract(a1, z1);
    private static upper_gamma_fraction(a, z, eps);
    private static lower_incomplete_gamma_series(a1, z1);
    private static lower_gamma_series(a, z, init_value?);
    /**
     * This helper calculates tgamma(dz+1)-1 without cancellation errors,
     * used by the upper incomplete gamma with z < 1:
     */
    private static tgammap1m1_imp(dz);
    /**
     * Calculate power term prefix (z^a)(e^-z) used in the non-normalised
     * incomplete gammas:
     */
    static full_igamma_prefix(a: number, z: number): number;
    /**
     * Compute (z^a)(e^-z)/tgamma(a)
     * most of the error occurs in this function:
     */
    static regularised_gamma_prefix(a: number, z: number): number;
    private static small_gamma2_series(a_, x_);
    /**
     * Upper gamma fraction for very small a:
     */
    private static tgamma_small_upper_part(a, x, invert);
    /**
     * Upper gamma fraction for integer a:
     */
    private static finite_gamma_q(a, x);
    /**
     * Upper gamma fraction for half integer a:
     */
    private static finite_half_gamma_q(a, x);
    /**
     * Main incomplete gamma entry point, handles all four incomplete gamma's:
     */
    static gamma_incomplete_imp(a: number, x: number, normalised: boolean, invert: boolean): {
        result: number;
        pderivative: number;
    };
    /**
     * Ratios of two gamma functions:
     */
    private static tgamma_delta_ratio_imp_lanczos(z, delta);
    private static tgamma_delta_ratio_imp(z, delta);
    private static tgamma_ratio_imp(x, y);
    private static gamma_p_derivative_imp(a, x);
    /**
     * first tgamma overload for gamma function
     */
    static tgamma(z: number): number;
    /**
     * second tgamma overload for non-regularized upper incomplete gamma function
     */
    static tgamma(a: number, z: number): number;
    /**
     * non-regularized lower incomplete gamma function
     */
    static tgamma_lower(a: number, z: number): number;
    static lgamma(z: number): {
        result: number;
        sign: number;
    };
    static tgamma1pm1(z: number): number;
    static gamma_q(a: number, z: number): number;
    static gamma_p(a: number, z: number): number;
    static tgamma_delta_ratio(z: number, delta: number): number;
    static tgamma_ratio(a: number, b: number): number;
    static gamma_p_derivative(a: number, x: number): number;
    static igamma_derivative(a: number, x: number, lower?: boolean, normalised?: boolean): number;
}
