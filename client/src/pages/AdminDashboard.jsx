import { useCallback, useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { adminApi, errorMessage } from '../services/api'

const ROLE_TEXT = { PATIENT: 'Patient', DOCTOR: 'Doctor', ADMIN: 'Admin' }

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const load = useCallback(async () => {
    try {
      setUsers(await adminApi.users())
    } catch (err) {
      setPageError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggle = async (u) => {
    setPageError('')
    try {
      await adminApi.setActive(u.id, !u.active)
      await load()
    } catch (err) {
      setPageError(errorMessage(err))
    }
  }

  const count = (role) => users.filter((u) => u.role === role).length

  return (
    <Layout
      title="Clinic overview"
      intro={loading ? '' : `${count('PATIENT')} patients and ${count('DOCTOR')} doctors are registered.`}
    >
      {pageError && <p role="alert" className="mb-6 rounded bg-rose-soft px-3 py-2 text-rose">{pageError}</p>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded border border-line bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-line bg-paper text-sm">
              <tr>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Email</th>
                <th className="px-4 py-2 font-semibold">Role</th>
                <th className="px-4 py-2 font-semibold">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3">{ROLE_TEXT[u.role]}</td>
                  <td className="px-4 py-3">
                    {u.role === 'ADMIN' ? (
                      <span className="text-muted">Always on</span>
                    ) : (
                      <button onClick={() => toggle(u)} className="btn-quiet">
                        {u.active ? 'Disable account' : 'Enable account'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
