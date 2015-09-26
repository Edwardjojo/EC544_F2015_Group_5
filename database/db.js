var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/Temp_Time');//；连接数据库
var Schema = mongoose.Schema;   //  创建模型
var userScheMa = new Schema({
    date: String,
    day: String,
    time: String,
    av_temp: float,
    A_temp: float,
    B_temp: float,
    C_temp: float,
    D_temp: float,
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
exports.user = db.model('Temp_Time', userScheMa); //  与users集合关联
