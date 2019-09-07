const https = require('https');
const querystring = require('querystring');

const artistsToAdd = [
    
];

const myUserId = "";

for( const artist of artistsToAdd ) {
    console.log("artist: ", artist, "\ntype: ", typeof artist);
    new Promise((resolve, reject) => {
        const postData = querystring.stringify({
            userId: myUserId,
            artistId: artist
        });
        console.log(postData);
        const options = {
            host: "mkd-spotify-tracker.herokuapp.com",
            port: 443,
            path: "/addArtist",
            method: "POST",
            headers: {
                'Content-Type': "application/x-www-form-urlencoded",
                'Content-Length': postData.length
            }
        };
        const request = https.request( options, function(res) {
            let buffers = [];
            res.on('data', buffer => buffers.push(buffer) );
            res.on('end', function () {
                res.statusCode === 200 ? resolve(Buffer.concat(buffers)) : reject(Buffer.concat(buffers));
            });
            res.on('error', function(err){
                console.log(err);
                reject();
            })
        } )
    
        request.write(postData);
    
        request.end();
    })
    
}