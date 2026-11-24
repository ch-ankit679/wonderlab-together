# WonderLab Together — Voice-Led Science Lab Edition 6.0

WonderLab Together is a browser-based Class 8 science learning adventure for **Cell: Structure and Functions** and **Materials Around Us**. Students move through six guided lessons per chapter, each with a concept explanation, a visual or interactive model, a direct student mission and a concept check. A separate Wonder League challenge follows the six lessons.

## What's new in 6.0

- Added Pip as a persistent voice assistant for the classroom learning journey.
- Auto-reads the welcome, lesson goals, hooks, explanations, vocabulary, real-world examples, missions, concept-check questions and answer choices.
- Reads interactive lab observations after learners change a model, choose a feature or run an experiment.
- Reads Wonder League questions, team turns, answer choices, hints, feedback and end-of-session summaries.
- Added persistent replay, pause/resume, stop, auto-read toggle, selectable device voice and speech-speed controls.
- Automatically scrolls to the top of every new lesson, answer-feedback state, team question and report after a stage transition.
- Reduced teacher setup to selecting the chapter, time and team count; suggested team names remain optional.

## What's new in 5.0

- Rebuilt all 12 lesson workbenches with larger, more detailed visual scenes.
- Replaced the flat animal-cell icon with a detailed 3D-style cell cutaway and interactive, editable labels.
- Replaced the fence-like membrane graphic with a phospholipid bilayer, hydrophilic heads, hydrophobic tails, channel protein and carrier protein.
- Added a detailed plant-cell cutaway with separate cell-wall, cell-membrane, chloroplast and central-vacuole labels. The animal-cell view now removes plant-only labels.
- Replaced the mitochondrion bean with a cutaway that shows the outer membrane, inner membrane folds (cristae) and matrix.
- Rebuilt specialist-cell scenes and enlarged labels for nerve cells, muscle fibres and mature human red blood cells.
- Replaced emoji material thumbnails with actual local illustrations, improved the natural-source trail and made the light, bridge, mixing and measuring scenes more lifelike.
- Added purposeful motion to cell structures, molecular transport, energy signals, the test cart, water flow, light rays, mixing particles and the measuring cylinder.
- Replaced arbitrary bridge “kg capacity” values with a clearly labelled dimensionless model load scale, so the simulator no longer suggests an engineering rating.
- Added a diagram-label audit covering all 12 lessons and corrected/qualified labels where needed.
- Kept `data/chapters.js` unchanged.

## The two learning journeys

### Cell: Structure and Functions
1. The Tiny Building Blocks — organism, leaf tissue and plant cell.
2. Meet the Cell Team — nucleus, cell membrane, cytoplasm, mitochondria and small storage vesicles.
3. The Cell’s Smart Boundary — phospholipid bilayer and selected transport routes.
4. Powering the Cell — mitochondrion structure and a relative glucose/oxygen supply model.
5. Inside a Plant Cell — plant/animal cell comparison.
6. Cells with Special Jobs — nerve cells, muscle fibres and mature human red blood cells.

### Materials Around Us
1. Where Do Materials Come From? — trace cotton, wool, paper and glass from source to product.
2. Become a Property Detective — inspect sponge, steel, rubber and copper.
3. Choose the Right Material — compare a conceptual bridge deck under increasing model load.
4. Can Light Pass Through? — compare transparent, translucent and opaque materials.
5. The Mystery of Dissolving — add and stir salt, sugar, sand, chalk or sawdust in a virtual beaker.
6. Mass, Volume and Matter — explore volume by water displacement.

## Run locally on Windows

No Node.js, npm, database, API key or paid service is required. Python 3 is used only to serve the local files.

**Recommended:** extract this ZIP into a new folder named `wonderlab-together-student-edition-v6`, then double-click `START-WONDERLAB.bat`. It opens the site at `http://localhost:8010`.

**Manual method:**

1. Stop any older local server with `Ctrl + C`.
2. Open a terminal in the extracted project folder—the folder containing `index.html`, `app.js`, `styles.css` and `data`.
3. Run `python -m http.server 8010`.
4. Open `http://localhost:8010`. If an earlier page is cached, hard-refresh with `Ctrl + Shift + R`.

This build loads assets with `?v=6.0.0`. It does not request `data/classroom-experiences.js`. A `304` is a normal cache response; `404` means the browser requested a missing path. If the old filename appears, stop the old server and confirm that the terminal is serving this new folder.

## Deployment to GitHub Pages

1. Create a repository and upload the contents of this folder to its root. `index.html` must be at repository root.
2. Push to the `main` branch.
3. Open **Settings → Pages** and select **GitHub Actions**.
4. The included workflow performs JavaScript and static validation before publishing.

## Student learning flow

1. Choose one of the two science worlds.
2. Follow the six concept lessons in order.
3. Read the explanation and key words, explore the visual model, use the controls and complete the student mission.
4. Answer the concept check. An incorrect answer shows an explanation and requires a retry before the next lesson unlocks.
5. Complete Wonder League with the team and review the learning report.

## Teacher-light classroom operation

Pip automatically speaks the lesson sequence, reads quiz prompts and answer choices, responds to submitted answers, gives clues, narrates the available lab observations and summarises the class report. The adult selects the chapter, session length and team count at setup; team names can remain at their defaults. During the session the adult mainly operates the shared screen and helps the class take turns. The fixed Pip bar provides Auto-read, Replay, Pause/Resume, Stop, voice selection and speaking-speed controls. This is text-to-speech only: students still click or tap answers, and the site does not listen to microphones or grade spoken responses.

## Technical and scientific limits

- It is designed for one shared classroom computer or projector. Separate student-device joining and live synchronisation are not included.
- Voice narration uses the browser/device speech engine; available voices depend on browser and operating system. Auto-read is enabled by default. The persistent Pip control bar supports Replay, Pause/Resume, Stop, voice selection, speech speed and disabling automatic narration. Browser/device speech support is required; some browsers may require audio to be activated by the first user click.
- Visual models are simplified educational illustrations, not exact-scale microscopy, calibrated lab equipment or engineering software.
- The bridge slider uses model levels, not measured load capacities. Do not use it for real construction or safety decisions.
- The energy meter is a relative teaching model, not a measured biological rate.
- The curriculum mapping is a reference crosswalk, not board approval. Verify alignment with the school's board, textbook edition and term plan.
- This prototype has not been validated in a school pilot. Improved attainment and reduced teacher workload must be demonstrated through classroom evaluation.

## Project structure

- `index.html` — platform screens and cache-busted script/style references.
- `styles.css` — responsive design, realistic scenes and reduced-motion support.
- `app.js` — lessons, diagrams, simulations, Pip voice assistant, team challenge and report.
- `data/chapters.js` — preserved original source chapter content; unchanged.
- `data/learning-paths.js` — student-facing lessons and challenge questions.
- `assets/art/` — local illustrations and visual assets, including the new 3D-style diagrams.
- `DIAGRAM-ACCURACY-AUDIT.md` — lesson-by-lesson label audit and science references.
- `VOICE-ASSISTANT-GUIDE.md` — Pip narration, classroom controls, browser support and limitations.
- `MULTIMEDIA-LEARNING-GUIDE.md` — description of the interactive models.
- `scripts/verify-static.cjs` — static content, asset and diagram checks.
- `START-WONDERLAB.bat` — Windows quick-start launcher.

## Verify the project

```bash
node scripts/verify-static.cjs
node --check app.js
node --check data/learning-paths.js
```
