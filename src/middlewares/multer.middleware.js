import multer from "multer";

const storage = multer.diskStorage({
  // req can contain the json data that can be configured by express but file can't so if the file is uploaded it will be taken care of by multer
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
