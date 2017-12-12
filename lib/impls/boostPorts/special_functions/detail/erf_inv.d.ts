export declare class ErfInv {
    /**
     * The inverse erf and erfc functions share a common implementation,
     * this version is for 80-bit long double's and smaller:
     */
    private static erf_inv_imp(p, q);
    static erfc_inv(z: number): number;
    static erf_inv(z: number): number;
}
