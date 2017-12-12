export declare class OwensT {
    /**
     * owens_t_znorm1(x) = P(-oo<Z<=x)-0.5 with Z being normally distributed.
     */
    private static owens_t_znorm1(x);
    /**
     * owens_t_znorm2(x) = P(x<=Z<oo) with Z being normally distributed.
     */
    private static owens_t_znorm2(x);
    /**
     * Auxiliary function, it computes an array key that is used to determine
     * the specific computation method for Owen's T and the order thereof
     * used in owens_t_dispatch.
     */
    private static owens_t_compute_code(h, a);
    private static owens_t_get_order(icode);
    /**
     * compute the value of Owen's T function with method T1 from the reference paper
     */
    private static owens_t_T1(h, a, m);
    /**
     * compute the value of Owen's T function with method T2 from the reference paper
     */
    private static owens_t_T2(h, a, m, ah);
    /**
     * compute the value of Owen's T function with method T3 from the reference paper
     *
     * 53 bit mantissa implementation
     */
    private static owens_t_T3(h, a, ah);
    /**
     * compute the value of Owen's T function with method T4 from the reference paper
     */
    private static owens_t_T4(h, a, m);
    /**
     * compute the value of Owen's T function with method T5 from the reference paper
     *
     * 53 bit mantissa implementation
     */
    private static owens_t_T5(h, a);
    /**
     * compute the value of Owen's T function with method T6 from the reference paper
     */
    private static owens_t_T6(h, a);
    private static owens_t_T1_accelerated(h, a);
    private static owens_t_T2_mlp_true(h, a, m, ah);
    private static owens_t_T2_accelerated(h, a, ah);
    private static T4_mp(h, a);
    /**
     * This routine dispatches the call to one of six subroutines, depending on the values
     * of h and a.
     * preconditions: h >= 0, 0<=a<=1, ah=a*h
     *
     * Note there are different versions for different precisions in the original c++ source
     *
     * - this is the simple main case for 64-bit precision or less, this is as per the
     * Patefield-Tandy paper:
     */
    private static owens_t_dispatch(h, a, ah);
    /**
     * compute Owen's T function, T(h,a), for arbitrary values of h and a
     */
    static owens_t(h: number, a: number): number;
}
