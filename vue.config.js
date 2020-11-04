const path = require('path')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  css: {
    loaderOptions: {
      stylus: {
        // 配置stylus全局变量文件
        import: path.resolve(__dirname, './src/assets/css/global.styl'),
      },
      postcss: {
        plugins: [
          /**
           * 配置postcss-pxtorem插件, 自动将css样式的px单位转为rem
           */
          require('postcss-pxtorem')({
            rootValue: 37.5, // 换算的基数
            propList: ['*'],
          }),
        ],
      },
    },
  },
}
