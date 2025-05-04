// polyfills.js
import { Readable } from 'stream';
import { Buffer } from 'buffer';

// iconv-lite 依赖
globalThis.Readable = Readable;
// iconv-lite 依赖
globalThis.Buffer = Buffer;

