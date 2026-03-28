const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    sourceExts: [
      ...defaultConfig.resolver.sourceExts,
      'cjs',
    ],
    unstable_enablePackageExports: false,
  },
};

module.exports = mergeConfig(defaultConfig, config);