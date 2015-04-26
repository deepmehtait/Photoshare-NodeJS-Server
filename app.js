var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// file system handeling 
var fs = require('fs');
// Printing out whole Body in JSON
var util = require('util');
// multi part handeling
var multer  = require('multer')
//var mongooseschema= require('models/userdata');
var AWS = require('aws-sdk');
AWS.config.update({
accessKeyId: 'AKIAJRSSTBSKXU62UWUA',
    secretAccessKey: '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',
    region:'us-west-1'
});
var s3= new AWS.S3();
var app = express();
app.use(bodyParser.json());
// Set Destination folder
// configure multer
app.use(multer({ dest: './uploads5/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));

mongoose.connect('mongodb://127.0.0.1:27017/photoshare', function(err, db) {
    if (err) {
        console.log(err);
    } else {
        console.log("connected!!");
    }
});
//load all files in models dir
/*fs.readdirSync(__dirname + '/models').forEach(function(filename) {
  if (~filename.indexOf('.js')) require(__dirname + '/models/' + filename)
});*/
// Define Schema for users collection where userid is unique
// db.users.createIndex({"Users.Userid":1},{unique:true}); <- use this in creating schema which will have unique userid
var Schema = mongoose.Schema;
var userSchema = new Schema({
    Users: {
        Userid: Number,
        Name: String,
        Email: String,
        profilepicURL: String
    },
    Alubms: [{
        AlbumID: Number,
        AlbumDetails: {
            AlbumName: String,
            Photos: [{
                PhotoID: Number,
                PhotoURL: String,
                TinyURL: String,
                MetaData: String
            }]
        }
    }]

});

var User = mongoose.model('users', userSchema);

//Test Rest Api

app.get('/photoshare/api/v1/test', function(req,res){
	
	res.status(200);
	res.setHeader('Content-Type', 'application/json');

	res.json({
                "id": 1,
                "name": "deep"
            });
	
	});
app.post('/photoshare/api/v1/test', function(req,res){
	
	var userName = req.body.name;
    var userID = req.body.userid;
	var alldata= req.body;
	
	console.log(util.inspect(alldata, false, null));
	console.log("Name:"+userName+" Userid:"+userID);
	res.status(200);
	res.setHeader('Content-Type', 'application/json');

	res.json({
                "id": 1,
                "name": userName,
				"userid": userID,
				"message": "POST Call Success..!!"
            });
	
	});
var getImage=
// TEST API FOR Multi part form data upload
app.post('/photoshare/api/v1/test/upload', function(req,res){
	var url="";
	console.log(req.body);
    console.log("----"+req.files);
    console.log(util.inspect(req.files, false, null));
    console.log("des path"+req.files.thumbnail.path);
    fs.readFile(req.files.thumbnail.path, function(err,data){
    if(err){
    console.log(err);
    }else{
    //    console.log("image data-"+data);
    var params={
    Bucket:"photoshareappcmpe277",
    Key: req.files.thumbnail.name,
    ContentType: 'image/jpg',
        CacheControl: 'max-age=31536000',
        Body:data
    };
        
        s3.putObject(params, function(err, data) {
  if (err) {console.log(err, err.stack); }// an error occurred
  else {    console.log("upload data="+util.inspect(data, false, null)); 
       resonsedata=data;
       var params = {Bucket: 'photoshareappcmpe277', Key: req.files.thumbnail.name};
url = s3.getSignedUrl('getObject', params);
console.log('The URL is', url);}          // successful response
console.log("url==>"+url);
    res.status(200);
	res.setHeader('Content-Type', 'application/json');
    //fs.unlinkSync(req.files.thumbnail.path);
    fs.unlink(req.files.thumbnail.path, function (err) {
  if (err) throw err;
  console.log('successfully deleted');
});
            res.json({
                
				"message": "Upload File Called",
                "s3":url
            });
           
            //fs.rmdirSync(req.files.thumbnail.path);
        });
    }
    });
     
    //fs.unlink();
	});


//mongoose.model('userdata', userSchema);
// post users data i.e Register user 
app.post('/photoshare/api/vi/users', function(req, res) {
    console.log('inside post');
    //var userSchema= mongoose.models('userdata');
    var userName = req.body.userName;
    var userID = req.body.userID;
    var email = req.body.email;
    var profilePhotoURL = req.body.profilePhotoURL;
    console.log("Name:" + userName + " userID:" + userID + " email:" + email + " url:" + profilePhotoURL);


    var insertUser = new User({
        Users: {
            Userid: userID,
            Name: userName,
            Email: email,
            profilepicURL: profilePhotoURL
        }
    });


    // TODO
    // Now Store this data into MongoDB
    insertUser.save(function(err, InsertUser) {
        if (err) {
            console.error(err);
            // give response back to user about error with error message
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.json({
                "message": "user already exist",
                "error": err
            });
            return console.error(err);
        }
        mongoresponse = insertUser;
        console.dir(insertUser);
        // set proper header of response
        res.status(201);
        res.setHeader('Content-Type', 'application/json');
        console.log("mongoresponse==" + mongoresponse);
        // Send success response back.
        res.json({
            "success": "user created",
            "userIDs": userID,
            "mongodata": InsertUser
        });
    });

});

//get users data all
app.get('/photoshare/api/vi/users/:userid', function(req, res) {
    console.log('inside get with id');
    var userid = req.params.userid;
    console.log("userid=" + userid);
    User.find({
        "Users.Userid": userid
    }, function(err, movies) {
        if (err) {
            /*console.error(err);
            // give response back to user about error with error message
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.json({
                "message": "User Not Found",
                "error": err
            });*/
            return console.error(err);
        }
        console.dir(movies.length);
        // if length is > 0 we found the user else there are no user
        if (movies.length > 0) {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.json({
                "user": movies
            });
        } else {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.json({
                "message": "User Not Found",

            });
        }

    });

});

//get users data all
app.get('/photoshare/api/vi/users', function(req, res) {
    console.log('inside get');
    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    res.json({
        a: 1
    });
});

// List All Albums of user
app.get('/photoshare/api/vi/users/:userid/albums', function(req, res) {
    console.log('List All Albums of user');
    var userid = req.param("userid");
    console.log("User ID:" + userid);
    // TODO
    // Now Store this data into MongoDB

    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    // Send success response back.
    res.json({
        "success": "user created",
        "userID": userid
    });
});

// List All Photos of Albums of a user
app.get('/photoshare/api/vi/users/:userid/albums/:albums', function(req, res) {
    console.log('List All Photos of Albums of a user');
    var userid = req.param("userid");
    var albumid = req.param("albums");
    console.log("User ID:" + userid + " Album id=" + albumid);
    // TODO
    // Now Store this data into MongoDB

    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    // Send success response back.
    res.json({
        "success": "received list of pics",
        "userID": userid,
        "album id": albumid
    });
});

// Post new photo to albums of a user
app.post('/photoshare/api/vi/users/:userid/albums/:albums', function(req, res) {
    console.log('Post new photo to albums of a user');
    var userid = req.param("userid");
    var albumid = req.param("albums");
    console.log("User ID:" + userid + " Album id=" + albumid);
    // TODO
    // Now Store this data into MongoDB

    res.status(201);
    res.setHeader('Content-Type', 'application/json');
    // Send success response back.
    res.json({
        "success": "received list of pics",
        "userID": userid,
        "album id": albumid
    });
});


// Get specific photo from photoid and album id of a user
app.get('/photoshare/api/vi/users/:userid/albums/:albums/photoid/:photoid', function(req, res) {
    console.log('Get specific photo from photoid and album id of a user');
    var userid = req.param("userid");
    var albumid = req.param("albums");
    var photoid = req.param("photoid");
    console.log("User ID:" + userid + " Album id=" + albumid + " photo =" + photoid);
    // TODO
    // Now Store this data into MongoDB

    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    // Send success response back.
    res.json({
        "success": "received list of pics",
        "userID": userid,
        "albumID": albumid,
        "photoID": photoid
    });
});

app.listen(3000);
console.log('Listening on port 3000...');
