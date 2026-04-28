/** Minimum drawable area beyond the viewport (px) so scrolling is possible without nodes. */
const MIN_WORKSPACE_W = 1800;
const MIN_WORKSPACE_H = 1100;

/** Margin around farthest nodes when resizing the canvas backing store. */
const NODE_PADDING = 80;

export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        /** Kept so window resize expands canvas bounds when nodes overflow. */
        this._lastGraph = null;

        this.#syncCanvasDimensions();
        requestAnimationFrame(() => this.#syncCanvasDimensions());
        window.addEventListener('resize', () => this.#syncCanvasDimensions());
    }

    draw(graph) {
        this._lastGraph = graph;
        this.#syncCanvasDimensions();

        const {ctx, canvas} = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = "12px serif";
        graph.edges.forEach(edge => {
            const fromNode = graph.getNode(edge.from);
            const toNode = graph.getNode(edge.to);

            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();

            const dist = Math.hypot(toNode.x - fromNode.x, toNode.y - fromNode.y);
            const label = dist.toFixed(0);
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;

            ctx.fillStyle = 'black';
            ctx.fillText(label, midX + 25, midY);
        })

        graph.nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
            ctx.fillStyle = "#3498db";
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = 'black';
            ctx.fillText(node.name, node.x, node.y);
            ctx.fillText(`${node.x}, ${node.y}`, node.x + 20,node.y - 20);
        });

        ctx.restore();
    }

    /**
     * Sets backing-store size and CSS size so bitmap coordinates match DOM hit-testing while scrolling.
     */
    #syncCanvasDimensions() {
        const graph = this._lastGraph;
        const parent = this.canvas.parentElement;
        let w = MIN_WORKSPACE_W;
        let h = MIN_WORKSPACE_H;

        if (parent) {
            w = Math.max(w, parent.clientWidth);
            h = Math.max(h, parent.clientHeight);
        }

        const halfNode = 30;
        const pad = NODE_PADDING;

        if (graph && graph.nodes.length > 0) {
            for (const node of graph.nodes) {
                w = Math.max(w, node.x + halfNode + pad);
                h = Math.max(h, node.y + halfNode + pad);
            }
        }

        w = Math.ceil(w);
        h = Math.ceil(h);

        if (this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }

        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;
    }
}
