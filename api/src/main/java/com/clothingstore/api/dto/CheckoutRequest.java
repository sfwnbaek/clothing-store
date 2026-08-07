package com.clothingstore.api.dto;

import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {

    @NotBlank
    private String addressLine1;

    private String addressLine2;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String postalCode;

    @NotBlank
    private String country;

    // Getters and setters
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String v) { this.addressLine1 = v; }

    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String v) { this.addressLine2 = v; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String v) { this.postalCode = v; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
}