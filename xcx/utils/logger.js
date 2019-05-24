var log = (message)=> {
  if (getApp().globalData.mode == 'debug') {
    if (typeof message === 'string') {
      console.log(message);
    } else {
      console.log(JSON.stringify(message));
    }
  }
}
module.exports.log = log;