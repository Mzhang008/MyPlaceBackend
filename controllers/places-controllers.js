const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const PlaceModel = require("../models/place");
const UserModel = require("../models/user");
const fs = require("fs");

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
  let userWithPlaces;
  try {
    userWithPlaces = await UserModel.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong fetching places, please try again",
      500
    );
    return next(error);
  }

  if (
    userWithPlaces.places === null ||
    !userWithPlaces.places ||
    userWithPlaces.places.length === 0
  ) {
    return next(
      new HttpError(
        "Could not find any places matching the provided user ID",
        404
      )
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    next(new HttpError("Invalid inputs passed, please check data", 422));
  }
  const { title, description, address } = req.body;
  // Use Google maps
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  //TODO replace Placeholder image with file upload

  const createdPlace = new PlaceModel({
    title,
    description,
    image: req.file.path,
    location: coordinates,
    address,
    creator: req.userData.userId,
  });

  //verify user is in database

  let user;
  try {
    user = await UserModel.findById(req.userData.userId);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Creating place failed, please try again", 500));
  }
  if (!user) {
    return next(new HttpError("Could not find user", 404));
  }

  console.log(user);
  console.log(typeof user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess, validateModifiedOnly: true });
    await user.places.push(createdPlace);
    await user.save({ session: sess, validateModifiedOnly: true });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
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

  if (place.creator.toString() !== req.userData.userId) {
    return next(
      new HttpError("Not authorized to edit this place", 401)
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
    place = await PlaceModel.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find place",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find place for this ID, please try again",
      404
    );
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    return next(
      new HttpError("Not authorized to edit this place", 401)
    );
  }
  

  // can edit/remove this next line if image storage is desired regardless of deletion
  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await place.deleteOne({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place",
      500
    );
    console.log(err);
    return next(error);
  }
  // can edit/remove this if image storage is desired regardless of deletion
  fs.unlink(imagePath, (err) => {
    if (err) {
    console.log("Image delete error " + err);
    };
  });
  res.status(200).json({ message: "deleted place" });
};

exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
exports.createPlace = createPlace;
exports.getPlacebyId = getPlacebyId;
exports.getPlacesbyUserId = getPlacesbyUserId;
