package com.example._puzzle.controller;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example._puzzle.dto.ScoreDTO;
import com.example._puzzle.model.Score;
import com.example._puzzle.service.ScoreService;

@RestController
@RequestMapping("/scores")
public class ScoreController {
    @Autowired
    private ScoreService scoreService;

    @PostMapping()
    public ResponseEntity<?> submitScore(@RequestBody ScoreDTO dto, Principal principal){
        if(principal == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
        }
        return ResponseEntity.ok(scoreService.saveScore(dto, principal));
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

    @GetMapping("/time")
    public List<Score> topByTime(@RequestParam int gridSize){
        return scoreService.getTopScoresByTime(gridSize);
    }

    @GetMapping("/moves")
    public List<Score> topByMoves(@RequestParam int gridSize){
        return scoreService.getTopScoresByMoves(gridSize);
    }
}
