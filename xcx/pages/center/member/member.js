// pages/center/member/member.js

const App = getApp();
const { cache, request } = App;
let _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    sexual: 'MALE',
    age: '',
    card_no: '',
    card_type: 'ID_CARD'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    let info = JSON.parse(options.info);
    _this.setData({
      ...info
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  formSubmit(e) {
    console.log(e);
    let { name, age, card_no, card_type, sexual } = e.detail.value;
    let { isChinaId } = App.validate;
    console.log(isChinaId(card_no));
    if (!name) {
      wx.showToast({
        icon: 'none',
        title: '请输入姓名',
      })
      return;
    }
    if (!isChinaId(card_no)[0] && card_type == "ID_CARD") {
      wx.showToast({
        icon: 'none',
        title: isChinaId(card_no)[1],
      })
      return;
    }
   
    if (!age) {
      wx.showToast({
        icon: 'none',
        title: '请输入年龄',
      })
      return;
    }
    let { editing, _id } = _this.data;
    let openid = cache.getData('openid');
    if (editing) {
      App.request.post('updateMember', true, {
        _id, name, age, card_no, card_type, sexual, openid
      }, [], res => {
        if (res.ok) {
          wx.showToast({
            title: '修改成功',
          })
        } else {
          wx.showToast({
            title: '修改失败',
          })
        }
        }, null, 'local')
    } else {
      App.request.post('addMember', true, {
        name, age, card_no, card_type, sexual, openid
      }, [], res => {
        if (res) {
          wx.showToast({
            title: '添加成功',
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        }
        }, null, 'local')
    }
  },
  deleteMember() {
    let { _id } = _this.data;
    let openid = cache.getData('openid');
    App.request.post('deleteMember', true, {
      _id, openid
    }, [], res => {
      if (res) {
        wx.showToast({
          title: '删除成功',
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 2000)
      }
    }, null, 'local')
  },
  changeType(e) {
    let { value } = e.detail;
    this.setData({
      card_type: value
    })
  },
  blurCardNo(e) {
    let { value } = e.detail;
    let { isChinaId } = App.validate;
    if (isChinaId(value)[0] && _this.data.card_type == "ID_CARD") {
      let sexual = value.substring(16, 17) % 2 == 1 ? 'MALE' : "FEMALE";
      let year = value.substring(6, 10);
      let age = new Date().getFullYear() - year;
      this.setData({
        sexual, age
      })
    }
  }
})