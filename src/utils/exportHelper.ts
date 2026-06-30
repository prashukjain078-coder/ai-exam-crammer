import { CramSession } from '../types';

/**
 * Generates a beautifully styled, offline-friendly HTML document from a study session
 * which automatically triggers the system print dialog to "Save as PDF" when opened.
 */
export function exportSessionToPrintableHTML(session: CramSession): string {
  let parsedContent: any;
  try {
    parsedContent = JSON.parse(session.cheatSheet);
  } catch (e) {
    console.error('Failed to parse session cheatSheet content for export:', e);
    return '';
  }

  const title = session.title;
  const fileName = session.fileName;
  const createdAt = session.createdAt;
  const presetId = session.presetId;

  // Header and base layout styles
  let contentHtml = '';

  const badgeLabels: Record<string, string> = {
    crammer: 'Exhaustive Cheat Sheet',
    flashcards: 'Active Recall Flashcards',
    quiz: 'Practice Exam Booklet',
    simplifier: 'Feynman Study Companion',
    mnemonicForge: 'Mnemonic Forge Deck',
    speedReview: 'Speed Panic Review',
    conceptMap: 'Topic Connections Map',
    formulaExtractor: 'Theorem & Formulas Extractor',
    essayPredictor: 'Essay Predictions Guide',
    paperSimulator: 'Simulated Exam Paper',
    gapFinder: 'Curriculum Gaps Diagnostic',
    socraticTutor: 'Socratic Dialogue Booklet',
    timelineBuilder: 'Chronology Milestones Map',
    debateSparring: 'Devil\'s Advocate Sparring Arena',
  };
  const badgeLabel = badgeLabels[presetId] || 'Study Companion';

  if (presetId === 'crammer') {
    const summary = parsedContent.summary || '';
    const keyConcepts = parsedContent.keyConcepts || [];
    const formulas = parsedContent.formulasAndDefinitions || [];
    const topics = parsedContent.likelyExamTopics || [];
    const tricks = parsedContent.memoryTricks || [];

    contentHtml = `
      <div class="summary-box">
        <h2 class="section-title">Scope Overview & Executive Summary</h2>
        <p class="summary-text">${summary}</p>
      </div>

      <div class="section-container">
        <h2 class="section-title">🧠 Key Core Concepts (${keyConcepts.length})</h2>
        <div class="grid-layout">
          ${keyConcepts.map((item: any, i: number) => `
            <div class="card card-indigo">
              <div class="card-num">${i + 1}</div>
              <h3 class="card-title">${item.term}</h3>
              <p class="card-body">${item.explanation}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="page-break"></div>

      <div class="section-container">
        <h2 class="section-title">📐 Formulas & Critical Definitions (${formulas.length})</h2>
        <div class="list-layout">
          ${formulas.map((item: any) => `
            <div class="list-item">
              <span class="list-term">${item.term}</span>
              <p class="list-desc">${item.explanation}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section-container">
        <h2 class="section-title">🔥 Predicted Exam Topics & Pitfalls (${topics.length})</h2>
        <div class="list-layout">
          ${topics.map((item: any, i: number) => `
            <div class="list-item">
              <span class="list-term">Topic #${i + 1}: ${item.topic}</span>
              <p class="list-desc" style="margin-top: 6px;">${item.context}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="page-break"></div>

      <div class="section-container">
        <h2 class="section-title">💡 Clever Memory Hacks & Mnemonics (${tricks.length})</h2>
        <div class="grid-layout">
          ${tricks.map((item: any) => `
            <div class="card card-emerald">
              <span class="badge">MEMORY HACK</span>
              <h3 class="card-title" style="margin-top: 8px;">${item.concept}</h3>
              <p class="card-body" style="font-style: italic; color: #065f46; background: #ecfdf5; padding: 10px; border-radius: 8px; border-left: 3px solid #10b981;">
                "${item.trick}"
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'flashcards') {
    const flashcards = parsedContent.flashcards || [];

    contentHtml = `
      <div class="summary-box">
        <h2 class="section-title">Printable Double-Sided Study Flashcards</h2>
        <p class="summary-text">
          Print this sheet on thick paper, cut along the dotted borders, and fold along the center crease to study offline! Covers <strong>${flashcards.length} essential recall checkpoints</strong>.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title">🗂️ Active Recall Flashcards (${flashcards.length})</h2>
        <div class="grid-layout flashcards-grid">
          ${flashcards.map((card: any, i: number) => `
            <div class="flashcard-printable">
              <div class="flashcard-side question-side">
                <span class="card-tag">QUESTION ${i + 1}</span>
                <p class="flashcard-q">${card.question}</p>
                <p class="flashcard-hint">💡 Hint: ${card.hint}</p>
              </div>
              <div class="flashcard-side answer-side">
                <span class="card-tag">ANSWER ${i + 1}</span>
                <p class="flashcard-a">${card.answer}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'quiz') {
    const questions = parsedContent.questions || [];

    contentHtml = `
      <div class="summary-box">
        <h2 class="section-title">Practice Exam Booklet</h2>
        <p class="summary-text">
          Complete this practice exam under timed test conditions. Write down your options on a separate piece of paper, then cross-reference with the exhaustive <strong>Answer Key & Explanations</strong> on the final page.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title">📝 Practice Exam (${questions.length} Multiple-Choice Questions)</h2>
        <div class="quiz-booklet">
          ${questions.map((q: any, index: number) => `
            <div class="quiz-question-box">
              <h3 class="quiz-q-title">Question ${index + 1}: ${q.question}</h3>
              <div class="quiz-options-list">
                ${q.options.map((opt: string, optIdx: number) => `
                  <div class="quiz-option-item">
                    <span class="option-letter">${String.fromCharCode(65 + optIdx)}</span>
                    <span class="option-text">${opt}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="page-break"></div>

      <div class="section-container">
        <h2 class="section-title">🔑 Answer Key & Deep Explanations</h2>
        <div class="answer-key-list">
          ${questions.map((q: any, index: number) => `
            <div class="answer-key-item">
              <h3 class="answer-key-title">
                Question ${index + 1}: <span class="correct-badge">Correct Answer: ${String.fromCharCode(65 + q.correctOptionIndex)}</span>
              </h3>
              <p class="answer-text"><strong>Explanation & Learning Takeaway:</strong> ${q.explanation}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'simplifier') {
    const simplifiedTopics = parsedContent.simplifiedTopics || [];

    contentHtml = `
      <div class="summary-box">
        <h2 class="section-title">Feynman Technique Study Companion</h2>
        <p class="summary-text">
          Complex topics broken down into clean, jargon-free explanations paired with vivid real-world analogies. Ideal for getting an intuitive grip on the toughest concepts.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title">🎈 Simplified Core Concepts (${simplifiedTopics.length})</h2>
        <div class="list-layout">
          ${simplifiedTopics.map((item: any, i: number) => `
            <div class="simplified-topic-box">
              <div class="simplified-header">
                <span class="topic-number">Concept #${i + 1}</span>
                <h3 class="topic-name">${item.originalConcept}</h3>
              </div>
              <div class="simplified-content">
                <div class="explanation-sub-box">
                  <h4 class="sub-box-title">👶 Simple Feynman Explanation</h4>
                  <p class="sub-box-body">${item.simpleExplanation}</p>
                </div>
                <div class="analogy-sub-box">
                  <h4 class="sub-box-title">🚀 Playground Analogy</h4>
                  <p class="sub-box-body">${item.analogy}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'mnemonicForge') {
    const mnemonics = parsedContent.mnemonics || [];
    contentHtml = `
      <div class="summary-box" style="border-left-color: #a855f7;">
        <h2 class="section-title" style="color: #6b21a8;">Mnemonic Forge Deck</h2>
        <p class="summary-text">
          Highly retention-optimized memory aids including acronyms, vivid mental stories, rhymes, and visual story hooks.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title">🧠 Mnemonics and Memory Palace Codes (${mnemonics.length})</h2>
        <div class="grid-layout">
          ${mnemonics.map((item: any, i: number) => `
            <div class="card" style="border-top: 4px solid #a855f7; page-break-inside: avoid;">
              <div class="card-num">${i + 1}</div>
              <span class="badge" style="background-color: #f3e8ff; color: #6b21a8; font-family: monospace;">ACRONYM: ${item.acronym || 'None'}</span>
              <h3 class="card-title" style="margin-top: 10px;">${item.concept}</h3>
              
              <div style="margin-top: 12px; font-size: 13px; color: #374151;">
                <p style="margin: 0 0 8px 0; line-height: 1.5;"><strong>Memory Palace Story:</strong> <span style="font-style: italic;">"${item.memoryStory}"</span></p>
                ${item.rhyme ? `<p style="margin: 0 0 8px 0; font-family: monospace; padding: 6px; background-color: #f9fafb; border-radius: 4px;"><strong>Rhyme/Rhythm:</strong><br/>${item.rhyme.replace(/\n/g, '<br/>')}</p>` : ''}
                <p style="margin: 0; font-size: 12px; color: #6b7280;"><strong>Visual Story Hook:</strong> ${item.visualScene}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'speedReview') {
    const speedCards = parsedContent.speedCards || [];
    contentHtml = `
      <div class="summary-box" style="border-left-color: #eab308;">
        <h2 class="section-title" style="color: #854d0e;">30-Minute Speed Panic Review Sheet</h2>
        <p class="summary-text">
          High-yield quick fact sheet designed for last-minute cramming. Includes key one-liners, critical takeaways, and common mark loss traps to avoid.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title">⚡ High-Yield Speed Cards (${speedCards.length})</h2>
        <div class="list-layout">
          ${speedCards.map((card: any, i: number) => `
            <div class="card" style="border-top: 4px solid #eab308; padding: 16px; margin-bottom: 12px; page-break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <span class="badge" style="background-color: #fef9c3; color: #854d0e;">TOPIC #${i + 1}: ${card.topic}</span>
                <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #ca8a04;">CRITICAL FACT: ${card.criticalFact}</span>
              </div>
              <p style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">
                ${card.oneLiner}
              </p>
              <div style="background-color: #fef2f2; border-left: 3px solid #ef4444; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #991b1b;">
                <strong>Common Mark Loss Trap:</strong> ${card.commonMistake}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'conceptMap') {
    const nodes = parsedContent.nodes || [];
    const rootTopic = parsedContent.rootTopic || 'Core Concept Map';
    contentHtml = `
      <div class="summary-box" style="border-left-color: #06b6d4;">
        <h2 class="section-title" style="color: #0891b2;">Topic Connections Concept Map</h2>
        <p class="summary-text">
          A high-density structural mapping of the core curriculum. This outline lists key topic nodes, their respective contextual descriptions, and direct logical connections.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title">🗺️ Structured Concept Relations Map: ${rootTopic}</h2>
        <div class="list-layout">
          ${nodes.map((node: any) => {
            const connectedNodes = (node.connections || []).map((cId: number) => {
              const target = nodes.find((n: any) => n.id === cId);
              return target ? target.label : `#${cId}`;
            }).filter(Boolean);

            return `
              <div class="list-item" style="border-left: 3px solid ${node.isRoot ? '#6366f1' : '#06b6d4'}; margin-bottom: 12px; page-break-inside: avoid;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="badge" style="background-color: ${node.isRoot ? '#e0e7ff' : '#ecfeff'}; color: ${node.isRoot ? '#3730a3' : '#155e75'};">
                    ${node.isRoot ? 'ROOT TOPIC' : `NODE #${node.id}`}
                  </span>
                  <span style="font-size: 14px; font-weight: 700; color: #0f172a; font-family: monospace;">${node.label}</span>
                </div>
                <p style="font-size: 13px; color: #334155; margin: 4px 0 8px 0; line-height: 1.5;">
                  ${node.description}
                </p>
                ${connectedNodes.length > 0 ? `
                  <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
                    <span style="font-size: 10px; font-family: monospace; color: #94a3b8; text-transform: uppercase;">Direct Connections:</span>
                    ${connectedNodes.map((label: string) => `
                      <span style="font-size: 10px; font-family: monospace; background-color: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                        ${label}
                      </span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'formulaExtractor') {
    const formulas = parsedContent.formulas || [];
    contentHtml = `
      <div class="summary-box" style="border-left-color: #22c55e;">
        <h2 class="section-title" style="color: #166534;">Theorem & Formula Reference Sheet</h2>
        <p class="summary-text">
          Extracted equations complete with comprehensive variable checklists, worked numeric calculation walkthroughs, conditions of applicability, and exam pitfalls.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title">📐 Extracted Formulas (${formulas.length})</h2>
        <div class="list-layout">
          ${formulas.map((formula: any, i: number) => `
            <div class="card" style="border-top: 4px solid #22c55e; margin-bottom: 20px; page-break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px;">
                <h3 class="card-title" style="margin: 0;">${i + 1}. ${formula.name}</h3>
                <span style="font-family: monospace; font-size: 14px; font-weight: bold; color: #166534; background-color: #f0fdf4; padding: 2px 8px; border-radius: 6px;">
                  ${formula.expression}
                </span>
              </div>

              <div style="margin-bottom: 12px;">
                <span style="font-size: 11px; font-family: monospace; color: #4b5563; font-weight: bold; display: block; margin-bottom: 4px; text-transform: uppercase;">Variables Checklist:</span>
                <table style="width: 100%; border-collapse: collapse; font-size: 11px; font-family: monospace; text-align: left;">
                  <thead>
                    <tr style="background-color: #f9fafb; color: #4b5563; border-bottom: 1px solid #e5e7eb;">
                      <th style="padding: 4px 8px; width: 20%;">Symbol</th>
                      <th style="padding: 4px 8px; width: 60%;">Meaning</th>
                      <th style="padding: 4px 8px; width: 20%;">SI Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(formula.variables || []).map((v: any) => `
                      <tr style="border-bottom: 1px solid #f3f4f6;">
                        <td style="padding: 4px 8px; font-weight: bold; color: #16a34a;">${v.symbol}</td>
                        <td style="padding: 4px 8px; color: #374151;">${v.meaning}</td>
                        <td style="padding: 4px 8px; color: #6b7280;">${v.unit || '—'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div style="margin-bottom: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; font-family: monospace; font-size: 11px; white-space: pre-wrap;">
                <strong style="font-family: sans-serif; color: #374151; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 10px;">Worked Numeric Example:</strong>
                ${formula.workedExample}
              </div>

              <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                <div style="background-color: #eff6ff; border-left: 3px solid #3b82f6; padding: 8px 12px; border-radius: 4px; font-size: 11px;">
                  <strong style="color: #1e40af; text-transform: uppercase; display: block; margin-bottom: 2px;">Conditions of Applicability:</strong>
                  <span style="color: #1e3a8a;">${formula.conditions}</span>
                </div>
                <div style="background-color: #fef2f2; border-left: 3px solid #ef4444; padding: 8px 12px; border-radius: 4px; font-size: 11px;">
                  <strong style="color: #991b1b; text-transform: uppercase; display: block; margin-bottom: 2px;">Exam Pitfall / Trap:</strong>
                  <span style="color: #7f1d1d;">${formula.examTrap}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'essayPredictor') {
    const essays = parsedContent.essays || [];
    contentHtml = `
      <div class="summary-box" style="border-left-color: #f43f5e;">
        <h2 class="section-title" style="color: #be123c;">Essay Predictions & Long-Answer Study Guide</h2>
        <p class="summary-text">
          Predicted long-answer questions constructed with corresponding examiner marking criteria, structural model response skeletons, and mandatory high-value key terms.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title">✍️ Predicted Long-Answer Questions (${essays.length})</h2>
        <div class="list-layout">
          ${essays.map((essay: any, i: number) => `
            <div class="card" style="border-top: 4px solid #f43f5e; margin-bottom: 24px; page-break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px;">
                <span class="badge" style="background-color: #ffe4e6; color: #9f1239; font-size: 10px;">LONG QUESTION #${i + 1}</span>
                <div style="font-size: 11px; font-family: monospace; color: #64748b; font-weight: bold;">
                  Difficulty: <span style="color: #e11d48;">${essay.difficulty}</span> &bull; Time: ${essay.timeMinutes} mins
                </div>
              </div>

              <p style="font-family: Georgia, serif; font-size: 16px; font-weight: bold; line-height: 1.5; color: #0f172a; margin: 0 0 16px 0; font-style: italic;">
                "${essay.question}"
              </p>

              <div style="margin-bottom: 14px;">
                <span style="font-size: 10px; font-family: monospace; color: #475569; font-weight: bold; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Examiner's Marking Criteria Checklist:</span>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #334155; line-height: 1.6;">
                  ${(essay.markingCriteria || []).map((crit: string) => `
                    <li style="margin-bottom: 4px;">${crit}</li>
                  `).join('')}
                </ul>
              </div>

              <div style="margin-bottom: 14px;">
                <span style="font-size: 10px; font-family: monospace; color: #475569; font-weight: bold; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Model Response Skeleton:</span>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${(essay.modelSkeleton || []).map((step: string, sIdx: number) => `
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; font-size: 11px; line-height: 1.5;">
                      <strong>Part ${sIdx + 1} (${step.split(':')[0] || 'Structure'}):</strong>
                      <span style="color: #475569;">${step.split(':').slice(1).join(':').trim() || step}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div>
                <span style="font-size: 10px; font-family: monospace; color: #475569; font-weight: bold; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">High-Value Keywords (Examiner Targets):</span>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${(essay.keywordsToUse || []).map((word: string) => `
                    <span style="font-size: 10px; font-family: monospace; background-color: #fff1f2; color: #be123c; border: 1px solid #fecdd3; padding: 2px 6px; border-radius: 4px;">
                      ${word}
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'paperSimulator') {
    contentHtml = `
      <div class="summary-box" style="border-left-color: #6366f1;">
        <h2 class="section-title" style="color: #4f46e5;">Simulated Past Examination Booklet</h2>
        <p class="summary-text">
          A fully assembled trial past paper tiered dynamically by Easy, Medium, and Hard task difficulties. Study under timed conditions, then cross-examine your answers using the master model answers on the final pages.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title" style="border-bottom: 2px solid #10b981; color: #047857;">Section A: Knowledge & Recall (Easy Tier)</h2>
        <div class="list-layout">
          ${(parsedContent.easy || []).map((q: any, i: number) => `
            <div class="card" style="border-left: 4px solid #10b981; margin-bottom: 16px; page-break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: monospace; color: #64748b; margin-bottom: 6px;">
                <span>Easy Question A${i + 1} (${q.topic})</span>
                <strong>[${q.marks} Marks]</strong>
              </div>
              <p style="font-size: 13.5px; color: #0f172a; font-weight: bold; margin: 0 0 10px 0;">${q.question}</p>
              <div style="font-size: 11.5px; color: #475569; background-color: #f8fafc; border-radius: 6px; padding: 10px; border: 1px dashed #e2e8f0;">
                <strong>Correct Response Guide:</strong> ${q.modelAnswer}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="page-break"></div>

      <div class="section-container">
        <h2 class="section-title" style="border-bottom: 2px solid #f59e0b; color: #b45309;">Section B: Analysis & Application (Medium Tier)</h2>
        <div class="list-layout">
          ${(parsedContent.medium || []).map((q: any, i: number) => `
            <div class="card" style="border-left: 4px solid #f59e0b; margin-bottom: 16px; page-break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: monospace; color: #64748b; margin-bottom: 6px;">
                <span>Medium Question B${i + 1} (${q.topic})</span>
                <strong>[${q.marks} Marks]</strong>
              </div>
              <p style="font-size: 13.5px; color: #0f172a; font-weight: bold; margin: 0 0 10px 0;">${q.question}</p>
              <div style="font-size: 11.5px; color: #475569; background-color: #f8fafc; border-radius: 6px; padding: 10px; border: 1px dashed #e2e8f0;">
                <strong>Correct Response Guide:</strong> ${q.modelAnswer}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="page-break"></div>

      <div class="section-container">
        <h2 class="section-title" style="border-bottom: 2px solid #ef4444; color: #b91c1c;">Section C: Synthesis & Evaluation (Hard Tier)</h2>
        <div class="list-layout">
          ${(parsedContent.hard || []).map((q: any, i: number) => `
            <div class="card" style="border-left: 4px solid #ef4444; margin-bottom: 16px; page-break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: monospace; color: #64748b; margin-bottom: 6px;">
                <span>Hard Question C${i + 1} (${q.topic})</span>
                <strong>[${q.marks} Marks]</strong>
              </div>
              <p style="font-size: 13.5px; color: #0f172a; font-weight: bold; margin: 0 0 10px 0;">${q.question}</p>
              <div style="font-size: 11.5px; color: #475569; background-color: #f8fafc; border-radius: 6px; padding: 10px; border: 1px dashed #e2e8f0;">
                <strong>Correct Response Guide:</strong> ${q.modelAnswer}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'gapFinder') {
    const gaps = parsedContent.gaps || [];
    contentHtml = `
      <div class="summary-box" style="border-left-color: #f97316;">
        <h2 class="section-title" style="color: #ea580c;">Curriculum Gap Finder & Intervention Report</h2>
        <p class="summary-text">
          Identified curriculum vulnerabilities requiring active study intervention. Each identified gap contains diagnostic details, a 3-step micro-study fix, and a complex understanding check question.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title">🔍 Diagnostic Focus Gaps (${gaps.length})</h2>
        <div class="list-layout">
          ${gaps.map((gap: any, i: number) => `
            <div class="card" style="border-top: 4px solid #f97316; margin-bottom: 24px; page-break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px;">
                <h3 class="card-title" style="margin: 0;">${i + 1}. ${gap.topic}</h3>
                <span class="badge" style="background-color: #ffedd5; color: #ea580c; font-family: monospace;">SECTION: ${gap.docSection || 'General'}</span>
              </div>

              <div style="background-color: #fffbeb; border-left: 3px solid #f59e0b; padding: 10px; border-radius: 6px; font-size: 12px; color: #78350f; margin-bottom: 14px;">
                <strong>Why Students Fail This Concept:</strong> ${gap.whyHard}
              </div>

              <div style="margin-bottom: 14px;">
                <span style="font-size: 10px; font-family: monospace; color: #475569; font-weight: bold; display: block; margin-bottom: 6px; text-transform: uppercase;">10-Minute Micro-Study Intervention Plan:</span>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${(gap.microStudy || []).map((step: string, sIdx: number) => `
                    <div style="font-size: 11.5px; color: #334155;">
                      <strong>Step ${sIdx + 1}:</strong> ${step}
                    </div>
                  `).join('')}
                </div>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 11.5px;">
                <span style="font-size: 9px; font-family: monospace; color: #f97316; font-weight: bold; display: block; margin-bottom: 4px; text-transform: uppercase;">Killer Understanding Verification Question:</span>
                <p style="font-weight: bold; color: #0f172a; margin: 0 0 8px 0;">${gap.killerQ}</p>
                <div style="border-top: 1px dashed #cbd5e1; margin-top: 6px; padding-top: 6px; color: #475569; font-family: monospace; font-size: 11px;">
                  <strong>Model Solution:</strong> ${gap.killerA}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'socraticTutor') {
    const seedQuestions = parsedContent.seedQuestions || [];
    const branches = parsedContent.branches || [];
    contentHtml = `
      <div class="summary-box" style="border-left-color: #14b8a6;">
        <h2 class="section-title" style="color: #0d9488;">Socratic Study Companion & Dialogues</h2>
        <p class="summary-text">
          An interactive, Socratic dialogue booklet. Walks through custom diagnostic branches analyzing wrong, partial, and correct logical paths to build a rigorous conceptual foundation.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title">💭 Socratic Core Challenge & Dialogues</h2>
        <div class="card" style="border-left: 4px solid #14b8a6; padding: 20px; margin-bottom: 24px; page-break-inside: avoid;">
          <span style="font-size: 10px; font-family: monospace; color: #0d9488; font-weight: bold; display: block; margin-bottom: 2px; text-transform: uppercase;">Opening Socratic Thesis:</span>
          <p style="font-size: 15px; font-weight: bold; color: #0f172a; line-height: 1.6; margin: 4px 0 0 0;">
            "${parsedContent.openingQuestion}"
          </p>
        </div>

        <h3 style="font-family: monospace; font-size: 12px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;">Socratic Cognitive Path Analysis</h3>
        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 30px;">
          ${branches.map((branch: any) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; page-break-inside: avoid;">
              <div style="background-color: ${branch.answerType === 'correct' ? '#f0fdf4' : branch.answerType === 'partial' ? '#fffbeb' : '#fef2f2'}; border-bottom: 1px solid #e2e8f0; padding: 8px 12px; display: flex; justify-content: space-between; font-family: monospace; font-size: 11px; font-weight: bold; color: ${branch.answerType === 'correct' ? '#166534' : branch.answerType === 'partial' ? '#854d0e' : '#991b1b'};">
                <span>Logical Response Category: ${branch.answerType.toUpperCase()}</span>
              </div>
              <div style="padding: 12px; font-size: 12px;">
                <p style="margin: 0 0 8px 0; color: #374151;"><strong>Tutor Guidance:</strong> ${branch.guidance}</p>
                <p style="margin: 0; font-style: italic; color: #4b5563; border-left: 2px solid #cbd5e1; padding-left: 8px;">
                  "Follow-up: ${branch.followUp}"
                </p>
              </div>
            </div>
          `).join('')}
        </div>

        <h3 style="font-family: monospace; font-size: 12px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;">Self-Reflection Seed Topics</h3>
        <div class="grid-layout">
          ${seedQuestions.map((seed: any, i: number) => `
            <div class="card" style="border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; page-break-inside: avoid;">
              <span style="font-size: 9px; font-family: monospace; color: #94a3b8; font-weight: bold; display: block; text-transform: uppercase;">SEED #${i + 1}: ${seed.topic}</span>
              <p style="font-size: 12px; color: #334155; margin: 4px 0 0 0; line-height: 1.5; font-weight: 500;">
                "${seed.question}"
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'timelineBuilder') {
    const entries = parsedContent.entries || [];
    contentHtml = `
      <div class="summary-box" style="border-left-color: #ec4899;">
        <h2 class="section-title" style="color: #db2777;">Curriculum Chronological Map</h2>
        <p class="summary-text">
          Subject timeline tracking discoveries, milestones, causes/effects, historical/scientific eras, and key stakeholders.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title">⏳ Chronology & Epoch Milestones Map</h2>
        <div style="position: relative; padding-left: 24px; border-left: 2px solid #e2e8f0; margin-left: 10px;">
          ${entries.map((entry: any, i: number) => `
            <div style="position: relative; margin-bottom: 24px; page-break-inside: avoid;">
              <!-- Timeline Dot -->
              <div style="position: absolute; left: -31px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background-color: #ec4899; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #fbcfe8;"></div>
              
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <span style="font-family: monospace; font-size: 13px; font-weight: bold; color: #ec4899; background-color: #fce7f3; padding: 2px 8px; border-radius: 4px;">
                  ${entry.date}
                </span>
                <span style="font-size: 10px; font-family: monospace; color: #64748b; font-weight: bold; text-transform: uppercase;">
                  ERA: ${entry.era}
                </span>
              </div>

              <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 4px 0 6px 0;">${entry.event}</h3>
              <p style="font-size: 12.5px; color: #334155; margin: 0 0 8px 0; line-height: 1.5;">${entry.significance}</p>
              
              <div style="display: grid; grid-template-columns: 1fr; gap: 8px; font-size: 11px; color: #64748b; font-family: monospace; background-color: #f9fafb; padding: 8px 12px; border-radius: 6px; border: 1px solid #f1f5f9;">
                ${entry.people ? `<div><strong>Stakeholders:</strong> ${entry.people}</div>` : ''}
                ${entry.causeEffect ? `<div><strong>Causal Mechanics:</strong> ${entry.causeEffect}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (presetId === 'debateSparring') {
    const debates = parsedContent.debates || [];
    contentHtml = `
      <div class="summary-box" style="border-left-color: #64748b;">
        <h2 class="section-title" style="color: #475569;">Devil's Advocate Argumentation Matrix</h2>
        <p class="summary-text">
          A collection of debates, pitting mainstream consensus against strong counter-arguments. Includes targeted defence guidelines and key logical holes to protect.
        </p>
      </div>

      <div class="section-container">
        <h2 class="section-title">⚔️ Analytical Argumentation Matrix</h2>
        <div class="card" style="border-left: 4px solid #ef4444; padding: 18px; margin-bottom: 24px; page-break-inside: avoid; background-color: #fff5f5;">
          <span style="font-size: 10px; font-family: monospace; color: #b91c1c; font-weight: bold; display: block; text-transform: uppercase;">Opening Battleground Challenge:</span>
          <p style="font-size: 14.5px; font-weight: bold; color: #7f1d1d; line-height: 1.5; margin: 4px 0 0 0; font-style: italic;">
            "${parsedContent.openingChallenge}"
          </p>
        </div>

        <div class="list-layout">
          ${debates.map((row: any, i: number) => `
            <div class="card" style="border-top: 4px solid #64748b; margin-bottom: 24px; page-break-inside: avoid;">
              <h3 class="card-title" style="font-size: 14px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px;">
                Debate Topic #${i + 1}: ${row.topic}
              </h3>

              <div style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 12px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; font-size: 12px;">
                  <strong style="color: #475569; text-transform: uppercase; display: block; font-size: 9px; font-family: monospace; margin-bottom: 2px;">Mainstream Consensus Position:</strong>
                  <p style="margin: 0; color: #334155; line-height: 1.5;">${row.mainstreamView}</p>
                </div>
                <div style="background-color: #fff5f5; border: 1px solid #fecdd3; padding: 10px; border-radius: 6px; font-size: 12px;">
                  <strong style="color: #b91c1c; text-transform: uppercase; display: block; font-size: 9px; font-family: monospace; margin-bottom: 2px;">AI Devil's Advocate Rebuttal:</strong>
                  <p style="margin: 0; color: #7f1d1d; line-height: 1.5;">${row.counterArgument}</p>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                <div style="background-color: #fff7ed; border-left: 3px solid #f97316; padding: 8px 12px; border-radius: 4px; font-size: 11.5px;">
                  <strong style="color: #c2410c; text-transform: uppercase; display: block; font-size: 9px; font-family: monospace; margin-bottom: 2px;">Consensus Weakest Link Vulnerability:</strong>
                  <p style="margin: 0; color: #7c2d12;">${row.weakestPoint}</p>
                </div>
                <div style="background-color: #f0fdf4; border-left: 3px solid #22c55e; padding: 8px 12px; border-radius: 4px; font-size: 11.5px;">
                  <strong style="color: #15803d; text-transform: uppercase; display: block; font-size: 9px; font-family: monospace; margin-bottom: 2px;">Your Defending Directives:</strong>
                  <p style="margin: 0; color: #14532d;">${row.mustDefend}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Combine into fully self-contained HTML document with elegant print styles
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - AI Exam Crammer Printable Study Guide</title>
  <style>
    /* Global Elements */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Georgia:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap');
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }

    /* Print Header bar */
    .print-control-header {
      background-color: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .brand {
      font-weight: 700;
      font-size: 14px;
      color: #4f46e5;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-print {
      background-color: #4f46e5;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
      transition: background-color 0.2s;
    }

    .btn-print:hover {
      background-color: #4338ca;
    }

    /* Core Page Layout wrapper */
    .document-wrapper {
      max-width: 820px;
      margin: 40px auto;
      padding: 0 40px;
    }

    /* Document Metadata Header */
    .doc-header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }

    .doc-header-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .doc-badge {
      background-color: #e0e7ff;
      color: #3730a3;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .doc-title {
      font-family: 'Georgia', serif;
      font-size: 32px;
      color: #0f172a;
      margin: 12px 0 6px 0;
      font-weight: 700;
      line-height: 1.25;
    }

    .doc-meta {
      font-size: 12px;
      color: #64748b;
      display: flex;
      gap: 16px;
    }

    /* Summary Block */
    .summary-box {
      background-color: #f1f5f9;
      border-left: 4px solid #4f46e5;
      padding: 20px 24px;
      border-radius: 0 12px 12px 0;
      margin-bottom: 40px;
    }

    .summary-text {
      font-family: 'Georgia', serif;
      font-size: 16px;
      line-height: 1.6;
      color: #334155;
      margin: 0;
      font-style: italic;
    }

    /* General sections styling */
    .section-container {
      margin-bottom: 44px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 8px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    /* Grid layout for Cards */
    .grid-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    @media (min-width: 600px) {
      .grid-layout {
        grid-template-columns: 1fr 1fr;
      }
    }

    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      position: relative;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      page-break-inside: avoid;
    }

    .card-indigo {
      border-top: 4px solid #6366f1;
    }

    .card-emerald {
      border-top: 4px solid #10b981;
    }

    .card-num {
      position: absolute;
      top: 14px;
      right: 18px;
      font-size: 18px;
      font-weight: 800;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
    }

    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 10px 0;
      padding-right: 20px;
    }

    .card-body {
      font-size: 13px;
      color: #334155;
      margin: 0;
      line-height: 1.5;
    }

    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      background-color: #d1fae5;
      color: #065f46;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    /* List Layout */
    .list-layout {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .list-item {
      border-left: 3px solid #cbd5e1;
      padding-left: 16px;
      margin-bottom: 4px;
      page-break-inside: avoid;
    }

    .list-term {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      display: block;
      font-family: 'JetBrains Mono', monospace;
    }

    .list-desc {
      font-size: 13px;
      color: #334155;
      margin: 4px 0 0 0;
      line-height: 1.5;
    }

    /* Flashcards Layout */
    .flashcards-grid {
      grid-template-columns: 1fr;
    }

    @media (min-width: 650px) {
      .flashcards-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .flashcard-printable {
      border: 2px dashed #94a3b8;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background-color: #f8fafc;
      page-break-inside: avoid;
      margin-bottom: 12px;
    }

    .flashcard-side {
      padding: 18px;
      flex: 1;
    }

    .question-side {
      border-bottom: 1px dashed #cbd5e1;
      background-color: #ffffff;
    }

    .answer-side {
      background-color: #f1f5f9;
    }

    .card-tag {
      font-size: 10px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
      display: block;
      margin-bottom: 6px;
    }

    .flashcard-q {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 8px 0;
    }

    .flashcard-hint {
      font-size: 12px;
      color: #4f46e5;
      margin: 0;
      font-style: italic;
    }

    .flashcard-a {
      font-size: 13px;
      color: #334155;
      margin: 0;
      line-height: 1.5;
    }

    /* Quiz Exam layout */
    .quiz-question-box {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      background-color: #ffffff;
      page-break-inside: avoid;
    }

    .quiz-q-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 16px 0;
      line-height: 1.4;
    }

    .quiz-options-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .quiz-option-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 14px;
      border: 1px solid #f1f5f9;
      background-color: #f8fafc;
      border-radius: 8px;
    }

    .option-letter {
      background-color: #e2e8f0;
      color: #334155;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .option-text {
      font-size: 13px;
      color: #334155;
    }

    /* Answer Key */
    .answer-key-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .answer-key-item {
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 18px;
      page-break-inside: avoid;
    }

    .answer-key-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .correct-badge {
      background-color: #d1fae5;
      color: #065f46;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .answer-text {
      font-size: 13px;
      color: #475569;
      margin: 0;
      line-height: 1.6;
    }

    /* Feynman Simplifier Layout */
    .simplified-topic-box {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 24px;
      page-break-inside: avoid;
    }

    .simplified-header {
      background-color: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .topic-number {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 11px;
      color: #6366f1;
      text-transform: uppercase;
      background-color: #e0e7ff;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .topic-name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .simplified-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    @media (min-width: 650px) {
      .simplified-content {
        flex-direction: row;
      }
    }

    .explanation-sub-box, .analogy-sub-box {
      flex: 1;
      padding: 14px;
      border-radius: 8px;
    }

    .explanation-sub-box {
      background-color: #f0fdf4;
      border-left: 3px solid #22c55e;
    }

    .analogy-sub-box {
      background-color: #fef8ec;
      border-left: 3px solid #f59e0b;
    }

    .sub-box-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      margin: 0 0 6px 0;
      letter-spacing: 0.05em;
    }

    .explanation-sub-box .sub-box-title { color: #166534; }
    .analogy-sub-box .sub-box-title { color: #92400e; }

    .sub-box-body {
      font-size: 13px;
      color: #334155;
      margin: 0;
      line-height: 1.5;
    }

    /* Page Breaks & Prints Styles */
    .page-break {
      page-break-before: always;
      height: 0;
      margin: 0;
      border: none;
    }

    @media print {
      body {
        font-size: 12pt;
        color: #000000;
        background-color: #ffffff;
      }

      .print-control-header {
        display: none !important;
      }

      .document-wrapper {
        max-width: 100%;
        margin: 0;
        padding: 0;
      }

      .card, .list-item, .quiz-question-box, .flashcard-printable, .simplified-topic-box, .answer-key-item {
        page-break-inside: avoid !important;
      }

      .page-break {
        page-break-before: always !important;
      }

      /* Enable background graphics for styling elements in print */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>

  <!-- Print controller sticky header -->
  <div class="print-control-header">
    <div class="brand">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
        <line x1="4" y1="22" x2="4" y2="15"></line>
      </svg>
      <span>AI Exam Crammer</span>
    </div>
    <button class="btn-print" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      <span>Save as PDF / Print Guide</span>
    </button>
  </div>

  <!-- Document Body container -->
  <div class="document-wrapper">
    <header class="doc-header">
      <div class="doc-header-top">
        <span class="doc-badge">${badgeLabel}</span>
        <span class="doc-meta" style="font-family: 'JetBrains Mono', monospace;">Created: ${createdAt}</span>
      </div>
      <h1 class="doc-title">${title}</h1>
      <div class="doc-meta">
        <span><strong>Subject:</strong> ${title.split(':')[0] || 'General Studies'}</span>
        <span>•</span>
        <span><strong>Source File:</strong> ${fileName}</span>
      </div>
    </header>

    ${contentHtml}

    <footer style="margin-top: 80px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; text-align: center;">
      Generated by AI Exam Crammer • Tailored to target passing grades via high-density cognitive synthesis • Page 1 of 1
    </footer>
  </div>

  <script>
    // Prompt the system print/save-as-PDF flow automatically after a tiny delay
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.print();
      }, 800);
    });
  </script>
</body>
</html>`;
}
