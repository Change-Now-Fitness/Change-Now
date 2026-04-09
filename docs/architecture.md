# Design Pattern / Principle: Separation of Concerns Through an MVC-Style Architecture

This project applies the **software engineering principle of separation of concerns** through an **MVC-style architecture**.

This is a meaningful application because the **frontend screens**, **backend request-handling logic**, and **PostgreSQL data layer** each have a distinct responsibility. The exercise and workout features depend on these layers working together while remaining **loosely coupled**.

---

## View Layer

The **View layer** is responsible for presenting data and collecting user input.

For example:

* `frontend/app/(tabs)/exerciselibrary.tsx`
* `frontend/app/screens/selectedexercise.tsx`

These components:

* load exercise data
* manage screen state
* filter exercises for display
* open the custom exercise modal
* collect user input for new exercises
* render workout history and graphs
* collect weight and repetition data

The View layer **does not directly access PostgreSQL**.

Instead, all network communication is delegated to:

```text id="k92f1z"
frontend/lib/api.ts
```

This separation ensures that UI logic remains independent of backend and database implementation.

---

## Controller Layer

The **Controller layer** receives requests, validates them, and applies application rules.

Primary controller files include:

```text id="6mk4j0"
backend/routes/exerciseRoutes.js
backend/controllers/exerciseController.js
backend/routes/workouts.js
```

Responsibilities include:

* validating `userId`
* validating exercise names
* validating `weight` and `reps`
* parsing exercise identifiers
* filtering and sorting exercise results
* preventing duplicate custom exercises
* formatting JSON responses
* grouping workout history by date

For example, when a user adds a custom exercise, the controller validates the request and prevents duplicate entries before insertion.

---

## Model Layer

The **Model layer** is responsible for persistence and database structure.

Primary model/data-layer files include:

```text id="0vtmzd"
backend/dbconnection.js
backend/services/exerciseCatalog.js
```

Responsibilities include:

* maintaining PostgreSQL connection pooling
* creating and updating exercise-related tables
* enforcing uniqueness constraints
* synchronizing normalized exercise data
* managing template exercise persistence

This layer isolates database structure from business logic and UI rendering.

---

## Why This Is a Meaningful Application

This is more than simply labeling folders as MVC.

A single user action clearly crosses all three layers.

### Example: Add Custom Exercise

### 1. View

The user enters:

* `name`
* `type`
* `muscleGroup`

through:

```text id="5my22u"
frontend/app/(tabs)/exerciselibrary.tsx
```

The screen sends the request using:

```text id="kfqov3"
frontend/lib/api.ts
```

---

### 2. Controller

The request is received by:

```text id="crj9kr"
backend/controllers/exerciseController.js
```

The controller:

* validates inputs
* checks for duplicates
* applies application rules
* formats the response

---

### 3. Model

The validated request is then persisted through the database layer:

```text id="b8vpkj"
backend/services/exerciseCatalog.js
```

This layer enforces:

* table structure
* uniqueness rules
* normalized data persistence

---

Because responsibilities are separated in this way:

* UI changes do not require SQL rewrites
* database changes do not require frontend redesign
* backend validation rules remain centralized

This improves **maintainability, scalability, and team collaboration**, making it a strong and meaningful application of separation of concerns through an MVC-style architecture.
