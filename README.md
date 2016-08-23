distriprob
==========

Motivation
----------

The distriprob library allows the calculation of probility density (_mass_ in the case of
discrete distributions), cumulative distribution, and quantile (a.k. inverse cdf)
function values in Node or in the browser. The distriprob library is written in typescript
so users of the libary can take advantage of intellisense on the module exports without
any need to worry about downloading d.ts files. Plain old javascript users can also use
the library, but without the benefits of typescript. The asynchronous (non-Sync) functions
in the library use web workers( or webworker-threads in Node) to avoid clogging up the
event loop with calculations. The library is tested against the equivalent functionality
in R and every attempt is made to make the library as accurate (compared to R) and fast as
possible.


Instalation and Usage
---------------------

The distriprob libaray can be downloaded using NPM:

    npm install distriprob

Or by cloning the github repository:

```bash
git clone https://github.com/zachmart/distriprob.git
cd distriprob
npm run build
```

The distriprob libary is designed to be used with __nodejs__ or in the browser. Distriprob
is written in typescript and transpiled to ES6. So the package may be imported using ES6
imports:

```javascript
import * as distriprob from "distriprob";
```

or using *commonjs* `require`'s:

```javascript
const distriprob = require("distriprob");
```

In addition, the distriprob library contains a browserify-ed bundle for use in the browser
with `<script>` tags which will introduce the global variable `distriprob`:
```html
<script src="node_modules/distriprob/bundle.js" type="text/javascript></script>
```
Supported Distributions
-----------------------

###Continuous
1. [Normal](#normal) (`distriprob.normal`)
2. [Student's t](#student's t) (`distriprob.t`)
3. [Chi Squared](#chi Squared) (`distriprob.chi2`)
4. [F](#f) (`distriprob.F`)

###Discrete
5. [Binomial](#binomial) (`distriprob.binomial`)
6. [Poisson](#poisson) (`distriprob.poisson`)
7. [Hypergeometric](#hypergeometric) (`distriprob.hypergeometric`)

The functionality for each of these distributions is located directly on the exported
`distriprob` object. On each of the distribution objects there are three functions:
pdf(pmf for discrete distributions), cdf, and quantile for the probability density
(mass), cumulative distribution, and quantile (inverse cdf) functions respectively.
Each of these functions has a synchronous version (with the "Sync" suffix) and an
asynchronous version which returns an ES6 promise for the desired value.
Examples:

    console.log(distriprob.normal.pdfSync(0, 0, 1));   // 0.3989422804014327
    distriprob.possion.quantile(0.5, 1).then((result) => {
      console.log(result);                            // 1
    });

API by Distribution
-------------------

###Continuous Distributions 

####Normal
Given a random variable X with a Normal probability distribution with mean _mu_ and
standard deviation _sigma_:

* `distriprob.normal.pdf(x, mu, sigma)` returns an ES6 promise for the numeric probability
density of X where:
  * x: number - is the value of X for the desired density
  * mu: number - is the mean of X, defaults to 0
  * sigma: number > 0 - is the standard deviation of X, defaults to 1
* `distriprob.normal.pdfSync(x, mu, sigma)` returns the numeric probability density of X 
where:
  * x: number - is the value of X for the desired density
  * mu: number - is the mean of X, defaults to 0
  * sigma: number > 0 - is the standard deviation of X, defaults to 1
* `distriprob.normal.cdf(x, mu, sigma, lowerTail)` returns an ES6 promise for the numeric 
cumulative distribution probability that X falls in the region delimited by the argument 
values below, where:
  * x: number - is the value of X bounding the region of accumulation for the desired 
  cumulative distribution
  * mu: number - is the mean of X, defaults to 0
  * sigma: number > 0 - is the standard deviation of X, defaults to 1
  * lowerTail: boolean - determines whether the calculated cumulative distribution is for
all values in the lower or upper tail (those above or below the given _x_)
* `distriprob.normal.cdfSync(x, mu, sigma)` returns the numeric cumulative distribution 
probability that X falls in the region delimited by the argument values below, where:
  * x: number - is the value of X bounding the region of accumulation for the desired 
cumulative distribution
  * mu: number - is the mean of X, defaults to 0
  * sigma: number > 0 - is the standard deviation of X, defaults to 1
  * lowerTail: boolean - determines whether the calculated cumulative distribution is for
  all values in the lower or upper tail (those above or below the given _x_)
####Student's t

####Chi Squared

####F

###Discrete Distributions 

####Binomial

####Poisson

####Hypergeometric


License
-------
**MIT** --- open source