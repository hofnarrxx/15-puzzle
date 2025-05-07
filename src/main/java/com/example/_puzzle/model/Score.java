package com.example._puzzle.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "leaderboard")
public class Score{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "grid_size", nullable = false)
    private int gridSize;

    @Column(name = "solve_time", nullable = false)
    private double solveTime;

    @Column(nullable = false)
    private int moves;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public User getUser() { return user; }
    public int getGridSize() { return gridSize; }
    public double getSolveTime() { return solveTime; }
    public int getMoves() { return moves; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setGridSize(int gridSize) { this.gridSize = gridSize; }
    public void setSolveTime(double solveTime) { this.solveTime = solveTime; }
    public void setMoves(int moves) { this.moves = moves; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}