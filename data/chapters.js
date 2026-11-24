window.WONDERLAB_CHAPTERS = [
  {
    id: 'cells', title: 'Cell: Structure and Functions', shortTitle: 'Cell City', art: 'cell-world', subtitle: 'A tiny world full of life.',
    description: 'Shrink down, explore a cell and help its tiny team get back to work.', status: 'available', theme: 'green',
    story: 'Pip has found a tiny world inside living things! Explore Cell City, try different science adventures and discover how each little cell part helps life work.',
    fact: 'All living things are made of cells. A cell is the smallest part of a living thing that can carry out life processes.',
    missions: [
      {
        id: 'cell-scout', number: '01', type: 'explore', title: 'Microscope Explorer', art: 'microscope', label: 'LOOK CLOSER',
        short: 'Find the tiny cell team', description: 'Use your microscope to look around a living cell.', objective: 'Explore the five glowing parts inside the cell.', reward: 35,
        intro: 'Pip has made the cell huge so you can explore it! Tap the glowing parts to meet the tiny team and learn what each part does.',
        spots: [
          { id: 'nucleus', name: 'Nucleus', art: 'nucleus', x: 48, y: 43, fact: 'The nucleus is like the control room. It holds instructions and helps direct what the cell does.' },
          { id: 'membrane', name: 'Cell membrane', art: 'membrane', x: 12, y: 49, fact: 'The cell membrane is a thin cover around the cell. It controls what can go in and what can come out.' },
          { id: 'cytoplasm', name: 'Cytoplasm', art: 'cytoplasm', x: 67, y: 68, fact: 'Cytoplasm is the jelly-like material inside the cell. Many cell jobs happen in it.' },
          { id: 'mitochondria', name: 'Mitochondria', art: 'mitochondria', x: 77, y: 34, fact: 'Mitochondria help release energy from food. The cell uses this energy to do its work.' },
          { id: 'vacuole', name: 'Vacuole', art: 'vacuole', x: 28, y: 73, fact: 'A vacuole is a storage space. It can hold water, food and other materials.' }
        ]
      },
      {
        id: 'cell-builder', number: '02', type: 'build', title: 'Cell Jigsaw Workshop', art: 'toolbox', label: 'BUILD IT',
        short: 'Put the cell together', description: 'The cell has come apart. Put its tiny parts back in the right places.', objective: 'Drag each cell part to its home.', reward: 45,
        intro: 'Cell City has turned into a jigsaw! Pick up each part and drop it on the place with the matching job. On a phone, tap a part, then tap its home.',
        slots: [
          { id: 'nucleus', title: 'Control room', clue: 'Holds instructions and directs cell work.' },
          { id: 'membrane', title: 'Cell border', clue: 'Controls what goes in and out.' },
          { id: 'cytoplasm', title: 'Jelly inside', clue: 'Fills the cell and is where many jobs happen.' },
          { id: 'mitochondria', title: 'Power station', clue: 'Helps release energy from food.' },
          { id: 'vacuole', title: 'Storage space', clue: 'Stores water and other materials.' }
        ],
        parts: [
          { id: 'nucleus', name: 'Nucleus', art: 'nucleus', note: 'The nucleus holds instructions and helps direct what the cell does.' },
          { id: 'membrane', name: 'Cell membrane', art: 'membrane', note: 'The cell membrane controls what can enter and leave the cell.' },
          { id: 'cytoplasm', name: 'Cytoplasm', art: 'cytoplasm', note: 'Cytoplasm is the jelly-like material inside a cell.' },
          { id: 'mitochondria', name: 'Mitochondria', art: 'mitochondria', note: 'Mitochondria help release energy from food.' },
          { id: 'vacuole', name: 'Vacuole', art: 'vacuole', note: 'Vacuoles store water, food and other materials.' }
        ]
      },
      {
        id: 'cell-gates', number: '03', type: 'gate', title: 'Membrane Traffic Control', art: 'membrane-gate', label: 'MOVE IT',
        short: 'Run the cell gates', description: 'The cell border is busy. Help useful things enter and waste leave.', objective: 'Guide every floating item to the right side of the cell.', reward: 40,
        intro: 'You are in charge of the cell gate! Drag each floating item to the inside or outside lane. Useful things come in. Waste goes out.',
        cargo: [
          { id: 'oxygen', art: 'oxygen', name: 'Oxygen', direction: 'in', why: 'Cells take in oxygen. It helps the cell release energy from food.' },
          { id: 'carbon-dioxide', art: 'carbon-dioxide', name: 'Carbon dioxide', direction: 'out', why: 'Cells make carbon dioxide during some life processes and send it out.' },
          { id: 'nutrients', art: 'nutrients', name: 'Food nutrients', direction: 'in', why: 'Cells take in nutrients to grow and carry out their jobs.' },
          { id: 'waste', art: 'waste', name: 'Waste', direction: 'out', why: 'Cells remove waste so it does not build up inside.' },
          { id: 'water', art: 'water', name: 'Water', direction: 'in', why: 'Cells need water for many life processes.' }
        ]
      },
      {
        id: 'cell-power', number: '04', type: 'pulse', title: 'Power Up the Cell', art: 'mitochondria', label: 'POWER UP',
        short: 'Send energy around the cell', description: 'The cell needs energy. Help its mitochondria send out energy pulses.', objective: 'Tap the power button to send seven energy pulses.', reward: 45,
        intro: 'Mitochondria help release energy from food. Tap the big button to send energy around Cell City and bring its lights back on!',
        pulses: 7,
        fact: 'Cells use energy to grow, repair themselves and carry out their jobs. Mitochondria help release energy from food.'
      },
      {
        id: 'cell-plant', number: '05', type: 'greenhouse', title: 'Plant Cell Greenhouse', art: 'plant-cell', label: 'GROW IT',
        short: 'Help a plant cell grow', description: 'Run a tiny greenhouse and watch a plant cell grow stronger.', objective: 'Let in sunlight, water and fresh air.', reward: 45,
        intro: 'A green plant cell is growing in Pip’s greenhouse. Help it by opening the sunny roof, watering the roots and letting fresh air in.',
        controls: [
          { id: 'sun', title: 'Open the sunny roof', action: 'Let the sunlight in', art: 'sun', fact: 'Chloroplasts contain chlorophyll. It helps green plant cells use sunlight to make food.' },
          { id: 'water', title: 'Water the little plant', action: 'Give it water', art: 'water', fact: 'Plant cells need water. A large vacuole can store water and help the cell stay firm.' },
          { id: 'air', title: 'Let fresh air in', action: 'Open the air vent', art: 'carbon-dioxide', fact: 'Green plants use carbon dioxide, water and sunlight to make food.' }
        ],
        finishFact: 'Look at the plant cell! The cell wall gives support, chloroplasts help make food, and the large vacuole stores cell sap.'
      },
      {
        id: 'cell-rescue', number: '06', type: 'shapes', title: 'Cell Shape Studio', art: 'nerve-cell', label: 'MAKE A CELL',
        short: 'Discover why cells have different shapes', description: 'Visit the shape studio and help three special cells do their jobs.', objective: 'Grow a nerve cell, stretch a muscle cell and guide a red blood cell.', reward: 70,
        intro: 'Not all cells look the same! Their shapes help them do different jobs. Let’s visit the shape studio and see how.',
        steps: [
          { id: 'nerve', title: 'Grow a nerve cell', kind: 'branches', art: 'nerve-cell', prompt: 'A nerve cell carries messages. Tap the three tiny buds to grow its long branches.', action: 'Grow a branch', fact: 'Nerve cells are long and have branches. Their shape helps them carry messages around the body.' },
          { id: 'muscle', title: 'Stretch a muscle cell', kind: 'stretch', art: 'muscle-cell', prompt: 'Muscle cells help us move. Slide the handle to stretch this muscle cell, then let it relax.', action: 'Let the muscle relax', fact: 'Muscle cells are long and can shorten and relax. This helps the body move.' },
          { id: 'blood', title: 'Send a red blood cell on its way', kind: 'travel', art: 'red-blood-cell', prompt: 'Guide the red blood cell through the little blood path. It is carrying oxygen around the body.', action: 'Move to the next bend', fact: 'Red blood cells have a flexible, disc-like shape. They carry oxygen around the body.' }
        ]
      }
    ]
  },
  {
    id: 'materials', title: 'Materials Around Us', shortTitle: 'Materials Lab', art: 'materials-market', subtitle: 'Try, test and discover.',
    description: 'Explore everyday materials and discover why each one is useful.', status: 'available', theme: 'purple',
    story: 'Welcome to Pip’s Materials Town! The town is getting ready for its Big Build Day. Help Pip find where materials come from, test what they can do, and choose the right material for each job. Every adventure is a new experiment!',
    fact: 'A material is the stuff an object is made from. Objects can be made from one material or from a mix of materials. People can also turn natural resources into new materials, such as paper from wood pulp and glass from sand.',
    missions: [
      {
        id: 'materials-scout', number: '01', type: 'explore', title: 'Nature’s Material Hunt', art: 'materials-market', label: 'LOOK FOR CLUES',
        short: 'Find where everyday materials begin', description: 'Explore the hills, farm and forest to find the things nature gives us.', objective: 'Find all five natural material clues.', reward: 40,
        intro: 'Pip has lost the labels in Materials Town! Look around the scene and tap the five glowing clues. You will find out how plants, animals and the earth give us useful materials.',
        stageKicker: 'MATERIAL TREASURE HUNT', stageTitle: 'Where do materials begin?', stagePrompt: 'Tap each glowing picture to discover a material and where it comes from.',
        sceneArt: 'materials-market', sceneAlt: 'A sunny scene with a tree, a sheep, a cotton plant and rocks.',
        discoverAllTitle: 'You found nature’s treasure!',
        discoverAllMessage: 'Materials can come from plants, animals, rocks and soil. People can work with these natural resources to make useful things. Paper can be made from wood pulp, and glass can be made by heating sand with other materials.',
        spots: [
          { id: 'tree-source', name: 'Tree', art: 'wood-board', x: 15, y: 39, fact: 'Trees give us wood. Wood can be used to make tables, doors and many other things. Paper can also be made from wood pulp.' },
          { id: 'sheep-source', name: 'Sheep', art: 'sheep-wool', x: 47, y: 64, fact: 'Wool comes from the fleece of sheep and some other animals. People use wool to make warm clothes and blankets.' },
          { id: 'cotton-source', name: 'Cotton plant', art: 'cotton-plant', x: 72, y: 38, fact: 'Cotton fibres grow around the seeds of a cotton plant. The fibres are spun into yarn and made into cloth.' },
          { id: 'clay-source', name: 'Clay and soil', art: 'clay-lump', x: 87, y: 76, fact: 'Clay comes from the earth. It can be shaped while wet and made into pots, tiles and bricks.' },
          { id: 'rock-source', name: 'Rocks', art: 'stone-sample', x: 28, y: 82, fact: 'Rocks contain minerals. Some metals are obtained from minerals found in rocks. Stone is also used in buildings and roads.' }
        ]
      },
      {
        id: 'materials-bridge', number: '02', type: 'bridge', title: 'Bridge Builder Bay', art: 'bridge-river', label: 'TEST THE PLANKS',
        short: 'Build a bridge that can hold a toy cart', description: 'Try different planks and see which one is strong enough.', objective: 'Find a plank that can carry three toy carts safely.', reward: 50,
        intro: 'Oh no! The little bridge over the stream is broken. Try the sample planks, then send toy carts across. Watch what happens when a plank is too weak. A good builder chooses a material for the job!',
        requiredLoads: 3,
        materials: [
          { id: 'paper-plank', name: 'Paper board', art: 'paper-board', capacity: 1, fact: 'This paper board bends under a heavy load. Paper is useful for many things, but this thin strip is not strong enough for our bridge.' },
          { id: 'cardboard-plank', name: 'Cardboard', art: 'cardboard', capacity: 2, fact: 'This cardboard holds a little weight, but it bends when more carts arrive. The thickness and strength of a material matter.' },
          { id: 'wood-plank', name: 'Wood plank', art: 'wood-board', capacity: 3, fact: 'This wood plank holds all three toy carts in our test. Wood can be a useful building material because a suitable plank is strong and rigid.' },
          { id: 'metal-plank', name: 'Metal bar', art: 'metal-bar', capacity: 5, fact: 'The metal bar holds the carts in our test. Many metals are strong and are used in bridges and buildings.' }
        ],
        finishFact: 'The best material depends on the job. Builders think about properties such as strength, hardness, weight and cost before choosing a material.'
      },
      {
        id: 'materials-light', number: '03', type: 'lightlab', title: 'The Light Detective Lab', art: 'flashlight', label: 'SHINE A LIGHT',
        short: 'Find out what light can pass through', description: 'Use Pip’s flashlight to test three different materials.', objective: 'Shine the light through all three samples.', reward: 50,
        intro: 'Pip wants to make a bright reading room. Some materials let us see clearly through them, some make things look blurry, and some block the view. Turn on the flashlight and test each sample!',
        samples: [
          { id: 'clear-glass', name: 'Clear glass', art: 'glass-sample', kind: 'transparent', effect: 'clear', result: 'You can see the picture clearly through the glass.', fact: 'Clear glass is transparent. Light passes through it, and we can see objects clearly through it. That is why it is useful for many windows.' },
          { id: 'frosted-glass', name: 'Frosted glass', art: 'frosted-glass', kind: 'translucent', effect: 'soft', result: 'Light comes through, but the picture looks blurry.', fact: 'Frosted glass is translucent. It lets some light pass through, but we cannot see a clear picture through it.' },
          { id: 'wood-panel', name: 'Wood panel', art: 'wood-board', kind: 'opaque', effect: 'blocked', result: 'The wood blocks the light. The picture cannot be seen.', fact: 'Wood is opaque. Light cannot pass through it, so we cannot see through a wooden door.' }
        ],
        finishFact: 'Materials can be grouped by how much light passes through them: transparent, translucent or opaque.'
      },
      {
        id: 'materials-mix', number: '04', type: 'mixlab', title: 'The Magic Mixing Lab', art: 'mixing-lab', label: 'STIR AND SEE',
        short: 'Discover what dissolves in water', description: 'Add a sample to the water, stir it and watch what happens.', objective: 'Test all five mystery samples.', reward: 55,
        intro: 'The mixing lab is full of mystery jars! Add one sample to the water and give it three good stirs. Does it spread through the water, sink to the bottom or float? Let’s find out.',
        stirsNeeded: 3,
        samples: [
          { id: 'salt-sample', name: 'Salt', art: 'salt-crystals', result: 'dissolves', outcome: 'The salt seems to disappear into the water.', fact: 'Salt is soluble in water. It dissolves and spreads through the water, even though we can no longer see the salt grains.' },
          { id: 'sugar-sample', name: 'Sugar', art: 'sugar-crystals', result: 'dissolves', outcome: 'The sugar dissolves and the water looks clear.', fact: 'Sugar is soluble in water too. Stirring helps it dissolve faster. The sugar is still in the water, even though we cannot see it.' },
          { id: 'sand-sample', name: 'Sand', art: 'sand-sample', result: 'sinks', outcome: 'The sand grains settle at the bottom.', fact: 'Sand is insoluble in water. It does not dissolve. The grains settle at the bottom when the water is left still.' },
          { id: 'chalk-sample', name: 'Chalk powder', art: 'chalk-powder', result: 'cloudy', outcome: 'The water turns cloudy. The chalk has not dissolved.', fact: 'Chalk powder is insoluble in water. Tiny bits spread through the water for a while, making it cloudy, but they do not dissolve.' },
          { id: 'sawdust-sample', name: 'Sawdust', art: 'sawdust', result: 'floats', outcome: 'The tiny wood pieces float on top.', fact: 'Sawdust does not dissolve in water. It often floats because it is light and has air spaces between the tiny pieces.' }
        ],
        finishFact: 'A material that dissolves in water is called soluble. A material that does not dissolve is called insoluble. Stirring can help, but it cannot make every material dissolve.'
      },
      {
        id: 'materials-matter', number: '05', type: 'matterlab', title: 'The Matter Measuring Mission', art: 'matter-lab', label: 'WEIGH AND MEASURE',
        short: 'Find out how much matter is in an object', description: 'Use a balance and a water jar to measure three objects.', objective: 'Weigh each object, then find how much space it takes up.', reward: 60,
        intro: 'Pip’s measuring station is ready! First, place each object on the balance to see its mass. Then lower it into the water jar and watch the water level rise. Every object has mass and takes up space.',
        startWater: 50,
        samples: [
          { id: 'stone-object', name: 'Stone', art: 'stone-sample', mass: 30, volume: 10, factMass: 'The stone has a mass of 30 grams in our game. Mass tells us how much matter an object has.', factVolume: 'The water rises from 50 mL to 60 mL. The stone takes up 10 mL of space. This is its volume.' },
          { id: 'metal-object', name: 'Metal bolt', art: 'metal-bar', mass: 18, volume: 3, factMass: 'The metal bolt has a mass of 18 grams in our game. A small object can still have quite a lot of mass.', factVolume: 'The water rises from 50 mL to 53 mL. The bolt takes up 3 mL of space.' },
          { id: 'glass-object', name: 'Glass marble', art: 'glass-sample', mass: 20, volume: 8, factMass: 'The glass marble has a mass of 20 grams in our game. A balance helps us measure mass.', factVolume: 'The water rises from 50 mL to 58 mL. The marble takes up 8 mL of space.' }
        ],
        finishFact: 'Matter is anything that has mass and takes up space. Mass tells us how much matter there is. Volume tells us how much space it takes up. The rise in water helps us measure the volume of an object.'
      },
      {
        id: 'materials-sort', number: '06', type: 'sorter', title: 'The Material Sorting Carnival', art: 'sorting-yard', label: 'SORT THE SAMPLES',
        short: 'Group materials by their properties', description: 'Help Pip sort mystery samples into the right groups.', objective: 'Finish both sorting games at the carnival.', reward: 70,
        intro: 'The Material Carnival has opened! The samples have got mixed up. Sort them by what they are like. First, look at which ones are hard or soft. Then spot the shiny and dull ones.',
        rounds: [
          {
            id: 'touch', title: 'Hard or soft?', prompt: 'Sort each sample by how it feels when pressed or scratched.',
            bins: [
              { id: 'hard', label: 'Hard', hint: 'Difficult to press or scratch.' },
              { id: 'soft', label: 'Soft', hint: 'Can be pressed or scratched more easily.' }
            ],
            items: [
              { id: 'stone-hard', name: 'Stone', art: 'stone-sample', category: 'hard', fact: 'Stone is hard. It is difficult to press or scratch.' },
              { id: 'sponge-soft', name: 'Sponge', art: 'sponge', category: 'soft', fact: 'A sponge is soft. It can be pressed and squeezed.' },
              { id: 'cotton-soft', name: 'Cotton ball', art: 'cotton-ball', category: 'soft', fact: 'Cotton is soft and can be pressed into a smaller shape.' },
              { id: 'spoon-hard', name: 'Metal spoon', art: 'metal-spoon', category: 'hard', fact: 'A metal spoon is hard and keeps its shape when we press it.' },
              { id: 'wood-hard', name: 'Wood', art: 'wood-board', category: 'hard', fact: 'Wood is usually hard and can be used to make furniture.' },
              { id: 'wool-soft', name: 'Wool', art: 'sheep-wool', category: 'soft', fact: 'Wool fibres are soft and are used to make warm clothes.' }
            ],
            finishFact: 'Hardness is one property we can use to group materials. We can also group materials by colour, shine, texture and other properties.'
          },
          {
            id: 'shine', title: 'Shiny or dull?', prompt: 'Now sort the samples by how their surfaces look.',
            bins: [
              { id: 'shiny', label: 'Shiny', hint: 'Reflects light and looks bright.' },
              { id: 'dull', label: 'Dull', hint: 'Does not have a shiny surface.' }
            ],
            items: [
              { id: 'foil-shiny', name: 'Aluminium foil', art: 'aluminium-foil', category: 'shiny', fact: 'Aluminium foil has a shiny surface. The shine of a material is called lustre.' },
              { id: 'coin-shiny', name: 'Copper coin', art: 'coin-shiny', category: 'shiny', fact: 'A clean copper coin can look shiny. Shiny surfaces reflect more light towards our eyes.' },
              { id: 'spoon-shiny', name: 'Steel spoon', art: 'metal-spoon', category: 'shiny', fact: 'A polished steel spoon has a shiny surface.' },
              { id: 'wood-dull', name: 'Wood', art: 'wood-board', category: 'dull', fact: 'Unpolished wood usually looks dull rather than shiny.' },
              { id: 'coal-dull', name: 'Coal', art: 'coal-sample', category: 'dull', fact: 'This piece of coal has a dull surface. Not every dark material is shiny.' },
              { id: 'chalk-dull', name: 'Chalk', art: 'chalk-powder', category: 'dull', fact: 'Chalk has a dull surface. This is another way to describe how a material looks.' }
            ],
            finishFact: 'Grouping materials is called classification. We can choose a property—like hardness or shine—and place materials with similar properties together.'
          }
        ],
        finishFact: 'Well done! Materials have different properties. By observing and testing them, we can group them and choose the right material for the right job.'
      }
    ]
  },
  {
    id: 'force-motion', title: 'Force and Motion', shortTitle: 'Move It!', art: 'force-world', subtitle: 'Push, pull and move.',
    description: 'Discover what makes things start, stop and move.', status: 'coming', theme: 'orange',
    story: 'The motion playground is charging up. Soon you will push, pull, race and experiment.',
    fact: 'A force is a push or a pull. It can change how an object moves or its shape.', missions: []
  }
];

// Short, child-friendly discovery cards shown after each completed adventure.
// Keep the wording simple and focus on the science students just explored.
window.WONDERLAB_LEARNING_RECAPS = {
  'cell-scout': {
    art: 'cell-world', title: 'Meet the cell’s tiny team',
    intro: 'A cell is a tiny living unit. Its parts work together, and each part has its own job.',
    points: [
      'The nucleus holds instructions and helps direct many cell activities.',
      'The cell membrane is a thin border that controls what enters and leaves.',
      'Cytoplasm fills the inside. Mitochondria help release energy, and vacuoles store materials.'
    ],
    tryTitle: 'Spot a cell in a picture',
    tryIt: 'Look at a plant or animal cell diagram. Can you find the nucleus and trace the cell membrane?'
  },
  'cell-builder': {
    art: 'cell-blueprint', title: 'Every cell part has a place',
    intro: 'You put the cell back together. Now you know how its main parts work as a team.',
    points: [
      'The nucleus holds the cell’s instructions.',
      'The membrane controls what goes in and out, while cytoplasm fills the cell.',
      'Mitochondria help release energy from food, and vacuoles store materials such as water.'
    ],
    tryTitle: 'Be the cell builder',
    tryIt: 'Draw a simple cell and label three parts you remember. Add one line about each part’s job.'
  },
  'cell-gates': {
    art: 'membrane-gate', title: 'The cell has a smart border',
    intro: 'The cell membrane helps the cell manage what moves in and what moves out.',
    points: [
      'Cells take in useful materials such as water, oxygen and nutrients.',
      'Cells remove waste materials so they do not build up inside.',
      'The cell membrane controls movement across the cell’s boundary.'
    ],
    tryTitle: 'Think of a doorway',
    tryIt: 'Imagine a doorway that lets needed things in and sends rubbish out. That is one way to picture the cell membrane’s job.'
  },
  'cell-power': {
    art: 'mitochondria', title: 'Cells need energy to do their jobs',
    intro: 'Your power-up showed why cells need a steady supply of usable energy.',
    points: [
      'Mitochondria help release energy from food.',
      'Cells use energy to grow, repair themselves and carry out their activities.',
      'Different cells use energy for different jobs, such as moving or sending messages.'
    ],
    tryTitle: 'Connect it to your day',
    tryIt: 'Your muscle cells use energy when you walk, play or climb stairs.'
  },
  'cell-plant': {
    art: 'plant-cell', title: 'Plant cells have some special parts',
    intro: 'You helped a plant cell grow. Plant cells share some parts with animal cells, but they also have special features.',
    points: [
      'The cell wall is a firm outer layer that supports and protects the plant cell.',
      'Chloroplasts contain chlorophyll and help green plant cells use sunlight to make food.',
      'A large central vacuole stores cell sap and helps the cell stay firm.'
    ],
    tryTitle: 'Look closely at a leaf',
    tryIt: 'Leaves are made of plant cells. Find a plant-cell picture and look for the cell wall, chloroplasts and large vacuole.'
  },
  'cell-rescue': {
    art: 'nerve-cell', title: 'A cell’s shape helps it do its job',
    intro: 'Not all cells look alike. Their shapes help them do different jobs in the body.',
    points: [
      'Nerve cells have long branches that help carry messages.',
      'Muscle cells can shorten and relax, helping the body move.',
      'Red blood cells are flexible and carry oxygen around the body.'
    ],
    tryTitle: 'Shape has a purpose',
    tryIt: 'Compare a nerve cell and a red blood cell picture. Their very different shapes match their different jobs.'
  },
  'materials-scout': {
    art: 'materials-market', title: 'Materials begin in nature',
    intro: 'You found that many useful materials come from plants, animals and the Earth.',
    points: [
      'Wood comes from trees, cotton comes from cotton plants, and wool comes from animals such as sheep.',
      'Clay and stone come from the Earth. Rocks can contain useful minerals.',
      'People can change natural materials to make new things, such as paper from wood pulp.'
    ],
    tryTitle: 'Become a material detective',
    tryIt: 'Look around your room. Choose one object and think about where its material may have come from.'
  },
  'materials-bridge': {
    art: 'bridge-river', title: 'Choose a material for the job',
    intro: 'Your bridge tests showed that materials do not all behave in the same way under a load.',
    points: [
      'Strength and stiffness are useful properties when a material must hold a load.',
      'A thin paper board may bend more than a thick wooden plank in our bridge test.',
      'Builders choose materials by thinking about the job, the load, the design and the cost.'
    ],
    tryTitle: 'Look at a real bridge',
    tryIt: 'Notice what a nearby bridge is made from. Real bridges also need a strong design and well-placed supports.'
  },
  'materials-light': {
    art: 'flashlight', title: 'Light behaves differently with each material',
    intro: 'Your flashlight test showed three ways materials can let light through.',
    points: [
      'Transparent materials let most light pass through, so we can see clearly through them.',
      'Translucent materials let some light pass through, but objects look blurry.',
      'Opaque materials block light, so we cannot see through them.'
    ],
    tryTitle: 'Notice light around you',
    tryIt: 'Look at a clear window, a frosted bathroom window and a wooden door. How does each one change what you can see?'
  },
  'materials-mix': {
    art: 'mixing-lab', title: 'Some materials dissolve, and some do not',
    intro: 'Stirring helped you see how different samples behave in water.',
    points: [
      'Salt and sugar dissolve in water. They are called soluble in water.',
      'Sand and chalk do not dissolve. They are insoluble; chalk can make water look cloudy before settling.',
      'Sawdust can float on the surface. Stirring mixes a sample, but it does not make every material dissolve.'
    ],
    tryTitle: 'Spot dissolving in daily life',
    tryIt: 'Notice what happens when a little sugar is stirred into a drink. The sugar dissolves, even though it is still there.'
  },
  'materials-matter': {
    art: 'matter-lab', title: 'Mass and volume tell us different things',
    intro: 'You used a balance and a measuring jar to find out about the objects.',
    points: [
      'Mass tells us how much matter an object has. It is often measured in grams (g) or kilograms (kg).',
      'Volume tells us how much space an object takes up. Liquids are often measured in millilitres (mL).',
      'When an object goes into water, the rise in the water level can help us find its volume.'
    ],
    tryTitle: 'Read a measuring scale',
    tryIt: 'Look at the markings on a measuring jug. The space between the starting and ending water levels tells you how much the level changed.'
  },
  'materials-sort': {
    art: 'sorting-yard', title: 'Materials have different properties',
    intro: 'You grouped samples by noticing what they are like. This is called classification.',
    points: [
      'Hard materials are difficult to press or scratch. Soft materials are easier to press or change in shape.',
      'Shiny surfaces reflect light. The shine of a material is also called lustre.',
      'One object can have many properties. We choose one property at a time when we sort materials.'
    ],
    tryTitle: 'Sort things around you',
    tryIt: 'Choose a spoon, a sponge and a piece of wood. Compare how hard, soft or shiny each one is.'
  }
};

