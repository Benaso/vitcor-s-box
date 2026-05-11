export const languages = [
  { code: 'zh', label: '中' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' }
]

const terminalLine = 'choose life, choose a job, choose a family...'

export const translations = {
  zh: {
    nav: {
      home: '首页',
      about: '关于',
      projects: '项目',
      blog: '碎碎念',
      hobbies: '爱好'
    },
    routes: {
      home: '首页',
      about: '关于',
      projects: '项目',
      blog: '碎碎念',
      hobbies: '爱好',
      page: '页面'
    },
    transition: {
      eyebrow: '// 路由'
    },
    home: {
      title: 'YE DONGYU',
      subtitle: 'AI NATIVE 工业软件开发工程师 / AI Agent 开发工程师',
      terminal: terminalLine,
      viewProjects: '嗨！秋！'
    },
    pages: {
      about: {
        eyebrow: 'ABOUT',
        title: '关于我',
        intro: '我关注工业软件、工程效率和 AI Agent，把复杂系统做成清晰、可维护、能被人真正使用的工具。',
        items: [
          { label: 'ORIGIN', title: '工程感', body: '喜欢从真实问题出发，把流程、数据和界面整理成可靠的工作台。' },
          { label: 'METHOD', title: '慢一点想，快一点做', body: '先把边界想清楚，再用小步迭代把东西做出来。' },
          { label: 'CURRENT', title: '现在', body: '持续探索 AI Agent 与工程软件结合的产品形态。' }
        ]
      },
      projects: {
        eyebrow: 'PROJECTS',
        title: '项目',
        intro: '这里会放我做过的工具、实验和工程作品。每个项目都希望有明确的问题、设计取舍和复盘。',
        items: [
          { label: 'SYSTEM', title: '工业软件工作流', body: '面向工程场景的流程整理、数据管理与交互原型。' },
          { label: 'AGENT', title: 'AI Agent 实验', body: '围绕工具调用、任务拆解和人机协作的实践。' },
          { label: 'WEB', title: '个人网站', body: '一个柔和黑白像素风的个人档案和作品展示站。' }
        ]
      },
      blog: {
        eyebrow: 'NOTES',
        title: '碎碎念',
        intro: '一些短记录：技术判断、学习笔记、踩坑、灵感和不太成体系但值得留下的想法。',
        items: [
          { label: 'LOG', title: '开发日志', body: '记录每次把东西从模糊推进到可用的过程。' },
          { label: 'THINKING', title: '技术判断', body: '写下为什么选这个方案，而不是只留下最后的代码。' },
          { label: 'LIFE', title: '生活切片', body: '偶尔也记录工作之外的状态，给未来的自己留一点上下文。' }
        ]
      },
      hobbies: {
        eyebrow: 'HOBBIES',
        title: '爱好',
        intro: '不是简历上的加分项，只是一些让我保持好奇和手感的东西。',
        items: [
          { label: 'MUSIC', title: '音乐', body: '适合循环播放的声音，常常比计划表更能推进一天。' },
          { label: 'GAMES', title: '游戏', body: '喜欢有清晰规则、强反馈和独特世界观的作品。' },
          { label: 'READING', title: '阅读', body: '技术、小说、设计和一些慢慢咀嚼的长文本。' }
        ]
      }
    },
    chat: {
      title: 'qiu boot',
      path: '/复古对话',
      notices: ['访客: QIU', '模式: 8-BIT 对话', '显示: TTY0'],
      initialMessages: [
        { source: 'QIU', text: 'QIU> 醒来了。\n欢迎，旅人。' },
        { source: 'SYS', text: '模式> 单色口袋终端。' },
        { source: 'LOG', text: '连接> qiu 卡带已插好。存档灯稳定。' }
      ],
      bootAria: 'qiu 虚拟机启动序列',
      bootLines: [
        { label: 'POST 记忆检查', value: '2048 MB OK' },
        { label: '挂载 /dev/qiu-core', value: 'READY' },
        { label: '载入人格矩阵', value: 'OK' },
        { label: '连接对话设备', value: 'OK' },
        { label: '校准共情总线', value: 'OK' },
        { label: '启动 agent-shell.service', value: 'ONLINE' },
        { label: '交接到 qiu@tty0', value: 'READY' }
      ],
      thinkingLabel: 'QIU 正在思考',
      thinkingSteps: ['读取信号', '转动小齿轮', '检查地图格'],
      prompt: '和 qiu 说话',
      sendingPrompt: 'qiu 正在读取卡带...',
      linkFailed: 'SYS> qiu 连接失败。请检查后端日志和 MiniMax key。',
      collapse: '收起',
      collapseAria: '收起对话框'
    },
    footer: '© 2002 -- 2026: a gift for my 24'
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      blog: 'Notes',
      hobbies: 'Hobbies'
    },
    routes: {
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      blog: 'Notes',
      hobbies: 'Hobbies',
      page: 'Page'
    },
    transition: {
      eyebrow: '// Route'
    },
    home: {
      title: 'YE DONGYU',
      subtitle: 'Industrial Software Engineer / AI Agent Engineer',
      terminal: terminalLine,
      viewProjects: 'Hi! Qiu!'
    },
    pages: {
      about: {
        eyebrow: 'ABOUT',
        title: 'About',
        intro: 'I care about industrial software, engineering efficiency, and AI agents: turning complex systems into clear, maintainable tools people can actually use.',
        items: [
          { label: 'ORIGIN', title: 'Engineering Sense', body: 'I like starting from real problems and shaping workflows, data, and interfaces into usable workbenches.' },
          { label: 'METHOD', title: 'Think Slowly, Build Quickly', body: 'Clarify the edges first, then move in small practical iterations.' },
          { label: 'CURRENT', title: 'Now', body: 'Exploring product forms where AI agents meet engineering software.' }
        ]
      },
      projects: {
        eyebrow: 'PROJECTS',
        title: 'Projects',
        intro: 'A home for tools, experiments, and engineering work, each with a problem, tradeoffs, and a short reflection.',
        items: [
          { label: 'SYSTEM', title: 'Industrial Workflows', body: 'Workflow mapping, data handling, and interaction prototypes for engineering contexts.' },
          { label: 'AGENT', title: 'AI Agent Experiments', body: 'Practice around tool use, task decomposition, and human-agent collaboration.' },
          { label: 'WEB', title: 'Personal Website', body: 'A soft black-and-white pixel portfolio and profile site.' }
        ]
      },
      blog: {
        eyebrow: 'NOTES',
        title: 'Notes',
        intro: 'Short records: technical judgment, learning notes, mistakes, sparks, and ideas worth keeping before they become polished essays.',
        items: [
          { label: 'LOG', title: 'Build Logs', body: 'How things move from vague intention to something usable.' },
          { label: 'THINKING', title: 'Technical Decisions', body: 'Why a path was chosen, not just the code that remained.' },
          { label: 'LIFE', title: 'Life Fragments', body: 'A bit of context outside work for the future version of me.' }
        ]
      },
      hobbies: {
        eyebrow: 'HOBBIES',
        title: 'Hobbies',
        intro: 'Not resume points, just things that keep curiosity and touch alive.',
        items: [
          { label: 'MUSIC', title: 'Music', body: 'Loopable sounds that sometimes move a day forward better than a checklist.' },
          { label: 'GAMES', title: 'Games', body: 'Works with clear rules, strong feedback, and a distinct world.' },
          { label: 'READING', title: 'Reading', body: 'Technology, fiction, design, and long texts that ask to be chewed slowly.' }
        ]
      }
    },
    chat: {
      title: 'qiu boot',
      path: '/retro-dialogue',
      notices: ['GUEST: QIU', 'MODE: 8-BIT DIALOGUE', 'DISPLAY: TTY0'],
      initialMessages: [
        { source: 'QIU', text: 'QIU> awake.\nWelcome, traveler.' },
        { source: 'SYS', text: 'MODE> monochrome pocket terminal.' },
        { source: 'LOG', text: 'LINK> qiu cartridge seated. save lamp steady.' }
      ],
      bootAria: 'qiu virtual machine boot sequence',
      bootLines: [
        { label: 'POST memory check', value: '2048 MB OK' },
        { label: 'mount /dev/qiu-core', value: 'READY' },
        { label: 'load personality matrix', value: 'OK' },
        { label: 'attach dialogue device', value: 'OK' },
        { label: 'calibrate empathy bus', value: 'OK' },
        { label: 'start agent-shell.service', value: 'ONLINE' },
        { label: 'handoff to qiu@tty0', value: 'READY' }
      ],
      thinkingLabel: 'QIU IS THINKING',
      thinkingSteps: ['reading signal', 'turning tiny gears', 'checking map tiles'],
      prompt: 'talk to qiu',
      sendingPrompt: 'qiu is reading the cartridge...',
      linkFailed: 'SYS> qiu link failed. Check backend logs and MiniMax key.',
      collapse: 'Collapse',
      collapseAria: 'Collapse dialogue panel'
    },
    footer: '© 2002 -- 2026: a gift for my 24'
  },
  de: {
    nav: {
      home: 'Start',
      about: 'Über',
      projects: 'Projekte',
      blog: 'Notizen',
      hobbies: 'Hobbys'
    },
    routes: {
      home: 'Start',
      about: 'Über',
      projects: 'Projekte',
      blog: 'Notizen',
      hobbies: 'Hobbys',
      page: 'Seite'
    },
    transition: {
      eyebrow: '// Route'
    },
    home: {
      title: 'YE DONGYU',
      subtitle: 'Ingenieur für Industriesoftware / AI-Agent-Entwickler',
      terminal: terminalLine,
      viewProjects: 'Hallo! Qiu!'
    },
    pages: {
      about: {
        eyebrow: 'ABOUT',
        title: 'Über mich',
        intro: 'Ich beschäftige mich mit Industriesoftware, Engineering-Effizienz und AI Agents: komplexe Systeme sollen klare, wartbare Werkzeuge werden.',
        items: [
          { label: 'ORIGIN', title: 'Engineering-Gefühl', body: 'Ich beginne gern bei echten Problemen und forme Workflows, Daten und Interfaces zu nutzbaren Arbeitsflächen.' },
          { label: 'METHOD', title: 'Langsam denken, schnell bauen', body: 'Erst die Grenzen klären, dann in kleinen praktischen Schritten liefern.' },
          { label: 'CURRENT', title: 'Jetzt', body: 'Ich erforsche Produktformen zwischen AI Agents und Engineering-Software.' }
        ]
      },
      projects: {
        eyebrow: 'PROJECTS',
        title: 'Projekte',
        intro: 'Ein Ort für Tools, Experimente und Engineering-Arbeiten, jeweils mit Problem, Abwägungen und kurzer Reflexion.',
        items: [
          { label: 'SYSTEM', title: 'Industrie-Workflows', body: 'Workflow-Mapping, Datenhandling und Interaktionsprototypen für Engineering-Kontexte.' },
          { label: 'AGENT', title: 'AI-Agent-Experimente', body: 'Praxis rund um Tool-Nutzung, Aufgabenzerlegung und Mensch-Agent-Zusammenarbeit.' },
          { label: 'WEB', title: 'Persönliche Website', body: 'Ein weiches schwarz-weißes Pixel-Portfolio und Profil.' }
        ]
      },
      blog: {
        eyebrow: 'NOTES',
        title: 'Notizen',
        intro: 'Kurze Aufzeichnungen: technische Einschätzungen, Lernnotizen, Fehler, Funken und Ideen, bevor sie zu fertigen Essays werden.',
        items: [
          { label: 'LOG', title: 'Build Logs', body: 'Wie Dinge von einer vagen Idee zu etwas Nutzbarem werden.' },
          { label: 'THINKING', title: 'Technische Entscheidungen', body: 'Warum ein Weg gewählt wurde, nicht nur der Code, der übrig blieb.' },
          { label: 'LIFE', title: 'Lebensfragmente', body: 'Etwas Kontext außerhalb der Arbeit für mein zukünftiges Ich.' }
        ]
      },
      hobbies: {
        eyebrow: 'HOBBIES',
        title: 'Hobbys',
        intro: 'Keine Punkte für den Lebenslauf, sondern Dinge, die Neugier und Gefühl wachhalten.',
        items: [
          { label: 'MUSIC', title: 'Musik', body: 'Loopbare Klänge, die einen Tag manchmal besser bewegen als eine Checkliste.' },
          { label: 'GAMES', title: 'Spiele', body: 'Werke mit klaren Regeln, starkem Feedback und einer eigenen Welt.' },
          { label: 'READING', title: 'Lesen', body: 'Technik, Fiktion, Design und lange Texte, die langsam gekaut werden wollen.' }
        ]
      }
    },
    chat: {
      title: 'qiu boot',
      path: '/retro-dialog',
      notices: ['GAST: QIU', 'MODUS: 8-BIT-DIALOG', 'ANZEIGE: TTY0'],
      initialMessages: [
        { source: 'QIU', text: 'QIU> wach.\nWillkommen, Reisender.' },
        { source: 'SYS', text: 'MODUS> monochromes Taschen-Terminal.' },
        { source: 'LOG', text: 'LINK> qiu-modul sitzt. Speicherlampe ruhig.' }
      ],
      bootAria: 'Startsequenz der virtuellen qiu-Maschine',
      bootLines: [
        { label: 'POST-Speicherprüfung', value: '2048 MB OK' },
        { label: '/dev/qiu-core einhängen', value: 'BEREIT' },
        { label: 'Persönlichkeitsmatrix laden', value: 'OK' },
        { label: 'Dialoggerät verbinden', value: 'OK' },
        { label: 'Empathie-Bus kalibrieren', value: 'OK' },
        { label: 'agent-shell.service starten', value: 'ONLINE' },
        { label: 'Übergabe an qiu@tty0', value: 'BEREIT' }
      ],
      thinkingLabel: 'QIU DENKT',
      thinkingSteps: ['Signal lesen', 'kleine Zahnräder drehen', 'Kartenkacheln prüfen'],
      prompt: 'mit qiu sprechen',
      sendingPrompt: 'qiu liest das Modul...',
      linkFailed: 'SYS> qiu-verbindung fehlgeschlagen. Backend-Logs und MiniMax-Key prüfen.',
      collapse: 'Einklappen',
      collapseAria: 'Dialogfeld einklappen'
    },
    footer: '© 2002 -- 2026: ein Geschenk für mein 24. Jahr'
  }
}
