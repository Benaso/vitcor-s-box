const terminalLine = 'choose life, choose a job, choose a family...'

export const siteContent = {
  languages: [
    { code: 'zh', label: '中' },
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' }
  ],
  translations: {
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
      footer: '© 2002 - 2026: a gift for my 24'
    }
  }
}
