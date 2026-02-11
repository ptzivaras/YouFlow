import "dotenv/config";
import app from "./app.js";
import env from "./config/env.js";

app.listen(env.port, () => {
  console.log(`YouFlow API listening on port ${env.port}`);
});
