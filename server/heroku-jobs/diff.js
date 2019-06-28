const ComputeAlbumDiffs = require( '../libraries/diffs' );
const Database = require( '../libraries/mongo' );

( async function job() {
    await Database.connect();
    ComputeAlbumDiffs();
} )();
