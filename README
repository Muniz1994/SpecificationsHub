# SpecificationsHUB

A web platform for creating, sharing, and managing **Information Delivery Specifications (IDS)** — an open [buildingSMART](https://www.buildingsmart.org/) standard for defining information requirements in BIM projects.

SpecificationsHUB lets users browse community-shared Specifications and IDS documents, compose their own IDS by combining Specifications, import and export standard `.ids` XML files (validated against the IDS 1.0 XSD schema), and manage everything through a personal library.

---

## Features

### IDS Management
- **Create, edit, and delete** IDS documents with full metadata (title, version, author, date, purpose, milestone, copyright)
- **Compose IDS** by attaching any number of Specifications (reusable building blocks)
- **Import `.ids` files** — upload any `.ids` XML file; the system validates it against the IDS 1.0 XSD schema and shows detailed error reports if the file is non-compliant
- **Export / Download `.ids` files** — generate schema-valid IDS XML from any IDS in your library, named after the IDS title
- **Validate** — check whether an IDS can produce valid XML without downloading

### Specifications
- **Create, edit, and delete** Specifications with name, IFC version, identifier, description, and instructions
- **Facet builder** — visual editor for applicability and requirements facets (Entity, Attribute, Property, Classification, Material, PartOf) with live preview
- **Wide modal view** — two-panel detail modal with facet summary on the left and full details on the right

### Community & Library
- **Community browsing** — public listing of all shared IDS documents and Specifications
- **Full-text search** across IDS titles, Specification names, and descriptions
- **Copy to library** — deep-copy any community IDS (with all its Specifications) into your private library
- **Personal library** — resizable two-panel layout with a sidebar listing your IDSs and Specifications, and a detail view on the right
- **Tag system** — organize with tags by category (use case, stage, discipline, other)

### Authentication & User Profile
- **JWT authentication** — register, log in, automatic token refresh on expiry
- **User profile** — view and edit name, email, and profile picture; see IDS and Specification counts
- **Light / dark theme** toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python · Django 6 · Django REST Framework · SimpleJWT |
| **Frontend** | React 19 · Vite · Tailwind CSS 4 · Redux Toolkit / RTK Query |
| **Database** | SQLite |
| **UI** | shadcn/ui (Radix UI primitives) · Lucide icons |
| **IDS Parsing** | Vendored `ifctester` library · `xmlschema` for XSD validation |

---

## Project Structure

```
SpecificationsHub/
├── ids.xsd                              # buildingSMART IDS 1.0 XSD schema
├── README                               # This file
│
├── backend/
│   ├── manage.py                        # Django entry point
│   ├── requirements.txt                 # Python dependencies
│   ├── db.sqlite3                       # SQLite database
│   ├── config/                          # Django settings, URLs, WSGI/ASGI
│   ├── accounts/                        # Custom User model, auth views
│   ├── ids_core/                        # Core app
│   │   ├── models.py                    # IDS, Specification, Tag, UserLibrary
│   │   ├── views.py                     # CRUD ViewSets + import/export/validate
│   │   ├── serializers.py               # DRF serializers with facet validation
│   │   ├── ids_export.py                # DB → ifctester → schema-valid IDS XML
│   │   ├── ids_import.py                # .ids XML → validate → parse → DB models
│   │   └── management/commands/
│   │       └── seed_data.py             # Populate DB with demo data
│   └── ifctester/                       # Vendored IDS parsing/validation library
│       ├── ids.py                       # Ids, Specification classes
│       ├── facet.py                     # Entity, Attribute, Property, etc.
│       └── ids.xsd                      # XSD schema copy for validation
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                      # Route definitions
        ├── app/                         # Redux store + RTK Query base API
        ├── components/                  # Layout, MainToolbar, SearchBox, theme, ui/
        ├── features/
        │   ├── auth/                    # Login, Register, ProtectedRoute, authSlice
        │   ├── ids/                     # IDS pages, cards, editor, idsApi
        │   ├── specifications/          # Spec pages, cards, modal, form, FacetBuilder
        │   ├── library/                 # UserLibraryPage, LibrarySidebar
        │   └── user/                    # UserInfoPage
        └── pages/                       # LandingPage, DashboardPage
```

---

## Getting Started

### Prerequisites

- **Python 3.11+** and `pip`
- **Node.js 18+** and `npm`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-user/SpecificationsHub.git
cd SpecificationsHub

# ── Backend ──────────────────────────────────────────────
cd backend
python -m venv ../venv
source ../venv/bin/activate        # Linux/macOS
# ..\venv\Scripts\activate         # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data          # Optional: populate with demo data

# ── Frontend ─────────────────────────────────────────────
cd ../frontend
npm install
```

### Running

Open **two terminals**:

```bash
# Terminal 1 — Backend (http://localhost:8000)
cd backend
source ../venv/bin/activate
python manage.py runserver

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

### Demo Accounts

If you ran `seed_data`, three demo users are available:

| Username | Password | Content |
|---|---|---|
| `alice` | `Demo1234!` | 4 Specifications, 2 IDSs |
| `bob` | `Demo1234!` | 4 Specifications, 2 IDSs |
| `carol` | `Demo1234!` | 4 Specifications, 2 IDSs |

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Project description for unauthenticated users |
| `/login` | Login | JWT authentication |
| `/register` | Register | Create a new account |
| `/dashboard` | Dashboard | Search bar, recent Specifications and IDS cards |
| `/specifications` | Community Specifications | Browse all public Specifications |
| `/ids` | Community IDSs | Browse all public IDS documents |
| `/ids/:id` | IDS Detail | IDS metadata + Specification cards, download button |
| `/library` | User Library | Personal IDSs and Specifications with two-panel layout |
| `/editor` | IDS Editor | Placeholder for future visual editor |
| `/profile` | User Profile | Edit name, email, profile picture |

---

## API Reference

### Authentication — `/api/auth/`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Create account |
| POST | `/api/auth/login/` | Obtain JWT token pair (access + refresh) |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/auth/me/` | Get current user profile |
| PATCH | `/api/auth/me/` | Update user profile |

### IDS — `/api/ids/`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/ids/` | List public IDSs (paginated, searchable) |
| POST | `/api/ids/` | Create a new IDS |
| GET | `/api/ids/{id}/` | IDS detail with embedded Specifications |
| PATCH | `/api/ids/{id}/` | Update IDS (owner only) |
| DELETE | `/api/ids/{id}/` | Delete IDS |
| GET | `/api/ids/mine/` | Current user's IDSs |
| POST | `/api/ids/import_file/` | Upload and import `.ids` XML file (multipart) |
| GET | `/api/ids/{id}/download/` | Download IDS as `.ids` XML file |
| GET | `/api/ids/{id}/validate/` | Check if IDS produces valid XML |
| POST | `/api/ids/{id}/add_specification/` | Attach a Specification |
| POST | `/api/ids/{id}/remove_specification/` | Detach a Specification |
| POST | `/api/ids/{id}/copy_to_library/` | Deep-copy IDS + Specs to your library |
| DELETE | `/api/ids/{id}/delete_with_specifications/` | Delete IDS and all its Specifications |
| POST/DELETE | `/api/ids/{id}/tags/` | Add or remove a tag |

### Specifications — `/api/specifications/`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/specifications/` | List public Specifications |
| POST | `/api/specifications/` | Create a new Specification |
| GET | `/api/specifications/{id}/` | Specification detail |
| PATCH | `/api/specifications/{id}/` | Update (owner only) |
| DELETE | `/api/specifications/{id}/` | Delete |
| GET | `/api/specifications/mine/` | Current user's Specifications |
| POST | `/api/specifications/{id}/copy_to_library/` | Copy to your library |
| POST/DELETE | `/api/specifications/{id}/tags/` | Add or remove a tag |

### Other

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/search/?q=` | Search IDSs and Specifications |
| GET | `/api/tags/` | List all tags |
| GET/POST | `/api/library/` | User's saved library items |

---

## Data Model

```
User (accounts)
 ├── has many → IDS
 └── has many → Specification

IDS
 ├── title, copyright_text, version, description
 ├── author_email, date, purpose, milestone
 ├── is_public, is_deleted
 └── many-to-many → Specification (via IDSSpecification with order)

Specification
 ├── name, ifc_version (IFC2X3 | IFC4 | IFC4X3_ADD2)
 ├── identifier, description, instructions
 ├── applicability_data (JSON — array of facet dicts)
 ├── requirements_data  (JSON — array of facet dicts)
 └── is_public, is_deleted

Tag
 ├── name, category (use_case | stage | discipline | other)
 └── attached to IDSs and Specifications via through tables

UserLibrary
 └── saves references to IDSs or Specifications per user
```

### Facet Types

Facets stored in `applicability_data` and `requirements_data` follow the buildingSMART IDS schema:

| Type | Key Fields |
|---|---|
| `entity` | `name`, `predefined_type` |
| `attribute` | `name`, `value` |
| `property` | `property_set`, `base_name`, `value`, `data_type` |
| `classification` | `system`, `value` |
| `material` | `value` |
| `partof` | `name`, `predefined_type`, `relation` |

---

## IDS Import / Export

### Import (Upload)
1. User selects a `.ids` or `.xml` file via the Upload button in the Library sidebar
2. Backend validates the file against the **IDS 1.0 XSD schema** using `xmlschema`
3. If invalid: returns **all** schema violations with human-readable reasons and XPath locations, displayed in a detailed error dialog
4. If valid: parses the XML via `ifctester`, creates corresponding IDS and Specification models, links them, and adds them to the user's library

### Export (Download)
1. Backend converts Django models → ifctester objects (mapping `snake_case` ↔ `camelCase`)
2. Generates schema-valid XML via `ifctester.Ids.to_string()`
3. Returns the file as an attachment named `{IDS_Title}.ids`

### Validation During Creation
When creating or editing Specifications, the serializer validates `applicability_data` and `requirements_data` against the IDS facet structure, ensuring the data can produce valid XML before saving.

---

## Available Commands

### Backend

| Command | Description |
|---|---|
| `python manage.py runserver` | Start Django dev server (port 8000) |
| `python manage.py migrate` | Apply database migrations |
| `python manage.py seed_data` | Seed DB with demo users, specifications, and IDSs |
| `python manage.py createsuperuser` | Create a Django admin user |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Configuration Notes

- **CORS**: Configured for `localhost:5173` and `127.0.0.1:5173` (development only)
- **API base URL**: Hardcoded to `http://localhost:8000/api/` in `frontend/src/app/api.js`
- **JWT tokens**: 60-minute access, 7-day refresh, rotating refresh tokens
- **Database**: SQLite at `backend/db.sqlite3` (swap to PostgreSQL for production)
- **DEBUG mode**: Enabled — disable and set a proper `SECRET_KEY` for production
- **Media files**: Profile pictures stored in `backend/media/`

---

## License

This project uses the vendored [IfcTester](https://github.com/IfcOpenShell/IfcOpenShell) library, licensed under LGPL-3.0.
