package com.example._puzzle.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example._puzzle.dto.ScoreDTO;
import com.example._puzzle.model.Score;
import com.example._puzzle.model.User;
import com.example._puzzle.repository.ScoreRepository;

@Service
public class ScoreService {
    @Autowired
    private ScoreRepository scoreRepository;

    public Score saveScore(ScoreDTO dto, User user){
        Score score = new Score();
        score.setUser(user);
        score.setGridSize(dto.gridSize());
        score.setSolveTime(dto.time());
        score.setMoves(dto.moves());
        return scoreRepository.save(score);
    }

    public List<Score> getTopScoresByTime(int gridSize) {
        return scoreRepository.findTop100ByGridSizeOrderBySolveTimeAsc(gridSize);
    }

    public List<Score> getTopScoresByMoves(int gridSize) {
        return scoreRepository.findTop100ByGridSizeOrderByMovesAsc(gridSize);
    }
}
