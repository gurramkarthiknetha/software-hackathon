#!/usr/bin/env python3
import sys
import json
"""
Lightweight eco pipeline.

This module previously imported heavy packages (`transformers`, `numpy`) at
top-level which caused the script to crash in environments where those
packages are not installed or cannot be built. To make the script robust for
local development and CI, imports are done lazily and simple fallbacks are
provided so the pipeline still produces reasonable output without those
dependencies.

If you need the full ML behavior, install the optional dependencies in a
Python virtual environment (recommended):

    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    pip install --upgrade pip
    pip install transformers numpy

"""

import sys
import json


def _mean(values):
    return float(sum(values)) / len(values) if values else 0.0


def detect_materials(item_name, item_description):
    """Return a list of materials detected in the text.

    Tries to use an ML model (transformers). If not available, falls back to
    a simple keyword heuristic which is fast and has no extra dependencies.
    """
    text = f"{item_name}. {item_description}".lower()
    candidate_labels = [
        "Plastic", "Metal", "Steel", "Aluminum", "Glass", "Paper", "Cardboard",
        "Leather", "Fabric", "Cotton", "Polyester", "Rubber", "Silicone",
        "Ceramic", "Wood", "Bamboo", "Bioplastic", "Recycled Material"
    ]

    # Try to use transformers pipeline if installed; otherwise use simple heuristics
    try:
        from transformers import pipeline
        material_model = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
        result = material_model(text, candidate_labels=candidate_labels, multi_label=True)
        threshold = 0.3
        materials = [label for label, score in zip(result["labels"], result["scores"]) if score > threshold]
        return materials
    except Exception:
        # Fallback: keyword matching
        found = []
        for lbl in candidate_labels:
            token = lbl.lower()
            if token in text or token.rstrip('s') in text:
                found.append(lbl)
        # If nothing found, make a best-effort guess based on common words
        if not found:
            keywords = {
                "plastic": "Plastic",
                "metal": "Metal",
                "steel": "Steel",
                "aluminum": "Aluminum",
                "glass": "Glass",
                "paper": "Paper",
                "cardboard": "Cardboard",
                "leather": "Leather",
                "cotton": "Cotton",
                "polyester": "Polyester",
                "rubber": "Rubber",
                "wood": "Wood",
                "bamboo": "Bamboo",
                "bioplastic": "Bioplastic",
                "recycled": "Recycled Material",
            }
            for k, v in keywords.items():
                if k in text:
                    found.append(v)
        return found


def packaging_impact_model(materials):
    impact_scores = {
        "Plastic": 0.8, "Polyester": 0.75, "Metal": 0.5, "Steel": 0.4, "Aluminum": 0.3,
        "Glass": 0.35, "Paper": 0.2, "Cardboard": 0.25, "Wood": 0.3,
        "Bamboo": 0.1, "Leather": 0.6, "Rubber": 0.5, "Ceramic": 0.45,
        "Bioplastic": 0.2, "Recycled Material": 0.15
    }
    scores = [impact_scores.get(m, 0.5) for m in materials]
    avg_score = _mean(scores) if scores else 0.5
    rating = "Low" if avg_score < 0.3 else "Medium" if avg_score < 0.6 else "High"
    return {"impact_score": round(avg_score, 2), "impact_rating": rating}


def ethical_sourcing_model(materials):
    """Estimate ethical sourcing using ML if available, otherwise heuristic."""
    text = f"The following materials are used: {', '.join(materials)}"
    candidate_labels = ["Highly ethical", "Moderately ethical", "Unethical"]
    try:
        from transformers import pipeline
        ethical_model = pipeline("zero-shot-classification", model="microsoft/deberta-large-mnli")
        result = ethical_model(text, candidate_labels=candidate_labels, multi_label=False)
        score_map = {"Highly ethical": 0.9, "Moderately ethical": 0.6, "Unethical": 0.2}
        score = score_map.get(result["labels"][0], 0.5)
        return {"ethical_rating": result["labels"][0], "ethical_score": score}
    except Exception:
        # Simple heuristics based on materials
        low_risk = {"Bamboo", "Recycled Material"}
        high_risk = {"Leather"}
        if any(m in low_risk for m in materials):
            return {"ethical_rating": "Highly ethical", "ethical_score": 0.85}
        if any(m in high_risk for m in materials):
            return {"ethical_rating": "Unethical", "ethical_score": 0.25}
        return {"ethical_rating": "Moderately ethical", "ethical_score": 0.6}


def recyclable_model(materials):
    recyclable_score = {
        "Plastic": 0.5, "Polycarbonate": 0.4, "Metal": 0.9, "Steel": 0.9,
        "Aluminum": 0.95, "Glass": 0.9, "Paper": 0.85, "Cardboard": 0.9,
        "Wood": 0.6, "Bamboo": 0.8, "Leather": 0.2, "Fabric": 0.4,
        "Polyester": 0.3, "Rubber": 0.2, "Ceramic": 0.4, "Bioplastic": 0.7,
        "Recycled Material": 1.0
    }
    scores = [recyclable_score.get(m, 0.4) for m in materials]
    avg_score = _mean(scores) if scores else 0.4
    return {"recyclable_score": round(avg_score, 2), "recyclable_percent": round(avg_score * 100, 1)}


def run_pipeline(input_data):
    name = input_data.get("item_name", "")
    description = input_data.get("item_description", "")

    materials = detect_materials(name, description)
    impact = packaging_impact_model(materials)
    ethics = ethical_sourcing_model(materials)
    recycle = recyclable_model(materials)

    eco_summary = {
        "materials": materials,
        "packaging_impact": impact,
        "ethical_sourcing": ethics,
        "recyclability": recycle
    }

    return eco_summary


def main():
    try:
        raw = sys.stdin.read()
        if not raw:
            print(json.dumps({"error": "No input provided"}))
            return

        data = json.loads(raw)
        result = run_pipeline(data)
        print(json.dumps({"success": True, "data": result}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))


if __name__ == '__main__':
    main()
