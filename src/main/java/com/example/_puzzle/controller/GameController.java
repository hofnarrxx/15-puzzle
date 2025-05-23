package com.example._puzzle.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.jsonwebtoken.Jwts;

@RestController
@RequestMapping("/game")
public class GameController {

    private final SecretKey secretKey;
    public GameController(SecretKey secretKey){
        this.secretKey = secretKey;
    }

    @GetMapping("/start/{gridSize}")
    public Map<String, Object> startGame(@PathVariable int gridSize, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        List<Integer> scramble = generateShuffledPuzzle(gridSize);
        System.out.println(scramble);
        String token = Jwts.builder()
                .setSubject(auth.getName())
                .claim("gridSize", gridSize)
                .claim("issuedAt", System.currentTimeMillis())
                .setExpiration(new Date(System.currentTimeMillis() + 30 * 60 * 1000)) // expires in 30 min
                .signWith(secretKey)
                .compact();
        return Map.of(
            "scramble", scramble,
            "token", token
        );
    }

    private List<Integer> generateShuffledPuzzle(int gridSize) {
        List<Integer> scramble = new ArrayList<>();
        for (int i = 1; i < gridSize*gridSize; i++) scramble.add(i);
        scramble.add(0);
        do{
            Collections.shuffle(scramble);
        }
        while(!isSolvable(scramble, gridSize));
        return scramble;
    }

    private boolean isSolvable(List<Integer> scramble, int gridSize) {
        int inversionCount = 0;
        int emptyRow = 0;

        for (int i = 0; i < scramble.size(); i++) {
            if (scramble.get(i) == 0) {
                emptyRow = (int) Math.floor(i / gridSize);
                continue;
            }

            for (int j = i + 1; j < scramble.size(); j++) {
                if (scramble.get(j) != 0 && scramble.get(i) > scramble.get(j)) {
                    inversionCount++;
                }
            }
        }
        //for odd: solvable if inversion count is even
        //for even: solvable if parity of inversion count does not match parity of emptyTile row index
        if (gridSize % 2 == 1 && inversionCount % 2 == 0) {
            return true;
        }
        else if (gridSize % 2 == 0 && ((emptyRow % 2 == 0) != (inversionCount % 2 == 0))) {
            return true;
        }
        return false;
    }
}
