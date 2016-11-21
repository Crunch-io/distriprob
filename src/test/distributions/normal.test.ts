"use strict";
import {should} from "chai";
import {readFileSync} from "fs";
import {normal} from "../../index";
import {digitsOfAgreement} from "../digitCompare";

should();


const DIGIT_AGREE_TOLERANCE = 11;
const generatedTestCases = JSON.parse(readFileSync(__dirname + "/../../../test_cases/normal/generatedCases.json", "utf8"));


describe("normal distribution", function() {

  describe("generated cases", function() {

    for (let testCase of generatedTestCases) {
      describe("pdfSync", function() {
        it("should match the R generated probability density for x", function () {
          let doa = digitsOfAgreement(
            testCase["pd"],
            normal.pdf(testCase["x"], testCase["mu"], testCase["sigma"])
          );

          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });
      });

      describe("cdfSync", function () {
        it("should match the R generated lower cumulative density for x", function () {
          let doa = digitsOfAgreement(
            testCase["cdLower"],
            normal.cdf(testCase["x"], testCase["mu"], testCase["sigma"], true)
          );

          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });

        it("should match the R generated upper cumulative density for x", function () {
          let doa = digitsOfAgreement(
            testCase["cdUpper"],
            normal.cdf(testCase["x"], testCase["mu"], testCase["sigma"], false)
          );

          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });
      });

      describe("quantileSync", function(){
        it("should match the R generated lower quantile for the lower CDF", function() {
          let doa = digitsOfAgreement(
            testCase["quantileLLower"],
            normal.quantile(
              testCase["cdLower"],
              testCase["mu"],
              testCase["sigma"],
              true
            )
          );

          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });

        it("should match the R generated upper quantile for the lower CDF", function() {
          let doa = digitsOfAgreement(
            testCase["quantileLUpper"],
            normal.quantile(
              testCase["cdLower"],
              testCase["mu"],
              testCase["sigma"],
              false
            )
          );

          doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
        });
      });
    }

  });
});

