import { useEffect, useState } from 'react';
import './App.css';
import { fetchParticipants, fetchSectors, fetchTourOperators, fetchDashboard, fetchPlan, fetchPresence, fetchJustifications, fetchOpportunities, fetchSectorOverview, fetchSectorLeaders, fetchSectorCategoryComparison, type Participant, type Dashboard, type Plan } from './api';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Pie, Bar, Radar } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

type Tab = 'overview' | 'sector' | 'participant' | 'tour' | 'methodology';


function App() {
  const [active, setActive] = useState<Tab>('overview');
  const [sectors, setSectors] = useState<string[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [tourOps, setTourOps] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [presence, setPresence] = useState<Record<string, string> | null>(null);
  const [justifications, setJustifications] = useState<Record<string, string> | null>(null);
  const [sectorTabFilter, setSectorTabFilter] = useState<string>('');
  const [sectorParticipants, setSectorParticipants] = useState<Participant[]>([]);
  const [loadingAllParticipants, setLoadingAllParticipants] = useState<boolean>(false);
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);
  const [loadingTourOps, setLoadingTourOps] = useState<boolean>(false);
  const [customOpportunities, setCustomOpportunities] = useState<any[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState<boolean>(false);
  
  // Sector Intelligence Dashboard state
  const [sectorOverview, setSectorOverview] = useState<any>(null);
  const [sectorLeaders, setSectorLeaders] = useState<any>(null);
  const [sectorCategoryComparison, setSectorCategoryComparison] = useState<any>(null);
  const [loadingSectorData, setLoadingSectorData] = useState<boolean>(false);
  const [selectedSectorForAnalysis, setSelectedSectorForAnalysis] = useState<string>('');
  
  // Modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState<boolean>(false);
  const [feedbackForm, setFeedbackForm] = useState<{ type: string; participant?: string; sector?: string; message: string; contact?: string }>({ type: 'correction', message: '' });
  const [participantForm, setParticipantForm] = useState<{ name: string; sector: string; contact: string; notes: string }>({ name: '', sector: '', contact: '', notes: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const [submittingParticipant, setSubmittingParticipant] = useState<boolean>(false);

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
        fetchSectorLeaders(sectorTabFilter).then(setSectorLeaders),
        fetchSectorCategoryComparison(sectorTabFilter, comparisonType as 'creative' | 'all').then(setSectorCategoryComparison)
      ]).finally(() => {
        setLoadingSectorData(false);
      });
    } else {
      setSectorOverview(null);
      setSectorLeaders(null);
      setSectorCategoryComparison(null);
      setSelectedSectorForAnalysis('');
    }
  }, [sectorTabFilter]);

  useEffect(() => {
    if (sectorTabFilter) {
      fetchParticipants(sectorTabFilter)
        .then(setSectorParticipants)
        .catch(() => setSectorParticipants([]));
    } else {
      setSectorParticipants([]);
    }
  }, [sectorTabFilter]);

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
    console.log('Fetching all participants for creative industries dropdown');
    fetchParticipants(undefined)
      .then(participants => {
        console.log('Received all participants:', participants);
        // Filter out tour operators from the creative industries dropdown
        const creativeIndustries = participants.filter(p => 
          !(p.sector || '').toLowerCase().includes('tour operator')
        );
        console.log('Filtered creative industries:', creativeIndustries);
        setAllParticipants(creativeIndustries);
      })
      .catch(error => {
        console.error('Error fetching all participants:', error);
        setAllParticipants([]);
      })
      .finally(() => setLoadingAllParticipants(false));
  }, []);

  useEffect(() => {
    if (sectorTabFilter) {
      console.log('Fetching participants for sector:', sectorTabFilter);
      fetchParticipants(sectorTabFilter)
        .then(participants => {
          console.log('Received participants:', participants);
          setSectorParticipants(participants);
        })
        .catch(error => {
          console.error('Error fetching participants:', error);
          setSectorParticipants([]);
        });
    } else {
      setSectorParticipants([]);
    }
  }, [sectorTabFilter]);

  useEffect(() => {
    if (!selectedParticipant) {
      setPlan(null);
      setPresence(null);
      setJustifications(null);
      setCustomOpportunities([]);
      // setGeneratedOpportunities([]);
      return;
    }
    setLoadingPlan(true);
    setLoadingOpportunities(true);
    Promise.allSettled([
      fetchPlan(selectedParticipant).then(setPlan),
      fetchPresence(selectedParticipant).then(setPresence),
      fetchJustifications(selectedParticipant).then(setJustifications),
      fetchOpportunities(selectedParticipant).then(data => {
        setCustomOpportunities(data.customOpportunities || []);
      })
    ]).finally(() => {
      setLoadingPlan(false);
      setLoadingOpportunities(false);
    });
  }, [selectedParticipant]);


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
    <div>
      {/* Progress Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
        border: '1px solid #81d4fa',
        borderRadius: 0,
        padding: '12px 0',
        margin: '-0.75rem -0.75rem 12px -0.75rem',
        textAlign: 'center',
        color: '#01579b'
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>📊 Assessment In Progress</div>
        <div style={{ fontSize: 12, lineHeight: 1.4, color: '#0277bd', padding: '0 8px' }}>
          We're actively collecting data and refining this assessment. <strong>Your input matters! </strong>
          Please submit corrections, additional information, or relevant links to help us make this as accurate as possible.
          <br />
          <strong>Final results expected by end of October 2025.</strong>
        </div>
      </div>

      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, flex: 1, minWidth: 0 }}>The Gambia — Creative Industries & Tourism Assessment</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="subtitle mobile-hide" style={{ fontSize: 11, opacity: 0.9, fontWeight: 500 }}>Digital Readiness Platform</div>
            <div className="action-buttons" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowFeedbackModal(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '12px',
                  transition: 'all 0.2s ease',
                  minHeight: '36px',
                  minWidth: '36px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                Submit Correction
              </button>
              <button
                onClick={() => setShowAddParticipantModal(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                  color: 'var(--primary)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '12px',
                  transition: 'all 0.2s ease',
                  minHeight: '36px',
                  minWidth: '36px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Add Participant
              </button>
            </div>
          </div>
        </div>
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
          <div className="banner">
            <div style={{ fontSize: 20, fontWeight: 700 }}>Sector Analysis</div>
            <div className="muted">Compare performance across creative industry sectors. Select a sector to view detailed analytics, benchmarking, and sector-specific recommendations.</div>
          </div>
          
          <div className="mobile-spacing" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', width: '100%' }}>
              <span style={{ fontWeight: 600, color: '#333', minWidth: 'fit-content' }}>Sector:</span>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <select 
                  value={sectorTabFilter} 
                  onChange={e => setSectorTabFilter(e.target.value)}
                  style={{
                    appearance: 'none',
                    background: sectorTabFilter ? '#1565c0' : '#f8f9fa',
                    color: sectorTabFilter ? 'white' : '#333',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                    minHeight: '40px',
                    boxShadow: sectorTabFilter ? '0 2px 4px rgba(21, 101, 192, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {([''] as string[]).concat(sectors).map(s => (
                    <option key={s} value={s} style={{ background: 'white', color: '#333' }}>
                      {s || 'Select a sector for analysis'}
                    </option>
                  ))}
                </select>
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: sectorTabFilter ? 'white' : '#666'
                }}>
                  ▼
                </div>
              </div>
            </label>
          </div>

          {!sectorTabFilter ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>🏢 Sector Intelligence Dashboard</div>
              <div style={{ color: '#666', marginBottom: 16 }}>Select a sector above to view comprehensive performance analysis, benchmarking, and actionable insights.</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
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

              {/* Cross-Sector Category Comparison */}
              {sectorCategoryComparison && sectorCategoryComparison.targetSector && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 18 }}>📊 Category Performance Analysis</div>
                  
                  {/* Radar Chart */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Strengths & Weaknesses Radar</div>
                    <div style={{ height: 400 }}>
                      <Radar
                        data={{
                          labels: sectorCategoryComparison.categories.map((cat: string) => 
                            sectorCategoryComparison.categoryLabels[cat]
                          ),
                          datasets: [
                            {
                              label: selectedSectorForAnalysis,
                              data: sectorCategoryComparison.categories.map((cat: string) => 
                                sectorCategoryComparison.targetSector.categoryAverages[cat]
                              ),
                              backgroundColor: 'rgba(21, 101, 192, 0.2)',
                              borderColor: 'rgba(21, 101, 192, 1)',
                              borderWidth: 2,
                              pointBackgroundColor: 'rgba(21, 101, 192, 1)',
                              pointBorderColor: '#fff',
                              pointHoverBackgroundColor: '#fff',
                              pointHoverBorderColor: 'rgba(21, 101, 192, 1)'
                            },
                            {
                              label: 'Sector Average',
                              data: sectorCategoryComparison.categories.map((cat: string) => {
                                const avg = sectorCategoryComparison.otherSectors.reduce((sum: number, sector: any) => 
                                  sum + sector.categoryAverages[cat], 0
                                ) / sectorCategoryComparison.otherSectors.length;
                                return Math.round(avg * 10) / 10;
                              }),
                              backgroundColor: 'rgba(108, 117, 125, 0.2)',
                              borderColor: 'rgba(108, 117, 125, 1)',
                              borderWidth: 2,
                              pointBackgroundColor: 'rgba(108, 117, 125, 1)',
                              pointBorderColor: '#fff',
                              pointHoverBackgroundColor: '#fff',
                              pointHoverBorderColor: 'rgba(108, 117, 125, 1)'
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  const label = context.dataset.label || '';
                                  const value = context.parsed.r;
                                  return `${label}: ${value}`;
                                }
                              }
                            }
                          },
                          scales: {
                            r: {
                              beginAtZero: true,
                              max: 20,
                              ticks: {
                                stepSize: 5
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Category Performance Table */}
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Category Performance Comparison</div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #dee2e6' }}>Category</th>
                            <th style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #dee2e6' }}>{selectedSectorForAnalysis}</th>
                            <th style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #dee2e6' }}>Sector Average</th>
                            <th style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #dee2e6' }}>Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectorCategoryComparison.categories.map((cat: string) => {
                            const targetValue = sectorCategoryComparison.targetSector.categoryAverages[cat];
                            const avgValue = sectorCategoryComparison.otherSectors.reduce((sum: number, sector: any) => 
                              sum + sector.categoryAverages[cat], 0
                            ) / sectorCategoryComparison.otherSectors.length;
                            const performance = targetValue > avgValue ? 'Above Average' : 
                                             targetValue < avgValue ? 'Below Average' : 'Average';
                            const performanceColor = targetValue > avgValue ? '#28a745' : 
                                                   targetValue < avgValue ? '#dc3545' : '#6c757d';
                            
                            return (
                              <tr key={cat}>
                                <td style={{ padding: 8, borderBottom: '1px solid #dee2e6' }}>
                                  {sectorCategoryComparison.categoryLabels[cat]}
                                </td>
                                <td style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #dee2e6', fontWeight: 600 }}>
                                  {targetValue}
                                </td>
                                <td style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #dee2e6' }}>
                                  {Math.round(avgValue * 10) / 10}
                                </td>
                                <td style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #dee2e6', color: performanceColor, fontWeight: 600 }}>
                                  {performance}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Sector-Specific Insights & Recommendations */}
              {sectorOverview && sectorCategoryComparison && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 18 }}>💡 Sector Insights & Recommendations</div>
                  
                  {/* Sector Strengths */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#28a745' }}>🎯 Sector Strengths</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {sectorCategoryComparison.categories.map((cat: string) => {
                        const targetValue = sectorCategoryComparison.targetSector.categoryAverages[cat];
                        const avgValue = sectorCategoryComparison.otherSectors.reduce((sum: number, sector: any) => 
                          sum + sector.categoryAverages[cat], 0
                        ) / sectorCategoryComparison.otherSectors.length;
                        
                        if (targetValue > avgValue + 1) { // Significantly above average
                          return (
                            <div key={cat} style={{ 
                              padding: '6px 12px', 
                              backgroundColor: '#d4edda', 
                              color: '#155724',
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: 600,
                              border: '1px solid #c3e6cb'
                            }}>
                              {sectorCategoryComparison.categoryLabels[cat]} (+{Math.round((targetValue - avgValue) * 10) / 10})
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  {/* Sector Challenges */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#dc3545' }}>⚠️ Areas for Improvement</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {sectorCategoryComparison.categories.map((cat: string) => {
                        const targetValue = sectorCategoryComparison.targetSector.categoryAverages[cat];
                        const avgValue = sectorCategoryComparison.otherSectors.reduce((sum: number, sector: any) => 
                          sum + sector.categoryAverages[cat], 0
                        ) / sectorCategoryComparison.otherSectors.length;
                        
                        if (targetValue < avgValue - 1) { // Significantly below average
                          return (
                            <div key={cat} style={{ 
                              padding: '6px 12px', 
                              backgroundColor: '#f8d7da', 
                              color: '#721c24',
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: 600,
                              border: '1px solid #f5c6cb'
                            }}>
                              {sectorCategoryComparison.categoryLabels[cat]} ({Math.round((targetValue - avgValue) * 10) / 10})
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  {/* Sector-Wide Quick Wins */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#17a2b8' }}>⚡ Sector-Wide Quick Wins</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                      {sectorOverview.participationRate < 80 && (
                        <div style={{ padding: 12, backgroundColor: '#e7f3ff', borderRadius: 8, border: '1px solid #b3d9ff' }}>
                          <div style={{ fontWeight: 600, marginBottom: 4, color: '#004085' }}>📈 Increase Participation</div>
                          <div style={{ fontSize: 12, color: '#004085' }}>
                            Only {sectorOverview.participationRate}% of stakeholders have complete assessments. 
                            Focus on engaging the remaining {sectorOverview.totalStakeholders - sectorOverview.completionStats.complete} stakeholders.
                          </div>
                        </div>
                      )}
                      
                      {sectorOverview.maturityDistribution.Absent > sectorOverview.maturityDistribution.Expert + sectorOverview.maturityDistribution.Advanced && (
                        <div style={{ padding: 12, backgroundColor: '#fff3cd', borderRadius: 8, border: '1px solid #ffeaa7' }}>
                          <div style={{ fontWeight: 600, marginBottom: 4, color: '#856404' }}>🎓 Digital Skills Training</div>
                          <div style={{ fontSize: 12, color: '#856404' }}>
                            {sectorOverview.maturityDistribution.Absent} stakeholders are at Absent level. 
                            Prioritize basic digital skills training programs.
                          </div>
                        </div>
                      )}

                      {sectorOverview.avgCombined < 50 && (
                        <div style={{ padding: 12, backgroundColor: '#f8d7da', borderRadius: 8, border: '1px solid #f5c6cb' }}>
                          <div style={{ fontWeight: 600, marginBottom: 4, color: '#721c24' }}>🚀 Sector Development Program</div>
                          <div style={{ fontSize: 12, color: '#721c24' }}>
                            Sector average of {sectorOverview.avgCombined} indicates need for comprehensive 
                            digital transformation program.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Strategic Recommendations */}
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#6f42c1' }}>🎯 Strategic Recommendations</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                      <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Peer Learning Network</div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          Connect {sectorLeaders?.leaders?.length || 0} sector champions with emerging stakeholders 
                          for mentorship and knowledge sharing.
                        </div>
                      </div>
                      
                      <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Sector Collaboration</div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          Identify complementary sectors for cross-sector learning and 
                          collaborative digital initiatives.
                        </div>
                      </div>

                      <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Resource Allocation</div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          Focus development resources on {sectorOverview.totalStakeholders} stakeholders 
                          with highest potential impact.
                        </div>
                      </div>
                    </div>
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
          <div className="banner">
            <div style={{ fontSize: 20, fontWeight: 700 }}>Creative Industries</div>
            <div className="muted">Explore individual creative industry participants and their digital readiness. Select a participant to view their detailed assessment and personalized improvement plan.</div>
          </div>
          
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

              {/* Survey / Internal Assessment Section */}
              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 18 }}>📋 Survey / Internal Assessment</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
                  Complete short survey → <a href="#" style={{ color: '#1565c0', textDecoration: 'none' }}>Take Survey</a>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { key: 'digitalComfort', title: 'Digital Comfort & Skills', max: 8, emoji: '🧠', description: 'Team capability to manage and use digital tools effectively.' },
                    { key: 'contentStrategy', title: 'Content Strategy', max: 8, emoji: '📝', description: 'Planned content approach aligned to audience and goals.' },
                    { key: 'platformBreadth', title: 'Platform Usage Breadth', max: 7, emoji: '📱', description: 'Breadth of channels used and maintained consistently.' },
                    { key: 'investmentCapacity', title: 'Investment Capacity', max: 4, emoji: '💰', description: 'Resources to invest in content, ads, and tooling.' },
                    { key: 'challengeSeverity', title: 'Challenge Severity', max: 3, emoji: '⚠️', description: 'Extent of operational or market barriers faced.' }
                  ].map((item) => (
                    <div key={item.key} style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: 12, 
                      borderRadius: 8, 
                      border: '1px solid #e7e7e9',
                      opacity: 0.6
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 16, marginRight: 8 }}>{item.emoji}</span>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                        <strong>n/a</strong> / {item.max}
                      </div>
                      <div style={{ fontSize: 11, color: '#888', lineHeight: 1.3 }}>
                        {item.description}
                      </div>
                    </div>
                  ))}
                </div>
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
              
              <div style={{ gridColumn: '1 / span 2', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>Next Steps</div>
              </div>

              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Opportunities</div>
                {loadingOpportunities ? (
                  <div className="muted">Loading opportunities…</div>
                ) : (
                  <>
                    {/* Custom Opportunities from Google Sheet */}
                    {customOpportunities?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, marginBottom: 12, color: '#1565c0' }}>🎯 Custom Opportunities</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                          {customOpportunities.map((opp, i) => (
                            <div key={i} style={{
                              padding: 16,
                              backgroundColor: '#f8f9fa',
                              borderRadius: 8,
                              border: '1px solid #e9ecef',
                              borderLeft: '4px solid #1565c0'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontSize: 20, marginRight: 8 }}>{opp.emoji}</span>
                                <div style={{ fontWeight: 600, color: '#1565c0' }}>{opp.category}</div>
                              </div>
                              <div style={{ color: '#333', lineHeight: 1.5, fontSize: 14 }}>
                                {opp.advice}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}


                    {!customOpportunities?.length && '—'}
                  </>
                )}
              </div>


              

              <div style={{ gridColumn: '1 / span 2', height: 1, backgroundColor: '#e7e7e9', margin: '16px 0' }}></div>

            </div>
            )
          )}
        </div>
      )}

      {active === 'tour' && (
        <div>
          <div className="banner">
            <div style={{ fontSize: 20, fontWeight: 700 }}>Tour Operators</div>
            <div className="muted">Analyze tour operator digital readiness and performance. Select a tour operator to view their assessment results and tailored recommendations for digital growth.</div>
          </div>
          
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
              <div style={{ gridColumn: '1 / span 2', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>Next Steps</div>
              </div>
              
              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Opportunities</div>
                {loadingOpportunities ? (
                  <div className="muted">Loading opportunities…</div>
                ) : (
                  <>
                    {/* Custom Opportunities from Google Sheet */}
                    {customOpportunities?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, marginBottom: 12, color: '#1565c0' }}>🎯 Custom Opportunities</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                          {customOpportunities.map((opp, i) => (
                            <div key={i} style={{
                              padding: 16,
                              backgroundColor: '#f8f9fa',
                              borderRadius: 8,
                              border: '1px solid #e9ecef',
                              borderLeft: '4px solid #1565c0'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontSize: 20, marginRight: 8 }}>{opp.emoji}</span>
                                <div style={{ fontWeight: 600, color: '#1565c0' }}>{opp.category}</div>
                              </div>
                              <div style={{ color: '#333', lineHeight: 1.5, fontSize: 14 }}>
                                {opp.advice}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}


                    {!customOpportunities?.length && '—'}
                  </>
                )}
              </div>

              {/* Survey / Internal Assessment Section */}
              <div className="card" style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 18 }}>📋 Survey / Internal Assessment</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
                  Complete short survey → <a href="#" style={{ color: '#1565c0', textDecoration: 'none' }}>Take Survey</a>
              </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { key: 'digitalComfort', title: 'Digital Comfort & Skills', max: 8, emoji: '🧠', description: 'Team capability to manage and use digital tools effectively.' },
                    { key: 'contentStrategy', title: 'Content Strategy', max: 8, emoji: '📝', description: 'Planned content approach aligned to audience and goals.' },
                    { key: 'platformBreadth', title: 'Platform Usage Breadth', max: 7, emoji: '📱', description: 'Breadth of channels used and maintained consistently.' },
                    { key: 'investmentCapacity', title: 'Investment Capacity', max: 4, emoji: '💰', description: 'Resources to invest in content, ads, and tooling.' },
                    { key: 'challengeSeverity', title: 'Challenge Severity', max: 3, emoji: '⚠️', description: 'Extent of operational or market barriers faced.' }
                  ].map((item) => (
                    <div key={item.key} style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: 12, 
                      borderRadius: 8, 
                      border: '1px solid #e7e7e9',
                      opacity: 0.6
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 16, marginRight: 8 }}>{item.emoji}</span>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                    </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                        <strong>n/a</strong> / {item.max}
                  </div>
                      <div style={{ fontSize: 11, color: '#888', lineHeight: 1.3 }}>
                        {item.description}
                      </div>
                    </div>
                  ))}
                </div>
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

            </div>
            )
          )}
        </div>
      )}

      {active === 'methodology' && (
        <div>
          <div className="banner">
            <div style={{ fontSize: 20, fontWeight: 700 }}>Methodology</div>
            <div className="muted">Evidence-based process for sector-ready guidance</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#1565c0' }}>1) Data Collection</div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.4' }}>
                Our assessment combines two data sources to create a comprehensive digital readiness picture:
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, textAlign: 'left', fontSize: '14px', lineHeight: '1.4' }}>
                <li><strong>External Assessment (70% weight)</strong>: Publicly observable digital presence including websites, social media, online listings, and digital marketing</li>
                <li><strong>Survey Data (30% weight)</strong>: Self-reported internal capabilities, processes, and digital strategy insights</li>
                <li>Data is collected across validated sectors and regions with live-linked calculations</li>
              </ul>
            </div>
            
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#1565c0' }}>2) Assessment Categories</div>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.4' }}>
                Each organization is scored across six digital categories. Here's what each category measures:
              </p>
              <div className="grid-2-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e7e7e9' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: '#1565c0' }}>📱 Social Media Presence (18 pts)</div>
                  <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                    How active and engaging you are on social media platforms. 
                    <em> Example: Regular posts, responding to comments, using relevant hashtags.</em>
            </div>
                </div>
                <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e7e7e9' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: '#1565c0' }}>🌐 Website Quality (12 pts)</div>
                  <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                    How good your website looks and works for visitors.
                    <em> Example: Professional design, clear navigation, fast loading, mobile-friendly.</em>
                  </div>
                </div>
                <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e7e7e9' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: '#1565c0' }}>📸 Visual Content (15 pts)</div>
                  <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                    Quality and consistency of your photos, videos, and graphics.
                    <em> Example: High-quality images, consistent branding, professional photography.</em>
                  </div>
                </div>
                <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e7e7e9' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: '#1565c0' }}>🔍 Online Discoverability (12 pts)</div>
                  <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                    How easy it is for people to find you online.
                    <em> Example: Google My Business listing, TripAdvisor presence, directory listings.</em>
                  </div>
                </div>
                <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e7e7e9' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: '#1565c0' }}>💳 Digital Sales/Booking (8 pts)</div>
                  <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                    How well you handle online bookings and payments.
                    <em> Example: Online booking forms, payment processing, automated confirmations.</em>
                  </div>
                </div>
                <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e7e7e9' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: '#1565c0' }}>🔗 Platform Integration (5 pts)</div>
                  <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                    How well your different online tools work together.
                    <em> Example: CRM integration, automated social posting, booking system sync.</em>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#1565c0' }}>Internal Assessment Categories</div>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.4' }}>
              The survey component evaluates internal capabilities and processes (30% of total score):
            </p>
            <div className="grid-3-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e7e7e9' }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#7b1fa2' }}>🧠 Digital Comfort & Skills (8 pts)</div>
                <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                  How comfortable your team is with digital tools and technology.
                  <em> Example: Staff who can manage social media, use booking systems, or update websites.</em>
                </div>
              </div>
              <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e7e7e9' }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#7b1fa2' }}>📝 Content Strategy (8 pts)</div>
                <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                  Having a clear plan for what content to create and who it's for.
                  <em> Example: Knowing your target audience, planning posts ahead, having brand guidelines.</em>
                </div>
              </div>
              <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e7e7e9' }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#7b1fa2' }}>📱 Platform Usage Breadth (7 pts)</div>
                <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                  How many different online platforms you actively use and maintain.
                  <em> Example: Being active on Facebook, Instagram, and your website regularly.</em>
                </div>
              </div>
              <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e7e7e9' }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#7b1fa2' }}>💰 Investment Capacity (4 pts)</div>
                <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                  Willingness to spend on training, materials, and business improvements.
                  <em> Example: Budget for staff training, professional photos, or better equipment.</em>
                </div>
              </div>
              <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e7e7e9' }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#7b1fa2' }}>⚠️ Challenge Severity (3 pts)</div>
                <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                  How much your business is held back by practical challenges.
                  <em> Example: Poor internet connection, limited budget, or lack of technical support.</em>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#1565c0' }}>3) Digital Maturity Levels</div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.4' }}>
                Organizations are classified into five maturity levels based on their total score:
              </p>
              <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                <div style={{ marginBottom: 6, padding: '6px 8px', background: '#f3f4f6', borderRadius: '4px' }}>
                  <strong>Absent (0-20 points)</strong>: No digital presence or very basic online listing
            </div>
                <div style={{ marginBottom: 6, padding: '6px 8px', background: '#fef3c7', borderRadius: '4px' }}>
                  <strong>Emerging (21-40 points)</strong>: Basic website and social media, limited digital strategy
                </div>
                <div style={{ marginBottom: 6, padding: '6px 8px', background: '#dbeafe', borderRadius: '4px' }}>
                  <strong>Intermediate (41-60 points)</strong>: Good digital presence, some online sales, regular content
                </div>
                <div style={{ marginBottom: 6, padding: '6px 8px', background: '#d1fae5', borderRadius: '4px' }}>
                  <strong>Advanced (61-80 points)</strong>: Strong digital ecosystem, integrated platforms, data-driven
                </div>
                <div style={{ marginBottom: 6, padding: '6px 8px', background: '#e0e7ff', borderRadius: '4px' }}>
                  <strong>Expert (81+ points)</strong>: Leading digital innovation, full automation, market leadership
                </div>
              </div>
            </div>
            
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#1565c0' }}>4) Opportunity Generation</div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.4' }}>
                Based on assessment results, we generate targeted recommendations:
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, textAlign: 'left', fontSize: '14px', lineHeight: '1.4' }}>
                <li><strong>Step-up Targets</strong>: Specific actions to reach the next maturity level</li>
                <li><strong>Sector Guidance</strong>: Industry-specific digital strategies and best practices</li>
                <li><strong>Program Interventions</strong>: Training, funding, and support recommendations</li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#1565c0' }}>5) Impact & Readiness Framework</div>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.4' }}>
              Our methodology supports four key development outcomes:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#7b1fa2' }}>Competitiveness</div>
                <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                  Reach new markets, improve discoverability, convert visitors to customers
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#7b1fa2' }}>Inclusiveness</div>
                <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                  Support MSMEs, women-led businesses, and youth entrepreneurs
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#7b1fa2' }}>Sustainability</div>
                <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                  Data-driven decisions, efficient operations, local capacity building
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#7b1fa2' }}>Readiness</div>
                <div style={{ fontSize: '13px', lineHeight: '1.3', color: '#6b7280' }}>
                  Found online, tell compelling stories, enable transactions
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="card modal" style={{ maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Submit Feedback</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Type of Feedback</label>
              <select
                value={feedbackForm.type}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e7e7e9' }}
              >
                <option value="correction">Data Correction</option>
                <option value="suggestion">Improvement Suggestion</option>
                <option value="bug">Bug Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            {feedbackForm.type === 'correction' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Participant (if applicable)</label>
                <select
                  value={feedbackForm.participant || ''}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, participant: e.target.value })}
                  style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e7e7e9' }}
                >
                  <option value="">Select participant (optional)</option>
                  {allParticipants.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Sector (if applicable)</label>
              <select
                value={feedbackForm.sector || ''}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, sector: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e7e7e9' }}
              >
                <option value="">Select sector (optional)</option>
                {sectors.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Message</label>
              <textarea
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                placeholder="Please describe the issue or suggestion..."
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e7e7e9', minHeight: 100, resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Contact (optional)</label>
              <input
                type="email"
                value={feedbackForm.contact || ''}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, contact: e.target.value })}
                placeholder="your.email@example.com"
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e7e7e9' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowFeedbackModal(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e7e7e9', background: 'white', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSubmittingFeedback(true);
                  try {
                    const response = await fetch('/api/feedback', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(feedbackForm)
                    });
                    if (response.ok) {
                      alert('Thank you for your feedback!');
                      setShowFeedbackModal(false);
                      setFeedbackForm({ type: 'correction', message: '' });
                    } else {
                      alert('Error submitting feedback. Please try again.');
                    }
                  } catch (error) {
                    alert('Error submitting feedback. Please try again.');
                  }
                  setSubmittingFeedback(false);
                }}
                disabled={!feedbackForm.message || submittingFeedback}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: submittingFeedback ? '#ccc' : 'var(--primary)',
                  color: 'white',
                  cursor: submittingFeedback ? 'not-allowed' : 'pointer'
                }}
              >
                {submittingFeedback ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Participant Modal */}
      {showAddParticipantModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="card modal" style={{ maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Add New Participant</h3>
              <button
                onClick={() => setShowAddParticipantModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Participant Name *</label>
              <input
                type="text"
                value={participantForm.name}
                onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value })}
                placeholder="Enter participant name"
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e7e7e9' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Sector *</label>
              <select
                value={participantForm.sector}
                onChange={(e) => setParticipantForm({ ...participantForm, sector: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e7e7e9' }}
              >
                <option value="">Select sector</option>
                {sectors.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Contact Information</label>
              <input
                type="text"
                value={participantForm.contact}
                onChange={(e) => setParticipantForm({ ...participantForm, contact: e.target.value })}
                placeholder="Email, phone, or website"
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e7e7e9' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Additional Notes</label>
              <textarea
                value={participantForm.notes}
                onChange={(e) => setParticipantForm({ ...participantForm, notes: e.target.value })}
                placeholder="Any additional information about this participant..."
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e7e7e9', minHeight: 80, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddParticipantModal(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e7e7e9', background: 'white', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSubmittingParticipant(true);
                  try {
                    const response = await fetch('/api/participants', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(participantForm)
                    });
                    if (response.ok) {
                      alert('Participant added successfully!');
                      setShowAddParticipantModal(false);
                      setParticipantForm({ name: '', sector: '', contact: '', notes: '' });
                      // Refresh the participants list
                      fetchParticipants().then(setAllParticipants).catch(() => {});
                    } else {
                      alert('Error adding participant. Please try again.');
                    }
                  } catch (error) {
                    alert('Error adding participant. Please try again.');
                  }
                  setSubmittingParticipant(false);
                }}
                disabled={!participantForm.name || !participantForm.sector || submittingParticipant}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: submittingParticipant ? '#ccc' : 'var(--primary)',
                  color: 'white',
                  cursor: submittingParticipant ? 'not-allowed' : 'pointer'
                }}
              >
                {submittingParticipant ? 'Adding...' : 'Add Participant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
