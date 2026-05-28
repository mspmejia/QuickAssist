# Quick Assist 🚑

Sistema de Gestión Paramédica para cobertura de eventos de gran afluencia.

## Módulos

| Módulo | Descripción |
|--------|-------------|
| 🏠 Dashboard | Resumen ejecutivo, próximos eventos, alertas |
| 📅 Eventos | Calendario y lista de eventos, inscripción (evento, montaje, desmontaje), asignación de personal |
| ✚ Fichas de Atención | Registro paramédico de pacientes, signos vitales, tratamiento, traslado en ambulancia |
| 👥 Personal | Paramédicos, pilotos, administración, contabilidad, inventario |
| 📦 Inventario | Equipos, insumos y medicamentos con alertas de stock |
| 💰 Contabilidad | Registro de ingresos y egresos por evento |
| 📊 Reportería | KPIs, gráficas por tipo de evento, personal, inventario |

## Niveles de acceso

- **Administrador** — Acceso total
- **Contabilidad** — Finanzas, personal, reportes
- **Paramédico** — Eventos, fichas de atención, inventario
- **Piloto** — Eventos
- **Inventario** — Inventario

## Credenciales de prueba

```
admin@quickassist.com / 1234
contabilidad@quickassist.com / 1234
paramedic@quickassist.com / 1234
piloto@quickassist.com / 1234
```

## Instalación

```bash
npm install
npm start
```

## Tecnologías

- React 18 + React Router 6
- Recharts (gráficas)
- date-fns (fechas)
- CSS Variables (diseño institucional: rojo, negro, blanco)

## Colores institucionales

```css
--red:   #CC0000
--black: #0A0A0A
--white: #FFFFFF
```
