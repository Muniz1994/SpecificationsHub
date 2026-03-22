"""
Management command to populate the database with realistic demo data.
Usage:  python manage.py seed_data
"""
from datetime import date
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from ids_core.models import IDS, Specification, IDSSpecification

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with demo users, IDSs and specifications'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # ------------------------------------------------------------------
        # 1. Users
        # ------------------------------------------------------------------
        users = []
        user_data = [
            {'username': 'alice', 'email': 'alice@example.com',
             'first_name': 'Alice', 'last_name': 'Johnson', 'password': 'Demo1234!'},
            {'username': 'bob', 'email': 'bob@example.com',
             'first_name': 'Bob', 'last_name': 'Smith', 'password': 'Demo1234!'},
            {'username': 'carol', 'email': 'carol@example.com',
             'first_name': 'Carol', 'last_name': 'Williams', 'password': 'Demo1234!'},
        ]
        for ud in user_data:
            pwd = ud.pop('password')
            user, created = User.objects.get_or_create(
                username=ud['username'], defaults=ud
            )
            if created:
                user.set_password(pwd)
                user.save()
                self.stdout.write(f'  Created user: {user.username}')
            users.append(user)

        alice, bob, carol = users

        # ------------------------------------------------------------------
        # 2. Specifications
        # ------------------------------------------------------------------
        specs_data = [
            {
                'name': 'Fire Rating Required',
                'ifc_version': 'IFC4',
                'description': 'All fire-rated elements must have a FireRating property.',
                'instructions': 'Ensure Pset_WallCommon.FireRating is populated.',
                'owner': alice,
                'applicability_data': {
                    'entity': {'name': 'IfcWall'},
                },
                'requirements_data': {
                    'property': {
                        'propertySet': 'Pset_WallCommon',
                        'baseName': 'FireRating',
                        'cardinality': 'required',
                    }
                },
            },
            {
                'name': 'Structural Load Bearing',
                'ifc_version': 'IFC4',
                'description': 'Structural walls must be marked as load bearing.',
                'instructions': 'Set LoadBearing to TRUE for structural walls.',
                'owner': alice,
                'applicability_data': {
                    'entity': {'name': 'IfcWall', 'predefinedType': 'STANDARD'},
                    'classification': {'system': 'Uniclass2015', 'value': 'Ss_25'},
                },
                'requirements_data': {
                    'property': {
                        'propertySet': 'Pset_WallCommon',
                        'baseName': 'LoadBearing',
                        'cardinality': 'required',
                    }
                },
            },
            {
                'name': 'External Wall Thermal',
                'ifc_version': 'IFC4',
                'description': 'External walls must declare thermal transmittance.',
                'owner': bob,
                'applicability_data': {
                    'entity': {'name': 'IfcWall'},
                    'property': {'propertySet': 'Pset_WallCommon', 'baseName': 'IsExternal'},
                },
                'requirements_data': {
                    'property': {
                        'propertySet': 'Pset_WallCommon',
                        'baseName': 'ThermalTransmittance',
                        'cardinality': 'required',
                    }
                },
            },
            {
                'name': 'Door Accessibility',
                'ifc_version': 'IFC4',
                'description': 'Doors on accessible routes must have minimum clear width.',
                'owner': bob,
                'applicability_data': {
                    'entity': {'name': 'IfcDoor'},
                },
                'requirements_data': {
                    'attribute': {
                        'name': 'OverallWidth',
                        'cardinality': 'required',
                    }
                },
            },
            {
                'name': 'Window U-Value',
                'ifc_version': 'IFC4',
                'description': 'All windows must specify their U-value for energy analysis.',
                'owner': carol,
                'applicability_data': {
                    'entity': {'name': 'IfcWindow'},
                },
                'requirements_data': {
                    'property': {
                        'propertySet': 'Pset_WindowCommon',
                        'baseName': 'ThermalTransmittance',
                        'cardinality': 'required',
                    }
                },
            },
            {
                'name': 'Slab Concrete Grade',
                'ifc_version': 'IFC4',
                'description': 'Concrete slabs must declare their concrete grade.',
                'owner': carol,
                'applicability_data': {
                    'entity': {'name': 'IfcSlab'},
                    'material': {'value': 'Concrete'},
                },
                'requirements_data': {
                    'property': {
                        'propertySet': 'Pset_ConcreteElementGeneral',
                        'baseName': 'StrengthClass',
                        'cardinality': 'required',
                    }
                },
            },
            {
                'name': 'Space Naming Convention',
                'ifc_version': 'IFC4',
                'description': 'Spaces must follow the project naming convention.',
                'owner': alice,
                'applicability_data': {
                    'entity': {'name': 'IfcSpace'},
                },
                'requirements_data': {
                    'attribute': {
                        'name': 'Name',
                        'cardinality': 'required',
                    }
                },
            },
            {
                'name': 'Column Material',
                'ifc_version': 'IFC4',
                'description': 'All columns must have their material specified.',
                'owner': bob,
                'applicability_data': {
                    'entity': {'name': 'IfcColumn'},
                },
                'requirements_data': {
                    'material': {
                        'cardinality': 'required',
                    }
                },
            },
            {
                'name': 'Beam Profile',
                'ifc_version': 'IFC2X3',
                'description': 'Steel beams must declare their profile type.',
                'owner': carol,
                'applicability_data': {
                    'entity': {'name': 'IfcBeam'},
                    'material': {'value': 'Steel'},
                },
                'requirements_data': {
                    'attribute': {
                        'name': 'ObjectType',
                        'cardinality': 'required',
                    }
                },
            },
            {
                'name': 'Roof Waterproofing',
                'ifc_version': 'IFC4X3_ADD2',
                'description': 'Roof elements must declare waterproofing material layer.',
                'owner': alice,
                'applicability_data': {
                    'entity': {'name': 'IfcRoof'},
                },
                'requirements_data': {
                    'material': {
                        'cardinality': 'required',
                    }
                },
            },
            {
                'name': 'MEP System Classification',
                'ifc_version': 'IFC4',
                'description': 'MEP elements must be classified under Uniclass.',
                'owner': bob,
                'applicability_data': {
                    'entity': {'name': 'IfcDistributionElement'},
                },
                'requirements_data': {
                    'classification': {
                        'system': 'Uniclass2015',
                        'cardinality': 'required',
                    }
                },
            },
            {
                'name': 'Stair Riser Height',
                'ifc_version': 'IFC4',
                'description': 'Stairs must declare riser height for code compliance.',
                'owner': carol,
                'applicability_data': {
                    'entity': {'name': 'IfcStair'},
                },
                'requirements_data': {
                    'property': {
                        'propertySet': 'Pset_StairCommon',
                        'baseName': 'RiserHeight',
                        'cardinality': 'required',
                    }
                },
            },
        ]

        specs = []
        for sd in specs_data:
            spec, created = Specification.objects.get_or_create(
                name=sd['name'],
                owner=sd['owner'],
                defaults=sd,
            )
            if created:
                self.stdout.write(f'  Created specification: {spec.name}')
            specs.append(spec)

        # ------------------------------------------------------------------
        # 3. IDSs
        # ------------------------------------------------------------------
        ids_data = [
            {
                'title': 'Architectural QA Checks',
                'description': 'Quality assurance checks for architectural elements including fire rating, accessibility and naming.',
                'version': '1.0',
                'author_email': 'alice@example.com',
                'date': date(2025, 6, 15),
                'purpose': 'Design review',
                'milestone': 'Schematic Design',
                'owner': alice,
                'spec_names': [
                    'Fire Rating Required',
                    'Door Accessibility',
                    'Space Naming Convention',
                    'Roof Waterproofing',
                ],
            },
            {
                'title': 'Structural Requirements',
                'description': 'Structural engineering requirements for load-bearing and material specifications.',
                'version': '2.1',
                'author_email': 'bob@example.com',
                'date': date(2025, 9, 1),
                'purpose': 'Structural validation',
                'milestone': 'Design Development',
                'owner': bob,
                'spec_names': [
                    'Structural Load Bearing',
                    'Slab Concrete Grade',
                    'Column Material',
                    'Beam Profile',
                ],
            },
            {
                'title': 'Energy Performance',
                'description': 'Specifications ensuring elements carry the thermal and energy properties needed for simulation.',
                'version': '1.0',
                'author_email': 'carol@example.com',
                'date': date(2025, 3, 20),
                'purpose': 'Energy analysis',
                'milestone': 'Construction Documents',
                'owner': carol,
                'spec_names': [
                    'External Wall Thermal',
                    'Window U-Value',
                ],
            },
            {
                'title': 'MEP Coordination',
                'description': 'Classification and material requirements for mechanical, electrical and plumbing elements.',
                'version': '0.9',
                'author_email': 'bob@example.com',
                'date': date(2025, 11, 10),
                'purpose': 'Coordination',
                'milestone': 'Construction Documents',
                'owner': bob,
                'spec_names': [
                    'MEP System Classification',
                    'Column Material',
                ],
            },
            {
                'title': 'Code Compliance Package',
                'description': 'Full code-compliance check covering fire, accessibility and circulation.',
                'version': '3.0',
                'author_email': 'alice@example.com',
                'date': date(2026, 1, 5),
                'purpose': 'Regulatory submission',
                'milestone': 'Permit Set',
                'owner': alice,
                'spec_names': [
                    'Fire Rating Required',
                    'Door Accessibility',
                    'Stair Riser Height',
                    'Space Naming Convention',
                    'Roof Waterproofing',
                ],
            },
            {
                'title': 'Material Specification Audit',
                'description': 'Ensures all key structural and architectural elements have their materials defined.',
                'version': '1.2',
                'author_email': 'carol@example.com',
                'date': date(2025, 7, 22),
                'purpose': 'Material take-off',
                'milestone': 'Design Development',
                'owner': carol,
                'spec_names': [
                    'Column Material',
                    'Beam Profile',
                    'Slab Concrete Grade',
                    'Roof Waterproofing',
                ],
            },
        ]

        spec_map = {s.name: s for s in specs}

        for idata in ids_data:
            spec_names = idata.pop('spec_names')
            ids_obj, created = IDS.objects.get_or_create(
                title=idata['title'],
                owner=idata['owner'],
                defaults=idata,
            )
            if created:
                self.stdout.write(f'  Created IDS: {ids_obj.title}')
                for order, sname in enumerate(spec_names):
                    IDSSpecification.objects.get_or_create(
                        ids=ids_obj,
                        specification=spec_map[sname],
                        defaults={'order': order},
                    )

        self.stdout.write(self.style.SUCCESS(
            f'Done! {User.objects.count()} users, '
            f'{IDS.objects.count()} IDSs, '
            f'{Specification.objects.count()} specifications.'
        ))
