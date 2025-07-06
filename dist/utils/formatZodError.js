"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatZodError = void 0;
const formatZodError = (error) => {
    return error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
    }));
};
exports.formatZodError = formatZodError;
