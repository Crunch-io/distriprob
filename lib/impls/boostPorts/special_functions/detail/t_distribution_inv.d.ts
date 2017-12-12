export declare class InverseStudentsT {
    private static inverse_students_t_hill(ndf, u);
    /**
     *
     * Tail and body series are due to Shaw:
     *
     * www.mth.kcl.ac.uk/~shaww/web_page/papers/Tdistribution06.pdf
     *
     * Shaw, W.T., 2006, "Sampling Student's T distribution - use of
     * the inverse cumulative distribution function."
     * Journal of Computational Finance, Vol 9 Issue 4, pp 37-73, Summer 2006
     *
     */
    private static inverse_students_t_tail_series(df, v);
    private static inverse_students_t_body_series(df, u);
    private static inverse_students_t(df, u, v);
    static find_ibeta_inv_from_t_dist(a: number, p: number, q: number): {
        result: number;
        py: number;
    };
    private static fast_students_t_quantile_mlp_false(df, p);
    static fast_students_t_quantile(df: number, p: number): number;
}
