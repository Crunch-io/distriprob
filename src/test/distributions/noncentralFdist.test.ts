"use strict";

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

import {should} from "chai";
import {readFileSync} from "fs";
import {F} from "../../index";
import {digitsOfAgreement} from "../digitCompare";

should();

const DIGIT_AGREE_TOLERANCE = 11;

const testCases = [
  {
    dof1: 5,
    dof2: 2,
    ncp: 1,
    fStat: 1.5,
    cdf: 0.49845842011686358665786775091245664,
    ccdf: 1 - 0.49845842011686358665786775091245664,
    pdf: 0.20251311620629730205859816288225385
  },
  {
    dof1: 2,
    dof2: 5,
    ncp: 1,
    fStat: 2,
    cdf: 0.64938711196845800322066756609406894,
    ccdf: 1 - 0.64938711196845800322066756609406894,
    pdf: 0.15512617916132011524583796078456003
  },
  {
    dof1: 100,
    dof2: 5,
    ncp: 15,
    fStat: 105,
    cdf: 0.99996207325249555786258005958906310,
    ccdf: 0.000037926747504442137419940410936905407,
    pdf: 8.9562292619539161551049126260104435e-7
  },
  {
    dof1: 100,
    dof2: 5,
    ncp: 15,
    fStat: 1.5,
    cdf: 0.57592315596686179870591317303126895,
    ccdf: 1 - 0.57592315596686179870591317303126895,
    pdf: 0.36743745541686900593212039288061162
  },
  {
    dof1: 5,
    dof2: 100,
    ncp: 102,
    fStat: 25,
    cdf: 0.74993383259829917593356265102363267,
    ccdf: 1 - 0.74993383259829917593356265102363267,
    pdf: 0.054467600423154020554785779421659007
  },
  {
    dof1: 85,
    dof2: 100,
    ncp: 0.5,
    fStat: 1.25,
    cdf: 0.85228624977948142884820398473385455,
    ccdf: 0.14771375022051857115179601526614545,
    pdf: 0.88510283331631848299643323511414868
  }
];

describe("Non-central F distribution", function() {

  describe("special cases", function () {

    describe("pdf", function () {
      it("should be infinite when x = 0 and dof1 < 2", function() {
        F.pdf(0, 1.5, 1, 0.4328).should.equal(Number.POSITIVE_INFINITY);
        F.pdf(0, 0.00000001, 3040, 47).should.equal(Number.POSITIVE_INFINITY);
      });

      it("should be equal to exp(-ncp/2) when x = 0 and dof1 = 2", function(){
        let doa1 = digitsOfAgreement(
          Math.exp(-0.444/2),
          F.pdf(0, 2, 3, 0.444)
        );

        doa1.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);

        let doa2 = digitsOfAgreement(
          Math.exp(-539/2),
          F.pdf(0, 2, 0.3498285, 539)
        );

        doa2.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
      });

      it("should be 0 when x = 0 and dof1 > 2", function() {
        F.pdf(0, 2.0001, 3, 0.444).should.equal(0);
        F.pdf(0, 304.382, 0.0024, 47).should.equal(0);
      });

      it("should be 0 when x < 0", function() {
        F.pdf(-0.00283, 2.0001, 3, 0.444).should.equal(0);
        F.pdf(-2, 304.382, 0.0024, 47).should.equal(0);
        F.pdf(-384.3849, 1.5, 1, 0.4328).should.equal(0);
        F.pdf(-1.5, 0.00000001, 3040, 47).should.equal(0);
      });

      it("should throw an error when dof1 is 0", function(){
        (function(){F.pdf(1.4354, 0, 7, 4);}).should.throw(Error);
      });

      it("should throw an error when dof2 is 0", function(){
        (function(){F.pdf(494, 0.43, 0, 94);}).should.throw(Error);
      });

      it("should throw an error when dof1 is negative", function(){
        (function(){F.pdf(1.4354, -0.992, 7, 4);}).should.throw(Error);
      });

      it("should throw an error when dof2 is negative", function(){
        (function(){F.pdf(54, 0.3832, -38.38, 1.47);}).should.throw(Error);
      });

      it("should throw an error when ncp is negative", function(){
        (function(){F.pdf(54, 0.3832, 38.38, -1.47);}).should.throw(Error);
      });

    });
  });

  // describe("spot test cases", function() {
  //   for (let testCase of generatedTestCases) {
  //     describe("pdfSync", function() {
  //       it("should match the R generated probability density for x", function () {
  //         let doa = digitsOfAgreement(
  //           testCase["pd"],
  //           t.pdf(testCase["x"], testCase["dof"])
  //         );
  //         console.log("expected:", testCase["pd"], ", got:", t.pdf(testCase["x"], testCase["dof"]));
  //         doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
  //       });
  //     });
  //
  //     describe("cdfSync", function () {
  //       it("should match the R generated lower cumulative density for x", function () {
  //         let doa = digitsOfAgreement(
  //           testCase["cdLower"],
  //           t.cdf(testCase["x"], testCase["dof"], true)
  //         );
  //
  //         doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
  //       });
  //
  //       it("should match the R generated upper cumulative density for x", function () {
  //         let doa = digitsOfAgreement(
  //           testCase["cdUpper"],
  //           t.cdf(testCase["x"], testCase["dof"], false)
  //         );
  //
  //         doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
  //       });
  //     });
  //
  //     describe("quantileSync", function(){
  //       it("should match the R generated lower quantile for the lower CDF", function() {
  //         let doa = digitsOfAgreement(
  //           testCase["quantileLLower"],
  //           t.quantile(
  //             testCase["cdLower"],
  //             testCase["dof"],
  //             true
  //           )
  //         );
  //
  //         console.log("x:", testCase["cdLower"], ", dof:", testCase["dof"], ", expected:", testCase["quantileLLower"]);
  //
  //         doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
  //       });
  //
  //       it("should match the R generated upper quantile for the lower CDF", function() {
  //         let doa = digitsOfAgreement(
  //           testCase["quantileLUpper"],
  //           t.quantile(
  //             testCase["cdLower"],
  //             testCase["dof"],
  //             false
  //           )
  //         );
  //
  //         doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
  //       });
  //     });
  //   }

  //});
});