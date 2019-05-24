const MongoClient = require('mongodb').MongoClient;

const ADMIN = 'mongodb://root:password@127.0.0.1:27017';
const NOW_DATABASE = 'now_resthome';
const HIS_DATABASE = 'resthome';

const ONE_DAY = 1000 * 60 * 60 * 24;

const ONE_HOUR = 1000 * 60 * 60;

const USERS = [
  '330102192604016016',
  '330102192607018199',
  '330102192907011415'
];



initNowResthome();
initResthome();

function connectToDB(dbname) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(ADMIN, {
      useNewUrlParser: true
    }, (err, client) => {
      if (err) reject(err);
      const db = client.db(dbname);
      resolve(db);
    })
  })
}

function initNowResthome() {
  for (let i in USERS) {
    connectToDB(NOW_DATABASE).then(db => {
      db.collection(`col_${USERS[i]}`).deleteMany({});
      db.collection(`col_${USERS[i]}`).insertOne(genrateTillNow());
    })
  }
}


function initResthome() {
  for (let i in USERS) {
    connectToDB(HIS_DATABASE).then(db => {
      db.collection(`col_${USERS[i]}`).deleteMany({});
      db.collection(`col_${USERS[i]}`).insertOne(genrate14Days());
    })
  }
}

function genrateTillNow() {
  let d = new Date();
  let h = d.getHours();
  return genrateOneDay(h);
}

function genrate14Days() {
  const obj = {};
  let ds = +new Date();
  for (let i = 1; i < 15; i++) {
    ds = ds - ONE_DAY;
    let d = new Date(ds);
    let s = d.toDateString();
    obj[s] = genrateOneDay();
  }
  return obj;
}

function genrateOneDay(hour) {
  const obj = {};
  hour = hour || 24;
  for (let i = 1; i <= hour; i++) {
    if (i < 8 || i > 22) {
      obj[`${i}`] = genrateOneHour(true);
    } else {
      obj[`${i}`] = genrateOneHour();
    }
  }
  if (hour == 24) {
    obj.heart_beat = randomHeartbeat();
    obj.sleep = randomSleep();
  }
  return obj;
}



function genrateOneHour(rest) {
  const rs = randomStep();
  return rest ? {
    step_num: 0,
    distance: 0,
    sport_time: 0,
    calorie: 14
  } : {
    step_num: rs,
    distance: Math.round(rs / 3),
    sport_time: Math.round(rs / 120),
    calorie: randomCalorie()
  }
}

function randomStep() {
  return Math.round(Math.random() * 1000 + 1000);
}

function randomCalorie() {
  return Math.round(14 + Math.random() * 200);
}

function randomHeartbeat() {
  return Math.round(60 + Math.random() * 10);
}

function randomSleep() {
  const SLEEP_DATA = [{
      "time": "22:10 - 07:11",
      "awake": 220,
      "light": 101,
      "deep": 210
    },
    {
      "time": "23:00 - 07:15",
      "awake": 201,
      "light": 140,
      "deep": 180
    },
    {
      "time": "22:40 - 07:18",
      "awake": 205,
      "light": 121,
      "deep": 210
    },
    {
      "time": "23:12 - 07:34",
      "awake": 140,
      "light": 181,
      "deep": 204
    }, {
      "time": "23:04 - 06:13",
      "awake": 201,
      "light": 141,
      "deep": 150
    }, {
      "time": "23:21 - 07:51",
      "awake": 220,
      "light": 151,
      "deep": 240
    }, {
      "time": "22:30 - 06:11",
      "awake": 220,
      "light": 161,
      "deep": 234
    }
  ]
  let index = Math.round(6 * Math.random());
  return SLEEP_DATA[index]
}