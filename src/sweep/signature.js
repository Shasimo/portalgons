class Signature {
    constructor(originFragmentIdx, sourcePoint, path) {
        /*
        * originFragmentIdx: the idx of the first fragment of the path
        * path: a list of Portals and ints:
        *          if int: the index of the vertex that the path goes through in the last fragment up to that point
        *          if Portal: the next portal that the path takes
        * sourcePoint: the point the path starts from (relative to the origin of the first fragment
        */
        this.originFragmentIdx = originFragmentIdx;
        this.source = sourcePoint;

        this.path = [];

        let lastFragmentIdx = this.originFragmentIdx;
        for (let i = 0; i < path.length; i++) {
            if (path[i] instanceof Portal) {
                let currentPortal = path[i].copy();
                if (currentPortal.portalEnd2.fragmentIdx === lastFragmentIdx)
                    currentPortal.swapEnds();
                else if (currentPortal.portalEnd1.fragmentIdx !== lastFragmentIdx) {
                    throw new Error("Invalid path");
                }
                this.path.push(currentPortal);
                lastFragmentIdx = currentPortal.portalEnd2.fragmentIdx;
            } else
                this.path.push(path[i]);
        }
    }

    toDistanceFunction(portalgon, edge, distV) {
        /**
         * Computes f_{\sigma|e}
         */
        let newSig = this.copy(edge.copy());

        let ret = generateEmbeddingFromSignature(
            portalgon,
            newSig,
            null,
            null
        );

        let verticesEmbed = ret[1];
        let embedded = ret[0];

        for (let i = 0; i < verticesEmbed.length - 1; i++) {
            if (!embedded.canSourceSeeDestination(verticesEmbed[i], verticesEmbed[i+1])) return null;
        }

        let lastEdge = embedded.portals[embedded.portals.length - 1];
        let v = ret[1][ret[1].length - 1];
        let visibilityInterval = embedded.computeVisibilityInterval(v, lastEdge);

        let edgeFragment = embedded.fragments[lastEdge.portalEnd1.fragmentIdx];

        return new DistanceFunction(
            this,
            visibilityInterval,
            v,
            [
                edgeFragment.vertices[lastEdge.portalEnd1.edge[0]].add(edgeFragment.origin),
                edgeFragment.vertices[lastEdge.portalEnd1.edge[1]].add(edgeFragment.origin)
            ],
            distV
        );
    }

    getLastPortalIdxInPath() {
        for (let i = this.path.length - 1; i >= 0; i--)
            if (this.path[i] instanceof Portal)
                return i;
        return -1;
    }

    getLastVertexIdxInPath() {
        for (let i = this.path.length - 1; i >= 0; i--)
            if (!(this.path[i] instanceof Portal))
                return i;
        return -1;
    }

    copy(newEdge) {
        let path = [];
        for (let i = 0; i < this.path.length; i++) {
            if (this.path[i] instanceof Portal)
                path.push(this.path[i].copy());
            else
                path.push(this.path[i]);
        }
        if (newEdge !== null)
            path.push(newEdge);
        return new Signature(this.originFragmentIdx, this.source.copy(), path);
    }
}