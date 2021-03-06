"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var chai_1 = require("chai");
var index_1 = require("../../index");
var digitCompare_1 = require("../digitCompare");
var testCasesI = require("../../../test_cases/bessel/testCases_i");
var testCasesJ = require("../../../test_cases/bessel/testCases_j");
var testCasesK = require("../../../test_cases/bessel/testCases_k");
var testCasesY = require("../../../test_cases/bessel/testCases_y");
var testCasesSphJ = require("../../../test_cases/bessel/testCases_sph_j");
var testCasesSphY = require("../../../test_cases/bessel/testCases_sph_y");
var testCasesIPrime = require("../../../test_cases/bessel/testCases_i_prime");
var testCasesJPrime = require("../../../test_cases/bessel/testCases_j_prime");
var testCasesKPrime = require("../../../test_cases/bessel/testCases_k_prime");
var testCasesYPrime = require("../../../test_cases/bessel/testCases_y_prime");
chai_1.should();
var DIGIT_AGREE_TOLERANCE = 13;
var DIGIT_AGREE_TOLERANCE_K = 12;
var DIGIT_AGREE_TOLERANCE_Y = 12;
var DIGIT_AGREE_TOLERANCE_SPH_J = 12;
var DIGIT_AGREE_TOLERANCE_SPH_Y = 12;
var DIGIT_AGREE_TOLERANCE_J_PRIME = 12;
var DIGIT_AGREE_TOLERANCE_Y_PRIME = 11;
describe("bessel functions", function () {
    describe("i", function () {
        describe("accuracy tests", function () {
            describe("boost data set", function () {
                var _loop_1 = function (testCase) {
                    it("should match high accuracy estimates of function values", function () {
                        var testValue = index_1.bessel.i(testCase["v"], testCase["x"]);
                        // console.log(`v: ${testCase["v"]}, x: ${testCase["x"]}, got: ${testValue}, expected: ${testCase["result"]}`);
                        var doa = digitCompare_1.digitsOfAgreement(testCase["result"], testValue);
                        if (testCase["result"] < 1 / Number.MAX_VALUE) {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE - 4);
                        }
                        else {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
                        }
                    });
                };
                for (var _i = 0, testCasesI_1 = testCasesI; _i < testCasesI_1.length; _i++) {
                    var testCase = testCasesI_1[_i];
                    _loop_1(testCase);
                }
            });
        });
    });
    describe("j", function () {
        describe("accuracy tests", function () {
            describe("boost data set", function () {
                var _loop_2 = function (testCase) {
                    it("should match high accuracy estimates of function values", function () {
                        var testValue = index_1.bessel.j(testCase["v"], testCase["x"]);
                        // console.log(`v: ${testCase["v"]}, x: ${testCase["x"]}, got: ${testValue}, expected: ${testCase["result"]}`);
                        var doa = digitCompare_1.digitsOfAgreement(testCase["result"], testValue);
                        if (testCase["result"] < 1 / Number.MAX_VALUE) {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE - 4);
                        }
                        else {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
                        }
                    });
                };
                for (var _i = 0, testCasesJ_1 = testCasesJ; _i < testCasesJ_1.length; _i++) {
                    var testCase = testCasesJ_1[_i];
                    _loop_2(testCase);
                }
            });
        });
    });
    describe("k", function () {
        describe("accuracy tests", function () {
            describe("boost data set", function () {
                var _loop_3 = function (testCase) {
                    it("should match high accuracy estimates of function values", function () {
                        var testValue = index_1.bessel.k(testCase["v"], testCase["x"]);
                        // console.log(`v: ${testCase["v"]}, x: ${testCase["x"]}, got: ${testValue}, expected: ${testCase["result"]}`);
                        var doa = digitCompare_1.digitsOfAgreement(testCase["result"], testValue);
                        if (testCase["result"] < 1 / Number.MAX_VALUE) {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_K - 4);
                        }
                        else {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_K);
                        }
                    });
                };
                for (var _i = 0, testCasesK_1 = testCasesK; _i < testCasesK_1.length; _i++) {
                    var testCase = testCasesK_1[_i];
                    _loop_3(testCase);
                }
            });
        });
    });
    describe("y", function () {
        describe("accuracy tests", function () {
            describe("boost data set", function () {
                var _loop_4 = function (testCase) {
                    it("should match high accuracy estimates of function values", function () {
                        var testValue = index_1.bessel.y(testCase["v"], testCase["x"]);
                        // console.log(`v: ${testCase["v"]}, x: ${testCase["x"]}, got: ${testValue}, expected: ${testCase["result"]}`);
                        var doa = digitCompare_1.digitsOfAgreement(testCase["result"], testValue);
                        if (testCase["result"] < 1 / Number.MAX_VALUE) {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_Y - 4);
                        }
                        else {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_Y);
                        }
                    });
                };
                for (var _i = 0, testCasesY_1 = testCasesY; _i < testCasesY_1.length; _i++) {
                    var testCase = testCasesY_1[_i];
                    _loop_4(testCase);
                }
            });
        });
    });
    describe("spherical j", function () {
        describe("accuracy tests", function () {
            describe("boost data set", function () {
                var _loop_5 = function (testCase) {
                    it("should match high accuracy estimates of function values", function () {
                        var testValue = index_1.bessel.sphJ(testCase["v"], testCase["x"]);
                        //console.log(`v: ${testCase["v"]}, x: ${testCase["x"]}, got: ${testValue}, expected: ${testCase["result"]}`);
                        var doa = digitCompare_1.digitsOfAgreement(testCase["result"], testValue);
                        if (testCase["result"] < 1 / Number.MAX_VALUE) {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_SPH_J - 4);
                        }
                        else {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_SPH_J);
                        }
                    });
                };
                for (var _i = 0, testCasesSphJ_1 = testCasesSphJ; _i < testCasesSphJ_1.length; _i++) {
                    var testCase = testCasesSphJ_1[_i];
                    _loop_5(testCase);
                }
            });
        });
    });
    describe("spherical y", function () {
        describe("accuracy tests", function () {
            describe("boost data set", function () {
                var _loop_6 = function (testCase) {
                    it("should match high accuracy estimates of function values", function () {
                        var testValue = index_1.bessel.sphY(testCase["v"], testCase["x"]);
                        // console.log(`v: ${testCase["v"]}, x: ${testCase["x"]}, got: ${testValue}, expected: ${testCase["result"]}`);
                        var doa = digitCompare_1.digitsOfAgreement(testCase["result"], testValue);
                        if (testCase["result"] < 1 / Number.MAX_VALUE) {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_SPH_Y - 4);
                        }
                        else {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_SPH_Y);
                        }
                    });
                };
                for (var _i = 0, testCasesSphY_1 = testCasesSphY; _i < testCasesSphY_1.length; _i++) {
                    var testCase = testCasesSphY_1[_i];
                    _loop_6(testCase);
                }
            });
        });
    });
    describe("i prime", function () {
        describe("accuracy tests", function () {
            describe("boost data set", function () {
                var _loop_7 = function (testCase) {
                    it("should match high accuracy estimates of function values", function () {
                        var testValue = index_1.bessel.iPrime(testCase["v"], testCase["x"]);
                        var doa = digitCompare_1.digitsOfAgreement(testCase["result"], testValue);
                        if (testCase["result"] < 1 / Number.MAX_VALUE) {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE - 4);
                        }
                        else {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
                        }
                    });
                };
                for (var _i = 0, testCasesIPrime_1 = testCasesIPrime; _i < testCasesIPrime_1.length; _i++) {
                    var testCase = testCasesIPrime_1[_i];
                    _loop_7(testCase);
                }
            });
        });
    });
    describe("j prime", function () {
        describe("accuracy tests", function () {
            describe("boost data set", function () {
                var _loop_8 = function (testCase) {
                    it("should match high accuracy estimates of function values", function () {
                        var testValue = index_1.bessel.jPrime(testCase["v"], testCase["x"]);
                        // console.log(`v: ${testCase["v"]}, x: ${testCase["x"]}, got: ${testValue}, expected: ${testCase["result"]}`);
                        var doa = digitCompare_1.digitsOfAgreement(testCase["result"], testValue);
                        if (testCase["result"] < 1 / Number.MAX_VALUE) {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_J_PRIME - 7);
                        }
                        else {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_J_PRIME);
                        }
                    });
                };
                for (var _i = 0, testCasesJPrime_1 = testCasesJPrime; _i < testCasesJPrime_1.length; _i++) {
                    var testCase = testCasesJPrime_1[_i];
                    _loop_8(testCase);
                }
            });
        });
    });
    describe("k prime", function () {
        describe("accuracy tests", function () {
            describe("boost data set", function () {
                var _loop_9 = function (testCase) {
                    it("should match high accuracy estimates of function values", function () {
                        var testValue = index_1.bessel.kPrime(testCase["v"], testCase["x"]);
                        var doa = digitCompare_1.digitsOfAgreement(testCase["result"], testValue);
                        if (testCase["result"] < 1 / Number.MAX_VALUE) {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE - 4);
                        }
                        else {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE);
                        }
                    });
                };
                for (var _i = 0, testCasesKPrime_1 = testCasesKPrime; _i < testCasesKPrime_1.length; _i++) {
                    var testCase = testCasesKPrime_1[_i];
                    _loop_9(testCase);
                }
            });
        });
    });
    describe("y prime", function () {
        describe("accuracy tests", function () {
            describe("boost data set", function () {
                var _loop_10 = function (testCase) {
                    it("should match high accuracy estimates of function values", function () {
                        var testValue = index_1.bessel.yPrime(testCase["v"], testCase["x"]);
                        var doa = digitCompare_1.digitsOfAgreement(testCase["result"], testValue);
                        if (testCase["result"] < 1 / Number.MAX_VALUE) {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_Y_PRIME - 4);
                        }
                        else {
                            doa.should.be.greaterThan(DIGIT_AGREE_TOLERANCE_Y_PRIME);
                        }
                    });
                };
                for (var _i = 0, testCasesYPrime_1 = testCasesYPrime; _i < testCasesYPrime_1.length; _i++) {
                    var testCase = testCasesYPrime_1[_i];
                    _loop_10(testCase);
                }
            });
        });
    });
});
