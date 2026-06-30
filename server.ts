import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs/promises";
import { readFileSync } from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

// ── Firebase Admin & Firestore Initialization ───────────────────────────────
let firebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  firebaseConfig = JSON.parse(readFileSync(configPath, "utf8"));
} catch (e) {
  console.warn("[DB] Could not load firebase-applet-config.json:", e);
}

let isFirestoreHealthy = false;
let firestoreDb: any = null;

try {
  if (!getApps().length) {
    const saEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    const initOpts: any = {};
    if (firebaseConfig?.projectId) {
      initOpts.projectId = firebaseConfig.projectId;
    }
    
    if (saEnv) {
      try {
        const serviceAccount = JSON.parse(saEnv);
        initOpts.credential = cert(serviceAccount);
        initializeApp(initOpts);
        console.log("[DB] Firebase Admin initialized with Service Account credentials");
      } catch (err) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT secret:", err);
        initializeApp(initOpts);
        console.log("[DB] Firebase Admin initialized with default credentials");
      }
    } else {
      initializeApp(initOpts);
      console.log("[DB] Firebase Admin initialized with default credentials");
    }
  }

  const dbId = firebaseConfig?.firestoreDatabaseId;
  if (dbId) {
    firestoreDb = getFirestore(undefined, dbId);
    console.log(`[DB] Firestore initialized with project ID: ${firebaseConfig.projectId} and database ID: ${dbId}`);
  } else {
    firestoreDb = getFirestore();
    console.log("[DB] Firestore initialized with default database");
  }
  isFirestoreHealthy = true;
} catch (err: any) {
  console.warn("[DB] Could not initialize Firestore database client:", err?.message || err);
  isFirestoreHealthy = false;
}

// ── Local Fallback Database Configuration ────────────────────────────────────
const DB_PATH = path.join(process.cwd(), "db.json");

interface LocalUser {
  username: string;
  passwordHash: string;
}

interface LocalSession {
  id: string;
  userId: string;
  [key: string]: any;
}

interface DatabaseSchema {
  users: Record<string, LocalUser>;
  sessions: Record<string, LocalSession>;
}

async function initDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    const initialData: DatabaseSchema = { users: {}, sessions: {} };
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

async function readDb(): Promise<DatabaseSchema> {
  try {
    const content = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading database file, returning default data:", err);
    return { users: {}, sessions: {} };
  }
}

async function writeDb(data: DatabaseSchema): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

async function safeGetUser(username: string): Promise<LocalUser | null> {
  if (isFirestoreHealthy && firestoreDb) {
    try {
      const docRef = firestoreDb.collection("users").doc(username);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        return docSnap.data() as LocalUser;
      }
    } catch (err: any) {
      console.warn("[DB] Firestore getUser failed, falling back to db.json. Error:", err?.message || err);
      if (err?.message?.includes("PERMISSION_DENIED") || err?.message?.includes("googleapis")) {
        isFirestoreHealthy = false;
      }
    }
  }

  await initDb();
  const db = await readDb();
  return db.users[username] || null;
}

async function safeSetUser(username: string, data: LocalUser): Promise<void> {
  if (isFirestoreHealthy && firestoreDb) {
    try {
      await firestoreDb.collection("users").doc(username).set(data);
    } catch (err: any) {
      console.warn("[DB] Firestore setUser failed, falling back to db.json. Error:", err?.message || err);
      if (err?.message?.includes("PERMISSION_DENIED") || err?.message?.includes("googleapis")) {
        isFirestoreHealthy = false;
      }
    }
  }

  await initDb();
  const db = await readDb();
  db.users[username] = data;
  await writeDb(db);
}

async function safeGetSessions(userId: string): Promise<LocalSession[]> {
  if (isFirestoreHealthy && firestoreDb) {
    try {
      const snapshot = await firestoreDb
        .collection("sessions")
        .where("userId", "==", userId)
        .get();
      
      const userSessions = snapshot.docs.map((doc: any) => doc.data() as LocalSession);
      userSessions.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      return userSessions;
    } catch (err: any) {
      console.warn("[DB] Firestore getSessions failed, falling back to db.json. Error:", err?.message || err);
      if (err?.message?.includes("PERMISSION_DENIED") || err?.message?.includes("googleapis")) {
        isFirestoreHealthy = false;
      }
    }
  }

  await initDb();
  const db = await readDb();
  const userSessions = Object.values(db.sessions).filter((s) => s.userId === userId);
  userSessions.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  return userSessions;
}

async function safeSaveSession(id: string, data: LocalSession): Promise<void> {
  if (isFirestoreHealthy && firestoreDb) {
    try {
      await firestoreDb.collection("sessions").doc(id).set(data);
    } catch (err: any) {
      console.warn("[DB] Firestore saveSession failed, falling back to db.json. Error:", err?.message || err);
      if (err?.message?.includes("PERMISSION_DENIED") || err?.message?.includes("googleapis")) {
        isFirestoreHealthy = false;
      }
    }
  }

  await initDb();
  const db = await readDb();
  db.sessions[id] = data;
  await writeDb(db);
}

async function safeDeleteSession(id: string, userId: string): Promise<boolean> {
  if (isFirestoreHealthy && firestoreDb) {
    try {
      const docRef = firestoreDb.collection("sessions").doc(id);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const session = docSnap.data() as LocalSession;
        if (session.userId === userId) {
          await docRef.delete();
          // Also sync deletion locally
          await initDb();
          const db = await readDb();
          if (db.sessions[id]) {
            delete db.sessions[id];
            await writeDb(db);
          }
          return true;
        }
        return false;
      }
    } catch (err: any) {
      console.warn("[DB] Firestore deleteSession failed, falling back to db.json. Error:", err?.message || err);
      if (err?.message?.includes("PERMISSION_DENIED") || err?.message?.includes("googleapis")) {
        isFirestoreHealthy = false;
      }
    }
  }

  await initDb();
  const db = await readDb();
  const session = db.sessions[id];
  if (!session) {
    return false;
  }
  if (session.userId !== userId) {
    return false;
  }
  delete db.sessions[id];
  await writeDb(db);
  return true;
}
// ────────────────────────────────────────────────────────────────────────────

// Helper function to initialize GoogleGenAI securely
function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please configure GEMINI_API_KEY in the Secrets panel or provide a custom key.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper function to call generateContent with retry and friendly error messages
async function generateContentWithRetry(ai: any, params: any, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      attempt++;
      const errorMessage = err?.message || String(err);
      console.warn(`[Gemini API] Attempt ${attempt} failed:`, errorMessage);
      
      const is503 = errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE") || errorMessage.includes("high demand") || errorMessage.includes("temporary");
      const is429 = errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("RATE_LIMIT");
      
      if ((is503 || is429) && attempt < maxRetries) {
        const delay = attempt * 1500;
        console.log(`[Gemini API] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Formulate friendly messages for standard errors
        if (is503) {
          throw new Error("Google's Gemini model is currently experiencing extremely high demand. This is temporary. Please wait a moment and try again. (Tip: switching 'Cram Depth Level' to 'Concise' or using a custom API Key can also help avoid high demand limits.)");
        }
        if (is429) {
          throw new Error("Gemini API Rate Limit or Quota reached. Please wait a minute and try again, or add a custom Gemini API Key in the sidebar configuration to avoid shared limits.");
        }
        throw err;
      }
    }
  }
}

// Preset configurations with prompt templates and response schemas
const PRESETS: Record<string, { systemInstruction: string; responseSchema: any }> = {
  crammer: {
    systemInstruction: `You are an elite academic professor and study advisor specializing in last-minute exam preparation. Your goal is to extract the absolute core material from the provided document to create an exceptionally high-density, highly-structured, and exhaustive "Cheat Sheet".
Do not hold back or summarize too briefly—the user needs a rich, robust, and deep coverage of the material to pass their exam.
Focus on:
1. At least 12-15 highly critical core concepts covering all major chapters/topics in the document. Provide extensive 3-5 sentence explanations packed with definitions, examples, and technical context.
2. Comprehensive formulas, equations, and exact critical vocabulary definitions. Ensure explanations break down individual variable components, units of measure, or detailed meanings.
3. High-probability exam topics likely to be queried, outlining what examiners typically ask and specific pitfalls or mistakes to avoid.
4. Highly memorable and clever memory shortcuts (mnemonics, analogies, word associations, or visualization tricks) explained step-by-step.`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.STRING,
          description: "A comprehensive, high-impact, and motivating executive overview (at least 3-4 sentences) summarizing the complete study scope and key focal points of this document.",
        },
        keyConcepts: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING, description: "The core concept, theme name, or technical term." },
              explanation: { type: Type.STRING, description: "An in-depth, high-density academic breakdown of at least 3-5 sentences. Include context, real-world examples, and why it matters for the exam." },
            },
            required: ["term", "explanation"],
          },
        },
        formulasAndDefinitions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING, description: "The exact formula name, term, acronym, or critical equation." },
              explanation: { type: Type.STRING, description: "A highly detailed mathematical formula, or full exact definition with comprehensive details, variable breakdown, units, and applications (at least 2-3 sentences)." },
            },
            required: ["term", "explanation"],
          },
        },
        likelyExamTopics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING, description: "Specific predicted exam topic or question type." },
              context: { type: Type.STRING, description: "Comprehensive context of how this is tested: what examiners are looking for, expected answers, tricky distractors to watch out for, and critical key points (at least 3-4 sentences)." },
            },
            required: ["topic", "context"],
          },
        },
        memoryTricks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              concept: { type: Type.STRING, description: "The complex concept, jargon, or formula to memorize." },
              trick: { type: Type.STRING, description: "An incredibly vivid mnemonic, funny acronym, mental image, or clever association explained step-by-step to lock it into long-term memory (at least 2-3 sentences)." },
            },
            required: ["concept", "trick"],
          },
        },
      },
      required: ["summary", "keyConcepts", "formulasAndDefinitions", "likelyExamTopics", "memoryTricks"],
    },
  },
  flashcards: {
    systemInstruction: `You are an expert private tutor preparing premium interactive study materials. Based on the uploaded document, generate a highly comprehensive set of at least 15-20 active recall Q&A flashcards covering the most critical, tricky, and frequently tested material.
Ensure each flashcard features:
1. A direct, clear, yet intellectually challenging question.
2. A comprehensive, thoroughly detailed answer of at least 3-4 sentences that fully explains the concept, mechanism, or factual points.
3. A clever, non-obvious hint that triggers the user's memory without giving away the exact answer.`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        flashcards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "Challenging active recall study question." },
              answer: { type: Type.STRING, description: "A comprehensive, high-density, and thoroughly complete study answer (at least 3-4 sentences) that provides a full, solid explanation." },
              hint: { type: Type.STRING, description: "A highly effective, clever hint or clue that guides the user's memory." },
            },
            required: ["question", "answer", "hint"],
          },
        },
      },
      required: ["flashcards"],
    },
  },
  quiz: {
    systemInstruction: `You are a professional academic test designer. Create a highly realistic, challenging, and deeply educational practice quiz based strictly on the uploaded document.
Generate at least 10-12 diverse, high-quality multiple-choice questions ranging from medium to high difficulty (including scenario-based and conceptual application questions).
Each question must feature:
- A clear, realistic exam-style query.
- Exactly 4 highly plausible, clever options (distractors should represent common student misconceptions).
- The 0-based index of the correct option.
- An extremely detailed, thorough explanation (at least 3-4 sentences) breaking down why the correct answer is true, why each of the other three distractors is false, and the essential takeaway for the exam.`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "Realistic, conceptual exam-style test question." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 highly plausible options.",
              },
              correctOptionIndex: { type: Type.INTEGER, description: "Zero-based index of the correct option." },
              explanation: { type: Type.STRING, description: "A highly detailed, 3-5 sentence explanation justifying the correct option, dissecting the other options, and emphasizing core learnings." },
            },
            required: ["question", "options", "correctOptionIndex", "explanation"],
          },
        },
      },
      required: ["questions"],
    },
  },
  simplifier: {
    systemInstruction: `You are an absolute master of the Feynman Technique: the art of explaining highly complex or dense concepts in the simplest possible terms.
Analyze the uploaded document, identify at least 10 of the most challenging or technical topics/concepts, and break them down so that a 5-year-old could easily understand them.
Avoid jargon completely. Keep explanations warm, accessible, and crystal-clear.
Ensure each topic features:
1. The original technical concept name.
2. A simplified Feynman-style explanation of at least 3-4 sentences using simple language, step-by-step breakdown, and zero technical jargon.
3. A highly creative, detailed real-world analogy (e.g. comparing it to playground games, building with LEGO blocks, baking a cake, or household pets) explaining the comparison in detail.`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        simplifiedTopics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              originalConcept: { type: Type.STRING, description: "The original technical name of the complex concept." },
              simpleExplanation: { type: Type.STRING, description: "A detailed Feynman-style explanation (at least 3-4 sentences) using extremely simple language but maintaining absolute conceptual truth." },
              analogy: { type: Type.STRING, description: "A detailed, creative real-world analogy of at least 2-3 sentences making the concept instantly intuitive." },
            },
            required: ["originalConcept", "simpleExplanation", "analogy"],
          },
        },
      },
      required: ["simplifiedTopics"],
    },
  },
  mnemonicForge: {
    systemInstruction: `You are a world-class memory athlete and mnemonics coach.
Analyse the uploaded document and generate powerful memory tools for every hard
fact, date, formula, and concept. For each item produce: a catchy acronym or
acrostic sentence, a vivid 3-4 sentence memory palace story, a 2-4 line rhyme
or rhythm pattern, and a bizarre cartoon visual scene. Min 12 entries.`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        mnemonics: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          concept: { type: Type.STRING },
          acronym: { type: Type.STRING },
          memoryStory: { type: Type.STRING },
          rhyme: { type: Type.STRING },
          visualScene: { type: Type.STRING },
        }, required: ['concept','acronym','memoryStory','rhyme','visualScene'] } },
      }, required: ['mnemonics'],
    },
  },
  speedReview: {
    systemInstruction: `You are a last-30-minutes exam coach. Extract only the
absolute highest-yield facts from the document — most likely to appear on exam
and hardest to remember. For each: one punchy max-15-word one-liner, one
critical number/date/name/threshold, and one common mistake that costs marks.
Generate 15-20 speed cards.`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        speedCards: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          topic: { type: Type.STRING },
          oneLiner: { type: Type.STRING },
          criticalFact: { type: Type.STRING },
          commonMistake: { type: Type.STRING },
        }, required: ['topic','oneLiner','criticalFact','commonMistake'] } },
      }, required: ['speedCards'],
    },
  },
  conceptMap: {
    systemInstruction: `You are an expert in knowledge graph construction.
Build a concept map of the document showing how every major topic, sub-topic,
and key term relates. Identify the central root concept. For each node give
a short label, one-sentence description, and list of connected node IDs.
Generate 15-25 nodes with simple numeric IDs starting from 1.`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        rootTopic: { type: Type.STRING },
        nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          id: { type: Type.INTEGER },
          label: { type: Type.STRING },
          description: { type: Type.STRING },
          connections: { type: Type.ARRAY, items: { type: Type.INTEGER } },
          isRoot: { type: Type.BOOLEAN },
        }, required: ['id','label','description','connections','isRoot'] } },
      }, required: ['rootTopic','nodes'],
    },
  },
  formulaExtractor: {
    systemInstruction: `You are a mathematical formula specialist. Extract EVERY
formula, equation, theorem, law, and constant from the document. For each:
the exact expression as readable text (e.g. F = m * a), every variable with
meaning and SI unit, a step-by-step worked numeric example, conditions of
applicability, and the most common exam trap. Miss nothing.`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        formulas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          name: { type: Type.STRING },
          expression: { type: Type.STRING },
          variables: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
            symbol: { type: Type.STRING }, meaning: { type: Type.STRING }, unit: { type: Type.STRING },
          }, required: ['symbol','meaning','unit'] } },
          workedExample: { type: Type.STRING },
          conditions: { type: Type.STRING },
          examTrap: { type: Type.STRING },
        }, required: ['name','expression','variables','workedExample','conditions','examTrap'] } },
      }, required: ['formulas'],
    },
  },
  essayPredictor: {
    systemInstruction: `You are a senior examiner and writing coach. Predict
5-6 most likely long-answer or essay questions for this document. For each:
full question text, marking criteria as bullet points, model answer skeleton
as paragraph headings with key points, 5 keywords the examiner wants to see,
recommended time in minutes, and difficulty (Easy/Medium/Hard).`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        essays: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          question: { type: Type.STRING },
          markingCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
          modelSkeleton: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywordsToUse: { type: Type.ARRAY, items: { type: Type.STRING } },
          timeMinutes: { type: Type.INTEGER },
          difficulty: { type: Type.STRING },
        }, required: ['question','markingCriteria','modelSkeleton','keywordsToUse','timeMinutes','difficulty'] } },
      }, required: ['essays'],
    },
  },
  paperSimulator: {
    systemInstruction: `You are a professional past paper writer. Generate a full
simulated exam paper. Group into: easy (knowledge recall), medium (application),
hard (synthesis/evaluation). Each question: question text, model answer, topic
tag, and marks value. At least 5 questions per tier (15+ total).`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        easy: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          question: {type:Type.STRING}, modelAnswer:{type:Type.STRING},
          topic:{type:Type.STRING}, marks:{type:Type.INTEGER}
        }, required:['question','modelAnswer','topic','marks'] } },
        medium: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          question: {type:Type.STRING}, modelAnswer:{type:Type.STRING},
          topic:{type:Type.STRING}, marks:{type:Type.INTEGER}
        }, required:['question','modelAnswer','topic','marks'] } },
        hard: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          question: {type:Type.STRING}, modelAnswer:{type:Type.STRING},
          topic:{type:Type.STRING}, marks:{type:Type.INTEGER}
        }, required:['question','modelAnswer','topic','marks'] } },
      }, required: ['easy','medium','hard'],
    },
  },
  gapFinder: {
    systemInstruction: `You are a study diagnostician. Identify 10-12 topics
students most commonly misunderstand or overlook. For each: why students
get it wrong, a 3-step micro-study plan to fix it in under 10 minutes,
one killer question to test understanding, the model answer, and which
section of the document to re-read.`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        gaps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          topic: { type: Type.STRING },
          whyHard: { type: Type.STRING },
          microStudy: { type: Type.ARRAY, items: { type: Type.STRING } },
          killerQ: { type: Type.STRING },
          killerA: { type: Type.STRING },
          docSection: { type: Type.STRING },
        }, required: ['topic','whyHard','microStudy','killerQ','killerA','docSection'] } },
      }, required: ['gaps'],
    },
  },
  socraticTutor: {
    systemInstruction: `You are a master Socratic tutor. Generate an opening
Socratic question that reveals a common misconception. Branch into 3 answer
types (correct/partial/wrong) each with a follow-up and guidance. Also
generate 8-10 Socratic seed questions covering all major topics.`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        openingQuestion: { type: Type.STRING },
        branches: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          answerType: { type: Type.STRING },
          followUp: { type: Type.STRING },
          guidance: { type: Type.STRING },
        }, required: ['answerType','followUp','guidance'] } },
        seedQuestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          topic: { type: Type.STRING },
          question: { type: Type.STRING },
        }, required: ['topic','question'] } },
      }, required: ['openingQuestion','branches','seedQuestions'],
    },
  },
  timelineBuilder: {
    systemInstruction: `You are a chronological analyst. Extract every datable
event, milestone, discovery, law, or period from the document in order.
For each: date or period, short event label, 2-3 sentence significance,
people involved, cause-effect links to other events, and a broad era label
for grouping. At least 12 entries.`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING },
        entries: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          date: { type: Type.STRING },
          event: { type: Type.STRING },
          significance: { type: Type.STRING },
          people: { type: Type.STRING },
          causeEffect: { type: Type.STRING },
          era: { type: Type.STRING },
        }, required: ['date','event','significance','people','causeEffect','era'] } },
      }, required: ['subject','entries'],
    },
  },
  debateSparring: {
    systemInstruction: `You are a master debater and devil's advocate.
Identify 6-8 key arguments or theories in the document. For each: the
mainstream position, the strongest counter-argument with evidence, the
weakest point of the mainstream view, and what the student must defend.
Also generate a provocative opening debate challenge.`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        openingChallenge: { type: Type.STRING },
        debates: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
          topic: { type: Type.STRING },
          mainstreamView: { type: Type.STRING },
          counterArgument: { type: Type.STRING },
          weakestPoint: { type: Type.STRING },
          mustDefend: { type: Type.STRING },
        }, required: ['topic','mainstreamView','counterArgument','weakestPoint','mustDefend'] } },
      }, required: ['openingChallenge','debates'],
    },
  },
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure express to handle large payloads for base64 PDFs
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ── RATE LIMITER ───────────────────────────────────────────────────────────
  const cramLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,                   // max 10 cram requests per user per hour
    keyGenerator: (req) => (req.headers["x-user-id"] as string) || req["ip"] || "anonymous",
    handler: (req, res) => {
      res.status(429).json({
        error: "Too many requests. You can generate up to 10 study decks per hour. Please wait before trying again.",
      });
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  // ────────────────────────────────────────────────────────────────────────────

  // HEALTH CHECK ENDPOINT
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // AUTHENTICATION ENDPOINTS
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }
      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters." });
      }
      if (password.length < 4) {
        return res.status(400).json({ error: "Password must be at least 4 characters." });
      }

      const existingUser = await safeGetUser(cleanUsername);
      if (existingUser) {
        return res.status(400).json({ error: "Username is already registered." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await safeSetUser(cleanUsername, {
        username: cleanUsername,
        passwordHash: hashedPassword,
      });

      console.log(`[AUTH] Registered new user: "${cleanUsername}"`);
      return res.json({ success: true, username: cleanUsername });
    } catch (err: any) {
      console.error("Register error:", err);
      return res.status(500).json({ error: "Server error during registration." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }
      const cleanUsername = username.trim().toLowerCase();
      const user = await safeGetUser(cleanUsername);

      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid ID or Password." });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid ID or Password." });
      }

      console.log(`[AUTH] Logged in user: "${cleanUsername}"`);
      return res.json({ success: true, username: cleanUsername });
    } catch (err: any) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Server error during login." });
    }
  });

  // SESSION SYNC ENDPOINTS
  app.get("/api/sessions", async (req, res) => {
    try {
      const username = req.headers["x-user-id"] as string;
      if (!username) {
        return res.status(401).json({ error: "Unauthorized. Missing user credentials." });
      }
      const cleanUsername = username.trim().toLowerCase();
      
      const userSessions = await safeGetSessions(cleanUsername);
      return res.json({ sessions: userSessions });
    } catch (err: any) {
      console.error("Get sessions error:", err);
      return res.status(500).json({ error: "Server error fetching sessions." });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const username = req.headers["x-user-id"] as string;
      if (!username) {
        return res.status(401).json({ error: "Unauthorized. Missing user credentials." });
      }
      const cleanUsername = username.trim().toLowerCase();
      const { session } = req.body;
      if (!session || !session.id) {
        return res.status(400).json({ error: "Missing session data." });
      }

      await safeSaveSession(session.id, {
        ...session,
        userId: cleanUsername,
      });

      return res.json({ success: true });
    } catch (err: any) {
      console.error("Save session error:", err);
      return res.status(500).json({ error: "Server error saving session." });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      const username = req.headers["x-user-id"] as string;
      const { id } = req.params;
      if (!username) {
        return res.status(401).json({ error: "Unauthorized. Missing user credentials." });
      }
      const cleanUsername = username.trim().toLowerCase();

      const deleted = await safeDeleteSession(id, cleanUsername);
      if (!deleted) {
        return res.status(403).json({ error: "Forbidden or session not found." });
      }

      return res.json({ success: true });
    } catch (err: any) {
      console.error("Delete session error:", err);
      return res.status(500).json({ error: "Server error deleting session." });
    }
  });

  // Config status endpoint to check for API key
  app.get("/api/config", (req, res) => {
    res.json({
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Cram endpoint to process PDF files
  app.post("/api/cram", cramLimiter, async (req, res) => {
    try {
      const { pdfBase64, presetId = "crammer", customApiKey, subject, thorough, depth } = req.body;

      // ~20MB in base64 = ~27,000,000 characters
      if (!pdfBase64 || pdfBase64.length > 27_000_000) {
        return res.status(413).json({
          error: "PDF file is too large. Maximum supported size is 20MB.",
        });
      }

      // Map older thorough boolean or string parameter to depthLevel
      let depthLevel = "thorough";
      if (depth) {
        depthLevel = depth; // "standard", "thorough", "mega"
      } else if (thorough === false) {
        depthLevel = "standard";
      }

      console.log(`[API] Received cram request for preset: "${presetId}" (Subject: "${subject || 'None'}", Depth Level: "${depthLevel}")`);

      const preset = PRESETS[presetId] || PRESETS.crammer;
      
      // Determine API key presence and initialize client
      const selectedKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!selectedKey) {
        console.warn("[API] Request failed: Missing Gemini API Key.");
        return res.status(400).json({ 
          error: "Missing Gemini API Key. Please provide a custom key in the sidebar input box or configure GEMINI_API_KEY." 
        });
      }

      const ai = getGeminiClient(selectedKey);

      // Prepare content parts for Gemini Multimodal processing
      const pdfPart = {
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBase64,
        },
      };

      const subjectText = subject ? ` This document belongs to the subject: "${subject}". Tailor the study material specifically for this field of study.` : "";

      let depthInstruction = "";
      if (depthLevel === "mega") {
        depthInstruction = `\n\nCRITICAL DEPTH DIRECTIVE: [PROLONGED STUDY DECK & MEGA-EXHAUSTIVE MODE ENFORCED - TEXTBOOK LENGTH]
- You MUST generate extremely lengthy, comprehensive, highly detailed, textbook-quality explanations. Absolutely do not summarize or trim down. Write twice as much detail and double the length as standard exhaustive mode.
- Items Counts to Generate:
  * Crammer: Generate 16-20 core concepts, 12-15 formulas, 10-12 exam topics, and 8-10 memory tricks.
  * Flashcards: Generate exactly 20-25 flashcards.
  * Quiz: Generate exactly 12-15 quiz questions.
  * Feynman Simplifier: Generate exactly 12-15 concepts.
- Sentence Lengths and Detail guidelines:
  * Key Concepts: Write extremely detailed multi-paragraph analyses (at least 8-10 long sentences per concept) dissecting foundations, real-world context, mechanics, and advanced edge cases.
  * Formulas & Definitions: Write extensive tutorials (at least 6-8 sentences) explaining derivations, unit breakdown, step-by-step calculations, and teacher warnings.
  * Predicted Exam Topics: Write a massive essay (at least 8-10 sentences) outlining sample questions, full evaluation matrices, scoring guides, and model answers.
  * Memory Tricks: Write a complete mental narrative (at least 5-6 sentences) describing the step-by-step visualization and associations.
  * Flashcards Q&A: Flashcard answers must be highly descriptive and detailed (at least 6-8 sentences).
  * Quiz Explanations: Write a comprehensive tutorial (at least 6-8 sentences) breaking down the correct answer and debunking all other options in detail.
  * Feynman Simplifier: Provide multi-paragraph layman walkthroughs (at least 6-8 sentences) with highly detailed, layered playground analogies (4-5 sentences).`;
      } else if (depthLevel === "thorough") {
        depthInstruction = `\n\nCRITICAL DEPTH DIRECTIVE: [BALANCED MIDDLE-GROUND EXHAUSTIVE MODE ENFORCED]
- You MUST provide a solid, medium-length academic breakdown. This is the exact midpoint between a rapid cram sheet and a textbook-length guide.
- Items Counts to Generate:
  * Crammer: Generate 10-12 core concepts, 6-8 formulas, 6-8 exam topics, and 5-6 memory tricks.
  * Flashcards: Generate exactly 12-15 flashcards.
  * Quiz: Generate exactly 8-10 quiz questions.
  * Feynman Simplifier: Generate exactly 8 concepts.
- Sentence Lengths and Detail guidelines:
  * Key Concepts: Write exactly 4-5 well-formed academic sentences per concept, outlining clear definition, significance, and one core study example.
  * Formulas & Definitions: Write exactly 3 sentences explaining the formula, its individual variable components, and standard units.
  * Predicted Exam Topics: Write exactly 3-4 sentences covering how the topic is commonly tested and one key pitfall/distractor to watch out for.
  * Memory Tricks: Write exactly 3 sentences describing the mnemonic and how to apply it.
  * Flashcards Q&A: Flashcard answers must be exactly 3-4 clear sentences giving a complete but compact answer.
  * Quiz Explanations: Write exactly 3-4 sentences justifying the correct answer and briefly explaining why the wrong distractors represent common mistakes.
  * Feynman Simplifier: Provide exactly 3 sentences of simple, jargon-free explanation paired with a clear, engaging 2-sentence everyday analogy.`;
      } else {
        depthInstruction = `\n\nCRITICAL DEPTH DIRECTIVE: [STANDARD CONCISE CRAM MODE]
- Keep explanations highly compressed, punchy, concise, and high-density. Optimized for rapid, last-minute review.
- Items Counts to Generate:
  * Crammer: Generate 6-8 core concepts, 4-5 formulas, 4-5 exam topics, and 3-4 memory tricks.
  * Flashcards: Generate exactly 8-10 flashcards.
  * Quiz: Generate exactly 5-6 quiz questions.
  * Feynman Simplifier: Generate exactly 5 concepts.
- Sentence Lengths and Detail guidelines:
  * Key Concepts: Write exactly 2 clean, punchy sentences per concept.
  * Formulas & Definitions: Write exactly 1-2 quick definitions or math formula statements.
  * Predicted Exam Topics: Write exactly 2 brief sentences stating the topic and its exam core focus.
  * Memory Tricks: Write exactly 1-2 sentences with the core mnemonic/association.
  * Flashcards Q&A: Flashcard answers must be exactly 1-2 concise sentences.
  * Quiz Explanations: Write exactly 2 brief sentences stating the correct choice reason.
  * Feynman Simplifier: Provide exactly 2 sentences of layman explanation paired with a simple 1-sentence analogy.`;
      }

      const userPrompt = `Analyze this course material and synthesize it perfectly according to your instructions.${subjectText} Keep answers accurate and easy to review.`;

      const textPart = {
        text: userPrompt,
      };

      // Call the model with system instruction and JSON output schema
      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: { parts: [pdfPart, textPart] },
        config: {
          systemInstruction: preset.systemInstruction + depthInstruction,
          responseMimeType: "application/json",
          responseSchema: preset.responseSchema,
          temperature: 0.3, // Lower temperature for factuality in study materials
        },
      });

      if (!response.text) {
        throw new Error("No response generated from the AI model.");
      }

      const result = JSON.parse(response.text.trim());
      return res.json({ result });
    } catch (error: any) {
      console.error("Cramming API Error:", error);
      return res.status(500).json({ error: error.message || "An unexpected error occurred during analysis." });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, presetId, customApiKey } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0)
        return res.status(400).json({ error: 'Missing messages array.' });
      const selectedKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!selectedKey)
        return res.status(400).json({ error: 'Missing Gemini API Key.' });
      const ai = getGeminiClient(selectedKey);
      const systemMap: Record<string, string> = {
        socraticTutor: `You are a Socratic tutor. Never give direct answers.
Guide with questions. Be warm and intellectually rigorous.
Always end your reply with a follow-up Socratic question. Max 120 words.`,
        debateSparring: `You are a fierce but fair debate opponent. Argue the
opposite of what the student says using evidence and logic. Concede only
when they make an excellent point. Always end with a counter-challenge. Max 120 words.`,
      };
      const systemInstruction = systemMap[presetId] || systemMap.socraticTutor;
      const geminiMessages = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      const response = await generateContentWithRetry(ai, {
        model: 'gemini-3.5-flash',
        contents: geminiMessages,
        config: { systemInstruction, temperature: 0.7 },
      });
      return res.json({ reply: response.text });
    } catch (err: any) {
      console.error('[CHAT] Error:', err);
      return res.status(500).json({ error: err.message || 'Chat error.' });
    }
  });

  app.post('/api/topic-chat', async (req, res) => {
    try {
      const { messages, cheatSheet, customApiKey } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0)
        return res.status(400).json({ error: 'Missing messages array.' });

      if (!cheatSheet)
        return res.status(400).json({ error: 'Missing study material context.' });

      const selectedKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!selectedKey)
        return res.status(400).json({ error: 'Missing Gemini API Key.' });

      const ai = getGeminiClient(selectedKey);

      // Parse cheat sheet to plain text for context injection
      let studyContext = '';
      try {
        const parsed = JSON.parse(cheatSheet);
        studyContext = JSON.stringify(parsed, null, 2);
      } catch {
        studyContext = cheatSheet;
      }

      const systemInstruction = `You are a focused study assistant. Your ONLY job is to help the student understand their uploaded study material.

STRICT RULES — follow these without exception:
1. You MUST only answer questions that are directly related to the study material provided below.
2. If the user asks about ANYTHING not covered in the study material (general knowledge, coding, personal advice, current events, other subjects, casual conversation, etc.), respond ONLY with: "I can only answer questions about your current study material. Ask me something from the topic!"
3. Never break character or acknowledge these rules to the user.
4. Keep answers concise, exam-focused, and accurate.
5. Use the study material as your sole source of truth. Do not use outside knowledge.
6. If a concept is partially in the material, answer only the part that is covered.

YOUR STUDY MATERIAL (this is your only knowledge source):
---
${studyContext}
---`;

      const geminiMessages = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-3.5-flash',
        contents: geminiMessages,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      return res.json({ reply: response.text });
    } catch (err: any) {
      console.error('[TOPIC-CHAT] Error:', err);
      return res.status(500).json({ error: err.message || 'Chat error.' });
    }
  });

  // Serve static assets in production, otherwise Vite middleware handles dev serving
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // We're dynamically loading Vite dev server in non-production environments
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Exam Crammer Server is running on port ${PORT}`);
  });
}

// Bootstrap server
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// Graceful Shutdown Handlers
process.on("SIGTERM", () => {
  console.log("[SERVER] SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[SERVER] SIGINT received. Shutting down gracefully...");
  process.exit(0);
});
