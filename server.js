require('dotenv').config()
const express=require('express')
const app=express()
const ejs = require('ejs')
const path=require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3300
const mongoose = require('mongoose')
const session =require('express-session')
const flash = require('express-flash')
const MongoDbStore=require('connect-mongo')(session)
const passport = require('passport')


//database connection

const url = 'mongodb://localhost/pizza';
mongoose.connect(url,{useNewUrlParser:true,useCreateIndex:true,useUnifiedTopology:true,
useFindAndModify:true});

const connection=mongoose.connection;
connection.once('open',()=>{
    console.log('Database connected...');
}).catch(err=>{
    console.log('connection failed...')
});

//session store
 let mongoStore= new MongoDbStore({
                mongooseConnection:connection,
                Collection:'sessions'
           })



// session connection
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store:mongoStore,
    saveUninitialized:false,
    cookie:{maxAge:1000*60*60*24}
}))

//passport configue
const passportInit=require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())


// Assest

app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//global middleware
app.use((req,res,next) =>{
    res.locals.session = req.session
    res.locals.user = req.user
    next()

})  

//set template engine

app.use(expressLayout)
app.set('views', path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')

require('./routes/web')(app)

app.listen(PORT,() =>{
    console.log(`listening on port ${PORT}`)
})