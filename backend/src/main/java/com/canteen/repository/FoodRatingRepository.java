package com.canteen.repository;

import com.canteen.entity.FoodRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodRatingRepository extends JpaRepository<FoodRating, Long> {
    List<FoodRating> findByFoodItemId(Long foodItemId);
    Optional<FoodRating> findByOrderId(Long orderId);
    boolean existsByFoodItemId(Long foodItemId);
}
