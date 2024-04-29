const express = require("express");
const { check } = require("express-validator");
const placesControllers = require("../controllers/places-controllers");
const fileUpload = require("../middleware/file-upload");
const router = express.Router();

router.get("/:pid", placesControllers.getPlacebyId);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.updatePlace
); //

router.delete("/:pid", placesControllers.deletePlace); //

router.get("/user/:uid", placesControllers.getPlacesbyUserId);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
    check("creator").not().isEmpty(),
  ],
  placesControllers.createPlace
);

module.exports = router;
