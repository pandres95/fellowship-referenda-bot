# Fellowship Referenda Bot

[![Send digest (test)](https://github.com/pandres95/fellowship-referenda-bot/actions/workflows/test-digest.yml/badge.svg)](https://github.com/pandres95/fellowship-referenda-bot/actions/workflows/test-digest.yml) [![Deployment Digest](https://github.com/pandres95/fellowship-referenda-bot/actions/workflows/deployment-digest.yml/badge.svg)](https://github.com/pandres95/fellowship-referenda-bot/actions/workflows/deployment-digest.yml) [![Weekly Digest](https://github.com/pandres95/fellowship-referenda-bot/actions/workflows/weekly-digest.yml/badge.svg)](https://github.com/pandres95/fellowship-referenda-bot/actions/workflows/weekly-digest.yml)

![Element](./assets/element-screenshot.png)

This bot aims to publish a digest of the active referenda in the announcements channel of Polkadot Fellowswhip (and works with similar referenda-like systems).

[![Notifications Channel - Join Here](https://img.shields.io/badge/Notifications_Channel-Join_Here-blue?style=for-the-badge)](https://matrix.to/#/#fellowship-rfcs:bloque.team)

## Usage

1. Setup the environment

```sh
MATRIX_HOMESERVER_URL=https://matrix.org

# to login use
MATRIX_USERNAME="the_bot_username"
MATRIX_PASSWORD="the_bot_password"
# or
MATRIX_AUTHTTOKEN="a_session_authttoken"

MATRIX_ROOMID="#roomId:matrix.org"

SUBSTRATE_ENDPOINT_URL=wss://polkadot-collectives-rpc.polkadot.io/
SUBSTRATE_REFERENDA_PALLET=referenda

SUBSQUARE_HOST=subsquare.io
SUBSQUARE_CHAIN=collectives
```

2. Run `npm start`

### Development

1. Follow the instructions stated above, then run `npm run dev`. The difference is that bot message will be outputted to console instead of sent via Matrix.
