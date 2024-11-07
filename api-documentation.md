# API Documentation

## Gestión de Equipos (Team Management)

### 1. Obtener Todos los Equipos

**Método:** GET  
**Endpoint:** `/api/teams/`

**Parámetros de consulta:**

- `page`: Número de página para paginación
- `search`: Término de búsqueda (nombre del equipo o entrenador)
- `ordering`: Campo para ordenamiento

**Ejemplos de uso:**

```http
GET /api/teams/?page=1
GET /api/teams/?search=Team
GET /api/teams/?search=John
GET /api/teams/?ordering=gender
```

**Respuesta exitosa:**

```json
{
  "count": 10,
  "next": "http://api/teams/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Team A",
      "gender": "M",
      "coach": "John Doe",
      "staff": "Assistant Coach: Jane Doe"
    }
    // ... más equipos
  ]
}
```

### 2. Crear un Nuevo Equipo

**Método:** POST  
**Endpoint:** `/api/teams/`

**Payload:**

```json
{
  "name": "Team A",
  "gender": "M",
  "coach": "John Doe",
  "staff": "Assistant Coach: Jane Doe, Physical Trainer: Mark Smith"
}
```

**Ejemplo alternativo:**

```json
{
  "name": "Team B",
  "gender": "F",
  "coach": "Sarah Lee",
  "staff": "Assistant Coach: Laura Clark"
}
```

### 3. Obtener Detalles de un Equipo

**Método:** GET  
**Endpoint:** `/api/teams/{team_id}/`

**Ejemplo:**

```http
GET /api/teams/1/
```

**Respuesta exitosa:**

```json
{
  "id": 1,
  "name": "Team A",
  "gender": "M",
  "coach": "John Doe",
  "staff": "Assistant Coach: Jane Doe",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 4. Actualizar un Equipo

**Método:** PUT  
**Endpoint:** `/api/teams/{team_id}/`

**Payload:**

```json
{
  "name": "Team A - Updated",
  "gender": "M",
  "coach": "John Doe",
  "staff": "Updated staff details"
}
```

### 5. Eliminar un Equipo

**Método:** DELETE  
**Endpoint:** `/api/teams/{team_id}/`

**Ejemplo:**

```http
DELETE /api/teams/1/
```

## Gestión de Jugadores (Player Management)

### 1. Obtener Todos los Jugadores

**Método:** GET  
**Endpoint:** `/api/teams/players/`

**Parámetros de consulta:**

- `page`: Número de página para paginación
- `search`: Término de búsqueda (nombre o posición)
- `ordering`: Campo para ordenamiento

**Ejemplos de uso:**

```http
GET /api/teams/players/?page=1
GET /api/teams/players/?search=Player
GET /api/teams/players/?search=PR
GET /api/teams/players/?ordering=jersey_number
```

**Respuesta exitosa:**

```json
{
  "count": 20,
  "next": "http://api/teams/players/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "team": 1,
      "name": "Player One",
      "jersey_number": 7,
      "position": "PR",
      "is_starter": true,
      "status": "Active"
    }
    // ... más jugadores
  ]
}
```

### 2. Crear un Nuevo Jugador

**Método:** POST  
**Endpoint:** `/api/teams/players/`

**Payload:**

```json
{
  "team": 1,
  "name": "Player One",
  "jersey_number": 7,
  "position": "PR",
  "is_starter": true,
  "status": "Active",
  "avatar": "https://cdn.icon-icons.com/icons2/2643/PNG/512/male_boy_person_people_avatar_icon_159358.png"
}
```

**Ejemplo alternativo:**

```json
{
  "team": 1,
  "name": "Player Two",
  "jersey_number": 10,
  "position": "CE",
  "is_starter": false,
  "status": "Injured"
}
```

### 3. Obtener Detalles de un Jugador

**Método:** GET  
**Endpoint:** `/api/teams/players/{player_id}/`

**Ejemplo:**

```http
GET /api/teams/players/1/
```

**Respuesta exitosa:**

```json
{
  "id": 1,
  "team": 1,
  "name": "Player One",
  "jersey_number": 7,
  "position": "PR",
  "is_starter": true,
  "status": "Active",
  "avatar": "https://cdn.icon-icons.com/icons2/2643/PNG/512/male_boy_person_people_avatar_icon_159358.png",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 4. Actualizar un Jugador

**Método:** PUT  
**Endpoint:** `/api/teams/players/{player_id}/`

**Payload:**

```json
{
  "team": 1,
  "name": "Player One Updated",
  "jersey_number": 8,
  "position": "AR",
  "is_starter": true,
  "status": "Recovered",
  "avatar": "https://cdn.icon-icons.com/icons2/2643/PNG/512/female_woman_person_people_avatar_icon_159366.png"
}
```

### 5. Eliminar un Jugador

**Método:** DELETE  
**Endpoint:** `/api/teams/players/{player_id}/`

## Gestión de Torneos (Tournament Management)

### 1. Obtener Todos los Torneos

**Método:** GET  
**Endpoint:** `/api/tournaments/`

**Ejemplo de respuesta:**

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Summer Tournament 2024",
      "start_date": "2024-06-15",
      "end_date": "2024-07-15",
      "location": "Miami Beach",
      "description": "An exciting summer tournament for the best teams.",
      "teams": [1, 2, 3]
    },
    {
      "id": 2,
      "name": "Winter Tournament 2024",
      "start_date": "2024-12-01",
      "end_date": "2024-12-31",
      "location": "Aspen",
      "description": "A thrilling winter event for top teams.",
      "teams": [4, 5, 6]
    }
  ]
}
```

### 2. Crear un Nuevo Torneo

**Método:** POST  
**Endpoint:** `/api/tournaments/`

**Payload:**

```json
{
  "name": "Summer Tournament 2024",
  "start_date": "2024-06-15",
  "end_date": "2024-07-15",
  "location": "Miami Beach",
  "description": "An exciting summer tournament for the best teams.",
  "teams": [1, 2, 3]
}
```

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | string | Nombre del torneo |
| start_date | date | Fecha de inicio (formato YYYY-MM-DD) |
| end_date | date | Fecha de finalización (formato YYYY-MM-DD) |
| location | string | Ubicación del torneo |
| description | string | Descripción opcional del torneo |
| teams | array | Lista de IDs de los equipos participantes |

### 3. Obtener un Torneo Específico

**Método:** GET  
**Endpoint:** `/api/tournaments/{tournament_id}/`

**Ejemplo de respuesta:**

```json
{
  "id": 1,
  "name": "Summer Tournament 2024",
  "start_date": "2024-06-15",
  "end_date": "2024-07-15",
  "location": "Miami Beach",
  "description": "An exciting summer tournament for the best teams.",
  "teams": [1, 2, 3]
}
```

### 4. Actualizar un Torneo

**Método:** PUT  
**Endpoint:** `/api/tournaments/{tournament_id}/`

**Payload:**

```json
{
  "name": "Summer Tournament 2024 - Updated",
  "start_date": "2024-06-15",
  "end_date": "2024-07-20",
  "location": "Orlando",
  "description": "Updated tournament location and details.",
  "teams": [1, 2, 3, 4]
}
```

### 5. Eliminar un Torneo

**Método:** DELETE  
**Endpoint:** `/api/tournaments/{tournament_id}/`

## Resumen de Endpoints

### Gestión de Equipos (Team)

| Método | Endpoint                | Descripción                                                        |
| ------ | ----------------------- | ------------------------------------------------------------------ |
| GET    | `/api/teams/`           | Obtener todos los equipos con paginación, búsqueda y ordenamiento. |
| POST   | `/api/teams/`           | Crear un nuevo equipo.                                             |
| GET    | `/api/teams/{team_id}/` | Obtener los detalles de un equipo específico.                      |
| PUT    | `/api/teams/{team_id}/` | Actualizar un equipo existente.                                    |
| DELETE | `/api/teams/{team_id}/` | Eliminar un equipo específico.                                     |

### Gestión de Jugadores (Players)

| Método | Endpoint                          | Descripción                                                          |
| ------ | --------------------------------- | -------------------------------------------------------------------- |
| GET    | `/api/teams/players/`             | Obtener todos los jugadores con paginación, búsqueda y ordenamiento. |
| POST   | `/api/teams/players/`             | Crear un nuevo jugador.                                              |
| GET    | `/api/teams/players/{player_id}/` | Obtener los detalles de un jugador específico.                       |
| PUT    | `/api/teams/players/{player_id}/` | Actualizar los detalles de un jugador.                               |
| DELETE | `/api/teams/players/{player_id}/` | Eliminar un jugador específico.                                      |

### Gestión de Torneos (Tournaments)

| Método | Endpoint                            | Descripción                                   |
| ------ | ----------------------------------- | --------------------------------------------- |
| GET    | `/api/tournaments/`                 | Obtener todos los torneos.                    |
| POST   | `/api/tournaments/`                 | Crear un nuevo torneo.                        |
| GET    | `/api/tournaments/{tournament_id}/` | Obtener los detalles de un torneo específico. |
| PUT    | `/api/tournaments/{tournament_id}/` | Actualizar un torneo existente.               |
| DELETE | `/api/tournaments/{tournament_id}/` | Eliminar un torneo específico.                |

## Gestión de Partidos (Match Management)

### 1. Crear un Nuevo Partido

**Método:** POST  
**Endpoint:** `/api/matches/`

**Payload:**

```json
{
  "tournament": 1,
  "team_a": 1,
  "team_b": 2,
  "scheduled_date": "2024-11-10T15:00:00Z",
  "location": "Estadio Central"
}
```

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| tournament_id | integer | ID del torneo al que pertenece el partido |
| team_a_id | integer | ID del equipo A |
| team_b_id | integer | ID del equipo B |
| scheduled_date | datetime | Fecha y hora programada (formato ISO) |
| location | string | Lugar del partido |

### 2. Obtener Todos los Partidos

**Método:** GET  
**Endpoint:** `/api/matches/`

**Parámetros de consulta:**

- `tournament`: Filtrar por torneo
- `status`: Filtrar por estado del partido
- `team`: Filtrar por equipo participante

**Ejemplo de respuesta:**

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "tournament_id": 1,
      "team_a_id": 1,
      "team_b_id": 2,
      "scheduled_date": "2024-11-10T15:00:00Z",
      "location": "Estadio Central",
      "status": "upcoming",
      "weather_conditions": {
        "temperature": 22,
        "conditions": "clear"
      }
    }
  ]
}
```

### 3. Obtener Detalles de un Partido

**Método:** GET  
**Endpoint:** `/api/matches/{match_id}/`

### 4. Actualizar un Partido

**Método:** PUT  
**Endpoint:** `/api/matches/{match_id}/`

**Payload:**

```json
{
  "scheduled_date": "2024-11-15T18:00:00Z",
  "location": "Estadio Alternativo"
}
```

### 5. Eliminar un Partido

**Método:** DELETE  
**Endpoint:** `/api/matches/{match_id}/`

### 6. Iniciar un Partido

**Método:** DELETE  
**Endpoint:** `/api/matches/{match_id}/start/`

### 7. Registrar Rendimiento de Jugador

**Método:** PATCH  
**Endpoint:** `/api/matches/{match_id}/performance/`

**Payload Ejemplo 1:**

```json
{
  "player_id": 1,
  "set_number": 1, // Usar set_number en lugar de set_id
  "points": 1,
  "aces": 1  // blocks , aces, assists 
}
```

**Payload Ejemplo 2:**

```json
{
  "player_id": 1,
  "set_id": 1,
  "points": 2,
  "blocks": 1
}
```

### 7. Realizar Sustitución de Jugadores

**Método:** POST  
**Endpoint:** `/api/matches/{match_id}/substitute/`

**Payload:**

```json
{
  "player_in": 2,
  "player_out": 3,
  "team": "A"
}
```

### 8. Registrar Tiempo Fuera

**Método:** POST  
**Endpoint:** `/api/matches/{match_id}/timeout/`

**Payload:**

```json
{
  "team": "A"
}
```

## Resumen de Endpoints

### Gestión de Partidos (Matches)

| Método | Endpoint                               | Descripción                                 |
| ------ | -------------------------------------- | ------------------------------------------- |
| GET    | `/api/matches/`                        | Obtener todos los partidos con filtros.     |
| POST   | `/api/matches/`                        | Crear un nuevo partido.                     |
| GET    | `/api/matches/{match_id}/`             | Obtener detalles de un partido específico.  |
| PUT    | `/api/matches/{match_id}/`             | Actualizar un partido existente.            |
| DELETE | `/api/matches/{match_id}/`             | Eliminar un partido específico.             |
| PATCH  | `/api/matches/{match_id}/performance/` | Registrar rendimiento de jugador en un set. |
| POST   | `/api/matches/{match_id}/substitute/`  | Realizar sustitución de jugadores.          |
| POST   | `/api/matches/{match_id}/timeout/`     | Registrar tiempo fuera.                     |

## Reglas y Validaciones

### Sustituciones

- Cada equipo tiene un número limitado de sustituciones por set.
- No se pueden realizar sustituciones durante un tiempo fuera.
- El jugador que sale debe estar actualmente en el juego.

### Tiempos Fuera

- Máximo 2 tiempos fuera por equipo por set.
- No se pueden solicitar tiempos fuera durante una sustitución.
- El temporizador se activa automáticamente al registrar el tiempo fuera.

### Rendimiento

- Los puntos se suman automáticamente al marcador del equipo.
- El set se marca como completo al alcanzar el puntaje de finalización.
- Se valida que el jugador pertenezca a uno de los equipos del partido.

[Previous sections remain the same...]

## Códigos de Estado HTTP

| Código | Descripción                    |
| ------ | ------------------------------ |
| 200    | Solicitud exitosa              |
| 201    | Recurso creado exitosamente    |
| 204    | Recurso eliminado exitosamente |
| 400    | Solicitud incorrecta           |
| 404    | Recurso no encontrado          |
| 500    | Error interno del servidor     |
