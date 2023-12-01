import config from "../config.ts";
import { MatrixClient, MatrixAuth } from "matrix-bot-sdk";

export class MatrixBot {
  private auth: MatrixAuth;
  private client?: MatrixClient;

  /**
   * Initializes the bot, creating the internal Matrix client-to-server client
   * @param baseUrl The homeserver URL where the bot is located
   * @param accessToken The access token to connect with the bot
   * @param options The options required to create the client
   */
  constructor(
    homeserverUrl = config.matrix.homeserverUrl,
    private roomId = config.matrix.roomId!
  ) {
    this.auth = new MatrixAuth(homeserverUrl);
  }

  /**
   * Connects to the matrix server
   */
  async connect(
    username = config.matrix.username!,
    password = config.matrix.password!
  ) {
    console.log(this.auth, username, password);

    this.client = await this.auth.passwordLogin(username, password);
    await this.client.start();
  }

  async send(html: string) {
    console.log(this.roomId);

    await this.client?.sendHtmlNotice(this.roomId, html);
  }
}
