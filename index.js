const ObjectId = require('mongodb').ObjectId
const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

// stripe import here 
const stripe = require('stripe')(process.env.STRIPE_KEY)

//port 
const port = process.env.PORT || 5000;

require('dotenv').config();

// using middlewere here
app.use(express.json());
app.use(cors());

// database uri and client here
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s74ce.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// database connection function 
async function run() {
    try {
        await client.connect();
        const dronesNetwork = client.db('drones-network');
        const dronesCollection = dronesNetwork.collection('drones');
        const ordersCollection = dronesNetwork.collection('orders');
        const reviewsCollection = dronesNetwork.collection('reviews');
        const usersColletion = dronesNetwork.collection('users');

        // drones get api all
        app.get('/drones', async (req, res) => {
            const cursor = dronesCollection.find({});
            const result = await cursor.toArray();
            res.json(result)
        })

        //drones post api here 
        app.post('/drones', async (req, res) => {
            const cursor = await dronesCollection.insertOne(req.body);
            res.json(cursor)
        })

        // get product by id 
        app.get('/drones/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) }
            const cursor = await dronesCollection.findOne(query);
            res.json(cursor)
        });

        // drone delete api 
        app.delete('/drone/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) }
            const result = await dronesCollection.deleteOne(query);
            res.json(result)
        })

        // drones get api for home section here using limit
        app.get('/drones-home', async (req, res) => {
            const cursor = dronesCollection.find({}).limit(6);
            const result = await cursor.toArray();
            res.json(result)
        })

        // orders post api here 
        app.post('/orders', async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.json(result);
        })

        // orders get api here 
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            res.json(result)
        })

        // order put api 
        app.put('/order/:id', async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) }
            const updateDoc = { $set: { status: 'shipped' } }
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.json(result)
        });

        // getting order data by email address
        app.get('/orders/:email', async (req, res) => {
            const cursor = await ordersCollection.find({ email: req.params.email }).toArray();
            res.json(cursor)

        })

        // delete order api
        app.delete('/order/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) }
            const result = await ordersCollection.deleteOne(query);
            res.json(result)
        })

        // reviews post api 
        app.post('/reviews', async (req, res) => {
            const cursor = await reviewsCollection.insertOne(req.body);
            res.json(cursor);
        })

        // reviews get api
        app.get('/reviews', async (req, res) => {
            const cursor = await reviewsCollection.find({}).toArray();
            res.json(cursor);
        })

        // user api
        app.post('/users', async (req, res) => {
            const cursor = await usersColletion.insertOne(req.body);
            res.json(cursor)
        })

        // users put api here 
        app.put('/users', async (req, res) => {
            const query = { email: req.body.email }
            const options = { upsert: true }
            const updateDocs = { $set: req.body }
            const result = await usersColletion.updateOne(query, updateDocs, options)
        })

        // admin api
        app.put('/user/admin', async (req, res) => {
            const query = { email: req.body.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersColletion.updateOne(query, updateDoc);
            res.json(result)
        })

        // users get api 
        app.get('/user/:email', async (req, res) => {
            const user = await usersColletion.findOne({ email: req.params.email });
            let isAdmin = false;
            if (user?.role === 'admin') { isAdmin = true }
            res.json({ admin: isAdmin })
        })

        // stripe api here 
        app.post('/create-payment-intent', async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']
            });
            res.json({ clientSecret: paymentIntent.client_secret })
        })

    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`listen port ${port}`)
})