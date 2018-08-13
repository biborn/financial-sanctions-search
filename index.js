const express = require("express");
const routes = require("./src/js/routes");

const app = express();
const port = process.env.SERVER_PORT || 3000;
const stylesheetUrl = process.env.STYLESHEET_URL || "//localhost:9000/static/style.css";
const jsUrl = process.env.JS_URL || "//localhost:9000/static/bundle.js";

Object.assign(app.locals, {
  stylesheetUrl,
  jsUrl,
});

app.set('view engine', 'pug');
app.set('views', './src/views');

app.get("/", routes.home);
app.get("/search", routes.search);

app.listen(port, () => {
  console.log(`App started on port ${port}`);
});
