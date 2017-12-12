import { IRandomState } from "./random";
export declare class Laborer {
    private static readonly DEPENDENCIES;
    private resolutionQueue;
    private thread;
    private dead;
    constructor();
    sendMessageToThread(msg: any): Promise<number>;
    private resolve(value);
    terminate(): void;
    private static createScriptFunction(dependencies);
    readonly ready: Promise<number>;
    private getThreadPromise<T>(className, functionName, args);
    readonly beta: {
        pdf: (x: number, alpha: number, beta: number, ncp?: number) => Promise<number>;
        cdf: (x: number, alpha: number, beta: number, lowerTail?: boolean, ncp?: number) => Promise<number>;
        quantile: (x: number, alpha: number, beta: number, lowerTail?: boolean, ncp?: number) => Promise<number>;
        random: (n: number, alpha: number, beta: number, ncp?: number, seed?: string | number | IRandomState | undefined) => Promise<number[]>;
    };
    readonly binomial: {
        pdf: (k: number, trials: number, probSuccess: number) => Promise<number>;
        cdf: (k: number, trials: number, probSuccess: number, lowerTail?: boolean) => Promise<number>;
        quantile: (p: number, trials: number, probSuccess: number, lowerTail?: boolean) => Promise<number>;
        random: (n: number, trials: number, probSuccess: number, seed?: string | number | undefined) => Promise<number[]>;
    };
    readonly chi2: {
        pdf: (x: number, degreesOfFreedom: number, ncp?: number) => Promise<number>;
        cdf: (x: number, degreesOfFreedom: number, lowerTail?: boolean, ncp?: number) => Promise<number>;
        quantile: (p: number, degreesOfFreedom: number, lowerTail?: boolean, ncp?: number) => Promise<number>;
        random: (n: number, degreesOfFreedom: number, ncp?: number, seed?: string | number | IRandomState | undefined) => Promise<number[]>;
    };
    readonly exponential: {
        pdf: (x: number, lambda: number) => Promise<number>;
        cdf: (x: number, lambda: number, lowerTail?: boolean) => Promise<number>;
        quantile: (p: number, lambda: number, lowerTail?: boolean) => Promise<number>;
        random: (n: number, lambda: number, seed?: string | number | IRandomState | undefined) => Promise<number[]>;
    };
    readonly F: {
        pdf: (x: number, dof1: number, dof2: number, ncp?: number) => Promise<number>;
        cdf: (x: number, dof1: number, dof2: number, lowerTail?: boolean, ncp?: number) => Promise<number>;
        quantile: (p: number, dof1: number, dof2: number, lowerTail?: boolean, ncp?: number) => Promise<number>;
        random: (n: number, dof1: number, dof2: number, ncp?: number, seed?: string | number | IRandomState | undefined) => Promise<number[]>;
    };
    readonly gamma: {
        pdf: (x: number, shape: number, scale: number) => Promise<number>;
        cdf: (x: number, shape: number, scale: number, lowerTail?: boolean) => Promise<number>;
        quantile: (p: number, shape: number, scale: number, lowerTail?: boolean) => Promise<number>;
        random: (n: number, shape: number, scale: number, seed?: string | number | IRandomState | undefined) => Promise<number[]>;
    };
    readonly hypergeometric: {
        pdf: (sampleSuccesses: number, draws: number, successPop: number, totalPop: number) => Promise<number>;
        cdf: (sampleSuccesses: number, draws: number, successPop: number, totalPop: number, lowerTail?: boolean) => Promise<number>;
        quantile: (p: number, draws: number, successPop: number, totalPop: number, lowerTail?: boolean) => Promise<number>;
        random: (n: number, draws: number, successPop: number, totalPop: number, seed?: string | number | IRandomState | undefined) => Promise<number[]>;
    };
    readonly negativeBinomial: {
        pdf: (numFailures: number, numSuccesses: number, probSuccess: number) => Promise<number>;
        cdf: (numFailures: number, numSuccesses: number, probSuccess: number, lowerTail?: boolean | undefined) => Promise<number>;
        quantile: (p: number, numSuccesses: number, probSuccess: number, lowerTail?: boolean | undefined) => Promise<number>;
        random: (n: number, numSuccesses: number, probSuccess: number, seed?: string | number | IRandomState | undefined) => Promise<number[]>;
    };
    readonly normal: {
        pdf: (x: number, mu?: number | undefined, sigma?: number | undefined) => Promise<number>;
        cdf: (x: number, mu?: number | undefined, sigma?: number | undefined, lowerTail?: boolean) => Promise<number>;
        quantile: (p: number, mu?: number | undefined, sigma?: number | undefined, lowerTail?: boolean) => Promise<number>;
        random: (n: number, mu?: number | undefined, sigma?: number | undefined, seed?: string | number | IRandomState | undefined) => Promise<number[]>;
    };
    readonly poisson: {
        pdf: (k: number, lambda: number) => Promise<number>;
        cdf: (k: number, lambda: number, lowerTail?: boolean) => Promise<number>;
        quantile: (p: number, lambda: number, lowerTail?: boolean) => Promise<number>;
        random: (n: number, lambda: number, seed?: string | number | undefined) => Promise<number[]>;
    };
    readonly skewNormal: {
        pdf: (x: number, location?: number | undefined, scale?: number | undefined, shape?: number | undefined) => Promise<number>;
        cdf: (x: number, location?: number | undefined, scale?: number | undefined, shape?: number | undefined, lowerTail?: boolean) => Promise<number>;
        quantile: (p: number, location?: number | undefined, scale?: number | undefined, shape?: number | undefined, lowerTail?: boolean) => Promise<number>;
        random: (n: number, location?: number | undefined, scale?: number | undefined, shape?: number | undefined, seed?: string | number | IRandomState | undefined) => Promise<number[]>;
    };
    readonly t: {
        pdf: (x: number, degreesOfFreedom: number, ncp?: number) => Promise<number>;
        cdf: (x: number, degreesOfFreedom: number, lowerTail?: boolean, ncp?: number) => Promise<number>;
        quantile: (p: number, degreesOfFreedom: number, lowerTail?: boolean, ncp?: number) => Promise<number>;
        random: (n: number, degreesOfFreedom: number, ncp?: number, seed?: string | number | IRandomState | undefined) => Promise<number[]>;
    };
    readonly uniform: {
        pdf: (x: number, lowerSupportBound: number, upperSupportBound: number) => Promise<number>;
        cdf: (x: number, lowerSupportBound: number, upperSupportBound: number, lowerTail?: boolean) => Promise<number>;
        quantile: (x: number, lowerSupportBound: number, upperSupportBound: number, lowerTail?: boolean) => Promise<number>;
        random: (n: number, lowerSupportBound: number, upperSupportBound: number, seed?: string | number | undefined) => Promise<number[]>;
    };
}
