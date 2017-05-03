var express = require('express');
var router = express.Router();
var _ = require('underscore');
var pg = require("pg");

//Setup the Connection to PostgreSQL database
var user = 'postgres',
    password = '12345',
    port = 5432,
    host = "localhost";
var connectionString = "pg://" + user + ":" + password + "@" + host + ":" + port + "/TaxiDb";
var db = new pg.Client(connectionString);
db.connect(function(err, data) {
    if (err) {
        console.log('Ther was a error connecting to databse :: ' + err);
        process.exit(-1);
    } else {
        console.log('connected to TaxiDb database');

/*--------- TABLE CREATION ---------*/ 
db.query('CREATE TABLE IF NOT EXISTS taxi(_id SERIAL NOT NULL UNIQUE PRIMARY KEY,"name" VARCHAR, "num" INTEGER)');
db.query('CREATE TABLE IF NOT EXISTS user(_id SERIAL NOT NULL UNIQUE PRIMARY KEY,taxi_id int REFERENCES taxi ON DELETE CASCADE,"name" VARCHAR, "startloc" VARCHAR, "endloc" VARCHAR, "email" VARCHAR, "phonenum" INTEGER)');

/*---------- TAXI DATABASE APIS ------------*/
//add taxi

function taxi(req, res, next) {
    db.query('select * from taxi where "num" = $1', [req.body.num]).then(function(result) {
            if (result.rows.length == 1) {
               return res.send('num is already Present');
            }
            else {
	db.query('INSERT INTO taxi("name","num") VALUES($1,$2) RETURNING *', [req.body.name, req.body.num]).then(function(taxi) {
    console.log('-----------',taxi.rows[0]);
    	return res.send("Data inserted sucessfully");
    })
    .catch(function(error) {
    next(null, error);
    })};
})
}

//get taxi
function get_taxi(req, res) {
        db.query('SELECT * FROM user WHERE taxi_id = $1', [req.params._id]).then(function(taxi) {
             if(taxi.rows.length != 0) {
            res.send(taxi.rows);
        } else {
            return res.send("Given id not present");
        }
        });
    }

// Update taxi
 function updatetaxi(req, res, next) {
     var query = req.params._id;
     var taxi = req.body;
    if (Object.keys(taxi).length > 0) {
        var query = updateQuery('taxi', query, taxi, '_id');
        var update_data = [];
        Object.keys(taxi).forEach(function(key) {
            update_data.push(taxi[key])
        });
        db.query(query, update_data).then(function(result) {
            return res.send('query successfully updated');
        }).catch(function(error) {
            console.log("error", error)
            return res.send("error");
        })
    } else {
        return res.send('nothing to update');
    }
};

// update query function

function updateQuery(tablename, id, data, condition) {
   var query = ['UPDATE'];
   query.push(tablename)
   query.push('SET');
   var set = [];
   Object.keys(data).forEach(function(key, i) {
       if ((key == 'name') || (key == 'num')) {
           set.push('"' + key + '"' + ' = $' + (i + 1));
       } else {
           set.push(key + ' = $' + (i + 1));
       }
   });
   query.push(set.join(', '));
   query.push('WHERE ' + condition + ' = ' + id);
   return query.join(' ');
}

//delete taxi

function delete_current_taxi(req, res) {
    db.query('DELETE from taxi WHERE _id = $1', [req.params._id]).then(function(taxi) {
       if (taxi.rowCount == 1) {
        return res.send("Deleted sucessfully ");
    }
     else {
        return res.send("id does not exist");
    }
    });
}

/*---------- USER DATABASE APIS ------------*/
//add user

function user(req, res) {
    db.query('select * from user where "name" = $1', [req.body.name]).then(function(result) {
            if (result.rows.length == 1) {
                return res.send('user already registered in other taxi');
            }
            else {
    db.query('INSERT INTO user("taxi_id","name","startloc","endloc","email","phonenum") VALUES($1,$2,$3,$4,$5,$6) RETURNING *', [req.body.taxi_id, req.body.name, req.body.startloc, req.body.endloc, req.body.email, req.body.phonenum]).then(function(user) {
        return res.send("Data inserted sucessfully");
    })};
})
}

//get user
function get_user(req, res) {                                                                
        db.query('select t.*, row_to_json(u) as userdetails from taxi t inner join (select * from user) u on u.taxi_id = t._id where u._id = $1', [req.params._id]).then(function(result) {
            return res.send(result.rows[0]);
    });
}

// Update user
 function updateuser(req, res, next) {
     var query = req.params._id;
     var student = req.body;
    if (Object.keys(user).length > 0) {
        var query = updateQuery('user', query, user, '_id');
        var update_data = [];
        Object.keys(user).forEach(function(key) {
            update_data.push(user[key])
        });
        db.query(query, update_data).then(function(result) {
            return res.send('query successfully updated');
        }).catch(function(error) {
            console.log("error", error)
            return res.send("error");
        })
    } else {
        return res.send('nothing to update')
    }
};

// update query function

function updateQuery(tablename, id, data, condition) {
   var query = ['UPDATE'];
   query.push(tablename)
   query.push('SET');
   var set = [];
   Object.keys(data).forEach(function(key, i) {
       if ((key == 'taxi_id') || (key == 'name') || (key == 'startloc') || (key == 'endloc') || (key == 'email') || (key == 'phonenum')) {
           set.push('"' + key + '"' + ' = $' + (i + 1));
       } else {
           set.push(key + ' = $' + (i + 1));
       }
   });
   query.push(set.join(', '));
   query.push('WHERE ' + condition + ' = ' + id);
   return query.join(' ');
}

//delete user

function delete_current_user(req, res) {
    db.query('DELETE from user WHERE _id = $1', [req.params._id]).then(function(user) {
        if (user.rowCount == 1) {
        return res.send("Deleted sucessfully ");
    }
     else {
        return res.send("id does not exist");
    }
    });
}


router.post('/taxi', taxi);
router.get('/get/:_id', get_taxi);
router.put('/taxi/:_id', updatetaxi);
router.delete('/delete/:_id', delete_current_taxi);
router.post('/user', user);
router.get('/get_user/:_id', get_user);
router.put('/user/:_id', updateuser);
router.delete('/delete_user/:_id', delete_current_user);

module.exports = router;
    }
});