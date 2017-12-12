export declare type Tol = (a: number, b: number) => boolean;
export declare class Toms748 {
    static eps_tolerance(bits?: number): (a: number, b: number) => boolean;
    static equal_floor(a: number, b: number): boolean;
    static equal_ceil(a: number, b: number): boolean;
    static equal_nearest_integer(a: number, b: number): boolean;
    private static bracket(f, c, fps);
    private static safe_div(num, denom, r);
    private static secant_interpolate(a, b, fa, fb);
    private static quadratic_interpolate(a, b, d, fa, fb, fd, count);
    private static cubic_interpolate(a, b, d, e, fa, fb, fd, fe);
    static toms748_solve(f: (x: number) => number, ax: number, bx: number, fax: number, fbx: number, tol: Tol, max_iter: number): {
        a: number;
        b: number;
        iterations: number;
    };
    static bracket_and_solve_root(f: (x: number) => number, guess: number, factor: number, rising: boolean, tol: Tol, max_iter: number): {
        a: number;
        b: number;
        iterations: number;
    };
}
