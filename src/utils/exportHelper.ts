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
        <span class="doc-badge">${presetId === 'crammer' ? 'Exhaustive Cheat Sheet' : presetId === 'flashcards' ? 'Active Recall Flashcards' : presetId === 'quiz' ? 'Practice Exam Booklet' : 'Feynman Study Companion'}</span>
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
