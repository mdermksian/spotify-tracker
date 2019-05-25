const {
    searchArtists,
    addArtist,
} = require( './methods' );

const SearchArtists = async ( req, res ) => {
    const { search } = req.query;
    const { error, artists } = await searchArtists( search );
    res.json( {
        error,
        artists
    } )
}

const AddArtist = async ( req, res ) => {
    const { artistId } = req.query;
    const { error, artist, albums } = await addArtist( artistId );
    res.json( {
        error,
        artist,
        albums
    } )
}

module.exports = {
    SearchArtists,
    AddArtist
}