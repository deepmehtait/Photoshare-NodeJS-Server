var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	Users:{
		Userid: Number,
		Name: String,
		Email: String,
		profilepicURL: String
	},
	Alubms:[{
		AlbumID: Number,
		AlbumDetails:{
			AlbumName: String,
			Photos:[{
				PhotoID: Number,
				PhotoURL: String,
				TinyURL: String,
				MetaData: String
			}]
		}
	}]

});

mongoose.model('userdata', userSchema);
