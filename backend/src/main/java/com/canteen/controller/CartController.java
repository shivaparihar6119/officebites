package com.canteen.controller;

import com.canteen.entity.*;
import com.canteen.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/employee/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;
    private final OrderRepository orderRepository;

    private Optional<User> getCurrentEmployee(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .filter(user -> user.getRole() == Role.EMPLOYEE);
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getMyCart(Authentication auth) {
        Optional<User> employeeOpt = getCurrentEmployee(auth);
        if (employeeOpt.isEmpty()) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(cartItemRepository.findByEmployeeId(employeeOpt.get().getId()));
    }

    @PostMapping("/add/{foodId}")
    public ResponseEntity<CartItem> addToCart(Authentication auth, @PathVariable Long foodId) {
        Optional<User> employeeOpt = getCurrentEmployee(auth);
        if (employeeOpt.isEmpty()) return ResponseEntity.status(403).build();

        Optional<FoodItem> foodItemOpt = foodItemRepository.findById(foodId);
        if (foodItemOpt.isEmpty() || !foodItemOpt.get().getIsActive()) {
            return ResponseEntity.badRequest().build();
        }

        User employee = employeeOpt.get();
        Optional<CartItem> existing = cartItemRepository.findByEmployeeIdAndFoodItemId(employee.getId(), foodId);

        CartItem item;
        if (existing.isPresent()) {
            item = existing.get();
            item.setQuantity(item.getQuantity() + 1);
        } else {
            item = new CartItem();
            item.setEmployee(employee);
            item.setFoodItem(foodItemOpt.get());
            item.setQuantity(1);
        }

        return ResponseEntity.ok(cartItemRepository.save(item));
    }

    @PutMapping("/update/{foodId}")
    public ResponseEntity<?> updateQuantity(Authentication auth, @PathVariable Long foodId, @RequestParam Integer quantity) {
        Optional<User> employeeOpt = getCurrentEmployee(auth);
        if (employeeOpt.isEmpty()) return ResponseEntity.status(403).build();

        if (quantity != null && quantity <= 0) {
            removeFromCart(auth, foodId);
            return ResponseEntity.noContent().build();
        }

        Optional<CartItem> existing = cartItemRepository.findByEmployeeIdAndFoodItemId(employeeOpt.get().getId(), foodId);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();

        CartItem item = existing.get();
        item.setQuantity(quantity);
        return ResponseEntity.ok(cartItemRepository.save(item));
    }

    @DeleteMapping("/remove/{foodId}")
    @Transactional
    public ResponseEntity<Void> removeFromCart(Authentication auth, @PathVariable Long foodId) {
        Optional<User> employeeOpt = getCurrentEmployee(auth);
        if (employeeOpt.isEmpty()) return ResponseEntity.status(403).build();

        Optional<CartItem> existing = cartItemRepository.findByEmployeeIdAndFoodItemId(employeeOpt.get().getId(), foodId);
        if (existing.isPresent()) {
            cartItemRepository.delete(existing.get());
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<?> checkout(Authentication auth, @RequestBody Map<String, String> paymentInfo) {
        Optional<User> employeeOpt = getCurrentEmployee(auth);
        if (employeeOpt.isEmpty()) return ResponseEntity.status(403).build();
        User employee = employeeOpt.get();

        List<CartItem> cartItems = cartItemRepository.findByEmployeeId(employee.getId());
        if (cartItems.isEmpty()) return ResponseEntity.badRequest().body("Cart is empty");

        // Simple Payment Gateway Check (Simulator)
        if (paymentInfo == null || !paymentInfo.containsKey("paymentMethod")) {
            return ResponseEntity.badRequest().body("Payment information missing");
        }
        
        // Assume payment is successful if method is provided
        System.out.println("Processing payment for " + employee.getUsername() + " via " + paymentInfo.get("paymentMethod"));

        List<Order> placedOrders = new ArrayList<>();
        Random random = new Random();

        for (CartItem item : cartItems) {
            Order order = new Order();
            order.setEmployee(employee);
            order.setFoodItem(item.getFoodItem());
            order.setOrderDate(LocalDateTime.now());
            order.setStatus(OrderStatus.PENDING);
            order.setQuantity(item.getQuantity());
            
            int otcNumber = 100000 + random.nextInt(900000);
            order.setOneTimeCode(String.valueOf(otcNumber));
            
            placedOrders.add(orderRepository.save(order));
        }

        // Clear Cart
        cartItemRepository.deleteByEmployeeId(employee.getId());

        return ResponseEntity.ok(Map.of(
            "message", "Order placed successfully after payment",
            "ordersCount", placedOrders.size(),
            "orders", placedOrders
        ));
    }
}
