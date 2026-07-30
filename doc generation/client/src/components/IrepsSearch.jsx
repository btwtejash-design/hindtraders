import React, { useState } from 'react';
import { Search, Download, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const RAILWAY_ZONES = [
  { code: '8937', name: 'Eastern Railway' },
  { code: '8938', name: 'Central Railway' },
  { code: '8939', name: 'Northern Railway' },
  { code: '8940', name: 'Southern Railway' },
  { code: '8941', name: 'Western Railway' },
  { code: '8942', name: 'South Eastern Railway' },
  { code: '8943', name: 'East Central Railway' },
  { code: '-1', name: 'All Zones' }
];

const DIVISIONS = [
  { code: '19', name: 'Stores Department' },
  { code: '01', name: 'Mechanical' },
  { code: '02', name: 'Electrical' },
  { code: '03', name: 'Engineering (Civil)' },
  { code: '04', name: 'S & T' },
  { code: '-1', name: 'All Divisions' }
];

export default function IrepsSearch({ apiBase }) {
  const todayStr = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 6);
  const futureStr = futureDate.toLocaleDateString('en-GB');

  const [formData, setFormData] = useState({
    advancedSearch: '',
    searchOption: '1',
    railwayZone: '8937',
    division: '19',
    dateFrom: todayStr,
    dateTo: futureStr,
    workArea: 'PT',
    organization: '01'
  });

  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchSuccessMsg, setSearchSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!formData.advancedSearch.trim()) {
      setErrorMsg('Please enter a Tender Number or Item Description keyword.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSearchSuccessMsg('');
    setTenders([]);

    try {
      const response = await fetch(`${apiBase}/ireps/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          searchOptorOption: '0',
          unit: '-1',
          tenderStage: '-1',
          tenderType: '-1',
          bidding: '-1',
          selectDate: 'TENDER_OPENING_DATE',
          direction: 'P',
          monthDay: 'M',
          radioDuration: '6'
        })
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.detail || data.error || 'Failed to fetch tender results from IREPS.');
      }

      setTenders(data.tenders || []);
      if (data.count === 0) {
        setSearchSuccessMsg('No active tenders found matching your query.');
      } else {
        setSearchSuccessMsg(`Found ${data.count} tender record(s) matching your query.`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while connecting to the IREPS portal.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('published') || s.includes('active') || s.includes('open')) {
      return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(40, 167, 69, 0.2)', color: '#28a745', border: '1px solid rgba(40, 167, 69, 0.4)', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
    }
    if (s.includes('opened') || s.includes('evaluated')) {
      return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(0, 123, 255, 0.2)', color: '#3898ff', border: '1px solid rgba(0, 123, 255, 0.4)', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
    }
    return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold)', border: '1px solid rgba(212, 175, 55, 0.4)', fontSize: '0.75rem', fontWeight: 600 }}>{status || 'Published'}</span>;
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <Search size={22} color="var(--gold)" />
        <div>
          <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#fff', fontWeight: 700 }}>
            Indian Railways E-Procurement System (IREPS) Tender Finder
          </h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#a0a0a0' }}>
            Live query interface for IREPS tender notices and specification PDF download
          </p>
        </div>
      </div>

      {/* SEARCH FORM */}
      <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--gold)', marginBottom: '0.3rem', fontWeight: 600 }}>
            Search Query (Tender No / Description / Item Code)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              name="searchOption"
              value={formData.searchOption}
              onChange={handleChange}
              style={{ background: '#1c1c1c', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}
            >
              <option value="1">Tender No</option>
              <option value="2">Name Of Work</option>
              <option value="3">Item Code</option>
              <option value="4">Description</option>
            </select>

            <input
              type="text"
              name="advancedSearch"
              placeholder="e.g. 55265529b, Spring, Bus Bar..."
              value={formData.advancedSearch}
              onChange={handleChange}
              style={{ flex: 1, background: '#1c1c1c', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}
              required
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: '#ccc', marginBottom: '0.3rem' }}>
            Railway Zone
          </label>
          <select
            name="railwayZone"
            value={formData.railwayZone}
            onChange={handleChange}
            style={{ width: '100%', background: '#1c1c1c', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}
          >
            {RAILWAY_ZONES.map((zone) => (
              <option key={zone.code} value={zone.code}>{zone.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: '#ccc', marginBottom: '0.3rem' }}>
            Division / Dept
          </label>
          <select
            name="division"
            value={formData.division}
            onChange={handleChange}
            style={{ width: '100%', background: '#1c1c1c', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}
          >
            {DIVISIONS.map((div) => (
              <option key={div.code} value={div.code}>{div.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: '#ccc', marginBottom: '0.3rem' }}>
            Opening Date From
          </label>
          <input
            type="text"
            name="dateFrom"
            value={formData.dateFrom}
            onChange={handleChange}
            placeholder="DD/MM/YYYY"
            style={{ width: '100%', background: '#1c1c1c', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: '#ccc', marginBottom: '0.3rem' }}>
            Opening Date To
          </label>
          <input
            type="text"
            name="dateTo"
            value={formData.dateTo}
            onChange={handleChange}
            placeholder="DD/MM/YYYY"
            style={{ width: '100%', background: '#1c1c1c', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.55rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin-icon" /> Searching IREPS...
              </>
            ) : (
              <>
                <Search size={16} /> Search Tenders
              </>
            )}
          </button>
        </div>
      </form>

      {/* FEEDBACK MESSAGES */}
      {errorMsg && (
        <div style={{ background: 'rgba(220, 53, 69, 0.15)', border: '1px solid rgba(220, 53, 69, 0.4)', color: '#ff6b6b', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {searchSuccessMsg && !errorMsg && (
        <div style={{ background: 'rgba(40, 167, 69, 0.15)', border: '1px solid rgba(40, 167, 69, 0.3)', color: '#2ecc71', padding: '0.6rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>{searchSuccessMsg}</span>
        </div>
      )}

      {/* TENDERS TABLE RESULTS */}
      {tenders.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.6rem' }}>Deptt. / Unit</th>
                <th style={{ padding: '0.6rem' }}>Tender Number</th>
                <th style={{ padding: '0.6rem' }}>Title / Description</th>
                <th style={{ padding: '0.6rem' }}>Status</th>
                <th style={{ padding: '0.6rem' }}>Opening Date</th>
                <th style={{ padding: '0.6rem' }}>Due Date</th>
                <th style={{ padding: '0.6rem', textAlign: 'center' }}>Action / Document</th>
              </tr>
            </thead>
            <tbody>
              {tenders.map((tender, index) => (
                <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '0.65rem', color: '#e0e0e0', fontWeight: 500 }}>{tender.dept_unit || 'Eastern Railway'}</td>
                  <td style={{ padding: '0.65rem', color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 600 }}>{tender.tender_number}</td>
                  <td style={{ padding: '0.65rem', color: '#ccc', maxWidth: '300px' }}>{tender.description}</td>
                  <td style={{ padding: '0.65rem' }}>{getStatusBadge(tender.status)}</td>
                  <td style={{ padding: '0.65rem', color: '#bbb' }}>{tender.opening_date}</td>
                  <td style={{ padding: '0.65rem', color: '#bbb' }}>{tender.due_date}</td>
                  <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                    {tender.pdf_url ? (
                      <a
                        href={`${apiBase}/ireps/download-pdf?url=${encodeURIComponent(tender.pdf_url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', color: '#fff' }}
                      >
                        <Download size={13} color="var(--gold)" />
                        Download PDF
                      </a>
                    ) : (
                      <span style={{ color: '#777', fontSize: '0.75rem', italic: true }}>No Direct PDF</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
