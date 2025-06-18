"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const connectDb_1 = __importDefault(require("./lib/connectDb"));
const Errorhandler_util_1 = require("./util/Errorhandler.util");
const redis_config_1 = __importDefault(require("./config/redis-config"));
const user_route_1 = __importDefault(require("./route/user.route"));
const project_route_1 = __importDefault(require("./route/project.route"));
const notification_route_1 = __importDefault(require("./route/notification.route"));
require("./jobs/load-data-in-cache");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://personal-porfolio-jdx2ue9gj-yash-choudharys-projects-6acb3c69.vercel.app",
            "https://personal-porfolio-liart-psi.vercel.app"
        ],
        credentials: true,
    },
});
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "https://personal-porfolio-jdx2ue9gj-yash-choudharys-projects-6acb3c69.vercel.app",
        "https://personal-porfolio-liart-psi.vercel.app"
    ],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.set("io", exports.io);
app.use("/user", user_route_1.default);
app.use("/project", project_route_1.default);
app.use("/notification", notification_route_1.default);
app.use(Errorhandler_util_1.ErrorhandlerMiddleware);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redis_config_1.default.connect();
        yield (0, connectDb_1.default)(); // assuming this is also async
        const PORT = process.env.PORT || 4000;
        httpServer.listen(PORT, () => {
            console.log("Server is running on port:", PORT);
        });
    }
    catch (err) {
        console.error("Startup error:", err);
    }
}))();
