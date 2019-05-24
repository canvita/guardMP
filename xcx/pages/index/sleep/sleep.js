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
let pie_data = [];
let his_bar_data = [];
let socket = null;
let _this;
const App = getApp();


Page({
  data: {
    ec: {
      onInit: initChart
    },
    firstTab: true,
    pointer_data: '',
    date: '--',
    sleep_hour: '--',
    sleep_min: '--'
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
      this.initBarPage();
    }
    let firstTab = index;
    this.setData({
      firstTab
    })
  },
  initBarPage() {
    var option = getPieOption();
    one_chart.setOption(option);
  },
  initHisPage() {
    let date = his_bar_data[13][0];
    let date_step = his_bar_data[13][1];
    const summary_data = App.cache.getData(SUMMARY_DATA);
    this.setData({
      date,
      date_sleep_hour: summary_data[date].sleep.sleep_hour,
      date_sleep_min: summary_data[date].sleep.sleep_min,
      date_sleep_start: summary_data[date].sleep.sleep_start,
      date_sleep_end: summary_data[date].sleep.sleep_end,
    })
    var option = getBarOption(false);
    one_chart.setOption(option);
  }
});

function initData() {
  const summary_data = App.cache.getData(SUMMARY_DATA);
  const today_data = App.cache.getData(ORI_TODAY_DATA)[0];
  const yesterday_data = App.cache.getData(YESTERDAY_DATA);
  _this.setData({
    sleep_hour: yesterday_data.sleep_hour,
    sleep_min: yesterday_data.sleep_min,
    sleep_start: yesterday_data.sleep_start,
    sleep_end: yesterday_data.sleep_end
  })
  pie_data = [{
    value: yesterday_data.deep,
    name: '深睡'
  }, {
    value: yesterday_data.light,
    name: '浅睡'
  }, {
    value: yesterday_data.awake,
    name: '清醒'
  }]
  let a = [];
  for (let i in summary_data) {
    let min = summary_data[i].sleep.awake + summary_data[i].sleep.light + summary_data[i].sleep.deep;
    a.push([i, min]);
  }
  a.reverse();
  his_bar_data = a;
}

function setTodayData() {
  let cache_today = App.cache.getData(NOW_DATA);
  _this.setData({
    sport_time: cache_today.sport_time,
    calorie: cache_today.sport_calorie,
    distance: cache_today.distance
  })
}

function initChart(canvas, width, height) {
  getChart(canvas, width, height)
  var option = getPieOption();
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

function getPieOption() {
  return {
    color: ['#8999f4', "#8bcd48","#ff7e59"],
    tooltip: {
      trigger: 'item',
      formatter: ""
    },
    xAxis: [{
      show: false
    }],
    yAxis: [{
      show:false
    }],
    series: [{
      name: '阶段时长(分钟)',
      type: 'pie',
      //radius: '55%',
      //center: ['50%', '60%'],
      data: pie_data,
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
}

function getBarOption(isToday) {
  return {
    color: ['#8999f4'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { // 坐标轴指示器，坐标轴触发有效
        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
      },
      formatter: function(params) {
        if (!_this.data.firstTab) {
          params = params[0];
          var date = params.name;
          const summary_data = App.cache.getData(SUMMARY_DATA);
          let date_distance = summary_data[date].distance / 1000;
          date_distance = date_distance.toFixed(2);
          let date_calorie = summary_data[date].calorie;
          if (!_this.data.firstTab) {
            _this.setData({
              pointer_data: params,
              date,
              date_sleep_hour: summary_data[date].sleep.sleep_hour,
              date_sleep_min: summary_data[date].sleep.sleep_min,
              date_sleep_start: summary_data[date].sleep.sleep_start,
              date_sleep_end: summary_data[date].sleep.sleep_end,
              date_calorie
            })
          }
          return params.value[1] + '分钟';
        } else {
          return params[0].value[1] + '分钟';
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
      show: true,
      type: 'category',
      axisTick: {
        alignWithLabel: true
      }
    }],
    yAxis: [{
      show: true,
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