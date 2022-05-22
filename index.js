const express = require("express");
const cors = require('cors')
const app =express()
const port = process.env.PORT || 5000 
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const { query } = require("express");
require('dotenv').config();


//middelwere  //
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.13hjh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
 await client.connect()
 const toolsCollection = client.db('electronicsManufacturer').collection('tools')

app.get('/tools',async(req,res)=>{
  

  const result = await toolsCollection.find({}).toArray()
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