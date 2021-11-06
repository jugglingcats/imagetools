import { TransformFactory } from '../types';
export declare const formatValues: readonly ["avif", "jpg", "jpeg", "png", "heif", "heic", "webp", "tiff"];
export declare type FormatValue = typeof formatValues[number];
export interface FormatOptions {
    format: FormatValue;
}
export declare const format: TransformFactory<FormatOptions>;
