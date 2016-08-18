"use strict";

/**
 * Created by zacharymartin on August 16, 2016.
 */


export function rootFind(fctn, derivativeFctn, value, initialRootEstimate, max, min){
  var root = newton(fctn, derivativeFctn, value, initialRootEstimate, max, min);

  if (root === "non-convergent") {
    root = bisection(fctn, value, max, min);
  }

  return root;
}


export function newton(fctn, derivativeFctn, value, initialRootEstimate, max, min){
  const MAX_ITERATIONS = 1000;
  const RELATIVE_ERROR_TOLERANCE = 1e-17;
  let iterations = 0;
  let oldX = initialRootEstimate;
  let x;
  let approximateRelativeError;
  let fOfX;
  let fPrimeOfX;

  while (true){
    fOfX = fctn(oldX);


    fPrimeOfX = derivativeFctn(oldX);
    x = oldX - ((fOfX - value) / fPrimeOfX);

    if (min !== null && x < min){
      x = 1e-14 + min;
    } else if ( max !== null && x > max){
      x = max - 1e-14;
    }

    if (x === Infinity || x === - Infinity || fPrimeOfX === 0) {
      return "non-convergent";
    }

    approximateRelativeError = Math.abs(x - oldX) / Math.abs(value);

    if (approximateRelativeError < RELATIVE_ERROR_TOLERANCE
      || iterations > MAX_ITERATIONS){
      break;
    }

    oldX = x;
    iterations ++;
  }

  return x;
}

export function bisection(fctn, value, max, min){
  const MAX_ITERATIONS = 1000;
  const RELATIVE_ERROR_TOLERANCE = 0.00000000000001;
  let upper_root_bound;
  let upper_root_bound_function_value;
  let lower_root_bound;
  let lower_root_bound_function_value;
  let approximateRelativeError;
  let iterations = 0;
  let x;
  let oldX;
  let fOfOldX;

  if (max === null){
    upper_root_bound = 1;

    do {
      upper_root_bound = 2 * Math.abs(upper_root_bound);
      upper_root_bound_function_value = fctn(upper_root_bound) - value;
    } while (upper_root_bound_function_value < 0);
  } else {
    upper_root_bound = max;
    upper_root_bound_function_value = fctn(max) - value;
  }

  if (min === null){
    lower_root_bound = -1;

    do {
      lower_root_bound = -2 * Math.abs(lower_root_bound);
      lower_root_bound_function_value = fctn(lower_root_bound) - value;
    } while (lower_root_bound_function_value > 0);
  } else {
    lower_root_bound = min;
    lower_root_bound_function_value = fctn(min) - value;
  }

  oldX = (upper_root_bound + lower_root_bound)/2;


  do {
    fOfOldX = fctn(oldX) - value;

    if (fOfOldX > 0){
      upper_root_bound = oldX;
      upper_root_bound_function_value = fOfOldX;
    } else {
      lower_root_bound = oldX;
      lower_root_bound_function_value = fOfOldX;
    }

    x = (upper_root_bound + lower_root_bound)/2;

    approximateRelativeError = Math.abs(x - oldX) / Math.abs(value);

    oldX = x;
    iterations ++;
  } while (approximateRelativeError >= RELATIVE_ERROR_TOLERANCE
  && iterations < MAX_ITERATIONS);

  return x;
}


export function discreteQuantileFind(simplifiedCDF, p, max, min) {
  if (max === null) {
    // find a value of max where cdf(max) > value

    for (max = 1; simplifiedCDF(max) < p; max *= 2) {
      // do nothing here
    }
  }

  if (min === null) {
    // find a value of min where cdf(min) < value
    for (min = -1; simplifiedCDF(min) >= p; min *= 2) {
      // do nothing here
    }
  }

  let center;
  let centerFloor;
  let centerCeil;
  let maxMinAve;

  while(max - min > 1) {
    maxMinAve = ((max - min)/2) + min;
    centerFloor = Math.floor(maxMinAve);
    centerCeil = Math.ceil(maxMinAve);

    if (centerFloor === min) {
      if (centerCeil === max) {
        break;
      }
      center = centerCeil;
    } else {
      center = centerFloor;
    }

    if (simplifiedCDF(center) >= p) {
      max = center;
    } else {
      min = center;
    }
  }

  return max;
}