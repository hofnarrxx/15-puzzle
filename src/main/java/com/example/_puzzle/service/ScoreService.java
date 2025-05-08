package com.example._puzzle.service;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example._puzzle.dto.ScoreDTO;
import com.example._puzzle.model.Score;
import com.example._puzzle.model.User;
import com.example._puzzle.repository.ScoreRepository;
import com.example._puzzle.repository.UserRepository;

@Service
public class ScoreService {
    @Autowired
    private ScoreRepository scoreRepository;
    @Autowired
    private UserRepository userRepository;

    public Score saveScore(ScoreDTO dto, Principal principal){
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Score score = new Score();
        score.setUser(user);
        score.setGridSize(dto.gridSize());
        score.setSolveTime(dto.time());
        score.setMoves(dto.moves());
        return scoreRepository.save(score);
    }

    public List<Score> getUserTopScoreByTimeAndGridSize(Principal principal, int gridSize){
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Optional<Score> optBestTime = scoreRepository.findFirstByUserIdAndGridSizeOrderBySolveTimeAsc(user.getId(), gridSize);
        Optional<Score> optBestMoves = scoreRepository.findFirstByUserIdAndGridSizeOrderByMovesAsc(user.getId(), gridSize);
        List<Score> result = new ArrayList<>();
        Score bestTime = optBestTime.orElseThrow();
        Score bestMoves = optBestMoves.orElseThrow();
        result.add(bestTime);
        result.add(bestMoves);
        return result;
    }

    public List<Score> getTopScoresByTime(int gridSize) {
        return scoreRepository.findTop100ByGridSizeOrderBySolveTimeAsc(gridSize);
    }

    public List<Score> getTopScoresByMoves(int gridSize) {
        return scoreRepository.findTop100ByGridSizeOrderByMovesAsc(gridSize);
    }
}
