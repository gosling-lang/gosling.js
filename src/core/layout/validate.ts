export interface SpecValidity {
    message: string;
    valid: boolean;
}

export class SpecValidityModel {
    private validity: SpecValidity;
    constructor(valid?: boolean) {
        this.validity = {
            message: 'No messge',
            valid: valid ? valid : false
        };
    }
    public getValidity() {
        return this.validity;
    }
    public valid() {
        return this.validity.valid;
    }
    public addErrorMessage(msg: string) {
        this.validity.message = msg;
        return this;
    }
    public setValid(isValid: boolean) {
        this.validity.valid = isValid;
        return this;
    }
    public setValidity(validity: SpecValidity) {
        this.setValid(validity.valid);
        this.addErrorMessage(validity.message);
        return this;
    }
    public printValidity() {
        if (!this.getValidity().valid) {
            console.warn(this.validity.message);
        } else {
            console.warn(this.validity.message);
        }
    }
}
