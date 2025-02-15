const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio:{type: String},

    // Friend System
    friends: [{
        userId: { type: String, required: true },
        name: { type: String, required: true },
    },],  
    sentRequests: [{
        userId: { type: String, required: true },
        name: { type: String, required: true },
    },], 
    friendRequests: [{
        userId: { type: String, required: true },
        name: { type: String, required: true },
    },], 
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
