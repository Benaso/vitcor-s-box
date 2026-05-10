import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: 'postgres://postgres:Ydy2002926!@localhost:5432/agent_db'
})

async function init() {
  console.log('开始初始化数据库...')

  // 创建节点表
  await pool.query(`
    CREATE TABLE IF NOT EXISTS nodes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL, -- person, skill, project, interest, location
      description TEXT,
      properties JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  console.log('✓ nodes 表创建完成')

  // 创建关系表
  await pool.query(`
    CREATE TABLE IF NOT EXISTS relations (
      id SERIAL PRIMARY KEY,
      source_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
      target_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
      relation_type VARCHAR(100) NOT NULL, -- knows, works_at, has_skill, participated, likes, located_at, taught
      properties JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  console.log('✓ relations 表创建完成')

  // 清理旧数据
  await pool.query('DELETE FROM relations')
  await pool.query('DELETE FROM nodes')
  console.log('✓ 旧数据已清理')

  // 插入节点
  const nodes = [
    // 人物
    { name: 'Benaso', type: 'person', description: '我，一个热爱技术的开发者' },
    { name: '老王', type: 'person', description: '我的导师，技术大牛' },
    { name: '小李', type: 'person', description: '大学同学，好朋友' },
    { name: '阿杰', type: 'person', description: '同事，一起做项目' },

    // 技能
    { name: 'React', type: 'skill', description: '前端框架' },
    { name: 'Vite', type: 'skill', description: '构建工具' },
    { name: 'PostgreSQL', type: 'skill', description: '数据库' },
    { name: 'Node.js', type: 'skill', description: '后端运行时' },
    { name: 'TypeScript', type: 'skill', description: '类型安全JS' },
    { name: 'AI', type: 'skill', description: '人工智能' },
    { name: 'Python', type: 'skill', description: '数据科学' },

    // 项目
    { name: '个人网站', type: 'project', description: '这个像素风网站' },
    { name: '数据分析平台', type: 'project', description: '公司内部数据可视化项目' },
    { name: 'AI助手', type: 'project', description: '基于大语言模型的助手' },

    // 兴趣
    { name: '编程', type: 'interest', description: '写代码是最大的爱好' },
    { name: '骑行', type: 'interest', description: '周末喜欢骑车兜风' },
    { name: '游戏', type: 'interest', description: '偶尔玩玩独立游戏' },
    { name: '读书', type: 'interest', description: '技术书籍为主' },

    // 地点
    { name: '深圳', type: 'location', description: '目前工作生活的城市' },
    { name: '广州', type: 'location', description: '大学所在城市' },
  ]

  const nodeIdMap: Record<string, number> = {}

  for (const node of nodes) {
    const result = await pool.query('INSERT INTO nodes(name, type, description) VALUES ($1, $2, $3) RETURNING id', [node.name, node.type, node.description])
    nodeIdMap[node.name] = result.rows[0].id
  }
  console.log(`✓ ${nodes.length} 个节点已插入`)

  // 插入关系
  const relations = [
    // Benaso 的技能
    { source: 'Benaso', target: 'React', type: 'has_skill' },
    { source: 'Benaso', target: 'Vite', type: 'has_skill' },
    { source: 'Benaso', target: 'PostgreSQL', type: 'has_skill' },
    { source: 'Benaso', target: 'Node.js', type: 'has_skill' },
    { source: 'Benaso', target: 'TypeScript', type: 'has_skill' },
    { source: 'Benaso', target: 'AI', type: 'has_skill' },

    // Benaso 的项目
    { source: 'Benaso', target: '个人网站', type: 'created' },
    { source: 'Benaso', target: 'AI助手', type: 'created' },
    { source: 'Benaso', target: '数据分析平台', type: 'participated' },

    // Benaso 的兴趣
    { source: 'Benaso', target: '编程', type: 'likes' },
    { source: 'Benaso', target: '骑行', type: 'likes' },
    { source: 'Benaso', target: '游戏', type: 'likes' },

    // Benaso 的地点
    { source: 'Benaso', target: '深圳', type: 'located_at' },

    // 人物关系
    { source: '老王', target: 'Benaso', type: 'taught' },
    { source: 'Benaso', target: '老王', type: 'knows' },
    { source: 'Benaso', target: '小李', type: 'knows' },
    { source: '小李', target: 'Benaso', type: 'knows' },
    { source: 'Benaso', target: '阿杰', type: 'knows' },
    { source: '阿杰', target: 'Benaso', type: 'knows' },
    { source: '阿杰', target: '数据分析平台', type: 'participated' },

    // 技能关系
    { source: 'React', target: 'Vite', type: 'works_with' },
    { source: 'Node.js', target: 'PostgreSQL', type: 'works_with' },
    { source: 'AI', target: 'Python', type: 'related_to' },

    // 地点关系
    { source: '小李', target: '广州', type: 'located_at' },
  ]

  for (const rel of relations) {
    await pool.query(
      'INSERT INTO relations(source_id, target_id, relation_type) VALUES ($1, $2, $3)',
      [nodeIdMap[rel.source], nodeIdMap[rel.target], rel.type]
    )
  }
  console.log(`✓ ${relations.length} 条关系已插入`)

  console.log('\n✅ 数据库初始化完成！')
  console.log(`节点总数: ${nodes.length}`)
  console.log(`关系总数: ${relations.length}`)

  await pool.end()
}

init().catch(err => {
  console.error('初始化失败:', err)
  pool.end()
})