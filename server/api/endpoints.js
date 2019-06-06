const {
    searchArtists,
    addArtist,
} = require( './spotify-methods' );
const {
    signUp
} = require( './user-methods' );

const ComputeAlbumDiffs = require( '../libraries/diffs' );

const SearchArtists = async ( req, res ) => {
    const { search } = req.query;
    const { error, artists } = await searchArtists( search );
    res.json( {
        error,
        artists
    } )
}

const AddArtist = async ( req, res ) => {
    const { artistId, userId } = req.body;
    const result = await addArtist( artistId, userId );
    res.json( result )
}

const TestRunDiff = async ( req, res ) => {
    await ComputeAlbumDiffs();
    res.json ( "Success" );
}

const SignUp = async ( req, res ) => {
    const { email, password } = req.body;
    const { user, error } = await signUp( { email, password } );
    res.json( {
        error,
        user,
    } )
}

module.exports = {
    SearchArtists,
    AddArtist,
    TestRunDiff,
    SignUp
}