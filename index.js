const app = require("./app");
const config = require("./utils/config");
const logger = require("./utils/logger");

app.listen(config.PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${config.PORT}`);
});
