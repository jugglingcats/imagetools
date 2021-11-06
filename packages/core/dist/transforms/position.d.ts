import { TransformOption } from '../types';
export declare const positionValues: readonly ["top", "right top", "right", "right bottom", "bottom", "left bottom", "left", "left top", "north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest", "center", "centre", "entropy", "attention"];
export declare const positionShorthands: string[];
export declare type PositionValue = typeof positionValues[number];
export interface PositionOptions {
    position: PositionValue;
}
export declare const getPosition: TransformOption<PositionOptions, PositionValue>;
