import { Cache } from "../../../cache";
export declare class HypergeometricPDF {
    private static bubble_down_one(array, firstIndex, lastIndex, compareFctn);
    private static lanczos_imp(x, r, n, N);
    private static factorial_imp(x, r, n, N);
    private static prime_imp(x, r, n, N, cache);
    static imp(x: number, r: number, n: number, N: number, cache: Cache): number;
}
