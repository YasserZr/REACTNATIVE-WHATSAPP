# WhatsApp Clone React Native App

## Node.js Polyfills Configuration

This application uses several Node.js-dependent packages, including Supabase and WebSockets. Since React Native doesn't natively support Node.js modules, we've set up polyfills to ensure compatibility.

### Polyfill Implementation

1. **metro.config.js** - Contains mappings from Node.js modules to React Native compatible equivalents:
   - stream → stream-browserify
   - crypto → crypto-browserify
   - http → @tradle/react-native-http
   - https → https-browserify
   - os → os-browserify
   - path → path-browserify
   - fs → react-native-level-fs
   - zlib → browserify-zlib
   - ws → react-native-websocket

2. **config/polyfills.js** - Imports all necessary polyfills at app startup:
   - react-native-url-polyfill
   - react-native-get-random-values

### Required Packages

Make sure all these packages are installed:

```
npm install --legacy-peer-deps @supabase/supabase-js expo-image-picker expo-file-system expo-secure-store react-native-url-polyfill uuid base64-arraybuffer stream-browserify crypto-browserify @tradle/react-native-http https-browserify os-browserify path-browserify react-native-level-fs browserify-zlib react-native-websocket react-native-get-random-values
```

## Running the App

To run the app with proper polyfills:

1. Clear the Metro bundler cache:
```
npx expo start -c
```

2. Start the development server:
```
npm start
```

## Common Issues and Solutions

### WebSocket Server Error

If you encounter this error:

```text
Android Bundling failed: The package at "node_modules\ws\lib\websocket-server.js" attempted to import the Node standard library module "events".
```

This is fixed by:

1. Adding polyfills for the 'events' module in metro.config.js
2. Creating a custom mock implementation for the WebSocket server
3. Setting up module resolution in babel.config.js

### Other Module Resolution Errors

For general module resolution errors:

1. Clear the cache and watchman:

   ```bash
   watchman watch-del-all
   rm -rf node_modules/
   npm install
   npx expo start -c
   ```

2. For specific "Module not found" errors, check that the corresponding polyfill is properly configured in metro.config.js

3. Try running with the --no-dev flag which can sometimes resolve bundling issues:

   ```bash
   npx expo start --no-dev
   ```
