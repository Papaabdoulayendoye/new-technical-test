import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"

import Loader from "@/components/loader"
import Modal from "@/components/modal"
import api from "@/services/api"

export default function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createValues, setCreateValues] = useState({ name: "", budget: "", description: "" })
  const [saving, setSaving] = useState(false)

  async function fetchProjects() {
    try {
      setLoading(true)
      const { ok, data, error } = await api.get("/api/projects")
      if (!ok) {
        setError(error || "Failed to load projects")
        return
      }
      setProjects(data || [])
      setError("")
    } catch (e) {
      console.log(e)
      setError("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (!error) return
    toast.error(error)
  }, [error])

  if (loading) return <Loader />

  const handleChange = field => e => {
    setCreateValues(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleCreateProject(e) {
    e.preventDefault()

    if (!createValues.name.trim() || !createValues.budget) {
      toast.error("Name and budget are required")
      return
    }

    const budgetNumber = Number(createValues.budget)
    if (!Number.isFinite(budgetNumber) || budgetNumber <= 0) {
      toast.error("Budget must be a positive number")
      return
    }

    const payload = {
      name: createValues.name.trim(),
      budget: budgetNumber,
      description: createValues.description.trim() || undefined
    }

    try {
      setSaving(true)
      const { ok, error: apiError } = await api.post("/api/projects", payload)
      if (!ok) {
        toast.error(apiError || "Failed to create project")
        return
      }

      setIsCreateOpen(false)
      setCreateValues({ name: "", budget: "", description: "" })
      await fetchProjects()
      toast.success("Project created")
    } catch (e) {
      console.log(e)
      const message = e?.error || e?.code || "Failed to create project"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteProject(projectId) {
    if (!window.confirm("Delete this project and all its expenses?")) return

    try {
      const { ok, error: apiError } = await api.delete(`/api/projects/${projectId}`)
      if (!ok) {
        toast.error(apiError || "Failed to delete project")
        return
      }

      await fetchProjects()
      toast.success("Project deleted")
    } catch (e) {
      console.log(e)
      const message = e?.error || e?.code || "Failed to delete project"
      toast.error(message)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Projects</h1>
          <p className="text-sm text-gray-500">Track budgets and expenses per project.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          onClick={() => setIsCreateOpen(true)}
        >
          New project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-sm text-gray-500">No projects yet. Start by creating one.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Budget</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Spent</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Remaining</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Last update</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {projects.map(project => {
                const status = project.budgetStatus || null
                const totalSpent = status?.totalSpent || 0
                const remaining = Math.max(0, (project.budget || 0) - totalSpent)
                const isOverBudget = !!status?.isOverBudget

                return (
                  <tr key={project._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      <Link to={`/projects/${project._id}`} className="hover:underline">
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(project.budget)}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(totalSpent)}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(remaining)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          isOverBudget ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isOverBudget ? "Over budget" : "OK"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => handleDeleteProject(project._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isCreateOpen} onClose={saving ? undefined : () => setIsCreateOpen(false)} className="max-w-lg">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">New project</h2>
          <form className="space-y-4" onSubmit={handleCreateProject}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="project-name">
                Name
              </label>
              <input
                id="project-name"
                type="text"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={createValues.name}
                onChange={handleChange("name")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="project-budget">
                Budget (EUR)
              </label>
              <input
                id="project-budget"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={createValues.budget}
                onChange={handleChange("budget")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="project-description">
                Description (optional)
              </label>
              <textarea
                id="project-description"
                rows="3"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={createValues.description}
                onChange={handleChange("description")}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  if (saving) return
                  setIsCreateOpen(false)
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-70"
              >
                {saving ? "Saving..." : "Create project"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}

function formatCurrency(value) {
  if (value === undefined || value === null) return "-"
  if (Number.isNaN(Number(value))) return "-"
  try {
    return Number(value).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
  } catch (e) {
    return `${value}`
  }
}
