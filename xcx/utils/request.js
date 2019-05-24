const url_debug = {
  mobile: "http://192.168.3.9:3001",
  local: "http://localhost:3001",
}
const url_product = {
  //
}
const urlIds = {
  login: '/login',
  addMember: '/member/add',
  deleteMember: '/member/delete',
  getMember: '/member/get',
  updateMember: '/member/update'
}

exports.setURL = (id, args) => {
  var url = urlIds[id];
  if (typeof url === 'undefined')
    throw "no url!";
  if (!args) return url;
  for (var i = 0; i < args.length; i++) {
    if (url.indexOf('{?}') < 0)
      break;
    url = url.replace(/\{\?\}/, args[i] + '');
  }
  //最后是否有/{?}
  if (url.lastIndexOf('/{?}') > -1) {
    url = url.substr(0, url.lastIndexOf('/{?}'));
  }
  return url;
}

var init = (mode) => {
  exports.url = mode == 'debug' ? url_debug : url_product;
}

var post = (urlId, hasLoading, data, requestParam, success, fail, head) => {
  let that = getApp();
  var url = (head ? exports.url[head] : exports.url.mobile) + exports.setURL(urlId, requestParam);
  if (hasLoading) {
    wx.showLoading({
      title: '请求中...',
      mask: true
    })
  }
  if (!data) {
    data = {}
  };
  return wx.request({
    url: url, //仅为示例，并非真实的接口地址
    data: data,
    method: 'POST',
    success: (res) => {
      if (res.statusCode == 200) {
        if (hasLoading) {
          wx.hideLoading();
        }
        if (hasLoading && !res.data.success && res.data.errMsg) {
          if (typeof hasLoading === 'boolean') {
            wx.showToast({
              icon: 'none',
              title: res.data.errMsg,
            })
          } else {
            hasLoading.showZanToast(res.data.errMsg);
          }
        }
        if (success) {
          success(res.data);
        }
      } else {
        if (hasLoading) {
          wx.hideLoading();
          if (typeof hasLoading === 'boolean') {
            wx.showToast({
              icon: 'loading',
              title: '网络异常',
            })
          } else {
            hasLoading.showZanToast('网络异常');
          }
        }
      }
      that.logger.log('===>' + url + '<====');
      that.logger.log(res.data)
    },
    fail: (res) => {
      if (hasLoading) {
        wx.hideLoading();
        if (typeof hasLoading === 'boolean') {
          wx.showToast({
            icon: 'loading',
            title: '网络异常',
          })
        } else {
          hasLoading.showZanToast('网络异常');
        }
      }
      if (fail) {
        fail();
      }
    }
  })
}


module.exports.init = init;

module.exports.post = post;

