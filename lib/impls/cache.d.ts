import { Primes as PrimeType } from "./primeFactors";
export declare class Cache {
    primes: PrimeType;
    constructor(config?: {
        maxPrimesTable?: number;
    });
}
