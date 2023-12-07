export default {
  matrix: {
    homeserverUrl: process.env.MATRIX_HOMESERVER ?? "https://matrix.org",
    accessToken: process.env.MATRIX_AUTHTOKEN,

    username: process.env.MATRIX_USERNAME,
    password: process.env.MATRIX_PASSWORD,

    roomId: process.env.MATRIX_ROOMID,

    paths: {
      storage:
        process.env.MATRIX_STORAGE_PROVIDER_PATH ?? "./.matrix/storage.json",
      crypto: process.env.MATRIX_CRYPTO_PROVIDER_PATH ?? "./.matrix/crypto",
    },
  },
  substrate: {
    endpointUrl: process.env.SUBSTRATE_ENDPOINT_URL,
    referendaPallet: process.env.SUBSTRATE_REFERENDA_PALLET ?? "referenda",
  },
  subsquare: {
    host: process.env.SUBSQUARE_HOST ?? "subsquare.io",
    chain: process.env.SUBSQUARE_CHAIN ?? "collectives",
  },
  storage: {
    path: process.env.STORAGE_PATH ?? "./.storage.json",
  },
};
