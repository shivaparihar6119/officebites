package com.canteen.repository;

import com.canteen.entity.Order;
import com.canteen.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByEmployeeIdOrderByOrderDateDesc(Long employeeId);
    List<Order> findByEmployeeIdAndStatusOrderByOrderDateDesc(Long employeeId, OrderStatus status);
    List<Order> findByFoodItemVendorIdAndStatusOrderByOrderDateDesc(Long vendorId, OrderStatus status);
    Optional<Order> findByOneTimeCodeAndStatus(String oneTimeCode, OrderStatus status);
    
    // For streak calculation
    List<Order> findByEmployeeIdAndStatusAndDeliveryDateBetween(Long employeeId, OrderStatus status, LocalDateTime start, LocalDateTime end);

    boolean existsByFoodItemId(Long foodItemId);
}
