const ObjectId = require('mongodb').ObjectId
const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
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

        // drones get api all
        app.get('/drones', async (req, res) => {
            const cursor = dronesCollection.find({});
            const result = await cursor.toArray();
            res.json(result)
        })

        // get product by id 
        app.get('/drones/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) }
            const cursor = await dronesCollection.findOne(query);
            res.json(cursor)
        });

        // drones get api for home section here using limit
        app.get('/drones-home', async (req, res) => {
            const cursor = dronesCollection.find({}).limit(6);
            const result = await cursor.toArray();
            res.json(result)
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