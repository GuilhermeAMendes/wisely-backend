import { createUserControllers } from "../../../../factories/userFactory";
import { Request, Response } from "express";
import { prisma } from "../../../../shared/factory/sharedFactory";

describe("CreateUserController", () => {
  it("Should create a new user successfully", async () => {
    const [, createUser] = createUserControllers();
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));

    const email = `dummy.${Date.now()}@example.com.br`;
    const password = "DummyW@rd0310";
    const username = `dummy_user_${Date.now()}`;

    const req = {
      body: { username, email, password },
    } as Request;

    const res = {
      status,
    } as unknown as Response;

    const handler = createUser.getHandler();
    await handler(req, res);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
      })
    );

    await prisma.user.delete({
      where: {
        email,
      },
    });
  });
});
