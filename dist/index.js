"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connectDb_1 = __importDefault(require("./lib/connectDb"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_route_1 = __importDefault(require("./route/user.route"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const Errorhandler_util_1 = require("./util/Errorhandler.util");
const project_route_1 = __importDefault(require("./route/project.route"));
const notification_route_1 = __importDefault(require("./route/notification.route"));
require("./jobs/load-data-in-cache");
const redis_config_1 = __importDefault(require("./config/redis-config"));
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
dotenv_1.default.config();
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", 'https://personal-porfolio-jdx2ue9gj-yash-choudharys-projects-6acb3c69.vercel.app', 'https://personal-porfolio-liart-psi.vercel.app'],
        credentials: true,
    },
});
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", 'https://personal-porfolio-jdx2ue9gj-yash-choudharys-projects-6acb3c69.vercel.app', 'https://personal-porfolio-liart-psi.vercel.app'], // The IP address where your Expo app is running
    credentials: true,
}));
app.set('io', exports.io);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/user", user_route_1.default);
app.use("/project", project_route_1.default);
app.use('/notification', notification_route_1.default);
app.use(Errorhandler_util_1.ErrorhandlerMiddleware);
redis_config_1.default.connect();
(0, connectDb_1.default)();
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log("server is running on port:", PORT);
});
app.use(Errorhandler_util_1.ErrorhandlerMiddleware);
