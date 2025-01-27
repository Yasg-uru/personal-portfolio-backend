"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorhandlerMiddleware = void 0;
class Errorhandler extends Error {
    // message: string;
    constructor(statuscode, message) {
        super();
        this.statuscode = statuscode;
        this.message = message;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
const ErrorhandlerMiddleware = (err, req, res, next) => {
    if (err instanceof Errorhandler) {
        return res.status(err.statuscode).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
};
exports.ErrorhandlerMiddleware = ErrorhandlerMiddleware;
exports.default = Errorhandler;
