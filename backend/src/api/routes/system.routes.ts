import { Router } from "express";

const router = Router();

router.get("/system/health", (_req, res) => {
  res.json({
    success: true,
    data: { status: "ok", uptimeSeconds: Math.round(process.uptime()) },
    message: "System healthy",
  });
});

export default router;
