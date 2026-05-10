import { Router } from 'express'
import { pool } from '../db/pool.js'

const router = Router()

// 获取图谱数据（节点和关系）
router.get('/', async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: 'Database not configured' })
  }

  try {
    // 获取所有节点
    const nodesResult = await pool.query('SELECT id, name, type, description FROM nodes')
    // 获取所有关系
    const relationsResult = await pool.query(`
      SELECT r.id, r.source_id, r.target_id, r.relation_type,
             s.name as source_name, t.name as target_name
      FROM relations r
      JOIN nodes s ON r.source_id = s.id
      JOIN nodes t ON r.target_id = t.id
    `)

    res.json({
      nodes: nodesResult.rows,
      relations: relationsResult.rows
    })
  } catch (err) {
    console.error('Graph query error:', err)
    res.status(500).json({ error: 'Failed to fetch graph data' })
  }
})

// 获取单个节点及其关联
router.get('/nodes/:id', async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: 'Database not configured' })
  }

  const { id } = req.params

  try {
    const nodeResult = await pool.query('SELECT id, name, type, description FROM nodes WHERE id = $1', [id])

    if (nodeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Node not found' })
    }

    // 获取关联节点
    const relatedResult = await pool.query(`
      SELECT r.id, r.relation_type,
             n.id as node_id, n.name, n.type, n.description
      FROM relations r
      JOIN nodes n ON (r.target_id = n.id AND r.source_id = $1) OR (r.source_id = n.id AND r.target_id = $1)
      WHERE r.source_id = $1 OR r.target_id = $1
    `, [id])

    res.json({
      node: nodeResult.rows[0],
      related: relatedResult.rows
    })
  } catch (err) {
    console.error('Node query error:', err)
    res.status(500).json({ error: 'Failed to fetch node data' })
  }
})

export default router