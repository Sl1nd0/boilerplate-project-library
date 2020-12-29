/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        console.log('GT1');
         DbTransactions({}, res, 'get', function(res1, project) {
        console.log('inside callback insert');
        res1.json(project);
        //res.json({'title':'DataGt'});
      }); 
       //res.send('DataGt');
    })
    
    .post(function (req, res){
      var title = req.body.title;
      console.log(' *** ' + title);
      //res.send('DataGOP'); 
      if (title != '') {
      let dataInsert = {
        "title" : req.body.title,
        "commentCount" : 0,
        "comments" : []
      };

      DbTransactions(dataInsert, res, 'insert', function(res1, project) {
        console.log('inside callback post /api/books');
        res1.json(project);
      });
      } else {
        res1.send('Cannot insert blank title');
      }
      //response will contain new book object including atleast _id and title
    })
      
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      console.log(' DELETING ');
      DbTransactions({}, res, 'deleteall', function(res1, project) {
        console.log('inside deleter callback');
        res1.send('delete successful');
      });
    });

app.route('/api/comments/:id')
    .get(function (req, res){

      var results =  req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
       //console.log(JSON.stringify(req.params));
       console.log(JSON.stringify(results));
        console.log('GTDone');
       DbTransactions(results, res, 'find', function(res1, project) {
          console.log('inside callback');
          res1.json(project);
        });       

    })

  app.route('/api/books/:id')
    .get(function (req, res){

      var results = JSON.parse(decodeURI(req.params.id));
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
       //console.log(JSON.stringify(req.params));
       console.log(JSON.stringify(results));
        console.log('GTDone');
       res.json(results);      

    })

    .put(function(req, res){

      var id = req.body.id;
      var comment = req.body.comment;
       //var title = req.body.title;
        console.log('* Dome22 * ' + JSON.stringify(req.body) + "  ");
        //res.send('Data2');
        var dataInsert = {
          "id": id,
          "comment": comment
        };

        DbTransactions(dataInsert, res, 'update', function(res1, project) {
          console.log('inside callback');
          res1.json(project);
        }); 
      //json res format same as .get
    })

    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;

       var title = req.body.title;
        console.log('* |Dome22 * ' + JSON.stringify(req.body) + "  " +  JSON.stringify(bookid) );
         
         var dataInsert = {
          "id": bookid,
          "comment": req.body.comment
        };

        DbTransactions(dataInsert, res, 'update', function(res1, project) {
          console.log('inside callback');
          res1.json(project);
        }); 
        //res.send('Data2');
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;

      console.log(bookid + "  delete ");
      var dataInsert = bookid;
      DbTransactions(dataInsert, res, 'delete', function(res1, project) {
          console.log('inside deleter callback');
          res1.send('delete successful');
        }); 
      //if successful response will be 'delete successful'
    });
  
  /***************************FUNCTIONS**************************/
  function DbTransactions(jsonData, resData, type, callback) {
    
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
      if (err) throw err;
      var dbo = db.db("slidb");

        if (type == 'insert') {

          dbo.collection("booklibrary").findOne({"title": jsonData.title}, function(err1, doc) {
              if (err1) throw err1;
              console.log(doc);
              if (!doc) {
                console.log(" It's not in the system ");
                dbo.collection("booklibrary").insertOne(jsonData, function(err2, doc1) {
                    if (err2) throw err2;
                    console.log("document inserted into database");
                    console.log(doc);
                    db.close();
                    return callback(resData, jsonData);
                });
                
              } else {
                   console.log(" It's in the system ");
                   return callback(resData, {"result": "book is already in the system"});
              }
          });

        } else if (type == 'get') {
            dbo.collection("booklibrary").find({}).toArray(function(err2, doc) {
                    if (err2) throw err2;
                    console.log("document inserted into database");
                    db.close();
                    return callback(resData, doc);
            });
        } else if (type == 'update') {

          dbo.collection("booklibrary").findOne({"_id": ObjectId(jsonData.id)}, function(err1, doc) {
              if (err1) throw err1;
                console.log(err1);
                 doc.comments.push(jsonData.comment);
                 doc.commentCount = doc.comments.length;
                dbo.collection("booklibrary").save(doc);
                console.log(doc);               
              db.close();

              return callback(resData, doc);                
          });
        } else if (type == 'find') {

          dbo.collection("booklibrary").findOne({"_id": ObjectId(jsonData)}, function(err1, doc) {
              if (err1) throw err1;
                console.log(err1);
                 doc.comments.push(jsonData.comment);
                 doc.commentCount = doc.comments.length;
              //  dbo.collection("booklibrary").save(doc);
                console.log(doc);               
              db.close();

              return callback(resData, doc);                
          });
        } else if (type == 'delete') {

           dbo.collection("booklibrary").deleteOne({"_id": ObjectId(jsonData)}, function(err1, doc) {
              if (err1) throw err1;
                console.log(err1);
                 
              //  dbo.collection("booklibrary").save(doc);
                console.log(" DELETE " + doc);               
              db.close();

              return callback(resData, doc);                
          });

        } else if (type == 'deleteall') {
          dbo.collection("booklibrary").deleteMany({}, function(err1, doc) {
              if (err1) throw err1;
                console.log(err1);
                 
              //  dbo.collection("booklibrary").save(doc);
                console.log(" DELETEING ALL  " + doc);               
              db.close();

              return callback(resData, doc);                
          });
        }
    });
  }
  /***************************FUNCTIONS**************************/

};
