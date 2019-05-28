const Database = require( './mongo.js' );
const Spotify = require( './spotify' );
const { failure } = require ( './errors' );

const ComputeAlbumDiffs = async ( ) => {
    const artistIds = await Database.getDB().collection( 'artists' ).aggregate([ { $project: { _id: 1 } } ]).toArray();

    for ( const artistId of artistIds ) {
        const artist = await Database.getDB().collection( 'artists' ).findOne( {_id: artistId }, { albums: 1 } );
        const currentRecordOfAlbums = artist.albums;

        let spotifyLocation = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=50&market=US`;
        let finishedGettingAlbums = false;
        const spotifyRecordOfAlbums = [];
        while ( !finishedGettingAlbums ) {
            const albumResult = await Spotify.hitAPI({ location: spotifyLocation, overrideLocation: true });
            Array.prototype.push.apply( spotifyRecordOfAlbums, albumResult.items );
            if ( albumResult.next ) {
                location = albumResult.next;
            } else {
                finishedGettingAlbums = true;
            }
        }

        const albumDiff = [];
        const albumDBWrites = [];
        const newRecordOfAlbums = [];
        for ( const album of spotifyRecordOfAlbums ) {
            newRecordOfAlbums.push( album.id );
            if ( currentRecordOfAlbums.indexOf( album.id ) >= 0 ) continue;
            albumDiff.push( album.id );
            albumDBWrites.push({
                updateOne: {
                    "filter": { _id: album.id },
                    "update": { $set: {
                        _id: album.id,
                        artistId,
                        name: album.name,
                        type: album.album_type,
                        image: album.images.length ? album.images[0].url : null,
                        releaseDate: new Date( album.release_date )
                    } },
                    "upsert": true
                }
            })
        }

        if ( albumDiff.length < 1 ) continue;

        const session = await Database.getClient().startSession();
        session.startTransaction();

        try {
            await Database.getDB().collection( 'albums' ).bulkWrite( albumDBWrites, { session } );
            await Database.getDB().collection( 'album-diffs' ).insertOne(
                {
                    createdAt: new Date(),
                    artistId,
                    albums: albumDiff,
                }, 
                { session }
            )
            await Database.getDB().collection( 'artists' ).updateOne(
                { _id: artistId },
                { $set: { albums: newRecordOfAlbums } },
                { session }
            )

            await session.commitTransaction();
            session.endSession();
        } catch ( error ) {
            await session.abortTransaction();
            session.endSession();
        }
        
    }

}