import { builtins, builtinOutputFormats, parseURL, extractEntries, resolveConfigs, loadImage, generateImageID, generateTransforms, applyTransforms, urlFormat, getMetadata } from 'imagetools-core';
import { basename, extname, join } from 'path';
import { createFilter, dataToEsm } from '@rollup/pluginutils';
import MagicString from 'magic-string';

const defaultOptions = {
    include: '**/*.{heic,heif,avif,jpeg,jpg,png,tiff,webp,gif}?*',
    exclude: 'public/**/*',
    silent: false,
    removeMetadata: true
};
function imagetools(userOptions = {}) {
    const pluginOptions = { ...defaultOptions, ...userOptions };
    const filter = createFilter(pluginOptions.include, pluginOptions.exclude);
    const transformFactories = pluginOptions.extendTransforms ? pluginOptions.extendTransforms(builtins) : builtins;
    const outputFormats = pluginOptions.extendOutputFormats
        ? pluginOptions.extendOutputFormats(builtinOutputFormats)
        : builtinOutputFormats;
    let viteConfig;
    const generatedImages = new Map();
    return {
        name: 'imagetools',
        enforce: 'pre',
        configResolved(cfg) {
            viteConfig = cfg;
        },
        async load(id) {
            var _a, _b, _c, _d, _e;
            if (!filter(id))
                return null;
            const srcURL = parseURL(id);
            const parameters = extractEntries(srcURL);
            const imageConfigs = ((_a = pluginOptions.resolveConfigs) === null || _a === void 0 ? void 0 : _a.call(pluginOptions, parameters, outputFormats)) || resolveConfigs(parameters, outputFormats);
            const img = loadImage(decodeURIComponent(srcURL.pathname));
            const outputMetadatas = [];
            for (const config of imageConfigs) {
                const id = generateImageID(srcURL, config);
                const defaultConfig = typeof pluginOptions.defaultDirectives === 'function'
                    ? pluginOptions.defaultDirectives(id)
                    : pluginOptions.defaultDirectives;
                const { transforms } = generateTransforms({ ...defaultConfig, ...config }, transformFactories);
                const { image, metadata } = await applyTransforms(transforms, img.clone(), pluginOptions.removeMetadata);
                generatedImages.set(id, image);
                if (!this.meta.watchMode) {
                    const fileName = basename(srcURL.pathname, extname(srcURL.pathname)) + `.${metadata.format}`;
                    const fileHandle = this.emitFile({
                        name: fileName,
                        source: await image.toBuffer(),
                        type: 'asset'
                    });
                    metadata.src = `__VITE_IMAGE_ASSET__${fileHandle}__`;
                }
                else {
                    metadata.src = join('/@imagetools', id);
                }
                metadata.image = image;
                outputMetadatas.push(metadata);
            }
            let outputFormat = urlFormat();
            for (const [key, format] of Object.entries(outputFormats)) {
                if (srcURL.searchParams.has(key)) {
                    const params = (_b = srcURL.searchParams
                        .get(key)) === null || _b === void 0 ? void 0 : _b.split(';').filter((v) => !!v);
                    outputFormat = format((params === null || params === void 0 ? void 0 : params.length) ? params : undefined);
                    break;
                }
            }
            return dataToEsm(outputFormat(outputMetadatas), {
                namedExports: (_d = (_c = viteConfig.json) === null || _c === void 0 ? void 0 : _c.namedExports) !== null && _d !== void 0 ? _d : true,
                compact: (_e = !!viteConfig.build.minify) !== null && _e !== void 0 ? _e : false,
                preferConst: true
            });
        },
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                var _a;
                if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith('/@imagetools/')) {
                    const [, id] = req.url.split('/@imagetools/');
                    const image = generatedImages.get(id);
                    if (!image)
                        throw new Error(`vite-imagetools cannot find image with id "${id}" this is likely an internal error`);
                    if (pluginOptions.removeMetadata === false) {
                        image.withMetadata();
                    }
                    res.setHeader('Content-Type', `image/${getMetadata(image, 'format')}`);
                    res.setHeader('Cache-Control', 'max-age=360000');
                    return image.clone().pipe(res);
                }
                next();
            });
        },
        renderChunk(code) {
            const assetUrlRE = /__VITE_IMAGE_ASSET__([a-z\d]{8})__(?:_(.*?)__)?/g;
            let match;
            let s;
            while ((match = assetUrlRE.exec(code))) {
                s = s || (s = new MagicString(code));
                const [full, hash, postfix = ''] = match;
                const file = this.getFileName(hash);
                const outputFilepath = viteConfig.base + file + postfix;
                s.overwrite(match.index, match.index + full.length, outputFilepath);
            }
            if (s) {
                return {
                    code: s.toString(),
                    map: viteConfig.build.sourcemap ? s.generateMap({ hires: true }) : null
                };
            }
            else {
                return null;
            }
        }
    };
}

export { imagetools };
//# sourceMappingURL=index.mjs.map
