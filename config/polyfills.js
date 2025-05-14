// Global polyfills needed for React Native compatibility with Node.js-dependent packages like Supabase
// These polyfills must be loaded before any other imports in the application

import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

// Handle WebSocket dependencies
// This ensures the 'events' module is properly polyfilled for ws
global.EventEmitter = require('events');
// Make sure WebSocket can find its dependencies
global.process = global.process || {};
global.process.env = global.process.env || {};
global.process.browser = true;

// This file ensures all required polyfills are loaded before the app starts
