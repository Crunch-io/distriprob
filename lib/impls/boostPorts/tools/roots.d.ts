import { Tol } from "./toms748_solve";
export declare class Roots {
    private static handle_zero_derivative(state);
    static bisect(f: (x: number) => number, min: number, max: number, tol: Tol, max_iter: number): {
        a: number;
        b: number;
        iterations: number;
    };
    static newton_raphson_iterate(f: (x: number) => {
        f0: number;
        f1: number;
    }, guess: number, min: number, max: number, digits: number, max_iter: number): {
        result: number;
        iterations: number;
    };
    private static halley_step(x, f0, f1, f2);
    private static second_order_root_finder(f, guess, min, max, digits, max_iter, step);
    static halley_iterate(f: (x: number) => {
        f0: number;
        f1: number;
        f2: number;
    }, guess: number, min: number, max: number, digits: number, max_iter: number): {
        result: number;
        iterations: number;
    };
}
