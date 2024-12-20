# Generated by Django 5.1.1 on 2024-12-10 14:04

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Player",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        help_text="Nombre completo del jugador", max_length=100
                    ),
                ),
                (
                    "jersey_number",
                    models.PositiveIntegerField(
                        help_text="Número de camiseta del jugador"
                    ),
                ),
                (
                    "position",
                    models.CharField(
                        choices=[
                            ("CE", "Central"),
                            ("PR", "Punta Receptor"),
                            ("AR", "Armador"),
                            ("OP", "Opuesto"),
                            ("LI", "Líbero"),
                        ],
                        help_text="Posición en la que juega el jugador",
                        max_length=2,
                    ),
                ),
                (
                    "is_starter",
                    models.BooleanField(
                        default=False, help_text="Indica si el jugador es titular"
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        default="Active",
                        help_text="Estado actual del jugador (Activo, Lesionado, etc.)",
                        max_length=50,
                    ),
                ),
                (
                    "avatar",
                    models.URLField(
                        blank=True,
                        help_text="URL del avatar del jugador. Si no se proporciona, se asignará uno por defecto según el género del equipo",
                        null=True,
                    ),
                ),
            ],
            options={
                "verbose_name": "Jugador",
                "verbose_name_plural": "Jugadores",
                "ordering": ["team", "name"],
            },
        ),
        migrations.CreateModel(
            name="Team",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        help_text="Nombre único del equipo", max_length=100, unique=True
                    ),
                ),
                (
                    "gender",
                    models.CharField(
                        choices=[("M", "Male"), ("F", "Female")],
                        help_text="Género del equipo (M: Masculino, F: Femenino)",
                        max_length=1,
                    ),
                ),
                (
                    "coach",
                    models.CharField(
                        help_text="Nombre del entrenador principal", max_length=100
                    ),
                ),
                (
                    "staff",
                    models.TextField(
                        blank=True,
                        help_text="Información adicional sobre el personal del equipo",
                    ),
                ),
            ],
            options={
                "verbose_name": "Equipo",
                "verbose_name_plural": "Equipos",
                "ordering": ["name"],
            },
        ),
    ]
