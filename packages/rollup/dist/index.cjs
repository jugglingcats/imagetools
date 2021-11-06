'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var imagetoolsCore = require('imagetools-core');
var pluginutils = require('@rollup/pluginutils');
var MagicString = require('magic-string');
var path = require('path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var MagicString__default = /*#__PURE__*/_interopDefaultLegacy(MagicString);

const defaultOptions = {
    include: '**/*.{heic,heif,avif,jpeg,jpg,png,tiff,webp,gif}?*',
    exclude: '',
    silent: false,
    removeMetadata: true
};
function imagetools(userOptions = {}) {
    const pluginOptions = { ...defaultOptions, ...userOptions };
    const filter = pluginutils.createFilter(pluginOptions.include, pluginOptions.exclude);
    const transformFactories = pluginOptions.extendTransforms ? pluginOptions.extendTransforms(imagetoolsCore.builtins) : imagetoolsCore.builtins;
    const outputFormats = pluginOptions.extendOutputFormats
        ? pluginOptions.extendOutputFormats(imagetoolsCore.builtinOutputFormats)
        : imagetoolsCore.builtinOutputFormats;
    return {
        name: 'imagetools',
        resolveId(source, importer = '') {
            const id = path.resolve(path.dirname(importer), source);
            if (!filter(id))
                return null;
            return id;
        },
        async load(id) {
            var _a, _b;
            if (!filter(id))
                return null;
            const srcURL = imagetoolsCore.parseURL(id);
            const parameters = imagetoolsCore.extractEntries(srcURL);
            const imageConfigs = ((_a = pluginOptions.resolveConfigs) === null || _a === void 0 ? void 0 : _a.call(pluginOptions, parameters, outputFormats)) || imagetoolsCore.resolveConfigs(parameters, outputFormats);
            const img = imagetoolsCore.loadImage(decodeURIComponent(srcURL.pathname));
            const outputMetadatas = [];
            for (const config of imageConfigs) {
                const defaultConfig = typeof pluginOptions.defaultDirectives === 'function'
                    ? pluginOptions.defaultDirectives(id)
                    : pluginOptions.defaultDirectives;
                const { transforms, warnings } = imagetoolsCore.generateTransforms({ ...defaultConfig, ...config }, transformFactories);
                warnings.forEach((warning) => this.warn(warning));
                const { image, metadata } = await imagetoolsCore.applyTransforms(transforms, img, pluginOptions.removeMetadata);
                const fileName = path.basename(srcURL.pathname, path.extname(srcURL.pathname)) + `.${metadata.format}`;
                const fileHandle = this.emitFile({
                    name: fileName,
                    source: await image.toBuffer(),
                    type: 'asset'
                });
                metadata.src = `__ROLLUP_IMAGE_ASSET__${fileHandle}__`;
                metadata.image = image;
                outputMetadatas.push(metadata);
            }
            let outputFormat = imagetoolsCore.urlFormat();
            for (const [key, format] of Object.entries(outputFormats)) {
                if (srcURL.searchParams.has(key)) {
                    const params = (_b = srcURL.searchParams
                        .get(key)) === null || _b === void 0 ? void 0 : _b.split(';').filter((v) => !!v);
                    outputFormat = format((params === null || params === void 0 ? void 0 : params.length) ? params : undefined);
                    break;
                }
            }
            return pluginutils.dataToEsm(outputFormat(outputMetadatas));
        },
        renderChunk(code) {
            const assetUrlRE = /__ROLLUP_IMAGE_ASSET__([a-z\d]{8})__(?:_(.*?)__)?/g;
            let match;
            let s;
            while ((match = assetUrlRE.exec(code))) {
                s = s || (s = new MagicString__default["default"](code));
                const [full, hash, postfix = ''] = match;
                const file = this.getFileName(hash);
                const outputFilepath = file + postfix;
                s.overwrite(match.index, match.index + full.length, outputFilepath);
            }
            if (s) {
                return {
                    code: s.toString(),
                    map: s.generateMap({ hires: true })
                };
            }
            else {
                return null;
            }
        }
    };
}

exports.imagetools = imagetools;
//# sourceMappingURL=index.cjs.map
