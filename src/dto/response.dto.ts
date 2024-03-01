export class SuccessDTO {
    msg: string;
    data?: any;
    code: number;
    constructor(message: string, data?: any) {
        (this.msg = message), (this.data = data);
        this.code = 200;
    }
}