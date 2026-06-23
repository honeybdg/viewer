/** @type {import('@babel/core').TransformOptions} */
module.exports = {
  comments: false,
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
