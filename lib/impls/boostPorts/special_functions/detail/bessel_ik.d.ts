export declare class BesselIK {
    private static cyl_bessel_i_small_z(v, z);
    static bessel_i_small_z_series(v: number, x: number): number;
    /**
     * Calculate K(v, x) and K(v+1, x) by method analogous to
     * Temme, Journal of Computational Physics, vol 21, 343 (1976)
     */
    private static temme_ik(v, x);
    /**
     * Evaluate continued fraction fv = I_(v+1) / I_v, derived from
     * Abramowitz and Stegun, Handbook of Mathematical Functions, 1972, 9.1.73
     */
    private static CF1_ik(v, x);
    /**
     * Calculate K(v, x) and K(v+1, x) by evaluating continued fraction
     * z1 / z0 = U(v+1.5, 2v+1, 2x) / U(v+0.5, 2v+1, 2x), see
     * Thompson and Barnett, Computer Physics Communications, vol 47, 245 (1987)
     */
    private static CF2_ik(v, x);
    /**
     * Compute I(v, x) and K(v, x) simultaneously by Temme's method, see
     * Temme, Journal of Computational Physics, vol 19, 324 (1975)
     */
    static bessel_ik(v: number, x: number, kind: "need_i" | "need_k"): {
        I: number;
        K: number;
    };
}
