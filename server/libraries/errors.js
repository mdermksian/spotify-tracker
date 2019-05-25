const failure = ( { errorMessage, errorCode } = { errorMessage: "undefined", errorCode: "undefined" } ) => {
    console.error( errorMessage, errorCode );

    return {
        error: {
            errorMessage,
            errorCode
        }
    }
}

const validateInputs = ( array ) => {
    let valid = true;

    for( const item of array ) {
        const { value, type } = item;

        if ( typeof value !== type ) {
            console.error( "Invalid Type", value, type );
            valid = false;
            break;
        }
    }

    return valid;
}

module.exports = {
    failure,
    validateInputs
}