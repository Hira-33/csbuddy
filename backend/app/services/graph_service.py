import networkx as nx

from app.services.repository import TermRepository


class GraphService:
    def __init__(self, repository: TermRepository) -> None:
        self._repo = repository

    def build(self, root_id: str | None = None, depth: int = 1) -> dict:
        terms = self._repo.all()
        by_id = {t.id: t for t in terms}

        graph = nx.Graph()
        for term in terms:
            graph.add_node(
                term.id,
                label=term.term,
                difficulty=term.difficulty.value,
                tags=term.tags,
            )
        for term in terms:
            for related_id in term.related_terms:
                if related_id in by_id:
                    graph.add_edge(term.id, related_id)

        if root_id and root_id in by_id:
            nodes = {root_id}
            frontier = {root_id}
            for _ in range(depth):
                next_frontier = set()
                for node in frontier:
                    next_frontier.update(graph.neighbors(node))
                nodes.update(next_frontier)
                frontier = next_frontier
            graph = graph.subgraph(nodes).copy()

        data = nx.node_link_data(graph, edges="links")
        return {"nodes": data["nodes"], "links": data["links"]}
