import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db";
import { AuthRequest } from "../middleware/auth";
import { WorkerProfile, WorkerServiceWithSubcategory } from "../types";

// Haversine formula to compute distance in km between two lat/lng points
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const getWorkers = (req: Request, res: Response): void => {
  const {
    category,
    subcategory,
    search,
    lat,
    lng,
    radius, // in km: 2, 5, 10, 20, 50
    min_rating,
    min_experience,
    max_price,
    verified_only,
    online_only,
    language,
  } = req.query;

  const clientLat = lat ? Number(lat) : undefined;
  const clientLng = lng ? Number(lng) : undefined;
  const maxRadiusKm = radius ? Number(radius) : undefined;

  let results: (WorkerProfile & { distance_km?: number })[] = db.workers.map((worker) => {
    const user = db.users.find((u) => u.id === worker.user_id);
    const workerServices = db.worker_services
      .filter((ws) => ws.worker_id === worker.id && ws.is_available)
      .map((ws) => {
        const sub = db.subcategories.find((s) => s.id === ws.subcategory_id);
        return {
          ...ws,
          subcategory: sub!,
        } as WorkerServiceWithSubcategory;
      })
      .filter((ws) => ws.subcategory);

    let distance_km: number | undefined;
    if (clientLat !== undefined && clientLng !== undefined) {
      distance_km = calculateDistanceKm(clientLat, clientLng, worker.lat, worker.lng);
    }

    return {
      ...worker,
      user,
      services: workerServices,
      distance_km,
    };
  });

  // Filter approved (unless admin querying)
  if (verified_only === "true") {
    results = results.filter((w) => w.is_approved && w.user?.is_verified);
  }

  // Filter online only
  if (online_only === "true") {
    results = results.filter((w) => w.is_online);
  }

  // Filter by category slug or id
  if (category) {
    const cat = db.categories.find((c) => c.slug === category || c.id === category);
    if (cat) {
      const subIds = db.subcategories.filter((s) => s.category_id === cat.id).map((s) => s.id);
      results = results.filter((w) =>
        w.services?.some((s) => subIds.includes(s.subcategory_id))
      );
    }
  }

  // Filter by subcategory id
  if (subcategory) {
    results = results.filter((w) =>
      w.services?.some((s) => s.subcategory_id === subcategory)
    );
  }

  // Search keyword (name, bio, skills, city, address)
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (w) =>
        w.user?.name.toLowerCase().includes(q) ||
        w.bio.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q) ||
        w.languages_spoken.some((lang) => lang.toLowerCase().includes(q)) ||
        w.services?.some((s) => s.subcategory.name.toLowerCase().includes(q))
    );
  }

  // Filter by distance
  if (maxRadiusKm !== undefined && clientLat !== undefined && clientLng !== undefined) {
    results = results.filter(
      (w) => w.distance_km !== undefined && w.distance_km <= maxRadiusKm
    );
  }

  // Filter by min rating
  if (min_rating) {
    results = results.filter((w) => w.rating >= Number(min_rating));
  }

  // Filter by min experience
  if (min_experience) {
    results = results.filter((w) => w.experience_years >= Number(min_experience));
  }

  // Filter by max price
  if (max_price) {
    results = results.filter((w) => w.hourly_rate <= Number(max_price));
  }

  // Filter by language
  if (language) {
    const langQuery = String(language).toLowerCase();
    results = results.filter((w) =>
      w.languages_spoken.some((l) => l.toLowerCase() === langQuery)
    );
  }

  // Sort by distance if available, else rating
  results.sort((a, b) => {
    if (a.distance_km !== undefined && b.distance_km !== undefined) {
      return a.distance_km - b.distance_km;
    }
    return b.rating - a.rating;
  });

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
};

export const getWorkerById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const worker = db.workers.find((w) => w.id === id || w.user_id === id);

  if (!worker) {
    res.status(404).json({ success: false, message: "Worker not found" });
    return;
  }

  const user = db.users.find((u) => u.id === worker.user_id);
  const workerServices = db.worker_services
    .filter((ws) => ws.worker_id === worker.id)
    .map((ws) => {
      const sub = db.subcategories.find((s) => s.id === ws.subcategory_id);
      return {
        ...ws,
        subcategory: sub!,
      };
    })
    .filter((ws) => ws.subcategory);

  const reviews = db.reviews.filter((r) => r.worker_id === worker.id);

  res.json({
    success: true,
    data: {
      ...worker,
      user,
      services: workerServices,
      reviews,
    },
  });
};

export const updateWorkerProfile = (req: AuthRequest, res: Response): void => {
  if (!req.user || req.user.role !== "worker") {
    res.status(403).json({ success: false, message: "Only workers can update worker profiles" });
    return;
  }

  const worker = db.workers.find((w) => w.user_id === req.user?.id);
  if (!worker) {
    res.status(404).json({ success: false, message: "Worker profile not found" });
    return;
  }

  const {
    bio,
    hourly_rate,
    service_radius_km,
    is_online,
    languages_spoken,
    address,
    city,
    state,
    lat,
    lng,
    services,
  } = req.body;

  if (bio !== undefined) worker.bio = bio;
  if (hourly_rate !== undefined) worker.hourly_rate = Number(hourly_rate);
  if (service_radius_km !== undefined) worker.service_radius_km = Number(service_radius_km);
  if (is_online !== undefined) worker.is_online = Boolean(is_online);
  if (languages_spoken !== undefined) worker.languages_spoken = languages_spoken;
  if (address !== undefined) worker.address = address;
  if (city !== undefined) worker.city = city;
  if (state !== undefined) worker.state = state;
  if (lat !== undefined) worker.lat = Number(lat);
  if (lng !== undefined) worker.lng = Number(lng);

  // Update services if passed
  if (Array.isArray(services)) {
    // Remove existing services
    const remaining = db.worker_services.filter((ws) => ws.worker_id !== worker.id);
    const newWs = services.map((subId: string) => ({
      id: `ws_${uuidv4().slice(0, 8)}`,
      worker_id: worker.id,
      subcategory_id: subId,
      is_available: true,
    }));
    db.reset({
      ...db["data"],
      worker_services: [...remaining, ...newWs],
    });
  }

  db.save();

  res.json({
    success: true,
    message: "Worker profile updated successfully",
    data: worker,
  });
};

export const uploadKycDocuments = (req: AuthRequest, res: Response): void => {
  if (!req.user || req.user.role !== "worker") {
    res.status(403).json({ success: false, message: "Unauthorized" });
    return;
  }

  const worker = db.workers.find((w) => w.user_id === req.user?.id);
  if (!worker) {
    res.status(404).json({ success: false, message: "Worker profile not found" });
    return;
  }

  const { aadhaar_number, pan_number, aadhaar_doc, pan_doc, certificates, portfolio } = req.body;

  if (aadhaar_number) worker.aadhaar_number = aadhaar_number;
  if (pan_number) worker.pan_number = pan_number;
  if (aadhaar_doc) worker.aadhaar_doc = aadhaar_doc;
  if (pan_doc) worker.pan_doc = pan_doc;
  if (certificates && Array.isArray(certificates)) worker.certificates = certificates;
  if (portfolio && Array.isArray(portfolio)) worker.portfolio = portfolio;

  // KYC submission marks as pending review
  worker.is_approved = false;
  db.save();

  res.json({
    success: true,
    message: "KYC documents submitted for admin verification",
    data: worker,
  });
};
