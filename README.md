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

Cada persona del módulo **Personal** tiene su propio acceso (correo registrado en su ficha + contraseña demo `1234`), para que cada quien marque su propia disponibilidad desde su perfil. Además:

```
admin@quickassist.com        / 1234   (Administrador)
contabilidad@quickassist.com / 1234   (Contabilidad)
alopez@qa.com                / 1234   (Paramédico — Dr. Andrés López)
lpena@qa.com                 / 1234   (Piloto — Luis Peña)
```

Ver el correo de cualquier otra persona en el módulo Personal — todos usan la contraseña `1234`.

> Nota: el personal que se agrega desde la interfaz (botón "+ Agregar Personal") no recibe login automático todavía, porque las credenciales viven en el código (no hay backend). Para darle acceso a alguien nuevo, hay que agregarlo también a `MOCK_PERSONNEL` en `src/context/AppContext.jsx`.

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
