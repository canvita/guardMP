const io = require('../../../utils/weapp.socket.io.js');


const INIT = 'init';
const INDEX_HEART_BEAT = 'index_heart_beat';
const TODAY_DATA = 'today_data';
const HIS_DATA = 'history_data';

const NOW_DATA = "now_data";
const YESTERDAY_DATA = 'yesterday_data';
const ORI_TODAY_DATA = 'ori_today_data';
const ORI_HIS_DATA = 'ori_his_data';
const SUMMARY_DATA = 'summary_data';
const WARN = "warn";

const App = getApp();
const {
  cache,
  request
} = App;
let _this;
let socket;

Page({
  data: {
    isLoaded: false,
    heart_beat: '--',
    his_herat_beat: '--',
    step_num: '--',
    step_calorie: '--',
    distance: '--',
    sport_time: '--',
    sport_calorie: '--',
    sleep_hour: '--',
    sleep_min: '--',
    sleep_start: '--',
    sleep_end: '--',
    no_data: true,
    heart_warning: false,
    no_warning: false
  },
  onLoad(options) {
    _this = this;

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
    socket.emit(INIT, card_no);
    socket.on(HIS_DATA, msg => {
      console.log(msg)
      if (msg.length == 0) {
        _this.setData({
          no_data: true
        })
        return;
      }
      _this.setData({
        no_data: false
      })
      this.setPageHisData(msg[0]);
      this.setSummaryData(msg[0])
      App.cache.setData(ORI_HIS_DATA, msg);
    })
    socket.on(WARN, msg => {
      if (card_no == 0) {
        return;
      }
      cache.setData('heart_warning', true);
      _this.setData({
        heart_warning: true
      })
    })
    socket.on(TODAY_DATA, msg => {
      if (msg.length == 0) {
        _this.setData({
          no_data: true
        })
        return;
      }
      _this.setData({
        no_data: false
      })
      this.setPageTodayData(msg[0]);
      App.cache.setData(ORI_TODAY_DATA, msg);
    })

    socket.on(INDEX_HEART_BEAT, msg => {
      if (msg.length == 0) {
        _this.setData({
          no_data: true
        })
        return;
      }
      _this.setData({
        heart_beat: msg.value[1]
      })
    })
  },
  onHide() {
    socket.close();
  },
  setPageTodayData(today_data) {
    let step_num = 0,
      step_calorie = 0,
      distance = 0,
      sport_time = 0,
      sport_calorie = 0;

    for (let i in today_data) {
      if (i == '_id') {
        continue;
      }
      let o = today_data[i];
      step_num += o.step_num;
      step_calorie += (o.calorie - 14);
      distance += o.distance;
      sport_time += o.sport_time;
      sport_calorie += o.calorie;
    }
    distance = distance / 1000;
    distance = distance.toFixed(2);
    App.cache.setData(NOW_DATA, {
      step_num,
      step_calorie,
      distance,
      sport_time,
      sport_calorie
    })
    _this.setData({
      step_num,
      step_calorie,
      distance,
      sport_time,
      sport_calorie
    })
  },
  setPageHisData(his_data) {
    const d = new Date(+new Date() - 1000 * 60 * 60 * 24);
    const yesterday = his_data[d.toDateString()];
    let sleep_total = yesterday.sleep.awake + yesterday.sleep.light + yesterday.sleep.deep;
    let sleep_hour = Math.ceil(sleep_total / 60);
    let sleep_min = sleep_total % 60;
    let sleep_start = yesterday.sleep.time.split(' - ')[0];
    let sleep_end = yesterday.sleep.time.split(' - ')[1];
    let his_herat_beat = yesterday.heart_beat;
    App.cache.setData(YESTERDAY_DATA, {
      sleep_hour,
      sleep_min,
      sleep_start,
      sleep_end,
      his_herat_beat,
      awake: yesterday.sleep.awake,
      light: yesterday.sleep.light,
      deep: yesterday.sleep.deep
    })
    _this.setData({
      sleep_hour,
      sleep_min,
      sleep_start,
      sleep_end,
      his_herat_beat
    })
  },
  setSummaryData(his_data) {
    let a = {};
    for (let i in his_data) {
      if (i == "_id") continue;
      const o = his_data[i];
      let step_num = 0,
        distance = 0,
        sport_time = 0,
        calorie = 0;
      for (let j in o) {
        if (j == 'heart_beat' || j == 'sleep') continue;
        let obj = o[j];
        step_num += obj.step_num;
        distance += obj.distance;
        sport_time += obj.sport_time;
        calorie += obj.calorie;
      }
      let d = new Date(i);
      let ds = d.toLocaleDateString();
      let sleep = o.sleep;
      let sleep_total = sleep.awake + sleep.light + sleep.deep;
      sleep.sleep_hour = Math.ceil(sleep_total / 60);
      sleep.sleep_min = sleep_total % 60;
      sleep.sleep_start = sleep.time.split(' - ')[0];
      sleep.sleep_end = sleep.time.split(' - ')[1];
      a[ds] = {
        heart_beat: o.heart_beat,
        sleep,
        step_num,
        distance,
        sport_time,
        calorie
      }
    }
    App.cache.setData(SUMMARY_DATA, a);
  },
  getSelectMember() {
    return cache.getData('selectMember') || cache.getData('members')[0];
  },
  toStepPage() {
    wx.navigateTo({
      url: '/pages/index/step-num/step-num',
    })
  },
  toHeartPage() {
    wx.navigateTo({
      url: '/pages/index/heart-beat/heart-beat',
    })
  },
  toSportPage() {
    wx.navigateTo({
      url: '/pages/index/calorie/calorie',
    })
  },
  toSleepPage() {
    wx.navigateTo({
      url: '/pages/index/sleep/sleep',
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