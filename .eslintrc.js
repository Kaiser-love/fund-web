module.exports = {
  root: true,
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  env: {
    jquery: true,
    node: true
  },
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/no-parsing-error': [2, {
      'x-invalid-end-tag': false
    }],
    'no-undef': 'off',
    'camelcase': 'off',
    // 缩进
    // 'indent': 2,
    // 'indent': [2, 2, {"SwitchCase": 1}],
    "indent": [0,0]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
