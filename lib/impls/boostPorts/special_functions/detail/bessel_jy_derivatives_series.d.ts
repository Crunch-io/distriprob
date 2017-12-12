export declare class BesselJYDerivativesSeries {
    private static bessel_j_derivative_small_z_series_term(v, x);
    /**
     * Series evaluation for BesselJ'(v, z) as z -> 0.
     * It's derivative of:
     * http://functions.wolfram.com/Bessel-TypeFunctions/BesselJ/06/01/04/01/01/0003/
     * Converges rapidly for all z << v.
     */
    static bessel_j_derivative_small_z_series(v: number, x: number): number;
    private static bessel_y_derivative_small_z_series_term_a(v, x);
    private static bessel_y_derivative_small_z_series_term_b(v, x);
    /**
     * Series form for BesselY' as z -> 0,
     * It's derivative of:
     *      http://functions.wolfram.com/Bessel-TypeFunctions/BesselY/06/01/04/01/01/0003/
     * This series is only useful when the second term is small compared to the first
     * otherwise we get catestrophic cancellation errors.
     *
     * Approximating tgamma(v) by v^v, and assuming |tgamma(-z)| < eps we end up requiring:
     * eps/2 * v^v(x/2)^-v > (x/2)^v or log(eps/2) > v log((x/2)^2/v)
     */
    static bessel_y_derivative_small_z_series(v: number, x: number): number;
}
