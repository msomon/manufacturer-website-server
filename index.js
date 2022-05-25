const express = require("express");
const cors = require('cors')
const app =express()
const port = process.env.PORT || 5000 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { query } = require("express");
require('dotenv').config();


//middelwere  //
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.13hjh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}



async function run() {
 await client.connect()
 const toolsCollection = client.db('electronicsManufacturer').collection('tools')
 const bookingsCollection = client.db('electronicsManufacturer').collection('bookings')
 const usersCollection = client.db('electronicsManufacturer').collection('users')

app.get('/tools',async(req,res)=>{
  const result = await toolsCollection.find({}).toArray()
res.send(result)

})
app.post('/addproduct',async(req,res)=>{
  const product = req.body
  const result = await toolsCollection.insertOne(product)
  res.send(result)

})

app.get('/tools/:id',async(req,res)=>{
  const id = req.params.id
  const filter = {_id:ObjectId(id)}

  const result = await toolsCollection.findOne(filter)
  // console.log(result);
res.send(result)

})

app.post('/myorders',async(req,res)=>{
  const booking = req.body
  // console.log(booking);
const result = await bookingsCollection.insertOne(booking)
res.send(result)

})

app.get('/myorders',async(req,res)=>{

const email = req.query.email
const filter = {email:email}
// console.log(email);
  const result = await bookingsCollection.find(filter).toArray()
res.send(result)

})

app.put('/users/:email', async (req, res) => {
  const email = req.params.email;
  const user = req.body;
  const filter = { email: email };
  const options = { upsert: true };
  const updateDoc = {
    $set: user,
  };
  const result = await usersCollection.updateOne(filter, updateDoc, options);
  const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
  res.send({ result, token });
})

app.put('/users/admin/:email', async (req ,res) => {
  const email = req.params.email;
  // console.log(email);
  const filter = { email: email };
  const updateDoc = {
    $set: { role: 'admin' },
  };

  const admin = await usersCollection.updateOne(filter, updateDoc);
  res.send(admin)
})

app.get('/users',async(req,res)=>{
    const users = await usersCollection.find({}).toArray()
  res.send(users)
  
  })

  app.post('/addproduct',async(req,res)=>{
    const order = req.body
    const result = await toolsCollection.insertOne(order)
    console.log(result);
    res.send(result)
  })
  
}




run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})