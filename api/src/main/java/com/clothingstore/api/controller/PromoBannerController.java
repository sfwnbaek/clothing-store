package com.clothingstore.api.controller;

import com.clothingstore.api.entity.PromoBanner;
import com.clothingstore.api.repository.PromoBannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
public class PromoBannerController {

    @Autowired private PromoBannerRepository promoBannerRepository;

    @GetMapping
    public List<PromoBanner> getActiveBanners() {
        return promoBannerRepository.findByActiveTrueOrderByDisplayOrder();
    }

}