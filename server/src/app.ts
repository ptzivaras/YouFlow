import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import businessesRouter from "./routes/businesses.js";
import servicesRouter from "./routes/services.js";
import availabilityRouter from "./routes/availability.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(healthRouter);
app.use("/auth", authRouter);
app.use("/businesses", businessesRouter);
app.use("/services", servicesRouter);
app.use("/availability", availabilityRouter);

export default app;
