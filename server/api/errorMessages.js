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
        }
    },
    ADD_ARTIST_ERRORS: {
        BAD_INPUT: {
            errorMessage: "The artistId must be a string",
            errorCode: 1010,
        },
        SPOTIFY_ARTIST_FAILURE: {
            errorMessage: "Spotify returned an error while retrieving the artist",
            errorCode: 1011,
        },
        ARTIST_ALREADY_ADDED: {
            errorMessage: "This artist has already been added, please compute a diff instead",
            errorCode: 1012,
        },
        SPOTIFY_ALBUMS_FAILURE: {
            errorMessage: "Spotify returned an error while retrieving albums",
            errorCode: 1013,
        }
    },
    SIGN_UP_ERRORS: {
        BAD_INPUT: {
            errorMessage: "Bad input",
            errorCode: 1020,
        },
        USER_ALREADY_EXIST: {
            errorMessage: "A user with this email address already exists",
            errorCode: 1021
        },
        COULDNT_CREATE_USER: {
            errorMessage: "Sorry, the user could not be created",
            errorCode: 1022,
        },
    },
    SUMMARY_ERRORS: {
        BAD_INPUT: {
            errorMessage: "Bad Input",
            errorCode: 1030,
        },
        USER_NOT_FOUND: {
            errorMessage: "User not found",
            errorCode: 1031,
        }
    }
}

module.exports = API_ERRORS;