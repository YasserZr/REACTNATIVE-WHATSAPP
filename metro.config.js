// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Extra Metro configuration
const config = getDefaultConfig(__dirname);

// Module map for specific problematic modules
const extraModules = {
  'ws/lib/websocket-server.js': path.resolve(__dirname, './config/websocket-server-mock.js'),
};

// Add additional resolvers for Node.js modules
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    // Polyfills for Node.js modules
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
    http: require.resolve('@tradle/react-native-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify/browser'),
    path: require.resolve('path-browserify'),
    fs: require.resolve('react-native-level-fs'),
    zlib: require.resolve('browserify-zlib'),
    ws: require.resolve('react-native-websocket'),
    events: require.resolve('events'),
  },
  // Custom module mapping for problematic files
  resolverMainFields: ['react-native', 'browser', 'main'],
  // Use our custom module map
  resolveRequest: (context, moduleName, platform) => {
    // Check if the module is in our map
    if (extraModules[moduleName]) {
      return {
        filePath: extraModules[moduleName],
        type: 'sourceFile',
      };
    }
    // Fall back to the default resolver
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
