const mongoose= require('mongoose');

const uri = "mongodb+srv://admin:admin@crmdashboard.0gjdg.mongodb.net/?retryWrites=true&w=majority&appName=Crmdashboard";
const connectDB = () => {
    console.log("connect db")
    return mongoose.connect(uri,{
        useNewUrlParser: true,
        useUnifiedTopolgy: true,
    });
};

module.exports= connectDB;