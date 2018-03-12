/** Ma Hoa bcrypt */
var bcrypt = require('bcrypt');
/** */
/** Entities*/
var IUser = require('../entities/IUser');
var IWFriend = require('../entities/IWFriend');
/** */
/** Express */
var express = require('express');
var cors = require('cors');//Cấp quyền truy cập
var app = express();
var http = require('http').Server(app);
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
/** */
/** Socket IO */
var io = require('socket.io')(http);
/** */
/** Upload Img */
var fs = require('fs');//ghi file
var multer = require('multer');//khi nào cần dùng form data
var bodyParser = require('body-parser');//parse boby upload file
var uuid = require('uuid');//Tạo ra tên lộn xộn

app.use(cors());//sử dụng cấp quyền
app.use(bodyParser.json())//sử dụng bodyparse
app.use("/uploads", express.static("../public"));//public thư mục public thông qua root là uploads trong api

/**Mongoose */
var mongoose = require('mongoose');
var url = "mongodb://localhost:27017/myChat";
var Schema = mongoose.Schema;
/** */

/** Create Schema */
var UserSchema = new Schema({
  _name: String,
  _email: String,
  _password: String,
  _img: String
});
var UserTable = mongoose.model("user", UserSchema); // users

var WFriendSchema = new Schema({
  _idUser: String,
  _WFriends: []
});
var WFriendTable = mongoose.model("wfriends", WFriendSchema); // wfriends

var FriendSchema = new Schema({
  _idFriend: String,
  _idUser: String,
  _friends: []
})
var FriendTable = mongoose.model("friend", FriendSchema); // friends

var MessengerSchema = new Schema({
  _fromIdUser: String,
  _toIdUser: String,
  _message: String,
  _dataSent: Date,
  _dataRead: Date,
  _status: String
})
var MessengerTable = mongoose.model("message", MessengerSchema);
/** */


mongoose.connect(url, function (err, db) {
  if (err) {
    return console.log(err);
  } else {
    console.log("Ket Noi Thanh Cong");
  }
});

/**UPLOAD IMG */
app.post('/profit', function (req, res) {
  var base64Data = req.body.image.replace(/^data:image\/(x-icon|png|jpeg);base64,/, "");//Cut Part Don't Need
  var binaryData = new Buffer(base64Data, 'base64').toString('binary');//Read File You Send To
  var typeImg = req.body.name;//Name Real Image
  var id = req.body.id;//ID User is Logining
  var type = typeImg.substring(typeImg.indexOf("."));// type of your Profit
  var nameImg = uuid.v4();

  UserTable.findOne({ _id: id }, function (err, person) {
    if (err) return handleError(err);
    var nameProfit;
    if (person._img !== "") {
      nameProfit = person._img.slice(30);
      fs.unlinkSync("D:/Chat/server/public/" + nameProfit);//xoa hinh trong forder
    }
  })
  // fs.unlinkSync("D:/MyChat/server/public/a09467ab-dc0d-4ffb-9296-76aebddf083b.png");
  fs.writeFile("../public/" + nameImg + type, binaryData, "binary", function (err) {
    // console.log(err); // writes out file without error, but it's not a valid image
  });
  var profit = "http://localhost:3000/uploads/" + nameImg + type;
  UserTable.updateOne({ _id: id }, { _img: profit }, function (err, person) {
    if (err) return handleError(err);
    res.send({ image: profit });
  });
});
/** */

/**LOGIN */
app.post('/login', function (req, res) {
  var form = req.body;
  var email = req.body.email;
  var pass = req.body.pass;
  UserTable.findOne({ '_email': email }, function (err, person) {
    // Prints "Space Ghost is a talk show host"
    if (person) {
      if (bcrypt.compareSync(pass, person._password)) {
        res.send({ person: person });
      } else {
        res.send({ person: null });
      }
    } else {
      res.send({ person: person });
    }
  });
});

/**REGISTER */
app.post('/register', function (req, res) {
  var value = req.body.register;
  var salt = bcrypt.genSaltSync(10)
  var user = new IUser("", value.name, value.email, bcrypt.hashSync(value.password, salt), "");
  UserTable.findOne({ '_email': value.email }, function (err, person) {
    if (!person) {
      UserTable.create(user, function (err, person) {
        var wfriend = new IWFriend("", person._id);
        var friend = new IWFriend("", person._id);
        WFriendTable.create(wfriend);
        FriendTable.create(friend);
        res.send({ user: person });
      });
    } else {
      res.send({ user: null });
    }
  });
});
/** */
// FriendTable.updateOne({ _idUser: '5aa2812d1e7d621a443b3f91' }, { _friends: [] }, function (err, person) { });
// WFriendTable.updateOne({ _idUser: '5aa2812d1e7d621a443b3f91' }, { _WFriends: [] }, function (err, person) { });
// WFriendTable.updateOne({ _idUser: '5a900a645301eb0ebc7f35a6' }, { _WFriends: [] }, function (err, person) { });
// WFriendTable.updateOne({ _idUser: '5a9172f2bb261e09b037d4da' }, { _WFriends: [] }, function (err, person) { });
/** Socket IO */
usersSocket = [];
io.on('connection', function (socket) {
  // Tìm User !
  socket.on('find', (search) => {
    UserTable.find({
      _name: { $regex: search.search },
      _id: { $not: { $eq: search._id } }
    }, function (err, persons) {
      socket.emit('persons', { persons: persons });
    }).limit(10);
  });

  // Thông Báo Có Ai Kết Bạn Hay Không  !
  socket.on('notication', (value) => {
    usersSocket[value._id] = socket.id;
    WFriendTable.find({
      _idUser: value._id
    }, function (err, notice) {
      var users = [];
      if (notice !== []) {
        for (let i = 0; i < notice[0]._WFriends.length; i++) {
          UserTable.findOne({
            _id: notice[0]._WFriends[i].idFriends
          }, (err, person) => {
            users.push(person);
            if (users.length === notice[0]._WFriends.length) {
              io.to(usersSocket[value._id]).emit('responsenotice', { notice: users });
            }
          });
        }
      }
    });
  });

  // Làm bạn Nhé !  
  socket.on('makeF', (value) => {
    WFriendTable.updateOne({ _idUser: value.idFriend }, {
      $push: {
        _WFriends: {
          $each: [{ idFriends: value.id }]
        }
      }
    }, function (err, person) {
      if (!err) {
        WFriendTable.find({
          _idUser: value.idFriend
        }, function (err, notice) {
          var users = [];
          for (let i = 0; i < notice[0]._WFriends.length; i++) {
            UserTable.findOne({
              _id: notice[0]._WFriends[i].idFriends
            }, (err, person) => {
              users.push(person);
              if (users.length === notice[0]._WFriends.length) {
                io.to(usersSocket[value.idFriend]).emit('responsenotice', { notice: users });
              }
            });
          }
        });
      }
    });
  });

  // Hủy kết Bạn  
  socket.on('cancleAccpet', (value) => {
    WFriendTable.updateOne({ _idUser: value.id }, {
      $pull: {
        _WFriends:
          { idFriends: value.idFriend }
      }
    }, function (err, person) {
      if (!err) {
        WFriendTable.find({
          _idUser: value.id
        }, function (err, notice) {
          var users = [];
          if (notice[0]._WFriends.length === 0) {
            socket.emit('responsenotice', { notice: users });
          } else {
            for (let i = 0; i < notice[0]._WFriends.length; i++) {
              UserTable.findOne({
                _id: notice[0]._WFriends[i].idFriends
              }, (err, person) => {
                users.push(person);
                if (users.length === notice[0]._WFriends.length) {
                  //io.to(usersSocket[value.idFriend]).emit('responsenotice', { notice: users });
                  socket.emit('responsenotice', { notice: users });
                }
              });
            }
          }
        });
      }
    });
  });

  // Chấp Nhận Kết Bạn
  socket.on('accpet', (value) => {
    WFriendTable.updateOne({ _idUser: value.id }, {
      $pull: {
        _WFriends:
          { idFriends: value.idFriend }
      }
    }, function (err, person) {
      if (!err) {
        FriendTable.updateOne({ _idUser: value.id }, {
          $push: {
            _friends:
              { idFriends: value.idFriend }
          }
        }, function (err, friend) {
          WFriendTable.find({
            _idUser: value.id
          }, function (err, notice) {
            var users = [];
            if (notice[0]._WFriends.length === 0) {
              socket.emit('responsenotice', { notice: users });
              io.to(usersSocket[value.idFriend]).emit('waityou', ' accpet ');
            } else {
              for (let i = 0; i < notice[0]._WFriends.length; i++) {
                UserTable.findOne({
                  _id: notice[0]._WFriends[i].idFriends
                }, (err, person) => {
                  users.push(person);
                  if (users.length === notice[0]._WFriends.length) {
                    io.to(usersSocket[value.idFriend]).emit('waityou', ' accpet ');
                    socket.emit('responsenotice', { notice: users });
                    //socket.emit('accepted', 'accpet');
                  }
                });
              }
            }
          });
        })
      }
    });
  });

  // Kiểm Tra Có Bạn Bè Hay Không
  socket.on('checkFriend', (value) => {
    WFriendTable.find({
      _idUser: value.idFriend,
      _WFriends: {
        $elemMatch: { idFriends: value.id }
      }
    }, function (err, notice) {
      if (!notice) {
        console.log('not friend');
        socket.emit('valueCheck', 'not friend');
      } else if (notice.length > 0) {
        socket.emit('valueCheck', 'have a friend');
      }
    });
  });

// Kiểm Tra Có Mình Có Kết Bạn Với Nó Chưa
  socket.on('reponseFriend', (value) => {
    FriendTable.find({
      _idUser: value.idFriend,
      _friends: {
        $elemMatch: { idFriends: value.id }
      }
    }, function (err, notice) {
      if (notice.length > 0) {
        socket.emit('waityou', 'accpet');
      }
    });
  });

  // Kiểm Tra Danh Sách Bạn Trong ListFriend Của Mình
  socket.on('reponseFriend2', (value) => {
    FriendTable.find({
      _idUser: value.id,
      _friends: {
        $elemMatch: { idFriends: value.idFriend }
      }
    }, function (err, notice) {
      if (notice.length > 0) {
        socket.emit('waityou2', 'accpet');
      }
    });
  });

  socket.on('message', (meg) => {
    console.log(meg);
  })

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

// Make Friend
// io.on('connection', function (socket) {
//   socket.on('makeF', (value) => {
//     usersSocket[value.id] = socket.id;
//     console.log(socket.id);
//     // WFriendTable.updateOne({ _idUser: value.idFriend }, {
//     //   $push: {
//     //     _WFriends: {
//     //       $each : [value.id]
//     //     }
//     //   }
//     // }, function (err, person) {
//     io.to(usersSocket[value.idFriend]).emit('notice', { wait: 'wait' });
//     //});
//   })
// });

// //Notice Make Friend
// io.on('connection', function (socket) {
//   console.log('co ket noi');
//   socket.on('notication', (value) => {
//     WFriendTable.find({
//       _idUser: value._id
//     }, function (err, notice) {
//       socket.emit('responsenotice', { notice: notice[0]._WFriends });
//     });
//   })
// });
/** */

http.listen(3000, function () {
  console.log('listening on *:3000');
});