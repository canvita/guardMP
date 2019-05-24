import * as echarts from '../../../ec-canvas/echarts';
const io = require('../../../utils/weapp.socket.io.js');

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const app = getApp();

const NOW_DATA = "now_data";
const YESTERDAY_DATA = 'yesterday_data';
const ORI_TODAY_DATA = 'ori_today_data';
const ORI_HIS_DATA = 'ori_his_data';
const SUMMARY_DATA = 'summary_data';


let one_chart = null;
let now_bar_data = [];
let his_bar_data = [];
let socket = null;
let _this;
const App = getApp();


Page({
  data: {
    ec: {
      onInit: initChart
    },
    step_num: '--',
    distance: '--',
    calorie: '--',
    firstTab: true,
    pointer_data: '',
    date: '--', 
    date_step: '--'
  },

  onReady() {
    
  },
  onLoad() {
    _this = this;
    initData();
    setTodayData();
  },
  switchTab(e) {
    let index = e.target.dataset.index;
    if (index == false && this.data.firstTab) {
      this.initHisPage();
    } else if (index == true && !this.data.firstTab) {
      this.initNowPage();
    }
    let firstTab = index;
    this.setData({
      firstTab
    })
  },
  initNowPage() {
    var option = getBarOption(true);
    one_chart.setOption(option);
  },
  initHisPage() {
    
    let date = his_bar_data[13][0];
    let date_step = his_bar_data[13][1];
    const summary_data = App.cache.getData(SUMMARY_DATA);
    let date_distance = summary_data[date].distance / 1000;
    date_distance = date_distance.toFixed(2);
    let date_calorie = summary_data[date].calorie - 14 * 24;
    this.setData({
      date, date_step, date_distance, date_calorie
    })
    var option = getBarOption(false);
    one_chart.setOption(option);
  }
});

function initData() {
  const summary_data = App.cache.getData(SUMMARY_DATA);
  const today_data = App.cache.getData(ORI_TODAY_DATA)[0];
  let a = [];
  for (let i in summary_data) {
    a.push([i, summary_data[i].step_num]);
  }
  a.reverse();
  his_bar_data = a;

  let a1 = [];
  for (let i in today_data) {
    if (i == "_id") {
      continue;
    }
    const o = today_data[i];
    a1.push([i, o.step_num]);
  }
  now_bar_data = a1;
}

function setTodayData() {
  let cache_today = App.cache.getData(NOW_DATA);
  _this.setData({
    step_num: cache_today.step_num,
    calorie: cache_today.step_calorie,
    distance: cache_today.distance
  })
}

function initChart(canvas, width, height) {
  getChart(canvas, width, height)
  var option = getBarOption(true);
  one_chart.setOption(option);
  return one_chart;
}


function getChart(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);
  one_chart = chart;
}

function getBarOption(isToday) {
  return  {
    color: ['#8bcd48'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { // 坐标轴指示器，坐标轴触发有效
        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
      },
      formatter: function (params) {
        if (!_this.data.firstTab) {
          params = params[0];
          var date = params.name;
          const summary_data = App.cache.getData(SUMMARY_DATA);
          let date_distance = summary_data[date].distance / 1000;
          date_distance = date_distance.toFixed(2);
          let date_calorie = summary_data[date].calorie - 14 * 24;
          if (!_this.data.firstTab) {
            _this.setData({
              pointer_data: params,
              date,
              date_step: params.value[1],
              date_distance,
              date_calorie
            })
          }
          return params.value[1] + '步';
        } else {
          return params[0].value[1] + '步';
        }
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 20,
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      axisTick: {
        alignWithLabel: true
      }
    }],
    yAxis: [{
      type: 'value'
    }],
    series: [{
      name: '直接访问',
      type: 'bar',
      barWidth: '60%',
      data: isToday ? now_bar_data : his_bar_data
    }]
  };
}