package com.canteen.controller;

import com.canteen.entity.FoodItem;
import com.canteen.entity.Order;
import com.canteen.entity.OrderStatus;
import com.canteen.entity.Role;
import com.canteen.entity.User;
import com.canteen.repository.FoodItemRepository;
import com.canteen.repository.FoodRatingRepository;
import com.canteen.repository.OrderRepository;
import com.canteen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
public class VendorController {

    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final FoodRatingRepository foodRatingRepository;

    @PostMapping("/food-items")
    public ResponseEntity<?> addFoodItem(Authentication auth, @Valid @RequestBody FoodItem foodItem) {
        System.out.println("Adding food item. Principal: " + auth.getName());
        Optional<User> vendorOpt = userRepository.findByUsername(auth.getName());
        if (vendorOpt.isEmpty()) {
            System.out.println("Vendor not found for username: " + auth.getName());
            return ResponseEntity.status(403).body("Access denied: User not found");
        }
        if (vendorOpt.get().getRole() != Role.VENDOR) {
            System.out.println("User is not a vendor: " + vendorOpt.get().getRole());
            return ResponseEntity.status(403).body("Access denied: Not a vendor");
        }
        User vendor = vendorOpt.get();

        if (foodItemRepository.existsByNameIgnoreCaseAndVendorId(foodItem.getName(), vendor.getId())) {
            return ResponseEntity.badRequest().body("Food item with this name already exists in your menu.");
        }

        foodItem.setVendor(vendor);
        FoodItem savedItem = foodItemRepository.save(foodItem);
        return ResponseEntity.ok(savedItem);
    }

    @GetMapping("/food-items")
    public ResponseEntity<?> getMyFoodItems(Authentication auth) {
        System.out.println("Getting food items. Principal: " + auth.getName());
        Optional<User> vendorOpt = userRepository.findByUsername(auth.getName());
        if (vendorOpt.isEmpty()) {
            System.out.println("Vendor not found for username: " + auth.getName());
            return ResponseEntity.status(403).body("Access denied: Vendor not found");
        }
        List<FoodItem> items = foodItemRepository.findByVendorId(vendorOpt.get().getId());
        return ResponseEntity.ok(items);
    }

    @PutMapping("/food-items/{id}")
    public ResponseEntity<?> updateFoodItem(Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody FoodItem updated) {
        Optional<User> vendorOpt = userRepository.findByUsername(auth.getName());
        if (vendorOpt.isEmpty())
            return ResponseEntity.status(403).build();
        User vendor = vendorOpt.get();

        Optional<FoodItem> itemOpt = foodItemRepository.findById(id);
        if (itemOpt.isEmpty())
            return ResponseEntity.notFound().build();

        FoodItem item = itemOpt.get();
        if (!item.getVendor().getId().equals(vendor.getId())) {
            return ResponseEntity.status(403).body("Not your food item");
        }

        if (foodItemRepository.existsByNameIgnoreCaseAndVendorIdAndIdNot(updated.getName(), vendor.getId(), id)) {
            return ResponseEntity.badRequest().body("Another food item with this name already exists in your menu.");
        }

        item.setName(updated.getName());
        item.setDescription(updated.getDescription());
        item.setPrice(updated.getPrice());
        item.setCalories(updated.getCalories());
        item.setProtein(updated.getProtein());
        item.setCarbohydrates(updated.getCarbohydrates());
        item.setFats(updated.getFats());
        item.setIsActive(updated.getIsActive());
        return ResponseEntity.ok(foodItemRepository.save(item));
    }

    @DeleteMapping("/food-items/{id}")
    public ResponseEntity<?> deleteFoodItem(Authentication auth, @PathVariable Long id) {
        Optional<User> vendorOpt = userRepository.findByUsername(auth.getName());
        if (vendorOpt.isEmpty())
            return ResponseEntity.status(403).build();

        Optional<FoodItem> itemOpt = foodItemRepository.findById(id);
        if (itemOpt.isEmpty())
            return ResponseEntity.notFound().build();

        FoodItem item = itemOpt.get();
        if (!item.getVendor().getId().equals(vendorOpt.get().getId())) {
            return ResponseEntity.status(403).body("Not your food item");
        }

        // Check for dependencies
        if (orderRepository.existsByFoodItemId(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("This item cannot be deleted because it has existing orders. Please hide it (set to inactive) instead to preserve order history.");
        }
        if (foodRatingRepository.existsByFoodItemId(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("This item cannot be deleted because it has ratings and reviews. Please hide it instead.");
        }

        foodItemRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/orders/pending")
    public ResponseEntity<List<Order>> getPendingOrders(Authentication auth) {
        Optional<User> vendorOpt = userRepository.findByUsername(auth.getName());
        if (vendorOpt.isEmpty())
            return ResponseEntity.status(403).build();

        List<Order> pendingOrders = orderRepository.findByFoodItemVendorIdAndStatusOrderByOrderDateDesc(
                vendorOpt.get().getId(), OrderStatus.PENDING);
        return ResponseEntity.ok(pendingOrders);
    }

    @PostMapping("/orders/deliver/{otc}")
    public ResponseEntity<?> deliverOrder(Authentication auth, @PathVariable String otc) {
        Optional<User> vendorOpt = userRepository.findByUsername(auth.getName());
        if (vendorOpt.isEmpty())
            return ResponseEntity.status(403).build();

        Optional<Order> orderOpt = orderRepository.findByOneTimeCodeAndStatus(otc, OrderStatus.PENDING);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Invalid OTC or order already delivered");
        }

        Order order = orderOpt.get();
        if (!order.getFoodItem().getVendor().getId().equals(vendorOpt.get().getId())) {
            return ResponseEntity.status(403).body("Not an order for your food item");
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveryDate(java.time.LocalDateTime.now());
        orderRepository.save(order);

        return ResponseEntity.ok(order);
    }
}
