// External libraries
import { NextFunction, Request, Response } from "express";

// Use case
import { ListDirectoriesAccessedRecentlyUseCase } from "../../../../../application/use-cases/directory/listRecents/ListDirectoriesAccessedRecently.usecase";

// Interfaces
import type {
  HttpMethod,
  Route,
} from "../../../../../infra/api/express/routes";

// Presenter
import { presenter } from "./ListDirectoriesAccessedRecently.presenter";

// Error
import { UnauthorizedError } from "../../../../errors/UnauthorizedError";

// Validator
import { ensureAuthenticated } from "../../../../middlewares/auth/ensureAuthenticated";
import type { TokenProvider } from "../../../../../infra/services/token/interfaces/token.interfaces";

export class ListDirectoriesAccessedRecentlyController implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly listDirectoriesAccessedRecentlyUseCase: ListDirectoriesAccessedRecentlyUseCase,
    private readonly tokenService: TokenProvider
  ) {}

  public static create(
    listDirectoriesAccessedRecentlyUseCase: ListDirectoriesAccessedRecentlyUseCase,
    tokenService: TokenProvider
  ) {
    return new ListDirectoriesAccessedRecentlyController(
      "/:id/directory/recents",
      "get",
      listDirectoriesAccessedRecentlyUseCase,
      tokenService
    );
  }

  getMiddlewares(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) =>
      ensureAuthenticated(req, res, next, this.tokenService);
  }

  /**
   * @swagger
   * /{id}/directory/recents:
   *   get:
   *     summary: Lista diretórios acessados recentemente por um usuário
   *     tags: [Directory]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID do usuário que acessou os diretórios recentemente
   *         schema:
   *           type: string
   *           format: uuid
   *           example: 123e4567-e89b-12d3-a456-426614174000
   *     responses:
   *       200:
   *         description: Lista de diretórios acessados recentemente retornada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 directories:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         example: "def67890-1234-abcd-efgh-ijklmnopqrst"
   *                       name:
   *                         type: string
   *                         example: "ProjetosRecentes"
   *                       lastAccessedAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2025-05-20T14:30:00Z"
   *       401:
   *         description: Não autorizado (token inválido ou ausente)
   *       500:
   *         description: Erro interno do servidor
   */

  getHandler() {
    return async (request: Request, response: Response) => {
      const { id: idUser } = request.params;

      try {
        const restoreDirectories =
          await this.listDirectoriesAccessedRecentlyUseCase.execute({
            idUser,
          });

        const output = presenter({
          directories: restoreDirectories.directories,
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
