import { LabelSlug } from "./types";
import { Music2, Mic2, Waves } from "lucide-react";

export const LABEL_CLASSES: Record<
  LabelSlug,
  { text: string; bg: string; border: string; bgSoft: string; ring: string }
> = {
  bigdripuniverse: {
    text: "text-bigdrip",
    bg: "bg-bigdrip",
    border: "border-bigdrip",
    bgSoft: "bg-bigdrip-soft",
    ring: "focus-visible:outline-bigdrip",
  },
  ag20: {
    text: "text-ag20",
    bg: "bg-ag20",
    border: "border-ag20",
    bgSoft: "bg-ag20-soft",
    ring: "focus-visible:outline-ag20",
  },
  elmayanaconcept: {
    text: "text-elmayana",
    bg: "bg-elmayana",
    border: "border-elmayana",
    bgSoft: "bg-elmayana-soft",
    ring: "focus-visible:outline-elmayana",
  },
};

export const LABEL_SHORT: Record<LabelSlug, string> = {
  bigdripuniverse: "BigDrip",
  ag20: "AG20",
  elmayanaconcept: "Elmayana",
};

export const LABEL_ICON = {
  bigdripuniverse: Mic2,
  ag20: Waves,
  elmayanaconcept: Music2,
};
