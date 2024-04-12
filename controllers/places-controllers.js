const HttpError = require("../models/http-error");
//const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const PlaceModel = require("../models/place");

const getPlacebyId = async (req, res, next) => {
  const placeId = req.params.pid; // params allows access to url parameter { :## : '##' }

  let place;

  try {
    place = await PlaceModel.findById(placeId).exec();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find place",
      500
    );
    return next(error);
  }
  if (!place) {
    const error = new HttpError(
      "Could not find a place matching the provided ID",
      404
    );
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesbyUserId = async (req, res, next) => {
  const userId = req.params.uid; // params allows access to url parameter { :## : '##' }

  let places;

  try {
    places = await PlaceModel.find({
      creator: userId,
    });
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again", 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError(
        "Could not find any places matching the provided user ID",
        404
      )
    );
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    next(new HttpError("Invalid inputs passed, please check data", 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  //TODO reaplce Placeholder image with file upload
  const createdPlace = new PlaceModel({
    title,
    description,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/02/Willis_Tower_From_Lake.jpg",
    location: coordinates,
    address,
    creator,
  });
  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError("Create place failed, please try again", 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check data", 422));
  }

  let place;

  try {
    place = await PlaceModel.findById(placeId);
  } catch (err) {
    const error = new HttpError("Create place failed, please try again", 500);
    return next(error);
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place matching the provided ID", 404)
    );
  }
  const { title, description } = req.body;
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError("Update place failed, please try again", 500);
    return next(error);
  }
  
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;

  try {
    place = await PlaceModel.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find place",
      500
    );
    return next(error);
  }

  try {
    await place.deleteOne();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could delete place",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "deleted place" });
};

exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
exports.createPlace = createPlace;
exports.getPlacebyId = getPlacebyId;
exports.getPlacesbyUserId = getPlacesbyUserId;
