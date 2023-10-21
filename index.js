
const express = require('express');
const app = express()
const jwt  = require('jsonwebtoken')
const cors = require('cors');
require('dotenv').config()
const port  = process.env.PORT || 5000;


//MIDDLEWARE
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rw41wea.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const userCollection = client.db("techDb").collection("users");
    const menuCollection = client.db("techDb").collection("menu");
    const cartCollection = client.db("techDb").collection("cart");

    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })

      res.send({ token })
    })

    app.get('/users',async(req, res)=>{
      const result = await userCollection.find().toArray();
      res.send(result)
    });

    app.get('/users/admin/:email', async(req, res)=>{
      const email= req.params.email;
      const query = {email: email};
      const user = await userCollection.findOne(query);
      const result = {admin: user?.roll === 'admin'}
      res.send(result)
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user)
      const query = { email: user.email.photoURL }
      const existingUser = await userCollection.findOne(query);
      console.log('existing user', existingUser)

      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.patch('/users/admin/:id',async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updateAdmin = {
        $set:{
          roll:'admin'
        },
      };
      const result = await userCollection.updateOne(filter,updateAdmin)
      res.send(result)

    });

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/menu', async(req, res)=>{
        const result = await menuCollection.find().toArray();
        res.send(result)
    });
    app.post('/menu',async(req,res)=>{
      const newItem = req.body;
      const result= await menuCollection.insertOne(newItem);
      res.send(result)
    })

    app.post('/cart', async (req, res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);
      res.send(result);
    });

    app.get('/cart', async(req,res)=>{
      const email = req.query.email;
      if(!email){
        res.send([]);

      }
      const query = {email: email};
      const result = await cartCollection.find(query).toArray();
      res.send(result)
    });

    app.delete('/cart/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('boss is setting')
})

app.listen(port,()=>{
    console.log(`tech mart is setting on port ${port}`)
})