const Database = require( './mongo.js' );
const Spotify = require( './spotify' );

const ComputeAlbumDiffs = async ( ) => {
    const runAt = new Date();
    const diffsCreated = [];
    const artistIdObjects = await Database.getDB().collection( 'artists' ).aggregate([ { $project: { _id: 1 } } ]).toArray();

    for ( const artistIdObject of artistIdObjects ) {
        const artistId = artistIdObject._id;
        const artist = await Database.getDB().collection( 'artists' ).findOne( {_id: artistId }, { albums: 1 } );
        const currentRecordOfAlbums = artist.albums;

        let spotifyLocation = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=50&market=US`;
        let finishedGettingAlbums = false;
        const spotifyRecordOfAlbums = [];
        while ( !finishedGettingAlbums ) {
            const albumResult = await Spotify.hitAPI({ location: spotifyLocation, overrideLocation: true });
            if( albumResult.error ) console.error(albumResult.error);
            Array.prototype.push.apply( spotifyRecordOfAlbums, albumResult.items );
            if ( albumResult.next ) {
                location = albumResult.next;
            } else {
                finishedGettingAlbums = true;
            }
        }
        if( spotifyRecordOfAlbums.length < 1 ) continue;

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

        if ( albumDiff.length < 1 ) {
            continue;
        }

        const session = await Database.getClient().startSession();
        session.startTransaction();

        try {
            const diffId = Database.createNewId();
            await Database.getDB().collection( 'albums' ).bulkWrite( albumDBWrites, { session } );
            await Database.getDB().collection( 'album-diffs' ).insertOne(
                {
                    _id: diffId,
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
            diffsCreated.push( diffId );
            session.endSession();
        } catch ( error ) {
            console.error(error);
            await session.abortTransaction();
            session.endSession();
        }
        
    }

    try {
        await Database.getDB().collection( 'diff-records' ).insertOne({
            runAt,
            finishedAt: new Date(),
            diffsCreated,
        })
    } catch ( error ) {
        console.error( error );
    }

}

module.exports = ComputeAlbumDiffs;