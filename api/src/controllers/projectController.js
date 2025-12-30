const express = require("express");
const projectRoutes = require("../routes/project.routes");
const expenseRoutes = require("../routes/expense.routes");

const router = express.Router();

router.use("/projects", projectRoutes);
router.use("/expenses", expenseRoutes);

module.exports = router;
