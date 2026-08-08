package com.clothingstore.api.dto;

import com.clothingstore.api.entity.Address;

import java.util.UUID;

public class AddressResponse {

    private UUID id;
    private String label;
    private String line1;
    private String line2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private boolean defaultAddress;

    public static AddressResponse from(Address address) {
        AddressResponse response = new AddressResponse();
        response.id = address.getId();
        response.label = address.getLabel();
        response.line1 = address.getLine1();
        response.line2 = address.getLine2();
        response.city = address.getCity();
        response.state = address.getState();
        response.postalCode = address.getPostalCode();
        response.country = address.getCountry();
        response.defaultAddress = address.isDefault();
        return response;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getLine1() { return line1; }
    public void setLine1(String line1) { this.line1 = line1; }

    public String getLine2() { return line2; }
    public void setLine2(String line2) { this.line2 = line2; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public boolean isDefaultAddress() { return defaultAddress; }
    public void setDefaultAddress(boolean defaultAddress) { this.defaultAddress = defaultAddress; }
}