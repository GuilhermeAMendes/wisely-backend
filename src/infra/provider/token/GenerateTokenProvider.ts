// Interface
interface TokenRequest {
  userId: string;
}

import type { TokenProvider } from "../../services/token/interfaces/token.interfaces";

// Constants
import { EXPIRES } from "./constants.ts/token.constants";
import { SECRET_KEY } from "../../../presentation/middlewares/auth/constants.ts/auth.constants";

export class GenerateTokenProvider {
  constructor(private tokenProvider: TokenProvider) {}

  async execute({ userId }: TokenRequest) {
    const token = this.tokenProvider.sign({}, SECRET_KEY, {
      subject: userId,
      expiresIn: EXPIRES,
    });

    return token;
  }
}
