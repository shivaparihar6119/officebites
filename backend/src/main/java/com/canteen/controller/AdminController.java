package com.canteen.controller;

import com.canteen.entity.FoodItem;
import com.canteen.entity.Role;
import com.canteen.entity.User;
import com.canteen.repository.FoodItemRepository;
import com.canteen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.canteen.dto.RegisterRequest;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/vendors")
    public ResponseEntity<List<User>> getAllVendors() {
        List<User> vendors = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.VENDOR)
                .toList();
        return ResponseEntity.ok(vendors);
    }

    @PostMapping("/vendors")
    public ResponseEntity<?> createVendor(@Valid @RequestBody RegisterRequest request) {
        String username = request.getUsername();
        String password = request.getPassword();
        String fullName = request.getFullName();
        String email = request.getEmail();

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Username has already been taken by another user."));
        }

        if (userRepository.findAll().stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(email))) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "A vendor with this email address is already registered."));
        }

        if (userRepository.findAll().stream().anyMatch(u -> u.getRole() == Role.VENDOR && u.getFullName().equalsIgnoreCase(fullName))) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "A vendor with this business name already exists."));
        }

        User vendor = new User();
        vendor.setUsername(username);
        vendor.setPassword(passwordEncoder.encode(password));
        vendor.setRole(Role.VENDOR);
        vendor.setFullName(fullName);
        vendor.setEmail(email);
        return ResponseEntity.ok(userRepository.save(vendor));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/food-items")
    public ResponseEntity<List<FoodItem>> getAllFoodItems() {
        return ResponseEntity.ok(foodItemRepository.findAll());
    }

    @PutMapping("/food-items/{id}/toggle")
    public ResponseEntity<FoodItem> toggleFoodItemStatus(@PathVariable Long id,
                                                          @RequestParam boolean isActive) {
        Optional<FoodItem> itemOpt = foodItemRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();
        FoodItem item = itemOpt.get();
        item.setIsActive(isActive);
        return ResponseEntity.ok(foodItemRepository.save(item));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalVendors", userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.VENDOR).count());
        stats.put("totalEmployees", userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.EMPLOYEE).count());
        stats.put("totalFoodItems", foodItemRepository.count());
        stats.put("activeFoodItems", foodItemRepository.findAll().stream()
                .filter(FoodItem::getIsActive).count());
        return ResponseEntity.ok(stats);
    }
}
