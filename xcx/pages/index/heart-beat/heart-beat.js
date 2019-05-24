import * as echarts from '../../../ec-canvas/echarts';
const io = require('../../../utils/weapp.socket.io.js');

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const app = getApp();

const INIT_HEART = 'init_heart';
const HEART_BEAT = 'heart_beat';
const HIS_HEART_BEAT = 'heart_beat_history';


const NOW_DATA = "now_data";
const YESTERDAY_DATA = 'yesterday_data';
const ORI_TODAY_DATA = 'ori_today_data';
const ORI_HIS_DATA = 'ori_his_data';
const SUMMARY_DATA = 'summary_data';
let one_chart = null;
let line_data = [];
let bar_data = [];
let socket = null;
let _this;
const App = getApp();
const { cache, request } = App;
Page({
  data: {
    ec: {
      onInit: initChart
    },
    time: '',
    heart_beat: '--',
    firstTab: true,
    pointer_data: '',
    date: '--',
    avg_hb: '--'
  },
  onUnload() {
    socket.close();
  },
  onReady() {
    
  },
  onLoad() {
    _this = this;
    const his_data = App.cache.getData(SUMMARY_DATA);
    let a = [];
    for (let i in his_data) {
      if (i == "_id") {
        continue;
      }
      a.push([i,his_data[i].heart_beat])
    }
    this.setData({
      date: a[0][0],
      avg_hb: a[0][1]
    })
    a.reverse();
    bar_data = a;
    this.initLinePage();  

    let { card_no } = this.getSelectMember();
    socket.on(HIS_HEART_BEAT, msg => {
      line_data = msg;
    })

    
    
  },
  switchTab(e) {
    let index = e.target.dataset.index;
    if (index == false && this.data.firstTab) {
      socket.close();
      initBarChart();
    } else if (index == true && !this.data.firstTab) {
      initLineChart();
      this.initLinePage();
    }
    let firstTab = index;
    this.setData({
      firstTab
    })
    
  },
  initLinePage() {
    let _this = this;
    let time = getTimeString(new Date());
    this.setData({
      time
    })
    socket = io('http://localhost:3000');
    let { card_no } = this.getSelectMember();
    socket.emit(INIT_HEART, card_no);
    
    socket.on(HEART_BEAT, msg => {
      line_data.shift();
      line_data.push(msg);
      one_chart.setOption({
        series: [{
          data: line_data,
        }]
      });
      let time = getTimeString(new Date(msg.name));
      _this.setData({
        heart_beat: msg.value[1],
        time
      })
    });  
  },
  getSelectMember() {
    return cache.getData('selectMember') || cache.getData('members')[0];
  },
});

function initLineChart() {
  var option = getLineOption();
  one_chart.setOption(option);
}


function initBarChart() {
  var option = getBarOption();
  one_chart.setOption(option);
}

function getLineOption() {
  var option = {
    color: ['#ff7e59'],
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        params = params[0];
        var date = new Date(params.name);
        if (!_this.data.firstTab) {
          _this.setData({
            pointer_data: params,
            date: params.name,
            avg_hb: params.value[1]
          })
        }
       
        //return date.getHours() + ':' + (date.getMinutes()) + ':' + date.getSeconds() + ' - ' + params.value[1];
        return params.value[1] + 'bpm';
      },
      axisPointer: {
        animation: false
      }
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: true
      }
    },
    yAxis: {
      name: 'bpm',
      type: 'value',
      boundaryGap: ['50%', '100%'],
      min: 40,
      splitLine: {
        show: true
      }
    },
    series: [{
      name: '模拟数据',
      type: 'line',
      showSymbol: false,
      hoverAnimation: false,
      data: line_data
    }]
  };
  return option;
}

function getBarOption() {
  return  {
    color: ['#ff7e59'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { // 坐标轴指示器，坐标轴触发有效
        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      axisTick: {
        alignWithLabel: true
      }
    }],
    yAxis: [{
      type: 'value',
      min: 40
    }],
    series: [{
      name: '直接访问',
      type: 'bar',
      barWidth: '60%',
      data: bar_data
    }]
  };
}


function initChart(canvas, width, height) {
  getChart(canvas, width, height)
  var option = getLineOption();
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

function getTimeString(t) {
  let hour = t.getHours(),
    min = t.getMinutes();
  if (hour < 10) {
    hour = '0' + hour;
  }
  if (min < 10) {
    min = '0' + min;
  }
  return `${t.getMonth()}月${t.getDate()}日 ${WEEKDAYS[t.getDay()]} ${hour}:${min}`;
}