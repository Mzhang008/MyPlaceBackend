require("dotenv").config();
const sharp = require("sharp");
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

//   const MIME_TYPE_MAP = {
//     "image/png": "png",
//     "image/jpeg": "jpeg",
//     "image/jpg": "jpg",
//   };

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const storeImageS3 = async (req, res, next, imageName) => {
  // const ext = MIME_TYPE_MAP[req.file.mimetype];

  // resize
  let buffer;
  try {
    buffer = await sharp(req.file.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer();
  } catch (err) {
    console.log("sharp err " + err);
    return next(err);
  }
  const params = {
    Bucket: bucketName,
    Key: imageName,
    Body: buffer,
    ContentType: req.file.mimetype,
  };
  const command = new PutObjectCommand(params);

  try {
    await s3.send(command);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  console.log("upload to s3 completed");
};

const getImageUrl = async (imageName) => {
    const getObjectParams = {
      Bucket: bucketName,
      Key: imageName,
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return url;
  };

const deleteImageS3 = async (imageName) => {
    const params = {
        Bucket: bucketName,
        Key: imageName,
      };
      const command = new DeleteObjectCommand(params);
      await s3.send(command);
}

exports.s3 = s3;
exports.storeImageS3 = storeImageS3;
exports.getImageUrl = getImageUrl;
exports.deleteImageS3 = deleteImageS3;