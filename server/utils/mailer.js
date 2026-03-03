import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export const sendQuoteEmail = async ({ to, customerName, items, total }) => {
    try {
        let itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.nombre}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.precio.toFixed(2)}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"VIISION Store" <${process.env.GMAIL_USER}>`,
            to,
            subject: `Confirmación de Cotización / Pedido - VIISION`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                    <h2 style="color: #333; text-align: center; text-transform: uppercase; letter-spacing: 2px;">VIISION</h2>
                    <p style="font-size: 16px; color: #555;">Hola <strong>${customerName}</strong>,</p>
                    <p style="font-size: 16px; color: #555;">Hemos recibido tu solicitud de pedido/cotización. Aquí están los detalles:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <thead>
                            <tr style="background-color: #f9f9f9; text-align: left;">
                                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Producto</th>
                                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style="padding: 10px; font-weight: bold; text-align: right;">Total:</td>
                                <td style="padding: 10px; font-weight: bold;">$${total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <p style="font-size: 14px; color: #777; margin-top: 30px; text-align: center;">
                        Nuestro equipo se pondrá en contacto contigo pronto para finalizar el pago y el envío.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">© 2026 VIISION Studios.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado! URL:', nodemailer.getTestMessageUrl(info) || info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando correo de cotización:', error);
        throw error;
    }
};
