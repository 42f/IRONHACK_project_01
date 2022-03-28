const Rooms = require("../models/Room.model");

const hasRequiredFields = (arrayOfFields) => {
  return (req, res, next) => {
    //check if the request object contains de required fields
    const hasAllField = !arrayOfFields.some(field => !req.body[field]);
    if (!hasAllField) {
      return res.status(400).send("Please provide all the required fields");
    }
    next();
  };
}

module.exports = hasRequiredFields;
