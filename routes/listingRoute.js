const express = require('express');
const contactModel = require('../models/contacts');
const listingModel = require('../models/listings');
const app = express();
const bodyParser = require('body-parser')
const csvtojson = require("csvtojson");
const csvFilePath = `${__dirname}/../contacts.csv`

app.use(bodyParser.json());

// const csvArray = [];
// csvtojson()
//     .fromFile(csvFilePath)
//     .on('json', (jsonObj) => {
//         csvArray.push({ listingId: jsonObj.listing_id, contactDate: jsonObj.contact_date });
//     }).on('done', (error) => {
//         if (error) {
//             return res.status(500).json({ error });
//         }
//         const contact = new contactModel();
//         // Object.keys(csvData).forEach(function (key) {
//         //     const contact = new contactModel({
//         //         listingId: csvData.listing_id,
//         //         contactDate: csvData.contact_date
//         //     });
//         contactModel.create(csvArray)
//             .then((result) => {
//                 return res.status(200).json({ result });
//             }).catch((err) => {
//                 return res.status(500).json({ error });
//             });
//         //const listing = await listingModel.find({});
//         //     contact.save()
//         //         .then(data => {
//         //             console.log(data)
//         //         })
//         //         .catch(err => {

//         //         });
//         // });


//     })


app.get('/listing', async (req, res) => {
    const listing = await contactModel.find({});
    try {
        res.send(listing);
    } catch (err) {
        res.status(500).send(err);
    }
})





app.post('/listing', async (req, res) => {
    const listing = new listingModel(req.body);

    try {
        await listing.save();
        res.send(listing);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = app