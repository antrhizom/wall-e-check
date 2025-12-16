import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// ============================================================================
// DATENSTRUKTUR - Arbeiten und Kompetenzen aus dem Sammelrapport
// ============================================================================

const ARBEITSKATEGORIEN = {
  abbruch: { name: "Abbrucharbeiten", icon: "🔨", arbeiten: ["Schutzmassnahmen einrichten", "Abbruch- oder Demontagearbeiten fachgerecht ausführen"] },
  schalungen: { name: "Schalungen", icon: "📐", arbeiten: ["Einzelfundamentschalung", "Streifenfundamentschalung", "Bodenplattenabschalung", "Wandschalung doppelhäuptig konventionell erstellen", "Wandschalung doppelhäuptig mit Grossflächenschalung erstellen", "Wandschalung einhäuptig erstellen", "Sichtschalung erstellen", "Pfeilerschalung erstellen", "Brüstungsschalung erstellen", "Türe / Fenster schalen", "Wandabschalung erstellen", "Betoniergerüst erstellen", "Aussparungschalung erstellen", "Deckenschalung konventionell erstellen", "Deckenschalung mit Paneelen erstellen", "Deckentischschalung erstellen", "Deckenrandabschalung erstellen", "Unterzugsschalung erstellen", "Verlorene Schalung erstellen", "Treppenschalung erstellen", "Rundschalung erstellen"] },
  bewehrungen: { name: "Bewehrungen", icon: "🔗", arbeiten: ["Fundamentbewehrung erstellen", "Fundamentplatte Bewehrung erstellen", "Wand-/Brüstung Bewehrung erstellen", "Stützenbewehrung erstellen", "Deckenbewehrung erstellen", "Bewehrungsanschlüsse verlegen (Comax)", "Kragplattenanschlüsse verlegen", "Durchstanzbewehrung verlegen"] },
  betonbau: { name: "Betonbau", icon: "🧱", arbeiten: ["Sauberkeitsschicht einbringen", "Sohlenbeton einbringen", "Füll- und Hüllbeton einbringen", "Arbeitsvorbereitung Wände betonieren", "Arbeitsvorbereitung Decke betonieren", "Fundament betonieren", "Brüstungen / Wände betonieren", "Decken betonieren", "Beton Nachbehandlung ausführen", "Beton abtaloschieren", "Beton monolitisch abtaloschieren", "Mauerkrone abtaloschieren", "Betonsanierung ausführen", "Betonkosmetik ausführen"] },
  mauerwerk: { name: "Mauerwerk", icon: "🏗️", arbeiten: ["Arbeitsvorbereitung Rohmauerwerk", "Rohmauerwerk anzeichnen/einmessen", "Rohmauerwerk erstellen", "Arbeitsvorbereitung Sichtmauerwerk", "Sichtmauerwerk anzeichnen/einmessen", "Sichtmauerwerk erstellen", "Ergänzungsbauteile versetzen (Stürze/Heizungselemente)", "Meterriss erstellen", "Bockgerüst erstellen"] },
  versetzarbeiten: { name: "Versetzarbeiten", icon: "🏢", arbeiten: ["Betonelemente versetzen", "Kleinteile versetzen (Kästen, Zargen, Wannenschürzen)"] },
  beschichtungen: { name: "Beschichtungen", icon: "🎨", arbeiten: ["Instandsetzungsarbeiten (Betonsanierung)", "Oberflächenschutz", "Abdichtungen"] },
  verputz: { name: "Verputz", icon: "🪣", arbeiten: ["Quarzbrücke aufziehen", "Anwurf", "Grundputz", "Deckputz"] },
  unterlagsboeden: { name: "Unterlagsböden", icon: "📏", arbeiten: ["Unterlagsboden ausführen", "Zementüberzug ausführen", "Fliessestrich (Anhydrit)"] },
  kanalisation: { name: "Kanalisation", icon: "🔧", arbeiten: ["Grabenaushub erstellen", "Grabenspriessung erstellen", "Leitungen vermessen und abstecken", "Kanalisationsleitung verlegen", "Sickerleitung verlegen", "Werkleitungen verlegen", "Kontrollschächte versetzen", "Leitungen einbetonieren", "Leitungsgraben auffüllen"] },
  aushub: { name: "Aushub/Hinterfüllung", icon: "⛏️", arbeiten: ["Aushubarbeiten ausführen", "Böschungssicherungen erstellen", "Bauteil hinterfüllen und verdichten", "Schüttungsarbeiten ausführen"] },
  wasserhaltung: { name: "Wasserhaltung", icon: "💧", arbeiten: ["Offene Wasserhaltung erstellen", "Neutralisation (pH-Wert)"] },
  abdichtungen: { name: "Abdichtungen/Dämmungen", icon: "🛡️", arbeiten: ["Arbeitsfugen Abdichtung erstellen", "Abdichtungsfolie befestigen", "Dämmung verlegen", "Schwarzanstrich / Filterplatten"] },
  gerueste: { name: "Gerüste/Absturzsicherung", icon: "🪜", arbeiten: ["Seitenschutz ausführen", "Baustellenzugänge erstellen", "Bodenöffnungen sichern", "Arbeitsgerüst erstellen"] },
  vermessung: { name: "Vermessung", icon: "📍", arbeiten: ["Einmessarbeiten ausführen", "Planlesen / BIM", "Tachymeter bedienen", "Meterrisse erstellen", "Höhenkoten aufnehmen", "Absteckung erstellen", "Pythagoras anwenden"] },
  allgemein: { name: "Allgemein", icon: "🔩", arbeiten: ["Baustelleninstallation", "MMK-Mehrmuldenkonzept", "Handhabung Kleingeräte", "Kompressor bedienen", "Materialdienst", "Aufräumarbeiten"] },
  rapportwesen: { name: "Rapportwesen", icon: "📝", arbeiten: ["Stundenerfassung führen", "Tagesrapporte erstellen", "Regierapporte führen", "Ausmass unterstützen"] }
};

const KOMPETENZEN = [
  { id: "sicherheit", name: "Arbeitssicherheit", icon: "🦺" },
  { id: "qualitaet", name: "Qualitätsbewusstsein", icon: "✨" },
  { id: "selbstaendigkeit", name: "Selbständigkeit", icon: "🎯" },
  { id: "teamarbeit", name: "Teamarbeit", icon: "🤝" },
  { id: "kommunikation", name: "Kommunikation", icon: "💬" },
  { id: "planlesen", name: "Planlesen", icon: "📋" },
  { id: "werkzeug", name: "Werkzeugkunde", icon: "🔧" },
  { id: "material", name: "Materialkunde", icon: "🧱" },
  { id: "zeitmanagement", name: "Zeitmanagement", icon: "⏱️" },
  { id: "problemloesung", name: "Problemlösung", icon: "💡" }
];

// ============================================================================
// UTILITY FUNKTIONEN
// ============================================================================

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const formatDate = (date) => new Date(date).toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const formatDateShort = (date) => new Date(date).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatMonth = (date) => new Date(date).toLocaleDateString('de-CH', { month: 'long', year: 'numeric' });
const getMonthKey = (date) => { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };

// ============================================================================
// UI KOMPONENTEN
// ============================================================================

const RatingStars = ({ value, onChange, readOnly = false, size = 'normal' }) => {
  const [hover, setHover] = useState(0);
  const starSize = size === 'small' ? 'text-lg' : 'text-2xl';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={readOnly}
          className={`${starSize} transition-all duration-200 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          onMouseEnter={() => !readOnly && setHover(star)} onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(star)}>
          {star <= (hover || value) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
};

const ProgressBar = ({ value, max = 5, color = 'amber' }) => {
  const percentage = Math.min(100, (value / max) * 100);
  const colors = { amber: 'bg-amber-500', green: 'bg-emerald-500', blue: 'bg-blue-500' };
  return (
    <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
      <div className={`h-full ${colors[color]} transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

const Card = ({ children, className = '', onClick }) => (
  <div className={`bg-stone-800/50 backdrop-blur-sm border border-stone-700/50 rounded-2xl p-6 ${onClick ? 'cursor-pointer hover:border-amber-500/50 transition-all' : ''} ${className}`} onClick={onClick}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'normal', className = '', ...props }) => {
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold',
    secondary: 'bg-stone-700 hover:bg-stone-600 text-stone-100',
    ghost: 'bg-transparent hover:bg-stone-700/50 text-stone-300',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
  };
  const sizes = { small: 'px-3 py-1.5 text-sm', normal: 'px-5 py-2.5', large: 'px-8 py-4 text-lg' };
  return <button className={`rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

const Input = ({ label, ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-sm text-stone-400">{label}</label>}
    <input className="w-full bg-stone-800/50 border border-stone-600 rounded-xl px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none transition-colors" {...props} />
  </div>
);

const Select = ({ label, options, value, onChange }) => (
  <div className="space-y-2">
    {label && <label className="text-sm text-stone-400">{label}</label>}
    <select className="w-full bg-stone-800/50 border border-stone-600 rounded-xl px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none" value={value} onChange={onChange}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'normal' }) => {
  if (!isOpen) return null;
  const sizeClasses = { normal: 'max-w-lg', large: 'max-w-3xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-stone-800 border border-stone-700 rounded-2xl p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-stone-100">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-100 text-2xl">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// ============================================================================
// LOGIN SCREEN
// ============================================================================

const LoginScreen = ({ onLogin }) => {
  const [mode, setMode] = useState('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleAdminLogin = async () => {
    setError(''); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const snapshot = await getDocs(query(collection(db, 'admins'), where('email', '==', email.toLowerCase())));
      if (!snapshot.empty) onLogin({ type: 'admin', user: { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } });
      else setError('Admin-Account nicht gefunden');
    } catch { setError('Ungültige Anmeldedaten'); }
    finally { setLoading(false); }
  };
  
  const handleBerufsbildnerLogin = async () => {
    setError(''); setLoading(true);
    try {
      // Prüfe ob BB in Firestore existiert
      const snapshot = await getDocs(query(collection(db, 'berufsbildner'), where('email', '==', email.toLowerCase())));
      if (snapshot.empty) { 
        setError('Kein Berufsbildner/in-Account mit dieser E-Mail gefunden'); 
        setLoading(false); 
        return; 
      }
      
      // Firebase Auth Login
      await signInWithEmailAndPassword(auth, email, password);
      const bb = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      onLogin({ type: 'berufsbildner', user: bb });
    } catch (err) { 
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Falsches Passwort');
      } else if (err.code === 'auth/user-not-found') {
        setError('Account nicht gefunden. Bitte Admin kontaktieren.');
      } else {
        setError('Anmeldung fehlgeschlagen');
      }
    }
    finally { setLoading(false); }
  };
  
  const handleLernendLogin = async () => {
    setError(''); setLoading(true);
    try {
      const bbSnapshot = await getDocs(collection(db, 'berufsbildner'));
      let foundBB = null;
      bbSnapshot.forEach(doc => { const data = doc.data(); if (data.codes?.includes(code.toUpperCase())) foundBB = { id: doc.id, ...data }; });
      if (foundBB) {
        const lernSnapshot = await getDocs(query(collection(db, 'lernende'), where('code', '==', code.toUpperCase())));
        if (!lernSnapshot.empty) {
          onLogin({ type: 'lernend', user: { id: lernSnapshot.docs[0].id, ...lernSnapshot.docs[0].data() } });
        } else if (name.trim()) {
          const newLernender = { name: name.trim(), code: code.toUpperCase(), berufsbildnerId: foundBB.id, lehrjahr: 1, startDatum: new Date().toISOString().split('T')[0] };
          const docRef = await addDoc(collection(db, 'lernende'), newLernender);
          onLogin({ type: 'lernend', user: { id: docRef.id, ...newLernender } });
        } else setError('Bitte gib deinen Namen ein');
      } else setError('Ungültiger Code');
    } catch { setError('Verbindungsfehler.'); }
    finally { setLoading(false); }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>
      <Card className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏗️</div>
          <h1 className="text-3xl font-bold text-stone-100 mb-2">MauerwerkCheck</h1>
          <p className="text-stone-400">Lernplattform für die Grundbildung Maurer/in EFZ</p>
        </div>
        {mode === 'select' ? (
          <div className="space-y-4">
            <Button variant="primary" size="large" className="w-full" onClick={() => setMode('lernend')}>👷 Als Lernende/r einloggen</Button>
            <Button variant="secondary" size="large" className="w-full" onClick={() => setMode('berufsbildner')}>👨‍🏫 Als Berufsbildner/in einloggen</Button>
            <Button variant="ghost" className="w-full" onClick={() => setMode('admin')}>⚙️ Admin</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => { setMode('select'); setError(''); }} className="text-amber-500 hover:text-amber-400 flex items-center gap-2 mb-4">← Zurück</button>
            {mode === 'lernend' && (
              <>
                <Input label="Zugangscode von Berufsbildner/in" placeholder="z.B. ABC123" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
                <Input label="Dein Name (nur bei Erstanmeldung)" placeholder="Vor- und Nachname" value={name} onChange={(e) => setName(e.target.value)} />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button variant="primary" size="large" className="w-full" onClick={handleLernendLogin} disabled={loading}>{loading ? 'Laden...' : 'Einloggen'}</Button>
                <p className="text-stone-500 text-sm text-center">Du erhältst den Code von deiner/m Berufsbildner/in</p>
              </>
            )}
            {mode === 'berufsbildner' && (
              <>
                <Input label="E-Mail-Adresse" type="email" placeholder="name@firma.ch" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Passwort" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button variant="primary" size="large" className="w-full" onClick={handleBerufsbildnerLogin} disabled={loading || !email || !password}>{loading ? 'Laden...' : 'Einloggen'}</Button>
                <p className="text-stone-500 text-sm text-center">Passwort vom Admin erhalten</p>
              </>
            )}
            {mode === 'admin' && (
              <>
                <Input label="E-Mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Passwort" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button variant="primary" size="large" className="w-full" onClick={handleAdminLogin} disabled={loading}>{loading ? 'Laden...' : 'Einloggen'}</Button>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// ============================================================================
// LERNENDEN BEREICH
// ============================================================================

const LernendenNav = ({ currentView, onNavigate, onLogout, userName }) => (
  <nav className="bg-stone-800/80 backdrop-blur-md border-b border-stone-700 sticky top-0 z-40">
    <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-2xl">🏗️</span>
        <span className="font-semibold text-stone-100 hidden sm:block">MauerwerkCheck</span>
        <div className="flex gap-1">
          {[{ id: 'rapport', icon: '📝' }, { id: 'dashboard', icon: '📊' }, { id: 'verlauf', icon: '📅' }].map(item => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`px-3 py-2 rounded-lg transition-all ${currentView === item.id ? 'bg-amber-500/20 text-amber-400' : 'text-stone-400 hover:text-stone-100'}`}>
              {item.icon}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-stone-400 text-sm hidden sm:block">👷 {userName}</span>
        <Button variant="ghost" size="small" onClick={onLogout}>Abmelden</Button>
      </div>
    </div>
  </nav>
);

const RapportForm = ({ lernender, rapporte, onSave }) => {
  const [selectedDatum, setSelectedDatum] = useState(new Date().toISOString().split('T')[0]);
  const [selectedKategorie, setSelectedKategorie] = useState(null);
  const [selectedArbeiten, setSelectedArbeiten] = useState([]);
  const [selectedKompetenzen, setSelectedKompetenzen] = useState([]);
  const [notizen, setNotizen] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const heute = new Date().toISOString().split('T')[0];
  const vorhandenRapport = rapporte.find(r => r.lernenderId === lernender.id && r.datum === selectedDatum);
  
  // Lade existierenden Rapport wenn Datum wechselt
  useEffect(() => {
    if (vorhandenRapport) {
      setSelectedArbeiten(vorhandenRapport.arbeiten || []);
      setSelectedKompetenzen(vorhandenRapport.kompetenzen || []);
      setNotizen(vorhandenRapport.notizen || '');
    } else {
      setSelectedArbeiten([]);
      setSelectedKompetenzen([]);
      setNotizen('');
    }
    setSelectedKategorie(null);
  }, [selectedDatum, vorhandenRapport?.id]);
  
  // Datum-Navigation
  const changeDate = (days) => {
    const d = new Date(selectedDatum);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split('T')[0];
    if (newDate <= heute) setSelectedDatum(newDate);
  };
  
  const toggleArbeit = (kategorie, arbeit) => {
    const exists = selectedArbeiten.find(a => a.kategorie === kategorie && a.arbeit === arbeit);
    if (exists) setSelectedArbeiten(selectedArbeiten.filter(a => !(a.kategorie === kategorie && a.arbeit === arbeit)));
    else setSelectedArbeiten([...selectedArbeiten, { kategorie, arbeit, bewertung: 3, verbessert: false }]);
  };
  
  const updateArbeitBewertung = (kategorie, arbeit, field, value) => {
    setSelectedArbeiten(selectedArbeiten.map(a => a.kategorie === kategorie && a.arbeit === arbeit ? { ...a, [field]: value } : a));
  };
  
  const toggleKompetenz = (id) => {
    if (selectedKompetenzen.includes(id)) setSelectedKompetenzen(selectedKompetenzen.filter(k => k !== id));
    else setSelectedKompetenzen([...selectedKompetenzen, id]);
  };
  
  const saveRapport = async () => {
    setSaving(true);
    try {
      const rapportData = { lernenderId: lernender.id, datum: selectedDatum, arbeiten: selectedArbeiten, kompetenzen: selectedKompetenzen, notizen, berufsbildnerBewertungen: vorhandenRapport?.berufsbildnerBewertungen || [], kommentare: vorhandenRapport?.kommentare || [] };
      if (vorhandenRapport) await updateDoc(doc(db, 'rapporte', vorhandenRapport.id), rapportData);
      else await addDoc(collection(db, 'rapporte'), rapportData);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      onSave?.();
    } catch (err) { console.error(err); alert('Fehler beim Speichern.'); }
    finally { setSaving(false); }
  };
  
  const isToday = selectedDatum === heute;
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Datum-Auswahl */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Tagesrapport</h1>
          <p className="text-stone-400">{formatDate(selectedDatum)}</p>
        </div>
        <div className="flex items-center gap-2">
          {vorhandenRapport && <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">✓ Gespeichert</span>}
          {!isToday && <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm">📅 Nachtrag</span>}
        </div>
      </div>
      
      {/* Datum-Navigation */}
      <Card>
        <div className="flex items-center justify-between">
          <button onClick={() => changeDate(-1)} className="p-2 rounded-lg bg-stone-700/50 hover:bg-stone-700 text-stone-300 transition-all">
            ← Vorheriger Tag
          </button>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={selectedDatum} 
              max={heute}
              onChange={(e) => setSelectedDatum(e.target.value)}
              className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none"
            />
            {!isToday && (
              <button onClick={() => setSelectedDatum(heute)} className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-sm">
                Heute
              </button>
            )}
          </div>
          <button 
            onClick={() => changeDate(1)} 
            disabled={isToday}
            className={`p-2 rounded-lg transition-all ${isToday ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-stone-700/50 hover:bg-stone-700 text-stone-300'}`}
          >
            Nächster Tag →
          </button>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-lg font-semibold text-stone-100 mb-4">Arbeitskategorie wählen</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {Object.entries(ARBEITSKATEGORIEN).map(([key, kat]) => (
            <button key={key} onClick={() => setSelectedKategorie(selectedKategorie === key ? null : key)}
              className={`p-2 rounded-xl text-center transition-all ${selectedKategorie === key ? 'bg-amber-500/20 border-amber-500/50 border' : 'bg-stone-700/30 border border-stone-700 hover:border-stone-600'}`}>
              <span className="text-xl">{kat.icon}</span>
              <p className="text-xs text-stone-400 mt-1 truncate">{kat.name}</p>
              {selectedArbeiten.filter(a => a.kategorie === key).length > 0 && <span className="inline-block mt-1 bg-amber-500 text-stone-900 text-xs px-1.5 rounded-full">{selectedArbeiten.filter(a => a.kategorie === key).length}</span>}
            </button>
          ))}
        </div>
      </Card>
      
      {selectedKategorie && (
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">{ARBEITSKATEGORIEN[selectedKategorie].icon} {ARBEITSKATEGORIEN[selectedKategorie].name}</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {ARBEITSKATEGORIEN[selectedKategorie].arbeiten.map((arbeit) => {
              const selected = selectedArbeiten.find(a => a.kategorie === selectedKategorie && a.arbeit === arbeit);
              return (
                <div key={arbeit} className={`p-3 rounded-xl border transition-all ${selected ? 'bg-amber-500/10 border-amber-500/30' : 'bg-stone-700/20 border-stone-700'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={!!selected} onChange={() => toggleArbeit(selectedKategorie, arbeit)} className="mt-1 w-5 h-5 rounded" />
                    <span className="text-stone-200 flex-1">{arbeit}</span>
                  </label>
                  {selected && (
                    <div className="mt-3 ml-8 space-y-3">
                      <div><p className="text-sm text-stone-400 mb-1">Wie gut hast du es gemacht?</p><RatingStars value={selected.bewertung} onChange={(v) => updateArbeitBewertung(selectedKategorie, arbeit, 'bewertung', v)} /></div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selected.verbessert} onChange={(e) => updateArbeitBewertung(selectedKategorie, arbeit, 'verbessert', e.target.checked)} className="w-5 h-5 rounded" />
                        <span className="text-stone-300">Ich habe mich verbessert 📈</span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
          </div>
        </Card>
      )}
      
      {selectedArbeiten.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">Ausgewählte Arbeiten ({selectedArbeiten.length})</h2>
          <div className="space-y-2">
            {selectedArbeiten.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-stone-700/30 rounded-lg">
                <div className="flex items-center gap-2"><span>{ARBEITSKATEGORIEN[a.kategorie]?.icon}</span><span className="text-stone-200 text-sm">{a.arbeit}</span></div>
                <div className="flex items-center gap-2"><RatingStars value={a.bewertung} readOnly size="small" />{a.verbessert && <span className="text-emerald-400">📈</span>}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      <Card>
        <h2 className="text-lg font-semibold text-stone-100 mb-4">Geübte Kompetenzen</h2>
        <div className="flex flex-wrap gap-2">
          {KOMPETENZEN.map((komp) => (
            <button key={komp.id} onClick={() => toggleKompetenz(komp.id)} className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedKompetenzen.includes(komp.id) ? 'bg-amber-500 text-stone-900' : 'bg-stone-700/50 text-stone-300 hover:bg-stone-700'}`}>
              {komp.icon} {komp.name}
            </button>
          ))}
        </div>
      </Card>
      
      <Card>
        <h2 className="text-lg font-semibold text-stone-100 mb-4">Notizen</h2>
        <textarea value={notizen} onChange={(e) => setNotizen(e.target.value)} placeholder="Was war heute besonders?" className="w-full h-24 bg-stone-700/30 border border-stone-600 rounded-xl p-4 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none resize-none" />
      </Card>
      
      <div className="flex justify-end gap-4">
        {saved && <span className="text-emerald-400 flex items-center gap-2">✓ Gespeichert!</span>}
        <Button variant="primary" size="large" onClick={saveRapport} disabled={selectedArbeiten.length === 0 || saving}>{saving ? 'Speichern...' : 'Rapport speichern'}</Button>
      </div>
    </div>
  );
};

const LernendenDashboard = ({ lernender, rapporte, berufsbildner, monatsBewertungen }) => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [showAllKategorien, setShowAllKategorien] = useState(false);
  const [showAllKompetenzen, setShowAllKompetenzen] = useState(false);
  
  const meineRapporte = rapporte.filter(r => r.lernenderId === lernender.id);
  const meineBewertungen = monatsBewertungen.filter(b => b.lernenderId === lernender.id);
  const gefilterteRapporte = selectedMonth === 'all' ? meineRapporte : meineRapporte.filter(r => getMonthKey(r.datum) === selectedMonth);
  const availableMonths = [...new Set(meineRapporte.map(r => getMonthKey(r.datum)))].sort().reverse();
  
  // Arbeits-Statistik
  const arbeitsStats = {};
  gefilterteRapporte.forEach(rapport => {
    rapport.arbeiten?.forEach(a => {
      if (!arbeitsStats[a.kategorie]) arbeitsStats[a.kategorie] = { count: 0, totalSelbst: 0, totalBB: 0, bbCount: 0, verbesserungen: 0 };
      arbeitsStats[a.kategorie].count++;
      arbeitsStats[a.kategorie].totalSelbst += a.bewertung || 0;
      if (a.verbessert) arbeitsStats[a.kategorie].verbesserungen++;
      const bbBewertung = rapport.berufsbildnerBewertungen?.find(b => b.arbeit === a.arbeit);
      if (bbBewertung) { arbeitsStats[a.kategorie].totalBB += bbBewertung.bewertung; arbeitsStats[a.kategorie].bbCount++; }
    });
  });
  
  // Kompetenz-Statistik
  const kompetenzStats = {};
  gefilterteRapporte.forEach(rapport => {
    rapport.kompetenzen?.forEach(k => {
      kompetenzStats[k] = (kompetenzStats[k] || 0) + 1;
    });
  });
  
  const kategorieStats = Object.entries(arbeitsStats).map(([kat, stats]) => ({
    kategorie: kat, name: ARBEITSKATEGORIEN[kat]?.name || kat, icon: ARBEITSKATEGORIEN[kat]?.icon || '📋',
    avgSelbst: stats.count > 0 ? stats.totalSelbst / stats.count : 0,
    avgBB: stats.bbCount > 0 ? stats.totalBB / stats.bbCount : null, 
    count: stats.count,
    verbesserungen: stats.verbesserungen
  })).sort((a, b) => b.count - a.count);
  
  const kompetenzList = Object.entries(kompetenzStats).map(([id, count]) => {
    const komp = KOMPETENZEN.find(k => k.id === id);
    return { id, name: komp?.name || id, icon: komp?.icon || '📋', count };
  }).sort((a, b) => b.count - a.count);
  
  // Zeitlicher Verlauf pro Monat
  const monthlyData = {};
  meineRapporte.forEach(rapport => {
    const month = getMonthKey(rapport.datum);
    if (!monthlyData[month]) monthlyData[month] = { rapporte: 0, arbeiten: 0, avgBewertung: [], kompetenzen: new Set() };
    monthlyData[month].rapporte++;
    rapport.arbeiten?.forEach(a => {
      monthlyData[month].arbeiten++;
      monthlyData[month].avgBewertung.push(a.bewertung || 0);
    });
    rapport.kompetenzen?.forEach(k => monthlyData[month].kompetenzen.add(k));
  });
  
  const zeitVerlauf = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({
      month,
      label: formatMonth(month + '-01').split(' ')[0].substring(0, 3),
      rapporte: data.rapporte,
      arbeiten: data.arbeiten,
      avgBewertung: data.avgBewertung.length > 0 ? data.avgBewertung.reduce((a, b) => a + b, 0) / data.avgBewertung.length : 0,
      kompetenzen: data.kompetenzen.size
    }));
  
  const letzteBewertung = meineBewertungen.sort((a, b) => b.monat?.localeCompare(a.monat))[0];
  const maxArbeiten = Math.max(...zeitVerlauf.map(z => z.arbeiten), 1);
  
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-stone-100">Dashboard</h1><p className="text-stone-400">Dein Ausbildungsfortschritt</p></div>
        <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} options={[{ value: 'all', label: 'Alle Monate' }, ...availableMonths.map(m => ({ value: m, label: formatMonth(m + '-01') }))]} />
      </div>
      
      {/* Statistik-Karten */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><p className="text-stone-400 text-sm">Rapporte</p><p className="text-3xl font-bold text-stone-100 mt-1">{meineRapporte.length}</p></Card>
        <Card><p className="text-stone-400 text-sm">Diese Woche</p><p className="text-3xl font-bold text-amber-400 mt-1">{meineRapporte.filter(r => (new Date() - new Date(r.datum)) / 86400000 <= 7).length}</p></Card>
        <Card><p className="text-stone-400 text-sm">Ø Selbstbewertung</p><p className="text-3xl font-bold text-emerald-400 mt-1">{gefilterteRapporte.length > 0 ? (gefilterteRapporte.flatMap(r => r.arbeiten || []).reduce((sum, a) => sum + (a.bewertung || 0), 0) / Math.max(1, gefilterteRapporte.flatMap(r => r.arbeiten || []).length)).toFixed(1) : '-'}</p></Card>
        <Card><p className="text-stone-400 text-sm">Verbesserungen</p><p className="text-3xl font-bold text-blue-400 mt-1">{gefilterteRapporte.flatMap(r => r.arbeiten || []).filter(a => a.verbessert).length}</p></Card>
      </div>
      
      {/* Monatsbewertung */}
      {letzteBewertung && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <h2 className="text-lg font-semibold text-blue-400 mb-2">📋 Monatsbewertung {formatMonth(letzteBewertung.monat + '-01')}</h2>
          <div className="flex items-center gap-4 mb-3"><RatingStars value={letzteBewertung.gesamtbewertung} readOnly /></div>
          {letzteBewertung.kommentar && <p className="text-stone-300 bg-stone-800/50 p-3 rounded-lg">{letzteBewertung.kommentar}</p>}
          <p className="text-stone-500 text-sm mt-2">— {letzteBewertung.berufsbildnerName}</p>
        </Card>
      )}
      
      {/* Zeitlicher Verlauf - Grafik */}
      {zeitVerlauf.length > 1 && (
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">📈 Entwicklung über Zeit</h2>
          <div className="mb-4 flex gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded"></span> Arbeiten</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded"></span> Ø Bewertung</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> Kompetenzen</span>
          </div>
          <div className="h-48 flex items-end gap-3">
            {zeitVerlauf.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full flex gap-1 items-end justify-center h-36">
                  <div className="w-4 bg-amber-500/80 rounded-t transition-all" style={{ height: `${(item.arbeiten / maxArbeiten) * 100}%` }} title={`${item.arbeiten} Arbeiten`} />
                  <div className="w-4 bg-emerald-500/80 rounded-t transition-all" style={{ height: `${(item.avgBewertung / 5) * 100}%` }} title={`Ø ${item.avgBewertung.toFixed(1)}`} />
                  <div className="w-4 bg-blue-500/80 rounded-t transition-all" style={{ height: `${(item.kompetenzen / 10) * 100}%` }} title={`${item.kompetenzen} Kompetenzen`} />
                </div>
                <span className="text-xs text-stone-400 mt-2">{item.label}</span>
                <span className="text-xs text-stone-500">{item.rapporte}R</span>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Alle Arbeitskategorien */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-100">🏗️ Alle Arbeitskategorien</h2>
          <button onClick={() => setShowAllKategorien(!showAllKategorien)} className="text-amber-400 text-sm hover:text-amber-300">
            {showAllKategorien ? '← Weniger' : 'Alle anzeigen →'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(showAllKategorien ? kategorieStats : kategorieStats.slice(0, 6)).map(kat => (
            <div key={kat.kategorie} className="p-3 bg-stone-700/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-200 text-sm font-medium">{kat.icon} {kat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-xs">{kat.count}× geübt</span>
                  {kat.verbesserungen > 0 && <span className="text-emerald-400 text-xs">📈 {kat.verbesserungen}</span>}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 w-16">Selbst:</span>
                  <div className="flex-1"><ProgressBar value={kat.avgSelbst} color="amber" /></div>
                  <span className="text-xs text-amber-400 w-8">{kat.avgSelbst.toFixed(1)}</span>
                </div>
                {kat.avgBB !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 w-16">BB:</span>
                    <div className="flex-1"><ProgressBar value={kat.avgBB} color="blue" /></div>
                    <span className="text-xs text-blue-400 w-8">{kat.avgBB.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {kategorieStats.length === 0 && <p className="text-stone-500 text-center py-4">Noch keine Arbeiten erfasst.</p>}
      </Card>
      
      {/* Alle Kompetenzen */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-100">💪 Alle Kompetenzen</h2>
          <button onClick={() => setShowAllKompetenzen(!showAllKompetenzen)} className="text-amber-400 text-sm hover:text-amber-300">
            {showAllKompetenzen ? '← Weniger' : 'Alle anzeigen →'}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {KOMPETENZEN.map(komp => {
            const count = kompetenzStats[komp.id] || 0;
            const maxCount = Math.max(...Object.values(kompetenzStats), 1);
            return (
              <div key={komp.id} className={`p-3 rounded-xl text-center transition-all ${count > 0 ? 'bg-stone-700/30' : 'bg-stone-800/30 opacity-50'}`}>
                <span className="text-2xl">{komp.icon}</span>
                <p className="text-xs text-stone-300 mt-1">{komp.name}</p>
                <div className="mt-2 h-1 bg-stone-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
                <p className="text-xs text-amber-400 mt-1">{count}×</p>
              </div>
            );
          })}
        </div>
      </Card>
      
      {/* Berufsbildner/in */}
      {berufsbildner && (
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">👨‍🏫 Dein/e Berufsbildner/in</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-stone-700 rounded-full flex items-center justify-center text-2xl">👷</div>
            <div><p className="text-stone-100 font-medium">{berufsbildner.name}</p><p className="text-stone-400">{berufsbildner.firma}</p></div>
          </div>
        </Card>
      )}
    </div>
  );
};

const LernendenVerlauf = ({ lernender, rapporte }) => {
  const [selectedRapport, setSelectedRapport] = useState(null);
  const meineRapporte = rapporte.filter(r => r.lernenderId === lernender.id).sort((a, b) => new Date(b.datum) - new Date(a.datum));
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div><h1 className="text-2xl font-bold text-stone-100">Verlauf</h1><p className="text-stone-400">Alle deine Rapporte</p></div>
      {meineRapporte.length === 0 ? <Card><p className="text-stone-400 text-center py-8">Noch keine Rapporte.</p></Card> : (
        <div className="space-y-4">
          {meineRapporte.map(rapport => (
            <Card key={rapport.id} onClick={() => setSelectedRapport(rapport)} className="hover:border-amber-500/30">
              <div className="flex items-start justify-between">
                <div><p className="text-stone-100 font-medium">{formatDate(rapport.datum)}</p><p className="text-stone-400 text-sm mt-1">{rapport.arbeiten?.length || 0} Arbeiten</p></div>
                <RatingStars value={rapport.arbeiten?.length > 0 ? rapport.arbeiten.reduce((s, a) => s + (a.bewertung || 0), 0) / rapport.arbeiten.length : 0} readOnly size="small" />
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal isOpen={!!selectedRapport} onClose={() => setSelectedRapport(null)} title={selectedRapport ? formatDate(selectedRapport.datum) : ''}>
        {selectedRapport && (
          <div className="space-y-4">
            <div className="space-y-2">
              {selectedRapport.arbeiten?.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-stone-700/30 rounded-lg">
                  <span className="text-stone-200 text-sm">{ARBEITSKATEGORIEN[a.kategorie]?.icon} {a.arbeit}</span>
                  <div className="flex items-center gap-2"><RatingStars value={a.bewertung} readOnly size="small" />{a.verbessert && <span>📈</span>}</div>
                </div>
              ))}
            </div>
            {selectedRapport.notizen && <p className="text-stone-300 bg-stone-700/30 p-3 rounded-lg">{selectedRapport.notizen}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
};

const LernendenBereich = ({ lernender, rapporte, berufsbildner, monatsBewertungen, onLogout, onRefresh }) => {
  const [currentView, setCurrentView] = useState('rapport');
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      <LernendenNav currentView={currentView} onNavigate={setCurrentView} onLogout={onLogout} userName={lernender.name} />
      {currentView === 'rapport' && <RapportForm lernender={lernender} rapporte={rapporte} onSave={onRefresh} />}
      {currentView === 'dashboard' && <LernendenDashboard lernender={lernender} rapporte={rapporte} berufsbildner={berufsbildner} monatsBewertungen={monatsBewertungen} />}
      {currentView === 'verlauf' && <LernendenVerlauf lernender={lernender} rapporte={rapporte} />}
    </div>
  );
};

// ============================================================================
// BERUFSBILDNER BEREICH
// ============================================================================

const BerufsbildnerNav = ({ currentView, onNavigate, onLogout, userName }) => (
  <nav className="bg-stone-800/80 backdrop-blur-md border-b border-stone-700 sticky top-0 z-40">
    <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-2xl">🏗️</span>
        <span className="font-semibold text-stone-100 hidden sm:block">MauerwerkCheck</span>
        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">BB</span>
        <div className="flex gap-1">
          {[{ id: 'lernende', icon: '👷' }, { id: 'bewertungen', icon: '📋' }, { id: 'codes', icon: '🔑' }, { id: 'uebersicht', icon: '📊' }].map(item => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`px-3 py-2 rounded-lg transition-all ${currentView === item.id ? 'bg-blue-500/20 text-blue-400' : 'text-stone-400 hover:text-stone-100'}`}>{item.icon}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-stone-400 text-sm hidden sm:block">👨‍🏫 {userName}</span>
        <Button variant="ghost" size="small" onClick={onLogout}>Abmelden</Button>
      </div>
    </div>
  </nav>
);

const BerufsbildnerLernende = ({ berufsbildner, lernende, rapporte, onRefresh }) => {
  const [selectedLernender, setSelectedLernender] = useState(null);
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);
  const meineLernende = lernende.filter(l => l.berufsbildnerId === berufsbildner.id);
  
  const addComment = async (rapportId) => {
    if (!commentText.trim()) return;
    setSaving(true);
    try {
      const rapport = rapporte.find(r => r.id === rapportId);
      await updateDoc(doc(db, 'rapporte', rapportId), { kommentare: [...(rapport.kommentare || []), { autor: berufsbildner.name, text: commentText, datum: new Date().toISOString().split('T')[0] }] });
      setCommentText(''); onRefresh?.();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };
  
  const addBewertung = async (rapportId, arbeit, bewertung) => {
    try {
      const rapport = rapporte.find(r => r.id === rapportId);
      const existing = (rapport.berufsbildnerBewertungen || []).filter(b => b.arbeit !== arbeit.arbeit);
      await updateDoc(doc(db, 'rapporte', rapportId), { berufsbildnerBewertungen: [...existing, { kategorie: arbeit.kategorie, arbeit: arbeit.arbeit, bewertung }] });
      onRefresh?.();
    } catch (err) { console.error(err); }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div><h1 className="text-2xl font-bold text-stone-100">Meine Lernenden</h1><p className="text-stone-400">{meineLernende.length} Lernende/r</p></div>
      {meineLernende.length === 0 ? <Card><p className="text-stone-400 text-center py-8">Noch keine Lernenden. Erstelle einen Code unter "🔑".</p></Card> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meineLernende.map(l => {
            const lernRapporte = rapporte.filter(r => r.lernenderId === l.id);
            return (
              <Card key={l.id} onClick={() => setSelectedLernender(l)} className="hover:border-blue-500/30">
                <div className="flex items-center gap-4"><div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center text-2xl">👷</div><div><p className="text-stone-100 font-medium">{l.name}</p><p className="text-stone-400 text-sm">{l.lehrjahr}. Lehrjahr</p></div></div>
                <div className="mt-4 pt-4 border-t border-stone-700 text-sm"><div className="flex justify-between"><span className="text-stone-400">Rapporte:</span><span className="text-stone-200">{lernRapporte.length}</span></div></div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal isOpen={!!selectedLernender} onClose={() => { setSelectedLernender(null); setSelectedRapport(null); }} title={selectedLernender?.name || ''} size="large">
        {selectedLernender && !selectedRapport && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-stone-700/30 rounded-xl"><div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center text-3xl">👷</div><div><p className="text-stone-100 font-medium">{selectedLernender.name}</p><p className="text-stone-400">Code: {selectedLernender.code}</p></div></div>
            <h3 className="text-stone-400 text-sm">Rapporte</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {rapporte.filter(r => r.lernenderId === selectedLernender.id).sort((a, b) => new Date(b.datum) - new Date(a.datum)).map(rapport => (
                <button key={rapport.id} onClick={() => setSelectedRapport(rapport)} className="w-full p-3 bg-stone-700/30 rounded-lg text-left hover:bg-stone-700/50">
                  <div className="flex justify-between items-center"><span className="text-stone-200">{formatDateShort(rapport.datum)}</span><span className="text-stone-400 text-sm">{rapport.arbeiten?.length || 0} Arbeiten</span></div>
                </button>
              ))}
            </div>
          </div>
        )}
        {selectedRapport && (
          <div className="space-y-4">
            <button onClick={() => setSelectedRapport(null)} className="text-blue-400 hover:text-blue-300">← Zurück</button>
            <h3 className="text-stone-100">{formatDate(selectedRapport.datum)}</h3>
            <div className="space-y-3">
              {selectedRapport.arbeiten?.map((a, i) => {
                const bbBewertung = selectedRapport.berufsbildnerBewertungen?.find(b => b.arbeit === a.arbeit);
                return (
                  <div key={i} className="p-3 bg-stone-700/30 rounded-lg space-y-2">
                    <span className="text-stone-200 text-sm">{ARBEITSKATEGORIEN[a.kategorie]?.icon} {a.arbeit}</span>
                    <div className="flex items-center gap-4">
                      <div><p className="text-stone-500 text-xs">Selbst:</p><RatingStars value={a.bewertung} readOnly size="small" /></div>
                      <div><p className="text-blue-400 text-xs">Deine Bewertung:</p><RatingStars value={bbBewertung?.bewertung || 0} onChange={(v) => addBewertung(selectedRapport.id, a, v)} size="small" /></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2">
              <h4 className="text-stone-400 text-sm">Kommentar</h4>
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Feedback..." className="w-full h-24 bg-stone-700/30 border border-stone-600 rounded-xl p-3 text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:outline-none resize-none" />
              <Button variant="primary" onClick={() => addComment(selectedRapport.id)} disabled={!commentText.trim() || saving}>{saving ? '...' : 'Senden'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const BerufsbildnerBewertungen = ({ berufsbildner, lernende, rapporte, monatsBewertungen, onRefresh }) => {
  const [selectedLernender, setSelectedLernender] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));
  const [gesamtbewertung, setGesamtbewertung] = useState(3);
  const [kommentar, setKommentar] = useState('');
  const [saving, setSaving] = useState(false);
  const meineLernende = lernende.filter(l => l.berufsbildnerId === berufsbildner.id);
  
  const months = [];
  for (let i = 0; i < 6; i++) { const d = new Date(); d.setMonth(d.getMonth() - i); months.push(getMonthKey(d)); }
  
  const existingBewertung = selectedLernender ? monatsBewertungen.find(b => b.lernenderId === selectedLernender.id && b.monat === selectedMonth) : null;
  
  useEffect(() => {
    if (existingBewertung) { setGesamtbewertung(existingBewertung.gesamtbewertung); setKommentar(existingBewertung.kommentar || ''); }
    else { setGesamtbewertung(3); setKommentar(''); }
  }, [existingBewertung, selectedLernender, selectedMonth]);
  
  const getMonthStats = () => {
    if (!selectedLernender) return null;
    const monthRapporte = rapporte.filter(r => r.lernenderId === selectedLernender.id && getMonthKey(r.datum) === selectedMonth);
    if (monthRapporte.length === 0) return null;
    const alleArbeiten = monthRapporte.flatMap(r => r.arbeiten || []);
    return {
      rapportCount: monthRapporte.length, arbeitenCount: alleArbeiten.length,
      avgSelbst: alleArbeiten.length > 0 ? alleArbeiten.reduce((sum, a) => sum + (a.bewertung || 0), 0) / alleArbeiten.length : 0,
      verbesserungen: alleArbeiten.filter(a => a.verbessert).length
    };
  };
  
  const saveBewertung = async () => {
    if (!selectedLernender) return;
    setSaving(true);
    try {
      const data = { lernenderId: selectedLernender.id, berufsbildnerId: berufsbildner.id, berufsbildnerName: berufsbildner.name, monat: selectedMonth, gesamtbewertung, kommentar, erstelltAm: new Date().toISOString() };
      if (existingBewertung) await updateDoc(doc(db, 'monatsbewertungen', existingBewertung.id), data);
      else await addDoc(collection(db, 'monatsbewertungen'), data);
      onRefresh?.(); alert('Gespeichert!');
    } catch (err) { console.error(err); alert('Fehler'); }
    finally { setSaving(false); }
  };
  
  const stats = getMonthStats();
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div><h1 className="text-2xl font-bold text-stone-100">Monatsbewertungen</h1><p className="text-stone-400">Monatliche Rückmeldung</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        <Select label="Lernende/r" value={selectedLernender?.id || ''} onChange={(e) => setSelectedLernender(meineLernende.find(l => l.id === e.target.value) || null)} options={[{ value: '', label: '-- Wählen --' }, ...meineLernende.map(l => ({ value: l.id, label: l.name }))]} />
        <Select label="Monat" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} options={months.map(m => ({ value: m, label: formatMonth(m + '-01') }))} />
      </div>
      {selectedLernender && (
        <>
          {stats ? (
            <Card>
              <h2 className="text-lg font-semibold text-stone-100 mb-4">📊 Statistik {formatMonth(selectedMonth + '-01')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><p className="text-stone-400 text-sm">Rapporte</p><p className="text-2xl font-bold text-stone-100">{stats.rapportCount}</p></div>
                <div><p className="text-stone-400 text-sm">Arbeiten</p><p className="text-2xl font-bold text-amber-400">{stats.arbeitenCount}</p></div>
                <div><p className="text-stone-400 text-sm">Ø Selbst</p><p className="text-2xl font-bold text-emerald-400">{stats.avgSelbst.toFixed(1)}</p></div>
                <div><p className="text-stone-400 text-sm">Verbesserungen</p><p className="text-2xl font-bold text-blue-400">{stats.verbesserungen}</p></div>
              </div>
            </Card>
          ) : <Card><p className="text-stone-400 text-center py-4">Keine Rapporte in diesem Monat.</p></Card>}
          <Card>
            <h2 className="text-lg font-semibold text-stone-100 mb-4">📋 Bewertung {existingBewertung && <span className="text-emerald-400 text-sm ml-2">✓ Vorhanden</span>}</h2>
            <div className="space-y-4">
              <div><label className="text-sm text-stone-400 block mb-2">Gesamtbewertung</label><RatingStars value={gesamtbewertung} onChange={setGesamtbewertung} /></div>
              <div><label className="text-sm text-stone-400 block mb-2">Kommentar</label><textarea value={kommentar} onChange={(e) => setKommentar(e.target.value)} placeholder="Was lief gut? Was kann verbessert werden?" className="w-full h-32 bg-stone-700/30 border border-stone-600 rounded-xl p-4 text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:outline-none resize-none" /></div>
              <Button variant="primary" onClick={saveBewertung} disabled={saving}>{saving ? '...' : existingBewertung ? 'Aktualisieren' : 'Speichern'}</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

const BerufsbildnerCodes = ({ berufsbildner, lernende, onRefresh }) => {
  const [newCode, setNewCode] = useState('');
  const [saving, setSaving] = useState(false);
  
  const createCode = async () => {
    setSaving(true);
    try {
      const code = generateCode();
      await updateDoc(doc(db, 'berufsbildner', berufsbildner.id), { codes: [...(berufsbildner.codes || []), code] });
      setNewCode(code); onRefresh?.();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };
  
  const deleteCode = async (code) => {
    if (lernende.some(l => l.code === code)) { alert('Code wird verwendet!'); return; }
    try { await updateDoc(doc(db, 'berufsbildner', berufsbildner.id), { codes: (berufsbildner.codes || []).filter(c => c !== code) }); onRefresh?.(); }
    catch (err) { console.error(err); }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div><h1 className="text-2xl font-bold text-stone-100">Zugangscodes</h1><p className="text-stone-400">Codes für neue Lernende</p></div>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-100">Neuer Code</h2>
          <Button variant="primary" onClick={createCode} disabled={saving}>{saving ? '...' : '+ Neu'}</Button>
        </div>
        {newCode && <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4"><p className="text-emerald-400 mb-2">Erstellt!</p><p className="text-3xl font-mono font-bold text-stone-100">{newCode}</p></div>}
        <div className="space-y-2">
          {(berufsbildner.codes || []).map(code => {
            const l = lernende.find(x => x.code === code);
            return (
              <div key={code} className="flex items-center justify-between p-3 bg-stone-700/30 rounded-xl">
                <div><span className="font-mono text-lg text-stone-100">{code}</span>{l && <span className="ml-3 text-stone-400 text-sm">→ {l.name}</span>}</div>
                {!l && <Button variant="danger" size="small" onClick={() => deleteCode(code)}>×</Button>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

const BerufsbildnerUebersicht = ({ berufsbildner, lernende, rapporte }) => {
  const meineLernende = lernende.filter(l => l.berufsbildnerId === berufsbildner.id);
  const meineRapporte = rapporte.filter(r => meineLernende.some(l => l.id === r.lernenderId));
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-stone-100">Übersicht</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><p className="text-stone-400 text-sm">Lernende</p><p className="text-3xl font-bold text-stone-100 mt-1">{meineLernende.length}</p></Card>
        <Card><p className="text-stone-400 text-sm">Rapporte</p><p className="text-3xl font-bold text-blue-400 mt-1">{meineRapporte.length}</p></Card>
        <Card><p className="text-stone-400 text-sm">Diese Woche</p><p className="text-3xl font-bold text-emerald-400 mt-1">{meineRapporte.filter(r => (new Date() - new Date(r.datum)) / 86400000 <= 7).length}</p></Card>
        <Card><p className="text-stone-400 text-sm">Zu bewerten</p><p className="text-3xl font-bold text-amber-400 mt-1">{meineRapporte.filter(r => !r.berufsbildnerBewertungen?.length).length}</p></Card>
      </div>
      <Card>
        <h2 className="text-lg font-semibold text-stone-100 mb-4">Aktivität (7 Tage)</h2>
        <div className="space-y-3">
          {meineLernende.map(l => {
            const count = meineRapporte.filter(r => r.lernenderId === l.id && (new Date() - new Date(r.datum)) / 86400000 <= 7).length;
            return <div key={l.id} className="flex items-center gap-4"><div className="w-28 text-stone-300 truncate">{l.name}</div><div className="flex-1"><ProgressBar value={count} max={7} color="blue" /></div><span className="text-stone-400 text-sm w-12 text-right">{count}/7</span></div>;
          })}
        </div>
      </Card>
    </div>
  );
};

const BerufsbildnerBereich = ({ berufsbildner, lernende, rapporte, monatsBewertungen, onLogout, onRefresh }) => {
  const [currentView, setCurrentView] = useState('lernende');
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      <BerufsbildnerNav currentView={currentView} onNavigate={setCurrentView} onLogout={onLogout} userName={berufsbildner.name} />
      {currentView === 'lernende' && <BerufsbildnerLernende berufsbildner={berufsbildner} lernende={lernende} rapporte={rapporte} onRefresh={onRefresh} />}
      {currentView === 'bewertungen' && <BerufsbildnerBewertungen berufsbildner={berufsbildner} lernende={lernende} rapporte={rapporte} monatsBewertungen={monatsBewertungen} onRefresh={onRefresh} />}
      {currentView === 'codes' && <BerufsbildnerCodes berufsbildner={berufsbildner} lernende={lernende} onRefresh={onRefresh} />}
      {currentView === 'uebersicht' && <BerufsbildnerUebersicht berufsbildner={berufsbildner} lernende={lernende} rapporte={rapporte} />}
    </div>
  );
};

// ============================================================================
// ADMIN BEREICH
// ============================================================================

const AdminBereich = ({ berufsbildner, lernende, rapporte, onLogout, onRefresh }) => {
  const [newBBName, setNewBBName] = useState('');
  const [newBBEmail, setNewBBEmail] = useState('');
  const [newBBPassword, setNewBBPassword] = useState('');
  const [newBBFirma, setNewBBFirma] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pw = '';
    for (let i = 0; i < 10; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewBBPassword(pw);
  };
  
  const createBerufsbildner = async () => {
    if (!newBBName || !newBBEmail || !newBBPassword) return;
    if (newBBPassword.length < 6) { setError('Passwort muss mindestens 6 Zeichen haben'); return; }
    
    setSaving(true); setSuccess(''); setError('');
    try {
      // 1. Firebase Auth Account erstellen
      await createUserWithEmailAndPassword(auth, newBBEmail, newBBPassword);
      
      // 2. Firestore Eintrag erstellen
      await addDoc(collection(db, 'berufsbildner'), { 
        name: newBBName, 
        email: newBBEmail.toLowerCase(), 
        firma: newBBFirma, 
        codes: [] 
      });
      
      setSuccess(`✅ "${newBBName}" erstellt!\n\n📧 E-Mail: ${newBBEmail}\n🔑 Passwort: ${newBBPassword}\n\nBitte diese Daten der Person mitteilen!`);
      setNewBBName(''); setNewBBEmail(''); setNewBBPassword(''); setNewBBFirma('');
      onRefresh?.();
      
      // Ausloggen damit Admin eingeloggt bleibt (createUser loggt automatisch ein)
      // Wir machen das nicht, stattdessen muss Admin sich danach neu einloggen
      // Das ist ein bekanntes Firebase-Verhalten
      
    } catch (err) { 
      console.error(err); 
      if (err.code === 'auth/email-already-in-use') {
        setError('Diese E-Mail-Adresse ist bereits registriert');
      } else if (err.code === 'auth/weak-password') {
        setError('Passwort ist zu schwach (mind. 6 Zeichen)');
      } else if (err.code === 'auth/invalid-email') {
        setError('Ungültige E-Mail-Adresse');
      } else {
        setError('Fehler beim Erstellen: ' + err.message);
      }
    }
    finally { setSaving(false); }
  };
  
  const deleteBerufsbildner = async (id) => {
    const hatLernende = lernende.some(l => l.berufsbildnerId === id);
    if (hatLernende) { alert('Hat noch Lernende zugewiesen!'); return; }
    if (!window.confirm('Wirklich löschen?')) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'berufsbildner', id));
      onRefresh?.();
    } catch (err) { console.error(err); alert('Fehler beim Löschen'); }
    finally { setDeleting(null); }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      <nav className="bg-stone-800/80 backdrop-blur-md border-b border-stone-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><span className="text-2xl">🏗️</span><span className="font-semibold text-stone-100">MauerwerkCheck</span><span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">Admin</span></div>
          <Button variant="ghost" size="small" onClick={onLogout}>Abmelden</Button>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div><h1 className="text-2xl font-bold text-stone-100">Admin-Bereich</h1><p className="text-stone-400">Berufsbildner/innen verwalten</p></div>
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">Neue/n Berufsbildner/in erstellen</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Name" value={newBBName} onChange={(e) => setNewBBName(e.target.value)} placeholder="Anna Müller" />
            <Input label="E-Mail" type="email" value={newBBEmail} onChange={(e) => setNewBBEmail(e.target.value)} placeholder="anna@firma.ch" />
            <div className="space-y-2">
              <label className="text-sm text-stone-400">Passwort</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newBBPassword} 
                  onChange={(e) => setNewBBPassword(e.target.value)} 
                  placeholder="Mind. 6 Zeichen"
                  className="flex-1 bg-stone-800/50 border border-stone-600 rounded-xl px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                />
                <button 
                  onClick={generatePassword}
                  className="px-4 py-3 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-xl transition-all"
                  title="Zufälliges Passwort generieren"
                >
                  🎲
                </button>
              </div>
            </div>
            <Input label="Firma" value={newBBFirma} onChange={(e) => setNewBBFirma(e.target.value)} placeholder="Bau AG" />
          </div>
          {error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"><p className="text-red-400 text-sm">{error}</p></div>}
          {success && <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"><p className="text-emerald-400 text-sm whitespace-pre-line">{success}</p></div>}
          <Button variant="primary" className="mt-4" onClick={createBerufsbildner} disabled={!newBBName || !newBBEmail || !newBBPassword || saving}>{saving ? '...' : 'Erstellen'}</Button>
          <p className="text-stone-500 text-sm mt-2">⚠️ Notiere das Passwort – es kann nicht wiederhergestellt werden!</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">Berufsbildner/innen ({berufsbildner.length})</h2>
          <div className="space-y-3">
            {berufsbildner.map(bb => {
              const lernendeAnzahl = lernende.filter(l => l.berufsbildnerId === bb.id).length;
              return (
                <div key={bb.id} className="flex items-center justify-between p-4 bg-stone-700/30 rounded-xl">
                  <div>
                    <p className="text-stone-100 font-medium">{bb.name}</p>
                    <p className="text-stone-400 text-sm">{bb.firma || 'Keine Firma'} • {bb.email}</p>
                    <p className="text-stone-500 text-sm">{lernendeAnzahl} Lernende • {(bb.codes || []).length} Codes</p>
                  </div>
                  <Button 
                    variant="danger" 
                    size="small" 
                    onClick={() => deleteBerufsbildner(bb.id)} 
                    disabled={lernendeAnzahl > 0 || deleting === bb.id}
                  >
                    {deleting === bb.id ? '...' : 'Löschen'}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
        <div className="grid md:grid-cols-3 gap-4">
          <Card><p className="text-stone-400 text-sm">Berufsbildner/innen</p><p className="text-3xl font-bold text-stone-100 mt-1">{berufsbildner.length}</p></Card>
          <Card><p className="text-stone-400 text-sm">Lernende</p><p className="text-3xl font-bold text-amber-400 mt-1">{lernende.length}</p></Card>
          <Card><p className="text-stone-400 text-sm">Rapporte</p><p className="text-3xl font-bold text-emerald-400 mt-1">{rapporte.length}</p></Card>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [berufsbildner, setBerufsbildner] = useState([]);
  const [lernende, setLernende] = useState([]);
  const [rapporte, setRapporte] = useState([]);
  const [monatsBewertungen, setMonatsBewertungen] = useState([]);
  
  const loadData = async () => {
    try {
      const [bbSnap, lernSnap, rapSnap, mbSnap] = await Promise.all([
        getDocs(collection(db, 'berufsbildner')),
        getDocs(collection(db, 'lernende')),
        getDocs(collection(db, 'rapporte')),
        getDocs(collection(db, 'monatsbewertungen'))
      ]);
      setBerufsbildner(bbSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLernende(lernSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setRapporte(rapSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setMonatsBewertungen(mbSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  
  useEffect(() => { loadData(); }, []);
  
  const handleLogin = ({ type, user }) => { setSession({ type, user }); };
  const handleLogout = async () => { try { await signOut(auth); } catch {} setSession(null); };
  
  if (loading) return <div className="min-h-screen bg-stone-900 flex items-center justify-center"><LoadingSpinner /></div>;
  if (!session) return <LoginScreen onLogin={handleLogin} />;
  
  if (session.type === 'admin') return <AdminBereich berufsbildner={berufsbildner} lernende={lernende} rapporte={rapporte} onLogout={handleLogout} onRefresh={loadData} />;
  
  if (session.type === 'berufsbildner') {
    const aktuell = berufsbildner.find(b => b.id === session.user.id) || session.user;
    return <BerufsbildnerBereich berufsbildner={aktuell} lernende={lernende} rapporte={rapporte} monatsBewertungen={monatsBewertungen} onLogout={handleLogout} onRefresh={loadData} />;
  }
  
  if (session.type === 'lernend') {
    const aktuell = lernende.find(l => l.id === session.user.id) || session.user;
    const bb = berufsbildner.find(b => b.id === aktuell.berufsbildnerId);
    return <LernendenBereich lernender={aktuell} rapporte={rapporte} berufsbildner={bb} monatsBewertungen={monatsBewertungen} onLogout={handleLogout} onRefresh={loadData} />;
  }
  
  return null;
}
