"use strict";
import {asyncGen} from "./async";

export function randSync(n, quantileFctn, quantileFctnArgs, seed, randoms) {
  if (!randoms) {
    randoms = [];
    const sr = require("../../node_modules/seedrandom/seedrandom.min");
    let rng;
    if (seed) {
      rng = sr(seed);
    } else {
      rng = sr();
    }

    while (randoms.length < n) {
      let rand = rng();

      if (rand !== 0) {
        randoms.push(rng());
      }
    }
  }

  const result: any[] = [];

  while (randoms.length > 0) {
    const args: any[] = [randoms.pop()].concat(quantileFctnArgs);

    result.push(quantileFctn.apply(null, args));
  }

  return result;
}

export function rand(n, quantileFctn, quantileFctnParams, seed, fctnDependencies) {
  const randoms: any = [];
  const sr = require("../../node_modules/seedrandom/seedrandom.min");
  let rng;
  if (seed) {
    rng = sr(seed);
  } else {
    rng = sr();
  }

  while (randoms.length < n) {
    let rand = rng();

    if (rand !== 0) {
      randoms.push(rng());
    }
  }

  const dependencies: any[] = [quantileFctn].concat(fctnDependencies);
  const randSyncArgs: any[] = [n, quantileFctn, quantileFctnParams, null, randoms];

  return asyncGen(dependencies, randSync, randSyncArgs);
}

