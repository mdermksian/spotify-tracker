const { MongoClient } = require( 'mongodb' );
let instance = null;

class Database {
    constructor() {
        if (!instance) {
            instance = this;
        } else {
            return instance;
        }

        this.uri = process.env.SPOTIFY_MONGO_URL ||  'mongodb://localhost:27017/spotify-tracker';
    }

    async connect() {
        return new Promise((resolve, reject) => {
            MongoClient.connect( this.uri, { useNewUrlParser: true }, (err, client) => {
                if (err) reject(err);
                this.client = client;
                resolve(this)
            })
        })
    }
    
    getDB() {
        return this.client.db();
    }
}

module.exports = new Database();