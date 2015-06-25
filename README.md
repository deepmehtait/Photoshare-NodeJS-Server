# Photoshare-NodeJS-Server
NodeJS RESTful API server which uses Mongodb as database. Stores Images to Amazon S3.
## Installation Instruction
First of all add all node modules via 
```node
$ nmp install
```  
To run the code 
```
$ nodemon app.js
```
## REST APIs Doc
1. POST /photoshare/api/vi/users
2. GET /photoshare/api/vi/users/:userid
3. GET /photoshare/api/vi/users
4. GET /photoshare/api/vi/users/:userid/albums
5. GET /photoshare/api/vi/users/:userid/albums/:albums
6. POST /photoshare/api/vi/users/:userid/albums/:albums
7. GET /photoshare/api/vi/users/:userid/albums/:albums/photoid/:photoid
