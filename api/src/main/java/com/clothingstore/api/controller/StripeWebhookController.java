package com.clothingstore.api.controller;

import com.clothingstore.api.entity.Order;
import com.clothingstore.api.entity.WebhookEvent;
import com.clothingstore.api.repository.OrderRepository;
import com.clothingstore.api.repository.PaymentRepository;
import com.clothingstore.api.repository.WebhookEventRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/webhooks")
public class StripeWebhookController {

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Autowired private PaymentRepository paymentRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private WebhookEventRepository webhookEventRepository;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        // Idempotency: Stripe may send the same event more than once.
        // If we've already processed this exact event ID, just acknowledge and skip.
        if (webhookEventRepository.existsByProviderEventId(event.getId())) {
            return ResponseEntity.ok("Already processed");
        }

        WebhookEvent record = new WebhookEvent();
        record.setProviderEventId(event.getId());
        record.setEventType(event.getType());
        record.setProcessedAt(LocalDateTime.now());
        webhookEventRepository.save(record);

        Optional<StripeObject> stripeObject = event.getDataObjectDeserializer().getObject();

        if (stripeObject.isPresent() && stripeObject.get() instanceof PaymentIntent intent) {
            switch (event.getType()) {
                case "payment_intent.succeeded" -> handlePaymentSuccess(intent);
                case "payment_intent.payment_failed" -> handlePaymentFailure(intent);
                default -> { /* ignore other event types */ }
            }
        }

        return ResponseEntity.ok("Received");
    }

    private void handlePaymentSuccess(PaymentIntent intent) {
        paymentRepository.findAll().stream()
                .filter(p -> intent.getId().equals(p.getProviderPaymentId()))
                .findFirst()
                .ifPresent(payment -> {
                    payment.setStatus("SUCCEEDED");
                    payment.setProcessedAt(LocalDateTime.now());
                    paymentRepository.save(payment);

                    Order order = payment.getOrder();
                    order.setStatus("PAID");
                    orderRepository.save(order);
                });
    }

    private void handlePaymentFailure(PaymentIntent intent) {
        paymentRepository.findAll().stream()
                .filter(p -> intent.getId().equals(p.getProviderPaymentId()))
                .findFirst()
                .ifPresent(payment -> {
                    payment.setStatus("FAILED");
                    payment.setProcessedAt(LocalDateTime.now());
                    paymentRepository.save(payment);

                    Order order = payment.getOrder();
                    order.setStatus("PAYMENT_FAILED");
                    orderRepository.save(order);
                });
    }

}