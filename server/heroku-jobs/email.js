const sendMail = require( '../libraries/mailer' );
const Database = require( '../libraries/mongo' );

( async function test() {
    await Database.connect();
    sendMail();
})();