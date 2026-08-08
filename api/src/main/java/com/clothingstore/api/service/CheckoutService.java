package com.clothingstore.api.service;

import com.clothingstore.api.dto.CheckoutRequest;
import com.clothingstore.api.entity.*;
import com.clothingstore.api.repository.*;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class CheckoutService {

    @Autowired private CartRepository cartRepository;
    @Autowired private ProductVariantRepository variantRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private CouponService couponService;

    @Transactional
    public CheckoutResult checkout(User user, CheckoutRequest request) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            ProductVariant variant = variantRepository.findById(cartItem.getVariant().getId())
                    .orElseThrow(() -> new IllegalStateException("Variant not found"));

            if (variant.getStockQty() < cartItem.getQuantity()) {
                throw new IllegalStateException(
                    "Insufficient stock for " + variant.getProduct().getName() + " (size " + variant.getSize() + ")"
                );
            }

            variant.setStockQty(variant.getStockQty() - cartItem.getQuantity());
            variantRepository.save(variant);

            BigDecimal unitPrice = variant.getPriceOverride() != null
                    ? variant.getPriceOverride()
                    : variant.getProduct().getBasePrice();

            OrderItem orderItem = new OrderItem();
            orderItem.setVariant(variant);
            orderItem.setProductName(variant.getProduct().getName());
            orderItem.setSize(variant.getSize());
            orderItem.setColor(variant.getColor());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(unitPrice);
            orderItems.add(orderItem);

            subtotal = subtotal.add(unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        // Apply coupon, if provided
        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon appliedCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            appliedCoupon = couponService.validateCoupon(request.getCouponCode());
            discountAmount = couponService.calculateDiscount(appliedCoupon, subtotal);
        }

        BigDecimal discountedSubtotal = subtotal.subtract(discountAmount);
        BigDecimal shippingCost = BigDecimal.valueOf(9.99);
        BigDecimal tax = discountedSubtotal.multiply(BigDecimal.valueOf(0.08));
        BigDecimal total = discountedSubtotal.add(shippingCost).add(tax);

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PENDING");
        order.setShippingAddressLine1(request.getAddressLine1());
        order.setShippingAddressLine2(request.getAddressLine2());
        order.setShippingCity(request.getCity());
        order.setShippingState(request.getState());
        order.setShippingPostalCode(request.getPostalCode());
        order.setShippingCountry(request.getCountry());
        order.setSubtotal(subtotal);
        order.setShippingCost(shippingCost);
        order.setTax(tax);
        order.setTotal(total);
        order.setDiscountAmount(discountAmount);
        if (appliedCoupon != null) {
            order.setCouponCode(appliedCoupon.getCode());
        }

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        if (appliedCoupon != null) {
            couponService.recordUsage(appliedCoupon);
        }

        String clientSecret;
        try {
            long amountInCents = total.multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("usd")
                    .putMetadata("orderId", savedOrder.getId().toString())
                    .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                            .setEnabled(true)
                            .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                            .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            clientSecret = intent.getClientSecret();

            Payment payment = new Payment();
            payment.setOrder(savedOrder);
            payment.setProvider("stripe");
            payment.setProviderPaymentId(intent.getId());
            payment.setAmount(total);
            payment.setStatus("PENDING");
            paymentRepository.save(payment);

        } catch (StripeException e) {
            throw new IllegalStateException("Payment setup failed: " + e.getMessage());
        }

        cart.getItems().clear();
        cartRepository.save(cart);

        return new CheckoutResult(savedOrder, clientSecret);
    }

    public static class CheckoutResult {
        private final Order order;
        private final String clientSecret;

        public CheckoutResult(Order order, String clientSecret) {
            this.order = order;
            this.clientSecret = clientSecret;
        }

        public Order getOrder() { return order; }
        public String getClientSecret() { return clientSecret; }
    }

}