const { MongoClient } = require( 'mongodb' );
let instance = null;

class Database {
    constructor() {

        if ( instance ) {
            return instance;
        }

        instance = this;

        this.uri = process.env.SPOTIFY_MONGO_URL || 'mongodb://localhost:27017/spotify-tracker';
    }

    async connect() {
        if (this.client) {
            if (this.client.then) {
                return this.client; // If this.client is a promise, then return that promise.
            }
            return this; // The promise must have resolved and overwritten this.client. Return this, i.e. the value to which the promise resolved.
        }

        this.client = new Promise((resolve, reject) => {
            MongoClient.connect( this.uri, { useNewUrlParser: true }, (err, client) => {
                if (err) reject(err);
                this.client = client;
                resolve(this);
            });
        });

        return this.client;
    }
    
    getDB() {
        return this.client.db();
    }

    getClient() {
        return this.client;
    }
}

module.exports = new Database();