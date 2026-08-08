package com.clothingstore.api.controller;

import com.clothingstore.api.dto.AddressRequest;
import com.clothingstore.api.dto.AddressResponse;
import com.clothingstore.api.entity.Address;
import com.clothingstore.api.entity.User;
import com.clothingstore.api.repository.AddressRepository;
import com.clothingstore.api.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired private AddressRepository addressRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public List<AddressResponse> getAddresses(Authentication auth) {
        User user = getUser(auth);
        return addressRepository.findByUserIdOrderByIsDefaultDesc(user.getId())
                .stream().map(AddressResponse::from).collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<AddressResponse> createAddress(Authentication auth, @Valid @RequestBody AddressRequest request) {
        User user = getUser(auth);

        if (request.isDefaultAddress()) {
            clearExistingDefault(user.getId());
        }

        Address address = new Address();
        address.setUser(user);
        applyRequest(address, request);

        return ResponseEntity.ok(AddressResponse.from(addressRepository.save(address)));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<AddressResponse> updateAddress(Authentication auth, @PathVariable UUID id, @Valid @RequestBody AddressRequest request) {
        User user = getUser(auth);
        Address address = addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElse(null);

        if (address == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.isDefaultAddress() && !address.isDefault()) {
            clearExistingDefault(user.getId());
        }

        applyRequest(address, request);
        return ResponseEntity.ok(AddressResponse.from(addressRepository.save(address)));
    }

    @PatchMapping("/{id}/default")
    @Transactional
    public ResponseEntity<AddressResponse> setDefault(Authentication auth, @PathVariable UUID id) {
        User user = getUser(auth);
        Address address = addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElse(null);

        if (address == null) {
            return ResponseEntity.notFound().build();
        }

        clearExistingDefault(user.getId());
        address.setDefault(true);
        return ResponseEntity.ok(AddressResponse.from(addressRepository.save(address)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(Authentication auth, @PathVariable UUID id) {
        User user = getUser(auth);
        Address address = addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElse(null);

        if (address == null) {
            return ResponseEntity.notFound().build();
        }

        addressRepository.delete(address);
        return ResponseEntity.noContent().build();
    }

    private void clearExistingDefault(UUID userId) {
        addressRepository.findByUserIdOrderByIsDefaultDesc(userId).stream()
                .filter(Address::isDefault)
                .forEach(a -> {
                    a.setDefault(false);
                    addressRepository.save(a);
                });
    }

    private void applyRequest(Address address, AddressRequest request) {
        address.setLabel(request.getLabel());
        address.setLine1(request.getLine1());
        address.setLine2(request.getLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setDefault(request.isDefaultAddress());
    }

    private User getUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

}