const io = require('../../../utils/weapp.socket.io.js');
const App = getApp();
const {
  cache,
  request
} = App;
let _this, socket;

const INIT = 'init';

const WARN = "warn";
Page({
  data: {
    accounts: cache.getData('members'),
    isLogin: cache.getData('isLogin'),
    chosen_index: 0,
    no_warning: false,
    heart_warning: false,
    no_data: true
  },
  onLoad() {
    _this = this;
    this.data.list = [];
  },
  onHide() {
    socket.close();
  },
  onShow() {
    let no_warning = cache.getData('no_warning') || false;
    let heart_warning = cache.getData('heart_warning') || false;

    this.setData({
      heart_warning,
      no_warning
    })

    socket = io('http://localhost:3000');
    let {
      card_no
    } = this.getSelectMember() || 0;
    if (card_no != 0) {
      socket.emit(INIT, card_no);
    }
    
    socket.on(WARN, msg => {
      cache.setData('heart_warning', true);
      _this.setData({
        heart_warning: true
      })
    })
    if (_this.data.isLogin) {
      this.getMember();

    }
  },
  getMember(openid) {
    openid = openid || cache.getData('openid');
    request.post('getMember', false, {
      openid
    }, [], data => {
      App.cache.setData('members', data);
      let m = cache.getData('selectMember');
      if (!m) {
        cache.setData('selectMember', data[0]);
      } else {
        let {
          card_no
        } = m;
        for (let i in data) {
          if (data[i].card_no == card_no) {
            _this.setData({
              chosen_index: i
            })
          }
        }
      }
      _this.setData({
        accounts: data
      })
      }, null, 'local');

  },
  addMember() {
    let info = {
      editing: false
    }
    if (_this.data.accounts.length == 2) {
      wx.showToast({
        icon: 'none',
        title: '最多添加两个老人',
      })
      return;
    }
    if (_this.data.isLogin == false) {
      wx.showToast({
        icon: 'none',
        title: '请先登录',
      })
      return;
    }
    wx.navigateTo({
      url: '/pages/center/member/member?info=' + JSON.stringify(info),
    })
  },
  showMore(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let info = _this.data.accounts[index];
    info.editing = true;
    wx.navigateTo({
      url: '/pages/center/member/member?info=' + JSON.stringify(info),
    })
  },
  getSelectMember() {
    return cache.getData('selectMember') || cache.getData('members')[0];
  },
  login() {
    wx.login({
      success(res) {
        request.post('login', true, {
          code: res.code
        }, [], res => {
          if (res.openid) {
            _this.getMember(res.openid);
            cache.setData('openid', res.openid);
            cache.setData('isLogin', true);
            _this.setData({
              isLogin: true
            })
            wx.showToast({
              
              title: '登录成功',
            })
          }
          }, null, 'local')
      }
    })
  },
  logout() {
    App.cache.removeKey('openid');
    App.cache.removeKey('isLogin');
    App.cache.removeKey('members');
    App.cache.removeKey('selectMember');
    _this.setData({
      isLogin: false,
      accounts: []
    })
    wx.showToast({
      title: '退出登录成功',
    })
  },
  chooseMember(e) {
    let {
      index
    } = e.currentTarget.dataset;
    cache.setData('selectMember', _this.data.accounts[index]);
    _this.setData({
      chosen_index: index
    })
  },
  cancelWarn() {
    wx.showModal({
      title: '确认消除警告吗?',
      content: '今日将不再提醒',
      success: res => {
        if (res.confirm) {
          _this.setData({
            no_warning: true
          })
          cache.setData('no_warning', true)
        }
      }
    })

  }
});