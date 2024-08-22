const app = require("./apps/app.js");
const config = require('config');
app.listen(port = config.get("app.port"), () => {
  console.log(`Server is running on port ${port}`);
})