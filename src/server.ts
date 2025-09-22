import "dotenv/config";

import { createApp } from "./app";
import { CONFIG } from "./config/env";

async function start() {
  const app = await createApp();

  app.listen(CONFIG.PORT, () => {
    console.log(`Server running on port ${CONFIG.PORT}`);
  });
}

start();
