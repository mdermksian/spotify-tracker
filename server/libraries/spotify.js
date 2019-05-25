const fetch = require( 'node-fetch' );
let instance = null;

class Spotify {
    constructor() {
        if ( instance ) {
            return instance;
        }

        instance = this;

        this.CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
        this.SECRET_KEY = process.env.SPOTIFY_SECRET_KEY;
    }

    async authenticate() {
        if ( this.AUTH_TOKEN && this.EXPIRES_AT && this.EXPIRES_AT > Date.now() ) return;
        if ( !this.CLIENT_ID || !this.SECRET_KEY ) return;
        try {
            const Base65_ClientID_SecretKey = Buffer.from(`${this.CLIENT_ID}:${this.SECRET_KEY}`).toString( 'base64' );
            const res = await fetch( 'https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Base65_ClientID_SecretKey}`
                },
                body: "grant_type=client_credentials"
            } );
            const result = await res.json();
            this.EXPIRES_AT = Date.now() + result.expires_in * 1000;
            this.AUTH_TOKEN = result.access_token;
            console.log(this.EXPIRES_AT, this.AUTH_TOKEN);
        } catch ( error ) {
            console.log(error);
        }
    }

    async hitAPI( { location, method = "GET", overrideLocation = false } ) {
        await this.authenticate();
        const uri = overrideLocation ? location : `https://api.spotify.com/v1/${location}`;
        try {
            const res = await fetch( uri, {
                method,
                headers: {
                    'Content-Type' : 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${this.AUTH_TOKEN}`
                }
            })
            const result = await res.json();
            return result;
        } catch ( error ) {
            console.log(error);
        }

    }
}

module.exports = new Spotify();