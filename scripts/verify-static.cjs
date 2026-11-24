const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = { window: {} };
vm.createContext(context);
for (const file of ['data/chapters.js', 'data/curriculum.js', 'data/learning-paths.js']) {
  vm.runInContext(read(file), context, { filename: file });
}
const chapters = context.window.WONDERLAB_CHAPTERS.filter(ch => ['cells', 'materials'].includes(ch.id));
const paths = context.window.WONDERLAB_LEARNING_PATHS;
const errors = [];
const required = ['index.html', 'app.js', 'styles.css', 'data/chapters.js', 'data/curriculum.js', 'data/learning-paths.js', '.nojekyll'];
for (const file of required) if (!fs.existsSync(path.join(root, file))) errors.push(`Missing required file: ${file}`);
if (chapters.length !== 2) errors.push(`Expected exactly 2 preserved chapters; found ${chapters.length}`);
let lessonCount = 0;
let questionCount = 0;
const expectedMissions = {
  cells: ['cell-scout','cell-builder','cell-gates','cell-power','cell-plant','cell-rescue'],
  materials: ['materials-scout','materials-bridge','materials-light','materials-mix','materials-matter','materials-sort']
};
for (const chapter of chapters) {
  const pathData = paths[chapter.id];
  if (!pathData) { errors.push(`Missing learning path for ${chapter.id}`); continue; }
  if (!Array.isArray(pathData.lessons) || pathData.lessons.length !== 6) errors.push(`${chapter.id} must have exactly six guided lessons`);
  if (!Array.isArray(pathData.quiz) || pathData.quiz.length !== 12) errors.push(`${chapter.id} must have a 12-question Wonder League tournament`);
  lessonCount += pathData.lessons?.length || 0;
  questionCount += pathData.quiz?.length || 0;
  const missionIds = new Set(chapter.missions.map(mission => mission.id));
  for (const id of expectedMissions[chapter.id] || []) if (!missionIds.has(id)) errors.push(`Preserved chapter ${chapter.id} is missing source mission ${id}`);
  const lessonIds = new Set();
  for (const lesson of pathData.lessons || []) {
    if (lessonIds.has(lesson.id)) errors.push(`Duplicate lesson id ${chapter.id}/${lesson.id}`);
    lessonIds.add(lesson.id);
    for (const key of ['title','kicker','art','hook','goal','exampleTitle','example','studentTask','studentQuestion','remember']) {
      if (!lesson[key]) errors.push(`Missing ${key} in ${chapter.id}/${lesson.id}`);
    }
    if (!Array.isArray(lesson.explain) || lesson.explain.length < 2) errors.push(`Insufficient teaching explanation in ${chapter.id}/${lesson.id}`);
    if (!Array.isArray(lesson.vocabulary) || lesson.vocabulary.length < 2) errors.push(`Missing key vocabulary in ${chapter.id}/${lesson.id}`);
    if (!Array.isArray(lesson.sourceMissionIds) || !lesson.sourceMissionIds.length) errors.push(`Missing source mission links in ${chapter.id}/${lesson.id}`);
    for (const id of lesson.sourceMissionIds || []) if (!missionIds.has(id)) errors.push(`Unknown source mission ${id} in ${chapter.id}/${lesson.id}`);
    const check = lesson.check;
    if (!check?.question || !Array.isArray(check.options) || check.options.length < 3) errors.push(`Incomplete concept check in ${chapter.id}/${lesson.id}`);
    else {
      if (!check.options.some(option => option[0] === check.answer)) errors.push(`Invalid concept-check answer in ${chapter.id}/${lesson.id}`);
      if (!check.hint || !check.explanation) errors.push(`Missing concept-check hint/explanation in ${chapter.id}/${lesson.id}`);
    }
    if (!fs.existsSync(path.join(root, 'assets/art', lesson.art))) errors.push(`Missing lesson image ${lesson.art} in ${chapter.id}/${lesson.id}`);
  }
  for (const [index, question] of (pathData.quiz || []).entries()) {
    if (!question.concept || !question.question || !Array.isArray(question.options) || question.options.length !== 4) errors.push(`Incomplete quiz question ${chapter.id} #${index + 1}`);
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) errors.push(`Invalid quiz answer index ${chapter.id} #${index + 1}`);
    if (!question.hint || !question.explanation) errors.push(`Missing quiz hint/explanation ${chapter.id} #${index + 1}`);
  }
  const linked = new Set((pathData.lessons || []).flatMap(lesson => lesson.sourceMissionIds || []));
  for (const id of expectedMissions[chapter.id] || []) if (!linked.has(id)) errors.push(`Source mission ${id} is not covered by a guided lesson`);
}
const html = read('index.html');
for (const file of ['data/chapters.js','data/curriculum.js','data/learning-paths.js','app.js','styles.css']) {
  if (!html.includes(file)) errors.push(`index.html does not load ${file}`);
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) errors.push(`Duplicate HTML ids: ${[...new Set(duplicates)].join(', ')}`);
for (const match of html.matchAll(/(?:src|href)="(assets\/[^\"]+)"/g)) {
  if (!fs.existsSync(path.join(root, match[1]))) errors.push(`Missing HTML asset ${match[1]}`);
}
const css = read('styles.css');
if ((css.match(/{/g) || []).length !== (css.match(/}/g) || []).length) errors.push('Unbalanced CSS braces');
const app = read('app.js');
const mediaLessonIds = ['cell-basics','cell-parts','cell-boundary','cell-energy','cell-plant','cell-specialists','materials-sources','materials-properties','materials-design','materials-light','materials-solubility','materials-measure'];
for (const id of mediaLessonIds) if (!app.includes(`id === '${id}'`)) errors.push(`Missing multimedia lesson module for ${id}`);
if (!app.includes('SpeechSynthesisUtterance') || !app.includes('speechSynthesis')) errors.push('Missing browser voice narration support');
if (!app.includes('lessonNarrationText') || !app.includes('feedbackNarration') || !app.includes('Pip is reading question') || !app.includes('Pip is explaining the lab result')) errors.push('Pip voice guidance does not cover lessons, lab observations, feedback and quiz questions');
if (!app.includes('splitSpeechIntoChunks') || !app.includes('narrationToken')) errors.push('Long voice guidance is not safely chunked/cancelled');
if (!html.includes('assistantDock') || !html.includes('assistantAutoRead') || !html.includes('assistantReplayBtn') || !html.includes('assistantPauseBtn') || !html.includes('assistantStopBtn') || !html.includes('assistantVoiceSelect') || !html.includes('assistantRate')) errors.push('Persistent Pip voice controls are missing');
if (!app.includes('scrollToStageTop')) errors.push('Automatic stage scroll is missing');
if (!/[?&]v=6\.0\.\d+/.test(html)) errors.push('Missing versioned asset URLs for cache-busting');
if (!app.includes('studentTask') || !app.includes('studentQuestion')) errors.push('Missing direct-to-student lesson guidance');
if (/teacher.?s corner|teacher.?s quick prompt|teacher opening line|teacherLine|listenFor|classroomTry/i.test(app)) errors.push('Teacher-facing scripts remain in the student interface');
if (!read('styles.css').includes('@media(prefers-reduced-motion:reduce)') || !read('styles.css').includes('@media (prefers-reduced-motion: reduce)')) errors.push('Missing global reduced-motion accessibility support');
if (!fs.existsSync(path.join(root, 'START-WONDERLAB.bat'))) errors.push('Missing Windows quick-start launcher');
if (!fs.existsSync(path.join(root, 'DIAGRAM-ACCURACY-AUDIT.md'))) errors.push('Missing diagram label audit');
if (!fs.existsSync(path.join(root, 'VOICE-ASSISTANT-GUIDE.md'))) errors.push('Missing Pip voice assistant guide');
if (!fs.existsSync(path.join(root, 'assets/art/animal-cell-3d.webp'))) errors.push('Missing realistic animal-cell cutaway');
if (!fs.existsSync(path.join(root, 'assets/art/plant-cell-3d.svg'))) errors.push('Missing plant-cell cutaway');
if (!fs.existsSync(path.join(root, 'assets/art/mitochondrion-3d.svg'))) errors.push('Missing mitochondrion cutaway');
if (!app.includes('phospholipid bilayer') || !app.includes('Hydrophobic tails')) errors.push('Membrane diagram lacks bilayer structure labels');
if (!app.includes('compareLabels') || !app.includes('animalLabels')) errors.push('Plant/animal cell comparison does not switch labels');
if (/capacity[s]?\s*=\s*\{[^}]*kg|\b\d+\s*kg is above this model/i.test(app)) errors.push('Bridge model contains unsupported numeric capacity claims');
if (!app.includes('result.completed = false')) errors.push('Incorrect concept answers are not held for retry');
for (const match of app.matchAll(/art\('([^']+)'/g)) if (!fs.existsSync(path.join(root, 'assets/art', match[1]))) errors.push(`Missing app artwork ${match[1]}`);
for (const source of [app, css, html]) for (const match of source.matchAll(/assets\/art\/([A-Za-z0-9_.-]+)/g)) if (!fs.existsSync(path.join(root, 'assets/art', match[1]))) errors.push(`Missing referenced artwork ${match[1]}`);
for (const file of ['app.js','data/chapters.js','data/curriculum.js','data/learning-paths.js']) {
  try { new Function(read(file)); } catch (error) { errors.push(`JavaScript parse error in ${file}: ${error.message}`); }
}
if (errors.length) {
  console.error('Static validation failed:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(`Static validation passed: ${chapters.length} preserved chapters, ${lessonCount} complete concept lessons, ${questionCount} team tournament questions, source mission links, checks, explanations and local artwork verified.`);
