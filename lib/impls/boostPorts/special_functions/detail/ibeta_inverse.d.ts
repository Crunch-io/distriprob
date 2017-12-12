export declare class IBetaInverse {
    private static temme_root_finder(t, a);
    /**
     * See:
     * "Asymptotic Inversion of the Incomplete BetaDist Function"
     * N.M. Temme
     * Journal of Computation and Applied Mathematics 41 (1992) 145-157.
     * Section 2.
     */
    private static temme_method_1_ibeta_inverse(a, b, z);
    /**
     * See:
     * "Asymptotic Inversion of the Incomplete BetaDist Function"
     * N.M. Temme
     * Journal of Computation and Applied Mathematics 41 (1992) 145-157.
     * Section 3.
     */
    private static temme_method_2_ibeta_inverse(a, b, z, r, theta);
    /**
     * See:
     * "Asymptotic Inversion of the Incomplete BetaDist Function"
     * N.M. Temme
     * Journal of Computation and Applied Mathematics 41 (1992) 145-157.
     * Section 4.
     */
    private static temme_method_3_ibeta_inverse(a, b, p, q);
    private static ibeta_roots(a, b, t, inv?);
    private static ibeta_inv_imp(a, b, p, q);
    static ibeta_inv(a: number, b: number, p: number): {
        result: number;
        py: number;
    };
    static ibetac_inv(a: number, b: number, q: number): {
        result: number;
        py: number;
    };
}
