require('dotenv').config();
const express = require("express");
const cors = require('cors')
const app =express()
const port = process.env.PORT || 5000 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const { query } = require("express");



//middelwere  //
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.13hjh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  // console.log(authHeader);
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    // if (err) {
    //   return res.status(403).send({ message: 'Forbidden access' })
    // }
    req.decoded = decoded;
    next();
  });
}



async function run() {
 await client.connect()
 const toolsCollection = client.db('electronicsManufacturer').collection('tools')
 const bookingsCollection = client.db('electronicsManufacturer').collection('bookings')
 const usersCollection = client.db('electronicsManufacturer').collection('users')
 const reviewsCollection = client.db('electronicsManufacturer').collection('reviews')
 const profilesCollection = client.db('electronicsManufacturer').collection('profiles')

app.get('/tools',verifyJWT, async(req,res)=>{
  const result = await toolsCollection.find({}).toArray()
res.send(result)

})
app.post('/addproduct', async(req,res)=>{
  const product = req.body
  const result = await toolsCollection.insertOne(product)
  res.send(result)

})

app.get('/tools/:id', verifyJWT,async(req,res)=>{
  const id = req.params.id
  const filter = {_id:ObjectId(id)}

  const result = await toolsCollection.findOne(filter)
  // console.log(result);
res.send(result)

})

app.get('/allorders', verifyJWT,async(req,res)=>{
const result = await bookingsCollection.find({}).toArray()
res.send(result)

})

app.post('/myorders',async(req,res)=>{
  const booking = req.body
  // console.log(booking);
const result = await bookingsCollection.insertOne(booking)
res.send(result)
})


 app.get('/myorders',verifyJWT , async (req,res)=>{
const email = req.query.email
const filter = {email:email}
// console.log(email);
  const result = await bookingsCollection.find(filter).toArray()
res.send(result)

})


app.get('/myorder/payment/:id',verifyJWT , async(req,res)=>{
  const id = req.params.id
  const filter = {_id:ObjectId(id)}
  // console.log(email);
    const result = await bookingsCollection.findOne(filter)
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
  const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
  res.send({ result, token });
})

app.get('/admin/:email',async(req, res) =>{
  const email = req.params.email;
  const user = await usersCollection.findOne({email: email});
  const isAdmin = user.role === 'admin';
  res.send({admin: isAdmin})
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

app.get('/users', verifyJWT,async(req,res)=>{
    const users = await usersCollection.find({}).toArray()
  res.send(users)
  
  })

  app.post('/addproduct',async(req,res)=>{
    const order = req.body
    const result = await toolsCollection.insertOne(order)
    console.log(result);
    res.send(result)
  })

  app.get('/reviews', async(req,res)=>{
    const result = await reviewsCollection.find({}).toArray()
    res.send(result)
    
    })


    app.post('/addreview',async(req,res)=>{
      const review = req.body
        const result = await reviewsCollection.insertOne(review)
        res.send(result)
       
    })

    app.delete('/cancelorder/:id',async(req,res)=>{
      const id = req.params.id ;
      const query = {_id:ObjectId(id)};
      // console.log(query);
    const result = await bookingsCollection.deleteOne(query)
    // console.log(result);
    res.send(result)
    
    })
    app.delete('/cancelallorder/:id',async(req,res)=>{
      const id = req.params.id ;
      const query = {_id:ObjectId(id)};
      // console.log(query);
    const result = await bookingsCollection.deleteOne(query)
    // console.log(result);
    res.send(result)
    
    })
    app.delete('/deleteallproduct/:id',async(req,res)=>{
      const id = req.params.id ;
      const query = {_id:ObjectId(id)};
      // console.log(query);
    const result = await toolsCollection.deleteOne(query)
    // console.log(result);
    res.send(result)
    
    })


    app.put('/user/updatemyprofile/:email', async (req, res) => {
      const email = req.params.email;
      const profile = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: profile,
      };
      const result = await profilesCollection.updateOne(filter, updateDoc, options);
      
      res.send(result);
    })
  
    app.get('/user/myprofile/:email', verifyJWT, async(req, res) =>{
      const email = req.params.email;
      const user = await profilesCollection.findOne({email: email})
      res.send(user)
    })

// payment //
// app.post('/create-payment-intent',  async(req, res) =>{
//   const service = req.body;
//   console.log(service);
//   const price = service.price;
//   const amount = price*100;
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount : amount,
//     currency: 'usd',
//     payment_method_types:['card']
//   });
//   // console.log(paymentIntent.client_secret);
//   res.send({clientSecret: paymentIntent.client_secret})
// });



}




run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})