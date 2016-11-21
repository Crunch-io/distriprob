"use strict";

import {should} from "chai";
import {readFileSync} from "fs";
import {t} from "../../index";
import {digitsOfAgreement} from "../digitCompare";

should();

const DIGIT_AGREE_TOLERANCE = 11;
const generatedTestCases = JSON.parse(readFileSync(__dirname + "/../../../test_cases/studentsT/generatedCases.json", "utf8"));


describe("students T distribution", function() {

  describe("generated cases", function() {
    for (let testCase of generatedTestCases) {
      describe("pdfSync", function() {
        it("should match the R generated probability density for x", function () {
          let doa = digitsOfAgreement(
            testCase["pd"],
            t.pdf(testCase["x"], testCase["dof"])
          );
          console.log("expected:", testCase["pd"], ", got:", t.pdf(testCase["x"], testCase["dof"]));
          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });
      });

      describe("cdfSync", function () {
        it("should match the R generated lower cumulative density for x", function () {
          let doa = digitsOfAgreement(
            testCase["cdLower"],
            t.cdf(testCase["x"], testCase["dof"], true)
          );

          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });

        it("should match the R generated upper cumulative density for x", function () {
          let doa = digitsOfAgreement(
            testCase["cdUpper"],
            t.cdf(testCase["x"], testCase["dof"], false)
          );

          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });
      });

      describe("quantileSync", function(){
        it("should match the R generated lower quantile for the lower CDF", function() {
          let doa = digitsOfAgreement(
            testCase["quantileLLower"],
            t.quantile(
              testCase["cdLower"],
              testCase["dof"],
              true
            )
          );

          console.log("x:", testCase["cdLower"], ", dof:", testCase["dof"], ", expected:", testCase["quantileLLower"]);

          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });

        it("should match the R generated upper quantile for the lower CDF", function() {
          let doa = digitsOfAgreement(
            testCase["quantileLUpper"],
            t.quantile(
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

