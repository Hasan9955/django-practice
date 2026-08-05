import { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { redis } from "../../../helpers/redis";

type RequestWithUser = Request & {
  user?: {
    id?: string;
  } | null;
};

const readIntEnv = (name: string, fallback: number) => {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};

const windowMs = readIntEnv("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000);

const createRedisStore = (prefix: string) =>
  new RedisStore({
    prefix,
    sendCommand: (...args: string[]) =>
      redis.call(args[0], ...args.slice(1)) as Promise<RedisReply>,
  });

const createRateLimiter = ({
  limit,
  prefix,
  message,
}: {
  limit: number;
  prefix: string;
  message: string;
}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore(prefix),
    keyGenerator: (req: Request) => {
      const userId = (req as RequestWithUser).user?.id;

      return userId ? `user:${userId}` : `ip:${req.ip}`;
    },
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message,
      });
    },
  });

/** Authentication endpoints are sensitive to brute-force attacks, so they get a tight limit. */
export const authLimiter = createRateLimiter({
  prefix: "rl:auth",
  limit: readIntEnv("RATE_LIMIT_AUTH_LIMIT", 10),
  message: "Too many authentication requests. Please try again later.",
});

/** OTP endpoints should be heavily constrained because they can trigger email/SMS costs. */
export const otpLimiter = createRateLimiter({
  prefix: "rl:otp",
  limit: readIntEnv("RATE_LIMIT_OTP_LIMIT", 5),
  message: "Too many OTP requests. Please try again later.",
});

/** Public catalog endpoints are high-traffic but still need abuse protection across instances. */
export const publicApiLimiter = createRateLimiter({
  prefix: "rl:public",
  limit: readIntEnv("RATE_LIMIT_PUBLIC_LIMIT", 2000),
  message: "Too many public API requests. Please try again later.",
});

/** Cart actions are user-facing but stateful, so they need a moderate per-user quota. */
export const cartLimiter = createRateLimiter({
  prefix: "rl:cart",
  limit: readIntEnv("RATE_LIMIT_CART_LIMIT", 1000),
  message: "Too many cart requests. Please try again later.",
});

/** Wishlist-style actions should be protected from runaway clients without hurting normal browsing. */
export const wishlistLimiter = createRateLimiter({
  prefix: "rl:wishlist",
  limit: readIntEnv("RATE_LIMIT_WISHLIST_LIMIT", 1000),
  message: "Too many wishlist requests. Please try again later.",
});

/** Order and checkout endpoints are expensive and should be throttled aggressively. */
export const orderLimiter = createRateLimiter({
  prefix: "rl:order",
  limit: readIntEnv("RATE_LIMIT_ORDER_LIMIT", 100),
  message: "Too many order requests. Please try again later.",
});

/** Notifications are often polled in bursts, so they get a higher but still bounded quota. */
export const notificationLimiter = createRateLimiter({
  prefix: "rl:notification",
  limit: readIntEnv("RATE_LIMIT_NOTIFICATION_LIMIT", 1500),
  message: "Too many notification requests. Please try again later.",
});

/** Chat endpoints can receive rapid bursts, so this limiter protects message throughput. */
export const chatLimiter = createRateLimiter({
  prefix: "rl:chat",
  limit: readIntEnv("RATE_LIMIT_CHAT_LIMIT", 3000),
  message: "Too many chat requests. Please try again later.",
});

/** GPT or AI assistant endpoints are cost-sensitive and must stay tightly controlled. */
export const aiChatLimiter = createRateLimiter({
  prefix: "rl:ai-chat",
  limit: readIntEnv("RATE_LIMIT_AI_CHAT_LIMIT", 50),
  message: "Too many AI chat requests. Please try again later.",
});

/** File uploads are resource intensive, so they need a strict global quota. */
export const fileUploadLimiter = createRateLimiter({
  prefix: "rl:file-upload",
  limit: readIntEnv("RATE_LIMIT_FILE_UPLOAD_LIMIT", 100),
  message: "Too many file upload requests. Please try again later.",
});

/** Privileged management APIs should be slower than public reads to reduce operational risk. */
export const adminApiLimiter = createRateLimiter({
  prefix: "rl:admin",
  limit: readIntEnv("RATE_LIMIT_ADMIN_LIMIT", 500),
  message: "Too many admin requests. Please try again later.",
});
