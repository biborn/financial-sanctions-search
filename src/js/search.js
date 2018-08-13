const es = require("elasticsearch");

const client = new es.Client({
  host: process.env.ES_HOST,
  log: process.env.ES_LOG || "trace"
});

const ping = () => {
  return new Promise((resolve, reject) => {
    client
      .ping({ requestTimeout: 1000 })
      .then(resolve)
      .catch(reject);
  });
};

const search = (name, dob) => {
  let dobQuery = {};
  return new Promise((resolve, reject) => {
    client
      .search({
        index: "sanctions",
        type: "entity",
        body: {
          query: {
            fuzzy: {
              full_name: name
            },
          },
          aggs: {
            group_by_name: {
              terms: {
                field: "full_name"
              }
            }
          }
        },
      })
      .then(resolve)
      .catch(reject);
  });
};

module.exports = {
  ping,
  search
};
