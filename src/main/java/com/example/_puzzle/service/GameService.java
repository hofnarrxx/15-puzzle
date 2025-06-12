package com.example._puzzle.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;

@Service
public class GameService {
    SecretKey secretKey;
    public GameService(SecretKey secretKey){
        this.secretKey = secretKey;
    }

    public Map<String, Object> generateGame(int gridSize, Authentication auth){
        return Map.of(
            "scramble", generateShuffledPuzzle(gridSize),
            "token", generateToken(gridSize, auth)
        );
    }

    public String generateToken(int gridSize, Authentication auth){
        String token = Jwts.builder()
                .setSubject(auth.getName())
                .claim("gridSize", gridSize)
                .claim("issuedAt", System.currentTimeMillis())
                .setExpiration(new Date(System.currentTimeMillis() + 30 * 60 * 1000)) // expires in 30 min
                .signWith(secretKey)
                .compact();
        return token;
    }

    public List<Integer> generateShuffledPuzzle(int gridSize) {
        List<Integer> scramble = new ArrayList<>();
        for (int i = 1; i < gridSize * gridSize; i++)
            scramble.add(i);
        scramble.add(0);
        do {
            Collections.shuffle(scramble);
        } while (!isSolvable(scramble, gridSize));
        return scramble;
    }

    public boolean isSolvable(List<Integer> scramble, int gridSize) {
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
        // for odd: solvable if inversion count is even
        // for even: solvable if parity of inversion count does not match parity of
        // emptyTile row index
        if (gridSize % 2 == 1 && inversionCount % 2 == 0) {
            return true;
        } else if (gridSize % 2 == 0 && ((emptyRow % 2 == 0) != (inversionCount % 2 == 0))) {
            return true;
        }
        return false;
    }
}
