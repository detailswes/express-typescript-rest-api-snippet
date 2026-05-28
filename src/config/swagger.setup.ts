import { Application, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { config } from "./env";
import { swaggerSpec } from "./swagger";
import { logger } from "./logger";

export function isSwaggerEnabled(): boolean {
  if (process.env.NODE_ENV === "test") {
    return false;
  }
  if (process.env.SWAGGER_ENABLED === "false") {
    return false;
  }
  return process.env.NODE_ENV !== "production";
}

export function setupSwagger(app: Application): void {
  if (!isSwaggerEnabled()) {
    return;
  }

  const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
    customSiteTitle: "Node REST API — Swagger",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  };

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );

  app.get("/api/docs.json", (_req: Request, res: Response) => {
    res.json(swaggerSpec);
  });

  logger.info(
    { url: `http://localhost:${config.port}/api/docs` },
    "Swagger UI enabled"
  );
}
