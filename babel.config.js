/** @type {import('@babel/core').TransformOptions} */
module.exports = {
  comments: false,
  ignore: [
    './src/dev.js',
  ],
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
  ],
  plugins: [
    ['babel-plugin-inline-import', {
      extensions: ['.svg'],
    }],
  ],
};
