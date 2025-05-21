# Minka Admin Dashboard Features

## Nuevas Características Administrativas

Hemos implementado un conjunto de características administrativas mejoradas para la plataforma Minka, diseñadas para proporcionar un mayor control, visibilidad y eficiencia para los administradores.

### 1. Análisis y Estadísticas

La sección de análisis proporciona una visión completa del rendimiento de la plataforma a través de:

- **Métricas clave**: Visualización de usuarios totales, campañas, donaciones e interacciones.
- **Gráficos interactivos**: Análisis visual de tendencias de donaciones, actividad de usuarios y distribución de campañas.
- **Análisis segmentado**: Pestañas separadas para analizar campañas, donaciones y usuarios.
- **Filtros por tiempo**: Selección de períodos (semana, mes, año) para analizar métricas en diferentes intervalos.

Ruta: `/dashboard/analytics`

### 2. Verificación de Campañas

El sistema de verificación de campañas permite a los administradores:

- **Revisar solicitudes**: Ver todas las solicitudes de verificación pendientes, aprobadas y rechazadas.
- **Examinar documentación**: Revisar documentos de identidad y materiales de respaldo proporcionados por los organizadores.
- **Verificar detalles**: Evaluar la historia de la campaña, información de contacto y referencias.
- **Aprobar o rechazar**: Procesar solicitudes con notas administrativas para mantener un registro de decisiones.
- **Seguimiento**: Visualizar estadísticas de estado de verificación de todas las campañas.
- **Revocar verificación**: Los super administradores pueden revocar la verificación de campañas previamente aprobadas si surgen problemas.
  - Disponible tanto en la vista detallada de verificación (`/dashboard/verification`) como en la tabla de gestión de campañas (`/dashboard/campaigns`).
- **Búsqueda avanzada**: Buscar campañas específicas por nombre, organizador o ID para facilitar la gestión.

Ruta: `/dashboard/verification`

### 3. Gestión de Campañas

La gestión centralizada de campañas permite a los administradores:

- **Ver todas las campañas**: Acceso a una vista tabular de todas las campañas en la plataforma.
- **Verificar/Revocar verificación**: Los administradores pueden verificar campañas directamente desde la tabla de campañas. Los super administradores pueden también revocar verificaciones existentes.
- **Editar detalles**: Acceso rápido a la edición de cualquier campaña.
- **Visualizar estados**: Ver el estado de todas las campañas (activas, borrador, completadas) y su verificación.

Ruta: `/dashboard/campaigns`

### 4. Gestión de Notificaciones

El sistema de notificaciones permite a los administradores:

- **Enviar actualizaciones**: Notificar a los usuarios sobre novedades y cambios en la plataforma.
- **Segmentación de audiencia**: Dirigir mensajes específicos a donadores, organizadores o todos los usuarios.
- **Usar plantillas**: Acceder a plantillas predefinidas para agilizar la comunicación.
- **Seguimiento de envíos**: Ver historial completo de notificaciones enviadas con estadísticas de alcance.
- **Métricas de suscripción**: Monitorear cuántos usuarios están suscritos a los diferentes tipos de notificaciones.

Ruta: `/dashboard/notifications/admin`

## Guía de Implementación

### Requisitos técnicos

Para un funcionamiento óptimo, asegúrese de:

1. Tener permisos de administrador en la plataforma.
2. Contar con las tablas correspondientes en la base de datos Supabase:
   - `campaign_verifications`
   - `notification_preferences`
   - `sent_notifications` (por implementar)
   - `notification_templates` (por implementar)

### Consideraciones para desarrollo futuro

- **API de notificaciones**: Desarrollar endpoints dedicados para enviar notificaciones a través de diferentes canales (email, push, en-app).
- **Documentación avanzada**: Implementar un sistema de gestión documental para almacenar y organizar los documentos de verificación de forma segura.
- **Analytics mejorado**: Integrar con herramientas de análisis avanzado para obtener insights más profundos sobre el comportamiento de los usuarios.

## Flujo de trabajo para la verificación de campañas

1. El organizador envía una solicitud de verificación desde su panel de campaña.
2. El administrador recibe la solicitud en el panel de verificación.
3. El administrador revisa los documentos y detalles proporcionados.
4. El administrador aprueba o rechaza la solicitud, añadiendo notas si es necesario.
5. El sistema actualiza automáticamente el estado de verificación de la campaña.
6. El organizador recibe una notificación con el resultado del proceso.

## Gestión de verificaciones existentes

Los super administradores tienen la capacidad de revocar la verificación de campañas previamente aprobadas cuando:

1. Se descubren irregularidades en la campaña
2. Hay cambios significativos en el contenido o propósito de la campaña
3. La verificación fue concedida por error
4. Se requiere una nueva revisión de documentación

Esta funcionalidad está disponible en dos ubicaciones:

1. **Vista de Verificación**: En la página detallada de verificación, al revisar solicitudes aprobadas.
2. **Tabla de Campañas**: Directamente desde la tabla de gestión de campañas, mediante el botón "Revocar" para campañas verificadas.

Al revocar una verificación:

- Se elimina el distintivo de verificación visible para los usuarios
- Se cambia el estado de verificación en la base de datos
- Se muestra una advertencia clara sobre las implicaciones de esta acción
- Se requiere confirmación del super administrador

Esta funcionalidad está restringida a super administradores y debe utilizarse con precaución.

## Seguridad y privacidad

Todos los documentos sensibles enviados para verificación deben:

- Almacenarse de forma segura con cifrado adecuado
- Tener acceso restringido solo a administradores autorizados
- Eliminarse después de un período determinado según la política de retención de datos

---

Para cualquier consulta sobre estas características, contactar al equipo de desarrollo.
