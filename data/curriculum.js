/*
 * Honest curriculum crosswalk for the two current WonderLab worlds.
 * Reference: NCF-SE 2023 learning standards and the Directorate of Education,
 * GNCT of Delhi, Grade 8 Science annual syllabus 2026–27 (Curiosity).
 * This is a reference map, not a claim of approval or complete textbook coverage.
 */
window.WONDERLAB_CURRICULUM = {
  reference: {
    title: 'Class 8 Science reference map',
    subtitle: 'NCF-SE 2023 learning standards, with Delhi DoE 2026–27 / Curiosity as a chapter-level example',
    note: 'Use this as a starting point. Check your own board, textbook edition and term plan before assigning a world.',
    sources: [
      { label: 'Delhi DoE Class 8 Science syllabus 2026–27', url: 'https://edustud.nic.in/edu/Syllabus_2026_27/8/8_SCIENCE_SYLLABUS_2026_27_EM.pdf' },
      { label: 'NCERT Curiosity Grade 8 textbook listing', url: 'https://ncert.nic.in/textbook.php?hecu1=0-13' },
      { label: 'National Curriculum Framework for School Education 2023', url: 'https://ncert.gov.in/pdf/focus-group/NCF-SE_2023EN.pdf' }
    ]
  },
  worlds: {
    cells: {
      label: 'Cell City',
      fit: 'Partial direct topic connection',
      reference: 'Delhi DoE 2026–27, Chapter 2: The Invisible Living World: Beyond Our Naked Eye; competency C-3.2 (cellular organisation).',
      outcome: 'Learners explain that cells are the basic units of living things and identify main cell parts.',
      coverage: 'Cell City covers a typical plant/animal cell and several main parts. It does not yet cover bacterial-cell comparison or the full microorganism strand in the syllabus. Use it as a supporting activity, not as the whole chapter.',
      teacherPrompt: 'Ask students to name the cell part they used and explain its job in their own words.'
    },
    materials: {
      label: 'Materials Town',
      fit: 'Cross-topic; selected direct links and enrichment',
      reference: 'Delhi DoE 2026–27, competencies C-1.1 (observable material properties) and C-1.3 (measurement), plus selected Chapter 9 solubility and measurement outcomes.',
      outcome: 'Learners observe material properties, compare how samples behave, and practise simple mass/volume and solution ideas.',
      coverage: 'The mixing activity supports selected solubility ideas; the measuring activity covers mass and volume by water displacement. Light Detective covers transparent, translucent and opaque properties under C-1.1, not mirrors or lenses. The world does not yet cover the full particle model (Chapter 7), elements/compounds/mixtures and separation (Chapter 8), or reflection, mirrors and lenses (Chapter 10). Bridge strength and natural sources are enrichment.',
      teacherPrompt: 'Ask students what they changed, what they observed and what evidence supports their conclusion.'
    }
  },
  missions: {
    'cell-scout': { status: 'Direct · partial', code: 'Ch. 2 / C-3.2', outcome: 'Identify the cell as a basic unit of living things and locate main parts.', evidence: 'Student explores and opens explanations for the nucleus, membrane, cytoplasm and other parts.' },
    'cell-builder': { status: 'Direct · partial', code: 'Ch. 2 / C-3.2; C-7.2', outcome: 'Place main cell parts in a simple model and connect each part to a basic job.', evidence: 'Student places parts in a cell model.' },
    'cell-gates': { status: 'Enrichment', code: 'Related to cell organisation', outcome: 'Describe the cell membrane as a boundary that controls movement in and out.', evidence: 'Student guides useful materials in and waste out.' },
    'cell-power': { status: 'Enrichment', code: 'Related to cell activities', outcome: 'Connect cells’ need for energy with the role of mitochondria.', evidence: 'Student activates the energy-pulse activity.' },
    'cell-plant': { status: 'Direct · partial', code: 'Ch. 2 / C-3.2', outcome: 'Identify key features of a typical plant cell.', evidence: 'Student uses sunlight, water and air controls and reviews the plant-cell recap.' },
    'cell-rescue': { status: 'Enrichment', code: 'C-7.1 / C-7.2', outcome: 'Relate a cell’s shape to the job it performs.', evidence: 'Student grows, stretches and guides three specialised cell models.' },
    'materials-scout': { status: 'Enrichment', code: 'Everyday materials', outcome: 'Give examples of materials from plants, animals and the Earth.', evidence: 'Student finds natural sources in the scene.' },
    'materials-bridge': { status: 'Enrichment · inquiry', code: 'C-6.2 / C-7.2', outcome: 'Compare sample materials under the same load and make a choice using an observation.', evidence: 'Student tests planks and observes bending or support.' },
    'materials-light': { status: 'Direct · partial', code: 'C-1.1 (transparent / translucent / opaque)', outcome: 'Distinguish transparent, translucent and opaque materials by how they pass light.', evidence: 'Student tests samples with a light beam. Mirrors and lenses are not covered here.' },
    'materials-mix': { status: 'Direct · partial', code: 'Ch. 9: Solutes, Solvents and Solutions', outcome: 'Observe which samples dissolve and distinguish a solution from a cloudy mixture.', evidence: 'Student adds and stirs samples, then observes dissolving, floating or settling.' },
    'materials-matter': { status: 'Direct · partial', code: 'C-1.3 / Ch. 9 measurement activities', outcome: 'Tell mass and volume apart and use a simple balance / water-displacement model.', evidence: 'Student weighs samples and measures volume by water displacement.' },
    'materials-sort': { status: 'Direct · partial', code: 'C-1.1 (observable properties)', outcome: 'Group samples by visible or touchable properties such as hardness and lustre.', evidence: 'Student sorts samples and sees a short explanation of the property.' }
  }
};
