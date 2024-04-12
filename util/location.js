const axios = require("axios");
const HttpError = require("../models/http-error");

const API_KEY = "AIzaSyA5KlnibafD8OZzTb8PWS7NGaYU60vJ7Jc";

async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );
  // return {
  //     lat: 40.784405,
  //     lng: -73.9878584,
  // }

  const data = response.data;
  if (!data || data.status === "ZERO_RESULTS") {
    const error = HttpError(
      "Could not find location for specified address",
      404
    );
    throw error;
  }

  const coordinates = data.results[0].geometry.location;
  return coordinates;
}

module.exports = getCoordsForAddress;

