import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Crown, Download, LayoutDashboard, LockKeyhole, Maximize, RefreshCw, Sparkles, UserRound } from 'lucide-react';
import { FrameOverlay } from './components/FrameOverlay';
import { PhotoRenderer, type PhotoRendererHandle } from './components/PhotoRenderer';
import { useCamera } from './hooks/useCamera';
import { useCapture } from './hooks/useCapture';
import { filters, frames, getLayout, layouts, todayLabel } from './lib/presets';
import type { CapturedPhoto, FilterId, FrameId, LayoutId, Screen } from './types';

interface SessionUser {
  name: string;
  email: string;
  plan: 'inactive' | 'monthly' | 'yearly' | 'trial';
  sessionsUsed: number;
}

const defaultUser: SessionUser = { name: 'Piaggy Host', email: 'host@piaggyphoto.id', plan: 'trial', sessionsUsed: 0 };

function loadUser(): SessionUser | null {
  const raw = localStorage.getItem('piaggy-user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function saveUser(user: SessionUser | null) {
  if (user) localStorage.setItem('piaggy-user', JSON.stringify(user));
  else localStorage.removeItem('piaggy-user');
}

function requestFullscreen() {
  const element = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
  const request = element.requestFullscreen ?? element.webkitRequestFullscreen;
  request?.call(element).catch(() => undefined);
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh overflow-hidden bg-cream text-softblack">
      <div className="noise" />
      {children}
    </main>
  );
}

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className={`${small ? 'h-14 w-14' : 'h-24 w-24'} grid place-items-center rounded-full border border-champagne/70 bg-burgundy text-cream shadow-luxe`}>
        <Crown size={small ? 26 : 44} strokeWidth={1.4} />
      </div>
      <div>
        <p className={`${small ? 'text-2xl' : 'text-6xl'} font-display tracking-[0.16em] text-burgundy`}>PIAGGYPHOTO</p>
        <p className="mt-1 text-xs uppercase tracking-[0.45em] text-softblack/55">premium iPad photobooth</p>
      </div>
    </div>
  );
}

function AuthScreen({ onLogin }: { onLogin: (user: SessionUser) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('Piaggy Host');
  const [email, setEmail] = useState('host@piaggyphoto.id');

  return (
    <Shell>
      <section className="grid min-h-svh grid-cols-1 items-center gap-8 p-6 lg:grid-cols-[1.1fr_.9fr] lg:p-12">
        <div className="rounded-[3rem] border border-white/70 bg-white/45 p-10 shadow-luxe backdrop-blur">
          <BrandMark />
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {['Luxury frame', '1080p camera', 'Print-ready'].map((item) => <div key={item} className="rounded-3xl bg-cream/75 p-5 text-sm font-semibold text-burgundy">{item}</div>)}
          </div>
        </div>
        <div className="rounded-[2.5rem] bg-burgundy p-8 text-cream shadow-luxe">
          <div className="mb-8 flex rounded-full bg-white/10 p-1 text-sm font-semibold">
            <button className={`flex-1 rounded-full py-3 ${mode === 'login' ? 'bg-cream text-burgundy' : ''}`} onClick={() => setMode('login')}>Login</button>
            <button className={`flex-1 rounded-full py-3 ${mode === 'register' ? 'bg-cream text-burgundy' : ''}`} onClick={() => setMode('register')}>Register</button>
          </div>
          <h1 className="font-display text-5xl">{mode === 'login' ? 'Welcome back.' : 'Create studio access.'}</h1>
          <p className="mt-3 text-cream/70">Akun lokal MVP untuk membatasi akses berdasarkan subscription. Password placeholder — aman secukupnya untuk demo, bukan bank Swiss.</p>
          <label className="mt-8 block text-sm uppercase tracking-[.22em] text-champagne">Nama</label>
          <input className="input-dark" value={name} onChange={(event) => setName(event.target.value)} />
          <label className="mt-5 block text-sm uppercase tracking-[.22em] text-champagne">Email</label>
          <input className="input-dark" value={email} onChange={(event) => setEmail(event.target.value)} inputMode="email" />
          <label className="mt-5 block text-sm uppercase tracking-[.22em] text-champagne">Password</label>
          <input className="input-dark" value="piaggy-premium" type="password" readOnly />
          <button className="mt-8 w-full rounded-full bg-champagne px-8 py-4 text-lg font-bold text-burgundy" onClick={() => onLogin({ ...defaultUser, name, email, plan: mode === 'register' ? 'inactive' : 'trial' })}>
            {mode === 'login' ? 'Masuk Studio' : 'Buat Akun'}
          </button>
        </div>
      </section>
    </Shell>
  );
}

function SubscriptionScreen({ user, onUpdate }: { user: SessionUser; onUpdate: (user: SessionUser) => void }) {
  return (
    <Shell>
      <section className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center p-8">
        <BrandMark small />
        <div className="mt-10 rounded-[2.5rem] bg-white/70 p-8 shadow-luxe">
          <div className="flex items-center gap-3 text-burgundy"><LockKeyhole /><span className="text-sm font-bold uppercase tracking-[.25em]">Subscription required</span></div>
          <h1 className="mt-4 font-display text-5xl text-burgundy">Aktifkan akses photobooth.</h1>
          <p className="mt-3 max-w-2xl text-softblack/65">MVP ini membatasi sesi untuk akun tanpa subscription. QRIS masih placeholder dan tombol paket akan mengaktifkan akses lokal.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[{ plan: 'monthly', title: 'Bulanan', price: 'Rp 299K' }, { plan: 'yearly', title: 'Tahunan', price: 'Rp 2.9JT' }, { plan: 'trial', title: 'Trial Event', price: '1 sesi' }].map((item) => (
              <button key={item.plan} className="rounded-[2rem] border border-burgundy/10 bg-cream p-6 text-left transition hover:-translate-y-1 hover:shadow-luxe" onClick={() => onUpdate({ ...user, plan: item.plan as SessionUser['plan'] })}>
                <p className="text-sm uppercase tracking-[.25em] text-gold">{item.title}</p>
                <p className="mt-3 font-display text-4xl text-burgundy">{item.price}</p>
                <p className="mt-4 text-sm text-softblack/60">QRIS placeholder · Tap untuk aktivasi demo.</p>
              </button>
            ))}
          </div>
          <div className="mt-8 grid w-44 place-items-center rounded-3xl border-2 border-dashed border-burgundy/25 bg-white p-5 text-center text-xs font-bold uppercase tracking-[.2em] text-burgundy">QRIS<br />Payment<br />Placeholder</div>
        </div>
      </section>
    </Shell>
  );
}

function StartScreen({ user, onStart, onAdmin, onLogout }: { user: SessionUser; onStart: () => void; onAdmin: () => void; onLogout: () => void }) {
  return (
    <Shell>
      <section className="relative grid min-h-svh place-items-center p-8 text-center">
        <div className="absolute right-8 top-8 flex gap-3">
          <button className="pill" onClick={onAdmin}><LayoutDashboard size={18} /> Admin</button>
          <button className="pill" onClick={onLogout}><UserRound size={18} /> Logout</button>
        </div>
        <div className="max-w-4xl rounded-[3rem] border border-white/70 bg-white/50 p-12 shadow-luxe backdrop-blur-md">
          <BrandMark />
          <h1 className="mt-10 font-display text-6xl text-burgundy md:text-8xl">Luxury booth for beautiful moments.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-softblack/65">Dioptimalkan untuk iPad Safari: fullscreen, kamera depan 1080p, countdown otomatis, frame overlay real-time, dan hasil JPEG high-res.</p>
          <button className="mt-10 rounded-full bg-burgundy px-12 py-5 text-2xl font-bold text-cream shadow-luxe active:scale-95" onClick={onStart}>Mulai Sesion</button>
          <p className="mt-6 text-sm text-softblack/45">Logged in as {user.name} · Plan {user.plan}</p>
        </div>
      </section>
    </Shell>
  );
}

function FramePicker({ selected, onSelect, onNext }: { selected: FrameId; onSelect: (id: FrameId) => void; onNext: () => void }) {
  return (
    <Shell>
      <section className="mx-auto max-w-7xl p-6 lg:p-10">
        <Header eyebrow="Step 1" title="Pilih frame / tema" action={<button className="primary" onClick={onNext}>Lanjut Layout</button>} />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {frames.map((frame) => (
            <button key={frame.id} className={`frame-card ${selected === frame.id ? 'selected' : ''}`} onClick={() => onSelect(frame.id)}>
              <div className="relative aspect-[.75] overflow-hidden rounded-[1.6rem] bg-white">
                <div className="absolute inset-[12%] grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="rounded-xl bg-gradient-to-br from-burgundy/80 to-blush" />)}
                </div>
                <FrameOverlay frameId={frame.id} eventName="PiaggyPhoto" dateText={todayLabel()} compact />
              </div>
              <p className="mt-4 text-left font-display text-2xl text-burgundy">{frame.name}</p>
              <p className="text-left text-sm text-softblack/55">Mirip {frame.reference} · {frame.tagline}</p>
            </button>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function LayoutPicker({ selected, onSelect, onNext }: { selected: LayoutId; onSelect: (id: LayoutId) => void; onNext: () => void }) {
  return (
    <Shell>
      <section className="mx-auto max-w-6xl p-6 lg:p-10">
        <Header eyebrow="Step 2" title="Pilih layout cetak" action={<button className="primary" onClick={onNext}>Buka Kamera</button>} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {layouts.map((layout) => (
            <button key={layout.id} className={`layout-card ${selected === layout.id ? 'selected' : ''}`} onClick={() => onSelect(layout.id)}>
              <div className="mx-auto grid h-64 max-w-56 gap-2 rounded-[1.5rem] bg-cream p-4" style={{ aspectRatio: layout.aspectRatio, gridTemplateColumns: `repeat(${layout.columns}, 1fr)`, gridTemplateRows: `repeat(${layout.rows}, 1fr)` }}>
                {Array.from({ length: layout.slots }, (_, index) => <div key={index} className="rounded-xl bg-gradient-to-br from-burgundy to-blush" />)}
              </div>
              <h3 className="mt-5 font-display text-3xl text-burgundy">{layout.name}</h3>
              <p className="text-softblack/60">{layout.description} · {layout.printSize}</p>
            </button>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function Header({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-[.35em] text-gold">{eyebrow}</p>
        <h1 className="mt-2 font-display text-5xl text-burgundy md:text-7xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

function CameraScreen({ frameId, layoutId, onDone, onBack }: { frameId: FrameId; layoutId: LayoutId; onDone: (photos: CapturedPhoto[]) => void; onBack: () => void }) {
  const layout = getLayout(layoutId);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const { videoRef, isReady, error, startCamera, stopCamera } = useCamera();
  const { countdown, flash, isCapturing, captureOne, runSequence, cancel } = useCapture(videoRef);

  useEffect(() => { startCamera(); return stopCamera; }, [startCamera, stopCamera]);
  useEffect(() => { if (photos.length >= layout.slots) onDone(photos.slice(0, layout.slots)); }, [layout.slots, onDone, photos]);

  return (
    <main className="camera-screen">
      <video ref={videoRef} className="camera-video" autoPlay muted playsInline />
      <FrameOverlay frameId={frameId} eventName="PiaggyPhoto" dateText={todayLabel()} customText={`${photos.length}/${layout.slots} captured`} />
      {flash && <div className="flash" />}
      {countdown && <div className="countdown">{countdown}</div>}
      {error && <div className="camera-error"><p>{error}</p><button className="primary" onClick={startCamera}>Coba Lagi</button></div>}
      <div className="camera-controls">
        <button className="control" onClick={() => { cancel(); stopCamera(); onBack(); }}><RefreshCw /> Kembali</button>
        <button className="control" onClick={requestFullscreen}><Maximize /> Fullscreen</button>
        <button className="capture-button" disabled={!isReady || isCapturing} onClick={() => runSequence(layout.slots - photos.length, (photo) => setPhotos((prev) => [...prev, photo]))}><Camera /> Auto Capture</button>
        <button className="control" disabled={!isReady} onClick={() => { const photo = captureOne(); if (photo) setPhotos((prev) => [...prev, photo]); }}>Manual</button>
      </div>
      <div className="capture-progress">{photos.map((photo, index) => <img key={photo.id} src={photo.dataUrl} alt={`mini ${index + 1}`} />)}</div>
    </main>
  );
}

function PreviewScreen({ photos, layoutId, frameId, onRestart }: { photos: CapturedPhoto[]; layoutId: LayoutId; frameId: FrameId; onRestart: () => void }) {
  const [orderedPhotos, setOrderedPhotos] = useState(photos);
  const [customText, setCustomText] = useState('Love, laughter & luxury memories');
  const [eventName, setEventName] = useState('PiaggyPhoto');
  const [filter, setFilter] = useState<FilterId>('warm');
  const rendererRef = useRef<PhotoRendererHandle>(null);

  function reorder(from: number, to: number) {
    setOrderedPhotos((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      if (!item) return current;
      next.splice(Math.min(to, next.length), 0, item);
      return next;
    });
  }

  return (
    <Shell>
      <section className="grid min-h-svh gap-6 p-5 lg:grid-cols-[1fr_380px] lg:p-8">
        <div className="grid place-items-center rounded-[2.5rem] bg-burgundy/95 p-5 shadow-luxe">
          <PhotoRenderer ref={rendererRef} photos={orderedPhotos} layoutId={layoutId} frameId={frameId} customText={customText} eventName={eventName} dateText={todayLabel()} filter={filter} onReorder={reorder} />
        </div>
        <aside className="rounded-[2.5rem] bg-white/75 p-6 shadow-luxe">
          <p className="text-sm font-bold uppercase tracking-[.3em] text-gold">Preview & Edit</p>
          <h1 className="mt-2 font-display text-4xl text-burgundy">Final touch.</h1>
          <label className="label">Nama / Event</label>
          <input className="input-light" value={eventName} onChange={(event) => setEventName(event.target.value)} />
          <label className="label">Custom text</label>
          <textarea className="input-light min-h-24" value={customText} onChange={(event) => setCustomText(event.target.value)} />
          <label className="label">Filter</label>
          <div className="grid grid-cols-2 gap-2">
            {filters.map((item) => <button key={item.id} className={`filter-button ${filter === item.id ? 'selected' : ''}`} onClick={() => setFilter(item.id)}>{item.name}</button>)}
          </div>
          <p className="mt-5 text-sm text-softblack/55">Drag & drop foto pada preview untuk mengganti urutan. Output JPEG high-res dibuat via canvas print-ready.</p>
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-burgundy py-4 font-bold text-cream" onClick={() => rendererRef.current?.download()}><Download /> Download High-res JPEG</button>
          <button className="mt-3 w-full rounded-full border border-burgundy/20 py-4 font-bold text-burgundy" onClick={onRestart}>Buat Sesi Baru</button>
        </aside>
      </section>
    </Shell>
  );
}

function AdminDashboard({ user, onUpdate, onBack }: { user: SessionUser; onUpdate: (user: SessionUser) => void; onBack: () => void }) {
  return (
    <Shell>
      <section className="mx-auto max-w-7xl p-8">
        <Header eyebrow="Business MVP" title="Dashboard Admin" action={<button className="primary" onClick={onBack}>Kembali</button>} />
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {[['Plan', user.plan], ['Sessions', String(user.sessionsUsed)], ['Monthly', 'Rp 299K'], ['Yearly', 'Rp 2.9JT']].map(([label, value]) => <div key={label} className="stat"><span>{label}</span><strong>{value}</strong></div>)}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[2.5rem] bg-white/75 p-7 shadow-luxe">
            <h2 className="font-display text-4xl text-burgundy">Subscription control</h2>
            <p className="mt-2 text-softblack/60">Ubah status subscription untuk demo akses. Data disimpan di localStorage.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {(['inactive', 'trial', 'monthly', 'yearly'] as const).map((plan) => <button key={plan} className={`pill ${user.plan === plan ? 'active' : ''}`} onClick={() => onUpdate({ ...user, plan })}>{plan}</button>)}
            </div>
          </div>
          <div className="rounded-[2.5rem] bg-burgundy p-7 text-cream shadow-luxe">
            <Sparkles className="text-champagne" />
            <h2 className="mt-4 font-display text-4xl">QRIS Placeholder</h2>
            <div className="mt-5 grid aspect-square place-items-center rounded-3xl border-2 border-dashed border-cream/40 text-center text-sm font-bold uppercase tracking-[.25em]">QRIS<br />API<br />Coming Soon</div>
          </div>
        </div>
      </section>
    </Shell>
  );
}

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(() => loadUser());
  const [screen, setScreen] = useState<Screen>(() => (loadUser() ? 'start' : 'auth'));
  const [frameId, setFrameId] = useState<FrameId>('movie-ticket');
  const [layoutId, setLayoutId] = useState<LayoutId>('strip3');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const canUseBooth = useMemo(() => Boolean(user && user.plan !== 'inactive' && (user.plan !== 'trial' || user.sessionsUsed < 1)), [user]);

  function updateUser(next: SessionUser | null) {
    setUser(next);
    saveUser(next);
  }

  if (!user || screen === 'auth') return <AuthScreen onLogin={(next) => { updateUser(next); setScreen(next.plan === 'inactive' ? 'subscription' : 'start'); }} />;
  if (screen === 'subscription') return <SubscriptionScreen user={user} onUpdate={(next) => { updateUser(next); setScreen('start'); }} />;
  if (screen === 'admin') return <AdminDashboard user={user} onUpdate={updateUser} onBack={() => setScreen('start')} />;
  if (screen === 'frame') return <FramePicker selected={frameId} onSelect={setFrameId} onNext={() => setScreen('layout')} />;
  if (screen === 'layout') return <LayoutPicker selected={layoutId} onSelect={setLayoutId} onNext={() => setScreen('camera')} />;
  if (screen === 'camera') return <CameraScreen frameId={frameId} layoutId={layoutId} onBack={() => setScreen('layout')} onDone={(captured) => { setPhotos(captured); updateUser({ ...user, sessionsUsed: user.sessionsUsed + 1 }); setScreen('preview'); }} />;
  if (screen === 'preview') return <PreviewScreen photos={photos} layoutId={layoutId} frameId={frameId} onRestart={() => setScreen(canUseBooth ? 'frame' : 'subscription')} />;

  return <StartScreen user={user} onAdmin={() => setScreen('admin')} onLogout={() => { updateUser(null); setScreen('auth'); }} onStart={() => setScreen(canUseBooth ? 'frame' : 'subscription')} />;
}
