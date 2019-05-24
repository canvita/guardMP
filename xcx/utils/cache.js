var setData = (key, data, app) => {
  let that = app || getApp();
  var key1 = that.globalData.mode + '.' + key;
  wx.setStorageSync(key1, data);
}

var getData = (key, app) => {
  let that = app || getApp();
  var key1 = that.globalData.mode + '.' + key;
  return wx.getStorageSync(key1)
}

var removeKey = (key, app) => {
  let that = app || getApp();
  var key1 = that.globalData.mode + '.' + key;
  wx.removeStorageSync(key1)
}

module.exports.setData = setData;
module.exports.getData = getData;
module.exports.removeKey = removeKey;