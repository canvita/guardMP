 //app.js
App({
  onLaunch: function(options) {
    let that = this;
    this.initObject();
  },
  onShow(options) {
    
  },
  globalData: {
    appid: 'wx8b39cbcc7be72e89',
    mode: 'debug', //  debug , product
  },
  initObject() {
    var cache = require('utils/cache.js');
    this.cache = cache;
    //请求对象，getApp().request 获取
    var request = require('utils/request.js');
    request.init(this.globalData.mode);
    this.request = request;
    //日志对象，getApp().logger 获取
    var logger = require('utils/logger.js');
    this.logger = logger;
    //验证对象，getApp().validate 获取
    var validate = require('utils/validate.js');
    this.validate = validate;
  },
})