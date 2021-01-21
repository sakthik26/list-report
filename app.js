var express = require('express');
const bodyParser = require('body-parser')

const mongoose = require('mongoose')
const listingRouter = require('./routes/listingRoute.js');
const mongodb = require("mongodb").MongoClient;
const csvtojson = require("csvtojson");
const csvFilePath = `${__dirname}/contacts.csv`
const csvFilePathListing = `${__dirname}/listings.csv`
const upload = require("express-fileupload");
require('dotenv').config()
var app = express(express.json());
var db;
// const connectionParams = {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// }
// mongoose.connect(process.env.DATABASE_URL, connectionParams)
//     .then(() => {
//         console.log('Connected to database ')
//     })
//     .catch((err) => {
//         console.error(`Error connecting to the database. \n${err}`);
//     })


// Joining two csv files based on listing id
app.get('/join', async (req, res) => {
    mongodb.connect(
        process.env.DATABASE_URL,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
            if (err) throw err;

            db = client.db("as24");
            // db.createCollection("listingf", {

            // })


            db.collection("listing").aggregate([
                {
                    $lookup:
                        {
                            from: "contact",
                            localField: "id",
                            foreignField: "listing_id",
                            as: "test"
                        }
                }
            ]).toArray(function (err, res) {
                if (err) throw err;
                console.log(JSON.stringify(res));
                db.collection("merged")
                    .insertMany(res, (err, resp) => {
                        if (err) throw err;
                        console.log(`Inserted: ${resp.insertedCount} rows`);
                        //client.close();
                    });
                //client.close();
            });
        })

    res.send('Merged two csv files')
})


// Modifying the format of certain fields - price,mileage in int and date to date format
app.get('/change', function (req, res) {
    mongodb.connect(
        process.env.DATABASE_URL,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
            if (err) throw err;

            db = client.db("as24");
            db.collection("merged").find({}).forEach(function (obj) {

                obj.price = parseInt(obj.price);

                obj.mileage = parseInt(obj.mileage);
                obj.dates = []
                obj.test.forEach(function (ob) {

                    obj.dates.push(new Date(ob.contact_date));
                })
                db.collection("merged").save(obj);
            });


        })
    res.send('Modified the types of certain fields - price,mileage in int and date to date format')
})

// Acceptance criteria 1 : Average Listing Selling Price per Seller Type
app.get('/asp', async (req, resp) => {
    var response = []
    mongodb.connect(
        process.env.DATABASE_URL,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
            if (err) throw err;

            db = client.db("as24");


            db.collection("merged").aggregate([

                {
                    $group: {
                        _id: "$seller_type",

                        TotalSum: { $sum: "$price" },
                        avg: { $avg: "$price" }
                    }
                }
            ]).toArray(function (err, res) {
                if (err) throw err;
                console.log(JSON.stringify(res));
                response = res
                for (var i = 0; i < res.length; i++) {
                    res[i].avg = '€ ' + res[i].avg + ',-'
                }
                resp.send(res)
            });

        })


})

// Acceptance criteria 2 : Percentual distribution of available cars by Make
app.get('/per', async (req, resp) => {
    mongodb.connect(
        process.env.DATABASE_URL,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
            if (err) throw err;

            db = client.db("as24");
            // db.createCollection("listingf", {

            // })

            db.collection("merged").aggregate([

                {
                    $group: {
                        _id: "$make",

                        total: { $sum: 1 }
                    }
                }
            ]).toArray(function (err, res) {
                if (err) throw err;
                console.log(JSON.stringify(res));
                var totalcount = 0
                for (var i = 0; i < res.length; i++) {
                    totalcount += res[i]["total"]
                }

                for (var i = 0; i < res.length; i++) {
                    console.log(typeof (res[i].total))

                    //console.log(res[i]["total"] / res[i]["totalcount"])
                    res[i]["percentage"] = (res[i]["total"] / totalcount * 100);

                }
                res.sort(function (a, b) {
                    return b.percentage - a.percentage;
                });
                for (var i = 0; i < res.length; i++) {
                    res[i]["percentage"] = res[i]["percentage"].toString().slice(0, 4) + '%'
                }
                console.log(JSON.stringify(res));
                //client.close();
                response = res

                resp.send(res)
            });

        })


})

// Acceptance criteria 3 : Average price of the 30% most contacted listings
// Most contacted listing count was 141, so any count > 42 was taken in to account for calculating avg price

app.get('/top', async (req, resp) => {
    mongodb.connect(
        process.env.DATABASE_URL,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
            if (err) throw err;

            db = client.db("as24");
            // db.createCollection("listingf", {

            // })

            db.collection("merged").aggregate([
                // {
                //     $group: {
                //         _id: {
                //             "make": "$make",
                //             "price": "$price"
                //         },
                //         total: { $sum: 1 }
                //     }
                // },
                { $project: { "price": "$price", count: { $size: "$dates" } } }]).toArray(function (err, res) {
                    if (err) throw err;

                    res.sort(function (a, b) {
                        return b.count - a.count;
                    });

                    var count = 0
                    var totalPrice = 0
                    for (var i = 0; i < res.length; i++) {
                        if (res[i].count > 42) {
                            count++;
                            totalPrice += res[i].price
                            console.log(totalPrice)
                        }
                    }

                    var avgPrice = totalPrice / count
                    console.log(JSON.stringify(res));
                    console.log(res.length);
                    console.log(totalPrice);
                    console.log(count);
                    console.log(avgPrice);
                    resp.send('avgPrice - ' + '€ ' + avgPrice + ',-')
                })

            // db.collection("contact123").aggregate([{ $project: { count: { $size: "$dates" } } }]).toArray(function (err, res) {
            //     if (err) throw err;
            //     console.log(JSON.stringify(res));
            //     var totalcount = 0
            //         ;
            //     //client.close();
            // });

        })


})

// Acceptance criteria 4 : The Top 5 most contacted listings per Month
// I couldnt complete this rest endpoint, I had difficulties with aggregations based on month

app.get('/mon', async (req, res) => {
    mongodb.connect(
        process.env.DATABASE_URL,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
            if (err) throw err;

            db = client.db("as24");
            // db.createCollection("listingf", {

            // })

            db.collection("contact123").aggregate([
                //     { $unwind: "$dates" },
                //     {
                //         $project: {

                //             month: { $month: "$date" }
                //         }
                //     },
                //     { $group: { "_id": "$month", "count": { $sum: 1 } } },
                //     {
                //         $group: {
                //             "_id": null, "location_details": {
                //                 $push: {
                //                     "month": "$_id",
                //                     "count": "$count"
                //                 }
                //             }
                //         }
                //     },
                //     { $project: { "_id": 0, "location_details": 1 } }
                {

                    $group: {
                        _id: {

                            "make": "$make",
                            // "month": { $month: "$dates" }
                        },


                        total: { $sum: 1 }

                    }
                }
            ]).toArray(function (err, res) {
                if (err) throw err;
                console.log(JSON.stringify(res));

            })

            // db.collection("contact123").aggregate([{ $project: { count: { $size: "$dates" } } }]).toArray(function (err, res) {
            //     if (err) throw err;
            //     console.log(JSON.stringify(res));
            //     var totalcount = 0
            //         ;
            //     //client.close();
            // });

        })


})



let csvData = "test";
app.use(upload());

app.get("/", (req, res, next) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/file", (req, res) => {
    /** convert req buffer into csv string , 
    *   "csvfile" is the name of my file given at name attribute in input tag */
    csvContactData = req.files.contact.data.toString('utf8');
    csvListingData = req.files.listing.data.toString('utf8');
    mongodb.connect(
        process.env.DATABASE_URL,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
            if (err) throw err;

            db = client.db("as24");
            db.createCollection("contact", {
                validator: {
                    $jsonSchema: {

                        required: ["listing_id", "contact_date"],
                        properties: {
                            listing_id: {
                                bsonType: "string",
                                description: "required and must be a string"
                            },
                            contact_date: {
                                bsonType: "string",
                                description: "required and must be a string"
                            },

                        }
                    }
                }
            })
            csvtojson()
                .fromString(csvContactData)
                .then((csvData) => {
                    console.log(csvData)
                    db.collection("contact")
                        .insertMany(csvData, (err, res) => {
                            if (err) throw err;
                            console.log(`Inserted: ${res.insertedCount} rows`);
                            //client.close();
                        });

                })

            db.createCollection("listing", {
                validator: {
                    $jsonSchema: {

                        required: ["id", "make", "seller_type", "price", "mileage"],
                        properties: {
                            id: {
                                bsonType: "string",
                                description: "required and must be a string"
                            },
                            make: {
                                bsonType: "string",
                                description: "required and must be a string"
                            },
                            seller_type: {
                                bsonType: "string",
                                //enum: ['private', 'dealer', 'other'],
                                description: "required and must be a string"
                            },
                            price: {
                                bsonType: "string",
                                // minimum: 10,
                                // maximum: 1000000,
                                description: "required and must be a string"
                            },
                            mileage: {
                                bsonType: "string",
                                // minimum: 10,
                                // maximum: 1000000,
                                description: "required and must be a string"
                            },
                        }
                    }
                }
            })
            csvtojson()
                .fromString(csvListingData)
                .then((csvData) => {
                    console.log(csvData)
                    db.collection("listing")
                        .insertMany(csvData, (err, res) => {
                            if (err) throw err;
                            console.log(`Inserted: ${res.insertedCount} rows`);
                            //res.json('documents imported successfully')
                        });

                })
        })

    res.send('documents imported successfully');

    //return csvtojson().fromString(csvData).then(json => { return res.status(201).json({ csv: csvData, json: json }) })
});
// app.get('/upload', function (req, res) {
//     res.send('Hello World1!');
//     mongodb.connect(
//         process.env.DATABASE_URL,
//         { useNewUrlParser: true, useUnifiedTopology: true },
//         (err, client) => {
//             if (err) throw err;

//             db = client.db("as24");
//             db.createCollection("contact", {
//                 validator: {
//                     $jsonSchema: {

//                         required: ["listing_id", "contact_date"],
//                         properties: {
//                             listing_id: {
//                                 bsonType: "string",
//                                 description: "required and must be a string"
//                             },
//                             contact_date: {
//                                 bsonType: "string",
//                                 description: "required and must be a string"
//                             },

//                         }
//                     }
//                 }
//             })
//             csvtojson()
//                 .fromFile(csvFilePath)
//                 .then((csvData) => {
//                     console.log(csvData)
//                     db.collection("contact")
//                         .insertMany(csvData, (err, res) => {
//                             if (err) throw err;
//                             console.log(`Inserted: ${res.insertedCount} rows`);
//                             //client.close();
//                         });

//                 })

//             db.createCollection("listing", {
//                 validator: {
//                     $jsonSchema: {

//                         required: ["id", "make", "seller_type", "price", "mileage"],
//                         properties: {
//                             id: {
//                                 bsonType: "string",
//                                 description: "required and must be a string"
//                             },
//                             make: {
//                                 bsonType: "string",
//                                 description: "required and must be a string"
//                             },
//                             seller_type: {
//                                 bsonType: "string",
//                                 //enum: ['private', 'dealer', 'other'],
//                                 description: "required and must be a string"
//                             },
//                             price: {
//                                 bsonType: "string",
//                                 // minimum: 10,
//                                 // maximum: 1000000,
//                                 description: "required and must be a string"
//                             },
//                             mileage: {
//                                 bsonType: "string",
//                                 // minimum: 10,
//                                 // maximum: 1000000,
//                                 description: "required and must be a string"
//                             },
//                         }
//                     }
//                 }
//             })
//             csvtojson()
//                 .fromFile(csvFilePathListing)
//                 .then((csvData) => {
//                     console.log(csvData)
//                     db.collection("listing")
//                         .insertMany(csvData, (err, res) => {
//                             if (err) throw err;
//                             console.log(`Inserted: ${res.insertedCount} rows`);
//                             // client.close();
//                         });

//                 })


//         }
//     );

// });

// Make sure you place body-parser before your CRUD handlers!
app.use(bodyParser.urlencoded({ extended: true }))

app.use(listingRouter);

// Reuse database object in request handlers
// app.get("/", function (req, res) {
//     db.collection("contacts").find({}, function (err, docs) {
//         docs.each(function (err, doc) {
//             if (doc) {
//                 console.log(doc);
//             }
//             else {
//                 res.end();
//             }
//         });
//     });
// });

// app.get('/', function (req, res) {
//     res.send('Hello World1!');
// });
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});