export declare class BesselJYAsym {
    private static asymptotic_bessel_amplitude(v, x);
    private static asymptotic_bessel_phase_mx(v, x);
    static asymptotic_bessel_y_large_x_2(v: number, x: number): number;
    static asymptotic_bessel_j_large_x_2(v: number, x: number): number;
    static asymptotic_bessel_large_x_limit_intv(v: number, x: number): boolean;
    static asymptotic_bessel_large_x_limit_realv(v: number, x: number): boolean;
    static temme_asyptotic_y_small_x(v: number, x: number): {
        Y: number;
        Y1: number;
    };
    static asymptotic_bessel_i_large_x(v: number, x: number): number;
}
