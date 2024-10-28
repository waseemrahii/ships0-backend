import config from "./config/index.js";
import connectDB from "./config/db.js";
import app from "./app.js";

// Connect to the database
connectDB();

// Start the server
export default app;
