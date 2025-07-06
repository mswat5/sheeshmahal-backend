"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const my_hotels_routes_1 = __importDefault(require("./routes/my-hotels.routes"));
const my_bookings_routes_1 = __importDefault(require("./routes/my-bookings.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/hotels", my_hotels_routes_1.default);
app.use("/api/bookings", my_bookings_routes_1.default);
app.get("/", (req, res) => {
    res.send("api is running");
});
app.listen(8000, () => {
    console.log("server running on 8000");
});
