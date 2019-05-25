const API_ERRORS = {
    SEARCH_ERRORS: {
        BAD_INPUT: {
            errorMessage: "Your search query must be a string",
            errorCode: 1000,
        },
        SEARCH_FAILED: {
            errorMessage: "The search failed",
            errorCode: 1001,
        },
        NO_ARTISTS_RETURNED: {
            errorMessage: "No artist field was returned from Spotify",
            errorCode: 1002,
        },
        
    },
    ADD_ARTIST_ERRORS: {

    },
}

module.exports = API_ERRORS;