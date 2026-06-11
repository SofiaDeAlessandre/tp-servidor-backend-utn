import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,

  handler: (req, res) => {
    res
      .status(429)
      .json({ error: "Too many requests, please try again later." });
  },
});

export { limiter };
