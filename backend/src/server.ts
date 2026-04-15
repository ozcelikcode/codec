import { buildApp } from "./app.js";
import { env } from "./shared/config.js";
import { logger } from "./shared/logger.js";

const bootstrap = async () => {
  const { app, jobService } = await buildApp();

  const cleanupTimer = setInterval(async () => {
    try {
      await jobService.cleanupExpiredJobs();
    } catch (error) {
      logger.error({ error }, "Failed to run expiration cleanup");
    }
  }, 60 * 1000);

  cleanupTimer.unref();

  await app.listen({
    host: env.HOST,
    port: env.PORT
  });

  logger.info(
    {
      host: env.HOST,
      port: env.PORT,
      apiPrefix: env.API_PREFIX,
      legacyRoutesEnabled: env.LEGACY_UNVERSIONED_ROUTES_ENABLED
    },
    "Codec backend started"
  );
};

bootstrap().catch((error) => {
  logger.error({ error }, "Failed to start server");
  process.exitCode = 1;
});
