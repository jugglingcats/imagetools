import { Plugin, RollupBuild } from 'rollup';
export declare function testEntry(value: string): Plugin;
export declare function getFiles(bundle: RollupBuild, pattern: string): Promise<(import("rollup").OutputAsset | import("rollup").OutputChunk)[]>;
