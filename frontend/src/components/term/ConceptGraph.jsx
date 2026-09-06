import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

const difficultyColor = {
  beginner: '#22c55e',
  intermediate: '#3b82f6',
  advanced: '#a855f7',
}

export function ConceptGraph({ data, rootId, onSelectTerm }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => {
    if (!data?.nodes?.length || !svgRef.current || !containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = Math.max(300, container.clientHeight)

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    // Subtle grid background
    const gridSize = 24
    const defs = svg.append('defs')
    const pattern = defs
      .append('pattern')
      .attr('id', 'grid')
      .attr('width', gridSize)
      .attr('height', gridSize)
      .attr('patternUnits', 'userSpaceOnUse')
    pattern
      .append('circle')
      .attr('cx', gridSize / 2)
      .attr('cy', gridSize / 2)
      .attr('r', 1)
      .attr('fill', '#cbd5e1')
      .attr('opacity', 0.4)
    svg.append('rect').attr('width', width).attr('height', height).attr('fill', 'url(#grid)')

    const nodes = data.nodes.map((n) => ({ ...n }))
    const links = data.links.map((l) => ({ ...l }))

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d) => d.id).distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(32))

    const g = svg.append('g')

    svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([0.2, 4])
        .on('zoom', (event) => g.attr('transform', event.transform))
    )

    const link = g
      .append('g')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.5)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5)

    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )
      .on('click', (_event, d) => onSelectTerm?.(d.id))

    node
      .append('circle')
      .attr('r', (d) => (d.id === rootId ? 12 : 8))
      .attr('fill', (d) => difficultyColor[d.difficulty] || '#64748b')
      .attr('stroke', '#fff')
      .attr('stroke-width', (d) => (d.id === rootId ? 3 : 2))
      .attr('class', 'transition-all duration-200')
      .on('mouseover', function () {
        d3.select(this).attr('r', +d3.select(this).attr('r') + 2)
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', +d3.select(this).attr('r') - 2)
      })

    node
      .append('text')
      .attr('dx', 14)
      .attr('dy', 4)
      .text((d) => d.label)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#334155')
      .attr('pointer-events', 'none')

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      node.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
      svg.selectAll('*').remove()
    }
  }, [data, rootId, onSelectTerm])

  return (
    <div ref={containerRef} className="h-full w-full min-h-[300px]">
      <svg ref={svgRef} className="block h-full w-full" />
    </div>
  )
}
