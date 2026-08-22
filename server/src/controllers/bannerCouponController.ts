import { Request, Response } from "express";
import { db } from "../database/db";

export const getBanners = (_req: Request, res: Response): void => {
  const banners = db.banners.filter((b) => b.is_active);
  res.json({
    success: true,
    data: banners,
  });
};

export const getCoupons = (_req: Request, res: Response): void => {
  const coupons = db.coupons.filter((c) => c.is_active);
  res.json({
    success: true,
    data: coupons,
  });
};
