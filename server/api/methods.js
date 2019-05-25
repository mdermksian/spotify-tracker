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
        console.error( "Spotify Error: ", result.error );
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

const addArtist = async ( artistId ) => {

    const types = [
        {
            value: artistId,
            type: 'string',
        }
    ];
    if ( !validateInputs( types ) ) {
        return failure( API_ERRORS.ADD_ARTIST_ERRORS.BAD_INPUT );
    }

    const artistResult = await Spotify.hitAPI( { location: `artists/${artistId}` } );
    if ( artistResult.error ) {
        console.error( "Spotify Error: ", artistResult.error );
        return failure( API_ERRORS.ADD_ARTIST_ERRORS.SPOTIFY_ARTIST_FAILURE );
    }
    if( await Database.getDB().collection( 'artists' ).findOne({_id: artistResult.id}) ) {
        return failure( API_ERRORS.ADD_ARTIST_ERRORS.ARTIST_ALREADY_ADDED );
    }

    let finishedGettingAlbums = false;
    let location = `https://api.spotify.com/v1/artists/${artistResult.id}/albums?include_groups=album,single&limit=50&market=US`;
    const albums = [];
    while ( !finishedGettingAlbums ) {
        const albumResult = await Spotify.hitAPI( { location, overrideLocation: true } );
        if ( albumResult.error ) {
            console.error( "Spotify Error: ", albumResult.error );
            return failure( API_ERRORS.ADD_ARTIST_ERRORS.SPOTIFY_ALBUMS_FAILURE );
        }
        Array.prototype.push.apply( albums, albumResult.items );
        if ( albumResult.next ) {
            location = albumResult.next;
        } else {
            finishedGettingAlbums = true;
        }
    }
    
    const albumDBWrites = [];
    const albumIds = [];
    for ( const album of albums ) {
        albumIds.push( album.id );
        albumDBWrites.push({
            updateOne: {
                "filter": { _id: album.id },
                "update": { $set: {
                    _id: album.id,
                    name: album.name,
                    type: album.album_type,
                    image: album.images.length ? album.images[0].url : null,
                    releaseDate: new Date( album.release_date )
                } },
                "upsert": true
            }
        })
    }

    const artistToInsert = {
        _id: artistResult.id,
        name: artistResult.name,
        image: artistResult.images.length ? artistResult.images[0].url : null,
        albums: albumIds,
    };


    try {
        await Database.getDB().collection( 'artists' ).insertOne( artistToInsert );
        await Database.getDB().collection( 'albums' ).bulkWrite( albumDBWrites );
        return {
            artist: artistToInsert,
            albums: albums
        };
    } catch ( error ) {
        console.error( error );
        return { error }
    }
}

module.exports = {
    searchArtists,
    addArtist
}