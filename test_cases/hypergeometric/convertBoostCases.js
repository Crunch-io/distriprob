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

const fs = require("fs");

const casesStr1 = fs.readFileSync("/Users/zacharymartin/Desktop/boost_1_62_0/libs/math/test/hypergeometric_dist_data2.ipp", "utf8");
// const casesStr2 = fs.readFileSync("/Users/zacharymartin/Desktop/boost_1_62_0/libs/math/test/igamma_int_data.ipp", "utf8");
// const casesStr3 = fs.readFileSync("/Users/zacharymartin/Desktop/boost_1_62_0/libs/math/test/igamma_med_data.ipp", "utf8");
// const casesStr4 = fs.readFileSync("/Users/zacharymartin/Desktop/boost_1_62_0/libs/math/test/igamma_small_data.ipp", "utf8");
const casesStrs = [casesStr1/*, casesStr2, casesStr3, casesStr4*/];
const caseRegEx = /{\s*SC_\(([^)]+)\)\s*,\s*SC_\(([^)]+)\)\s*,\s*SC_\(([^)]+)\)\s*,\s*SC_\(([^)]+)\)\s*,\s*SC_\(([^)]+)\)\s*,\s*SC_\(([^)]+)\)\s*,\s*SC_\(([^)]+)\)\s*}/g;

let match;
let count = 0;
let cases = [];

for (let casesStr of casesStrs) {
  while ((match = caseRegEx.exec(casesStr)) !== null) {
    let c = {
      successPop: parseFloat(match[1]),
      draws: parseFloat(match[2]),
      totalPop: parseFloat(match[3]),
      sampleSuccesses: parseFloat(match[4]),
      pdf: parseFloat(match[5]),
      cdfLower: parseFloat(match[6]),
      cdfUpper: parseFloat(match[7]),
    };

    count++;
    cases.push(c);
  }
}


let fileContentStr = `
/**
 * (C) John Maddock 2008
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
 
 module.exports = ${JSON.stringify(cases, null, 2)};
`;

fs.writeFileSync("testCases_data2.js", fileContentStr);

console.log("case count:", count);

