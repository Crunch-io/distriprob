"use strict";

/**
 * (C) Copyright Xiaogang Zhang 2006.
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

const BesselK0 = require("./bessel_k0").BesselK0;
const BesselK1 = require("./bessel_k1").BesselK1;


export class BesselKN {

  public static bessel_kn(n: number, x: number): number {
    let value, current, prev;

    if (x < 0) {
      throw new Error(`Domain error: Got x = ${x}, but argument x must be${""
      } non-negative, complex number result not supported.`);
    }

    if (x === 0) {
      throw new Error(`Overflow error`);
    }

    if (n < 0) {
      n = -n;                             // K_{-n}(z) = K_n(z)
    }

    if (n === 0) {
      value = BesselK0.bessel_k0(x);
    } else if (n === 1) {
      value = BesselK1.bessel_k1(x);
    } else {
      prev = BesselK0.bessel_k0(x);
      current = BesselK1.bessel_k1(x);
      let k = 1;

      let scale = 1;
      do {
        let fact = 2 * k / x;
        if((Number.MAX_VALUE - Math.abs(prev)) / fact < Math.abs(current)) {
          scale /= current;
          prev /= current;
          current = 1;
        }
        value = fact * current + prev;
        prev = current;
        current = value;
        k++;
      } while(k < n);

      if(Number.MAX_VALUE * scale < Math.abs(value)) {
        throw new Error(`Overflow error`);
      }

      value /= scale;
    }
    return value;
  }

}

