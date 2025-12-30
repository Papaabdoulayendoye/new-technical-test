const express = require("express");
const passport = require("passport");
const Expense = require("../models/Expense");
const Project = require("../models/Project");

const router = express.Router();

// Get all expenses for a project
router.get('/project/:projectId', passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    // Verify user has access to the project
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Project not found or access denied' 
      });
    }

    const expenses = await Expense.find({
      project: req.params.projectId
    })
      .sort({ date: -1, createdAt: -1 })
      .populate('createdBy', 'name email');

    return res.status(200).json({ ok: true, data: expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to fetch expenses' 
    });
  }
});

// Create a new expense
router.post('/', passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const { description, amount, category, date, projectId } = req.body;

    // Basic validation
    if (!description || amount === undefined || !category || !projectId) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Description, amount, category, and project ID are required' 
      });
    }

    // Verify user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Project not found or access denied' 
      });
    }

    const expense = new Expense({
      description,
      amount: parseFloat(amount),
      category,
      date: date || new Date(),
      project: projectId,
      createdBy: req.user._id,
    });

    await expense.save();

    // Populate the createdBy field before sending the response
    const populatedExpense = await expense.populate('createdBy', 'name email');

    return res.status(201).json({ ok: true, data: populatedExpense });
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to create expense' 
    });
  }
});

// Update an expense
router.put('/:id', passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    const updates = {};

    if (description !== undefined) updates.description = description;
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (category !== undefined) updates.category = category;
    if (date !== undefined) updates.date = date;

    // Find the expense first to check permissions
    const expense = await Expense.findById(req.params.id)
      .populate('project');

    if (!expense) {
      return res.status(404).json({ ok: false, error: 'Expense not found' });
    }

    // Check if user has permission (creator of expense or project owner)
    if (
      expense.createdBy.toString() !== req.user._id.toString() &&
      expense.project.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Not authorized to update this expense' 
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return res.status(200).json({ ok: true, data: updatedExpense });
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to update expense' 
    });
  }
});

// Delete an expense
router.delete('/:id', passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    // Find the expense first to check permissions
    const expense = await Expense.findById(req.params.id)
      .populate('project');

    if (!expense) {
      return res.status(404).json({ ok: false, error: 'Expense not found' });
    }

    // Check if user has permission (creator of expense or project owner)
    if (
      expense.createdBy.toString() !== req.user._id.toString() &&
      expense.project.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Not authorized to delete this expense' 
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      ok: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to delete expense' 
    });
  }
});

// Get expenses summary by category for a project
router.get('/summary/project/:projectId', passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    // Verify user has access to the project
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Project not found or access denied' 
      });
    }

    const summary = await Expense.aggregate([
      {
        $match: {
          project: project._id
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    return res.status(200).json({ ok: true, data: summary });
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to fetch expense summary' 
    });
  }
});

module.exports = router;
