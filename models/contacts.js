const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({

    listingId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    contactDate: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

});

const Contacts = mongoose.model("Contacts", ContactSchema);
module.exports = Contacts;