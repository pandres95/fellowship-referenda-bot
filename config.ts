export default {
  matrix: {
    homeserverUrl: process.env.MATRIX_HOMESERVER ?? "https://matrix.org",
    accessToken: process.env.MATRIX_AUTHTOKEN,

    username: process.env.MATRIX_USERNAME,
    password: process.env.MATRIX_PASSWORD,

    roomId: process.env.MATRIX_ROOMID,
  },
  substrate: {
    endpointUrl: process.env.SUBSTRATE_ENDPOINT_URL,
    referendaPallet: process.env.SUBSTRATE_REFERENDA_PALLET ?? "referenda",
  },
  subsquare: {
    host: process.env.SUBSQUARE_HOST ?? "subsquare.io",
    chain: process.env.SUBSQUARE_CHAIN ?? "collectives",
    versionHash: process.env.SUBSQUARE_VERSION_HASH,
    path: process.env.SUBSQUARE_PATH ?? "fellowship",
  },
};
