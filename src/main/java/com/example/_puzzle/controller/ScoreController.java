package com.example._puzzle.controller;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;

import javax.crypto.SecretKey;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example._puzzle.dto.ScoreDTO;
import com.example._puzzle.model.Score;
import com.example._puzzle.service.ScoreService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

@RestController
@RequestMapping("/scores")
public class ScoreController {
    private ScoreService scoreService;
    private final SecretKey secretKey;

    public ScoreController(ScoreService scoreService, SecretKey secretKey) {
        this.scoreService = scoreService;
        this.secretKey = secretKey;
    }

    @PostMapping()
    public ResponseEntity<?> submitScore(@RequestBody ScoreDTO score, Principal principal){
        if(principal == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
        }
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(score.getToken())
                .getBody();

            String user = claims.getSubject();
            int gridSize = (int) claims.get("gridSize");

            if (!user.equals(principal.getName()) || gridSize != score.getGridSize()) {
                return ResponseEntity.badRequest().body("Invalid token data");
            }
            return ResponseEntity.ok(scoreService.saveScore(score, principal));
        } 
        catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired token");
        }
    }

    @GetMapping("/personal-best/{gridSize}")
    public ResponseEntity<List<Score>> bestForUser(@PathVariable int gridSize, Principal principal){
        try{
            List<Score> topScores = scoreService.getUserTopScoreByTimeAndGridSize(principal,gridSize);
            return ResponseEntity.ok(topScores);
        } catch (NoSuchElementException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        }
    }

    @GetMapping("/time/{gridSize}")
    public List<Score> topByTime(@PathVariable int gridSize){
        return scoreService.getTopScoresByTime(gridSize);
    }

    @GetMapping("/moves/{gridSize}")
    public List<Score> topByMoves(@PathVariable int gridSize){
        return scoreService.getTopScoresByMoves(gridSize);
    }
}
