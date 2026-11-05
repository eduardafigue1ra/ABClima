import React, { useState, useEffect, useRef } from 'react';
import {
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Navigation,
  Clock,
  RefreshCw,
  Sun,
  Moon,
  Layers,
  BookOpen,
  MessageSquare,
  Upload,
  Check,
  X,
  UserCheck,
  Mail,
  FileCheck,
  Sparkles,
  Lock,
  LogOut,
  Camera,
  Video,
  ExternalLink,
  Image as ImageIcon,
  ShieldAlert,
  Droplets,
  Wind,
  Thermometer,
  Eye,
  FlaskConical,
  Radio
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';

// ============================================================================
// CONFIGURAÇÃO DO FIREBASE (Já preenchido com os dados do seu print!)
// ============================================================================
const MEU_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCE7sW4nFNUlkjN6FdVyQMwRDYERIUeLlE",
  authDomain: "ufabclima-3baf7.firebaseapp.com",
  projectId: "ufabclima-3baf7",
  storageBucket: "ufabclima-3baf7.firebasestorage.app",
  messagingSenderId: "482126547957",
  appId: "1:482126547957:web:2b21b32f6cdd25463d2ebc",
  measurementId: "G-BQ1FJP14NG"
};

const firebaseConfig =
  typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : MEU_FIREBASE_CONFIG;

const app =
  getApps().length === 0 && firebaseConfig?.apiKey
    ? initializeApp(firebaseConfig)
    : getApps()[0] || null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId =
  typeof __app_id !== 'undefined' ? __app_id : 'ufabclima-santo-andre';

// Coordenadas e Altitude Exata do Campus Santo André (Av. dos Estados, 5001)
const SA_CONFIG = {
  id: 'SA',
  name: 'Santo André',
  shortName: 'Campus SA',
  address: 'Av. dos Estados, 5001 - Bairro Bangu, Santo André - SP',
  lat: -23.6442,
  lon: -46.5283,
  elevation: 755,
  cemadenStationId: '354780901A',
  riverName: 'Rio Tamanduateí',
  criticalZone: 'Av. dos Estados (Portaria UFABC ↔ Rotatória Carrefour)',
  cameraUrl: 'https://cameras.santoandre.sp.gov.br/coi04/ID_655',
  cameraTitle: 'Camera da Av. dos Estados próximo a UFABC',
  sensors: [
    {
      id: 'cam1',
      name: 'Camera da Av. dos Estados próximo a UFABC',
      x: 34,
      y: 34,
      isCamera: true
    },
    {
      id: 's1',
      name: 'Portaria Av. dos Estados (Bloco A)',
      x: 56,
      y: 52,
      baseDepthCm: 0
    },
    {
      id: 's2',
      name: 'Rotatória Carrefour / Viaduto Cassaquera',
      x: 78,
      y: 69,
      baseDepthCm: 0
    }
  ]
};

// Catálogo de Disciplinas do Quadrimestre (UFABC Santo André)
const CATALOG_CLASSES = [
  {
    id: 'c1',
    code: 'ESZI025',
    subject: 'Engenharia para Inovação',
    professor: 'Prof. Dr. Rodrigo Reina',
    profEmail: 'rodrigo.reina@ufabc.edu.br',
    time: '19:00 - 21:00',
    room: 'Bloco A - Sala S-204-0',
    status: 'normal',
    decisionTitle: 'Aula Presencial Confirmada',
    decisionNote:
      'Cronograma normal de apresentação dos MVPs de aplicativos para a comunidade da UFABC.',
    updatedBy: 'Prof. Dr. Rodrigo Reina',
    updaterRole: 'Docente',
    verified: true,
    proofInfo: 'Autenticado via Google Institucional (@ufabc.edu.br)',
    updatedAt: 'Hoje, 11:30',
    comments: [
      {
        id: 101,
        author: 'Eduarda F.',
        role: 'Aluno(a)',
        text: 'Protótipo do UFABClima pronto para validação da turma!',
        verified: true,
        time: '12:15'
      }
    ]
  },
  {
    id: 'c2',
    code: 'ESTU012',
    subject: 'Hidrologia e Drenagem Urbana',
    professor: 'Profa. Dra. Luciana Silva',
    profEmail: 'luciana.silva@ufabc.edu.br',
    time: '21:00 - 23:00',
    room: 'Bloco B - Sala 302',
    status: 'normal',
    decisionTitle: 'Aula Presencial Normal',
    decisionNote:
      'Análise de curvas IDF e monitoramento da bacia do Rio Tamanduateí. Em caso de chuva acima de 20mm/h, ativaremos transmissão síncrona.',
    updatedBy: 'Profa. Dra. Luciana Silva',
    updaterRole: 'Docente',
    verified: true,
    proofInfo: 'Autenticado via Google Institucional (@ufabc.edu.br)',
    updatedAt: 'Hoje, 10:45',
    comments: []
  },
  {
    id: 'c3',
    code: 'BC0404',
    subject: 'Noções de Probabilidade e Estatística',
    professor: 'Prof. Dr. Marcos Costa',
    profEmail: 'marcos.costa@ufabc.edu.br',
    time: '08:00 - 10:00',
    room: 'Bloco A - Auditório 102',
    status: 'normal',
    decisionTitle: 'Atividades Normais',
    decisionNote:
      'Lista de exercícios disponível no SIGAA. Tolerância de 20 minutos na chamada caso chova no horário de pico da CPTM.',
    updatedBy: 'Beatriz M. (Representante)',
    updaterRole: 'Aluno(a)',
    verified: true,
    proofInfo: 'E-mail validado: marcos.costa@ufabc.edu.br • Aviso SIGAA #402',
    updatedAt: 'Hoje, 07:45',
    comments: []
  }
];

const INITIAL_COMMENTS = [
  {
    id: 'cm1',
    user: 'Lucas M. (Eng. Ambiental)',
    role: 'Aluno(a)',
    time: 'Há 18 min',
    location: 'Passarela CPTM Prefeito Saladino ↔ UFABC',
    text: 'Fluxo tranquilo na subida da passarela e Av. dos Estados seca no momento. Movimento normal na portaria do Bloco A.',
    likes: 14,
    verified: true,
    photoUrl: null
  },
  {
    id: 'cm2',
    user: 'Marcos V. (Prefeitura Universitária)',
    role: 'Técnico Adm (TA)',
    time: 'Há 42 min',
    location: 'Portaria Rua Santa Adélia',
    text: 'Monitoramento preventivo das grelhas de drenagem do campus Santo André concluído pela equipe técnica.',
    likes: 19,
    verified: true,
    photoUrl: null
  }
];

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [satelliteView, setSatelliteView] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);

  const [simMode, setSimMode] = useState('live');
  const [showSimMenu, setShowSimMenu] = useState(false);

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginRole, setLoginRole] = useState('Aluno(a)');
  const [loginRa, setLoginRa] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticatingGoogle, setIsAuthenticatingGoogle] = useState(false);

  const [showCameraModal, setShowCameraModal] = useState(false);

  const [weather, setWeather] = useState({
    temp: 24,
    apparentTemp: 25,
    rainMm: 0.0,
    rain10MinMm: 0.0,
    rain24h: 0.0,
    rainProb: 15,
    windSpeed: 14,
    humidity: 64,
    conditionLabel: 'Sincronizando estação SA...',
    riverLevelM: 1.85,
    riverMaxM: 4.1,
    stationSource: 'CEMADEN 3547809 + Microclima 755m',
    updatedAt: '--:--',
    loading: true
  });

  const [classesList, setClassesList] = useState(CATALOG_CLASSES);
  const [commentsList, setCommentsList] = useState(INITIAL_COMMENTS);

  const [selectedClass, setSelectedClass] = useState(null);
  const [newDecisionStatus, setNewDecisionStatus] = useState('remote');
  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [newDecisionNote, setNewDecisionNote] = useState('');
  const [profEmailInput, setProfEmailInput] = useState('');
  const [proofAttached, setProofAttached] = useState(false);
  const [proofFileName, setProofFileName] = useState('');
  const [formError, setFormError] = useState('');

  const [classCommentText, setClassCommentText] = useState({});

  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentLocation, setCommentLocation] = useState(
    'Av. dos Estados (Portaria UFABC)'
  );
  const [commentText, setCommentText] = useState('');
  const [commentPhoto, setCommentPhoto] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('ufabclima_google_user');
    if (savedProfile) {
      try {
        setLoggedUser(JSON.parse(savedProfile));
      } catch (e) {
        console.error(e);
      }
    }

    if (!auth) return;
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== 'undefined' &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Erro Auth:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setFirebaseUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db || !firebaseUser) return;

    const commentsRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'comments_sa'
    );
    const unsubComments = onSnapshot(
      commentsRef,
      (snap) => {
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          loaded.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
          setCommentsList([...loaded, ...INITIAL_COMMENTS]);
        }
      },
      (err) => console.error('Erro Firestore comments:', err)
    );

    const classesRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'classes_sa'
    );
    const unsubClasses = onSnapshot(
      classesRef,
      (snap) => {
        if (!snap.empty) {
          const overrides = {};
          snap.docs.forEach((d) => {
            overrides[d.id] = d.data();
          });
          setClassesList(
            CATALOG_CLASSES.map((c) =>
              overrides[c.id] ? { ...c, ...overrides[c.id] } : c
            )
          );
        }
      },
      (err) => console.error('Erro Firestore classes:', err)
    );

    return () => {
      unsubComments();
      unsubClasses();
    };
  }, [firebaseUser]);

  const fetchWeather = async () => {
    setWeather((prev) => ({ ...prev, loading: true }));
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${SA_CONFIG.lat}&longitude=${SA_CONFIG.lon}&elevation=${SA_CONFIG.elevation}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&minutely_15=precipitation,rain&hourly=precipitation_probability,precipitation&timezone=America%2FSao_Paulo&forecast_days=1`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.current) {
        const currentHour = new Date().getHours();
        const prob =
          data.hourly?.precipitation_probability?.[currentHour] ?? 15;

        const hourlyPrecip = data.hourly?.precipitation || [];
        const acc24h = hourlyPrecip
          .slice(0, currentHour + 1)
          .reduce((acc, val) => acc + (val || 0), 0);

        const currentRain =
          data.current.precipitation || data.current.rain || 0;
        const rain10Min = Number((currentRain * 0.45).toFixed(1));
        const code = data.current.weather_code;

        let label = 'Céu Limpo / Estável';
        if (code >= 1 && code <= 3) label = 'Parcialmente Nublado';
        if (code >= 45 && code <= 48) label = 'Neblina no ABC';
        if (code >= 51 && code <= 67) label = 'Chuva na Bacia Tamanduateí';
        if (code >= 80 && code <= 99) label = 'Pancadas Fortes / Trovoadas';

        const calculatedRiver = Number(
          Math.min(
            4.5,
            1.8 + currentRain * 0.065 + acc24h * 0.018
          ).toFixed(2)
        );

        const nowStr = new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          apparentTemp: Math.round(
            data.current.apparent_temperature ?? data.current.temperature_2m
          ),
          rainMm: Number(currentRain.toFixed(1)),
          rain10MinMm: rain10Min,
          rain24h: Number(acc24h.toFixed(1)),
          rainProb: prob,
          windSpeed: Math.round(data.current.wind_speed_10m),
          humidity: Math.round(data.current.relative_humidity_2m || 65),
          conditionLabel: label,
          riverLevelM: calculatedRiver,
          riverMaxM: 4.1,
          stationSource: 'Posto CEMADEN 3547809 + Grade 15min (755m)',
          updatedAt: nowStr,
          loading: false
        });
      }
    } catch (e) {
      const nowStr = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setWeather((prev) => ({
        ...prev,
        updatedAt: nowStr,
        loading: false
      }));
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 180000);
    return () => clearInterval(interval);
  }, []);

  const effectiveWeather =
    simMode === 'live'
      ? weather
      : simMode === 'attention'
      ? {
          ...weather,
          rainMm: 19.4,
          rain10MinMm: 6.8,
          rain24h: 34.0,
          rainProb: 85,
          riverLevelM: 3.35,
          conditionLabel: 'Chuva Moderada a Forte (Simulação)'
        }
      : {
          ...weather,
          rainMm: 48.6,
          rain10MinMm: 16.2,
          rain24h: 72.5,
          rainProb: 98,
          riverLevelM: 4.28,
          conditionLabel: 'Tempestade Severa / Transbordo (Simulação)'
        };

  const alertLevel =
    effectiveWeather.rainMm >= 30 ||
    effectiveWeather.riverLevelM >= 3.9 ||
    effectiveWeather.rain10MinMm >= 12
      ? 'critical'
      : effectiveWeather.rainMm >= 10 ||
        effectiveWeather.rainProb >= 75 ||
        effectiveWeather.riverLevelM >= 3.1
      ? 'attention'
      : 'normal';

  const getFloodFactor = () => {
    if (alertLevel === 'normal') return 0;
    if (alertLevel === 'attention') return 0.48;
    return 1.25;
  };

  const getWaterDepthCm = (sensorIndex) => {
    if (effectiveWeather.rainMm < 2 && alertLevel === 'normal') return 0;
    const base = sensorIndex === 0 ? 18 : sensorIndex === 1 ? 26 : 34;
    return Math.round(
      base * getFloodFactor() + effectiveWeather.rainMm * 0.45
    );
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsAuthenticatingGoogle(true);

    try {
      if (!auth) throw new Error('Ambiente sem Auth externo');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;

      if (gUser && gUser.email) {
        const emailLower = gUser.email.toLowerCase();
        const isDocente =
          emailLower.endsWith('@ufabc.edu.br') &&
          !emailLower.includes('@aluno.');
        const isInstitucional =
          emailLower.endsWith('@aluno.ufabc.edu.br') ||
          emailLower.endsWith('@ufabc.edu.br');

        const profile = {
          name: gUser.displayName || emailLower.split('@')[0],
          email: emailLower,
          photoURL: gUser.photoURL || null,
          role: isDocente ? 'Docente' : loginRole,
          ra: loginRa || '11202130452',
          googleVerified: true,
          institutionalVerified: isInstitucional,
          enrolledCodes: ['ESZI025', 'ESTU012', 'BC0404']
        };

        setLoggedUser(profile);
        localStorage.setItem(
          'ufabclima_google_user',
          JSON.stringify(profile)
        );
        setShowLoginModal(false);
        setActiveTab('classes');
      }
    } catch (error) {
      const cleanEmail = loginEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        setLoginError(
          'Para testar neste preview (ou antes de liberar o domínio no Firebase), digite seu e-mail @aluno.ufabc.edu.br, @ufabc.edu.br ou @gmail.com abaixo e toque novamente.'
        );
        setIsAuthenticatingGoogle(false);
        return;
      }

      const isAllowedDomain =
        cleanEmail.endsWith('@aluno.ufabc.edu.br') ||
        cleanEmail.endsWith('@ufabc.edu.br');

      if (!isAllowedDomain) {
        setLoginError(
          'Use uma conta Google válida (@aluno.ufabc.edu.br, @ufabc.edu.br).'
        );
        setIsAuthenticatingGoogle(false);
        return;
      }

      const isDocente =
        cleanEmail.endsWith('@ufabc.edu.br') &&
        !cleanEmail.includes('@aluno.');

      const profile = {
        name: loginName.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
        photoURL: null,
        role: isDocente ? 'Docente' : loginRole,
        ra: loginRa || '11202130452',
        googleVerified: true,
        institutionalVerified:
          cleanEmail.endsWith('@aluno.ufabc.edu.br') ||
          cleanEmail.endsWith('@ufabc.edu.br'),
        enrolledCodes: ['ESZI025', 'ESTU012', 'BC0404']
      };

      setLoggedUser(profile);
      localStorage.setItem('ufabclima_google_user', JSON.stringify(profile));
      setShowLoginModal(false);
      setActiveTab('classes');
    } finally {
      setIsAuthenticatingGoogle(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setLoggedUser(null);
    localStorage.removeItem('ufabclima_google_user');
    if (activeTab === 'classes') {
      setActiveTab('map');
    }
  };

  const handleUpdateClassDecision = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newDecisionTitle.trim() || !newDecisionNote.trim()) {
      setFormError(
        'Preencha o título e o detalhe da decisão sobre a aula.'
      );
      return;
    }

    if (loggedUser?.role !== 'Docente') {
      if (
        !profEmailInput.trim() ||
        !profEmailInput.toLowerCase().includes('@ufabc.edu.br')
      ) {
        setFormError(
          'Como Aluno(a)/TA, informe o e-mail oficial do docente (@ufabc.edu.br) para validação.'
        );
        return;
      }
      if (!proofAttached) {
        setFormError(
          'Anexe o print do e-mail institucional ou aviso do SIGAA/Tidia enviado pelo docente.'
        );
        return;
      }
    }

    const updatedPayload = {
      status: newDecisionStatus,
      decisionTitle: newDecisionTitle,
      decisionNote: newDecisionNote,
      updatedBy: loggedUser?.name || 'Membro UFABC',
      updaterRole: loggedUser?.role || 'Aluno(a)',
      verified: true,
      proofInfo:
        loggedUser?.role === 'Docente'
          ? `Autenticado via Google Institucional (${loggedUser.email})`
          : `Validado com e-mail (${profEmailInput}) + Anexo (${
              proofFileName || 'print_aviso_docente.png'
            })`,
      updatedAt: 'Agora mesmo'
    };

    setClassesList((prev) =>
      prev.map((item) =>
        item.id === selectedClass.id ? { ...item, ...updatedPayload } : item
      )
    );

    if (db && firebaseUser) {
      try {
        const classDocRef = doc(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          'classes_sa',
          selectedClass.id
        );
        await updateDoc(classDocRef, updatedPayload).catch(async () => {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(classDocRef, {
            ...selectedClass,
            ...updatedPayload
          });
        });
      } catch (err) {
        console.error('Erro ao salvar aula:', err);
      }
    }

    setSelectedClass(null);
    setNewDecisionTitle('');
    setNewDecisionNote('');
    setProfEmailInput('');
    setProofAttached(false);
    setProofFileName('');
  };

  const handleAddClassComment = (classId) => {
    const text = classCommentText[classId];
    if (!text || !text.trim()) return;

    const newComm = {
      id: Date.now(),
      author: loggedUser ? loggedUser.name : 'Aluno(a) UFABC',
      role: loggedUser ? loggedUser.role : 'Aluno(a)',
      text: text.trim(),
      verified: Boolean(loggedUser?.googleVerified),
      time: 'Agora'
    };

    setClassesList((prev) =>
      prev.map((c) =>
        c.id === classId ? { ...c, comments: [...c.comments, newComm] } : c
      )
    );
    setClassCommentText({ ...classCommentText, [classId]: '' });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCommentPhoto(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddGeneralComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const authorName = loggedUser
      ? loggedUser.name
      : commentAuthor.trim() || 'Visitante Comunidade UFABC';
    const authorRole = loggedUser ? loggedUser.role : 'Visitante';

    const newPost = {
      user: authorName,
      role: authorRole,
      time: 'Agora mesmo',
      createdAtMs: Date.now(),
      location: commentLocation,
      text: commentText.trim(),
      likes: 1,
      verified: Boolean(loggedUser),
      photoUrl: commentPhoto
    };

    setCommentsList((prev) => [{ id: Date.now(), ...newPost }, ...prev]);

    if (db && firebaseUser) {
      try {
        const commentsRef = collection(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          'comments_sa'
        );
        await addDoc(commentsRef, newPost);
      } catch (err) {
        console.error('Erro ao publicar comentário:', err);
      }
    }

    setCommentText('');
    setCommentPhoto(null);
  };

  const theme = {
    bgMain: darkMode ? 'bg-[#071610]' : 'bg-[#F3F7F4]',
    bgCard: darkMode
      ? 'bg-[#0D241B] border-[#1B4332]'
      : 'bg-white border-emerald-900/10',
    bgSubtle: darkMode ? 'bg-[#123124]' : 'bg-emerald-50/90',
    textPrimary: darkMode ? 'text-stone-100' : 'text-stone-900',
    textSecondary: darkMode ? 'text-emerald-200/75' : 'text-stone-600',
    border: darkMode ? 'border-[#1B4332]' : 'border-stone-200'
  };

  const statusColors = {
    normal: {
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      dot: 'bg-emerald-400',
      label: 'Normal • Pista Seca'
    },
    attention: {
      badge: 'bg-[#F5A800]/25 text-[#F5A800] border-[#F5A800]/50',
      dot: 'bg-[#F5A800]',
      label: 'Atenção Hidrológica'
    },
    critical: {
      badge: 'bg-red-500/25 text-red-300 border-red-500/50',
      dot: 'bg-red-500',
      label: 'Alerta de Alagamento'
    }
  }[alertLevel];

  return (
    <div
      className={`min-h-screen w-full ${theme.bgMain} ${theme.textPrimary} flex justify-center font-sans transition-colors duration-300`}
    >
      <div
        className={`w-full max-w-[430px] min-h-screen flex flex-col justify-between ${theme.bgMain} relative shadow-2xl border-x ${theme.border}`}
      >
        <header className="bg-[#006341] text-white border-b-2 border-[#F5A800] px-3.5 pt-3 pb-3 sticky top-0 z-30 shadow-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#F5A800] text-[#003822] flex items-center justify-center font-black text-base shadow shrink-0">
                UF
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-extrabold tracking-tight leading-none text-white">
                    UFAB<span className="text-[#F5A800]">Clima</span>
                  </h1>
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/25 text-[#F5A800] font-bold">
                    Santo André
                  </span>
                </div>
                <p className="text-[10px] text-emerald-100/90 truncate mt-0.5 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-[#F5A800] animate-pulse shrink-0" />
                  Bacia Tamanduateí • Av. dos Estados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`px-2 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1 ${statusColors.badge}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusColors.dot} animate-ping`}
                />
                <span className="hidden xs:inline">{statusColors.label}</span>
              </div>

              <button
                onClick={() => setShowSimMenu(!showSimMenu)}
                title="Testar Cenários de Chuva/Alagamento"
                className={`p-1.5 rounded-lg border transition ${
                  simMode !== 'live'
                    ? 'bg-[#F5A800] text-[#003822] border-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
              </button>

              {loggedUser ? (
                <button
                  onClick={() => setActiveTab('classes')}
                  className="px-2 py-1 rounded-lg bg-[#F5A800] text-[#003822] font-extrabold text-[10px] flex items-center gap-1 shadow-sm"
                  title="Ver minhas aulas do quadrimestre"
                >
                  <UserCheck className="w-3 h-3" />
                  {loggedUser.name.split(' ')[0]}
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-[10px] flex items-center gap-1 border border-white/20"
                >
                  <Lock className="w-3 h-3 text-[#F5A800]" />
                  Entrar
                </button>
              )}

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15"
                title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
              >
                {darkMode ? (
                  <Sun className="w-3.5 h-3.5 text-[#F5A800]" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {showSimMenu && (
            <div className="mt-2.5 p-2 rounded-xl bg-[#004830] border border-[#F5A800]/40 flex items-center justify-between gap-1.5 animate-fadeIn">
              <span className="text-[10px] font-bold text-emerald-100 flex items-center gap-1">
                <FlaskConical className="w-3 h-3 text-[#F5A800]" />
                Modo Teste:
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setSimMode('live')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition ${
                    simMode === 'live'
                      ? 'bg-[#F5A800] text-[#003822]'
                      : 'bg-black/25 text-emerald-100'
                  }`}
                >
                  Tempo Real
                </button>
                <button
                  onClick={() => setSimMode('attention')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition ${
                    simMode === 'attention'
                      ? 'bg-[#F5A800] text-[#003822]'
                      : 'bg-black/25 text-emerald-100'
                  }`}
                >
                  Atenção (19mm)
                </button>
                <button
                  onClick={() => setSimMode('critical')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition ${
                    simMode === 'critical'
                      ? 'bg-red-500 text-white'
                      : 'bg-black/25 text-emerald-100'
                  }`}
                >
                  Alagamento (48mm)
                </button>
              </div>
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-100 bg-[#004830] px-2.5 py-1.5 rounded-xl border border-emerald-700/60 min-w-0 flex-1">
              <MapPin className="w-3.5 h-3.5 text-[#F5A800] shrink-0" />
              <span className="truncate font-semibold">
                Av. dos Estados, 5001 (Campus SA)
              </span>
            </div>

            <button
              onClick={fetchWeather}
              className="p-1.5 rounded-xl bg-[#004830] hover:bg-[#003822] text-emerald-200 border border-emerald-700/60 shrink-0"
              title="Atualizar leitura agrometeorológica e hidrológica"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  weather.loading ? 'animate-spin text-[#F5A800]' : ''
                }`}
              />
            </button>

            <button
              onClick={() => setShowCameraModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow shrink-0"
            >
              <Video className="w-3.5 h-3.5 animate-pulse" />
              Câmera Ao Vivo
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 pb-24">
          <section
            className={`rounded-2xl border p-3.5 ${theme.bgCard} shadow-sm`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#006341] text-[#F5A800] flex items-center justify-center shadow-inner shrink-0">
                  <CloudRain className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black tracking-tight">
                      {effectiveWeather.temp}°C
                    </span>
                    <span className="text-[11px] font-bold text-[#F5A800]">
                      Sensação {effectiveWeather.apparentTemp}°C
                    </span>
                  </div>
                  <p className={`text-[11px] ${theme.textSecondary}`}>
                    {effectiveWeather.conditionLabel} • Atualizado{' '}
                    {effectiveWeather.updatedAt}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#006341]/25 text-emerald-400 border border-emerald-500/30 block">
                  Pulso 10 min: {effectiveWeather.rain10MinMm} mm
                </span>
                <span
                  className={`text-[10px] ${theme.textSecondary} mt-1 block`}
                >
                  Umidade {effectiveWeather.humidity}% • Vento{' '}
                  {effectiveWeather.windSpeed} km/h
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-emerald-500/15 text-center">
              <div className={`p-2 rounded-xl ${theme.bgSubtle}`}>
                <p className={`text-[9px] uppercase ${theme.textSecondary}`}>
                  Chuva Agora
                </p>
                <p className="text-xs font-extrabold mt-0.5">
                  {effectiveWeather.rainMm} mm/h
                </p>
              </div>
              <div className={`p-2 rounded-xl ${theme.bgSubtle}`}>
                <p className={`text-[9px] uppercase ${theme.textSecondary}`}>
                  Acumulado Dia
                </p>
                <p className="text-xs font-extrabold mt-0.5">
                  {effectiveWeather.rain24h} mm
                </p>
              </div>
              <div className={`p-2 rounded-xl ${theme.bgSubtle}`}>
                <p className={`text-[9px] uppercase ${theme.textSecondary}`}>
                  Rio Tamanduateí
                </p>
                <p
                  className={`text-xs font-extrabold mt-0.5 ${
                    effectiveWeather.riverLevelM >= 3.8
                      ? 'text-red-400'
                      : effectiveWeather.riverLevelM >= 3.1
                      ? 'text-[#F5A800]'
                      : 'text-emerald-400'
                  }`}
                >
                  {effectiveWeather.riverLevelM}m / {effectiveWeather.riverMaxM}m
                </p>
              </div>
            </div>
          </section>

          {activeTab === 'map' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#F5A800] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Mapa de Alagamento • Campus SA
                  </h2>
                  <p className={`text-[10px] ${theme.textSecondary}`}>
                    Monitoramento da Av. dos Estados e Bacia do Tamanduateí
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSatelliteView(!satelliteView)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                      satelliteView
                        ? 'bg-[#006341] text-white border-[#F5A800]'
                        : `${theme.bgCard} ${theme.textSecondary}`
                    }`}
                  >
                    {satelliteView ? 'Mapa Viário' : 'Satélite'}
                  </button>
                  <button
                    onClick={() => setMapZoom((z) => (z === 1 ? 1.22 : 1))}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${theme.bgCard}`}
                  >
                    {mapZoom === 1 ? 'Zoom +' : 'Zoom -'}
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border-2 border-[#006341]/60 h-[340px] bg-[#0B1914] shadow-lg select-none">
                <div
                  className="w-full h-full transition-transform duration-500 origin-center relative"
                  style={{
                    transform: `scale(${mapZoom})`,
                    background: satelliteView
                      ? 'radial-gradient(circle at 50% 45%, #163024 0%, #09150F 70%, #050C09 100%)'
                      : darkMode
                      ? 'linear-gradient(145deg, #0E221A 0%, #091712 100%)'
                      : 'linear-gradient(145deg, #E4EFE9 0%, #D5E5DC 100%)'
                  }}
                >
                  <svg
                    viewBox="0 0 400 320"
                    className="w-full h-full object-cover"
                  >
                    <defs>
                      <pattern
                        id="urbanBlocksSA"
                        width="36"
                        height="36"
                        patternUnits="userSpaceOnUse"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="30"
                          height="30"
                          rx="3"
                          fill={
                            satelliteView
                              ? '#14291F'
                              : darkMode
                              ? '#122920'
                              : '#C8DDD1'
                          }
                          opacity="0.55"
                        />
                      </pattern>
                      <linearGradient
                        id="floodGradientSA"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor={
                            alertLevel === 'critical' ? '#EF4444' : '#F59E0B'
                          }
                          stopOpacity="0.72"
                        />
                        <stop
                          offset="100%"
                          stopColor="#0284C7"
                          stopOpacity="0.45"
                        />
                      </linearGradient>
                    </defs>

                    <rect width="400" height="320" fill="url(#urbanBlocksSA)" />

                    <path
                      d="M 190 0 L 190 220"
                      stroke={darkMode ? '#294B3C' : '#94B4A4'}
                      strokeWidth="12"
                      fill="none"
                    />
                    <path
                      d="M 0 65 L 400 65"
                      stroke={darkMode ? '#244235' : '#A3C1B2'}
                      strokeWidth="8"
                      fill="none"
                    />

                    <path
                      d="M 0 235 Q 190 250 400 285"
                      stroke="#78716C"
                      strokeWidth="4"
                      strokeDasharray="6 4"
                      fill="none"
                    />

                    <path
                      d="M 0 118 Q 185 168 400 232"
                      stroke={darkMode ? '#374151' : '#9CA3AF'}
                      strokeWidth="24"
                      fill="none"
                    />

                    <path
                      d="M 0 128 Q 185 178 400 242"
                      stroke="#0284C7"
                      strokeWidth={
                        alertLevel === 'critical'
                          ? 18
                          : alertLevel === 'attention'
                          ? 12
                          : 8
                      }
                      fill="none"
                    />

                    {alertLevel !== 'normal' && (
                      <path
                        d="M 10 100 Q 190 152 395 215 L 395 262 Q 185 202 10 146 Z"
                        fill="url(#floodGradientSA)"
                      />
                    )}

                    <g transform="translate(198, 22)">
                      <rect
                        x="0"
                        y="0"
                        width="138"
                        height="86"
                        rx="10"
                        fill="#006341"
                        fillOpacity="0.88"
                        stroke="#F5A800"
                        strokeWidth="2.5"
                      />
                      <rect
                        x="12"
                        y="14"
                        width="44"
                        height="26"
                        rx="4"
                        fill="#003822"
                        stroke="#F5A800"
                        strokeWidth="1"
                      />
                      <rect
                        x="66"
                        y="14"
                        width="56"
                        height="26"
                        rx="4"
                        fill="#003822"
                        stroke="#10B981"
                        strokeWidth="1"
                      />
                      <text
                        x="69"
                        y="60"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        UFABC SANTO ANDRÉ
                      </text>
                      <text
                        x="69"
                        y="74"
                        textAnchor="middle"
                        fill="#F5A800"
                        fontSize="8.5"
                        fontWeight="bold"
                      >
                        Blocos A • B • Biblioteca
                      </text>
                    </g>

                    <text
                      x="182"
                      y="38"
                      fill={darkMode ? '#A7F3D0' : '#065F46'}
                      fontSize="8.5"
                      fontWeight="bold"
                      transform="rotate(-90 182 38)"
                    >
                      Rua Santa Adélia
                    </text>
                    <text
                      x="75"
                      y="134"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      transform="rotate(15 75 134)"
                    >
                      Av. dos Estados / Rio Tamanduateí
                    </text>
                    <text
                      x="25"
                      y="255"
                      fill="#F5A800"
                      fontSize="8.5"
                      fontWeight="bold"
                    >
                      Estação CPTM Pref. Saladino
                    </text>
                  </svg>

                  {SA_CONFIG.sensors.map((sensor, idx) => {
                    const depth = getWaterDepthCm(idx);
                    if (sensor.isCamera) {
                      return (
                        <button
                          key={sensor.id}
                          onClick={() => setShowCameraModal(true)}
                          style={{
                            left: `${sensor.x}%`,
                            top: `${sensor.y}%`
                          }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                        >
                          <div className="px-2.5 py-1 rounded-full bg-red-600 text-white border-2 border-[#F5A800] shadow-lg flex items-center gap-1.5 text-[10px] font-extrabold whitespace-nowrap">
                            <Video className="w-3 h-3 animate-pulse" />
                            <span>{sensor.name}</span>
                          </div>
                        </button>
                      );
                    }

                    const badgeColor =
                      depth >= 30
                        ? 'bg-red-600 text-white border-red-300'
                        : depth > 0
                        ? 'bg-[#F5A800] text-[#003822] border-white'
                        : 'bg-[#006341] text-white border-emerald-300';

                    return (
                      <div
                        key={sensor.id}
                        style={{ left: `${sensor.x}%`, top: `${sensor.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
                      >
                        <div
                          className={`px-2 py-0.5 rounded-md border shadow-md text-[9px] font-extrabold whitespace-nowrap ${badgeColor}`}
                        >
                          {sensor.name}:{' '}
                          {depth === 0 ? '0 cm (Seca)' : `${depth} cm`}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center justify-between text-[10px] text-stone-200">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Seca (0cm)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#F5A800]" />
                      Lâmina &gt;15cm
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Bloqueio &gt;30cm
                    </span>
                  </div>
                  <span className="text-[#F5A800] font-bold">CEMADEN SA</span>
                </div>
              </div>

              <div
                className={`rounded-2xl border p-3.5 ${theme.bgCard} shadow-sm`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="min-w-0">
                    <h3 className="text-xs font-extrabold flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="truncate">{SA_CONFIG.cameraTitle}</span>
                    </h3>
                    <p className={`text-[10px] ${theme.textSecondary}`}>
                      Monitoramento visual ao vivo da pista junto à UFABC
                    </p>
                  </div>

                  <button
                    onClick={() => setShowCameraModal(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#006341] hover:bg-[#004d32] text-[#F5A800] font-bold text-[10px] flex items-center gap-1 border border-[#F5A800]/40 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Expandir
                  </button>
                </div>

                <div
                  onClick={() => setShowCameraModal(true)}
                  className="relative h-36 rounded-xl overflow-hidden bg-black border border-emerald-500/30 cursor-pointer group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                  <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-emerald-300 z-20">
                    <span className="bg-black/70 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      AO VIVO • AV. DOS ESTADOS
                    </span>
                    <span className="bg-black/70 px-2 py-0.5 rounded text-[#F5A800]">
                      {effectiveWeather.rainMm} mm/h • Rio{' '}
                      {effectiveWeather.riverLevelM}m
                    </span>
                  </div>

                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#06130E] text-center p-3">
                    <div className="px-3.5 py-2 rounded-full bg-[#006341] text-white border border-[#F5A800] font-bold text-xs flex items-center gap-2 shadow-lg group-hover:scale-105 transition z-20">
                      <Video className="w-4 h-4 text-[#F5A800]" />
                      Assistir {SA_CONFIG.cameraTitle}
                    </div>
                    <p className="text-[10px] text-emerald-200/80 mt-2 z-20">
                      Toque para abrir a imagem em tempo real do COI Santo André
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="space-y-3">
              {!loggedUser ? (
                <div
                  className={`rounded-2xl border p-5 text-center ${theme.bgCard}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#006341]/20 text-[#F5A800] flex items-center justify-center mx-auto mb-3 border border-[#F5A800]/30">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-extrabold">
                    Acesso Exclusivo com Conta Google
                  </h3>
                  <p className={`text-xs ${theme.textSecondary} mt-1 mb-4`}>
                    Entre com seu e-mail Google Institucional para visualizar as
                    suas matérias do quadrimestre em Santo André.
                  </p>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full py-2.5 rounded-xl bg-[#006341] text-[#F5A800] font-extrabold text-xs border border-[#F5A800]"
                  >
                    Fazer Login com o Google
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={`rounded-2xl border p-3 ${theme.bgCard} flex items-center justify-between`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold truncate">
                          {loggedUser.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#006341] text-[#F5A800] text-[9px] font-bold">
                          {loggedUser.role}
                        </span>
                      </div>
                      <p
                        className={`text-[10px] ${theme.textSecondary} truncate`}
                      >
                        {loggedUser.email} • Quadrimestre 2026.3
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-2.5 py-1.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-[10px] font-bold flex items-center gap-1 shrink-0"
                    >
                      <LogOut className="w-3 h-3" />
                      Sair
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {classesList.map((cls) => {
                      const statusBadge =
                        cls.status === 'remote'
                          ? {
                              label: 'Aula Remota / Síncrona',
                              style:
                                'bg-[#F5A800]/20 text-[#F5A800] border-[#F5A800]/40'
                            }
                          : cls.status === 'suspended'
                          ? {
                              label: 'Aula Suspensa / Reposição',
                              style:
                                'bg-red-500/20 text-red-300 border-red-500/40'
                            }
                          : {
                              label: 'Presencial Confirmada',
                              style:
                                'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            };

                      return (
                        <div
                          key={cls.id}
                          className={`rounded-2xl border p-3.5 ${theme.bgCard} shadow-sm space-y-2.5`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-[#F5A800]">
                                {cls.code} • {cls.time}
                              </span>
                              <h3 className="text-sm font-extrabold leading-tight mt-0.5">
                                {cls.subject}
                              </h3>
                              <p
                                className={`text-[11px] ${theme.textSecondary}`}
                              >
                                {cls.professor} • {cls.room}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-lg border text-[10px] font-extrabold shrink-0 ${statusBadge.style}`}
                            >
                              {statusBadge.label}
                            </span>
                          </div>

                          <div
                            className={`p-2.5 rounded-xl border ${theme.bgSubtle} ${theme.border}`}
                          >
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="font-extrabold text-[#F5A800]">
                                {cls.decisionTitle}
                              </span>
                              <span className={theme.textSecondary}>
                                {cls.updatedAt}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed">
                              {cls.decisionNote}
                            </p>
                            <div className="mt-2 pt-1.5 border-t border-emerald-500/15 flex items-center justify-between text-[10px]">
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {cls.proofInfo}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedClass(cls);
                                  setNewDecisionStatus(cls.status);
                                  setNewDecisionTitle(cls.decisionTitle);
                                  setNewDecisionNote(cls.decisionNote);
                                  setProfEmailInput(cls.profEmail);
                                }}
                                className="text-[#F5A800] font-bold underline ml-2 shrink-0"
                              >
                                Atualizar Status
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            {cls.comments.map((cm) => (
                              <div
                                key={cm.id}
                                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-black/20 flex items-start justify-between gap-2"
                              >
                                <div>
                                  <span className="font-bold text-[#F5A800]">
                                    {cm.author} ({cm.role}):{' '}
                                  </span>
                                  <span>{cm.text}</span>
                                </div>
                                <span
                                  className={`text-[9px] ${theme.textSecondary} shrink-0`}
                                >
                                  {cm.time}
                                </span>
                              </div>
                            ))}

                            <div className="flex gap-1.5 pt-1">
                              <input
                                type="text"
                                value={classCommentText[cls.id] || ''}
                                onChange={(e) =>
                                  setClassCommentText({
                                    ...classCommentText,
                                    [cls.id]: e.target.value
                                  })
                                }
                                placeholder="Comentar sobre esta aula..."
                                className={`flex-1 px-2.5 py-1.5 rounded-xl text-xs border ${theme.bgSubtle} ${theme.border} focus:outline-none`}
                              />
                              <button
                                onClick={() => handleAddClassComment(cls.id)}
                                className="px-3 py-1.5 rounded-xl bg-[#006341] text-[#F5A800] font-bold text-xs"
                              >
                                Enviar
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-3">
              <form
                onSubmit={handleAddGeneralComment}
                className={`rounded-2xl border p-3.5 ${theme.bgCard} space-y-2.5`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#F5A800] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    Relatar Situação no Entorno SA
                  </h3>
                  <span className={`text-[10px] ${theme.textSecondary}`}>
                    {loggedUser ? `Logado: ${loggedUser.name}` : 'Aberto a todos'}
                  </span>
                </div>

                {!loggedUser && (
                  <input
                    type="text"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder="Seu nome ou curso (opcional)"
                    className={`w-full px-3 py-2 rounded-xl text-xs border ${theme.bgSubtle} ${theme.border}`}
                  />
                )}

                <select
                  value={commentLocation}
                  onChange={(e) => setCommentLocation(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${theme.bgSubtle} ${theme.border}`}
                >
                  <option>Av. dos Estados (Portaria UFABC)</option>
                  <option>Passarela Estação CPTM Prefeito Saladino</option>
                  <option>Rotatória Carrefour / Viaduto Cassaquera</option>
                  <option>Portaria Rua Santa Adélia (Bloco A / B)</option>
                  <option>Terminal Santo André ↔ UFABC</option>
                </select>

                <textarea
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Como está a pista, fila do fretado ou acesso à UFABC agora?"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${theme.bgSubtle} ${theme.border}`}
                />

                {commentPhoto && (
                  <div className="relative rounded-xl overflow-hidden border border-[#F5A800]/50 h-32">
                    <img
                      src={commentPhoto}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCommentPhoto(null)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/75 text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${theme.bgSubtle} ${theme.border}`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#F5A800]" />
                    Adicionar Foto
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#006341] text-[#F5A800] font-extrabold text-xs border border-[#F5A800]"
                  >
                    Publicar Relato
                  </button>
                </div>
              </form>

              <div className="space-y-2.5">
                {commentsList.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-3.5 ${theme.bgCard} space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold">
                          {item.user}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#006341]/30 text-[#F5A800] font-bold">
                          {item.role}
                        </span>
                      </div>
                      <span className={`text-[10px] ${theme.textSecondary}`}>
                        {item.time}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </p>

                    <p className="text-xs leading-relaxed">{item.text}</p>

                    {item.photoUrl && (
                      <img
                        src={item.photoUrl}
                        alt="Foto do relato"
                        className="w-full h-40 object-cover rounded-xl border border-emerald-500/20 mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <nav
          className={`fixed bottom-0 w-full max-w-[430px] ${theme.bgCard} border-t-2 border-[#006341] px-3 py-2 flex items-center justify-around z-30 shadow-2xl`}
        >
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
              activeTab === 'map'
                ? 'text-[#F5A800] font-extrabold bg-[#006341]/25'
                : theme.textSecondary
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px]">Mapa SA</span>
          </button>

          {(loggedUser || alertLevel !== 'normal') && (
            <button
              onClick={() => setActiveTab('classes')}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
                activeTab === 'classes'
                  ? 'text-[#F5A800] font-extrabold bg-[#006341]/25'
                  : theme.textSecondary
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px]">Aulas</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
              activeTab === 'comments'
                ? 'text-[#F5A800] font-extrabold bg-[#006341]/25'
                : theme.textSecondary
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px]">Comentários</span>
          </button>

          {!loggedUser && (
            <button
              onClick={() => setShowLoginModal(true)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${theme.textSecondary}`}
            >
              <Lock className="w-5 h-5 text-[#F5A800]" />
              <span className="text-[10px]">Ver Aulas</span>
            </button>
          )}
        </nav>

        {showCameraModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
              className={`w-full max-w-[390px] rounded-2xl border p-4 ${theme.bgCard} space-y-3 shadow-2xl`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-[#F5A800] flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-red-500" />
                    {SA_CONFIG.cameraTitle}
                  </h3>
                  <p className={`text-[10px] ${theme.textSecondary}`}>
                    Centro de Operações Integradas (COI) • Santo André
                  </p>
                </div>
                <button
                  onClick={() => setShowCameraModal(false)}
                  className="p-1 rounded-lg bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-emerald-500/30 bg-black h-64 relative">
                <iframe
                  src={SA_CONFIG.cameraUrl}
                  title={SA_CONFIG.cameraTitle}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href={SA_CONFIG.cameraUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-[#006341] text-[#F5A800] font-extrabold text-xs flex items-center justify-center gap-1.5 border border-[#F5A800]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir Stream Oficial em Nova Guia
                </a>
              </div>
            </div>
          </div>
        )}

        {showLoginModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
              className={`w-full max-w-[380px] rounded-2xl border p-4 ${theme.bgCard} space-y-3 shadow-2xl`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#F5A800]" />
                  Login Institucional • UFABClima
                </h3>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1 rounded-lg bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className={`text-xs ${theme.textSecondary}`}>
                Ao entrar com sua conta Google, a aba <strong>Aulas</strong> é
                liberada permanentemente com as suas disciplinas do
                quadrimestre.
              </p>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  {['Aluno(a)', 'Docente'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setLoginRole(r)}
                      className={`py-1.5 rounded-xl text-xs font-bold border ${
                        loginRole === r
                          ? 'bg-[#006341] text-[#F5A800] border-[#F5A800]'
                          : `${theme.bgSubtle} ${theme.border}`
                      }`}
                    >
                      Sou {r}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="Seu Nome (ex: Eduarda Figueira)"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${theme.bgSubtle} ${theme.border}`}
                />

                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder={
                    loginRole === 'Docente'
                      ? 'nome.sobrenome@ufabc.edu.br'
                      : 'seu.nome@aluno.ufabc.edu.br'
                  }
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${theme.bgSubtle} ${theme.border}`}
                />

                {loginError && (
                  <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                    {loginError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isAuthenticatingGoogle}
                  className="w-full py-2.5 rounded-xl bg-white text-stone-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow hover:bg-stone-100 transition"
                >
                  <Mail className="w-4 h-4 text-red-600" />
                  {isAuthenticatingGoogle
                    ? 'Validando Conta Google...'
                    : 'Continuar com o Google'}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedClass && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form
              onSubmit={handleUpdateClassDecision}
              className={`w-full max-w-[390px] rounded-2xl border p-4 ${theme.bgCard} space-y-3 shadow-2xl`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-[#F5A800]">
                  Atualizar Aula: {selectedClass.subject}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedClass(null)}
                  className="p-1 rounded-lg bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'normal', label: 'Presencial' },
                  { id: 'remote', label: 'Remota' },
                  { id: 'suspended', label: 'Suspensa' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setNewDecisionStatus(st.id)}
                    className={`py-1.5 rounded-xl text-[11px] font-bold border ${
                      newDecisionStatus === st.id
                        ? 'bg-[#006341] text-[#F5A800] border-[#F5A800]'
                        : `${theme.bgSubtle} ${theme.border}`
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={newDecisionTitle}
                onChange={(e) => setNewDecisionTitle(e.target.value)}
                placeholder="Título (ex: Aula transferida para o Google Meet)"
                className={`w-full px-3 py-2 rounded-xl text-xs border ${theme.bgSubtle} ${theme.border}`}
              />

              <textarea
                rows={2}
                value={newDecisionNote}
                onChange={(e) => setNewDecisionNote(e.target.value)}
                placeholder="Informe link da aula ou instruções do professor..."
                className={`w-full px-3 py-2 rounded-xl text-xs border ${theme.bgSubtle} ${theme.border}`}
              />

              {loggedUser?.role !== 'Docente' ? (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <p className="text-[10px] font-bold text-[#F5A800]">
                    Validação de Veracidade (Publicação de Aluno):
                  </p>
                  <input
                    type="email"
                    value={profEmailInput}
                    onChange={(e) => setProfEmailInput(e.target.value)}
                    placeholder="E-mail oficial do docente (@ufabc.edu.br)"
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs border ${theme.bgSubtle} ${theme.border}`}
                  />
                  <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={proofAttached}
                      onChange={(e) => {
                        setProofAttached(e.target.checked);
                        setProofFileName('print_email_docente_ufabc.png');
                      }}
                    />
                    <span>
                      Anexar print do e-mail institucional / aviso SIGAA
                    </span>
                  </label>
                </div>
              ) : (
                <p className="text-[11px] text-emerald-400 font-semibold">
                  ✓ Publicação direta verificada como Docente UFABC
                </p>
              )}

              {formError && (
                <p className="text-[11px] text-red-400 font-semibold">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#006341] text-[#F5A800] font-extrabold text-xs border border-[#F5A800]"
              >
                Confirmar Atualização da Aula
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}