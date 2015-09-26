var SerialPort = require("serialport");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var inString1;
var inString2;
var inString3;
var inString4;
var sum = 0.00;
var i = 1;

var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('EC544_F2015', server);

db.open(function(err, db) {
  if(!err) {
    console.log("db are connected");
  }
});

var portName = process.argv[2],
portConfig = {
	baudRate: 9600,
	parser: SerialPort.parsers.readline("\n")
};

var sp;

sp = new SerialPort.SerialPort(portName, portConfig);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    sp.write(msg + "\n");
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

sp.on("open", function () {
  console.log('open');
  sp.on('data', function(data) {
    console.log('data received: ' + data);  //capture the messgae in serialport
		inString1 = data.slice(7);   //figure out the number from string
		sum += (parseFloat)(inString1);  // accumulate temperature of each sensors
		io.emit("chat message", "Temperature: " + data);
    while(i==4){   //calculate the average Temperature
				sum = sum / 4;
				var num = new Number(sum);
        var av_temp = num.toFixed(2);   //keep two digits of the average temp
				//num.toFixed(2);
				io.emit("chat message", "Average Temperature: " + av_temp);
				i=0;
		    sum = 0.00;

        /*db.open(function(err, db) {   //store the temp into mongodb
          if(!err) {
            db.collection('Temp_5', function(err, collection) {
              var d = new Date();
              var year = d.getFullYear().toString();
              var month = (d.getMonth()+1).toString();
              var date = d.getDate().toString();
              var day = d.getDay().toString();
              var hour = d.getHours().toString();
              var minute = d.getMinutes().toString();
              var dateCom = month+"/"+date+"/"+year;
              var timeCurr = hour+"/"+minute;

              var item = {dateComdb: dateCom, dayComdb: day, timedb: timeCurr, av_tempdb: av_temp};

              //db.collection.insert(doc1);
              //db.collection.insert(doc2, {safe:true}, function(err, result) {});
              collection.insert(item, {safe:true}, function(err, result) {});
            });
          }
        });*/

    }
    i++;
    db.open(function(err, db) {    //read the data from mongodb, output the data into json form.
      if(!err) {
          console.log("We are connected");
          db.collection('Temp_5', function(err, collection){
            collection.find().toArray(function(error, bars){io.emit("chat message", JSON.stringify(bars));});
          });
      }
    });
  });
});
