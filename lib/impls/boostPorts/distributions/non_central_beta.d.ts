import { Tol } from "../tools/toms748_solve";
export declare class NonCentralBeta {
    static non_central_beta_p(a: number, b: number, lam: number, x: number, y: number, init_val?: number): number;
    static non_central_beta_q(a: number, b: number, lam: number, x: number, y: number, init_val?: number): number;
    static non_central_beta_cdf(x: number, y: number, a: number, b: number, l: number, invert: boolean): number;
    private static nc_beta_quantile_functor(a, b, l, t, c);
    static bracket_and_solve_root01(f: (x: number) => number, guess: number, factor: number, rising: boolean, tol: Tol, max_iter: number): {
        a: number;
        b: number;
        iterations: number;
    };
    static nc_beta_quantile(a: number, b: number, l: number, p: number, comp: boolean): number;
    static non_central_beta_pdf(a: number, b: number, lam: number, x: number, y: number): number;
    static nc_beta_pdf(a: number, b: number, lam: number, x: number): number;
    private static hypergeometric_2F2_sum(a1, a2, b1, b2, z);
    private static hypergeometric_2F2(a1, a2, b1, b2, z);
}
