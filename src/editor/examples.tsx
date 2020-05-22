import hgSingleView from "../lib/test/higlass/hg-single-view.json";
import hlSingleView from "../lib/test/higlass-lite/hl-single-view.json";
import hgTwoIndependentViews from "../lib/test/higlass/hg-two-independent-views.json";
import hlTwoIndependentViews from "../lib/test/higlass-lite/hl-two-independent-views.json";

export const demos = [
    {
        name: "Single Matrix",
        hg: hgSingleView,
        hl: hlSingleView
    },
    {
        name: "Two Independent Views",
        hg: hgTwoIndependentViews,
        hl: hlTwoIndependentViews,
    }
];