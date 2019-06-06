const bcrypt = require( 'bcrypt' );
const Database = require( '../libraries/mongo' );
const { failure, validateInputs } = require( '../libraries/errors' );
const API_ERRORS = require( './errorMessages' );

const saltRounds = 10;

const signUp = async ( { password, email } ) => {

    const types = [
        { value: password, type: 'string' },
        { value: email,    type: 'string' }
    ];

    if( !validateInputs( types ) ) return failure( API_ERRORS.SIGN_UP_ERRORS.BAD_INPUT );

    email = email.toLowerCase();

    const user = await Database.getDB().collection( 'users' ).findOne( { email } );
    if ( user ) return failure( API_ERRORS.SIGN_UP_ERRORS.USER_ALREADY_EXIST );

    const { hash, error } = await new Promise ( ( resolve ) => {
        bcrypt.hash( password, saltRounds, function( error, hash ) {
            if( error ) {
                resolve( { error } );
            } else {
                resolve( { hash } );
            }
        } )
    } )
    
    if( error ) return failure( API_ERRORS.SIGN_UP_ERRORS.COULDNT_CREATE_USER );
    try {
        await Database.getDB().collection( 'users' ).insertOne( {
            _id: Database.createNewId(),
            email,
            password: hash,
            favoriteArtists: [],
            dateCreated: new Date(),
        } )
        const user = await Database.getDB().collection( 'users' ).findOne( { email } );
        return { user: {
            _id: user._id,
            email: user.email,
            favoriteArtists: user.favoriteArtists
        } }
    } catch( error ) {
        return failure( API_ERRORS.SIGN_UP_ERRORS.COULDNT_CREATE_USER );
    }
}

const getSummaryForPeriod = async ( userId, sinceDate ) => {
    const types = [
        { value: userId,    type: 'string' },
        { value: sinceDate, type: 'string' }
    ];

    if ( !validateInputs( types ) ) return failure( API_ERRORS.SUMMARY_ERRORS.BAD_INPUT );

    const user = await Database.getDB().collection( 'users' ).findOne({ _id: userId });
    if ( !user ) return failure( API_ERRORS.SUMMARY_ERRORS.USER_NOT_FOUND );

    const userFavoriteArtists = user.favoriteArtists;
    const diffsForUserArtists = await Database.getDB().collection( 'album-diffs' ).find({
        artistId: { $in: userFavoriteArtists },
        createdAt: { $gt: new Date( sinceDate ) }
    }).toArray();

    const albumIds = [];
    for( const diff of diffsForUserArtists ) { Array.prototype.push.apply( albumIds, diff.albums ) };

    const summary = [];
    for( const albumId of albumIds ) {
        const album = await Database.getDB().collection( 'albums' ).findOne( { _id: albumId } );
        const artist = await Database.getDB().collection( 'artists' ).findOne( { _id: album.artistId } );
        summary.push( {
            name: album.name,
            releaseDate: album.releaseDate,
            type: album.type,
            image: album.image,
            artist: artist.name
        } )
    }

    return { summary }
}

module.exports = {
    signUp,
    getSummaryForPeriod,
}