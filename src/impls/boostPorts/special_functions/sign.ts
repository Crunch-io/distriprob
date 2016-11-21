"use strict";

/**
 * (C) Copyright John Maddock 2006.
 * (C) Copyright Johan Rade 2006.
 * (C) Copyright Paul A. Bristow 2011 (added changesign).
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
 */

export class Sign {

  public static sign(x: number): number {
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
  }

  public static signbit(x: number): number {
    let s = Sign.sign(x);

    if (Object.is(s, -1) || Object.is(s, -0)) {
      return 1;
    } else if (Object.is(s, 1) || Object.is(s, 0)) {
      return 0;
    } else {
      return NaN;
    }
  }

  public static copysign(x: number, y: number): number {
    let signbit = Sign.signbit(y);

    if (signbit) {
      return - Math.abs(x);
    } else if (signbit === 0) {
      return Math.abs(x);
    } else {
      throw new Error(`Non-numeric argument y = ${y}.`);
    }
  }

  public static changesign(x: number): number {
    return -x;
  }

}
