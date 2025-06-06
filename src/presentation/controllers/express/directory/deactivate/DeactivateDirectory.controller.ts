// External libraries
import { NextFunction, Request, Response } from "express";

// Use case
import { CompleteDirectoryUseCase } from "../../../../../application/use-cases/directory/complete/CompleteDirectory.usecase";

// Interfaces
import type {
  HttpMethod,
  Route,
} from "../../../../../infra/api/express/routes";
import type { TokenProvider } from "../../../../../infra/services/token/interfaces/token.interfaces";

/// Middleware
import { ensureAuthenticated } from "../../../../middlewares/auth/ensureAuthenticated";

// Presenter
import { presenter } from "./DeactivateDirectory.presenter";

// Error
import { UnauthorizedError } from "../../../../errors/UnauthorizedError";
import { DeactivateDirectoryUseCase } from "../../../../../application/use-cases/directory/deactivate/DeactivateDirectory.usecase";

export class DeactivateDirectoryController implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly deactivateDirectoryUseCase: DeactivateDirectoryUseCase,
    private readonly tokenService: TokenProvider
  ) {}

  public static create(
    deactivateDirectoryUseCase: DeactivateDirectoryUseCase,
    tokenService: TokenProvider
  ) {
    return new DeactivateDirectoryController(
      "/directory/:id/deactivate",
      "patch",
      deactivateDirectoryUseCase,
      tokenService
    );
  }

  getMiddlewares(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) =>
      ensureAuthenticated(req, res, next, this.tokenService);
  }

  /**
   * @swagger
   * /directory/{id}/deactivate:
   *   patch:
   *     summary: Desativa um diretório
   *     tags: [Directory]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID do diretório a ser desativado
   *         schema:
   *           type: string
   *           format: uuid
   *           example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
   *     responses:
   *       200:
   *         description: Diretório desativado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 idDirectory:
   *                   type: string
   *                   example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
   *                 status:
   *                   type: boolean
   *                   example: true
   *       401:
   *         description: Não autorizado (token ausente ou inválido)
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
      const { id: idDirectory } = request.params;

      try {
        const updatedDirectory = await this.deactivateDirectoryUseCase.execute({
          idDirectory,
        });

        const output = presenter({
          idDirectory: updatedDirectory.idDirectory,
          status: updatedDirectory.status,
        });

        response.status(200).json(output);
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
