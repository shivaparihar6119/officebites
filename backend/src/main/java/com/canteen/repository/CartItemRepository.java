package com.canteen.repository;

import com.canteen.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByEmployeeId(Long employeeId);
    Optional<CartItem> findByEmployeeIdAndFoodItemId(Long employeeId, Long foodItemId);
    void deleteByEmployeeId(Long employeeId);
}
