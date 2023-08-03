export function attributeExists(object: any, attribute: any) {
    return(attribute in object);
};

export function attributeHasChildValue(object: any, attribute: any, attributeChild: any, value: any) {
    return(object[attribute][attributeChild] === value);
};

export function attributeExistsAndChildHasValue(object: any, attribute: any, attributeChild: any, value: any) {
    return(attributeExists(object, attribute) && attributeHasChildValue(object, attribute, attributeChild, value));
};