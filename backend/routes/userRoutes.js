const express = require("express");

const router = express.Router();

const {

protect,

authorize

}=require("../middleware/auth");

const upload=require("../middleware/upload");

const userController=require("../controllers/userController");

router.get(
"/profile",
protect,
authorize("user"),
userController.getProfile
);

router.put(
"/profile",
protect,
authorize("user"),
userController.updateProfile
);

router.post(
"/complaint",
protect,
authorize("user"),
upload.single("image"),
userController.createComplaint
);

router.get(
"/complaints",
protect,
authorize("user"),
userController.getComplaints
);

router.get(
"/complaint/:id",
protect,
authorize("user"),
userController.getComplaintById
);

router.get(
"/stats",
protect,
authorize("user"),
userController.getDashboardStats
);

router.delete(
    "/complaint/:id",
    protect,
    authorize("user"),
    userController.cancelComplaint
);

router.get(
    "/notifications",
    protect,
    authorize("user"),
    userController.getNotifications
);

router.put(
    "/notification/:id/read",
    protect,
    authorize("user"),
    userController.markNotificationRead
);

router.delete(
    "/notification/:id",
    protect,
    authorize("user"),
    userController.deleteNotification
);

router.get(
    "/search",
    protect,
    authorize("user"),
    userController.searchComplaints
);

module.exports=router;