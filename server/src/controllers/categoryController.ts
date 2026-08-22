import { Request, Response } from "express";
import { db } from "../database/db";

export const getCategories = (_req: Request, res: Response): void => {
  const categories = db.categories.map((cat) => {
    const subcats = db.subcategories.filter((sub) => sub.category_id === cat.id);
    return {
      ...cat,
      subcategories: subcats,
    };
  });

  res.json({
    success: true,
    data: categories,
  });
};

export const getCategoryBySlug = (req: Request, res: Response): void => {
  const { slug } = req.params;
  const category = db.categories.find((c) => c.slug === slug || c.id === slug);

  if (!category) {
    res.status(404).json({ success: false, message: "Category not found" });
    return;
  }

  const subcategories = db.subcategories.filter((s) => s.category_id === category.id);
  res.json({
    success: true,
    data: {
      ...category,
      subcategories,
    },
  });
};

export const getSubcategories = (req: Request, res: Response): void => {
  const { category_id } = req.query;

  let subcats = db.subcategories;
  if (category_id) {
    subcats = subcats.filter((s) => s.category_id === category_id);
  }

  res.json({
    success: true,
    data: subcats,
  });
};
