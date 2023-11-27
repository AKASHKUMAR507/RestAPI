import express from "express";
import { APP_PORT, DB_URL } from './config'
import errorHandler from "./middlewares/errorHandler";
import router from "./routes";
import mongoose from "mongoose";
import path from "path";

const app = express();

global.appRoot = path.resolve(__dirname); 

app.use(express.urlencoded({extended: false}));
app.use(express.json())
app.use('/api', router) 
app.use('/uploads', express.static('uploads'))

// database connection
mongoose.connect(DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('DB connected...');
})



app.use(errorHandler);
app.listen(APP_PORT, () => console.log(`listening on port ${APP_PORT}`));

// version = '0.0.1';