"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * (C) Copyright Christopher Kormanyos 2013.
 * (C) Copyright Zachary Martin 2016 (port to javascript).
 * Use, modification and distribution are subject to the
 * Boost Software License:
 *
 * Permission is hereby granted, free of charge, to any person or organization
 * obtaining a copy of the software and accompanying documentation covered by
 * this license (the "Software") to use, reproduce, display, distribute,
 * execute, and transmit the Software, and to prepare derivative works of the
 * Software, and to permit third-parties to whom the Software is furnished to
 * do so, all subject to the following:
 *
 * The copyright notices in the Software and this entire statement, including
 * the above license grant, this restriction and the following disclaimer,
 * must be included in all copies of the Software, in whole or in part, and
 * all derivative works of the Software, unless such copies or derivative
 * works are solely in the form of machine-executable object code generated by
 * a source language processor.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE SOFTWARE BE LIABLE
 * FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */
/**
 * This work is based on an earlier work:
 * "Algorithm 910: A Portable C++ Multiple-Precision System for Special-Function
 * Calculations", in ACM TOMS, {VOL 37, ISSUE 4, (February 2011)} (C) ACM, 2011.
 * http://doi.acm.org/10.1145/1916461.1916469
 *
 * This header contains implementation details for estimating the zeros
 * of cylindrical Bessel and Neumann functions on the positive real axis.
 * Support is included for both positive as well as negative order.
 * Various methods are used to estimate the roots. These include
 * empirical curve fitting and McMahon's asymptotic approximation
 * for small order, uniform asymptotic expansion for large order,
 * and iteration and root interlacing for negative order.
 */
var Constants = require("../../tools/constants").Constants;
var Roots = require("../../tools/roots").Roots;
var Bessel = require("../bessel").Bessel;
var Precision = require("../../tools/precision").Precision;
var AiryAiBiZero = require("./airy_ai_bi_zero").AiryAiBiZero;
var BesselJYZero = /** @class */ (function () {
    function BesselJYZero() {
    }
    BesselJYZero.equation_nist_10_21_19 = function (v, a) {
        // Get the initial estimate of the m'th root of Jv or Yv.
        // This subroutine is used for the order m with m > 1.
        // The order m has been used to create the input parameter a.
        // This is Eq. 10.21.19 in the NIST Handbook.
        var mu = (v * v) * 4;
        var mu_minus_one = mu - 1;
        var eight_a_inv = 1 / (a * 8);
        var eight_a_inv_squared = eight_a_inv * eight_a_inv;
        var term3 = ((mu_minus_one * 4) * ((mu * 7) - 31)) / 3;
        var term5 = ((mu_minus_one * 32) * ((((mu * 83) - 982) * mu) + 3779)) /
            15;
        var term7 = ((mu_minus_one * 64) * ((((((mu * 6949) - 153855) * mu) + 1585743) * mu)
            - 6277237)) / 105;
        return a + ((((-term7
            * eight_a_inv_squared - term5)
            * eight_a_inv_squared - term3)
            * eight_a_inv_squared - mu_minus_one)
            * eight_a_inv);
    };
    BesselJYZero.equation_as_9_3_39_and_its_derivative = function (zeta) {
        return function (z) {
            // Return the function of zeta that is implicitly defined
            // in A&S Eq. 9.3.39 as a function of z. The function is
            // returned along with its derivative with respect to z.
            var zsq_minus_one_sqrt = Math.sqrt((z * z) - 1);
            var the_function = zsq_minus_one_sqrt -
                (Math.acos(1 / z) + ((2 / 3) * (zeta * Math.sqrt(zeta))));
            var its_derivative = zsq_minus_one_sqrt / z;
            return {
                f0: the_function,
                f1: its_derivative
            };
        };
    };
    BesselJYZero.equation_as_9_5_26 = function (v, ai_bi_root) {
        // Obtain the estimate of the m'th zero of Jv or Yv.
        // The order m has been used to create the input parameter ai_bi_root.
        // Here, v is larger than about 2.2. The estimate is computed
        // from Abramowitz and Stegun Eqs. 9.5.22 and 9.5.26, page 371.
        //
        // The inversion of z as a function of zeta is mentioned in the text
        // following A&S Eq. 9.5.26. Here, we accomplish the inversion by
        // performing a Taylor expansion of Eq. 9.3.39 for large z to order 2
        // and solving the resulting quadratic equation, thereby taking
        // the positive root of the quadratic.
        // In other words: (2/3)(-zeta)^(3/2) approx = z + 1/(2z) - pi/2.
        // This leads to: z^2 - [(2/3)(-zeta)^(3/2) + pi/2]z + 1/2 = 0.
        //
        // With this initial estimate, Newton-Raphson iteration is used
        // to refine the value of the estimate of the root of z
        // as a function of zeta.
        var v_pow_third = Math.cbrt(v);
        var v_pow_minus_two_thirds = 1 / (v_pow_third * v_pow_third);
        // Obtain zeta using the order v combined with the m'th root of
        // an airy function, as shown in  A&S Eq. 9.5.22.
        var zeta = v_pow_minus_two_thirds * (-ai_bi_root);
        var zeta_sqrt = Math.sqrt(zeta);
        // Set up a quadratic equation based on the Taylor series
        // expansion mentioned above.
        var b = -((((zeta * zeta_sqrt) * 2) / 3) + Constants.HALFPI());
        // Solve the quadratic equation, taking the positive root.
        var z_estimate = (-b + Math.sqrt((b * b) - 2)) / 2;
        // Establish the range, the digits, and the iteration limit
        // for the upcoming root-finding.
        var range_zmin = Math.max(z_estimate - 1, 1);
        var range_zmax = z_estimate + 1;
        var my_digits10 = Math.round(53 * 0.301);
        // Select the maximum allowed iterations based on the number
        // of decimal digits in the numeric type T, being at least 12.
        var iterations_allowed = Math.max(12, my_digits10 * 2);
        var iterations_used = iterations_allowed;
        // Calculate the root of z as a function of zeta.
        var rootResultObj = Roots.newton_raphson_iterate(BesselJYZero.equation_as_9_3_39_and_its_derivative(zeta), z_estimate, range_zmin, range_zmax, 53, iterations_used);
        var z = rootResultObj.result;
        iterations_used = rootResultObj.iterations;
        // Continue with the implementation of A&S Eq. 9.3.39.
        var zsq_minus_one = (z * z) - 1;
        var zsq_minus_one_sqrt = Math.sqrt(zsq_minus_one);
        // This is A&S Eq. 9.3.42.
        var b0_term_5_24 = 5 / ((zsq_minus_one * zsq_minus_one_sqrt) * 24);
        var b0_term_1_8 = 1 / (zsq_minus_one_sqrt * 8);
        var b0_term_5_48 = 5 / ((zeta * zeta) * 48);
        var b0 = -b0_term_5_48 + ((b0_term_5_24 + b0_term_1_8) / zeta_sqrt);
        // This is the second line of A&S Eq. 9.5.26 for f_k with k = 1.
        var f1 = ((z * zeta_sqrt) * b0) / zsq_minus_one_sqrt;
        // This is A&S Eq. 9.5.22 expanded to k = 1 (i.e., one term in the series).
        return (v * z) + (f1 / v);
    };
    BesselJYZero.equation_nist_10_21_40_a = function (v) {
        var v_pow_third = Math.cbrt(v);
        var v_pow_minus_two_thirds = 1 / (v_pow_third * v_pow_third);
        return v * (((((+0.043
            * v_pow_minus_two_thirds - 0.0908)
            * v_pow_minus_two_thirds - 0.00397)
            * v_pow_minus_two_thirds + 1.033150)
            * v_pow_minus_two_thirds + 1.8557571)
            * v_pow_minus_two_thirds + 1);
    };
    BesselJYZero.function_object_jv = function (v) {
        return function (x) {
            return Bessel.cyl_bessel_j(v, x);
        };
    };
    BesselJYZero.function_object_jv_and_jv_prime = function (v, order_is_zero) {
        return function (x) {
            // Obtain Jv(x) and Jv'(x).
            // Chris's original code called the Bessel function implementation layer direct,
            // but that circumvented optimizations for integer-orders.  Call the documented
            // top level functions instead, and let them sort out which implementation to use.
            var j_v;
            var j_v_prime;
            if (order_is_zero) {
                j_v = Bessel.cyl_bessel_j(0, x);
                j_v_prime = -Bessel.cyl_bessel_j(1, x);
            }
            else {
                j_v = Bessel.cyl_bessel_j(v, x);
                var j_v_m1 = Bessel.cyl_bessel_j(v - 1, x);
                j_v_prime = j_v_m1 - ((v * j_v) / x);
            }
            // Return a tuple containing both Jv(x) and Jv'(x).
            return { f0: j_v, f1: j_v_prime };
        };
    };
    BesselJYZero.my_bisection_unreachable_tolerance = function (arg1, arg2) {
        return false;
    };
    BesselJYZero.initial_guess_j = function (v, m) {
        // Compute an estimate of the m'th root of cyl_bessel_j.
        var guess;
        // There is special handling for negative order.
        if (v < 0) {
            if ((m === 1) && (v > -0.5)) {
                // For small, negative v, use the results of empirical curve fitting.
                // Mathematica(R) session for the coefficients:
                //  Table[{n, BesselJZero[n, 1]}, {n, -(1/2), 0, 1/10}]
                //  N[%, 20]
                //  Fit[%, {n^0, n^1, n^2, n^3, n^4, n^5, n^6}, n]
                guess = (((((-0.2321156900729
                    * v - 0.1493247777488)
                    * v - 0.15205419167239)
                    * v + 0.07814930561249)
                    * v - 0.17757573537688)
                    * v + 1.542805677045663)
                    * v + 2.40482555769577277;
                return guess;
            }
            // Create the positive order and extract its positive floor integer part.
            var vv = -v;
            var vv_floor = Math.floor(vv);
            // The to-be-found root is bracketed by the roots of the
            // Bessel function whose reflected, positive integer order
            // is less than, but nearest to vv.
            var root_hi = BesselJYZero.initial_guess_j(vv_floor, m);
            var root_lo = void 0;
            if (m === 1) {
                // The estimate of the first root for negative order is found using
                // an adaptive range-searching algorithm.
                root_lo = root_hi - 0.1;
                var hi_end_of_bracket_is_negative = (Bessel.cyl_bessel_j(v, root_hi) < 0);
                while ((root_lo > Precision.epsilon())) {
                    var lo_end_of_bracket_is_negative = (Bessel.cyl_bessel_j(v, root_lo) < 0);
                    if (hi_end_of_bracket_is_negative !== lo_end_of_bracket_is_negative) {
                        break;
                    }
                    root_hi = root_lo;
                    // Decrease the lower end of the bracket using an adaptive algorithm.
                    if (root_lo > 0.5) {
                        root_lo -= 0.5;
                    }
                    else {
                        root_lo *= 0.75;
                    }
                }
            }
            else {
                root_lo = BesselJYZero.initial_guess_j(vv_floor, m - 1);
            }
            // Perform several steps of bisection iteration to refine the guess.
            var number_of_iterations = 12;
            // Do the bisection iteration.
            var guess_pair = Roots.bisect(BesselJYZero.function_object_jv(v), root_lo, root_hi, BesselJYZero.my_bisection_unreachable_tolerance, number_of_iterations);
            return (guess_pair.a + guess_pair.b) / 2;
        }
        if (m === 1) {
            // Get the initial estimate of the first root.
            if (v < 2.2) {
                // For small v, use the results of empirical curve fitting.
                // Mathematica(R) session for the coefficients:
                //  Table[{n, BesselJZero[n, 1]}, {n, 0, 22/10, 1/10}]
                //  N[%, 20]
                //  Fit[%, {n^0, n^1, n^2, n^3, n^4, n^5, n^6}, n]
                guess = (((((-0.0008342379046010
                    * v + 0.007590035637410)
                    * v - 0.030640914772013)
                    * v + 0.078232088020106)
                    * v - 0.169668712590620)
                    * v + 1.542187960073750)
                    * v + 2.4048359915254634;
            }
            else {
                // For larger v, use the first line of Eqs. 10.21.40 in the NIST Handbook.
                guess = BesselJYZero.equation_nist_10_21_40_a(v);
            }
        }
        else {
            if (v < 2.2) {
                // Use Eq. 10.21.19 in the NIST Handbook.
                var a = ((v + m * 2) - 0.5) * Constants.HALFPI();
                guess = BesselJYZero.equation_nist_10_21_19(v, a);
            }
            else {
                // Get an estimate of the m'th root of airy_ai.
                var airy_ai_root = AiryAiBiZero.initial_guess_ai(m);
                // Use Eq. 9.5.26 in the A&S Handbook.
                guess = BesselJYZero.equation_as_9_5_26(v, airy_ai_root);
            }
        }
        return guess;
    };
    BesselJYZero.equation_nist_10_21_40_b = function (v) {
        var v_pow_third = Math.cbrt(v);
        var v_pow_minus_two_thirds = 1 / (v_pow_third * v_pow_third);
        return v * (((((-0.001
            * v_pow_minus_two_thirds - 0.0060)
            * v_pow_minus_two_thirds + 0.01198)
            * v_pow_minus_two_thirds + 0.260351)
            * v_pow_minus_two_thirds + 0.9315768)
            * v_pow_minus_two_thirds + 1);
    };
    BesselJYZero.function_object_yv = function (v) {
        return function (x) {
            return Bessel.cyl_neumann(v, x);
        };
    };
    BesselJYZero.function_object_yv_and_yv_prime = function (v) {
        return function (x) {
            var half_epsilon = Precision.epsilon() / 2;
            var order_is_zero = ((v > -half_epsilon) && (v < half_epsilon));
            // Obtain Yv(x) and Yv'(x).
            // Chris's original code called the Bessel function implementation layer direct,
            // but that circumvented optimizations for integer-orders.  Call the documented
            // top level functions instead, and let them sort out which implementation to use.
            var y_v;
            var y_v_prime;
            if (order_is_zero) {
                y_v = Bessel.cyl_neumann(0, x);
                y_v_prime = -Bessel.cyl_neumann(1, x);
            }
            else {
                y_v = Bessel.cyl_neumann(v, x);
                var y_v_m1 = Bessel.cyl_neumann(v - 1, x);
                y_v_prime = y_v_m1 - ((v * y_v) / x);
            }
            // Return a tuple containing both Yv(x) and Yv'(x).
            return { f0: y_v, f1: y_v_prime };
        };
    };
    BesselJYZero.initial_guess_y = function (v, m) {
        // Compute an estimate of the m'th root of cyl_neumann.
        var guess;
        // There is special handling for negative order.
        if (v < 0) {
            // Create the positive order and extract its positive floor and ceiling integer parts.
            var vv = -v;
            var vv_floor = Math.floor(vv);
            // The to-be-found root is bracketed by the roots of the
            // Bessel function whose reflected, positive integer order
            // is less than, but nearest to vv.
            // The special case of negative, half-integer order uses
            // the relation between Yv and spherical Bessel functions
            // in order to obtain the bracket for the root.
            // In these special cases, cyl_neumann(-n/2, x) = sph_bessel_j(+n/2, x)
            // for v = -n/2.
            var root_hi = void 0;
            var root_lo = void 0;
            if (m === 1) {
                // The estimate of the first root for negative order is found using
                // an adaptive range-searching algorithm.
                // Take special precautions for the discontinuity at negative,
                // half-integer orders and use different brackets above and below these.
                if ((vv - vv_floor) < 0.5) {
                    root_hi = BesselJYZero.initial_guess_y(vv_floor, m);
                }
                else {
                    root_hi = BesselJYZero.initial_guess_j(vv_floor + 0.5, m);
                }
                root_lo = root_hi - 0.1;
                var hi_end_of_bracket_is_negative = (Bessel.cyl_neumann(v, root_hi) < 0);
                while ((root_lo > Precision.epsilon())) {
                    var lo_end_of_bracket_is_negative = (Bessel.cyl_neumann(v, root_lo) < 0);
                    if (hi_end_of_bracket_is_negative !== lo_end_of_bracket_is_negative) {
                        break;
                    }
                    root_hi = root_lo;
                    // Decrease the lower end of the bracket using an adaptive algorithm.
                    if (root_lo > 0.5) {
                        root_lo -= 0.5;
                    }
                    else {
                        root_lo *= 0.75;
                    }
                }
            }
            else {
                if ((vv - vv_floor) < 0.5) {
                    root_lo = BesselJYZero.initial_guess_y(vv_floor, m - 1);
                    root_hi = BesselJYZero.initial_guess_y(vv_floor, m);
                    root_lo += 0.01;
                    root_hi += 0.01;
                }
                else {
                    root_lo = BesselJYZero.initial_guess_j(vv_floor + 0.5, m - 1);
                    root_hi = BesselJYZero.initial_guess_j(vv_floor + 0.5, m);
                    root_lo += 0.01;
                    root_hi += 0.01;
                }
            }
            // Perform several steps of bisection iteration to refine the guess.
            var number_of_iterations = 12;
            // Do the bisection iteration.
            var guess_pair = Roots.bisect(BesselJYZero.function_object_yv(v), root_lo, root_hi, BesselJYZero.my_bisection_unreachable_tolerance, number_of_iterations);
            return (guess_pair.a + guess_pair.b) / 2;
        }
        if (m === 1) {
            // Get the initial estimate of the first root.
            if (v < 2.2) {
                // For small v, use the results of empirical curve fitting.
                // Mathematica(R) session for the coefficients:
                //  Table[{n, BesselYZero[n, 1]}, {n, 0, 22/10, 1/10}]
                //  N[%, 20]
                //  Fit[%, {n^0, n^1, n^2, n^3, n^4, n^5, n^6}, n]
                guess = (((((-0.0025095909235652
                    * v + 0.021291887049053)
                    * v - 0.076487785486526)
                    * v + 0.159110268115362)
                    * v - 0.241681668765196)
                    * v + 1.4437846310885244)
                    * v + 0.89362115190200490;
            }
            else {
                // For larger v, use the second line of Eqs. 10.21.40 in the NIST Handbook.
                guess = BesselJYZero.equation_nist_10_21_40_b(v);
            }
        }
        else {
            if (v < 2.2) {
                // Use Eq. 10.21.19 in the NIST Handbook.
                var a = ((v + m * 2) - 1.5) * Constants.HALFPI();
                guess = BesselJYZero.equation_nist_10_21_19(v, a);
            }
            else {
                // Get an estimate of the m'th root of airy_bi.
                var airy_bi_root = AiryAiBiZero.initial_guess_bi(m);
                // Use Eq. 9.5.26 in the A&S Handbook.
                guess = BesselJYZero.equation_as_9_5_26(v, airy_bi_root);
            }
        }
        return guess;
    };
    return BesselJYZero;
}());
exports.BesselJYZero = BesselJYZero;