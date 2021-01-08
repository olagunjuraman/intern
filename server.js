const express = require("express");
const axios = require("axios");
const uuid = require("uuid");

const app = express();

app.use(express.json());

const router = express.Router();

const convertToCsv = async (req, res) => {
  const {
    csv: { url, select_fields },
  } = req.body;

  // const select_fields = req.body.csv.select_fields;

  const { data } = await axios.get(url);

  const convertCSVToJSON = (str, delimiter = ",", fields) => {
    const titles = str.slice(0, str.indexOf("\r\n")).split(",");
    const rows = str.slice(str.indexOf("\r\n") + 2).split("\r\n");
    return rows.map((row) => {
      // Convert to 2D array
      const values = row.split(",");
      if (select_fields) {
        return select_fields.reduce((object, current, i) => {
          object[current] = values[i];
          return object;
        }, {});
      } else {
        return titles.reduce((object, curr, i) => {
          object[curr] = values[i];
          return object;
        }, {});
      }
    });
  };

  const result = res.json({
    conversion_key: uuid.v4(),
    json: convertCSVToJSON(data.trim(), select_fields),
  });

  return result;
};

router.route("/").post(convertToCsv);

app.use("/api/v1/csv", router);

app.listen(6000, console.log("Server listening succesfully"));
