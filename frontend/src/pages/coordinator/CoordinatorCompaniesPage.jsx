import { useState, useEffect } from 'react';
import { getCompanies, createCompany } from '../../services/placement.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

export default function CoordinatorCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    industry: '',
    website: '',
    location: '',
    description: '',
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await getCompanies();
      setCompanies(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await createCompany(form);
      setModalOpen(false);
      setForm({ name: '', industry: '', website: '', location: '', description: '' });
      fetchCompanies();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to add company.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase()) ||
    (c.location && c.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Recruiting Companies</h2>
          <p className="text-slate-400 text-sm">Manage corporate hiring partners, industry profiles, and recruitment drives.</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Add Company
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by company name, industry, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-slate-500">
          Showing {filtered.length} of {companies.length} companies
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-12">
            <span className="text-4xl">🏢</span>
            <p className="text-white font-medium mt-3">No companies found</p>
            <p className="text-slate-400 text-sm mt-1">Add your first recruiting partner to get started.</p>
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setModalOpen(true)}>
              Add Company
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <Card key={c.id} className="hover:border-primary-500/40 transition-all flex flex-col justify-between">
              <Card.Body>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600/30 to-indigo-600/20 border border-white/10 flex items-center justify-center font-bold text-lg text-white">
                    {c.name.charAt(0)}
                  </div>
                  <Badge variant="slate" size="sm">{c.industry}</Badge>
                </div>

                <h3 className="font-display font-bold text-lg text-white mb-1">{c.name}</h3>
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                  <span>📍</span> {c.location || 'Location Not Specified'}
                </p>

                <p className="text-xs text-slate-300 line-clamp-2 mb-4">
                  {c.description || 'No company overview description provided.'}
                </p>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-center text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Jobs</span>
                    <span className="font-semibold text-white">{c._count?.jobs || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Drives</span>
                    <span className="font-semibold text-primary-400">{c._count?.drives || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Offers</span>
                    <span className="font-semibold text-emerald-400">{c._count?.outcomes || 0}</span>
                  </div>
                </div>

                {c.website && (
                  <div className="mt-4 text-right">
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-1"
                    >
                      Visit Careers Page ↗
                    </a>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* ── Add Company Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Recruiting Company">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs">
              {formError}
            </div>
          )}

          <Input
            label="Company Name"
            placeholder="e.g. Google India"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            label="Industry Sector"
            placeholder="e.g. Information Technology / Cloud Services"
            required
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Location / Office Hub"
              placeholder="e.g. Bangalore / Hyderabad"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <Input
              label="Official Website URL"
              placeholder="https://..."
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Company Description</label>
            <textarea
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 resize-none h-24"
              placeholder="Brief summary of company domain, culture, and recruitment expectations..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Register Partner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
