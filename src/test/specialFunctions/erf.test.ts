"use strict";

/**
 * (C) Copyright Zachary Martin 2016.
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
import {error} from "../../index";
import {digitsOfAgreement} from "../digitCompare";
const testCasesFunction = require("../../../test_cases/errorFunction/testCases");
const testCasesInv = require("../../../test_cases/errorFunction/testCases_inv");
const testCasesInvComp = require("../../../test_cases/errorFunction/testCases_inv_comp");


should();

const DIGIT_AGREE_TOLERANCE = 14;
const DIGIT_AGREE_TOLERANCE_COMP = 12;



describe("error function", function() {

  describe("function", function() {
    describe("accuracy tests", function() {
      describe("boost data set", function() {
        for (let testCase of testCasesFunction) {
          it("should match high accuracy estimates of function values", function () {
            let testValue = error.function(
              testCase["z"],
              false
            );

            //console.log(`z: ${testCase["z"]}, got: ${testValue}, expected: ${testCase["erf"]}`);

            let doa = digitsOfAgreement(testCase["erf"], testValue);
            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
          });

          it("should match high accuracy estimates of function values - complement", function () {
            let testValue = error.function(
              testCase["z"],
              true
            );

            //console.log(`z: ${testCase["z"]}, got: ${testValue}, expected: ${testCase["erfc"]}`);

            let doa = digitsOfAgreement(testCase["erfc"], testValue);

            const toleranceAdjustment = testCase["erfc"] < 1 / Number.MAX_VALUE ?
              300 + Math.log10(testCase["erfc"])
              :
              0;

            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_COMP + toleranceAdjustment);
          });
        }
      });
    });
  });

  describe("inverse", function() {
    describe("accuracy tests", function() {
      describe("boost data set", function() {
        for (let testCase of testCasesInv) {
          it("should match high accuracy estimates of function values", function () {
            let testValue = error.functionInverse(
              testCase["erf"],
              false
            );

            //console.log(`erf: ${testCase["erf"]}, got: ${testValue}, expected: ${testCase["z"]}`);

            let doa = digitsOfAgreement(testCase["z"], testValue);
            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
          });
        }
      });
    });
  });

  describe("inverse complement", function() {
    describe("accuracy tests", function() {
      describe("boost data set", function() {
        for (let testCase of testCasesInvComp) {
          it("should match high accuracy estimates of function values", function () {
            let testValue = error.functionInverse(
              testCase["erfc"],
              true
            );

            //console.log(`erfc: ${testCase["erfc"]}, got: ${testValue}, expected: ${testCase["z"]}`);

            let doa = digitsOfAgreement(testCase["z"], testValue);
            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
          });
        }
      });
    });
  });

});