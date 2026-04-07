import express from "express";
import { config } from "./config.js";
import { register } from "module";
import { registerWellKnownRoutes } from "./routes/well-known.js";
import { registerClientRoutes } from "./routes/register.js";
import { registerAuthorizeRoutes } from "./routes/authorize.js";
import { registerCallbackRoutes } from "./routes/callback.js";
import { registerTokenRoutes } from "./routes/token.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "auth-broker",
  });
});
registerWellKnownRoutes(app);
registerClientRoutes(app);
registerAuthorizeRoutes(app);
registerCallbackRoutes(app);
registerTokenRoutes(app);
app.listen(config.port, () => {
  console.log(`Auth Broker running on http://localhost:${config.port}`);
});