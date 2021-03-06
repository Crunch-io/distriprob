"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * (C) Copyright Gautam Sewani 2008.
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
var Lanczos = require("../../special_functions/lanczos").Lanczos;
var UncheckedFactorial = require("../../special_functions/detail/unchecked_factorial").UncheckedFactorial;
var Precision = require("../../tools/precision").Precision;
var HypergeometricPDF = /** @class */ (function () {
    function HypergeometricPDF() {
    }
    HypergeometricPDF.bubble_down_one = function (array, firstIndex, lastIndex, compareFctn) {
        var nextIndex = firstIndex + 1;
        while ((nextIndex !== lastIndex) &&
            (compareFctn(array[firstIndex], array[nextIndex]) >= 0)) {
            var temp = array[firstIndex];
            array[firstIndex] = array[nextIndex];
            array[nextIndex] = temp;
            firstIndex++;
            nextIndex++;
        }
    };
    HypergeometricPDF.lanczos_imp = function (x, r, n, N) {
        var bases = [
            n + Lanczos.g() + 0.5,
            r + Lanczos.g() + 0.5,
            N - n + Lanczos.g() + 0.5,
            N - r + Lanczos.g() + 0.5,
            1 / (N + Lanczos.g() + 0.5),
            1 / (x + Lanczos.g() + 0.5),
            1 / (n - x + Lanczos.g() + 0.5),
            1 / (r - x + Lanczos.g() + 0.5),
            1 / (N - n - r + x + Lanczos.g() + 0.5)
        ];
        var exponents = [
            n + 0.5,
            r + 0.5,
            N - n + 0.5,
            N - r + 0.5,
            N + 0.5,
            x + 0.5,
            n - x + 0.5,
            r - x + 0.5,
            N - n - r + x + 0.5
        ];
        function compare(i, j) { return exponents[j] - exponents[i]; }
        var base_e_factors = [-1, -1, -1, -1, 1, 1, 1, 1, 1];
        var sorted_indexes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        sorted_indexes.sort(compare);
        do {
            exponents[sorted_indexes[0]] -= exponents[sorted_indexes[1]];
            bases[sorted_indexes[1]] *= bases[sorted_indexes[0]];
            if ((bases[sorted_indexes[1]] < Number.MIN_VALUE) &&
                (exponents[sorted_indexes[1]] !== 0)) {
                return 0;
            }
            base_e_factors[sorted_indexes[1]] += base_e_factors[sorted_indexes[0]];
            HypergeometricPDF.bubble_down_one(sorted_indexes, 0, 9, compare);
        } while (exponents[sorted_indexes[1]] > 1);
        //
        // Combine equal powers:
        //
        var j = 8;
        while (exponents[sorted_indexes[j]] === 0)
            j--;
        while (j) {
            while (j && (exponents[sorted_indexes[j - 1]] == exponents[sorted_indexes[j]])) {
                bases[sorted_indexes[j - 1]] *= bases[sorted_indexes[j]];
                exponents[sorted_indexes[j]] = 0;
                base_e_factors[sorted_indexes[j - 1]] += base_e_factors[sorted_indexes[j]];
                HypergeometricPDF.bubble_down_one(sorted_indexes, j, 9, compare);
                j--;
            }
            j--;
        }
        var result = Math.pow(bases[sorted_indexes[0]] *
            Math.exp(base_e_factors[sorted_indexes[0]]), exponents[sorted_indexes[0]]);
        for (var i = 1; (i < 9) && (exponents[sorted_indexes[i]] > 0); i++) {
            if (result < Number.MIN_VALUE) {
                return 0; // short circuit further evaluation
            }
            if (exponents[sorted_indexes[i]] === 1) {
                result *= bases[sorted_indexes[i]] * Math.exp(base_e_factors[sorted_indexes[i]]);
            }
            else if (exponents[sorted_indexes[i]] === 0.5) {
                result *= Math.sqrt(bases[sorted_indexes[i]] *
                    Math.exp(base_e_factors[sorted_indexes[i]]));
            }
            else {
                result *= Math.pow(bases[sorted_indexes[i]] *
                    Math.exp(base_e_factors[sorted_indexes[i]]), exponents[sorted_indexes[i]]);
            }
        }
        result *= Lanczos.lanczos_sum_expG_scaled(n + 1)
            * Lanczos.lanczos_sum_expG_scaled(r + 1)
            * Lanczos.lanczos_sum_expG_scaled(N - n + 1)
            * Lanczos.lanczos_sum_expG_scaled(N - r + 1)
            /
                (Lanczos.lanczos_sum_expG_scaled(N + 1)
                    * Lanczos.lanczos_sum_expG_scaled(x + 1)
                    * Lanczos.lanczos_sum_expG_scaled(n - x + 1)
                    * Lanczos.lanczos_sum_expG_scaled(r - x + 1)
                    * Lanczos.lanczos_sum_expG_scaled(N - n - r + x + 1));
        return result;
    };
    HypergeometricPDF.factorial_imp = function (x, r, n, N) {
        var result = UncheckedFactorial.unchecked_factorial(n);
        var num = [
            UncheckedFactorial.unchecked_factorial(r),
            UncheckedFactorial.unchecked_factorial(N - n),
            UncheckedFactorial.unchecked_factorial(N - r)
        ];
        var denom = [
            UncheckedFactorial.unchecked_factorial(N),
            UncheckedFactorial.unchecked_factorial(x),
            UncheckedFactorial.unchecked_factorial(n - x),
            UncheckedFactorial.unchecked_factorial(r - x),
            UncheckedFactorial.unchecked_factorial(N - n - r + x)
        ];
        var i = 0;
        var j = 0;
        while ((i < 3) || (j < 5)) {
            while ((j < 5) && ((result >= 1) || (i >= 3))) {
                result /= denom[j];
                j++;
            }
            while ((i < 3) && ((result <= 1) || (j >= 5))) {
                result *= num[i];
                i++;
            }
        }
        return result;
    };
    HypergeometricPDF.prime_imp = function (x, r, n, N, cache) {
        var primes = cache.primes;
        var result = { value: 1, next: null };
        var prime_index = 0;
        var current_prime = primes.value(0);
        while (current_prime <= N) {
            var base = current_prime;
            var prime_powers = 0;
            while (base <= N) {
                prime_powers += Math.floor(n / base);
                prime_powers += Math.floor(r / base);
                prime_powers += Math.floor((N - n) / base);
                prime_powers += Math.floor((N - r) / base);
                prime_powers -= Math.floor(N / base);
                prime_powers -= Math.floor(x / base);
                prime_powers -= Math.floor((n - x) / base);
                prime_powers -= Math.floor((r - x) / base);
                prime_powers -= Math.floor((N - n - r + x) / base);
                base *= current_prime;
            }
            if (prime_powers) {
                var p = Math.pow(current_prime, prime_powers);
                if ((p > 1) && (Precision.buffered_max_value() / p < result.value) ||
                    (p < 1) && (Precision.buffered_min_value() / p > result.value)) {
                    //
                    // The next calculation would overflow, add new node in linked list
                    // to sidestep the issue:
                    //
                    result = { value: p, next: result };
                }
                else {
                    result.value *= p;
                }
            }
            current_prime = primes.value(++prime_index);
        }
        var i, j;
        i = result;
        while (i && i.value < 1) {
            i = i.next;
        }
        j = result;
        while (j && j.value >= 1) {
            j = j.next;
        }
        var prod = 1;
        while (i || j) {
            while (i && ((prod <= 1) || (j === null))) {
                prod *= i.value;
                i = i.next;
                while (i && i.value < 1) {
                    i = i.next;
                }
            }
            while (j && ((prod >= 1) || (i === null))) {
                prod *= j.value;
                j = j.next;
                while (j && j.value >= 1) {
                    j = j.next;
                }
            }
        }
        return prod;
    };
    HypergeometricPDF.imp = function (x, r, n, N, cache) {
        var result;
        if (N <= UncheckedFactorial.max_factorial()) {
            result = HypergeometricPDF.factorial_imp(x, r, n, N);
        }
        else if (N <= cache.primes.maxLimit) {
            result = HypergeometricPDF.prime_imp(x, r, n, N, cache);
        }
        else {
            result = HypergeometricPDF.lanczos_imp(x, r, n, N);
        }
        result = result > 1 ? 1 : result;
        result = result < 0 ? 0 : result;
        return result;
    };
    return HypergeometricPDF;
}());
exports.HypergeometricPDF = HypergeometricPDF;
