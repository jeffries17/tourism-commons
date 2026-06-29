import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCommunities } from '../../hooks/useCommunities';
import type { CbtCommunity } from '../../types';

interface EditableCommunity extends Partial<CbtCommunity> {
  id?: string;
}

export default function AdminCommunities() {
  const params = useParams<{ authority: string }>();
  const authority = params.authority || '';
  const { data: communities = [], isLoading, error, refetch } = useCommunities(authority);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<EditableCommunity | null>(null);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const sorted = useMemo(() => {
    return [...communities].sort((a, b) => a.community.localeCompare(b.community));
  }, [communities]);

  const openCreate = () => {
    setEditing({
      community: '',
      region: '',
      contactPerson: '',
      contactInfo: '',
      responsibleStaff: '',
    });
    setIsModalOpen(true);
  };

  const openEdit = (c: CbtCommunity) => {
    setEditing({ ...c });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setApiError('');
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setApiError('');
    try {
      const isNew = !editing.id;
      const API_BASE = '/api';
      const url = `${API_BASE}/cbt/admin/communities` + (isNew ? '' : `/${encodeURIComponent(editing.id!)}`) + `?authority=${authority}`;
      const method = isNew ? 'POST' : 'PUT';
      const payload = {
        community: editing.community,
        region: editing.region,
        contactPerson: editing.contactPerson,
        contactInfo: editing.contactInfo,
        responsibleStaff: editing.responsibleStaff,
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to save community' }));
        throw new Error(err.error || 'Failed to save community');
      }
      closeModal();
      refetch();
    } catch (e: any) {
      setApiError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this community?')) return;
    try {
      const API_BASE = '/api';
      const res = await fetch(`${API_BASE}/cbt/admin/communities/${encodeURIComponent(id)}?authority=${authority}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to delete community' }));
        throw new Error(err.error || 'Failed to delete community');
      }
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communities (Admin)</h1>
            <p className="text-gray-600 mt-1">Manage communities for {authority}.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add Community
            </button>
            <Link
              to={`/${authority}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mb-4">
            Failed to load communities.
          </div>
        )}

        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Community</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsible Staff</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={5}>Loading...</td></tr>
                ) : sorted.length === 0 ? (
                  <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={5}>No communities found.</td></tr>
                ) : (
                  sorted.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{c.community}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{c.region || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{c.responsibleStaff || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{c.contactPerson || '-'}{c.contactInfo ? ` (${c.contactInfo})` : ''}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEdit(c)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{editing?.id ? 'Edit Community' : 'Add Community'}</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="px-6 py-4 space-y-4">
                {apiError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{apiError}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Community Name</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={editing?.community || ''}
                    onChange={(e) => setEditing((prev) => ({ ...(prev || {}), community: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={editing?.region || ''}
                      onChange={(e) => setEditing((prev) => ({ ...(prev || {}), region: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsible Staff</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={editing?.responsibleStaff || ''}
                      onChange={(e) => setEditing((prev) => ({ ...(prev || {}), responsibleStaff: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={editing?.contactPerson || ''}
                      onChange={(e) => setEditing((prev) => ({ ...(prev || {}), contactPerson: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={editing?.contactInfo || ''}
                      onChange={(e) => setEditing((prev) => ({ ...(prev || {}), contactInfo: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
                <button onClick={closeModal} className="px-4 py-2 border rounded-lg text-gray-700">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editing?.community}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


