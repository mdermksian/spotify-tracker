const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const helmet = require( 'helmet' );
const morgan = require( 'morgan' );
const cors = require( 'cors' );

const Database = require( './libraries/mongo' );
const Spotify = require( './libraries/spotify' );
const { dbTestEndpoint, search } = require( './api/endpoints');

const app = express();
const PORT = 3000;

//Middlewares
app.use( helmet() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( cors() );
app.use( morgan( `:method :url :status :res[content-length] - :response-time ms`) );

//Endpoints
app.post('/db-test', dbTestEndpoint );
app.post('/search', search );

//Server init
( async function init () {
    try {
        await Database.connect();
        await Spotify.authenticate();
        app.emit( 'ready' );
    } catch ( e ) {
        console.log( e );
    }
} )();

app.on( 'ready', function() {
    app.listen( process.env.PORT || PORT, () => {
        console.log( "Main server started" );
    } );
} );