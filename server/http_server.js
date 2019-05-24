const koa = require('koa');
const server = require('http').createServer();
const io = require('socket.io')(server);
const router = require('koa-router')();
const koaBody = require('koa-body');
const app = new koa();
const MongoClient = require('mongodb').MongoClient;
const Mongo = require('mongodb');
const axios = require('axios');



const time_gap = 3000;
const ADMIN = 'mongodb://root:password@127.0.0.1:27017';
const USER_DATABASE = 'users';
const RESTHOME_DATABASE = 'resthome';
const NOW_RESTHOME = 'now_resthome';


const INIT = 'init';
const INIT_HEART = 'init_heart';
const TODAY_DATA = 'today_data';
const HIS_DATA = 'history_data';
const HEART_BEAT = 'heart_beat';
const INDEX_HEART_BEAT = 'index_heart_beat';
const HIS_HEART_BEAT = 'heart_beat_history';
const WARN = 'warn';

io.on('connection', socket => {
  let int1, int2, id;
  console.log('someoen have entered.');
  socket.on(INIT, msg => {
    id = msg;
    if (msg == 0) {
      return;
    }
    const col = 'col_' + msg;
    socket.join(id);
    connectToDB(NOW_RESTHOME).then(db => {
      db.collection(col).find().toArray().then(res => {
        io.to(id).emit(TODAY_DATA, res);
      }).catch(err => {
        console.log(err);
      })
    })
    connectToDB(RESTHOME_DATABASE).then(db => {
      db.collection(col).find().toArray().then(res => {
        io.to(id).emit(HIS_DATA, res);
      })
    })
    clearInterval(int2);
    int1 = setInterval(() => {
      const now = +new Date();
      const rd = randomData(now);
      if (rd.value[1] > 68 || rd.value[1] < 62) {
        io.to(id).emit(WARN,true)
      }
      io.to(id).emit(INDEX_HEART_BEAT, rd);
    }, time_gap);
  })
  socket.on(INIT_HEART, msg => {
    id = msg;
    socket.join(id);
    var data = [];
    var now = +new Date() - 20 * time_gap;
    for (var i = 0; i < 20; i++) {
      const rd = randomData(now);
      now = rd.name;
      data.push(rd);
    }
    io.to(id).emit(HIS_HEART_BEAT, data);
    clearInterval(int1);
    int2 = setInterval(() => {
      const rd = randomData(now);
      now = rd.name;
      io.to(id).emit(HEART_BEAT, rd);
    }, time_gap);
  })
  socket.on('disconnect', msg => {
    console.log(id + 'have left.');
    clearInterval(int1);
    clearInterval(int2);
  })
})


app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());


router.post('/member/add', async ctx => {
  let {
    openid,
    name,
    sexual,
    age,
    card_no,
    card_type
  } = ctx.request.body, response;
  let collection = null;
  await connectToDB(USER_DATABASE).then(db => {
    return db.collection(`col_${openid}`)
  }).then(col => {
    collection = col;
    return col.find({
      card_no
    })
  }).then(cursor => {
    return cursor.toArray();
  }).then(arr => {
    if (arr.length == 0) {
      return collection.insertOne({
        name,
        sexual,
        age,
        card_no,
        card_type
      })
    } else {
      throw "already insert"
    }
  }).then(res => {
    response = res.result;
  }).catch(err => {
    response = err;
  })
  ctx.body = response;
}).post('/member/delete', async ctx => {
  let {
    openid,
    _id
  } = ctx.request.body, response;
  await connectToDB(USER_DATABASE).then(db => {
    return db.collection(`col_${openid}`);
  }).then(col => {
    return col.deleteOne({
      _id: ObjectId(_id)
    });
  }).then(res => {
    response = res.result;
  }).catch(err => {
    response = err;
  })
  ctx.body = response;
}).post('/member/get', async ctx => {
  let {
    openid
  } = ctx.request.body, response;

  await connectToDB(USER_DATABASE).then(db => {
    return db.collection(`col_${openid}`);
  }).then(col => {
    return col.find()
  }).then(cursor => {
    return cursor.toArray()
  }).then(arr => {
    response = arr;
  }).catch(error => {
    response = error;
  })
  ctx.body = response;
}).post('/member/update', async ctx => {
  let {
    _id, name, age, card_no, card_type, sexual, openid
  } = ctx.request.body, response;
  const queryObj = {"_id": ObjectId(_id)};
  const updateObj = {$set: { name, age, card_no, card_type, sexual }};
  await connectToDB(USER_DATABASE).then(db => {
    return db.collection(`col_${openid}`);
  }).then(col => {
    //return col.updateOne({_id},{$set:{name, age, card_no, card_type, sexual}});\
    return col.updateOne(queryObj,updateObj);
  }).then(res => {
    response = res.result;
  }).catch(error => {
    response = error;
  })
  ctx.body = response;
}).post('/login', async ctx => {
  let { code } = ctx.request.body, response;
  await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=wx8b39cbcc7be72e89&secret=a9c6fbbb38c56e91ae576b1755e2f69c&js_code=${code}&grant_type=authorization_code`)
  .then(res => {
    response = res.data;
  }).catch(err => {
    response = err;
  })
  ctx.body = response;
})



server.listen(3000);
app.listen(3001);



function randomData(now) {
  var n = now + time_gap;
  var value = 60 + Math.random() * 10;
  return {
    name: n,
    value: [n, Math.round(value)]
  }
}

function ObjectId(str) {
  return new Mongo.ObjectId(str);
}

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