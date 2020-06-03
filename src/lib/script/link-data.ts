export function generateLinkData() {
    // four columns: from, to
    // domain: 0~100
    const data: { from: number, to: number }[] = [];
    const tos = [];
    for (let i = 0; i < 100; i++) {
        tos.push(i);
    }
    for (let i = 0; i < 100; i++) {
        const from = i;
        const toIndex = Math.floor(Math.random() * tos.length);
        const to = tos[toIndex];
        tos.splice(toIndex, 1);
        data.push({ from, to });
    }
    console.log(data);
    return data;
}

export function generateBandData() {
    // four columns: from, from1, to, to1
    // domain: 0~100
    const data: { from: number, from1: number, to: number, to1: number }[] = [];
    const tos = [];
    for (let i = 0; i < 10; i++) {
        tos.push(i);
    }
    for (let i = 0; i < 10; i++) {
        const from = i;
        const toIndex = Math.floor(Math.random() * tos.length);
        const to = tos[toIndex];
        tos.splice(toIndex, 1);
        data.push({
            from: from * 10,
            from1: from * 10 + 9,
            to: to * 10,
            to1: to * 10 + 9
        });
    }
    console.log(data);
    return data;
}