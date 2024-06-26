const express = require("express");
const { check } = require("express-validator");
const placesControllers = require("../controllers/places-controllers");
const fileUpload = require("../middleware/file-upload");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

router.get("/:pid", placesControllers.getPlacebyId);
router.get("/user/:uid", placesControllers.getPlacesbyUserId);

router.use(checkAuth);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.updatePlace
); //

router.delete("/:pid", placesControllers.deletePlace); //


// POST new place

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
