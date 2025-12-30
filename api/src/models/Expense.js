const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    category: {
      type: String,
      required: true,
      enum: ["marketing", "development", "design", "operations", "hr", "other"],
      default: "other",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

ExpenseSchema.index({ project: 1, createdAt: -1 });

ExpenseSchema.pre("save", async function (next) {
  try {
    await mongoose.model("Project").updateOne(
      { _id: this.project },
      { $set: { updatedAt: new Date() } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Expense", ExpenseSchema);
