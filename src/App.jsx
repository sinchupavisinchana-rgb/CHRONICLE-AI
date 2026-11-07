
import { useEffect, useRef, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUpRight, Bell, BrainCircuit,
  Boxes, CalendarClock, CheckCircle2, ChevronDown, Clock3,
  Command, Cpu, Database, Eye, FileSearch, FileText,
  GitBranch, LayoutDashboard, Network, Plus, Radio,
  Search, Settings, ShieldCheck, Sparkles, Upload, Zap
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import "./App.css";

const chartData = [
  { time: "00:00", events: 12, confidence: 75 },
  { time: "04:00", events: 19, confidence: 81 },
  { time: "08:00", events: 15, confidence: 78 },
  { time: "12:00", events: 32, confidence: 88 },
  { time: "16:00", events: 25, confidence: 84 },
  { time: "20:00", events: 41, confidence: 93 },
  { time: "24:00", events: 35, confidence: 89 },
];

const navigation = [
  { section: "WORKSPACE", items: [
    { name: "Command Center", icon: LayoutDashboard },
    { name: "Timeline Studio", icon: CalendarClock },
    { name: "Evidence Explorer", icon: FileSearch },
    { name: "Event Universe", icon: Boxes },
  ]},
  { section: "INTELLIGENCE", items: [
    { name: "Temporal Lab", icon: GitBranch },
    { name: "Conflict Radar", icon: AlertTriangle },
    { name: "AI Intelligence", icon: BrainCircuit },
    { name: "Research Lab", icon: Network },
  ]},
  { section: "SYSTEM", items: [
    { name: "Reports", icon: FileText },
    { name: "Settings", icon: Settings },
  ]}
];

function App() {
  const [active, setActive] = useState("Command Center");
  const [backend, setBackend] = useState("checking");
  const [clock, setClock] = useState(new Date());
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function checkBackend() {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/health");
        if (!response.ok) throw new Error("Backend unavailable");
        if (mounted) setBackend("online");
      } catch {
        if (mounted) setBackend("offline");
      }
    }

    checkBackend();
    const timer = setInterval(checkBackend, 10000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  async function loadDocuments() {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/documents");
      if (!response.ok) throw new Error("Unable to load documents");
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch {
      setUploadMessage("Unable to load documents. Check the backend connection.");
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = [".pdf", ".docx", ".txt"];
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowed.includes(extension)) {
      setUploadMessage("Unsupported file. Please select PDF, DOCX or TXT.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setUploadMessage("Uploading document and extracting text...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/documents/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Document upload failed");
      }

      setUploadMessage(
        `Successfully uploaded ${data.document.filename}. Extracted ${data.document.character_count} characters.`
      );

      await loadDocuments();
    } catch (error) {
      setUploadMessage(`Upload error: ${error.message}`);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const formattedTime = clock.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-symbol"><Command size={23} /></div>
          <div>
            <div className="brand-name">CHRONICLE<span> AI</span></div>
            <div className="brand-caption">TEMPORAL INTELLIGENCE</div>
          </div>
        </div>

        <div className="workspace-select">
          <div className="workspace-icon"><BrainCircuit size={18}/></div>
          <div className="workspace-copy">
            <small>ACTIVE WORKSPACE</small>
            <strong>Research Division</strong>
          </div>
          <ChevronDown size={15}/>
        </div>

        <nav className="navigation">
          {navigation.map(group => (
            <div className="nav-group" key={group.section}>
              <div className="nav-heading">{group.section}</div>
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    className={`nav-link ${active === item.name ? "selected" : ""}`}
                    onClick={() => setActive(item.name)}
                  >
                    <Icon size={17}/>
                    <span>{item.name}</span>
                    {item.name === "Conflict Radar" && <i className="nav-alert"/>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="engine-card">
            <div className="engine-top">
              <span className="engine-dot"/>
              TERRA ENGINE
              <span className="engine-version">V1.0</span>
            </div>
            <strong>Intelligence core</strong>
            <div className="engine-meter"><span/></div>
            <small>Foundation environment</small>
          </div>
          <div className="profile">
            <div className="profile-avatar">C</div>
            <div className="profile-info">
              <strong>Chronicle Researcher</strong>
              <small>Administrator</small>
            </div>
            <Settings size={17}/>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          hidden
          onChange={handleFileUpload}
        />

        <header className="topbar">
          <div className="breadcrumb">
            <span>CHRONICLE</span>
            <span className="crumb-slash">/</span>
            <strong>{active.toUpperCase()}</strong>
          </div>

          <div className="topbar-right">
            <div className="system-clock"><Clock3 size={15}/>{formattedTime}</div>
            <div className={`connection ${backend}`}>
              <span className="connection-dot"/>
              API {backend.toUpperCase()}
            </div>
            <button className="icon-button"><Bell size={18}/></button>
            <div className="top-avatar">CR</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span/> TEMPORAL INTELLIGENCE PLATFORM</div>
              <h1>{active === "Command Center" ? <>Command <span>Center.</span></> : <>{active}<span>.</span></>}</h1>
              <p>Reconstruct events. Connect evidence. Discover the hidden sequence.</p>
            </div>

            <div className="welcome-actions">
              <button
                className="secondary-button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16}/>
                {uploading ? "Uploading..." : "Ingest Evidence"}
              </button>

              <button
                className="primary-button"
                onClick={() => setActive("Timeline Studio")}
              >
                <Plus size={17}/> New Reconstruction
              </button>
            </div>
          </section>

          {uploadMessage && (
            <div className="upload-notice">
              <Database size={18}/>
              <div>
                <strong>Document ingestion status</strong>
                <p>{uploadMessage}</p>
              </div>
              <button onClick={() => setUploadMessage("")}>Close</button>
            </div>
          )}

          <section className="system-strip">
            <div className="strip-left"><Radio size={16}/><span>CORE SYSTEM STATUS</span></div>
            <div className="strip-item"><i className="live-dot"/> API {backend.toUpperCase()}</div>
            <div className="strip-item"><i className="live-dot"/> DASHBOARD ACTIVE</div>
            <div className="strip-right">LOCAL NODE <strong>CHR-001</strong></div>
          </section>

          <section className="metrics-grid">
            <Metric icon={FileText} label="DOCUMENTS" value={documents.length} note="Uploaded documents" color="green"/>
            <Metric icon={GitBranch} label="EXTRACTED EVENTS" value="0" note="AI extraction pending" color="cyan"/>
            <Metric icon={AlertTriangle} label="DETECTED CONFLICTS" value="0" note="Analysis pending" color="orange"/>
            <Metric icon={ShieldCheck} label="RECONSTRUCTION" value="READY" note="Engine foundation" color="purple"/>
          </section>

          <section className="dashboard-grid">
            <div className="panel chart-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-kicker">ANALYTICS OVERVIEW</div>
                  <h2>Intelligence activity</h2>
                  <p>Illustrative dashboard data · Not live model results</p>
                </div>
                <span className="period-button">24 HOURS <ChevronDown size={14}/></span>
              </div>

              <div className="chart-legend">
                <span><i className="legend-green"/> Event activity</span>
                <span><i className="legend-cyan"/> Confidence trend</span>
              </div>

              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a3ff57" stopOpacity={0.24}/>
                        <stop offset="100%" stopColor="#a3ff57" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#202a30" strokeDasharray="3 5" vertical={false}/>
                    <XAxis dataKey="time" stroke="#65747b" tickLine={false} axisLine={false}/>
                    <YAxis stroke="#65747b" tickLine={false} axisLine={false}/>
                    <Tooltip contentStyle={{background:"#10191c", border:"1px solid #34444a", borderRadius:10}}/>
                    <Area type="monotone" dataKey="events" stroke="#a3ff57" strokeWidth={2} fill="url(#greenFill)"/>
                    <Area type="monotone" dataKey="confidence" stroke="#36e5ed" strokeWidth={2} fill="transparent"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-footer">
                <span>Activity visualization preview</span>
                <span><Activity size={14}/> Sample dataset</span>
              </div>
            </div>

            <div className="panel engine-panel">
              <div className="panel-kicker">AI REASONING CORE</div>
              <h2>TERRA engine</h2>

              <div className="orbital-visual">
                <div className="orbit orbit-one"/>
                <div className="orbit orbit-two"/>
                <div className="orbit orbit-three"/>
                <div className="core-glow"/>
                <div className="core-icon"><BrainCircuit size={39}/></div>
                <div className="orbit-point point-one"/>
                <div className="orbit-point point-two"/>
                <div className="orbit-point point-three"/>
              </div>

              <div className="engine-description">
                <Sparkles size={15}/>
                <span>Temporal Evidence Reconstruction & Relationship Analysis</span>
              </div>

              <div className="engine-stats">
                <div><small>ENGINE</small><strong>FOUNDATION</strong></div>
                <div><small>MODE</small><strong>INITIALIZING</strong></div>
              </div>

              <button className="engine-button" onClick={() => setActive("AI Intelligence")}>
                Explore AI Intelligence <ArrowUpRight size={15}/>
              </button>
            </div>
          </section>

          <section className="bottom-grid">
            <div className="panel activity-panel">
              <div className="panel-header compact">
                <div><div className="panel-kicker">EVIDENCE LIBRARY</div><h2>Uploaded documents</h2></div>
                <span className="event-status">{documents.length} FILES</span>
              </div>

              {documents.length === 0 ? (
                <div className="empty-state">
                  <FileSearch size={25}/>
                  <strong>No documents uploaded yet</strong>
                  <p>Use Ingest Evidence to add your first document.</p>
                </div>
              ) : (
                documents.map(document => (
                  <div className="activity-row" key={document.document_id}>
                    <div className="activity-icon"><FileText size={16}/></div>
                    <div className="activity-copy">
                      <strong>{document.filename}</strong>
                      <small>{document.format} · {document.character_count} characters</small>
                    </div>
                    <span className="event-status">INGESTED</span>
                  </div>
                ))
              )}
            </div>

            <div className="panel architecture-panel">
              <div className="panel-kicker">SYSTEM ARCHITECTURE</div>
              <h2>Intelligence pipeline</h2>
              <div className="pipeline">
                <Pipeline icon={FileText} title="Evidence input" detail="Documents & records"/>
                <div className="pipeline-line"/>
                <Pipeline icon={BrainCircuit} title="AI extraction" detail="Events & entities"/>
                <div className="pipeline-line"/>
                <Pipeline icon={Network} title="Temporal graph" detail="Relations & constraints"/>
                <div className="pipeline-line"/>
                <Pipeline icon={ShieldCheck} title="TERRA reasoning" detail="Timeline reconstruction"/>
              </div>
            </div>
          </section>

          <footer className="footer">
            <span>CHRONICLE AI <b>●</b> TEMPORAL INTELLIGENCE</span>
            <span>FOUNDATION BUILD · V1.1.0</span>
            <span><Cpu size={13}/> RESEARCH ENVIRONMENT</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function Metric({icon: Icon, label, value, note, color}) {
  return (
    <div className={`metric-card metric-${color}`}>
      <div className="metric-top">
        <div className="metric-icon"><Icon size={19}/></div>
        <span className="metric-label">{label}</span>
        <ArrowUpRight size={15} className="metric-arrow"/>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-note"><span/> {note}</div>
    </div>
  );
}

function Pipeline({icon: Icon, title, detail}) {
  return (
    <div className="pipeline-step">
      <div className="pipeline-icon"><Icon size={17}/></div>
      <div className="pipeline-copy">
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
      <span>PLANNED</span>
    </div>
  );
}

export default App;
