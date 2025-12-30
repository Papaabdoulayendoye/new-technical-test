const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const Project = require("../models/Project");

const router = express.Router();

// Get all projects for the current user
router.get('/', passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    }).populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ updatedAt: -1 });

    // Populate virtuals
    const populatedProjects = await Promise.all(
      projects.map(async (project) => {
        const populated = await project.populate('totalExpenses');
        return populated;
      })
    );

    return res.status(200).json({ ok: true, data: populatedProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch projects' });
  }
});

// Create a new project
router.post('/', passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const { name, description, budget, startDate, endDate } = req.body;

    if (!name || budget === undefined) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Name and budget are required' 
      });
    }

    const project = new Project({
      name,
      description,
      budget: parseFloat(budget),
      startDate: startDate || new Date(),
      endDate,
      createdBy: req.user._id,
      members: [req.user._id], // Add creator as a member
    });

    await project.save();
    
    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    return res.status(201).json({ ok: true, data: populatedProject });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ ok: false, error: 'Failed to create project' });
  }
});

// Get a single project
router.get('/:id', passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ ok: false, error: 'Project not found' });
    }

    // Populate virtuals
    const populatedProject = await project.populate('totalExpenses');

    return res.status(200).json({ ok: true, data: populatedProject });
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch project' });
  }
});

// Update a project
router.put('/:id', passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const { name, description, budget, startDate, endDate, members } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (budget !== undefined) updates.budget = parseFloat(budget);
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (members && Array.isArray(members)) {
      // Ensure the creator is always a member
      if (!members.includes(req.user._id)) {
        members.push(req.user._id);
      }
      updates.members = members;
    }

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id, // Only creator can update
      },
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ ok: false, error: 'Project not found or not authorized' });
    }

    return res.status(200).json({ ok: true, data: project });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ ok: false, error: 'Failed to update project' });
  }
});

// Delete a project
router.delete('/:id', passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id, // Only creator can delete
    });

    if (!project) {
      return res.status(404).json({ ok: false, error: 'Project not found or not authorized' });
    }

    // Delete all expenses associated with this project
    await mongoose.model("Expense").deleteMany({ project: project._id });

    return res.status(200).json({
      ok: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ ok: false, error: 'Failed to delete project' });
  }
});

// Add member to project
router.post('/:id/members', passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ ok: false, error: 'User ID is required' });
    }

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id, // Only creator can add members
        members: { $ne: userId } // Only add if not already a member
      },
      { $addToSet: { members: userId } },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Project not found, not authorized, or user already a member' 
      });
    }

    return res.status(200).json({ ok: true, data: project });
  } catch (error) {
    console.error('Error adding member to project:', error);
    return res.status(500).json({ ok: false, error: 'Failed to add member to project' });
  }
});

module.exports = router;
