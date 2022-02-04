module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false, //adopting ES modules instead of commonJS
      }
    ],
  ],
  plugins: [
    [ "@babel/plugin-transform-runtime",
      {
        "useESModules": true, // 使用 es modules helpers, 减少 commonJS 语法代码
        corejs: {
          version: 3,
          proposals: true
        },
      }
    ]
  ]
};
