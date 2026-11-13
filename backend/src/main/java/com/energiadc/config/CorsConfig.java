package com.energiadc.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Value("${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173,http://127.0.0.1:5500,http://localhost:8443,http://127.0.0.1:8443}")
    private String origins;
    @Override public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).toArray(String[]::new))
                .allowedMethods("GET", "OPTIONS").allowedHeaders("*");
    }
}
