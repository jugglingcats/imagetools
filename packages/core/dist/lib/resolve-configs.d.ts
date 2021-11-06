import { OutputFormat } from '..';
/**
 * This function calculates the cartesian product of two or more array and is straight from stackoverflow ;)
 * Should be replaced with something more legible but works for now.
 * @internal
 */
export declare const cartesian: (...a: any[]) => any;
/**
 * This function builds up all possible combinations the given entries can be combined
 * an returns it as an array of objects that can be given to a the transforms.
 * @param entries The url parameter entries
 * @returns An array of directive options
 */
export declare function resolveConfigs(entries: Array<[string, string[]]>, outputFormats: Record<string, OutputFormat>): Record<string, string | string[]>[];
