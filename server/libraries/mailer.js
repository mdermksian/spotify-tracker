const Database = require( './mongo' );
const nodemailer = require( 'nodemailer' );
const { getSummaryForPeriod } = require( '../api/user-methods' );
const DATE_OFFSET = 1;

const sendMail = async () => {

    let sinceDate = new Date();
    sinceDate.setDate( sinceDate.getDate() - DATE_OFFSET );
    const sinceDateString = sinceDate.toDateString();
    
    let transporter = nodemailer.createTransport({
        host: process.env.SPOTIFY_EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.SPOTIFY_EMAIL_USERNAME,
            pass: process.env.SPOTIFY_EMAIL_PASSWORD,
        }
    })

    const users = await Database.getDB().collection( 'users' ).find(
        { favoriteArtists: { $exists: true, $ne: [] } },
        { project: { _id: 1, email: 1 } }
    ).toArray();
    for ( const user of users ) {
        const { summary, error } = await getSummaryForPeriod( user._id, sinceDateString );

        if( error ) {
            console.error( error );
            continue;
        };

        if ( summary && summary.length ) {
            const title = `<h2>Your artist summary since ${sinceDateString}</h2>`;
            let body = `<table><tr><th>Artist</th><th>Album</th><th>Type</th><th>Release Date</th></tr>`;
            for( const album of summary ) {
                body += `<tr><td>${album.artist}</td><td>${album.name}</td><td>${album.type}</td><td>${album.releaseDate}</td></tr>`;
            }
            body += `</table>`;

            await transporter.sendMail({
                from: process.env.SPOTIFY_EMAIL_USERNAME,
                to: user.email,
                subject: `Artist Summary Since ${sinceDateString}`,
                text: "HTML isn't rendering for some reason!",
                html: `<div>${title}${body}</div>`
            })
        }
    }

}

module.exports = sendMail;