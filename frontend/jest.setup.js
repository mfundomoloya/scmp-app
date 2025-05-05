// filepath: c:\Users\nathi\OneDrive\Desktop\scmp-app\frontend\jest.setup.js
import { TextEncoder, TextDecoder } from 'util';

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

globalThis.importMeta = {
    env: {
      VITE_API_URL: 'http://localhost:5173', // Replace with your actual API URL
    },
  };