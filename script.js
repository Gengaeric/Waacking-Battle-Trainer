document.addEventListener("DOMContentLoaded", async () => {
  const YOUTUBE_API_KEY = "AIzaSyA6wF3-pNvpehYHxvN-6inVEGTsNTzWEic";

  // Definición de la Base de Datos con Dexie.js
  const db = new Dexie("whackingTrainerDB");
  db.version(1).stores({
    mp3Files: "++id,name", // Tabla para guardar los archivos MP3
  });

  // --- Referencias a Elementos del DOM ---
  const toastContainer = document.getElementById("toast-container");
  const addMp3Input = document.getElementById("add-mp3-input");
  const clearPlaylistBtn = document.getElementById("clear-playlist-btn");
  const playlistUl = document.getElementById("playlist-ul");
  const playerPanel = document.getElementById("player-panel");
  const instructions = document.getElementById("instructions");
  const playerControls = document.getElementById("player-controls");
  const welcomeMessageDiv = document.getElementById("welcome-message");
  const countdownDisplay = document.getElementById("countdown-display");
  const currentSongTitle = document.getElementById("current-song-title");
  const prevBtn = document.getElementById("prev-btn");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const nextBtn = document.getElementById("next-btn");
  const startSessionBtn = document.getElementById("start-session-btn");
  const endSessionBtn = document.getElementById("end-session-btn");
  const duration40Btn = document.getElementById("duration-40");
  const duration60Btn = document.getElementById("duration-60");
  const segmentSelect = document.getElementById("segment-select");
  const gapInput = document.getElementById("gap-input");
  const addYoutubeBtn = document.getElementById("add-youtube-btn");
  const savedPlaylistsSelect = document.getElementById(
    "saved-playlists-select",
  );
  const playlistNameInput = document.getElementById("playlist-name-input");
  const savePlaylistBtn = document.getElementById("save-playlist-btn");
  const deletePlaylistBtn = document.getElementById("delete-playlist-btn");
  const sfxPlayer = document.getElementById("sfx-player");
  const youtubePlayerContainer = document.getElementById(
    "youtube-player-container",
  );
  const toggleVideoBtn = document.getElementById("toggle-video-btn");
  const togglePlaylistBtn = document.getElementById("toggle-playlist-btn");
  const modalOverlay = document.getElementById("modal-overlay");
  const infoBtns = document.querySelectorAll(".info-btn");
  const closeBtns = document.querySelectorAll(".close-modal-btn");

  // --- Variables de Estado ---
  let playlist = [];
  let currentTrackIndex = 0;
  let sessionConfig = { duration: 40, segment: "principio", gap: 3 };
  let isSessionActive = false;
  let isPaused = true;
  const audio = new Audio();
  let ytPlayer;
  let ytPlayerReady = false;
  let roundTimeout,
    gapTimeout,
    fadeOutTimeout,
    fadeInterval,
    fadeInInterval,
    countdownStartTimeout,
    fadeOutCompletionTimeout;
  let countdownIntervalId = null;
  let roundEndTime = null;
  let timeRemainingOnPause = null;
  let hasShownYoutubeWarning = false;
  let wakeLock = null;
  // PASO I
  // --- NUEVAS VARIABLES PARA SPOTIFY ---
  let spotifyPlayer = null;
  let spotifyDeviceId = null;
  // (Asegúrate de NO tener 'spotifyPlayer' o 'spotifyDeviceId' declarados en otro lugar)
  // --- FIN VARIABLES SPOTIFY ---
  // --- Lógica de Ventanas Modales ---
  infoBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.dataset.modal;
      const modal = document.getElementById(modalId);
      modalOverlay.classList.remove("hidden");
      modal.classList.remove("hidden");
    });
  });
  const closeModal = () => {
    modalOverlay.classList.add("hidden");
    document
      .querySelectorAll(".modal")
      .forEach((m) => m.classList.add("hidden"));
  };
  closeBtns.forEach((btn) => btn.addEventListener("click", closeModal));
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  }); // PASO II
  // ================================================
  // --- LÓGICA SPOTIFY (Auth, Setup, Status, etc.) ---
  // ================================================

  // --- CLAVES SPOTIFY (¡RECUERDA REEMPLAZAR!) ---
  // ⬇️ ⚠️ ¡ATENCIÓN! Pega tu Client ID real AQUÍ, DENTRO de las comillas simples.
  const SPOTIFY_CLIENT_ID = "9ae8db719a0a445fb8822143801ae24c";
  const SPOTIFY_REDIRECT_URI = "https://whackingbattletrainer.netlify.app"; // Verifica esta URL

  // --- PKCE Helpers (Necesarios para Spotify Auth) ---
  function generateRandomString(length) {
    let t = "";
    const p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++)
      t += p.charAt(Math.floor(Math.random() * p.length));
    return t;
  }
  async function sha256(plain) {
    const enc = new TextEncoder();
    const data = enc.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
  }
  function base64encode(input) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  // --- Funciones de Autenticación y Tokens ---
  async function getSpotifyTokenPKCE(code, codeVerifier) {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: "authorization_code",
          code,
          redirect_uri: SPOTIFY_REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          `Error ${response.status}: ${errData.error_description || response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      console.error("[Spotify Auth] Error getSpotifyTokenPKCE:", error);
      showToast(`Error al obtener token: ${error.message}`, "error");
      return null;
    }
  }

  function storeTokens(tokenData) {
    try {
      localStorage.setItem("spotify_access_token", tokenData.access_token);
      if (tokenData.refresh_token)
        localStorage.setItem("spotify_refresh_token", tokenData.refresh_token);
      const expiresAt = Date.now() + tokenData.expires_in * 1000;
      localStorage.setItem("spotify_token_expires_at", expiresAt.toString()); // Guardar como string
      console.log("[Spotify Auth] Tokens guardados.");
    } catch (e) {
      console.error("[Spotify Auth] Error guardando tokens:", e);
      showToast("Error al guardar sesión Spotify.", "error");
    }
  }

  async function refreshTokenPKCE() {
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    if (!refreshToken) {
      console.log("[Spotify Auth] No hay refresh token.");
      clearSpotifyTokens();
      return false;
    }
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 400 && errData.error === "invalid_grant") {
          console.error("[Spotify Auth] Refresh token inválido.");
          clearSpotifyTokens();
        } // Limpiar si el refresh token es malo
        else {
          throw new Error(
            `Error ${response.status}: ${errData.error_description || response.statusText}`,
          );
        }
        return false;
      }
      const data = await response.json();
      storeTokens({
        ...data,
        refresh_token: data.refresh_token || refreshToken,
      }); // Reusar refresh token si no viene uno nuevo
      console.log("[Spotify Auth] Token refrescado.");
      return true;
    } catch (error) {
      console.error("[Spotify Auth] Error refreshTokenPKCE:", error);
      showToast(`Error renovando conexión Spotify: ${error.message}`, "error");
      clearSpotifyTokens();
      return false;
    }
  }

  function clearSpotifyTokens() {
    try {
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_refresh_token");
      localStorage.removeItem("spotify_token_expires_at");
      localStorage.removeItem("spotify_pkce_code_verifier"); // Limpiar verifier de PKCE
      localStorage.removeItem("spotify_auth_state"); // Limpiar state de Auth
      console.log("[Spotify Auth] Tokens eliminados.");
    } catch (e) {
      console.error("[Spotify Auth] Error clearSpotifyTokens:", e);
    }
  }

  // --- Funciones de UI de Conexión Spotify ---
  // (Necesitarás añadir elementos HTML para esto: connectSpotifyBtn, disconnectSpotifyBtn, spotifyStatusDiv, spotifyUserSpan)
  const connectSpotifyBtn = document.getElementById("connect-spotify-btn"); // Asegúrate que exista en tu HTML
  const disconnectSpotifyBtn = document.getElementById(
    "disconnect-spotify-btn",
  ); // Asegúrate que exista en tu HTML
  const spotifyStatusDiv = document.getElementById("spotify-status"); // Asegúrate que exista en tu HTML
  const spotifyUserSpan = document.getElementById("spotify-user"); // Asegúrate que exista en tu HTML

  function showConnected(userName) {
    try {
      if (connectSpotifyBtn) connectSpotifyBtn.style.display = "none";
      if (spotifyStatusDiv) spotifyStatusDiv.style.display = "block";
      if (spotifyUserSpan) spotifyUserSpan.textContent = userName;
      console.log("[Spotify UI] Conectado como", userName);
    } catch (e) {
      console.error("[Spotify UI] Error showConnected:", e);
    }
  }

  function showDisconnected() {
    try {
      if (spotifyPlayer) {
        console.log("[Spotify Player] Desconectando Spotify Player...");
        spotifyPlayer.disconnect();
        spotifyPlayer = null;
        spotifyDeviceId = null;
      }
      if (connectSpotifyBtn) connectSpotifyBtn.style.display = "block";
      if (spotifyStatusDiv) spotifyStatusDiv.style.display = "none";
      if (spotifyUserSpan) spotifyUserSpan.textContent = "";
      console.log("[Spotify UI] Desconectado.");
    } catch (e) {
      console.error("[Spotify UI] Err showDisconnected:", e);
    }
  }

  // --- Configuración del Reproductor Web SDK ---
  window.onSpotifyWebPlaybackSDKReady = () => {
    console.log("[Spotify Player] SDK listo.");
    window.spotifySdkReady = true;
    document.dispatchEvent(new Event("spotifySdkReady")); // Notificar que el SDK está listo
  };

  function setupSpotifyPlayer(accessToken) {
    if (spotifyPlayer) {
      console.log("[Spotify Player] setupSpotifyPlayer: Ya existe.");
      return;
    }
    if (!window.Spotify || !window.spotifySdkReady) {
      console.error("[Spotify Player] SDK no listo para setup.");
      showToast("Error carga Spotify Player.", "error");
      return;
    }
    try {
      if (typeof window.Spotify === "undefined" || !window.Spotify.Player) {
        console.error(
          "[Spotify Player] Error CRÍTICO: window.Spotify o window.Spotify.Player no están definidos al intentar crear Player.",
        );
        showToast("Error fatal SDK Spotify.", "error");
        throw new Error("Spotify SDK no completamente cargado."); // Lanzar error para que lo capture el catch
      }
      console.log("[Spotify Player] Creando Spotify.Player...");
      spotifyPlayer = new Spotify.Player({
        name: "Whacking Battle Trainer",
        getOAuthToken: (cb) => {
          const cT = localStorage.getItem("spotify_access_token");
          const eA = localStorage.getItem("spotify_token_expires_at");
          if (cT && eA && Date.now() < parseInt(eA || "0", 10)) {
            cb(cT);
          } else {
            refreshTokenPKCE().then((refreshed) => {
              cb(
                refreshed ? localStorage.getItem("spotify_access_token") : null,
              );
            });
          }
        },
        volume: 0.5,
      });
      // --- Listener 'ready' para capturar device_id ---
      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log('[Spotify Player] Evento "ready" recibido.');

        // 1. Verificar si device_id realmente llegó
        if (device_id) {
          console.log("[Spotify Player] Device ID recibido:", device_id);
          spotifyDeviceId = device_id; // Guardar globalmente
          document.dispatchEvent(new Event("spotifyDeviceReady"));

          // 2. Programar la transferencia inicial con un pequeño retraso
          console.log(
            `[Spotify Player] Programando transferencia inicial para ${spotifyDeviceId}...`,
          );
          setTimeout(async () => {
            const currentToken = localStorage.getItem("spotify_access_token");
            // Usar la variable global spotifyDeviceId que ya guardamos
            if (currentToken && spotifyDeviceId) {
              console.log(
                `[Spotify Player] Ejecutando transferencia AHORA para ${spotifyDeviceId}`,
              );
              await transferPlayback(spotifyDeviceId);
            } else {
              console.error(
                "[Spotify Player] No se pudo transferir al inicio (Falta token o spotifyDeviceId).",
                { hasToken: !!currentToken, hasId: !!spotifyDeviceId },
              );
            }
          }, 150); // Aumentamos ligeramente el retraso a 150ms por si acaso
        } else {
          // Si el evento 'ready' no trajo un device_id (muy raro, pero posible error del SDK?)
          console.error(
            '[Spotify Player] ¡ERROR CRÍTICO! Evento "ready" recibido SIN device_id.',
          );
          spotifyDeviceId = null; // Asegurar que no quede un ID viejo
          showToast(
            "Error grave al iniciar reproductor Spotify (No ID).",
            "error",
          );
          document.dispatchEvent(new Event("spotifyDeviceError"));
          // Considerar desconectar aquí si esto ocurre?
          // clearSpotifyTokens();
          // showDisconnected();
        }
      });

      // --- FIN Listener 'ready' ---
      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.warn("[Spotify Player] Device no listo:", device_id);
        showToast("Error Player: ¿Spotify Premium activo?", "error");
        spotifyDeviceId = null;
      });
      // Listeners de error
      spotifyPlayer.addListener("initialization_error", ({ message }) => {
        console.error("[Spotify Player] Error SDK init:", message);
        showToast(`Error init Spotify: ${message}`, "error");
      });
      spotifyPlayer.addListener("authentication_error", ({ message }) => {
        console.error("[Spotify Player] Error SDK auth:", message);
        showToast("Error auth Spotify. Reconectar.", "error");
        clearSpotifyTokens();
        showDisconnected();
      });
      spotifyPlayer.addListener("account_error", ({ message }) => {
        console.error("[Spotify Player] Error SDK cuenta:", message);
        showToast(`Error cuenta Spotify: ${message}`, "error");
      });
      spotifyPlayer.addListener("playback_error", ({ message }) => {
        console.error("[Spotify Player] Error SDK playback:", message);
        showToast(`Error playback Spotify: ${message}. Saltando...`, "error");
        clearAllTimers();
        setTimeout(() => {
          if (isSessionActive) playTrack(++currentTrackIndex);
        }, 500);
      });
      // Listener de cambio de estado
      spotifyPlayer.addListener("player_state_changed", (state) => {
        if (!state) {
          console.warn("[Spotify Player] State changed: null state.");
          return;
        }
        isPaused = state.paused;
        if (playPauseBtn) playPauseBtn.textContent = state.paused ? "▶️" : "❚❚";
      });
      // Conectar
      spotifyPlayer.connect().then((success) => {
        console.log(
          "[Spotify Player] Conexión SDK inicial:",
          success ? "Éxito" : "Fallo",
        );
        if (!success) {
          showToast("Fallo al conectar reproductor Spotify.", "error");
        }
      });
    } catch (e) {
      console.error(
        "[Spotify Player] Error creando o conectando Spotify Player:",
        e,
      );
      showToast("Error crítico al crear Player Spotify.", "error");
    }
  }

  function initializeSpotifyPlayer(accessToken) {
    const tokenToUse =
      accessToken || localStorage.getItem("spotify_access_token");
    if (!tokenToUse) {
      console.warn(
        "[Spotify Player] initializeSpotifyPlayer: No hay token disponible.",
      );
      return;
    }
    if (spotifyPlayer && spotifyDeviceId) {
      console.log(
        "[Spotify Player] initializeSpotifyPlayer: Player ya inicializado.",
      );
      return;
    }
    const startSetup = () => {
      console.log(
        "[Spotify Player] initializeSpotifyPlayer: Ejecutando setupSpotifyPlayer.",
      );
      setupSpotifyPlayer(tokenToUse);
    };
    if (window.spotifySdkReady) {
      startSetup();
    } else {
      console.log(
        "[Spotify Player] initializeSpotifyPlayer: Esperando a spotifySdkReady.",
      );
      document.addEventListener("spotifySdkReady", startSetup, { once: true });
    }
  }

  async function waitForSpotifyDevice(timeoutMs = 5000) {
    if (spotifyDeviceId) return spotifyDeviceId;
    return new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          document.removeEventListener("spotifyDeviceReady", onReady);
          resolve(null);
        }
      }, timeoutMs);
      const onReady = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          document.removeEventListener("spotifyDeviceReady", onReady);
          resolve(spotifyDeviceId);
        }
      };
      document.addEventListener("spotifyDeviceReady", onReady, { once: true });
    });
  }

  // --- Actualizar Estado y Llamar Setup Player ---
  async function updateSpotifyStatus() {
    console.log("[Spotify Status] Actualizando estado...");
    let aT = localStorage.getItem("spotify_access_token");
    const eA = localStorage.getItem("spotify_token_expires_at");
    if (!aT || !eA || Date.now() > parseInt(eA || "0", 10)) {
      console.log("[Spotify Status] Token ausente/expirado, refrescando...");
      const refreshed = await refreshTokenPKCE();
      if (refreshed) {
        aT = localStorage.getItem("spotify_access_token");
      } else {
        showDisconnected();
        return;
      }
    }
    if (!aT) {
      console.error("[Spotify Status] No hay token válido.");
      showDisconnected();
      return;
    }

    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${aT}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.warn("[Spotify Status] Token inválido (401). Limpiando...");
          clearSpotifyTokens();
          showDisconnected();
          return;
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }
      const userData = await response.json();
      console.log("[Spotify Status] Usuario Spotify:", userData.display_name);
      showConnected(userData.display_name || userData.id);

      // --- LLAMAR A SETUP PLAYER DE FORMA SEGURA (CON RETRASO) ---
      const callSetupPlayer = (token) => {
        console.log("[Spotify Status] Llamando a setupSpotifyPlayer AHORA.");
        if (token) {
          setupSpotifyPlayer(token);
        } else {
          console.error(
            "[Spotify Status] No hay token válido para setupPlayer.",
          );
          showDisconnected();
        }
      };

      // Volver a obtener el token MÁS ACTUAL justo antes de programar la llamada
      const currentTokenForSetup = localStorage.getItem("spotify_access_token");

      if (window.spotifySdkReady) {
        console.log(
          "[Spotify Status] SDK ya listo. Programando setupPlayer con pequeño retraso (100ms)...",
        );
        setTimeout(() => callSetupPlayer(currentTokenForSetup), 100); // <- Pequeño retraso
      } else {
        console.log(
          "[Spotify Status] SDK no listo, esperando evento 'spotifySdkReady'...",
        );
        const sdkReadyListener = () => {
          console.log(
            "[Spotify Status] Evento 'spotifySdkReady' recibido. Programando setupPlayer con pequeño retraso (100ms)...",
          );
          // Volver a obtener token por si refrescó MIENTRAS esperaba el evento
          const tokenAfterEvent = localStorage.getItem("spotify_access_token");
          setTimeout(() => callSetupPlayer(tokenAfterEvent), 100); // <- Pequeño retraso también aquí
        };
        document.addEventListener("spotifySdkReady", sdkReadyListener, {
          once: true,
        });
      }
      // --- FIN LLAMADA SETUP ---
    } catch (error) {
      console.error("[Spotify Status] Error updateSpotifyStatus:", error);
      showToast("Error verificando conexión Spotify.", "error");
      clearSpotifyTokens();
      showDisconnected();
    }
  }

  // --- Redirección a Spotify para Autorizar ---
  async function redirectToSpotifyAuthorize() {
    console.log("[Spotify Auth] redirectToSpotifyAuthorize INICIADO.");
    try {
      if (
        !SPOTIFY_CLIENT_ID ||
        SPOTIFY_CLIENT_ID === "PÉGALE_AQUÍ_TU_CLIENT_ID_DE_SPOTIFY"
      ) {
        // Usar el placeholder
        showToast("Error: Client ID de Spotify no configurado.", "error");
        console.error("[Spotify Auth] Client ID vacío.");
        return;
      }
      const codeVerifier = generateRandomString(64);
      localStorage.setItem("spotify_pkce_code_verifier", codeVerifier);
      const hashed = await sha256(codeVerifier);
      const codeChallenge = base64encode(hashed);
      const state = generateRandomString(16);
      localStorage.setItem("spotify_auth_state", state);
      const scope =
        "user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state playlist-read-private";
      const args = new URLSearchParams({
        response_type: "code",
        client_id: SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        state: state,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
      });
      const targetUrl = "https://accounts.spotify.com/authorize?" + args;
      console.log("[Spotify Auth] Redirigiendo AHORA a:", targetUrl);
      window.location.assign(targetUrl); // Usar assign para historial
    } catch (e) {
      console.error(
        "[Spotify Auth] Error DENTRO de redirectToSpotifyAuthorize:",
        e,
      );
      showToast("Error al intentar conectar con Spotify.", "error");
    }
  }

  // --- Manejo del Callback de Spotify ---
  const handleSpotifyCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const storedState = localStorage.getItem("spotify_auth_state");
    console.log("[Spotify Auth] Verificando callback...");
    if (code && state && state === storedState) {
      // Es un callback válido
      console.log("[Spotify Auth] Callback detectado...");
      localStorage.removeItem("spotify_auth_state"); // Limpiar state usado
      const codeVerifier = localStorage.getItem("spotify_pkce_code_verifier");
      if (codeVerifier) {
        showToast("Verificando conexión Spotify...", "info");
        const tokenData = await getSpotifyTokenPKCE(code, codeVerifier);
        if (tokenData) {
          storeTokens(tokenData);
          localStorage.removeItem("spotify_pkce_code_verifier"); // Limpiar verifier usado
          // Limpiar URL y actualizar estado
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
          await updateSpotifyStatus(); // Actualizar UI y setup player
        } else {
          showToast("Error al obtener token de Spotify.", "error");
          showDisconnected();
        }
      } else {
        console.error("[Spotify Auth] Falta code_verifier post-callback.");
        showToast("Error de seguridad (PKCE).", "error");
        showDisconnected();
      }
    } else if (params.has("error")) {
      // Spotify devolvió un error
      console.error(`[Spotify Auth] Error en callback: ${params.get("error")}`);
      showToast(`Error de Spotify: ${params.get("error")}`, "error");
      window.history.replaceState({}, document.title, window.location.pathname); // Limpiar URL
      showDisconnected();
    } else {
      console.log("[Spotify Auth] No es un callback.");
    }
  };

  // --- Carga de Playlist Spotify ---
  function extractSpotifyPlaylistID(url) {
    const regex = /spotify\.com\/playlist\/([a-zA-Z0-9]+)(\?|$)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async function loadSpotifyPlaylist(playlistId) {
    console.log(`[Spotify Load] Intentando cargar playlist ID: ${playlistId}`);
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      showToast("Necesitas conectar Spotify.", "error");
      return;
    }
    let allTracks = [];
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=items(track(id,name,artists(name))),next`;
    showToast(`Cargando playlist Spotify...`, "info");
    try {
      while (nextUrl) {
        console.log("[Spotify Load] Fetching:", nextUrl);
        let response;
        try {
          response = await fetch(nextUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (response.status === 401) {
            console.warn("[Spotify Load] Token expirado, refrescando...");
            const refreshed = await refreshTokenPKCE();
            if (refreshed) {
              const newAccessToken = localStorage.getItem(
                "spotify_access_token",
              );
              console.log("[Spotify Load] Reintentando fetch post-refresco...");
              response = await fetch(nextUrl, {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });
            } else {
              throw new Error("Token expirado, no se pudo refrescar.");
            }
          }
          if (!response.ok) {
            console.warn(`[Spotify Load] Fetch fallido: ${response.status}`);
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 404) {
              throw new Error("Playlist no encontrada (404).");
            }
            throw new Error(
              `Error ${response.status}: ${errorData?.error?.message || response.statusText}`,
            );
          }
          const data = await response.json();
          const tracks = data.items || [];
          tracks.forEach((item) => {
            if (item.track?.id) {
              allTracks.push({
                name: `${item.track.name} - ${item.track.artists.map((a) => a.name).join(", ")}`,
                id: item.track.id,
                type: "spotify",
              });
            }
          });
          nextUrl = data.next;
          console.log(
            `[Spotify Load] ${allTracks.length} tracks. Siguiente: ${nextUrl ? "Sí" : "No"}`,
          );
        } catch (fetchError) {
          console.error("[Spotify Load] Error durante fetch:", fetchError);
          throw fetchError;
        }
      } // Fin while
      if (allTracks.length > 0) {
        await prepareForNewPlaylist();
        playlist = allTracks;
        updatePlaylistUI();
        showToast(`Playlist Spotify cargada (${allTracks.length}).`, "success");
      } else {
        showToast("No se encontraron canciones.", "info");
      }
    } catch (error) {
      console.error("[Spotify Load] Error final:", error);
      showToast(`Error cargar playlist: ${error.message}`, "error");
      if (error.message.includes("Token expirado")) {
        clearSpotifyTokens();
        showDisconnected();
      }
    }
  }

  // --- Transferir Playback ---
  async function transferPlayback(deviceId) {
    console.log(`[Spotify Play] Transfiriendo a device ID: ${deviceId}`);
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken || !deviceId) {
      console.error("[Spotify Play] transferPlayback: Falta token o deviceId.");
      showToast("Error interno Spotify.", "error");
      return false;
    }
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        body: JSON.stringify({ device_ids: [deviceId], play: false }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: { message: response.statusText } }));
        console.error(
          `[Spotify Play] Error transfer (${response.status}):`,
          errData,
        );
        if (response.status === 401) {
          const r = await refreshTokenPKCE();
          throw new Error(
            r ? "Token refrescado, reintenta." : "Token expirado.",
          );
        }
        if (response.status === 403) {
          throw new Error("Acción no permitida (¿Premium?).");
        }
        if (response.status === 404) {
          throw new Error("Dispositivo no encontrado.");
        }
        throw new Error(
          `Error ${response.status}: ${errData?.error?.message || "al transferir."}`,
        );
      } else {
        console.log("[Spotify Play] Transferencia exitosa.");
        return true;
      }
    } catch (error) {
      console.error("[Spotify Play] Error catch transfer:", error);
      showToast(`${error.message || "Error activar reproductor."}`, "error");
      if (error.message.includes("Token expirado")) {
        clearSpotifyTokens();
        showDisconnected();
      }
      return false;
    }
  }

  // --- Obtener Duración Track ---
  async function getSpotifyTrackDuration(trackId) {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken || !trackId) {
      console.warn("[Spotify Play] getDuration: Falta token/trackId.");
      return null;
    }
    console.log(`[Spotify Play] Obteniendo duración: ${trackId}`);
    try {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }); // GET /tracks/{id}
      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshTokenPKCE();
          if (refreshed) {
            const newToken = localStorage.getItem("spotify_access_token");
            const retry = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
              headers: { Authorization: `Bearer ${newToken}` },
            });
            if (retry.ok) {
              const retryData = await retry.json();
              console.log(
                `[Spotify Play] Duración (retry): ${retryData?.duration_ms}ms`,
              );
              return retryData?.duration_ms;
            }
          } else {
            clearSpotifyTokens();
            showDisconnected();
            return null;
          }
        }
        const eD = await response.json().catch(() => ({}));
        throw new Error(
          `Err ${response.status}: ${eD?.error?.message || response.statusText}`,
        );
      }
      const trackData = await response.json();
      console.log(`[Spotify Play] Duración: ${trackData?.duration_ms}ms`);
      return trackData?.duration_ms;
    } catch (error) {
      console.error("[Spotify Play] Error getDuration:", error);
      return null;
    }
  }

  // ================================================
  // --- Lógica Central de la App (Modificada) ---
  // ================================================
  // --- Lógica Central de la App ---
  window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player("youtube-player", {
      height: "100%",
      width: "100%",
      playerVars: { autoplay: 0, controls: 1, rel: 0, fs: 0 },
      events: { onError: onPlayerError, onReady: onPlayerReady },
    });
  };
  function onPlayerReady(event) {
    ytPlayerReady = true;
  }
  function onPlayerError(event) {
    const songName = playlist[currentTrackIndex]?.name || "un video";
    showToast(`"${songName}" no se puede reproducir. Saltando...`, "error");
    setTimeout(() => playTrack(++currentTrackIndex), 500);
  }
  function showToast(message, type = "error") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }
  const clearAllTimers = () => {
    clearTimeout(roundTimeout);
    clearTimeout(gapTimeout);
    clearTimeout(countdownStartTimeout);
    clearTimeout(fadeOutCompletionTimeout);
    clearInterval(fadeOutTimeout);
    clearInterval(countdownIntervalId);
    clearInterval(fadeInterval);
    clearInterval(fadeInInterval);
    roundTimeout = null;
    gapTimeout = null;
    countdownStartTimeout = null;
    fadeOutCompletionTimeout = null;
    fadeOutTimeout = null;
    countdownIntervalId = null;
    fadeInterval = null;
    fadeInInterval = null;
  };
  async function prepareForNewPlaylist() {
    if (isSessionActive) await endSession();
    playlist = [];
    updatePlaylistUI();
  }

  addMp3Input.addEventListener("change", async (e) => {
    await prepareForNewPlaylist();
    showToast("Guardando MP3s en la base de datos...", "info");
    try {
      for (const file of e.target.files) {
        // Usamos el nombre del archivo como identificador único en la DB
        const existingFile = await db.mp3Files
          .where("name")
          .equals(file.name)
          .first();
        if (!existingFile) {
          const id = await db.mp3Files.add({ name: file.name, file: file });
          playlist.push({
            name: file.name.replace(".mp3", ""),
            type: "mp3",
            dbKey: id,
          });
        } else {
          // Si ya existe, simplemente lo añadimos a la playlist actual con su ID de la DB
          playlist.push({
            name: file.name.replace(".mp3", ""),
            type: "mp3",
            dbKey: existingFile.id,
          });
        }
      }
      updatePlaylistUI();
      showToast("MP3s listos para usar.", "success");
    } catch (error) {
      console.error("Error al guardar MP3 en IndexedDB:", error);
      showToast("Error al guardar los archivos MP3.", "error");
    }
  });

  addYoutubeBtn.addEventListener("click", async () => {
    const url = prompt(
      "Pega aquí el link del video o de la playlist de YouTube:",
    );
    if (!url) return;
    await prepareForNewPlaylist();
    showToast("Cargando playlist...", "info");
    if (YOUTUBE_API_KEY === "AQUI_VA_TU_CLAVE_DE_API" || !YOUTUBE_API_KEY) {
      showToast("Error: Falta la clave de API.", "error");
      return;
    }
    try {
      const videoId = extractVideoID(url);
      const playlistId = extractPlaylistID(url);
      if (playlistId) {
        let allItems = [];
        let nextPageToken = "";
        do {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}&pageToken=${nextPageToken}`,
          );
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          allItems = allItems.concat(data.items);
          nextPageToken = data.nextPageToken;
        } while (nextPageToken);
        allItems.forEach((item) => {
          if (
            item.snippet.resourceId.videoId &&
            item.snippet.title !== "Private video" &&
            item.snippet.title !== "Deleted video"
          ) {
            playlist.push({
              name: item.snippet.title,
              id: item.snippet.resourceId.videoId,
              type: "youtube",
            });
          }
        });
      } else if (videoId) {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`,
        );
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        playlist.push({
          name: data.items[0].snippet.title,
          id: videoId,
          type: "youtube",
        });
      } else {
        showToast("URL de YouTube no válida.", "error");
      }
      updatePlaylistUI();
      if (playlist.length > 0)
        showToast("Playlist cargada con éxito.", "success");
    } catch (error) {
      console.error(error);
      showToast("Error al cargar desde YouTube.", "error");
    }
  });
  function extractVideoID(url) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }
  function extractPlaylistID(url) {
    const regExp = /[&?]list=([^&]+)/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }
  clearPlaylistBtn.addEventListener("click", () => {
    if (confirm("¿Seguro?")) {
      playlist = [];
      updatePlaylistUI();
    }
  });
  function updatePlaylistUI() {
    playlistUl.innerHTML = "";
    playlist.forEach((song, index) => {
      const li = document.createElement("li");
      li.dataset.index = index;
      li.draggable = true;
      const typeSpan = document.createElement("span");
      typeSpan.className = `track-type ${song.type}`;
      typeSpan.textContent = song.type.toUpperCase();
      const nameSpan = document.createElement("span");
      nameSpan.textContent = song.name;
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "✖";
      deleteBtn.className = "delete-btn";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        playlist.splice(index, 1);
        updatePlaylistUI();
      };
      li.appendChild(typeSpan);
      li.appendChild(nameSpan);
      li.appendChild(deleteBtn);
      playlistUl.appendChild(li);
    });
    const buttonText = playlistUl.classList.contains("visible")
      ? "Ocultar Lista"
      : "Mostrar Lista";
    togglePlaylistBtn.textContent = `${buttonText} (${playlist.length})`;
  }
  function savePlaylist() {
    const name = playlistNameInput.value.trim();
    if (!name) {
      showToast("Ponle un nombre a tu playlist.");
      return;
    }
    if (playlist.length === 0) {
      showToast("La playlist está vacía.");
      return;
    }
    localStorage.setItem(`playlist_${name}`, JSON.stringify(playlist));
    playlistNameInput.value = "";
    showToast(`Playlist "${name}" guardada.`, "success");
    loadSavedPlaylists();
  }
  function loadSavedPlaylists() {
    savedPlaylistsSelect.innerHTML =
      '<option value="">Cargar una playlist...</option>';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("playlist_")) {
        const playlistName = key.replace("playlist_", "");
        const option = document.createElement("option");
        option.value = key;
        option.textContent = playlistName;
        savedPlaylistsSelect.appendChild(option);
      }
    }
  }
  async function loadSelectedPlaylist() {
    const key = savedPlaylistsSelect.value;
    if (!key) return;
    await prepareForNewPlaylist();
    const savedPlaylist = JSON.parse(localStorage.getItem(key));
    if (savedPlaylist) {
      playlist = savedPlaylist;
      updatePlaylistUI();
    }
  }
  function deleteSelectedPlaylist() {
    const key = savedPlaylistsSelect.value;
    if (!key) {
      showToast("Selecciona una playlist para borrar.");
      return;
    }
    const playlistName = key.replace("playlist_", "");
    if (confirm(`¿Seguro que quieres borrar la playlist "${playlistName}"?`)) {
      localStorage.removeItem(key);
      playlist = [];
      updatePlaylistUI();
      loadSavedPlaylists();
      if (isSessionActive) {
        endSession();
        showToast("La sesión se finalizó.");
      }
    }
  }
  savePlaylistBtn.addEventListener("click", savePlaylist);
  savedPlaylistsSelect.addEventListener("change", loadSelectedPlaylist);
  deletePlaylistBtn.addEventListener("click", deleteSelectedPlaylist);
  togglePlaylistBtn.addEventListener("click", () => {
    playlistUl.classList.toggle("visible");
    const buttonText = playlistUl.classList.contains("visible")
      ? "Ocultar Lista"
      : "Mostrar Lista";
    togglePlaylistBtn.textContent = `${buttonText} (${playlist.length})`;
  });

  function initializeApp() {
    endSessionBtn.style.display = "none";
    loadSavedPlaylists();
  }

  const requestWakeLock = async () => {
    if ("wakeLock" in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
        showToast("Pantalla activa durante la sesión.", "info");
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    } else {
      console.log("Wake Lock no es soportado.");
    }
  };

  startSessionBtn.addEventListener("click", () => {
    if (playlist.length === 0) {
      showToast("¡Añade canciones!");
      return;
    }
    if (playlist.some((s) => s.type === "youtube") && !hasShownYoutubeWarning) {
      showToast("Aviso: Videos de YouTube podrían ser omitidos.", "info");
      hasShownYoutubeWarning = true;
    }
    requestWakeLock();
    isSessionActive = true;
    isPaused = false;
    currentTrackIndex = 0;
    playerPanel.classList.add("session-active");
    endSessionBtn.style.display = "block";
    playTrack(currentTrackIndex);
  });
  //PASO III
  async function playTrack(index) {
    console.log(`[App Logic] playTrack(${index})`);
    clearAllTimers(); // Limpiar timers anteriores

    // Pausar reproductores activos ANTES de empezar el nuevo
    if (audio.duration > 0 && !audio.paused) {
      try {
        audio.pause();
      } catch (e) {}
    }
    if (
      ytPlayerReady &&
      ytPlayer.getPlayerState &&
      ytPlayer.getPlayerState() === YT.PlayerState.PLAYING
    ) {
      try {
        ytPlayer.pauseVideo();
      } catch (e) {}
    }
    if (spotifyPlayer) {
      try {
        await spotifyPlayer.pause();
        console.log("[Spotify Play] Pausado vía playTrack.");
      } catch (e) {}
    }

    // Verificar fin de sesión
    if (index >= playlist.length || !isSessionActive) {
      console.log("[App Logic] Fin de playlist o sesión inactiva.");
      await endSession();
      return;
    }

    currentTrackIndex = index;
    const song = playlist[index];
    console.log(
      `[App Logic] Reproduciendo [${index}]: ${song.name} (${song.type})`,
    );
    if (currentSongTitle) currentSongTitle.textContent = song.name;

    // Actualizar UI
    if (toggleVideoBtn)
      toggleVideoBtn.style.display =
        song.type === "youtube" ? "inline-block" : "none"; // Mostrar/ocultar botón video
    if (currentSongTitle) currentSongTitle.style.display = "block";
    if (countdownDisplay) countdownDisplay.style.display = "none";
    if (countdownDisplay) countdownDisplay.classList.remove("final-seconds");
    if (instructions) instructions.style.display = "none"; // Ocultar instrucciones si estaban visibles
    if (welcomeMessageDiv && welcomeMessageDiv.style.display !== "none")
      welcomeMessageDiv.style.display = "none"; // Ocultar bienvenida si estaba visible
    if (playerControls) playerControls.style.display = "flex"; // Mostrar controles

    // Reproducir según tipo
    try {
      if (song.type === "mp3") {
        if (youtubePlayerContainer)
          youtubePlayerContainer.classList.remove("visible"); // Ocultar video YT
        await playMp3FromDB(song);
      } else if (song.type === "youtube") {
        if (ytPlayerReady) playYoutube(song);
        else {
          showToast("Reproductor YT no listo. Reintentando...", "info");
          setTimeout(() => playTrack(index), 1000);
        } // Reintentar si YT no está listo
      } else if (song.type === "spotify") {
        // <--- AÑADIR ESTE CASO
        if (youtubePlayerContainer)
          youtubePlayerContainer.classList.remove("visible"); // Ocultar video YT
        console.log("[App Logic] Llamando a playSpotifyTrack...");
        await playSpotifyTrack(song); // <-- Llamar a la función de Spotify
      } else {
        console.warn(`[App Logic] Tipo desconocido (${song.type}), saltando.`);
        showToast(`Tipo de archivo no soportado: ${song.name}`, "warning");
        setTimeout(() => {
          if (isSessionActive) playTrack(++currentTrackIndex);
        }, 500); // Saltar
      }
    } catch (error) {
      console.error(`[App Logic] Error GRANDE iniciando ${song.name}:`, error);
      showToast(`Error iniciando ${song.name}. Saltando...`, "error");
      clearAllTimers();
      setTimeout(() => {
        if (isSessionActive) playTrack(++currentTrackIndex);
      }, 500); // Saltar en caso de error grave
    }
  }
  async function playMp3FromDB(song) {
    try {
      const record = await db.mp3Files.get(song.dbKey);
      if (!record) {
        showToast(
          `Error: MP3 "${song.name}" no encontrado en la DB. Saltando...`,
          "error",
        );
        setTimeout(() => playTrack(++currentTrackIndex), 500);
        return;
      }
      const fileURL = URL.createObjectURL(record.file);
      audio.src = fileURL;
      audio.onloadedmetadata = () => {
        const startTime = calculateStartTime(audio.duration);
        audio.currentTime = startTime;
        fadeIn(audio);
        audio.play().catch((error) => {
          console.error(error);
          endSession();
        });
        playPauseBtn.textContent = "❚❚";
        isPaused = false;
        startRoundTimers(sessionConfig.duration);
        audio.onend = () => URL.revokeObjectURL(fileURL); // Limpiar memoria
      };
    } catch (error) {
      console.error("Error al reproducir MP3 desde DB:", error);
      showToast("Error al reproducir el MP3.", "error");
    }
  }
  async function playSpotifyTrack(song) {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      showToast("Error: Reproductor Spotify no conectado/listo.", "error");
      console.error("[Spotify Play] playSpotifyTrack: Falta token.");
      setTimeout(() => {
        if (isSessionActive) playTrack(++currentTrackIndex);
      }, 1500);
      return;
    }

    if (!spotifyDeviceId) {
      console.warn(
        "[Spotify Play] Device ID no disponible. Esperando ready del SDK...",
      );
      initializeSpotifyPlayer(accessToken);
      const readyDeviceId = await waitForSpotifyDevice();
      if (!readyDeviceId) {
        showToast("Spotify no terminó de iniciar. Reintenta.", "error");
        setTimeout(() => {
          if (isSessionActive) playTrack(++currentTrackIndex);
        }, 1500);
        return;
      }
    }

    const deviceId = spotifyDeviceId || null;
    if (!deviceId) {
      showToast("Spotify no reportó un dispositivo activo.", "error");
      setTimeout(() => {
        if (isSessionActive) playTrack(++currentTrackIndex);
      }, 1500);
      return;
    }
    console.log(
      `[Spotify Play] Intentando play API: ${song.id} en ${deviceId}`,
    );

    try {
      console.log("[Spotify Play] Transfiriendo playback (pre-play)...");
      const transferred = await transferPlayback(deviceId);
      if (!transferred) {
        setTimeout(() => {
          if (isSessionActive) playTrack(++currentTrackIndex);
        }, 500);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));

      const durationMs = await getSpotifyTrackDuration(song.id);
      const startTimeSec = calculateStartTime(
        durationMs ? durationMs / 1000 : null,
      );
      console.log(
        `[Spotify Play] Duración API: ${durationMs}ms, StartTime: ${startTimeSec}s`,
      );
      console.log(
        `[Spotify Play] IDs a usar -> Device: ${deviceId}, Track ID: ${song.id}`,
      );
      if (!song || !song.id) {
        throw new Error("ID de canción inválida o no encontrada."); // Error si falta ID
      }
      // Aumentar ligeramente la pausa post-transferencia
      console.log("[Spotify Play] Pausa extra (300ms) post-transferencia...");
      await new Promise((resolve) => setTimeout(resolve, 300)); // Era 200ms, probamos 300ms
      console.log("[Spotify Play] Llamando a API PUT /play...");

      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(
          deviceId,
        )}`,
        {
          method: "PUT",
          body: JSON.stringify({
            uris: [`spotify:track:${song.id}`],
            position_ms: Math.max(0, Math.round(startTimeSec * 1000)),
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: response.statusText } }));
        console.error("[Spotify Play] Error API Play:", errorData);
        if (response.status === 403) {
          throw new Error("Se requiere Premium o acción restringida.");
        }
        if (response.status === 404) {
          throw new Error("Dispositivo no encontrado/activo.");
        }
        if (response.status === 401) {
          console.warn("[Spotify Play] Token inválido en Play, refrescando...");
          const refreshed = await refreshTokenPKCE();
          if (refreshed) {
            console.log(
              "[Spotify Play] Token refrescado, reintentando playTrack...",
            );
            return playTrack(currentTrackIndex);
          } // Reintentar la misma canción
          else {
            throw new Error("Token expirado y no se pudo refrescar.");
          }
        }
        throw new Error(
          `Error API Play (${response.status}): ${errorData?.error?.message || "Desconocido"}`,
        );
      }

      console.log("[Spotify Play] Llamada API Play exitosa.");
      isPaused = false;
      if (playPauseBtn) playPauseBtn.textContent = "❚❚";
      startRoundTimers(
        sessionConfig.duration,
        durationMs ? durationMs / 1000 : null,
      ); // Pasar duración real a timers
    } catch (error) {
      console.error("[Spotify Play] Error GRANDE en playSpotifyTrack:", error);
      showToast(`Error Spotify: ${error.message}. Saltando...`, "error");
      if (spotifyPlayer) {
        try {
          await spotifyPlayer.pause();
        } catch (e) {}
      }
      isPaused = true;
      if (playPauseBtn) playPauseBtn.textContent = "▶️";
      clearAllTimers();
      setTimeout(() => {
        if (isSessionActive) playTrack(++currentTrackIndex);
      }, 500);
    }
  }
  function playYoutube(song) {
    //PASO IV PEGAR ANTES
    let hasStarted = false;
    const stateChangeHandler = (event) => {
      if (event.data === YT.PlayerState.PLAYING && !hasStarted) {
        hasStarted = true;
        ytPlayer.removeEventListener("onStateChange", stateChangeHandler);
        const startTime = calculateStartTime(ytPlayer.getDuration());
        ytPlayer.seekTo(startTime, true);
        ytPlayer.setVolume(0);
        fadeIn(ytPlayer);
        playPauseBtn.textContent = "❚❚";
        isPaused = false;
        startRoundTimers(sessionConfig.duration);
      }
    };
    ytPlayer.addEventListener("onStateChange", stateChangeHandler);
    ytPlayer.loadVideoById(song.id);
    ytPlayer.playVideo();
  }
  function calculateStartTime(totalDuration) {
    let startTime = 0;
    const effectiveDuration = sessionConfig.duration + 4;
    if (!totalDuration || totalDuration < effectiveDuration) return 0;
    switch (sessionConfig.segment) {
      case "medio":
        startTime = totalDuration / 2 - sessionConfig.duration / 2;
        break;
      case "final":
        startTime = totalDuration - effectiveDuration;
        break;
      case "azar":
        startTime = Math.random() * (totalDuration - effectiveDuration);
        break;
    }
    return Math.max(0, startTime);
  }
  function fadeIn(playerInstance) {
    // PASO V  // Puede ser 'audio', 'ytPlayer' o 'spotifyPlayer'
    console.log("[App Logic] Iniciando fadeIn...");
    clearInterval(fadeInInterval); // Limpiar anterior

    try {
      let currentVolume = 0;
      const targetVolumeAudio = 1; // Para <audio>
      const targetVolumeYT = 100; // Para YouTube Player API
      const targetVolumeSpotify = 0.5; // El volumen base del SDK
      const steps = 20; // Número de pasos para el fade
      const intervalTime = 100; // ms por paso

      if (
        playerInstance === audio &&
        typeof playerInstance.volume !== "undefined"
      ) {
        playerInstance.volume = 0; // Empezar audio en 0
        const volumeStep = targetVolumeAudio / steps;
        fadeInInterval = setInterval(() => {
          currentVolume += volumeStep;
          if (currentVolume < targetVolumeAudio) {
            playerInstance.volume = currentVolume;
          } else {
            clearInterval(fadeInInterval);
            playerInstance.volume = targetVolumeAudio;
          }
        }, intervalTime);
      } else if (
        playerInstance === ytPlayer &&
        typeof playerInstance.setVolume === "function"
      ) {
        playerInstance.setVolume(0); // Empezar YT en 0
        const volumeStep = targetVolumeYT / steps;
        fadeInInterval = setInterval(() => {
          currentVolume += volumeStep;
          if (currentVolume < targetVolumeYT) {
            playerInstance.setVolume(Math.round(currentVolume));
          } else {
            clearInterval(fadeInInterval);
            playerInstance.setVolume(targetVolumeYT);
          }
        }, intervalTime);
      } else if (
        playerInstance === spotifyPlayer &&
        typeof playerInstance.setVolume === "function"
      ) {
        // Spotify SDK usa de 0.0 a 1.0, pero ajustamos al target (0.5)
        playerInstance
          .setVolume(0)
          .then(() => {
            // Empezar Spotify en 0
            const volumeStep = targetVolumeSpotify / steps;
            fadeInInterval = setInterval(async () => {
              currentVolume += volumeStep;
              if (currentVolume < targetVolumeSpotify) {
                try {
                  await playerInstance.setVolume(currentVolume);
                } catch (e) {
                  console.warn("[Spotify FadeIn] Error setVolume", e);
                  clearInterval(fadeInInterval);
                }
              } else {
                clearInterval(fadeInInterval);
                try {
                  await playerInstance.setVolume(targetVolumeSpotify);
                } catch (e) {
                  // Asegurar target
                  console.warn("[Spotify FadeIn] Error setVolume final", e);
                }
              }
            }, intervalTime);
          })
          .catch((e) =>
            console.error("[Spotify FadeIn] Error setVolume(0)", e),
          );
      } else {
        console.warn(
          "[App Logic] fadeIn: Tipo de player no reconocido o sin control de volumen.",
        );
      }
    } catch (e) {
      console.error("[App Logic] Error GRANDE en fadeIn:", e);
      clearInterval(fadeInInterval);
    }
  }
  function startRoundTimers(
    durationInSeconds,
    trackTotalDurationSeconds = null,
  ) {
    // Añadir duración total opcional
    clearAllTimers();
    const roundDurationMs =
      (durationInSeconds || sessionConfig.duration || 40) * 1000;
    const fadeDurationMs = Math.min(4000, roundDurationMs);
    const gapDurationMs = (sessionConfig.gap || 3) * 1000;

    console.log(
      `[App Timers] Iniciando round: ${roundDurationMs}ms, Fade: ${fadeDurationMs}ms, Gap: ${gapDurationMs}ms`,
    );

    // Determinar player actual
    const currentSong = playlist[currentTrackIndex];
    let currentPlayer = null;
    if (currentSong?.type === "mp3") currentPlayer = audio;
    else if (currentSong?.type === "youtube") currentPlayer = ytPlayer;
    else if (currentSong?.type === "spotify") currentPlayer = spotifyPlayer; // Usar spotifyPlayer

    // --- FADE IN ---
    if (currentPlayer) {
      fadeIn(currentPlayer); // Llamar fadeIn con el player correcto
    } else {
      console.warn(
        "[App Timers] startRoundTimers: No se pudo determinar currentPlayer para fadeIn.",
      );
    }

    roundEndTime = Date.now() + roundDurationMs;
    timeRemainingOnPause = null;

    const fadeOutStartTime = Math.max(roundDurationMs - fadeDurationMs, 0);
    const countdownSeconds = Math.min(
      5,
      Math.max(Math.floor(fadeOutStartTime / 1000), 1),
    );
    const countdownStartDelay = Math.max(
      fadeOutStartTime - (countdownSeconds - 1) * 1000,
      0,
    );

    let hasStartedFadeOut = false;
    let gapScheduled = false;

    const scheduleGap = () => {
      if (gapScheduled) return;
      gapScheduled = true;
      if (fadeOutTimeout) {
        clearInterval(fadeOutTimeout);
        fadeOutTimeout = null;
      }
      if (fadeOutCompletionTimeout) {
        clearTimeout(fadeOutCompletionTimeout);
        fadeOutCompletionTimeout = null;
      }
      try {
        if (currentPlayer === audio) {
          audio.pause();
          audio.volume = 1;
        } else if (
          currentPlayer === ytPlayer &&
          typeof currentPlayer.pauseVideo === "function"
        ) {
          currentPlayer.pauseVideo();
          if (typeof currentPlayer.setVolume === "function") {
            currentPlayer.setVolume(100);
          }
        } else if (
          currentPlayer === spotifyPlayer &&
          typeof currentPlayer.pause === "function"
        ) {
          spotifyPlayer.pause().catch(() => {});
          if (typeof spotifyPlayer.setVolume === "function") {
            spotifyPlayer.setVolume(0.5).catch(() => {});
          }
        }
      } catch (e) {
        console.warn("[App Timers] Error asegurando pausa en scheduleGap:", e);
      }
      if (countdownDisplay) {
        countdownDisplay.classList.remove("final-seconds");
        countdownDisplay.textContent = `Pausa: ${sessionConfig.gap}s`;
        countdownDisplay.style.display = "block";
      }
      gapTimeout = setTimeout(() => {
        console.log("[App Timers] Fin del gap, siguiente track.");
        if (countdownDisplay) countdownDisplay.style.display = "none";
        if (isSessionActive) {
          playTrack(++currentTrackIndex);
        } else {
          console.log("[App Timers] Sesión inactiva al fin del gap.");
          endSession();
        }
      }, gapDurationMs);
    };

    const startFadeOut = () => {
      if (hasStartedFadeOut || !isSessionActive) return;
      hasStartedFadeOut = true;
      console.log("[App Timers] Iniciando fadeOut...");
      clearTimeout(roundTimeout);
      roundTimeout = null;
      clearTimeout(countdownStartTimeout);
      countdownStartTimeout = null;
      clearInterval(countdownIntervalId);
      countdownIntervalId = null;

      if (!currentPlayer) {
        console.warn(
          "[App Timers] startRoundTimers: No se pudo hacer fadeOut (currentPlayer nulo).",
        );
        scheduleGap();
        return;
      }

      const intervalTime = 100;
      fadeOutCompletionTimeout = setTimeout(() => {
        scheduleGap();
      }, fadeDurationMs + intervalTime);

      if (currentPlayer === audio) {
        let currentVolume = audio.volume;
        const steps = Math.max(fadeDurationMs / intervalTime, 1);
        const volumeStep = currentVolume / steps;
        clearInterval(fadeOutTimeout);
        fadeOutTimeout = setInterval(() => {
          currentVolume -= volumeStep;
          if (currentVolume > 0) {
            audio.volume = Math.max(0, currentVolume);
          } else {
            clearInterval(fadeOutTimeout);
            fadeOutTimeout = null;
            audio.pause();
            audio.volume = 1;
            console.log("[App Timers] FadeOut mp3 completo, pausado.");
            scheduleGap();
          }
        }, intervalTime);
        return;
      }

      if (
        currentPlayer === ytPlayer &&
        typeof currentPlayer.getVolume === "function" &&
        typeof currentPlayer.setVolume === "function"
      ) {
        let currentVolume = currentPlayer.getVolume();
        const steps = Math.max(fadeDurationMs / intervalTime, 1);
        const volumeStep = currentVolume / steps;
        clearInterval(fadeOutTimeout);
        fadeOutTimeout = setInterval(() => {
          currentVolume -= volumeStep;
          if (currentVolume > 0) {
            currentPlayer.setVolume(Math.max(0, Math.round(currentVolume)));
          } else {
            clearInterval(fadeOutTimeout);
            fadeOutTimeout = null;
            currentPlayer.pauseVideo();
            currentPlayer.setVolume(100);
            console.log("[App Timers] FadeOut youtube completo, pausado.");
            scheduleGap();
          }
        }, intervalTime);
        return;
      }

      if (
        currentPlayer === spotifyPlayer &&
        typeof currentPlayer.getVolume === "function"
      ) {
        currentPlayer
          .getVolume()
          .then((vol) => {
            let currentVolume = vol;
            const steps = Math.max(fadeDurationMs / intervalTime, 1);
            const volumeStep = (vol > 0 ? vol : 0.5) / steps;
            console.log(
              `[Spotify FadeOut] Vol inicial: ${vol}, Step: ${volumeStep}`,
            );
            clearInterval(fadeOutTimeout);
            fadeOutTimeout = setInterval(async () => {
              currentVolume -= volumeStep;
              if (currentVolume > 0) {
                try {
                  await spotifyPlayer.setVolume(Math.max(0, currentVolume));
                } catch (e) {
                  console.warn("[Spotify FadeOut] Error setVolume", e);
                  clearInterval(fadeOutTimeout);
                  fadeOutTimeout = null;
                  try {
                    await spotifyPlayer.setVolume(0);
                  } catch (e2) {}
                  scheduleGap();
                }
              } else {
                clearInterval(fadeOutTimeout);
                fadeOutTimeout = null;
                try {
                  console.log("[Spotify FadeOut] Completo, pausando.");
                  await spotifyPlayer.pause();
                  await spotifyPlayer.setVolume(0.5);
                } catch (e) {
                  console.warn(
                    "[Spotify FadeOut] Error al pausar/restaurar",
                    e,
                  );
                }
                scheduleGap();
              }
            }, intervalTime);
          })
          .catch((e) => {
            console.error("[Spotify FadeOut] Error getVolume:", e);
            scheduleGap();
          });
        return;
      }

      console.warn(
        "[App Timers] startRoundTimers: Tipo de reproductor sin fadeOut manejado.",
      );
      scheduleGap();
    };

    const startCountdown = () => {
      if (!isSessionActive || hasStartedFadeOut) return;
      console.log("[App Timers] Iniciando countdown final...");
      countdownStartTimeout = null;
      if (countdownDisplay) {
        countdownDisplay.style.display = "block";
        countdownDisplay.classList.add("final-seconds");
      }
      clearInterval(countdownIntervalId);
      let remainingSeconds = countdownSeconds;

      const tick = () => {
        if (!isSessionActive || hasStartedFadeOut) {
          clearInterval(countdownIntervalId);
          countdownIntervalId = null;
          return;
        }
        if (remainingSeconds <= 0) {
          clearInterval(countdownIntervalId);
          countdownIntervalId = null;
          return;
        }
        if (countdownDisplay) countdownDisplay.textContent = remainingSeconds;
        playSound("sounds/beep.mp3");
        if (remainingSeconds === 1) {
          remainingSeconds = 0;
          clearInterval(countdownIntervalId);
          countdownIntervalId = null;
          startFadeOut();
          return;
        }
        remainingSeconds -= 1;
      };

      tick();

      if (remainingSeconds > 0 && !hasStartedFadeOut) {
        countdownIntervalId = setInterval(() => {
          if (!isSessionActive || hasStartedFadeOut) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
            return;
          }
          tick();
        }, 1000);
      }
    };

    if (fadeOutStartTime <= 0) {
      startCountdown();
      return;
    }

    if (countdownSeconds > 0) {
      countdownStartTimeout = setTimeout(() => {
        startCountdown();
      }, countdownStartDelay);
    }

    roundTimeout = setTimeout(() => {
      startFadeOut();
    }, fadeOutStartTime + 50);
  }
  function playSound(soundFile, volume = 1.0) {
    sfxPlayer.src = soundFile;
    sfxPlayer.volume = volume;
    sfxPlayer.play();
  }

  async function endSession() {
    //PASO VII
    console.log("[App Logic] endSession llamado...");
    if (!isSessionActive && isPaused) {
      console.log("[App Logic] endSession: Ya inactiva.");
      return;
    }
    isSessionActive = false;
    isPaused = true;

    if (wakeLock) {
      try {
        await wakeLock.release();
        wakeLock = null;
        console.log("[App Logic] Wake Lock liberado.");
      } catch (e) {
        console.error("[App Logic] Error liberando Wake Lock:", e);
      }
    }
    clearAllTimers(); // Detener todos los timers

    // Pausar todos los reproductores posibles
    if (audio.duration > 0 && !audio.paused) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    } // Resetear audio
    if (ytPlayerReady && ytPlayer.stopVideo) {
      try {
        ytPlayer.stopVideo();
      } catch (e) {}
    } // Detener YT
    if (spotifyPlayer) {
      try {
        console.log("[Spotify Play] Pausando en endSession...");
        await spotifyPlayer.pause();
      } catch (e) {
        console.warn(
          "[Spotify Play] Aviso: Error pausando Spotify en endSession.",
          e,
        );
      }
    } // Pausar Spotify
    if (sfxPlayer) {
      try {
        sfxPlayer.pause();
        sfxPlayer.currentTime = 0;
      } catch (e) {}
    } // Resetear SFX

    // Restaurar UI
    if (playPauseBtn) playPauseBtn.textContent = "▶️";
    if (playerPanel) playerPanel.classList.remove("session-active");
    if (endSessionBtn) endSessionBtn.style.display = "none";
    if (toggleVideoBtn) toggleVideoBtn.style.display = "none";
    if (youtubePlayerContainer)
      youtubePlayerContainer.classList.remove("visible");
    if (instructions) instructions.style.display = "block"; // Mostrar instrucciones de nuevo? O bienvenida?
    if (welcomeMessageDiv) welcomeMessageDiv.style.display = "block"; // Mostrar bienvenida
    if (playerControls) playerControls.style.display = "none"; // Ocultar controles
    if (currentSongTitle) currentSongTitle.textContent = "";
    if (countdownDisplay) countdownDisplay.style.display = "none";
    if (countdownDisplay) countdownDisplay.classList.remove("final-seconds");
    hasShownYoutubeWarning = false; // Resetear aviso YT

    console.log("[App Logic] Sesión finalizada.");
  }
  endSessionBtn.addEventListener("click", endSession);

  playPauseBtn.addEventListener("click", async () => {
    //PASO VIII
    if (!isSessionActive) {
      console.log("[App Controls] Play/Pause: Sesión no activa.");
      return;
    }
    // Determinar player actual para pausar/reanudar correctamente
    const currentSong = playlist[currentTrackIndex];
    let currentPlayer = null;
    if (currentSong?.type === "mp3") currentPlayer = audio;
    else if (currentSong?.type === "youtube") currentPlayer = ytPlayer;
    else if (currentSong?.type === "spotify") currentPlayer = spotifyPlayer;

    if (!currentPlayer) {
      console.error(
        "[App Controls] Play/Pause: No se pudo determinar currentPlayer.",
      );
      return;
    }

    isPaused = !isPaused; // Invertir estado de pausa
    console.log(
      `[App Controls] Play/Pause Clicked. Nuevo estado isPaused: ${isPaused}`,
    );

    try {
      if (isPaused) {
        // --- PAUSAR ---
        // Guardar tiempo restante antes de limpiar timers
        timeRemainingOnPause = roundEndTime ? roundEndTime - Date.now() : null;
        clearAllTimers(); // Detener timers
        console.log(
          `[App Controls] Pausando. Tiempo restante: ${timeRemainingOnPause}ms`,
        );

        // Pausar el reproductor específico
        if (currentPlayer === audio) {
          currentPlayer.pause();
        } else if (
          currentPlayer === ytPlayer &&
          typeof currentPlayer.pauseVideo === "function"
        ) {
          currentPlayer.pauseVideo();
        } else if (
          currentPlayer === spotifyPlayer &&
          typeof currentPlayer.pause === "function"
        ) {
          await spotifyPlayer.pause();
        } // Spotify es async

        if (playPauseBtn) playPauseBtn.textContent = "▶️"; // Actualizar botón
      } else {
        // --- REANUDAR ---
        console.log(
          `[App Controls] Reanudando. Tiempo restante guardado: ${timeRemainingOnPause}ms`,
        );
        // Reanudar el reproductor específico
        if (currentPlayer === audio) {
          await currentPlayer.play().catch((e) => {
            throw e;
          });
        } // Audio play devuelve promesa
        else if (
          currentPlayer === ytPlayer &&
          typeof currentPlayer.playVideo === "function"
        ) {
          currentPlayer.playVideo();
        } else if (
          currentPlayer === spotifyPlayer &&
          typeof currentPlayer.resume === "function"
        ) {
          await spotifyPlayer.resume();
        } // Spotify resume es async

        // Reiniciar timers SOLO si había tiempo restante válido
        if (timeRemainingOnPause !== null && timeRemainingOnPause > 0) {
          startRoundTimers(timeRemainingOnPause / 1000); // Reiniciar con tiempo restante en segundos
        } else {
          console.warn(
            "[App Controls] Reanudado sin tiempo restante válido o expirado. Iniciando track de nuevo?",
          );
          // Podrías reiniciar el track aquí si lo prefieres: playTrack(currentTrackIndex);
          // O simplemente dejar que siga (puede causar desincronización si la música avanzó externamente)
          // Por ahora, solo actualizamos el botón y el estado interno
          if (playPauseBtn) playPauseBtn.textContent = "❚❚";
        }
        timeRemainingOnPause = null; // Resetear tiempo guardado
      }
    } catch (error) {
      console.error("[App Controls] Error en Play/Pause:", error);
      showToast("Error al pausar/reanudar.", "error");
      isPaused = true; // Forzar estado pausado en caso de error
      if (playPauseBtn) playPauseBtn.textContent = "▶️";
      clearAllTimers();
      // Considerar finalizar sesión si el error es grave: await endSession();
    }
  });
  toggleVideoBtn.addEventListener("click", () => {
    youtubePlayerContainer.classList.toggle("visible");
  });
  nextBtn.addEventListener("click", () => {
    if (isSessionActive) playTrack(++currentTrackIndex);
  });
  prevBtn.addEventListener("click", () => {
    if (isSessionActive && currentTrackIndex > 0)
      playTrack(--currentTrackIndex);
  });
  duration40Btn.addEventListener("click", () => {
    sessionConfig.duration = 40;
    duration40Btn.classList.add("active");
    duration60Btn.classList.remove("active");
  });
  duration60Btn.addEventListener("click", () => {
    sessionConfig.duration = 60;
    duration60Btn.classList.add("active");
    duration40Btn.classList.remove("active");
    console.log("[App Config] Duración cambiada a 60s.");
  });
  // --- LISTENERS BOTONES SPOTIFY ---
  if (connectSpotifyBtn) {
    connectSpotifyBtn.addEventListener("click", redirectToSpotifyAuthorize);
  } else {
    console.error("[App Init] connectSpotifyBtn no encontrado en HTML.");
  }

  if (disconnectSpotifyBtn) {
    disconnectSpotifyBtn.addEventListener("click", () => {
      if (confirm("¿Desconectar tu cuenta de Spotify de esta app?")) {
        clearSpotifyTokens(); // Borrar tokens guardados
        showDisconnected(); // Actualizar UI y desconectar player
        showToast("Desconectado de Spotify.", "info");
      }
    });
  } else {
    console.error("[App Init] disconnectSpotifyBtn no encontrado en HTML.");
  }

  // Necesitarás añadir este botón en tu HTML
  const addSpotifyPlaylistBtn = document.getElementById(
    "add-spotify-playlist-btn",
  );
  if (addSpotifyPlaylistBtn) {
    addSpotifyPlaylistBtn.addEventListener("click", async () => {
      const accessToken = localStorage.getItem("spotify_access_token");
      if (!accessToken) {
        showToast("Primero conecta Spotify.", "info");
        return;
      } // Verificar conexión
      const url = prompt("Pega el link de la playlist de Spotify:");
      if (!url) return; // Si cancela
      const playlistId = extractSpotifyPlaylistID(url);
      if (playlistId) {
        await loadSpotifyPlaylist(playlistId); // Llamar a la función de carga
      } else {
        showToast(
          "El link no parece ser una playlist de Spotify válida.",
          "error",
        );
      }
    });
  } else {
    console.error("[App Init] addSpotifyPlaylistBtn no encontrado en HTML.");
  }
  // --- FIN LISTENERS SPOTIFY ---
  segmentSelect.addEventListener(
    "change",
    (e) => (sessionConfig.segment = e.target.value),
  ); // PASO X, PEGAR EN LINEA ANTERIOR
  gapInput.addEventListener(
    "change",
    (e) => (sessionConfig.gap = parseInt(e.target.value, 10)),
  );

  let draggedItem = null;
  playlistUl.addEventListener("dragstart", (e) => (draggedItem = e.target));
  playlistUl.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(playlistUl, e.clientY);
    if (afterElement == null) {
      playlistUl.appendChild(draggedItem);
    } else {
      playlistUl.insertBefore(draggedItem, afterElement);
    }
  });
  playlistUl.addEventListener("drop", () => {
    const reorderedPlaylist = [];
    for (const li of playlistUl.children) {
      const songName = li.querySelector("span:not(.track-type)").textContent;
      const songObject = playlist.find((s) => s.name === songName);
      if (songObject) reorderedPlaylist.push(songObject);
    }
    playlist = reorderedPlaylist;
    updatePlaylistUI();
  });
  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll("li:not(.dragging)"),
    ];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY },
    ).element;
  }
  // --- INICIALIZACIÓN SPOTIFY AL CARGAR ---
  await handleSpotifyCallback(); // Procesar si venimos de la redirección de Spotify
  // Verificar estado de conexión si NO venimos de un callback
  const currentParams = new URLSearchParams(window.location.search);
  if (!currentParams.has("code") && !currentParams.has("error")) {
    updateSpotifyStatus(); // Comprobar si ya hay tokens guardados y válidos
  }
  // --- FIN INICIALIZACIÓN SPOTIFY ---
  initializeApp(); // PASO XI, PEGAR EN LINEA ANTERIOR
});
