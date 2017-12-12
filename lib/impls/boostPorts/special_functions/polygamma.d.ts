export declare class Polygamma {
    /**
     * for large values of x such as for x > 400
     */
    private static polygamma_atinfinityplus(n, x);
    private static polygamma_attransitionplus(n, x);
    private static polygamma_nearzero(n, x);
    private static poly_cot_pi(n, x, xc);
    static coefs(n: number, scaled: boolean): number[];
    private static polygamma_imp(n, x);
    static polygamma(n: number, x: number): number;
}
