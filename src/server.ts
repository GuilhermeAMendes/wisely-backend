// External library
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

// InfraStructure
import { swaggerSpec } from "./infra/api/docs/swaggerDoc";
import { ApiExpress } from "./infra/api/express/api.express";

// Factory
import { createUserControllers } from "./factories/userFactory";
import { createDirectoryControllers } from "./factories/directoryFactory";
import { createJourneyControllers } from "./factories/journeyFactory";
import { createSettingsControllers } from "./factories/settingsFactory";
import { createprogressControllers } from "./factories/progressFactory";
import { createTopicControllers } from "./factories/topicFactory";
import { createSummaryControllers } from "./factories/summaryFactory";
import { createFileControllers } from "./factories/fileModelFactory";
import { createFlashcardControllers } from "./factories/flashcardFactory";

dotenv.config();
const PORT = Number(process.env.PORT) || 3333;

function runApplication() {
  const controllers = [
    ...createUserControllers(),
    ...createDirectoryControllers(),
    ...createJourneyControllers(),
    ...createSettingsControllers(),
    ...createprogressControllers(),
    ...createTopicControllers(),
    ...createSummaryControllers(),
    ...createFileControllers(),
    ...createFlashcardControllers(),
  ];

  const API = ApiExpress.create(controllers);

  API.getApp().use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  API.start(PORT);
}

runApplication();
