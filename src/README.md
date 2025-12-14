# MaurerCheck

Lernplattform für Maurerlehrlinge in der Schweiz.

## Features

- **Lernende**: Täglicher Rapport, Selbstbewertung, Dashboard mit Fortschritt
- **Berufsbildner**: Lernende verwalten, Codes erstellen, Feedback geben
- **Admin**: Berufsbildner-Accounts verwalten

## Setup

1. `npm install` - Abhängigkeiten installieren
2. `npm run dev` - Entwicklungsserver starten
3. `npm run build` - Produktions-Build erstellen

## Firebase Setup

Die App benötigt folgende Firebase Collections:
- `admins` - Admin-Benutzer
- `berufsbildner` - Berufsbildner-Accounts
- `lernende` - Lernende
- `rapporte` - Tagesrapporte

### Erster Admin erstellen

Erstelle in Firebase Console > Firestore einen Eintrag in der Collection `admins`:
```
{
  username: "admin",
  password: "admin123",
  name: "Administrator"
}
```

## Tech Stack

- React 18
- Firebase (Firestore)
- Tailwind CSS
- Vite
