export interface SpecValidity {
    msg: string
    isValid: boolean
}

export class SpecValidityModel {
    private validity: SpecValidity
    constructor(valid?: boolean) {
        this.validity = {
            msg: "No message",
            isValid: valid ? valid : false
        }
    }
    public getValidity() {
        return this.validity;
    }
    public isValid() {
        return this.validity.isValid;
    }
    public setMsg(msg: string) {
        this.validity.msg = msg;
        return this;
    }
    public setIsValid(isValid: boolean) {
        this.validity.isValid = isValid;
        return this;
    }
    public setValidity(validity: SpecValidity) {
        this.setIsValid(validity.isValid);
        this.setMsg(validity.msg);
        return this;
    }
    public printValidity() {
        if (!this.getValidity().isValid) {
            console.warn(this.validity.msg);
        } else {
            console.log(this.validity.msg);
        }
    }
}