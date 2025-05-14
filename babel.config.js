module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      // Add module resolver for Node.js modules
      ["module-resolver", {
        "alias": {
          "events": "events",
          "ws": "react-native-websocket"
        }
      }]
    ],
  };
};
