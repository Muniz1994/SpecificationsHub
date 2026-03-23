"""
ids_core/ids_import.py
Parse a .ids (XML) file → create Django IDS + Specification models.
Validates the file against the IDS 1.0 XSD schema before importing.
"""
import datetime
import logging
from typing import Any

from ifctester.ids import from_string as ids_from_string, IdsXmlValidationError
from ifctester.facet import Restriction

from .models import IDS, Specification, IDSSpecification

logger = logging.getLogger(__name__)

# ── camelCase → snake_case mapping (reverse of ids_export) ──────────────────

_CAMEL_TO_SNAKE = {
    "propertySet": "property_set",
    "baseName": "base_name",
    "predefinedType": "predefined_type",
    "dataType": "data_type",
}

# Facet type name normalisation (ifctester class names → our lowercase types)
_CLASS_TO_TYPE = {
    "Entity": "entity",
    "Attribute": "attribute",
    "Property": "property",
    "Classification": "classification",
    "Material": "material",
    "PartOf": "partof",
}

# Valid IFC version values accepted by the DB model
_VALID_IFC_VERSIONS = {"IFC2X3", "IFC4", "IFC4X3_ADD2"}


# ── Facet → JSON dict ──────────────────────────────────────────────────────

def _serialise_value(val):
    """Convert a facet attribute value to a JSON-safe representation."""
    if val is None:
        return None
    if isinstance(val, Restriction):
        # Store as a string so the FacetBuilder can show it
        return str(val)
    return val


def facet_to_dict(facet) -> dict[str, Any]:
    """Convert a parsed ifctester Facet object → frontend-compatible dict.

    Output format matches what FacetBuilder.jsx produces:
    { "type": "entity", "name": "IFCWALL", "cardinality": "required", ... }
    """
    class_name = type(facet).__name__
    facet_type = _CLASS_TO_TYPE.get(class_name, class_name.lower())

    result: dict[str, Any] = {"type": facet_type}

    for param in facet.parameters:
        attr_name = param.replace("@", "")
        val = getattr(facet, attr_name, None)
        if val is None:
            continue

        serialised = _serialise_value(val)
        if serialised is None:
            continue

        # Apply camelCase → snake_case mapping
        key = _CAMEL_TO_SNAKE.get(attr_name, attr_name)
        result[key] = serialised

    return result


def clause_to_json(facets_list) -> list[dict]:
    """Convert a list of parsed Facet objects → JSON array for the DB."""
    return [facet_to_dict(f) for f in (facets_list or [])]


# ── IDS info → Django model field mapping ───────────────────────────────────

def _pick_ifc_version(ifc_versions) -> str:
    """Select the best single IFC version from a parsed ifcVersion list.

    The DB only stores one value (CharField with choices), so pick the first
    one that matches a valid choice. Falls back to 'IFC4'.
    """
    if isinstance(ifc_versions, str):
        ifc_versions = ifc_versions.split()
    for v in (ifc_versions or []):
        upper = v.strip().upper()
        if upper in _VALID_IFC_VERSIONS:
            return upper
    return "IFC4"


def _parse_date(date_str):
    """Convert a date string (ISO format) to a Python date, or None."""
    if not date_str:
        return None
    try:
        return datetime.date.fromisoformat(str(date_str))
    except (ValueError, TypeError):
        return None


# ── Main import function ────────────────────────────────────────────────────

def import_ids_from_xml(xml_string: str, owner) -> tuple[IDS, list[str]]:
    """Parse and validate an IDS XML string, then create Django models.

    Args:
        xml_string: The raw XML content of the .ids file.
        owner: The Django user who will own the imported IDS/specs.

    Returns:
        (ids_model, warnings) — the created IDS instance and any non-fatal
        warnings encountered during import.

    Raises:
        IdsXmlValidationError: If the XML does not pass XSD schema validation.
        ValueError: If the XML cannot be parsed for other reasons.
    """
    warnings: list[str] = []

    # 1. Validate + parse via ifctester (raises IdsXmlValidationError on bad XML)
    parsed = ids_from_string(xml_string, validate=True)

    # 2. Create IDS model
    info = parsed.info or {}
    ids_model = IDS.objects.create(
        title=info.get("title", "Imported IDS"),
        copyright_text=info.get("copyright", ""),
        version=info.get("version", ""),
        description=info.get("description", ""),
        author_email=info.get("author", ""),
        date=_parse_date(info.get("date")),
        purpose=info.get("purpose", ""),
        milestone=info.get("milestone", ""),
        owner=owner,
        is_public=False,
    )

    # 3. Create Specification models + link them
    if not parsed.specifications:
        warnings.append("The IDS file contains no specifications.")

    for idx, spec in enumerate(parsed.specifications):
        ifc_ver = _pick_ifc_version(spec.ifcVersion)

        # Build JSON blobs from parsed facet objects
        app_data = clause_to_json(spec.applicability)
        req_data = clause_to_json(spec.requirements)

        spec_model = Specification.objects.create(
            name=spec.name or f"Specification {idx + 1}",
            ifc_version=ifc_ver,
            identifier=getattr(spec, "identifier", "") or "",
            description=getattr(spec, "description", "") or "",
            instructions=getattr(spec, "instructions", "") or "",
            applicability_data=app_data,
            requirements_data=req_data,
            owner=owner,
            is_public=False,
        )

        IDSSpecification.objects.create(
            ids=ids_model,
            specification=spec_model,
            order=idx,
        )

    return ids_model, warnings
