const axios = require("axios");
const parse = require("csv-parse");
const uuidv4 = require("uuid/v4");
const es = require("elasticsearch");

const index = "sanctions";

const client = new es.Client({
  host: process.env.ES_HOST,
  log: process.env.ES_LOG || "info"
});

/**
 * Create a new index with the mapping for the sanctions data.
 */
function createSanctionsIndex() {
  return new Promise((resolve, reject) => {
    client.indices
      .create({
        index,
        body: require("./es-config")
      })
      .then(resolve)
      .catch(reject);
  });
}

// drop and recreate an index
client.indices
  .delete({ index })
  .then(() => {
    console.log(`Index '${index}' deleted`);
  })
  .then(createSanctionsIndex)
  .catch(err => {
    if (err.status !== 404) {
      return err;
    }

    console.log(`Index '${index}' not found, skipping delete...`);
  });

// download csv
const url = "http://hmt-sanctions.s3.amazonaws.com/sanctionsconlist.csv";

axios({
  url,
  method: "GET",
  responseType: "blob"
})
  .then(parseResponse)
  .then(buildEsBulkData)
  .then(bulkInsertSanctionList);

/**
 * Parse the CSV download for further processing.
 *
 * @param response
 * @returns {Promise<any>}
 */
function parseResponse(response) {
  return new Promise((resolve, reject) => {
    const options = {
      relax_column_count: true
    };

    parse(response.data, options, (err, output) => {
      if (err) {
        return reject(err);
      }

      // transform the headers into lowercase and separated by underscores so that we can
      // access the values as an object if we want to
      const headers = output[1].map(s => s.toLocaleLowerCase().replace(/(\s+|\/)/g, "_"));

      // converts the rows into an object that maps the keys to csv headings and values to row value
      resolve(
        output.splice(2).map(row => {
          let rowObj = Object.assign({}, ...headers.map((key, index) => ({ [key]: row[index] })));
          let full_name = [
            rowObj.name_1,
            rowObj.name_2,
            rowObj.name_3,
            rowObj.name_4,
            rowObj.name_5,
            rowObj.name_6
          ]
            .join(" ")
            .replace(/\s{2,}/, " ");
          return Object.assign(rowObj, { full_name });
        })
      );
    });
  });
}

/**
 * Change rows of data to lines.
 *
 * @param data
 * @returns {*}
 */
function buildEsBulkData(data) {
  const body = [];
  data.forEach(row => {
    body.push({
      index: {
        _index: index,
        _type: "entity",
        _id: uuidv4()
      }
    });
    body.push(row);
  });
  return body;
}

/**
 * Perform the bulk insert of financial sanctions.
 *
 * @param body
 */
function bulkInsertSanctionList(body) {
  return new Promise((resolve, reject) => {
    client
      .bulk({ body })
      .then(resp => {
        console.log(`Indexed latest set of financial sanctions`);
        resolve();
      })
      .catch(reject);
  });
}
