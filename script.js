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
  const orderSequentialBtn = document.getElementById("order-sequential");
  const orderRandomBtn = document.getElementById("order-random");
  const trainPartnerNoBtn = document.getElementById("train-partner-no");
  const trainPartnerYesBtn = document.getElementById("train-partner-yes");
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
  const playlistProgress = document.getElementById("playlist-progress");
  const sessionTimer = document.getElementById("session-timer");
  const modalOverlay = document.getElementById("modal-overlay");
  const infoBtns = document.querySelectorAll(".info-btn");
  const closeBtns = document.querySelectorAll(".close-modal-btn");
  const languageButtons = document.querySelectorAll(".language-btn");
  const playlistSourceSelect = document.getElementById(
    "playlist-source-select",
  );

  const translations = {
    es: {
      infoPresentation: "Presentación",
      infoTutorial: "Tutorial de uso",
      infoContact: "Contacto",
      myPlaylists: "Cargar playlist",
      loadPlaylistOption: "Cargar una playlist...",
      deleteSelectedPlaylist: "Borrar Playlist Seleccionada",
      buildEditPlaylist: "Armar / Editar Playlist",
      addMp3: "Añadir Archivos MP3",
      addYoutube: "Añadir desde YouTube",
      addSpotifyPlaylist: "Añadir desde Spotify",
      connectSpotify: "Conectar con Spotify",
      currentPlaylistSource:
        "Origen de la playlist actual (elige el correcto para que funcione)",
      playlistSourceSpotify: "Spotify",
      playlistSourceYoutube: "YouTube",
      currentPlaylistManagement: "Gestión de la Lista Actual",
      playlistNamePlaceholder: "Nombre para guardar",
      save: "Guardar",
      clearList: "Vaciar Lista Actual",
      showList: "Mostrar Lista Actual",
      hideList: "Ocultar Lista Actual",
      connectedAs: "Conectado como:",
      disconnect: "Desconectar",
      welcomeTitle: "¡Bienvenidxs!",
      welcomeText:
        "Conecta tu cuenta y añade playlists de Spotify o YouTube para empezar.",
      welcomeHint: "Usa los botones de arriba para ver la presentación y el tutorial.",
      toggleVideoTitle: "Mostrar/Ocultar video",
      configTitle: "Configuración",
      roundDuration: "Duración del Round",
      duration40: "40 seg",
      duration60: "1 min",
      trainingMode: "Modo de entrenamiento",
      trainingSolo: "Solitario",
      trainingPartner: "Con alguien",
      songSegment: "Segmento de Canción",
      segmentStart: "Principio",
      segmentMiddle: "Medio",
      segmentEnd: "Final",
      segmentRandom: "Azar",
      segmentHelper:
        "En modo “Con alguien”, el segmento se reproduce dos veces antes de pasar al siguiente tema.",
      playbackOrder: "Orden de Reproducción",
      orderSequential: "En orden",
      orderRandom: "Al azar",
      gapBetweenSongs: "Pausa entre Canciones (seg)",
      startSession: "¡COMENZAR SESIÓN!",
      endSession: "Finalizar Sesión",
      modalPresentationTitle: "Presentación",
      modalPresentationSubtitle:
        "Whacking Battle Trainer: Tu Sesión de Baile Automatizada.",
      presentationIntro:
        "Esta es una aplicación web diseñada para automatizar tus entrenamientos, replicando la sensación de una batalla o un showcase. Te permite cargar tu música, configurar los rounds y olvidarte del celular para concentrarte 100% en bailar.",
      presentationDetails: "Detalles Pensados para Bailarines:",
      presentationRound:
        "<b>Rounds a Medida:</b> Elegí la duración de tus salidas (40 o 60 segundos) para practicar con los tiempos de una batalla real.",
      presentationPause:
        "<b>Pausa para Respirar:</b> Entre cada round, tenés unos segundos de pausa (que podés configurar) para recuperar el aliento y prepararte para la siguiente canción.",
      presentationTransitions:
        "<b>Transiciones de DJ (Fade-In & Out):</b> La música no te sorprende. Sube y baja suavemente al inicio y final de cada round, dándote tiempo para empezar y terminar tu fraseo sin cortes bruscos.",
      presentationSegments:
        '<b>Entrenamiento por Segmentos:</b> ¿Siempre bailás los mismos 30 segundos de cada tema? Con las opciones de "Principio", "Medio" y "Final", podés forzarte a entrenar con diferentes partes de las canciones.',
      presentationSmartRandom:
        '<b>Modo Azar Inteligente:</b> La opción "Azar" está diseñada para respetar la musicalidad. En vez de empezar en un segundo cualquiera, el sistema lo ajusta para que coincida con la estructura de la música. La mayoría de temas funk y disco de Whacking tienen un tempo ~120 BPM. Esto permite que haya más posibilidades de que la canción arranque en el "1", el inicio de una frase musical, para que tu entrada sea siempre potente.',
      presentationInstantResponse:
        "<b>Respuesta Instantánea (Modo de entrenamiento):</b> Si elegís “Con alguien”, cada canción suena en dos segmentos seguidos. Después del primer conteo de 5 beeps, la música sigue sin fade-out para que la otra persona responda al instante. Al terminar el segundo segmento, vuelven los beeps, hay fade-out y recién ahí se cambia de tema. Esto recrea la autenticidad de una batalla real.",
      presentationFocus:
        "<b>Claridad de enfoque:</b> En “Solitario”, cada tema se reproduce una sola vez para que puedas concentrarte en tu salida y la musicalidad sin cortes extra.",
      presentationNoInterruptions:
        "<b>Cero Interrupciones (Pantalla Activa):</b> Al iniciar una sesión, la app evita que la pantalla de tu celular se apague. Tu única misión es bailar, sin tocar nada.",
      presentationFlow:
        "<b>Flujo Ininterrumpido (Anti-Errores):</b> ¿Un video de YouTube está protegido? La app te avisará con una notificación que no detiene la música y <strong>saltará automáticamente al siguiente tema</strong>. El ritmo nunca para.",
      modalTutorialTitle: "Tutorial de uso",
      modalTutorialSubtitle: "¡Bienvenidxs al Trainer!",
      tutorialIntro:
        "Esta app está diseñada para que sus entrenamientos sean fluidos y enfocados. Aquí te explicamos cómo funciona:",
      tutorialStep1:
        '<strong>Carga tu Música:</strong> Presiona "Añadir desde Spotify" o "Añadir desde YouTube" y pega el enlace que quieras usar. Necesitarás conectar tu cuenta de Spotify primero.',
      tutorialStep2:
        '<strong>Guarda tu Playlist (Opcional):</strong> Si te gustó la lista que armaste, ponele un nombre claro en el campo de "Nombre para guardar" y presioná "Guardar". La próxima vez, podrás cargarla al instante desde el menú "Cargar playlist".',
      tutorialStep3:
        '<strong>Configura tu Sesión y ¡a Bailar!:</strong> En el panel de Configuración, ajusta tu sesión. Cuando esté todo listo, ¡presioná "¡COMENZAR SESIÓN!".',
      tutorialTroubleshoot: "Solución a problemas comunes",
      tutorialIssuePremium:
        '<b>"Spotify me dice que necesito Premium":</b> La reproducción dentro de la app requiere una cuenta Spotify Premium.',
      tutorialIssuePlaylist:
        '<b>"No se carga la playlist de Spotify":</b> Asegúrate de estar conectado a internet y de haber iniciado sesión con Spotify en la app. Verifica que el link sea correcto.',
      tutorialIssueAudio:
        '<b>"No se escucha nada":</b> Revisá que el volumen de "multimedia" de tu celular no esté en silencio.',
      modalContactTitle: "Contacto",
      contactSubtitle: "Hola, soy Eric (a.k.a. Genga)",
      contactIntro:
        'Soy estudiante avanzado de Ciencias de la Educación en la Universidad de San Andrés y miembro oficial de la crew <a href="https://www.instagram.com/waackerangers/" target="_blank" rel="noopener noreferrer">@waackerangers</a> ⚡',
      contactWhyTitle: "¿Por qué cree esta herramienta?",
      contactWhyParagraph1:
        "La primera vez que fui a una competencia de Whacking, me sentí como si descubriera un mundo nuevo. La comunidad unida, la energía de divas y el amor por la danza de las batallas me dejaron una huella, y desde ahí supe que quería dedicarme a entrenar para, algún día, poder competir.",
      contactWhyParagraph2:
        'El problema era que no siempre tenía con quién practicar; alguien que regulara el tiempo o cambiara las canciones para simular una batalla real y poder enfocarme en mis entradas. Como no sé nada de programación, empecé a construirme esta aplicación en un largo proceso de idas y vueltas con Gemini (la IA de Google). El resultado es esta herramienta, un "partner digital" que hoy me permite entrenar para una competencia en donde sea.',
      contactWhyParagraph3:
        "Mi objetivo con esta app es simple: compartirla de forma gratuita con todxs lxs whackers que la necesiten, para que puedan entrenar siempre que quieran.",
      contactIdeasTitle: "¿Ideas o Sugerencias?",
      contactIdeasText:
        "Si tenés alguna idea para mejorar la app o simplemente querés conectar, podés encontrarme en:",
      contactInstagram:
        '<strong>Instagram:</strong> <a href="https://www.instagram.com/Genga_eric" target="_blank" rel="noopener noreferrer">@Genga_eric</a>',
      toastSpotifyTokenError: "Error al obtener token: {message}",
      toastSpotifySaveError: "Error al guardar sesión Spotify.",
      toastSpotifyRefreshError: "Error renovando conexión Spotify: {message}",
      toastSpotifyPlayerLoadError: "Error carga Spotify Player.",
      toastSpotifyFatalSdk: "Error fatal SDK Spotify.",
      toastSpotifyNoId:
        "Error grave al iniciar reproductor Spotify (No ID).",
      toastSpotifyPremiumError: "Error Player: ¿Spotify Premium activo?",
      toastSpotifyInitError: "Error init Spotify: {message}",
      toastSpotifyAuthError: "Error auth Spotify. Reconectar.",
      toastSpotifyAccountError: "Error cuenta Spotify: {message}",
      toastSpotifyPlaybackError: "Error playback Spotify: {message}. Saltando...",
      toastSpotifyConnectFail: "Fallo al conectar reproductor Spotify.",
      toastSpotifyCreateError: "Error crítico al crear Player Spotify.",
      toastSpotifyCheckError: "Error verificando conexión Spotify.",
      toastSpotifyClientIdMissing:
        "Error: Client ID de Spotify no configurado.",
      toastSpotifyConnectError: "Error al intentar conectar con Spotify.",
      toastSpotifyChecking: "Verificando conexión Spotify...",
      toastSpotifyTokenFetchError: "Error al obtener token de Spotify.",
      toastSpotifySecurityError: "Error de seguridad (PKCE).",
      toastSpotifyError: "Error de Spotify: {message}",
      toastSpotifyNeedConnect: "Necesitas conectar Spotify.",
      toastSpotifyLoadingPlaylist: "Cargando playlist Spotify...",
      toastSpotifyLoadedPlaylist: "Playlist Spotify cargada ({count}).",
      toastSpotifyNoTracks: "No se encontraron canciones.",
      toastSpotifyLoadError: "Error cargar playlist: {message}",
      toastSpotifyInternalError: "Error interno Spotify.",
      toastSpotifyActivateError: "{message}",
      toastSpotifyActivateDefault: "Error activar reproductor.",
      toastTrackUnplayable: '"{song}" no se puede reproducir. Saltando...',
      toastMp3Saving: "Guardando MP3s en la base de datos...",
      toastMp3Ready: "MP3s listos para usar.",
      toastMp3SaveError: "Error al guardar los archivos MP3.",
      promptYoutubeUrl: "Pega el link del video o playlist de YouTube:",
      toastYoutubeLoading: "Cargando playlist...",
      toastYoutubeApiMissing: "Error: Falta la clave de API.",
      toastYoutubeInvalidUrl: "URL de YouTube no válida.",
      toastYoutubeLoaded: "Playlist cargada con éxito.",
      toastYoutubeLoadError: "Error al cargar desde YouTube.",
      confirmClearPlaylist: "¿Seguro?",
      toastPlaylistNameMissing: "Ponle un nombre a tu playlist.",
      toastPlaylistEmpty: "La playlist está vacía.",
      toastPlaylistSaved: 'Playlist "{name}" guardada.',
      toastPlaylistSelectToDelete: "Selecciona una playlist para borrar.",
      confirmDeletePlaylist:
        '¿Seguro que quieres borrar la playlist "{name}"?',
      toastSessionEnded: "La sesión se finalizó.",
      toastWakeLock: "Pantalla activa durante la sesión.",
      toastAddSongs: "¡Añade canciones!",
      toastYoutubeWarning: "Aviso: Videos de YouTube podrían ser omitidos.",
      toastNoSongsAvailable: "No hay canciones disponibles en la playlist.",
      toastYtNotReady: "Reproductor YT no listo. Reintentando...",
      toastUnsupportedFile: "Tipo de archivo no soportado: {name}",
      toastStartError: "Error iniciando {name}. Saltando...",
      toastMp3NotFound: 'Error: MP3 "{name}" no encontrado en la DB. Saltando...',
      toastMp3PlayError: "Error al reproducir el MP3.",
      toastSpotifyNotReady: "Error: Reproductor Spotify no conectado/listo.",
      toastSpotifyStarting: "Spotify no terminó de iniciar. Reintenta.",
      toastSpotifyNoDevice: "Spotify no reportó un dispositivo activo.",
      toastSpotifyPlaybackSkip: "Error Spotify: {message}. Saltando...",
      toastPauseError: "Error al pausar/reanudar.",
      confirmDisconnectSpotify:
        "¿Desconectar tu cuenta de Spotify de esta app?",
      toastSpotifyDisconnected: "Desconectado de Spotify.",
      toastSpotifyConnectFirst: "Primero conecta Spotify.",
      promptSpotifyPlaylist: "Pega el link de la playlist de Spotify:",
      toastSpotifyInvalidPlaylist:
        "El link no parece ser una playlist de Spotify válida.",
    },
    en: {
      infoPresentation: "Presentation",
      infoTutorial: "How to use",
      infoContact: "Contact",
      myPlaylists: "My Playlists",
      loadPlaylistOption: "Load a playlist...",
      deleteSelectedPlaylist: "Delete Selected Playlist",
      buildEditPlaylist: "Build / Edit Playlist",
      addMp3: "Add MP3 Files",
      addYoutube: "Add from YouTube",
      addSpotifyPlaylist: "Add Spotify Playlist (Link)",
      connectSpotify: "Connect with Spotify",
      currentPlaylistSource:
        "Current playlist source (pick the correct one so the app works)",
      playlistSourceSpotify: "Spotify",
      playlistSourceYoutube: "YouTube",
      currentPlaylistManagement: "Current Playlist Management",
      playlistNamePlaceholder: "Name to save",
      save: "Save",
      clearList: "Clear Current List",
      showList: "Show Current List",
      hideList: "Hide Current List",
      connectedAs: "Connected as:",
      disconnect: "Disconnect",
      welcomeTitle: "Welcome!",
      welcomeText:
        "Connect your account and add Spotify or YouTube playlists to get started.",
      welcomeHint: "Use the buttons above to view the presentation and guide.",
      toggleVideoTitle: "Show/Hide video",
      configTitle: "Settings",
      roundDuration: "Round Duration",
      duration40: "40 sec",
      duration60: "1 min",
      trainingMode: "Training mode",
      trainingSolo: "Solo",
      trainingPartner: "With someone",
      songSegment: "Song Segment",
      segmentStart: "Start",
      segmentMiddle: "Middle",
      segmentEnd: "End",
      segmentRandom: "Random",
      segmentHelper:
        "In “With someone” mode, the segment plays twice before moving to the next track.",
      playbackOrder: "Playback Order",
      orderSequential: "In order",
      orderRandom: "Random",
      gapBetweenSongs: "Gap between songs (sec)",
      startSession: "START SESSION!",
      endSession: "End Session",
      modalPresentationTitle: "Presentation",
      modalPresentationSubtitle:
        "Whacking Battle Trainer: Your Automated Dance Session.",
      presentationIntro:
        "This web app automates your training sessions, replicating the feel of a battle or showcase. It lets you load your music, configure rounds, and forget about your phone so you can focus 100% on dancing.",
      presentationDetails: "Details designed for dancers:",
      presentationRound:
        "<b>Custom Rounds:</b> Choose the duration of your rounds (40 or 60 seconds) to practice battle timing.",
      presentationPause:
        "<b>Breathing Break:</b> Between rounds, you get a few seconds of pause (configurable) to catch your breath and prepare for the next song.",
      presentationTransitions:
        "<b>DJ Transitions (Fade-In & Out):</b> The music doesn’t jump at you. It fades in and out at the start and end of each round, giving you time to start and finish your phrasing without harsh cuts.",
      presentationSegments:
        '<b>Segment Training:</b> Always dancing the same 30 seconds? With "Start", "Middle", and "End", you can force yourself to train different parts of each song.',
      presentationSmartRandom:
        '<b>Smart Random Mode:</b> The "Random" option respects musicality. Instead of starting at any second, the system adjusts to match the structure. Most funk and disco Whacking tracks are around 120 BPM, increasing the chance the song starts on "1", the beginning of a musical phrase, for a strong entry.',
      presentationInstantResponse:
        "<b>Instant Response (Training mode):</b> If you choose “With someone”, each song plays in two back-to-back segments. After the first 5-beep count, the music continues without a fade-out so the other person can answer instantly. At the end of the second segment, the beeps return, there’s a fade-out, and only then does the track change. This recreates the authenticity of a real battle.",
      presentationFocus:
        "<b>Focus Clarity:</b> In “Solo”, each track plays only once so you can focus on your round and musicality without extra cuts.",
      presentationNoInterruptions:
        "<b>Zero Interruptions (Screen Awake):</b> When you start a session, the app prevents your phone screen from turning off. Your only mission is to dance, without touching anything.",
      presentationFlow:
        "<b>Uninterrupted Flow (Anti-Errors):</b> Is a YouTube video protected? The app will notify you without stopping the music and <strong>automatically skip to the next track</strong>. The rhythm never stops.",
      modalTutorialTitle: "How to use",
      modalTutorialSubtitle: "Welcome to the Trainer!",
      tutorialIntro:
        "This app is designed to keep your training smooth and focused. Here’s how it works:",
      tutorialStep1:
        '<strong>Load your music:</strong> Press "Add Spotify Playlist (Link)" or "Add from YouTube" and paste the URL you want to use. You’ll need to connect your Spotify account first.',
      tutorialStep2:
        '<strong>Save your playlist (Optional):</strong> If you like the list you built, give it a clear name in the "Name to save" field and press "Save". Next time, you can load it instantly from "My Playlists".',
      tutorialStep3:
        '<strong>Configure your session and dance:</strong> In the Settings panel, adjust your session. When everything is ready, press "START SESSION!".',
      tutorialTroubleshoot: "Troubleshooting",
      tutorialIssuePremium:
        '<b>"Spotify says I need Premium":</b> Playback inside the app requires a Spotify Premium account.',
      tutorialIssuePlaylist:
        '<b>"The Spotify playlist won’t load":</b> Make sure you are connected to the internet and signed in to Spotify in the app. Check that the link is correct.',
      tutorialIssueAudio:
        '<b>"I can’t hear anything":</b> Check that your phone’s media volume isn’t muted.',
      modalContactTitle: "Contact",
      contactSubtitle: "Hi, I'm Eric (a.k.a. Genga)",
      contactIntro:
        'I’m an advanced Education Sciences student at Universidad de San Andrés and an official member of the crew <a href="https://www.instagram.com/waackerangers/" target="_blank" rel="noopener noreferrer">@waackerangers</a> ⚡',
      contactWhyTitle: "Why did I create this tool?",
      contactWhyParagraph1:
        "The first time I went to a Whacking competition, I felt like I discovered a new world. The united community, diva energy, and love for battle dance left a mark on me, and from then on I knew I wanted to train so that, one day, I could compete.",
      contactWhyParagraph2:
        'The problem was that I didn’t always have someone to practice with—someone to keep time or switch songs to simulate a real battle so I could focus on my entries. Since I don’t know programming, I started building this app through a long back-and-forth process with Gemini (Google’s AI). The result is this tool, a "digital partner" that now lets me train for a competition anywhere.',
      contactWhyParagraph3:
        "My goal with this app is simple: share it for free with all whackers who need it so they can train whenever they want.",
      contactIdeasTitle: "Ideas or Suggestions?",
      contactIdeasText:
        "If you have any ideas to improve the app or just want to connect, you can find me at:",
      contactInstagram:
        '<strong>Instagram:</strong> <a href="https://www.instagram.com/Genga_eric" target="_blank" rel="noopener noreferrer">@Genga_eric</a>',
      toastSpotifyTokenError: "Error getting token: {message}",
      toastSpotifySaveError: "Error saving Spotify session.",
      toastSpotifyRefreshError: "Error refreshing Spotify connection: {message}",
      toastSpotifyPlayerLoadError: "Error loading Spotify Player.",
      toastSpotifyFatalSdk: "Fatal Spotify SDK error.",
      toastSpotifyNoId: "Severe error starting Spotify player (No ID).",
      toastSpotifyPremiumError: "Player error: Spotify Premium active?",
      toastSpotifyInitError: "Spotify init error: {message}",
      toastSpotifyAuthError: "Spotify auth error. Reconnect.",
      toastSpotifyAccountError: "Spotify account error: {message}",
      toastSpotifyPlaybackError:
        "Spotify playback error: {message}. Skipping...",
      toastSpotifyConnectFail: "Failed to connect Spotify player.",
      toastSpotifyCreateError: "Critical error creating Spotify Player.",
      toastSpotifyCheckError: "Error checking Spotify connection.",
      toastSpotifyClientIdMissing: "Error: Spotify Client ID not configured.",
      toastSpotifyConnectError: "Error connecting to Spotify.",
      toastSpotifyChecking: "Checking Spotify connection...",
      toastSpotifyTokenFetchError: "Error getting Spotify token.",
      toastSpotifySecurityError: "Security error (PKCE).",
      toastSpotifyError: "Spotify error: {message}",
      toastSpotifyNeedConnect: "You need to connect Spotify.",
      toastSpotifyLoadingPlaylist: "Loading Spotify playlist...",
      toastSpotifyLoadedPlaylist: "Spotify playlist loaded ({count}).",
      toastSpotifyNoTracks: "No tracks found.",
      toastSpotifyLoadError: "Error loading playlist: {message}",
      toastSpotifyInternalError: "Internal Spotify error.",
      toastSpotifyActivateError: "{message}",
      toastSpotifyActivateDefault: "Error activating player.",
      toastTrackUnplayable: '"{song}" cannot be played. Skipping...',
      toastMp3Saving: "Saving MP3s to the database...",
      toastMp3Ready: "MP3s ready to use.",
      toastMp3SaveError: "Error saving MP3 files.",
      promptYoutubeUrl: "Paste the YouTube video or playlist link:",
      toastYoutubeLoading: "Loading playlist...",
      toastYoutubeApiMissing: "Error: Missing API key.",
      toastYoutubeInvalidUrl: "Invalid YouTube URL.",
      toastYoutubeLoaded: "Playlist loaded successfully.",
      toastYoutubeLoadError: "Error loading from YouTube.",
      confirmClearPlaylist: "Are you sure?",
      toastPlaylistNameMissing: "Give your playlist a name.",
      toastPlaylistEmpty: "The playlist is empty.",
      toastPlaylistSaved: 'Playlist "{name}" saved.',
      toastPlaylistSelectToDelete: "Select a playlist to delete.",
      confirmDeletePlaylist: 'Are you sure you want to delete "{name}"?',
      toastSessionEnded: "The session ended.",
      toastWakeLock: "Screen stays awake during the session.",
      toastAddSongs: "Add songs!",
      toastYoutubeWarning: "Warning: YouTube videos might be skipped.",
      toastNoSongsAvailable: "No songs available in the playlist.",
      toastYtNotReady: "YT player not ready. Retrying...",
      toastUnsupportedFile: "Unsupported file type: {name}",
      toastStartError: "Error starting {name}. Skipping...",
      toastMp3NotFound: 'Error: MP3 "{name}" not found in the DB. Skipping...',
      toastMp3PlayError: "Error playing MP3.",
      toastSpotifyNotReady: "Error: Spotify player not connected/ready.",
      toastSpotifyStarting: "Spotify is still starting. Try again.",
      toastSpotifyNoDevice: "Spotify did not report an active device.",
      toastSpotifyPlaybackSkip: "Spotify error: {message}. Skipping...",
      toastPauseError: "Error pausing/resuming.",
      confirmDisconnectSpotify: "Disconnect your Spotify account from this app?",
      toastSpotifyDisconnected: "Disconnected from Spotify.",
      toastSpotifyConnectFirst: "Connect Spotify first.",
      promptSpotifyPlaylist: "Paste the Spotify playlist link:",
      toastSpotifyInvalidPlaylist:
        "That link doesn't look like a valid Spotify playlist.",
    },
  };

  let currentLang = localStorage.getItem("appLang") || "es";

  const t = (key, vars = {}) => {
    const table = translations[currentLang] || translations.es;
    const template = table[key] || translations.es[key] || key;
    return template.replace(/\{(\w+)\}/g, (_, variable) =>
      Object.prototype.hasOwnProperty.call(vars, variable) ? vars[variable] : "",
    );
  };

  const applyTranslations = () => {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.setAttribute("title", t(el.dataset.i18nTitle));
    });
    if (languageButtons.length > 0) {
      languageButtons.forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.lang === currentLang);
      });
    }
  };

  const setLanguage = (lang) => {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem("appLang", lang);
    document.documentElement.lang = lang;
    applyTranslations();
    updatePlaylistUI();
    updatePlaylistStatus();
  };

  // --- Variables de Estado ---
  const playlistsBySource = {
    spotify: [],
    youtube: [],
    mp3: [],
  };
  let currentPlaylistSource = "spotify";
  let playlist = playlistsBySource[currentPlaylistSource];
  let currentTrackIndex = 0;
  let playbackOrder = [];
  let currentOrderPosition = 0;
  let sessionStartTimestamp = null;
  let sessionElapsedMs = 0;
  let sessionTimerInterval = null;
  let sessionConfig = {
    duration: 40,
    segment: "principio",
    gap: 3,
    order: "sequential",
    trainWithPartner: false,
  };
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
  let countdownTimeoutId = null;
  let countdownHideTimeoutId = null;
  let roundEndTime = null;
  let timeRemainingOnPause = null;
  let transitionGuardInterval = null;
  let pendingNextTrackAt = null;
  let hasShownYoutubeWarning = false;
  let wakeLock = null;
  let spotifyKeepAliveInterval = null;
  let partnerSegmentIndex = 0;
  let currentRoundOptions = null;
  // PASO I
  // --- NUEVAS VARIABLES PARA SPOTIFY ---
  let spotifyPlayer = null;
  let spotifyDeviceId = null;
  // (Asegúrate de NO tener 'spotifyPlayer' o 'spotifyDeviceId' declarados en otro lugar)
  // --- FIN VARIABLES SPOTIFY ---

  function createPlaybackOrder() {
    playbackOrder = playlist.map((_, index) => index);
    if (sessionConfig.order === "random") {
      for (let i = playbackOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playbackOrder[i], playbackOrder[j]] = [
          playbackOrder[j],
          playbackOrder[i],
        ];
      }
    }
  }

  function playTrackAtOrderPosition(position) {
    if (!isSessionActive) return;
    if (position < 0 || position >= playbackOrder.length) {
      endSession();
      return;
    }
    currentOrderPosition = position;
    const nextIndex = playbackOrder[position];
    playTrack(nextIndex);
  }

  function getRequiredPlaybackDuration() {
    const baseDuration = sessionConfig.duration || 40;
    return sessionConfig.trainWithPartner ? baseDuration * 2 : baseDuration;
  }

  function startPartnerFollowUpSegment() {
    if (!isSessionActive || !sessionConfig.trainWithPartner) return;
    partnerSegmentIndex = 1;
    startRoundTimers(sessionConfig.duration, null, { skipFadeIn: true });
  }

  function startTrackTimers(trackTotalDurationSeconds = null) {
    partnerSegmentIndex = 0;
    if (sessionConfig.trainWithPartner) {
      startRoundTimers(sessionConfig.duration, trackTotalDurationSeconds, {
        skipFadeOut: true,
        scheduleNextTrack: false,
        onSegmentComplete: startPartnerFollowUpSegment,
      });
      return;
    }
    startRoundTimers(sessionConfig.duration, trackTotalDurationSeconds);
  }

  function playNextTrack() {
    if (!isSessionActive) return;
    const nextPosition = currentOrderPosition + 1;
    if (nextPosition >= playbackOrder.length) {
      endSession();
      return;
    }
    playTrackAtOrderPosition(nextPosition);
  }

  function playPreviousTrack() {
    if (!isSessionActive) return;
    const previousPosition = currentOrderPosition - 1;
    if (previousPosition < 0) return;
    playTrackAtOrderPosition(previousPosition);
  }
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
  });

  languageButtons.forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });
  setLanguage(currentLang);
  // PASO II
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
      showToast(t("toastSpotifyTokenError", { message: error.message }), "error");
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
      showToast(t("toastSpotifySaveError"), "error");
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
      showToast(
        t("toastSpotifyRefreshError", { message: error.message }),
        "error",
      );
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
      showToast(t("toastSpotifyPlayerLoadError"), "error");
      return;
    }
    try {
      if (typeof window.Spotify === "undefined" || !window.Spotify.Player) {
        console.error(
          "[Spotify Player] Error CRÍTICO: window.Spotify o window.Spotify.Player no están definidos al intentar crear Player.",
        );
        showToast(t("toastSpotifyFatalSdk"), "error");
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
          showToast(t("toastSpotifyNoId"), "error");
          document.dispatchEvent(new Event("spotifyDeviceError"));
          // Considerar desconectar aquí si esto ocurre?
          // clearSpotifyTokens();
          // showDisconnected();
        }
      });

      // --- FIN Listener 'ready' ---
      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.warn("[Spotify Player] Device no listo:", device_id);
        showToast(t("toastSpotifyPremiumError"), "error");
        spotifyDeviceId = null;
      });
      // Listeners de error
      spotifyPlayer.addListener("initialization_error", ({ message }) => {
        console.error("[Spotify Player] Error SDK init:", message);
        showToast(t("toastSpotifyInitError", { message }), "error");
      });
      spotifyPlayer.addListener("authentication_error", ({ message }) => {
        console.error("[Spotify Player] Error SDK auth:", message);
        showToast(t("toastSpotifyAuthError"), "error");
        clearSpotifyTokens();
        showDisconnected();
      });
      spotifyPlayer.addListener("account_error", ({ message }) => {
        console.error("[Spotify Player] Error SDK cuenta:", message);
        showToast(t("toastSpotifyAccountError", { message }), "error");
      });
      spotifyPlayer.addListener("playback_error", ({ message }) => {
        console.error("[Spotify Player] Error SDK playback:", message);
        showToast(t("toastSpotifyPlaybackError", { message }), "error");
        clearAllTimers();
        setTimeout(() => {
          if (isSessionActive) playNextTrack();
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
          showToast(t("toastSpotifyConnectFail"), "error");
        }
      });
    } catch (e) {
      console.error(
        "[Spotify Player] Error creando o conectando Spotify Player:",
        e,
      );
      showToast(t("toastSpotifyCreateError"), "error");
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
      showToast(t("toastSpotifyCheckError"), "error");
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
        showToast(t("toastSpotifyClientIdMissing"), "error");
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
      showToast(t("toastSpotifyConnectError"), "error");
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
        showToast(t("toastSpotifyChecking"), "info");
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
          showToast(t("toastSpotifyTokenFetchError"), "error");
          showDisconnected();
        }
      } else {
        console.error("[Spotify Auth] Falta code_verifier post-callback.");
        showToast(t("toastSpotifySecurityError"), "error");
        showDisconnected();
      }
    } else if (params.has("error")) {
      // Spotify devolvió un error
      console.error(`[Spotify Auth] Error en callback: ${params.get("error")}`);
      showToast(
        t("toastSpotifyError", { message: params.get("error") }),
        "error",
      );
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
      showToast(t("toastSpotifyNeedConnect"), "error");
      return;
    }
    let allTracks = [];
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=items(track(id,name,artists(name))),next`;
    showToast(t("toastSpotifyLoadingPlaylist"), "info");
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
        await prepareForNewPlaylist("spotify");
        playlistsBySource.spotify = allTracks;
        playlist = playlistsBySource.spotify;
        updatePlaylistUI();
        showToast(
          t("toastSpotifyLoadedPlaylist", { count: allTracks.length }),
          "success",
        );
      } else {
        showToast(t("toastSpotifyNoTracks"), "info");
      }
    } catch (error) {
      console.error("[Spotify Load] Error final:", error);
      showToast(t("toastSpotifyLoadError", { message: error.message }), "error");
      if (error.message.includes("Token expirado")) {
        clearSpotifyTokens();
        showDisconnected();
      }
    }
  }

  // --- Transferir Playback ---
  async function transferPlayback(deviceId, shouldPlay = false) {
    console.log(
      `[Spotify Play] Transfiriendo a device ID: ${deviceId} (play=${shouldPlay})`,
    );
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken || !deviceId) {
      console.error("[Spotify Play] transferPlayback: Falta token o deviceId.");
      showToast(t("toastSpotifyInternalError"), "error");
      return false;
    }
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        body: JSON.stringify({ device_ids: [deviceId], play: shouldPlay }),
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
      showToast(
        t("toastSpotifyActivateError", {
          message: error.message || t("toastSpotifyActivateDefault"),
        }),
        "error",
      );
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
    showToast(t("toastTrackUnplayable", { song: songName }), "error");
    setTimeout(() => {
      if (isSessionActive) playNextTrack();
    }, 500);
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
    clearTimeout(countdownTimeoutId);
    clearTimeout(countdownHideTimeoutId);
    clearInterval(fadeInterval);
    clearInterval(fadeInInterval);
    clearInterval(transitionGuardInterval);
    roundTimeout = null;
    gapTimeout = null;
    countdownStartTimeout = null;
    fadeOutCompletionTimeout = null;
    fadeOutTimeout = null;
    countdownTimeoutId = null;
    countdownHideTimeoutId = null;
    fadeInterval = null;
    fadeInInterval = null;
    transitionGuardInterval = null;
    pendingNextTrackAt = null;
  };
  function setCurrentPlaylistSource(source, { updateUI = true } = {}) {
    if (!playlistsBySource[source]) return;
    currentPlaylistSource = source;
    playlist = playlistsBySource[source];
    if (playlistSourceSelect && playlistSourceSelect.value !== source) {
      playlistSourceSelect.value = source;
    }
    if (updateUI) {
      updatePlaylistUI();
      updatePlaylistStatus();
    }
  }

  function inferPlaylistSource(items = []) {
    if (items.some((item) => item.type === "spotify")) return "spotify";
    if (items.some((item) => item.type === "youtube")) return "youtube";
    if (items.some((item) => item.type === "mp3")) return "mp3";
    return "spotify";
  }

  async function prepareForNewPlaylist(source = currentPlaylistSource) {
    if (isSessionActive) await endSession();
    if (source !== currentPlaylistSource) {
      setCurrentPlaylistSource(source, { updateUI: false });
    }
    playlistsBySource[source] = [];
    playlist = playlistsBySource[source];
    updatePlaylistUI();
  }

  addMp3Input.addEventListener("change", async (e) => {
    await prepareForNewPlaylist("mp3");
    showToast(t("toastMp3Saving"), "info");
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
      showToast(t("toastMp3Ready"), "success");
    } catch (error) {
      console.error("Error al guardar MP3 en IndexedDB:", error);
      showToast(t("toastMp3SaveError"), "error");
    }
  });

  addYoutubeBtn.addEventListener("click", async () => {
    const url = prompt(t("promptYoutubeUrl"));
    if (!url) return;
    await prepareForNewPlaylist("youtube");
    showToast(t("toastYoutubeLoading"), "info");
    if (YOUTUBE_API_KEY === "AQUI_VA_TU_CLAVE_DE_API" || !YOUTUBE_API_KEY) {
      showToast(t("toastYoutubeApiMissing"), "error");
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
        showToast(t("toastYoutubeInvalidUrl"), "error");
      }
      updatePlaylistUI();
      if (playlist.length > 0)
        showToast(t("toastYoutubeLoaded"), "success");
    } catch (error) {
      console.error(error);
      showToast(t("toastYoutubeLoadError"), "error");
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
  if (clearPlaylistBtn) {
    clearPlaylistBtn.addEventListener("click", () => {
      if (confirm(t("confirmClearPlaylist"))) {
        playlistsBySource[currentPlaylistSource] = [];
        playlist = playlistsBySource[currentPlaylistSource];
        updatePlaylistUI();
      }
    });
  }
  function getPlaylistDisplayOrder() {
    if (
      isSessionActive &&
      sessionConfig.order === "random" &&
      playbackOrder.length === playlist.length
    ) {
      return playbackOrder;
    }
    return playlist.map((_, index) => index);
  }
  function formatSessionTime(totalMs) {
    const totalSeconds = Math.floor(totalMs / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }
  function updateSessionTimerDisplay() {
    if (!sessionTimer) return;
    const elapsed =
      sessionStartTimestamp != null
        ? sessionElapsedMs + (Date.now() - sessionStartTimestamp)
        : sessionElapsedMs;
    sessionTimer.textContent = formatSessionTime(elapsed);
  }
  function startSessionTimer() {
    if (sessionTimerInterval) return;
    sessionStartTimestamp = Date.now();
    updateSessionTimerDisplay();
    sessionTimerInterval = setInterval(updateSessionTimerDisplay, 1000);
  }
  function stopSessionTimer() {
    if (sessionTimerInterval) {
      clearInterval(sessionTimerInterval);
      sessionTimerInterval = null;
    }
    if (sessionStartTimestamp != null) {
      sessionElapsedMs += Date.now() - sessionStartTimestamp;
      sessionStartTimestamp = null;
    }
    updateSessionTimerDisplay();
  }
  function resetSessionTimer() {
    if (sessionTimerInterval) {
      clearInterval(sessionTimerInterval);
      sessionTimerInterval = null;
    }
    sessionStartTimestamp = null;
    sessionElapsedMs = 0;
    updateSessionTimerDisplay();
  }
  function updatePlaylistStatus() {
    if (!playlistProgress) return;
    const total = playlist.length;
    let playedCount = 0;
    if (isSessionActive && total > 0 && playbackOrder.length === total) {
      playedCount = Math.min(Math.max(currentOrderPosition + 1, 0), total);
    }
    playlistProgress.textContent = `${playedCount}/${total}`;
    updateSessionTimerDisplay();
  }
  function updatePlaylistUI() {
    playlistUl.innerHTML = "";
    const displayOrder = getPlaylistDisplayOrder();
    displayOrder.forEach((songIndex) => {
      const song = playlist[songIndex];
      const li = document.createElement("li");
      li.dataset.index = songIndex;
      li.draggable = !isSessionActive;
      if (isSessionActive && songIndex === currentTrackIndex) {
        li.classList.add("is-playing");
      }
      const nameSpan = document.createElement("span");
      nameSpan.textContent = song.name;
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "✖";
      deleteBtn.className = "delete-btn";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        playlist.splice(songIndex, 1);
        updatePlaylistUI();
      };
      if (song.type !== "spotify") {
        const typeSpan = document.createElement("span");
        typeSpan.className = `track-type ${song.type}`;
        typeSpan.textContent = song.type.toUpperCase();
        li.appendChild(typeSpan);
      }
      li.appendChild(nameSpan);
      li.appendChild(deleteBtn);
      playlistUl.appendChild(li);
    });
    const buttonText = playlistUl.classList.contains("visible")
      ? t("hideList")
      : t("showList");
    togglePlaylistBtn.textContent = `${buttonText} (${playlist.length})`;
    updatePlaylistStatus();
  }
  function savePlaylist() {
    if (!playlistNameInput) return;
    const name = playlistNameInput.value.trim();
    if (!name) {
      showToast(t("toastPlaylistNameMissing"));
      return;
    }
    if (playlist.length === 0) {
      showToast(t("toastPlaylistEmpty"));
      return;
    }
    localStorage.setItem(`playlist_${name}`, JSON.stringify(playlist));
    playlistNameInput.value = "";
    showToast(t("toastPlaylistSaved", { name }), "success");
    loadSavedPlaylists();
  }
  function loadSavedPlaylists() {
    if (!savedPlaylistsSelect) return;
    savedPlaylistsSelect.innerHTML = `<option value="">${t(
      "loadPlaylistOption",
    )}</option>`;
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
    if (!savedPlaylistsSelect) return;
    const key = savedPlaylistsSelect.value;
    if (!key) return;
    const savedPlaylist = JSON.parse(localStorage.getItem(key));
    if (savedPlaylist) {
      const source = inferPlaylistSource(savedPlaylist);
      await prepareForNewPlaylist(source);
      playlistsBySource[source] = savedPlaylist;
      playlist = playlistsBySource[source];
      updatePlaylistUI();
    }
  }
  function deleteSelectedPlaylist() {
    if (!savedPlaylistsSelect) return;
    const key = savedPlaylistsSelect.value;
    if (!key) {
      showToast(t("toastPlaylistSelectToDelete"));
      return;
    }
    const playlistName = key.replace("playlist_", "");
    if (confirm(t("confirmDeletePlaylist", { name: playlistName }))) {
      localStorage.removeItem(key);
      playlistsBySource[currentPlaylistSource] = [];
      playlist = playlistsBySource[currentPlaylistSource];
      updatePlaylistUI();
      loadSavedPlaylists();
      if (isSessionActive) {
        endSession();
        showToast(t("toastSessionEnded"));
      }
    }
  }
  if (savePlaylistBtn) {
    savePlaylistBtn.addEventListener("click", savePlaylist);
  }
  if (savedPlaylistsSelect) {
    savedPlaylistsSelect.addEventListener("change", loadSelectedPlaylist);
  }
  if (deletePlaylistBtn) {
    deletePlaylistBtn.addEventListener("click", deleteSelectedPlaylist);
  }
  if (playlistSourceSelect) {
    playlistSourceSelect.addEventListener("change", (event) => {
      setCurrentPlaylistSource(event.target.value);
    });
  }
  togglePlaylistBtn.addEventListener("click", () => {
    playlistUl.classList.toggle("visible");
    const buttonText = playlistUl.classList.contains("visible")
      ? t("hideList")
      : t("showList");
    togglePlaylistBtn.textContent = `${buttonText} (${playlist.length})`;
  });

  function initializeApp() {
    endSessionBtn.style.display = "none";
    loadSavedPlaylists();
    if (playlistSourceSelect) {
      playlistSourceSelect.value = currentPlaylistSource;
    }
    updatePlaylistStatus();
  }

  const requestWakeLock = async (showNotification = true) => {
    if ("wakeLock" in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
        if (showNotification)
          showToast(t("toastWakeLock"), "info");
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    } else {
      console.log("Wake Lock no es soportado.");
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      if (isSessionActive) requestWakeLock(false);
      stopSpotifyKeepAlive();
      if (isSpotifySessionActive() && !isPaused) {
        keepSpotifyPlaybackActive("visible");
      }
    } else if (isSpotifySessionActive() && !isPaused) {
      keepSpotifyPlaybackActive("hidden");
      startSpotifyKeepAlive();
    }
  });

  startSessionBtn.addEventListener("click", () => {
    if (playlist.length === 0) {
      showToast(t("toastAddSongs"));
      return;
    }
    if (playlist.some((s) => s.type === "youtube") && !hasShownYoutubeWarning) {
      showToast(t("toastYoutubeWarning"), "info");
      hasShownYoutubeWarning = true;
    }
    requestWakeLock();
    isSessionActive = true;
    isPaused = false;
    createPlaybackOrder();
    if (playbackOrder.length === 0) {
      showToast(t("toastNoSongsAvailable"), "error");
      endSession();
      return;
    }
    currentOrderPosition = 0;
    const firstIndex = playbackOrder[0] ?? 0;
    currentTrackIndex = firstIndex;
    resetSessionTimer();
    startSessionTimer();
    playerPanel.classList.add("session-active");
    endSessionBtn.style.display = "block";
    playTrack(firstIndex);
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
    if (index == null || index >= playlist.length || !isSessionActive) {
      console.log("[App Logic] Fin de playlist o sesión inactiva.");
      await endSession();
      return;
    }

    currentTrackIndex = index;
    const orderPos = playbackOrder.indexOf(index);
    if (orderPos !== -1) currentOrderPosition = orderPos;
    partnerSegmentIndex = 0;
    currentRoundOptions = null;
    const song = playlist[index];
    updatePlaylistUI();
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

    if (song.type === "spotify" && document.visibilityState !== "visible") {
      startSpotifyKeepAlive();
    } else {
      stopSpotifyKeepAlive();
    }

    // Reproducir según tipo
    try {
      if (song.type === "mp3") {
        if (youtubePlayerContainer)
          youtubePlayerContainer.classList.remove("visible"); // Ocultar video YT
        await playMp3FromDB(song);
      } else if (song.type === "youtube") {
        if (ytPlayerReady) playYoutube(song);
        else {
          showToast(t("toastYtNotReady"), "info");
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
        showToast(t("toastUnsupportedFile", { name: song.name }), "warning");
        setTimeout(() => {
          if (isSessionActive) playNextTrack();
        }, 500); // Saltar
      }
    } catch (error) {
      console.error(`[App Logic] Error GRANDE iniciando ${song.name}:`, error);
      showToast(t("toastStartError", { name: song.name }), "error");
      clearAllTimers();
      setTimeout(() => {
        if (isSessionActive) playNextTrack();
      }, 500); // Saltar en caso de error grave
    }
  }

  function isSpotifySessionActive() {
    const currentSong = playlist[currentTrackIndex];
    return isSessionActive && currentSong?.type === "spotify";
  }

  async function keepSpotifyPlaybackActive(reason = "unknown") {
    if (!isSpotifySessionActive() || isPaused) return;
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) return;
    let playerState = null;
    if (spotifyPlayer && typeof spotifyPlayer.getCurrentState === "function") {
      try {
        playerState = await spotifyPlayer.getCurrentState();
      } catch (e) {
        console.warn("[Spotify KeepAlive] Error obteniendo estado:", e);
      }
    }
    if (playerState && !playerState.paused) {
      console.log(
        `[Spotify KeepAlive] Reproducción activa, sin intervención (${reason}).`,
      );
      return;
    }
    if (!spotifyDeviceId) {
      initializeSpotifyPlayer(accessToken);
      await waitForSpotifyDevice(3000);
    }
    if (!spotifyDeviceId) return;
    console.log(`[Spotify KeepAlive] Manteniendo reproducción (${reason}).`);
    await transferPlayback(spotifyDeviceId, true);
    if (
      spotifyPlayer &&
      typeof spotifyPlayer.resume === "function" &&
      (!playerState || playerState.paused)
    ) {
      try {
        await spotifyPlayer.resume();
      } catch (e) {
        console.warn("[Spotify KeepAlive] Error reanudando:", e);
      }
    }
  }

  function startSpotifyKeepAlive() {
    if (spotifyKeepAliveInterval) return;
    if (document.visibilityState === "visible") return;
    spotifyKeepAliveInterval = setInterval(() => {
      keepSpotifyPlaybackActive("interval");
    }, 25000);
  }

  function stopSpotifyKeepAlive() {
    if (!spotifyKeepAliveInterval) return;
    clearInterval(spotifyKeepAliveInterval);
    spotifyKeepAliveInterval = null;
  }
  async function playMp3FromDB(song) {
    try {
      const record = await db.mp3Files.get(song.dbKey);
      if (!record) {
        showToast(t("toastMp3NotFound", { name: song.name }), "error");
        setTimeout(() => {
          if (isSessionActive) playNextTrack();
        }, 500);
        return;
      }
      const fileURL = URL.createObjectURL(record.file);
      audio.preload = "auto";
      audio.src = fileURL;
      audio.load();

      audio.onloadedmetadata = () => {
        const startTime = calculateStartTime(audio.duration);
        audio.currentTime = startTime;
      };

      let hasStartedPlayback = false;
      const startPlayback = () => {
        if (hasStartedPlayback) return;
        hasStartedPlayback = true;
        fadeIn(audio);
        audio.play().catch((error) => {
          console.error(error);
          endSession();
        });
        playPauseBtn.textContent = "❚❚";
        isPaused = false;
        startTrackTimers();
      };

      audio.addEventListener("canplaythrough", startPlayback, { once: true });
      audio.addEventListener("canplay", startPlayback, { once: true });
      audio.addEventListener(
        "ended",
        () => {
          URL.revokeObjectURL(fileURL);
        },
        { once: true },
      );
    } catch (error) {
      console.error("Error al reproducir MP3 desde DB:", error);
      showToast(t("toastMp3PlayError"), "error");
    }
  }
  async function playSpotifyTrack(song) {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      showToast(t("toastSpotifyNotReady"), "error");
      console.error("[Spotify Play] playSpotifyTrack: Falta token.");
      setTimeout(() => {
        if (isSessionActive) playNextTrack();
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
        showToast(t("toastSpotifyStarting"), "error");
        setTimeout(() => {
          if (isSessionActive) playNextTrack();
        }, 1500);
        return;
      }
    }

    const deviceId = spotifyDeviceId || null;
    if (!deviceId) {
      showToast(t("toastSpotifyNoDevice"), "error");
      setTimeout(() => {
        if (isSessionActive) playNextTrack();
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
          if (isSessionActive) playNextTrack();
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
      startTrackTimers(durationMs ? durationMs / 1000 : null); // Pasar duración real a timers
    } catch (error) {
      console.error("[Spotify Play] Error GRANDE en playSpotifyTrack:", error);
      showToast(
        t("toastSpotifyPlaybackSkip", { message: error.message }),
        "error",
      );
      if (spotifyPlayer) {
        try {
          await spotifyPlayer.pause();
        } catch (e) {}
      }
      isPaused = true;
      if (playPauseBtn) playPauseBtn.textContent = "▶️";
      clearAllTimers();
      setTimeout(() => {
        if (isSessionActive) playNextTrack();
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
        startTrackTimers();
      }
    };
    ytPlayer.addEventListener("onStateChange", stateChangeHandler);
    ytPlayer.loadVideoById(song.id);
    ytPlayer.playVideo();
  }
  function calculateStartTime(totalDuration) {
    let startTime = 0;
    const effectiveDuration = getRequiredPlaybackDuration() + 4;
    if (!totalDuration || totalDuration < effectiveDuration) return 0;
    switch (sessionConfig.segment) {
      case "medio":
        startTime = totalDuration / 2 - getRequiredPlaybackDuration() / 2;
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
  function startTransitionGuard() {
    if (transitionGuardInterval) return;
    transitionGuardInterval = setInterval(() => {
      if (!isSessionActive || isPaused || pendingNextTrackAt === null) return;
      if (Date.now() >= pendingNextTrackAt) {
        console.log(
          "[App Timers] Guard de transición detectó fin del gap.",
        );
        pendingNextTrackAt = null;
        clearInterval(transitionGuardInterval);
        transitionGuardInterval = null;
        if (isSessionActive) playNextTrack();
      }
    }, 1000);
  }
  function startRoundTimers(
    durationInSeconds,
    trackTotalDurationSeconds = null,
    options = {},
  ) {
    // Añadir duración total opcional
    clearAllTimers();
    const mergedOptions = {
      skipFadeOut: false,
      skipFadeIn: false,
      scheduleNextTrack: true,
      onSegmentComplete: null,
      ...options,
    };
    currentRoundOptions = mergedOptions;
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
      if (!mergedOptions.skipFadeIn) {
        fadeIn(currentPlayer); // Llamar fadeIn con el player correcto
      }
    } else {
      console.warn(
        "[App Timers] startRoundTimers: No se pudo determinar currentPlayer para fadeIn.",
      );
    }

    roundEndTime = Date.now() + roundDurationMs;
    timeRemainingOnPause = null;
    if (mergedOptions.scheduleNextTrack) {
      pendingNextTrackAt = roundEndTime + gapDurationMs;
      startTransitionGuard();
    } else {
      pendingNextTrackAt = null;
      if (transitionGuardInterval) {
        clearInterval(transitionGuardInterval);
        transitionGuardInterval = null;
      }
    }

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
          playNextTrack();
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
      clearTimeout(countdownTimeoutId);
      countdownTimeoutId = null;

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
      clearTimeout(countdownHideTimeoutId);
      countdownHideTimeoutId = null;
      if (countdownDisplay) {
        countdownDisplay.style.display = "block";
        countdownDisplay.classList.add("final-seconds");
      }

      const runCountdownTick = (secondsLeft) => {
        if (!isSessionActive || hasStartedFadeOut) {
          countdownTimeoutId = null;
          return;
        }

        if (secondsLeft <= 0) {
          countdownTimeoutId = null;
          return;
        }

        if (countdownDisplay) countdownDisplay.textContent = secondsLeft;
        const countdownSound =
          secondsLeft === 1
            ? "sounds/beep_sporty_long.mp3"
            : "sounds/beep_sporty.mp3";
        playSound(countdownSound);

        if (secondsLeft === 1) {
          countdownTimeoutId = null;
          if (mergedOptions.skipFadeOut && mergedOptions.onSegmentComplete) {
            countdownHideTimeoutId = setTimeout(() => {
              if (countdownDisplay) {
                countdownDisplay.style.display = "none";
                countdownDisplay.classList.remove("final-seconds");
              }
              countdownHideTimeoutId = null;
            }, 1000);
            mergedOptions.onSegmentComplete();
            return;
          }
          startFadeOut();
          return;
        }

        countdownTimeoutId = setTimeout(() => {
          runCountdownTick(secondsLeft - 1);
        }, 1000);
      };

      clearTimeout(countdownTimeoutId);
      countdownTimeoutId = null;
      runCountdownTick(countdownSeconds);
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

    if (!mergedOptions.skipFadeOut) {
      roundTimeout = setTimeout(() => {
        startFadeOut();
      }, fadeOutStartTime + 50);
    }
  }
  function playSound(soundFile, volume = 1.0) {
    if (!sfxPlayer || !soundFile) return;
    try {
      sfxPlayer.pause();
      sfxPlayer.currentTime = 0;
    } catch (e) {}
    sfxPlayer.src = soundFile;
    sfxPlayer.volume = volume;
    const playPromise = sfxPlayer.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) =>
        console.warn("[App SFX] Error reproduciendo sonido:", error),
      );
    }
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
    playbackOrder = [];
    currentOrderPosition = 0;
    partnerSegmentIndex = 0;
    currentRoundOptions = null;
    stopSessionTimer();

    if (wakeLock) {
      try {
        await wakeLock.release();
        wakeLock = null;
        console.log("[App Logic] Wake Lock liberado.");
      } catch (e) {
        console.error("[App Logic] Error liberando Wake Lock:", e);
      }
    }
    stopSpotifyKeepAlive();
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
    resetSessionTimer();
    updatePlaylistUI();

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
        stopSessionTimer();

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
        stopSpotifyKeepAlive();
      } else {
        // --- REANUDAR ---
        console.log(
          `[App Controls] Reanudando. Tiempo restante guardado: ${timeRemainingOnPause}ms`,
        );
        startSessionTimer();
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
          startRoundTimers(
            timeRemainingOnPause / 1000,
            null,
            currentRoundOptions || {},
          ); // Reiniciar con tiempo restante en segundos
        } else {
          console.warn(
            "[App Controls] Reanudado sin tiempo restante válido o expirado. Iniciando track de nuevo?",
          );
          // Podrías reiniciar el track aquí si lo prefieres: playTrack(currentTrackIndex);
          // O simplemente dejar que siga (puede causar desincronización si la música avanzó externamente)
          // Por ahora, solo actualizamos el botón y el estado interno
          if (playPauseBtn) playPauseBtn.textContent = "❚❚";
        }
        if (currentPlayer === spotifyPlayer) startSpotifyKeepAlive();
        timeRemainingOnPause = null; // Resetear tiempo guardado
      }
    } catch (error) {
      console.error("[App Controls] Error en Play/Pause:", error);
      showToast(t("toastPauseError"), "error");
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
    if (isSessionActive) playNextTrack();
  });
  prevBtn.addEventListener("click", () => {
    if (isSessionActive && currentOrderPosition > 0) playPreviousTrack();
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
  if (trainPartnerNoBtn && trainPartnerYesBtn) {
    trainPartnerNoBtn.addEventListener("click", () => {
      sessionConfig.trainWithPartner = false;
      trainPartnerNoBtn.classList.add("active");
      trainPartnerYesBtn.classList.remove("active");
    });
    trainPartnerYesBtn.addEventListener("click", () => {
      sessionConfig.trainWithPartner = true;
      trainPartnerYesBtn.classList.add("active");
      trainPartnerNoBtn.classList.remove("active");
    });
  } else {
    console.warn("[App Init] Botones de entrenamiento no encontrados en el DOM.");
  }
  if (orderSequentialBtn && orderRandomBtn) {
    orderSequentialBtn.addEventListener("click", () => {
      sessionConfig.order = "sequential";
      orderSequentialBtn.classList.add("active");
      orderRandomBtn.classList.remove("active");
    });
    orderRandomBtn.addEventListener("click", () => {
      sessionConfig.order = "random";
      orderRandomBtn.classList.add("active");
      orderSequentialBtn.classList.remove("active");
    });
  } else {
    console.warn("[App Init] Botones de orden no encontrados en el DOM.");
  }
  // --- LISTENERS BOTONES SPOTIFY ---
  if (connectSpotifyBtn) {
    connectSpotifyBtn.addEventListener("click", redirectToSpotifyAuthorize);
  } else {
    console.error("[App Init] connectSpotifyBtn no encontrado en HTML.");
  }

  if (disconnectSpotifyBtn) {
    disconnectSpotifyBtn.addEventListener("click", () => {
      if (confirm(t("confirmDisconnectSpotify"))) {
        clearSpotifyTokens(); // Borrar tokens guardados
        showDisconnected(); // Actualizar UI y desconectar player
        showToast(t("toastSpotifyDisconnected"), "info");
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
        showToast(t("toastSpotifyConnectFirst"), "info");
        return;
      } // Verificar conexión
      const url = prompt(t("promptSpotifyPlaylist"));
      if (!url) return; // Si cancela
      const playlistId = extractSpotifyPlaylistID(url);
      if (playlistId) {
        await loadSpotifyPlaylist(playlistId); // Llamar a la función de carga
      } else {
        showToast(t("toastSpotifyInvalidPlaylist"), "error");
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
