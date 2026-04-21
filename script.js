(function () {
  "use strict";

  const STORAGE_KEYS = {
    examState: "examState",
    examHistory: "examHistory",
    settings: "settings",
  };

  const EXAM_DURATION_SECONDS = 25 * 60;
  const ACTION_DEBOUNCE_MS = 300;
  const THEMES = ["sky", "sand", "reading", "dark"];
  const OPTION_KEYS = ["1", "2", "3", "4"];
  const THEME_LABELS = {
    sky: "الأزرق الهادئ",
    sand: "الرملي الدافئ",
    reading: "القراءة المريحة",
    dark: "الداكن",
  };

  const LABELS = {
    category: {
      verbal: "لفظي",
      quantitative: "كمي",
    },
    difficulty: {
      easy: "سهل",
      medium: "متوسط",
      hard: "صعب",
    },
    subType: {
      reading_comprehension: "استيعاب مقروء",
      sentence_completion: "إكمال الجمل",
      analogy: "تناظر لفظي",
      contextual_error: "خطأ سياقي",
      odd_word: "المفردة الشاذة",
      arithmetic: "مسائل حسابية",
      geometry: "مسائل هندسية",
      algebra: "مسائل جبرية",
      statistics: "تحليل إحصائي",
    },
  };

  const FALLBACK_QUESTIONS = [
    {
      id: 1,
      question: "قرأ خالد الفقرة ثم لخّص فكرتها الرئيسة في سطر واحد. ما المهارة التي استخدمها أساسًا؟",
      options: ["الاستنباط العددي", "الفهم العام للنص", "التحويل الهندسي", "الترتيب الزمني للأعداد"],
      correctAnswer: 1,
      category: "verbal",
      subType: "reading_comprehension",
      difficulty: "easy",
      explanation: "تلخيص الفكرة الرئيسة يعتمد على فهم المعنى العام للنص وليس على الحساب أو الهندسة.",
      tags: ["استيعاب", "لغة"],
    },
    {
      id: 2,
      question: "إذا كان الكاتب يكرر أمثلة مختلفة ليؤكد أهمية التخطيط، فما الهدف الرئيس من الفقرة؟",
      options: ["السخرية من القارئ", "عرض تعريف لغوي", "التأكيد على قيمة التخطيط", "ذكر معلومات متفرقة بلا رابط"],
      correctAnswer: 2,
      category: "verbal",
      subType: "reading_comprehension",
      difficulty: "medium",
      explanation: "تكرار الأمثلة هنا يخدم فكرة واحدة وهي إبراز أهمية التخطيط.",
      tags: ["استيعاب", "تحليل"],
    },
    {
      id: 3,
      question: "يتميز الطالب المجتهد بأنه _______ على تنظيم وقته مهما كثرت المهام.",
      options: ["عاجز", "حريص", "مرتبك", "متردد"],
      correctAnswer: 1,
      category: "verbal",
      subType: "sentence_completion",
      difficulty: "easy",
      explanation: "السياق إيجابي ويتحدث عن الاجتهاد وتنظيم الوقت، لذا كلمة 'حريص' هي الأنسب.",
      tags: ["إكمال", "لغة"],
    },
    {
      id: 4,
      question: "العلم نور، والجهل _______ يعيق الإنسان عن رؤية الحقائق.",
      options: ["يقين", "ظلام", "إبداع", "انطلاق"],
      correctAnswer: 1,
      category: "verbal",
      subType: "sentence_completion",
      difficulty: "medium",
      explanation: "المقابلة المعنوية مع 'نور' هي 'ظلام'.",
      tags: ["إكمال", "معنى"],
    },
    {
      id: 5,
      question: "كتاب : قراءة = قلم : ؟",
      options: ["حبر", "كتابة", "مكتبة", "دفتر"],
      correctAnswer: 1,
      category: "verbal",
      subType: "analogy",
      difficulty: "easy",
      explanation: "العلاقة هي أداة وما ينتج عنها أو تستخدم فيه؛ الكتاب للقراءة والقلم للكتابة.",
      tags: ["تناظر", "لغة"],
    },
    {
      id: 6,
      question: "طبيب : علاج = معلم : ؟",
      options: ["تعليم", "مستشفى", "طالب", "اختبار"],
      correctAnswer: 0,
      category: "verbal",
      subType: "analogy",
      difficulty: "medium",
      explanation: "العلاقة مهنة وما تؤديه من وظيفة؛ الطبيب يعالج والمعلم يعلّم.",
      tags: ["تناظر", "لغة"],
    },
    {
      id: 7,
      question: "كان الجو في الرحلة مفعمًا بالبهجة، والوجوه تفيض سرورًا، والجميع يشعرون بالكآبة. أي كلمة لا تنسجم مع السياق؟",
      options: ["البهجة", "سرورًا", "الكآبة", "الرحلة"],
      correctAnswer: 2,
      category: "verbal",
      subType: "contextual_error",
      difficulty: "medium",
      explanation: "السياق كله إيجابي، وكلمة 'الكآبة' تناقض المعنى العام.",
      tags: ["سياق", "خطأ"],
    },
    {
      id: 8,
      question: "وصف الكاتب المشروع بأنه منظم، واضح، مترابط، فوضوي. ما الكلمة غير المناسبة؟",
      options: ["منظم", "واضح", "مترابط", "فوضوي"],
      correctAnswer: 3,
      category: "verbal",
      subType: "contextual_error",
      difficulty: "easy",
      explanation: "الكلمات الثلاث الأولى منسجمة، بينما 'فوضوي' تنقضها.",
      tags: ["سياق", "معنى"],
    },
    {
      id: 9,
      question: "أي الكلمات الآتية تعد مختلفة عن البقية؟",
      options: ["قلم", "مسطرة", "مقص", "سيارة"],
      correctAnswer: 3,
      category: "verbal",
      subType: "odd_word",
      difficulty: "easy",
      explanation: "القلم والمسطرة والمقص أدوات مدرسية، بينما السيارة وسيلة نقل.",
      tags: ["شاذة", "تصنيف"],
    },
    {
      id: 10,
      question: "اختر المفردة الشاذة:",
      options: ["تفاح", "برتقال", "موز", "طاولة"],
      correctAnswer: 3,
      category: "verbal",
      subType: "odd_word",
      difficulty: "easy",
      explanation: "الثلاثة الأولى فواكه، بينما الطاولة قطعة أثاث.",
      tags: ["شاذة", "لغة"],
    },
    {
      id: 11,
      question: "اشترى أحمد 3 دفاتر، سعر الدفتر الواحد 8 ريالات. كم دفع بالمجموع؟",
      options: ["11", "16", "24", "28"],
      correctAnswer: 2,
      category: "quantitative",
      subType: "arithmetic",
      difficulty: "easy",
      explanation: "3 × 8 = 24.",
      tags: ["حساب", "ضرب"],
    },
    {
      id: 12,
      question: "إذا كانت نسبة الطلاب إلى الطالبات في فصل ما 2 : 3 وكان عدد الطلاب 12، فكم عدد الطالبات؟",
      options: ["16", "18", "20", "24"],
      correctAnswer: 1,
      category: "quantitative",
      subType: "arithmetic",
      difficulty: "medium",
      explanation: "إذا كانت 2 أجزاء = 12، فالجزء الواحد = 6، إذًا 3 أجزاء = 18.",
      tags: ["نسبة", "تناسب"],
    },
    {
      id: 13,
      question: "انخفض سعر سلعة من 80 إلى 60 ريالًا. كم مقدار الانخفاض؟",
      options: ["10", "20", "30", "40"],
      correctAnswer: 1,
      category: "quantitative",
      subType: "arithmetic",
      difficulty: "easy",
      explanation: "80 - 60 = 20.",
      tags: ["طرح", "حساب"],
    },
    {
      id: 14,
      question: "إذا كان 5/8 من عدد ما يساوي 20، فما العدد؟",
      options: ["24", "28", "32", "36"],
      correctAnswer: 2,
      category: "quantitative",
      subType: "arithmetic",
      difficulty: "hard",
      explanation: "العدد = 20 × 8 ÷ 5 = 32.",
      tags: ["كسور", "نسبة"],
    },
    {
      id: 15,
      question: "مستطيل طوله 9 سم وعرضه 4 سم. ما مساحته؟",
      options: ["13", "26", "36", "72"],
      correctAnswer: 2,
      category: "quantitative",
      subType: "geometry",
      difficulty: "easy",
      explanation: "مساحة المستطيل = الطول × العرض = 9 × 4 = 36.",
      tags: ["هندسة", "مساحة"],
    },
    {
      id: 16,
      question: "محيط مربع يساوي 24 سم. فما طول ضلعه؟",
      options: ["4", "5", "6", "8"],
      correctAnswer: 2,
      category: "quantitative",
      subType: "geometry",
      difficulty: "medium",
      explanation: "طول الضلع = 24 ÷ 4 = 6.",
      tags: ["هندسة", "محيط"],
    },
    {
      id: 17,
      question: "إذا كان 2س + 5 = 17، فما قيمة س؟",
      options: ["5", "6", "7", "8"],
      correctAnswer: 1,
      category: "quantitative",
      subType: "algebra",
      difficulty: "easy",
      explanation: "2س = 12 ثم س = 6.",
      tags: ["جبر", "معادلات"],
    },
    {
      id: 18,
      question: "حل المعادلة 3س - 4 = 11",
      options: ["3", "4", "5", "6"],
      correctAnswer: 2,
      category: "quantitative",
      subType: "algebra",
      difficulty: "medium",
      explanation: "3س = 15 ثم س = 5.",
      tags: ["جبر", "حل"],
    },
    {
      id: 19,
      question: "متوسط الأعداد 4 و6 و8 و10 يساوي:",
      options: ["6", "7", "8", "9"],
      correctAnswer: 1,
      category: "quantitative",
      subType: "statistics",
      difficulty: "easy",
      explanation: "المتوسط = (4 + 6 + 8 + 10) ÷ 4 = 7.",
      tags: ["إحصاء", "متوسط"],
    },
    {
      id: 20,
      question: "في صندوق 3 كرات حمراء و2 زرقاء. ما احتمال سحب كرة حمراء؟",
      options: ["1/5", "2/5", "3/5", "4/5"],
      correctAnswer: 2,
      category: "quantitative",
      subType: "statistics",
      difficulty: "medium",
      explanation: "عدد النتائج المواتية 3 من أصل 5 كرات، لذا الاحتمال 3/5.",
      tags: ["إحصاء", "احتمال"],
    },
  ];

  const App = {
    page: document.body.dataset.page,
    state: null,
    timerId: null,
    toastTimer: null,
    actionStamp: 0,
    lastMinuteAlerted: false,
    audioContext: null,

    init() {
      Theme.init();

      if (this.page === "home") {
        HomePage.init();
      } else if (this.page === "exam") {
        ExamPage.init();
      } else if (this.page === "results") {
        ResultsPage.init();
      } else if (this.page === "about") {
        AboutPage.init();
      }
    },
  };

  const Theme = {
    init() {
      const settings = Storage.readSettings();
      const theme = THEMES.includes(settings.theme) ? settings.theme : "sky";
      document.body.dataset.theme = theme;

      const pickers = Array.from(document.querySelectorAll("[data-theme-picker]"));
      if (!pickers.length) {
        return;
      }

      const applyTheme = (selectedTheme) => {
        const nextTheme = THEMES.includes(selectedTheme) ? selectedTheme : "sky";
        document.body.dataset.theme = nextTheme;
        Storage.writeSettings({ ...Storage.readSettings(), theme: nextTheme });

        pickers.forEach((picker) => {
          const currentLabel = picker.querySelector("[data-theme-current]");
          const options = Array.from(picker.querySelectorAll("[data-theme-value]"));
          if (currentLabel) {
            currentLabel.textContent = THEME_LABELS[nextTheme];
          }

          options.forEach((option) => {
            const isActive = option.dataset.themeValue === nextTheme;
            option.classList.toggle("is-active", isActive);
            option.setAttribute("aria-selected", String(isActive));
            option.tabIndex = isActive ? 0 : -1;
          });
        });
      };

      const closePicker = (picker) => {
        picker.classList.remove("is-open");
        const trigger = picker.querySelector("[data-theme-trigger]");
        if (trigger) {
          trigger.setAttribute("aria-expanded", "false");
        }
      };

      const openPicker = (picker) => {
        pickers.forEach((entry) => {
          if (entry !== picker) {
            closePicker(entry);
          }
        });
        picker.classList.add("is-open");
        const trigger = picker.querySelector("[data-theme-trigger]");
        if (trigger) {
          trigger.setAttribute("aria-expanded", "true");
        }
      };

      pickers.forEach((picker) => {
        const trigger = picker.querySelector("[data-theme-trigger]");
        const options = Array.from(picker.querySelectorAll("[data-theme-value]"));

        if (!trigger || !options.length) {
          return;
        }

        trigger.addEventListener("click", () => {
          const isOpen = picker.classList.contains("is-open");
          if (isOpen) {
            closePicker(picker);
          } else {
            openPicker(picker);
          }
        });

        trigger.addEventListener("keydown", (event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker(picker);
            const activeOption = options.find((option) => option.classList.contains("is-active")) || options[0];
            activeOption.focus();
          }
        });

        options.forEach((option, index) => {
          option.addEventListener("click", () => {
            applyTheme(option.dataset.themeValue);
            closePicker(picker);
            trigger.focus();
          });

          option.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
              closePicker(picker);
              trigger.focus();
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              options[(index + 1) % options.length].focus();
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              options[(index - 1 + options.length) % options.length].focus();
            }
          });
        });
      });

      document.addEventListener("click", (event) => {
        pickers.forEach((picker) => {
          if (!picker.contains(event.target)) {
            closePicker(picker);
          }
        });
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          pickers.forEach(closePicker);
        }
      });

      applyTheme(theme);
    },
  };

  const Storage = {
    readJSON(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) {
          return fallback;
        }

        return JSON.parse(raw);
      } catch (error) {
        localStorage.removeItem(key);
        return fallback;
      }
    },

    writeJSON(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn("تعذر الحفظ المحلي:", error);
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn("تعذر حذف المفتاح:", error);
      }
    },

    readSettings() {
      return this.readJSON(STORAGE_KEYS.settings, {});
    },

    writeSettings(settings) {
      this.writeJSON(STORAGE_KEYS.settings, settings);
    },

    readExamState() {
      const state = this.readJSON(STORAGE_KEYS.examState, null);
      return validateState(state) ? state : null;
    },

    writeExamState(state) {
      this.writeJSON(STORAGE_KEYS.examState, state);
    },

    appendHistory(entry) {
      const history = this.readJSON(STORAGE_KEYS.examHistory, []);
      const nextHistory = [entry, ...history].slice(0, 12);
      this.writeJSON(STORAGE_KEYS.examHistory, nextHistory);
    },
  };

  const Data = {
    async loadQuestions() {
      const shouldFetch = location.protocol !== "file:";

      if (shouldFetch) {
        try {
          const response = await fetch("questions.json", { cache: "no-store" });
          if (response.ok) {
            const data = await response.json();
            const normalized = normalizeQuestions(data);
            if (normalized.length) {
              return normalized;
            }
          }
        } catch (error) {
          console.warn("تعذر تحميل questions.json، سيتم استخدام النسخة الداخلية.", error);
        }
      }

      return normalizeQuestions(FALLBACK_QUESTIONS);
    },

    prepareQuestions(rawQuestions) {
      return shuffleArray(rawQuestions.map(shuffleQuestionOptions));
    },
  };

  const HomePage = {
    init() {
      const resumeLink = document.getElementById("resume-link");
      if (resumeLink && hasActiveExam()) {
        resumeLink.classList.remove("is-hidden");
      }
    },
  };

  const AboutPage = {
    init() {},
  };

  const ExamPage = {
    async init() {
      const action = new URLSearchParams(window.location.search).get("action");
      let activeState = Storage.readExamState();

      if (action === "start") {
        Storage.remove(STORAGE_KEYS.examState);
        activeState = null;
      }

      if (activeState && !activeState.isFinished) {
        this.resumeState(activeState);
        if (App.state && App.state.isFinished) {
          return;
        }
      } else {
        const rawQuestions = await Data.loadQuestions();
        const preparedQuestions = Data.prepareQuestions(rawQuestions);
        this.createNewExam(preparedQuestions);
      }

      this.bindEvents();
      this.render();
      this.startTimer();
    },

    createNewExam(questions) {
      const now = Date.now();
      App.state = {
        questions,
        answers: questions.map(() => null),
        currentIndex: 0,
        timeLeft: EXAM_DURATION_SECONDS,
        startedAt: now,
        lastTickAt: now,
        lastQuestionTimestamp: now,
        isFinished: false,
        flagged: questions.map(() => false),
        timeSpentPerQuestion: questions.map(() => 0),
        stats: null,
        tabSwitchCount: 0,
        attemptId: `attempt-${now}`,
      };
      App.lastMinuteAlerted = false;
      Storage.writeExamState(App.state);
    },

    resumeState(savedState) {
      const now = Date.now();
      const elapsed = Math.floor((now - savedState.lastTickAt) / 1000);
      const questionElapsed = Math.floor((now - savedState.lastQuestionTimestamp) / 1000);
      const nextState = { ...savedState };
      nextState.timeLeft = Math.max(0, savedState.timeLeft - Math.max(elapsed, 0));
      nextState.timeSpentPerQuestion = [...savedState.timeSpentPerQuestion];
      nextState.timeSpentPerQuestion[nextState.currentIndex] += Math.max(questionElapsed, 0);
      nextState.lastTickAt = now;
      nextState.lastQuestionTimestamp = now;
      App.state = nextState;
      App.lastMinuteAlerted = nextState.timeLeft <= 60;
      Storage.writeExamState(App.state);

      if (nextState.timeLeft === 0) {
        this.finishExam("انتهى الوقت");
      }
    },

    bindEvents() {
      const prevButton = document.getElementById("prev-button");
      const nextButton = document.getElementById("next-button");
      const flagButton = document.getElementById("flag-button");
      const finishButton = document.getElementById("finish-button");
      const fullscreenButton = document.getElementById("fullscreen-button");
      const finishModal = document.getElementById("finish-modal");
      const cancelFinishButton = document.getElementById("cancel-finish-button");
      const confirmFinishButton = document.getElementById("confirm-finish-button");

      prevButton.addEventListener("click", () => {
        if (isDebounced()) {
          return;
        }
        if (App.state.currentIndex > 0) {
          this.goToQuestion(App.state.currentIndex - 1);
        }
      });

      nextButton.addEventListener("click", () => {
        if (isDebounced()) {
          return;
        }
        if (App.state.answers[App.state.currentIndex] === null) {
          showToast("اختر إجابة أولًا قبل الانتقال.");
          return;
        }
        if (App.state.currentIndex === App.state.questions.length - 1) {
          this.toggleFinishModal(true);
          return;
        }
        this.goToQuestion(App.state.currentIndex + 1);
      });

      flagButton.addEventListener("click", () => {
        if (isDebounced()) {
          return;
        }
        App.state.flagged[App.state.currentIndex] = !App.state.flagged[App.state.currentIndex];
        persistState();
        this.renderStatus();
        this.renderQuestionGrid();
      });

      finishButton.addEventListener("click", () => {
        if (isDebounced()) {
          return;
        }
        this.toggleFinishModal(true);
      });

      cancelFinishButton.addEventListener("click", () => this.toggleFinishModal(false));
      confirmFinishButton.addEventListener("click", () => this.finishExam("إنهاء يدوي"));

      finishModal.addEventListener("click", (event) => {
        if (event.target === finishModal) {
          this.toggleFinishModal(false);
        }
      });

      document.addEventListener("keydown", (event) => {
        if (!App.state || App.state.isFinished) {
          return;
        }

        if (!finishModal.classList.contains("is-hidden")) {
          if (event.key === "Escape") {
            this.toggleFinishModal(false);
          } else if (event.key === "Enter") {
            confirmFinishButton.click();
          }
          return;
        }

        if (OPTION_KEYS.includes(event.key)) {
          event.preventDefault();
          this.selectAnswer(Number(event.key) - 1);
        }

        if (event.key === "Enter") {
          event.preventDefault();
          if (App.state.answers[App.state.currentIndex] !== null) {
            if (App.state.currentIndex === App.state.questions.length - 1) {
              this.toggleFinishModal(true);
            } else {
              this.goToQuestion(App.state.currentIndex + 1);
            }
          }
        }
      });

      document.addEventListener("visibilitychange", () => {
        if (document.hidden && App.state && !App.state.isFinished) {
          App.state.tabSwitchCount += 1;
          persistState();
          showToast("تم رصد مغادرة صفحة الاختبار، تابع تركيزك.");
        }
      });

      window.addEventListener("beforeunload", (event) => {
        if (App.state && !App.state.isFinished) {
          persistState();
          event.preventDefault();
          event.returnValue = "";
        }
      });

      if (fullscreenButton) {
        fullscreenButton.addEventListener("click", async () => {
          if (isDebounced()) {
            return;
          }
          try {
            if (!document.fullscreenElement) {
              await document.documentElement.requestFullscreen();
            } else {
              await document.exitFullscreen();
            }
          } catch (error) {
            showToast("وضع ملء الشاشة غير مدعوم في هذا المتصفح.");
          }
        });
      }
    },

    render() {
      this.renderQuestionCard();
      this.renderStatus();
      this.renderQuestionGrid();
    },

    renderQuestionCard() {
      const question = App.state.questions[App.state.currentIndex];
      const selectedAnswer = App.state.answers[App.state.currentIndex];
      const optionsList = document.getElementById("options-list");
      const categoryBadge = document.getElementById("category-badge");
      const subtypeBadge = document.getElementById("subtype-badge");
      const difficultyBadge = document.getElementById("difficulty-badge");
      const questionText = document.getElementById("question-text");
      const nextButton = document.getElementById("next-button");
      const prevButton = document.getElementById("prev-button");
      const flagButton = document.getElementById("flag-button");

      categoryBadge.textContent = LABELS.category[question.category];
      subtypeBadge.textContent = LABELS.subType[question.subType];
      difficultyBadge.textContent = LABELS.difficulty[question.difficulty];
      questionText.textContent = question.question;

      optionsList.innerHTML = "";
      question.options.forEach((option, index) => {
        const optionButton = document.createElement("button");
        optionButton.type = "button";
        optionButton.className = "option-button";
        optionButton.setAttribute("role", "radio");
        optionButton.setAttribute("aria-checked", String(selectedAnswer === index));
        optionButton.setAttribute("aria-label", `الخيار ${index + 1}: ${option}`);
        if (selectedAnswer === index) {
          optionButton.classList.add("is-selected");
        }

        optionButton.innerHTML = `<span class="option-badge">${index + 1}</span><span>${escapeHtml(option)}</span>`;
        optionButton.addEventListener("click", () => this.selectAnswer(index));
        optionsList.appendChild(optionButton);
      });

      prevButton.disabled = App.state.currentIndex === 0;
      nextButton.disabled = selectedAnswer === null;
      nextButton.textContent = App.state.currentIndex === App.state.questions.length - 1 ? "عرض النتيجة" : "التالي";
      flagButton.textContent = App.state.flagged[App.state.currentIndex] ? "إلغاء التعليم" : "تعليم للمراجعة";
    },

    renderStatus() {
      const answeredCount = App.state.answers.filter((answer) => answer !== null).length;
      const flaggedCount = App.state.flagged.filter(Boolean).length;
      const totalQuestions = App.state.questions.length;
      const percent = Math.round((answeredCount / totalQuestions) * 100);

      document.getElementById("question-progress").textContent = `${App.state.currentIndex + 1} / ${totalQuestions}`;
      document.getElementById("flagged-count").textContent = String(flaggedCount);
      document.getElementById("answered-summary").textContent = `${answeredCount} / ${totalQuestions} مجاب`;
      document.getElementById("progress-value").style.width = `${percent}%`;
      document.getElementById("progress-label").textContent = `${percent}%`;

      this.renderTimer();
    },

    renderTimer() {
      const timerChip = document.getElementById("timer-chip");
      const timerDisplay = document.getElementById("timer-display");
      timerDisplay.textContent = formatTime(App.state.timeLeft);

      if (App.state.timeLeft <= 60) {
        timerChip.classList.add("is-warning");
        if (!App.lastMinuteAlerted) {
          App.lastMinuteAlerted = true;
          playAlertTone();
          showToast("تبقت أقل من دقيقة على نهاية الاختبار.");
        }
      } else {
        timerChip.classList.remove("is-warning");
      }
    },

    renderQuestionGrid() {
      const grid = document.getElementById("question-grid");
      grid.innerHTML = "";

      App.state.questions.forEach((question, index) => {
        const jumpButton = document.createElement("button");
        jumpButton.type = "button";
        jumpButton.className = "question-jump";
        jumpButton.textContent = String(index + 1);
        jumpButton.setAttribute("aria-label", `الانتقال إلى السؤال ${index + 1}`);

        if (index === App.state.currentIndex) {
          jumpButton.classList.add("is-current");
        }
        if (App.state.answers[index] !== null) {
          jumpButton.classList.add("is-answered");
        }
        if (App.state.flagged[index]) {
          jumpButton.classList.add("is-flagged");
        }

        jumpButton.addEventListener("click", () => {
          if (isDebounced()) {
            return;
          }
          this.goToQuestion(index);
        });

        grid.appendChild(jumpButton);
      });
    },

    selectAnswer(optionIndex) {
      App.state.answers[App.state.currentIndex] = optionIndex;
      persistState();
      this.renderQuestionCard();
      this.renderStatus();
      this.renderQuestionGrid();
    },

    goToQuestion(index) {
      if (index === App.state.currentIndex) {
        return;
      }
      this.recordTimeForCurrentQuestion();
      App.state.currentIndex = index;
      App.state.lastQuestionTimestamp = Date.now();
      persistState();
      this.render();
    },

    recordTimeForCurrentQuestion() {
      const now = Date.now();
      const delta = Math.max(0, Math.floor((now - App.state.lastQuestionTimestamp) / 1000));
      App.state.timeSpentPerQuestion[App.state.currentIndex] += delta;
    },

    startTimer() {
      clearInterval(App.timerId);
      const deadline = Date.now() + (App.state.timeLeft * 1000);

      const tick = () => {
        const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        if (remaining !== App.state.timeLeft) {
          App.state.timeLeft = remaining;
          App.state.lastTickAt = Date.now();
          persistState();
          this.renderTimer();
        }

        if (remaining === 0) {
          this.finishExam("انتهى الوقت");
        }
      };

      tick();
      App.timerId = window.setInterval(tick, 1000);
    },

    toggleFinishModal(shouldShow) {
      const modal = document.getElementById("finish-modal");
      modal.classList.toggle("is-hidden", !shouldShow);
    },

    finishExam(reason) {
      if (!App.state || App.state.isFinished) {
        return;
      }

      this.recordTimeForCurrentQuestion();
      clearInterval(App.timerId);

      const stats = computeStats(App.state);
      App.state.isFinished = true;
      App.state.finishedAt = Date.now();
      App.state.finishReason = reason;
      App.state.stats = stats;
      App.state.lastTickAt = Date.now();
      Storage.writeExamState(App.state);
      Storage.appendHistory({
        attemptId: App.state.attemptId,
        finishedAt: App.state.finishedAt,
        score: stats.score,
        total: stats.total,
        percentage: stats.percentage,
        rating: stats.rating,
      });

      window.location.href = "results.html";
    },
  };

  const ResultsPage = {
    init() {
      const state = Storage.readExamState();
      if (!state || !state.isFinished) {
        window.location.replace("index.html");
        return;
      }

      App.state = state;
      if (!App.state.stats) {
        App.state.stats = computeStats(App.state);
        Storage.writeExamState(App.state);
      }

      this.bindEvents();
      this.render();
    },

    bindEvents() {
      const retryButton = document.getElementById("retry-button");
      const printButton = document.getElementById("print-button");

      retryButton.addEventListener("click", () => {
        Storage.remove(STORAGE_KEYS.examState);
        window.location.href = "exam.html?action=start";
      });

      printButton.addEventListener("click", () => {
        window.print();
      });
    },

    render() {
      const stats = App.state.stats;
      const attemptDate = App.state.finishedAt ? new Date(App.state.finishedAt) : new Date();

      document.getElementById("score-value").textContent = `${stats.score} / ${stats.total}`;
      document.getElementById("score-percent").textContent = `${stats.percentage}%`;
      document.getElementById("score-rating").textContent = stats.rating;
      document.getElementById("encouragement-message").textContent = getEncouragementMessage(stats.percentage);
      document.getElementById("correct-count").textContent = String(stats.score);
      document.getElementById("wrong-count").textContent = String(stats.wrong);
      document.getElementById("unanswered-count").textContent = String(stats.unanswered);
      document.getElementById("time-used").textContent = formatTime(stats.totalTimeUsed);
      document.getElementById("attempt-date").textContent = attemptDate.toLocaleString("ar-SA");

      this.renderAnalytics("category-analytics", stats.byCategory);
      this.renderAnalytics("subtype-analytics", stats.bySubType);
      this.renderReviewList(stats.review);
    },

    renderAnalytics(containerId, bucket) {
      const container = document.getElementById(containerId);
      container.innerHTML = "";

      Object.values(bucket).forEach((item) => {
        const percentage = item.total ? Math.round((item.correct / item.total) * 100) : 0;
        const card = document.createElement("article");
        card.className = "analytics-card";
        card.innerHTML = `
          <h3>${escapeHtml(item.label)}</h3>
          <div class="analytics-bar"><span style="width:${percentage}%"></span></div>
          <div class="analytics-meta">
            <span>${item.correct} صحيح من ${item.total}</span>
            <strong>${percentage}%</strong>
          </div>
        `;
        container.appendChild(card);
      });
    },

    renderReviewList(review) {
      const reviewList = document.getElementById("review-list");
      reviewList.innerHTML = "";

      review.forEach((item) => {
        const reviewItem = document.createElement("article");
        reviewItem.className = `review-item ${item.isCorrect ? "is-correct" : "is-wrong"}`;
        reviewItem.innerHTML = `
          <div class="review-head">
            <h3>السؤال ${item.index + 1}</h3>
            <div class="badge-row">
              <span class="badge">${escapeHtml(item.categoryLabel)}</span>
              <span class="badge badge-soft">${escapeHtml(item.subTypeLabel)}</span>
              ${item.flagged ? '<span class="badge badge-outline">معلّم للمراجعة</span>' : ""}
            </div>
          </div>
          <p class="review-question">${escapeHtml(item.question)}</p>
          <div class="review-meta">
            <span><strong>إجابتك:</strong> ${escapeHtml(item.userAnswer || "لم تتم الإجابة")}</span>
            <span><strong>الإجابة الصحيحة:</strong> ${escapeHtml(item.correctAnswer)}</span>
            <span><strong>الوقت المستغرق:</strong> ${formatTime(item.timeSpent)}</span>
          </div>
          <div class="review-note">${escapeHtml(item.explanation)}</div>
        `;
        reviewList.appendChild(reviewItem);
      });
    },
  };

  function normalizeQuestions(rawQuestions) {
    if (!Array.isArray(rawQuestions)) {
      return [];
    }

    return rawQuestions
      .filter((question) => {
        return question && typeof question.question === "string" && Array.isArray(question.options) && question.options.length === 4;
      })
      .map((question, index) => ({
        id: Number(question.id || index + 1),
        question: String(question.question),
        options: question.options.map(String),
        correctAnswer: Number(question.correctAnswer),
        category: question.category === "quantitative" ? "quantitative" : "verbal",
        subType: String(question.subType),
        difficulty: ["easy", "medium", "hard"].includes(question.difficulty) ? question.difficulty : "medium",
        explanation: String(question.explanation || "لا يوجد شرح مضاف لهذا السؤال."),
        tags: Array.isArray(question.tags) ? question.tags.map(String) : [],
      }));
  }

  function validateState(state) {
    if (!state || typeof state !== "object") {
      return false;
    }

    if (!Array.isArray(state.questions) || !Array.isArray(state.answers) || !Array.isArray(state.flagged) || !Array.isArray(state.timeSpentPerQuestion)) {
      return false;
    }

    const total = state.questions.length;
    return (
      total > 0 &&
      state.answers.length === total &&
      state.flagged.length === total &&
      state.timeSpentPerQuestion.length === total &&
      typeof state.currentIndex === "number" &&
      typeof state.timeLeft === "number"
    );
  }

  function hasActiveExam() {
    const state = Storage.readExamState();
    return Boolean(state && !state.isFinished);
  }

  function shuffleQuestionOptions(question) {
    const decoratedOptions = question.options.map((option, index) => ({
      option,
      index,
    }));

    shuffleArrayInPlace(decoratedOptions);
    const newCorrectIndex = decoratedOptions.findIndex((entry) => entry.index === question.correctAnswer);

    return {
      ...question,
      options: decoratedOptions.map((entry) => entry.option),
      correctAnswer: newCorrectIndex,
    };
  }

  function shuffleArray(list) {
    const copy = [...list];
    shuffleArrayInPlace(copy);
    return copy;
  }

  function shuffleArrayInPlace(list) {
    for (let index = list.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [list[index], list[randomIndex]] = [list[randomIndex], list[index]];
    }
  }

  function computeStats(state) {
    const byCategory = {};
    const bySubType = {};
    let score = 0;
    let wrong = 0;
    let unanswered = 0;

    const review = state.questions.map((question, index) => {
      const selectedIndex = state.answers[index];
      const isAnswered = selectedIndex !== null && selectedIndex !== undefined;
      const isCorrect = isAnswered && selectedIndex === question.correctAnswer;

      if (isCorrect) {
        score += 1;
      } else if (isAnswered) {
        wrong += 1;
      } else {
        unanswered += 1;
      }

      addBucket(byCategory, question.category, LABELS.category[question.category], isCorrect);
      addBucket(bySubType, question.subType, LABELS.subType[question.subType] || question.subType, isCorrect);

      return {
        index,
        question: question.question,
        categoryLabel: LABELS.category[question.category],
        subTypeLabel: LABELS.subType[question.subType] || question.subType,
        userAnswer: isAnswered ? question.options[selectedIndex] : null,
        correctAnswer: question.options[question.correctAnswer],
        explanation: question.explanation,
        isCorrect,
        flagged: state.flagged[index],
        timeSpent: state.timeSpentPerQuestion[index] || 0,
      };
    });

    const total = state.questions.length;
    const percentage = Math.round((score / total) * 100);
    const totalTimeUsed = state.timeSpentPerQuestion.reduce((sum, value) => sum + (Number(value) || 0), 0);

    return {
      score,
      wrong,
      unanswered,
      total,
      percentage,
      totalTimeUsed,
      rating: getRating(percentage),
      byCategory,
      bySubType,
      review,
    };
  }

  function addBucket(bucket, key, label, isCorrect) {
    if (!bucket[key]) {
      bucket[key] = {
        key,
        label,
        total: 0,
        correct: 0,
      };
    }

    bucket[key].total += 1;
    bucket[key].correct += isCorrect ? 1 : 0;
  }

  function getRating(percentage) {
    if (percentage >= 90) {
      return "ممتاز";
    }
    if (percentage >= 80) {
      return "جيد جدًا";
    }
    if (percentage >= 70) {
      return "جيد";
    }
    return "يحتاج تحسين";
  }

  function getEncouragementMessage(percentage) {
    if (percentage >= 90) {
      return "أداء قوي جدًا، استمر بنفس الثبات وستحقق نتائج مميزة بإذن الله.";
    }
    if (percentage >= 80) {
      return "نتيجة جميلة جدًا، ومع قليل من المراجعة المركزة ستصل لمستوى أعلى.";
    }
    if (percentage >= 70) {
      return "بداية جيدة، ورفع التركيز على نقاط الضعف سيمنحك قفزة واضحة.";
    }
    return "هذه المحاولة خطوة مفيدة، راجع الأخطاء بهدوء وكرر التدريب وستلاحظ التحسن.";
  }

  function formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function persistState() {
    if (!App.state) {
      return;
    }
    Storage.writeExamState(App.state);
  }

  function isDebounced() {
    const now = Date.now();
    if (now - App.actionStamp < ACTION_DEBOUNCE_MS) {
      return true;
    }
    App.actionStamp = now;
    return false;
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(App.toastTimer);
    App.toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2400);
  }

  function playAlertTone() {
    if (!window.AudioContext && !window.webkitAudioContext) {
      return;
    }

    const AudioContextRef = window.AudioContext || window.webkitAudioContext;
    App.audioContext = App.audioContext || new AudioContextRef();

    const oscillator = App.audioContext.createOscillator();
    const gainNode = App.audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 740;
    gainNode.gain.value = 0.04;

    oscillator.connect(gainNode);
    gainNode.connect(App.audioContext.destination);
    oscillator.start();
    oscillator.stop(App.audioContext.currentTime + 0.18);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  document.addEventListener("DOMContentLoaded", () => App.init());
})();
