import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { fetchParticipants, fetchSectors, fetchTourOperators, fetchDashboard, fetchPlan, fetchPresence, fetchSectorContext, fetchJustifications, fetchOpportunities, fetchSectorOverview, fetchSectorRanking, fetchSectorLeaders, type Participant, type Dashboard, type Plan } from './api';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Tab = 'overview' | 'sector' | 'participant' | 'tour' | 'methodology';


function App() {
  const [active, setActive] = useState<Tab>('overview');
  const [sectors, setSectors] = useState<string[]>([]);
  const [sectorFilter, setSectorFilter] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [tourOps, setTourOps] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [presence, setPresence] = useState<Record<string, string> | null>(null);
  const [justifications, setJustifications] = useState<Record<string, string> | null>(null);
  const [sectorContext, setSectorContext] = useState<{ sector: string; priorityArea: string; recommendations: string[]; total: number } | null>(null);
  const [sectorMetric, setSectorMetric] = useState<'avgCombined'|'avgExternal'|'avgSurvey'>('avgCombined');
  const [sectorTabFilter, setSectorTabFilter] = useState<string>('');
  const [sectorParticipants, setSectorParticipants] = useState<Participant[]>([]);
  const [loadingAllParticipants, setLoadingAllParticipants] = useState<boolean>(false);
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);
  const [loadingTourOps, setLoadingTourOps] = useState<boolean>(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [quickWins, setQuickWins] = useState<any[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState<boolean>(false);
  
  // Sector Intelligence Dashboard state
  const [sectorOverview, setSectorOverview] = useState<any>(null);
  const [sectorRanking, setSectorRanking] = useState<any>(null);
  const [sectorLeaders, setSectorLeaders] = useState<any>(null);
  const [loadingSectorData, setLoadingSectorData] = useState<boolean>(false);
  const [selectedSectorForAnalysis, setSelectedSectorForAnalysis] = useState<string>('');

  useEffect(() => {
    fetchSectors().then(setSectors).catch(() => setSectors([]));
  }, []);

  // Load sector intelligence data when sector is selected
  useEffect(() => {
    if (sectorTabFilter) {
      setLoadingSectorData(true);
      setSelectedSectorForAnalysis(sectorTabFilter);
      
      // Determine comparison type based on sector
      const isCreativeIndustry = !sectorTabFilter.toLowerCase().includes('tour operator') && 
                                !sectorTabFilter.toLowerCase().includes('tourism');
      const comparisonType = isCreativeIndustry ? 'creative' : 'all';
      
      Promise.allSettled([
        fetchSectorOverview(sectorTabFilter).then(setSectorOverview),
        fetchSectorRanking(comparisonType as 'creative' | 'all').then(setSectorRanking),
        fetchSectorLeaders(sectorTabFilter).then(setSectorLeaders)
      ]).finally(() => {
        setLoadingSectorData(false);
      });
    } else {
      setSectorOverview(null);
      setSectorRanking(null);
      setSectorLeaders(null);
      setSelectedSectorForAnalysis('');
    }
  }, [sectorTabFilter]);

  useEffect(() => {
    fetchParticipants(sectorFilter || undefined)
      .then(setParticipants)
      .catch(() => setParticipants([]));
  }, [sectorFilter]);

  useEffect(() => {
    setLoadingTourOps(true);
    fetchTourOperators()
      .then(setTourOps)
      .catch(() => setTourOps([]))
      .finally(() => setLoadingTourOps(false));
  }, []);

  useEffect(() => {
    fetchDashboard().then(setDashboard).catch(() => setDashboard(null));
  }, []);

  useEffect(() => {
    // load all participants once for dropdown, excluding tour operators
    setLoadingAllParticipants(true);
    fetchParticipants(undefined)
      .then(participants => {
        // Filter out tour operators from the creative industries dropdown
        const creativeIndustries = participants.filter(p => 
          !(p.sector || '').toLowerCase().includes('tour operator')
        );
        setAllParticipants(creativeIndustries);
      })
      .catch(() => setAllParticipants([]))
      .finally(() => setLoadingAllParticipants(false));
  }, []);

  useEffect(() => {
    if (sectorTabFilter) {
      fetchParticipants(sectorTabFilter).then(setSectorParticipants).catch(() => setSectorParticipants([]));
    } else {
      setSectorParticipants([]);
    }
  }, [sectorTabFilter]);

  useEffect(() => {
    if (!selectedParticipant) {
      setPlan(null);
      setPresence(null);
      setSectorContext(null);
      setJustifications(null);
      setOpportunities([]);
      setQuickWins([]);
      return;
    }
    setLoadingPlan(true);
    setLoadingOpportunities(true);
    Promise.allSettled([
      fetchPlan(selectedParticipant).then(setPlan),
      fetchPresence(selectedParticipant).then(setPresence),
      fetchSectorContext(selectedParticipant).then(setSectorContext),
      fetchJustifications(selectedParticipant).then(setJustifications),
      fetchOpportunities(selectedParticipant).then(data => {
        setOpportunities(data.opportunities);
        setQuickWins(data.quickWins);
      })
    ]).finally(() => {
      setLoadingPlan(false);
      setLoadingOpportunities(false);
    });
  }, [selectedParticipant]);

  const sectorOptions = useMemo(() => [''].concat(sectors), [sectors]);

  // Clean-path routing with history API under base (e.g., /gambia-itc/creative-industries/:name)
  const basePath = (import.meta as any).env.BASE_URL || '/';
  function parseLocation() {
    const full = decodeURIComponent(window.location.pathname);
    const sub = full.startsWith(basePath) ? full.slice(basePath.length) : full;
    const parts = sub.split('/').filter(Boolean);
    const page = (parts[0] || 'overview').toLowerCase();
    if (page === 'sector') setActive('sector');
    else if (page === 'creative-industries') { setActive('participant'); if (parts[1]) setSelectedParticipant(parts.slice(1).join('/')); }
    else if (page === 'tour-operator' || page === 'tour-operators') setActive('tour');
    else if (page === 'methodology') setActive('methodology');
    else setActive('overview');
  }
  function navigate(path: string) {
    const url = basePath.replace(/\/$/, '') + path;
    window.history.pushState({}, '', url);
    parseLocation();
  }
  useEffect(() => {
    parseLocation();
    const handler = () => parseLocation();
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div className="topbar">
        <h2>The Gambia — Creative Industries & Tourism Assessment</h2>
        <div className="nav">
          {(['overview', 'sector', 'participant', 'tour', 'methodology'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => {
                if (t === 'participant') navigate('/creative-industries');
                else if (t === 'sector') navigate('/sector');
                else if (t === 'tour') navigate('/tour-operator');
                else if (t === 'methodology') navigate('/methodology');
                else navigate('/overview');
              }}
              className={`navbtn ${active === t ? 'active' : ''}`}
            >
              {t === 'overview' && 'Overview'}
              {t === 'sector' && 'Sector'}
              {t === 'participant' && 'Creative Industries'}
              {t === 'tour' && 'Tour Operators'}
              {t === 'methodology' && 'Methodology'}
            </button>
          ))}
        </div>
      </div>

      {active === 'overview' && (
        <div>
          <div className="banner">
            <div style={{ fontSize: 20, fontWeight: 700 }}>Digital Readiness Overview</div>
            <div className="muted">Assess, compare, and improve digital presence across creative industries. Explore sectors for trends or open a participant for tailored guidance.</div>
            <div className="chips" style={{ marginTop: 8 }}>
              <span className="chip">Stakeholders: <b>{dashboard?.total ?? '—'}</b></span>
              <span className="chip">Avg External: <b>{dashboard?.overall.avgExternal ?? '—'}</b></span>
              <span className="chip">Avg Survey: <b>{dashboard?.overall.avgSurvey ?? '—'}</b></span>
              <span className="chip">Avg Combined: <b>{dashboard?.overall.avgCombined ?? '—'}</b></span>
            </div>
          </div>
          {dashboard && (
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Industry Category Averages</div>
                <Bar
                  data={{
                    labels: ['Social Media', 'Website', 'Visual Content', 'Discoverability', 'Digital Sales', 'Integration'],
                    datasets: [{
                      label: 'Average',
                      data: [
                        dashboard.categoryAverages.socialMedia,
                        dashboard.categoryAverages.website,
                        dashboard.categoryAverages.visualContent,
                        dashboard.categoryAverages.discoverability,
                        dashboard.categoryAverages.digitalSales,
                        dashboard.categoryAverages.platformIntegration,
                      ],
                      backgroundColor: '#1565c0',
                    }],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>
              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Digital Maturity</div>
                <Pie
                  data={{
                    labels: ['Absent', 'Emerging', 'Intermediate', 'Advanced', 'Expert'],
                    datasets: [{
                      label: 'Count',
                      data: [
                        dashboard.maturity.Absent || 0,
                        dashboard.maturity.Emerging || 0,
                        dashboard.maturity.Intermediate || 0,
                        dashboard.maturity.Advanced || 0,
                        dashboard.maturity.Expert || 0,
                      ],
                      backgroundColor: ['#dc3545', '#ff9800', '#ffc107', '#17a2b8', '#28a745'],
                    }],
                  }}
                  options={{ plugins: { legend: { position: 'top' } } }}
                />
              </div>
              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Top Sectors (Avg Combined)</div>
                <Bar
                  data={{
                    labels: dashboard.sectors.slice(0, 8).map(s => s.sector),
                    datasets: [{
                      label: 'Avg Combined',
                      data: dashboard.sectors.slice(0, 8).map(s => s.avgCombined),
                      backgroundColor: '#7b1fa2',
                    }],
                  }}
                  options={{
                    indexAxis: 'y' as const,
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { x: { min: 0, max: 100 } },
                  }}
                />
              </div>
              <div className="card" style={{ gridColumn: '1 / span 3' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Sector Readiness (Maturity Levels)</div>
                <Bar
                  data={{
                    labels: Object.keys(dashboard.sectorStacked),
                    datasets: [
                      { label: 'Absent', data: Object.values(dashboard.sectorStacked).map(s => s.Absent), backgroundColor: '#dc3545' },
                      { label: 'Emerging', data: Object.values(dashboard.sectorStacked).map(s => s.Emerging), backgroundColor: '#ff9800' },
                      { label: 'Intermediate', data: Object.values(dashboard.sectorStacked).map(s => s.Intermediate), backgroundColor: '#ffc107' },
                      { label: 'Advanced', data: Object.values(dashboard.sectorStacked).map(s => s.Advanced), backgroundColor: '#17a2b8' },
                      { label: 'Expert', data: Object.values(dashboard.sectorStacked).map(s => s.Expert), backgroundColor: '#28a745' },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'top' } },
                    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {active === 'sector' && (
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
            <label>
              Sector:{' '}
              <select value={sectorTabFilter} onChange={e => setSectorTabFilter(e.target.value)}>
                {([''] as string[]).concat(sectors).map(s => (
                  <option key={s} value={s}>{s || 'Select a sector for analysis'}</option>
                ))}
              </select>
            </label>
          </div>

          {!sectorTabFilter ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>🏢 Sector Intelligence Dashboard</div>
              <div style={{ color: '#666', marginBottom: 16 }}>Select a sector above to view comprehensive performance analysis, benchmarking, and actionable insights.</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Performance Overview</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Health scorecard, participation rates, and maturity distribution</div>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🏆</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Sector Ranking</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Competitive benchmarking and performance comparison</div>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⭐</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Sector Champions</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Top performers and success stories</div>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>💡</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Actionable Insights</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Sector-specific recommendations and quick wins</div>
                </div>
              </div>
            </div>
          ) : loadingSectorData ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div className="muted">Loading sector intelligence data...</div>
            </div>
          ) : (
            <div>
              {/* Sector Health Scorecard */}
              {sectorOverview && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 18 }}>📊 {sectorOverview.sector} - Performance Overview</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#1565c0' }}>{sectorOverview.avgCombined}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>Overall Score</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#28a745' }}>{sectorOverview.participationRate}%</div>
                      <div style={{ fontSize: 12, color: '#666' }}>Participation Rate</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#ffc107' }}>{sectorOverview.totalStakeholders}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>Total Stakeholders</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#17a2b8' }}>{sectorOverview.completionStats.complete}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>Complete Assessments</div>
                    </div>
                  </div>
                  
                  {/* Maturity Distribution */}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Maturity Distribution</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {Object.entries(sectorOverview.maturityDistribution).map(([level, count]) => (
                        <div key={level} style={{ 
                          padding: '4px 12px', 
                          backgroundColor: level === 'Expert' ? '#28a745' : 
                                         level === 'Advanced' ? '#17a2b8' : 
                                         level === 'Intermediate' ? '#ffc107' : 
                                         level === 'Emerging' ? '#fd7e14' : '#6c757d',
                          color: 'white',
                          borderRadius: 16,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {level}: {count as number}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sector Ranking & Benchmarking */}
              {sectorRanking && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 18 }}>🏆 Sector Ranking & Benchmarking</div>
                  <div style={{ marginBottom: 16 }}>
                    <Bar
                      data={{
                        labels: sectorRanking.sectors.slice(0, 10).map((s: any) => s.sector),
                        datasets: [{
                          label: 'Average Combined Score',
                          data: sectorRanking.sectors.slice(0, 10).map((s: any) => s.avgCombined),
                          backgroundColor: sectorRanking.sectors.slice(0, 10).map((s: any) => 
                            s.sector === selectedSectorForAnalysis ? '#1565c0' : '#e9ecef'
                          ),
                        }],
                      }}
                      options={{
                        indexAxis: 'y' as const,
                        responsive: true,
                        plugins: { 
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              afterLabel: (context) => {
                                const sector = sectorRanking.sectors[context.dataIndex];
                                return [
                                  `Rank: #${sector.rank}`,
                                  `Participation: ${sector.participationRate}%`,
                                  `Stakeholders: ${sector.totalStakeholders}`
                                ];
                              }
                            }
                          }
                        },
                        scales: { x: { beginAtZero: true, max: 100 } },
                      }}
                    />
                  </div>
                  
                  {/* Current Sector Position */}
                  {selectedSectorForAnalysis && (
                    <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {selectedSectorForAnalysis} Position
                      </div>
                      <div style={{ fontSize: 14, color: '#666' }}>
                        Ranked #{sectorRanking.sectors.find((s: any) => s.sector === selectedSectorForAnalysis)?.rank || 'N/A'} out of {sectorRanking.totalSectors} sectors
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sector Leaders & Champions */}
              {sectorLeaders && sectorLeaders.leaders.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 18 }}>⭐ Sector Champions</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                    {sectorLeaders.leaders.map((leader: any, index: number) => (
                      <div key={leader.name} style={{ 
                        padding: 16, 
                        backgroundColor: '#fff', 
                        border: '1px solid #e7e7e9', 
                        borderRadius: 8,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <div style={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            fontWeight: 700,
                            color: 'white'
                          }}>
                            {index + 1}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{leader.name}</div>
                        </div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                          {leader.region} • {leader.maturityLevel}
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>Combined</div>
                            <div style={{ color: '#1565c0' }}>{leader.combinedScore}</div>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>External</div>
                            <div style={{ color: '#28a745' }}>{leader.externalScore}</div>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>Survey</div>
                            <div style={{ color: '#17a2b8' }}>{leader.surveyScore}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stakeholders in Sector */}
              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Stakeholders in {selectedSectorForAnalysis}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {sectorParticipants.length ? sectorParticipants.map(p => (
                    <button key={p.name} className="card" onClick={() => { setSelectedParticipant(p.name); navigate(`/creative-industries/${encodeURIComponent(p.name)}`); }}>
                      {p.name}
                    </button>
                  )) : <div>No stakeholders found in this sector.</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {active === 'participant' && (
        <div>
          <div className="card" style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Find a creative industries participant</div>
            {loadingAllParticipants ? (
              <div className="muted">Loading participants…</div>
            ) : (
              <select
                value={selectedParticipant}
                onChange={e => { const v = e.target.value; setSelectedParticipant(v); if (v) navigate(`/creative-industries/${encodeURIComponent(v)}`); }}
                style={{ padding: 8, borderRadius: 8, border: '1px solid #e7e7e9', minWidth: 320 }}
              >
                <option value="">Select a creative industries participant…</option>
                {allParticipants.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
          {!selectedParticipant ? (
            <div className="card">Select a participant to view plan.</div>
          ) : (
            loadingPlan ? (
              <div className="card">Loading participant data…</div>
            ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Profile</div>
                <div><strong>Name</strong>: {plan?.profile.name || selectedParticipant}</div>
                <div><strong>Sector</strong>: {plan?.profile.sector || '—'}</div>
                <div><strong>Region</strong>: {plan?.profile.region || '—'}</div>
                <div><strong>Maturity</strong>: {plan?.profile.maturity || '—'}</div>
                <div className="chips" style={{ marginTop: 8 }}>
                  <span className="chip">External: <b>{plan?.profile.scores.externalTotal ?? '—'}</b></span>
                  <span className="chip">Survey: <b>{plan?.profile.scores.surveyTotal ?? '—'}</b></span>
                  <span className="chip">Combined: <b>{plan?.profile.scores.combined ?? '—'}</b></span>
                </div>
                {(plan?.profile.scores.surveyTotal ?? 0) <= 0 && (
                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <a 
                      href="https://surveys.intracen.org/response/G2tIYnZeRwYLYVFyVFx9S0d6eno" 
                      target="_blank" 
                      rel="noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#1565c0',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        boxShadow: '0 2px 8px rgba(21, 101, 192, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      📝 Complete Survey for Creative Industries
                    </a>
                  </div>
                )}
              </div>

              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Digital Presence</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Currently active online profiles</div>
                <div className="chips">
                  {['website','facebook','instagram','tripadvisor','youtube'].map(key => {
                    const url = presence?.[key];
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    const getIcon = (key: string) => {
                      const icons: Record<string, string> = {
                        website: '🌐',
                        facebook: 'f',
                        instagram: '📷',
                        tripadvisor: '🅣',
                        youtube: '▶'
                      };
                      return icons[key] || '🔗';
                    };
                    return url ? (
                      <a key={key} className="chip" href={url} target="_blank" rel="noreferrer" style={{ fontWeight: 'bold' }}>
                        <span style={{ marginRight: 4 }}>{getIcon(key)}</span>{label}
                      </a>
                    ) : (
                      <span key={key} className="chip" style={{ opacity: 0.6 }}>
                        <span style={{ marginRight: 4 }}>{getIcon(key)}</span>{label}: not found
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 18 }}>📊 External Assessment</div>
                {plan?.external?.breakdown?.length ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {plan.external.breakdown.map((b) => {
                      const percentage = Math.round((b.score / b.max) * 100);
                      const sectorPercentage = Math.round((b.sectorAvg / b.max) * 100);
                      const getColor = (pct: number) => {
                        if (pct >= 80) return '#28a745'; // Green
                        if (pct >= 60) return '#17a2b8'; // Teal
                        if (pct >= 40) return '#ffc107'; // Yellow
                        return '#dc3545'; // Red
                      };
                      const getEmoji = (key: string) => {
                        const emojis: Record<string, string> = {
                          socialMedia: '📱',
                          website: '🌐',
                          visualContent: '📸',
                          discoverability: '🔍',
                          digitalSales: '💳',
                          platformIntegration: '🔗'
                        };
                        return emojis[key] || '📊';
                      };
                      const getReasoning = (key: string, score: number) => {
                        const reasons = plan?.reasons?.[key];
                        if (reasons && reasons[score]) {
                          return reasons[score];
                        }
                        // Fallback reasoning based on percentage
                        if (percentage >= 80) return 'Excellent performance in this area';
                        if (percentage >= 60) return 'Good performance with room for improvement';
                        if (percentage >= 40) return 'Moderate performance, significant opportunities';
                        return 'Needs significant improvement';
                      };
                      
                      return (
                        <div key={b.key} className="card" style={{ 
                          padding: 16, 
                          border: `2px solid ${getColor(percentage)}20`,
                          background: `linear-gradient(135deg, ${getColor(percentage)}10, ${getColor(percentage)}05)`
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 24 }}>{getEmoji(b.key)}</span>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>
                              {b.label} ({b.max})
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: getColor(percentage), minWidth: 50 }}>
                              {Math.round(b.score)}/{b.max}
                            </div>
                            <div style={{ flex: 1, height: 8, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
                              <div style={{ 
                                width: `${percentage}%`, 
                                height: '100%', 
                                background: `linear-gradient(90deg, ${getColor(percentage)}, ${getColor(percentage)}cc)`,
                                borderRadius: 6
                              }} />
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: getColor(percentage), minWidth: 40 }}>
                              {percentage}%
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                            Sector avg: {sectorPercentage}%
                          </div>
                          <div style={{ fontSize: 12, color: '#444', lineHeight: 1.4, fontStyle: 'italic' }}>
                            {getReasoning(b.key, Math.round(b.score))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : '—'}
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>External vs Sector (normalized)</div>
                {plan?.external?.breakdown?.length ? (
                  <Bar
                    data={{
                      labels: plan.external.breakdown.map(b => b.label),
                      datasets: [
                        {
                          label: 'Participant',
                          data: plan.external.breakdown.map(b => Math.round((b.score / b.max) * 100)),
                          backgroundColor: '#1565c0',
                        },
                        {
                          label: 'Sector Avg',
                          data: plan.external.breakdown.map(b => Math.round((b.sectorAvg / b.max) * 100)),
                          backgroundColor: '#7b1fa2',
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'top' } },
                      scales: { y: { beginAtZero: true, max: 100 } },
                    }}
                  />
                ) : '—'}
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Opportunities</div>
                {loadingOpportunities ? (
                  <div className="muted">Loading opportunities…</div>
                ) : opportunities?.length ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: 6 }}>Category</th>
                          <th style={{ textAlign: 'left', padding: 6 }}>Current → Target</th>
                          <th style={{ textAlign: 'left', padding: 6 }}>Actions</th>
                          <th style={{ textAlign: 'left', padding: 6 }}>Timeframe</th>
                          <th style={{ textAlign: 'left', padding: 6 }}>Cost</th>
                          <th style={{ textAlign: 'left', padding: 6 }}>Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {opportunities.map((o, i) => (
                          <tr key={i}>
                            <td style={{ padding: 6 }}>{o.category}</td>
                            <td style={{ padding: 6 }}>{o.current} → {o.target}</td>
                            <td style={{ padding: 6 }}>{o.actions.join(', ')}</td>
                            <td style={{ padding: 6 }}>{o.timeframe}</td>
                            <td style={{ padding: 6 }}>{o.cost}</td>
                            <td style={{ padding: 6 }}>{o.impact}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : '—'}
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Quick Wins</div>
                {loadingOpportunities ? (
                  <div className="muted">Loading quick wins…</div>
                ) : quickWins?.length ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {quickWins.map((w, i) => (
                      <li key={i}><strong>{w.opportunity}</strong>: {w.currentToTarget} — {w.actions.join(', ')}</li>
                    ))}
                  </ul>
                ) : '—'}
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Sector Context</div>
                {sectorContext ? (
                  <div>
                    <div><strong>Priority area</strong>: {sectorContext.priorityArea}</div>
                    <div style={{ marginTop: 4 }}>
                      <strong>Recommendations</strong>: {sectorContext.recommendations?.join(', ') || '—'}
                    </div>
                  </div>
                ) : '—'}
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 16 }}>Evidence & Justifications</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 12, cursor: 'pointer' }}>▼ Show notes (assessor evidence per category)</div>
                {justifications && Object.keys(justifications).length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(justifications).map(([k, v]) => (
                      <div key={k} style={{ 
                        backgroundColor: '#fff', 
                        padding: 12, 
                        borderRadius: 8, 
                        border: '1px solid #e7e7e9',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: '#333' }}>{k}</div>
                        <div style={{ fontSize: 14, color: '#666', lineHeight: 1.4 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                ) : '—'}
              </div>

              <div style={{ gridColumn: '1 / span 2', height: 1, backgroundColor: '#e7e7e9', margin: '16px 0' }}></div>

              <div style={{ gridColumn: '1 / span 2', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>Next Steps</div>
              </div>
            </div>
            )
          )}
        </div>
      )}

      {active === 'tour' && (
        <div>
          <div className="card" style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Tour Operators ({tourOps.length})</div>
            {loadingTourOps ? (
              <div className="muted">Loading tour operators…</div>
            ) : (
              <select
                value={selectedParticipant}
                onChange={e => { const v = e.target.value; setSelectedParticipant(v); }}
                style={{ padding: 8, borderRadius: 8, border: '1px solid #e7e7e9', minWidth: 320 }}
              >
                <option value="">Select a tour operator…</option>
                {tourOps.map(t => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
            )}
          </div>
          {!selectedParticipant ? (
            <div className="card">Select a tour operator to view plan.</div>
          ) : (
            loadingPlan ? (
              <div className="card">Loading tour operator data…</div>
            ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Profile</div>
                <div><strong>Name</strong>: {plan?.profile.name || selectedParticipant}</div>
                <div><strong>Sector</strong>: {plan?.profile.sector || '—'}</div>
                <div><strong>Region</strong>: {plan?.profile.region || '—'}</div>
                <div><strong>Maturity</strong>: {plan?.profile.maturity || '—'}</div>
                <div className="chips" style={{ marginTop: 8 }}>
                  <span className="chip">External: <b>{plan?.profile.scores.externalTotal ?? '—'}</b></span>
                  <span className="chip">Survey: <b>{plan?.profile.scores.surveyTotal ?? '—'}</b></span>
                  <span className="chip">Combined: <b>{plan?.profile.scores.combined ?? '—'}</b></span>
                </div>
                {(plan?.profile.scores.surveyTotal ?? 0) <= 0 && (
                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <a 
                      href="https://surveys.intracen.org/response/G2tIYnZeQwsCZ1FyX1ByS0d1dXs" 
                      target="_blank" 
                      rel="noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#1565c0',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        boxShadow: '0 2px 8px rgba(21, 101, 192, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      📝 Complete Survey for Tour Operators
                    </a>
                  </div>
                )}
              </div>

              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Digital Presence</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Currently active online profiles</div>
                <div className="chips">
                  {['website','facebook','instagram','tripadvisor','youtube'].map(key => {
                    const url = presence?.[key];
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    const getIcon = (key: string) => {
                      const icons: Record<string, string> = {
                        website: '🌐',
                        facebook: 'f',
                        instagram: '📷',
                        tripadvisor: '🅣',
                        youtube: '▶'
                      };
                      return icons[key] || '🔗';
                    };
                    return url ? (
                      <a key={key} className="chip" href={url} target="_blank" rel="noreferrer" style={{ fontWeight: 'bold' }}>
                        <span style={{ marginRight: 4 }}>{getIcon(key)}</span>{label}
                      </a>
                    ) : (
                      <span key={key} className="chip" style={{ opacity: 0.6 }}>
                        <span style={{ marginRight: 4 }}>{getIcon(key)}</span>{label}: not found
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 18 }}>📊 External Assessment</div>
                {plan?.external?.breakdown?.length ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {plan.external.breakdown.map((b) => {
                      const percentage = Math.round((b.score / b.max) * 100);
                      const sectorPercentage = Math.round((b.sectorAvg / b.max) * 100);
                      const getColor = (pct: number) => {
                        if (pct >= 80) return '#28a745'; // Green
                        if (pct >= 60) return '#17a2b8'; // Teal
                        if (pct >= 40) return '#ffc107'; // Yellow
                        return '#dc3545'; // Red
                      };
                      const getEmoji = (key: string) => {
                        const emojis: Record<string, string> = {
                          socialMedia: '📱',
                          website: '🌐',
                          visualContent: '📸',
                          discoverability: '🔍',
                          digitalSales: '💳',
                          platformIntegration: '🔗'
                        };
                        return emojis[key] || '📊';
                      };
                      const getReasoning = (key: string, score: number) => {
                        const reasons = plan?.reasons?.[key];
                        if (reasons && reasons[score]) {
                          return reasons[score];
                        }
                        // Fallback reasoning based on percentage
                        if (percentage >= 80) return 'Excellent performance in this area';
                        if (percentage >= 60) return 'Good performance with room for improvement';
                        if (percentage >= 40) return 'Moderate performance, significant opportunities';
                        return 'Needs significant improvement';
                      };
                      
                      return (
                        <div key={b.key} className="card" style={{ 
                          padding: 16, 
                          border: `2px solid ${getColor(percentage)}20`,
                          background: `linear-gradient(135deg, ${getColor(percentage)}10, ${getColor(percentage)}05)`
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 24 }}>{getEmoji(b.key)}</span>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>
                              {b.label} ({b.max})
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: getColor(percentage), minWidth: 50 }}>
                              {Math.round(b.score)}/{b.max}
                            </div>
                            <div style={{ flex: 1, height: 8, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
                              <div style={{ 
                                width: `${percentage}%`, 
                                height: '100%', 
                                background: `linear-gradient(90deg, ${getColor(percentage)}, ${getColor(percentage)}cc)`,
                                borderRadius: 6
                              }} />
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: getColor(percentage), minWidth: 40 }}>
                              {percentage}%
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                            Sector avg: {sectorPercentage}%
                          </div>
                          <div style={{ fontSize: 12, color: '#444', lineHeight: 1.4, fontStyle: 'italic' }}>
                            {getReasoning(b.key, Math.round(b.score))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : '—'}
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>External vs Sector (normalized)</div>
                {plan?.external?.breakdown?.length ? (
                  <Bar
                    data={{
                      labels: plan.external.breakdown.map(b => b.label),
                      datasets: [
                        {
                          label: 'Participant',
                          data: plan.external.breakdown.map(b => Math.round((b.score / b.max) * 100)),
                          backgroundColor: '#1565c0',
                        },
                        {
                          label: 'Sector Avg',
                          data: plan.external.breakdown.map(b => Math.round((b.sectorAvg / b.max) * 100)),
                          backgroundColor: '#7b1fa2',
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'top' } },
                      scales: { y: { beginAtZero: true, max: 100 } },
                    }}
                  />
                ) : '—'}
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Opportunities</div>
                {loadingOpportunities ? (
                  <div className="muted">Loading opportunities…</div>
                ) : opportunities?.length ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: 6 }}>Category</th>
                          <th style={{ textAlign: 'left', padding: 6 }}>Current → Target</th>
                          <th style={{ textAlign: 'left', padding: 6 }}>Actions</th>
                          <th style={{ textAlign: 'left', padding: 6 }}>Timeframe</th>
                          <th style={{ textAlign: 'left', padding: 6 }}>Cost</th>
                          <th style={{ textAlign: 'left', padding: 6 }}>Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {opportunities.map((o, i) => (
                          <tr key={i}>
                            <td style={{ padding: 6 }}>{o.category}</td>
                            <td style={{ padding: 6 }}>{o.current} → {o.target}</td>
                            <td style={{ padding: 6 }}>{o.actions.join(', ')}</td>
                            <td style={{ padding: 6 }}>{o.timeframe}</td>
                            <td style={{ padding: 6 }}>{o.cost}</td>
                            <td style={{ padding: 6 }}>{o.impact}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : '—'}
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Quick Wins</div>
                {loadingOpportunities ? (
                  <div className="muted">Loading quick wins…</div>
                ) : quickWins?.length ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {quickWins.map((w, i) => (
                      <li key={i}><strong>{w.opportunity}</strong>: {w.currentToTarget} — {w.actions.join(', ')}</li>
                    ))}
                  </ul>
                ) : '—'}
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Sector Context</div>
                {sectorContext ? (
                  <div>
                    <div><strong>Priority area</strong>: {sectorContext.priorityArea}</div>
                    <div style={{ marginTop: 4 }}>
                      <strong>Recommendations</strong>: {sectorContext.recommendations?.join(', ') || '—'}
                    </div>
                  </div>
                ) : '—'}
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 16 }}>Evidence & Justifications</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 12, cursor: 'pointer' }}>▼ Show notes (assessor evidence per category)</div>
                {justifications && Object.keys(justifications).length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(justifications).map(([k, v]) => (
                      <div key={k} style={{ 
                        backgroundColor: '#fff', 
                        padding: 12, 
                        borderRadius: 8, 
                        border: '1px solid #e7e7e9',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: '#333' }}>{k}</div>
                        <div style={{ fontSize: 14, color: '#666', lineHeight: 1.4 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                ) : '—'}
              </div>

              <div style={{ gridColumn: '1 / span 2', height: 1, backgroundColor: '#e7e7e9', margin: '16px 0' }}></div>

              <div style={{ gridColumn: '1 / span 2', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>Next Steps</div>
              </div>

            </div>
            )
          )}
        </div>
      )}

      {active === 'methodology' && (
        <div>
          <div className="card" style={{ color: '#fff', background: 'linear-gradient(120deg, #1565c0, #7b1fa2)' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Methodology</div>
            <div style={{ opacity: 0.9 }}>Evidence-based process for sector-ready guidance</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 6 }}>1) Data Collection</div>
              <ul style={{ margin: 0, paddingLeft: 18, textAlign: 'left' }}>
                <li>Master Assessment: External (70) + Survey (30)</li>
                <li>Sectors and regions from validated inputs</li>
                <li>Live-linked calculations in the sheet</li>
              </ul>
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 6 }}>2) Scoring & Aggregation</div>
              <ul style={{ margin: 0, paddingLeft: 18, textAlign: 'left' }}>
                <li>Category maxima: 18/12/15/12/8/5</li>
                <li>Sector averages computed from live data</li>
                <li>Digital maturity classified Absent → Expert</li>
              </ul>
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 6 }}>3) Opportunity Generation</div>
              <ul style={{ margin: 0, paddingLeft: 18, textAlign: 'left' }}>
                <li>Step-up targets and actions per category</li>
                <li>Quick Wins prioritized by impact vs effort</li>
                <li>Sector guidance and program interventions</li>
              </ul>
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Impact & Readiness</div>
              <ul style={{ margin: 0, paddingLeft: 18, textAlign: 'left' }}>
                <li><b>Competitiveness</b>: reach, discoverability, conversion</li>
                <li><b>Inclusiveness</b>: MSMEs, women and youth</li>
                <li><b>Sustainability</b>: data-driven, efficient, local</li>
                <li><b>Readiness</b>: found online, tell story, transact</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
