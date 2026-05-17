package com.sje.restnova.services;

import com.sje.restnova.entities.Reserva;
import com.sje.restnova.entities.Usuario;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendRegistrationEmail(Usuario usuario) {
        String subject = "¡Bienvenido a Restnova!";
        String content = String.format(
            "<html>" +
            "<body>" +
            "<h2>Hola %s,</h2>" +
            "<p>¡Gracias por registrarte en Restnova! Tu cuenta ha sido creada con éxito.</p>" +
            "<p>Ya puedes disfrutar de nuestras mejores ofertas y realizar tus reservas online.</p>" +
            "<br>" +
            "<p>Saludos,<br>El equipo de Restnova</p>" +
            "</body>" +
            "</html>",
            usuario.getNombre()
        );

        sendHtmlEmail(usuario.getEmail(), subject, content);
    }

    @Async
    public void sendReservationEmail(Reserva reserva) {
        if (reserva.getUsuario() == null) return;

        String subject = "Reserva Recibida - Restnova";
        String statusText = reserva.getEstado() == Reserva.EstadoReserva.CONFIRMADA ? "confirmada" : "recibida y está pendiente de confirmación";
        
        String content = String.format(
            "<html>" +
            "<body style='font-family: Arial, sans-serif; color: #333;'>" +
            "<div style='max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;'>" +
            "<h2 style='color: #040833;'>Hola %s,</h2>" +
            "<p>Tu solicitud de reserva en <strong>Restnova</strong> ha sido %s:</p>" +
            "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
            "<ul style='list-style: none; padding: 0;'>" +
            "<li><strong>Fecha:</strong> %s</li>" +
            "<li><strong>Hora:</strong> %s</li>" +
            "<li><strong>Comensales:</strong> %d</li>" +
            "</ul>" +
            "</div>" +
            "<p>Te avisaremos en cuanto el estado de tu reserva cambie.</p>" +
            "<br>" +
            "<p>Saludos,<br>El equipo de Restnova</p>" +
            "</div>" +
            "</body>" +
            "</html>",
            reserva.getUsuario().getNombre(),
            statusText,
            reserva.getFecha().toString(),
            reserva.getHora().toString(),
            reserva.getNumPersonas()
        );

        sendHtmlEmail(reserva.getUsuario().getEmail(), subject, content);
    }

    @Async
    public void sendReservationStatusEmail(Reserva reserva) {
        if (reserva.getUsuario() == null) return;

        String subject = "Actualización de tu Reserva - Restnova";
        String statusMsg = "";
        
        switch (reserva.getEstado()) {
            case CONFIRMADA:
                statusMsg = "¡Buenas noticias! Tu reserva ha sido <strong>CONFIRMADA</strong>. Te esperamos.";
                break;
            case CANCELADA:
                statusMsg = "Te informamos que tu reserva ha sido <strong>CANCELADA</strong>.";
                break;
            case COMPLETADA:
                statusMsg = "Gracias por visitarnos. Tu reserva ha sido marcada como <strong>COMPLETADA</strong>.";
                break;
            default:
                return;
        }

        String content = String.format(
            "<html>" +
            "<body style='font-family: Arial, sans-serif; color: #333;'>" +
            "<div style='max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;'>" +
            "<h2 style='color: #040833;'>Hola %s,</h2>" +
            "<p>%s</p>" +
            "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
            "<p>Detalles de la reserva:</p>" +
            "<ul style='list-style: none; padding: 0;'>" +
            "<li><strong>Fecha:</strong> %s</li>" +
            "<li><strong>Hora:</strong> %s</li>" +
            "</ul>" +
            "</div>" +
            "<br>" +
            "<p>Saludos,<br>El equipo de Restnova</p>" +
            "</div>" +
            "</body>" +
            "</html>",
            reserva.getUsuario().getNombre(),
            statusMsg,
            reserva.getFecha().toString(),
            reserva.getHora().toString()
        );

        sendHtmlEmail(reserva.getUsuario().getEmail(), subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String content) {
        if (to == null || to.trim().isEmpty()) {
            log.error("No se puede enviar email: destinatario nulo o vacío para el asunto: {}", subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            
            mailSender.send(message);
            log.info("Email enviado con éxito a: {}", to);
        } catch (Exception e) {
            log.error("Error al enviar email a {}: {}", to, e.getMessage());
        }
    }
}
