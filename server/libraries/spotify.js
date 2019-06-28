const request = require( 'request' );
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

    sleep( t ) {
        return new Promise( (resolve) => setTimeout( resolve, t ) );
    } 

    async authenticate() {
        if ( this.AUTH_TOKEN && this.EXPIRES_AT && this.EXPIRES_AT > Date.now() ) return;
        if ( !this.CLIENT_ID || !this.SECRET_KEY ) return;
        const Base64_ClientID_SecretKey = Buffer.from(`${this.CLIENT_ID}:${this.SECRET_KEY}`).toString( 'base64' );
        const options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Base64_ClientID_SecretKey}`
            },
            url: 'https://accounts.spotify.com/api/token',
            body: "grant_type=client_credentials"
        }

        const result = await new Promise( resolve => {
            request.post( options, function( error, response, body ){
                if( error ) resolve( { error } );
                if( !response || ( response && response.statusCode !== 200 ) ) {
                    resolve( { error: "Network error" } );
                } else {
                    console.log( "body", body );
                    resolve( JSON.parse( body ) );
                }
            })
        })

        if( result.expires_in && result.access_token ) {
            this.EXPIRES_AT = Date.now() + result.expires_in * 1000;
            this.AUTH_TOKEN = result.access_token;
            console.log(this.EXPIRES_AT, this.AUTH_TOKEN);
        }
        
    }

    async requestAPI( { location, method = "get", options = {}, overrideLocation = false } ) {
        if( !options.url && location ) options.url = overrideLocation ? location : `https://api.spotify.com/v1/${location}`;

        await this.authenticate();

        options.headers = {
            'Authorization': `Bearer ${this.AUTH_TOKEN}`
        }

        return new Promise( resolve => {
            request[ method ]( options, function( error, response, body ) {
                if ( error ) resolve( { error } );

                if ( !response ) {
                    resolve( { error: "Network error" } );
                } else if ( response.statusCode !== 200 ){
                    const data = JSON.parse( response.headers );
                    resolve( data );
                } else {
                    try {
                        if ( method === 'post' ) {
                            resolve( { data: body } );
                        } else {
                            const data = JSON.parse( body );
                            resolve( data );
                        }
                    } catch ( error ) {
                        resolve( { error: "Network error" } );
                    }
                }
            } )
        } )
    }

    async safelyRequestAPI( { location, method = "get", options = {}, overrideLocation = false } ) {
        let response = await this.requestAPI( { location, method, options, overrideLocation } );
        if( response['Retry-After'] ) {
            await this.sleep( response['Retry-After'] * 1000 );
            response = await this.requestAPI( { location, method, options, overrideLocation } );
        }
        return response;
    }
}

module.exports = new Spotify();