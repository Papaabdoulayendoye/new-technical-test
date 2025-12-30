import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"

import Loader from "@/components/loader"
import api from "@/services/api"

export default function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

  if (loading) return <Loader />

  if (error) {
    toast.error(error)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Projects</h1>
          <p className="text-sm text-gray-500">Track budgets and expenses per project.</p>
        </div>
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{project.name}</td>
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
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
