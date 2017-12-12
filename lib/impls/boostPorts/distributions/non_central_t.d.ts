export declare class NonCentralT {
    private static non_central_t2_p(v, delta, x, y, init_val);
    private static non_central_t2_q(v, delta, x, y, init_val);
    private static central_t_cdf(v, t, invert);
    static non_central_t_cdf(v: number, delta: number, t: number, invert: boolean): number;
    private static non_central_t_quantile_functor(v, delta, target, comp);
    static non_central_t_quantile(v: number, delta: number, p: number, q: number): number;
    private static non_central_t2_pdf(n, delta, x, y, init_val);
    static central_t_pdf(n: number, t: number): number;
    static non_central_t_pdf(n: number, delta: number, t: number): number;
}
