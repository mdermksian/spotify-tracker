const Database = require( '../libraries/mongo' );

const dbTestEndpoint = async ( req, res ) => {
    console.log( req.body )
    const { param } = req.body;
    const { success, error } = dbTest( param );
    res.json( {
        success,
        error
    } )
};

const dbTest = async ( param ) => {
    try {
        await Database.getDB().collection( 'dbTest' ).insertOne({ param });
        return { success: "Success!" }
    } catch ( error ) {
        return { error: "Something went wrong" };
    }
    
}

module.exports = {
    dbTestEndpoint
}