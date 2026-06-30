import { CramSession } from './types';

export const SAMPLE_CRAM_SESSIONS: CramSession[] = [
  {
    id: 'demo-astrophysics-crammer',
    title: 'Astrophysics: Stellar Evolution Cheat Sheet',
    createdAt: new Date(Date.now() - 3600000).toLocaleString(),
    fileName: 'stellar_evolution_notes_final.pdf',
    fileSize: '1.2 MB',
    presetId: 'crammer',
    cheatSheet: JSON.stringify({
      summary: 'A dense study scope on stellar life cycles, covering nebular collapse, nuclear fusion pathways, degenerate states (white dwarfs/neutron stars), and black hole mass limits.',
      keyConcepts: [
        {
          term: 'Hydrostatic Equilibrium',
          explanation: 'The balance between inward gravitational collapse and outward thermal pressure from nuclear fusion inside a stable star (like our Sun).'
        },
        {
          term: 'Proton-Proton Chain Reaction',
          explanation: 'The dominant fusion pathway in main-sequence stars under 1.5 solar masses, converting four protons into helium-4.'
        },
        {
          term: 'CNO Cycle (Carbon-Nitrogen-Oxygen)',
          explanation: 'The catalytic fusion cycle dominant in stars heavier than 1.5 solar masses, requiring higher core temperatures to fuse hydrogen to helium.'
        },
        {
          term: 'Chandrasekhar Limit',
          explanation: 'The absolute maximum mass limit (~1.4 solar masses) of a stable white dwarf star supported by electron degeneracy pressure.'
        },
        {
          term: 'Tolman-Oppenheimer-Volkoff (TOV) Limit',
          explanation: 'The maximum mass limit (~2.17 solar masses) for neutron stars, beyond which neutron degeneracy pressure fails, triggering black hole collapse.'
        },
        {
          term: 'Triple-Alpha Process',
          explanation: 'The nuclear fusion reaction converting three helium nuclei (alpha particles) into a carbon-12 nucleus, occurring in red giant phases.'
        },
        {
          term: 'Schwarzschild Radius',
          explanation: 'The radius of the event horizon of a non-rotating black hole, inside of which escape velocity exceeds the speed of light.'
        },
        {
          term: 'Hertzsprung-Russell (H-R) Diagram',
          explanation: 'The fundamental scatter graph plotting star luminosity against surface temperatures, showing main sequence bands and evolutionary tracks.'
        },
        {
          term: 'Nucleosynthesis',
          explanation: 'The process of creating new atomic nuclei from pre-existing nucleons, occurring within stars and during supernova explosions.'
        },
        {
          term: 'Stellar Wind',
          explanation: 'The continuous outflow of gas and plasma from a star\'s upper atmosphere into interstellar space, escalating as stars age.'
        }
      ],
      formulasAndDefinitions: [
        {
          term: 'Chandrasekhar Limit Equation',
          explanation: 'M_Ch ≈ 1.4 M_☉ (Maximum mass of an electron-degenerate white dwarf)'
        },
        {
          term: 'Schwarzschild Radius Formula',
          explanation: 'R_s = 2GM / c² (Defines event horizon boundary for mass M)'
        },
        {
          term: 'Luminosity-Mass Relation',
          explanation: 'L ∝ M^3.5 (For main-sequence stars, showing high-mass stars burn fuel exponentially faster)'
        },
        {
          term: 'Degeneracy Pressure',
          explanation: 'P_deg ∝ ρ^(5/3) (Quantum mechanical pressure arising from the Pauli Exclusion Principle)'
        }
      ],
      likelyExamTopics: [
        {
          topic: 'Stellar End-States by Mass',
          context: 'Focus on memorizing the thresholds: Stars < 8 M_☉ end as White Dwarfs. Stars 8-20 M_☉ end as Neutron Stars. Stars > 20 M_☉ end as Stellar-mass Black Holes.'
        },
        {
          topic: 'Evolution off the Main Sequence',
          context: 'Explain the sequence: core hydrogen depletion -> core contraction -> envelope expansion -> helium flash -> triple-alpha helium fusion.'
        },
        {
          topic: 'Pauli Exclusion Principle applications',
          context: 'Understand how electron and neutron degeneracy pressures prevent gravitational collapse without nuclear fuel.'
        }
      ],
      memoryTricks: [
        {
          concept: 'Chandrasekhar White Dwarf mass limit',
          trick: 'Chandra is "1.4" characters short of 2. (Limit is 1.4 solar masses).'
        },
        {
          concept: 'TOV Neutron Star mass limit',
          trick: 'TOV has "Two" letters plus some change (Limit is ~2.2 solar masses).'
        },
        {
          concept: 'P-P Chain vs CNO Cycle',
          trick: 'P-P is "Plain Proton" (smaller stars like Sun). CNO is "Catalytic & Outstanding" (hot, massive stars).'
        }
      ]
    })
  },
  {
    id: 'demo-astrophysics-flashcards',
    title: 'Astrophysics: recall deck',
    createdAt: new Date(Date.now() - 1800000).toLocaleString(),
    fileName: 'stellar_evolution_notes_final.pdf',
    fileSize: '1.2 MB',
    presetId: 'flashcards',
    cheatSheet: JSON.stringify({
      flashcards: [
        {
          question: 'What exact physical balance keeps a star stable on the Main Sequence?',
          answer: 'Hydrostatic Equilibrium, which is the perfect balancing match between inward gravitational force and outward thermal gas/radiation pressure.',
          hint: 'Balance of forces.'
        },
        {
          question: 'What is the Chandrasekhar limit, and why is it physically significant?',
          answer: 'It is approximately 1.4 Solar Masses. Above this mass limit, electron degeneracy pressure can no longer withstand the star\'s gravity, causing a white dwarf to collapse into a neutron star or supernova.',
          hint: 'The breaking point for white dwarfs.'
        },
        {
          question: 'Explain the Triple-Alpha Process briefly.',
          answer: 'It is the nuclear fusion reaction that combines three helium nuclei (alpha particles) into a single carbon-12 nucleus, occurring at high temperatures inside helium-burning red giant stars.',
          hint: 'Starts with helium, ends with carbon.'
        },
        {
          question: 'What prevents a neutron star from collapsing into a black hole?',
          answer: 'Neutron Degeneracy Pressure, which arises from neutrons obeying the Pauli Exclusion Principle and refusing to occupy the same quantum states.',
          hint: 'Fermions in close quarters.'
        }
      ]
    })
  },
  {
    id: 'demo-astrophysics-quiz',
    title: 'Astrophysics: Mock practice exam',
    createdAt: new Date(Date.now() - 600000).toLocaleString(),
    fileName: 'stellar_evolution_notes_final.pdf',
    fileSize: '1.2 MB',
    presetId: 'quiz',
    cheatSheet: JSON.stringify({
      questions: [
        {
          question: 'A main-sequence star with a mass of 15 Solar Masses will most likely end its lifecycle as which of the following objects?',
          options: [
            'A stable Helium White Dwarf star',
            'A Neutron Star supported by neutron degeneracy pressure',
            'A Stellar-mass Black Hole',
            'A planetary nebula with a carbon-oxygen core core remnant'
          ],
          correctOptionIndex: 1,
          explanation: 'Stars born between roughly 8 and 20 Solar Masses burn through nuclear fuels and undergo gravitational collapse after core iron formation. The remnant core mass is above the Chandrasekhar limit but below the Tolman-Oppenheimer-Volkoff limit, ending its life as a stable Neutron Star.'
        },
        {
          question: 'What occurs when a red giant star exceeds the Chandrasekhar limit in a binary stellar companion setup?',
          options: [
            'It undergoes a violent Type Ia Supernova detonation',
            'It collapses quietly into a black dwarf',
            'It forms a helium-rich white dwarf',
            'It expands and starts hydrogen fusion in the outer shell'
          ],
          correctOptionIndex: 0,
          explanation: 'In a close binary system, if a carbon-oxygen White Dwarf star accretes mass from its companion and is pushed beyond the 1.4 Solar Mass Chandrasekhar limit, it undergoes runaway carbon fusion, culminating in a catastrophic Type Ia Supernova explosion with zero remnant.'
        },
        {
          question: 'The Schwarzschild Radius is directly proportional to which stellar physical property?',
          options: [
            'Core temperature',
            'Star luminosity',
            'Total remnant mass',
            'Stellar spin rate'
          ],
          correctOptionIndex: 2,
          explanation: 'The Schwarzschild Radius (Rs = 2GM/c²) is directly proportional to the Mass (M) of the black hole. The bigger the mass, the larger the radius of its event horizon boundary.'
        }
      ]
    })
  },
  {
    id: 'demo-astrophysics-simplifier',
    title: 'Astrophysics: Feynman translations',
    createdAt: new Date(Date.now() - 300000).toLocaleString(),
    fileName: 'stellar_evolution_notes_final.pdf',
    fileSize: '1.2 MB',
    presetId: 'simplifier',
    cheatSheet: JSON.stringify({
      simplifiedTopics: [
        {
          originalConcept: 'Hydrostatic Equilibrium',
          simpleExplanation: 'It is a stable stand-off between squeezing in and pushing out. Gravity squeezes the star into a tiny ball, while the hot nuclear explosions in the center push outward. When they match exactly, the star stays the same size.',
          analogy: 'Imagine squeezing a balloon. Your hands are squeezing in (gravity), but the air inside is pushing out (heat). If you match them perfectly, the balloon stays still.'
        },
        {
          originalConcept: 'Pauli Exclusion Principle (Degeneracy Pressure)',
          simpleExplanation: 'Certain tiny particles (like electrons or neutrons) have a strict rule: they absolutely hate sharing the same room or state. If you try to squeeze them into the same tight space, they fight back with immense power. This resistance forms a strong invisible wall that stops gravity.',
          analogy: 'Imagine a super packed bus where every passenger refuses to sit on another passenger\'s lap. If you try to shove more people in, they push back against the doors with force!'
        },
        {
          originalConcept: 'Schwarzschild Radius (Black Hole Horizon)',
          simpleExplanation: 'This is the danger zone boundary around a black hole. Once you cross this line, gravity is so incredibly strong that you would have to travel faster than light to escape—which is impossible! Even light itself is trapped.',
          analogy: 'Imagine a giant waterslide with a point of no return. Once you pass a certain line, the water is sliding down too fast and you can never climb back up.'
        }
      ]
    })
  }
];
