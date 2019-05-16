const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const helmet = require( 'helmet' );
const morgan = require( 'morgan' );
const cors = require( 'cors' );

const app = express();
const PORT = 3000;

//Middlewares
app.use( helmet() );
app.use( bodyParser.json() );
app.use( cors() );
app.use( morgan( `:method :url :status :res[content-length] - :response-time ms`) );

//Endpoints





app.listen( PORT );