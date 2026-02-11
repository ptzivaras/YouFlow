import "dotenv/config";
import app from "./app.js";

const port = process.env.PORT ?? "3000";

app.listen(Number(port), () => {
  console.log(`YouFlow API listening on port ${port}`);
});
