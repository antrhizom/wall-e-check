import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';

// ============================================================================
// DATENSTRUKTUR - Arbeiten und Kompetenzen aus dem Sammelrapport
// ============================================================================

const ARBEITSKATEGORIEN = {
  abbruch: {
    name: "Abbrucharbeiten",
    icon: "🔨",
    arbeiten: [
      "Schutzmassnahmen einrichten",
      "Abbruch- oder Demontagearbeiten fachgerecht ausführen"
    ]
  },
  schalungen: {
    name: "Schalungen",
    icon: "📐",
    arbeiten: [
      "Einzelfundamentschalung",
      "Streifenfundamentschalung",
      "Bodenplattenabschalung",
      "Wandschalung doppelhäuptig konventionell erstellen",
      "Wandschalung doppelhäuptig mit Grossflächenschalung erstellen",
      "Wandschalung einhäuptig erstellen",
      "Sichtschalung erstellen",
      "Pfeilerschalung erstellen",
      "Brüstungsschalung erstellen",
      "Türe / Fenster schalen",
      "Wandabschalung erstellen",
      "Betoniergerüst erstellen",
      "Aussparungschalung erstellen",
      "Deckenschalung konventionell erstellen",
      "Deckenschalung mit Paneelen erstellen",
      "Deckentischschalung erstellen",
      "Deckenrandabschalung erstellen",
      "Unterzugsschalung erstellen",
      "Verlorene Schalung erstellen",
      "Treppenschalung erstellen",
      "Rundschalung erstellen"
    ]
  },
  bewehrungen: {
    name: "Bewehrungen",
    icon: "🔗",
    arbeiten: [
      "Fundamentbewehrung erstellen",
      "Fundamentplatte Bewehrung erstellen",
      "Wand-/Brüstung Bewehrung erstellen",
      "Stützenbewehrung erstellen",
      "Deckenbewehrung erstellen",
      "Bewehrungsanschlüsse verlegen (Comax)",
      "Kragplattenanschlüsse verlegen",
      "Durchstanzbewehrung verlegen"
    ]
  },
  betonbau: {
    name: "Betonbau",
    icon: "🧱",
    arbeiten: [
      "Sauberkeitsschicht einbringen",
      "Sohlenbeton einbringen",
      "Füll- und Hüllbeton einbringen",
      "Arbeitsvorbereitung Wände betonieren",
      "Arbeitsvorbereitung Decke betonieren",
      "Fundament betonieren",
      "Brüstungen / Wände betonieren",
      "Decken betonieren",
      "Beton Nachbehandlung ausführen",
      "Beton abtaloschieren",
      "Beton monolitisch abtaloschieren",
      "Mauerkrone abtaloschieren",
      "Betonsanierung ausführen",
      "Betonkosmetik ausführen"
    ]
  },
  mauerwerk: {
    name: "Mauerwerk",
    icon: "🏗️",
    arbeiten: [
      "Arbeitsvorbereitung Rohmauerwerk",
      "Rohmauerwerk anzeichnen/einmessen",
      "Rohmauerwerk erstellen",
      "Arbeitsvorbereitung Sichtmauerwerk",
      "Sichtmauerwerk anzeichnen/einmessen",
      "Sichtmauerwerk erstellen",
      "Ergänzungsbauteile versetzen (Stürze/Heizungselemente)",
      "Meterriss erstellen",
      "Bockgerüst erstellen"
    ]
  },
  versetzarbeiten: {
    name: "Versetzarbeiten",
    icon: "🏢",
    arbeiten: [
      "Betonelemente versetzen",
      "Kleinteile versetzen (Kästen, Zargen, Wannenschürzen)"
    ]
  },
  beschichtungen: {
    name: "Beschichtungen",
    icon: "🎨",
    arbeiten: [
      "Instandsetzungsarbeiten (Betonsanierung)",
      "Oberflächenschutz",
      "Abdichtungen"
    ]
  },
  verputz: {
    name: "Verputz",
    icon: "🪣",
    arbeiten: [
      "Quarzbrücke aufziehen",
      "Anwurf",
      "Grundputz",
      "Deckputz"
    ]
  },
  unterlagsboeden: {
    name: "Unterlagsböden",
    icon: "📏",
    arbeiten: [
      "Unterlagsboden ausführen",
      "Zementüberzug ausführen",
      "Fliessestrich (Anhydrit)"
    ]
  },
  kanalisation: {
    name: "Kanalisation",
    icon: "🔧",
    arbeiten: [
      "Grabenaushub erstellen",
      "Grabenspriessung erstellen",
      "Leitungen vermessen und abstecken",
      "Kanalisationsleitung verlegen",
      "Sickerleitung verlegen",
      "Werkleitungen verlegen",
      "Kontrollschächte versetzen",
      "Leitungen einbetonieren",
      "Leitungsgraben auffüllen"
    ]
  },
  aushub: {
    name: "Aushub/Hinterfüllung",
    icon: "⛏️",
    arbeiten: [
      "Aushubarbeiten ausführen",
      "Böschungssicherungen erstellen",
      "Bauteil hinterfüllen und verdichten",
      "Schüttungsarbeiten ausführen"
    ]
  },
  wasserhaltung: {
    name: "Wasserhaltung",
    icon: "💧",
    arbeiten: [
      "Offene Wasserhaltung erstellen",
      "Neutralisation (pH-Wert)"
    ]
  },
  abdichtungen: {
    name: "Abdichtungen/Dämmungen",
    icon: "🛡️",
    arbeiten: [
      "Arbeitsfugen Abdichtung erstellen",
      "Abdichtungsfolie befestigen",
      "Dämmung verlegen",
      "Schwarzanstrich / Filterplatten"
    ]
  },
  gerueste: {
    name: "Gerüste/Absturzsicherung",
    icon: "🪜",
    arbeiten: [
      "Seitenschutz ausführen",
      "Baustellenzugänge erstellen",
      "Bodenöffnungen sichern",
      "Arbeitsgerüst erstellen"
    ]
  },
  vermessung: {
    name: "Vermessung",
    icon: "📍",
    arbeiten: [
      "Einmessarbeiten ausführen",
      "Planlesen / BIM",
      "Tachymeter bedienen",
      "Meterrisse erstellen",
      "Höhenkoten aufnehmen",
      "Absteckung erstellen",
      "Pythagoras anwenden"
    ]
  },
  allgemein: {
    name: "Allgemein",
    icon: "🔩",
    arbeiten: [
      "Baustelleninstallation",
      "MMK-Mehrmuldenkonzept",
      "Handhabung Kleingeräte",
      "Kompressor bedienen",
      "Materialdienst",
      "Aufräumarbeiten"
    ]
  },
  rapportwesen: {
    name: "Rapportwesen",
    icon: "📝",
    arbeiten: [
      "Stundenerfassung führen",
      "Tagesrapporte erstellen",
      "Regierapporte führen",
      "Ausmass unterstützen"
    ]
  }
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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('de-CH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('de-CH', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

// ============================================================================
// UI KOMPONENTEN
// ============================================================================

const RatingStars = ({ value, onChange, readOnly = false, size = 'normal' }) => {
  const [hover, setHover] = useState(0);
  const starSize = size === 'small' ? 'text-lg' : 'text-2xl';
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={`${starSize} transition-all duration-200 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(star)}
        >
          {star <= (hover || value) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
};

const ProgressBar = ({ value, max = 5, color = 'amber' }) => {
  const percentage = (value / max) * 100;
  const colors = { amber: 'bg-amber-500', green: 'bg-emerald-500', blue: 'bg-blue-500' };
  return (
    <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
      <div className={`h-full ${colors[color]} transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

const Card = ({ children, className = '', onClick }) => (
  <div 
    className={`bg-stone-800/50 backdrop-blur-sm border border-stone-700/50 rounded-2xl p-6 ${onClick ? 'cursor-pointer hover:border-amber-500/50 transition-all' : ''} ${className}`}
    onClick={onClick}
  >
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
  return (
    <button className={`rounded-xl transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-sm text-stone-400">{label}</label>}
    <input className="w-full bg-stone-800/50 border border-stone-600 rounded-xl px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none transition-colors" {...props} />
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-stone-800 border border-stone-700 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'admin') {
        const snapshot = await getDocs(query(collection(db, 'admins'), where('username', '==', username)));
        if (!snapshot.empty) {
          const admin = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          if (admin.password === password) {
            onLogin({ type: 'admin', user: admin });
            return;
          }
        }
        setError('Ungültige Anmeldedaten');
      } else if (mode === 'berufsbildner') {
        const snapshot = await getDocs(query(collection(db, 'berufsbildner'), where('username', '==', username)));
        if (!snapshot.empty) {
          const bb = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          if (bb.password === password) {
            onLogin({ type: 'berufsbildner', user: bb });
            return;
          }
        }
        setError('Ungültige Anmeldedaten');
      } else if (mode === 'lernend') {
        // Suche Berufsbildner mit diesem Code
        const bbSnapshot = await getDocs(collection(db, 'berufsbildner'));
        let foundBB = null;
        bbSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.codes?.includes(code.toUpperCase())) {
            foundBB = { id: doc.id, ...data };
          }
        });
        
        if (foundBB) {
          // Suche existierenden Lernenden
          const lernSnapshot = await getDocs(query(collection(db, 'lernende'), where('code', '==', code.toUpperCase())));
          
          if (!lernSnapshot.empty) {
            const lernender = { id: lernSnapshot.docs[0].id, ...lernSnapshot.docs[0].data() };
            onLogin({ type: 'lernend', user: lernender });
          } else if (name.trim()) {
            // Neuen Lernenden erstellen
            const newLernender = {
              name: name.trim(),
              code: code.toUpperCase(),
              berufsbildnerId: foundBB.id,
              lehrjahr: 1,
              startDatum: new Date().toISOString().split('T')[0]
            };
            const docRef = await addDoc(collection(db, 'lernende'), newLernender);
            onLogin({ type: 'lernend', user: { id: docRef.id, ...newLernender } });
          } else {
            setError('Bitte gib deinen Namen ein');
          }
        } else {
          setError('Ungültiger Code');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-stone-100 mb-2">MaurerCheck</h1>
          <p className="text-stone-400">Lernplattform für Maurerlehrlinge</p>
        </div>
        {mode === 'select' ? (
          <div className="space-y-4">
            <Button variant="primary" size="large" className="w-full" onClick={() => setMode('lernend')}>👷 Als Lernender einloggen</Button>
            <Button variant="secondary" size="large" className="w-full" onClick={() => setMode('berufsbildner')}>👨‍🏫 Als Berufsbildner einloggen</Button>
            <Button variant="ghost" className="w-full" onClick={() => setMode('admin')}>⚙️ Admin</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => { setMode('select'); setError(''); }} className="text-amber-500 hover:text-amber-400 flex items-center gap-2 mb-4">← Zurück</button>
            {mode === 'lernend' ? (
              <>
                <Input label="Zugangscode vom Berufsbildner" placeholder="z.B. ABC123" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
                <Input label="Dein Name (nur bei Erstanmeldung)" placeholder="Vor- und Nachname" value={name} onChange={(e) => setName(e.target.value)} />
              </>
            ) : (
              <>
                <Input label="Benutzername" value={username} onChange={(e) => setUsername(e.target.value)} />
                <Input label="Passwort" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button variant="primary" size="large" className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? 'Laden...' : 'Einloggen'}
            </Button>
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
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏗️</span>
          <span className="font-semibold text-stone-100 hidden sm:block">MaurerCheck</span>
        </div>
        <div className="flex gap-1">
          {[{ id: 'rapport', label: 'Rapport', icon: '📝' }, { id: 'dashboard', label: 'Dashboard', icon: '📊' }, { id: 'verlauf', label: 'Verlauf', icon: '📅' }].map(item => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`px-3 sm:px-4 py-2 rounded-lg transition-all ${currentView === item.id ? 'bg-amber-500/20 text-amber-400' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-700/50'}`}>
              <span className="sm:mr-2">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
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
  const [selectedKategorie, setSelectedKategorie] = useState(null);
  const [selectedArbeiten, setSelectedArbeiten] = useState([]);
  const [selectedKompetenzen, setSelectedKompetenzen] = useState([]);
  const [notizen, setNotizen] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const heute = new Date().toISOString().split('T')[0];
  const heutigerRapport = rapporte.find(r => r.lernenderId === lernender.id && r.datum === heute);
  
  useEffect(() => {
    if (heutigerRapport) {
      setSelectedArbeiten(heutigerRapport.arbeiten || []);
      setSelectedKompetenzen(heutigerRapport.kompetenzen || []);
      setNotizen(heutigerRapport.notizen || '');
    }
  }, [heutigerRapport]);
  
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
      const rapportData = {
        lernenderId: lernender.id,
        datum: heute,
        arbeiten: selectedArbeiten,
        kompetenzen: selectedKompetenzen,
        notizen,
        berufsbildnerBewertungen: heutigerRapport?.berufsbildnerBewertungen || [],
        kommentare: heutigerRapport?.kommentare || []
      };
      
      if (heutigerRapport) {
        await updateDoc(doc(db, 'rapporte', heutigerRapport.id), rapportData);
      } else {
        await addDoc(collection(db, 'rapporte'), rapportData);
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSave?.();
    } catch (err) {
      console.error(err);
      alert('Fehler beim Speichern. Bitte versuche es erneut.');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Tagesrapport</h1>
          <p className="text-stone-400">{formatDate(heute)}</p>
        </div>
        {heutigerRapport && <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">✓ Gespeichert</span>}
      </div>
      
      <Card>
        <h2 className="text-lg font-semibold text-stone-100 mb-4">Arbeitskategorie wählen</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Object.entries(ARBEITSKATEGORIEN).map(([key, kat]) => (
            <button key={key} onClick={() => setSelectedKategorie(selectedKategorie === key ? null : key)}
              className={`p-3 rounded-xl text-left transition-all ${selectedKategorie === key ? 'bg-amber-500/20 border-amber-500/50 border' : 'bg-stone-700/30 border border-stone-700 hover:border-stone-600'}`}>
              <span className="text-xl">{kat.icon}</span>
              <p className="text-sm text-stone-300 mt-1 truncate">{kat.name}</p>
              {selectedArbeiten.filter(a => a.kategorie === key).length > 0 && (
                <span className="inline-block mt-1 bg-amber-500 text-stone-900 text-xs px-2 py-0.5 rounded-full">{selectedArbeiten.filter(a => a.kategorie === key).length}</span>
              )}
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
                <div key={arbeit} className={`p-3 rounded-xl border transition-all ${selected ? 'bg-amber-500/10 border-amber-500/30' : 'bg-stone-700/20 border-stone-700 hover:border-stone-600'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={!!selected} onChange={() => toggleArbeit(selectedKategorie, arbeit)} className="mt-1 w-5 h-5 rounded" />
                    <span className="text-stone-200 flex-1">{arbeit}</span>
                  </label>
                  {selected && (
                    <div className="mt-3 ml-8 space-y-3">
                      <div>
                        <p className="text-sm text-stone-400 mb-1">Wie gut hast du es gemacht?</p>
                        <RatingStars value={selected.bewertung} onChange={(v) => updateArbeitBewertung(selectedKategorie, arbeit, 'bewertung', v)} />
                      </div>
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
      
      {selectedArbeiten.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">Ausgewählte Arbeiten ({selectedArbeiten.length})</h2>
          <div className="space-y-2">
            {selectedArbeiten.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-stone-700/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span>{ARBEITSKATEGORIEN[a.kategorie]?.icon}</span>
                  <span className="text-stone-200 text-sm">{a.arbeit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RatingStars value={a.bewertung} readOnly size="small" />
                  {a.verbessert && <span className="text-emerald-400">📈</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      <Card>
        <h2 className="text-lg font-semibold text-stone-100 mb-4">Geübte Kompetenzen</h2>
        <div className="flex flex-wrap gap-2">
          {KOMPETENZEN.map((komp) => (
            <button key={komp.id} onClick={() => toggleKompetenz(komp.id)}
              className={`px-4 py-2 rounded-full transition-all ${selectedKompetenzen.includes(komp.id) ? 'bg-amber-500 text-stone-900' : 'bg-stone-700/50 text-stone-300 hover:bg-stone-700'}`}>
              {komp.icon} {komp.name}
            </button>
          ))}
        </div>
      </Card>
      
      <Card>
        <h2 className="text-lg font-semibold text-stone-100 mb-4">Notizen zum Tag</h2>
        <textarea value={notizen} onChange={(e) => setNotizen(e.target.value)} placeholder="Was war heute besonders? Was hast du gelernt?"
          className="w-full h-32 bg-stone-700/30 border border-stone-600 rounded-xl p-4 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none resize-none" />
      </Card>
      
      <div className="flex justify-end gap-4">
        {saved && <span className="text-emerald-400 flex items-center gap-2">✓ Gespeichert!</span>}
        <Button variant="primary" size="large" onClick={saveRapport} disabled={selectedArbeiten.length === 0 || saving}>
          {saving ? 'Speichern...' : 'Rapport speichern'}
        </Button>
      </div>
    </div>
  );
};

const LernendenDashboard = ({ lernender, rapporte, berufsbildner }) => {
  const meineRapporte = rapporte.filter(r => r.lernenderId === lernender.id);
  const letzteWoche = meineRapporte.filter(r => {
    const diff = (new Date() - new Date(r.datum)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  
  const arbeitsStats = {};
  const kompetenzStats = {};
  meineRapporte.forEach(rapport => {
    rapport.arbeiten?.forEach(a => {
      if (!arbeitsStats[a.kategorie]) arbeitsStats[a.kategorie] = { count: 0, totalBewertung: 0, verbesserungen: 0 };
      arbeitsStats[a.kategorie].count++;
      arbeitsStats[a.kategorie].totalBewertung += a.bewertung || 0;
      if (a.verbessert) arbeitsStats[a.kategorie].verbesserungen++;
    });
    rapport.kompetenzen?.forEach(k => { kompetenzStats[k] = (kompetenzStats[k] || 0) + 1; });
  });
  
  const kategorieAverages = Object.entries(arbeitsStats)
    .map(([kat, stats]) => ({ kategorie: kat, name: ARBEITSKATEGORIEN[kat]?.name || kat, icon: ARBEITSKATEGORIEN[kat]?.icon || '📋', average: stats.count > 0 ? stats.totalBewertung / stats.count : 0, count: stats.count }))
    .sort((a, b) => b.count - a.count);
  
  const topKompetenzen = Object.entries(kompetenzStats).map(([id, count]) => ({ ...KOMPETENZEN.find(k => k.id === id), count })).sort((a, b) => b.count - a.count).slice(0, 5);
  
  const bewertungsVerlauf = meineRapporte.sort((a, b) => new Date(a.datum) - new Date(b.datum)).slice(-10)
    .map(r => ({ datum: formatDateShort(r.datum), bewertung: r.arbeiten?.length > 0 ? r.arbeiten.reduce((sum, a) => sum + (a.bewertung || 0), 0) / r.arbeiten.length : 0 }));
  
  const neueKommentare = meineRapporte.flatMap(r => (r.kommentare || []).map(k => ({ ...k, rapportDatum: r.datum }))).slice(-3);
  
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div><h1 className="text-2xl font-bold text-stone-100">Dashboard</h1><p className="text-stone-400">Dein Ausbildungsfortschritt</p></div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><p className="text-stone-400 text-sm">Rapporte gesamt</p><p className="text-3xl font-bold text-stone-100 mt-1">{meineRapporte.length}</p></Card>
        <Card><p className="text-stone-400 text-sm">Diese Woche</p><p className="text-3xl font-bold text-amber-400 mt-1">{letzteWoche.length}</p></Card>
        <Card><p className="text-stone-400 text-sm">Ø Selbstbewertung</p><p className="text-3xl font-bold text-emerald-400 mt-1">{meineRapporte.length > 0 ? (meineRapporte.flatMap(r => r.arbeiten || []).reduce((sum, a) => sum + (a.bewertung || 0), 0) / Math.max(1, meineRapporte.flatMap(r => r.arbeiten || []).length)).toFixed(1) : '-'}</p></Card>
        <Card><p className="text-stone-400 text-sm">Verbesserungen</p><p className="text-3xl font-bold text-blue-400 mt-1">{meineRapporte.flatMap(r => r.arbeiten || []).filter(a => a.verbessert).length}</p></Card>
      </div>
      
      {bewertungsVerlauf.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">📈 Bewertungsverlauf</h2>
          <div className="h-40 flex items-end gap-2">
            {bewertungsVerlauf.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-amber-500/80 rounded-t transition-all" style={{ height: `${(item.bewertung / 5) * 100}%` }} />
                <span className="text-xs text-stone-500 rotate-45 origin-left whitespace-nowrap">{item.datum}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">🏗️ Arbeiten nach Bereich</h2>
          <div className="space-y-3">
            {kategorieAverages.slice(0, 6).map(kat => (
              <div key={kat.kategorie}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-stone-300 text-sm">{kat.icon} {kat.name}</span>
                  <span className="text-stone-400 text-sm">{kat.count}× | Ø {kat.average.toFixed(1)}</span>
                </div>
                <ProgressBar value={kat.average} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">💪 Meistgeübte Kompetenzen</h2>
          {topKompetenzen.length > 0 ? (
            <div className="space-y-3">
              {topKompetenzen.map(komp => (
                <div key={komp.id} className="flex items-center justify-between p-3 bg-stone-700/30 rounded-xl">
                  <span className="text-stone-200">{komp.icon} {komp.name}</span>
                  <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full text-sm">{komp.count}×</span>
                </div>
              ))}
            </div>
          ) : <p className="text-stone-500">Noch keine Kompetenzen erfasst</p>}
        </Card>
      </div>
      
      {neueKommentare.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">💬 Neueste Kommentare</h2>
          <div className="space-y-3">
            {neueKommentare.map((k, i) => (
              <div key={i} className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 font-medium">{k.autor}</span>
                  <span className="text-stone-500 text-sm">{formatDateShort(k.rapportDatum)}</span>
                </div>
                <p className="text-stone-300">{k.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {berufsbildner && (
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">👨‍🏫 Dein Berufsbildner</h2>
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
      {meineRapporte.length === 0 ? (
        <Card><p className="text-stone-400 text-center py-8">Noch keine Rapporte vorhanden.</p></Card>
      ) : (
        <div className="space-y-4">
          {meineRapporte.map(rapport => (
            <Card key={rapport.id} onClick={() => setSelectedRapport(rapport)} className="hover:border-amber-500/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-stone-100 font-medium">{formatDate(rapport.datum)}</p>
                  <p className="text-stone-400 text-sm mt-1">{rapport.arbeiten?.length || 0} Arbeiten • {rapport.kompetenzen?.length || 0} Kompetenzen</p>
                </div>
                <div className="text-right">
                  <RatingStars value={rapport.arbeiten?.length > 0 ? rapport.arbeiten.reduce((s, a) => s + (a.bewertung || 0), 0) / rapport.arbeiten.length : 0} readOnly size="small" />
                  {(rapport.kommentare?.length > 0 || rapport.berufsbildnerBewertungen?.length > 0) && <span className="text-blue-400 text-sm block">💬 Feedback</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal isOpen={!!selectedRapport} onClose={() => setSelectedRapport(null)} title={selectedRapport ? formatDate(selectedRapport.datum) : ''}>
        {selectedRapport && (
          <div className="space-y-4">
            <div>
              <h3 className="text-stone-400 text-sm mb-2">Arbeiten</h3>
              <div className="space-y-2">
                {selectedRapport.arbeiten?.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-stone-700/30 rounded-lg">
                    <span className="text-stone-200 text-sm">{ARBEITSKATEGORIEN[a.kategorie]?.icon} {a.arbeit}</span>
                    <div className="flex items-center gap-2"><RatingStars value={a.bewertung} readOnly size="small" />{a.verbessert && <span>📈</span>}</div>
                  </div>
                ))}
              </div>
            </div>
            {selectedRapport.kompetenzen?.length > 0 && (
              <div>
                <h3 className="text-stone-400 text-sm mb-2">Kompetenzen</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRapport.kompetenzen.map(k => { const komp = KOMPETENZEN.find(c => c.id === k); return komp && <span key={k} className="bg-amber-500/20 text-amber-400 text-sm px-3 py-1 rounded-full">{komp.icon} {komp.name}</span>; })}
                </div>
              </div>
            )}
            {selectedRapport.notizen && <div><h3 className="text-stone-400 text-sm mb-2">Notizen</h3><p className="text-stone-300 bg-stone-700/30 p-3 rounded-lg">{selectedRapport.notizen}</p></div>}
            {selectedRapport.kommentare?.length > 0 && (
              <div>
                <h3 className="text-blue-400 text-sm mb-2">Kommentare</h3>
                {selectedRapport.kommentare.map((k, i) => (
                  <div key={i} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-2">
                    <span className="text-blue-400 font-medium text-sm">{k.autor}</span>
                    <p className="text-stone-300 text-sm mt-1">{k.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const LernendenBereich = ({ lernender, rapporte, berufsbildner, onLogout, onRefresh }) => {
  const [currentView, setCurrentView] = useState('rapport');
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      <LernendenNav currentView={currentView} onNavigate={setCurrentView} onLogout={onLogout} userName={lernender.name} />
      {currentView === 'rapport' && <RapportForm lernender={lernender} rapporte={rapporte} onSave={onRefresh} />}
      {currentView === 'dashboard' && <LernendenDashboard lernender={lernender} rapporte={rapporte} berufsbildner={berufsbildner} />}
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
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏗️</span>
          <span className="font-semibold text-stone-100 hidden sm:block">MaurerCheck</span>
          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">BB</span>
        </div>
        <div className="flex gap-1">
          {[{ id: 'lernende', label: 'Lernende', icon: '👷' }, { id: 'codes', label: 'Codes', icon: '🔑' }, { id: 'uebersicht', label: 'Übersicht', icon: '📊' }].map(item => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`px-3 sm:px-4 py-2 rounded-lg transition-all ${currentView === item.id ? 'bg-blue-500/20 text-blue-400' : 'text-stone-400 hover:text-stone-100'}`}>
              <span className="sm:mr-2">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
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
      await updateDoc(doc(db, 'rapporte', rapportId), {
        kommentare: [...(rapport.kommentare || []), { autor: berufsbildner.name, text: commentText, datum: new Date().toISOString().split('T')[0] }]
      });
      setCommentText('');
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const addBewertung = async (rapportId, arbeit, bewertung) => {
    try {
      const rapport = rapporte.find(r => r.id === rapportId);
      const existing = (rapport.berufsbildnerBewertungen || []).filter(b => b.arbeit !== arbeit.arbeit);
      await updateDoc(doc(db, 'rapporte', rapportId), {
        berufsbildnerBewertungen: [...existing, { kategorie: arbeit.kategorie, arbeit: arbeit.arbeit, bewertung, kommentar: '' }]
      });
      onRefresh?.();
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div><h1 className="text-2xl font-bold text-stone-100">Meine Lernenden</h1><p className="text-stone-400">{meineLernende.length} Lernende</p></div>
      {meineLernende.length === 0 ? (
        <Card><p className="text-stone-400 text-center py-8">Noch keine Lernenden. Erstelle einen Code unter "Codes".</p></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meineLernende.map(lernender => {
            const lernRapporte = rapporte.filter(r => r.lernenderId === lernender.id);
            const letzterRapport = lernRapporte.sort((a, b) => new Date(b.datum) - new Date(a.datum))[0];
            return (
              <Card key={lernender.id} onClick={() => setSelectedLernender(lernender)} className="hover:border-blue-500/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center text-2xl">👷</div>
                  <div><p className="text-stone-100 font-medium">{lernender.name}</p><p className="text-stone-400 text-sm">{lernender.lehrjahr}. Lehrjahr</p></div>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-700">
                  <div className="flex justify-between text-sm"><span className="text-stone-400">Rapporte:</span><span className="text-stone-200">{lernRapporte.length}</span></div>
                  <div className="flex justify-between text-sm mt-1"><span className="text-stone-400">Letzter:</span><span className="text-stone-200">{letzterRapport ? formatDateShort(letzterRapport.datum) : '-'}</span></div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal isOpen={!!selectedLernender} onClose={() => { setSelectedLernender(null); setSelectedRapport(null); }} title={selectedLernender?.name || ''}>
        {selectedLernender && !selectedRapport && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-stone-700/30 rounded-xl">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center text-3xl">👷</div>
              <div><p className="text-stone-100 font-medium">{selectedLernender.name}</p><p className="text-stone-400">{selectedLernender.lehrjahr}. Lehrjahr</p><p className="text-stone-500 text-sm">Code: {selectedLernender.code}</p></div>
            </div>
            <h3 className="text-stone-400 text-sm">Rapporte</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {rapporte.filter(r => r.lernenderId === selectedLernender.id).sort((a, b) => new Date(b.datum) - new Date(a.datum)).map(rapport => (
                <button key={rapport.id} onClick={() => setSelectedRapport(rapport)} className="w-full p-3 bg-stone-700/30 rounded-lg text-left hover:bg-stone-700/50 transition-all">
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
              <h4 className="text-stone-400 text-sm">Arbeiten bewerten</h4>
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
              <h4 className="text-stone-400 text-sm">Kommentar hinzufügen</h4>
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Feedback..." className="w-full h-24 bg-stone-700/30 border border-stone-600 rounded-xl p-3 text-stone-100 placeholder-stone-500 focus:border-blue-500 focus:outline-none resize-none" />
              <Button variant="primary" onClick={() => addComment(selectedRapport.id)} disabled={!commentText.trim() || saving}>{saving ? 'Senden...' : 'Kommentar senden'}</Button>
            </div>
          </div>
        )}
      </Modal>
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
      await updateDoc(doc(db, 'berufsbildner', berufsbildner.id), {
        codes: [...(berufsbildner.codes || []), code]
      });
      setNewCode(code);
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const deleteCode = async (code) => {
    if (lernende.some(l => l.code === code)) { alert('Code wird verwendet!'); return; }
    try {
      await updateDoc(doc(db, 'berufsbildner', berufsbildner.id), {
        codes: (berufsbildner.codes || []).filter(c => c !== code)
      });
      onRefresh?.();
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div><h1 className="text-2xl font-bold text-stone-100">Zugangscodes</h1><p className="text-stone-400">Codes für neue Lernende</p></div>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-100">Neuen Code erstellen</h2>
          <Button variant="primary" onClick={createCode} disabled={saving}>{saving ? '...' : '+ Neuer Code'}</Button>
        </div>
        {newCode && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4">
            <p className="text-emerald-400 mb-2">Neuer Code erstellt!</p>
            <p className="text-3xl font-mono font-bold text-stone-100">{newCode}</p>
          </div>
        )}
        <h3 className="text-stone-400 text-sm mb-2">Aktive Codes</h3>
        <div className="space-y-2">
          {(berufsbildner.codes || []).map(code => {
            const lernender = lernende.find(l => l.code === code);
            return (
              <div key={code} className="flex items-center justify-between p-3 bg-stone-700/30 rounded-xl">
                <div><span className="font-mono text-lg text-stone-100">{code}</span>{lernender && <span className="ml-3 text-stone-400 text-sm">→ {lernender.name}</span>}</div>
                {!lernender && <Button variant="danger" size="small" onClick={() => deleteCode(code)}>Löschen</Button>}
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
  const dieseWoche = meineRapporte.filter(r => (new Date() - new Date(r.datum)) / (1000 * 60 * 60 * 24) <= 7);
  const unbewertete = meineRapporte.filter(r => !r.berufsbildnerBewertungen || r.berufsbildnerBewertungen.length === 0);
  
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div><h1 className="text-2xl font-bold text-stone-100">Übersicht</h1></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><p className="text-stone-400 text-sm">Lernende</p><p className="text-3xl font-bold text-stone-100 mt-1">{meineLernende.length}</p></Card>
        <Card><p className="text-stone-400 text-sm">Rapporte total</p><p className="text-3xl font-bold text-blue-400 mt-1">{meineRapporte.length}</p></Card>
        <Card><p className="text-stone-400 text-sm">Diese Woche</p><p className="text-3xl font-bold text-emerald-400 mt-1">{dieseWoche.length}</p></Card>
        <Card><p className="text-stone-400 text-sm">Zu bewerten</p><p className="text-3xl font-bold text-amber-400 mt-1">{unbewertete.length}</p></Card>
      </div>
      <Card>
        <h2 className="text-lg font-semibold text-stone-100 mb-4">Aktivität letzte 7 Tage</h2>
        <div className="space-y-3">
          {meineLernende.map(lernender => {
            const lernRapporte = meineRapporte.filter(r => r.lernenderId === lernender.id && (new Date() - new Date(r.datum)) / (1000 * 60 * 60 * 24) <= 7);
            return (
              <div key={lernender.id} className="flex items-center gap-4">
                <div className="w-32 text-stone-300 truncate">{lernender.name}</div>
                <div className="flex-1"><ProgressBar value={lernRapporte.length} max={7} color="blue" /></div>
                <span className="text-stone-400 text-sm w-16 text-right">{lernRapporte.length}/7</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

const BerufsbildnerBereich = ({ berufsbildner, lernende, rapporte, onLogout, onRefresh }) => {
  const [currentView, setCurrentView] = useState('lernende');
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      <BerufsbildnerNav currentView={currentView} onNavigate={setCurrentView} onLogout={onLogout} userName={berufsbildner.name} />
      {currentView === 'lernende' && <BerufsbildnerLernende berufsbildner={berufsbildner} lernende={lernende} rapporte={rapporte} onRefresh={onRefresh} />}
      {currentView === 'codes' && <BerufsbildnerCodes berufsbildner={berufsbildner} lernende={lernende} onRefresh={onRefresh} />}
      {currentView === 'uebersicht' && <BerufsbildnerUebersicht berufsbildner={berufsbildner} lernende={lernende} rapporte={rapporte} />}
    </div>
  );
};

// ============================================================================
// ADMIN BEREICH
// ============================================================================

const AdminBereich = ({ admins, berufsbildner, lernende, rapporte, onLogout, onRefresh }) => {
  const [newBBName, setNewBBName] = useState('');
  const [newBBUsername, setNewBBUsername] = useState('');
  const [newBBPassword, setNewBBPassword] = useState('');
  const [newBBFirma, setNewBBFirma] = useState('');
  const [saving, setSaving] = useState(false);
  
  const createBerufsbildner = async () => {
    if (!newBBName || !newBBUsername || !newBBPassword) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'berufsbildner'), {
        name: newBBName,
        username: newBBUsername,
        password: newBBPassword,
        firma: newBBFirma,
        codes: []
      });
      setNewBBName(''); setNewBBUsername(''); setNewBBPassword(''); setNewBBFirma('');
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const deleteBerufsbildner = async (id) => {
    if (lernende.some(l => l.berufsbildnerId === id)) { alert('Berufsbildner hat noch Lernende!'); return; }
    try {
      await deleteDoc(doc(db, 'berufsbildner', id));
      onRefresh?.();
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      <nav className="bg-stone-800/80 backdrop-blur-md border-b border-stone-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏗️</span>
            <span className="font-semibold text-stone-100">MaurerCheck</span>
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <Button variant="ghost" size="small" onClick={onLogout}>Abmelden</Button>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div><h1 className="text-2xl font-bold text-stone-100">Admin-Bereich</h1><p className="text-stone-400">Berufsbildner verwalten</p></div>
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">Neuen Berufsbildner erstellen</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Name" value={newBBName} onChange={(e) => setNewBBName(e.target.value)} placeholder="Hans Meier" />
            <Input label="Firma" value={newBBFirma} onChange={(e) => setNewBBFirma(e.target.value)} placeholder="Bau AG" />
            <Input label="Benutzername" value={newBBUsername} onChange={(e) => setNewBBUsername(e.target.value)} placeholder="meier" />
            <Input label="Passwort" value={newBBPassword} onChange={(e) => setNewBBPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button variant="primary" className="mt-4" onClick={createBerufsbildner} disabled={!newBBName || !newBBUsername || !newBBPassword || saving}>
            {saving ? 'Erstellen...' : 'Berufsbildner erstellen'}
          </Button>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">Berufsbildner ({berufsbildner.length})</h2>
          <div className="space-y-3">
            {berufsbildner.map(bb => {
              const lernendeAnzahl = lernende.filter(l => l.berufsbildnerId === bb.id).length;
              return (
                <div key={bb.id} className="flex items-center justify-between p-4 bg-stone-700/30 rounded-xl">
                  <div>
                    <p className="text-stone-100 font-medium">{bb.name}</p>
                    <p className="text-stone-400 text-sm">{bb.firma || 'Keine Firma'} • {bb.username}</p>
                    <p className="text-stone-500 text-sm">{lernendeAnzahl} Lernende • {(bb.codes || []).length} Codes</p>
                  </div>
                  <Button variant="danger" size="small" onClick={() => deleteBerufsbildner(bb.id)} disabled={lernendeAnzahl > 0}>Löschen</Button>
                </div>
              );
            })}
          </div>
        </Card>
        <div className="grid md:grid-cols-3 gap-4">
          <Card><p className="text-stone-400 text-sm">Berufsbildner</p><p className="text-3xl font-bold text-stone-100 mt-1">{berufsbildner.length}</p></Card>
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
  const [data, setData] = useState({ admins: [], berufsbildner: [], lernende: [], rapporte: [] });
  
  const loadData = async () => {
    try {
      const [adminsSnap, bbSnap, lernSnap, rapSnap] = await Promise.all([
        getDocs(collection(db, 'admins')),
        getDocs(collection(db, 'berufsbildner')),
        getDocs(collection(db, 'lernende')),
        getDocs(collection(db, 'rapporte'))
      ]);
      
      setData({
        admins: adminsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        berufsbildner: bbSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        lernende: lernSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        rapporte: rapSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      });
    } catch (err) {
      console.error('Fehler beim Laden:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { loadData(); }, []);
  
  const handleLogout = () => setSession(null);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!session) return <LoginScreen onLogin={setSession} />;
  
  if (session.type === 'admin') {
    return <AdminBereich {...data} onLogout={handleLogout} onRefresh={loadData} />;
  }
  
  if (session.type === 'berufsbildner') {
    const aktuellerBB = data.berufsbildner.find(b => b.id === session.user.id) || session.user;
    return <BerufsbildnerBereich berufsbildner={aktuellerBB} lernende={data.lernende} rapporte={data.rapporte} onLogout={handleLogout} onRefresh={loadData} />;
  }
  
  if (session.type === 'lernend') {
    const aktuellerLernender = data.lernende.find(l => l.id === session.user.id) || session.user;
    const bb = data.berufsbildner.find(b => b.id === aktuellerLernender.berufsbildnerId);
    return <LernendenBereich lernender={aktuellerLernender} rapporte={data.rapporte} berufsbildner={bb} onLogout={handleLogout} onRefresh={loadData} />;
  }
  
  return null;
}
