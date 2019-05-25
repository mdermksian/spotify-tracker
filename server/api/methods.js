const Spotify = require( '../libraries/spotify' );
const Database = require( '../libraries/mongo' );
const API_ERRORS = require( './errorMessages' );
const { failure, validateInputs } = require( '../libraries/errors' );

const searchArtists = async ( search ) => {

    const types = [
        {
            value: search,
            type: 'string',
        }
    ];

    if ( !validateInputs(types) ) {
        return failure( API_ERRORS.SEARCH_ERRORS.BAD_INPUT );
    }

    const result = await Spotify.hitAPI( { location: `search?q=${search}&type=artist&limit=5` } );

    if ( result.error ) {
        console.error( result.error );
        return failure( API_ERRORS.SEARCH_ERRORS.SEARCH_FAILED );
    }

    if ( !result.artists ) {
        return failure( API_ERRORS.SEARCH_ERRORS.NO_ARTISTS_RETURNED );
    }

    const processedArtists = result.artists.items.map( ( item ) => {
        return {
            _id: item.id,
            name: item.name,
        }
    } );

    return { artists: processedArtists }
}

const addArtist = ( artistId ) => {

}

module.exports = {
    searchArtists,
    addArtist
}