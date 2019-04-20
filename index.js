
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const helmet = require( 'helmet' );
const morgan = require( 'morgan' );

const app = express();
const PORT = 3000;

app.use( helmet( ) );
app.use( bodyParser.json() );
app.use( morgan( `:method :url :status :res[content-length] - :response-time ms`) );

app.listen( PORT );