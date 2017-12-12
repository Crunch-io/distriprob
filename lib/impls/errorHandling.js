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
var Random = require("./random").Random;
function check(value, parameterName, functionName, type) {
    if ((type !== "boolean" && type !== "number/string" && type !== "seed") &&
        typeof value !== "number") {
        throw new Error("The function " + functionName + " parameter \"" + parameterName + "\" must be" + "" + " numeric, the given argument value is of type: " + typeof value + ", and value: " + value);
    }
    if (type === "boolean" && typeof value !== "boolean") {
        throw new Error("The function " + functionName + " parameter \"" + parameterName + "\" must be" + "" + " a boolean, the given argument value is of type: " + typeof value + ", and value: " + value);
    }
    if (type === "number/string" && typeof value !== "number" && typeof value !== "string"
        && !Random.isIRandomState(value)) {
        throw new Error("The function " + functionName + " parameter \"" + parameterName + "\" must be" + "" + " either a number or a string, the given argument value is of type: " + typeof value + ", and value: " + value);
    }
    if (type === "seed" && typeof value !== "number" && typeof value !== "string" &&
        !Random.isIRandomState(value)) {
        throw new Error("The function " + functionName + " parameter \"" + parameterName + "\" must be" + "" + " either a number, a string, or an IRandomState object, the given argument value" + "" + " is of type: " + typeof value + ", and value: " + value);
    }
    if (type === "probability" && (value > 1 || value < 0)) {
        throw new Error("The function " + functionName + " parameter \"" + parameterName + "\" must be" + "" + " between 0 and 1 inclusive, the given argument value is: " + value);
    }
    if ((type === "integer" ||
        type === "positive_integer" ||
        type === "nonnegative_integer") &&
        value !== Math.trunc(value)) {
        throw new Error("The function " + functionName + " parameter \"" + parameterName + "\" must be" + "" + " an integer, the given argument value is: " + value);
    }
    if ((type === "positive_real" || type === "positive_integer") && value <= 0) {
        throw new Error("The function " + functionName + " parameter \"" + parameterName + "\" must be" + "" + " greater than 0, the given argument value is: " + value);
    }
    if ((type === "nonnegative_real" || type === "nonnegative_integer") && value < 0) {
        throw new Error("The function " + functionName + " parameter \"" + parameterName + "\" must be" + "" + " greater than or equal to 0, the given argument value is: " + value);
    }
    return;
}
exports.check = check;