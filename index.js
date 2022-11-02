import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import { UserController, PostController } from "./controllers/index.js";
import {
    registerValidation,
    loginValidation,
    postCreateValidation,
} from "./validations.js";
import { checkAuth, handleValidationErrors } from "./utils/index.js";

const app = express();

mongoose
    .connect(
        process.env.MONGO_URI
    )
    .then(() => console.log("DB ok"))
    .catch((error) => console.log("DB error", error));

const storage = multer.diskStorage({
    destination: (_, __, callBack) => {
        callBack(null, "uploads");
    },
    filename: (_, file, callBack) => {
        callBack(null, file.originalname);
    },
});

app.use(express.json());
const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));
app.use(cors());

//users
app.post(
    "/auth/register",
    registerValidation,
    handleValidationErrors,
    UserController.register
);
app.post(
    "/auth/login",
    loginValidation,
    handleValidationErrors,
    UserController.login
);
app.get("/auth/me", checkAuth, UserController.getMe);
app.get("/users", UserController.getAll);
app.patch(
    "/users/:id",
    checkAuth,
    handleValidationErrors,
    UserController.update
);
//image
app.post("/uploads", checkAuth, upload.single("image"), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
});

//posts
app.get("/posts", PostController.getAll);
app.get("/tags", PostController.getLastTags);
app.get("/posts/:id", PostController.getOne);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.post(
    "/posts",
    checkAuth,
    postCreateValidation,
    handleValidationErrors,
    PostController.create
);
app.patch(
    "/posts/:id",
    checkAuth,
    postCreateValidation,
    handleValidationErrors,
    PostController.update
);

app.listen(process.env.PORT || 5000, (err) => {
    if (err) {
        return console.log("err");
    }
    console.log("Server OK");
});
