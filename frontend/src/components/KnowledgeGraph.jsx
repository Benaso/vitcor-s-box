import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchGraphData } from '../api/client'

const nodeColors = {
  person: '#2a2a2a',
  skill: '#4a4a4a',
  project: '#3a3a3a',
  interest: '#5a5a5a',
  location: '#6a6a6a'
}

const relationLabels = {
  knows: '认识',
  has_skill: '掌握',
  likes: '喜欢',
  created: '创建',
  participated: '参与',
  located_at: '位于',
  taught: '指导',
  works_with: '协作',
  related_to: '相关'
}

export default function KnowledgeGraph() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [graphData, setGraphData] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })

  const nodesRef = useRef([])
  const edgesRef = useRef([])
  const animationRef = useRef()

  const isDragging = useRef(false)
  const isPanning = useRef(false)
  const draggedNode = useRef(null)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    async function loadGraph() {
      try {
        const data = await fetchGraphData()
        setGraphData(data)

        const centerX = 0
        const centerY = 0
        const radius = 200

        nodesRef.current = data.nodes.map((node, i) => {
          const angle = (i / data.nodes.length) * Math.PI * 2
          return {
            ...node,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            vx: 0,
            vy: 0
          }
        })

        edgesRef.current = data.relations.map(rel => ({
          ...rel,
          source: nodesRef.current.find(n => n.id === rel.source_id),
          target: nodesRef.current.find(n => n.id === rel.target_id)
        }))
      } catch (err) {
        console.error('Failed to load graph:', err)
      }
    }
    loadGraph()
  }, [])

  useEffect(() => {
    if (!graphData) return

    function simulate() {
      const repulsionForce = 2000
      const attractionForce = 0.005
      const idealEdgeLength = 150
      const damping = 0.9

      nodesRef.current.forEach(node => {
        node.vx = 0
        node.vy = 0

        nodesRef.current.forEach(other => {
          if (other.id === node.id) return
          const dx = node.x - other.x
          const dy = node.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = repulsionForce / (dist * dist)
          node.vx += (dx / dist) * force
          node.vy += (dy / dist) * force
        })

        edgesRef.current.forEach(edge => {
          if (edge.source?.id === node.id || edge.target?.id === node.id) {
            const other = edge.source?.id === node.id ? edge.target : edge.source
            if (!other) return
            const dx = other.x - node.x
            const dy = other.y - node.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const force = (dist - idealEdgeLength) * attractionForce
            node.vx += (dx / dist) * force
            node.vy += (dy / dist) * force
          }
        })

        node.x += node.vx * damping
        node.y += node.vy * damping
      })

      animationRef.current = requestAnimationFrame(simulate)
    }

    simulate()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [graphData])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let width = canvas.width
    let height = canvas.height

    function draw() {
      ctx.clearRect(0, 0, width, height)

      const { x: tx, y: ty, scale } = transform

      ctx.save()
      ctx.translate(width / 2 + tx, height / 2 + ty)
      ctx.scale(scale, scale)

      // Draw edges
      edgesRef.current.forEach(edge => {
        if (!edge.source || !edge.target) return
        const isHovered = hoveredEdge === edge.id

        ctx.beginPath()
        ctx.moveTo(edge.source.x, edge.source.y)
        ctx.lineTo(edge.target.x, edge.target.y)

        if (isHovered) {
          ctx.strokeStyle = '#2a2a2a'
          ctx.lineWidth = 3 / scale
        } else {
          ctx.strokeStyle = 'rgba(42, 42, 42, 0.25)'
          ctx.lineWidth = 1 / scale
        }
        ctx.stroke()

        // Draw relation label on hover
        if (isHovered) {
          const midX = (edge.source.x + edge.target.x) / 2
          const midY = (edge.source.y + edge.target.y) / 2
          const label = relationLabels[edge.relation_type] || edge.relation_type
          const labelText = `${edge.source_name} → ${label} → ${edge.target_name}`

          ctx.font = `bold ${10 / scale}px monospace`
          const textWidth = ctx.measureText(labelText).width
          const padding = 6 / scale
          const boxWidth = textWidth + padding * 2
          const boxHeight = 18 / scale

          // Pixel-style box with shadow
          ctx.fillStyle = '#888'
          ctx.fillRect(midX - boxWidth / 2 + 3 / scale, midY - boxHeight / 2 + 3 / scale, boxWidth, boxHeight)
          ctx.fillStyle = '#f5f2eb'
          ctx.fillRect(midX - boxWidth / 2, midY - boxHeight / 2, boxWidth, boxHeight)
          ctx.strokeStyle = '#2a2a2a'
          ctx.lineWidth = 2 / scale
          ctx.strokeRect(midX - boxWidth / 2, midY - boxHeight / 2, boxWidth, boxHeight)

          ctx.fillStyle = '#2a2a2a'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(labelText, midX, midY)
        }
      })

      // Draw nodes
      nodesRef.current.forEach(node => {
        const isHovered = hoveredNode === node.id
        const isSelected = selectedNode === node.id
        const baseSize = 14
        const size = isHovered || isSelected ? baseSize * 1.3 : baseSize

        // Shadow
        ctx.fillStyle = '#888'
        ctx.fillRect(node.x - size / 2 + 4, node.y - size / 2 + 4, size, size)

        // Node
        ctx.fillStyle = nodeColors[node.type] || '#666'
        ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size)

        // Label
        ctx.fillStyle = '#2a2a2a'
        ctx.font = `${12 / scale}px monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(node.name, node.x, node.y + size / 2 + 8 / scale)
      })

      ctx.restore()
      requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      if (containerRef.current) {
        width = containerRef.current.clientWidth
        height = containerRef.current.clientHeight
        canvas.width = width
        canvas.height = height
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [transform, hoveredNode, hoveredEdge, selectedNode])

  const getCanvasPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const { x: tx, y: ty, scale } = transform
    return {
      x: (e.clientX - rect.left - rect.width / 2 - tx) / scale,
      y: (e.clientY - rect.top - rect.height / 2 - ty) / scale
    }
  }, [transform])

  const findNodeAtPos = useCallback((x, y) => {
    return nodesRef.current.find(node => {
      const dx = node.x - x
      const dy = node.y - y
      return Math.sqrt(dx * dx + dy * dy) < 20
    })
  }, [])

  const findEdgeAtPos = useCallback((x, y) => {
    const threshold = 15
    for (const edge of edgesRef.current) {
      if (!edge.source || !edge.target) continue

      const { x: x1, y: y1 } = edge.source
      const { x: x2, y: y2 } = edge.target

      const dx = x2 - x1
      const dy = y2 - y1
      const len = Math.sqrt(dx * dx + dy * dy) || 1

      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (len * len)))
      const projX = x1 + t * dx
      const projY = y1 + t * dy

      const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2)
      if (dist < threshold) return edge
    }
    return null
  }, [])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setTransform(prev => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * delta, 0.1), 3)
    }))
  }, [])

  const handleMouseDown = useCallback((e) => {
    const pos = getCanvasPos(e)
    const clicked = findNodeAtPos(pos.x, pos.y)

    if (clicked) {
      isDragging.current = true
      draggedNode.current = clicked
      setSelectedNode(clicked.id)
    } else {
      isPanning.current = true
      setSelectedNode(null)
    }
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [getCanvasPos, findNodeAtPos])

  const handleMouseMove = useCallback((e) => {
    const pos = getCanvasPos(e)

    if (isDragging.current && draggedNode.current) {
      draggedNode.current.x = pos.x
      draggedNode.current.y = pos.y
      return
    }

    if (isPanning.current) {
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      setTransform(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }))
      lastPos.current = { x: e.clientX, y: e.clientY }
      return
    }

    const hoveredNodeResult = findNodeAtPos(pos.x, pos.y)
    const hoveredEdgeResult = findEdgeAtPos(pos.x, pos.y)

    setHoveredNode(hoveredNodeResult?.id || null)
    setHoveredEdge(hoveredEdgeResult?.id || null)
  }, [getCanvasPos, findNodeAtPos, findEdgeAtPos])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    isPanning.current = false
    draggedNode.current = null
  }, [])

  const handleMouseLeave = useCallback(() => {
    isPanning.current = false
    setHoveredNode(null)
    setHoveredEdge(null)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#f5f2eb',
        cursor: isPanning.current ? 'grabbing' : 'default'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      {selectedNode && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          padding: '12px 16px',
          border: '4px solid #2a2a2a',
          boxShadow: '6px 6px 0 #888',
          background: '#f5f2eb',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 1000
        }}>
          <strong style={{ color: '#2a2a2a' }}>// </strong> {nodesRef.current.find(n => n.id === selectedNode)?.name}
        </div>
      )}
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        padding: '8px 12px',
        border: '2px solid #2a2a2a',
        boxShadow: '4px 4px 0 #888',
        background: '#f5f2eb',
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#666'
      }}>
        滚轮缩放 | 拖拽平移 | 浮悬边查看关系
      </div>
    </div>
  )
}