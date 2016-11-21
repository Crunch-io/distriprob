"use strict";

/**
 * (C) Copyright John Maddock 2012.
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


export class AiryAiBiZero {

  private static equation_as_10_4_105(z: number): number {
    const one_over_z = 1 / z;
    const one_over_z_squared = one_over_z * one_over_z;
    const z_pow_third = Math.cbrt(z);
    const z_pow_two_thirds = z_pow_third * z_pow_third;

    // Implement the top line of Eq. 10.4.105.
    const fz = z_pow_two_thirds * (((((              + (162375596875.0 / 334430208)
      * one_over_z_squared - (   108056875.0 /   6967296))
      * one_over_z_squared + (       77125   /     82944))
      * one_over_z_squared - (           5   /        36))
      * one_over_z_squared + (           5   /        48))
      * one_over_z_squared + (1));

    return fz;
  }

  public static initial_guess_ai(m: number): number {
    let guess: number;

    switch(m) {
      case  0:  guess = 0;                       break;
      case  1:  guess = -2.33810741045976703849; break;
      case  2:  guess = -4.08794944413097061664; break;
      case  3:  guess = -5.52055982809555105913; break;
      case  4:  guess = -6.78670809007175899878; break;
      case  5:  guess = -7.94413358712085312314; break;
      case  6:  guess = -9.02265085334098038016; break;
      case  7:  guess = -10.0401743415580859306; break;
      case  8:  guess = -11.0085243037332628932; break;
      case  9:  guess = -11.9360155632362625170; break;
      case 10:  guess = -12.8287767528657572004; break;
      default:
        const t = ((Math.PI * 3) * ((m * 4) - 1)) / 8;
        guess = -AiryAiBiZero.equation_as_10_4_105(t);
        break;
    }

    return guess;
  }

  public static initial_guess_bi(m: number): number {
    let guess;

    switch(m) {
      case  0:  guess = 0;                       break;
      case  1:  guess = -1.17371322270912792492; break;
      case  2:  guess = -3.27109330283635271568; break;
      case  3:  guess = -4.83073784166201593267; break;
      case  4:  guess = -6.16985212831025125983; break;
      case  5:  guess = -7.37676207936776371360; break;
      case  6:  guess = -8.49194884650938801345; break;
      case  7:  guess = -9.53819437934623888663; break;
      case  8:  guess = -10.5299135067053579244; break;
      case  9:  guess = -11.4769535512787794379; break;
      case 10:  guess = -12.3864171385827387456; break;
      default:
        const t = ((Math.PI * 3) * ((m * 4) - 3)) / 8;
        guess = -AiryAiBiZero.equation_as_10_4_105(t);
        break;
    }

    return guess;
  }

}

