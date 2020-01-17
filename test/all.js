/*
 * this will make webpack require all the files matching the RegExp in ../vr-test
 * without having to restart `webpack --watch` when new files are added :)
 */
const req = require.context('../vr-test', true, /spec\.ts$/);
req.keys().forEach(req);
