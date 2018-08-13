const searchFor = require("./search").search;

const search = (req, res) => {
  const { name, dob } = req.query;
  searchFor(name, dob)
    .then(results => {
      res.json(results);
    })
    .catch(() => {
      res.status(500).send("ERROR");
    });
};

const home = (req, res) => {
  const {name} = req.query;
  if (name) {
    searchFor(name).then(results => {
      res.render("home", {
        results: results.hits.hits.map(({_source}) => _source),
        name,
      })
    }).catch(() => {
      res.status(500).end();
    });
  } else {
    res.render("home")
  }
};

module.exports = {
  search,
  home,
};
