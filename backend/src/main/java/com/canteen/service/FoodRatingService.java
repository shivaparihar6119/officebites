package com.canteen.service;

import com.canteen.entity.FoodItem;
import com.canteen.entity.FoodRating;
import com.canteen.entity.User;
import com.canteen.entity.Order;
import com.canteen.repository.FoodItemRepository;
import com.canteen.repository.FoodRatingRepository;
import com.canteen.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FoodRatingService {

    private final FoodRatingRepository foodRatingRepository;
    private final FoodItemRepository foodItemRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public FoodRating rateItem(User user, Long foodItemId, Long orderId, Integer ratingValue, String comment) {
        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new RuntimeException("Food item not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Validate that the order belongs to the user and is delivered
        if (!order.getEmployee().getId().equals(user.getId())) {
            throw new RuntimeException("This order does not belong to you");
        }
        if (!"DELIVERED".equals(order.getStatus().name())) {
            throw new RuntimeException("You can only rate delivered items");
        }

        Optional<FoodRating> existing = foodRatingRepository.findByOrderId(orderId);
        if (existing.isPresent()) {
            throw new RuntimeException("You have already rated this order");
        }

        FoodRating rating = new FoodRating();
        rating.setUser(user);
        rating.setFoodItem(foodItem);
        rating.setOrder(order);
        rating.setRating(ratingValue);
        rating.setComment(comment);

        FoodRating saved = foodRatingRepository.save(rating);

        updateAverageRating(foodItem);

        return saved;
    }

    private void updateAverageRating(FoodItem foodItem) {
        List<FoodRating> ratings = foodRatingRepository.findByFoodItemId(foodItem.getId());
        if (ratings.isEmpty()) {
            foodItem.setAverageRating(0.0);
        } else {
            double sum = ratings.stream().mapToInt(FoodRating::getRating).sum();
            foodItem.setAverageRating(sum / ratings.size());
        }
        foodItemRepository.save(foodItem);
    }
}
