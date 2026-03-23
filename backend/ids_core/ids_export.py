"""
ids_core/ids_export.py
Bridge between Django IDS/Specification models and the vendored ifctester
library.  Converts DB records → ifctester objects → IDS XML (schema-valid).
"""
import logging
from typing import Any

from ifctester.ids import Ids as IfcTesterIds
from ifctester.ids import Specification as IfcTesterSpec
from ifctester.ids import get_schema
from ifctester.facet import (
    Attribute,
    Classification,
    Entity,
    Material,
    PartOf,
    Property,
)

logger = logging.getLogger(__name__)

# ── Field-name mapping (frontend snake_case → ifctester camelCase) ──────────

_SNAKE_TO_CAMEL = {
    "property_set": "propertySet",
    "base_name": "baseName",
    "predefined_type": "predefinedType",
    "data_type": "dataType",
}

FACET_CLASSES = {
    "entity": Entity,
    "attribute": Attribute,
    "property": Property,
    "classification": Classification,
    "material": Material,
    "partof": PartOf,
}

# Which kwargs each facet constructor accepts (excluding type/instructions/cardinality)
FACET_KWARGS = {
    "entity": ["name", "predefinedType"],
    "attribute": ["name", "value"],
    "property": ["propertySet", "baseName", "value", "dataType", "uri"],
    "classification": ["value", "system", "uri"],
    "material": ["value", "uri"],
    "partof": ["name", "predefinedType", "relation"],
}

# Required fields per facet type (at least these must be non-empty)
FACET_REQUIRED = {
    "entity": ["name"],
    "attribute": ["name"],
    "property": ["propertySet", "baseName"],
    "classification": ["system"],
    "material": [],
    "partof": ["name"],
}


# ── Helpers ─────────────────────────────────────────────────────────────────

def _snake_to_camel(d: dict) -> dict:
    """Convert snake_case keys to camelCase where needed."""
    return {_SNAKE_TO_CAMEL.get(k, k): v for k, v in d.items()}


def normalize_facet_data(data) -> list[dict]:
    """Accept either:
    (a) array of dicts (FacetBuilder output) – already in the right shape
    (b) dict-of-dicts (old seed format)       – convert to array
    (c) empty / None                          – return []
    """
    if not data:
        return []
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        result = []
        for facet_type, facet_data in data.items():
            if facet_type.startswith("@"):
                continue
            if isinstance(facet_data, dict):
                result.append({"type": facet_type, **facet_data})
            elif isinstance(facet_data, list):
                for item in facet_data:
                    result.append({"type": facet_type, **item})
        return result
    return []


def build_facet(raw: dict):
    """Convert a single facet dict → ifctester Facet object.

    Returns (facet_object, error_string_or_None).
    """
    facet_type = raw.get("type", "").lower()
    cls = FACET_CLASSES.get(facet_type)
    if cls is None:
        return None, f"Unknown facet type: '{raw.get('type')}'"

    # Convert snake_case → camelCase
    camel = _snake_to_camel(raw)

    # Collect kwargs
    allowed = FACET_KWARGS[facet_type]
    kwargs = {}
    for key in allowed:
        val = camel.get(key)
        if val is not None and val != "":
            kwargs[key] = val

    # Instructions is a constructor param on all facet types
    instructions = camel.get("instructions")
    if instructions:
        kwargs["instructions"] = instructions

    # Check required fields
    required = FACET_REQUIRED[facet_type]
    missing = [r for r in required if not kwargs.get(r)]
    if missing:
        return None, f"Facet '{facet_type}' missing required fields: {', '.join(missing)}"

    try:
        obj = cls(**kwargs)
        # Cardinality is set as an attribute, not a constructor param
        cardinality = camel.get("cardinality")
        if cardinality:
            obj.cardinality = cardinality
        return obj, None
    except Exception as e:
        return None, f"Error building '{facet_type}' facet: {e}"


def build_facets(data) -> tuple[list, list[str]]:
    """Convert facet data → list of ifctester Facet objects.

    Returns (facet_list, errors).
    """
    normalised = normalize_facet_data(data)
    facets = []
    errors = []
    for i, raw in enumerate(normalised):
        obj, err = build_facet(raw)
        if err:
            errors.append(f"[{i}] {err}")
        elif obj:
            facets.append(obj)
    return facets, errors


# ── Model → ifctester objects ───────────────────────────────────────────────

def build_specification(spec) -> tuple[IfcTesterSpec, list[str]]:
    """Convert a Django Specification model instance → ifctester Specification.

    Returns (spec_obj, errors).
    """
    errors = []

    ifc_version = spec.ifc_version  # e.g. "IFC4"
    # ifcVersion expects a list (schema: xs:list of IFC versions)
    if isinstance(ifc_version, str):
        ifc_version = [v.strip() for v in ifc_version.split() if v.strip()]

    ids_spec = IfcTesterSpec(
        name=spec.name or "Unnamed",
        ifcVersion=ifc_version,
        identifier=spec.identifier or None,
        description=spec.description or None,
        instructions=spec.instructions or None,
    )

    app_facets, app_errors = build_facets(spec.applicability_data)
    ids_spec.applicability = app_facets
    errors.extend([f"applicability: {e}" for e in app_errors])

    req_facets, req_errors = build_facets(spec.requirements_data)
    ids_spec.requirements = req_facets
    errors.extend([f"requirements: {e}" for e in req_errors])

    return ids_spec, errors


def build_ids(ids_obj) -> tuple[IfcTesterIds, list[str]]:
    """Convert a Django IDS model instance (with prefetched specs) →
    ifctester Ids object.

    Returns (ids_object, errors).
    """
    errors = []

    date_str = None
    if ids_obj.date:
        date_str = ids_obj.date.isoformat()

    ids = IfcTesterIds(
        title=ids_obj.title or "Untitled",
        copyright=ids_obj.copyright_text or None,
        version=ids_obj.version or None,
        description=ids_obj.description or None,
        author=ids_obj.author_email or None,
        date=date_str,
        purpose=ids_obj.purpose or None,
        milestone=ids_obj.milestone or None,
    )

    specs = ids_obj.specifications.all()
    if not specs.exists():
        errors.append("IDS must contain at least one specification.")
        return ids, errors

    for spec in specs:
        ids_spec, spec_errors = build_specification(spec)
        ids.specifications.append(ids_spec)
        if spec_errors:
            errors.extend([f"spec '{spec.name}': {e}" for e in spec_errors])

    return ids, errors


# ── XML generation ──────────────────────────────────────────────────────────

def ids_to_xml_string(ids_obj) -> tuple[str, list[str]]:
    """Build XML string from a Django IDS model.

    Returns (xml_string, errors).
    """
    ids, errors = build_ids(ids_obj)
    if errors:
        return "", errors

    try:
        xml = ids.to_string()
        return xml, []
    except Exception as e:
        return "", [f"XML generation failed: {e}"]


def validate_ids(ids_obj) -> tuple[bool, list[str]]:
    """Validate that the IDS model can produce schema-valid XML.

    Returns (is_valid, errors).
    """
    ids, build_errors = build_ids(ids_obj)
    if build_errors:
        return False, build_errors

    try:
        ids_dict = ids.asdict()
        schema = get_schema()
        schema.validate(schema.encode(ids_dict))
        return True, []
    except Exception as e:
        return False, [str(e)]


def validate_facet_data(facet_data, label="facets") -> list[str]:
    """Validate a facet JSON blob (applicability_data or requirements_data).

    Returns list of error strings (empty if valid).
    """
    normalised = normalize_facet_data(facet_data)
    errors = []
    for i, raw in enumerate(normalised):
        _, err = build_facet(raw)
        if err:
            errors.append(f"{label}[{i}]: {err}")
    return errors
