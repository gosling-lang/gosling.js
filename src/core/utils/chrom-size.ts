// Size of each chromosome
export const CHROMOSOME_SIZE_HG19: { [k: string]: number } = {
    chr1: 249250621,
    chr2: 243199373,
    chr3: 198022430,
    chr4: 191154276,
    chr5: 180915260,
    chr6: 171115067,
    chr7: 159138663,
    chr8: 146364022,
    chr9: 141213431,
    chr10: 135534747,
    chr11: 135006516,
    chr12: 133851895,
    chr13: 115169878,
    chr14: 107349540,
    chr15: 102531392,
    chr16: 90354753,
    chr17: 81195210,
    chr18: 78077248,
    chr19: 59128983,
    chr20: 63025520,
    chr21: 48129895,
    chr22: 51304566,
    chrX: 155270560,
    chrY: 59373566,
    chrM: 16571
};

// Cumulative interval of each chromosome
export const CHROMOSOME_INTERVAL_HG19: { [k: string]: [number, number] } = {};

Object.keys(CHROMOSOME_SIZE_HG19).reduce((sum, k) => {
    CHROMOSOME_INTERVAL_HG19[k] = [sum, sum + CHROMOSOME_SIZE_HG19[k]];
    return sum + CHROMOSOME_SIZE_HG19[k];
}, 0);

// Total size of chromosome
export const TOTAL_CHROMOSOME_SIZE_HG19: number = Object.values(CHROMOSOME_SIZE_HG19).reduce(
    (sum, current) => sum + current,
    0
);

export const CHROMOSOME_SIZE_HG38: { [k: string]: number } = {
    chr1: 248956422,
    chr2: 242193529,
    chr3: 198295559,
    chr4: 190214555,
    chr5: 181538259,
    chr6: 170805979,
    chr7: 159345973,
    chr8: 145138636,
    chr9: 138394717,
    chr10: 133797422,
    chr11: 135086622,
    chr12: 133275309,
    chr13: 114364328,
    chr14: 107043718,
    chr15: 101991189,
    chr16: 90338345,
    chr17: 83257441,
    chr18: 80373285,
    chr19: 58617616,
    chr20: 64444167,
    chr21: 46709983,
    chr22: 50818468,
    chrX: 156040895,
    chrY: 57227415
};

export const CHROMOSOME_INTERVAL_HG38: { [k: string]: [number, number] } = {};

Object.keys(CHROMOSOME_SIZE_HG38).reduce((sum, k) => {
    CHROMOSOME_INTERVAL_HG38[k] = [sum, sum + CHROMOSOME_SIZE_HG38[k]];
    return sum + CHROMOSOME_SIZE_HG38[k];
}, 0);

// Total size of chromosome
export const TOTAL_CHROMOSOME_SIZE_HG38: number = Object.values(CHROMOSOME_SIZE_HG38).reduce(
    (sum, current) => sum + current,
    0
);
