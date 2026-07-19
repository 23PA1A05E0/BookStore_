const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrders,
  getOrganizerOrders,
  updateOrderStatus,
  deleteOrder,
  rateExperience,
} = require("../controllers/orderController");
const { protect, admin, organizer } = require("../middleware/authMiddleware");

router.route("/").post(protect, createOrder).get(protect, admin, getOrders);
router.route("/myorders").get(protect, getMyOrders);
router.route("/organizer").get(protect, organizer, getOrganizerOrders);
router.route("/:id/status").put(protect, updateOrderStatus);
router.route("/:id/experience").put(protect, rateExperience);
router.route("/:id").delete(protect, admin, deleteOrder);

module.exports = router;
