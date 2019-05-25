const Database = require( '../libraries/mongo' );
const Spotify = require( '../libraries/spotify' );

const {
    searchArtists,
    addArtist,
} = require( './methods' );

const SearchArtists = async ( req, res ) => {
    const { search } = req.query;
    const { error, artists } = await searchArtists( search );
    res.json({
        error,
        artists
    })
}

const AddArtist = async ( req, res ) => {
    const { artistId } = req.query;


    const result = await Spotify.hitAPI( { location: `artists/${artistId}` } );
    
    if ( result.error ) {
        res.json( result );
        return
    }

    try {
        const cleanedArtist = {
            _id: result.id,
            name: result.name,
            image: result.images.length ? result.images[0].url : null,
        };

        await Database.getDB().collection( 'artists' ).updateOne(
            { _id: artistId },
            { $set: cleanedArtist },
            { upsert: true }
        )

        res.json( cleanedArtist );
    } catch ( error ) {
        console.log( error );
        res.json( { error } );
    }
    
}

module.exports = {
    SearchArtists,
    AddArtist
}