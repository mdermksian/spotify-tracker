const Database = require( '../libraries/mongo' );

const dbTestEndpoint = async ( req, res ) => {
    console.log( req.body )
    const { param } = req.body;
    const { success, error } = await dbTest( param );
    res.json( {
        success,
        error
    } )
};

const search = async ( req, res ) => {
    const { query } = req;
}

const dbTest = async ( param ) => {
    try {
        await Database.getDB().collection( 'dbTest' ).insertOne({ param });
        return { success: "Success!" }
    } catch ( error ) {
        return { error: "Something went wrong" };
    }
    
}

module.exports = {
    dbTestEndpoint,
    search
}