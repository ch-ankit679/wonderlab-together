# WonderLab Together — quick start (6.0)

## Launch the science adventure

1. Open the project on one classroom computer or projector.
2. Choose **Cell: Structure and Functions** or **Materials Around Us**.
3. Choose the session length and team count. Team names are optional; the platform supplies defaults.
4. Start the chapter. Pip introduces the journey and narrates the learning flow automatically.

## How the voice-led lesson works

Pip reads the welcome, lesson objective, hook, explanations, key vocabulary, everyday example, student mission, thinking question, concept-check question and every answer choice. When an answer is submitted, Pip tells the class whether it is correct, explains the science and tells students what to do next. Incorrect concept-check answers must be retried before the next lesson unlocks.

The fixed Pip control bar is available during the session and recap:

- **Auto-read:** on by default; turn it off when the class wants quiet reading.
- **Replay:** repeat the narration for the current stage.
- **Pause / Resume:** pause the current narration and continue from where it stopped.
- **Stop:** stop the current narration.
- **Voice:** choose an English voice installed on the device, where available.
- **Speed:** choose slow, normal or fast narration.

## What the adult needs to do

The adult's role is deliberately limited to launching the chapter, choosing the session length and number of teams, and operating the shared screen (scrolling, selecting controls and moving between stages). Team names are optional. Pip provides the spoken teaching guidance, question reading, clues, lab observations, feedback and class recap. Students still need to discuss ideas and select answers; the platform does not listen to spoken answers or grade speech.

## How to use the science models

- **Cell diagrams:** tap a labelled hotspot; Pip explains the part and its job.
- **Membrane:** choose a particle, run the test and watch whether it uses the lipid bilayer, a channel or a carrier.
- **Energy model:** adjust relative glucose and oxygen supplies; the weaker supply limits the qualitative meter.
- **Plant/animal comparison:** switch the view and compare the structures; plant-only labels disappear in the animal view.
- **Materials trail/property lab:** select an object and observe its origin or properties.
- **Bridge:** select a material, raise the model load and send the test cart across. This is illustrative, not an engineering calculator.
- **Light:** change the test material and watch the light and image behind it.
- **Beaker:** add one sample, observe it and stir; compare solution, sediment, cloudiness and floating.
- **Measuring cylinder:** change the solid's model volume and calculate final minus starting water level.

Pip speaks the updated observation after a learner changes a lab control, selects a sample or runs an experiment, where a result is shown.

## Finish and save the session

After the six lessons, teams take turns in Wonder League. Pip reads each question and its options, offers clues when requested, and explains the answer after submission. At the end, Pip summarises the class journey. The recap shows concept checks, team answers and ideas to review. Print it or download the team CSV before refreshing the page.

## Run locally on Windows

Extract the v6 ZIP into a new folder and double-click `START-WONDERLAB.bat`. It opens `http://localhost:8010`. For manual start, run `python -m http.server 8010` from the folder containing the current `index.html`. Stop any older server before launching. The current build loads `data/learning-paths.js?v=6.0.0`; seeing `data/classroom-experiences.js` in the terminal means an old folder is being served. `304` is normal cache validation; `404` is a missing file/path.

## Model limitations and voice support

Voice uses the browser/device speech-synthesis engine. The installed voices and quality depend on the operating system and browser; a browser may require its first user click before speaking. This feature reads information aloud; it does **not** use microphone input, speech recognition or spoken-answer marking. If speech synthesis is unavailable, all lesson content and controls remain visible on screen. One shared screen is supported; separate student-device joining is not included.

Animations and simulations are simplified teaching models, not high-fidelity laboratory measurements. Reduced teacher narration is a design goal, but actual workload savings still need to be measured in a classroom pilot.
