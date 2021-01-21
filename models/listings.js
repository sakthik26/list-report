const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        set: d => new Date(d)
    },
    listingId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    make: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    sellerType: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        enum: ['private', 'dealer', 'other'],
        default: 'private'
    },
    price: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) throw new Error("Negative values aren't real.");
        }
    },
    count: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) throw new Error("Negative values aren't real.");
        }
    },
});

const Listings = mongoose.model("Listings", ListingSchema);
module.exports = Listings;