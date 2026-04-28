export class Editor {
    constructor(graph, canvasId) {
        this.graph = graph;
        this.canvas = document.getElementById(canvasId);
        this.nodeRadius = 30;
        this.nodeCount = this.#nextIdSuffix();

        this.currentTool = 'add-node';
        this.dragging = null;
        this.dragOffset = { x: 0, y: 0 };
        this.pendingEdgeFrom = null;

        this.#registerToolbar();

        this.canvas.addEventListener('mousedown', (e) => this.#onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.#onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.#onMouseUp());
        window.addEventListener('mouseup', () => this.#onMouseUp());
    }

    #registerToolbar() {
        const tools = [
            { id: 'btn-add-node', tool: 'add-node' },
            { id: 'btn-move-node', tool: 'move-node' },
            { id: 'btn-add-edge', tool: 'add-edge' },
        ];

        for (const { id, tool } of tools) {
            document.getElementById(id)?.addEventListener('click', () => {
                this.currentTool = tool;
                this.dragging = null;
                this.pendingEdgeFrom = null;
                this.#syncToolbar(tool);
            });
        }

        this.#syncToolbar('add-node');
    }

    #syncToolbar(active) {
        const addBtn = document.getElementById('btn-add-node');
        const moveBtn = document.getElementById('btn-move-node');
        const edgeBtn = document.getElementById('btn-add-edge');
        if (addBtn) addBtn.classList.toggle('active', active === 'add-node');
        if (moveBtn) moveBtn.classList.toggle('active', active === 'move-node');
        if (edgeBtn) edgeBtn.classList.toggle('active', active === 'add-edge');
    }

    #onMouseDown(e) {
        const pos = this.#canvasPos(e);
        const node = this.#findNodeAt(pos.x, pos.y);

        switch (this.currentTool) {
            case 'add-node':
                if (!node) {
                    const name = `n${++this.nodeCount}`;
                    this.graph.addNode(name, pos.x, pos.y);
                }
                break;

            case 'move-node':
                if (node) {
                    this.dragging = node;
                    this.dragOffset = { x: pos.x - node.x, y: pos.y - node.y };
                }
                break;

            case 'add-edge':
                if (!node) {
                    this.pendingEdgeFrom = null;
                    break;
                }
                if (!this.pendingEdgeFrom) {
                    this.pendingEdgeFrom = node.name;
                } else if (this.pendingEdgeFrom === node.name) {
                    this.pendingEdgeFrom = null;
                } else {
                    this.graph.addEdge(this.pendingEdgeFrom, node.name);
                    this.pendingEdgeFrom = null;
                }
                break;

            default:
                break;
        }
    }

    #onMouseMove(e) {
        if (this.currentTool !== 'move-node' || !this.dragging) return;
        const pos = this.#canvasPos(e);
        this.graph.updateNode(
            this.dragging.name,
            pos.x - this.dragOffset.x,
            pos.y - this.dragOffset.y,
        );
    }

    #onMouseUp() {
        this.dragging = null;
    }

    #nextIdSuffix() {
        if (this.graph.nodes.length === 0) return 0;

        const values = this.graph.nodes
            .map((node) => {
                const matched = /^n(\d+)$/i.exec(String(node.name));
                return matched ? Number.parseInt(matched[1], 10) : NaN;
            })
            .filter((value) => Number.isFinite(value));

        if (values.length === 0) return this.graph.nodes.length;
        return Math.max(...values);
    }

    /** @returns {{ name: string, x: number, y: number } | undefined} */
    #findNodeAt(x, y) {
        const r2 = this.nodeRadius * this.nodeRadius;

        return this.graph.nodes.find((node) => {
            const dx = node.x - x;
            const dy = node.y - y;
            return dx * dx + dy * dy <= r2;
        });
    }

    #canvasPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
}
