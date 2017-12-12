export declare class Log1p {
    /**
     * Functor log1p_series returns the next term in the Taylor series
     *   pow(-1, k-1)*pow(x, k) / k
     * each time that operator() is invoked.
     */
    private static log1p_series(x);
    static log1p(x: any): any;
    /**
     * compute log(1+x)-x;
     */
    static log1pmx(x: any): any;
}
