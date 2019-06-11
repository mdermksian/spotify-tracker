const {
    searchArtists,
    addArtist,
} = require( './spotify-methods' );
const {
    signUp,
    getSummaryForPeriod,
} = require( './user-methods' );
const ComputeAlbumDiffs = require( '../libraries/diffs' );
const sendMail = require( '../libraries/mailer' );

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

const GetSummaryForPeriod = async ( req, res ) => {
    const { userId, sinceDate } = req.body;
    const result = await getSummaryForPeriod( userId, sinceDate );
    res.json( result );
}

const SendTestMail = async ( req, res ) => {
    await sendMail();
    res.json( "Success" );
}

module.exports = {
    SearchArtists,
    AddArtist,
    TestRunDiff,
    SignUp,
    GetSummaryForPeriod,
    SendTestMail
}