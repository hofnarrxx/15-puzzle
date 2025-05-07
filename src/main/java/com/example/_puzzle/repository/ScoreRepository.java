package com.example._puzzle.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example._puzzle.model.Score;

public interface ScoreRepository extends JpaRepository<Score,Long>{
    List<Score> findTop100ByGridSizeOrderBySolveTimeAsc(int gridSize);
    List<Score> findTop100ByGridSizeOrderByMovesAsc(int gridSize);
}
