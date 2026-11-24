# Pip voice assistant — classroom guide (6.0)

## What Pip does

Pip is the spoken facilitator for the student journey. With Auto-read on, Pip:

- Welcomes the class and introduces the chapter.
- Reads the lesson title, learning goal, opening question, teaching explanation, vocabulary, real-world example, key reminder and student mission.
- Gives spoken instructions for the interactive model in each lesson.
- Reads the concept-check question and every answer option.
- Responds after an answer is submitted, explains why the answer is correct or what to review, and tells students what to do next.
- Reads Wonder League team turns, questions, answer choices, requested clues and answer explanations.
- Gives a spoken summary when the session finishes.
- Reads the updated observation shown in a lab result panel after a learner changes a sample/control or runs an experiment.

Long narration is split into shorter speech sections to improve compatibility with browser speech engines. Moving to a new spoken stage cancels the previous narration so two stages do not talk over one another.

## Voice controls

The fixed Pip panel appears during lessons, the Wonder League challenge and the final report.

| Control | What it does |
|---|---|
| Auto-read | Automatically speaks each new stage. Enabled by default. |
| Replay | Repeats the current stage's latest spoken content. |
| Pause / Resume | Pauses or continues the current narration. |
| Stop | Stops the narration. |
| Voice | Selects an English voice installed on the device, when available. |
| Speed | Selects slow, normal or fast speech. |

Selecting a different voice or speed restarts the current narration when Auto-read is enabled.

## Adult role during a class

The adult chooses the chapter, session length and team count at setup. Team names are optional because default team names are supplied. During the session, the adult mainly operates the shared screen: scrolling when needed, clicking navigation controls and selecting options. Pip supplies the spoken explanations, lab guidance, question reading, clues and feedback. Students still discuss the science and click or tap their answers.

## Important limitation: speaking *to* the class, not listening *to* the class

This is browser text-to-speech. It does not use a microphone, recognise speech, interpret spoken student answers or grade oral responses. All answer selection remains on screen. No audio is uploaded and no AI service or API key is used for narration.

## Browser and device support

Voice availability depends on the speech-synthesis voices provided by the browser and operating system. The preferred voice order is English (India), English (United Kingdom), then another available English voice. Voice names and sound quality vary by device. The browser may require its first user interaction before playback; starting the class is that initial interaction. Some browsers or restricted devices may not offer speech synthesis. In that case, all written lesson content and controls remain available, while voice controls are disabled.

## Stage navigation

After a lesson answer is submitted, the page returns to the top to show the feedback and next action. Starting the next lesson, entering Wonder League, showing answer feedback, moving to the next question and opening the final report also return the page to the top. This avoids leaving the class midway down the previous stage.
