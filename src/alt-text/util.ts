export function attributeExists(object: any, attribute: any) {
    return(attribute in object);
};

export function attributeExistsReturn(object: any, attribute: any) {
    return(object[attribute]);
};

export function attributeExistsDefaultString(field: any, defaultValue: string) {
    if(field !== 'unknown')
        return field as string;
    else {
        return defaultValue;
    }
}

export function attributeHasChildValue(object: any, attribute: any, attributeChild: any, value: any) {
    return(object[attribute][attributeChild] === value);
};

export function attributeExistsAndChildHasValue(object: any, attribute: any, attributeChild: any, value: any) {
    return(attributeExists(object, attribute) && attributeHasChildValue(object, attribute, attributeChild, value));
};

export function arrayToString(arr: string[] | number[]) {
    if (arr.length === 1) {
        return arr;
    } else {
        return arr.slice(0, -1).join(', ') + ' and ' + arr.slice(-1);
    } 
}

export const markToText = new Map([['point', 'points'], ['line', 'lines'], ['bar', 'bars'], ['rect', 'rectangles'], ['area', 'area displayed'], ['withinLink', 'connections'], ['betweenLink', 'connections'], ['triangleLeft', 'triangles'], ['triangleRight', 'triangles'], ['triangleBottom', 'triangles']]);
export const channelToText = new Map([['y', 'height'], ['color', 'color'], ['strokeWidth', 'stroke width'], ['opacity', 'opacity'], ['text', 'text']]);
