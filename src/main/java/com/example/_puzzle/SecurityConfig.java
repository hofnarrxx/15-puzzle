package com.example._puzzle;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // http
        //     .csrf().disable()
        //     .authorizeHttpRequests(auth -> auth
        //         .requestMatchers("/", "/static/", "/sounds/**").permitAll()
        //         .requestMatchers("/auth/**").permitAll()
        //         .anyRequest().authenticated()
        //     )
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            // .formLogin().disable()
            // .httpBasic().disable();

        return http.build();
    }
}

