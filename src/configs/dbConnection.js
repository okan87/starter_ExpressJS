"use strict";

const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB);
        console.log("* DB Connected *");
    } catch (err) {
        console.error("* DB Not Connected *", err.message);
        // process.exit(1); // Sunucunun tamamen kapanmasına sebep olur, yoruma alındı.
        throw err; // Hata üst katmana iletilir ve merkezi error handler tarafından yakalanabilir.
    }
};

module.exports = dbConnection;