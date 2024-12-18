function triangulate(portalgon) {
    /**
     * Given a polygon, returns the list of chords (pairs of points) that need
     * to be added in order to get a triangulation of the original polygon
     */
    let newPortalgon= new Portalgon([], []);
    let portalMap = new Map();
    let newPortals = [];

    for (let i = 0; i < portalgon.portals.length; i++) {
        let current = portalgon.portals[i].copy();

        pushPortalEndToMap(portalMap, current.portalEnd1);
        pushPortalEndToMap(portalMap, current.portalEnd2);
        newPortalgon.portals.push(current);
    }

    for (let f = 0; f < portalgon.fragments.length; f++) {
        let fragment = portalgon.fragments[f].copy();

        // loop until we are left with only a triangle
        while (fragment.vertices.length > 3) {
            // find an ear by testing every vertex that has not yet been removed
            for (let j = 0; j < fragment.vertices.length; j++) {
                let previous = j - 1 < 0 ? fragment.vertices.length - 1 : j - 1;
                let next = (j + 1) % fragment.vertices.length;
                // convex vertex
                if (isLT(fragment.vertices[previous], fragment.vertices[j], fragment.vertices[next])) {
                    let ear = true;
                    // to be an ear, we need every other point that was not removed
                    // to not be in the triangle previous - j - next
                    for (let k = 0; k < fragment.vertices.length; k++) {
                        if (k === previous || k === j || k === next) continue;
                        if (isInTriangle(fragment.vertices[previous], fragment.vertices[j], fragment.vertices[next], fragment.vertices[k])) {
                            ear = false;break;}
                    }
                    if (ear === true) {
                        removeEar(newPortalgon, portalMap, fragment, f, previous, j, next, newPortals);
                        break;
                    }
                }
            }
        }

        fragment = new Fragment(fragment.vertices.map(p => p.add(fragment.origin)));
        newPortalgon.fragments.push(fragment);

        if (portalMap.has(f)) {
            for (let p = 0; p < portalMap.get(f).length; p++) {
                let currentPortalEnd = portalMap.get(f)[p];
                currentPortalEnd.fragmentIdx = newPortalgon.fragments.length - 1;

                for (let i = 0; i < newPortals.length; i++) {
                    if (newPortals[i].portalEnd2 === currentPortalEnd) {
                        let twinFragment = newPortalgon.fragments[newPortals[i].portalEnd1.fragmentIdx];
                        for (let x = 0; x < fragment.vertices.length; x++) {
                            if (newPortals[i].portalEnd1.vertex2.add(twinFragment.origin).equals(fragment.vertices[x].add(fragment.origin))) {
                                // x is the destination dot
                                currentPortalEnd.edge[0] = x;
                                currentPortalEnd.edge[1] = (x + 1) % 3;
                                currentPortalEnd.mainVertexIdx = x;
                                currentPortalEnd.reverse();
                                currentPortalEnd.isReversed = true;
                                break;
                            }
                        }
                        break;
                    }
                }

                currentPortalEnd.vertex1 = fragment.vertices[currentPortalEnd.edge[0]];
                currentPortalEnd.vertex2 = fragment.vertices[currentPortalEnd.edge[1]];
            }
        }
    }

    return newPortalgon;
}

function removeEar(newPortalgon, portals, fragment, fragmentIdx, previous, current, next, newPortals) {
    let newFragment = new Fragment([
        fragment.vertices[previous].copy(),
        fragment.vertices[current].copy(),
        fragment.vertices[next].copy()
    ].map(x => x.add(fragment.origin)));

    let newFragmentIdx = newPortalgon.fragments.length;

    let newPortal = new Portal();

    let portalEnd1 = new PortalEnd(
        newFragment.vertices[2], newFragment.vertices[0],
        newFragmentIdx, 2, 0
    );
    let portalEnd2 = new PortalEnd(
        fragment.vertices[previous], fragment.vertices[next],
        fragmentIdx, previous, next
    );

    portalEnd2.reverse();

    newPortal.setFirstEnd(portalEnd1); // portal put on triangle ear (on first and last vertex)
    newPortal.setSecondEnd(portalEnd2); // portal put on remaining uncut piece

    newPortalgon.fragments.push(newFragment);
    newPortalgon.portals.push(newPortal);

    updatePortals(portals, newFragment, fragment, newFragmentIdx, fragmentIdx, previous, current, next);
    pushPortalEndToMap(portals, portalEnd2);
    portalEnd2.fragmentIdx += 1;
    if (portalEnd2.mainVertexIdx > current) {
        portalEnd2.mainVertexIdx -= 1;
        if (portalEnd2.edge[0] > 0)
            portalEnd2.edge[0] -= 1;

        if (portalEnd2.edge[1] > 0)
            portalEnd2.edge[1] -= 1;
    }

    newPortals.push(newPortal);

    fragment.vertices = removeIthElementOfArray(fragment.vertices, current);
}

function pushPortalEndToMap(portalMap, portalEnd) {
    if (!portalMap.has(portalEnd.fragmentIdx))
        portalMap.set(portalEnd.fragmentIdx, []);

    portalMap.get(portalEnd.fragmentIdx).push(portalEnd);
}

function updatePortals(portals, newFragment, fragment, newFragmentIdx, fragmentIdx, previous, current, next) {
    if (portals.has(fragmentIdx)) {
        for (let p = portals.get(fragmentIdx).length - 1; p >= 0; p--) {
            let currentPortalEnd = portals.get(fragmentIdx)[p];

            if (currentPortalEnd.mainVertexIdx === previous || currentPortalEnd.mainVertexIdx === current) {
                currentPortalEnd.mainVertexIdx = previous === currentPortalEnd.mainVertexIdx ? 0 : 1;
                currentPortalEnd.vertex1 = newFragment.vertices[currentPortalEnd.mainVertexIdx];
                currentPortalEnd.vertex2 = newFragment.vertices[currentPortalEnd.mainVertexIdx + 1];
                currentPortalEnd.fragmentIdx = newFragmentIdx;
                currentPortalEnd.edge = [currentPortalEnd.mainVertexIdx, currentPortalEnd.mainVertexIdx + 1];

                if (currentPortalEnd.isReversed) {
                    currentPortalEnd.reverse();
                    currentPortalEnd.isReversed = true;
                }

                portals.set(fragmentIdx, removeIthElementOfArray(portals.get(fragmentIdx), p));
            } else {
                currentPortalEnd.fragmentIdx += 1;
                if (currentPortalEnd.mainVertexIdx > current) {
                    currentPortalEnd.mainVertexIdx -= 1;
                    if (currentPortalEnd.edge[0] > 0)
                        currentPortalEnd.edge[0] -= 1;

                    if (currentPortalEnd.edge[1] > 0)
                        currentPortalEnd.edge[1] -= 1;
                }
            }
        }
    }
}


function removeIthElementOfArray(arr, i) {
    /**
     * Returns an array with every elements except the one indexed i
     */
    let ret = [];
    for (let j = 0; j < arr.length; j++) {
        if (j !== i) ret.push(arr[j]);
    }
    return ret;
}
