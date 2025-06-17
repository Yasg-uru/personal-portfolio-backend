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
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
class RedisCache {
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: process.env.REDIS_CACHE_KEY
            // url: "redis://127.0.0.1:6379",
        });
        this.client.on("connect", () => {
            console.log(`connected to redis`);
        });
        this.client.on("error", (err) => {
            console.log("redis error:", err);
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.isOpen) {
                yield this.client.connect();
            }
        });
    }
    // ttl in seconds
    set(key, value, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            const stringValue = typeof value === "string" ? value : JSON.stringify(value);
            if (ttl) {
                yield this.client.set(key, stringValue, { EX: ttl });
            }
            else {
                yield this.client.set(key, stringValue);
            }
        });
    }
    //default generic is string but it can be of any type
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.client.get(key);
            if (value) {
                try {
                    return JSON.parse(value);
                }
                catch (error) {
                    return value;
                }
            }
            return null;
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.del(key);
        });
    }
    exists(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield this.client.exists(key);
            return exists === 1;
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client.isOpen) {
                yield this.client.quit();
                console.log(`Disconnected from Redis`);
            }
        });
    }
}
const redisCache = new RedisCache();
exports.default = redisCache;
