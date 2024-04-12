const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "NYC",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/800px-Empire_State_Building_%28aerial_view%29.jpg",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.784405,
      lng: -73.9878584,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Willis Tower",
    description: "Formerly named the Sears Tower",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/02/Willis_Tower_From_Lake.jpg",
    address: "233 S Wacker Dr, Chicago, IL 60606",
    location: {
      lat: 41.8788764,
      lng: -87.6359149,
    },
    creator: "u2",
  },
  {
    id: "p3",
    title: "Willis Tower 2 TESTING",
    description: "Formerly named the Sears Tower 2",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/02/Willis_Tower_From_Lake.jpg",
    address: "233 S Wacker Dr, Chicago, IL 60606",
    location: {
      lat: 41.8788764,
      lng: -87.6359149,
    },
    creator: "u2",
  },
];

const getPlacebyId = (req, res, next) => {
  console.log("get request PID");
  const placeId = req.params.pid; // params allows access to url parameter { :## : '##' }
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  if (!place) {
    return next(
      new HttpError("Could not find a place matching the provided ID", 404)
    );
  }
  res.json({ place: place });
};

const getPlacesbyUserId = (req, res, next) => {
  console.log("get request places by UID");
  const userId = req.params.uid; // params allows access to url parameter { :## : '##' }
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });
  if (!places || places.length === 0) {
    return next(
      new HttpError(
        "Could not find any places matching the provided user ID",
        404
      )
    );
  }
  res.json({ places: places });
};

const createPlace = async (req, res, next) => {
  console.log("creating place");
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    console.log(validation);
    next(new HttpError("Invalid inputs passed, please check data", 422));
  }
  
  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  DUMMY_PLACES.push(createdPlace);
  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const placeId = req.params.pid;
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    console.log(validation);
    throw new HttpError("Invalid inputs passed, please check data", 422);
  }
  let placeIndex = 0; //TODO to be replaced with database logic
  let place = DUMMY_PLACES.find((p) => {
    placeIndex = DUMMY_PLACES.indexOf(p);
    return p.id === placeId;
  });
  const { title, description } = req.body;
  const updatedPlace = {
    ...place,
    title,
    description,
  };
  if (!place) {
    return next(
      new HttpError("Could not find a place matching the provided ID", 404)
    );
  }
  console.log("updating place");
  DUMMY_PLACES[placeIndex] = updatedPlace; // TODO database update

  console.log(DUMMY_PLACES);
  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  console.log();
  const placeId = req.params.pid;
  let placeIndex = 0; //TODO to be replaced with database logic
  DUMMY_PLACES.find((p) => {
    placeIndex = DUMMY_PLACES.indexOf(p);
    return p.id === placeId;
  });
  console.log("deleting place");
  DUMMY_PLACES.splice(placeIndex, 1); // TODO database delete

  console.log(DUMMY_PLACES);
  res.status(200).json({ message: "deleted place" });
};

exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
exports.createPlace = createPlace;
exports.getPlacebyId = getPlacebyId;
exports.getPlacesbyUserId = getPlacesbyUserId;
