import { Plugin } from 'vite';
import { RollupOutput } from 'rollup';
export declare function testEntry(source: string): Plugin;
export declare function getFiles(bundle: RollupOutput | RollupOutput[], pattern: string): (import("rollup").OutputAsset | import("rollup").OutputChunk)[];
