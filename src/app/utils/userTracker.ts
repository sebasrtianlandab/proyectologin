export const trackEvent = async (tipo_evento: string, detalles: any = {}) => {
    try {
        const sessionStr = localStorage.getItem('session');
        let cliente_id = null;
        let cliente_email = null;

        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            // Capturamos la identidad si existe una sesión activa
            cliente_id = session.userId;
            cliente_email = session.email;
        }

        let sesion_id = localStorage.getItem('store_guest_session');
        if (!sesion_id) {
            sesion_id = 'guest_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('store_guest_session', sesion_id);
        }

        const payload = {
            tipo_evento,
            ruta: window.location.pathname,
            detalles,
            cliente_id,
            cliente_email, // Enviamos el email
            sesion_id
        };

        const response = await fetch('http://localhost:3001/api/analytics/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.warn('No se pudo registrar el evento de analítica');
        }
    } catch (error) {
        console.error('Error enviando evento de tracking:', error);
    }
};
