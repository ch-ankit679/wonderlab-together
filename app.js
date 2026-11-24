(() => {
  'use strict';

  const chapters = (window.WONDERLAB_CHAPTERS || []).filter(ch => ['cells', 'materials'].includes(ch.id) && Array.isArray(ch.missions) && ch.missions.length);
  const paths = window.WONDERLAB_LEARNING_PATHS || {};
  const $ = id => document.getElementById(id);
  const screenIds = ['homeScreen', 'setupScreen', 'sessionScreen', 'reportScreen'];
  const defaultNames = ['Team Sun', 'Team Moon', 'Team Leaf', 'Team Star'];
  const state = {
    selectedChapterId: null,
    duration: 40,
    teamCount: 3,
    teamNames: [...defaultNames],
    session: null,
    clockInterval: null,
    toastTimer: null,
    voice: { autoRead: true, rate: 0.94, voiceURI: '', lastText: '', lastReadAlongTargets: [], supported: false }
  };

  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const art = (file, cls = '') => `<img class="${escapeHTML(cls)}" src="assets/art/${escapeHTML(file)}" alt="" loading="lazy">`;
  const chapterById = id => chapters.find(ch => ch.id === id);
  const pathById = id => paths[id];
  const chapter = () => state.session ? chapterById(state.session.chapterId) : null;
  const learningPath = () => state.session ? pathById(state.session.chapterId) : null;
  const teamById = id => state.session?.teams.find(team => team.id === id);
  const activeLesson = () => learningPath()?.lessons[state.session.lessonIndex];
  const teamForLesson = index => state.session.teams[index % state.session.teams.length];
  const quizQuestion = () => learningPath()?.quiz[state.session.quiz.questionIndex];
  const teamForQuestion = index => state.session.teams[index % state.session.teams.length];

  function showScreen(id) {
    screenIds.forEach(screenId => $(screenId).classList.toggle('hidden', screenId !== id));
    document.body.classList.toggle('assistant-visible', id === 'sessionScreen' || id === 'reportScreen');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function scrollToStageTop() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  }

  function toast(message) {
    const node = $('toast');
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => node.classList.remove('show'), 2600);
  }

  function renderTopics() {
    $('topicGrid').innerHTML = chapters.map((item, index) => {
      const path = pathById(item.id);
      const image = item.id === 'cells' ? 'animal-cell-3d.webp' : 'materials-lab-3d.svg';
      const tint = item.id === 'cells' ? 'topic-green' : 'topic-purple';
      return `<article class="topic-card ${tint}">
        <div class="topic-card-art">${art(image, 'topic-illustration')}<span class="topic-index">LEARNING WORLD 0${index + 1}</span><span class="topic-count">${path.lessons.length} interactive lessons · ${path.quiz.length} challenge questions</span></div>
        <div class="topic-card-copy"><span class="topic-kicker">${item.id === 'cells' ? 'LIFE SCIENCE' : 'MATERIAL SCIENCE'}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(path.tagline)}</p>
        <div class="topic-card-foot"><span>${art('pip.svg', 'mini-pip')} Learn · explore · play</span><button class="button button-card" data-start-topic="${item.id}" type="button">Explore this chapter <span>→</span></button></div></div>
      </article>`;
    }).join('');
  }

  function renderTeamNameInputs() {
    $('teamNameInputs').innerHTML = Array.from({length:state.teamCount}, (_, index) =>
      `<label class="team-name-field"><span class="team-colour team-colour-${index + 1}"></span><input type="text" maxlength="22" data-team-name="${index}" value="${escapeHTML(state.teamNames[index] || defaultNames[index])}" aria-label="Team ${index + 1} name"></label>`
    ).join('');
  }

  function chooseTopic(chapterId) {
    const item = chapterById(chapterId);
    const path = pathById(chapterId);
    if (!item || !path || path.lessons.length !== 6 || path.quiz.length < 10) return;
    state.selectedChapterId = chapterId;
    $('selectedTopicPreview').innerHTML = `${art(chapterId === 'cells' ? 'animal-cell-3d.webp' : 'materials-lab-3d.svg', 'selected-topic-art')}<div><span class="topic-kicker">COMPLETE CHAPTER JOURNEY</span><b>${escapeHTML(item.title)}</b><small>${path.lessons.length} learning adventures · ${path.quiz.length} team challenge questions</small></div>`;
    $('setupChapterSummary').textContent = `${path.lessons.length} interactive lessons + a ${path.quiz.length}-question team challenge`;
    renderTeamNameInputs();
    showScreen('setupScreen');
  }

  function startSession() {
    const item = chapterById(state.selectedChapterId);
    const path = pathById(state.selectedChapterId);
    if (!item || !path) return;
    const teams = Array.from({length:state.teamCount}, (_, index) => ({
      id: `team-${index + 1}`,
      name: (state.teamNames[index] || defaultNames[index]).trim() || defaultNames[index],
      points: 0,
      learningStars: 0,
      quizCorrect: 0,
      reasoningStars: 0,
      hintsRemaining: 2
    }));
    state.session = {
      id: `WL-${Date.now().toString(36).toUpperCase()}`,
      chapterId: item.id,
      chapterTitle: item.title,
      duration: state.duration,
      teams,
      startedAt: new Date().toISOString(),
      endedAt: null,
      secondsLeft: state.duration * 60,
      elapsedSeconds: 0,
      phase: 'warmup',
      lessonIndex: 0,
      lessonResults: {},
      quiz: { questionIndex: 0, selectedOption: null, locked: false, hintShown: false, answerHistory: [], awardedReason: false },
    };
    clearInterval(state.clockInterval);
    $('sessionChapterName').textContent = item.title;
    showScreen('sessionScreen');
    renderWarmup();
    startClassClock();
  }

  function startClassClock() {
    clearInterval(state.clockInterval);
    updateClassClock();
    state.clockInterval = setInterval(() => {
      if (!state.session || state.session.endedAt) return;
      state.session.secondsLeft = Math.max(0, state.session.secondsLeft - 1);
      state.session.elapsedSeconds = state.session.duration * 60 - state.session.secondsLeft;
      updateClassClock();
      if (state.session.secondsLeft === 0) {
        clearInterval(state.clockInterval);
        toast('Your planned class time is up. Finish the learning journey when the discussion is complete.');
      }
    }, 1000);
  }

  function updateClassClock() {
    if (!state.session) return;
    const seconds = state.session.secondsLeft;
    $('sessionClock').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    $('sessionClock').classList.toggle('clock-low', seconds <= 300);
  }

  function updateProgress(label, count, percent) {
    $('sessionProgressLabel').textContent = label;
    $('sessionProgressCount').textContent = count;
    $('sessionProgressBar').style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }

  function renderWarmup() {
    const item = chapter();
    const path = learningPath();
    const opening = path.opening;
    state.session.phase = 'warmup';
    updateProgress('YOUR CHAPTER QUEST', '6 LEARNING ADVENTURES', 4);
    const route = path.lessons.map((lesson, index) => `<div class="journey-stop"><span>${String(index + 1).padStart(2,'0')}</span><div><b>${escapeHTML(lesson.title)}</b><small>${escapeHTML(lesson.goal)}</small></div></div>`).join('');
    $('sessionContent').innerHTML = `<div class="welcome-layout student-welcome">
      <section class="welcome-main">
        <div class="welcome-kicker"><span class="live-dot"></span> YOUR SCIENCE ADVENTURE STARTS HERE</div>
        <div class="welcome-heading-row"><div><span class="round-kicker">${escapeHTML(item.title)}</span><h1>${escapeHTML(opening.title)}</h1></div>${art(item.id === 'cells' ? 'animal-cell-3d.webp' : 'materials-lab-3d.svg','welcome-art')}</div>
        <p class="welcome-prompt">${escapeHTML(opening.prompt)}</p>
        <div class="student-warmup-card student-warmup-main"><span class="warmup-icon"><img src="assets/art/pip.svg" alt=""/></span><div><b>First, think and share</b><p>${escapeHTML(opening.studentMove)}</p></div><span class="time-pill">2 MIN</span></div>
        <button id="beginLearningBtn" class="button button-primary button-big" type="button">Let’s explore lesson 1 <span>→</span></button>
      </section>
      <aside class="journey-panel"><div class="journey-panel-head"><div><span class="round-kicker">YOUR ADVENTURE MAP</span><h2>Six discoveries ahead</h2><p>Learn each idea, explore a moving science model, then test what you know.</p></div><span class="journey-total">6<span>LESSONS</span></span></div><div class="journey-list">${route}</div><div class="journey-quiz-note">${art('trophy.svg','journey-trophy')}<div><b>Final stop: Wonder League</b><small>${path.quiz.length} questions · team turns · helpful clues</small></div></div></aside>
    </div>`;
    $('beginLearningBtn').addEventListener('click', () => startLesson(0));
    scrollToStageTop();
    const welcomeNarration = ['YOUR SCIENCE ADVENTURE STARTS HERE.', item.title, opening.title, opening.prompt, 'First, think and share.', opening.studentMove, 'Let’s explore lesson 1.'].join(' ');
    speakAssistant(welcomeNarration, 'Pip is welcoming the class', { readAlongTargets: ['.welcome-main .welcome-kicker', '.welcome-main .welcome-heading-row .round-kicker', '.welcome-main .welcome-heading-row h1', '.welcome-main .welcome-prompt', '.student-warmup-card b', '.student-warmup-card p', '#beginLearningBtn'] });
  }

  function plannedLessonMinutes(lesson) {
    const lessons = learningPath().lessons;
    const baseTotal = lessons.reduce((sum, item) => sum + item.minutes, 0);
    const quizBudget = state.session.duration <= 30 ? 7 : state.session.duration <= 40 ? 10 : 12;
    const lessonBudget = Math.max(12, state.session.duration - 2 - quizBudget);
    return Math.max(2, Math.round(lesson.minutes * lessonBudget / baseTotal));
  }

  function startLesson(index) {
    stopNarration();
    const path = learningPath();
    if (index >= path.lessons.length) return renderQuizIntro();
    if (index < 0) return;
    state.session.phase = 'lesson';
    state.session.lessonIndex = index;
    renderLesson();
  }

  function lessonData(lesson) {
    const result = state.session.lessonResults[lesson.id] || { attempts: 0, selected: null, checked: false, correct: false, completed: false, ledBy: null };
    state.session.lessonResults[lesson.id] = result;
    return result;
  }

  function renderLesson({ announce = true, scroll = true } = {}) {
    const path = learningPath();
    const lesson = activeLesson();
    const index = state.session.lessonIndex;
    const result = lessonData(lesson);
    const captain = teamForLesson(index);
    result.ledBy = result.ledBy || captain.id;
    updateProgress(`LESSON ${index + 1}`, `${index + 1} OF ${path.lessons.length}`, 7 + ((index + 1) / (path.lessons.length + 1)) * 70);
    const route = path.lessons.map((item, i) => {
      const done = !!state.session.lessonResults[item.id]?.completed;
      const current = i === index;
      return `<button type="button" class="lesson-route-step ${done ? 'done' : ''} ${current ? 'current' : ''}" data-lesson-jump="${i}" aria-label="${escapeHTML(`Lesson ${i + 1}: ${item.title}`)}" title="${escapeHTML(item.title)}" ${i > index || !done && !current ? 'disabled' : ''}><span>${done ? '✓' : String(i + 1)}</span><b>${escapeHTML(item.title)}</b></button>`;
    }).join('');
    const check = lesson.check;
    const options = check.options.map(([id, label]) => `<button type="button" class="concept-option ${result.selected === id ? 'selected' : ''} ${result.checked && id === check.answer ? 'is-answer' : ''}" data-check-option="${id}" ${result.checked ? 'disabled' : ''}><span class="option-letter">${id.toUpperCase()}</span><span>${escapeHTML(label)}</span><i>${result.checked && id === check.answer ? '✓' : result.selected === id ? '●' : ''}</i></button>`).join('');
    const feedback = result.checked ? `<div class="concept-feedback ${result.correct ? 'feedback-correct' : 'feedback-review'}"><div class="feedback-icon">${result.correct ? '✓' : '↗'}</div><div><b>${result.correct ? 'You unlocked this idea!' : 'Good try. Here is the science behind it.'}</b><p>${escapeHTML(check.explanation)}</p>${!result.correct ? `<small>Best answer: ${escapeHTML(check.options.find(option => option[0] === check.answer)?.[1] || '')}</small>` : ''}</div></div>` : '';
    const action = result.checked
      ? (result.correct
        ? `<button class="button button-primary" id="lessonContinueBtn" type="button">${index === path.lessons.length - 1 ? 'Go to Wonder League' : 'Next discovery'} <span>→</span></button>`
        : `<button class="button button-primary" id="lessonRetryBtn" type="button">Try the question again <span>↻</span></button>`)
      : `<button class="button button-primary" id="lessonCheckBtn" type="button" ${result.selected ? '' : 'disabled'}>Check my answer <span>✓</span></button>`;
    const vocabulary = lesson.vocabulary.map(item => `<span class="vocab-chip"><b>${escapeHTML(item.term)}</b><small>${escapeHTML(item.definition)}</small></span>`).join('');

    $('sessionContent').innerHTML = `<div class="lesson-page">
      <nav class="lesson-progress-nav" aria-label="Chapter lessons"><div class="lesson-progress-label"><span>YOUR JOURNEY</span><b>${index + 1} <i>/ 6</i></b></div><div class="lesson-route-list">${route}</div></nav>
      <main class="lesson-main">
        <header class="lesson-hero"><div class="lesson-hero-copy"><span class="round-kicker">DISCOVERY ${String(index + 1).padStart(2,'0')} · ${escapeHTML(lesson.kicker.replace(/^LESSON\s*\d+\s*·\s*/i,''))}</span><h1>${escapeHTML(lesson.title)}</h1><p>${escapeHTML(lesson.hook)}</p><div class="lesson-meta-row"><span>✨ You’ll discover: ${escapeHTML(lesson.goal.charAt(0).toLowerCase() + lesson.goal.slice(1))}</span><span>⏱ ${plannedLessonMinutes(lesson)} MIN</span></div></div><div class="lesson-hero-art">${art(lesson.art,'lesson-art-image')}<span class="lesson-art-orbit orbit-a"></span><span class="lesson-art-orbit orbit-b"></span></div></header>
        <section class="learning-card"><div class="learning-card-head"><span class="concept-icon"><img src="assets/art/microscope.svg" alt=""/></span><div><span class="mini-label">THE BIG IDEA</span><h2>Here’s what’s happening</h2></div></div><div class="learning-points">${lesson.explain.map((point,i)=>`<article><span>${String(i + 1).padStart(2,'0')}</span><p>${escapeHTML(point)}</p></article>`).join('')}</div>
          <details class="vocabulary-details"><summary>Key words <span>${lesson.vocabulary.length} to discover</span></summary><div class="vocabulary-row"><div>${vocabulary}</div></div></details>
          <div class="real-world-example"><span><img src="assets/art/world-icon.svg" alt=""/></span><div><b>${escapeHTML(lesson.exampleTitle)}</b><p>${escapeHTML(lesson.example)}</p></div></div>
          <div class="remember-strip"><span>✦ Remember</span><p>${escapeHTML(lesson.remember)}</p></div>
        </section>
        <section class="student-mission-card"><div class="student-mission-heading"><span class="mission-icon"><img src="assets/art/pip.svg" alt=""/></span><div><span class="mini-label">YOUR MISSION</span><h2>Try the idea yourself</h2></div></div><p>${escapeHTML(lesson.studentTask)}</p><div class="student-thinking-question"><span>THINK ABOUT THIS</span><b>${escapeHTML(lesson.studentQuestion)}</b></div></section>
        ${renderMultimediaLab(lesson)}
        <section class="lab-checkpoint" aria-label="Next step in your discovery">
          <div class="lab-checkpoint-copy">
            <span class="lab-checkpoint-kicker">NEXT IN YOUR JOURNEY</span>
            <h3>Quick Concept Check</h3>
            <p>When your team is ready, Pip will read the question and answer choices aloud.</p>
          </div>
          <div class="lab-checkpoint-route" aria-label="Step 1: Explore the lab. Step 2: Quick Concept Check.">
            <span class="lab-route-step is-current"><i>01</i><b>Explore</b></span>
            <span class="lab-route-line" aria-hidden="true"></span>
            <span class="lab-route-step is-next"><i>02</i><b>Check</b></span>
          </div>
          <button class="lab-checkpoint-action" id="startConceptCheckBtn" type="button" aria-label="Continue to Quick Concept Check"><span>Continue</span><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3.5 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </section>
        <section class="concept-check-card" id="quickConceptCheckCard"><div class="check-card-top"><div><span class="mini-label">QUICK CONCEPT CHECK</span><h2>Show what you’ve learned</h2><p>Take a moment. Think it through before you choose.</p></div><div class="lesson-captain"><span class="team-colour team-colour-${state.session.teams.indexOf(captain) + 1}"></span><div><small>TEAM TURN</small><b>${escapeHTML(captain.name)}</b></div></div></div>
          <p class="check-question">${escapeHTML(check.question)}</p><div class="concept-options">${options}</div>${feedback}<div class="check-actions">${action}</div>
        </section>
      </main>
    </div>`;
    bindLessonControls(lesson, result);
    if (scroll) scrollToStageTop();
    if (announce) {
      const vocabularyDetails = $('sessionContent').querySelector('.vocabulary-details');
      if (vocabularyDetails) vocabularyDetails.open = true;
      speakAssistant(lessonNarrationText(lesson, index), `Pip is teaching lesson ${index + 1}`, { readAlongTargets: ['.lesson-hero-copy .round-kicker', '.lesson-hero-copy h1', '.lesson-hero-copy p', '.lesson-meta-row', '.learning-card-head', '.learning-points p', '.vocabulary-details summary', '.vocabulary-row', '.real-world-example', '.remember-strip', '.student-mission-card', '.multimedia-head'] });
    }
  }

  let narrationUtterance = null;
  let narrationToken = 0;
  let narrationSession = null;
  let readAlongActiveWord = null;
  let readAlongRoot = null;
  // Read-along matching is intentionally scoped to the exact on-screen content
  // Pip is reading. No elapsed-time estimate is used: only native word-boundary
  // events may move the highlight, preventing guessed timing and word drift.
  function activeReadAlongRoot() {
    const sessionScreen = $('sessionScreen');
    if (sessionScreen && !sessionScreen.classList.contains('hidden')) return $('sessionContent');
    const reportScreen = $('reportScreen');
    if (reportScreen && !reportScreen.classList.contains('hidden')) return $('reportContent');
    return null;
  }
  function normaliseReadAlongWord(word) {
    return String(word || '').normalize('NFKC').toLocaleLowerCase().replace(/[’‘]/g, "'");
  }
  function unwrapReadAlongWords(root) {
    if (!root) return;
    root.querySelectorAll('.read-along-word').forEach(span => {
      span.replaceWith(document.createTextNode(span.textContent || ''));
    });
    root.normalize();
  }
  function clearReadAlongHighlight({ restore = false } = {}) {
    if (readAlongActiveWord?.isConnected) readAlongActiveWord.classList.remove('is-speaking');
    readAlongActiveWord = null;
    if (restore) {
      unwrapReadAlongWords(readAlongRoot || activeReadAlongRoot());
      readAlongRoot = null;
    }
  }
  function shouldWrapReadAlongText(node) {
    const parent = node.parentElement;
    if (!parent || !node.nodeValue || !/[\p{L}\p{N}]/u.test(node.nodeValue)) return false;
    if (!parent.isConnected || parent.closest('script,style,noscript,svg,input,textarea,select,option,[aria-hidden="true"],.assistant-dock,.lesson-progress-nav,.lab-voicebar,.lab-checkpoint-route')) return false;
    if (parent.closest('details:not([open])') && !parent.closest('summary')) return false;
    if (!parent.getClientRects().length) return false;
    return true;
  }
  function buildReadAlongMap(spokenText, targetSelectors = []) {
    clearReadAlongHighlight({ restore: true });
    const root = activeReadAlongRoot();
    if (!root || !Array.isArray(targetSelectors) || !targetSelectors.length) return null;
    readAlongRoot = root;

    const selected = [];
    targetSelectors.forEach(selector => {
      try { root.querySelectorAll(selector).forEach(element => selected.push(element)); }
      catch (error) { console.warn('Read-along selector skipped:', selector, error); }
    });
    const unique = [...new Set(selected)];
    // If a parent and its child were both selected, traverse the parent once.
    const targets = unique.filter(element => !unique.some(other => other !== element && other.contains(element))).sort((a, b) => {
      const position = a.compareDocumentPosition(b);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    if (!targets.length) { readAlongRoot = null; return null; }

    const screenWords = [];
    const wordPattern = /[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu;
    const textNodes = [];
    targets.forEach(target => {
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (shouldWrapReadAlongText(node)) textNodes.push(node);
      }
    });

    textNodes.forEach(textNode => {
      const value = textNode.nodeValue || '';
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      for (const match of value.matchAll(wordPattern)) {
        const tokenStart = match.index;
        if (tokenStart > cursor) fragment.appendChild(document.createTextNode(value.slice(cursor, tokenStart)));
        const span = document.createElement('span');
        span.className = 'read-along-word';
        span.textContent = match[0];
        fragment.appendChild(span);
        screenWords.push({ word: normaliseReadAlongWord(match[0]), element: span });
        cursor = tokenStart + match[0].length;
      }
      if (cursor < value.length) fragment.appendChild(document.createTextNode(value.slice(cursor)));
      if (fragment.childNodes.length) textNode.replaceWith(fragment);
    });

    const speechWords = [];
    for (const match of spokenText.matchAll(wordPattern)) {
      speechWords.push({ word: normaliseReadAlongWord(match[0]), start: match.index, end: match.index + match[0].length });
    }
    const n = speechWords.length;
    const m = screenWords.length;
    const tokenMap = new Int32Array(n);
    tokenMap.fill(-1);

    // Align only the selected read-along content, not the entire page. LCS keeps
    // repeated short words in reading order and leaves unrendered spoken words unmapped.
    if (n && m && n * m <= 1200000) {
      const cols = m + 1;
      const dp = new Uint16Array((n + 1) * cols);
      for (let i = n - 1; i >= 0; i--) {
        const row = i * cols;
        const next = (i + 1) * cols;
        for (let j = m - 1; j >= 0; j--) {
          dp[row + j] = speechWords[i].word === screenWords[j].word
            ? 1 + dp[next + j + 1]
            : Math.max(dp[next + j], dp[row + j + 1]);
        }
      }
      let i = 0, j = 0;
      while (i < n && j < m) {
        if (speechWords[i].word === screenWords[j].word) {
          tokenMap[i] = j; i++; j++;
        } else if (dp[(i + 1) * cols + j] >= dp[i * cols + j + 1]) i++;
        else j++;
      }
    } else if (n && m) {
      // Long-content fallback is deterministic and forward-only; it never estimates time.
      let cursor = 0;
      for (let i = 0; i < n; i++) {
        let found = -1;
        for (let j = cursor; j < m; j++) {
          if (speechWords[i].word === screenWords[j].word) { found = j; break; }
        }
        if (found >= 0) { tokenMap[i] = found; cursor = found + 1; }
      }
    }

    const matched = tokenMap.reduce((count, value) => count + (value >= 0 ? 1 : 0), 0);
    // A weak match is more harmful than no highlight: leave it off rather than
    // placing focus on an unrelated repeated word.
    if (!matched) {
      unwrapReadAlongWords(root);
      readAlongRoot = null;
      return null;
    }
    return { root, speechWords, screenWords, tokenMap };
  }
  function updateReadAlongAtChar(session, charIndex) {
    const map = session?.readAlongMap;
    if (!map || !map.root?.isConnected || !map.speechWords.length || !Number.isFinite(charIndex)) return;
    let low = 0, high = map.speechWords.length - 1, found = -1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (map.speechWords[mid].end <= charIndex) low = mid + 1;
      else { found = mid; high = mid - 1; }
    }
    const screenIndex = found >= 0 ? map.tokenMap[found] : -1;
    const nextWord = screenIndex >= 0 ? map.screenWords[screenIndex]?.element : null;
    if (readAlongActiveWord === nextWord) return;
    if (readAlongActiveWord?.isConnected) readAlongActiveWord.classList.remove('is-speaking');
    readAlongActiveWord = nextWord?.isConnected ? nextWord : null;
    if (readAlongActiveWord) readAlongActiveWord.classList.add('is-speaking');
  }
  function setAssistantStatus(message) { const node = $('assistantStatus'); if (node) node.textContent = message; }
  function browserVoices() { return state.voice.supported ? window.speechSynthesis.getVoices() : []; }
  function refreshVoiceChoices() {
    const select = $('assistantVoiceSelect');
    if (!select || !state.voice.supported) return;
    const allVoices = browserVoices();
    const voices = allVoices.filter(v => /^en([_-]|$)/i.test(v.lang));
    const availableVoices = voices.length ? voices : allVoices;
    const previous = state.voice.voiceURI;
    select.innerHTML = '<option value="">Automatic English voice</option>' + availableVoices.map(v => `<option value="${escapeHTML(v.voiceURI)}">${escapeHTML(v.name)} · ${escapeHTML(v.lang)}</option>`).join('');
    const preferred = voices.find(v => /en-IN/i.test(v.lang)) || voices.find(v => /en-GB/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
    state.voice.voiceURI = availableVoices.some(v => v.voiceURI === previous) ? previous : (preferred?.voiceURI || '');
    select.value = state.voice.voiceURI;
  }
  function stopNarration() {
    narrationToken += 1;
    if (narrationSession?.nextTimer) clearTimeout(narrationSession.nextTimer);
    if (narrationSession) { narrationSession.active = false; narrationSession.paused = false; }
    clearReadAlongHighlight({ restore: true });
    narrationSession = null;
    narrationUtterance = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    state.voice.paused = false;
    const pause = $('assistantPauseBtn');
    if (pause) pause.textContent = 'Ⅱ Pause';
  }
  function splitSpeechIntoChunks(text, maxLength = 220) {
    // Keep each chunk as an exact slice of the original narration and retain
    // its source offset. Reconstructing offsets with indexOf() is unsafe when
    // sentence punctuation is repeated or normalized at a chunk boundary.
    const chunks = [];
    let cursor = 0;
    while (cursor < text.length) {
      while (cursor < text.length && /\s/.test(text[cursor])) cursor++;
      if (cursor >= text.length) break;
      if (text.length - cursor <= maxLength) {
        chunks.push({ text: text.slice(cursor), start: cursor });
        break;
      }

      const limit = Math.min(text.length, cursor + maxLength);
      const windowText = text.slice(cursor, limit + 1);
      let cut = -1;
      let match;
      const sentenceBoundary = /[.!?]+(?=\s|$)/g;
      while ((match = sentenceBoundary.exec(windowText))) cut = cursor + match.index + match[0].length;

      if (cut < 0) {
        const clauseBoundary = /[,;:](?=\s|$)/g;
        while ((match = clauseBoundary.exec(windowText))) cut = cursor + match.index + match[0].length;
      }
      if (cut < 0) {
        const lastSpace = text.lastIndexOf(' ', limit);
        cut = lastSpace > cursor ? lastSpace : limit;
      }
      if (cut <= cursor) cut = Math.min(text.length, cursor + maxLength);
      chunks.push({ text: text.slice(cursor, cut), start: cursor });
      cursor = cut;
    }
    return chunks;
  }
  function speakNarrationChunk(session, chunkIndex, offset = 0) {
    if (!session || session !== narrationSession || session.token !== narrationToken || !session.active) return;
    if (chunkIndex >= session.chunks.length) {
      session.active = false;
      session.paused = false;
      session.currentChunkIndex = -1;
      session.currentChunk = '';
      narrationUtterance = null;
      clearReadAlongHighlight({ restore: true });
      state.voice.paused = false;
      const pauseButton = $('assistantPauseBtn');
      if (pauseButton) pauseButton.textContent = 'Ⅱ Pause';
      setAssistantStatus('Finished speaking. Select Replay to hear that stage again.');
      return;
    }

    const chunkEntry = session.chunks[chunkIndex];
    const chunk = chunkEntry.text;
    let safeOffset = Math.max(0, Math.min(chunk.length, offset || 0));
    // Boundary events normally point to a word start. If a browser reports a
    // position inside a word, resume from that word rather than cutting it in half.
    while (safeOffset > 0 && safeOffset < chunk.length && /\S/.test(chunk[safeOffset - 1]) && /\S/.test(chunk[safeOffset])) safeOffset -= 1;
    session.currentChunkIndex = chunkIndex;
    session.currentChunk = chunk;
    session.currentOffset = safeOffset;
    session.lastCharIndex = safeOffset;
    session.currentChunkStartedAt = performance.now();
    session.boundarySeen = false;
    session.nextChunkIndex = chunkIndex + 1;

    const utterance = new SpeechSynthesisUtterance(chunk.slice(safeOffset));
    const voices = browserVoices();
    const chosen = voices.find(v => v.voiceURI === state.voice.voiceURI) || voices.find(v => /en-IN/i.test(v.lang)) || voices.find(v => /en-GB/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
    if (chosen) { utterance.voice = chosen; utterance.lang = chosen.lang; }
    else utterance.lang = 'en-IN';
    utterance.rate = state.voice.rate;
    utterance.pitch = 1.02;
    narrationUtterance = utterance;

    utterance.onstart = () => {
      if (session !== narrationSession || session.token !== narrationToken) return;
      setAssistantStatus(session.status);
      if (session.resumePaused) {
        session.resumePaused = false;
        session.paused = true;
        state.voice.paused = true;
        window.speechSynthesis.pause();
        const pauseButton = $('assistantPauseBtn');
        if (pauseButton) pauseButton.textContent = '▶ Resume';
      }
    };
    utterance.onboundary = event => {
      if (session !== narrationSession || session.token !== narrationToken || session.paused) return;
      // Ignore sentence/phoneme/unknown events. A guessed or sentence-level
      // position can never identify the currently spoken word reliably.
      if (event.name !== 'word' || !Number.isFinite(event.charIndex) || event.charIndex < 0) return;
      const nextCharIndex = Math.min(chunk.length, safeOffset + Math.max(0, event.charIndex));
      if (nextCharIndex < session.lastCharIndex) return; // ignore stale/out-of-order callbacks
      session.lastCharIndex = nextCharIndex;
      session.boundarySeen = true;
      updateReadAlongAtChar(session, (session.chunkStartOffsets?.[chunkIndex] || 0) + session.lastCharIndex);
    };
    utterance.onend = () => {
      if (session !== narrationSession || session.token !== narrationToken) return;
      clearReadAlongHighlight();
      narrationUtterance = null;
      session.currentChunkIndex = -1;
      session.currentChunk = '';
      session.lastCharIndex = 0;
      session.nextTimer = window.setTimeout(() => {
        session.nextTimer = null;
        speakNarrationChunk(session, session.nextChunkIndex, 0);
      }, 45);
    };
    utterance.onerror = event => {
      if (session !== narrationSession || session.token !== narrationToken || ['canceled','interrupted'].includes(event.error)) return;
      session.active = false;
      narrationUtterance = null;
      clearReadAlongHighlight({ restore: true });
      state.voice.paused = false;
      setAssistantStatus('The device voice stopped. Select Replay to try the current stage again.');
    };
    window.speechSynthesis.speak(utterance);
  }
  function speakAssistant(text, status = 'Pip is speaking', options = {}) {
    const force = !!options.force;
    const readAlongTargets = Array.isArray(options.readAlongTargets)
      ? options.readAlongTargets
      : (state.voice.lastReadAlongTargets || []);
    state.voice.lastReadAlongTargets = [...readAlongTargets];
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    state.voice.lastText = clean;
    const shouldSpeak = state.voice.autoRead || force;
    clearReadAlongHighlight({ restore: true });
    narrationToken += 1;
    if (narrationSession?.nextTimer) clearTimeout(narrationSession.nextTimer);
    if (narrationSession) narrationSession.active = false;
    narrationSession = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    narrationUtterance = null;
    state.voice.paused = false;
    const pauseButton = $('assistantPauseBtn');
    if (pauseButton) pauseButton.textContent = 'Ⅱ Pause';
    if (!shouldSpeak) { setAssistantStatus('Auto-read is off. Select Replay whenever the class wants to hear this stage again.'); return; }
    if (!state.voice.supported) { setAssistantStatus('Voice is unavailable in this browser. The complete lesson remains visible on screen.'); return; }

    const chunks = splitSpeechIntoChunks(clean);
    const session = {
      token: narrationToken,
      text: clean,
      chunks,
      chunkStartOffsets: chunks.map(chunk => chunk.start),
      readAlongMap: buildReadAlongMap(clean, readAlongTargets),
      nextChunkIndex: 0,
      currentChunkIndex: -1,
      currentChunk: '',
      currentOffset: 0,
      lastCharIndex: 0,
      status,
      active: true,
      paused: false,
      resumePaused: false,
      nextTimer: null
    };
    narrationSession = session;
    setAssistantStatus(status);
    speakNarrationChunk(session, 0, 0);
  }
  function restartNarrationAtCurrentPosition() {
    const current = narrationSession;
    if (!current?.active || !state.voice.supported) return;
    const synth = window.speechSynthesis;
    const hasPendingSpeech = !!narrationUtterance || !!current.nextTimer || synth.speaking || synth.paused;
    if (!hasPendingSpeech) return;

    const wasPaused = current.paused || synth.paused;
    const chunkIndex = current.currentChunkIndex >= 0 ? current.currentChunkIndex : current.nextChunkIndex;
    let offset = current.currentChunkIndex >= 0 ? current.lastCharIndex : 0;
    // Resume from the last confirmed word boundary. Without native boundary data,
    // retain the current word rather than guessing progress from elapsed time.
    if (current.nextTimer) clearTimeout(current.nextTimer);
    current.active = false;
    narrationToken += 1;
    synth.cancel();
    narrationUtterance = null;

    const resumed = {
      ...current,
      token: narrationToken,
      nextChunkIndex: chunkIndex,
      currentChunkIndex: -1,
      currentChunk: '',
      currentOffset: 0,
      lastCharIndex: 0,
      active: true,
      paused: false,
      resumePaused: wasPaused,
      nextTimer: null
    };
    narrationSession = resumed;
    speakNarrationChunk(resumed, chunkIndex, offset);
  }
  function lessonNarrationText(lesson, index) {
    const vocabulary = (lesson.vocabulary || []).map(v => `${v.term}: ${v.definition}`).join('. ');
    return [`Discovery ${String(index + 1).padStart(2, '0')}: ${lesson.title}.`,lesson.hook,`You’ll discover: ${lesson.goal}.`,'The big idea. Here’s what’s happening.',...lesson.explain,`Key words: ${vocabulary}.`,`${lesson.exampleTitle}. ${lesson.example}.`,`Remember: ${lesson.remember}.`,'Your mission. Try the idea yourself.',lesson.studentTask,'Think about this.',lesson.studentQuestion,'Watch, explore, experiment. Step inside the science lab. Make a prediction, move the controls and watch the science in action.'].join(' ');
  }
  function conceptCheckNarrationText(lesson) {
    const options = lesson.check.options.map(([key,label]) => `${key.toUpperCase()}. ${label}`).join('. ');
    return `Quick Concept Check. Show what you’ve learned. Take a moment. Think it through before you choose. ${lesson.check.question}. ${options}.`;
  }
  function feedbackNarration(lesson, result) {
    if (result.correct) {
      const nextLabel = state.session.lessonIndex === learningPath().lessons.length - 1 ? 'Go to Wonder League' : 'Next discovery';
      return `You unlocked this idea! ${lesson.check.explanation} ${nextLabel}.`;
    }
    const correct = lesson.check.options.find(o => o[0] === lesson.check.answer)?.[1] || '';
    return `Good try. Here is the science behind it. ${lesson.check.explanation} Best answer: ${correct}. Try the question again.`;
  }

  function renderMultimediaLab(lesson) {
    return `<section class="multimedia-lab" aria-label="Interactive multimedia learning studio">
      <div class="multimedia-head"><div><span class="mini-label">WATCH · EXPLORE · EXPERIMENT</span><h2>Step inside the science lab</h2><p>Make a prediction, move the controls and watch the science in action.</p></div><span class="media-stamp">✦ INTERACTIVE LAB</span></div>
      <div class="lab-voicebar"><div class="voice-avatar"><img src="assets/art/speaker-wave.svg" alt=""/></div><div class="voice-copy"><b>Pip is your science guide</b><small>I will talk you through the lesson, read the question and explain what happens when you use the lab. Use the voice controls at the bottom of the screen.</small></div></div>
      ${renderLabExperiment(lesson)}
      <p class="lab-model-note"><img src="assets/art/beaker.svg" alt=""/> Science models simplify real processes. Compare what you see with the explanation above.</p>
    </section>`;
  }

  function renderLabExperiment(lesson) {
    const id = lesson.id;
    if (id === 'cell-basics') return `<div class="lab-workbench visual-workbench">
      <div class="lab-explainer"><span class="lab-step-label">ZOOM EXPLORER</span><h3>Zoom from a living thing to one cell</h3><p>Follow the scale from a whole plant to the tiny units that make its tissues.</p>
        <div class="zoom-levels"><button class="zoom-level active" data-zoom-level="organism">Organism</button><button class="zoom-level" data-zoom-level="tissue">Tissue</button><button class="zoom-level" data-zoom-level="cell">Cell</button></div>
        <div class="lab-result" id="zoomExplanation" aria-live="polite"><b>A whole plant</b><p>A plant is an organism. It contains organs such as leaves, and each leaf is built from many cells.</p></div>
      </div>
      <div class="zoom-stage" id="zoomStage" data-zoom="organism"><div class="zoom-scene-light"></div><img id="zoomImage" class="zoom-image" src="assets/art/plant-world.svg" alt="A whole green plant"/><div class="zoom-lens"><span></span></div><div class="zoom-diagram-labels" id="zoomDiagramLabels"></div><div class="zoom-caption" id="zoomCaption">ORGANISM · A WHOLE PLANT</div><div class="zoom-ruler"><i></i><i></i><i></i><i></i><i></i><b id="zoomScale">LARGE SCALE</b></div></div>
    </div>`;

    if (id === 'cell-parts') return `<div class="lab-workbench visual-workbench cell-workbench">
      <div class="lab-explainer"><span class="lab-step-label">3D CELL EXPLORER</span><h3>Tap a glowing cell part</h3><p>Each structure has a different job. Select a label to see where it sits and what it does.</p>
        <div class="lab-result" id="cellPartExplanation" aria-live="polite"><b>Choose a structure</b><p>Start with the nucleus, then explore the membrane, cytoplasm, mitochondria and small storage vesicles.</p></div>
        <div class="cell-part-legend"><span><i class="legend-dot nucleus-dot"></i>Instructions</span><span><i class="legend-dot energy-dot"></i>Energy</span><span><i class="legend-dot boundary-dot"></i>Boundary</span></div>
      </div>
      <div class="cell-diagram-stage cell-diagram-realistic"><div class="cell-image-plate"><img class="animal-cell-render" src="assets/art/animal-cell-3d.webp" alt="Three-dimensional cutaway view of an animal cell"/>
        <button class="diagram-hotspot hs-nucleus" data-cell-part="nucleus" aria-label="Explore nucleus"><span></span><b>Nucleus</b></button>
        <button class="diagram-hotspot hs-mito" data-cell-part="mitochondria" aria-label="Explore mitochondria"><span></span><b>Mitochondrion</b></button>
        <button class="diagram-hotspot hs-membrane" data-cell-part="membrane" aria-label="Explore cell membrane"><span></span><b>Cell membrane</b></button>
        <button class="diagram-hotspot hs-cytoplasm" data-cell-part="cytoplasm" aria-label="Explore cytoplasm"><span></span><b>Cytoplasm</b></button>
        <button class="diagram-hotspot hs-vacuole" data-cell-part="vacuole" aria-label="Explore vesicle or small vacuole"><span></span><b>Vesicle / small vacuole</b></button>
      </div><div class="diagram-caption">ANIMAL CELL CUTAWAY · LABELS SHOW THE MAIN PARTS IN THIS MODEL</div></div>
    </div>`;

    if (id === 'cell-boundary') return `<div class="lab-workbench visual-workbench membrane-workbench">
      <div class="lab-explainer"><span class="lab-step-label">MEMBRANE TRANSPORT LAB</span><h3>Which route can it use?</h3><p>The cell membrane is a thin phospholipid bilayer with proteins that help selected materials cross.</p>
        <div class="molecule-picker"><button class="molecule-choice selected" data-molecule="oxygen">Oxygen</button><button class="molecule-choice" data-molecule="water">Water</button><button class="molecule-choice" data-molecule="glucose">Glucose</button><button class="molecule-choice" data-molecule="large">Large particle</button></div>
        <button class="button button-primary lab-run-button" id="runGateBtn" type="button">Run the transport test <span>→</span></button>
        <div class="lab-result" id="gateResult" aria-live="polite"><b>Choose a particle</b><p>Then watch whether it crosses the lipid layer directly or uses a membrane protein.</p></div>
      </div>
      <div class="gate-stage membrane-scene" id="gateStage"><div class="membrane-fluid fluid-left"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="membrane-cutaway"><img src="assets/art/membrane-bilayer.svg" alt="Phospholipid bilayer: water-facing heads, inward-facing fatty acid tails, channel protein and carrier protein"/></div>
        <div class="membrane-fluid fluid-right"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="membrane-structure-labels"><span class="heads-label">Hydrophilic heads</span><span class="tails-label">Hydrophobic tails</span><span class="channel-label">Channel protein</span><span class="carrier-label">Carrier protein</span></div>
        <div class="gate-molecule" id="gateMolecule">O₂</div><div class="gate-route-label route-direct">THROUGH THE LIPID</div><div class="gate-route-label route-channel">THROUGH A CHANNEL</div><div class="gate-route-label route-carrier">VIA A CARRIER</div>
        <div class="gate-labels"><span>OUTSIDE THE CELL</span><span>CYTOPLASM · INSIDE</span></div>
      </div>
    </div>`;

    if (id === 'cell-energy') return `<div class="lab-workbench visual-workbench energy-workbench">
      <div class="lab-explainer"><span class="lab-step-label">CELL ENERGY LAB</span><h3>Balance the fuel and oxygen</h3><p>Mitochondria help release energy from food during cellular respiration. Change the supplies and watch the model respond.</p>
        <label class="range-control">Relative glucose supply <output id="glucoseValue">Plentiful</output><input id="glucoseSlider" type="range" min="0" max="100" value="70"/></label>
        <label class="range-control">Relative oxygen supply <output id="oxygenValue">Plentiful</output><input id="oxygenSlider" type="range" min="0" max="100" value="70"/></label>
        <div class="lab-result" id="energyExplanation" aria-live="polite"><b>Both supplies are available</b><p>This simplified aerobic-respiration model shows a stronger energy supply when both glucose and oxygen are available.</p></div>
      </div>
      <div class="energy-stage mitochondrion-stage" id="energyStage"><div class="mito-image-wrap"><img class="mitochondrion-render" src="assets/art/mitochondrion-3d.svg" alt="Mitochondrion cutaway showing inner folds"/><i class="energy-spark spark-one">✦</i><i class="energy-spark spark-two">✦</i><i class="energy-spark spark-three">✦</i></div>
        <div class="mito-label-strip"><span>OUTER MEMBRANE</span><span>INNER MEMBRANE FOLDS · CRISTAE</span><span>MATRIX</span></div>
        <div class="energy-meter"><div class="energy-meter-head"><b>MODEL ENERGY SUPPLY</b><strong id="energyPercent">Moderate</strong></div><div class="energy-meter-track"><span id="energyMeterFill" style="width:70%"></span></div><small>Conceptual comparison only · not a measured cell rate</small></div>
      </div>
    </div>`;

    if (id === 'cell-plant') return `<div class="lab-workbench visual-workbench plant-workbench">
      <div class="lab-explainer"><span class="lab-step-label">CELL COMPARISON LAB</span><h3>Spot the plant-cell features</h3><p>Switch between the two cell models. Look for the structures that give a typical green plant cell extra support and help it use light.</p>
        <div class="toggle-pair"><button class="toggle-choice" data-cell-view="animal">Animal cell</button><button class="toggle-choice active" data-cell-view="plant">Plant cell</button></div>
        <div class="lab-result" id="cellCompareResult" aria-live="polite"><b>Plant cell</b><p>Cell wall supports the cell, chloroplasts help it use light to make food, and a large central vacuole stores cell sap.</p></div>
      </div>
      <div class="compare-stage compare-stage-realistic" id="compareStage" data-view="plant"><div class="compare-image-wrap"><img id="compareCellImage" src="assets/art/plant-cell-3d.svg" alt="Plant cell cutaway showing cell wall, membrane, chloroplasts and large vacuole"/><div class="compare-labels" id="compareLabels"><span class="compare-label label-wall">Cell wall</span><span class="compare-label label-membrane">Cell membrane</span><span class="compare-label label-vacuole">Large central vacuole</span><span class="compare-label label-chloro">Chloroplasts</span><span class="compare-label label-nucleus">Nucleus</span></div></div><div class="compare-key" id="compareKey"><span><i class="key-wall"></i>Cell wall</span><span><i class="key-chloro"></i>Chloroplasts</span><span><i class="key-vacuole"></i>Large vacuole</span></div></div>
    </div>`;

    if (id === 'cell-specialists') return `<div class="lab-workbench visual-workbench specialist-workbench">
      <div class="lab-explainer"><span class="lab-step-label">SPECIALISED CELL EXPLORER</span><h3>Shape has a job</h3><p>Choose a cell. Follow its shape and features to discover how it does its job.</p>
        <div class="specialist-tabs"><button class="specialist-tab active" data-specialist="nerve">Nerve cell</button><button class="specialist-tab" data-specialist="muscle">Muscle fibre</button><button class="specialist-tab" data-specialist="blood">Red blood cell</button></div>
        <div class="lab-result" id="specialistResult" aria-live="polite"><b>Nerve cell</b><p>Dendrites receive signals; a long axon carries an electrical impulse toward other cells.</p></div>
      </div>
      <div class="specialist-stage specialist-stage-realistic" id="specialistStage"><img id="specialistImage" src="assets/art/neuron-detail.svg" alt="Nerve cell showing branching dendrites, cell body and a long axon"/><div class="specialist-label-strip" id="specialistCaption">DENDRITES · CELL BODY · AXON</div></div>
    </div>`;

    if (id === 'materials-sources') return `<div class="lab-workbench visual-workbench source-workbench">
      <div class="lab-explainer"><span class="lab-step-label">MATERIAL ORIGIN EXPLORER</span><h3>Follow a material back to nature</h3><p>Choose an everyday product. Trace its journey from a natural resource through processing to the finished object.</p>
        <div class="source-choices"><button data-source="cotton" class="source-choice active">Cotton shirt</button><button data-source="wool" class="source-choice">Wool sweater</button><button data-source="paper" class="source-choice">Paper</button><button data-source="glass" class="source-choice">Glass</button></div>
        <div class="lab-result" id="sourceResult" aria-live="polite"><b>Cotton shirt</b><p>Cotton plant → fibres → yarn → fabric → shirt.</p></div>
      </div>
      <div class="source-stage source-stage-realistic"><div class="source-track-line"></div><div class="source-step"><div class="source-visual"><img id="sourceNaturalImage" src="assets/art/cotton-plant.svg" alt="Cotton plant"/></div><b id="sourceNaturalLabel">NATURAL SOURCE</b></div><div class="source-arrow">→</div><div class="source-step"><div class="source-visual"><img id="sourceProcessImage" src="assets/art/cotton-ball.svg" alt="Cotton fibres ready for spinning"/></div><b id="sourceProcessLabel">PROCESSING</b></div><div class="source-arrow">→</div><div class="source-step"><div class="source-visual"><img id="sourceProductImage" src="assets/art/cotton-shirt.svg" alt="Finished cotton shirt"/></div><b id="sourceProductLabel">FINISHED PRODUCT</b></div><div class="source-trail" id="sourceTrail">COTTON PLANT → FIBRES → YARN → SHIRT</div></div>
    </div>`;

    if (id === 'materials-properties') return `<div class="lab-workbench visual-workbench property-workbench">
      <div class="lab-explainer"><span class="lab-step-label">MATERIAL PROPERTY INSPECTOR</span><h3>Look closely at each sample</h3><p>Choose an object. Observe its surface, flexibility and texture, then describe it using a science property.</p>
        <div class="property-samples"><button class="property-sample active" data-property-sample="sponge"><img src="assets/art/sponge.svg" alt=""/><span>Sponge</span></button><button class="property-sample" data-property-sample="steel"><img src="assets/art/metal-spoon.svg" alt=""/><span>Steel spoon</span></button><button class="property-sample" data-property-sample="rubber"><img src="assets/art/rubber-swatch.svg" alt=""/><span>Rubber</span></button><button class="property-sample" data-property-sample="copper"><img src="assets/art/coin-shiny.svg" alt=""/><span>Copper coin</span></button></div>
        <div class="lab-result" id="propertyResult" aria-live="polite"><b>Sponge</b><p>Soft, porous and absorbent. Its surface is usually dull.</p></div>
      </div>
      <div class="property-stage property-stage-realistic" id="propertyStage"><div class="property-specimen-wrap"><img id="propertySpecimenImage" src="assets/art/sponge.svg" alt="Sponge sample"/></div><div class="property-readouts" id="propertyReadouts"><span>SOFT</span><span>POROUS</span><span>ABSORBENT</span></div><div class="property-test-caption">OBSERVE · COMPARE · DESCRIBE</div><div class="property-highlight"></div></div>
    </div>`;

    if (id === 'materials-design') return `<div class="lab-workbench visual-workbench bridge-workbench">
      <div class="lab-explainer"><span class="lab-step-label">BRIDGE DESIGN STUDIO</span><h3>Can the deck bend less?</h3><p>Choose a material and raise the model load. Compare how much each deck bends in this simplified demonstration.</p>
        <div class="bridge-materials"><button class="bridge-material active" data-bridge-material="wood">Wood</button><button class="bridge-material" data-bridge-material="steel">Steel</button><button class="bridge-material" data-bridge-material="cardboard">Cardboard</button></div>
        <label class="range-control">Model load level <output id="bridgeLoadValue">3 / 5</output><input id="bridgeLoadSlider" type="range" min="1" max="5" step="1" value="3"/></label>
        <button class="button button-primary lab-run-button" id="runBridgeTestBtn" type="button">Send the test cart across <span>→</span></button>
        <div class="lab-result" id="bridgeResult" aria-live="polite"><b>Wooden deck selected</b><p>Watch the deck bend as the test load increases. A real bridge also depends on span, supports, joints and design.</p></div>
      </div>
      <div class="bridge-stage bridge-stage-realistic" id="bridgeStage"><div class="bridge-river-art"></div><div class="bridge-bank bank-left"></div><div class="bridge-bank bank-right"></div><div class="bridge-pier pier-left"></div><div class="bridge-pier pier-right"></div><div class="bridge-deck" id="bridgeDeck"><div class="bridge-planks"></div><div class="bridge-railings"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><img id="bridgeCart" class="bridge-cart" src="assets/art/bridge-car.svg" alt="Small test cart"/></div><div class="bridge-deck-shadow"></div><div class="bridge-stage-caption">CONCEPTUAL BENDING MODEL · NOT A STRUCTURAL SAFETY TEST</div></div>
    </div>`;

    if (id === 'materials-light') return `<div class="lab-workbench visual-workbench light-workbench">
      <div class="lab-explainer"><span class="lab-step-label">LIGHT TRANSMISSION LAB</span><h3>Follow the beam</h3><p>Choose a material and watch what happens to the light and the image behind it.</p>
        <div class="light-materials"><button class="light-material active" data-light-material="clear">Clear glass</button><button class="light-material" data-light-material="frosted">Frosted glass</button><button class="light-material" data-light-material="wood">Wood</button></div>
        <div class="lab-result" id="lightResult" aria-live="polite"><b>Transparent</b><p>Clear glass lets light pass through, so the flower can be seen clearly.</p></div>
      </div>
      <div class="light-stage light-stage-realistic" id="lightStage"><img class="light-source" src="assets/art/sun.svg" alt="Light source"/><div class="light-ray ray-main"></div><div class="light-ray ray-top"></div><div class="light-ray ray-bottom"></div><div class="light-barrier clear-barrier" id="lightBarrier"><span></span></div><img class="light-object" src="assets/art/flower-specimen.svg" alt="Flower viewed through the test material"/><div class="light-stage-caption"><span>LIGHT SOURCE</span><span>TEST MATERIAL</span><span>OBJECT BEHIND</span></div></div>
    </div>`;

    if (id === 'materials-solubility') return `<div class="lab-workbench visual-workbench mixing-workbench">
      <div class="lab-explainer"><span class="lab-step-label">VIRTUAL MIXING EXPERIMENT</span><h3>What happens when it meets water?</h3><p>Predict first. Add one sample, stir and watch whether it dissolves, settles, clouds the water or floats.</p>
        <div class="sample-selector"><button class="sample-chip active" data-sample="salt"><img src="assets/art/salt-crystals.svg" alt=""/><span>Salt</span></button><button class="sample-chip" data-sample="sugar"><img src="assets/art/sugar-crystals.svg" alt=""/><span>Sugar</span></button><button class="sample-chip" data-sample="sand"><img src="assets/art/sand-sample.svg" alt=""/><span>Sand</span></button><button class="sample-chip" data-sample="chalk"><img src="assets/art/chalk-powder.svg" alt=""/><span>Chalk</span></button><button class="sample-chip" data-sample="sawdust"><img src="assets/art/sawdust.svg" alt=""/><span>Sawdust</span></button></div>
        <div class="lab-actions-row"><button class="button button-secondary" id="addSampleBtn" type="button">＋ Add sample</button><button class="button button-primary" id="stirSampleBtn" type="button" disabled>↻ Stir the beaker</button></div>
        <div class="lab-result" id="mixResult" aria-live="polite"><b>Make a prediction</b><p>Choose a sample. Do you think it will dissolve, sink, float or make the water cloudy?</p></div>
      </div>
      <div class="beaker-stage beaker-stage-realistic" id="beakerStage"><div class="beaker-back-glow"></div><div class="beaker-rim"></div><div class="beaker-glass"><div class="beaker-liquid"><div class="beaker-particles" id="beakerParticles">${'<i></i>'.repeat(18)}</div><div class="beaker-sediment"></div><div class="beaker-foam"></div></div></div><div class="beaker-glass-highlight"></div><div class="beaker-rim-bottom"></div><div class="beaker-stirrer" id="beakerStirrer"></div><div class="beaker-base"></div><span class="beaker-caption">WATER + ONE SAMPLE</span><span class="beaker-observation-tag" id="beakerObservationTag">BEFORE STIRRING</span></div>
    </div>`;

    if (id === 'materials-measure') return `<div class="lab-workbench visual-workbench measure-workbench">
      <div class="lab-explainer"><span class="lab-step-label">VOLUME MEASUREMENT LAB</span><h3>Watch the water level rise</h3><p>Drop the solid into the measuring cylinder. The rise in water level tells you the submerged volume.</p>
        <label class="range-control">Solid object volume <output id="objectVolumeValue">20 mL</output><input id="objectVolumeSlider" type="range" min="1" max="40" value="20"/></label>
        <div class="measurement-equation"><span>Starting level <b>50 mL</b></span><span>Final level <b id="finalLevelValue">70 mL</b></span><strong>Final − starting = <em id="displacedVolumeValue">20 mL</em></strong></div>
        <div class="lab-result" id="measureResult" aria-live="polite"><b>Read the meniscus</b><p>Subtract the first water reading from the final reading. The difference is the object's submerged volume.</p></div>
      </div>
      <div class="measure-stage measure-stage-realistic" id="measureStage"><div class="measure-cylinder"><div class="cylinder-liquid" id="cylinderLiquid"></div><div class="cylinder-meniscus" id="cylinderMeniscus"></div><div class="cylinder-object" id="cylinderObject"><img src="assets/art/stone-sample.svg" alt="Solid stone sample"/></div><div class="cylinder-scale-lines"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span class="cylinder-mark mark-50">50 mL</span><span class="cylinder-mark mark-final" id="cylinderMark">70 mL</span></div><div class="scale-caption">MEASURING CYLINDER · READ AT EYE LEVEL</div><div class="measure-level-guide"><span>Initial water level</span><span>After the object is added</span></div></div>
    </div>`;

    return `<div class="lab-workbench"><div class="lab-explainer"><span class="lab-step-label">EXPLORE THE MODEL</span><h3>Observe, then explain</h3><p>Use the model and talk through what changes.</p><div class="lab-result"><b>Think like a scientist</b><p>What can you observe? What does the observation tell you about the concept?</p></div></div><div class="generic-lab-visual">${art(lesson.art,'generic-lab-art')}<span>LOOK CLOSELY · ASK WHY</span></div></div>`;
  }

  function setLabResult(id, title, body) {
    const node = $(id);
    if (node) node.innerHTML = `<b>${escapeHTML(title)}</b><p>${escapeHTML(body)}</p>`;
  }

  function bindMultimediaControls(lesson) {
    const root = $('sessionContent');
    const partInfo = {
      nucleus:['Nucleus','The nucleus contains genetic material (DNA) and helps control the cell’s activities.'],
      mitochondria:['Mitochondrion','Mitochondria have an inner membrane folded into cristae. They help release usable energy from food during cellular respiration.'],
      membrane:['Cell membrane','The cell membrane is a thin, flexible boundary. It controls what enters and leaves the cell.'],
      cytoplasm:['Cytoplasm','Cytoplasm is the jelly-like material inside the cell. Many cell activities happen there.'],
      vacuole:['Vesicle / small vacuole','The clear bubble in this model represents a small membrane-bound storage or transport sac. Some animal cells also contain small vacuoles; plant cells typically have one large central vacuole.']
    };
    root.querySelectorAll('[data-cell-part]').forEach(button => button.addEventListener('click', () => {
      root.querySelectorAll('[data-cell-part]').forEach(el => el.classList.toggle('active', el === button));
      const [title, body] = partInfo[button.dataset.cellPart];
      setLabResult('cellPartExplanation', title, body);
    }));

    root.querySelectorAll('[data-zoom-level]').forEach(button => button.addEventListener('click', () => {
      const level = button.dataset.zoomLevel;
      root.querySelectorAll('[data-zoom-level]').forEach(el => el.classList.toggle('active', el === button));
      const details = {
        organism:['A whole plant','A plant is an organism. It contains organs such as leaves, and each leaf is built from many cells.','assets/art/plant-world.svg','A WHOLE LIVING PLANT','ORGANISM · LARGE SCALE',''],
        tissue:['Leaf tissue','A leaf contains different tissues. The palisade layer has many cells that contain chloroplasts and absorb light for photosynthesis.','assets/art/leaf-tissue.svg','CROSS-SECTION OF LEAF TISSUE','TISSUE · GROUPS OF CELLS','<span class="zoom-label upper">Upper epidermis</span><span class="zoom-label palisade">Palisade layer</span><span class="zoom-label spongy">Spongy layer</span><span class="zoom-label lower">Lower epidermis</span>'],
        cell:['One plant cell','A cell is the basic structural and functional unit of living things. Plant cells have a cell wall, cell membrane, cytoplasm and other structures.','assets/art/plant-cell-3d.svg','ONE PLANT CELL','CELL · MICROSCOPIC SCALE','<span class="zoom-label plant-wall">Cell wall</span><span class="zoom-label plant-chloro">Chloroplast</span><span class="zoom-label plant-vac">Large vacuole</span><span class="zoom-label plant-nucleus">Nucleus</span>']
      };
      const [title, body, image, alt, scale, labels] = details[level];
      setLabResult('zoomExplanation', title, body);
      const stage = $('zoomStage');
      stage.dataset.zoom = level;
      stage.classList.remove('zoom-step-changed');
      void stage.offsetWidth;
      stage.classList.add('zoom-step-changed');
      $('zoomImage').src = image;
      $('zoomImage').alt = alt;
      $('zoomCaption').textContent = alt;
      $('zoomScale').textContent = scale;
      $('zoomDiagramLabels').innerHTML = labels;
    }));

    const molecules = {
      oxygen:['O₂','Small, uncharged oxygen molecules can pass directly through the phospholipid bilayer by diffusion.','direct'],
      water:['H₂O','Water moves across a selectively permeable membrane by osmosis. Aquaporin proteins provide a fast route for water.','channel'],
      glucose:['C₆H₁₂O₆','Glucose is too large and polar to pass easily through the lipid core. A carrier protein helps it cross by facilitated diffusion.','carrier'],
      large:['LARGE','A large particle cannot pass straight through the bilayer. Cells use special processes, such as endocytosis, to bring some large materials in.','blocked']
    };
    let chosenMolecule = 'oxygen';
    const resetGate = () => {
      const stage = $('gateStage');
      stage.classList.remove('gate-tested','gate-blocked','path-direct','path-channel','path-carrier');
      stage.dataset.route = '';
    };
    root.querySelectorAll('[data-molecule]').forEach(button => button.addEventListener('click', () => {
      chosenMolecule = button.dataset.molecule;
      root.querySelectorAll('[data-molecule]').forEach(el => el.classList.toggle('selected', el === button));
      $('gateMolecule').textContent = molecules[chosenMolecule][0];
      $('gateMolecule').className = 'gate-molecule';
      resetGate();
      setLabResult('gateResult','Ready to test',`You chose ${chosenMolecule === 'large' ? 'a large particle' : chosenMolecule}. Press “Run the transport test” and watch the route.`);
    }));
    $('runGateBtn')?.addEventListener('click', () => {
      const [molecule, explanation, route] = molecules[chosenMolecule];
      const stage = $('gateStage');
      resetGate();
      stage.dataset.route = route;
      stage.classList.add(route === 'blocked' ? 'gate-blocked' : 'gate-tested', `path-${route}`);
      $('gateMolecule').textContent = molecule;
      setLabResult('gateResult', route === 'blocked' ? 'The bilayer blocks this direct route' : ({direct:'Diffusion through the lipid bilayer',channel:'Osmosis through a water channel',carrier:'Facilitated diffusion using a carrier'}[route]), explanation);
    });

    const describeSupply = value => value >= 75 ? 'Plentiful' : value >= 45 ? 'Moderate' : value >= 15 ? 'Limited' : 'Very low';
    const updateEnergy = () => {
      const fuel = Number($('glucoseSlider')?.value || 70);
      const oxygen = Number($('oxygenSlider')?.value || 70);
      const limiting = Math.min(fuel, oxygen);
      const level = describeSupply(limiting);
      if ($('glucoseValue')) $('glucoseValue').textContent = describeSupply(fuel);
      if ($('oxygenValue')) $('oxygenValue').textContent = describeSupply(oxygen);
      if ($('energyPercent')) $('energyPercent').textContent = level;
      if ($('energyMeterFill')) $('energyMeterFill').style.width = `${limiting}%`;
      $('energyStage')?.setAttribute('data-energy-level', level.toLowerCase().replace(' ','-'));
      if (limiting < 15) {
        setLabResult('energyExplanation','One supply is almost missing','The model shows very little aerobic energy release when either glucose or oxygen is extremely limited. This is a simplified comparison, not a measured cell rate.');
      } else if (fuel < oxygen) {
        setLabResult('energyExplanation','Glucose is the limiting supply','In this model, glucose is less available than oxygen, so it limits the energy supply shown. Mitochondria help release energy from food.');
      } else if (oxygen < fuel) {
        setLabResult('energyExplanation','Oxygen is the limiting supply','In this model, oxygen is less available than glucose, so it limits the energy supply shown. Mitochondria help release energy from food.');
      } else {
        setLabResult('energyExplanation','The supplies are balanced','The model shows a stronger energy supply when both glucose and oxygen are available for aerobic respiration.');
      }
    };
    $('glucoseSlider')?.addEventListener('input', updateEnergy);
    $('oxygenSlider')?.addEventListener('input', updateEnergy);
    updateEnergy();

    const plantLabels = `<span class="compare-label label-wall">Cell wall</span><span class="compare-label label-membrane">Cell membrane</span><span class="compare-label label-vacuole">Large central vacuole</span><span class="compare-label label-chloro">Chloroplasts</span><span class="compare-label label-nucleus">Nucleus</span>`;
    const animalLabels = `<span class="compare-label label-membrane">Cell membrane</span><span class="compare-label label-cytoplasm">Cytoplasm</span><span class="compare-label label-nucleus">Nucleus</span><span class="compare-label label-mito">Mitochondrion</span>`;
    root.querySelectorAll('[data-cell-view]').forEach(button => button.addEventListener('click', () => {
      const plant = button.dataset.cellView === 'plant';
      root.querySelectorAll('[data-cell-view]').forEach(el => el.classList.toggle('active', el === button));
      $('compareCellImage').src = plant ? 'assets/art/plant-cell-3d.svg' : 'assets/art/animal-cell-3d.webp';
      $('compareCellImage').alt = plant ? 'Plant cell cutaway with cell wall, cell membrane, chloroplasts and large central vacuole' : 'Animal cell cutaway with cell membrane, cytoplasm, nucleus and mitochondria';
      $('compareStage').dataset.view = plant ? 'plant' : 'animal';
      $('compareLabels').innerHTML = plant ? plantLabels : animalLabels;
      $('compareKey').innerHTML = plant
        ? '<span><i class="key-wall"></i>Cell wall</span><span><i class="key-chloro"></i>Chloroplasts</span><span><i class="key-vacuole"></i>Large vacuole</span>'
        : '<span><i class="key-membrane"></i>Cell membrane</span><span><i class="key-nucleus"></i>Nucleus</span><span><i class="key-mito"></i>Mitochondria</span>';
      setLabResult('cellCompareResult', plant ? 'Plant cell' : 'Animal cell', plant
        ? 'A typical green plant cell has a cell wall outside its cell membrane, chloroplasts and a large central vacuole. Both plant and animal cells have cytoplasm, a cell membrane and a nucleus.'
        : 'An animal cell has a cell membrane, cytoplasm, a nucleus and mitochondria. It does not have a cell wall or chloroplasts.');
    }));

    const specialists = {
      nerve:['Nerve cell','Dendrites receive signals. The cell body contains the nucleus, and a long axon carries an impulse toward other cells.','neuron-detail.svg','Nerve cell showing dendrites, cell body and axon','DENDRITES · CELL BODY · AXON'],
      muscle:['Muscle fibre','A muscle cell is long and packed with myofibrils. These structures help it shorten and create movement.','muscle-fibre-3d.svg','Long striated muscle fibre with myofibrils','LONG FIBRE · STRIATIONS · CONTRACTS'],
      blood:['Mature human red blood cell','Its biconcave disc shape gives a large surface area for oxygen exchange. A mature human red blood cell has no nucleus and contains haemoglobin.','red-blood-cell-3d.svg','Mature human red blood cell with a biconcave disc shape','BICONCAVE DISC · NO NUCLEUS']
    };
    root.querySelectorAll('[data-specialist]').forEach(button => button.addEventListener('click', () => {
      const key = button.dataset.specialist;
      const [title, body, image, alt, caption] = specialists[key];
      root.querySelectorAll('[data-specialist]').forEach(el => el.classList.toggle('active', el === button));
      setLabResult('specialistResult', title, body);
      $('specialistImage').src = `assets/art/${image}`;
      $('specialistImage').alt = alt;
      $('specialistCaption').textContent = caption;
      $('specialistStage').dataset.specialist = key;
    }));

    const sourceInfo = {
      cotton:{title:'Cotton shirt',body:'Cotton plant → cotton fibres → yarn → fabric → shirt.',trail:'COTTON PLANT → FIBRES → YARN → SHIRT',natural:'cotton-plant.svg',process:'cotton-ball.svg',product:'cotton-shirt.svg',naturalLabel:'COTTON PLANT',processLabel:'COTTON FIBRES',productLabel:'COTTON SHIRT'},
      wool:{title:'Wool sweater',body:'Sheep fleece → cleaned wool fibres → yarn → knitted fabric → sweater.',trail:'SHEEP → WOOL FIBRES → YARN → SWEATER',natural:'sheep-wool.svg',process:'yarn-spool.svg',product:'wool-sweater.svg',naturalLabel:'SHEEP FLEECE',processLabel:'SPUN WOOL YARN',productLabel:'WOOL SWEATER'},
      paper:{title:'Paper sheet',body:'Tree wood → wood pulp → processed pulp → paper sheet.',trail:'TREE → WOOD PULP → PAPER → SHEET',natural:'wood-board.svg',process:'paper-pulp.svg',product:'paper-sheet.svg',naturalLabel:'WOOD FROM TREES',processLabel:'WOOD PULP',productLabel:'PAPER SHEET'},
      glass:{title:'Glass window',body:'Silica-rich sand and other ingredients are heated and processed to make glass.',trail:'SILICA-RICH SAND → HEATING / MELTING → GLASS',natural:'glass-sand-source.svg',process:'molten-glass.svg',product:'glass-window.svg',naturalLabel:'SILICA-RICH SAND',processLabel:'MELTING & FORMING',productLabel:'GLASS WINDOW'}
    };
    root.querySelectorAll('[data-source]').forEach(button => button.addEventListener('click', () => {
      const item = sourceInfo[button.dataset.source];
      root.querySelectorAll('[data-source]').forEach(el => el.classList.toggle('active', el === button));
      setLabResult('sourceResult', item.title, item.body);
      $('sourceTrail').textContent = item.trail;
      [['sourceNaturalImage','natural'],['sourceProcessImage','process'],['sourceProductImage','product']].forEach(([id,key]) => {
        const image = $(id); image.src = `assets/art/${item[key]}`; image.alt = item[`${key}Label`].toLowerCase();
      });
      $('sourceNaturalLabel').textContent = item.naturalLabel;
      $('sourceProcessLabel').textContent = item.processLabel;
      $('sourceProductLabel').textContent = item.productLabel;
    }));

    const properties = {
      sponge:['Sponge','Soft, porous and absorbent. Its surface is usually dull.','sponge.svg','Soft sponge sample',['SOFT','POROUS','ABSORBENT']],
      steel:['Steel spoon','Hard, rigid and strong. A polished steel spoon has lustre and conducts heat.','metal-spoon.svg','Polished steel spoon',['HARD','RIGID','LUSTROUS']],
      rubber:['Rubber band','Flexible and elastic. It stretches when pulled and returns close to its original shape when released.','rubber-swatch.svg','Flexible rubber sample',['FLEXIBLE','ELASTIC','STRETCHY']],
      copper:['Copper coin','Copper is a metal with metallic lustre. It conducts heat and electricity and can be shaped.','coin-shiny.svg','Copper coin',['METALLIC LUSTRE','CONDUCTIVE','MALLEABLE']]
    };
    root.querySelectorAll('[data-property-sample]').forEach(button => button.addEventListener('click', () => {
      const [title, body, image, alt, tags] = properties[button.dataset.propertySample];
      root.querySelectorAll('[data-property-sample]').forEach(el => el.classList.toggle('active', el === button));
      setLabResult('propertyResult', title, body);
      $('propertySpecimenImage').src = `assets/art/${image}`;
      $('propertySpecimenImage').alt = alt;
      $('propertyReadouts').innerHTML = tags.map(tag => `<span>${tag}</span>`).join('');
      $('propertyStage').dataset.sample = button.dataset.propertySample;
    }));

    let bridgeMaterial = 'wood';
    const bendingScale = { wood:1.05, steel:0.48, cardboard:1.75 };
    const materialLabel = { wood:'Wooden deck', steel:'Steel deck', cardboard:'Thin cardboard deck' };
    const updateBridge = () => {
      if (!$('bridgeLoadSlider') || !$('bridgeLoadValue') || !$('bridgeDeck') || !$('bridgeStage')) return;
      const load = Number($('bridgeLoadSlider').value || 3);
      $('bridgeLoadValue').textContent = `${load} / 5`;
      const bend = Math.min(26, load * bendingScale[bridgeMaterial] * 3.0);
      $('bridgeDeck').style.setProperty('--deck-sag', `${bend}px`);
      $('bridgeDeck').dataset.material = bridgeMaterial;
      $('bridgeStage').dataset.load = String(load);
      const response = load >= 4 ? 'The deck bends more as the test load increases.' : 'The deck bends a little under this model load.';
      const stiffness = bridgeMaterial === 'steel' ? 'Steel is generally stiffer than wood for a similar shape and size.' : bridgeMaterial === 'cardboard' ? 'A thin cardboard strip bends more easily in this model.' : 'A suitable wooden plank can support a load, but its thickness and supports matter.';
      setLabResult('bridgeResult', materialLabel[bridgeMaterial], `${response} ${stiffness} This is a visual comparison, not a real load rating.`);
    };
    root.querySelectorAll('[data-bridge-material]').forEach(button => button.addEventListener('click', () => {
      bridgeMaterial = button.dataset.bridgeMaterial;
      root.querySelectorAll('[data-bridge-material]').forEach(el => el.classList.toggle('active', el === button));
      updateBridge();
    }));
    $('bridgeLoadSlider')?.addEventListener('input', updateBridge);
    updateBridge();
    $('runBridgeTestBtn')?.addEventListener('click', () => {
      const cart = $('bridgeCart');
      const deck = $('bridgeDeck');
      cart.classList.remove('cart-running'); deck.classList.remove('deck-tested');
      void cart.offsetWidth;
      cart.classList.add('cart-running'); deck.classList.add('deck-tested');
      setTimeout(() => { cart.classList.remove('cart-running'); deck.classList.remove('deck-tested'); }, 2400);
    });

    const light = {
      clear:['Transparent','Clear glass lets light pass through and lets you see the flower clearly.','clear-barrier'],
      frosted:['Translucent','Frosted glass lets light through but scatters it, so the flower looks blurred.','frosted-barrier'],
      wood:['Opaque','Wood blocks light. The flower cannot be seen through it.','opaque-barrier']
    };
    root.querySelectorAll('[data-light-material]').forEach(button => button.addEventListener('click', () => {
      const [title, body, cls] = light[button.dataset.lightMaterial];
      root.querySelectorAll('[data-light-material]').forEach(el => el.classList.toggle('active', el === button));
      $('lightBarrier').className = `light-barrier ${cls}`;
      $('lightStage').dataset.transmission = button.dataset.lightMaterial;
      $('lightStage').classList.remove('light-animate'); void $('lightStage').offsetWidth; $('lightStage').classList.add('light-animate');
      setLabResult('lightResult', title, body);
    }));

    const samples = {
      salt:['Salt','Salt dissolves in water and forms a solution. Its tiny particles spread through the water and are too small to see.','dissolved','SOLUTION FORMED'],
      sugar:['Sugar','Sugar dissolves in water and forms a solution. The sugar is still present even when the crystals are no longer visible.','dissolved','SOLUTION FORMED'],
      sand:['Sand','Sand is insoluble in water. Its grains do not dissolve and usually settle at the bottom.','settled','SAND SETTLES'],
      chalk:['Chalk powder','Chalk is insoluble. Tiny particles make the water cloudy and may slowly settle.','cloudy','CLOUDY MIXTURE'],
      sawdust:['Sawdust','Sawdust is insoluble and often floats because many wood particles are less dense than water.','floats','SAWDUST FLOATS']
    };
    let chosenSample = 'salt', sampleAdded = false;
    root.querySelectorAll('[data-sample]').forEach(button => button.addEventListener('click', () => {
      chosenSample = button.dataset.sample; sampleAdded = false;
      root.querySelectorAll('[data-sample]').forEach(el => el.classList.toggle('active', el === button));
      $('stirSampleBtn').disabled = true; $('addSampleBtn').disabled = false;
      $('beakerStage').className = 'beaker-stage beaker-stage-realistic';
      $('beakerObservationTag').textContent = 'BEFORE STIRRING';
      setLabResult('mixResult','Make your prediction',`You chose ${samples[chosenSample][0]}. Predict what you will see before you stir.`);
    }));
    $('addSampleBtn')?.addEventListener('click', () => {
      sampleAdded = true; $('addSampleBtn').disabled = true; $('stirSampleBtn').disabled = false;
      $('beakerStage').classList.add('sample-added'); $('beakerStage').dataset.sample = chosenSample;
      $('beakerObservationTag').textContent = 'SAMPLE ADDED · READY TO STIR';
      setLabResult('mixResult','Sample added',`${samples[chosenSample][0]} is in the water. Look at its position, then stir to compare.`);
    });
    $('stirSampleBtn')?.addEventListener('click', () => {
      if (!sampleAdded) return;
      const [title, body, stateName, tag] = samples[chosenSample];
      $('beakerStage').className = `beaker-stage beaker-stage-realistic mix-${stateName} is-stirring`;
      $('stirSampleBtn').disabled = true;
      $('beakerObservationTag').textContent = tag;
      setLabResult('mixResult', `${title}: ${stateName === 'dissolved' ? 'soluble' : 'insoluble'}`, body);
      setTimeout(() => $('beakerStage')?.classList.remove('is-stirring'), 1400);
    });

    const updateMeasurement = () => {
      if (!$('objectVolumeSlider') || !$('objectVolumeValue') || !$('cylinderLiquid') || !$('cylinderMark') || !$('measureStage')) return;
      const volume = Number($('objectVolumeSlider').value || 20);
      const final = 50 + volume;
      const level = Math.min(88, 28 + volume * 1.48);
      $('objectVolumeValue').textContent = `${volume} mL`;
      $('finalLevelValue').textContent = `${final} mL`;
      $('displacedVolumeValue').textContent = `${volume} mL`;
      $('cylinderMark').textContent = `${final} mL`;
      $('cylinderLiquid').style.height = `${level}%`;
      $('cylinderMeniscus').style.bottom = `${level}%`;
      $('cylinderMark').style.bottom = `${level}%`;
      $('cylinderObject').classList.toggle('object-submerged', volume > 0);
      $('measureStage').dataset.volume = String(volume);
      setLabResult('measureResult','Read the difference',`The level rises from 50 mL to ${final} mL. Subtract: ${final} − 50 = ${volume} mL. The object's submerged volume is ${volume} mL.`);
    };
    $('objectVolumeSlider')?.addEventListener('input', updateMeasurement);
    updateMeasurement();

  }

  function bindLessonControls(lesson, result) {
    $('sessionContent').querySelectorAll('[data-lesson-jump]').forEach(button => button.addEventListener('click', () => startLesson(Number(button.dataset.lessonJump))));
    $('sessionContent').querySelectorAll('[data-check-option]').forEach(button => button.addEventListener('click', () => {
      if (result.checked) return;
      result.selected = button.dataset.checkOption;
      const selectedText = lesson.check.options.find(option => option[0] === result.selected)?.[1] || '';
      renderLesson({ announce: false, scroll: false });
      speakAssistant(`${result.selected.toUpperCase()}. ${selectedText}.`, 'Pip repeated your selection', { readAlongTargets: ['.concept-option.selected .option-letter', '.concept-option.selected > span:nth-child(2)'] });
    }));
    $('lessonCheckBtn')?.addEventListener('click', () => {
      if (!result.selected) return;
      result.attempts += 1;
      result.checked = true;
      result.correct = result.selected === lesson.check.answer;
      result.completed = result.correct;
      if (result.correct) {
        const captain = teamById(result.ledBy);
        if (!result.starAwarded) { captain.learningStars += 1; result.starAwarded = true; }
        toast(`${captain.name} earned a learning star!`);
      } else {
        result.completed = false;
        toast('Good try—read the explanation, then try the question again.');
      }
      renderLesson({ announce: false, scroll: false });
      speakAssistant(feedbackNarration(lesson, result), result.correct ? 'Pip is explaining the correct answer' : 'Pip is helping the class review', { readAlongTargets: ['.concept-feedback b', '.concept-feedback p', '.concept-feedback small', '#lessonContinueBtn', '#lessonRetryBtn'] });
    });
    $('startConceptCheckBtn')?.addEventListener('click', () => {
      const checkCard = $('quickConceptCheckCard');
      checkCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      speakAssistant(conceptCheckNarrationText(lesson), 'Pip is reading the Quick Concept Check', { readAlongTargets: ['#quickConceptCheckCard .check-card-top > div:first-child .mini-label', '#quickConceptCheckCard .check-card-top > div:first-child h2', '#quickConceptCheckCard .check-card-top > div:first-child p', '#quickConceptCheckCard .check-question', '#quickConceptCheckCard .concept-option .option-letter', '#quickConceptCheckCard .concept-option > span:nth-child(2)'] });
    });
    $('lessonContinueBtn')?.addEventListener('click', () => startLesson(state.session.lessonIndex + 1));
    $('lessonRetryBtn')?.addEventListener('click', () => {
      result.checked = false; result.selected = null;
      renderLesson({ announce: false, scroll: false });
      speakAssistant(conceptCheckNarrationText(lesson), 'Pip is repeating the Quick Concept Check', { readAlongTargets: ['#quickConceptCheckCard .check-card-top > div:first-child .mini-label', '#quickConceptCheckCard .check-card-top > div:first-child h2', '#quickConceptCheckCard .check-card-top > div:first-child p', '#quickConceptCheckCard .check-question', '#quickConceptCheckCard .concept-option .option-letter', '#quickConceptCheckCard .concept-option > span:nth-child(2)'] });
    });
    bindMultimediaControls(lesson);
  }

  function sessionQuizMinutes() {
    return state.session.duration <= 30 ? 7 : state.session.duration <= 40 ? 10 : 12;
  }

  function renderQuizIntro() {
    const path = learningPath();
    state.session.phase = 'quiz-intro';
    updateProgress('ALL SIX DISCOVERIES COMPLETE', 'NEXT: TEAM CHALLENGE', 80);
    const doneCount = path.lessons.filter(lesson => state.session.lessonResults[lesson.id]?.completed).length;
    $('sessionContent').innerHTML = `<div class="quiz-intro-layout"><div class="quiz-intro-visual">${art('trophy.svg','quiz-trophy')}<span class="quiz-burst burst-one">✦</span><span class="quiz-burst burst-two">★</span></div><section class="quiz-intro-card"><span class="round-kicker">THE FINAL CLASS CHALLENGE</span><h1>Welcome to <span>Wonder League!</span></h1><p>Six ideas learned. Now let’s see how well the class can use them. Every team gets a turn, a clue and a chance to explain its thinking.</p><div class="quiz-rule-grid"><article><b>01</b><span>${path.quiz.length} questions cover every lesson.</span></article><article><b>02</b><span>Teams take turns—no speed race.</span></article><article><b>03</b><span>Each team gets two Pip clues.</span></article><article><b>04</b><span>Correct answers earn stars; clear explanations can earn bonus stars.</span></article></div><div class="quiz-complete-strip"><span>✓</span><b>${doneCount} / ${path.lessons.length} concept lessons completed</b><small>All six concepts in this learning path have been taught.</small></div><p class="quiz-time-note">Suggested team challenge time: ${sessionQuizMinutes()} minutes · Remember, clear thinking matters more than speed.</p><button class="button button-primary button-big" id="startQuizBtn" type="button">Start Wonder League <span>✦</span></button></section></div>`;
    $('startQuizBtn').addEventListener('click', () => {
      state.session.phase = 'quiz';
      renderQuiz();
    });
    scrollToStageTop();
    const quizIntroNarration = ['THE FINAL CLASS CHALLENGE.', 'Welcome to Wonder League!', 'Six ideas learned. Now let’s see how well the class can use them. Every team gets a turn, a clue and a chance to explain its thinking.', `${path.quiz.length} questions cover every lesson.`, 'Teams take turns—no speed race.', 'Each team gets two Pip clues.', 'Correct answers earn stars; clear explanations can earn bonus stars.', `${doneCount} / ${path.lessons.length} concept lessons completed.`, 'All six concepts in this learning path have been taught.', `Suggested team challenge time: ${sessionQuizMinutes()} minutes. Remember, clear thinking matters more than speed.`, 'Start Wonder League.'].join(' ');
    speakAssistant(quizIntroNarration, 'Pip is introducing the team challenge', { readAlongTargets: ['.quiz-intro-card .round-kicker', '.quiz-intro-card h1', '.quiz-intro-card > p:first-of-type', '.quiz-rule-grid article > span', '.quiz-complete-strip b', '.quiz-complete-strip small', '.quiz-time-note', '#startQuizBtn'] });
  }

  function renderQuiz({ announce = true, scroll = true } = {}) {
    const session = state.session;
    const path = learningPath();
    const quiz = session.quiz;
    const question = quizQuestion();
    if (!question) return finishSession();
    const index = quiz.questionIndex;
    const team = teamForQuestion(index);
    const progress = 82 + ((index + 1) / path.quiz.length) * 18;
    updateProgress('WONDER LEAGUE', `QUESTION ${index + 1} OF ${path.quiz.length}`, progress);
    const answerHistory = quiz.answerHistory;
    const lockedHistory = answerHistory[index];
    if (lockedHistory) quiz.locked = true;
    const selected = quiz.selectedOption;
    const options = question.options.map((option, i) => {
      const isCorrect = i === question.answer;
      const isSelected = selected === i;
      const isEliminated = quiz.eliminatedOptions?.includes(i) && !isCorrect;
      return `<button type="button" class="league-option ${isSelected ? 'selected' : ''} ${quiz.locked && isCorrect ? 'is-correct' : ''} ${quiz.locked && isSelected && !isCorrect ? 'is-wrong' : ''} ${isEliminated ? 'is-eliminated' : ''}" data-quiz-option="${i}" ${quiz.locked || isEliminated ? 'disabled' : ''}><span class="league-letter">${String.fromCharCode(65 + i)}</span><span>${escapeHTML(option)}</span><i>${quiz.locked && isCorrect ? '✓' : quiz.locked && isSelected ? '×' : ''}</i></button>`;
    }).join('');
    const feedback = quiz.locked ? `<div class="league-feedback ${lockedHistory?.correct ? 'correct' : 'review'}"><span>${lockedHistory?.correct ? '✦' : '↗'}</span><div><b>${lockedHistory?.correct ? 'Brilliant teamwork!' : 'That’s how we learn.'}</b><p>${escapeHTML(question.explanation)}</p></div></div>` : '';
    const reasonButton = quiz.locked && lockedHistory?.correct && !lockedHistory.reasonAwarded ? `<button type="button" id="reasonStarBtn" class="button button-secondary">We explained it! +1 star</button>` : lockedHistory?.reasonAwarded ? `<span class="reason-awarded">⭐ Reasoning star earned!</span>` : '';
    const bottom = quiz.locked
      ? `<div class="league-after-reveal">${reasonButton}<button type="button" id="nextQuestionBtn" class="button button-primary">${index === path.quiz.length - 1 ? 'See class results' : 'Next question'} <span>→</span></button></div>`
      : `<div class="league-actions"><button type="button" id="pipClueBtn" class="button button-quiet" ${team.hintsRemaining <= 0 || quiz.hintShown ? 'disabled' : ''}><img class="clue-button-icon" src="assets/art/pip.svg" alt=""/> Ask Pip for a clue <small>(${team.hintsRemaining} left)</small></button><button type="button" id="lockQuizAnswerBtn" class="button button-primary" ${selected === null ? 'disabled' : ''}>Lock in our answer <span>✓</span></button></div>${quiz.hintShown ? `<div class="pip-hint"><span>💡</span><p>${escapeHTML(question.hint)}</p></div>` : ''}`;
    const scoreboard = session.teams.map((item, i) => `<div class="league-score-chip"><span class="team-colour team-colour-${i + 1}"></span><b>${escapeHTML(item.name)}</b><strong>${item.points} ★</strong><small>${item.quizCorrect} right · quiz stars</small></div>`).join('');
    $('sessionContent').innerHTML = `<div class="league-layout"><main class="league-main"><div class="league-topline"><span class="league-badge"><img src="assets/art/trophy.svg" alt=""/> WONDER LEAGUE</span><span class="league-topic">${escapeHTML(question.concept)}</span></div><div class="league-question-head"><div><span class="round-kicker">QUESTION ${String(index + 1).padStart(2,'0')} / ${path.quiz.length}</span><h1>${escapeHTML(question.question)}</h1></div><div class="league-question-mark">${index + 1}<small>OF ${path.quiz.length}</small></div></div><div class="league-turn-card"><div class="turn-team-icon"><span class="team-colour team-colour-${session.teams.indexOf(team) + 1}"></span></div><div><small>TEAM ON THE SPOT</small><b>${escapeHTML(team.name)}</b><p>Discuss the clues together. Choose one answer and explain your thinking.</p></div><span class="turn-ready-pill">YOUR TURN</span></div><section class="league-answer-card"><div class="league-answer-intro"><span>🧩</span><div><b>Choose the best answer</b><small>Think it through. The class is learning together.</small></div></div><div class="league-options">${options}</div>${feedback}${bottom}</section></main><aside class="league-side"><div class="league-side-card league-scoreboard"><span class="mini-label">CLASS SCOREBOARD</span><h2>Every team counts</h2><div>${scoreboard}</div></div><div class="league-side-card league-rules-card"><span class="mini-label">PIP’S POWER-UPS</span><h3>Use your clues wisely</h3><p>Every team gets two clues. A clue helps you think, but the explanation is what makes the learning stick.</p><div class="hint-counts">${session.teams.map((item,i)=>`<span><i class="team-colour team-colour-${i + 1}"></i>${escapeHTML(item.name)} <b>${item.hintsRemaining}</b></span>`).join('')}</div></div></aside></div>`;
    bindQuizControls(question, team);
    if (scroll) scrollToStageTop();
    if (announce) {
      const optionScript = question.options.map((option, i) => `${String.fromCharCode(65 + i)}. ${option}`).join('. ');
      const clueButtonText = `Ask Pip for a clue (${team.hintsRemaining} left)`;
      const questionNarration = ['WONDER LEAGUE.', `${question.concept}.`, `QUESTION ${String(index + 1).padStart(2, '0')} / ${path.quiz.length}.`, question.question, `${index + 1} OF ${path.quiz.length}.`, 'TEAM ON THE SPOT.', team.name, 'Discuss the clues together. Choose one answer and explain your thinking.', 'YOUR TURN.', 'Choose the best answer.', 'Think it through. The class is learning together.', optionScript, clueButtonText, 'Lock in our answer.'].join(' ');
      speakAssistant(questionNarration, `Pip is reading question ${index + 1}`, { readAlongTargets: ['.league-topline .league-badge', '.league-topline .league-topic', '.league-question-head .round-kicker', '.league-question-head h1', '.league-question-mark', '.league-turn-card small', '.league-turn-card b', '.league-turn-card p', '.league-turn-card .turn-ready-pill', '.league-answer-intro b', '.league-answer-intro small', '.league-options .league-letter', '.league-options .league-option > span:nth-child(2)', '.league-actions #pipClueBtn', '.league-actions #lockQuizAnswerBtn'] });
    }
  }

  function bindQuizControls(question, team) {
    $('sessionContent').querySelectorAll('[data-quiz-option]').forEach(button => button.addEventListener('click', () => {
      if (state.session.quiz.locked) return;
      state.session.quiz.selectedOption = Number(button.dataset.quizOption);
      const selectedIndex = state.session.quiz.selectedOption;
      const selectedText = question.options[selectedIndex];
      const selectedLetter = String.fromCharCode(65 + selectedIndex);
      renderQuiz({ announce: false, scroll: false });
      speakAssistant(`${selectedLetter}. ${selectedText}. Lock in our answer.`, 'Pip repeated your selection', { readAlongTargets: ['.league-option.selected .league-letter', '.league-option.selected > span:nth-child(2)', '#lockQuizAnswerBtn'] });
    }));
    $('pipClueBtn')?.addEventListener('click', () => {
      const quiz = state.session.quiz;
      if (quiz.hintShown || team.hintsRemaining <= 0) return;
      team.hintsRemaining -= 1;
      quiz.hintShown = true;
      toast(`${team.name} used a Pip clue.`);
      renderQuiz({ announce: false, scroll: false });
      speakAssistant(question.hint, 'Pip is giving the team a clue', { readAlongTargets: ['.pip-hint p'] });
    });
    $('lockQuizAnswerBtn')?.addEventListener('click', () => {
      const quiz = state.session.quiz;
      if (quiz.selectedOption === null || quiz.locked) return;
      quiz.locked = true;
      const correct = quiz.selectedOption === question.answer;
      const record = {
        questionIndex: quiz.questionIndex,
        question: question.question,
        concept: question.concept,
        selectedOption: quiz.selectedOption,
        selectedText: question.options[quiz.selectedOption],
        correctOption: question.answer,
        correctText: question.options[question.answer],
        correct,
        explanation: question.explanation,
        teamId: team.id,
        teamName: team.name,
        reasonAwarded: false,
        usedHint: quiz.hintShown
      };
      quiz.answerHistory[quiz.questionIndex] = record;
      if (correct) {
        team.points += 2;
        team.quizCorrect += 1;
        toast(`${team.name} earned 2 stars!`);
      } else {
        toast('Read the explanation together. The next question is a fresh start.');
      }
      renderQuiz({ announce: false, scroll: false });
      const correctText = question.options[question.answer];
      const correctLetter = String.fromCharCode(65 + question.answer);
      const nextQuestionLabel = quiz.questionIndex === learningPath().quiz.length - 1 ? 'See class results' : 'Next question';
      const feedbackText = record.correct
        ? `${correctLetter}. ${correctText}. Brilliant teamwork! ${question.explanation} We explained it! +1 star. ${nextQuestionLabel}.`
        : `${correctLetter}. ${correctText}. That’s how we learn. ${question.explanation} ${nextQuestionLabel}.`;
      speakAssistant(feedbackText, record.correct ? 'Pip is celebrating the answer' : 'Pip is explaining the answer', { readAlongTargets: ['.league-options .league-option.is-correct .league-letter', '.league-options .league-option.is-correct > span:nth-child(2)', '.league-feedback b', '.league-feedback p', '.league-after-reveal #reasonStarBtn', '.league-after-reveal .reason-awarded', '.league-after-reveal #nextQuestionBtn'] });
    });
    $('reasonStarBtn')?.addEventListener('click', () => {
      const record = state.session.quiz.answerHistory[state.session.quiz.questionIndex];
      if (!record || record.reasonAwarded) return;
      record.reasonAwarded = true;
      const answeredTeam = teamById(record.teamId);
      answeredTeam.points += 1;
      answeredTeam.reasoningStars += 1;
      renderQuiz({ announce: false, scroll: false });
      toast(`${answeredTeam.name} earned an explanation star!`);
      speakAssistant('Reasoning star earned!', 'Pip is awarding a reasoning star', { readAlongTargets: ['.league-after-reveal .reason-awarded'] });
    });
    $('nextQuestionBtn')?.addEventListener('click', () => {
      const quiz = state.session.quiz;
      quiz.questionIndex += 1;
      quiz.selectedOption = null;
      quiz.locked = false;
      quiz.hintShown = false;
      quiz.eliminatedOptions = [];
      if (quiz.questionIndex >= learningPath().quiz.length) finishSession();
      else renderQuiz();
    });
  }

  function finishSession() {
    clearInterval(state.clockInterval);
    const session = state.session;
    if (!session || session.endedAt) return;
    session.endedAt = new Date().toISOString();
    session.elapsedSeconds = Math.max(session.elapsedSeconds, session.duration * 60 - session.secondsLeft);
    session.phase = 'report';
    renderReport(session);
    showScreen('reportScreen');
    const path = pathById(session.chapterId);
    const completed = path.lessons.filter(lesson => session.lessonResults[lesson.id]?.completed).length;
    const correctChecks = path.lessons.filter(lesson => session.lessonResults[lesson.id]?.correct).length;
    const correctQuiz = session.quiz.answerHistory.filter(item => item?.correct).length;
    const totalPoints = session.teams.reduce((sum, team) => sum + team.points + team.learningStars, 0);
    const elapsed = Math.round((session.elapsedSeconds || 0) / 60);
    const reportNarration = [
      'CHAPTER JOURNEY COMPLETE.', 'You made science discoveries!',
      `${session.chapterTitle}. ${elapsed} minutes. ${session.teams.length} teams.`,
      `${completed}/6 concept lessons completed.`, `${correctChecks}/6 concept checks correct.`,
      `${correctQuiz}/${path.quiz.length} team challenge answers right.`, `${totalPoints} team thinking stars.`
    ].join(' ');
    speakAssistant(reportNarration, 'Pip is summarising the class journey', { readAlongTargets: ['.report-celebration .round-kicker', '.report-celebration h1', '.report-celebration p', '.report-stats-new > div > b', '.report-stats-new > div > span'] });
  }

  function renderReport(session) {
    const path = pathById(session.chapterId);
    const lessonsDone = path.lessons.filter(lesson => session.lessonResults[lesson.id]?.completed).length;
    const lessonsCorrect = path.lessons.filter(lesson => session.lessonResults[lesson.id]?.correct).length;
    const missedConcepts = path.lessons.filter(lesson => !session.lessonResults[lesson.id]?.correct);
    const quizCorrect = session.quiz.answerHistory.filter(item => item?.correct).length;
    const totalPoints = session.teams.reduce((sum, team) => sum + team.points + team.learningStars, 0);
    const elapsed = Math.round((session.elapsedSeconds || 0) / 60);
    const lessonRows = path.lessons.map((lesson,index) => {
      const result = session.lessonResults[lesson.id] || {};
      const selectedText = lesson.check.options.find(option => option[0] === result.selected)?.[1];
      const reviewNote = !result.correct && selectedText ? `<em>Chosen: ${escapeHTML(selectedText)} · Best answer: ${escapeHTML(lesson.check.options.find(option => option[0] === lesson.check.answer)?.[1] || '')}</em>` : '';
      return `<article class="report-concept-row"><span class="report-concept-number">${String(index + 1).padStart(2,'0')}</span><div><b>${escapeHTML(lesson.title)}</b><small>${escapeHTML(lesson.goal)}</small>${reviewNote}</div><strong class="${result.correct ? 'report-status-good' : 'report-status-review'}">${result.correct ? '✓ CHECK PASSED' : '↗ REVIEW'}</strong></article>`;
    }).join('');
    const teamRows = session.teams.slice().sort((a,b)=>(b.points+b.learningStars)-(a.points+a.learningStars)).map((team,index)=>`<div class="report-team-row"><span class="team-rank">${index + 1}</span><span class="team-colour team-colour-${session.teams.indexOf(team) + 1}"></span><b>${escapeHTML(team.name)}</b><span class="team-evidence">${team.quizCorrect} correct · ${team.learningStars} lesson · ${team.reasoningStars} reasoning</span><strong>${team.points + team.learningStars} ★</strong></div>`).join('');
    const quizRows = session.quiz.answerHistory.map((record,index)=>record ? `<div class="report-answer-row"><span>${String(index + 1).padStart(2,'0')}</span><div><b>${escapeHTML(record.question)}</b><small>${escapeHTML(record.teamName)} · ${escapeHTML(record.concept)}</small>${!record.correct ? `<em>Chosen: ${escapeHTML(record.selectedText)} · Best answer: ${escapeHTML(record.correctText)}</em>` : ''}</div><strong class="${record.correct ? 'report-status-good' : 'report-status-review'}">${record.correct ? 'CORRECT' : 'REVIEW'}</strong></div>` : '').join('');
    $('reportContent').innerHTML = `<div class="report-wrap report-wrap-new"><div class="report-celebration"><div class="report-spark">✦</div>${art('pip.svg','report-pip')}<span class="round-kicker">CHAPTER JOURNEY COMPLETE</span><h1>You made<br><span>science discoveries!</span></h1><p>${escapeHTML(session.chapterTitle)} · ${elapsed} minutes · ${session.teams.length} teams</p></div>
      <div class="report-stats report-stats-new"><div><b>${lessonsDone}/6</b><span>concept lessons completed</span></div><div><b>${lessonsCorrect}/6</b><span>concept checks correct</span></div><div><b>${quizCorrect}/${path.quiz.length}</b><span>team challenge answers right</span></div><div><b>${totalPoints}</b><span>team thinking stars</span></div></div>
      <section class="report-learning-path"><div class="report-section-heading"><div><span class="round-kicker">OUR SIX DISCOVERIES</span><h2>Every key idea, explored and checked.</h2><p>See what your teams can explain—and what to practise again.</p></div><span class="coverage-seal">6 / 6<span>LESSONS</span></span></div><div class="report-concept-list">${lessonRows}</div>${missedConcepts.length ? `<div class="review-next"><b>Keep exploring:</b> revisit ${missedConcepts.map(lesson=>escapeHTML(lesson.title)).join(', ')} and explain each idea in your own words.</div>` : `<div class="review-next review-complete"><b>All concept checks were answered correctly.</b> Try making your own examples to show how well you understand each idea.</div>`}</section>
      
      <div class="report-grid"><section class="report-card team-report"><div class="report-card-head"><div><span class="round-kicker">OUR TEAMS</span><h2>Every team added to the story.</h2></div><span class="report-card-icon">✦</span></div>${teamRows}</section><section class="report-card learning-report"><span class="round-kicker">THE CHAPTER TAKEAWAY</span><h2>${escapeHTML(path.roomName)}</h2><p>${escapeHTML(path.tagline)}</p><ul>${path.lessons.map(lesson=>`<li><span>✓</span><div><b>${escapeHTML(lesson.title)}</b><small>${escapeHTML(lesson.goal)}</small></div></li>`).join('')}</ul></section></div>
      <section class="report-quiz-review"><div class="report-section-heading"><div><span class="round-kicker">OUR WONDER LEAGUE ROUND</span><h2>How did we answer?</h2><p>See which ideas your teams can use confidently.</p></div><span class="quiz-score-seal">${quizCorrect}<small>RIGHT</small></span></div><div class="report-answer-list">${quizRows}</div></section>
      <section class="report-reflection"><div><span class="round-kicker">ONE LAST THINKING QUESTION</span><h2>What changed in our thinking?</h2><p>Finish this sentence in your own words:</p><blockquote>“At first I thought… but now I think… because…”</blockquote></div><div class="reflection-art">${art('microscope.svg','')}</div></section>
      <div class="report-actions"><button id="printReportBtn" class="button button-primary" type="button">Print our science recap <span>↗</span></button><button id="downloadReportBtn" class="button button-secondary" type="button">Download team results <span>↓</span></button><button id="newSessionBtn" class="button button-quiet" type="button">Explore another chapter</button></div><p class="report-privacy">This report stays in this browser session until downloaded. It records team answers, not individual student identities.</p></div>`;
    $('printReportBtn').addEventListener('click', () => window.print());
    $('downloadReportBtn').addEventListener('click', () => downloadSessionCSV(session));
    $('newSessionBtn').addEventListener('click', resetToHome);
  }

  function csvCell(value) {
    let text = String(value ?? '');
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g,'""')}"`;
  }

  function downloadSessionCSV(session) {
    const path = pathById(session.chapterId);
    const rows = [
      ['Session ID',session.id],['Chapter',session.chapterTitle],['Started at',session.startedAt],['Duration minutes',Math.round((session.elapsedSeconds || 0) / 60)],
      [],
      ['Team','Total stars','Wonder League stars','Concept learning stars','Correct team challenge answers','Reasoning bonus stars','Clues remaining']
    ];
    session.teams.forEach(team=>rows.push([team.name,team.points + team.learningStars,team.points,team.learningStars,team.quizCorrect,team.reasoningStars,team.hintsRemaining]));
    rows.push([],['Concept lesson','Learning goal','Idea captain','Attempts','Concept check result','Team answer','Best answer','Explanation']);
    path.lessons.forEach(lesson=>{
      const result=session.lessonResults[lesson.id] || {};
      const captain=teamById(result.ledBy)?.name || '';
      const selected=lesson.check.options.find(option=>option[0]===result.selected)?.[1] || '';
      const expected=lesson.check.options.find(option=>option[0]===lesson.check.answer)?.[1] || '';
      rows.push([lesson.title,lesson.goal,captain,result.attempts ?? 0,result.correct ? 'Correct' : 'Review',selected,expected,lesson.check.explanation]);
    });
    rows.push([],['Wonder League question','Concept','Team','Team answer','Correct answer','Result','Used clue','Reasoning star']);
    session.quiz.answerHistory.forEach(record=>{
      if(!record) return;
      rows.push([record.question,record.concept,record.teamName,record.selectedText,record.correctText,record.correct?'Correct':'Review',record.usedHint?'Yes':'No',record.reasonAwarded?'Yes':'No']);
    });
    const csv = rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href=url;
    link.download=`wonderlab-learning-record-${session.id}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function resetToHome() {
    stopNarration();
    clearInterval(state.clockInterval);
    state.session=null;
    showScreen('homeScreen');
  }

  function exitSession() {
    if (!state.session) return resetToHome();
    const ok = window.confirm('End this class session and return home? The current lesson record will be lost unless you finish and download the recap.');
    if (ok) resetToHome();
  }

  function openHowModal() { $('howModal').classList.remove('hidden'); }
  function closeHowModal() { $('howModal').classList.add('hidden'); }

  function initVoiceAssistant() {
    state.voice.supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    const auto = $('assistantAutoRead'), replay = $('assistantReplayBtn'), pause = $('assistantPauseBtn');
    const stop = $('assistantStopBtn'), voiceSelect = $('assistantVoiceSelect'), rate = $('assistantRate');
    if (!state.voice.supported) {
      [auto, replay, pause, stop, voiceSelect, rate].forEach(control => { if (control) control.disabled = true; });
      setAssistantStatus('This browser does not provide speech synthesis. All learning text and controls remain available on screen.');
      return;
    }
    auto?.addEventListener('change', () => {
      state.voice.autoRead = auto.checked;
      if (!auto.checked) { stopNarration(); pause.textContent = 'Ⅱ Pause'; setAssistantStatus('Auto-read is off. Use Replay whenever the class wants to hear the current stage.'); }
      else if (state.voice.lastText) speakAssistant(state.voice.lastText, 'Pip is speaking', { force: true });
      else setAssistantStatus('Auto-read is on. I’ll guide each lesson, question and explanation.');
    });
    replay?.addEventListener('click', () => {
      if (state.voice.lastText) speakAssistant(state.voice.lastText, 'Pip is replaying this stage', { force: true });
      else setAssistantStatus('There is no stage to replay yet. Start the science adventure first.');
    });
    pause?.addEventListener('click', () => {
      const synth = window.speechSynthesis;
      if (synth.speaking && !synth.paused) {
        synth.pause(); state.voice.paused = true;
        if (narrationSession) narrationSession.paused = true;
        pause.textContent = '▶ Resume'; setAssistantStatus('Voice paused. Select Resume to continue.');
      }
      else if (synth.paused) {
        synth.resume(); state.voice.paused = false;
        if (narrationSession) narrationSession.paused = false;
        pause.textContent = 'Ⅱ Pause'; setAssistantStatus('Pip is continuing.');
      }
      else if (state.voice.lastText) speakAssistant(state.voice.lastText, 'Pip is replaying this stage', { force: true });
    });
    stop?.addEventListener('click', () => { stopNarration(); pause.textContent = 'Ⅱ Pause'; setAssistantStatus('Voice stopped. Select Replay to hear the current stage again.'); });
    voiceSelect?.addEventListener('change', () => {
      state.voice.voiceURI = voiceSelect.value;
      restartNarrationAtCurrentPosition();
    });
    rate?.addEventListener('change', () => {
      state.voice.rate = Number(rate.value) || 0.94;
      restartNarrationAtCurrentPosition();
    });
    refreshVoiceChoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoiceChoices);
    window.speechSynthesis.onvoiceschanged = refreshVoiceChoices;
  }

  function bindStaticEvents() {
    initVoiceAssistant();
    const sessionContent = $('sessionContent');
    sessionContent.addEventListener('click', event => {
      const control = event.target.closest('button');
      if (!control || !control.closest('.lab-workbench')) return;
      setTimeout(() => {
        const result = control.closest('.lab-workbench')?.querySelector('.lab-result');
        const spoken = result?.innerText?.replace(/\s+/g, ' ').trim();
        if (spoken) speakAssistant(spoken, 'Pip is explaining the lab result', { readAlongTargets: ['.lab-result b', '.lab-result p'] });
      }, 45);
    });
    sessionContent.addEventListener('change', event => {
      const control = event.target.closest('input, select');
      if (!control || !control.closest('.lab-workbench')) return;
      setTimeout(() => {
        const result = control.closest('.lab-workbench')?.querySelector('.lab-result');
        const spoken = result?.innerText?.replace(/\s+/g, ' ').trim();
        if (spoken) speakAssistant(spoken, 'Pip is explaining the lab result', { readAlongTargets: ['.lab-result b', '.lab-result p'] });
      }, 55);
    });
    $('topicGrid').addEventListener('click', event => {
      const button=event.target.closest('[data-start-topic]');
      if(button) chooseTopic(button.dataset.startTopic);
    });
    $('setupBack').addEventListener('click',()=>showScreen('homeScreen'));
    $('launchSessionBtn').addEventListener('click',startSession);
    $('exitSessionBtn').addEventListener('click',exitSession);
    $('howItWorksBtn').addEventListener('click',openHowModal);
    $('howModal').addEventListener('click',event=>{if(event.target.hasAttribute('data-close-modal')) closeHowModal();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape') closeHowModal();});
    $('durationChoices').addEventListener('click',event=>{
      const button=event.target.closest('[data-duration]');
      if(!button)return;
      state.duration=Number(button.dataset.duration);
      $('durationChoices').querySelectorAll('button').forEach(btn=>btn.classList.toggle('selected',btn===button));
    });
    $('teamCountChoices').addEventListener('click',event=>{
      const button=event.target.closest('[data-teams]');
      if(!button)return;
      state.teamCount=Number(button.dataset.teams);
      $('teamCountChoices').querySelectorAll('button').forEach(btn=>btn.classList.toggle('selected',btn===button));
      renderTeamNameInputs();
    });
    $('teamNameInputs').addEventListener('input',event=>{
      const input=event.target.closest('[data-team-name]');
      if(input) state.teamNames[Number(input.dataset.teamName)]=input.value;
    });
  }

  function init() {
    renderTopics();
    bindStaticEvents();
    showScreen('homeScreen');
    const invalid = chapters.some(item => !pathById(item.id) || pathById(item.id).lessons.length !== 6 || pathById(item.id).quiz.length < 10);
    if (!chapters.length || invalid) {
      $('topicGrid').innerHTML='<p class="error-note">A chapter learning path could not be loaded. Check data/chapters.js and data/learning-paths.js.</p>';
    }
  }

  init();
})();
