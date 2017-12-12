export declare class NonCentralChiSquared {
    private static non_central_chi_square_q(x, f, theta, init_sum?);
    private static non_central_chi_square_p_ding(x, f, theta, init_sum?);
    private static non_central_chi_square_p(y, n, lambda, init_sum);
    private static non_central_chi_square_pdf(x, n, lambda);
    static non_central_chi_squared_cdf(x: number, k: number, l: number, invert: boolean): number;
    private static nccs_quantile_functor(k, l, t, c);
    static nccs_quantile(k: number, l: number, p: number, comp: boolean): number;
    static nccs_pdf(k: number, l: number, x: number): number;
}
