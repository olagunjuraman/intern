const express = require("express");
const axios = require("axios");

const randomString = (length) => {
  charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
};

const app = express();

app.use(express.json());

const router = express.Router();

const extractStudentsinfo = async (req, res) => {
  const {
    csv: { url, select_fields },
  } = req.body;

  const { data } = await axios.get(url);

  const convertCSVToJSON = (str, delimiter = ",") => {
    const titles = str.slice(0, str.indexOf("\r\n")).split(delimiter);
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
    conversion_key: randomString(32),
    json: convertCSVToJSON(data.trim(), select_fields),
  });

  return result;
};

router.route("/").post(extractStudentsinfo);

app.use("/api/v1/csv", router);

const PORT = 7000;

app.listen(PORT, console.log(`Server listening succesfully on port ${PORT}`));
