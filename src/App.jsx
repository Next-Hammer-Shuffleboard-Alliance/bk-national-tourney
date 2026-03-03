import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// App version
const APP_VERSION = "3.1.3";

// Mobile detection hook
function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

const MAX_TEAMS = 64;
const MIN_TEAMS = 32;
const TOTAL_COURTS = 10;
const DEFAULT_TOURNAMENT_ID = "BK_National_2026";
const TOURNAMENT_NAME = "Brooklyn National";
const TOURNAMENT_SUBTITLE = "NYSA State Doubles Tournament";
const TOURNAMENT_DATE = "Jun 13–14, 2026";
const TOURNAMENT_VENUE = "Royal Palms Shuffleboard Club, Brooklyn, NY";

// Day-round assignments (organizer can adjust)
const DAY_ROUND_CONFIG = {
  main: { 1: [1, 2], 2: [3, 4, 5, 6] },       // Day 1: R1+R2, Day 2: R16+QF+SF+F
  consolation: { 1: [1, 2], 2: [3, 4, 5] },    // Day 1: R1+R2, Day 2: QF+SF+F
};

// Sponsor configuration (placeholder - update with real sponsors)
const SPONSORS = [
  { name: "Brooklyn Brewery", tagline: "Official Beer Sponsor", color: "#B8860B", icon: "🍺" },
  { name: "Royal Palms", tagline: "Home of Brooklyn Shuffleboard", color: "#3A8E6E", icon: "🌴" },
  { name: "Paulie Gee's", tagline: "Official Pizza Partner", color: "#E85D3A", icon: "🍕" },
  { name: "Jameson", tagline: "Official Spirits Partner", color: "#2E7D32", icon: "🥃" },
];

// Embedded images (base64)
const NHSA_LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCABAAEADASIAAhEBAxEB/8QAHAAAAwACAwEAAAAAAAAAAAAAAAQHBQYBAggD/8QANhAAAQMDAQUGAwYHAAAAAAAAAQIDBAAFEQYHEiFBURUiMTJh0RNVlAgUF2JxkzM0U2NygYL/xAAZAQACAwEAAAAAAAAAAAAAAAAAAgEDBQT/xAAqEQACAQIEBAUFAAAAAAAAAAABAgADEQQSIUEFUWFxIjEyM7GBodHh8P/aAAwDAQACEQMRAD8A8wWyA1EYT3AXSMqURxz0pyiithVCiwmUzFjcwo8aK37YxAix7pP1xd2g5adKsCaUK8JEsndisf8ATmFH0QaGbKLwUXNpoJ4HB4GjIzjNUba3ae273aNZaehKcjaxT8VMVhO8WriFBEiOB1+Id4DouvptHj2bQ+mEbPIjEKdqJbqJOobjuhwx3U8UQ2VcgjPfI8ScdQFFQG3WMUteTWk7nAalsK7gDoGUqA456U5RTMoYWMVWKm4hRRRTSIDJOACTyAGSao+1EjSelrNs0ZITKjYuuoCD5pzqBuNH0ZaIH+SjS2xi3w2LpP1vemEvWfSrImqaX5ZMsnEVj13nMKPog1kNCW6NLN02s7QwqZao8tS246zhV5uKiVBlP9sHvLPgAMdapZhft8yxRp3+JQtjEW4aX0F2K/Ojx9XakbeuekYMhgLVDcSwpIfyf4a3k5Sgc90GvOLynVvLW+XC6pRLhcJKirPHezxznOfWs5fdX6gvGtV6xlz1C8mSmS28jgGVIILaUDklOAAOg/Wti2zwok2dbtfWhhLVr1UyqUtpHljTUndlM+mF98ei6hFyNrvJY5l02k/oooq+VQoGScAEnkAMk0VVfsz6Ll6m1uq8Jt4mxLClMr4K/I9JJxHbV+Xe76vyoPWkqOKaljtGRS7BRM65o9bkO07LzMRbIFoZ7f1tcj5Izq0d1snmptrCEp5rWehqe7UdYN6pukaJaopt2mrQ191s0D+iyDxWrq4s95R8eXKrDtM0vdpFlOkbNeY623pSp+obgtte/dp6iSVHA4MoPBCfTPKpv+EF5+aQv2nPaspOKYMHxVBf6/36nY+ErHRVk2qj7KSNU6evWzKQoF+eO0bCpR8lwaQctjoHmwpH6hNdvwgvPzSF+057UxbNl2pLbcY1xgXuIxLivIfYdS05lC0kKSfDkQKd+L4Jh7g+/wCIi4OuD6ZLlApUUqSUqBwUqGCD0PrRVS+0XpZ62akiasZhfdrfqZoy91CSG2pQOJCE55FXfHov0qW1o0qi1UDr5GczoUYqdoVV9j+2EbPtEag0+jTrc2TcypbMsPfDKFKb+HhzhlSU+IwQck9c1HLZPalsJ74DoGFJJ45605QQtVddRJBam3WOpu93CQO17icDH80571z2xd/m1x+qc96Ropsq8ouYx7ti7/Nrj9U570dsXf5tcfqnPekaKMq8oZjGJc6dMShMybKkhvO4HnlLCc+OMk4/1S9FJ3Oe1EYV3wXSMJSDxz1oJCi5gAWNhP/Z";

// ── Utility helpers ──────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// Score display: always higher score first (shuffleboard convention)
function scoreStr(scores) {
  if (!scores || scores.forfeit) return null;
  const high = Math.max(scores.team1, scores.team2);
  const low = Math.min(scores.team1, scores.team2);
  return `${high}–${low}`;
}

function formatDuration(startedAt, completedAt) {
  if (!startedAt || !completedAt) return null;
  const mins = Math.round((completedAt - startedAt) / 60000);
  if (mins < 1) return "<1 min";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function createInitialState() {
  return {
    phase: "setup",       // setup → playing → complete
    teams: [],
    seed: [],
    mainBracket: [],      // Full 6-round bracket (R1 through Final)
    consolationBracket: [],
    consolationFinalized: false,  // true once organizer has generated/skipped consolation
  };
}

// ═════════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════════
export default function BKNationalTournament() {
  const isMobile = useIsMobile();
  const [state, setState] = useState(createInitialState);
  const [view, setView] = useState("player");
  const [organizerUnlocked, setOrganizerUnlocked] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("teams");
  const tournamentId = DEFAULT_TOURNAMENT_ID;

  const [teamForm, setTeamForm] = useState({
    player1First: "", player1Last: "", player2First: "", player2Last: "", bracketPosition: ""
  });
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingPosition, setEditingPosition] = useState(null); // which bracket position is being edited
  const [bulkInput, setBulkInput] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  
  const [organizerBracketTab, setOrganizerBracketTab] = useState("main"); // "main" | "consolation"
  const [myTeamId, setMyTeamIdRaw] = useState(""); // persists across view switches
  const [completionStatsView, setCompletionStatsView] = useState("main"); // "main" | "consolation" for completion banner
  const [announcements, setAnnouncements] = useState([]); // [{id, text, timestamp}]
  const [dayFilter, setDayFilter] = useState(1); // 1, 2, or "all"
  const [sponsorIdx, setSponsorIdx] = useState(0);

  // Rotate sponsor banner
  useEffect(() => {
    const t = setInterval(() => setSponsorIdx(i => (i + 1) % SPONSORS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // ── Persist myTeamId separately (player-side, lightweight) ──
  const myTeamIdLoaded = useRef(false);
  useEffect(() => {
    // Load myTeamId from localStorage (local to each device)
    if (!myTeamIdLoaded.current) {
      myTeamIdLoaded.current = true;
      try {
        const saved = localStorage.getItem("myTeamId");
        if (saved) setMyTeamIdRaw(saved);
      } catch (e) {}
    }
  }, []);
  const setMyTeamId = (id) => {
    setMyTeamIdRaw(id);
    try {
      if (id) localStorage.setItem("myTeamId", id);
      else localStorage.removeItem("myTeamId");
    } catch (e) {}
  };

  // ── Phase 4: Full tournament state persistence via Firebase ──────────────
  const stateLoaded = useRef(false);
  const saveTimer = useRef(null);
  const isLocalUpdate = useRef(false);

  // Subscribe to Firebase on mount
  useEffect(() => {
    import('./firebase.js').then(({ subscribeToTournament }) => {
      if (typeof subscribeToTournament !== 'function') return;
      subscribeToTournament(tournamentId, (data) => {
        if (data && !isLocalUpdate.current) {
          try {
            if (data.state && data.state.teams) {
              setState(data.state);
              if (data.announcements) setAnnouncements(data.announcements);
            }
          } catch (e) { /* corrupted data, start fresh */ }
        }
        isLocalUpdate.current = false;
        stateLoaded.current = true;
      });
    }).catch(() => { /* firebase not available */ });
  }, [tournamentId]);

  // Auto-save state to Firebase on changes (debounced 500ms)
  useEffect(() => {
    if (!stateLoaded.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      isLocalUpdate.current = true;
      import('./firebase.js').then(({ saveTournament }) => {
        if (typeof saveTournament !== 'function') return;
        saveTournament(tournamentId, {
          state,
          announcements,
          savedAt: Date.now(),
        });
      }).catch(() => { /* firebase not available */ });
    }, 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state, announcements, tournamentId]);

  // Ensure viewport meta tag for mobile
  useEffect(() => {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
      document.head.appendChild(meta);
    }
    // Set favicon (shuffleboard puck)
    if (!document.querySelector('link[rel="icon"][data-app]')) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.setAttribute("data-app", "bk-national");
      link.href = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAwADADASIAAhEBAxEB/8QAHQABAAEEAwEAAAAAAAAAAAAACAcFBgMJAQMEAP/EADUQAAEDAwMDAgMECwEAAAAAAAECAwQFBhEAByEIEjETURQiMQkkQVIVFjM2YWJjZXKRobP/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AGWpT2W2QurcmuRIvezQafJR6rcyoAo+IbBwox0HBfIwc9vA47inIygOmPZbb2i0ih3RuJAdl1Grx2ZdNXPSk0vtdQlTaAR8pdwrHa9jJ+hKsd2lddka3XLfeFyogJpTIC1rlKCG2SPpUFHHYoHGFAgg4wc6CJ7W6W9pKPZz9AnURVYkSUASKlKcIk9w5BbKcBoA/gnyMBXdop9TnTurahoVymXJCnUV93sZjy3kNTUknwEcB0DjKkDPOSkAZ0sbonbwtWrUl7Wxk1OKlsfAO3GC3NPv6IVguJA8GQEKyMkuAjXnpuROvKfd812/Xqq5Xkq7ZCaiFJdR7J7T9KeeAABjxoNw6dtmK1vDcEqJDmN02mQEpVNnLR3+n3Z7UpTx3KOCQCQMJPOpA6gelmVtrZTt20q6E1iFGWhEpp+OGHU960oSUYUoLypQGOCMjzyR19Gu9tt7WRLiptzx5zkeepqRHVDZDi+9GUlOCRnIUD547T78Y7qZ6hanuo7FpVMpz9HteI/66WX1D1pjifpU5jgAc4QCQCcknjAOLZONHlbD2TElsNPsO21BQ406gKQtJjIyCDwQfbWuU21Zka+KzOonoVCPRJTTMGjVN5xceOlUdtwqjLJV6DmXFAHtUO3CB2DnV2zVu1OnbQWZUrUqXw7r1AgvSKdNUpyHIWqOgqI8qYUST8yMpySShR1ldv7lju3zdNMq7Bo1YfnMqRCkOJPq9sRkEtLB7XBxnA+YAgqSnONB99U3Rs6hUqTNuqpC2nYie5+HUwG3x/gkEh4H8C0VgnjOQRoZ9Qm91t7zXPR7VpNpx2qcagywKzLbAnlCnACGsfs0nJ4V3Z4JAOpQ+0o/cS0z/AHN3/wAtCq15zNLual1OQlamYkxl9wIAKilCwo4z+OBoJ03y6V7zsf4irWyly5qEjKyphv7zHT/O2MlQH5k54BJCdHoggkEEEeQdIPfDqova+vXpVtly16CvKSiO596fT/UdH0g/lRjyQSrR9dz3c8kgH/mge/TF1KWNULVoVkXG5+rlTpsFiAy9JcBjSQ02lAV6nAbUe3OFYHso5xqa6TTKZW67ekKpw486I5UIyux1IUnIhsEKHsQeQRyDyNeTepf2K6gLz2slGOwpFXory0qkQJR9gE5Q59SCEjA8p9wcaCb/ALQekT6PZVsMGtSJ9M/SLnw7Uweo+wfT8etnLiMfnCl58rPgDHSi6u95LO3Z2yth23n3mahGqC1zKfIRh1gFsgHI+VSSQcEH2yBnGi9wP46CgOM+BrlxXcrI8YA/wBDVp51Wg//2Q==";
      document.head.appendChild(link);
    }
  }, []);

  function showNotif(msg, type = "success") {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }

  // ── Team management ───────────────────────────────────────────
  function addTeam() {
    if (!teamForm.player1First.trim() || !teamForm.player1Last.trim() ||
        !teamForm.player2First.trim() || !teamForm.player2Last.trim()) {
      showNotif("Please fill in all player names", "error");
      return;
    }
    const pos = parseInt(teamForm.bracketPosition);
    if (!pos || pos < 1 || pos > MAX_TEAMS) {
      showNotif("Please enter a valid bracket position (1-64)", "error");
      return;
    }
    // Check if position is already taken
    if (state.teams.some(t => t.bracketPosition === pos)) {
      showNotif(`Position ${pos} is already assigned`, "error");
      return;
    }
    const newTeam = { id: generateId(), ...teamForm, bracketPosition: pos };
    setState(s => ({ ...s, teams: [...s.teams, newTeam] }));
    setTeamForm({ player1First: "", player1Last: "", player2First: "", player2Last: "", bracketPosition: "" });
    showNotif(`Team added at position ${pos}`);
  }

  function addBye() {
    const pos = parseInt(teamForm.bracketPosition);
    if (!pos || pos < 1 || pos > MAX_TEAMS) {
      showNotif("Please enter a valid bracket position (1-64)", "error");
      return;
    }
    // Check if position is already taken
    if (state.teams.some(t => t.bracketPosition === pos)) {
      showNotif(`Position ${pos} is already assigned`, "error");
      return;
    }
    const byeTeam = { 
      id: generateId(), 
      player1First: "BYE", player1Last: "", 
      player2First: "", player2Last: "", 
      bracketPosition: pos,
      isBye: true 
    };
    setState(s => ({ ...s, teams: [...s.teams, byeTeam] }));
    setTeamForm({ player1First: "", player1Last: "", player2First: "", player2Last: "", bracketPosition: "" });
    showNotif(`BYE added at position ${pos}`);
  }

  function startEdit(team) {
    setEditingTeamId(team.id);
    setTeamForm({
      player1First: team.player1First, player1Last: team.player1Last,
      player2First: team.player2First, player2Last: team.player2Last,
      bracketPosition: team.bracketPosition?.toString() || "",
    });
  }

  function saveEdit() {
    const pos = parseInt(teamForm.bracketPosition);
    if (!pos || pos < 1 || pos > MAX_TEAMS) {
      showNotif("Please enter a valid bracket position (1-64)", "error");
      return;
    }
    // Check if position is taken by another team
    if (state.teams.some(t => t.bracketPosition === pos && t.id !== editingTeamId)) {
      showNotif(`Position ${pos} is already assigned`, "error");
      return;
    }
    setState(s => ({
      ...s,
      teams: s.teams.map(t => t.id === editingTeamId ? { ...t, ...teamForm, bracketPosition: pos } : t)
    }));
    setEditingTeamId(null);
    setTeamForm({ player1First: "", player1Last: "", player2First: "", player2Last: "", bracketPosition: "" });
    showNotif("Team updated");
  }

  function cancelEdit() {
    setEditingTeamId(null);
    setTeamForm({ player1First: "", player1Last: "", player2First: "", player2Last: "", bracketPosition: "" });
  }

  function removeTeam(id) {
    setConfirmDialog({
      message: "Remove this team?",
      onConfirm: () => {
        setState(s => ({ ...s, teams: s.teams.filter(t => t.id !== id) }));
        setConfirmDialog(null);
        showNotif("Team removed");
      }
    });
  }

  function processBulkInput() {
    const lines = bulkInput.trim().split("\n").filter(l => l.trim());
    let added = 0;
    const newTeams = [];
    const existingPositions = new Set(state.teams.map(t => t.bracketPosition));
    
    for (const line of lines) {
      // Format: "Position, FirstName LastName, FirstName LastName" or "Position, BYE"
      const parts = line.split(",").map(p => p.trim()).filter(Boolean);
      if (parts.length < 2) continue;
      
      const pos = parseInt(parts[0]);
      if (!pos || pos < 1 || pos > MAX_TEAMS) continue;
      if (existingPositions.has(pos) || newTeams.some(t => t.bracketPosition === pos)) continue;
      
      if (parts[1].toUpperCase() === "BYE") {
        // BYE entry
        newTeams.push({
          id: generateId(),
          player1First: "BYE", player1Last: "",
          player2First: "", player2Last: "",
          bracketPosition: pos,
          isBye: true,
        });
        added++;
      } else if (parts.length >= 3) {
        // Team entry: Position, Player1 Name, Player2 Name
        const p1Parts = parts[1].split(/\s+/);
        const p2Parts = parts[2].split(/\s+/);
        if (p1Parts.length >= 2 && p2Parts.length >= 2) {
          newTeams.push({
            id: generateId(),
            player1First: p1Parts[0],
            player1Last: p1Parts.slice(1).join(" "),
            player2First: p2Parts[0],
            player2Last: p2Parts.slice(1).join(" "),
            bracketPosition: pos,
          });
          added++;
        }
      }
    }
    setState(s => ({ ...s, teams: [...s.teams, ...newTeams] }));
    setBulkInput("");
    setShowBulkInput(false);
    showNotif(`${added} position${added !== 1 ? "s" : ""} added`);
  }

  // ── Seeding ─────────────────────────────────────────────────────
  function seedTeams() {
    // Check all positions are filled (teams or byes)
    const filledPositions = new Set(state.teams.map(t => t.bracketPosition));
    const missingPositions = [];
    for (let i = 1; i <= MAX_TEAMS; i++) {
      if (!filledPositions.has(i)) missingPositions.push(i);
    }
    
    if (missingPositions.length > 0) {
      showNotif(`Missing positions: ${missingPositions.join(", ")}. Fill all 64 positions with teams or BYEs.`, "error");
      return;
    }

    // Sort teams by bracket position
    const sortedTeams = [...state.teams].sort((a, b) => a.bracketPosition - b.bracketPosition);
    
    // Create 64 slots based on bracket positions
    // BYE teams become null slots
    const slots = sortedTeams.map(t => t.isBye ? null : t.id);

    // Build full main bracket: 64 → 32 → 16 → 8 → 4 → 2 → 1 (6 rounds)
    const rounds = [];
    let current = [...slots];
    let roundNum = 1;
    const now = Date.now();

    // First pass: create all matches
    while (current.length > 1) {
      const matches = [];
      for (let i = 0; i < current.length; i += 2) {
        const matchNum = matches.length + 1;
        const t1 = current[i];
        const t2 = current[i + 1];
        const isBye = (t1 === null || t2 === null) && (t1 !== null || t2 !== null);
        const isR1 = roundNum === 1;
        
        if (isBye) {
          // Auto-advance the present team
          const winner = t1 || t2;
          matches.push({
            id: generateId(), matchNum,
            team1Id: t1, team2Id: t2,
            court: null, scores: null, winner: winner,
            status: "completed",
            completedAt: now,
          });
        } else if (t1 === null && t2 === null) {
          matches.push({
            id: generateId(), matchNum,
            team1Id: null, team2Id: null,
            court: null, scores: null, winner: null,
            status: "pending",
          });
        } else {
          matches.push({
            id: generateId(), matchNum,
            team1Id: t1, team2Id: t2,
            court: null, scores: null, winner: null,
            status: isR1 && t1 && t2 ? "waiting" : "pending",
          });
        }
      }
      rounds.push({ roundNum, matches });
      // Future rounds: placeholder null slots (filled as winners advance)
      current = matches.map(() => null);
      roundNum++;
    }

    // Advance bye winners to round 2
    rounds[0].matches.forEach((m, idx) => {
      if (m.winner) {
        const nextMatchIdx = Math.floor(idx / 2);
        const isSlot1 = idx % 2 === 0;
        if (rounds[1]) {
          rounds[1].matches[nextMatchIdx] = {
            ...rounds[1].matches[nextMatchIdx],
            [isSlot1 ? "team1Id" : "team2Id"]: m.winner
          };
        }
      }
    });

    // Build consolation bracket scaffold (32 teams → 5 rounds: 16→8→4→2→1)
    // Slots populated as main R1 losers are determined
    const consolationRounds = [];
    let consolationSlots = 16; // 32 losers = 16 R1 matches
    let cRoundNum = 1;
    while (consolationSlots >= 1) {
      const matches = [];
      for (let i = 0; i < consolationSlots; i++) {
        matches.push({
          id: generateId(), matchNum: i + 1,
          team1Id: null, team2Id: null,
          court: null, scores: null, winner: null, status: "pending",
        });
      }
      consolationRounds.push({ roundNum: cRoundNum, matches });
      consolationSlots = Math.floor(consolationSlots / 2);
      cRoundNum++;
      if (consolationSlots < 1) break;
    }

    // No auto court assignment — organizer assigns courts manually

    // Count actual teams vs byes
    const numTeams = state.teams.filter(t => !t.isBye).length;
    const numByes = state.teams.filter(t => t.isBye).length;

    setState(s => ({ ...s, phase: "playing", seed: slots.filter(x => x !== null), mainBracket: rounds, consolationBracket: consolationRounds, consolationFinalized: true }));
    setActiveTab("dashboard");
    showNotif(`Bracket generated with ${numTeams} teams${numByes > 0 ? ` (${numByes} byes)` : ""}!`);
  }

  function reseed() {
    setConfirmDialog({
      message: "Re-seed all teams? This will regenerate the bracket and lose entered scores.",
      onConfirm: () => { seedTeams(); setConfirmDialog(null); }
    });
  }

  function fullReset() {
    setConfirmDialog({
      message: "Full reset? This will clear ALL teams, brackets, and scores. You'll start from scratch.",
      onConfirm: () => {
        setState(createInitialState());
        setMyTeamId("");
        setAnnouncements([]);
        setOrganizerBracketTab("main");
        setActiveTab("teams");
        setConfirmDialog(null);
        setOrganizerUnlocked(false);
        setView("player");
        // Clear persisted state in Firebase
        import('./firebase.js').then(({ saveTournament }) => {
          saveTournament(tournamentId, null);
        });
        showNotif("Tournament reset! Starting fresh.");
      }
    });
  }

  // ── Score entry (works for all rounds of both brackets) ─────
  // Check if editing a match score would cascade (winner already advanced)
  function wouldCascade(bracketType, roundIdx, matchId) {
    const bracketKey = bracketType === "main" ? "mainBracket" : "consolationBracket";
    const bracket = state[bracketKey];
    if (roundIdx >= bracket.length - 1) return false; // final match can't cascade
    const round = bracket[roundIdx];
    const matchIndex = round.matches.findIndex(m => m.id === matchId);
    const match = round.matches[matchIndex];
    if (!match || !match.winner) return false;
    // Check if the next round match has been played
    const nextMatchIdx = Math.floor(matchIndex / 2);
    const nextMatch = bracket[roundIdx + 1]?.matches[nextMatchIdx];
    return nextMatch && nextMatch.status === "completed";
  }

  function enterBracketScoreWithCheck(bracketType, roundIdx, matchId, t1Score, t2Score) {
    if (wouldCascade(bracketType, roundIdx, matchId)) {
      setConfirmDialog({
        message: "⚠️ This match's winner has already played in the next round. Changing this score will update the winner and may invalidate later results. Continue?",
        onConfirm: () => { enterBracketScore(bracketType, roundIdx, matchId, t1Score, t2Score); setConfirmDialog(null); showNotif("Score updated"); }
      });
    } else {
      enterBracketScore(bracketType, roundIdx, matchId, t1Score, t2Score);
      showNotif(`Score saved: ${t1Score}–${t2Score}`);
    }
  }

  function enterBracketScore(bracketType, roundIdx, matchId, t1Score, t2Score) {
    setState(s => {
      const bracketKey = bracketType === "main" ? "mainBracket" : "consolationBracket";
      const bracket = [...s[bracketKey]];
      const round = { ...bracket[roundIdx] };
      let winId = null;
      let loseId = null;
      let matchIndex = -1;

      round.matches = round.matches.map((m, mIdx) => {
        if (m.id !== matchId) return m;
        matchIndex = mIdx;
        winId = t1Score > t2Score ? m.team1Id : m.team2Id;
        loseId = t1Score > t2Score ? m.team2Id : m.team1Id;
        return { ...m, scores: { team1: t1Score, team2: t2Score }, winner: winId, status: "completed", completedAt: Date.now() };
      });
      bracket[roundIdx] = round;

      // Advance winner to next round
      if (winId && roundIdx < bracket.length - 1) {
        if (matchIndex === -1) matchIndex = round.matches.findIndex(m => m.id === matchId);
        const nextRound = { ...bracket[roundIdx + 1] };
        const nextMatchIdx = Math.floor(matchIndex / 2);
        const isSlot1 = matchIndex % 2 === 0;
        nextRound.matches = nextRound.matches.map((m, idx) => {
          if (idx !== nextMatchIdx) return m;
          return { ...m, [isSlot1 ? "team1Id" : "team2Id"]: winId };
        });
        bracket[roundIdx + 1] = nextRound;
      }

      let newState = { ...s, [bracketKey]: bracket };

      // Auto-feed loser to consolation bracket (main R1 only)
      if (bracketType === "main" && roundIdx === 0 && loseId) {
        const consolation = [...newState.consolationBracket];
        if (consolation.length > 0) {
          const cMatchIdx = Math.floor(matchIndex / 2);
          const cSlot = matchIndex % 2 === 0 ? "team1Id" : "team2Id";
          const cRound = { ...consolation[0] };
          cRound.matches = cRound.matches.map((m, idx) => {
            if (idx !== cMatchIdx) return m;
            const updated = { ...m, [cSlot]: loseId };
            // If both teams are now populated, mark as waiting
            if (updated.team1Id && updated.team2Id && updated.status === "pending") {
              updated.status = "waiting";
            }
            return updated;
          });
          consolation[0] = cRound;
          newState = { ...newState, consolationBracket: consolation };
        }
      }

      return newState;
    });
  }

  function forfeitBracket(bracketType, roundIdx, matchId, forfeitTeamId) {
    setState(s => {
      const bracketKey = bracketType === "main" ? "mainBracket" : "consolationBracket";
      const bracket = [...s[bracketKey]];
      const round = { ...bracket[roundIdx] };
      const match = round.matches.find(m => m.id === matchId);
      if (!match) return s;
      const winnerId = match.team1Id === forfeitTeamId ? match.team2Id : match.team1Id;
      const loserId = forfeitTeamId;
      const matchIndex = round.matches.findIndex(m => m.id === matchId);

      round.matches = round.matches.map(m => {
        if (m.id !== matchId) return m;
        return { ...m, scores: { team1: 0, team2: 0, forfeit: forfeitTeamId }, winner: winnerId, status: "completed", completedAt: Date.now() };
      });
      bracket[roundIdx] = round;

      // Advance winner
      if (roundIdx < bracket.length - 1) {
        const nextRound = { ...bracket[roundIdx + 1] };
        const nextMatchIdx = Math.floor(matchIndex / 2);
        const isSlot1 = matchIndex % 2 === 0;
        nextRound.matches = nextRound.matches.map((m, idx) => {
          if (idx !== nextMatchIdx) return m;
          return { ...m, [isSlot1 ? "team1Id" : "team2Id"]: winnerId };
        });
        bracket[roundIdx + 1] = nextRound;
      }

      let newState = { ...s, [bracketKey]: bracket };

      // Auto-feed loser to consolation bracket (main R1 only)
      if (bracketType === "main" && roundIdx === 0 && loserId) {
        const consolation = [...newState.consolationBracket];
        if (consolation.length > 0) {
          const cMatchIdx = Math.floor(matchIndex / 2);
          const cSlot = matchIndex % 2 === 0 ? "team1Id" : "team2Id";
          const cRound = { ...consolation[0] };
          cRound.matches = cRound.matches.map((m, idx) => {
            if (idx !== cMatchIdx) return m;
            const updated = { ...m, [cSlot]: loserId };
            if (updated.team1Id && updated.team2Id && updated.status === "pending") {
              updated.status = "waiting";
            }
            return updated;
          });
          consolation[0] = cRound;
          newState = { ...newState, consolationBracket: consolation };
        }
      }

      return newState;
    });
  }

  function assignCourt(bracketType, roundIdx, matchId, court) {
    setState(s => {
      const bracketKey = bracketType === "main" ? "mainBracket" : "consolationBracket";
      const bracket = [...s[bracketKey]];
      const round = { ...bracket[roundIdx] };
      round.matches = round.matches.map(m => {
        if (m.id !== matchId) return m;
        if (court) {
          return { ...m, court, status: "on_court", startedAt: m.startedAt || Date.now() };
        } else {
          // Unassign court — set back to waiting
          return { ...m, court: null, status: "waiting", startedAt: undefined };
        }
      });
      bracket[roundIdx] = round;
      return { ...s, [bracketKey]: bracket };
    });
    if (court) showNotif(`Assigned to Court ${court}`);
    else showNotif("Court unassigned");
  }

  function markAsBye(bracketType, roundIdx, matchId, slot) {
    // slot is "team1" or "team2" - removes that team and auto-advances the other
    setState(s => {
      const bracketKey = bracketType === "main" ? "mainBracket" : "consolationBracket";
      const bracket = s[bracketKey].map((r, ri) => {
        if (ri !== roundIdx) return r;
        return {
          ...r,
          matches: r.matches.map(m => {
            if (m.id !== matchId) return m;
            
            // Remove the specified team
            const t1 = slot === "team1" ? null : m.team1Id;
            const t2 = slot === "team2" ? null : m.team2Id;
            const winner = t1 || t2;
            
            if (winner) {
              // Auto-advance the remaining team as a bye
              return { 
                ...m, 
                team1Id: t1,
                team2Id: t2,
                winner, 
                status: "completed", 
                scores: null, 
                court: null,
                completedAt: Date.now()
              };
            }
            // Both teams removed - shouldn't happen but handle it
            return { ...m, team1Id: t1, team2Id: t2 };
          })
        };
      });

      // Advance winner to next round
      const match = bracket[roundIdx].matches.find(m => m.id === matchId);
      if (match?.winner && roundIdx < bracket.length - 1) {
        const matchIndex = bracket[roundIdx].matches.findIndex(m => m.id === matchId);
        const nextRound = { ...bracket[roundIdx + 1] };
        const nextMatchIdx = Math.floor(matchIndex / 2);
        const isSlot1 = matchIndex % 2 === 0;
        nextRound.matches = nextRound.matches.map((m, idx) => {
          if (idx !== nextMatchIdx) return m;
          return { ...m, [isSlot1 ? "team1Id" : "team2Id"]: match.winner };
        });
        bracket[roundIdx + 1] = nextRound;
      }

      return { ...s, [bracketKey]: bracket };
    });
    showNotif("Team removed — opponent advances (bye)");
  }

  function markTeamAsBye(teamId) {
    // Find this team in an active (non-completed) match in either bracket
    const findTeamMatch = (bracket, bracketType) => {
      for (let rIdx = 0; rIdx < bracket.length; rIdx++) {
        for (const match of bracket[rIdx].matches) {
          if (match.status === "completed") continue;
          if (match.team1Id === teamId) return { bracketType, roundIdx: rIdx, matchId: match.id, slot: "team1" };
          if (match.team2Id === teamId) return { bracketType, roundIdx: rIdx, matchId: match.id, slot: "team2" };
        }
      }
      return null;
    };
    
    let found = findTeamMatch(state.mainBracket, "main");
    if (!found) found = findTeamMatch(state.consolationBracket, "consolation");
    
    if (found) {
      markAsBye(found.bracketType, found.roundIdx, found.matchId, found.slot);
    } else {
      showNotif("Team not in an active match", "error");
    }
  }

  // ── Test: Simulate a round (fills random scores for all incomplete matches in earliest incomplete round) ──
  function simulateRound(bracketType) {
    setState(s => {
      const bracketKey = bracketType === "main" ? "mainBracket" : "consolationBracket";
      const bracket = s[bracketKey].map(r => ({ ...r, matches: r.matches.map(m => ({ ...m })) }));
      // Find the first round with playable (both teams, not completed) matches
      let targetRound = -1;
      for (let r = 0; r < bracket.length; r++) {
        if (bracket[r].matches.some(m => m.team1Id && m.team2Id && m.status !== "completed")) {
          targetRound = r;
          break;
        }
      }
      if (targetRound === -1) return s;

      // Fill scores for all playable matches in target round
      bracket[targetRound].matches = bracket[targetRound].matches.map(m => {
        if (m.status === "completed" || !m.team1Id || !m.team2Id) return m;
        // True coin flip for winner
        const team1Wins = Math.random() < 0.5;
        let a, b;
        if (team1Wins) {
          a = Math.floor(Math.random() * 5) + 3; // 3-7
          b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
        } else {
          b = Math.floor(Math.random() * 5) + 3; // 3-7
          a = Math.floor(Math.random() * (b - 1)) + 1; // 1 to b-1
        }
        const winner = team1Wins ? m.team1Id : m.team2Id;
        // Random timestamps: start between 10am-4pm today, duration 8-45 min
        const today = new Date(); today.setHours(10 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60), 0, 0);
        const startedAt = today.getTime();
        const completedAt = startedAt + (8 + Math.floor(Math.random() * 38)) * 60000;
        return { ...m, scores: { team1: a, team2: b }, winner, status: "completed", startedAt, completedAt };
      });

      // Advance all winners from this round to next round
      if (targetRound < bracket.length - 1) {
        bracket[targetRound].matches.forEach((m, mIdx) => {
          if (m.winner) {
            const nextMatchIdx = Math.floor(mIdx / 2);
            const isSlot1 = mIdx % 2 === 0;
            const nm = bracket[targetRound + 1].matches[nextMatchIdx];
            if (nm) {
              bracket[targetRound + 1].matches[nextMatchIdx] = {
                ...nm, [isSlot1 ? "team1Id" : "team2Id"]: m.winner
              };
            }
          }
        });
      }

      let newState = { ...s, [bracketKey]: bracket };

      // Auto-feed losers to consolation bracket (main R1 only)
      if (bracketType === "main" && targetRound === 0) {
        const consolation = newState.consolationBracket.map(r => ({ ...r, matches: r.matches.map(m => ({ ...m })) }));
        if (consolation.length > 0) {
          bracket[0].matches.forEach((m, mIdx) => {
            if (m.winner && m.team1Id && m.team2Id) {
              const loserId = m.team1Id === m.winner ? m.team2Id : m.team1Id;
              const cMatchIdx = Math.floor(mIdx / 2);
              const cSlot = mIdx % 2 === 0 ? "team1Id" : "team2Id";
              if (consolation[0].matches[cMatchIdx]) {
                const cm = consolation[0].matches[cMatchIdx];
                consolation[0].matches[cMatchIdx] = {
                  ...cm,
                  [cSlot]: loserId,
                  status: (cSlot === "team1Id" ? loserId && cm.team2Id : cm.team1Id && loserId) ? "waiting" : cm.status,
                };
                // Re-check status after both slots
                const updated = consolation[0].matches[cMatchIdx];
                if (updated.team1Id && updated.team2Id && updated.status === "pending") {
                  consolation[0].matches[cMatchIdx] = { ...updated, status: "waiting" };
                }
              }
            }
          });
          newState = { ...newState, consolationBracket: consolation };
        }
      }

      return newState;
    });
  }

  // ── Consolation bracket ─────────────────────────────
  // Consolation bracket is auto-scaffolded at seed time and auto-populated as main R1 losers are determined
  const mainR1 = state.mainBracket.length > 0 ? state.mainBracket[0] : null;
  const mainR1Complete = mainR1 ? mainR1.matches.every(m => m.status === "completed") : false;
  const consolationBracketGenerated = state.consolationBracket.length > 0;

  // ── Tournament completion ─────────────────────────────────────
  function getBracketWinner(bracket) {
    if (bracket.length === 0) return null;
    const finalRound = bracket[bracket.length - 1];
    if (!finalRound || finalRound.matches.length === 0) return null;
    const finalMatch = finalRound.matches[0];
    return finalMatch.winner || null;
  }

  const mainWinner = getBracketWinner(state.mainBracket);
  const consolationWinner = getBracketWinner(state.consolationBracket);
  const mainBracketStarted = state.mainBracket.length > 0;
  const noConsolation = state.consolationFinalized && state.consolationBracket.length === 0;
  const tournamentComplete = mainBracketStarted && mainWinner && (consolationWinner || noConsolation);

  // Auto-set phase to complete
  useEffect(() => {
    if (tournamentComplete && state.phase !== "complete") {
      setState(s => ({ ...s, phase: "complete" }));
    }
  }, [tournamentComplete]);

  // Tournament stats — pass "main" or "consolation" for bracket-specific, or omit for all
  function getTournamentStats(bracketFilter) {
    let matches = getAllMatches();
    if (bracketFilter === "main") matches = matches.filter(m => m.bracket === "Main");
    else if (bracketFilter === "consolation") matches = matches.filter(m => m.bracket === "Consolation");
    const completed = matches.filter(m => m.status === "completed");
    const forfeits = completed.filter(m => m.scores?.forfeit);
    const scoredMatches = completed.filter(m => m.scores && !m.scores.forfeit);
    let highScore = 0;
    let highScoreMatch = null;
    let closestMargin = Infinity;
    let closestMatch = null;
    let biggestBlowout = 0;
    let blowoutMatch = null;
    let shortestDuration = Infinity;
    let shortestMatch = null;
    let longestDuration = 0;
    let longestMatch = null;

    scoredMatches.forEach(m => {
      const s1 = m.scores.team1, s2 = m.scores.team2;
      const high = Math.max(s1, s2);
      const margin = Math.abs(s1 - s2);
      if (high > highScore) { highScore = high; highScoreMatch = m; }
      if (margin < closestMargin) { closestMargin = margin; closestMatch = m; }
      if (margin > biggestBlowout) { biggestBlowout = margin; blowoutMatch = m; }
      if (m.startedAt && m.completedAt) {
        const dur = m.completedAt - m.startedAt;
        if (dur < shortestDuration) { shortestDuration = dur; shortestMatch = m; }
        if (dur > longestDuration) { longestDuration = dur; longestMatch = m; }
      }
    });

    return { total: matches.length, completed: completed.length, forfeits: forfeits.length, highScore, highScoreMatch, closestMargin, closestMatch, biggestBlowout, blowoutMatch, shortestMatch, longestMatch };
  }

  // ── Helpers ───────────────────────────────────────────────────
  const teamMap = useMemo(() => {
    const m = {};
    state.teams.forEach(t => { m[t.id] = t; });
    return m;
  }, [state.teams]);

  function tLabel(id) {
    if (!id) return "TBD";
    const t = teamMap[id];
    if (!t) return "TBD";
    if (t.isBye) return "BYE";
    return `${t.player1First} ${t.player1Last[0]}. & ${t.player2First} ${t.player2Last[0]}.`;
  }

  function tFull(id) {
    if (!id) return "TBD";
    const t = teamMap[id];
    if (!t) return "TBD";
    if (t.isBye) return "BYE";
    return `${t.player1First} ${t.player1Last} & ${t.player2First} ${t.player2Last}`;
  }

  // Find the next round that can be simulated for a bracket
  function getNextSimRound(bracketType) {
    const bracket = bracketType === "main" ? state.mainBracket : state.consolationBracket;
    const mainNames = ["Round 1", "Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Final"];
    const consolationNames = ["Round 1", "Round of 16", "Quarterfinals", "Semifinals", "Final"];
    const names = bracketType === "main" ? mainNames : consolationNames;
    for (let r = 0; r < bracket.length; r++) {
      if (bracket[r].matches.some(m => m.team1Id && m.team2Id && m.status !== "completed")) {
        if (r < names.length) return names[r];
        return `Round ${r + 1}`;
      }
    }
    return null; // all done
  }

  function getAllMatches() {
    const all = [];
    const mainRoundNames = ["Round 1", "Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Final"];
    const consolationRoundNames = ["Round 1", "Round of 16", "Quarterfinals", "Semifinals", "Final"];
    state.mainBracket.forEach((r, ri) => {
      const roundName = mainRoundNames[ri] || `Round ${ri + 1}`;
      r.matches.forEach(m => all.push({ ...m, bracket: "Main", roundName, roundIdx: ri }));
    });
    state.consolationBracket.forEach((r, ri) => {
      const roundName = consolationRoundNames[ri] || `Round ${ri + 1}`;
      r.matches.forEach(m => all.push({ ...m, bracket: "Consolation", roundName, roundIdx: ri }));
    });
    return all;
  }

  // Get matches filtered by day
  function getMatchesForDay(day) {
    const all = getAllMatches();
    if (day === "all") return all;
    return all.filter(m => {
      const bracketKey = m.bracket === "Main" ? "main" : "consolation";
      const dayRounds = DAY_ROUND_CONFIG[bracketKey]?.[day] || [];
      return dayRounds.includes(m.roundIdx + 1); // roundIdx is 0-based, config is 1-based
    });
  }

  // Dashboard stats
  function getDashboardStats(day) {
    const matches = getMatchesForDay(day);
    const completed = matches.filter(m => m.status === "completed");
    const active = matches.filter(m => m.status === "on_court");
    const waiting = matches.filter(m => m.status === "waiting");
    const mainMatches = matches.filter(m => m.bracket === "Main");
    const conMatches = matches.filter(m => m.bracket === "Consolation");
    const mainCompleted = mainMatches.filter(m => m.status === "completed").length;
    const conCompleted = conMatches.filter(m => m.status === "completed").length;

    // Average match duration
    const durations = completed
      .filter(m => m.startedAt && m.completedAt)
      .map(m => m.completedAt - m.startedAt);
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60000) : 0;

    // Estimated finish
    const remaining = matches.length - completed.length;
    const estMinsLeft = avgDuration > 0 && TOTAL_COURTS > 0 ? Math.ceil((remaining / TOTAL_COURTS) * avgDuration) : 0;
    const estFinish = estMinsLeft > 0 ? new Date(Date.now() + estMinsLeft * 60000) : null;

    return {
      total: matches.length, completed: completed.length, active: active.length,
      waiting: waiting.length, remaining,
      mainTotal: mainMatches.length, mainCompleted,
      conTotal: conMatches.length, conCompleted,
      avgDuration, estFinish,
    };
  }

  // Score display: always show higher score first (convention)
  // (uses top-level scoreStr utility)

  return (
    <div style={S.app}>
      <style>{`
        @media (max-width: 600px) {
          .vt-form-grid { grid-template-columns: 1fr !important; }
          .vt-match-grid { grid-template-columns: 1fr !important; }
          .vt-court-grid { grid-template-columns: 1fr 1fr !important; }
          .vt-stat-row { gap: 8px !important; }
          .vt-card { padding: 16px !important; }
        }
        @media (max-width: 400px) {
          .vt-court-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {notification && (
        <div style={{ ...S.notif, background: notification.type === "error" ? "#E85D3A" : "#3A8E6E" }}>
          {notification.msg}
        </div>
      )}

      {confirmDialog && (
        <div style={S.overlay}>
          <div style={S.confirmBox}>
            <p style={{ margin: "0 0 20px", fontSize: 15, lineHeight: 1.5, color: "#ddd" }}>{confirmDialog.message}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={S.btnSec} onClick={() => setConfirmDialog(null)}>Cancel</button>
              <button style={S.btnDanger} onClick={confirmDialog.onConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <header style={S.header}>
        <div style={{ ...S.headerRow, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "flex-start" }}>
          <div>
            <h1 style={{ ...S.title, fontSize: isMobile ? 24 : 30, cursor: "default", WebkitUserSelect: "none", userSelect: "none" }}
              onClick={() => {
                if (organizerUnlocked) return;
                tapCountRef.current += 1;
                clearTimeout(tapTimerRef.current);
                if (tapCountRef.current >= 5) {
                  tapCountRef.current = 0;
                  setOrganizerUnlocked(true);
                  setView("organizer");
                } else {
                  tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 2000);
                }
              }}
            >{TOURNAMENT_NAME}</h1>
            <p style={S.subtitle}>{TOURNAMENT_SUBTITLE}</p>
            <p style={S.meta}>📅 {TOURNAMENT_DATE}</p>
            <p style={S.meta}>📍 {TOURNAMENT_VENUE}</p>
          </div>
          <div style={S.viewToggle}>
            {organizerUnlocked ? (
              <>
                <button style={view === "organizer" ? S.viewBtnOn : S.viewBtnOff} onClick={() => setView("organizer")}>
                  ⚙️ Organizer
                </button>
                <button style={view === "player" ? S.viewBtnOn : S.viewBtnOff} onClick={() => setView("player")}>
                  👤 Player View
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {view === "organizer" && (
        <div style={{ ...S.tabBar, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {[
            { key: "dashboard", label: "📊 Dashboard" },
            { key: "courts", label: "⚡ Courts" },
            { key: "bracket", label: "🏆 Bracket" },
            { key: "teams", label: `👥 Teams (${state.teams.length})` },
            { key: "announce", label: `📢 Announce${announcements.length ? ` (${announcements.length})` : ""}` },
          ].map(tab => (
            <button key={tab.key} style={activeTab === tab.key ? S.tabOn : S.tabOff} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <main style={S.main}>
        {/* ═══ TOURNAMENT COMPLETE BANNER ═══ */}
        {tournamentComplete && view === "organizer" && (
          <div style={{
            background: "linear-gradient(135deg, #1a2010 0%, #0f1a0a 50%, #1a1a05 100%)",
            border: "1px solid #3A8E6E40",
            borderRadius: 16,
            padding: "32px 28px",
            marginBottom: 24,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Tournament Complete!</h2>
            <p style={{ fontSize: 13, color: "#555", margin: "0 0 24px" }}>{TOURNAMENT_NAME} · {TOURNAMENT_DATE}</p>

            <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              <div style={{
                background: completionStatsView === "main" ? "#0d1a0d" : "#0a0f0a",
                border: `2px solid ${completionStatsView === "main" ? "#3A8E6E" : "#3A8E6E30"}`,
                borderRadius: 12, padding: "20px 28px", minWidth: 220, cursor: "pointer",
                transition: "all 0.15s",
              }} onClick={() => setCompletionStatsView("main")}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#3A8E6E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                  🏆 Main Champion
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{tFull(mainWinner)}</div>
                {completionStatsView === "main" && <div style={{ fontSize: 10, color: "#3A8E6E", marginTop: 6 }}>▼ Stats below</div>}
              </div>
              {consolationWinner && (
              <div style={{
                background: completionStatsView === "consolation" ? "#15120a" : "#0f0e0a",
                border: `2px solid ${completionStatsView === "consolation" ? "#D4A843" : "#D4A84330"}`,
                borderRadius: 12, padding: "20px 28px", minWidth: 220, cursor: "pointer",
                transition: "all 0.15s",
              }} onClick={() => setCompletionStatsView("consolation")}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#D4A843", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                  🥈 Consolation Champion
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{tFull(consolationWinner)}</div>
                {completionStatsView === "consolation" && <div style={{ fontSize: 10, color: "#D4A843", marginTop: 6 }}>▼ Stats below</div>}
              </div>
              )}
            </div>

            {/* Bracket-specific stats */}
            {(() => {
              const bracketFilter = completionStatsView;
              const stats = getTournamentStats(bracketFilter);
              const accent = bracketFilter === "main" ? "#3A8E6E" : "#D4A843";
              const label = bracketFilter === "main" ? "Main Bracket" : "Consolation Bracket";
              return (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 11, color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                    {label} Stats
                  </div>
                  <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                    <div style={S.statBox}>
                      <div style={S.statNum}>{stats.completed}</div>
                      <div style={S.statLabel}>Matches Played</div>
                    </div>
                    {stats.highScoreMatch && (
                      <div style={S.statBox}>
                        <div style={S.statNum}>{stats.highScore}</div>
                        <div style={S.statLabel}>High Score</div>
                        <div style={S.statDetail}>{tLabel(stats.highScoreMatch.winner)}</div>
                      </div>
                    )}
                    {stats.closestMatch && (
                      <div style={S.statBox}>
                        <div style={S.statNum}>{stats.closestMargin}</div>
                        <div style={S.statLabel}>Closest Margin</div>
                        <div style={S.statDetail}>{tLabel(stats.closestMatch.winner)} · {scoreStr(stats.closestMatch.scores)}</div>
                      </div>
                    )}
                    {stats.blowoutMatch && (
                      <div style={S.statBox}>
                        <div style={S.statNum}>{stats.biggestBlowout}</div>
                        <div style={S.statLabel}>Biggest Blowout</div>
                        <div style={S.statDetail}>{tLabel(stats.blowoutMatch.winner)} · {scoreStr(stats.blowoutMatch.scores)}</div>
                      </div>
                    )}
                    {stats.shortestMatch && (
                      <div style={S.statBox}>
                        <div style={S.statNum}>{formatDuration(stats.shortestMatch.startedAt, stats.shortestMatch.completedAt)}</div>
                        <div style={S.statLabel}>Shortest Match</div>
                        <div style={S.statDetail}>{tLabel(stats.shortestMatch.team1Id)} vs {tLabel(stats.shortestMatch.team2Id)}</div>
                      </div>
                    )}
                    {stats.longestMatch && (
                      <div style={S.statBox}>
                        <div style={S.statNum}>{formatDuration(stats.longestMatch.startedAt, stats.longestMatch.completedAt)}</div>
                        <div style={S.statLabel}>Longest Match</div>
                        <div style={S.statDetail}>{tLabel(stats.longestMatch.team1Id)} vs {tLabel(stats.longestMatch.team2Id)}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            <div style={{ marginTop: 20 }}>
              <button style={{ ...S.btnSm, fontSize: 11, color: "#E85D3A", borderColor: "#E85D3A30" }} onClick={fullReset}>🗑 Full Reset</button>
            </div>
          </div>
        )}

        {/* ═══ DAY FILTER BAR ═══ */}
        {view === "organizer" && (activeTab === "dashboard" || activeTab === "courts") && state.phase !== "setup" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0 8px", borderBottom: "1px solid #111", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Showing:</span>
            <div style={{ display: "flex", gap: 3, background: "#111", borderRadius: 8, padding: 3 }}>
              {[{ key: 1, label: "Day 1 · Sat" }, { key: 2, label: "Day 2 · Sun" }, { key: "all", label: "All" }].map(d => (
                <button key={d.key} onClick={() => setDayFilter(d.key)} style={{
                  padding: "6px 14px", fontSize: 11, fontWeight: dayFilter === d.key ? 700 : 400,
                  color: dayFilter === d.key ? "#fff" : "#555",
                  background: dayFilter === d.key ? "#1e1e1e" : "transparent",
                  border: "none", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap",
                }}>{d.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ DASHBOARD TAB ═══ */}
        {view === "organizer" && activeTab === "dashboard" && (() => {
          if (state.phase === "setup") {
            return <div style={S.card}><p style={S.empty}>Generate the bracket to see the dashboard.</p></div>;
          }
          const ds = getDashboardStats(dayFilter);
          const allDs = getDashboardStats("all");
          const allMatches = getMatchesForDay(dayFilter);
          const liveMatches = allMatches.filter(m => m.status === "on_court").sort((a, b) => (a.startedAt || 0) - (b.startedAt || 0));
          const recentlyCompleted = allMatches.filter(m => m.status === "completed" && m.completedAt).sort((a, b) => b.completedAt - a.completedAt).slice(0, 6);
          const upNext = allMatches.filter(m => m.status === "waiting").slice(0, 6);
          return (
            <div>
              {/* Stat cards */}
              <div className="vt-stat-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: "20px 20px 16px", borderTop: "3px solid #3A8E6E" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{dayFilter === "all" ? "Total Completed" : `Day ${dayFilter} Completed`}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{ds.completed} / {ds.total}</div>
                  <div style={{ fontSize: 11, color: "#3A8E6E", marginTop: 4 }}>{ds.total > 0 ? Math.round(ds.completed / ds.total * 100) : 0}% complete</div>
                </div>
                <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: "20px 20px 16px", borderTop: "3px solid #D4A843" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Courts Active</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{ds.active} / {TOTAL_COURTS}</div>
                  <div style={{ fontSize: 11, color: "#D4A843", marginTop: 4 }}>{TOTAL_COURTS - ds.active} available</div>
                </div>
                <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: "20px 20px 16px", borderTop: "3px solid #888" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Avg Match Time</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{ds.avgDuration > 0 ? `${ds.avgDuration} min` : "—"}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>rolling average</div>
                </div>
                <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: "20px 20px 16px", borderTop: `3px solid ${ds.remaining > 40 ? "#E85D3A" : "#3A8E6E"}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Est. Finish</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{ds.estFinish ? ds.estFinish.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—"}</div>
                  <div style={{ fontSize: 11, color: ds.remaining > 40 ? "#E85D3A" : "#3A8E6E", marginTop: 4 }}>{ds.remaining} matches remaining</div>
                </div>
              </div>

              {/* Bracket progress */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <DashboardBracketProgress title="🏆 Main Bracket" bracket={state.mainBracket}
                  roundNames={["Round 1", "Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Final"]}
                  dayFilter={dayFilter} bracketKey="main" accent="#3A8E6E" />
                <DashboardBracketProgress title="🥈 Consolation" bracket={state.consolationBracket}
                  roundNames={["Round 1", "Round of 16", "Quarterfinals", "Semifinals", "Final"]}
                  dayFilter={dayFilter} bracketKey="consolation" accent="#D4A843" />
              </div>

              {/* Live on courts */}
              {liveMatches.length > 0 && (
                <div style={S.card}>
                  <h3 style={{ ...S.cardTitle, fontSize: 14 }}>🔴 Live on Courts</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {liveMatches.map(m => (
                      <div key={m.id} style={{ padding: "10px 14px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderLeft: `3px solid ${m.bracket === "Main" ? "#3A8E6E" : "#D4A843"}`, borderRadius: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: m.bracket === "Main" ? "#3A8E6E" : "#D4A843", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {m.bracket} · {m.roundName}{m.court ? ` · Court ${m.court}` : ""}
                          </span>
                          {m.startedAt && <span style={{ fontSize: 10, color: "#D4A843" }}>⏱ {formatDuration(m.startedAt, Date.now())}</span>}
                        </div>
                        <div style={{ fontSize: 13, color: "#ccc" }}>{tLabel(m.team1Id)} <span style={{ color: "#333" }}>vs</span> {tLabel(m.team2Id)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Up next */}
              {upNext.length > 0 && (
                <div style={{ ...S.card, marginTop: 16 }}>
                  <h3 style={{ ...S.cardTitle, fontSize: 14 }}>⏳ Up Next — Ready for Court</h3>
                  <p style={{ fontSize: 11, color: "#444", margin: "0 0 12px" }}>Both teams set, waiting for an open court</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {upNext.map(m => (
                      <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderLeft: `3px solid ${m.bracket === "Main" ? "#3A8E6E" : "#D4A843"}`, borderRadius: 8 }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: m.bracket === "Main" ? "#3A8E6E" : "#D4A843", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.bracket} · {m.roundName}</span>
                          <div style={{ fontSize: 13, color: "#bbb", marginTop: 2 }}>{tLabel(m.team1Id)} <span style={{ color: "#333" }}>vs</span> {tLabel(m.team2Id)}</div>
                        </div>
                        <select style={S.courtSelect} onChange={e => { if (e.target.value) assignCourt(m.bracket.toLowerCase() === "main" ? "main" : "consolation", m.roundIdx, m.id, parseInt(e.target.value)); }}>
                          <option value="">Court...</option>
                          {Array.from({ length: TOTAL_COURTS }, (_, i) => i + 1).map(c => <option key={c} value={c}>Ct {c}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recently completed */}
              {recentlyCompleted.length > 0 && (
                <div style={{ ...S.card, marginTop: 16 }}>
                  <h3 style={{ ...S.cardTitle, fontSize: 14 }}>✅ Recently Completed</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {recentlyCompleted.map(m => (
                      <div key={m.id} style={{ padding: "10px 14px", background: "#0b0d0b", border: "1px solid #141814", borderLeft: `3px solid ${m.bracket === "Main" ? "#3A8E6E" : "#D4A843"}`, borderRadius: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: m.bracket === "Main" ? "#3A8E6E" : "#D4A843", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {m.bracket} · {m.roundName}{m.court ? ` · Court ${m.court}` : ""}
                          </span>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            {m.startedAt && m.completedAt && <span style={{ fontSize: 10, color: "#555" }}>⏱ {formatDuration(m.startedAt, m.completedAt)}</span>}
                            {m.scores && <span style={{ fontSize: 11, color: "#555", fontWeight: 600 }}>{scoreStr(m.scores)}</span>}
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: "#3A8E6E", fontWeight: 600, marginTop: 3 }}>✓ {tLabel(m.winner)}</div>
                        <span style={{ fontSize: 11, color: "#444" }}>def. {tLabel(m.winner === m.team1Id ? m.team2Id : m.team1Id)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })()}

        {/* ═══ TEAMS TAB ═══ */}
        {view === "organizer" && activeTab === "teams" && (
          <div>
            {/* Version display */}
            {state.phase === "setup" && (
              <div style={{ ...S.card, marginBottom: 16, padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#666" }}>v{APP_VERSION} · {DEFAULT_TOURNAMENT_ID}</span>
                </div>
              </div>
            )}

            <div style={S.card}>
              <h2 style={S.cardTitle}>{editingTeamId ? "✏️ Edit Team" : "Add Team or BYE"}</h2>
              {editingTeamId && (
                <div style={S.editBanner}>Editing: <strong>{tFull(editingTeamId)}</strong></div>
              )}
              <div className="vt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={S.formGroup}>
                  <label style={S.label}>Player 1 First</label>
                  <input style={S.input} placeholder="First name"
                    value={teamForm.player1First}
                    onChange={e => setTeamForm(prev => ({ ...prev, player1First: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && (!editingTeamId ? addTeam() : saveEdit())}
                  />
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>Player 1 Last</label>
                  <input style={S.input} placeholder="Last name"
                    value={teamForm.player1Last}
                    onChange={e => setTeamForm(prev => ({ ...prev, player1Last: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && (!editingTeamId ? addTeam() : saveEdit())}
                  />
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>Player 2 First</label>
                  <input style={S.input} placeholder="First name"
                    value={teamForm.player2First}
                    onChange={e => setTeamForm(prev => ({ ...prev, player2First: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && (!editingTeamId ? addTeam() : saveEdit())}
                  />
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>Player 2 Last</label>
                  <input style={S.input} placeholder="Last name"
                    value={teamForm.player2Last}
                    onChange={e => setTeamForm(prev => ({ ...prev, player2Last: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && (!editingTeamId ? addTeam() : saveEdit())}
                  />
                </div>
                <div style={{ ...S.formGroup, gridColumn: "1 / -1" }}>
                  <label style={S.label}>Bracket Position (1-32)</label>
                  <input style={{ ...S.input, width: 100 }} type="number" min="1" max="32" placeholder="#"
                    value={teamForm.bracketPosition}
                    onChange={e => setTeamForm(prev => ({ ...prev, bracketPosition: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && (!editingTeamId ? addTeam() : saveEdit())}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                {editingTeamId ? (
                  <>
                    <button style={S.btnPri} onClick={saveEdit}>💾 Save Changes</button>
                    <button style={S.btnSec} onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button style={S.btnPri} onClick={addTeam}>
                      + Add Team
                    </button>
                    <button style={{ ...S.btnSec, backgroundColor: "#555" }} onClick={addBye}>
                      + Add BYE
                    </button>
                    <button style={S.btnSec} onClick={() => setShowBulkInput(!showBulkInput)}>
                      {showBulkInput ? "Hide Bulk" : "📋 Bulk Add"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {showBulkInput && !editingTeamId && (
              <div style={S.card}>
                <h2 style={S.cardTitle}>Bulk Add Teams</h2>
                <p style={S.hint}>One team per line: <code style={{ color: "#D4A843" }}>Position, FirstName LastName, FirstName LastName</code></p>
                <p style={S.hint}>For BYEs: <code style={{ color: "#D4A843" }}>Position, BYE</code></p>
                <textarea style={S.textarea} rows={8}
                  placeholder={"1, John Smith, Jane Doe\n2, Mike Johnson, Sarah Williams\n3, BYE"}
                  value={bulkInput} onChange={e => setBulkInput(e.target.value)} />
                <button style={{ ...S.btnPri, marginTop: 12 }} onClick={processBulkInput}>Process & Add</button>
              </div>
            )}

            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <h2 style={S.cardTitle}>
                  Bracket Positions <span style={S.badge}>{state.teams.length}/32</span>
                </h2>
                {state.teams.length === MAX_TEAMS && state.phase === "setup" && (
                  <button style={S.btnAccent} onClick={seedTeams}>🎲 Generate Bracket</button>
                )}
                {state.teams.length > 0 && state.teams.length < MAX_TEAMS && state.phase === "setup" && (
                  <span style={{ fontSize: 12, color: "#888" }}>Fill all 32 positions (teams + BYEs)</span>
                )}
                {state.phase === "playing" && !mainR1Complete && (
                  <button style={S.btnSec} onClick={reseed}>🔄 Re-generate</button>
                )}
                {state.phase !== "setup" && (
                  <button style={{ ...S.btnSm, fontSize: 11, color: "#E85D3A", borderColor: "#E85D3A30" }} onClick={fullReset}>🗑 Full Reset</button>
                )}
              </div>

              {state.teams.length === 0 ? (
                <p style={S.empty}>No positions filled yet. Add teams or BYEs above, or load demo data.</p>
              ) : (
                <div style={S.teamList}>
                  {[...state.teams].sort((a, b) => (a.bracketPosition || 999) - (b.bracketPosition || 999)).map((team) => (
                    <div key={team.id} style={{
                      ...S.teamRow,
                      background: editingTeamId === team.id ? "#15160a" : team.isBye ? "#1a1510" : "#0d0d0d",
                      borderColor: editingTeamId === team.id ? "#D4A84355" : team.isBye ? "#3a3020" : "#1a1a1a",
                    }}>
                      <span style={{ ...S.teamNum, minWidth: 32 }}>{team.bracketPosition || "?"}</span>
                      <div style={S.teamInfo}>
                        {team.isBye ? (
                          <span style={{ color: "#888", fontStyle: "italic" }}>— BYE —</span>
                        ) : (
                          <>
                            <span style={S.playerName}>{team.player1First} {team.player1Last}</span>
                            <span style={{ color: "#333", fontSize: 12, margin: "0 6px" }}>&</span>
                            <span style={S.playerName}>{team.player2First} {team.player2Last}</span>
                          </>
                        )}
                      </div>
                      <div style={S.teamActions}>
                        {!team.isBye && (
                          <button style={{ ...S.btnIcon, color: editingTeamId === team.id ? "#D4A843" : "#555" }}
                            onClick={() => editingTeamId === team.id ? cancelEdit() : startEdit(team)}
                            title="Edit team">
                            {editingTeamId === team.id ? "✕" : "✏️"}
                          </button>
                        )}
                        {state.phase === "setup" && (
                          <button style={{ ...S.btnIcon, color: "#E85D3A" }} onClick={() => removeTeam(team.id)} title="Remove">🗑</button>
                        )}
                        {state.phase !== "setup" && !team.isBye && (
                          <button style={{ ...S.btnIcon, color: "#E85D3A", fontSize: 10, fontWeight: 700 }} onClick={() => markTeamAsBye(team.id)} title="Mark as bye (no-show)">BYE</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {state.teams.length === 0 && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button style={S.btnSec} onClick={() => {
                  const fn = ["Alex","Blake","Casey","Drew","Eden","Flynn","Gray","Harper","Indigo","Jules","Kit","Lane","Morgan","Noel","Oak","Parker","Quinn","Riley","Sage","Taylor","Uri","Val","Wren","Xen","York","Zane","Ari","Bay","Cruz","Dale","Elm","Faye","Ash","Bram","Cleo","Dane","Esme","Finn","Gale","Hale","Iris","Jade","Kira","Lark","Milo","Nico","Opal","Pax","Remi","Skye","Tara","Uma","Vera","Wade","Xyla","Yara","Zora","Beau","Cass","Dex","Elio","Fern","Gia","Hugh","Axel","Bree","Colt","Dawn","Ezra","Fawn","Glen","Hope","Ivan","June","Knox","Luna","Mars","Nova","Owen","Peri","Rafe","Shay","Theo","Vail","Wynn","Zeke","Alma","Beck","Cora","Dell","Enid","Ford","Gene","Hugo","Isla","Joel","Kade","Leif","Mara","Neil","Orin","Penn","Reed","Suki","Troy","Vida","West","Zara","Blye","Chip","Dove","Elan","Flor","Greer","Haze","Ivy","Joss","Kael","Lux","Myra","Nero","Orla","Petra","Rue","Sol","Ty","Ursa","Bex"];
                  const ln = ["Adams","Brooks","Chen","Davis","Evans","Foster","Garcia","Hayes","Ito","Jones","Kim","Lee","Miller","Nash","Ortiz","Park","Qin","Reyes","Shah","Torres","Ueda","Vega","Wang","Xu","Yang","Zhang","Bell","Cole","Diaz","Epp","Fry","Gill","Hart","Irwin","Jain","Kerr","Long","Moss","Ngo","Odom","Pike","Roth","Sato","Tran","Ueno","Voss","Webb","Xie","Yoon","Zhu","Baek","Clay","Dunn","Egan","Fox","Gold","Hood","Ives","Joy","Kang","Lowe","Mori","Nye","Rao","Bard","Cho","Delk","Fisk","Goff","Holt","Judd","Kline","Lam","Moon","Nagel","Oaks","Pham","Rusk","Stein","Thao","Vale","Ware","Yeo","Zinn","Bloom","Crane","Dyer","Ernst","Flores","Grant","Hess","Inman","Joyce","Kemp","Laird","Marsh","Noble","Pace","Quist","Rios","Scott","Thorne","Unger","Vance","Wolfe","Yeung","Zabel","Black","Cross","Drake","Elder","Frost","Grove","Hyde","Jett","Kent","Locke","Mohr","Neff","Oakes","Pratt","Quirk","Rush","Stark","Trask","Usher","Voss","Wray"];
                  const sf = shuffleArray(fn), sl = shuffleArray(ln);
                  const teams = [];
                  for (let i = 0; i < 128; i += 2) {
                    const pos = Math.floor(i / 2) + 1;
                    teams.push({ id: generateId(), player1First: sf[i], player1Last: sl[i], player2First: sf[i + 1], player2Last: sl[i + 1], bracketPosition: pos });
                  }
                  setState(s => ({ ...s, teams }));
                  showNotif("64 demo teams loaded at positions 1-64!");
                }}>Load 64 Demo Teams (for testing)</button>
              </div>
            )}
          </div>
        )}

        {/* ═══ BRACKET TAB ═══ */}
        {view === "organizer" && activeTab === "bracket" && (
          <div>
            {state.phase === "setup" && (
              <div style={S.card}><p style={S.empty}>Add at least {MIN_TEAMS} teams (up to {MAX_TEAMS}) and generate the bracket.</p></div>
            )}

            {state.phase !== "setup" && (
              <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
                {/* Main vs Consolation sub-tabs */}
                <div style={{ display: "flex", gap: 3, background: "#111", borderRadius: 8, padding: 3 }}>
                  <button style={organizerBracketTab === "main" ? S.viewBtnOn : S.viewBtnOff} onClick={() => setOrganizerBracketTab("main")}>🏆 Main</button>
                  <button style={{
                    ...(organizerBracketTab === "consolation" ? S.viewBtnOn : S.viewBtnOff),
                    ...(!consolationBracketGenerated ? { opacity: 0.4, cursor: "default" } : {}),
                  }} onClick={() => consolationBracketGenerated && setOrganizerBracketTab("consolation")}>
                    🥈 Consolation
                  </button>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  {organizerBracketTab === "main" && (() => {
                    const nextRound = getNextSimRound("main");
                    return nextRound ? (
                      <button style={{ ...S.btnSm, fontSize: 11, color: "#D4A843", borderColor: "#D4A84330" }}
                        onClick={() => simulateRound("main")}
                        title={`Auto-fill random scores for ${nextRound}`}>
                        ⚡ Sim {nextRound}
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: "#333" }}>✓ All rounds complete</span>
                    );
                  })()}
                  {organizerBracketTab === "consolation" && consolationBracketGenerated && (() => {
                    const nextRound = getNextSimRound("consolation");
                    return nextRound ? (
                      <button style={{ ...S.btnSm, fontSize: 11, color: "#D4A843", borderColor: "#D4A84330" }}
                        onClick={() => simulateRound("consolation")}
                        title={`Auto-fill random scores for ${nextRound}`}>
                        ⚡ Sim {nextRound}
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: "#333" }}>✓ All rounds complete</span>
                    );
                  })()}
                  <button style={{ ...S.btnSm, fontSize: 11, color: "#E85D3A", borderColor: "#E85D3A30" }} onClick={fullReset} title="Reset everything">🗑 Reset</button>
                </div>
              </div>
            )}

            {/* ── MAIN BRACKET ── */}
            {state.phase !== "setup" && organizerBracketTab === "main" && (
              <div style={{ ...S.card, borderLeft: "3px solid #3A8E6E" }}>
                <h2 style={{ ...S.cardTitle, color: "#3A8E6E" }}>🏆 Main Bracket</h2>
                <p style={S.hint}>64-team single elimination · Winners advance through each round</p>
                <BracketTree
                  rounds={state.mainBracket} tLabel={tLabel} editable={true}
                  onScore={(rIdx, mId, a, b) => enterBracketScoreWithCheck("main", rIdx, mId, a, b)}
                  onAssignCourt={(rIdx, mId, c) => assignCourt("main", rIdx, mId, c)}
                  accentColor="#3A8E6E" />
                {mainWinner && (
                  <div style={{ textAlign: "center", marginTop: 16, padding: "16px 20px", background: "#0a120a", border: "1px solid #3A8E6E30", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#3A8E6E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>🏆 Champion</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{tFull(mainWinner)}</div>
                  </div>
                )}
              </div>
            )}

            {/* ── CONSOLATION BRACKET ── */}
            {state.phase !== "setup" && organizerBracketTab === "consolation" && (
              <>
                {consolationBracketGenerated ? (
                  <div style={{ ...S.card, borderLeft: "3px solid #D4A843" }}>
                    <h2 style={{ ...S.cardTitle, color: "#D4A843" }}>🥈 Consolation Bracket</h2>
                    <p style={S.hint}>First Match Losers — Single Elimination</p>
                    <BracketTree rounds={state.consolationBracket} tLabel={tLabel} editable={true}
                      onScore={(rIdx, mId, a, b) => enterBracketScoreWithCheck("consolation", rIdx, mId, a, b)}
                      onAssignCourt={(rIdx, mId, c) => assignCourt("consolation", rIdx, mId, c)}
                      accentColor="#D4A843" />
                    {consolationWinner && (
                      <div style={{ textAlign: "center", marginTop: 16, padding: "16px 20px", background: "#12100a", border: "1px solid #D4A84330", borderRadius: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#D4A843", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>🥈 Consolation Champion</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{tFull(consolationWinner)}</div>
                      </div>
                    )}
                  </div>
                ) : noConsolation ? (
                  <div style={S.card}><p style={{ color: "#555", fontSize: 14, textAlign: "center" }}>No consolation bracket.</p></div>
                ) : (
                  <div style={S.card}><p style={S.empty}>Consolation bracket will populate as Main Bracket Round 1 matches complete.</p></div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══ COURTS TAB ═══ */}
        {view === "organizer" && activeTab === "courts" && (
          <CourtsView state={state} tLabel={tLabel} getAllMatches={getAllMatches} assignCourt={assignCourt} />
        )}

        {/* ═══ ORGANIZER: ANNOUNCEMENTS ═══ */}
        {view === "organizer" && activeTab === "announce" && (() => {
          const [draft, setDraft] = [window._annDraft || "", (v) => { window._annDraft = v; }];
          return (
            <div>
              <div style={S.card}>
                <h2 style={S.cardTitle}>📢 Announcements</h2>
                <p style={S.hint}>Post messages visible to all players in the Player View banner.</p>
                <AnnouncementComposer onPost={(text) => {
                  if (!text.trim()) return;
                  setAnnouncements(prev => [{ id: Date.now(), text: text.trim(), timestamp: Date.now() }, ...prev]);
                  showNotif("Announcement posted!");
                }} />
              </div>

              {announcements.length > 0 && (
                <div style={S.card}>
                  <h2 style={S.cardTitle}>History <span style={S.badge}>{announcements.length}</span></h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {announcements.map(a => (
                      <div key={a.id} style={{ padding: "10px 14px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 13, color: "#ddd", lineHeight: 1.5 }}>{a.text}</div>
                          <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>{new Date(a.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
                        </div>
                        <button style={{ ...S.btnSm, fontSize: 10, color: "#E85D3A", borderColor: "#E85D3A30", flexShrink: 0 }}
                          onClick={() => setAnnouncements(prev => prev.filter(x => x.id !== a.id))}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ═══ PLAYER VIEW ═══ */}
        {view === "player" && (
          <PlayerView state={state} tLabel={tLabel} tFull={tFull} teamMap={teamMap}
            mainWinner={mainWinner} consolationWinner={consolationWinner} tournamentComplete={tournamentComplete}
            getTournamentStats={getTournamentStats} myTeamId={myTeamId} setMyTeamId={setMyTeamId}
            completionStatsView={completionStatsView} setCompletionStatsView={setCompletionStatsView} isMobile={isMobile}
            announcements={announcements} sponsors={SPONSORS} sponsorIdx={sponsorIdx}
            dayFilter={dayFilter} setDayFilter={setDayFilter} getDashboardStats={getDashboardStats}
            getAllMatches={getAllMatches} getMatchesForDay={getMatchesForDay} />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #151515", padding: "24px 0 12px", marginTop: 24, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "6px 14px" }}>
          <img src={NHSA_LOGO} alt="Next Hammer SA" style={{ height: 22, opacity: 0.7 }} />
          <span style={{ fontSize: 11, color: "#555", fontWeight: 600 }}>Powered by Next Hammer SA</span>
        </div>
      </footer>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════
// BRACKET TREE VIEW
// ═════════════════════════════════════════════════════════════════
// ── Dashboard Bracket Progress ──
function DashboardBracketProgress({ title, bracket, roundNames, dayFilter, bracketKey, accent }) {
  if (!bracket || bracket.length === 0) return null;
  const filtered = bracket.map((r, i) => {
    const roundNum = i + 1;
    const dayRounds = DAY_ROUND_CONFIG[bracketKey]?.[dayFilter] || [];
    const show = dayFilter === "all" || dayRounds.includes(roundNum);
    if (!show) return null;
    const completed = r.matches.filter(m => m.status === "completed").length;
    const active = r.matches.filter(m => m.status === "on_court").length;
    return { name: roundNames[i] || `R${roundNum}`, total: r.matches.length, completed, active };
  }).filter(Boolean);
  const totalComp = filtered.reduce((s, r) => s + r.completed, 0);
  const totalAll = filtered.reduce((s, r) => s + r.total, 0);
  const pct = totalAll > 0 ? Math.round(totalComp / totalAll * 100) : 0;
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{title}</h3>
        <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{totalComp}/{totalAll} · {pct}%</span>
      </div>
      <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: accent, borderRadius: 3 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map((r, i) => {
          const rPct = r.total > 0 ? (r.completed / r.total) * 100 : 0;
          const isDone = r.completed === r.total;
          const isAct = r.active > 0;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: isDone ? accent : isAct ? "#D4A843" : "#444", fontWeight: isDone || isAct ? 600 : 400, width: 110, flexShrink: 0 }}>
                {isDone ? "✓ " : isAct ? "● " : ""}{r.name}
              </span>
              <div style={{ flex: 1, height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${rPct}%`, height: "100%", background: isDone ? accent : isAct ? "#D4A843" : "#333", borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 10, color: "#555", width: 40, textAlign: "right" }}>{r.completed}/{r.total}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sponsor Banner ──
function SponsorBanner({ sponsors, activeIdx }) {
  if (!sponsors || sponsors.length === 0) return null;
  const sp = sponsors[activeIdx % sponsors.length];
  return (
    <div style={{
      margin: "16px 0", padding: "14px 20px",
      background: `linear-gradient(135deg, ${sp.color}10, ${sp.color}05)`,
      border: `1px solid ${sp.color}20`, borderRadius: 10,
      display: "flex", alignItems: "center", gap: 14, minHeight: 52, transition: "all 0.6s ease",
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${sp.color}15`, border: `1px solid ${sp.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{sp.icon}</div>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: sp.color }}>{sp.name}</span>
        <span style={{ fontSize: 11, color: "#555", marginLeft: 8 }}>{sp.tagline}</span>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {sponsors.map((_, i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === activeIdx % sponsors.length ? sp.color : "#333" }} />
        ))}
      </div>
    </div>
  );
}

function BracketTree({ rounds, tLabel, onScore, onAssignCourt, editable, accentColor }) {
  // Name rounds based on count: 6 rounds = 64-team, 5 = 32-team, etc.
  function getRoundName(rIdx, totalRounds) {
    const names6 = ["Round 1", "Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Final"]; const names5 = ["Round 1", "Round of 16", "Quarterfinals", "Semifinals", "Final"];
    const names4 = ["Round of 16", "Quarterfinals", "Semifinals", "Final"];
    const names3 = ["Quarterfinals", "Semifinals", "Final"];
    const names2 = ["Semifinals", "Final"];
    const names1 = ["Final"];
    const map = { 6: names6, 5: names5, 4: names4, 3: names3, 2: names2, 1: names1 };
    return (map[totalRounds] || [])[rIdx] || `Round ${rIdx + 1}`;
  }

  const [scoreEntry, setScoreEntry] = useState(null);
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [scoreError, setScoreError] = useState("");

  function submitScore(roundIdx, matchId) {
    const a = parseInt(s1), b = parseInt(s2);
    if (isNaN(a) || isNaN(b)) { setScoreError("Enter both scores"); return; }
    if (a === b) { setScoreError("Scores can't be tied"); return; }
    setScoreError("");
    onScore(roundIdx, matchId, a, b);
    setScoreEntry(null); setS1(""); setS2("");
  }

  return (
    <div style={{ overflowX: "auto", paddingBottom: 16, WebkitOverflowScrolling: "touch" }}>
      <div style={{ fontSize: 10, color: "#333", textAlign: "center", marginBottom: 6 }}>← Swipe to see full bracket →</div>
      <div style={{ display: "flex", gap: 4, minWidth: rounds.length * 200 }}>
        {rounds.map((round, rIdx) => {
          const mh = 72, gap = 4;
          const baseOffset = Math.pow(2, rIdx) * (mh + gap) / 2 - mh / 2;
          const spacing = Math.pow(2, rIdx) * (mh + gap);
          const colWidth = Math.min(220, Math.max(160, Math.floor(1000 / rounds.length)));

          return (
            <div key={rIdx} style={{ flex: `0 0 ${colWidth}px` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingLeft: 4 }}>
                {getRoundName(rIdx, rounds.length)}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {round.matches.map((match, mIdx) => {
                  const canPlay = match.team1Id && match.team2Id && match.status !== "completed";
                  const canEnterScore = canPlay && editable;
                  const canEditScore = editable && match.status === "completed" && match.scores;
                  const isClickable = canEnterScore || canEditScore;
                  const hasScore = match.scores && !match.scores?.forfeit;
                  const isForfeit = match.scores?.forfeit;

                  return (
                    <div key={match.id} style={{
                      marginTop: mIdx === 0 ? baseOffset : spacing - mh - gap,
                      height: mh,
                      background: match.status === "completed" ? "#0f1410" : "#0f0f0f",
                      border: `1px solid ${match.status === "completed" ? accentColor + "35" : "#1a1a1a"}`,
                      borderLeft: `3px solid ${match.status === "completed" ? accentColor : match.status === "on_court" ? "#D4A843" : "#1e1e1e"}`,
                      borderRadius: 6,
                      padding: "4px 8px",
                      display: "flex", flexDirection: "column", justifyContent: "center",
                      position: "relative",
                      cursor: isClickable ? "pointer" : "default",
                      transition: "border-color 0.15s",
                    }}
                    onClick={() => {
                      if (isClickable) {
                        if (canEditScore) { setS1(String(match.scores.team1 || "")); setS2(String(match.scores.team2 || "")); }
                        setScoreEntry({ roundIdx: rIdx, matchId: match.id });
                      }
                    }}
                    >
                      {match.court && (
                        <div style={{ position: "absolute", top: 2, right: 4, fontSize: 8, fontWeight: 700, color: accentColor, background: accentColor + "18", padding: "1px 5px", borderRadius: 3 }}>
                          Ct {match.court}
                        </div>
                      )}
                      {match.status === "on_court" && match.status !== "completed" && (
                        <div style={{ position: "absolute", top: 3, left: 12, width: 5, height: 5, borderRadius: "50%", background: "#D4A843" }} />
                      )}

                      <div style={{
                        fontSize: 11, padding: "1px 0",
                        fontWeight: match.winner === match.team1Id ? 700 : 400,
                        color: !match.team1Id ? "#2a2a2a" : match.winner === match.team1Id ? "#fff" : match.winner ? "#444" : "#aaa",
                        display: "flex", justifyContent: "space-between",
                      }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: colWidth - 55 }}>{tLabel(match.team1Id)}</span>
                        {hasScore && <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: match.winner === match.team1Id ? accentColor : "#444" }}>{match.scores.team1}</span>}
                        {isForfeit && match.scores.forfeit === match.team1Id && <span style={{ fontSize: 8, color: "#E85D3A" }}>FF</span>}
                      </div>
                      <div style={{ height: 1, background: "#1a1a1a", margin: "1px 0" }} />
                      <div style={{
                        fontSize: 11, padding: "1px 0",
                        fontWeight: match.winner === match.team2Id ? 700 : 400,
                        color: !match.team2Id ? "#2a2a2a" : match.winner === match.team2Id ? "#fff" : match.winner ? "#444" : "#aaa",
                        display: "flex", justifyContent: "space-between",
                      }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: colWidth - 55 }}>{tLabel(match.team2Id)}</span>
                        {hasScore && <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: match.winner === match.team2Id ? accentColor : "#444" }}>{match.scores.team2}</span>}
                        {isForfeit && match.scores.forfeit === match.team2Id && <span style={{ fontSize: 8, color: "#E85D3A" }}>FF</span>}
                      </div>

                      {match.status === "waiting" && (
                        <div style={{ fontSize: 9, color: "#444", marginTop: 1 }}>⏳ Waiting</div>
                      )}
                      {canEnterScore && (
                        <div style={{ fontSize: 9, color: "#D4A843", marginTop: 1, display: "flex", alignItems: "center", gap: 3 }}>
                          <span style={{ fontSize: 8 }}>▶</span> Click to enter score
                        </div>
                      )}
                      {canEditScore && (
                        <div style={{ fontSize: 9, color: "#555", marginTop: 1, display: "flex", alignItems: "center", gap: 3 }}>
                          ✏️ Click to edit score
                        </div>
                      )}
                      {editable && canPlay && !match.court && (
                        <select style={{ ...S.courtSelect, fontSize: 10, padding: "1px 4px", marginTop: 2 }}
                          onClick={e => e.stopPropagation()}
                          onChange={e => { e.stopPropagation(); onAssignCourt(rIdx, match.id, parseInt(e.target.value)); }}
                          defaultValue="">
                          <option value="">Assign court...</option>
                          {Array.from({ length: TOTAL_COURTS }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Court {i + 1}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {scoreEntry && (() => {
        const round = rounds[scoreEntry.roundIdx];
        const match = round?.matches.find(m => m.id === scoreEntry.matchId);
        if (!match) return null;
        return (
          <div style={S.overlay} onClick={() => setScoreEntry(null)}>
            <div style={S.confirmBox} onClick={e => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 6px", fontSize: 16, color: "#fff" }}>Enter Score</h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "#555" }}>12-frame game · switch colors at frame 6</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ flex: 1, fontSize: 14, color: "#ccc" }}>{tLabel(match.team1Id)}</span>
                  <input style={S.scoreInput} type="number" value={s1}
                    onChange={e => setS1(e.target.value)} autoFocus placeholder="0" />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ flex: 1, fontSize: 14, color: "#ccc" }}>{tLabel(match.team2Id)}</span>
                  <input style={S.scoreInput} type="number" value={s2}
                    onChange={e => setS2(e.target.value)} placeholder="0"
                    onKeyDown={e => e.key === "Enter" && submitScore(scoreEntry.roundIdx, match.id)} />
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8, alignItems: "center" }}>
                  {scoreError && <span style={{ fontSize: 12, color: "#E85D3A", flex: 1 }}>{scoreError}</span>}
                  <button style={S.btnSec} onClick={() => { setScoreEntry(null); setScoreError(""); }}>Cancel</button>
                  <button style={S.btnPri} onClick={() => submitScore(scoreEntry.roundIdx, match.id)}>Save Score</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// COURTS VIEW
// ═════════════════════════════════════════════════════════════════
// ═════════════════════════════════════════════════════════════════
// ANNOUNCEMENT COMPOSER
// ═════════════════════════════════════════════════════════════════
function AnnouncementComposer({ onPost }) {
  const [text, setText] = useState("");
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
      <textarea
        style={{ flex: 1, background: "#111", border: "1px solid #282828", borderRadius: 8, color: "#ddd", fontSize: 14, padding: "10px 12px", resize: "vertical", minHeight: 48, maxHeight: 120, fontFamily: "inherit" }}
        placeholder="Type an announcement..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onPost(text); setText(""); } }}
      />
      <button
        style={{ padding: "10px 18px", background: "#D4A843", color: "#000", fontWeight: 700, fontSize: 13, border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", opacity: text.trim() ? 1 : 0.4 }}
        onClick={() => { onPost(text); setText(""); }}
        disabled={!text.trim()}
      >Post</button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// COURTS VIEW
// ═════════════════════════════════════════════════════════════════
function CourtsView({ state, tLabel, getAllMatches, assignCourt }) {
  const allMatches = getAllMatches();
  const upcoming = allMatches.filter(m => ["pending", "waiting"].includes(m.status) && !m.court && m.team1Id && m.team2Id);

  return (
    <div>
      <div style={S.card}>
        <h2 style={S.cardTitle}>Court Status</h2>
        <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { color: "#D4A843", label: "In Progress" },
            { color: "#3A8E6E", label: "Last Match Complete" },
            { color: "#282828", border: "#444", label: "Available" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, border: l.border ? `1px solid ${l.border}` : "none" }} />
              <span style={{ fontSize: 12, color: "#888" }}>{l.label}</span>
            </div>
          ))}
        </div>

        <div className="vt-court-grid" style={S.courtGrid}>
          {Array.from({ length: TOTAL_COURTS }, (_, i) => {
            const cn = i + 1;
            const active = allMatches.find(m => m.court === cn && m.status === "on_court");
            const completed = allMatches.filter(m => m.court === cn && m.status === "completed");
            const last = completed.length > 0 ? completed[completed.length - 1] : null;

            return (
              <div key={cn} style={{
                background: "#0d0d0d",
                border: `1px solid ${active ? "#D4A84340" : "#1a1a1a"}`,
                borderRadius: 10, overflow: "hidden",
              }}>
                <div style={{
                  padding: "10px 14px",
                  background: active ? "#D4A84310" : "#0f0f0f",
                  borderBottom: `2px solid ${active ? "#D4A843" : last ? "#3A8E6E50" : "#1a1a1a"}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Court {cn}</span>
                  {active ? (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#D4A843", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4A843", display: "inline-block", animation: "none" }} />
                      IN PROGRESS
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#444" }}>AVAILABLE</span>
                  )}
                </div>

                <div style={{ padding: "12px 14px", minHeight: 50 }}>
                  {active ? (
                    <div>
                      <span style={{ fontSize: 9, fontWeight: 700, color: active.bracket === "Main" ? "#3A8E6E" : "#D4A843", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {active.bracket} · {active.roundName}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
                        <span style={{ fontSize: 13, color: "#ddd", fontWeight: 500 }}>{tLabel(active.team1Id)}</span>
                        <span style={{ fontSize: 10, color: "#333" }}>vs</span>
                        <span style={{ fontSize: 13, color: "#ddd", fontWeight: 500 }}>{tLabel(active.team2Id)}</span>
                      </div>
                      {active.startedAt && (
                        <div style={{ fontSize: 10, color: "#D4A843", marginTop: 4 }}>Assigned {new Date(active.startedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
                      )}
                    </div>
                  ) : last ? (
                    <div>
                      <div style={{ fontSize: 11, color: "#3A8E6E", fontWeight: 600, marginBottom: 4 }}>
                        ✓ {tLabel(last.winner)} won
                      </div>
                      <div style={{ fontSize: 11, color: "#444" }}>
                        vs {tLabel(last.winner === last.team1Id ? last.team2Id : last.team1Id)}
                        {last.scores && !last.scores.forfeit && ` · ${scoreStr(last.scores)}`}
                      </div>
                      <div style={{ fontSize: 10, color: "#333", marginTop: 3 }}>
                        {last.completedAt && `Completed ${new Date(last.completedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
                        {formatDuration(last.startedAt, last.completedAt) && ` · ⏱ ${formatDuration(last.startedAt, last.completedAt)}`}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: "#333", fontSize: 13 }}>No matches yet</div>
                  )}
                </div>

                {completed.length > 0 && (
                  <div style={{ borderTop: "1px solid #141414", padding: "6px 14px", background: "#0b0b0b" }}>
                    <span style={{ fontSize: 10, color: "#3A8E6E", fontWeight: 600 }}>
                      ✓ {completed.length} match{completed.length !== 1 ? "es" : ""} played
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {upcoming.length > 0 && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>⏳ Up Next <span style={S.badge}>{upcoming.length} waiting</span></h2>
          <p style={S.hint}>Matches ready to play — assign to a court when one opens up</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {upcoming.slice(0, 10).map(match => (
              <div key={match.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 8, gap: 10,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 9, color: "#444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{match.bracket} · {match.roundName}</span>
                  <div style={{ fontSize: 13, color: "#bbb", marginTop: 2 }}>
                    {tLabel(match.team1Id)} <span style={{ color: "#333" }}>vs</span> {tLabel(match.team2Id)}
                  </div>
                </div>
                <select style={{ ...S.courtSelect, flexShrink: 0 }}
                  onChange={e => {
                    const c = parseInt(e.target.value);
                    if (c) assignCourt(match.bracket === "Main" ? "main" : "consolation", match.roundIdx, match.id, c);
                  }} defaultValue="">
                  <option value="">Court...</option>
                  {Array.from({ length: TOTAL_COURTS }, (_, i) => <option key={i + 1} value={i + 1}>Ct {i + 1}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed matches */}
      {(() => {
        const completedMatches = allMatches.filter(m => m.status === "completed");
        if (completedMatches.length === 0) return null;
        return (
          <div style={S.card}>
            <h2 style={S.cardTitle}>✓ Completed <span style={S.badge}>{completedMatches.length} match{completedMatches.length !== 1 ? "es" : ""}</span></h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {completedMatches.map(match => {
                const winnerId = match.winner;
                const loserId = match.team1Id === winnerId ? match.team2Id : match.team1Id;
                const isForfeit = match.scores?.forfeit;
                return (
                  <div key={match.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", background: "#0b0d0b", border: "1px solid #141814", borderRadius: 8, gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 9, color: "#444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{match.bracket}</span>
                        {match.court && <span style={{ fontSize: 9, color: "#555" }}>· Court {match.court}</span>}
                      </div>
                      <div style={{ fontSize: 13, color: "#3A8E6E", fontWeight: 600 }}>
                        ✓ {tLabel(winnerId)}
                      </div>
                      <div style={{ fontSize: 12, color: "#444", marginTop: 1 }}>
                        def. {tLabel(loserId)}
                        {match.scores && !isForfeit && <span style={{ color: "#555" }}> · {scoreStr(match.scores)}</span>}
                        {isForfeit && <span style={{ color: "#E85D3A" }}> · FF</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// PLAYER VIEW
// ═════════════════════════════════════════════════════════════════
function PlayerView({ state, tLabel, tFull, teamMap, mainWinner, consolationWinner, tournamentComplete, getTournamentStats, myTeamId, setMyTeamId, completionStatsView, setCompletionStatsView, isMobile, announcements, sponsors, sponsorIdx, dayFilter, setDayFilter, getDashboardStats, getAllMatches, getMatchesForDay }) {
  const [playerTab, setPlayerTab] = useState("live"); // "live" | "bracket" | "rules" | "sponsors"
  const [playerBracketTab, setPlayerBracketTab] = useState("main"); // "main" | "consolation"
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(new Set());

  const visibleAnnouncements = announcements?.filter(a => !dismissedAnnouncements.has(a.id)) || [];

  function RulesContent() {
    return (
      <>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#3A8E6E", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Tournament Format</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Teams are seeded into a 64-team bracket.",
              "If your team wins the first match, you advance in the Main Bracket (single elimination from here on).",
              "If your team loses the first match, you drop to the 32-team Consolation Bracket (single elimination from here on).",
              "If your team loses any match after Round 1, your team is eliminated. But if your schedule allows, stay and cheer for the teams still playing!",
              "There are cash prizes for finalists in both brackets.",
            ].map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>
                <span style={{ color: "#3A8E6E", fontWeight: 700, flexShrink: 0 }}>•</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#D4A843", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Match Format</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "12-frame games. Switch colors at the halfway point (after frame 6).",
              "Color order: Y B B Y Y B for frames 1–6, then Y B B Y Y B again for frames 7–12.",
              "4 practice shots per player at the start of each match.",
              "Another 4 practice shots per player at the color switch (before frame 7).",
              "If the score is tied after 12 frames, play sets of 2 frames until the tie is broken.",
              "There is no color switch during the tiebreaker.",
              "Color order during the tiebreaker: B Y – Y B.",
            ].map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>
                <span style={{ color: "#D4A843", fontWeight: 700, flexShrink: 0 }}>•</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#E85D3A", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Coaching</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "We are going to allow communicating/coaching with a few ground rules:",
              "No yelling across the court.",
              "You can point to the court or discs with your tang, but no touching the discs while doing so.",
              "Pointing and hand signals are the preferred method of communicating with a teammate.",
              "A player may walk to the other end of the court to examine the board, but may not speak with their teammate when doing so.",
              "All strategy communication should be limited to 30 seconds or less per shot, and 60 seconds or less per frame.",
              "There are no penalties for breaking the rules, but please do your best to follow them.",
            ].map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>
                <span style={{ color: "#E85D3A", fontWeight: 700, flexShrink: 0 }}>•</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  function getRoundName(bracketType, rIdx, totalRounds) {
    if (bracketType === "main") {
      const n6 = ["Round 1", "Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Final"];
      return n6[rIdx] || `Round ${rIdx + 1}`;
    }
    const map = { 5: ["Round 1", "Round of 16", "QF", "SF", "Final"], 4: ["Round of 16", "QF", "SF", "Final"], 3: ["QF", "SF", "Final"], 2: ["SF", "Final"], 1: ["Final"] };
    return (map[totalRounds] || [])[rIdx] || `Round ${rIdx + 1}`;
  }

  // Gather all matches with metadata
  const allMatches = useMemo(() => {
    const m = [];
    state.mainBracket.forEach((round, ri) => round.matches.forEach(match => {
      if (match.team1Id || match.team2Id) {
        m.push({ ...match, bracket: "Main", roundIdx: ri, roundName: getRoundName("main", ri, state.mainBracket.length) });
      }
    }));
    state.consolationBracket.forEach((round, ri) => round.matches.forEach(match => {
      if (match.team1Id || match.team2Id) {
        m.push({ ...match, bracket: "Consolation", roundIdx: ri, roundName: getRoundName("consolation", ri, state.consolationBracket.length) });
      }
    }));
    return m;
  }, [state.mainBracket, state.consolationBracket]);

  const liveMatches = allMatches.filter(m => m.status === "on_court");
  const waitingMatches = allMatches.filter(m => m.status === "waiting");
  const completedMatches = allMatches.filter(m => m.status === "completed");
  const myMatches = myTeamId ? allMatches.filter(m => m.team1Id === myTeamId || m.team2Id === myTeamId) : [];
  const isMyTeam = (match) => myTeamId && (match.team1Id === myTeamId || match.team2Id === myTeamId);

  function MatchRow({ match, showBracket }) {
    const mine = isMyTeam(match);
    const won = match.winner && match.winner === myTeamId;
    const lost = match.winner && match.winner !== myTeamId && mine;
    const isForfeit = match.scores?.forfeit;
    return (
      <div style={{
        padding: "10px 14px", borderRadius: 8,
        background: mine ? "#10160e" : "#0f0f0f",
        border: `1px solid ${mine ? "#3A8E6E30" : "#1a1a1a"}`,
        borderLeft: `3px solid ${won ? "#3A8E6E" : lost ? "#E85D3A" : match.status === "on_court" ? "#D4A843" : mine ? "#3A8E6E40" : "#1e1e1e"}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 6, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {showBracket && <span style={{ fontSize: 9, fontWeight: 700, color: match.bracket === "Main" ? "#3A8E6E" : "#D4A843", textTransform: "uppercase" }}>{match.bracket}</span>}
            <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>{match.roundName}</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {match.court && <span style={{ fontSize: 10, fontWeight: 700, color: "#D4A843", background: "#1a1505", padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap" }}>Court {match.court}</span>}
            {mine && <span style={{ fontSize: 9, fontWeight: 700, color: "#3A8E6E", background: "#0a150a", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>YOUR MATCH</span>}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            <span style={{ color: match.winner === match.team1Id ? "#fff" : "#888", fontWeight: match.winner === match.team1Id ? 700 : 400 }}>
              {tLabel(match.team1Id)}
            </span>
            {isForfeit && match.scores.forfeit === match.team1Id && <span style={{ fontSize: 9, color: "#E85D3A", marginLeft: 6 }}>FORFEIT</span>}
            <span style={{ color: "#333", margin: "0 8px" }}>vs</span>
            <span style={{ color: match.winner === match.team2Id ? "#fff" : "#888", fontWeight: match.winner === match.team2Id ? 700 : 400 }}>
              {tLabel(match.team2Id)}
            </span>
            {isForfeit && match.scores.forfeit === match.team2Id && <span style={{ fontSize: 9, color: "#E85D3A", marginLeft: 6 }}>FORFEIT</span>}
          </div>
          {match.scores && !isForfeit && (
            <span style={{ fontSize: 13, fontWeight: 600, color: mine ? (won ? "#3A8E6E" : "#E85D3A") : "#888", whiteSpace: "nowrap" }}>
              {mine && match.winner && <span style={{ fontWeight: 700, marginRight: 4 }}>{won ? "W" : "L"}</span>}
              {scoreStr(match.scores)}
            </span>
          )}
        </div>
        {!match.winner && !match.team2Id && match.team1Id && (
          <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>Waiting for opponent</div>
        )}
        {match.status === "on_court" && match.startedAt && (
          <div style={{ fontSize: 10, color: "#D4A843", marginTop: 3 }}>Assigned {new Date(match.startedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
        )}
        {match.status === "completed" && formatDuration(match.startedAt, match.completedAt) && (
          <div style={{ fontSize: 10, color: "#444", marginTop: 3 }}>⏱ {formatDuration(match.startedAt, match.completedAt)}</div>
        )}
      </div>
    );
  }

  const ptabStyle = (active) => ({
    padding: "8px 16px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 8, cursor: "pointer",
    background: active ? "#1a1a1a" : "transparent", color: active ? "#fff" : "#555",
  });

  return (
    <div>
      {/* Announcements banner */}
      {visibleAnnouncements.length > 0 && (
        <div style={{
          background: "#1a1505", border: "1px solid #D4A84330", borderRadius: 10,
          padding: "12px 16px", marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: visibleAnnouncements.length > 1 ? 8 : 0 }}>
            <span style={{ fontSize: 14 }}>📢</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#D4A843" }}>Announcement</span>
            <span style={{ fontSize: 10, color: "#666", marginLeft: "auto" }}>
              {new Date(visibleAnnouncements[0].timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </span>
            <button 
              style={{ background: "transparent", border: "none", color: "#666", fontSize: 14, cursor: "pointer", padding: "2px 6px", marginLeft: 4 }}
              onClick={() => setDismissedAnnouncements(prev => new Set([...prev, visibleAnnouncements[0].id]))}
              title="Dismiss"
            >✕</button>
          </div>
          <div style={{ fontSize: 14, color: "#ddd", lineHeight: 1.5, marginTop: 4 }}>{visibleAnnouncements[0].text}</div>
          {visibleAnnouncements.length > 1 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 11, color: "#888", cursor: "pointer" }}>
                {visibleAnnouncements.length - 1} earlier announcement{visibleAnnouncements.length > 2 ? "s" : ""}
              </summary>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {visibleAnnouncements.slice(1).map(a => (
                  <div key={a.id} style={{ fontSize: 12, color: "#888", lineHeight: 1.4, padding: "6px 0", borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <span style={{ color: "#666", fontSize: 10, marginRight: 8 }}>{new Date(a.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                      {a.text}
                    </div>
                    <button 
                      style={{ background: "transparent", border: "none", color: "#555", fontSize: 12, cursor: "pointer", padding: "0 4px", flexShrink: 0 }}
                      onClick={() => setDismissedAnnouncements(prev => new Set([...prev, a.id]))}
                      title="Dismiss"
                    >✕</button>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Tournament winners */}
      {tournamentComplete && (
        <div style={{
          background: "linear-gradient(135deg, #1a2010 0%, #0f1a0a 50%, #1a1a05 100%)",
          border: "1px solid #3A8E6E40", borderRadius: 16,
          padding: "28px 24px", marginBottom: 20, textAlign: "center",
        }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>🏆</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 20px" }}>Tournament Complete!</h2>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{
              background: completionStatsView === "main" ? "#0d1a0d" : "#0a0f0a",
              border: `2px solid ${completionStatsView === "main" ? "#3A8E6E" : "#3A8E6E30"}`,
              borderRadius: 12, padding: "16px 24px", cursor: "pointer", transition: "all 0.15s",
            }} onClick={() => setCompletionStatsView("main")}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#3A8E6E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>🏆 Main Champion</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{tFull(mainWinner)}</div>
              {completionStatsView === "main" && <div style={{ fontSize: 9, color: "#3A8E6E", marginTop: 5 }}>▼ Stats below</div>}
            </div>
            {consolationWinner && (
              <div style={{
                background: completionStatsView === "consolation" ? "#15120a" : "#0f0e0a",
                border: `2px solid ${completionStatsView === "consolation" ? "#D4A843" : "#D4A84330"}`,
                borderRadius: 12, padding: "16px 24px", cursor: "pointer", transition: "all 0.15s",
              }} onClick={() => setCompletionStatsView("consolation")}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#D4A843", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>🥈 Consolation Champion</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{tFull(consolationWinner)}</div>
                {completionStatsView === "consolation" && <div style={{ fontSize: 9, color: "#D4A843", marginTop: 5 }}>▼ Stats below</div>}
              </div>
            )}
          </div>

          {/* Bracket-specific stats */}
          {(() => {
            const bracketFilter = completionStatsView;
            const stats = getTournamentStats(bracketFilter);
            const accent = bracketFilter === "main" ? "#3A8E6E" : "#D4A843";
            const label = bracketFilter === "main" ? "Main Bracket" : "Consolation Bracket";
            return (
              <div>
                <div style={{ fontSize: 10, color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                  {label} Stats
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <div style={S.statBox}>
                    <div style={S.statNum}>{stats.completed}</div>
                    <div style={S.statLabel}>Matches Played</div>
                  </div>
                  {stats.highScoreMatch && (
                    <div style={S.statBox}>
                      <div style={S.statNum}>{stats.highScore}</div>
                      <div style={S.statLabel}>High Score</div>
                      <div style={S.statDetail}>{tLabel(stats.highScoreMatch.winner)}</div>
                    </div>
                  )}
                  {stats.closestMatch && (
                    <div style={S.statBox}>
                      <div style={S.statNum}>{stats.closestMargin}</div>
                      <div style={S.statLabel}>Closest Margin</div>
                      <div style={S.statDetail}>{tLabel(stats.closestMatch.winner)} · {scoreStr(stats.closestMatch.scores)}</div>
                    </div>
                  )}
                  {stats.blowoutMatch && (
                    <div style={S.statBox}>
                      <div style={S.statNum}>{stats.biggestBlowout}</div>
                      <div style={S.statLabel}>Biggest Blowout</div>
                      <div style={S.statDetail}>{tLabel(stats.blowoutMatch.winner)} · {scoreStr(stats.blowoutMatch.scores)}</div>
                    </div>
                  )}
                  {stats.shortestMatch && (
                    <div style={S.statBox}>
                      <div style={S.statNum}>{formatDuration(stats.shortestMatch.startedAt, stats.shortestMatch.completedAt)}</div>
                      <div style={S.statLabel}>Shortest Match</div>
                      <div style={S.statDetail}>{tLabel(stats.shortestMatch.team1Id)} vs {tLabel(stats.shortestMatch.team2Id)}</div>
                    </div>
                  )}
                  {stats.longestMatch && (
                    <div style={S.statBox}>
                      <div style={S.statNum}>{formatDuration(stats.longestMatch.startedAt, stats.longestMatch.completedAt)}</div>
                      <div style={S.statLabel}>Longest Match</div>
                      <div style={S.statDetail}>{tLabel(stats.longestMatch.team1Id)} vs {tLabel(stats.longestMatch.team2Id)}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* My Team selector — show whenever teams exist */}
      {state.teams.length > 0 && (
        <div style={{ ...S.card, display: "flex", alignItems: isMobile ? "stretch" : "center", gap: 10, flexDirection: isMobile ? "column" : "row", flexWrap: "wrap" }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#888", whiteSpace: "nowrap" }}>My Team:</label>
          <select style={{ ...S.courtSelect, flex: 1, minWidth: 0, maxWidth: "100%", minHeight: 44, fontSize: 15 }} value={myTeamId} onChange={e => setMyTeamId(e.target.value)}>
            <option value="">— Select your team to highlight —</option>
            {[...state.teams].sort((a, b) => {
              const nameA = `${a.player1First} ${a.player1Last}`.toLowerCase();
              const nameB = `${b.player1First} ${b.player1Last}`.toLowerCase();
              return nameA.localeCompare(nameB);
            }).map(t => (
              <option key={t.id} value={t.id}>{tFull(t.id)}</option>
            ))}
          </select>
          {myTeamId && <button style={{ ...S.btnSm, minHeight: 44, padding: "8px 16px" }} onClick={() => setMyTeamId("")}>Clear</button>}
        </div>
      )}

      {/* Pre-draw message — show during setup phase */}
      {state.phase === "setup" && (
        <div style={{
          background: "linear-gradient(135deg, #1a1a10 0%, #0f1510 100%)",
          border: "1px solid #3A8E6E30", borderRadius: 16,
          padding: "40px 24px 36px", textAlign: "center",
        }}>
          {/* Yellow biscuit icon */}
          <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
            <svg width="52" height="52" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="26" fill="#D4A843" stroke="#B8922E" strokeWidth="2" />
              <circle cx="28" cy="28" r="18" fill="none" stroke="#B8922E" strokeWidth="1.5" opacity="0.5" />
              <circle cx="28" cy="28" r="5" fill="#B8922E" opacity="0.6" />
            </svg>
          </div>

          {/* Main heading */}
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
            Tournament Draw<br />Coming Soon
          </h2>

          {/* Description */}
          <p style={{ fontSize: 14, color: "#ccc", margin: "0 auto 24px", lineHeight: 1.7, maxWidth: 320 }}>
            The organizer hasn't generated the bracket yet. Check back shortly for match draw and schedule.
          </p>

          {/* Divider */}
          {state.teams.length > 0 && <div style={{ width: 40, height: 1, background: "#3A8E6E40", margin: "0 auto 20px" }} />}

          {/* Team pick prompt */}
          {state.teams.length > 0 && (
            <p style={{ fontSize: 13, color: "#bbb", margin: "0 0 16px", lineHeight: 1.5 }}>
              👆 Pick your team above so your matches are highlighted once the draw is live!
            </p>
          )}

          {/* Registration count + confirmation */}
          {state.teams.length > 0 && (
            <div style={{
              fontSize: 13, color: "#aaa", background: "#0a0a0a", borderRadius: 10,
              padding: "12px 20px", display: "inline-flex", alignItems: "center", gap: 10,
              border: "1px solid #ffffff10",
            }}>
              <span>{state.teams.length} / {64} teams registered</span>
              {myTeamId && (
                <span style={{ color: "#3A8E6E", borderLeft: "1px solid #ffffff15", paddingLeft: 10 }}>
                  ✓ {tLabel(myTeamId)}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rules card — always visible during setup so players can read up */}
      {state.phase === "setup" && state.teams.length > 0 && (
        <div style={{ ...S.card, marginTop: 16 }}>
          <h2 style={S.cardTitle}>📖 Tournament Rules</h2>
          <RulesContent />
        </div>
      )}

      {/* Player sub-tabs — only show after draw is generated */}
      {state.phase !== "setup" && <>

      {/* Sponsor Banner */}
      <SponsorBanner sponsors={sponsors} activeIdx={sponsorIdx} />

      {/* Day filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0 8px", borderBottom: "1px solid #111", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 3, background: "#111", borderRadius: 8, padding: 3 }}>
          {[{ key: 1, label: "Day 1 · Sat" }, { key: 2, label: "Day 2 · Sun" }, { key: "all", label: "All" }].map(d => (
            <button key={d.key} onClick={() => setDayFilter(d.key)} style={{
              padding: "6px 14px", fontSize: 11, fontWeight: dayFilter === d.key ? 700 : 400,
              color: dayFilter === d.key ? "#fff" : "#555",
              background: dayFilter === d.key ? "#1e1e1e" : "transparent",
              border: "none", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap",
            }}>{d.label}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 3, marginBottom: 16, background: "#111", borderRadius: 8, padding: 3, width: isMobile ? "100%" : "fit-content", overflowX: "auto" }}>
        <button style={{ ...ptabStyle(playerTab === "live"), flex: isMobile ? 1 : undefined, whiteSpace: "nowrap", minHeight: 44 }} onClick={() => setPlayerTab("live")}>{isMobile ? "📡 Live" : "📡 What's Happening"}</button>
        <button style={{ ...ptabStyle(playerTab === "bracket"), flex: isMobile ? 1 : undefined, whiteSpace: "nowrap", minHeight: 44 }} onClick={() => setPlayerTab("bracket")}>🏆 Bracket</button>
        <button style={{ ...ptabStyle(playerTab === "rules"), flex: isMobile ? 1 : undefined, whiteSpace: "nowrap", minHeight: 44 }} onClick={() => setPlayerTab("rules")}>📖 Rules</button>
        <button style={{ ...ptabStyle(playerTab === "sponsors"), flex: isMobile ? 1 : undefined, whiteSpace: "nowrap", minHeight: 44 }} onClick={() => setPlayerTab("sponsors")}>🤝 Sponsors</button>
      </div>

      {/* ─── TAB: What's Happening ─── */}
      {playerTab === "live" && (
        <>
          {/* My Matches - always on top when team selected */}
          {myTeamId && myMatches.length > 0 && (
            <div style={{ ...S.card, borderLeft: "3px solid #3A8E6E" }}>
              <h2 style={{ ...S.cardTitle, color: "#3A8E6E" }}>My Matches — {tLabel(myTeamId)}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {myMatches.map(m => <MatchRow key={m.id} match={m} showBracket={true} />)}
              </div>
            </div>
          )}

          {/* Live on Court */}
          {liveMatches.length > 0 && (
            <div style={S.card}>
              <h2 style={{ ...S.cardTitle, color: "#D4A843" }}>🔴 Live — On Court Now</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {liveMatches.map(m => <MatchRow key={m.id} match={m} showBracket={true} />)}
              </div>
            </div>
          )}

          {/* Up Next */}
          {waitingMatches.length > 0 && (
            <div style={S.card}>
              <h2 style={S.cardTitle}>⏳ Up Next</h2>
              <p style={S.hint}>Waiting for a court to open</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {waitingMatches.map(m => <MatchRow key={m.id} match={m} showBracket={true} />)}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedMatches.length > 0 && (
            <div style={S.card}>
              <h2 style={{ ...S.cardTitle, color: "#555" }}>✓ Completed</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {completedMatches.map(m => <MatchRow key={m.id} match={m} showBracket={true} />)}
              </div>
            </div>
          )}

          {/* Empty states */}
          {state.mainBracket.length === 0 && (
            <div style={S.card}><p style={S.empty}>Tournament bracket hasn't been generated yet. Check back after teams are seeded!</p></div>
          )}
          {state.mainBracket.length > 0 && liveMatches.length === 0 && waitingMatches.length === 0 && completedMatches.length === 0 && (
            <div style={S.card}><p style={S.empty}>No matches in progress yet.</p></div>
          )}
        </>
      )}

      {/* ─── TAB: Bracket ─── */}
      {playerTab === "bracket" && (
        <>
          {state.mainBracket.length > 0 ? (
            <>
              {/* Sub-tabs: Main vs Consolation */}
              <div style={{ display: "flex", gap: 3, marginBottom: 16, background: "#111", borderRadius: 8, padding: 3, width: "fit-content" }}>
                <button style={ptabStyle(playerBracketTab === "main")} onClick={() => setPlayerBracketTab("main")}>🏆 Main</button>
                {state.consolationBracket.length > 0 && (
                  <button style={ptabStyle(playerBracketTab === "consolation")} onClick={() => setPlayerBracketTab("consolation")}>🥈 Consolation</button>
                )}
              </div>

              {playerBracketTab === "main" && (
                <div style={{ ...S.card, borderLeft: "3px solid #3A8E6E" }}>
                  <h2 style={{ ...S.cardTitle, color: "#3A8E6E" }}>🏆 Main Bracket</h2>
                  <BracketTree
                    rounds={state.mainBracket} tLabel={tLabel} editable={false}
                    onScore={() => {}} onAssignCourt={() => {}} accentColor="#3A8E6E" />
                  {mainWinner && (
                    <div style={{ textAlign: "center", marginTop: 16, padding: "16px 20px", background: "#0a120a", border: "1px solid #3A8E6E30", borderRadius: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#3A8E6E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>🏆 Champion</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{tFull(mainWinner)}</div>
                    </div>
                  )}
                </div>
              )}

              {playerBracketTab === "consolation" && state.consolationBracket.length > 0 && (
                <div style={{ ...S.card, borderLeft: "3px solid #D4A843" }}>
                  <h2 style={{ ...S.cardTitle, color: "#D4A843" }}>🥈 Consolation Bracket</h2>
                  <BracketTree
                    rounds={state.consolationBracket} tLabel={tLabel} editable={false}
                    onScore={() => {}} onAssignCourt={() => {}} accentColor="#D4A843" />
                  {consolationWinner && (
                    <div style={{ textAlign: "center", marginTop: 16, padding: "16px 20px", background: "#12100a", border: "1px solid #D4A84330", borderRadius: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#D4A843", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>🥈 Consolation Champion</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{tFull(consolationWinner)}</div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={S.card}><p style={S.empty}>Bracket hasn't been generated yet. Check back after teams are seeded!</p></div>
          )}
        </>
      )}

      {/* ─── TAB: Rules ─── */}
      {playerTab === "rules" && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>📖 Tournament Rules</h2>
          <RulesContent />
        </div>
      )}

      {/* ─── TAB: Sponsors ─── */}
      {playerTab === "sponsors" && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Tournament Sponsors</h2>
          <p style={{ fontSize: 12, color: "#555", margin: "0 0 4px" }}>Thank you to our sponsors for making the Brooklyn National possible</p>
          <p style={{ fontSize: 10, color: "#D4A843", margin: "0 0 20px", fontStyle: "italic" }}>⚠️ Sample placeholders — final sponsors TBD</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {(sponsors || []).map((sp, i) => (
              <div key={i} style={{ background: "#0d0d0d", border: `1px solid ${sp.color}30`, borderRadius: 12, padding: "28px 24px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, background: `${sp.color}15`, border: `2px solid ${sp.color}30`, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                  {sp.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>{sp.name}</h3>
                <p style={{ fontSize: 12, color: sp.color, margin: 0 }}>{sp.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      </>}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════
const S = {
  app: { fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: "#0a0a0a", color: "#ddd", minHeight: "100vh", maxWidth: 960, margin: "0 auto", padding: "0 16px 60px", overflow: "hidden" },
  header: { padding: "28px 20px 20px", borderBottom: "1px solid #151515", background: "#0a0a0a", borderRadius: "0 0 12px 12px", margin: "0 -16px", width: "calc(100% + 32px)" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 },
  title: { fontSize: 30, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" },
  subtitle: { fontSize: 13, color: "#666", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 },
  meta: { fontSize: 12, color: "#aaa", margin: "3px 0 0", lineHeight: 1.4 },
  viewToggle: { display: "flex", gap: 3, background: "#111", borderRadius: 8, padding: 3 },
  viewBtnOn: { padding: "7px 14px", border: "none", background: "#1e1e1e", color: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  viewBtnOff: { padding: "7px 14px", border: "none", background: "transparent", color: "#555", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  tabBar: { display: "flex", gap: 0, borderBottom: "1px solid #151515" },
  tabOn: { padding: "13px 18px", border: "none", borderBottom: "2px solid #D4A843", background: "transparent", color: "#D4A843", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  tabOff: { padding: "13px 18px", border: "none", borderBottom: "2px solid transparent", background: "transparent", color: "#555", cursor: "pointer", fontSize: 14 },
  main: { paddingTop: 20 },
  card: { background: "#0f0f0f", border: "1px solid #181818", borderRadius: 12, padding: 24, marginBottom: 20 },
  cardTitle: { fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  badge: { fontSize: 11, fontWeight: 600, background: "#181818", color: "#666", padding: "3px 10px", borderRadius: 20 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  formGroup: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 10, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" },
  input: { padding: "10px 14px", background: "#080808", border: "1px solid #1e1e1e", borderRadius: 8, color: "#ddd", fontSize: 14, outline: "none", maxWidth: 300 },
  textarea: { width: "100%", padding: "10px 14px", background: "#080808", border: "1px solid #1e1e1e", borderRadius: 8, color: "#ddd", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" },
  hint: { fontSize: 12, color: "#3a3a3a", margin: "-8px 0 14px" },
  editBanner: { background: "#14140a", border: "1px solid #D4A84330", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#D4A843" },
  btnPri: { padding: "12px 20px", background: "#D4A843", color: "#0a0a0a", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, minHeight: 44 },
  btnSec: { padding: "12px 20px", background: "#161616", color: "#777", border: "1px solid #1e1e1e", borderRadius: 8, cursor: "pointer", fontSize: 14, minHeight: 44 },
  btnAccent: { padding: "14px 24px", background: "linear-gradient(135deg, #D4A843, #E8C76A)", color: "#0a0a0a", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, minHeight: 44 },
  btnDanger: { padding: "12px 20px", background: "#E85D3A", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, minHeight: 44 },
  btnIcon: { padding: "4px 8px", background: "transparent", color: "#555", border: "1px solid #1e1e1e", borderRadius: 6, cursor: "pointer", fontSize: 14 },
  btnSm: { padding: "4px 10px", background: "transparent", color: "#555", border: "1px solid #1e1e1e", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  btnSmPri: { padding: "6px 14px", background: "#D4A843", color: "#0a0a0a", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  btnSmallDanger: { padding: "5px 10px", background: "transparent", color: "#E85D3A", border: "1px solid #2a1515", borderRadius: 6, cursor: "pointer", fontSize: 12 },
  empty: { color: "#3a3a3a", fontSize: 14, textAlign: "center", padding: "20px 0" },
  teamList: { display: "flex", flexDirection: "column", gap: 3, marginTop: 14 },
  teamRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#0d0d0d", borderRadius: 8, border: "1px solid #1a1a1a", transition: "border-color 0.15s" },
  teamNum: { fontSize: 12, fontWeight: 700, color: "#2a2a2a", minWidth: 24, textAlign: "center" },
  teamInfo: { flex: 1, display: "flex", alignItems: "center", flexWrap: "wrap" },
  playerName: { fontSize: 14, color: "#bbb", fontWeight: 500 },
  teamActions: { display: "flex", gap: 6 },
  matchGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 },
  matchCard: { background: "#0a0a0a", border: "1px solid #161616", borderLeft: "3px solid #282828", borderRadius: 8, padding: "10px 12px" },
  matchHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  matchNum: { fontSize: 10, fontWeight: 700, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em" },
  courtTag: { fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4 },
  statusTag: { fontSize: 10, fontWeight: 700, marginLeft: "auto" },
  matchTeams: { display: "flex", flexDirection: "column", gap: 1 },
  matchTeam: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "2px 0" },
  vs: { fontSize: 9, color: "#222", textAlign: "center" },
  score: { fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  ffTag: { fontSize: 10, fontWeight: 700, color: "#E85D3A", background: "#1a0e0e", padding: "1px 6px", borderRadius: 3 },
  scoreEntryInline: { marginTop: 10, padding: 12, background: "#111", borderRadius: 8, display: "flex", flexDirection: "column", gap: 10 },
  scoreRow: { display: "flex", alignItems: "center", gap: 10 },
  scoreLabel: { flex: 1, fontSize: 13, color: "#777" },
  scoreInput: { width: 60, padding: "6px 10px", background: "#080808", border: "1px solid #1e1e1e", borderRadius: 6, color: "#fff", fontSize: 16, fontWeight: 700, textAlign: "center", outline: "none" },
  courtSelect: { padding: "6px 10px", background: "#080808", border: "1px solid #1e1e1e", borderRadius: 6, color: "#bbb", fontSize: 13, outline: "none", cursor: "pointer" },
  roundTitle: { fontSize: 13, fontWeight: 700, color: "#555", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" },
  courtGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 },
  notif: { position: "fixed", top: 16, right: 16, left: 16, padding: "12px 20px", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, zIndex: 1000, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", textAlign: "center" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  confirmBox: { background: "#141414", border: "1px solid #222", borderRadius: 12, padding: 24, maxWidth: 440, width: "90%" },
  searchBtn: { display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "transparent", border: "1px solid #1a1a1a", borderRadius: 8, color: "#bbb", cursor: "pointer", fontSize: 14 },
  playerMatch: { background: "#0a0a0a", border: "1px solid #161616", borderLeft: "3px solid #282828", borderRadius: 8, padding: "12px 14px" },
  statBox: { background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: 10, padding: "14px 20px", minWidth: 100, textAlign: "center" },
  statNum: { fontSize: 24, fontWeight: 800, color: "#D4A843", fontVariantNumeric: "tabular-nums" },
  statLabel: { fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 },
  statDetail: { fontSize: 11, color: "#444", marginTop: 4 },
};
