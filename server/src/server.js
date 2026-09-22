require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is required. Add it to server/.env before starting the server.");
    process.exit(1);
}

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on
http://localhost:${PORT}`));
});
