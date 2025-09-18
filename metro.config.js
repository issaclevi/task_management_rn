const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        alias: {
            // Alias react-dom to react-native for compatibility
            'react-dom': 'react-native',
        },
        // Add support for additional file extensions
        sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
        // Ensure we can resolve node_modules properly
        nodeModulesPaths: [
            require('path').resolve(__dirname, 'node_modules'),
        ],
    },
    transformer: {
        // Enable Hermes for better performance
        hermesCommand: require('path').resolve(__dirname, 'node_modules/react-native/sdks/hermesc/osx-bin/hermesc'),
        minifierPath: require('path').resolve(__dirname, 'node_modules/metro-minify-terser'),
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
