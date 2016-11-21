"use strict";

/**
 * (C) Copyright 2014 David Bau.
 * (C) Copyright 2016 Zachary Martin (modifications for Distriprob library)
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const Utility = require("./utility").Utility;

export class Random {

  // *****The following constants are related to IEEE 754 limits*********

  public static WIDTH(): number { return 256 };         // each RC4 output is 0 <= x < 256

  public static MASK(): number { return Random.WIDTH() - 1 ;}

  // at least six RC4 outputs for each double
  public static CHUNKS(): number { return  6;}

  // there are 53 significant digits in a double
  public static DIGITS(): number {return  53;}

  public static START_DENOM(): number {return Math.pow(Random.WIDTH(), Random.CHUNKS());}

  public static SIGNIFICANCE(): number {return Math.pow(2, Random.DIGITS());}

  public static OVERFLOW(): number {return Random.SIGNIFICANCE() * 2;}

  // instance variables
  private _i: number;
  private _j: number;
  private _s: number[];


  /**
   * The ARC4 constructor
   * @param seed - a key in the form of an array of at most (width) integers that should
   *              be 0 <= x < (width), or a previous IRandomState
   */
  constructor(seed?: number | string | IRandomState) {
    if (Random.isIRandomState(seed)) {
      console.log("re-establishing random");
      this._i = seed.i;
      this._j = seed.j;
      this._s = seed.s.slice();
    } else {
      let key: number[] = [];
      let shortseed = Random.mixkey(
        seed !== null && typeof seed !== "undefined" ? seed + "\0" : Random.autoseed(),
        key
      );

      this._i = 0;
      this._j = 0;
      this._s = [];

      // The empty key [] is treated as [0].
      if (key.length === 0) {
        key = [0];
      }

      const keylen = key.length;
      let t: number;

      // Set up S using the standard key scheduling algorithm.
      while (this._i < Random.WIDTH()) {
        this._s[this._i] = this._i++;
      }

      for (this._i = 0; this._i < Random.WIDTH(); this._i++) {
        this._s[this._i] = this._s[this._j = Random.MASK() & (this._j +
          key[this._i % keylen] + (t = this._s[this._i]))];
        this._s[this._j] = t;
      }

      // For robust unpredictability, the function call below automatically
      // discards an initial batch of values.  This is called RC4-drop[256].
      // See http://google.com/search?q=rsa+fluhrer+response&btnI
      this.g(Random.WIDTH());
    }
  }

  /**
   * The g(count) method returns a pseudorandom integer that concatenates
   * the next (count) outputs from ARC4.  Its return value is a number x
   * that is in the range 0 <= x < (width ^ count).
   * @param count
   */
  private g(count: number): number {
    // Using instance members instead of closure state nearly doubles speed.
    let t, r = 0;
    while (count--) {
      t = this._s[this._i = Random.MASK() & (this._i + 1)];
      r = r * Random.WIDTH() + this._s[Random.MASK() &
        ((this._s[this._i] = this._s[this._j = Random.MASK() & (this._j + t)]) +
        (this._s[this._j] = t))];
    }

    return r;
  }

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  public double(): number {
    let n = this.g(Random.CHUNKS()),             // Start with a numerator n < 2 ^ 48
      d = Random.START_DENOM(),                  //   and denominator d = 2 ^ 48.
      x = 0;                                     //   and no 'extra last byte'.
    while (n < Random.SIGNIFICANCE()) {          // Fill up all significant digits by
      n = (n + x) * Random.WIDTH();              //   shifting numerator and
      d *= Random.WIDTH();                       //   denominator and generating a
      x = this.g(1);                             //   new least-significant-byte.
    }
    while (n >= Random.OVERFLOW()) {             // To avoid rounding up, before adding
      n /= 2;                                    //   last byte, shift everything
      d /= 2;                                    //   right using integer math until
      x >>>= 1;                                  //   we have exactly the desired bits.
    }
    return (n + x) / d;                          // Form the number within [0, 1).
  }

  public int32() { return this.g(4) | 0; }
  public quick() { return this.g(4) / 0x100000000; }

  get i(): number {
    return this.i;
  }

  get j(): number {
    return this.j;
  }

  get s(): number[] {
    return this.s.slice();
  }

  get state(): IRandomState {
    return {
      i: this._i,
      j: this._j,
      s: this._s
    };
  }

  public static numbers(n: number,
                        quantileFctn: Function,
                        quantileFctnArgs: any[],
                        seed?: number | string | IRandomState,
                        thisRef?: any):
  number[] {
    const result: number[] = [];
    const iter = Random.numberIterator(n, quantileFctn, quantileFctnArgs, seed, thisRef);

    for(let randomVal of iter) {
      result.push(randomVal);
    }

    return result;
  }

  public static numberIterator(n: number,
                               quantileFctn: Function,
                               quantileFctnArgs: any[],
                               seed?: number | string | IRandomState,
                               thisRef?: any):
  IRandomIterableIterator {
    const rng = new Random(seed);
    let k = 0;

    function next(): {value: number, done: boolean} {
      const randomDouble = rng.double();
      const args: any[] = [randomDouble].concat(quantileFctnArgs);


      if (k < n) {
        k++;

        return {
          value: quantileFctn.apply(thisRef, args),
          done: false
        }
      } else {
        return {
          value: NaN,
          done: true
        }
      }

    }

    function symbolIterator(): IterableIterator<number> {
      return {
        [Symbol.iterator]: symbolIterator,
        next: next
      }
    }

    const iterator: IRandomIterableIterator = {
      next: next,
      [Symbol.iterator]: symbolIterator,
      state: () => { return rng.state; }
    };

    return iterator;
  }

  /**
   * flatten()
   * Converts an object tree to a string
   */
  public static flatten(obj: any, depth): string {
    let result: any[] = [], typ: string = typeof obj, prop;

    if (depth && typ === "object") {
      for (prop in obj) {
        try { result.push(Random.flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }

    return result + "";
  }

  /**
   * mixkey()
   * Mixes a string seed into a key that is an array of integers, and
   * returns a shortened string seed that is equivalent to the result key.
   */
  private static mixkey(seed: string | number, key: number[]): string {
    let stringseed = seed + '';
    let smear: number;
    let j: number = 0;

    while (j < stringseed.length) {
      key[Random.MASK() & j] =
        Random.MASK() & ((smear ^= key[Random.MASK() & j] * 19) +
        stringseed.charCodeAt(j++));
    }
    return Random.tostring(key);
  }

  /**
   * autoseed()
   * Returns an object for autoseeding, using window.crypto and Node crypto
   * module if available.
   */
  private static autoseed() {
    if (Utility.environmentIsNode()) {
      const crypto = require("crypto");
      return Random.tostring(crypto.randomBytes(Random.WIDTH()))
    } else if (window.crypto) {
      let out = new Uint8Array(Random.WIDTH());
      window.crypto.getRandomValues(out);
      return Random.tostring(out);
    } else {
      // mix a few bits from the built-in RNG into the entropy pool.  Because we do
      // not want to interfere with deterministic PRNG state later, we will not call
      // math.random on its own again after initialization.
      let pool = [];
      Random.mixkey(Math.random(), pool);

      let browser = window.navigator;
      let plugins = browser && browser.plugins;
      return Random.flatten(
        [+new Date(), window, plugins, window.screen, Random.tostring(pool)],
        3
      );
    }
  }

  private static tostring(a: Iterable<number>): string {
    return String.fromCharCode.apply(null, a)
  }

  public static isIRandomState(obj: any): obj is IRandomState {
    if (!obj) {
      return false;
    }

    if (typeof obj.i !== "number") {
      return false;
    }

    if (typeof obj.j !== "number") {
      return false;
    }

    if (!Array.isArray(obj.s)) {
      return false;
    }

    for (let element of obj.s) {
      if (typeof element !== "number") {
        return false;
      }
    }

    return true;
  }
}

export interface IRandomState {
  readonly i: number;
  readonly j: number;
  readonly s: number[];
}

export interface IRandomIterableIterator extends IterableIterator<number> {
  state:() => IRandomState;
}
