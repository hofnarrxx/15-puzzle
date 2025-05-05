package com.example._puzzle.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example._puzzle.model.User;
import com.example._puzzle.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder encoder;

    public void register(String username, String password){
        if(userRepository.findByUsername(username).isPresent()){
            throw new RuntimeException("Username already exists");
        }
        String hash = encoder.encode(password);
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(hash);
        userRepository.save(user);
    }

    public boolean login(String username,String password){
        Optional<User> user = userRepository.findByUsername(username);
        return user.isPresent() && encoder.matches(password, user.get().getPasswordHash());
    }
}
