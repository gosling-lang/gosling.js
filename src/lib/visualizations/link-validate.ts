import { Track, GenericType, Channel, IsChannelDeep } from "../gemini.schema";
import { SpecValidityModel } from "./validate";

export function validateBetweenLinkSpec(track: Track | GenericType<Channel>) {
    const validity = new SpecValidityModel(true);

    const xField = IsChannelDeep(track.x) ? track.x.field : undefined;
    const x1Field = IsChannelDeep(track.x1) ? track.x1.field : undefined;
    const yField = IsChannelDeep(track.y) ? track.y.field : undefined;
    const y1Field = IsChannelDeep(track.y1) ? track.y1.field : undefined;

    const definedFields = [xField, x1Field, yField, y1Field].filter(d => d);

    if (definedFields.length < 2) {
        validity.setMsg('Less than two fields are specified for a `link-between` mark.');
        validity.setIsValid(false);
    }
    else if (definedFields.length > 2) {
        validity.setMsg('More than two fields are specified for a `link-between` mark.');
    }
    return validity;
}