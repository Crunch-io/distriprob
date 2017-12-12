import { Cache } from "../../../cache";
export declare class HypergeometricQuantile {
    private static round_x_from_p(x, p, cum, fudge_factor, lbound, ubound, round);
    private static round_x_from_q(x, q, cum, fudge_factor, lbound, ubound, round);
    static imp(p: number, q: number, r: number, n: number, N: number, round: "up" | "down", cache: Cache): number;
}
