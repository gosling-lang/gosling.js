export function attributeExists(object: any, attribute: any) {
    return(attribute in object);
};

export function attributeExistsAndChildHasValue(object: any, attribute: any, attributeChild: any, value: any) {
    return(attribute in object && object[attribute][attributeChild] === value);
};