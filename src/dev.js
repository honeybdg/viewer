/* Web Worker */
import * as pdfjsLib from '../dist/pdf.min.js';
pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(new URL(
  '../dist/pdf.worker.min.js',
  import.meta.url
));
window.pdfjsLib = pdfjsLib;

/* Fake Worker */
// import * as pdfjsLib from '../dist/pdf.min.js';
// import * as pdfjsWorker from '../dist/pdf.worker.min.js';

// const global = typeof window !== 'undefined' ? window : {};
// global.pdfjsLib = pdfjsLib;
// global.pdfjsWorker = pdfjsWorker;
