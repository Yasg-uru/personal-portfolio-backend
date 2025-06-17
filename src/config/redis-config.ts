import { createClient, RedisClientType } from "redis";

class RedisCache {
  private client: RedisClientType;
  constructor() {
    this.client = createClient({
      url: 'redis://default:qrwolXFcCbEriZeaIBGGxmWLkiWLhS7o@redis-18454.c240.us-east-1-3.ec2.redns.redis-cloud.com:18454',
      // url: "redis://127.0.0.1:6379",
    });
    this.client.on("connect", () => {
      console.log(`connected to redis`);
    });
    this.client.on("error", (err) => {
      console.log("redis error:", err);
    });
  }
  public async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }
  // ttl in seconds
  public async set(
    key: string,
    value: string | object,
    ttl?: number
  ): Promise<void> {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    if (ttl) {
      await this.client.set(key, stringValue, { EX: ttl });
    } else {
      await this.client.set(key, stringValue);
    }
  }
  //default generic is string but it can be of any type
  public async get<T = string>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (error) {
        return value as T;
      }
    }
    return null;
  }
  public async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
  public async exists(key: string): Promise<boolean> {
    const exists = await this.client.exists(key);
    return exists === 1;
  }
  public async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
      console.log(`Disconnected from Redis`);
    }
  }
}
const redisCache: RedisCache = new RedisCache();
export default redisCache;
