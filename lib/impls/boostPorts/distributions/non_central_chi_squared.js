"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * (C) Copyright John Maddock 2008.
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
var Precision = require("../tools/precision").Precision;
var Gamma = require("../special_functions/gamma").Gamma;
var IGammaInverse = require("../special_functions/detail/igamma_inverse").IGammaInverse;
var GenericQuantile = require("./detail/generic_quantile").GenericQuantile;
var Bessel = require("../special_functions/bessel").Bessel;
var NonCentralChiSquared = /** @class */ (function () {
    function NonCentralChiSquared() {
    }
    NonCentralChiSquared.non_central_chi_square_q = function (x, f, theta, init_sum) {
        //
        // Computes the complement of the Non-Central Chi-Square
        // Distribution CDF by summing a weighted sum of complements
        // of the central-distributions.  The weighting factor is
        // a PoissonDist Distribution.
        //
        // This is an application of the technique described in:
        //
        // Computing discrete mixtures of continuous
        // distributions: noncentral chisquare, noncentral t
        // and the distribution of the square of the sample
        // multiple correlation coeficient.
        // D. Benton, K. Krishnamoorthy.
        // Computational Statistics & Data Analysis 43 (2003) 249 - 267
        //
        if (init_sum === void 0) { init_sum = 0; }
        // Special case:
        if (x === 0) {
            return 1;
        }
        //
        // Initialize the variables we'll be using:
        //
        var lambda = theta / 2;
        var del = f / 2;
        var y = x / 2;
        var max_iter = 5000;
        var errtol = Precision.epsilon();
        var sum = init_sum;
        //
        // k is the starting location for iteration, we'll
        // move both forwards and backwards from this point.
        // k is chosen as the peek of the PoissonDist weights, which
        // will occur *before* the largest term.
        //
        var k = Math.round(lambda); //iround(lambda, pol);
        // Forwards and backwards PoissonDist weights:
        var poisf = Gamma.gamma_p_derivative(1 + k, lambda);
        var poisb = poisf * k / lambda;
        // Initial forwards central chi squared term:
        var gamf = Gamma.gamma_q(del + k, y);
        // Forwards and backwards recursion terms on the central chi squared:
        var xtermf = Gamma.gamma_p_derivative(del + 1 + k, y);
        var xtermb = xtermf * (del + k) / y;
        // Initial backwards central chi squared term:
        var gamb = gamf - xtermb;
        //
        // Forwards iteration first, this is the
        // stable direction for the gamma function
        // recurrences:
        //
        var i;
        for (i = k; (i - k) < max_iter; i++) {
            var term = poisf * gamf;
            sum += term;
            poisf *= lambda / (i + 1);
            gamf += xtermf;
            xtermf *= y / (del + i + 1);
            if (((sum == 0) || (Math.abs(term / sum) < errtol)) && (term >= poisf * gamf)) {
                break;
            }
        }
        //Error check:
        if ((i - k) >= max_iter) {
            throw new Error("Evaluation error: Series did not converge, closest value was " + sum);
        }
        //
        // Now backwards iteration: the gamma
        // function recurrences are unstable in this
        // direction, we rely on the terms deminishing in size
        // faster than we introduce cancellation errors.
        // For this reason it's very important that we start
        // *before* the largest term so that backwards iteration
        // is strictly converging.
        //
        for (i = k - 1; i >= 0; i--) {
            var term = poisb * gamb;
            sum += term;
            poisb *= i / lambda;
            xtermb *= (del + i) / y;
            gamb -= xtermb;
            if ((sum == 0) || (Math.abs(term / sum) < errtol))
                break;
        }
        return sum;
    };
    NonCentralChiSquared.non_central_chi_square_p_ding = function (x, f, theta, init_sum) {
        //
        // This is an implementation of:
        //
        // Algorithm AS 275:
        // Computing the Non-Central #2 Distribution Function
        // Cherng G. Ding
        // Applied Statistics, Vol. 41, No. 2. (1992), pp. 478-482.
        //
        // This uses a stable forward iteration to sum the
        // CDF, unfortunately this can not be used for large
        // values of the non-centrality parameter because:
        // * The first term may underfow to zero.
        // * We may need an extra-ordinary number of terms
        //   before we reach the first *significant* term.
        //
        if (init_sum === void 0) { init_sum = 0; }
        // Special case:
        if (x === 0) {
            return 0;
        }
        var tk = Gamma.gamma_p_derivative(f / 2 + 1, x / 2);
        var lambda = theta / 2;
        var vk = Math.exp(-lambda);
        var uk = vk;
        var sum = init_sum + tk * vk;
        if (sum === 0) {
            return sum;
        }
        var max_iter = 5000;
        var errtol = Precision.epsilon();
        var i;
        var lterm = 0;
        var term = 0;
        for (i = 1; i < max_iter; i++) {
            tk = tk * x / (f + 2 * i);
            uk = uk * lambda / i;
            vk = vk + uk;
            lterm = term;
            term = vk * tk;
            sum += term;
            if ((Math.abs(term / sum) < errtol) && (term <= lterm)) {
                break;
            }
        }
        //Error check:
        if (i >= max_iter) {
            throw new Error("Evaluation error: Series did not converge, closest value was " + sum);
        }
        return sum;
    };
    NonCentralChiSquared.non_central_chi_square_p = function (y, n, lambda, init_sum) {
        //
        // This is taken more or less directly from:
        //
        // Computing discrete mixtures of continuous
        // distributions: noncentral chisquare, noncentral t
        // and the distribution of the square of the sample
        // multiple correlation coeficient.
        // D. Benton, K. Krishnamoorthy.
        // Computational Statistics & Data Analysis 43 (2003) 249 - 267
        //
        // We're summing a PoissonDist weighting term multiplied by
        // a central chi squared distribution.
        //
        // Special case:
        if (y === 0) {
            return 0;
        }
        var max_iter = 5000;
        var errtol = Precision.epsilon();
        var errorf = 0;
        var errorb = 0;
        var x = y / 2;
        var del = lambda / 2;
        //
        // Starting location for the iteration, we'll iterate
        // both forwards and backwards from this point.  The
        // location chosen is the maximum of the PoissonDist weight
        // function, which ocurrs *after* the largest term in the
        // sum.
        //
        var k = Math.round(del); //iround(del, pol);
        var a = n / 2 + k;
        // Central chi squared term for forward iteration:
        var gamkf = Gamma.gamma_p(a, x);
        if (lambda === 0) {
            return gamkf;
        }
        // Central chi squared term for backward iteration:
        var gamkb = gamkf;
        // Forwards PoissonDist weight:
        var poiskf = Gamma.gamma_p_derivative(k + 1, del);
        // Backwards PoissonDist weight:
        var poiskb = poiskf;
        // Forwards gamma function recursion term:
        var xtermf = Gamma.gamma_p_derivative(a, x);
        // Backwards gamma function recursion term:
        var xtermb = xtermf * x / a;
        var sum = init_sum + poiskf * gamkf;
        if (sum === 0) {
            return sum;
        }
        var i = 1;
        //
        // Backwards recursion first, this is the stable
        // direction for gamma function recurrences:
        //
        while (i <= k) {
            xtermb *= (a - i + 1) / x;
            gamkb += xtermb;
            poiskb = poiskb * (k - i + 1) / del;
            errorf = errorb;
            errorb = gamkb * poiskb;
            sum += errorb;
            if ((Math.abs(errorb / sum) < errtol) && (errorb <= errorf)) {
                break;
            }
            i++;
        }
        i = 1;
        //
        // Now forwards recursion, the gamma function
        // recurrence relation is unstable in this direction,
        // so we rely on the magnitude of successive terms
        // decreasing faster than we introduce cancellation error.
        // For this reason it's vital that k is chosen to be *after*
        // the largest term, so that successive forward iterations
        // are strictly (and rapidly) converging.
        //
        do {
            xtermf = xtermf * x / (a + i - 1);
            gamkf = gamkf - xtermf;
            poiskf = poiskf * del / (k + i);
            errorf = poiskf * gamkf;
            sum += errorf;
            i++;
        } while ((Math.abs(errorf / sum) > errtol) && (i < max_iter));
        //Error check:
        if (i >= max_iter) {
            throw new Error("Evaluation error: Series did not converge, closest value was " + sum);
        }
        return sum;
    };
    NonCentralChiSquared.non_central_chi_square_pdf = function (x, n, lambda) {
        //
        // As above but for the PDF:
        //
        var max_iter = 500;
        var errtol = Precision.epsilon();
        var x2 = x / 2;
        var n2 = n / 2;
        var l2 = lambda / 2;
        var sum = 0;
        var k = Math.trunc(l2);
        var pois = Gamma.gamma_p_derivative(k + 1, l2) *
            Gamma.gamma_p_derivative(n2 + k, x2);
        if (pois === 0) {
            return 0;
        }
        var poisb = pois;
        for (var i = k;; i++) {
            sum += pois;
            if (pois / sum < errtol) {
                break;
            }
            if (i - k >= max_iter) {
                throw new Error("Evaluation error: Series did not converge, closest value was " + sum);
            }
            pois *= l2 * x2 / ((i + 1) * (n2 + i));
        }
        for (var i = k - 1; i >= 0; i--) {
            poisb *= (i + 1) * (n2 + i) / (l2 * x2);
            sum += poisb;
            if (poisb / sum < errtol) {
                break;
            }
        }
        return sum / 2;
    };
    NonCentralChiSquared.non_central_chi_squared_cdf = function (x, k, l, invert) {
        var result;
        if (l === 0) {
            if (invert) {
                return Gamma.gamma_q(k / 2, x / 2);
            }
            else {
                return Gamma.gamma_p(k / 2, x / 2);
            }
        }
        else if (x > k + l) {
            // Complement is the smaller of the two:
            result = NonCentralChiSquared.non_central_chi_square_q(x, k, l, invert ? 0 : -1);
            invert = !invert;
        }
        else if (l < 200) {
            // For small values of the non-centrality parameter
            // we can use Ding's method:
            result = NonCentralChiSquared.non_central_chi_square_p_ding(x, k, l, invert ? -1 : 0);
        }
        else {
            // For larger values of the non-centrality
            // parameter Ding's method will consume an
            // extra-ordinary number of terms, and worse
            // may return zero when the result is in fact
            // finite, use Krishnamoorthy's method instead:
            result = NonCentralChiSquared.non_central_chi_square_p(x, k, l, invert ? -1 : 0);
        }
        if (invert) {
            result = -result;
        }
        return result;
    };
    NonCentralChiSquared.nccs_quantile_functor = function (k, l, t, c) {
        var dof = k;
        var ncp = l;
        var target = t;
        var complement = c;
        return function (x) {
            var cdfEval = NonCentralChiSquared.non_central_chi_squared_cdf(x, dof, ncp, complement);
            return complement ? target - cdfEval : cdfEval - target;
        };
    };
    NonCentralChiSquared.nccs_quantile = function (k, l, p, comp) {
        //
        // Special cases get short-circuited first:
        //
        if (p === 0) {
            return comp ? Number.POSITIVE_INFINITY : 0;
        }
        if (p === 1) {
            return comp ? 0 : Number.POSITIVE_INFINITY;
        }
        if (l === 0) {
            return 2 * (comp ?
                IGammaInverse.gamma_q_inv(k / 2, p)
                :
                    IGammaInverse.gamma_p_inv(k / 2, p));
        }
        //
        // This is Pearson's approximation to the quantile, see
        // Pearson, E. S. (1959) "Note on an approximation to the distribution of
        // noncentral chi squared", Biometrika 46: 364.
        // See also:
        // "A comparison of approximations to percentiles of the noncentral
        // chi2-distribution",
        // Hardeo Sahai and Mario Miguel Ojeda,
        // Revista de Matematica: Teoria y Aplicaciones 2003 10(1-2) : 57-76.
        // Note that the latter reference refers to an approximation of the CDF, when they
        // really mean the quantile.
        //
        var b = -(l * l) / (k + 3 * l);
        var c = (k + 3 * l) / (k + 2 * l);
        var ff = (k + 2 * l) / (c * c);
        var guess = b + c * NonCentralChiSquared.nccs_quantile(ff, 0, p, comp);
        //
        // Sometimes guess goes very small or negative, in that case we have
        // to do something else for the initial guess, this approximation
        // was provided in a private communication from Thomas Luu, PhD candidate,
        // University College London.  It's an asymptotic expansion for the
        // quantile which usually gets us within an order of magnitude of the
        // correct answer.
        // Fast and accurate parallel computation of quantile functions for random number
        // generation,
        // Thomas LuuDoctorial Thesis 2016
        // http://discovery.ucl.ac.uk/1482128/
        //
        if (guess < 0.005) {
            var pp = comp ? 1 - p : p;
            guess = Math.pow(Math.pow(2, (k / 2 - 1)) * Math.exp(l / 2) * pp * k *
                Gamma.tgamma(k / 2), (2 / k));
            if (guess === 0) {
                guess = Number.MIN_VALUE;
            }
        }
        var f = NonCentralChiSquared.nccs_quantile_functor(k, l, p, comp);
        var result = GenericQuantile.generic_quantile(f, p, guess, comp, 0, Number.MAX_VALUE);
        return result;
    };
    NonCentralChiSquared.nccs_pdf = function (k, l, x) {
        var r;
        if (l === 0) {
            return Gamma.gamma_p_derivative(k / 2, x / 2) / 2;
        }
        // Special case:
        if (x === 0) {
            return 0;
        }
        if (l > 50) {
            r = NonCentralChiSquared.non_central_chi_square_pdf(x, k, l);
        }
        else {
            r = Math.log(x / l) * (k / 4 - 0.5) - (x + l) / 2;
            if (Math.abs(r) >= Precision.log_max_value() / 4) {
                r = NonCentralChiSquared.non_central_chi_square_pdf(x, k, l);
            }
            else {
                r = Math.exp(r);
                r = 0.5 * r * Bessel.cyl_bessel_i(k / 2 - 1, Math.sqrt(l * x));
            }
        }
        return r;
    };
    return NonCentralChiSquared;
}());
exports.NonCentralChiSquared = NonCentralChiSquared;
