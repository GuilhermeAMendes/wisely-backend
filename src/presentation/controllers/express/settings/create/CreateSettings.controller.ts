// External libraries
import { NextFunction, Request, Response } from "express";

// Use case
import { CreateSettingsUseCase } from "../../../../../application/use-cases/settings/create/CreateSettings.usecase";

// Interfaces
import type {
  HttpMethod,
  Route,
} from "../../../../../infra/api/express/routes";
import type { TokenProvider } from "../../../../../infra/services/token/interfaces/token.interfaces";

// Presenter
import { presenter } from "./CreateSettings.presenter";

// Error
import { UnauthorizedError } from "../../../../errors/UnauthorizedError";
import { ensureAuthenticated } from "../../../../middlewares/auth/ensureAuthenticated";

export class CreateSettingsController implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly createSettingsUseCase: CreateSettingsUseCase,
    private readonly tokenService: TokenProvider
  ) {}

  public static create(
    createSettingsUseCase: CreateSettingsUseCase,
    tokenService: TokenProvider
  ) {
    return new CreateSettingsController(
      "/:id/settings",
      "post",
      createSettingsUseCase,
      tokenService
    );
  }

  getMiddlewares(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) =>
      ensureAuthenticated(req, res, next, this.tokenService);
  }

  /**
   * @swagger
   * /{id}/settings:
   *   post:
   *     summary: Cria configurações para o usuário
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID do usuário para o qual as configurações serão criadas
   *         schema:
   *           type: string
   *           format: uuid
   *           example: 123e4567-e89b-12d3-a456-426614174000
   *     responses:
   *       201:
   *         description: Configurações criadas com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 idUser:
   *                   type: string
   *                   example: 123e4567-e89b-12d3-a456-426614174000
   *                 settings:
   *                   type: object
   *                   example:
   *                     theme: dark
   *                     notifications: true
   *       400:
   *         description: ID do usuário ausente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Missing user id.
   *       401:
   *         description: Não autorizado (acesso negado)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Unauthorized access
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Internal server error
   */

  getHandler() {
    return async (request: Request, response: Response) => {
      const { id: idUser } = request.params;

      if (!idUser) {
        response.status(400).json({ error: "Missing user id." });
        return;
      }

      try {
        const createdUser = await this.createSettingsUseCase.execute({
          idUser,
        });

        const output = presenter(createdUser);

        response.status(201).json(output);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          response.status(401).json({ error: error.message });
          return;
        }

        response.status(500).json({ error: "Internal server error" });
      }
    };
  }

  getPath(): string {
    return this.path;
  }

  getMethod(): HttpMethod {
    return this.method;
  }
}
