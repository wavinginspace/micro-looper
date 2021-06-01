const process = require('process');
const axios = require('axios');
const qs = require('qs');

const handler = async function (event) {
  const API_PARAMS = qs.stringify(event.queryStringParameters);
  // console.log("API_PARAMS", API_PARAMS);

  const { API_TOKEN } = process.env;
  const { API_URL } = process.env;
  const URL = `${API_URL}?${API_PARAMS}&token=${API_TOKEN}`;

  console.log('Constructed URL is ...', URL);

  try {
    const { data } = await axios.get(URL);
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    const { status, statusText, headers, data } = error.response;
    return {
      statusCode: error.response.status,
      body: JSON.stringify({ status, statusText, headers, data }),
    };
  }
};

module.exports = { handler };
