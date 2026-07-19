const express = require("express");
const router = express.Router();
const { 
  getUsers, 
  updateUserRole, 
  createUser, 
  deleteUser,
  updateUserProfile,
  approveSeller,
  adminUpdateUser
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router.route("/profile").put(protect, updateUserProfile);
router.route("/:id/approve").put(protect, admin, approveSeller);
router.route("/:id/role").put(protect, admin, updateUserRole);

router.route("/:id")
  .put(protect, admin, adminUpdateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
