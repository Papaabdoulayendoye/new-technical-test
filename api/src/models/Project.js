const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true }
);

ProjectSchema.virtual("totalExpenses", {
  ref: "Expense",
  localField: "_id",
  foreignField: "project",
  justOne: false,
  options: { select: "amount" },
});

ProjectSchema.virtual("budgetStatus").get(function () {
  if (!this.totalExpenses) {
    return null;
  }

  const total = this.totalExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const percentage = this.budget ? Math.min(100, Math.round((total / this.budget) * 100)) : 0;

  return {
    totalSpent: total,
    percentage,
    remaining: this.budget ? Math.max(0, this.budget - total) : 0,
    isOverBudget: this.budget ? total > this.budget : false,
  };
});

ProjectSchema.set("toJSON", { virtuals: true });
ProjectSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Project", ProjectSchema);
