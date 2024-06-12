// Default d3 zoom feels slow so we use this instead
// https://d3js.org/d3-zoom#zoom_wheelDelta
export function zoomWheelBehavior(event: WheelEvent) {
    const defaultMultiplier = 5;
    return (
        -event.deltaY *
        (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) *
        (event.ctrlKey ? 10 : defaultMultiplier)
    );
}
