package com.example._puzzle.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example._puzzle.service.UserService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String,String> body){
        try{
            userService.register(body.get("username"), body.get("password"));
            return ResponseEntity.ok("User registered");
        } catch(RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> body, HttpSession session){
        boolean success = userService.login(body.get("username"), body.get("password"));
        if(success){
            session.setAttribute("username", body.get("username"));
            return ResponseEntity.ok("Login successful");
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session){
        session.invalidate();
        return ResponseEntity.ok("Logged out");
    }
}
