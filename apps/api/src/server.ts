import "reflect-metadata";
import "dotenv/config";

import { app } from "./app.js";
import { AppDataSource } from "./config/dataSource.js";

const PORT = Number(process.env.PORT ?? 3000);

try {
  await AppDataSource.initialize();

  console.log("Database connected");

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Failed to initialize server with error:", error);
  process.exit(1);
}
