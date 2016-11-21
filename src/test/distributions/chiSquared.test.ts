"use strict";

import {should} from "chai";
import {readFileSync} from "fs";
import {chi2} from "../../index";
import {digitsOfAgreement} from "../digitCompare";

should();

const DIGIT_AGREE_TOLERANCE = 10;
const generatedTestCases = JSON.parse(readFileSync(__dirname + "/../../../test_cases/chiSquared/generatedCases.json", "utf8"));


describe("chi squared distribution", function() {

  describe("generated cases", function() {
    for (let testCase of generatedTestCases) {
      describe("pdfSync", function() {
        it("should match the R generated probability density for x", function () {
          let doa = digitsOfAgreement(
            testCase["pd"],
            chi2.pdf(testCase["x"], testCase["dof"])
          );

          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });
      });

      describe("cdfSync", function () {
        it("should match the R generated lower cumulative density for x", function () {
          let doa = digitsOfAgreement(
            testCase["cdLower"],
            chi2.cdf(testCase["x"], testCase["dof"], true)
          );

          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });

        it("should match the R generated upper cumulative density for x", function () {
          let doa = digitsOfAgreement(
            testCase["cdUpper"],
            chi2.cdf(testCase["x"], testCase["dof"], false)
          );

          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });
      });

      describe("quantileSync", function(){
        it("should match the R generated lower quantile for the lower CDF", function() {
          let doa = digitsOfAgreement(
            testCase["quantileLLower"],
            chi2.quantile(
              testCase["cdLower"],
              testCase["dof"],
              true
            )
          );



          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });

        it("should match the R generated upper quantile for the lower CDF", function() {
          let doa = digitsOfAgreement(
            testCase["quantileLUpper"],
            chi2.quantile(
              testCase["cdLower"],
              testCase["dof"],
              false
            )
          );

          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });
      });
    }

  });
});
